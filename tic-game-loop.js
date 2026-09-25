function drawDog(){
  if (!dog) return;
  const x = dog.x, y = dog.y;
  const bob = Math.sin(dog.phase * 8) * 1.1;
  const flip = dog.facing < 0 ? -1 : 1;
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.scale(flip, 1);
  ctx.fillStyle = 'rgba(0,0,0,.28)';
  ctx.beginPath(); ctx.ellipse(1, 16, 16, 5, 0, 0, Math.PI*2); ctx.fill();
  const tan = dog.coat === 'tan';
  const bodyA = tan ? '#c9a06a' : '#6a4a32';
  const bodyB = tan ? '#8a6238' : '#3a2818';
  const fur = ctx.createLinearGradient(-12, -8, 14, 10);
  fur.addColorStop(0, bodyA);
  fur.addColorStop(1, bodyB);
  ctx.fillStyle = fur;
  ctx.beginPath(); ctx.ellipse(0, 2, 16, 10, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = bodyB;
  ctx.beginPath(); ctx.ellipse(-8, 10, 3.2, 4.4, 0.15, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(6, 10.4, 3.1, 4.2, -0.1, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = bodyA;
  ctx.lineWidth = 3.4; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-14, 2);
  ctx.quadraticCurveTo(-22, -4 + Math.sin(dog.phase*6)*2, -18, 8);
  ctx.stroke();
  ctx.fillStyle = bodyA;
  ctx.beginPath(); ctx.ellipse(12, -1, 7.4, 6.2, 0.2, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#3a2414';
  ctx.beginPath(); ctx.ellipse(12.6, -6.8, 3.4, 4.6, 0.4, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(16.4, -5.2, 2.2, 3.6, 0.6, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#e8d2b0';
  ctx.beginPath(); ctx.ellipse(16.8, 1.4, 3.2, 2.4, 0.3, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#1a120c';
  ctx.beginPath(); ctx.arc(18.6, 1.2, 0.9, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#2a1a10';
  ctx.beginPath(); ctx.ellipse(14.6, -1.4, 1.1, 1.3, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(14.3, -1.8, 0.35, 0, Math.PI*2); ctx.fill();
  ctx.restore();
  const riding = Math.max(0, dog.onboard);
  for (let i=0;i<riding;i++){
    const a = dog.phase * 2.2 + i * 0.9;
    const fx = dog.x + Math.cos(a) * (10 + (i%3));
    const fy = dog.y + Math.sin(a * 1.3) * 6 - 4;
    ctx.fillStyle = i % 2 ? '#4a2814' : '#2a1810';
    ctx.beginPath(); ctx.ellipse(fx, fy, 2.1, 1.4, a, 0, Math.PI*2); ctx.fill();
  }
  ctx.fillStyle = 'rgba(232,165,75,.85)';
  ctx.font = '500 11px Outfit,sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('park dog', x, y - 28);
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
  copyEl.textContent = 'Move with WASD or arrows, or click / tap where you want to run. On a phone, drag the disc in the corner. Each level is Dog Park 1, then 2, then 3. A park dog sheds two fleas every level \u2014 they hop after they fall. Bushes break a line. If a tic or flea latches on you get slower. Reach your human and they fling every pest off. Ten parks. Beat all ten to claim.';
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
