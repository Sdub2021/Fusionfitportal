/* Detection helpers. Models stay idle until ensureModel(). Inference uses a small frame so the page can still take taps. */
const MP = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/vision_bundle.mjs";
const WASM = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm";
const POSE_MODEL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";
const FACE_MODEL = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

const GAZE = ["left","right","left","right","up","down","up","down","mouthOpen","mouthClose","mouthOpen","mouthClose"];
const GAZE_CUE = {
  left: "Look LEFT — turn the head, keep the eyes soft.",
  right: "Look RIGHT — turn the head, keep the eyes soft.",
  up: "Look UP — lift the chin, keep the shoulders quiet.",
  down: "Look DOWN — drop the chin, keep the shoulders quiet.",
  mouthOpen: "OPEN your mouth — drop the jaw and hold.",
  mouthClose: "CLOSE your mouth — lips together, then wait."
};

let FilesetResolver, PoseLandmarker, FaceLandmarker, vision, poseLM, faceLM, modelBusy;
let sitMs = 0, gazeStep = 0, gazeHold = 0, gazeDone = false, awarded = false;
let calN = 0, calYaw = 0, calPitch = 0, originYaw = 0, originPitch = 0, prev = null, goodMs = 0;
let lastDetect = 0, formIdx = 0, formHold = 0, videoTs = 0, canvasW = 0, canvasH = 0;
let scratch = null, scratchCtx = null;
let acceptInfer = true;
let closeChain = Promise.resolve();

export function usesFace(mode) { return mode === "meditation" || mode === "vestibular"; }

export function resetPlay() {
  sitMs = 0; gazeStep = 0; gazeHold = 0; gazeDone = false; awarded = false;
  calN = 0; calYaw = 0; calPitch = 0; originYaw = 0; originPitch = 0; prev = null; goodMs = 0;
  formIdx = 0; formHold = 0; lastDetect = 0;
  // videoTs must stay monotonic. Resetting it makes detectForVideo hang the tab.
}

export function holdInference() { acceptInfer = false; }
export function releaseInference() { acceptInfer = true; }

export function closeModels() {
  acceptInfer = false;
  const face = faceLM, pose = poseLM;
  faceLM = null; poseLM = null;
  resetPlay();
  closeChain = closeChain.then(async () => {
    try { if (face && face.close) await face.close(); } catch (e) {}
    try { if (pose && pose.close) await pose.close(); } catch (e) {}
  });
  return closeChain;
}

async function loadLib() {
  if (FilesetResolver) return;
  const mod = await import(MP);
  FilesetResolver = mod.FilesetResolver;
  PoseLandmarker = mod.PoseLandmarker;
  FaceLandmarker = mod.FaceLandmarker;
}

let simdOn = false, delegateUsed = "CPU", lastCost = 0;

async function createTask(factory, model, extra) {
  const base = { modelAssetPath: model };
  try {
    const task = await factory(vision, Object.assign({ baseOptions: Object.assign({ delegate: "GPU" }, base) }, extra));
    delegateUsed = "GPU";
    return task;
  } catch (e) {
    delegateUsed = "CPU";
    return factory(vision, Object.assign({ baseOptions: Object.assign({ delegate: "CPU" }, base) }, extra));
  }
}

