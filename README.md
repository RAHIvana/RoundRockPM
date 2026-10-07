# roundrockpm.com — new website + AI assistant

Static website (nginx on a GCP **e2-micro**) plus an optional Python API on
**Cloud Run** that powers the text chat assistant, the contact forms, and — if you
want it — a DoorLoop listings proxy.

```
public/                 the website. This folder IS the site; upload it as-is.
  index.html            home
  services.html         what full management includes
  listings.html         available rentals (filterable, reads a data source)
  commercial.html       office-warehouse space, per-space NNN pricing table
  sms-terms.html        SMS terms for Twilio / carrier registration
  owners.html           owner-facing page + owner FAQ
  residents.html        pay rent / maintenance form / rental criteria
  about.html  faq.html  contact.html  privacy.html  404.html
  assets/css/styles.css one stylesheet, design tokens at the top
  assets/js/config.js   ← EDIT THIS: phone, email, portal URLs, listings source, API URL
  assets/js/listings.js listings loader (JSON / CSV / API) + field mapping
  assets/js/main.js     nav, filters, forms, portal links
  assets/js/chat.js     chat widget (text only)
  assets/data/properties.json    the 4 active rentals — edit freely
  assets/data/commercial.json    the 5 commercial properties / 11 spaces
  assets/data/listings-example.csv  column names for the CSV/GitHub workflow
  sitemap.xml  robots.txt  favicon.svg

chatbot/                the Cloud Run service (FastAPI + Vertex AI Gemini)
  main.py  knowledge.md  Dockerfile  requirements.txt  .env.example

deploy/                 scripts + nginx config
  gcp-setup.sh  vm-setup.sh  deploy-site.sh  deploy-chatbot.sh  nginx-roundrockpm.conf
```

---

## 1. Look at it before deploying anything

```bash
cd public
python3 -m http.server 8080
# open http://localhost:8080
```

Everything works locally except the chat replies and form delivery, which need
the Cloud Run service (until then they show your phone number and email).

---

## 1b. Running it on Windows

**Preview the site:** double-click **`preview.bat`** in this folder. It opens
http://localhost:8080/ in your browser and serves `public/`. Close the black
console window to stop it. (If the browser opens a split second before the
server is ready, just refresh.)

It uses Python if you have it, and otherwise falls back to `preview.ps1`, a
small PowerShell server that needs nothing installed. To run that one directly:

```powershell
powershell -ExecutionPolicy Bypass -File preview.ps1
powershell -ExecutionPolicy Bypass -File preview.ps1 -Port 8090   # if 8080 is busy
```

**Running the deploy scripts:** the files in `deploy/` are bash, so on Windows
pick one of these:

| Option | How |
|---|---|
| **Google Cloud Shell** (easiest) | Open console.cloud.google.com, click the terminal icon, upload this folder, run the scripts there. Nothing to install, `gcloud` is already set up. |
| **Git Bash** | Comes with Git for Windows. Right-click the folder → "Git Bash Here" → `bash deploy/gcp-setup.sh`. Needs the Google Cloud CLI installed for Windows. |
| **WSL** | `wsl --install` once, then run them in Ubuntu like any Linux box. |

The `gcloud` commands inside those scripts all work from Windows PowerShell too
if you would rather paste them one at a time — only the bash syntax around them
(`export`, `$(...)`, `if`) is Linux-specific.

Note that the *server* is Debian Linux either way; Windows is only where you
edit files and run the deploy command from.

---

---

## 2. Put the site on the e2-micro

```bash
export PROJECT=your-gcp-project-id
bash deploy/gcp-setup.sh        # APIs, static IP, VM, firewall, service account
# point DNS A records for roundrockpm.com and www at the IP it prints
gcloud compute ssh rrpm-web --zone us-central1-a
bash vm-setup.sh                # nginx, firewall, webroot   (run ON the VM)
exit
bash deploy/deploy-site.sh      # uploads public/ to the VM
# then, on the VM, turn on HTTPS:
sudo certbot --nginx -d roundrockpm.com -d www.roundrockpm.com --redirect
```

To publish a change later: edit files in `public/`, run `deploy/deploy-site.sh`.

