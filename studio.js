/* FIT Studio loader — do not static-import MediaPipe on first paint. */
const SRC = "https://cdn.jsdelivr.net/gh/Sdub2021/Fusionfitportal@950c351b67b35b81f56897e751d472d5653c4d8a/studio.js";
function bootStudio() {
  if (window.__FIT_STUDIO_BOOTED) return;
  window.__FIT_STUDIO_BOOTED = true;
  import(SRC).catch(function (err) {
    window.__FIT_STUDIO_BOOTED = false;
    const status = document.getElementById("status");
    if (status) status.textContent = "Studio failed to load";
    console.warn("studio boot failed", err);
  });
}
const go = document.getElementById("go");
if (go) {
  go.addEventListener("click", bootStudio, { once: true, capture: true });
}
if ("requestIdleCallback" in window) {
  requestIdleCallback(bootStudio, { timeout: 2500 });
} else {
  window.addEventListener("load", function () { setTimeout(bootStudio, 1); });
}
