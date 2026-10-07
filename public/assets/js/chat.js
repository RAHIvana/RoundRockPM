/* Round Rock PM — AI chat widget. Talks to the Cloud Run service in config.js */
(function () {
  "use strict";
  var CFG = window.RRPM || {};
  if (CFG.CHAT_ENABLED === false) { return; }
  var KEY = "rrpm_chat_v1";
  var MAX_TURNS = 24;

  var history = [];
  try { history = JSON.parse(sessionStorage.getItem(KEY)) || []; } catch (e) { history = []; }

  var save = function () {
    try { sessionStorage.setItem(KEY, JSON.stringify(history.slice(-MAX_TURNS))); } catch (e) {}
  };

  /* ---------- markup ---------- */
  var launcher = document.createElement("button");
  launcher.className = "chat-launcher";
  launcher.type = "button";
  launcher.setAttribute("aria-label", "Open the Round Rock PM assistant");
  launcher.innerHTML = '<span class="dot"></span> Ask ' + (CFG.ASSISTANT_NAME || "our assistant");

  var panel = document.createElement("section");
  panel.className = "chat-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Round Rock PM assistant");
  panel.innerHTML =
    '<header class="chat-head">' +
      '<span class="avatar-sm">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/></svg>' +
      "</span>" +
      "<div><b>" + (CFG.ASSISTANT_NAME || "Assistant") + "</b><small>Round Rock Property Management</small></div>" +
      '<button class="chat-close" type="button" aria-label="Close chat">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
      "</button>" +
    "</header>" +
    '<div class="chat-log" id="rrpm-chat-log" aria-live="polite"></div>' +
    '<div class="chat-quick" id="rrpm-chat-quick"></div>' +
    '<form class="chat-form" id="rrpm-chat-form">' +
      '<input type="text" id="rrpm-chat-input" placeholder="Type your question…" autocomplete="off" aria-label="Your message">' +
      '<button class="chat-send" type="submit" aria-label="Send">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>' +
      "</button>" +
    "</form>" +
    '<p class="chat-foot">AI assistant — answers may not be perfect. For anything urgent call ' +
      (CFG.PHONE || "") + ".</p>";

  document.body.appendChild(launcher);
  document.body.appendChild(panel);

  var log = panel.querySelector("#rrpm-chat-log");
  var quick = panel.querySelector("#rrpm-chat-quick");
  var form = panel.querySelector("#rrpm-chat-form");
  var input = panel.querySelector("#rrpm-chat-input");
  var sendBtn = panel.querySelector(".chat-send");

  /* ---------- rendering ---------- */
  var linkify = function (text) {
    var esc = text.replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
    esc = esc.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    esc = esc.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    esc = esc.replace(/\b([\w.+-]+@[\w-]+\.[\w.]+)\b/g, '<a href="mailto:$1">$1</a>');
    esc = esc.replace(/\((\d{3})\)\s?(\d{3})-(\d{4})/g, '<a href="tel:+1$1$2$3">($1) $2-$3</a>');
    return esc;
  };

  var bubble = function (role, text) {
    var el = document.createElement("div");
    el.className = "msg " + role;
    if (role === "bot") { el.innerHTML = linkify(text); } else { el.textContent = text; }
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  };

  var typing = function () {
    var el = document.createElement("div");
    el.className = "msg bot";
    el.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>';
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  };

  var renderQuick = function () {
    quick.innerHTML = "";
    if (history.length > 1) { return; }
    (CFG.QUICK_REPLIES || []).forEach(function (q) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = q;
      b.addEventListener("click", function () { send(q); });
      quick.appendChild(b);
    });
  };

  var paint = function () {
    log.innerHTML = "";
    if (!history.length) {
      history.push({ role: "assistant", text: CFG.GREETING || "Hi! How can I help?" });
      save();
    }
    history.forEach(function (m) { bubble(m.role === "user" ? "user" : "bot", m.text); });
    renderQuick();
  };

  /* ---------- networking ---------- */
  var busy = false;
  var send = function (text) {
    text = (text || "").trim();
    if (!text || busy) { return; }

    history.push({ role: "user", text: text });
    bubble("user", text);
    save();
    renderQuick();
    input.value = "";

    if (!CFG.API_BASE) {
      var msg = CFG.OFFLINE_NOTE || ("Please call " + (CFG.PHONE || "") + " or email " + (CFG.EMAIL || "") + ".");
      history.push({ role: "assistant", text: msg });
      bubble("bot", msg);
      save();
      return;
    }

    busy = true;
    sendBtn.disabled = true;
    var t = typing();

    fetch(CFG.API_BASE + "/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: history.slice(-MAX_TURNS).map(function (m) { return { role: m.role, text: m.text }; }),
        page: location.pathname
      })
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        t.remove();
        if (!res.ok) { throw new Error("bad response"); }
        var reply = res.j.reply || "Sorry, I didn't catch that — could you say it another way?";
        history.push({ role: "assistant", text: reply });
        bubble("bot", reply);
        if (res.j.lead_captured) {
          var n = document.createElement("div");
          n.className = "msg sys";
          n.textContent = "✓ Your details were sent to our team";
          log.appendChild(n);
        }
        save();
      })
      .catch(function () {
        t.remove();
        bubble("bot", "I'm having trouble reaching our servers. Please call " + (CFG.PHONE || "") +
          " or email " + (CFG.EMAIL || "") + " — we'll take care of you.");
      })
      .finally(function () {
        busy = false;
        sendBtn.disabled = false;
        log.scrollTop = log.scrollHeight;
        input.focus();
      });
  };

  /* ---------- wiring ---------- */
  var open = function () {
    panel.classList.add("is-open");
    launcher.style.display = "none";
    paint();
    setTimeout(function () { input.focus(); }, 60);
  };
  var close = function () {
    panel.classList.remove("is-open");
    launcher.style.display = "";
  };

  launcher.addEventListener("click", open);
  panel.querySelector(".chat-close").addEventListener("click", close);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && panel.classList.contains("is-open")) { close(); }
  });
  form.addEventListener("submit", function (e) { e.preventDefault(); send(input.value); });

  document.querySelectorAll("[data-open-chat]").forEach(function (el) {
    el.addEventListener("click", function (e) { e.preventDefault(); open(); });
  });

  window.RRPMChat = { open: open, close: close, send: send };
})();