**e2-micro notes.** 1 shared vCPU / 1 GB RAM is plenty for a static site —
nginx serves it from disk with gzip on and a 7-day cache on assets. Keep the
chatbot on Cloud Run rather than the VM; Python + a model client would eat the
RAM. `vm-setup.sh` drops nginx to one worker process for the same reason.

---

## 3. Deploy the chatbot (optional — the site works without it)

```bash
# store the SMTP password once
printf 'your-app-password' | gcloud secrets create rrpm-smtp-pass --data-file=-

export PROJECT=your-gcp-project-id SMTP_USER=support@roundrockpm.com
bash deploy/deploy-chatbot.sh
```

Then paste the printed service URL into `public/assets/js/config.js` as
`API_BASE`, and run `deploy/deploy-site.sh` again.

- **Model**: Vertex AI Gemini (`gemini-2.5-flash` by default). No API key —
  the Cloud Run service account has `roles/aiplatform.user`.
- **Text only**, as intended: no voice, no images.
- **What it knows**: `chatbot/knowledge.md`. Edit that file and redeploy to
  change its answers. It is instructed never to quote fees, never to invent a
  listing, and to hand off to you for anything it does not know.
- **Leads**: when a visitor gives their name and contact details, the assistant
  calls a `submit_lead` function and the service emails you at
  `support@roundrockpm.com`. The contact and maintenance forms post to
  `/api/lead` and email you the same way.
- **Costs**: Cloud Run scales to zero, so an idle month is essentially free;
  you pay per conversation for Gemini.

### Turning the chat bubble off

`CHAT_ENABLED: false` in `config.js` hides the widget entirely. Leaving
`API_BASE` empty keeps the bubble but answers with your phone and email —
that is the current state, which is a reasonable placeholder until the bot
is ready.

---

## 4. Where listings come from

`config.js` → `LISTINGS`. Three options, no code changes needed:

```js
// A. the file in this repo (what it does today)
LISTINGS: { type: "json", url: "/assets/data/properties.json" }

// B. a CSV or JSON you keep in GitHub — MLS exports work directly
LISTINGS: { type: "csv",  url: "https://raw.githubusercontent.com/USER/REPO/main/listings.csv" }

// C. live DoorLoop, proxied by Cloud Run so the API key stays private
LISTINGS: { type: "api",  url: "" }   // blank = API_BASE + "/api/listings"
```

Column names are mapped in `listings.js` → `FIELD_MAP`, which already
understands common MLS headers (`ListPrice`, `BedroomsTotal`, `LivingArea`,
`PublicRemarks`, `MLSNumber`…) and DoorLoop-ish names (`marketRent`,
`addressCity`, `squareFeet`). If your export uses a name that is not listed,
add it to the right array — one line.

`assets/data/listings-example.csv` shows the plain column set.

For **option C**, store the key and redeploy:

```bash
printf 'your-doorloop-key' | gcloud secrets create rrpm-doorloop-key --data-file=-
DOORLOOP_SECRET=1 bash deploy/deploy-chatbot.sh
```

The proxy caches for 5 minutes and serves the last good response if DoorLoop is
down. Check DoorLoop's current API docs for the endpoint and auth header your
account uses — `main.py` calls `GET {DOORLOOP_BASE_URL}/units` with a bearer
token, which is the shape to adjust if theirs differs.

---

## 4b. Phone numbers and SMS compliance

The public site shows **(512) 310-0453** for both calls and texts. It is defined once:

```js
// public/assets/js/config.js
PHONE: "(512) 310-0453",   PHONE_HREF: "tel:+15123100453",
TEXT_NUMBER: "(512) 310-0453",  TEXT_HREF: "sms:+15123100453",
```

When the Twilio number **(737) 373-2727** is approved, change those four values and
re-run `deploy/deploy-site.sh`. The number also appears in the generated HTML (topbar,
contact page, SMS terms, privacy) — search and replace `310-0453` / `15123100453` across
`public/` and you have them all. Do not publish the Twilio number until registration is
approved.

The assistant gives out **(512) 919-6250** and `support@roundrockpm.com`. The backup
escalation contact is **Team Austin Amin, (512) 310-0453** — shared only under the two
conditions in `chatbot/knowledge.md`. Change it there to (737) 373-ASAP once Twilio is live.

