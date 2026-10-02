/* FIT Studio rooms. Taps never load MediaPipe. Camera starts only on Open camera. */
import { ensureModel, tickFrame, closeModels, usesFace, resetPlay, holdInference, releaseInference } from "/studio-play.js?v=20261002reset";

const TITLES = {
  yoga: "Yoga · Mountain",
  taichi: "Tai Chi · Prep",
  vestibular: "Vestibular · Gaze",
  meditation: "Meditation · 10s still"
};
const TAICHI = [
  "Settle the body and mind. Soft knees, crown lifted.",
  "Ward Off, Roll Back, Press, and Push.",
  "Single Whip. Hook the rear hand.",
  "Play the Lute. Weight on the back leg.",
  "White Crane. One arm high, one low.",
  "Brush Knee and Push.",
  "Fair Ladies at Shuttles.",
  "Snake Creeps Down. Long spine.",
  "Golden Phoenix. Touch a wall if you need it.",
  "Repulse Monkey. Do not lean.",
  "Wave Hands in Clouds.",
  "Close. Hands gather. Stand calm."
];

const video = document.getElementById("cam");
const canvas = document.getElementById("overlay");
const ctx = canvas ? canvas.getContext("2d", { alpha: true }) : null;
const veil = document.getElementById("veil");
const goBtn = document.getElementById("go");
const stopBtn = document.getElementById("stop");
const scoreEl = document.getElementById("score");
const cueEl = document.getElementById("cue");
const statusEl = document.getElementById("status");
const holdEl = document.getElementById("hold");
const detailEl = document.getElementById("detail");
const modeTitle = document.getElementById("modeTitle");
const unitEl = document.getElementById("unit");
const dot = document.getElementById("dot");
const bar = document.getElementById("bar");
const barFill = document.getElementById("barFill");
const claimBox = document.getElementById("claim");

let mode = document.documentElement.getAttribute("data-room") || new URLSearchParams(location.search).get("mode") || "vestibular";
if (!TITLES[mode]) mode = "vestibular";
let stream = null, running = false, raf = 0, gen = 0, lastTs = 0;

function pause() {
  running = false;
  gen += 1;
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
}

function applyChrome() {
  document.querySelectorAll(".mode").forEach(el => el.classList.toggle("on", el.getAttribute("data-mode") === mode));
  try { history.replaceState(null, "", "/practice.html?mode=" + mode); } catch (e) {}
  if (modeTitle) modeTitle.textContent = TITLES[mode];
  if (unitEl) unitEl.textContent = mode === "meditation" ? "still" : mode === "vestibular" ? "gaze" : mode === "taichi" ? "form" : "align";
  if (bar) bar.classList.toggle("on", usesFace(mode) || mode === "taichi");
  if (barFill) barFill.style.width = "0%";
  if (claimBox) claimBox.classList.remove("open");
  const copy = document.getElementById("veil-copy");
  if (copy) copy.textContent = TITLES[mode] + ". Open the camera when you are ready.";
  if (scoreEl) scoreEl.textContent = "0";
  if (mode === "yoga" && cueEl) cueEl.textContent = "Stand in mountain. Soft knees, crown lifted.";
  if (mode === "taichi" && cueEl) cueEl.textContent = TAICHI[0];
  if (mode === "meditation" && cueEl) cueEl.textContent = "Face the camera. Keep the face still for 10 seconds.";
  if (mode === "vestibular" && cueEl) cueEl.textContent = "Look LEFT RIGHT LEFT RIGHT, then UP DOWN UP DOWN, then mouth open close twice.";
  if (holdEl) holdEl.textContent = "Hold 0.0s";
  const forms = document.getElementById("forms");
  const list = document.getElementById("formList");
  if (forms) forms.classList.toggle("open", mode === "taichi");
  if (list && mode === "taichi") {
    list.innerHTML = TAICHI.map((cue, i) => '<li class="form-item' + (i === 0 ? " on" : "") + '"><b>' + (i + 1) + "</b> " + cue + "</li>").join("");
  }
  const chips = document.getElementById("chips");
  if (chips) chips.innerHTML = "";
}

