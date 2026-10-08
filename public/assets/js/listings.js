/* ---------------------------------------------------------------------------
   Round Rock PM — listings data layer.
   Loads rentals from a local JSON file, a CSV/JSON URL (e.g. raw GitHub),
   or the Cloud Run API (which proxies DoorLoop). Normalises the fields so the
   rest of the site does not care where the data came from.
--------------------------------------------------------------------------- */
(function () {
  "use strict";
  var CFG = window.RRPM || {};

  /* Accepted source field names -> our canonical field.
     Add your own MLS / DoorLoop column names here if they differ. */
  var FIELD_MAP = {
    id:      ["id", "ID", "MLSNumber", "ListingId", "mls_number", "unit_id", "propertyId"],
    name:    ["name", "title", "PropertyName", "Address", "StreetAddress", "address", "unit_name", "fullAddress"],
    address: ["address", "Address", "StreetAddress", "street", "addressStreet1", "address1"],
    city:    ["city", "City", "addressCity", "AddressCity"],
    state:   ["state", "State", "addressState"],
    zip:     ["zip", "Zip", "PostalCode", "zipcode", "addressZip"],
    type:    ["type", "PropertyType", "propertyType", "property_type", "class"],
    status:  ["status", "Status", "ListingStatus", "availability", "listingStatus"],
    beds:    ["beds", "Beds", "Bedrooms", "BedroomsTotal", "bedrooms", "num_beds"],
    baths:   ["baths", "Baths", "Bathrooms", "BathroomsTotalInteger", "bathrooms", "num_baths"],
    sqft:    ["sqft", "SqFt", "LivingArea", "square_feet", "size", "squareFeet"],
    rent:    ["rent", "Rent", "ListPrice", "price", "marketRent", "rentAmount", "monthly_rent"],
    deposit: ["deposit", "Deposit", "securityDeposit", "security_deposit"],
    available: ["available", "AvailableDate", "DateAvailable", "available_date", "availableFrom"],
    note:    ["note", "notes", "description", "Description", "PublicRemarks", "remarks"],
    photo:   ["photo", "image", "PhotoURL", "primaryImage", "imageUrl"],
    url:     ["url", "link", "ListingURL", "detailUrl"]
  };

  function pick(row, keys) {
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== "") { return row[k]; }
    }
    return "";
  }

  function titleCase(s) {
    return String(s).replace(/[_-]+/g, " ").replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  var KNOWN_TYPES = ["Single-Family", "Townhome", "Condo", "Multi-Family", "Commercial"];

  function normaliseType(v) {
    var raw = String(v || "").trim();
    // an exact canonical value (our own data files) is used as-is
    for (var i = 0; i < KNOWN_TYPES.length; i++) {
      if (raw.toLowerCase() === KNOWN_TYPES[i].toLowerCase()) { return KNOWN_TYPES[i]; }
    }
    var s = raw.toLowerCase();
    if (!s) { return "Single-Family"; }
    if (s.indexOf("townhome") > -1 || s.indexOf("townhouse") > -1) { return "Townhome"; }
    if (s.indexOf("condo") > -1 || s.indexOf("apartment") > -1) { return "Condo"; }
    if (s.indexOf("commercial") > -1 || s.indexOf("office") > -1 || s.indexOf("retail") > -1 || s.indexOf("warehouse") > -1) { return "Commercial"; }
    if (s.indexOf("multi") > -1 || s.indexOf("duplex") > -1 || s.indexOf("triplex") > -1 || s.indexOf("quadruplex") > -1 || s.indexOf("plex") > -1) { return "Multi-Family"; }
    return "Single-Family";
  }

  function normaliseStatus(v) {
    var s = String(v || "").toLowerCase();
    if (!s) { return "Available"; }
    if (s.indexOf("coming") > -1 || s.indexOf("pending") > -1 || s.indexOf("soon") > -1) { return "Coming Soon"; }
    if (s.indexOf("leas") > -1 || s.indexOf("rented") > -1 || s.indexOf("occupied") > -1 || s.indexOf("off") > -1) { return "Leased"; }
    return "Available";
  }

  function money(v) {
    if (v === "" || v === null || v === undefined) { return ""; }
    var n = Number(String(v).replace(/[^0-9.]/g, ""));
    if (!isFinite(n) || n <= 0) { return ""; }
    return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  }

  function normalise(row) {
    var street = String(pick(row, FIELD_MAP.address) || "").trim();
    var name = String(pick(row, FIELD_MAP.name) || "").trim() || street || "Rental home";
    var rentRaw = pick(row, FIELD_MAP.rent);
    return {
      id: String(pick(row, FIELD_MAP.id) || name),
      name: name,
      address: street,
      city: String(pick(row, FIELD_MAP.city) || "").trim(),
      state: String(pick(row, FIELD_MAP.state) || "TX").trim(),
      zip: String(pick(row, FIELD_MAP.zip) || "").trim(),
      type: normaliseType(pick(row, FIELD_MAP.type)),
      status: normaliseStatus(pick(row, FIELD_MAP.status)),
      beds: pick(row, FIELD_MAP.beds) || "—",
      baths: pick(row, FIELD_MAP.baths) || "—",
      sqft: (function (v) {
        var n = Number(String(v).replace(/[^0-9.]/g, ""));
        return isFinite(n) && n > 0 ? n.toLocaleString("en-US") : "—";
      })(pick(row, FIELD_MAP.sqft)),
      sqftNum: Number(String(pick(row, FIELD_MAP.sqft)).replace(/[^0-9.]/g, "")) || 0,
      rent: money(rentRaw),
      rentNum: Number(String(rentRaw).replace(/[^0-9.]/g, "")) || 0,
      deposit: money(pick(row, FIELD_MAP.deposit)),
      available: String(pick(row, FIELD_MAP.available) || "").trim(),
      note: String(pick(row, FIELD_MAP.note) || "").trim(),
      photo: String(pick(row, FIELD_MAP.photo) || "").trim(),
      url: String(pick(row, FIELD_MAP.url) || "").trim(),
      mls: String(row.mls || row.mls_id || row.MLSNumber || "").trim(),
      managed_by: String(row.managed_by || "").trim(),
      /* pass-through blocks used by the detail view; absent in simple CSVs */
      details: (row.details && typeof row.details === "object") ? row.details : null,
      features: Array.isArray(row.features) ? row.features : []
    };
  }

  /* --- minimal but correct CSV parser (quotes, commas, newlines) --------- */
  function parseCSV(text) {
    var rows = [], row = [], val = "", inQ = false, i, c, n;
    text = text.replace(/^﻿/, "");
    for (i = 0; i < text.length; i++) {
      c = text[i]; n = text[i + 1];
      if (inQ) {
        if (c === '"' && n === '"') { val += '"'; i++; }
        else if (c === '"') { inQ = false; }
        else { val += c; }
      } else if (c === '"') { inQ = true; }
      else if (c === ",") { row.push(val); val = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && n === "\n") { i++; }
        row.push(val); val = "";
        if (row.length > 1 || row[0] !== "") { rows.push(row); }
        row = [];
      } else { val += c; }
    }
    if (val !== "" || row.length) { row.push(val); rows.push(row); }
    if (!rows.length) { return []; }
    var head = rows.shift().map(function (h) { return h.trim(); });
    return rows.map(function (r) {
      var o = {};
      head.forEach(function (h, idx) { o[h] = (r[idx] || "").trim(); });
      return o;
    });
  }

  /* --- loader ----------------------------------------------------------- */
  function load() {
    var src = CFG.LISTINGS || { type: "json", url: "/assets/data/properties.json" };
    var url = src.url || "";
    if (src.type === "api") {
      if (!url) {
        if (!CFG.API_BASE) { return Promise.reject(new Error("no API_BASE configured")); }
        url = CFG.API_BASE.replace(/\/$/, "") + "/api/listings";
      }
    }
    if (!url) { return Promise.reject(new Error("no listings url configured")); }

    return fetch(url, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) { throw new Error("HTTP " + r.status); }
      if (src.type === "csv") { return r.text().then(parseCSV); }
      return r.json().then(function (data) {
        if (Array.isArray(data)) { return data; }
        return data.properties || data.listings || data.data || data.results || [];
      });
    }).then(function (rows) {
      return rows.map(normalise);
    });
  }

  window.RRPMListings = {
    load: load,
    parseCSV: parseCSV,
    normalise: normalise,
    titleCase: titleCase
  };
})();
