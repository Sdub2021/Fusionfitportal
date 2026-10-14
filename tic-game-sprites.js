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
  const L = Math.sin(walk)*4;
  const R = Math.sin(walk+Math.PI)*4;
  ctx.save();
  ctx.translate(x, y);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.fillStyle = 'rgba(8,6,4,.42)';
  ctx.beginPath(); ctx.ellipse(0, 34, 14, 4, 0, 0, Math.PI*2); ctx.fill();

  const skin = '#f8d0b0';
  const hair = '#c47a3a';
  const shirt = '#6eb8f0';
  const pants = '#2a4a8a';
  const ink = '#1a120c';

  function inked(fn, fill){
    ctx.beginPath();
    fn();
    ctx.fillStyle = fill;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
  }

  inked(function(){ ctx.roundRect(-7.5, 10+L*0.05, 6.5, 20, 2); }, pants);
  inked(function(){ ctx.roundRect(1, 10+R*0.05, 6.5, 20, 2); }, pants);
  inked(function(){ ctx.ellipse(-4.2, 30+L*0.05, 5, 2.4, -0.1, 0, Math.PI*2); }, '#6b3e1f');
  inked(function(){ ctx.ellipse(4.5, 30+R*0.05, 5, 2.4, 0.1, 0, Math.PI*2); }, '#6b3e1f');

  inked(function(){ ctx.roundRect(-12, -16, 24, 28, 3); }, shirt);
  ctx.fillStyle = skin;
  ctx.fillRect(-2.8, -15.5, 5.6, 7);
  ctx.strokeStyle = ink; ctx.lineWidth = 1.4;
  ctx.strokeRect(-2.8, -15.5, 5.6, 7);
  ctx.beginPath(); ctx.moveTo(0,-15.5); ctx.lineTo(0, 6); ctx.stroke();

  const drop = state==='rescue' ? 6 : 0;
  ctx.strokeStyle = shirt;
  ctx.lineWidth = 5.5;
  ctx.beginPath(); ctx.moveTo(-10,-6); ctx.lineTo(-18, 4+L+drop); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(10,-6); ctx.lineTo(18, 3+R+drop); ctx.stroke();
  ctx.strokeStyle = ink; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(-10,-6); ctx.lineTo(-18, 4+L+drop); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(10,-6); ctx.lineTo(18, 3+R+drop); ctx.stroke();
  inked(function(){ ctx.arc(-18.2, 5.2+L+drop, 3.2, 0, Math.PI*2); }, skin);
  inked(function(){ ctx.arc(18.2, 4.2+R+drop, 3.2, 0, Math.PI*2); }, skin);

  ctx.fillStyle = skin;
  ctx.strokeStyle = ink; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(-3, -24, 6, 9, 1.5); ctx.fill(); ctx.stroke();

  inked(function(){ ctx.ellipse(0, -34, 10, 12, 0, 0, Math.PI*2); }, skin);

  ctx.fillStyle = skin;
  ctx.strokeStyle = ink; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.ellipse(-9.2, -32, 2.4, 3.2, -0.3, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(9.3, -31.5, 2.3, 3, 0.3, 0, Math.PI*2); ctx.fill(); ctx.stroke();

  inked(function(){
    ctx.moveTo(-8, -36);
    ctx.quadraticCurveTo(-14, -48, -2, -48);
    ctx.quadraticCurveTo(1, -54, 6, -47);
    ctx.quadraticCurveTo(14, -46, 11, -34);
    ctx.quadraticCurveTo(7, -32, 3, -36);
    ctx.quadraticCurveTo(-3, -40, -7, -34);
    ctx.closePath();
  }, hair);
  ctx.fillStyle = hair;
  ctx.beginPath(); ctx.ellipse(-7.5, -32, 2.8, 4, -0.4, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(7.8, -31.5, 2.6, 3.6, 0.35, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-2, -48, 3.5, 2.5, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(4, -49, 2.8, 2.2, 0.2, 0, Math.PI*2); ctx.fill();

  ctx.fillStyle = '#fffef8';
  ctx.beginPath(); ctx.ellipse(-3.8, -35.5, 2.6, 1.6, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(3.9, -35.5, 2.6, 1.6, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = ink;
  ctx.beginPath(); ctx.ellipse(-3.6, -35.2, 0.8, 1.1, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(4.1, -35.2, 0.8, 1.1, 0, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = ink; ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-6.2, -36.2); ctx.quadraticCurveTo(-3.8, -37.5, -1.4, -35.8);
  ctx.moveTo(1.5, -36.2); ctx.quadraticCurveTo(3.9, -37.5, 6.3, -35.8);
  ctx.stroke();

  ctx.fillStyle = '#e8b48c';
  ctx.beginPath(); ctx.ellipse(0.8, -30.5, 2.8, 3.2, 0.05, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = ink; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.arc(1, -28.8, 2.4, 0.2, Math.PI-0.1); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -26.5, 3.2, 0.15, Math.PI-0.15); ctx.stroke();

  ctx.restore();
}

function drawCat(){
  const x=cat.x, y=cat.y;
  const spd = Math.hypot(cat.vx||0, cat.vy||0);
  const bob = Math.sin(performance.now()/160) * Math.min(1.1, spd/120);
  const step = Math.sin(performance.now()/150) * Math.min(2, spd/80);
  ctx.save();
  ctx.translate(x, y+bob);
  const flip = cat.vx < -8 ? -1 : 1;
  ctx.scale(flip, 1);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.fillStyle = 'rgba(0,0,0,.3)';
  ctx.beginPath(); ctx.ellipse(0, 22, 24, 5.5, 0, 0, Math.PI*2); ctx.fill();

  const orange = '#ff8c2a';
  const muzzle = '#ffe8c8';
  const ink = '#111';
  const pink = '#f5a0b8';
  const black = '#111';

  function blob(fn, fill){
    ctx.beginPath();
    fn();
    ctx.fillStyle = fill;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.4;
    ctx.fill();
    ctx.stroke();
  }

  ctx.strokeStyle = orange;
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(-16, 6);
  ctx.quadraticCurveTo(-38, 12, -34, -4);
  ctx.quadraticCurveTo(-30, -20, -16, -12);
  ctx.stroke();
  ctx.strokeStyle = black;
  ctx.lineWidth = 3.5;
  ctx.stroke();
  ctx.fillStyle = black;
  ctx.beginPath();
  ctx.moveTo(-32, 2); ctx.lineTo(-38, -4); ctx.lineTo(-28, -2); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-26, -8); ctx.lineTo(-32, -16); ctx.lineTo(-20, -12); ctx.closePath(); ctx.fill();

  blob(function(){ ctx.ellipse(-11, 15+step*0.08, 7, 3.8, -0.1, 0, Math.PI*2); }, orange);
  blob(function(){ ctx.ellipse(9, 15.5-step*0.08, 7.2, 3.8, 0.08, 0, Math.PI*2); }, orange);

  blob(function(){ ctx.ellipse(0, 4, 22, 15, 0, 0, Math.PI*2); }, orange);

  ctx.fillStyle = black;
  ctx.beginPath();
  ctx.moveTo(-14, -2); ctx.quadraticCurveTo(-6, 6, -13, 12); ctx.quadraticCurveTo(-8, 4, -14, -2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-4, -5); ctx.quadraticCurveTo(4, 5, -1, 14); ctx.quadraticCurveTo(2, 3, -4, -5);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(6, -3); ctx.quadraticCurveTo(16, 6, 9, 13); ctx.quadraticCurveTo(12, 4, 6, -3);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-8, -8); ctx.quadraticCurveTo(-2, 0, -6, 6); ctx.closePath(); ctx.fill();

  ctx.fillStyle = muzzle;
  ctx.beginPath(); ctx.ellipse(1.5, 7, 10, 8, 0, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = ink; ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-3, 2); ctx.lineTo(-3, 13);
  ctx.moveTo(2, 1); ctx.lineTo(2, 14);
  ctx.moveTo(7, 2.5); ctx.lineTo(7, 12.5);
  ctx.stroke();

  blob(function(){ ctx.ellipse(9, -11, 15, 14, 0.02, 0, Math.PI*2); }, orange);

  ctx.fillStyle = black;
  ctx.beginPath();
  ctx.moveTo(4, -18); ctx.quadraticCurveTo(8, -12, 5, -5); ctx.quadraticCurveTo(9, -14, 4, -18);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(12, -20); ctx.quadraticCurveTo(15, -12, 12, -5); ctx.quadraticCurveTo(16, -15, 12, -20);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(18, -18); ctx.quadraticCurveTo(20, -11, 17, -6); ctx.quadraticCurveTo(21, -14, 18, -18);
  ctx.fill();

  blob(function(){ ctx.moveTo(3, -18); ctx.lineTo(5, -28); ctx.lineTo(11, -16.5); ctx.closePath(); }, orange);
  blob(function(){ ctx.moveTo(14, -19); ctx.lineTo(17, -29); ctx.lineTo(22, -16.5); ctx.closePath(); }, orange);
  ctx.fillStyle = pink;
  ctx.beginPath(); ctx.moveTo(4.5, -18); ctx.lineTo(5.5, -25); ctx.lineTo(9, -16.8); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(15.5, -18.5); ctx.lineTo(17, -26); ctx.lineTo(19.5, -16.8); ctx.closePath(); ctx.fill();

  ctx.fillStyle = '#fffef5';
  ctx.strokeStyle = ink; ctx.lineWidth = 1.9;
  ctx.beginPath(); ctx.ellipse(6, -10.5, 4.8, 3.4, -0.05, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(16.5, -10.7, 4.8, 3.4, 0.05, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = orange;
  ctx.beginPath(); ctx.ellipse(6, -12.2, 5, 2, -0.05, Math.PI, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(16.5, -12.4, 5, 2, 0.05, Math.PI, Math.PI*2); ctx.fill();
  ctx.strokeStyle = ink; ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(1.5, -11.8); ctx.quadraticCurveTo(6, -15.5, 10.5, -10.8);
  ctx.moveTo(12, -11.8); ctx.quadraticCurveTo(16.5, -15.8, 21, -10.8);
  ctx.stroke();
  ctx.fillStyle = black;
  ctx.beginPath(); ctx.ellipse(6.8, -9.8, 1.1, 1.8, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(17.3, -10, 1.1, 1.8, 0, 0, Math.PI*2); ctx.fill();

  ctx.fillStyle = muzzle;
  ctx.strokeStyle = ink; ctx.lineWidth = 1.7;
  ctx.beginPath(); ctx.ellipse(16.5, -3.5, 7.5, 5.2, 0.03, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#e87a9a';
  ctx.beginPath(); ctx.moveTo(18.5, -5.2); ctx.lineTo(21, -3.2); ctx.lineTo(16, -3.2); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = ink; ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(18.5, -3.2); ctx.lineTo(18.5, -1.5);
  ctx.moveTo(18.5, -1.5); ctx.quadraticCurveTo(21.5, 0, 23, -1.8);
  ctx.stroke();
  ctx.fillStyle = black;
  ctx.beginPath(); ctx.arc(13.5, -3.2, 0.9, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(13.7, -1.2, 0.9, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(22.5, -2.8, 0.8, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#eee'; ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(13.5, -3.2); ctx.lineTo(-1, -6);
  ctx.moveTo(13.7, -1.2); ctx.lineTo(-0.5, -0.2);
  ctx.moveTo(22.5, -2.8); ctx.lineTo(35, -5.5);
  ctx.moveTo(22.3, -1.5); ctx.lineTo(35, -0.8);
  ctx.moveTo(22, -0.5); ctx.lineTo(34, 2);
  ctx.stroke();

  ctx.restore();
}