let switchToken = 0;

addEventListener("fit-room", (ev) => {
  const next = ev.detail;
  if (!TITLES[next] || next === mode) return;
  const prevFace = usesFace(mode);
  const token = ++switchToken;
  pause();
  resetPlay();
  mode = next;
  applyChrome();
  if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (dot) dot.classList.remove("live");
  if (!stream) {
    if (statusEl) statusEl.textContent = "Camera idle";
    return;
  }
  if (statusEl) statusEl.textContent = "Resetting camera…";
  setTimeout(() => {
    if (token !== switchToken || !stream) return;
    const ready = prevFace === usesFace(mode) ? Promise.resolve() : closeModels().then(() => ensureModel(mode));
    ready.then(() => {
      if (token !== switchToken || !stream) return;
      if (video) { video.srcObject = stream; video.play().catch(() => {}); }
      running = true;
      lastTs = 0;
      if (veil) veil.classList.add("hidden");
      loop();
    }).catch(() => {
      if (statusEl) statusEl.textContent = "Camera reset failed";
    });
  }, 0);
});

function loop() {
  if (!running) return;
  const my = gen;
  const now = performance.now();
  let heavy = false;
  if (video && video.readyState >= 2) {
    const dt = lastTs ? Math.min(80, now - lastTs) : 16;
    lastTs = now;
    heavy = tickFrame({ mode, video, canvas, ctx, dt, now, scoreEl, cueEl, holdEl, detailEl, statusEl, dot, barFill, claimBox, modeTitle }) === true;
  }
  if (!(running && my === gen)) return;
  if (heavy) {
    setTimeout(() => { if (running && my === gen) raf = requestAnimationFrame(loop); }, 0);
  } else {
    raf = requestAnimationFrame(loop);
  }
}

async function start() {
  goBtn.disabled = true;
  goBtn.textContent = "Loading model…";
  const my = ++gen;
  try {
    await ensureModel(mode);
    if (my !== gen) return;
    if (!stream) {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 480, max: 640 },
          height: { ideal: 640, max: 800 },
          frameRate: { ideal: 15, max: 20 }
        },
        audio: false
      });
      if (my !== gen) { stream.getTracks().forEach(t => t.stop()); stream = null; return; }
      video.srcObject = stream;
      video.muted = true;
      video.setAttribute("playsinline", "true");
      await video.play().catch(() => {});
    }
    running = true;
    lastTs = 0;
    if (veil) veil.classList.add("hidden");
    goBtn.disabled = false;
    goBtn.textContent = "Open camera";
    loop();
  } catch (err) {
    if (statusEl) statusEl.textContent = "Camera or model failed";
    if (cueEl) cueEl.textContent = "Allow the camera, then tap Open camera.";
    goBtn.disabled = false;
    goBtn.textContent = "Open camera";
    if (veil) veil.classList.remove("hidden");
  }
}

function stop() {
  pause();
  if (stream) stream.getTracks().forEach(t => t.stop());
  stream = null;
  if (video) video.srcObject = null;
  if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (veil) veil.classList.remove("hidden");
  if (goBtn) { goBtn.disabled = false; goBtn.textContent = "Open camera"; }
  if (statusEl) statusEl.textContent = "Camera idle";
  if (dot) dot.classList.remove("live");
}

applyChrome();
if (goBtn) goBtn.onclick = start;
if (stopBtn) stopBtn.onclick = stop;
addEventListener("pagehide", stop);
addEventListener("beforeunload", stop);
const skip = document.getElementById("skipMove");
if (skip) skip.onclick = () => tickFrame({ mode, skip: true, scoreEl, cueEl, holdEl, barFill, claimBox });
if (window.__fitWantCamera) start();
