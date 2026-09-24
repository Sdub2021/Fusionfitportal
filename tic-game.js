const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const ui = document.getElementById('ui');
const titleEl = document.getElementById('title');
const copyEl = document.getElementById('copy');
const eyeEl = document.getElementById('eye');
const goBtn = document.getElementById('go');
const howBtn = document.getElementById('how');
const lvEl = document.getElementById('lv');
const onEl = document.getElementById('on');
const clockEl = document.getElementById('clock');
const timebar = document.getElementById('timebar');
const stick = document.getElementById('stick');
const knob = document.getElementById('knob');

const NAMES = [
  'Dusk porch','Tall grass','Fence run','Dark hedge','Swarm hour',
  'Wet clover','Stone path','Low beam','Thorn belt','Lamp walk',
  'Quiet well','Cedar row','Mud lane','Moon gate','Nettle bed',
  'Cold stoop','Briar turn','Ash circle','Owl yard','Last latch'
];

function makeLevel(i){
  const n = i + 1;
  const ticks = 8 + i;
  const bushes = Math.min(8, 2 + i);
  const time = Math.max(16, 34 - i * 1.5);
  const base = 56 + i * 4;
  return {
    name: NAMES[i % NAMES.length],
    time, ticks, bushes, base
  };
}
const LEVELS = Array.from({length:10}, (_, i) => makeLevel(i));

let W=800, H=520, dpr=1;
let state='title';
let level=0;
let timeLeft=36, timeMax=36;
let cat, human, ticks=[], bushes=[], particles=[];
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
  ticks = [];
  for (let n=0;n<L.ticks;n++){
    ticks.push({
      x:rand(W*0.28, W*0.72),
      y:rand(40, H-40),
      r:7, vx:0, vy:0,
      phase:rand(0,Math.PI*2),
      stuck:false, flung:false, peelAt:1,
      orbit:rand(0,Math.PI*2),
      speed:rand(L.base, L.base+28)
    });
  }
  particles = [];
  flash=0; shake=0; rescue=null;
  lvEl.textContent = i+1;
}

function attachTick(t){
  if (t.stuck || t.flung || cat.inv>0) return;
  t.stuck = true;
  cat.attached++;
  cat.inv = 0.55;
  shake = 8;
  flash = 0.18;
  for (let i=0;i<10;i++) particles.push({x:cat.x,y:cat.y,vx:rand(-40,40),vy:rand(-50,10),life:rand(.3,.7),c:'#6b2b1e'});
}

function burst(x,y,c){
  for (let i=0;i<16;i++) particles.push({x,y,vx:rand(-70,70),vy:rand(-80,40),life:rand(.4,.9),c});
}

function startGame(from){
  if (from==='fresh') level = 0;
  spawnLevel(level);
  aim = null;
  state = 'play';
  ui.classList.add('hidden');
}

function goToClaim(kind){
  try {
    localStorage.setItem('fit_tic_done', '1');
    localStorage.setItem('fit_tic_level', String(level+1));
  } catch (e) {}
  const q = new URLSearchParams({
    from: 'tic',
    level: String(level+1)
  });
  if (kind === 'clear') q.set('clear', '1');
  location.href = '/claim.html?' + q.toString();
}

function beginRescue(){
  state = 'rescue';
  const stuck = ticks.filter(t => t.stuck);
  stuck.forEach((t, i) => {
    t.peelAt = stuck.length ? (i + 0.35) / (stuck.length + 0.4) : 0.4;
  });
  rescue = { t: 0, dur: Math.max(1.7, 1.25 + stuck.length * 0.16), count: cat.attached };
  burst(human.x, human.y-10, '#f3c27a');
}

function finishRescue(){
  best = Math.max(best, level+1);
  localStorage.setItem('tic-best-level', String(best));
  if (level >= LEVELS.length-1) goToClaim('clear');
  else show('win');
}

