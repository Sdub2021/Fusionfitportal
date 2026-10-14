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
  const walk = state==='play' ? (performance.now()/220) : run*10;
  const L = Math.sin(walk)*5;
  const R = Math.sin(walk+Math.PI)*5;
  ctx.save();
  ctx.translate(x, y);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.fillStyle = 'rgba(8,6,4,.42)';
  ctx.beginPath(); ctx.ellipse(0, 32, 15, 4.4, 0, 0, Math.PI*2); ctx.fill();

  const skin = '#f6c9a4';
  const hair = '#8d4e24';
  const shirt = '#79c4ee';
  const shirtDk = '#4fa6dc';
  const pants = '#6b4630';
  const ink = '#1a120c';

  function inked(fn, fill){
    ctx.beginPath();
    fn();
    ctx.fillStyle = fill;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.85;
    ctx.fill();
    ctx.stroke();
  }

  inked(function(){ ctx.roundRect(-8.2, 8+L*0.06, 6.8, 19, 2.2); }, pants);
  inked(function(){ ctx.roundRect(1.5, 8+R*0.06, 6.8, 19, 2.2); }, pants);
  inked(function(){ ctx.ellipse(-4.7, 28+L*0.06, 5.3, 2.5, -0.08, 0, Math.PI*2); }, '#1c1612');
  inked(function(){ ctx.ellipse(5, 28+R*0.06, 5.3, 2.5, 0.08, 0, Math.PI*2); }, '#1c1612');

  inked(function(){ ctx.roundRect(-11.2, -18, 22.4, 28, 3.2); }, shirt);
  ctx.fillStyle = skin;
  ctx.fillRect(-3.1, -17.2, 6.2, 8);
  ctx.strokeStyle = ink; ctx.lineWidth = 1.45;
  ctx.strokeRect(-3.1, -17.2, 6.2, 8);
  ctx.beginPath(); ctx.moveTo(0,-17.2); ctx.lineTo(0, 8); ctx.stroke();
  ctx.fillStyle = shirtDk;
  ctx.beginPath(); ctx.moveTo(-11.2,-9); ctx.lineTo(-3.1,-17.2); ctx.lineTo(-3.1,-5); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(11.2,-9); ctx.lineTo(3.1,-17.2); ctx.lineTo(3.1,-5); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#f4efe4';
  ctx.beginPath(); ctx.arc(0, -5, 1.05, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(0, 1.4, 1.05, 0, Math.PI*2); ctx.fill();

  const drop = state==='rescue' ? 8 : 0;
  ctx.strokeStyle = shirt;
  ctx.lineWidth = 5.2;
  ctx.beginPath(); ctx.moveTo(-9,-7); ctx.lineTo(-17.5, 3+L+drop); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(9,-7); ctx.lineTo(17.5, 2+R+drop); ctx.stroke();
  ctx.strokeStyle = ink; ctx.lineWidth = 1.7;
  ctx.beginPath(); ctx.moveTo(-9,-7); ctx.lineTo(-17.5, 3+L+drop); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(9,-7); ctx.lineTo(17.5, 2+R+drop); ctx.stroke();
  inked(function(){ ctx.arc(-17.6, 4.4+L+drop, 3.15, 0, Math.PI*2); }, skin);
  inked(function(){ ctx.arc(17.6, 3.4+R+drop, 3.15, 0, Math.PI*2); }, skin);

  ctx.fillStyle = skin;
  ctx.strokeStyle = ink; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(-3.3, -26, 6.6, 10, 2); ctx.fill(); ctx.stroke();

  inked(function(){ ctx.ellipse(0, -36, 9.4, 11.2, 0, 0, Math.PI*2); }, skin);

  ctx.fillStyle = skin;
  ctx.strokeStyle = ink; ctx.lineWidth = 1.35;
  ctx.beginPath(); ctx.ellipse(-9.4, -34, 2.2, 3, -0.35, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(9.5, -33.4, 2.1, 2.8, 0.35, 0, Math.PI*2); ctx.fill(); ctx.stroke();

  inked(function(){
    ctx.moveTo(-8.6, -38);
    ctx.quadraticCurveTo(-12.4, -50, -1.6, -49);
    ctx.quadraticCurveTo(2.2, -55, 7.2, -47.5);
    ctx.quadraticCurveTo(13.4, -45, 10.6, -35);
    ctx.quadraticCurveTo(7.2, -33, 3.4, -37.5);
    ctx.quadraticCurveTo(-2.2, -42, -7.2, -35.5);
    ctx.closePath();
  }, hair);
  ctx.fillStyle = hair;
  ctx.beginPath(); ctx.ellipse(-8.2, -33.2, 2.5, 3.8, -0.45, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(8.6, -32.6, 2.3, 3.4, 0.4, 0, Math.PI*2); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(4.5, -48);
  ctx.quadraticCurveTo(6.8, -54, 3.2, -50);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#fffdf8';
  ctx.beginPath(); ctx.ellipse(-3.5, -37.2, 2.35, 1.55, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(3.7, -37.2, 2.35, 1.55, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = ink;
  ctx.beginPath(); ctx.ellipse(-3.3, -37, 0.72, 0.95, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(3.9, -37, 0.72, 0.95, 0, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = ink; ctx.lineWidth = 1.55;
  ctx.beginPath();
  ctx.moveTo(-5.6, -38.4); ctx.quadraticCurveTo(-3.5, -39.8, -1.3, -37.8);
  ctx.moveTo(1.6, -38.4); ctx.quadraticCurveTo(3.7, -39.8, 5.8, -37.8);
  ctx.stroke();

  ctx.fillStyle = '#e8b48c';
  ctx.beginPath(); ctx.ellipse(1.15, -31.4, 3.5, 4.35, 0.1, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = ink; ctx.lineWidth = 1.55;
  ctx.beginPath(); ctx.arc(1.3, -29.6, 3.05, 0.18, Math.PI-0.08); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(2.5, -29.8, 0.7, 0.85, 0.2, 0, Math.PI*2); ctx.stroke();

  ctx.beginPath(); ctx.arc(-0.2, -27.4, 3.3, 0.18, Math.PI-0.18); ctx.stroke();
  ctx.restore();
}

function drawCat(){
  const x=cat.x, y=cat.y;
  const spd = Math.hypot(cat.vx||0, cat.vy||0);
  const bob = Math.sin(performance.now()/160) * Math.min(1.2, spd/110);
  const step = Math.sin(performance.now()/140) * Math.min(2.4, spd/70);
  ctx.save();
  ctx.translate(x, y+bob);
  const flip = cat.vx < -8 ? -1 : 1;
  ctx.scale(flip, 1);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.fillStyle = 'rgba(0,0,0,.34)';
  ctx.beginPath(); ctx.ellipse(2, 22, 26, 6, 0, 0, Math.PI*2); ctx.fill();

  const orange = '#ff7f2a'; // brighter Garfield orange
  const belly = '#ffe4b5';
  const ink = '#1a120c';
  const pink = '#f3a0b4';
  const stripe = '#1a120c';

  function blob(fn, fill){
    ctx.beginPath();
    fn();
    ctx.fillStyle = fill;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.3;
    ctx.fill();
    ctx.stroke();
  }

  // Fatter tail with stripes
  ctx.strokeStyle = orange;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(-18, 6);
  ctx.quadraticCurveTo(-40, 10, -36, -6);
  ctx.quadraticCurveTo(-32, -24, -18, -14);
  ctx.stroke();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 3.2;
  ctx.stroke();
  // Tail stripes
  ctx.strokeStyle = stripe;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(-32, 4); ctx.lineTo(-38, -2);
  ctx.moveTo(-30, -4); ctx.lineTo(-36, -12);
  ctx.moveTo(-24, -10); ctx.lineTo(-20, -18);
  ctx.stroke();

  // Chubbier hind paws
  blob(function(){ ctx.ellipse(-12, 16+step*0.1, 7.5, 4.2, -0.12, 0, Math.PI*2); }, orange);
  blob(function(){ ctx.ellipse(10, 16.2-step*0.1, 7.8, 4.2, 0.1, 0, Math.PI*2); }, orange);
  ctx.strokeStyle = ink; ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-15, 16); ctx.lineTo(-15, 18.5);
  ctx.moveTo(-12, 16.4); ctx.lineTo(-12, 18.8);
  ctx.moveTo(7, 16.6); ctx.lineTo(7, 19);
  ctx.moveTo(10, 16.4); ctx.lineTo(10, 18.8);
  ctx.stroke();

  // Much fatter, rounder body (Garfield-like)
  blob(function(){ ctx.ellipse(0, 5, 24, 16.5, 0, 0, Math.PI*2); }, orange);
  // Body stripes - more prominent, curved black stripes
  ctx.strokeStyle = stripe;
  ctx.lineWidth = 4.2;
  ctx.beginPath();
  ctx.moveTo(-16, -2); ctx.quadraticCurveTo(-8, 8, -15, 14);
  ctx.moveTo(-6, -6); ctx.quadraticCurveTo(2, 6, -2, 16);
  ctx.moveTo(4, -4); ctx.quadraticCurveTo(14, 7, 8, 14);
  ctx.moveTo(12, -2); ctx.quadraticCurveTo(20, 6, 16, 12);
  ctx.stroke();

  // Bigger belly
  ctx.fillStyle = belly;
  ctx.beginPath(); ctx.ellipse(2, 8, 12, 9, 0, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = ink; ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-4, 3); ctx.lineTo(-4, 14);
  ctx.moveTo(2, 2); ctx.lineTo(2, 15);
  ctx.moveTo(8, 3.5); ctx.lineTo(8, 13.5);
  ctx.stroke();

  // Larger, rounder head
  blob(function(){ ctx.ellipse(10, -12, 16.5, 15, 0.02, 0, Math.PI*2); }, orange);
  // Head stripes
  ctx.strokeStyle = stripe;
  ctx.lineWidth = 3.8;
  ctx.beginPath();
  ctx.moveTo(4, -20); ctx.quadraticCurveTo(8, -14, 5, -6);
  ctx.moveTo(12, -22); ctx.quadraticCurveTo(14, -14, 11, -6);
  ctx.moveTo(18, -20); ctx.quadraticCurveTo(19, -13, 16, -7);
  ctx.stroke();

  // Smaller, rounder ears
  blob(function(){ ctx.moveTo(2, -20); ctx.lineTo(4, -32); ctx.lineTo(11, -18); ctx.closePath(); }, orange);
  blob(function(){ ctx.moveTo(14, -21); ctx.lineTo(18, -33); ctx.lineTo(23, -18); ctx.closePath(); }, orange);
  ctx.fillStyle = pink;
  ctx.beginPath(); ctx.moveTo(3.5, -20); ctx.lineTo(4.8, -28); ctx.lineTo(8.5, -18.5); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(15.5, -20.5); ctx.lineTo(18, -28.5); ctx.lineTo(20.5, -18.5); ctx.closePath(); ctx.fill();

  // Garfield-style eyes: larger, slightly half-lidded look
  ctx.fillStyle = '#fffdf6';
  ctx.strokeStyle = ink; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.ellipse(6.5, -11, 5.2, 3.8, -0.08, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(17.5, -11.2, 5.2, 3.8, 0.08, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  // Upper lids for lazy look
  ctx.fillStyle = orange;
  ctx.beginPath(); ctx.ellipse(6.5, -13.2, 5.4, 2.2, -0.08, Math.PI, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(17.5, -13.4, 5.4, 2.2, 0.08, Math.PI, Math.PI*2); ctx.fill();
  // Eye outlines / brows
  ctx.strokeStyle = ink; ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(1.5, -12.5); ctx.quadraticCurveTo(6.5, -16.5, 11.5, -11.5);
  ctx.moveTo(12.5, -12.5); ctx.quadraticCurveTo(17.5, -16.8, 22.5, -11.5);
  ctx.stroke();
  // Pupils
  ctx.fillStyle = ink;
  ctx.beginPath(); ctx.ellipse(7.2, -10.2, 1.3, 2.1, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(18.2, -10.4, 1.3, 2.1, 0, 0, Math.PI*2); ctx.fill();

  // Muzzle / face
  ctx.fillStyle = belly;
  ctx.strokeStyle = ink; ctx.lineWidth = 1.7;
  ctx.beginPath(); ctx.ellipse(17, -4, 8.5, 5.8, 0.04, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  // Nose
  ctx.fillStyle = '#e56d88';
  ctx.beginPath(); ctx.moveTo(19.5, -6); ctx.lineTo(22, -3.8); ctx.lineTo(17, -3.8); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = ink; ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(19.5, -3.8); ctx.lineTo(19.5, -1.8);
  ctx.moveTo(19.5, -1.8); ctx.quadraticCurveTo(22.5, -0.2, 24, -2);
  ctx.stroke();
  // Whiskers dots
  ctx.fillStyle = ink;
  ctx.beginPath(); ctx.arc(14, -4, 1, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(14.2, -1.8, 1, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(23, -3.5, 0.9, 0, Math.PI*2); ctx.fill();
  // Whiskers
  ctx.strokeStyle = '#f6f1e8'; ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(14, -4); ctx.lineTo(-2, -7);
  ctx.moveTo(14.2, -1.8); ctx.lineTo(-1, -0.5);
  ctx.moveTo(23, -3.5); ctx.lineTo(36, -6);
  ctx.moveTo(22.8, -2); ctx.lineTo(36, -1);
  ctx.moveTo(22.5, -0.8); ctx.lineTo(35, 2.5);
  ctx.stroke();

  ctx.restore();
}
