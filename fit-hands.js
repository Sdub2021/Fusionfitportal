/* FIT Hands — MediaPipe Tasks Hand Landmarker, same FitHands API */
(function () {
  const MP = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32';
  const WASM = MP + '/wasm';
  const MODEL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
  const LINES = [
    [0,1],[1,2],[2,3],[3,4],
    [0,5],[5,6],[6,7],[7,8],
    [5,9],[9,10],[10,11],[11,12],
    [9,13],[13,14],[14,15],[15,16],
    [13,17],[17,18],[18,19],[19,20],
    [0,17]
  ];

  let landmarker = null;
  let loading = null;
  let ready = false;
  let failMsg = '';
  let last = { landmarks: [], handedness: [] };
  let lastTs = -1;
  let closeUp = false;

  function dist(a, b) { return (!a || !b) ? 99 : Math.hypot(a.x - b.x, a.y - b.y, (a.z || 0) - (b.z || 0)); }
  function mid(a, b) { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: ((a.z || 0) + (b.z || 0)) / 2 }; }
  function angleAt(a, b, c) {
    if (!a || !b || !c) return 0;
    const v1 = { x: a.x - b.x, y: a.y - b.y, z: (a.z || 0) - (b.z || 0) };
    const v2 = { x: c.x - b.x, y: c.y - b.y, z: (c.z || 0) - (b.z || 0) };
    const d1 = Math.hypot(v1.x, v1.y, v1.z) || 1;
    const d2 = Math.hypot(v2.x, v2.y, v2.z) || 1;
    const dot = (v1.x * v2.x + v1.y * v2.y + v1.z * v2.z) / (d1 * d2);
    return Math.acos(Math.max(-1, Math.min(1, dot)));
  }
  function visible(p) { return p && (p.visibility === undefined || p.visibility > 0.2); }

  async function createLandmarker(mod, fileset, delegate) {
    return mod.HandLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: MODEL, delegate: delegate },
      runningMode: 'VIDEO',
      numHands: 2,
      minHandDetectionConfidence: closeUp ? 0.35 : 0.4,
      minHandPresenceConfidence: closeUp ? 0.35 : 0.4,
      minTrackingConfidence: closeUp ? 0.35 : 0.4
    });
  }

  async function ensure() {
    if (landmarker) return landmarker;
    if (loading) return loading;
    loading = (async function () {
      const mod = await import(MP + '/vision_bundle.mjs');
      const fileset = await mod.FilesetResolver.forVisionTasks(WASM);
      const want = (window.FIT_GPU_TAKEN ? 'CPU' : (window.FIT_MP_DELEGATE || 'GPU'));
      try {
        landmarker = await createLandmarker(mod, fileset, want);
        if (want === 'GPU') window.FIT_GPU_TAKEN = true;
      } catch (e) {
        landmarker = await createLandmarker(mod, fileset, 'CPU');
      }
      ready = true;
      return landmarker;
    })();
    try { return await loading; }
    catch (err) {
      loading = null;
      failMsg = (err && err.message) ? err.message : 'hand model failed';
      throw err;
    }
  }

  function setCloseUp(on) { closeUp = !!on; }

  function detect(video) {
    if (!landmarker || !video || video.readyState < 2) return last;
    const now = performance.now();
    if (now === lastTs) return last;
    lastTs = now;
    try {
      const result = landmarker.detectForVideo(video, now);
      last = {
        landmarks: result && result.landmarks ? result.landmarks : [],
        handedness: result && result.handedness ? result.handedness : []
      };
    } catch (e) {}
    return last;
  }

  function draw(ctx, result, w, h) {
    if (!ctx) return;
    const list = result && result.landmarks ? result.landmarks : [];
    const thick = Math.max(3, Math.round(w / 160));
    list.forEach(function (hand) {
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = thick;
      ctx.lineCap = 'round';
      LINES.forEach(function (pair) {
        const p = hand[pair[0]], q = hand[pair[1]];
        if (!p || !q) return;
        ctx.beginPath();
        ctx.moveTo(p.x * w, p.y * h);
        ctx.lineTo(q.x * w, q.y * h);
        ctx.stroke();
      });
      ctx.fillStyle = '#34d399';
      [0, 4, 8, 12, 16, 20].forEach(function (i) {
        const p = hand[i];
        if (!p) return;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, thick + 2, 0, Math.PI * 2);
        ctx.fill();
      });
    });
  }

  function drawPoseFingers(ctx, poseLm, w, h) {
    if (!ctx || !poseLm) return;
    ctx.strokeStyle = '#fdba74';
    ctx.lineWidth = 3;
    [[15,19],[15,17],[15,21],[16,20],[16,18],[16,22]].forEach(function (pair) {
      const a = poseLm[pair[0]], b = poseLm[pair[1]];
      if (!visible(a) || !visible(b)) return;
      ctx.beginPath();
      ctx.moveTo(a.x * w, a.y * h);
      ctx.lineTo(b.x * w, b.y * h);
      ctx.stroke();
    });
  }

  function ladyFromHand(hand, elbow) {
    if (!hand || !hand[0] || !hand[9] || !hand[12]) return { score: 0, straight: 0, side: 0 };
    const wrist = hand[0], mcp = hand[9], tip = hand[12];
    const hinge = elbow || { x: wrist.x, y: wrist.y + 0.16, z: wrist.z || 0 };
    const straight = Math.max(0, Math.min(1, (angleAt(hinge, wrist, mcp) - 2.3) / 0.75));
    const len = dist(wrist, tip) || 0.01;
    const width = (hand[4] && hand[20]) ? dist(hand[4], hand[20]) : dist(hand[8], hand[20]);
    const side = Math.max(0, Math.min(1, 1 - width / (len * 1.05)));
    return { score: straight * 0.6 + side * 0.4, straight: straight, side: side };
  }

  function bestLady(result, leftElbow, rightElbow) {
    const list = result && result.landmarks ? result.landmarks : [];
    const names = result && result.handedness ? result.handedness : [];
    if (!list.length) return { score: 0, count: 0 };
    let best = 0;
    list.forEach(function (hand, i) {
      const label = names[i] && names[i][0] && names[i][0].categoryName;
      const elbow = label === 'Left' ? leftElbow : (label === 'Right' ? rightElbow : null);
      const read = ladyFromHand(hand, elbow);
      if (read.score > best) best = read.score;
    });
    return { score: best, count: list.length };
  }

  function prayPair(result) {
    const list = result && result.landmarks ? result.landmarks : [];
    if (list.length < 2) return { see: false, pray: false, heart: false, pct: list.length ? 18 : 0, count: list.length };
    const a = list[0], b = list[1];
    const together = dist(a[0], b[0]) < 0.16 && dist(a[8], b[8]) < 0.18 && dist(a[12], b[12]) < 0.18;
    const fingersUp = a[8].y < a[0].y - 0.01 && b[8].y < b[0].y - 0.01;
    const center = mid(a[0], b[0]);
    const atHeart = center.y > 0.28 && center.y < 0.75 && center.x > 0.22 && center.x < 0.78;
    let pct = 20 + (together ? 35 : 0) + (fingersUp ? 20 : 0) + (atHeart ? 25 : 0);
    return { see: true, pray: together && fingersUp, heart: together && fingersUp && atHeart, pct: Math.min(100, pct), count: 2 };
  }

  window.FitHands = {
    model: 'MediaPipe Hand Landmarker',
    ready: function () { return ready; },
    error: function () { return failMsg; },
    ensure: ensure,
    setCloseUp: setCloseUp,
    detect: detect,
    draw: draw,
    drawPoseFingers: drawPoseFingers,
    ladyFromHand: ladyFromHand,
    bestLady: bestLady,
    prayPair: prayPair
  };
})();
