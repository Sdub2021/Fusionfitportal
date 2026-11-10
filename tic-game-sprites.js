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
  ctx.fillStyle = 'rgba(8,6,4,.35)';
  ctx.beginPath(); ctx.ellipse(0, 38, 14, 4, 0, 0, Math.PI*2); ctx.fill();

  const skin = '#ffd4a8';
  const hair = '#c07030';
  const shirt = '#4aa0e0';
  const pants = '#2a4080';
  const ink = '#000';

  function inked(fn, fill){
    ctx.beginPath();
    fn();
    ctx.fillStyle = fill;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.4;
    ctx.fill();
    ctx.stroke();
  }

  inked(function(){ ctx.roundRect(-8, 14+L*0.04, 7, 18, 2); }, pants);
  inked(function(){ ctx.roundRect(1, 14+R*0.04, 7, 18, 2); }, pants);
  inked(function(){ ctx.ellipse(-4.5, 32+L*0.04, 5, 2.4, -0.1, 0, Math.PI*2); }, '#5a3010');
  inked(function(){ ctx.ellipse(4.5, 32+R*0.04, 5, 2.4, 0.1, 0, Math.PI*2); }, '#5a3010');

  inked(function(){ ctx.roundRect(-12, -12, 24, 26, 3); }, shirt);

  const drop = state==='rescue' ? 5 : 0;
  ctx.strokeStyle = shirt;
  ctx.lineWidth = 5.5;
  ctx.beginPath(); ctx.moveTo(-10,-2); ctx.lineTo(-18, 6+L+drop); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(10,-2); ctx.lineTo(18, 5+R+drop); ctx.stroke();
  ctx.strokeStyle = ink; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-10,-2); ctx.lineTo(-18, 6+L+drop); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(10,-2); ctx.lineTo(18, 5+R+drop); ctx.stroke();
  inked(function(){ ctx.arc(-18.5, 7+L+drop, 3.2, 0, Math.PI*2); }, skin);
  inked(function(){ ctx.arc(18.5, 6+R+drop, 3.2, 0, Math.PI*2); }, skin);

  ctx.fillStyle = skin;
  ctx.strokeStyle = ink; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.roundRect(-3, -20, 6, 8, 1); ctx.fill(); ctx.stroke();

  inked(function(){ ctx.ellipse(0, -30, 10, 12, 0, 0, Math.PI*2); }, skin);

  // Ears
  ctx.fillStyle = skin;
  ctx.strokeStyle = ink; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(-9, -28, 2.4, 3, -0.3, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(9, -27.5, 2.2, 2.8, 0.3, 0, Math.PI*2); ctx.fill(); ctx.stroke();

  // Hair – more Jon-like brown waves
  inked(function(){
    ctx.moveTo(-8, -32);
    ctx.quadraticCurveTo(-14, -44, -2, -44);
    ctx.quadraticCurveTo(3, -50, 8, -43);
    ctx.quadraticCurveTo(14, -42, 11, -30);
    ctx.quadraticCurveTo(7, -28, 3, -32);
    ctx.quadraticCurveTo(-5, -36, -7, -30);
    ctx.closePath();
  }, hair);
  ctx.fillStyle = hair;
  ctx.beginPath(); ctx.ellipse(-7, -28, 3.2, 4.5, -0.4, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(7.2, -27.5, 3, 4, 0.35, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-1, -44, 4.2, 3, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(4.8, -45, 3.4, 2.6, 0.2, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, -48, 2.6, 2, 0, 0, Math.PI*2); ctx.fill();

  // Eyes – classic half-lidded comic style
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.ellipse(-3.8, -31.5, 3, 1.6, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(3.8, -31.5, 3, 1.6, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = ink;
  ctx.beginPath(); ctx.ellipse(-3.6, -31.2, 1, 1.3, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(4, -31.2, 1, 1.3, 0, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = ink; ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-6.5, -32.5); ctx.quadraticCurveTo(-3.8, -34.2, -1, -32);
  ctx.moveTo(1.2, -32.5); ctx.quadraticCurveTo(3.8, -34.2, 6.5, -32);
  ctx.stroke();

  // Nose & mouth
  ctx.fillStyle = '#e8b090';
  ctx.beginPath(); ctx.ellipse(0.5, -26.5, 2.6, 2.8, 0, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = ink; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(0.6, -25, 2.3, 0.2, Math.PI-0.1); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -23, 3, 0.2, Math.PI-0.2); ctx.stroke();

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
  ctx.fillStyle = 'rgba(0,0,0,.3)';
  ctx.beginPath(); ctx.ellipse(0, 26, 24, 5.5, 0, 0, Math.PI*2); ctx.fill();

  const orange = '#ff7f00';
  const muzzle = '#ffe8c0';
  const ink = '#000';
  const black = '#111';

  function blob(fn, fill){
    ctx.beginPath();
    fn();
    ctx.fillStyle = fill;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3;
    ctx.fill();
    ctx.stroke();
  }

  // Tail – thicker, more curved classic style
  ctx.strokeStyle = orange;
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(-16, 6);
  ctx.quadraticCurveTo(-38, 12, -34, -2);
  ctx.quadraticCurveTo(-30, -18, -16, -12);
  ctx.stroke();
  ctx.strokeStyle = black;
  ctx.lineWidth = 3.5;
  ctx.stroke();
  ctx.fillStyle = black;
  ctx.beginPath(); ctx.moveTo(-32, 1); ctx.lineTo(-38, -5); ctx.lineTo(-28, -1); ctx.closePath(); ctx.fill();

  // Feet
  blob(function(){ ctx.ellipse(-11, 16+step*0.06, 7, 4, -0.08, 0, Math.PI*2); }, orange);
  blob(function(){ ctx.ellipse(9, 16.5-step*0.06, 7, 4, 0.06, 0, Math.PI*2); }, orange);

  // Body – fatter, more classic oval
  blob(function(){ ctx.ellipse(0, 4, 22, 15, 0, 0, Math.PI*2); }, orange);

  // Classic black stripes on body
  ctx.fillStyle = black;
  ctx.beginPath();
  ctx.moveTo(-14, 0); ctx.quadraticCurveTo(-6, 8, -13, 12); ctx.quadraticCurveTo(-8, 4, -14, 0);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-3, -3); ctx.quadraticCurveTo(7, 7, 1, 14); ctx.quadraticCurveTo(4, 3, -3, -3);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(9, -1); ctx.quadraticCurveTo(17, 7, 11, 13); ctx.quadraticCurveTo(14, 4, 9, -1);
  ctx.fill();

  // Belly highlight
  ctx.fillStyle = muzzle;
  ctx.beginPath(); ctx.ellipse(2, 7, 10, 8, 0, 0, Math.PI*2); ctx.fill();

  // Head – larger, rounder
  blob(function(){ ctx.ellipse(9, -10, 15, 14.5, 0, 0, Math.PI*2); }, orange);

  // Head stripes
  ctx.fillStyle = black;
  ctx.beginPath();
  ctx.moveTo(4, -16); ctx.quadraticCurveTo(8, -8, 5, -2); ctx.quadraticCurveTo(9, -12, 4, -16);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(12, -18); ctx.quadraticCurveTo(15, -8, 12, -2); ctx.quadraticCurveTo(16, -13, 12, -18);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(18, -16); ctx.quadraticCurveTo(20, -8, 17, -3); ctx.quadraticCurveTo(21, -12, 18, -16);
  ctx.fill();

  // Ears with pink insides
  blob(function(){ ctx.moveTo(3, -16); ctx.lineTo(5, -28); ctx.lineTo(11, -14); ctx.closePath(); }, orange);
  blob(function(){ ctx.moveTo(14, -17); ctx.lineTo(17, -29); ctx.lineTo(22, -14); ctx.closePath(); }, orange);
  ctx.fillStyle = '#f5a0b0';
  ctx.beginPath(); ctx.moveTo(4.5, -16); ctx.lineTo(5.5, -24); ctx.lineTo(9, -14.5); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(15.5, -16.5); ctx.lineTo(17, -25); ctx.lineTo(19.5, -14.5); ctx.closePath(); ctx.fill();

  // Classic half-closed eyes
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = ink; ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.ellipse(6, -9, 5, 3, -0.04, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(16, -9.2, 5, 3, 0.04, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  // Heavy upper lids
  ctx.fillStyle = orange;
  ctx.beginPath(); ctx.ellipse(6, -10.5, 5.2, 1.8, -0.04, Math.PI, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(16, -10.7, 5.2, 1.8, 0.04, Math.PI, Math.PI*2); ctx.fill();
  ctx.strokeStyle = ink; ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(2, -10); ctx.quadraticCurveTo(6, -14, 10, -9);
  ctx.moveTo(12, -10); ctx.quadraticCurveTo(16, -14.2, 20, -9);
  ctx.stroke();
  // Pupils
  ctx.fillStyle = black;
  ctx.beginPath(); ctx.ellipse(6.8, -8.2, 1.1, 1.7, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(16.8, -8.4, 1.1, 1.7, 0, 0, Math.PI*2); ctx.fill();
  // Annoyed brows if pests attached
  if (cat.attached > 0){
    ctx.strokeStyle = black;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(3, -11.5); ctx.lineTo(9, -13);
    ctx.moveTo(13, -11.6); ctx.lineTo(19, -13.1);
    ctx.stroke();
  }

  // Muzzle
  ctx.fillStyle = muzzle;
  ctx.strokeStyle = ink; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.ellipse(16, -1, 7.5, 5.2, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  // Pink nose
  ctx.fillStyle = '#e07090';
  ctx.beginPath(); ctx.moveTo(18, -2.5); ctx.lineTo(20.5, -0.5); ctx.lineTo(15.5, -0.5); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = ink; ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(18, -0.5); ctx.lineTo(18, 1);
  ctx.moveTo(18, 1); ctx.quadraticCurveTo(21, 2.5, 22.5, 0.5);
  ctx.stroke();
  // Whiskers
  ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(13, -0.5); ctx.lineTo(-1, -3);
  ctx.moveTo(13.2, 1.5); ctx.lineTo(-0.5, 2.5);
  ctx.moveTo(22, 0); ctx.lineTo(33, -2.5);
  ctx.moveTo(21.8, 1.2); ctx.lineTo(33, 1.5);
  ctx.stroke();

  ctx.restore();
}