function show(kind){
  state = kind;
  ui.classList.remove('hidden');
  if (kind==='title'){
    eyeEl.textContent = best ? ('Best reach \u00b7 level ' + best + ' / 10') : '10 yards';
    titleEl.textContent = 'TIC';
    copyEl.textContent = 'You are the cat. The others are tics. Beat ten yards. Start with eight tics, then one more each yard. Reach your human \u2014 they will run a circle and fling every tic off you before the lamp burns out. Clear all ten to submit your wallet.';
    goBtn.textContent = 'Find them';
  } else if (kind==='win'){
    eyeEl.textContent = LEVELS[level].name + ' \u00b7 ' + (level+1) + ' / 10';
    titleEl.textContent = 'Safe';
    copyEl.textContent = rescue && rescue.count
      ? 'They run a circle around you. '+rescue.count+' tic'+(rescue.count===1?'':'s')+' spin off into the dark. Next yard has '+(9+level)+' tics.'
      : 'You reach them clean. Next yard has '+(9+level)+' tics.';
    goBtn.textContent = 'Yard ' + (level+2);
  } else if (kind==='clear'){
    eyeEl.textContent = 'Yard 10';
    titleEl.textContent = 'Home';
    copyEl.textContent = 'Ten yards. Your human ran the last circle. No tic left on you. Submit your wallet.';
    goBtn.textContent = 'Claim wallet';
  } else if (kind==='lose'){
    eyeEl.textContent = 'Lamp out \u00b7 ' + (level+1) + ' / 10';
    titleEl.textContent = 'Too late';
    copyEl.textContent = 'The dark thickens. Tics keep their hold. Your human is a shape you cannot reach in time.';
    goBtn.textContent = 'Try the yard again';
  }
}

function updateRescue(dt){
  rescue.t += dt;
  const p = Math.min(1, rescue.t / rescue.dur);
  const ang = rescue.t * 6.4;
  const radius = 36 + Math.sin(rescue.t * 5.2) * 5;
  human.x = cat.x + Math.cos(ang) * radius;
  human.y = cat.y + Math.sin(ang) * radius * 0.74;
  human.facing = ang + Math.PI/2;
  human.run = 1;
  cat.vx = 0; cat.vy = 0;
  for (const t of ticks){
    t.phase += dt * 12;
    if (t.stuck && !t.flung){
      if (p >= t.peelAt){
        t.flung = true;
        t.stuck = false;
        cat.attached = Math.max(0, cat.attached-1);
        const throwA = ang + rand(-0.35, 0.35);
        t.vx = Math.cos(throwA) * rand(210, 280);
        t.vy = Math.sin(throwA) * rand(210, 280);
        burst(t.x, t.y, '#b44532');
        shake = 5;
      } else {
        t.orbit += dt * 9;
        t.x = cat.x + Math.cos(t.orbit) * (cat.r + 6);
        t.y = cat.y + Math.sin(t.orbit) * (cat.r * 0.7 + 4);
      }
    } else if (t.flung){
      t.x += t.vx * dt;
      t.y += t.vy * dt;
      t.vx *= 0.985; t.vy *= 0.985;
    } else {
      const dx = t.x - cat.x, dy = t.y - cat.y;
      const d = Math.hypot(dx,dy) || 1;
      t.vx = (dx/d) * 90;
      t.vy = (dy/d) * 90;
      t.x += t.vx * dt;
      t.y += t.vy * dt;
    }
  }
  particles = particles.filter(pt=>{
    pt.life -= dt; pt.x += pt.vx*dt; pt.y += pt.vy*dt; pt.vy += 80*dt;
    return pt.life>0;
  });
  shake *= 0.86;
  flash = Math.max(0, flash-dt);
  if (rescue.t >= rescue.dur) finishRescue();
}

