/* Level 1 Yin Awakening — 5 minute timer on the homepage */
(function () {
  const DURATION = 5 * 60 * 1000;
  const END_KEY = 'fit_yin_end';
  const PAUSE_KEY = 'fit_yin_left_ms';
  let tick = null;

  function injectStyle() {
    if (document.getElementById('yin-timer-style')) return;
    const s = document.createElement('style');
    s.id = 'yin-timer-style';
    s.textContent = [
      '.yin-timer{position:fixed;top:72px;left:0;right:0;z-index:60;pointer-events:none}',
      '.yin-timer[hidden]{display:none!important}',
      '.yin-timer-inner{pointer-events:auto;margin:0 auto;max-width:720px;display:flex;align-items:center;gap:.7rem;flex-wrap:wrap;',
      'padding:.55rem .9rem;border:1px solid rgba(249,115,22,.35);border-radius:999px;',
      'background:rgba(8,8,10,.88);backdrop-filter:blur(10px);color:#fff7ed;',
      'box-shadow:0 10px 40px rgba(0,0,0,.35)}',
      '.yin-timer-kicker{font-size:.68rem;letter-spacing:.16em;text-transform:uppercase;color:#fb923c}',
      '#yin-timer-clock{font-size:1.15rem;font-weight:600;letter-spacing:.06em;color:#fdba74;font-variant-numeric:tabular-nums;min-width:3.2rem}',
      '.yin-timer-track{flex:1;min-width:80px;height:6px;border-radius:99px;background:rgba(255,255,255,.08);overflow:hidden}',
      '.yin-timer-track>i{display:block;height:100%;width:100%;transform-origin:left;background:linear-gradient(90deg,#f97316,#fbbf24);transition:transform .2s linear}',
      '#yin-timer-pause{border:1px solid rgba(251,146,60,.45);background:transparent;color:#fdba74;border-radius:999px;padding:.28rem .7rem;font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}',
      '#yin-timer-dismiss{border:0;background:transparent;color:rgba(255,255,255,.55);font-size:1.2rem;line-height:1;cursor:pointer;padding:0 .2rem}',
      'body.yin-running .main-portal{padding-top:7.5rem}',
      '@media(max-width:640px){.yin-timer{top:64px;padding:0 .6rem}.yin-timer-inner{border-radius:1.1rem}}'
    ].join('');
    document.head.appendChild(s);
  }

  function pad(n) { return String(n).padStart(2, '0'); }
  function fmt(ms) {
    const s = Math.max(0, Math.ceil(ms / 1000));
    return Math.floor(s / 60) + ':' + pad(s % 60);
  }

  function bar() { return document.getElementById('yin-timer'); }
  function clock() { return document.getElementById('yin-timer-clock'); }
  function fill() { return document.getElementById('yin-timer-fill'); }
  function pauseBtn() { return document.getElementById('yin-timer-pause'); }

  function remaining() {
    const paused = Number(localStorage.getItem(PAUSE_KEY) || 0);
    if (paused > 0) return paused;
    const end = Number(localStorage.getItem(END_KEY) || 0);
    return Math.max(0, end - Date.now());
  }

  function isPaused() {
    return Number(localStorage.getItem(PAUSE_KEY) || 0) > 0;
  }

  function paint() {
    const left = remaining();
    const el = clock();
    const f = fill();
    if (el) el.textContent = fmt(left);
    if (f) f.style.transform = 'scaleX(' + Math.max(0, Math.min(1, left / DURATION)) + ')';
    const p = pauseBtn();
    if (p) p.textContent = isPaused() ? 'Resume' : 'Pause';
    return left;
  }

  function stopTick() {
    if (tick) { clearInterval(tick); tick = null; }
  }

  function finish(ok) {
    stopTick();
    localStorage.removeItem(END_KEY);
    localStorage.removeItem(PAUSE_KEY);
    const el = clock();
    if (el) el.textContent = '0:00';
    const f = fill();
    if (f) f.style.transform = 'scaleX(0)';
    const p = pauseBtn();
    if (p) p.textContent = ok ? 'Done' : 'Pause';
    document.body.classList.remove('yin-running');
    if (ok && typeof showToast === 'function') showToast('Yin Awakening \u00b7 5 minutes complete');
  }

  function runTick() {
    stopTick();
    paint();
    tick = setInterval(function () {
      if (isPaused()) return;
      const left = paint();
      if (left <= 0) finish(true);
    }, 250);
  }

  function ensureBar() {
    if (document.getElementById('yin-timer')) return;
    const wrap = document.createElement('div');
    wrap.id = 'yin-timer';
    wrap.className = 'yin-timer';
    wrap.hidden = true;
    wrap.innerHTML = '<div class="yin-timer-inner">' +
      '<span class="yin-timer-kicker">Level 1 \u00b7 Yin Awakening</span>' +
      '<b id="yin-timer-clock">5:00</b>' +
      '<span class="yin-timer-track" aria-hidden="true"><i id="yin-timer-fill"></i></span>' +
      '<button type="button" id="yin-timer-pause">Pause</button>' +
      '<button type="button" id="yin-timer-dismiss" aria-label="Hide timer">\u00d7</button>' +
      '</div>';
    const nav = document.querySelector('nav');
    if (nav && nav.parentNode) nav.parentNode.insertBefore(wrap, nav.nextSibling);
    else document.body.insertBefore(wrap, document.body.firstChild);
  }

  function showBar() {
    ensureBar();
    const wrap = bar();
    if (!wrap) return;
    wrap.hidden = false;
    document.body.classList.add('yin-running');
  }

  window.startYinHomeTimer = function (fresh) {
    injectStyle();
    showBar();
    if (fresh) {
      localStorage.setItem(END_KEY, String(Date.now() + DURATION));
      localStorage.removeItem(PAUSE_KEY);
      if (typeof showToast === 'function') showToast('Yin Awakening \u00b7 5:00 on the page');
    }
    runTick();
  };

  function wrapJoin() {
    const orig = window.goToList;
    window.goToList = function () {
      if (typeof orig === 'function') orig();
      window.startYinHomeTimer(true);
    };
  }

  function bind() {
    injectStyle();
    ensureBar();
    wrapJoin();
    const pause = pauseBtn();
    const hide = document.getElementById('yin-timer-dismiss');
    if (pause) pause.addEventListener('click', function () {
      if (remaining() <= 0) {
        window.startYinHomeTimer(true);
        return;
      }
      if (isPaused()) {
        localStorage.setItem(END_KEY, String(Date.now() + Number(localStorage.getItem(PAUSE_KEY))));
        localStorage.removeItem(PAUSE_KEY);
        runTick();
      } else {
        localStorage.setItem(PAUSE_KEY, String(remaining()));
        localStorage.removeItem(END_KEY);
        paint();
      }
    });
    if (hide) hide.addEventListener('click', function () {
      stopTick();
      const wrap = bar();
      if (wrap) wrap.hidden = true;
      document.body.classList.remove('yin-running');
    });
    const left = remaining();
    if (left > 0) window.startYinHomeTimer(false);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();
