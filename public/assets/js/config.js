/* ---------------------------------------------------------------------------
   Round Rock PM — site configuration.  Everything you are likely to change
   lives in this one file.  It is plain JavaScript: edit, save, upload.
--------------------------------------------------------------------------- */
window.RRPM = {

  /* --- contact ---------------------------------------------------------- */
  PHONE: "(512) 310-0453",
  PHONE_HREF: "tel:+15123100453",

  /* The number people text. One constant on purpose: when the Twilio
     number is approved, change these two lines and nothing else. */
  TEXT_NUMBER: "(512) 310-0453",
  TEXT_HREF: "sms:+15123100453",

  EMAIL: "support@roundrockpm.com",

  /* --- portals ----------------------------------------------------------
     These subdomains must have DNS records pointing at your portal provider
     before the links work. A link left blank here tells visitors it is being
     set up rather than sending them to a dead page. */
  OWNER_PORTAL: "https://owners.roundrockpm.com",
  RESIDENT_PORTAL: "https://residents.roundrockpm.com",
  PAY_RENT_URL: "https://residents.roundrockpm.com",   // same as the resident portal
  APPLY_URL: "",           // online rental application URL — add when you have one

  /* --- listings source --------------------------------------------------
     type: "json"  -> a JSON file (this site's own file, or a raw GitHub URL)
           "csv"   -> a CSV file (MLS export or a spreadsheet exported to CSV,
                      e.g. a raw.githubusercontent.com URL)
           "api"   -> the Cloud Run backend, which proxies the DoorLoop API
                      (keeps your DoorLoop key off the public website)
     Column / field names are mapped in listings.js -> FIELD_MAP, so an MLS or
     DoorLoop export usually works without renaming anything. */
  LISTINGS: {
    type: "json",
    url: "/assets/data/properties.json"
    // csv example: { type: "csv", url: "https://raw.githubusercontent.com/<user>/<repo>/main/listings.csv" }
    // api example: { type: "api", url: "" }   // blank url = API_BASE + "/api/listings"
  },

  /* --- chatbot backend (Cloud Run) --------------------------------------
     Leave "" until the chatbot service is deployed. While it is empty the
     chat widget stays visible but answers with our phone number and email,
     and the contact forms tell visitors to call or email instead. */
  API_BASE: "",            // e.g. "https://rrpm-chat-abc123-uc.a.run.app"

  /* --- chat widget copy (text-only assistant) ---------------------------- */
  CHAT_ENABLED: true,
  ASSISTANT_NAME: "Rocky",
  GREETING: "Hi, I'm Rocky — the Round Rock PM assistant. Ask me about our management services, what's available to rent, or request a free rent analysis and I'll pass your details straight to the team.",
  OFFLINE_NOTE: "Our assistant is being set up right now. In the meantime call or text (512) 310-0453, or email support@roundrockpm.com — a real person will help you right away.",
  QUICK_REPLIES: [
    "What do you charge owners?",
    "What's available to rent?",
    "I'd like a free rent analysis",
    "I have a maintenance issue"
  ]
};
