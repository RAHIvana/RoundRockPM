/* Round Rock PM — site behavior (vanilla JS, no dependencies) */
(function () {
  "use strict";
  var CFG = window.RRPM || {};
  var esc = function (s) {
    return String(s === null || s === undefined ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  /* ---------- mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll(".site-nav a").forEach(function (a) {
      a.addEventListener("click", function () { document.body.classList.remove("nav-open"); });
    });
  }

  /* ---------- footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- portal links (DoorLoop or other) ---------- */
  var PORTALS = {
    owner: { url: CFG.OWNER_PORTAL, label: "owner portal" },
    resident: { url: CFG.RESIDENT_PORTAL, label: "resident portal" },
    pay: { url: CFG.PAY_RENT_URL || CFG.RESIDENT_PORTAL, label: "online rent payment portal" },
    apply: { url: CFG.APPLY_URL, label: "online application" }
  };
  document.querySelectorAll("[data-portal]").forEach(function (el) {
    var p = PORTALS[el.dataset.portal] || {};
    if (p.url) {
      el.setAttribute("href", p.url);
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
    } else {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        window.alert("Our " + p.label + " is being set up right now.\n\nCall " +
          (CFG.PHONE || "") + " or email " + (CFG.EMAIL || "") + " and we'll take care of it personally.");
      });
    }
  });

  /* ---------- scroll reveal ---------- */
  var revealables = document.querySelectorAll(".reveal");
  if (revealables.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- hero quick search -> listings page ---------- */
  var quickSearch = document.getElementById("quick-search");
  if (quickSearch) {
    quickSearch.addEventListener("submit", function (e) {
      e.preventDefault();
      var qs = new URLSearchParams();
      new FormData(quickSearch).forEach(function (v, k) { if (v) { qs.set(k, v); } });
      location.href = "/listings.html" + (qs.toString() ? "?" + qs.toString() : "");
    });
  }

  /* ---------- listings page ---------- */
  var grid = document.getElementById("listing-grid");
  if (grid && window.RRPMListings) {
    var all = [];
    var artFor = function (seed) {
      var roofs = ["#c4623c", "#2d5544", "#a94f2d", "#3d6b58"];
      var roof = roofs[Math.abs(seed) % roofs.length];
      return '<svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
        '<rect width="320" height="180" fill="#e7efeb"/>' +
        '<path d="M0 140c44-14 70 6 112-2s70-20 110-10 66 16 98 6v46H0z" fill="#cfe0d8"/>' +
        '<g transform="translate(96 46)">' +
        '<rect x="8" y="42" width="112" height="76" rx="5" fill="#fcfaf6"/>' +
        '<path d="M0 46 64 4l64 42z" fill="' + roof + '"/>' +
        '<rect x="26" y="62" width="26" height="26" rx="3" fill="#f4efe7" stroke="#d7cabb" stroke-width="2"/>' +
        '<rect x="76" y="62" width="26" height="26" rx="3" fill="#f4efe7" stroke="#d7cabb" stroke-width="2"/>' +
        '<rect x="54" y="92" width="22" height="26" rx="3" fill="#1f4437"/>' +
        "</g></svg>";
    };
    var thumb = function (p, i) {
      return p.photo
        ? '<img src="' + esc(p.photo) + '" alt="' + esc(p.name) + '" loading="lazy" style="width:100%;height:100%;object-fit:cover">'
        : artFor(i);
    };

    var els = {
      city: document.getElementById("f-city"),
      type: document.getElementById("f-type"),
      beds: document.getElementById("f-beds"),
      max: document.getElementById("f-max"),
      status: document.getElementById("f-status"),
      count: document.getElementById("listing-count"),
      reset: document.getElementById("listing-reset")
    };

    var fromQuery = function () {
      var q = new URLSearchParams(location.search);
      if (els.city && q.get("city")) { els.city.value = q.get("city"); }
      if (els.beds && q.get("beds")) { els.beds.value = q.get("beds"); }
      if (els.max && q.get("max")) { els.max.value = q.get("max"); }
      if (els.type && q.get("type")) { els.type.value = q.get("type"); }
    };

    var card = function (p, i) {
      return '<article class="card card--hover prop-card">' +
        '<div class="prop-thumb">' + thumb(p, i) +
          '<span class="prop-badge">' + esc(p.type) + "</span>" +
          '<span class="prop-status" data-status="' + esc(p.status) + '">' + esc(p.status) + "</span>" +
        "</div>" +
        '<div class="prop-body">' +
          "<h3>" + esc(p.name) + "</h3>" +
          '<p class="prop-loc">' + esc([p.city, p.state].filter(Boolean).join(", ")) + " " + esc(p.zip) + "</p>" +
          (p.rent ? '<p class="prop-price">' + esc(p.rent) + " <small>/ month</small></p>" : "") +
          '<div class="prop-specs">' +
            "<span><b>" + esc(p.beds) + "</b> bd</span>" +
            "<span><b>" + esc(p.baths) + "</b> ba</span>" +
            "<span><b>" + esc(p.sqft) + "</b> sqft</span>" +
          "</div>" +
          '<div class="prop-actions">' +
            '<button class="btn btn--sm btn--ghost" type="button" data-detail="' + i + '">Details</button>' +
            '<a class="btn btn--sm" href="/contact.html#form">Inquire</a>' +
          "</div>" +
        "</div></article>";
    };

    var apply = function () {
      var city = els.city && els.city.value ? els.city.value.toLowerCase() : "";
      var type = els.type && els.type.value ? els.type.value : "";
      var beds = els.beds && els.beds.value ? Number(els.beds.value) : 0;
      var max = els.max && els.max.value ? Number(String(els.max.value).replace(/[^0-9]/g, "")) : 0;
      var status = els.status && els.status.value ? els.status.value : "";

      var out = all.filter(function (p) {
        if (city && String(p.city).toLowerCase().indexOf(city) === -1) { return false; }
        if (type && p.type !== type) { return false; }
        if (beds && Number(p.beds) < beds) { return false; }
        if (max && p.rentNum && p.rentNum > max) { return false; }
        if (status && p.status !== status) { return false; }
        return true;
      });

      if (els.count) {
        els.count.textContent = out.length + (out.length === 1 ? " property" : " properties") +
          (out.length !== all.length ? " of " + all.length : "");
      }
      grid.innerHTML = out.length
        ? out.map(function (p) { return card(p, all.indexOf(p)); }).join("")
        : '<div class="empty-state"><h3>Nothing matches those filters right now</h3>' +
          '<p class="muted">Availability changes weekly. Tell us what you\'re looking for and we\'ll contact you the moment something fits.</p>' +
          '<div class="btn-row" style="justify-content:center"><a class="btn" href="/contact.html#form">Join the notify list</a></div></div>';
    };

    /* detail modal */
    var backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";
    backdrop.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-label="Property details">' +
      '<button class="modal-close" type="button" aria-label="Close">' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
      '</button><div class="modal-inner"></div></div>';
    document.body.appendChild(backdrop);
    var closeModal = function () { backdrop.classList.remove("is-open"); };
    backdrop.addEventListener("click", function (e) {
      if (e.target === backdrop || e.target.closest(".modal-close")) { closeModal(); }
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeModal(); } });

    grid.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-detail]");
      if (!btn) { return; }
      var p = all[Number(btn.dataset.detail)];
      if (!p) { return; }
      var rows = "";
      if (p.details) {
        Object.keys(p.details).forEach(function (k) {
          var v = p.details[k];
          if (v === null || v === undefined || String(v).trim() === "") { return; }
          rows += "<tr><td>" + esc(k) + "</td><td>" + esc(v) + "</td></tr>";
        });
      }
      var feats = (p.features || []).length
        ? '<h4 style="margin:1.5rem 0 .6rem">Features</h4><ul class="feature-list">' +
          p.features.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + "</ul>"
        : "";

      backdrop.querySelector(".modal-inner").innerHTML =
        '<div class="modal-hero">' + thumb(p, Number(btn.dataset.detail)) + "</div>" +
        '<div class="modal-body">' +
          '<span class="prop-badge" style="position:static;display:inline-block;margin-bottom:.75rem">' + esc(p.type) + " &middot; " + esc(p.status) + "</span>" +
          "<h3>" + esc(p.name) + "</h3>" +
          '<p class="prop-loc">' + esc([p.city, p.state].filter(Boolean).join(", ")) + " " + esc(p.zip) +
            (p.mls ? ' &middot; MLS# ' + esc(p.mls) : "") + "</p>" +
          '<div class="spec-grid">' +
            "<div><b>" + esc(p.beds) + "</b><span>Beds</span></div>" +
            "<div><b>" + esc(p.baths) + "</b><span>Baths</span></div>" +
            "<div><b>" + esc(p.sqft) + "</b><span>Sq ft</span></div>" +
            "<div><b>" + esc(p.rent || "Ask") + "</b><span>Per month</span></div>" +
          "</div>" +
          (p.note ? "<p>" + esc(p.note) + "</p>" : "") +
          (rows ? '<table class="info-table" style="margin-top:1.5rem"><tbody>' + rows + "</tbody></table>" : "") +
          feats +
          (p.deposit ? '<p class="muted" style="margin-top:1rem">Security deposit: ' + esc(p.deposit) + "</p>" : "") +
          (p.available ? '<p class="muted">Available: ' + esc(p.available) + "</p>" : "") +
          '<p class="form-note">Information deemed reliable but not guaranteed \u2014 please verify before applying. Assigned schools are as listed by the district and should be confirmed with the district directly.</p>' +
          '<div class="btn-row">' +
            '<a class="btn" href="' + (CFG.TEXT_HREF || "#") + '">Text about this home</a>' +
            '<a class="btn btn--ghost" href="/contact.html#form">Send an inquiry</a>' +
          "</div>" +
        "</div>";
      backdrop.classList.add("is-open");
    });

    [els.city, els.type, els.beds, els.max, els.status].forEach(function (el) {
      if (!el) { return; }
      el.addEventListener("change", apply);
      el.addEventListener("input", apply);
    });
    if (els.reset) {
      els.reset.addEventListener("click", function () {
        [els.city, els.type, els.beds, els.max, els.status].forEach(function (el) { if (el) { el.value = ""; } });
        apply();
      });
    }

    grid.innerHTML = '<p class="muted">Loading available rentals&hellip;</p>';
    window.RRPMListings.load().then(function (items) {
      all = items;
      var cities = {};
      all.forEach(function (p) { if (p.city) { cities[p.city] = 1; } });
      if (els.city && els.city.tagName === "SELECT") {
        Object.keys(cities).sort().forEach(function (c) {
          var o = document.createElement("option");
          o.value = c; o.textContent = c;
          els.city.appendChild(o);
        });
      }
      fromQuery();
      apply();
    }).catch(function () {
      grid.innerHTML = '<div class="empty-state"><h3>Listings are being updated</h3>' +
        '<p class="muted">Call ' + esc(CFG.PHONE || "") + " or email " + esc(CFG.EMAIL || "") +
        " and we'll tell you exactly what's available today.</p></div>";
    });
  }

  /* ---------- commercial page ---------- */
  var comGrid = document.getElementById("commercial-grid");
  if (comGrid) {
    var num = function (n) {
      return (typeof n === "number" ? n : Number(String(n).replace(/[^0-9.]/g, ""))) || 0;
    };
    var usd = function (n) {
      n = num(n);
      return n ? "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "";
    };
    var rate = function (r) {
      if (!Array.isArray(r) || !r.length) { return "Ask"; }
      return r.length > 1 && r[0] !== r[1]
        ? "$" + r[0].toFixed(2) + "–$" + r[1].toFixed(2)
        : "$" + Number(r[0]).toFixed(2);
    };

    fetch("/assets/data/commercial.json", { cache: "no-cache" })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var props = data.properties || [];
        var spaceCount = props.reduce(function (a, p) { return a + (p.spaces || []).length; }, 0);
        var countEl = document.getElementById("commercial-count");
        if (countEl) {
          countEl.textContent = props.length + " properties · " + spaceCount + " spaces available";
        }

        comGrid.innerHTML = props.map(function (p) {
          var specs = [
            ["Zoning", p.zoning], ["Class", p.building_class], ["Built", p.year_built],
            ["Clear height", p.clear_height_ft ? p.clear_height_ft + " ft" : ""],
            ["Building", p.building_sf ? p.building_sf.toLocaleString("en-US") + " SF" : ""],
            ["Access", p.access]
          ].filter(function (s) { return s[1]; })
           .map(function (s) { return "<div><b>" + esc(s[1]) + "</b><span>" + esc(s[0]) + "</span></div>"; })
           .join("");

          var rowsHtml = (p.spaces || []).map(function (s) {
            var total = (s.total_monthly_low && s.total_monthly_high)
              ? usd(s.total_monthly_low) + "–" + usd(s.total_monthly_high)
              : "Ask";
            return "<tr>" +
              "<td>" + esc(s.unit || "Suite") + "</td>" +
              "<td>" + esc(num(s.rentable_sf).toLocaleString("en-US")) + " SF" +
                (s.office_sf ? '<br><small class="muted">' + esc(num(s.office_sf).toLocaleString("en-US")) +
                  " SF office + " + esc(num(s.warehouse_sf).toLocaleString("en-US")) + " SF warehouse</small>" : "") +
              "</td>" +
              "<td>" + rate(s.rate_psf_month) + "<small class=\"muted\"> /SF/mo NNN</small></td>" +
              "<td>" + total + "<small class=\"muted\"> est. all-in</small></td>" +
              "<td>" + esc(s.available || "Now") + "</td>" +
              "</tr>";
          }).join("");

          var uses = (p.ideal_uses || []).length
            ? '<p class="muted" style="margin-top:1rem"><strong>Typical uses:</strong> ' +
              esc(p.ideal_uses.join(", ")) + "</p>"
            : "";

          return '<article class="card com-card reveal">' +
            '<header class="com-head">' +
              "<div>" +
                "<h3>" + esc(p.title || p.address) + "</h3>" +
                '<p class="prop-loc">' + esc(p.address) + "</p>" +
              "</div>" +
              '<span class="chip">' + esc((p.spaces || []).length) + " space" + ((p.spaces || []).length === 1 ? "" : "s") + "</span>" +
            "</header>" +
            (specs ? '<div class="spec-grid">' + specs + "</div>" : "") +
            (p.location_notes ? "<p>" + esc(p.location_notes) + "</p>" : "") +
            uses +
            '<div class="table-scroll"><table class="info-table" style="margin-top:1.25rem">' +
              "<thead><tr><th>Unit</th><th>Size</th><th>Base rate</th><th>Est. monthly</th><th>Available</th></tr></thead>" +
              "<tbody>" + rowsHtml + "</tbody></table></div>" +
            '<div class="btn-row">' +
              '<a class="btn btn--sm" href="' + (CFG.TEXT_HREF || "#") + '">Text about this property</a>' +
              '<a class="btn btn--sm btn--ghost" href="/contact.html#form">Request details</a>' +
            "</div>" +
            "</article>";
        }).join("");
      })
      .catch(function () {
        comGrid.innerHTML = '<div class="empty-state"><h3>Space details are being updated</h3>' +
          '<p class="muted">Call or text ' + esc(CFG.PHONE || "") + " and we'll send current availability.</p></div>";
      });
  }

  /* ---------- lead / contact / maintenance forms ---------- */
  document.querySelectorAll("form[data-lead-form]").forEach(function (form) {
    var status = form.querySelector(".form-status");
    var submit = form.querySelector('[type="submit"]');
    var label = submit ? submit.textContent : "";

    var say = function (msg, ok) {
      if (!status) { return; }
      status.textContent = msg;
      status.className = "form-status " + (ok ? "is-ok" : "is-err");
    };

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var hp = form.querySelector('[name="company"]');
      if (hp && hp.value) { return; }

      var data = Object.fromEntries(new FormData(form).entries());
      delete data.company;
      data.source = form.dataset.leadForm || "website";
      data.page = location.pathname;

      if (!CFG.API_BASE) {
        say("Our online form isn't switched on yet. Please call " + CFG.PHONE +
            " or email " + CFG.EMAIL + " — we reply to every message.", false);
        return;
      }

      if (submit) { submit.disabled = true; submit.textContent = "Sending…"; }
      say("Sending…", true);

      fetch(CFG.API_BASE.replace(/\/$/, "") + "/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (!res.ok) { throw new Error("failed"); }
          form.reset();
          say("Thank you — your request is in. We reply to every inquiry within one business day, usually much sooner.", true);
        })
        .catch(function () {
          say("Something went wrong on our end. Please call " + CFG.PHONE +
              " or email " + CFG.EMAIL + " — we don't want to miss you.", false);
        })
        .finally(function () {
          if (submit) { submit.disabled = false; submit.textContent = label; }
        });
    });
  });
})();
