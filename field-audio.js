/* Meditation field: spoken count + 136 Hz bed. No remote clip. */
(function () {
  const LINES = [
    "Soften the jaw.",
    "Eyes easy.",
    "Breathe low.",
    "One.",
    "Two.",
    "Three.",
    "Four.",
    "Five.",
    "Six.",
    "Seven.",
    "Eight.",
    "Nine.",
    "Ten.",
    "The field is still."
  ];
  const GAPS = [1200, 1400, 2200, 2200, 2200, 2200, 2200, 2200, 2200, 2200, 2200, 2200, 2600, 600];
  let ctx = null, nodes = [], muted = false, speaking = false, timer = 0, line = 0;

  function mode() {
    const on = document.querySelector(".mode.on");
    return on ? on.dataset.mode : "";
  }
  function reduced() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  function ensure() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    if (ctx.state === "suspended") ctx.resume().catch(function () {});
    return ctx;
  }
  function pickVoice() {
    const voices = speechSynthesis.getVoices() || [];
    const rank = function (v) {
      const n = (v.name || "") + " " + (v.lang || "");
      if (/Samantha|Karen|Moira|Tessa|Fiona|Victoria|Susan|Zira|Google UK English Female|Google US English Female|Female/i.test(n)) return 4;
      if (v.lang && /^en/i.test(v.lang) && /female|woman|girl/i.test(n)) return 3;
      if (v.lang && /^en/i.test(v.lang)) return 1;
      return 0;
    };
    return voices.slice().sort(function (a, b) { return rank(b) - rank(a); })[0] || null;
  }
  function stopDrone() {
    nodes.forEach(function (n) {
      try { if (n.stop) n.stop(); n.disconnect(); } catch (e) {}
    });
    nodes = [];
  }
  function startDrone() {
    const c = ensure();
    if (!c || muted || reduced() || nodes.length) return;
    [[136.1, 0.028], [204.15, 0.01], [68.05, 0.012]].forEach(function (pair) {
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = "sine";
      osc.frequency.value = pair[0];
      g.gain.value = 0;
      osc.connect(g);
      g.connect(c.destination);
      osc.start();
      g.gain.linearRampToValueAtTime(pair[1], c.currentTime + 1.6);
      nodes.push(osc, g);
    });
  }
  function speakNext() {
    if (muted || reduced() || !speaking) return;
    if (line >= LINES.length) { speaking = false; return; }
    const u = new SpeechSynthesisUtterance(LINES[line]);
    u.rate = 0.78;
    u.pitch = 1.05;
    u.volume = 0.9;
    u.lang = "en-US";
    const v = pickVoice();
    if (v) u.voice = v;
    const gap = GAPS[line] || 1800;
    line += 1;
    u.onend = function () {
      if (!speaking) return;
      timer = setTimeout(speakNext, gap);
    };
    try { speechSynthesis.speak(u); } catch (e) { speaking = false; }
  }
  function startSpeak() {
    if (muted || reduced() || speaking) return;
    speaking = true;
    line = 0;
    try { speechSynthesis.cancel(); } catch (e) {}
    speechSynthesis.getVoices();
    timer = setTimeout(speakNext, 600);
  }
  function stopAll() {
    speaking = false;
    clearTimeout(timer);
    stopDrone();
    try { speechSynthesis.cancel(); } catch (e) {}
  }
  function startField() {
    if (mode() !== "meditation" || muted || reduced()) return;
    startDrone();
    startSpeak();
  }
  function toggleMute() {
    muted = !muted;
    const btn = document.getElementById("mute");
    if (btn) btn.textContent = muted ? "Sound off" : "Sound on";
    if (muted) stopAll();
    else if (mode() === "meditation") startField();
  }

  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = function () { pickVoice(); };
  }
  const muteBtn = document.getElementById("mute");
  if (muteBtn) muteBtn.addEventListener("click", toggleMute);
  const go = document.getElementById("go");
  if (go) go.addEventListener("click", function () { setTimeout(startField, 450); });
  const stop = document.getElementById("stop");
  if (stop) stop.addEventListener("click", stopAll);
  document.querySelectorAll(".mode").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.dataset.mode !== "meditation") stopAll();
    });
  });
  addEventListener("pagehide", stopAll);
})();
