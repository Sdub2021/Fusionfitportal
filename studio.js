/* FIT Studio loader — MediaPipe graph starts after Open camera. */
const SRC = "https://cdn.jsdelivr.net/gh/Sdub2021/Fusionfitportal@950c351b67b35b81f56897e751d472d5653c4d8a/studio.js";
let booting = null;
function bootStudio() {
  if (!booting) {
    booting = import(SRC).catch(function (err) {
      booting = null;
      const status = document.getElementById("status");
      if (status) status.textContent = "Studio failed to load";
      console.warn("studio boot failed", err);
      throw err;
    });
  }
  return booting;
}
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
