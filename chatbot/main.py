"""
Round Rock Property Management — website backend for Google Cloud Run.

Endpoints
    GET  /healthz       liveness probe
    POST /api/chat      text-only AI assistant (Vertex AI Gemini)
    POST /api/lead      contact / maintenance form -> email to the office
    GET  /api/listings  optional DoorLoop proxy so the API key never reaches the browser

Everything is configured with environment variables — see .env.example.
The service is stateless: conversation history is sent by the browser on each
request, so Cloud Run can scale to zero and back without losing anything.
"""

from __future__ import annotations

import asyncio
import html
import json
import logging
import os
import re
import smtplib
import time
from collections import defaultdict, deque
from email.message import EmailMessage
from pathlib import Path
from typing import Any

import httpx
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
log = logging.getLogger("rrpm")

# --------------------------------------------------------------------------- config
BASE_DIR = Path(__file__).resolve().parent

ALLOWED_ORIGINS = [o.strip() for o in os.getenv(
    "ALLOWED_ORIGINS",
    "https://roundrockpm.com,https://www.roundrockpm.com,http://localhost:8080",
).split(",") if o.strip()]

GCP_PROJECT = os.getenv("GOOGLE_CLOUD_PROJECT", "")
GCP_LOCATION = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
CHAT_ENABLED = os.getenv("CHAT_ENABLED", "true").lower() == "true"

OFFICE_EMAIL = os.getenv("OFFICE_EMAIL", "support@roundrockpm.com")
# Chat leads are routed by subject: management / resident inquiries go to the PM inbox,
# rental-listing and commercial inquiries to the realtor inbox.
PM_LEAD_EMAIL = os.getenv("PM_LEAD_EMAIL", "") or OFFICE_EMAIL
REALTOR_LEAD_EMAIL = os.getenv("REALTOR_LEAD_EMAIL", "") or OFFICE_EMAIL
OFFICE_PHONE = os.getenv("OFFICE_PHONE", "(512) 310-0453")   # public number (calls + text)
AGENT_PHONE = os.getenv("AGENT_PHONE", "(512) 919-6250")    # given out by the assistant per the knowledge base
SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
SMTP_FROM = os.getenv("SMTP_FROM", "") or SMTP_USER or OFFICE_EMAIL

DOORLOOP_API_KEY = os.getenv("DOORLOOP_API_KEY", "")
DOORLOOP_BASE_URL = os.getenv("DOORLOOP_BASE_URL", "https://app.doorloop.com/api")
LISTINGS_CACHE_SECONDS = int(os.getenv("LISTINGS_CACHE_SECONDS", "300"))

RATE_LIMIT_PER_MIN = int(os.getenv("RATE_LIMIT_PER_MIN", "20"))
MAX_MESSAGE_CHARS = 1500
MAX_HISTORY = 24

KNOWLEDGE = (BASE_DIR / "knowledge.md").read_text(encoding="utf-8") if (BASE_DIR / "knowledge.md").exists() else ""

SYSTEM_PROMPT = f"""You are Rocky, the text assistant on the Round Rock Property Management
website (Round Rock and the Greater Austin metro, Texas). You help two kinds of visitor:
property owners considering management, and current or prospective residents.

How to answer:
- Be brief and concrete. Two or three short sentences is usually right. Plain text only —
  no markdown headings, no bullet characters, no emoji.
- Answer ONLY from the knowledge base below. If something is not in it, say you do not have
  that detail and offer to have the team follow up. Never invent fees, addresses, rent
  amounts, availability dates or policies.
- Never quote a management fee, percentage or price. Offer the free rent analysis instead.
- Never give legal advice or an opinion on a specific dispute. Point to a person.
- If someone describes an emergency (water leak, no heat in freezing weather, no power, gas
  smell, sewage, anything unsafe), tell them to call {AGENT_PHONE} now, and 911 first if
  there is fire, gas or immediate danger.
- Contact details you may give out are in the knowledge base. Do not invent any others, and
  never give out a second person's number except under the escalation rule written there.
- You send email to the team. You cannot send texts or make calls, so never say you will
  text or call someone — say the team will follow up.
- Do not ask for or accept payment card numbers, bank details, social security numbers or
  government ID numbers. If a visitor starts to type one, stop them and ask them to call.
- When a visitor wants a rent analysis, wants to be contacted, wants to see a property, or
  has a question you cannot answer, collect their name, then phone or email, then a one-line
  summary of what they need — one question at a time, never all at once — and call the
  submit_lead function. After it succeeds, confirm the team will reply within one business day.
- Do not claim you have booked, scheduled or confirmed anything. You pass messages along.

KNOWLEDGE BASE
--------------
{KNOWLEDGE}
"""

