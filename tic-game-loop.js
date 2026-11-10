function drawDog(){
  if (!dog) return;
  const x = dog.x, y = dog.y;
  const bob = Math.sin(dog.phase * 7) * 1.4;
  const flip = dog.facing < 0 ? -1 : 1;
  const tongueWag = Math.sin(performance.now()/180) * 3;
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.scale(flip, 1);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.fillStyle = 'rgba(0,0,0,.28)';
  ctx.beginPath(); ctx.ellipse(2, 18, 18, 5, 0, 0, Math.PI*2); ctx.fill();

  const yellow = '#f5d76e';
  const yellowDark = '#e6c45a';
  const ink = '#000';

  function blob(fn, fill){
    ctx.beginPath();
    fn();
    ctx.fillStyle = fill;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.8;
    ctx.fill();
    ctx.stroke();
  }

  blob(function(){ ctx.ellipse(0, 3, 18, 11, 0, 0, Math.PI*2); }, yellow);
  blob(function(){ ctx.ellipse(-9, 12, 3.6, 4.8, 0.1, 0, Math.PI*2); }, yellow);
  blob(function(){ ctx.ellipse(7, 12.2, 3.5, 4.6, -0.08, 0, Math.PI*2); }, yellow);

  ctx.strokeStyle = yellow;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-16, 2);
  ctx.quadraticCurveTo(-26, -2 + Math.sin(dog.phase*5)*3, -22, 8);
  ctx.stroke();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.4;
  ctx.stroke();

  blob(function(){ ctx.ellipse(14, -2, 9, 8, 0.15, 0, Math.PI*2); }, yellow);
  blob(function(){ ctx.ellipse(10, -8, 4.2, 7, 0.5, 0, Math.PI*2); }, yellowDark);
  blob(function(){ ctx.ellipse(18, -6, 3.5, 6.2, 0.7, 0, Math.PI*2); }, yellowDark);

  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.ellipse(16, -2, 2.4, 2.8, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(20, -1.5, 2.2, 2.6, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = ink;
  ctx.beginPath(); ctx.ellipse(16.4, -1.6, 1, 1.2, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(20.4, -1.1, 0.9, 1.1, 0, 0, Math.PI*2); ctx.fill();

  ctx.fillStyle = '#1a120c';
  ctx.beginPath(); ctx.ellipse(22.5, 1.2, 1.8, 1.4, 0, 0, Math.PI*2); ctx.fill();

  ctx.fillStyle = '#e07090';
  ctx.beginPath();
  ctx.moveTo(21, 3);
  ctx.quadraticCurveTo(24 + tongueWag*0.3, 10, 22, 14);
  ctx.quadraticCurveTo(19, 12, 20, 3);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.4;
  ctx.stroke();

  ctx.restore();

  const riding = Math.max(0, dog.onboard);
  for (let i=0;i<riding;i++){
    const a = dog.phase * 2.2 + i * 0.9;
    const fx = dog.x + Math.cos(a) * (11 + (i%3));
    const fy = dog.y + Math.sin(a * 1.3) * 6 - 5;
    ctx.fillStyle = i % 2 ? '#4a2814' : '#2a1810';
    ctx.beginPath(); ctx.ellipse(fx, fy, 2.1, 1.4, a, 0, Math.PI*2); ctx.fill();
  }
}

let bubbles = [];

function say(who, text, dur){
  dur = dur || 2.2;
  let x = 80, y = 80;
  if (who === 'cat' && cat){ x = cat.x; y = cat.y - 28; }
  else if (who === 'jon' && human){ x = human.x; y = human.y - 32; }
  else if (who === 'odie' && dog){ x = dog.x; y = dog.y - 26; }
  else if (who === 'system'){ x = W*0.5; y = 40; }
  bubbles.push({x, y, text, life: dur, max: dur});
}

function updateBubbles(dt){
  bubbles = bubbles.filter(b => {
    b.life -= dt;
    return b.life > 0;
  });
}

function drawBubbles(){
  for (const b of bubbles){
    const alpha = Math.min(1, b.life * 2.5);
    const w = Math.max(70, b.text.length * 7.2);
    const h = 28;
    const bx = clamp(b.x - w/2, 8, W - w - 8);
    const by = clamp(b.y - h - 6, 8, H - h - 20);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.roundRect(bx, by, w, h, 10);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bx + w*0.45, by + h);
    ctx.lineTo(bx + w*0.55, by + h + 8);
    ctx.lineTo(bx + w*0.35, by + h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#000';
    ctx.font = '600 13px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(b.text, bx + w/2, by + h/2 + 1);
    ctx.restore();
  }
}

function drawTick(t){
  const angry = t.stuck && !t.flung;
  const limp = t.flung;
  const flea = t.kind === 'flea';
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
    body.addColorStop(0, flea ? '#c8a050' : '#e07055'); body.addColorStop(0.55, flea ? '#7a4a18' : '#a33222'); body.addColorStop(1, '#4a140e');
  } else if (limp){
    body.addColorStop(0, '#6a3a28'); body.addColorStop(1, '#2a1410');
  } else if (flea){
    body.addColorStop(0, '#5a3a18'); body.addColorStop(0.5, '#3a2410'); body.addColorStop(1, '#1a1008');
  } else {
    body.addColorStop(0, '#8a4a28'); body.addColorStop(0.5, '#5a2a18'); body.addColorStop(1, '#2a120c');
  }
  ctx.fillStyle = body;
  const bw = flea ? (angry?5.4:4.2) : (angry?8.2:6.6);
  const bh = flea ? (angry?3.6:2.8) : (angry?5.6:4.4);
  ctx.beginPath(); ctx.ellipse(0.6, 0, bw, bh, 0, 0, Math.PI*2); ctx.fill();
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
  if (dog) drawDog();
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
  drawBubbles();
  if (flash>0){
    ctx.fillStyle = 'rgba(180,40,20,' + (flash*0.35) + ')';
    ctx.fillRect(0,0,W,H);
  }
  ctx.restore();
  onEl.textContent = cat ? cat.attached : 0;
  if (fleasEl) fleasEl.textContent = fleasDropped;
  clockEl.textContent = fmtTime(timeLeft);
  const pct = timeMax ? timeLeft/timeMax : 0;
  timebar.style.transform = 'scaleX(' + clamp(pct,0,1) + ')';
  timebar.style.background = pct<0.25 ? 'linear-gradient(90deg,#c45a3a,#7a2018)' : 'linear-gradient(90deg,#e8a54b,#c45a3a)';
  if (cat && cat.dashCd !== undefined){
    ctx.save();
    ctx.fillStyle = cat.dashCd <= 0 ? 'rgba(232,165,75,.9)' : 'rgba(255,255,255,.25)';
    ctx.font = '500 12px Outfit,sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(cat.dashCd <= 0 ? 'DASH READY (space)' : 'DASH ' + cat.dashCd.toFixed(1)+'s', 16, H - 18);
    ctx.restore();
  }
}

function loop(t){
  const dt = Math.min(0.033, (t-last)/1000 || 0.016);
  last = t;
  update(dt);
  updateBubbles(dt);
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
  if (m < 0.18){ dx=0; dy=0; }
  else if (m>1){ dx/=m; dy/=m; }
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
  copyEl.textContent = 'Move with WASD or arrows, or click / tap where you want to run. On a phone, drag the disc in the corner. Press SPACE to dash (cooldown). Hide in bushes to slow the pests. Odie sheds fleas. If a tic latches on you get slower. Reach Jon and they fling every pest off. Ten parks. Beat all ten to claim.';
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
