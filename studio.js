/* Movement Studio — four rooms stay on this page. No full reload. */
const CORE = "https://cdn.jsdelivr.net/gh/Sdub2021/Fusionfitportal@950c351b67b35b81f56897e751d472d5653c4d8a/studio.js";

const FACE = { vestibular: 1, meditation: 1 };
const POSE = { yoga: 1, taichi: 1 };

let booting = null;
let mode = new URLSearchParams(location.search).get("mode") || "vestibular";
if (!FACE[mode] && !POSE[mode]) mode = "vestibular";

function family(m) {
  return FACE[m] ? "face" : "pose";
}

function stopCamera() {
  try {
    const btn = document.getElementById("stop");
    if (btn) btn.click();
  } catch (e) {}
  try {
    document.querySelectorAll("video").forEach(function (v) {
      const s = v.srcObject;
      if (s && s.getTracks) s.getTracks().forEach(function (t) { t.stop(); });
      v.srcObject = null;
    });
  } catch (e) {}
}

function paintChrome(next) {
  mode = next;
  document.querySelectorAll(".mode").forEach(function (el) {
    el.classList.toggle("on", el.getAttribute("data-mode") === next);
  });
  try { history.replaceState(null, "", "/practice.html?mode=" + next); } catch (e) {}
  const title = document.getElementById("modeTitle");
  const unit = document.getElementById("unit");
  const cue = document.getElementById("cue");
  const hold = document.getElementById("hold");
  const score = document.getElementById("score");
  const copy = document.getElementById("veil-copy");
  const forms = document.getElementById("forms");
  if (forms) forms.classList.toggle("open", next === "taichi");
  const copyMap = {
    yoga: "Yoga room. Open the camera when you are ready.",
    taichi: "Tai Chi room. Open the camera when you are ready.",
    vestibular: "Vestibular room. Open the camera when you are ready.",
    meditation: "Meditation room. Open the camera when you are ready."
  };
  if (copy) copy.textContent = copyMap[next] || copyMap.vestibular;
  if (score) score.textContent = "\u2014";
  if (next === "yoga") {
    if (title) title.textContent = "Yoga \u00b7 Mountain";
    if (unit) unit.textContent = "align";
    if (cue) cue.textContent = "Stand in mountain. Soft knees, feet under the hips, crown lifted.";
    if (hold) hold.textContent = "Hold 0.0s";
  } else if (next === "taichi") {
    if (title) title.textContent = "Tai Chi \u00b7 Prep";
    if (unit) unit.textContent = "form";
    if (cue) cue.textContent = "Settle the body and mind. Soft knees, crown lifted, breath low.";
    if (hold) hold.textContent = "Form 1";
  } else if (next === "meditation") {
    if (title) title.textContent = "Meditation \u00b7 10s still";
    if (unit) unit.textContent = "still";
    if (cue) cue.textContent = "Face the camera. Keep the face still for 10 seconds.";
    if (hold) hold.textContent = "Still 0.0 / 10.0s";
  } else {
    if (title) title.textContent = "Vestibular \u00b7 Gaze";
    if (unit) unit.textContent = "gaze";
    if (cue) cue.textContent = "Face the camera. Look LEFT RIGHT LEFT RIGHT, then UP DOWN UP DOWN, then mouth open mouth close mouth open mouth close.";
    if (hold) hold.textContent = "Step 0";
  }
}

function bootStudio() {
  if (!booting) {
    booting = import(CORE).catch(function (err) {
      booting = null;
      throw err;
    });
  }
  return booting;
}

function onModeClick(e) {
  const el = e.currentTarget || e.target.closest && e.target.closest(".mode");
  const next = el && el.getAttribute("data-mode");
  if (!next || (!FACE[next] && !POSE[next])) return;
  e.preventDefault();
  if (next === mode) return;
  if (family(next) !== family(mode)) stopCamera();
  paintChrome(next);
}

function bindRooms() {
  document.querySelectorAll(".mode").forEach(function (el) {
    const next = el.getAttribute("data-mode");
    if (!next) return;
    if (el.tagName === "A") {
      el.setAttribute("href", "/practice.html?mode=" + next);
      el.setAttribute("role", "button");
    }
    el.addEventListener("click", onModeClick, true);
    el.classList.toggle("on", next === mode);
  });
}

bindRooms();
paintChrome(mode);

const go = document.getElementById("go");
if (go) {
  go.addEventListener("click", async function (ev) {
    if (window.__FIT_STUDIO_READY) return;
    ev.preventDefault();
    ev.stopImmediatePropagation();
    go.disabled = true;
    const prev = go.textContent;
    go.textContent = "Loading model\u2026";
    try {
      await bootStudio();
      window.__FIT_STUDIO_READY = true;
      go.disabled = false;
      go.textContent = prev || "Open camera";
      if (typeof go.onclick === "function") go.onclick();
    } catch (err) {
      go.disabled = false;
      go.textContent = prev || "Open camera";
      const status = document.getElementById("status");
      if (status) status.textContent = "Studio failed to load";
    }
  }, true);
}

window.addEventListener("pagehide", stopCamera);
window.addEventListener("beforeunload", stopCamera);
