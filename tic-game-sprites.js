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
  const L = Math.sin(walk)*3.5;
  const R = Math.sin(walk+Math.PI)*3.5;
  ctx.save();
  ctx.translate(x, y);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.fillStyle = 'rgba(8,6,4,.4)';
  ctx.beginPath(); ctx.ellipse(0, 36, 13, 3.8, 0, 0, Math.PI*2); ctx.fill();

  const skin = '#f5c8a0';
  const hair = '#b86a2e';
  const shirt = '#5aa8e8';
  const pants = '#1e3a7a';
  const ink = '#111';

  function inked(fn, fill){
    ctx.beginPath();
    fn();
    ctx.fillStyle = fill;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.2;
    ctx.fill();
    ctx.stroke();
  }

  inked(function(){ ctx.roundRect(-7, 12+L*0.04, 6, 18, 2); }, pants);
  inked(function(){ ctx.roundRect(1, 12+R*0.04, 6, 18, 2); }, pants);
  inked(function(){ ctx.ellipse(-4, 30+L*0.04, 4.8, 2.2, -0.1, 0, Math.PI*2); }, '#5a3010');
  inked(function(){ ctx.ellipse(4.2, 30+R*0.04, 4.8, 2.2, 0.1, 0, Math.PI*2); }, '#5a3010');

  inked(function(){ ctx.roundRect(-11, -14, 22, 26, 3); }, shirt);

  const drop = state==='rescue' ? 5 : 0;
  ctx.strokeStyle = shirt;
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(-9,-4); ctx.lineTo(-16, 5+L+drop); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(9,-4); ctx.lineTo(16, 4+R+drop); ctx.stroke();
  ctx.strokeStyle = ink; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(-9,-4); ctx.lineTo(-16, 5+L+drop); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(9,-4); ctx.lineTo(16, 4+R+drop); ctx.stroke();
  inked(function(){ ctx.arc(-16.2, 6+L+drop, 3, 0, Math.PI*2); }, skin);
  inked(function(){ ctx.arc(16.2, 5+R+drop, 3, 0, Math.PI*2); }, skin);

  ctx.fillStyle = skin;
  ctx.strokeStyle = ink; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(-2.5, -22, 5, 8, 1); ctx.fill(); ctx.stroke();

  inked(function(){ ctx.ellipse(0, -32, 9.5, 11, 0, 0, Math.PI*2); }, skin);

  ctx.fillStyle = skin;
  ctx.strokeStyle = ink; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.ellipse(-8.5, -30, 2.2, 2.8, -0.3, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(8.6, -29.5, 2.1, 2.6, 0.3, 0, Math.PI*2); ctx.fill(); ctx.stroke();

  inked(function(){
    ctx.moveTo(-7, -34);
    ctx.quadraticCurveTo(-13, -46, -1, -46);
    ctx.quadraticCurveTo(2, -52, 7, -45);
    ctx.quadraticCurveTo(13, -44, 10, -32);
    ctx.quadraticCurveTo(6, -30, 2, -34);
    ctx.quadraticCurveTo(-4, -38, -6, -32);
    ctx.closePath();
  }, hair);
  ctx.fillStyle = hair;
  ctx.beginPath(); ctx.ellipse(-6.5, -30, 3, 4.2, -0.4, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(6.8, -29.5, 2.8, 3.8, 0.35, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-1, -46, 4, 2.8, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(4.5, -47, 3.2, 2.4, 0.2, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, -50, 2.5, 1.8, 0, 0, Math.PI*2); ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.ellipse(-3.5, -33.5, 2.8, 1.4, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(3.6, -33.5, 2.8, 1.4, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = ink;
  ctx.beginPath(); ctx.ellipse(-3.3, -33.2, 0.9, 1.2, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(3.8, -33.2, 0.9, 1.2, 0, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = ink; ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-6, -34.2); ctx.quadraticCurveTo(-3.5, -35.8, -1, -33.8);
  ctx.moveTo(1.1, -34.2); ctx.quadraticCurveTo(3.6, -35.8, 6.1, -33.8);
  ctx.stroke();

  ctx.fillStyle = '#e0a080';
  ctx.beginPath(); ctx.ellipse(0.5, -28.5, 2.4, 2.6, 0, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = ink; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.arc(0.6, -27, 2.1, 0.2, Math.PI-0.1); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -25, 2.8, 0.2, Math.PI-0.2); ctx.stroke();

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
  ctx.fillStyle = 'rgba(0,0,0,.28)';
  ctx.beginPath(); ctx.ellipse(0, 24, 22, 5, 0, 0, Math.PI*2); ctx.fill();

  const orange = '#ff7a1a';
  const muzzle = '#ffe4b8';
  const ink = '#000';
  const black = '#000';

  function blob(fn, fill){
    ctx.beginPath();
    fn();
    ctx.fillStyle = fill;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.6;
    ctx.fill();
    ctx.stroke();
  }

  ctx.strokeStyle = orange;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(-14, 5);
  ctx.quadraticCurveTo(-34, 10, -30, -2);
  ctx.quadraticCurveTo(-26, -16, -14, -10);
  ctx.stroke();
  ctx.strokeStyle = black;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = black;
  ctx.beginPath(); ctx.moveTo(-28, 0); ctx.lineTo(-34, -6); ctx.lineTo(-24, -2); ctx.closePath(); ctx.fill();

  blob(function(){ ctx.ellipse(-10, 14+step*0.06, 6.5, 3.5, -0.08, 0, Math.PI*2); }, orange);
  blob(function(){ ctx.ellipse(8, 14.5-step*0.06, 6.5, 3.5, 0.06, 0, Math.PI*2); }, orange);

  blob(function(){ ctx.ellipse(0, 3, 20, 14, 0, 0, Math.PI*2); }, orange);

  ctx.fillStyle = black;
  ctx.beginPath();
  ctx.moveTo(-12, -1); ctx.quadraticCurveTo(-4, 7, -11, 11); ctx.quadraticCurveTo(-6, 3, -12, -1);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-2, -4); ctx.quadraticCurveTo(6, 6, 0, 13); ctx.quadraticCurveTo(3, 2, -2, -4);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(8, -2); ctx.quadraticCurveTo(16, 6, 10, 12); ctx.quadraticCurveTo(13, 3, 8, -2);
  ctx.fill();

  ctx.fillStyle = muzzle;
  ctx.beginPath(); ctx.ellipse(1, 6, 9, 7, 0, 0, Math.PI*2); ctx.fill();

  blob(function(){ ctx.ellipse(8, -12, 14, 13.5, 0, 0, Math.PI*2); }, orange);

  ctx.fillStyle = black;
  ctx.beginPath();
  ctx.moveTo(3, -18); ctx.quadraticCurveTo(7, -10, 4, -4); ctx.quadraticCurveTo(8, -14, 3, -18);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(11, -20); ctx.quadraticCurveTo(14, -10, 11, -4); ctx.quadraticCurveTo(15, -15, 11, -20);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(17, -18); ctx.quadraticCurveTo(19, -10, 16, -5); ctx.quadraticCurveTo(20, -14, 17, -18);
  ctx.fill();

  blob(function(){ ctx.moveTo(2, -18); ctx.lineTo(4, -26); ctx.lineTo(10, -16); ctx.closePath(); }, orange);
  blob(function(){ ctx.moveTo(13, -19); ctx.lineTo(16, -27); ctx.lineTo(21, -16); ctx.closePath(); }, orange);
  ctx.fillStyle = '#f5a0b0';
  ctx.beginPath(); ctx.moveTo(3.5, -18); ctx.lineTo(4.5, -23); ctx.lineTo(8, -16.5); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(14.5, -18.5); ctx.lineTo(16, -24); ctx.lineTo(18.5, -16.5); ctx.closePath(); ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.strokeStyle = ink; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(5, -11, 4.5, 2.8, -0.04, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(15, -11.2, 4.5, 2.8, 0.04, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = orange;
  ctx.beginPath(); ctx.ellipse(5, -12.5, 4.6, 1.6, -0.04, Math.PI, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(15, -12.7, 4.6, 1.6, 0.04, Math.PI, Math.PI*2); ctx.fill();
  ctx.strokeStyle = ink; ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(1, -12); ctx.quadraticCurveTo(5, -15.5, 9, -11);
  ctx.moveTo(11, -12); ctx.quadraticCurveTo(15, -15.8, 19, -11);
  ctx.stroke();
  ctx.fillStyle = black;
  ctx.beginPath(); ctx.ellipse(5.8, -10.2, 1, 1.6, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(15.8, -10.4, 1, 1.6, 0, 0, Math.PI*2); ctx.fill();

  ctx.fillStyle = muzzle;
  ctx.strokeStyle = ink; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.ellipse(15, -3, 7, 4.8, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#e07090';
  ctx.beginPath(); ctx.moveTo(17, -4.5); ctx.lineTo(19.5, -2.5); ctx.lineTo(14.5, -2.5); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = ink; ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(17, -2.5); ctx.lineTo(17, -1);
  ctx.moveTo(17, -1); ctx.quadraticCurveTo(20, 0.5, 21.5, -1.5);
  ctx.stroke();
  ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(12, -2.5); ctx.lineTo(-2, -5);
  ctx.moveTo(12.2, -0.5); ctx.lineTo(-1, 0.5);
  ctx.moveTo(21, -2); ctx.lineTo(32, -4.5);
  ctx.moveTo(20.8, -0.8); ctx.lineTo(32, -0.5);
  ctx.stroke();

  ctx.restore();
}
