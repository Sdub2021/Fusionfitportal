/* Movement Studio rooms.
   Do not import MediaPipe until Open camera.
   Always stop the camera before changing Yoga / Tai Chi / Vestibular / Meditation.
   Full page change after teardown avoids two WASM graphs on one GPU. */
const CORE = "https://cdn.jsdelivr.net/gh/Sdub2021/Fusionfitportal@950c351b67b35b81f56897e751d472d5653c4d8a/studio.js";
const ROOMS = {
  yoga: "/practice.html?mode=yoga",
  taichi: "/taichi.html",
  vestibular: "/practice.html?mode=vestibular",
  meditation: "/practice.html?mode=meditation"
};

let booting = null;

function currentMode() {
  if (location.pathname.indexOf("taichi") !== -1) return "taichi";
  const q = new URLSearchParams(location.search).get("mode");
  return ROOMS[q] ? q : "vestibular";
}

function stopCamera() {
  try {
    const stopBtn = document.getElementById("stop");
    if (stopBtn && typeof stopBtn.click === "function") stopBtn.click();
  } catch (e) {}
  try {
    document.querySelectorAll("video").forEach(function (v) {
      const s = v.srcObject;
      if (s && s.getTracks) s.getTracks().forEach(function (t) { t.stop(); });
      v.srcObject = null;
    });
  } catch (e) {}
}

function goRoom(mode, e) {
  if (!ROOMS[mode]) return;
  if (e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
  }
  if (mode === currentMode() && location.pathname.indexOf("taichi") === -1) return;
  stopCamera();
  window.setTimeout(function () {
    window.location.href = ROOMS[mode];
  }, 40);
}

function bindRooms() {
  document.querySelectorAll(".mode, [data-mode]").forEach(function (el) {
    const mode = el.dataset && el.dataset.mode;
    if (!ROOMS[mode]) return;
    if (el.tagName === "A") el.setAttribute("href", ROOMS[mode]);
    el.classList.toggle("on", mode === currentMode());
    el.addEventListener("click", function (e) { goRoom(mode, e); }, true);
  });
}

function bootStudio() {
  if (!booting) {
    booting = import(CORE).catch(function (err) {
      booting = null;
      const status = document.getElementById("status");
      if (status) status.textContent = "Studio failed to load";
      console.warn("studio boot failed", err);
      throw err;
    });
  }
  return booting;
}

bindRooms();

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
    }
  }, true);
}

window.addEventListener("pagehide", stopCamera);
window.addEventListener("beforeunload", stopCamera);
document.addEventListener("visibilitychange", function () {
  if (document.visibilityState === "hidden") stopCamera();
});