function update(dt){
  if (state==='rescue'){ updateRescue(dt); return; }
  if (state!=='play') return;
  timeLeft -= dt;
  if (timeLeft <= 0){
    timeLeft = 0;
    show('lose');
    return;
  }
  let ax=0, ay=0;
  if (keys['arrowleft']||keys['a']) ax -= 1;
  if (keys['arrowright']||keys['d']) ax += 1;
  if (keys['arrowup']||keys['w']) ay -= 1;
  if (keys['arrowdown']||keys['s']) ay += 1;
  ax += joy.x; ay += joy.y;
  if (aim){
    const dx = aim.x - cat.x, dy = aim.y - cat.y;
    if (Math.hypot(dx,dy) < 8) aim = null;
    else { ax += dx; ay += dy; }
  }
  const mag = Math.hypot(ax,ay);
  if (mag>1){ ax/=mag; ay/=mag; }
  const slow = 1 / (1 + cat.attached*0.22);
  const spd = 168 * slow;
  cat.vx = ax*spd; cat.vy = ay*spd;
  cat.x += cat.vx*dt; cat.y += cat.vy*dt;
  cat.inv = Math.max(0, cat.inv-dt);
  resolveBush(cat);
  for (const t of ticks){
    t.phase += dt*8;
    if (t.stuck){
      t.orbit += dt*(2.2 + cat.attached*0.15);
      t.x = cat.x + Math.cos(t.orbit)* (cat.r + 6);
      t.y = cat.y + Math.sin(t.orbit)* (cat.r*0.7 + 4);
      continue;
    }
    const dx = cat.x - t.x, dy = cat.y - t.y;
    const d = Math.hypot(dx,dy)||1;
    const jitter = Math.sin(t.phase*0.7)*0.35;
    t.vx = (dx/d)*t.speed + Math.cos(t.phase)*28 + jitter*40;
    t.vy = (dy/d)*t.speed + Math.sin(t.phase*1.3)*28;
    t.x += t.vx*dt; t.y += t.vy*dt;
    resolveBush(t);
    if (dist(t, cat) < cat.r + t.r - 2) attachTick(t);
  }
  if (dist(cat, human) < cat.r + human.r + 8){
    beginRescue();
    return;
  }
  particles = particles.filter(p=>{
    p.life -= dt; p.x += p.vx*dt; p.y += p.vy*dt; p.vy += 80*dt;
    return p.life>0;
  });
  shake *= 0.86;
  flash = Math.max(0, flash-dt);
}

