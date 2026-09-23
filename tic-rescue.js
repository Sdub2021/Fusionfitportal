/* Overlay: human rubs tics off in a circular hand motion */
function handPos(ang, which){
  const a = ang + (which ? Math.PI : 0);
  return {
    x: cat.x + Math.cos(a) * 16,
    y: cat.y + Math.sin(a) * 12 - 2
  };
}

function beginRescue(){
  state = 'rescue';
  aim = null;
  if (joy){ joy.x = 0; joy.y = 0; }
  const stuck = ticks.filter(t => t.stuck);
  stuck.forEach((t, i) => {
    t.peelAt = (i + 0.15) / Math.max(1, stuck.length);
    t.flung = false;
  });
  rescue = {
    t: 0,
    dur: Math.max(3.2, 2.6 + stuck.length * 0.32),
    count: cat.attached,
    fromX: human.x,
    fromY: human.y,
    hand: 0,
    lastSpark: 0
  };
  burst(cat.x, cat.y, '#f3c27a');
}

function updateRescue(dt){
  rescue.t += dt;
  const p = Math.min(1, rescue.t / rescue.dur);
  rescue.hand += dt * 6.4;
  cat.vx = 0; cat.vy = 0;

  const settle = Math.min(1, rescue.t / 0.4);
  const ease = 1 - Math.pow(1 - settle, 3);
  human.x = rescue.fromX + (cat.x + 36 - rescue.fromX) * ease;
  human.y = rescue.fromY + (cat.y - 2 - rescue.fromY) * ease;
  human.facing = 0;

  const h1 = handPos(rescue.hand, 0);
  const h2 = handPos(rescue.hand, 1);
  rescue.h1 = h1; rescue.h2 = h2;

  rescue.lastSpark += dt;
  if (rescue.lastSpark > 0.04){
    rescue.lastSpark = 0;
    particles.push({x:h1.x,y:h1.y,vx:rand(-18,18),vy:rand(-28,6),life:rand(.3,.6),c:'#f3c27a'});
    particles.push({x:h2.x,y:h2.y,vx:rand(-18,18),vy:rand(-28,6),life:rand(.3,.6),c:'#e8a54b'});
  }

  for (const t of ticks){
    t.phase += dt * 14;
    if (t.stuck && !t.flung){
      t.orbit += dt * 9;
      t.x = cat.x + Math.cos(t.orbit) * (cat.r + 7);
      t.y = cat.y + Math.sin(t.orbit) * (cat.r * 0.7 + 4);
      const nearHand = Math.hypot(t.x-h1.x,t.y-h1.y) < 18 || Math.hypot(t.x-h2.x,t.y-h2.y) < 18;
      if (p >= t.peelAt && nearHand){
        t.flung = true;
        t.stuck = false;
        cat.attached = Math.max(0, cat.attached-1);
        const throwA = Math.atan2(t.y-cat.y, t.x-cat.x);
        t.vx = Math.cos(throwA) * rand(170, 250);
        t.vy = Math.sin(throwA) * rand(170, 250) - 50;
        burst(t.x, t.y, '#b44532');
        shake = 6;
      }
    } else if (t.flung){
      t.x += t.vx * dt;
      t.y += t.vy * dt;
      t.vx *= 0.985; t.vy *= 0.985;
    } else {
      const dx = t.x - cat.x, dy = t.y - cat.y;
      const d = Math.hypot(dx,dy) || 1;
      t.x += (dx/d) * 110 * dt;
      t.y += (dy/d) * 110 * dt;
    }
  }

  if (p > 0.9){
    ticks.filter(t => t.stuck).forEach(t => {
      t.flung = true; t.stuck = false;
      const throwA = rand(0, Math.PI*2);
      t.vx = Math.cos(throwA)*200; t.vy = Math.sin(throwA)*200;
    });
    cat.attached = 0;
  }

  particles = particles.filter(pt=>{
    pt.life -= dt; pt.x += pt.vx*dt; pt.y += pt.vy*dt; pt.vy += 80*dt;
    return pt.life>0;
  });
  shake *= 0.86;
  flash = Math.max(0, flash-dt);
  if (rescue.t >= rescue.dur) finishRescue();
}

function drawHands(){
  if (state!=='rescue' || !rescue || !rescue.h1) return;
  const pairs = [rescue.h1, rescue.h2];
  ctx.save();
  ctx.strokeStyle = 'rgba(232,165,75,.7)';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([4,5]);
  ctx.beginPath();
  ctx.ellipse(cat.x, cat.y-2, 16, 12, 0, 0, Math.PI*2);
  ctx.stroke();
  ctx.setLineDash([]);
  pairs.forEach((h, i) => {
    ctx.strokeStyle = 'rgba(217,196,160,.95)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(human.x - 6, human.y - 8);
    ctx.quadraticCurveTo((human.x + h.x)/2, Math.min(human.y, h.y) - 22, h.x, h.y);
    ctx.stroke();
    ctx.fillStyle = 'rgba(243,194,122,.35)';
    ctx.beginPath(); ctx.arc(h.x, h.y, 12, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = i ? '#e8a54b' : '#f6d48a';
    ctx.beginPath(); ctx.arc(h.x, h.y, 7, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#d7c4a0';
    ctx.beginPath(); ctx.arc(h.x, h.y, 4.4, 0, Math.PI*2); ctx.fill();
  });
  ctx.restore();
}

drawHuman = function(){
  const x=human.x, y=human.y;
  ctx.save();
  ctx.translate(x,y);
  ctx.fillStyle = 'rgba(243,194,122,.18)';
  ctx.beginPath(); ctx.ellipse(0,18,34,10,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#d7c4a0';
  ctx.beginPath(); ctx.arc(0,-22,8,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#c9a36a';
  ctx.fillRect(-7,-14,14,22);
  ctx.fillStyle = '#8a6a3e';
  ctx.fillRect(-8,8,7,16);
  ctx.fillRect(1,8,7,16);
  if (state!=='rescue'){
    ctx.fillStyle = '#d7c4a0';
    ctx.fillRect(-12, -8, 6, 12);
    ctx.fillRect(6, -8, 6, 12);
  }
  ctx.fillStyle = '#e8a54b';
  ctx.beginPath(); ctx.arc(10,-6,3.2,0,Math.PI*2); ctx.fill();
  ctx.restore();
  ctx.fillStyle = 'rgba(232,165,75,.95)';
  ctx.font = '500 13px Outfit,sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(state==='rescue' ? 'rubbing them off' : 'your human', x, y-44);
};

draw = function(){
  ctx.save();
  if (shake>0.4) ctx.translate(rand(-shake,shake), rand(-shake,shake));
  drawGrass();
  bushes.forEach(drawBush);
  if (human) drawHuman();
  ticks.filter(t=>t.stuck).forEach(drawTick);
  if (cat) drawCat();
  if (state==='rescue') drawHands();
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
};
