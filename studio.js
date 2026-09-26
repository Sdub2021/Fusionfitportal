/* Studio core. Each mode bubble is a separate link. Camera starts only on Open camera. */
import "https://cdn.jsdelivr.net/gh/Sdub2021/Fusionfitportal@950c351b67b35b81f56897e751d472d5653c4d8a/studio.js";

const ROOMS = {
  yoga: "/practice.html?mode=yoga",
  taichi: "/taichi.html",
  vestibular: "/practice.html?mode=vestibular",
  meditation: "/practice.html?mode=meditation"
};

function currentMode() {
  const q = new URLSearchParams(location.search).get("mode");
  return q && ROOMS[q] ? q : "vestibular";
}

function goRoom(mode, e) {
  if (!ROOMS[mode]) return;
  if (e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
  }
  if (mode === "taichi") {
    window.location.href = ROOMS.taichi;
    return;
  }
  if (currentMode() === mode) return;
  window.location.href = ROOMS[mode];
}

function bindRooms() {
  document.querySelectorAll(".mode, [data-mode]").forEach(function (el) {
    const mode = (el.dataset && el.dataset.mode) || "";
    if (!ROOMS[mode]) return;
    el.setAttribute("href", ROOMS[mode]);
    el.onclick = function (e) { goRoom(mode, e); };
    el.addEventListener("click", function (e) { goRoom(mode, e); }, true);
    el.classList.toggle("on", mode === currentMode());
  });
}

bindRooms();
setTimeout(bindRooms, 0);
setTimeout(bindRooms, 400);