LEAD_TOOL = {
    "name": "submit_lead",
    "description": (
        "Send a visitor's contact details to the Round Rock Property Management team. "
        "Call this only once you have at least a name and either a phone number or an email address."
    ),
    "parameters_json_schema": {
        "type": "object",
        "properties": {
            "name": {"type": "string", "description": "Visitor's full name"},
            "phone": {"type": "string", "description": "Phone number, if given"},
            "email": {"type": "string", "description": "Email address, if given"},
            "role": {
                "type": "string",
                "enum": ["owner", "prospective-tenant", "tenant", "vendor", "other"],
                "description": "Which best describes the visitor",
            },
            "property_address": {"type": "string", "description": "Property address discussed, if any"},
            "summary": {"type": "string", "description": "One or two lines on what the visitor needs"},
            "route": {
                "type": "string",
                "enum": ["property_management", "realtor"],
                "description": ("property_management for owners asking about management, current "
                                "residents, and rentals managed by RRPM; realtor for commercial "
                                "space, owner-managed listings, agents, and buying or selling."),
            },
            "urgent": {
                "type": "boolean",
                "description": "True only for a resident emergency or a visitor who has been unable to reach Raju for two days or more.",
            },
        },
        "required": ["name", "summary"],
    },
}

# --------------------------------------------------------------------------- app
app = FastAPI(title="Round Rock PM API", version="1.0.0", docs_url=None, redoc_url=None)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
    max_age=3600,
)

_hits: dict[str, deque] = defaultdict(deque)


def rate_limited(request: Request, limit: int | None = None) -> bool:
    limit = limit or RATE_LIMIT_PER_MIN
    ip = (request.headers.get("x-forwarded-for", "").split(",")[0].strip()
          or (request.client.host if request.client else "unknown"))
    now = time.time()
    q = _hits[ip]
    while q and now - q[0] > 60:
        q.popleft()
    if len(q) >= limit:
        return True
    q.append(now)
    if len(_hits) > 5000:          # keep the dict from growing unbounded
        for k in [k for k, v in list(_hits.items()) if not v][:2000]:
            _hits.pop(k, None)
    return False


# --------------------------------------------------------------------------- email
SENSITIVE = re.compile(r"\b(?:\d[ -]?){13,19}\b|\b\d{3}-\d{2}-\d{4}\b")


def _scrub(text: str) -> str:
    return SENSITIVE.sub("[redacted]", text or "")


def _send_email_sync(subject: str, body: str, reply_to: str = "", to: str = "") -> bool:
    if not SMTP_HOST:
        log.warning("SMTP not configured — lead logged only:\n%s", body)
        return False
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = SMTP_FROM
    msg["To"] = to or OFFICE_EMAIL
    if reply_to:
        msg["Reply-To"] = reply_to
    msg.set_content(body)
    try:
        if SMTP_PORT == 465:
            with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=20) as s:
                if SMTP_USER:
                    s.login(SMTP_USER, SMTP_PASS)
                s.send_message(msg)
        else:
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=20) as s:
                s.starttls()
                if SMTP_USER:
                    s.login(SMTP_USER, SMTP_PASS)
                s.send_message(msg)
        return True
    except Exception:                                   # noqa: BLE001
        log.exception("email send failed")
        return False


async def send_email(subject: str, body: str, reply_to: str = "", to: str = "") -> bool:
    return await asyncio.to_thread(_send_email_sync, subject, body, reply_to, to)


