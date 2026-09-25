const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const ui = document.getElementById('ui');
const titleEl = document.getElementById('title');
const copyEl = document.getElementById('copy');
const eyeEl = document.getElementById('eye');
const goBtn = document.getElementById('go');
const howBtn = document.getElementById('how');
const lvEl = document.getElementById('lv');
const parkEl = document.getElementById('park');
const onEl = document.getElementById('on');
const fleasEl = document.getElementById('fleas');
const clockEl = document.getElementById('clock');
const timebar = document.getElementById('timebar');
const stick = document.getElementById('stick');
const knob = document.getElementById('knob');

function parkName(i){
  return 'Dog Park ' + (i + 1);
}

function makeLevel(i){
  const ticks = 8 + i;
  const bushes = Math.min(8, 2 + i);
  const time = Math.max(16, 34 - i * 1.5);
  const base = 56 + i * 8;
  return {
    name: parkName(i),
    time, ticks, bushes, base,
    fleasDrop: 2
  };
}
const LEVELS = Array.from({length:10}, (_, i) => makeLevel(i));

let W=800, H=520, dpr=1;
let state='title';
let level=0;
let timeLeft=36, timeMax=36;
let cat, human, dog, ticks=[], bushes=[], particles=[];
let fleasDropped = 0;
let keys={};
let joy={x:0,y:0,active:false};
let aim=null;
let last=0, flash=0, shake=0;
let rescue=null;
let best = Number(localStorage.getItem('tic-best-level')||0);

function resize(){
  dpr = Math.min(2, window.devicePixelRatio||1);
  const r = canvas.getBoundingClientRect();
  W = Math.max(320, Math.floor(r.width));
  H = Math.max(280, Math.floor(r.height));
  canvas.width = Math.floor(W*dpr);
  canvas.height = Math.floor(H*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  if (human && state!=='rescue'){ human.x = W-58; human.y = H*0.5; }
}
window.addEventListener('resize', resize);

function rand(a,b){ return a + Math.random()*(b-a); }
function clamp(v,a,b){ return Math.max(a, Math.min(b,v)); }
function dist(a,b){ return Math.hypot(a.x-b.x, a.y-b.y); }
function fmtTime(s){
  const n = Math.max(0, Math.floor(s));
  return Math.floor(n/60) + ':' + String(n%60).padStart(2,'0');
}
function circleHitsRect(c, r){
  const x = clamp(c.x, r.x, r.x+r.w);
  const y = clamp(c.y, r.y, r.y+r.h);
  return Math.hypot(c.x-x, c.y-y) < c.r;
}
function resolveBush(ent){
  for (const b of bushes){
    if (!circleHitsRect(ent, b)) continue;
    const cx = clamp(ent.x, b.x, b.x+b.w);
    const cy = clamp(ent.y, b.y, b.y+b.h);
    let dx = ent.x-cx, dy = ent.y-cy;
    const d = Math.hypot(dx,dy) || 0.001;
    const push = ent.r - d + 0.5;
    ent.x += dx/d*push;
    ent.y += dy/d*push;
  }
  ent.x = clamp(ent.x, 18, W-18);
  ent.y = clamp(ent.y, 18, H-18);
}

function spawnLevel(i){
  const L = LEVELS[i];
  timeMax = L.time; timeLeft = L.time;
  bushes = [];
  for (let n=0;n<L.bushes;n++){
    let placed=false, tries=0;
    while(!placed && tries++<40){
      const b = {x:rand(70,W-200), y:rand(40,H-90), w:rand(36,78), h:rand(28,64)};
      const mid = {x:b.x+b.w/2,y:b.y+b.h/2};
      if (mid.x < 130 && mid.y > H*0.55) continue;
      if (mid.x > W-150) continue;
      bushes.push(b); placed=true;
    }
  }
  cat = {x:56, y:H-64, r:16, vx:0, vy:0, attached:0, inv:0};
  human = {x:W-58, y:H*0.5, r:20, facing:0, run:0};
  dog = {
    x: rand(W*0.38, W*0.58),
    y: rand(H*0.28, H*0.62),
    r: 18, vx: 0, vy: 0,
    facing: 1,
    phase: rand(0, Math.PI*2),
    coat: rand(0,1) > 0.45 ? 'tan' : 'brindle',
    onboard: 6 + i,
    dropLeft: L.fleasDrop,
    nextDrop: 0.55
  };
  fleasDropped = 0;
  ticks = [];
  for (let n=0;n<L.ticks;n++){
    ticks.push(makePest({
      x:rand(W*0.28, W*0.72),
      y:rand(40, H-40),
      kind: 'tic',
      speed:rand(L.base, L.base+28) + (n===0 ? 16 + i*6 : 0)
    }));
  }
  particles = [];
  flash=0; shake=0; rescue=null;
  lvEl.textContent = i+1;
  setParkLabel(i);
}

function setParkLabel(i){
  const name = parkName(i);
  if (parkEl) parkEl.textContent = name;
  if (fleasEl) fleasEl.textContent = fleasDropped;
}

function makePest(opts){
  return {
    x: opts.x, y: opts.y,
    r: opts.kind === 'flea' ? 5.2 : 7,
    vx: 0, vy: 0,
    phase: rand(0, Math.PI*2),
    stuck: false, flung: false, peelAt: 1,
    orbit: rand(0, Math.PI*2),
    speed: opts.speed,
    kind: opts.kind || 'tic'
  };
}

function dropFleaFromDog(){
  if (!dog || dog.dropLeft <= 0) return;
  dog.dropLeft--;
  dog.onboard = Math.max(0, dog.onboard - 1);
  fleasDropped++;
  if (fleasEl) fleasEl.textContent = fleasDropped;
  const ang = rand(0, Math.PI*2);
  const L = LEVELS[level];
  const flea = makePest({
    x: dog.x + Math.cos(ang) * 10,
    y: dog.y + Math.sin(ang) * 6,
    kind: 'flea',
    speed: (L.base + 18) + level * 4
  });
  flea.vx = Math.cos(ang) * rand(80, 140);
  flea.vy = Math.sin(ang) * rand(40, 90) - 40;
  flea.fall = 0.38;
  ticks.push(flea);
  burst(flea.x, flea.y, '#6a3a18');
  shake = Math.max(shake, 4);
}
