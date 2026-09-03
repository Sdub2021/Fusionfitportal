(function gateWaitlistToVestibular() {
  var STUDIO = "/practice.html?mode=vestibular";
  function done() {
    try { return localStorage.getItem("fit_vestibular_done") === "1"; } catch (e) { return false; }
  }
  function goStudio() { window.location.href = STUDIO; }
  function cta(label) {
    var a = document.createElement("a");
    a.href = STUDIO;
    a.textContent = label || "Open Vestibular Studio";
    a.style.cssText = "display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:.95rem 1.4rem;border-radius:999px;background:linear-gradient(135deg,#e8a54b,#d4893a);color:#0a0a0f;font-weight:600;letter-spacing:.12em;text-transform:uppercase;text-decoration:none";
    return a;
  }
  function hideForm(form) {
    if (!form || form.dataset.vestibularGate === "2") return;
    form.dataset.vestibularGate = "2";
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      goStudio();
    }, true);
    form.style.display = "none";
    if (form.parentNode && !form.parentNode.querySelector("[data-vestibular-cta]")) {
      var box = document.createElement("div");
      box.setAttribute("data-vestibular-cta", "1");
      box.style.marginTop = "1rem";
      var p = document.createElement("p");
      p.textContent = "Waitlist signup unlocks only after you finish vestibular training in MediaPipe Studio.";
      p.style.cssText = "color:rgba(255,255,255,.62);line-height:1.55;margin:0 0 1rem";
      box.appendChild(p);
      box.appendChild(cta("Complete vestibular training"));
      form.parentNode.insertBefore(box, form);
    }
  }
  function rewrite() {
    document.querySelectorAll('a[href="#signup"], a[href="/#signup"]').forEach(function (a) {
      a.setAttribute("href", STUDIO);
    });
    document.querySelectorAll("a, button").forEach(function (el) {
      var t = (el.textContent || "").replace(/\s+/g, " ").trim().toUpperCase();
      if (t === "JOIN THE LIST" || t === "JOIN THE FIT LIST" || t === "JOIN WAITLIST") {
        if (el.tagName === "A") el.setAttribute("href", STUDIO);
        else el.onclick = function (e) { e.preventDefault(); goStudio(); };
      }
    });
    hideForm(document.getElementById("signup-form"));
    hideForm(document.getElementById("wait-form"));
    var note = document.querySelector("#signup p.text-lg");
    if (note) note.textContent = "Finish the vestibular gaze sequence in MediaPipe Studio to join the waitlist.";
    var h = document.querySelector("#signup h2");
    if (h) h.textContent = "Join through Studio";
  }
  var prevStart = window.startPractice;
  window.startPractice = function (key) {
    if (key === "vestibular") { goStudio(); return; }
    if (typeof prevStart === "function") return prevStart(key);
  };
  window.goToList = goStudio;

  var origFetch = window.fetch;
  if (origFetch && !window.__fitVestibularFetchGate) {
    window.__fitVestibularFetchGate = true;
    window.fetch = function (input, init) {
      var url = typeof input === "string" ? input : (input && input.url) || "";
      var method = ((init && init.method) || (input && input.method) || "GET").toUpperCase();
      if (method !== "GET" && /\/rest\/v1\/signups/.test(url)) {
        var onStudio = /practice\.html/.test(location.pathname);
        var claim = document.getElementById("claim");
        var allowed = onStudio && claim && claim.classList.contains("open") && done();
        if (!allowed) {
          goStudio();
          return Promise.resolve(new Response(JSON.stringify({ error: "vestibular_required" }), { status: 403 }));
        }
      }
      return origFetch.apply(this, arguments);
    };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", rewrite);
  else rewrite();
  setTimeout(rewrite, 40);
  setTimeout(rewrite, 400);
})();
