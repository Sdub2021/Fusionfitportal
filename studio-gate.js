// Vestibular-only waitlist. Claim form opens only after the gaze sequence.
(function () {
  var claim = document.getElementById("claim");
  var form = document.getElementById("claim-form");
  var msg = document.getElementById("form-msg");
  if (!claim || !form) return;

  function mode() {
    var on = document.querySelector(".mode.on");
    var q = new URLSearchParams(location.search).get("mode");
    return (on && on.dataset.mode) || q || "vestibular";
  }
  function markDone() {
    try {
      localStorage.setItem("fit_vestibular_done", "1");
      sessionStorage.setItem("fit_vestibular_done", "1");
    } catch (e) {}
  }
  function allowed() {
    return mode() === "vestibular" && claim.classList.contains("open");
  }

  var add = claim.classList.add.bind(claim.classList);
  claim.classList.add = function () {
    var names = Array.prototype.slice.call(arguments);
    if (names.indexOf("open") >= 0 && mode() !== "vestibular") return;
    add.apply(claim.classList, names);
    if (claim.classList.contains("open") && mode() === "vestibular") markDone();
  };

  var obs = new MutationObserver(function () {
    if (mode() !== "vestibular") claim.classList.remove("open");
  });
  obs.observe(claim, { attributes: true, attributeFilter: ["class"] });
  document.querySelectorAll(".mode").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.dataset.mode !== "vestibular") claim.classList.remove("open");
    });
  });

  form.addEventListener("submit", function (e) {
    if (allowed()) {
      markDone();
      return;
    }
    e.preventDefault();
    e.stopImmediatePropagation();
    claim.classList.remove("open");
    if (msg) {
      msg.textContent = "Waitlist unlocks after the vestibular sequence in Studio.";
      msg.className = "form-msg err";
    }
  }, true);
})();