# --------------------------------------------------------------------------- models
class Msg(BaseModel):
    role: str = Field(default="user")
    text: str = Field(default="")


class ChatIn(BaseModel):
    messages: list[Msg] = Field(default_factory=list)
    page: str = ""


class LeadIn(BaseModel):
    name: str = ""
    email: str = ""
    phone: str = ""
    role: str = ""
    property_address: str = ""
    units: str = ""
    urgency: str = ""
    sms_consent: str = ""          # "yes" when the visitor ticked the SMS box
    message: str = ""
    source: str = "website"
    page: str = ""
    company: str = ""          # honeypot


# --------------------------------------------------------------------------- gemini
_client = None


def gemini():
    global _client
    if _client is None:
        from google import genai                       # imported lazily so /healthz works without creds
        _client = genai.Client(vertexai=True, project=GCP_PROJECT or None, location=GCP_LOCATION)
    return _client


def _to_contents(messages: list[Msg]):
    from google.genai import types
    out = []
    for m in messages[-MAX_HISTORY:]:
        text = (m.text or "").strip()[:MAX_MESSAGE_CHARS]
        if not text:
            continue
        role = "user" if m.role == "user" else "model"
        out.append(types.Content(role=role, parts=[types.Part(text=text)]))
    return out


async def lead_from_chat(args: dict[str, Any], page: str) -> bool:
    route = str(args.get("route", "")).strip()
    to = REALTOR_LEAD_EMAIL if route == "realtor" else PM_LEAD_EMAIL
    urgent = bool(args.get("urgent"))
    lines = [
        "New lead from the website assistant",
        "",
        f"Route:    {route or 'property_management'}",
        f"Name:     {args.get('name', '')}",
        f"Phone:    {args.get('phone', '')}",
        f"Email:    {args.get('email', '')}",
        f"Role:     {args.get('role', '')}",
        f"Property: {args.get('property_address', '')}",
        "",
        "What they need:",
        _scrub(str(args.get("summary", ""))),
        "",
        f"Page: {page}",
    ]
    subject = f"[Website assistant] {args.get('name', 'New inquiry')}"
    if urgent:
        subject = "URGENT " + subject
    return await send_email(subject, "\n".join(lines),
                            reply_to=str(args.get("email", "")).strip(), to=to)


# --------------------------------------------------------------------------- routes
@app.get("/healthz")
async def healthz():
    return {
        "ok": True,
        "chat": CHAT_ENABLED,
        "model": GEMINI_MODEL,
        "email": bool(SMTP_HOST),
        "listings": bool(DOORLOOP_API_KEY),
    }


@app.post("/api/chat")
async def chat(payload: ChatIn, request: Request):
    if not CHAT_ENABLED:
        return {"reply": f"Our assistant is not switched on yet. Please call {OFFICE_PHONE} "
                         f"or email {OFFICE_EMAIL} and a real person will help you right away."}
    if rate_limited(request):
        return JSONResponse({"reply": "You're going a bit fast for me — give me a moment and try again."}, status_code=429)
    if not payload.messages:
        return {"reply": "Ask me anything about our management services or available rentals."}

    from google.genai import types

    contents = _to_contents(payload.messages)
    if not contents:
        return {"reply": "I didn't catch that — could you type it again?"}

    cfg = types.GenerateContentConfig(
        system_instruction=SYSTEM_PROMPT,
        temperature=0.3,
        max_output_tokens=600,
        tools=[types.Tool(function_declarations=[types.FunctionDeclaration(**LEAD_TOOL)])],
        safety_settings=[],
    )

    lead_captured = False
    try:
        client = gemini()
        for _ in range(2):                              # one tool round-trip at most
            resp = await asyncio.to_thread(
                client.models.generate_content, model=GEMINI_MODEL, contents=contents, config=cfg
            )
            calls = getattr(resp, "function_calls", None) or []
            if not calls:
                break
            contents.append(resp.candidates[0].content)
            parts = []
            for call in calls:
                args = dict(call.args or {})
                ok = await lead_from_chat(args, payload.page) if call.name == "submit_lead" else False
                lead_captured = lead_captured or ok
                parts.append(types.Part.from_function_response(
                    name=call.name,
                    response={"delivered": ok,
                              "note": "Sent to the team" if ok else
                                      f"Could not send — tell the visitor to call {OFFICE_PHONE}"},
                ))
            contents.append(types.Content(role="user", parts=parts))

        reply = (getattr(resp, "text", "") or "").strip()
        if not reply:
            reply = (f"I'm not sure how to answer that one. Call {OFFICE_PHONE} or email "
                     f"{OFFICE_EMAIL} and someone on the team will help.")
        return {"reply": reply, "lead_captured": lead_captured}

    except Exception:                                   # noqa: BLE001
        log.exception("chat failed")
        return JSONResponse(
            {"reply": f"I'm having trouble reaching our system. Please call {OFFICE_PHONE} "
                      f"or email {OFFICE_EMAIL} — we don't want to miss you."},
            status_code=503,
        )