**For the Twilio / carrier registration**, the campaign needs these three URLs:

| Purpose | URL |
|---|---|
| Message flow / opt-in | `https://roundrockpm.com/contact.html` (SMS checkbox on the form) |
| Privacy policy | `https://roundrockpm.com/privacy.html` |
| SMS terms | `https://roundrockpm.com/sms-terms.html` |

Both legal pages carry the language carriers look for: message frequency, "msg & data rates
may apply", STOP / HELP, consent is not a condition of service, carriers not liable, and the
explicit line that **mobile opt-in data is never shared with third parties for marketing**.
The consent checkbox on the contact and maintenance forms is unticked by default, optional,
and its value is sent to the backend as `sms_consent` so you have a record of who opted in.

If your host serves extensionless URLs (`/privacy` rather than `/privacy.html`), the nginx
config already resolves `$uri.html`, so both forms work — give Twilio whichever you prefer.

---

## 4c. The listing data

Two data files drive the two listing pages:

- `public/assets/data/properties.json` — the **4 active residential rentals** (Georgetown,
  Avery Ranch, Castle Ridge, Camp Craft). Edit and upload; no rebuild needed.
- `public/assets/data/commercial.json` — the **5 commercial properties / 11 spaces** with
  per-space size, NNN rate and estimated all-in monthly.

Deliberately **not** on the site: 1103 Brookside Cv (status Hold) and 1407 Cinnamon Path #B
(incomplete MLS draft). Both are in `chatbot/knowledge.md`, so the assistant can speak to them
if a visitor asks by address — exactly as your bot rules require.

`chatbot/knowledge.md` is generated from your merged knowledge file and contains all 11
properties, the lead-routing rules, the backup-contact escalation rule, fair-housing language
and the commercial NNN terms. The internal `data_quality_issues` notes were excluded.

Chat leads are routed by the assistant: management and resident inquiries to `PM_LEAD_EMAIL`,
commercial and owner-managed-listing inquiries to `REALTOR_LEAD_EMAIL` (both default to
`OFFICE_EMAIL`; set them separately in `deploy/deploy-chatbot.sh` if you want the split).
A lead where the backup contact was shared arrives with **URGENT** in the subject.

---

## 5. Things to change before launch

- **Portal DNS** — `config.js` now points the portal links at
  `owners.roundrockpm.com` and `residents.roundrockpm.com` (Pay Rent uses the
  resident portal). Those subdomains need DNS records pointing at your portal
  provider before the links work. `APPLY_URL` is still blank; fill it in when you
  have an application URL and the Apply links will go live.
- **The numbers on the home and about pages** — "50+ properties", "98% tenant
  retention", "15 yrs", "9 cities" came across from your current site. Make sure
  each is still true and defensible; they are the kind of claim a prospect
  quotes back at you.
- **Commercial page attribution** — the five commercial properties are your Crexi listings
  through Walzel Properties. Check with your broker whether that page needs brokerage
  attribution; if so, tell me and I'll add the line (name only, no licence number or address).
- **Testimonials** — `about.html` has a commented-out block with the markup
  ready. Add real reviews only, with the reviewer's permission. Nothing invented
  goes on a page that also makes Fair Housing claims.
- **Licensing line** — the footer says "Licensed in Texas". If TREC requires
  your brokerage name or licence number in the footer, add it there.
- **`privacy.html`** — written in plain English and honest about the AI
  assistant, but have your attorney read it before you rely on it.
- **Logo** — `assets/img/logo.svg` is a placeholder mark in your new colours.
  Drop your real logo in as `assets/img/logo.svg` (or a `.png`, then change the
  two `<img src>` references in each page's header and footer).

---

## 6. Design notes

Colours, fonts, spacing and radii are CSS custom properties at the top of
`styles.css` (`--ink`, `--moss`, `--clay`, `--sand`…). Change them there and the
whole site follows. Fonts are Fraunces (headings) and Inter (body) from Google
Fonts.

The page structure follows the pattern property-management firms use — utility
bar with portal logins, owner/resident split, an availability page with filters,
resident resources, FAQ — so visitors find what they expect where they expect it.
