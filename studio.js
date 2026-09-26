/* Studio core + Tai Chi leaves for side-by-side CMC37 */
import "https://cdn.jsdelivr.net/gh/Sdub2021/Fusionfitportal@950c351b67b35b81f56897e751d472d5653c4d8a/studio.js";

const TAICHI = "/taichi.html";
function goTaiChi(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
  }
  window.location.href = TAICHI;
}
function bindTaiChi() {
  document.querySelectorAll(".mode, [data-mode], a[href*='taichi']").forEach(function (el) {
    var mode = (el.dataset && el.dataset.mode) || "";
    var href = el.getAttribute("href") || "";
    if (mode === "taichi" || href.indexOf("taichi") !== -1) {
      el.onclick = goTaiChi;
      el.addEventListener("click", goTaiChi, true);
    }
  });
}
bindTaiChi();
setTimeout(bindTaiChi, 0);
setTimeout(bindTaiChi, 400);