@app.post("/api/lead")
async def lead(payload: LeadIn, request: Request):
    if payload.company:                                 # honeypot filled = bot
        return {"ok": True}
    if rate_limited(request, limit=6):
        return JSONResponse({"detail": "Too many submissions. Please try again shortly."}, status_code=429)
    if not payload.name.strip() or not (payload.email.strip() or payload.phone.strip()):
        return JSONResponse({"detail": "Please include your name and a phone number or email."}, status_code=400)

    kind = "Maintenance request" if payload.source == "maintenance" else "Website inquiry"
    body = "\n".join([
        f"{kind} from roundrockpm.com",
        "",
        f"Name:      {payload.name.strip()[:120]}",
        f"Phone:     {payload.phone.strip()[:40]}",
        f"Email:     {payload.email.strip()[:120]}",
        f"Role:      {payload.role.strip()[:60]}",
        f"Property:  {payload.property_address.strip()[:200]}",
        f"Units:     {payload.units.strip()[:40]}",
        f"Urgency:   {payload.urgency.strip()[:40]}",
        f"SMS opt-in: {'YES - consented to texts' if payload.sms_consent.strip().lower() in ('yes','true','on','1') else 'no'}",
        "",
        "Message:",
        _scrub(payload.message.strip()[:4000]),
        "",
        f"Form: {payload.source} | Page: {payload.page[:120]}",
    ])
    sent = await send_email(f"[{kind}] {payload.name.strip()[:60]}", body,
                            reply_to=payload.email.strip())
    if not sent:
        log.info("LEAD (email not configured):\n%s", body)
    return {"ok": True, "emailed": sent}


_listings_cache: dict[str, Any] = {"at": 0.0, "data": None}


@app.get("/api/listings")
async def listings():
    """Proxy DoorLoop so the API key stays server-side. Cached in memory."""
    if not DOORLOOP_API_KEY:
        return JSONResponse({"detail": "Listings API is not configured."}, status_code=503)
    now = time.time()
    if _listings_cache["data"] is not None and now - _listings_cache["at"] < LISTINGS_CACHE_SECONDS:
        return _listings_cache["data"]
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.get(
                f"{DOORLOOP_BASE_URL.rstrip('/')}/units",
                headers={"Authorization": f"bearer {DOORLOOP_API_KEY}", "Accept": "application/json"},
                params={"page_size": 100},
            )
            r.raise_for_status()
            raw = r.json()
        rows = raw.get("data", raw) if isinstance(raw, dict) else raw
        out = {"properties": rows if isinstance(rows, list) else []}
        _listings_cache.update({"at": now, "data": out})
        return out
    except Exception:                                   # noqa: BLE001
        log.exception("listings fetch failed")
        if _listings_cache["data"] is not None:
            return _listings_cache["data"]              # serve stale rather than nothing
        return JSONResponse({"detail": "Listings are temporarily unavailable."}, status_code=502)


@app.get("/")
async def root():
    return {"service": "Round Rock PM API", "endpoints": ["/healthz", "/api/chat", "/api/lead", "/api/listings"]}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8080")))
