/* FIT Yoga — prayer pose via shared full Hand Landmarker */
(function () {
  const HOLD_NEED = 12;
  const STEPS = [
    { id: 'see', label: '1. Show both hands' },
    { id: 'pray', label: '2. Palms together (prayer)' },
    { id: 'heart', label: '3. Hands at the heart' },
    { id: 'hold', label: '4. Hold and breathe' }
  ];
  let stream = null, raf = 0, gen = 0, lastDetect = 0, step = 0, hold = 0, done = false;
  function $(id) { return document.getElementById(id); }
  function dist(a, b) { return (!a || !b) ? 99 : Math.hypot(a.x - b.x, a.y - b.y); }
  function mid(a, b) { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; }
  function setPrompt(text, status) {
    const p = $('yoga-prompt'); const s = $('yoga-status');
    if (p) p.textContent = text; if (s && status !== undefined) s.textContent = status;
  }
  function paintChecks() {
    const list = $('yoga-checks'); if (!list) return;
    list.innerHTML = STEPS.map(function (item, i) {
      const cls = i < step ? 'done' : (i === step ? 'active' : '');
      return '<li class="' + cls + '">' + item.label + '</li>';
    }).join('');
  }
  function pairHands(result) {
    const hands = result && result.landmarks ? result.landmarks : [];
    if (hands.length < 2) return null;
    return { a: hands[0], b: hands[1] };
  }
  function readPray(pair) {
    if (!pair) return { see: false, pray: false, heart: false, pct: 0 };
    const a = pair.a, b = pair.b;
    const wrist = dist(a[0], b[0]); const index = dist(a[8], b[8]); const middle = dist(a[12], b[12]); const pinky = dist(a[20], b[20]);
    const together = wrist < 0.14 && index < 0.16 && middle < 0.16 && pinky < 0.18;
    const fingersUp = a[8].y < a[0].y - 0.02 && b[8].y < b[0].y - 0.02;
    const center = mid(a[0], b[0]);
    const atHeart = center.y > 0.32 && center.y < 0.68 && center.x > 0.28 && center.x < 0.72;
    let pct = 20; if (together) pct += 35; if (fingersUp) pct += 20; if (atHeart) pct += 25;
    return { see: true, pray: together && fingersUp, heart: together && fingersUp && atHeart, pct: Math.min(100, pct), center: center };
  }
  function advance() {
    hold = 0; step += 1;
    if (step >= STEPS.length) { done = true; setPrompt('Prayer pose held', 'You can keep breathing with the timer'); if (typeof showToast === 'function') showToast('Prayer pose complete'); }
    paintChecks();
  }
  function tick() {
    const video = $('yoga-cam'); const canvas = $('yoga-canvas');
    if (!video || !canvas || !window.FitHands) { raf = requestAnimationFrame(tick); return; }
    if (video.readyState < 2) { setPrompt('Starting camera…', 'Waiting for video'); raf = requestAnimationFrame(tick); return; }
    if (canvas.width !== video.videoWidth && video.videoWidth) { canvas.width = video.videoWidth; canvas.height = video.videoHeight; }
    const now = performance.now();
    if (now - lastDetect < 90) { raf = requestAnimationFrame(tick); return; }
    lastDetect = now;
    const result = window.FitHands.detect(video);
    const ctx = canvas.getContext('2d');
    if (ctx) { ctx.clearRect(0, 0, canvas.width, canvas.height); window.FitHands.draw(ctx, result, canvas.width, canvas.height); }
    const read = window.FitHands.prayPair(result);
    const pctEl = $('yoga-pct'); if (pctEl) pctEl.textContent = read.see ? (read.pct + '%') : '—';
    const n = result && result.landmarks ? result.landmarks.length : 0;
    if (done) { raf = requestAnimationFrame(tick); return; }
    paintChecks();
    let hit = false;
    if (step === 0) { setPrompt('Show both hands close to the camera', n + ' / 2 hands · fill the frame with your palms'); hit = read.see; }
    else if (step === 1) { setPrompt('Press the palms together', read.pray ? 'Prayer shape found' : 'Fingers point up. Palms kiss.'); hit = read.pray; }
    else if (step === 2) { setPrompt('Bring the prayer to your heart', read.heart ? 'At the heart' : 'Slide the joined hands to center chest'); hit = read.heart; }
    else { setPrompt('Hold and breathe', 'Stay in prayer · ' + hold + ' / ' + HOLD_NEED); hit = read.heart; }
    if (hit) { hold += 1; if (hold >= (step === 3 ? HOLD_NEED : 3)) advance(); } else { hold = Math.max(0, hold - 1); }
    raf = requestAnimationFrame(tick);
  }
  async function loadHands() { if (!window.FitHands) throw new Error('Hand model helper missing'); return window.FitHands.ensure(); }
  window.stopYogaLab = function () {
    gen += 1; if (raf) { cancelAnimationFrame(raf); raf = 0; }
    if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
    const video = $('yoga-cam'); if (video) video.srcObject = null;
    const lab = $('yoga-lab'); if (lab) lab.classList.remove('show');
    step = 0; hold = 0; done = false;
  };
  window.startYogaLab = async function () {
    const lab = $('yoga-lab'); if (!lab) return; lab.classList.add('show');
    const my = ++gen; step = 0; hold = 0; done = false; lastDetect = 0; paintChecks();
    const skip = $('yoga-skip'); if (skip) skip.onclick = function () { if (!done) advance(); };
    setPrompt('Allow the camera', 'Full hand model · stays on this device');
    const video = $('yoga-cam');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('This browser cannot use the camera');
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } }, audio: false });
      if (my !== gen) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; return; }
      video.setAttribute('playsinline', 'true'); video.muted = true; video.srcObject = stream; await video.play().catch(function () {});
      setPrompt('Loading MediaPipe Hands (full)…', 'First load can take a few seconds');
      await loadHands();
      if (window.FitHands && window.FitHands.setCloseUp) window.FitHands.setCloseUp(true);
      if (my !== gen) return;
      setPrompt('Show both hands close to the camera', 'Hands full model · step 1');
      raf = requestAnimationFrame(tick);
    } catch (err) {
      const msg = (err && err.message) ? err.message : 'Camera or tracker failed';
      setPrompt('Could not start tracker', msg + '. Use Count this move if needed.');
      if (typeof showToast === 'function') showToast('Yoga tracker needs camera');
    }
  };
})();
(function(){var s=document.createElement("script");s.src="/waitlist-gate.js?v=20260903vest2";document.body.appendChild(s);})();
(function () {
  var studio = {
    yoga: "/practice.html?mode=yoga",
    taichi: "/practice.html?mode=taichi",
    meditation: "/practice.html?mode=meditation",
    vestibular: "/practice.html?mode=vestibular"
  };
  var prev = window.startPractice;
  window.startPractice = function (key) {
    if (studio[key]) { window.location.href = studio[key]; return; }
    if (typeof prev === "function") return prev(key);
  };
  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }
  ready(function () {
    var grid = document.querySelector("#services .grid");
    if (!grid) return;
    var taichiCardLink = grid.querySelector("a[href='/taichi.html']");
    if (taichiCardLink) {
      taichiCardLink.setAttribute("href", studio.taichi);
      taichiCardLink.textContent = "Open Tai Chi studio";
    }
    if (!grid.querySelector("[data-fit-meditation]")) {
      var card = document.createElement("div");
      card.className = "service-card";
      card.setAttribute("data-fit-meditation", "1");
      card.innerHTML = '<div class="text-4xl mb-6">🕯️</div><h3 class="text-3xl font-bold mb-4 text-white">Meditation</h3><p class="text-zinc-400 leading-relaxed mb-6">Hold the face still for ten seconds. Camera stays on this device.</p><a href="/practice.html?mode=meditation" class="block w-full py-3 rounded-xl bg-white/10 hover:bg-orange-500 transition text-center">Open Meditation studio</a>';
      var vest = null;
      grid.querySelectorAll("h3").forEach(function (h) {
        if (/vestibular/i.test(h.textContent)) vest = h.closest(".service-card");
      });
      if (vest && vest.parentNode) vest.parentNode.insertBefore(card, vest);
      else grid.appendChild(card);
    }
    if (grid.className.indexOf("lg:grid-cols-4") < 0) {
      grid.className = grid.className.replace("md:grid-cols-3", "md:grid-cols-2 lg:grid-cols-4");
    }
  });
})();