export async function ensureModel(mode) {
  await closeChain;
  if (modelBusy) {
    while (modelBusy) await new Promise(r => setTimeout(r, 30));
  }
  if (usesFace(mode) && faceLM) { acceptInfer = true; return; }
  if (!usesFace(mode) && poseLM) { acceptInfer = true; return; }
  modelBusy = true;
  try {
    await loadLib();
    if (!vision) {
      simdOn = !!(FilesetResolver.isSimdSupported && await FilesetResolver.isSimdSupported().catch(() => false));
      vision = await FilesetResolver.forVisionTasks(WASM);
    }
    if (usesFace(mode)) {
      if (!faceLM) faceLM = await createTask(FaceLandmarker.createFromOptions, FACE_MODEL, {
        runningMode: "VIDEO",
        numFaces: 1,
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false,
        minFaceDetectionConfidence: 0.5,
        minFacePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
    } else if (!poseLM) {
      poseLM = await createTask(PoseLandmarker.createFromOptions, POSE_MODEL, {
        runningMode: "VIDEO",
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
    }
  } finally { modelBusy = false; acceptInfer = true; }
}

function pt(f, i) { return f && f[i] ? f[i] : null; }
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function vis(p) { return p && (p.visibility === undefined || p.visibility > 0.45); }

function faceYawPitch(face) {
  const nose = pt(face, 1), le = pt(face, 33), re = pt(face, 263);
  if (!nose || !le || !re) return null;
  const w = Math.max(0.04, dist(le, re));
  return { yaw: (nose.x - (le.x + re.x) / 2) / w, pitch: (nose.y - (le.y + re.y) / 2) / (w * 1.35) };
}

function hit(dir, yaw, pitch, jaw) {
  if (dir === "left") return yaw > 0.12;
  if (dir === "right") return yaw < -0.12;
  if (dir === "up") return pitch < -0.07;
  if (dir === "down") return pitch > 0.07;
  if (dir === "mouthOpen") return jaw;
  if (dir === "mouthClose") return !jaw;
  return false;
}

function poseScore(lm, mode) {
  const ls = lm[11], rs = lm[12], lh = lm[23], rh = lm[24], la = lm[27], ra = lm[28];
  if (!vis(ls) || !vis(rs) || !vis(lh) || !vis(rh)) return { score: 0, cue: "Step back until shoulders and hips are visible.", ready: false };
  if (!vis(la) || !vis(ra)) return { score: 0, cue: "Show both feet in frame.", ready: false };
  const shoulders = Math.abs(ls.y - rs.y), hips = Math.abs(lh.y - rh.y), stance = dist(la, ra);
  if (mode === "yoga") {
    let score = 100 - Math.min(30, shoulders * 420) - Math.min(25, hips * 380);
    if (stance < 0.12) score -= 15;
    score = Math.max(0, Math.min(99, Math.round(score)));
    let cue = "Stacked. Breathe into the crown.";
    if (shoulders > 0.045) cue = "Level the shoulders.";
    else if (hips > 0.04) cue = "Square the hips.";
    else if (stance < 0.12) cue = "Widen the feet.";
    return { score, cue, ready: score >= 78 };
  }
  const score = Math.max(0, Math.min(99, Math.round(55 - shoulders * 200)));
  return { score, cue: "Soft knees. Hands follow the waist.", ready: score >= 55 };
}

function paintClaim(kind) {
  const claim = document.getElementById("claim");
  if (!claim) return;
  const h = claim.querySelector("h2");
  const lead = claim.querySelector("p");
  if (kind === "meditation") {
    if (h) h.textContent = "Stillness complete · Join the list";
    if (lead) lead.textContent = "Ten seconds still. Leave your email and Solana wallet to join the waitlist. One signup per person.";
  } else {
    if (h) h.textContent = "Gaze complete · Join the list";
    if (lead) lead.textContent = "Vestibular sequence finished. Leave your email and Solana wallet to join the waitlist. One signup per person.";
  }
}

function revealSignup(ui) {
  const claim = ui.claimBox || document.getElementById("claim");
  if (!claim) return;
  claim.classList.add("open");
  const scroll = () => claim.scrollIntoView({ behavior: "smooth", block: "start" });
  setTimeout(scroll, 40);
  setTimeout(scroll, 320);
}

function unlock(kind, ui) {
  awarded = true;
  if (ui.barFill) ui.barFill.style.width = "100%";
  paintClaim(kind);
  if (kind === "vestibular") {
    if (ui.scoreEl) ui.scoreEl.textContent = String(GAZE.length);
    if (ui.cueEl) ui.cueEl.textContent = "Sequence complete. Join the waitlist below.";
    if (ui.holdEl) ui.holdEl.textContent = "Done";
  } else {
    if (ui.scoreEl) ui.scoreEl.textContent = "10";
    if (ui.cueEl) ui.cueEl.textContent = "Stillness complete. Join the list below.";
    if (ui.holdEl) ui.holdEl.textContent = "Done";
    try { sessionStorage.setItem("fit_meditation_done", "1"); } catch (e) {}
  }
  revealSignup(ui);
}

function smallFrame(video) {
  const w = video.videoWidth || 320;
  const h = video.videoHeight || 240;
  const scale = Math.min(1, 224 / w);
  const tw = Math.max(2, Math.round(w * scale));
  const th = Math.max(2, Math.round(h * scale));
  if (!scratch) scratch = document.createElement("canvas");
  if (scratch.width !== tw) scratch.width = tw;
  if (scratch.height !== th) scratch.height = th;
  if (!scratchCtx) scratchCtx = scratch.getContext("2d", { alpha: false, desynchronized: true });
  scratchCtx.drawImage(video, 0, 0, tw, th);
  return scratch;
}

function sizeOverlay(canvas, ctx) {
  if (!canvas) return;
  const r = canvas.getBoundingClientRect();
  const dpr = Math.min(devicePixelRatio || 1, 1.25);
  const w = Math.max(1, Math.floor(r.width * dpr));
  const h = Math.max(1, Math.floor(r.height * dpr));
  if (w !== canvasW || h !== canvasH) {
    canvas.width = w;
    canvas.height = h;
    canvasW = w;
    canvasH = h;
  } else if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

function nextTs(now) {
  videoTs = Math.max(videoTs + 33, Math.round(now));
  return videoTs;
}

function detect(lm, sample) {
  if (!lm || !acceptInfer) return null;
  const ts = nextTs(performance.now());
  try { return lm.detectForVideo(sample, ts); }
  catch (e) { videoTs += 1000; return null; }
}

export function tickFrame(ui) {
  if (!acceptInfer && !ui.skip) return false;
  if (ui.skip) {
    if (ui.mode !== "vestibular" || gazeDone) return false;
    gazeStep += 1; gazeHold = 0;
    if (gazeStep >= GAZE.length) { gazeDone = true; unlock("vestibular", ui); return false; }
    if (ui.scoreEl) ui.scoreEl.textContent = String(gazeStep);
    if (ui.cueEl) ui.cueEl.textContent = GAZE_CUE[GAZE[gazeStep]];
    if (ui.holdEl) ui.holdEl.textContent = "Step " + gazeStep + " / " + GAZE.length;
    return false;
  }
  const now = ui.now;
  const gap = lastCost > 90 ? 420 : 280;
  if (now - lastDetect < gap) return false;
  const sinceDetect = lastDetect ? Math.min(520, now - lastDetect) : 16;
  lastDetect = now;
  const t0 = now;
  const { video, canvas, ctx, dt } = ui;
  if (!video) return false;
  sizeOverlay(canvas, ctx);
  const sample = smallFrame(video);
  const ts = nextTs(now);
  if (usesFace(ui.mode)) {
    if (!faceLM) return false;
    const res = detect(faceLM, sample);
    if (!res && !acceptInfer) return false;
    const face = res && res.faceLandmarks && res.faceLandmarks[0];
    if (!face) {
      if (ui.cueEl) ui.cueEl.textContent = ui.mode === "meditation" ? "Face the camera. Stillness starts when the face is in frame." : "Need the face in frame.";
      if (ui.holdEl && ui.mode === "meditation") ui.holdEl.textContent = "Still " + (sitMs / 1000).toFixed(1) + " / 10.0s";
      if (ui.dot) ui.dot.classList.remove("live");
      if (ui.statusEl) ui.statusEl.textContent = ui.mode === "meditation" ? "Stillness · waiting for face" : "Tracking face";
      return true;
    }
    if (ctx && canvas) {
      ctx.fillStyle = "#f0c27a";
      [1, 33, 263, 13, 14].forEach(i => {
        const p = face[i]; if (!p) return;
        ctx.beginPath(); ctx.arc(p.x * canvas.width, p.y * canvas.height, 3, 0, Math.PI * 2); ctx.fill();
      });
    }
    if (ui.mode === "meditation") {
      const nose = pt(face, 1);
      const motion = nose && prev ? dist(nose, prev) : 0;
      if (nose) prev = nose;
      const still = motion < 0.012;
      if (!awarded) {
        const step = sinceDetect || Math.min(520, Math.max(dt || 16, 16));
        sitMs = still ? Math.min(10000, sitMs + step) : Math.max(0, sitMs - step * 0.45);
        if (sitMs >= 10000) unlock("meditation", ui);
      }
      if (awarded) {
        if (ui.scoreEl) ui.scoreEl.textContent = "10";
        if (ui.holdEl) ui.holdEl.textContent = "Done";
        if (ui.barFill) ui.barFill.style.width = "100%";
        if (ui.cueEl && ui.cueEl.textContent.indexOf("Join the list") < 0) ui.cueEl.textContent = "Stillness complete. Join the list below.";
      } else {
        const shown = Math.min(10, sitMs / 1000);
        if (ui.scoreEl) ui.scoreEl.textContent = shown.toFixed(1);
        if (ui.cueEl) ui.cueEl.textContent = still ? "Still. Hold the face quiet." : "Movement detected. Settle and hold.";
        if (ui.holdEl) ui.holdEl.textContent = "Still " + shown.toFixed(1) + " / 10.0s";
        if (ui.barFill) ui.barFill.style.width = Math.min(100, sitMs / 100) + "%";
      }
      if (ui.detailEl) ui.detailEl.textContent = "Motion " + motion.toFixed(4);
    } else {
      const pose = faceYawPitch(face);
      if (!pose) return true;
      if (calN < 12) {
        calYaw += pose.yaw; calPitch += pose.pitch; calN += 1;
        if (calN === 12) { originYaw = calYaw / 12; originPitch = calPitch / 12; }
        if (ui.cueEl) ui.cueEl.textContent = "Hold center. Calibrating…";
        return true;
      }
      const a = pt(face, 13), b = pt(face, 14);
      const jaw = !!(a && b && dist(a, b) > 0.045);
      if (!gazeDone) {
        const need = GAZE[gazeStep];
        if (hit(need, pose.yaw - originYaw, pose.pitch - originPitch, jaw)) {
          gazeHold += dt;
          if (gazeHold >= 180) {
            gazeStep += 1; gazeHold = 0;
            if (gazeStep >= GAZE.length) { gazeDone = true; unlock("vestibular", ui); }
          }
        } else gazeHold = Math.max(0, gazeHold - dt * 0.8);
      }
      const shown = gazeDone ? GAZE.length : gazeStep;
      if (ui.scoreEl) ui.scoreEl.textContent = shown;
      if (ui.cueEl) ui.cueEl.textContent = gazeDone ? "Sequence complete." : GAZE_CUE[GAZE[gazeStep]];
      if (ui.holdEl) ui.holdEl.textContent = gazeDone ? "Done" : ("Step " + shown + " / " + GAZE.length);
      if (ui.barFill) ui.barFill.style.width = Math.min(100, (shown / GAZE.length) * 100) + "%";
    }
    lastCost = performance.now() - t0;
    if (ui.statusEl) ui.statusEl.textContent = (ui.mode === "meditation" ? "Stillness · face" : "Gaze · face") + " · " + delegateUsed;
    if (ui.dot) ui.dot.classList.add("live");
    return true;
  }
  if (!poseLM) {
    if (ui.statusEl) ui.statusEl.textContent = "Loading full body tracker…";
    return false;
  }
  const res = detect(poseLM, sample);
  if (!res && !acceptInfer) return false;
  const body = res && res.landmarks && res.landmarks[0];
  if (!body) {
    if (ui.cueEl) ui.cueEl.textContent = "No body in frame.";
    if (ui.dot) ui.dot.classList.remove("live");
    return true;
  }
  if (ctx && canvas) {
    ctx.strokeStyle = "#f0c27a";
    ctx.lineWidth = 2;
    [[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28]].forEach(pair => {
      const a = body[pair[0]], b = body[pair[1]];
      if (!a || !b) return;
      ctx.beginPath();
      ctx.moveTo(a.x * canvas.width, a.y * canvas.height);
      ctx.lineTo(b.x * canvas.width, b.y * canvas.height);
      ctx.stroke();
    });
    ctx.fillStyle = "#f0c27a";
    [11,12,13,14,15,16,23,24,25,26,27,28].forEach(i => {
      const p = body[i]; if (!p) return;
      ctx.beginPath(); ctx.arc(p.x * canvas.width, p.y * canvas.height, 4, 0, Math.PI * 2); ctx.fill();
    });
  }
  const read = poseScore(body, ui.mode);
  if (ui.scoreEl) ui.scoreEl.textContent = read.score;
  if (ui.cueEl) ui.cueEl.textContent = read.cue;
  if (ui.mode === "taichi") {
    if (read.ready) formHold += dt; else formHold = Math.max(0, formHold - dt * 0.35);
    if (formHold >= 7000) { formIdx = Math.min(11, formIdx + 1); formHold = 0; }
    if (ui.holdEl) ui.holdEl.textContent = "Form " + (formIdx + 1) + " / 12";
    if (ui.barFill) ui.barFill.style.width = Math.min(100, ((formIdx + formHold / 7000) / 12) * 100) + "%";
  } else {
    goodMs = read.ready ? goodMs + dt : Math.max(0, goodMs - dt * 0.4);
    if (ui.holdEl) ui.holdEl.textContent = "Hold " + (goodMs / 1000).toFixed(1) + "s";
  }
  lastCost = performance.now() - t0;
  if (ui.statusEl) ui.statusEl.textContent = "Full body · " + delegateUsed;
  if (ui.dot) ui.dot.classList.add("live");
  if (ui.detailEl) ui.detailEl.textContent = "Full body landmarks " + body.length;
  return true;
}
