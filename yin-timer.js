/* Level 1 Yin Awakening — 5 minute timer stays on that page */
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
      '#level1-yin-clock{font-size:clamp(3.2rem,12vw,5.4rem);font-weight:300;letter-spacing:.08em;color:#fdba74;margin:0 0 1.1rem;font-variant-numeric:tabular-nums}',
      '#level1-yin-note{color:rgba(255,247,237,.7);font-size:.85rem;letter-spacing:.12em;text-transform:uppercase;margin:0 0 1.2rem}',
      '.level1-yin-track{display:block;width:min(280px,70%);height:7px;margin:0 auto 1.4rem;border-radius:99px;background:rgba(255,255,255,.12);overflow:hidden}',
      '.level1-yin-track>i{display:block;height:100%;width:100%;transform-origin:left;background:linear-gradient(90deg,#f97316,#fbbf24);transition:transform .2s linear}'
    ].join('');
    document.head.appendChild(s);
  }

  function pad(n) { return String(n).padStart(2, '0'); }
  function fmt(ms) {
    const s = Math.max(0, Math.ceil(ms / 1000));
    return Math.floor(s / 60) + ':' + pad(s % 60);
  }
  function remaining() {
    const paused = Number(localStorage.getItem(PAUSE_KEY) || 0);
    if (paused > 0) return paused;
    const end = Number(localStorage.getItem(END_KEY) || 0);
    return Math.max(0, end - Date.now());
  }
  function isPaused() { return Number(localStorage.getItem(PAUSE_KEY) || 0) > 0; }

  function level1Root() { return document.getElementById('level1-experience'); }
  function joinBtn() {
    const root = level1Root();
    if (!root) return null;
    const buttons = root.querySelectorAll('button');
    for (const b of buttons) {
      if ((b.getAttribute('aria-label') || '').toLowerCase() === 'close') continue;
      if (b.textContent && /join|start|pause|resume|done|list/i.test(b.textContent)) return b;
    }
    return root.querySelector('.level1-content button') || null;
  }

  function ensureLevelClock() {
    const root = level1Root();
    if (!root) return;
    const box = root.querySelector('.level1-content') || root;
    if (!document.getElementById('level1-yin-clock')) {
      const clock = document.createElement('p');
      clock.id = 'level1-yin-clock';
      clock.textContent = '5:00';
      const note = document.createElement('p');
      note.id = 'level1-yin-note';
      note.textContent = 'Five minutes on this page';
      const track = document.createElement('span');
      track.className = 'level1-yin-track';
      track.innerHTML = '<i id="level1-yin-fill"></i>';
      const title = box.querySelector('h2');
      if (title && title.parentNode) title.parentNode.insertBefore(clock, title.nextSibling);
      else box.insertBefore(clock, box.firstChild);
      clock.after(note);
      note.after(track);
    }
    const btn = joinBtn();
    if (btn) {
      btn.setAttribute('data-yin-start', '1');
      btn.removeAttribute('onclick');
    }
  }

  function paint() {
    const left = remaining();
    const text = fmt(left);
    const scale = 'scaleX(' + Math.max(0, Math.min(1, left / DURATION)) + ')';
    const a = document.getElementById('level1-yin-clock');
    const fa = document.getElementById('level1-yin-fill');
    if (a) a.textContent = text;
    if (fa) fa.style.transform = scale;
    const note = document.getElementById('level1-yin-note');
    const btn = joinBtn();
    if (left <= 0 && (localStorage.getItem(END_KEY) || document.body.dataset.yinFinished === '1')) {
      if (note) note.textContent = 'Complete';
      if (btn) btn.textContent = 'Done';
    } else if (isPaused()) {
      if (note) note.textContent = 'Paused';
      if (btn) btn.textContent = 'Resume';
    } else if (localStorage.getItem(END_KEY)) {
      if (note) note.textContent = 'Stay on this page';
      if (btn) btn.textContent = 'Pause';
    }
    return left;
  }

  function stopTick() {
    if (tick) { clearInterval(tick); tick = null; }
  }

  function finish(ok) {
    stopTick();
    localStorage.removeItem(END_KEY);
    localStorage.removeItem(PAUSE_KEY);
    document.body.dataset.yinFinished = '1';
    const a = document.getElementById('level1-yin-clock');
    if (a) a.textContent = '0:00';
    const fa = document.getElementById('level1-yin-fill');
    if (fa) fa.style.transform = 'scaleX(0)';
    const note = document.getElementById('level1-yin-note');
    if (note) note.textContent = 'Complete';
    const btn = joinBtn();
    if (btn) btn.textContent = 'Done';
    if (ok && typeof showToast === 'function') showToast('Yin Awakening \u00b7 5 minutes complete');
  }

  function runTick() {
    stopTick();
    paint();
    tick = setInterval(function () {
      if (isPaused()) { paint(); return; }
      if (paint() <= 0) finish(true);
    }, 250);
  }

  function keepLevel1Open() {
    const exp = level1Root();
    if (exp) exp.classList.add('active');
  }

  window.startYinHomeTimer = function (fresh) {
    injectStyle();
    ensureLevelClock();
    keepLevel1Open();
    document.body.dataset.yinFinished = '';
    if (fresh) {
      localStorage.setItem(END_KEY, String(Date.now() + DURATION));
      localStorage.removeItem(PAUSE_KEY);
      if (typeof showToast === 'function') showToast('Yin Awakening \u00b7 5:00');
    }
    runTick();
  };

  function toggleFromButton(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    }
    keepLevel1Open();
    const running = !!localStorage.getItem(END_KEY);
    const paused = isPaused();
    if (!running && !paused) {
      window.startYinHomeTimer(true);
      return false;
    }
    if (paused) {
      localStorage.setItem(END_KEY, String(Date.now() + Number(localStorage.getItem(PAUSE_KEY))));
      localStorage.removeItem(PAUSE_KEY);
      runTick();
    } else {
      localStorage.setItem(PAUSE_KEY, String(remaining()));
      localStorage.removeItem(END_KEY);
      paint();
    }
    return false;
  }

  function hookGoToList() {
    window.goToList = function (e) { toggleFromButton(e); };
  }

  function hookButton() {
    const btn = joinBtn();
    if (!btn || btn.dataset.yinBound === '1') return;
    btn.dataset.yinBound = '1';
    btn.setAttribute('data-yin-start', '1');
    btn.removeAttribute('onclick');
    btn.addEventListener('click', toggleFromButton, true);
  }

  function bind() {
    injectStyle();
    hookGoToList();
    hookButton();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
  setTimeout(bind, 60);
  setTimeout(bind, 450);
  setTimeout(bind, 900);
})();