function drawGrass(){
  ctx.fillStyle = '#14110c';
  ctx.fillRect(0,0,W,H);
  ctx.fillStyle = '#1b1711';
  for (let i=0;i<28;i++){
    const x = (i*97 + 40) % W;
    const y = (i*53 + 20) % H;
    ctx.globalAlpha = 0.35;
    ctx.beginPath(); ctx.ellipse(x,y,40,16,0.2,0,Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  const g = ctx.createRadialGradient(human?human.x:W-70, human?human.y:H*0.48, 10, human?human.x:W-70, human?human.y:H*0.48, 220);
  g.addColorStop(0,'rgba(232,165,75,.16)');
  g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,W,H);
  if (state==='rescue' && cat){
    ctx.strokeStyle = 'rgba(232,165,75,.28)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6,8]);
    ctx.beginPath();
    ctx.ellipse(cat.x, cat.y, 36, 36*0.74, 0, 0, Math.PI*2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function drawBush(b){
  ctx.fillStyle = '#24301c';
  ctx.beginPath();
  ctx.roundRect(b.x, b.y, b.w, b.h, 16);
  ctx.fill();
  ctx.fillStyle = '#314226';
  ctx.beginPath();
  ctx.ellipse(b.x+b.w*0.35, b.y+8, b.w*0.38, 12, 0, 0, Math.PI*2);
  ctx.fill();
}

function drawHuman(){
  const x=human.x, y=human.y;
  const run = state==='rescue' ? (rescue?rescue.t:0) : 0;
  const walk = state==='play' ? (performance.now()/240) : run*10;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(8,6,4,.35)';
  ctx.beginPath(); ctx.ellipse(1, 20, 16, 5.5, 0, 0, Math.PI*2); ctx.fill();
  const L = Math.sin(walk)*3.2;
  const R = Math.sin(walk+Math.PI)*3.2;
  ctx.fillStyle = '#3a2a18';
  ctx.beginPath(); ctx.roundRect(-7.5, 8+L*0.15, 6.2, 13, 2); ctx.fill();
  ctx.beginPath(); ctx.roundRect(1.4, 8+R*0.15, 6.2, 13, 2); ctx.fill();
  ctx.fillStyle = '#1c140c';
  ctx.beginPath(); ctx.ellipse(-4.2, 21+L*0.15, 4.2, 2.1, -0.2, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(4.6, 21+R*0.15, 4.2, 2.1, 0.2, 0, Math.PI*2); ctx.fill();
  const jeans = ctx.createLinearGradient(-8, 4, 8, 16);
  jeans.addColorStop(0, '#3d4a5c'); jeans.addColorStop(1, '#2a3340');
  ctx.fillStyle = jeans;
  ctx.beginPath(); ctx.roundRect(-8, 2, 16, 12, 3); ctx.fill();
  const coat = ctx.createLinearGradient(-10, -16, 10, 6);
  coat.addColorStop(0, '#c9853c'); coat.addColorStop(0.5, '#a86b2e'); coat.addColorStop(1, '#7a4c1e');
  ctx.fillStyle = coat;
  ctx.beginPath(); ctx.roundRect(-9.5, -15, 19, 20, 5); ctx.fill();
  ctx.fillStyle = '#5c3814';
  ctx.fillRect(-1, -14, 2.2, 16);
  ctx.fillStyle = '#e8a54b';
  ctx.beginPath(); ctx.arc(7.5, -8, 2.4, 0, Math.PI*2); ctx.fill();
  if (state!=='rescue'){
    ctx.strokeStyle = '#c9a36a';
    ctx.lineWidth = 3.4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-8, -10); ctx.lineTo(-13, -1+L); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(8, -10); ctx.lineTo(13, -2+R); ctx.stroke();
    ctx.fillStyle = '#e2c39a';
    ctx.beginPath(); ctx.ellipse(-13.2, 0.4+L, 2.6, 2.2, 0.3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(13.4, -0.4+R, 2.6, 2.2, -0.3, 0, Math.PI*2); ctx.fill();
  }
  ctx.fillStyle = '#e2c39a';
  ctx.beginPath(); ctx.ellipse(0, -18, 7.2, 8.1, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#3b2414';
  ctx.beginPath();
  ctx.ellipse(0, -23.5, 7.6, 4.2, 0, Math.PI, Math.PI*2);
  ctx.fill();
  ctx.beginPath(); ctx.arc(-6.4, -20, 2.4, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(6.4, -20, 2.4, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#e2c39a';
  ctx.beginPath(); ctx.ellipse(-6.6, -17.5, 1.7, 2.2, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.ellipse(-2.3, -18.4, 1.5, 1.7, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(2.1, -18.4, 1.5, 1.7, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#2a1a10';
  ctx.beginPath(); ctx.arc(-2.1, -18.2, 0.85, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(2.3, -18.2, 0.85, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#c9a07a';
  ctx.beginPath(); ctx.moveTo(0,-17.2); ctx.lineTo(1.1,-15.2); ctx.lineTo(-0.2,-15); ctx.fill();
  ctx.strokeStyle = '#8a5a3a';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(0, -14.2, 2.1, 0.2, Math.PI-0.2); ctx.stroke();
  ctx.restore();
  ctx.fillStyle = 'rgba(232,165,75,.9)';
  ctx.font = '500 12px Outfit,sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(state==='rescue' ? 'rubbing them off' : 'your human', x, y-46);
}

function drawCat(){
  const x=cat.x, y=cat.y;
  const spd = Math.hypot(cat.vx||0, cat.vy||0);
  const bob = Math.sin(performance.now()/90) * Math.min(1.4, spd/90);
  ctx.save();
  ctx.translate(x, y+bob);
  const flip = cat.vx < -8 ? -1 : 1;
  ctx.scale(flip, 1);
  ctx.fillStyle = 'rgba(0,0,0,.28)';
  ctx.beginPath(); ctx.ellipse(1, 15, 15, 5, 0, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#b8894c';
  ctx.lineWidth = 3.2; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-12, 4);
  ctx.quadraticCurveTo(-22, 2+bob, -18, 12);
  ctx.stroke();
  ctx.fillStyle = '#8a5a28';
  ctx.beginPath(); ctx.ellipse(-6, 9, 3.4, 4.2, -0.2, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(5, 9.5, 3.2, 4, 0.15, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#3a2412';
  ctx.beginPath(); ctx.ellipse(-6, 13, 2.2, 1.4, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(5.4, 13.2, 2.2, 1.4, 0, 0, Math.PI*2); ctx.fill();
  const fur = ctx.createRadialGradient(-2, -2, 2, 0, 2, 18);
  fur.addColorStop(0, '#f0d2a0');
  fur.addColorStop(0.45, '#d4a05a');
  fur.addColorStop(1, '#8b5a28');
  ctx.fillStyle = fur;
  ctx.beginPath(); ctx.ellipse(0, 1.5, 14.5, 9.6, 0, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = 'rgba(90,50,18,.45)';
  ctx.lineWidth = 1.1;
  for (let i=0;i<4;i++){
    ctx.beginPath();
    ctx.ellipse(-1+i*0.3, 1, 10-i*1.6, 7-i, 0, 0.15, Math.PI-0.15);
    ctx.stroke();
  }
  ctx.fillStyle = '#c48a40';
  ctx.beginPath(); ctx.ellipse(5, 8.5, 2.6, 3.6, 0.4, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(9, 7.2, 2.3, 3.3, 0.5, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#e4c08a';
  ctx.beginPath(); ctx.ellipse(9.2, 0.2, 7.4, 6.2, 0.15, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#c47a38';
  ctx.beginPath(); ctx.moveTo(4.2, -3); ctx.lineTo(5.6, -14); ctx.lineTo(9.2, -4); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(11.2, -3.2); ctx.lineTo(14.4, -13.5); ctx.lineTo(15.6, -2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f3c7b0';
  ctx.beginPath(); ctx.moveTo(5.6, -4.5); ctx.lineTo(6.4, -11.5); ctx.lineTo(8.2, -4.2); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(12.2, -4.4); ctx.lineTo(13.8, -11.2); ctx.lineTo(14.6, -3.6); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f6e2c0';
  ctx.beginPath(); ctx.ellipse(12.6, 1.6, 3.6, 2.6, 0.2, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#d97a8a';
  ctx.beginPath(); ctx.ellipse(15.4, 1.5, 1.05, 0.7, 0.2, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#7ecf6a';
  ctx.beginPath(); ctx.ellipse(10.6, -0.6, 1.7, 1.9, 0.1, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#14200e';
  ctx.beginPath(); ctx.ellipse(11.05, -0.55, 0.7, 1.5, 0.1, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(10.3, -1.2, 0.45, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,236,210,.7)';
  ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(15.6, 2.2); ctx.lineTo(24, 0.4);
  ctx.moveTo(15.8, 3.1); ctx.lineTo(23.4, 4.6);
  ctx.moveTo(15.4, 1.2); ctx.lineTo(23, -1.8);
  ctx.stroke();
  ctx.restore();
}

function drawTick(t){
  const angry = t.stuck && !t.flung;
  const limp = t.flung;
  ctx.save();
  ctx.translate(t.x, t.y);
  ctx.rotate(Math.atan2(t.vy||0.01, t.vx||0.01));
  const wriggle = Math.sin(t.phase)*1.2;
  ctx.strokeStyle = limp ? '#2a1812' : '#1a100c';
  ctx.lineWidth = 1.15; ctx.lineCap = 'round';
  const legs = [-1.15, -0.55, 0.55, 1.15];
  legs.forEach((ang, i) => {
    const kick = Math.sin(t.phase*2 + i)* (limp?0.2:1.6);
    ctx.beginPath();
    ctx.moveTo(-1.2, 0);
    ctx.quadraticCurveTo(-5, ang*4 + kick, -9.5, ang*6 + wriggle*0.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(1.4, 0);
    ctx.quadraticCurveTo(5.2, ang*4 - kick, 8.8, ang*5.6 - wriggle*0.3);
    ctx.stroke();
  });
  const body = ctx.createRadialGradient(-1, -1, 1, 0, 0, 8);
  if (angry){
    body.addColorStop(0, '#e07055'); body.addColorStop(0.55, '#a33222'); body.addColorStop(1, '#4a140e');
  } else if (limp){
    body.addColorStop(0, '#6a3a28'); body.addColorStop(1, '#2a1410');
  } else {
    body.addColorStop(0, '#8a4a28'); body.addColorStop(0.5, '#5a2a18'); body.addColorStop(1, '#2a120c');
  }
  ctx.fillStyle = body;
  ctx.beginPath(); ctx.ellipse(0.6, 0, angry?8.2:6.6, angry?5.6:4.4, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = 'rgba(20,8,4,.55)';
  ctx.beginPath(); ctx.ellipse(-1.6, 0, 3.4, 3.1, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#2a1810';
  ctx.beginPath(); ctx.ellipse(6.2, 0, 2.5, 1.7, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#c9a36a';
  ctx.beginPath(); ctx.arc(7.6, -0.6, 0.7, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(7.6, 0.6, 0.7, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

function draw(){
  ctx.save();
  if (shake>0.4) ctx.translate(rand(-shake,shake), rand(-shake,shake));
  drawGrass();
  bushes.forEach(drawBush);
  if (human) drawHuman();
  ticks.filter(t=>t.stuck).forEach(drawTick);
  if (cat) drawCat();
  ticks.filter(t=>!t.stuck).forEach(drawTick);
  for (const p of particles){
    ctx.globalAlpha = Math.max(0,p.life);
    ctx.fillStyle = p.c;
    ctx.beginPath(); ctx.arc(p.x,p.y,2.2,0,Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  if (flash>0){
    ctx.fillStyle = 'rgba(180,40,20,' + (flash*0.35) + ')';
    ctx.fillRect(0,0,W,H);
  }
  ctx.restore();
  onEl.textContent = cat ? cat.attached : 0;
  clockEl.textContent = fmtTime(timeLeft);
  const pct = timeMax ? timeLeft/timeMax : 0;
  timebar.style.transform = 'scaleX(' + clamp(pct,0,1) + ')';
  timebar.style.background = pct<0.25 ? 'linear-gradient(90deg,#c45a3a,#7a2018)' : 'linear-gradient(90deg,#e8a54b,#c45a3a)';
}

function loop(t){
  const dt = Math.min(0.033, (t-last)/1000 || 0.016);
  last = t;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

canvas.addEventListener('pointerdown', e=>{
  if (state!=='play') return;
  const r = canvas.getBoundingClientRect();
  aim = {x: (e.clientX-r.left), y: (e.clientY-r.top)};
});
window.addEventListener('keydown', e=>{
  const k = e.key.toLowerCase();
  keys[k] = true;
  if (['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k)) e.preventDefault();
  if ((k==='enter' || k===' ') && state!=='play' && state!=='rescue') goBtn.click();
});
window.addEventListener('keyup', e=> keys[e.key.toLowerCase()] = false);

function setJoyFrom(clientX, clientY){
  const r = stick.getBoundingClientRect();
  const cx = r.left + r.width/2, cy = r.top + r.height/2;
  let dx = (clientX-cx)/(r.width*0.38);
  let dy = (clientY-cy)/(r.height*0.38);
  const m = Math.hypot(dx,dy);
  if (m>1){ dx/=m; dy/=m; }
  joy.x = dx; joy.y = dy;
  knob.style.transform = 'translate(' + (dx*28) + 'px,' + (dy*28) + 'px)';
}
stick.addEventListener('pointerdown', e=>{
  stick.setPointerCapture(e.pointerId);
  joy.active=true; setJoyFrom(e.clientX,e.clientY);
});
stick.addEventListener('pointermove', e=>{ if(joy.active) setJoyFrom(e.clientX,e.clientY); });
function endJoy(){ joy.active=false; joy.x=0; joy.y=0; knob.style.transform=''; }
stick.addEventListener('pointerup', endJoy);
stick.addEventListener('pointercancel', endJoy);

goBtn.onclick = ()=>{
  if (state==='clear'){
    goToClaim('clear');
    return;
  }
  if (state==='win'){
    if (level < LEVELS.length-1){ level++; startGame(); }
    else goToClaim('clear');
    return;
  }
  startGame(state==='title' ? 'fresh' : 'retry');
};
howBtn.onclick = ()=>{
  copyEl.textContent = 'Move with WASD or arrows, or click / tap where you want to run. On a phone, drag the disc in the corner. Bushes break a tic\u2019s line. If one latches on you get slower \u2014 reach your human and they run a circle that flings every tic off. Ten yards. Yard 1 has 8 tics, then one more each yard. Beat all ten to claim.';
};

resize();
spawnLevel(0);
state='title';
(function bootFromQuery(){
  const q = new URLSearchParams(location.search);
  const wantPlay = /(?:^|[?&])play(?:&=|$)/.test(location.search) || q.has('play');
  const wantLevel = Number(q.get('level')||0);
  if (wantLevel >= 1 && wantLevel <= LEVELS.length){
    level = wantLevel - 1;
    startGame();
    return;
  }
  if (wantPlay) startGame('fresh');
})();
requestAnimationFrame(loop);
