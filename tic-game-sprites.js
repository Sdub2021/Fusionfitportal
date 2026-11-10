function drawGrass(){
  const lampPct = timeMax ? Math.max(0.15, timeLeft / timeMax) : 1;
  ctx.fillStyle = '#1a1612';
  ctx.fillRect(0,0,W,H);
  // Subtle comic paper texture
  ctx.fillStyle = 'rgba(255,248,220,.03)';
  for (let i=0;i<40;i++){
    const x = (i*73 + 20) % W;
    const y = (i*41 + 15) % H;
    ctx.fillRect(x, y, 2, 2);
  }
  ctx.fillStyle = '#221c14';
  for (let i=0;i<28;i++){
    const x = (i*97 + 40) % W;
    const y = (i*53 + 20) % H;
    ctx.globalAlpha = 0.28;
    ctx.beginPath(); ctx.ellipse(x,y,40,16,0.2,0,Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  const lampX = human ? human.x : W-70;
  const lampY = human ? human.y : H*0.48;
  const g = ctx.createRadialGradient(lampX, lampY, 10, lampX, lampY, 180 + lampPct*80);
  g.addColorStop(0, 'rgba(255,200,80,' + (0.18 * lampPct) + ')');
  g.addColorStop(0.5, 'rgba(255,180,60,' + (0.06 * lampPct) + ')');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,W,H);
  if (!window._amb) window._amb = [];
  if (window._amb.length < 18 && Math.random() < 0.04){
    window._amb.push({x:rand(0,W), y:rand(0,H), vx:rand(-12,12), vy:rand(-6,4), life:rand(4,9), c: Math.random()>0.6 ? '#c9a06a' : '#6a4a32'});
  }
  window._amb = window._amb.filter(p=>{
    p.life -= 0.016; p.x += p.vx*0.016; p.y += p.vy*0.016;
    if (p.life>0 && p.x>0 && p.x<W && p.y>0 && p.y<H){
      ctx.globalAlpha = Math.min(0.45, p.life*0.08);
      ctx.fillStyle = p.c;
      ctx.beginPath(); ctx.ellipse(p.x, p.y, 3, 1.4, p.life, 0, Math.PI*2); ctx.fill();
      return true;
    }
    return false;
  });
  ctx.globalAlpha = 1;
  if (state==='rescue' && cat){
    ctx.strokeStyle = 'rgba(255,200,80,.28)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6,8]);
    ctx.beginPath();
    ctx.ellipse(cat.x, cat.y, 36, 36*0.74, 0, 0, Math.PI*2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function drawBush(b){
  ctx.fillStyle = '#2d3a22';
  ctx.beginPath();
  ctx.roundRect(b.x, b.y, b.w, b.h, 16);
  ctx.fill();
  ctx.strokeStyle = '#1a2010';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.fillStyle = '#3d4e2c';
  ctx.beginPath();
  ctx.ellipse(b.x+b.w*0.35, b.y+8, b.w*0.38, 12, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.stroke();
}

function drawHuman(){
  const x=human.x, y=human.y;
  const run = state==='rescue' ? (rescue?rescue.t:0) : 0;
  const walk = state==='play' ? (performance.now()/220) : run*10;
  const L = Math.sin(walk)*3.5;
  const R = Math.sin(walk+Math.PI)*3.5;
  ctx.save();
  ctx.translate(x, y);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  const skin = '#ffd8b0';
  const hair = '#c87830';
  const shirt = '#5ab0e8';
  const pants = '#304890';
  const ink = '#000';

  function inked(fn, fill){
    ctx.beginPath();
    fn();
    ctx.fillStyle = fill;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.2;
    ctx.fill();
    ctx.stroke();
  }

  inked(function(){ ctx.roundRect(-9, 16+L*0.04, 8, 18, 2); }, pants);
  inked(function(){ ctx.roundRect(1, 16+R*0.04, 8, 18, 2); }, pants);
  inked(function(){ ctx.ellipse(-5, 34+L*0.04, 5.2, 2.6, -0.1, 0, Math.PI*2); }, '#5a3010');
  inked(function(){ ctx.ellipse(5, 34+R*0.04, 5.2, 2.6, 0.1, 0, Math.PI*2); }, '#5a3010');

  inked(function(){ ctx.roundRect(-13, -10, 26, 26, 3); }, shirt);

  const drop = state==='rescue' ? 5 : 0;
  ctx.strokeStyle = shirt;
  ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(-11,0); ctx.lineTo(-20, 8+L+drop); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(11,0); ctx.lineTo(20, 7+R+drop); ctx.stroke();
  ctx.strokeStyle = ink; ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.moveTo(-11,0); ctx.lineTo(-20, 8+L+drop); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(11,0); ctx.lineTo(20, 7+R+drop); ctx.stroke();
  inked(function(){ ctx.arc(-20.5, 9+L+drop, 3.4, 0, Math.PI*2); }, skin);
  inked(function(){ ctx.arc(20.5, 8+R+drop, 3.4, 0, Math.PI*2); }, skin);

  inked(function(){ ctx.roundRect(-3.5, -18, 7, 9, 1); }, skin);

  inked(function(){ ctx.ellipse(0, -28, 11, 13, 0, 0, Math.PI*2); }, skin);

  // Hair
  inked(function(){
    ctx.moveTo(-9, -30);
    ctx.quadraticCurveTo(-16, -46, -1, -46);
    ctx.quadraticCurveTo(4, -52, 9, -45);
    ctx.quadraticCurveTo(16, -43, 12, -28);
    ctx.quadraticCurveTo(8, -26, 3, -30);
    ctx.quadraticCurveTo(-6, -34, -8, -28);
    ctx.closePath();
  }, hair);
  ctx.fillStyle = hair;
  ctx.beginPath(); ctx.ellipse(-7.5, -26, 3.5, 5, -0.4, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(7.8, -25.5, 3.2, 4.5, 0.35, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-1, -46, 4.5, 3.2, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(5, -47, 3.6, 2.8, 0.2, 0, Math.PI*2); ctx.fill();

  // Eyes
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.ellipse(-4.2, -29.5, 3.2, 1.8, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(4.2, -29.5, 3.2, 1.8, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = ink;
  ctx.beginPath(); ctx.ellipse(-4, -29.2, 1.1, 1.4, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(4.4, -29.2, 1.1, 1.4, 0, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = ink; ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(-7.2, -30.5); ctx.quadraticCurveTo(-4.2, -32.5, -1.2, -30);
  ctx.moveTo(1.5, -30.5); ctx.quadraticCurveTo(4.5, -32.5, 7.5, -30);
  ctx.stroke();

  ctx.fillStyle = '#e8b898';
  ctx.beginPath(); ctx.ellipse(0.5, -24.5, 2.8, 3, 0, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = ink; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(0.6, -23, 2.5, 0.2, Math.PI-0.1); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -21, 3.2, 0.2, Math.PI-0.2); ctx.stroke();

  ctx.restore();
}

function drawCat(){
  const x=cat.x, y=cat.y;
  const spd = Math.hypot(cat.vx||0, cat.vy||0);
  const bob = Math.sin(performance.now()/160) * Math.min(1, spd/130);
  const step = Math.sin(performance.now()/150) * Math.min(1.8, spd/90);
  ctx.save();
  ctx.translate(x, y+bob);
  const flip = cat.vx < -8 ? -1 : 1;
  ctx.scale(flip, 1);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  const orange = '#ff7a00';
  const muzzle = '#ffe4b0';
  const ink = '#000';
  const black = '#111';

  function blob(fn, fill){
    ctx.beginPath();
    fn();
    ctx.fillStyle = fill;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.8;
    ctx.fill();
    ctx.stroke();
  }

  // Tail
  ctx.strokeStyle = orange;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(-18, 6);
  ctx.quadraticCurveTo(-42, 14, -38, -4);
  ctx.quadraticCurveTo(-34, -20, -18, -14);
  ctx.stroke();
  ctx.strokeStyle = black;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = black;
  ctx.beginPath(); ctx.moveTo(-36, 0); ctx.lineTo(-42, -6); ctx.lineTo(-32, -2); ctx.closePath(); ctx.fill();

  blob(function(){ ctx.ellipse(-12, 17+step*0.06, 7.5, 4.2, -0.08, 0, Math.PI*2); }, orange);
  blob(function(){ ctx.ellipse(10, 17.5-step*0.06, 7.5, 4.2, 0.06, 0, Math.PI*2); }, orange);

  blob(function(){ ctx.ellipse(0, 5, 24, 16, 0, 0, Math.PI*2); }, orange);

  // Stronger stripes
  ctx.fillStyle = black;
  ctx.beginPath();
  ctx.moveTo(-15, 1); ctx.quadraticCurveTo(-7, 9, -14, 13); ctx.quadraticCurveTo(-9, 5, -15, 1);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-4, -2); ctx.quadraticCurveTo(8, 8, 2, 15); ctx.quadraticCurveTo(5, 4, -4, -2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(10, 0); ctx.quadraticCurveTo(18, 8, 12, 14); ctx.quadraticCurveTo(15, 5, 10, 0);
  ctx.fill();

  ctx.fillStyle = muzzle;
  ctx.beginPath(); ctx.ellipse(3, 8, 11, 9, 0, 0, Math.PI*2); ctx.fill();

  blob(function(){ ctx.ellipse(10, -8, 16, 15.5, 0, 0, Math.PI*2); }, orange);

  ctx.fillStyle = black;
  ctx.beginPath();
  ctx.moveTo(5, -14); ctx.quadraticCurveTo(9, -6, 6, 0); ctx.quadraticCurveTo(10, -10, 5, -14);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(13, -16); ctx.quadraticCurveTo(16, -6, 13, 0); ctx.quadraticCurveTo(17, -11, 13, -16);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(19, -14); ctx.quadraticCurveTo(21, -6, 18, -1); ctx.quadraticCurveTo(22, -10, 19, -14);
  ctx.fill();

  blob(function(){ ctx.moveTo(4, -14); ctx.lineTo(6, -28); ctx.lineTo(12, -12); ctx.closePath(); }, orange);
  blob(function(){ ctx.moveTo(15, -15); ctx.lineTo(18, -29); ctx.lineTo(23, -12); ctx.closePath(); }, orange);
  ctx.fillStyle = '#f5a0b0';
  ctx.beginPath(); ctx.moveTo(5.5, -14); ctx.lineTo(6.5, -24); ctx.lineTo(10, -12.5); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(16.5, -14.5); ctx.lineTo(18, -25); ctx.lineTo(20.5, -12.5); ctx.closePath(); ctx.fill();

  // Eyes
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = ink; ctx.lineWidth = 2.6;
  ctx.beginPath(); ctx.ellipse(7, -7, 5.5, 3.2, -0.04, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(17, -7.2, 5.5, 3.2, 0.04, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = orange;
  ctx.beginPath(); ctx.ellipse(7, -8.5, 5.6, 1.9, -0.04, Math.PI, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(17, -8.7, 5.6, 1.9, 0.04, Math.PI, Math.PI*2); ctx.fill();
  ctx.strokeStyle = ink; ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(2.5, -8); ctx.quadraticCurveTo(7, -12.5, 11.5, -7);
  ctx.moveTo(12.5, -8); ctx.quadraticCurveTo(17, -12.8, 21.5, -7);
  ctx.stroke();
  ctx.fillStyle = black;
  ctx.beginPath(); ctx.ellipse(7.8, -6.2, 1.2, 1.8, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(17.8, -6.4, 1.2, 1.8, 0, 0, Math.PI*2); ctx.fill();
  if (cat.attached > 0){
    ctx.strokeStyle = black;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(3.5, -9.5); ctx.lineTo(10, -11);
    ctx.moveTo(14, -9.6); ctx.lineTo(20.5, -11.1);
    ctx.stroke();
  }

  ctx.fillStyle = muzzle;
  ctx.strokeStyle = ink; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(17, 1, 8, 5.5, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#e07090';
  ctx.beginPath(); ctx.moveTo(19, -0.5); ctx.lineTo(21.5, 1.5); ctx.lineTo(16.5, 1.5); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = ink; ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(19, 1.5); ctx.lineTo(19, 3);
  ctx.moveTo(19, 3); ctx.quadraticCurveTo(22, 4.5, 23.5, 2.5);
  ctx.stroke();
  ctx.strokeStyle = '#ccc'; ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(14, 1.5); ctx.lineTo(-1, -1);
  ctx.moveTo(14.2, 3.5); ctx.lineTo(-0.5, 4.5);
  ctx.moveTo(23, 2); ctx.lineTo(34, -0.5);
  ctx.moveTo(22.8, 3.2); ctx.lineTo(34, 3.5);
  ctx.stroke();

  ctx.restore();
}
