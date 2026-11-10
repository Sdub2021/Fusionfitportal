function drawGrass(){
  const lampPct = timeMax ? Math.max(0.15, timeLeft / timeMax) : 1;
  ctx.fillStyle = '#1a1612';
  ctx.fillRect(0,0,W,H);
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
  const shirt = '#4a9ee0';
  const pants = '#2a4080';
  const ink = '#000';

  function inked(fn, fill){
    ctx.beginPath();
    fn();
    ctx.fillStyle = fill;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.4;
    ctx.fill();
    ctx.stroke();
  }

  inked(function(){ ctx.roundRect(-9, 16+L*0.04, 8, 18, 2); }, pants);
  inked(function(){ ctx.roundRect(1, 16+R*0.04, 8, 18, 2); }, pants);
  inked(function(){ ctx.ellipse(-5, 34+L*0.04, 5.2, 2.6, -0.1, 0, Math.PI*2); }, '#5a3010');
  inked(function(){ ctx.ellipse(5, 34+R*0.04, 5.2, 2.6, 0.1, 0, Math.PI*2); }, '#5a3010');

  inked(function(){ ctx.roundRect(-13, -8, 26, 24, 3); }, shirt);

  const drop = state==='rescue' ? 5 : 0;
  ctx.strokeStyle = shirt;
  ctx.lineWidth = 6.5;
  ctx.beginPath(); ctx.moveTo(-11,2); ctx.lineTo(-21, 10+L+drop); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(11,2); ctx.lineTo(21, 9+R+drop); ctx.stroke();
  ctx.strokeStyle = ink; ctx.lineWidth = 2.6;
  ctx.beginPath(); ctx.moveTo(-11,2); ctx.lineTo(-21, 10+L+drop); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(11,2); ctx.lineTo(21, 9+R+drop); ctx.stroke();
  inked(function(){ ctx.arc(-21.5, 11+L+drop, 3.5, 0, Math.PI*2); }, skin);
  inked(function(){ ctx.arc(21.5, 10+R+drop, 3.5, 0, Math.PI*2); }, skin);

  inked(function(){ ctx.roundRect(-4, -16, 8, 9, 1); }, skin);

  inked(function(){ ctx.ellipse(0, -26, 12, 14, 0, 0, Math.PI*2); }, skin);

  inked(function(){
    ctx.moveTo(-10, -28);
    ctx.quadraticCurveTo(-18, -48, -2, -48);
    ctx.quadraticCurveTo(5, -54, 10, -47);
    ctx.quadraticCurveTo(18, -45, 13, -26);
    ctx.quadraticCurveTo(9, -24, 4, -28);
    ctx.quadraticCurveTo(-7, -32, -9, -26);
    ctx.closePath();
  }, hair);
  ctx.fillStyle = hair;
  ctx.beginPath(); ctx.ellipse(-8, -24, 3.8, 5.5, -0.4, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(8.2, -23.5, 3.5, 5, 0.35, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-1, -48, 5, 3.5, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(5.5, -49, 4, 3, 0.2, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(1, -52, 2.8, 2.2, 0, 0, Math.PI*2); ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.ellipse(-4.5, -27.5, 3.5, 2, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(4.5, -27.5, 3.5, 2, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = ink;
  ctx.beginPath(); ctx.ellipse(-4.2, -27.2, 1.2, 1.5, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(4.8, -27.2, 1.2, 1.5, 0, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = ink; ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-8, -28.5); ctx.quadraticCurveTo(-4.5, -30.5, -1, -28);
  ctx.moveTo(1.5, -28.5); ctx.quadraticCurveTo(4.5, -30.5, 8, -28);
  ctx.stroke();

  ctx.fillStyle = '#e8b898';
  ctx.beginPath(); ctx.ellipse(0.5, -22.5, 3, 3.2, 0, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = ink; ctx.lineWidth = 1.7;
  ctx.beginPath(); ctx.arc(0.6, -21, 2.7, 0.2, Math.PI-0.1); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -19, 3.4, 0.2, Math.PI-0.2); ctx.stroke();

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

  const orange = '#ff7f00';
  const muzzle = '#ffe8c8';
  const ink = '#000';
  const black = '#111';

  function blob(fn, fill){
    ctx.beginPath();
    fn();
    ctx.fillStyle = fill;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 4.2;
    ctx.fill();
    ctx.stroke();
  }

  ctx.strokeStyle = orange;
  ctx.lineWidth = 11;
  ctx.beginPath();
  ctx.moveTo(-20, 8);
  ctx.quadraticCurveTo(-46, 16, -42, -6);
  ctx.quadraticCurveTo(-38, -22, -20, -16);
  ctx.stroke();
  ctx.strokeStyle = black;
  ctx.lineWidth = 4.5;
  ctx.stroke();
  ctx.fillStyle = black;
  ctx.beginPath(); ctx.moveTo(-40, -2); ctx.lineTo(-48, -8); ctx.lineTo(-36, -4); ctx.closePath(); ctx.fill();

  blob(function(){ ctx.ellipse(-13, 18+step*0.05, 8, 4.5, -0.1, 0, Math.PI*2); }, orange);
  blob(function(){ ctx.ellipse(11, 18.5-step*0.05, 8, 4.5, 0.08, 0, Math.PI*2); }, orange);

  blob(function(){ ctx.ellipse(0, 6, 26, 17, 0, 0, Math.PI*2); }, orange);

  ctx.fillStyle = black;
  ctx.beginPath();
  ctx.moveTo(-16, 2); ctx.quadraticCurveTo(-8, 10, -15, 14); ctx.quadraticCurveTo(-10, 6, -16, 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-4, -1); ctx.quadraticCurveTo(9, 9, 3, 16); ctx.quadraticCurveTo(6, 5, -4, -1);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(11, 1); ctx.quadraticCurveTo(19, 9, 13, 15); ctx.quadraticCurveTo(16, 6, 11, 1);
  ctx.fill();

  ctx.fillStyle = muzzle;
  ctx.beginPath(); ctx.ellipse(4, 9, 12, 10, 0, 0, Math.PI*2); ctx.fill();

  blob(function(){ ctx.ellipse(12, -6, 18, 17, 0, 0, Math.PI*2); }, orange);

  ctx.fillStyle = black;
  ctx.beginPath();
  ctx.moveTo(6, -12); ctx.quadraticCurveTo(10, -4, 7, 2); ctx.quadraticCurveTo(11, -8, 6, -12);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(14, -14); ctx.quadraticCurveTo(17, -4, 14, 2); ctx.quadraticCurveTo(18, -9, 14, -14);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(20, -12); ctx.quadraticCurveTo(22, -4, 19, 1); ctx.quadraticCurveTo(23, -8, 20, -12);
  ctx.fill();

  blob(function(){ ctx.moveTo(5, -12); ctx.lineTo(7, -30); ctx.lineTo(13, -10); ctx.closePath(); }, orange);
  blob(function(){ ctx.moveTo(16, -13); ctx.lineTo(19, -31); ctx.lineTo(24, -10); ctx.closePath(); }, orange);
  ctx.fillStyle = '#f5a0b0';
  ctx.beginPath(); ctx.moveTo(6.5, -12); ctx.lineTo(7.5, -26); ctx.lineTo(11, -10.5); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(17.5, -12.5); ctx.lineTo(19, -27); ctx.lineTo(21.5, -10.5); ctx.closePath(); ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.strokeStyle = ink; ctx.lineWidth = 2.8;
  ctx.beginPath(); ctx.ellipse(8, -5, 6, 3.4, -0.05, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(18, -5.2, 6, 3.4, 0.05, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = orange;
  ctx.beginPath(); ctx.ellipse(8, -6.8, 6.2, 2.1, -0.05, Math.PI, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(18, -7, 6.2, 2.1, 0.05, Math.PI, Math.PI*2); ctx.fill();
  ctx.strokeStyle = ink; ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(3, -6); ctx.quadraticCurveTo(8, -11, 13, -5);
  ctx.moveTo(13, -6); ctx.quadraticCurveTo(18, -11.2, 23, -5);
  ctx.stroke();
  ctx.fillStyle = black;
  ctx.beginPath(); ctx.ellipse(9, -4.2, 1.3, 2, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(19, -4.4, 1.3, 2, 0, 0, Math.PI*2); ctx.fill();
  if (cat.attached > 0){
    ctx.strokeStyle = black;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(4, -7.5); ctx.lineTo(11, -9);
    ctx.moveTo(15, -7.6); ctx.lineTo(22, -9.1);
    ctx.stroke();
  }

  ctx.fillStyle = muzzle;
  ctx.strokeStyle = ink; ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.ellipse(19, 3, 9, 6, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#e07090';
  ctx.beginPath(); ctx.moveTo(21, 1); ctx.lineTo(23.5, 3); ctx.lineTo(18.5, 3); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = ink; ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(21, 3); ctx.lineTo(21, 4.5);
  ctx.moveTo(21, 4.5); ctx.quadraticCurveTo(24, 6, 25.5, 4);
  ctx.stroke();
  ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(15, 3.5); ctx.lineTo(-2, 1);
  ctx.moveTo(15.2, 5.5); ctx.lineTo(-1.5, 6.5);
  ctx.moveTo(25, 4); ctx.lineTo(36, 1.5);
  ctx.moveTo(24.8, 5.2); ctx.lineTo(36, 5.5);
  ctx.stroke();

  ctx.restore();
}
