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
  ctx.beginPath(); ctx.ellipse(2, 20, 22, 5.2, 0, 0, Math.PI*2); ctx.fill();

  const orange = '#f47820';
  const belly = '#f6e3a4';
  const ink = '#1a120c';
  const pink = '#f3a0b4';

  function blob(fn, fill){
    ctx.beginPath();
    fn();
    ctx.fillStyle = fill;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.15;
    ctx.fill();
    ctx.stroke();
  }

  ctx.strokeStyle = orange;
  ctx.lineWidth = 8.2;
  ctx.beginPath();
  ctx.moveTo(-15, 5);
  ctx.quadraticCurveTo(-34, 8, -30, -8);
  ctx.quadraticCurveTo(-27, -22, -15, -15);
  ctx.stroke();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.3;
  ctx.stroke();
  ctx.lineWidth = 2.7;
  ctx.beginPath();
  ctx.moveTo(-28, 2); ctx.lineTo(-33, -2);
  ctx.moveTo(-26, -6); ctx.lineTo(-31, -12);
  ctx.moveTo(-20, -12); ctx.lineTo(-17, -19);
  ctx.stroke();

  blob(function(){ ctx.ellipse(-10, 15+step*0.12, 6.2, 3.5, -0.15, 0, Math.PI*2); }, orange);
  blob(function(){ ctx.ellipse(9, 15.4-step*0.12, 6.4, 3.5, 0.12, 0, Math.PI*2); }, orange);
  ctx.strokeStyle = ink; ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-13, 15); ctx.lineTo(-13, 17.2);
  ctx.moveTo(-10, 15.4); ctx.lineTo(-10, 17.6);
  ctx.moveTo(6.2, 15.6); ctx.lineTo(6.2, 17.8);
  ctx.moveTo(9.2, 15.4); ctx.lineTo(9.2, 17.6);
  ctx.stroke();

  blob(function(){ ctx.ellipse(0, 3.5, 19, 13.4, 0, 0, Math.PI*2); }, orange);
  ctx.strokeStyle = ink; ctx.lineWidth = 2.7;
  ctx.beginPath();
  ctx.moveTo(-12, -4); ctx.quadraticCurveTo(-6, 6, -11, 12);
  ctx.moveTo(-3, -8); ctx.quadraticCurveTo(3, 4, -1, 14);
  ctx.moveTo(6, -6); ctx.quadraticCurveTo(12, 5, 7, 12);
  ctx.stroke();

  ctx.fillStyle = belly;
  ctx.beginPath(); ctx.ellipse(2.2, 6.8, 9.6, 7.5, 0, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = ink; ctx.lineWidth = 1.35;
  ctx.beginPath();
  ctx.moveTo(-2.2, 2.4); ctx.lineTo(-2.2, 12.2);
  ctx.moveTo(3, 1.6); ctx.lineTo(3, 13);
  ctx.moveTo(8.2, 2.4); ctx.lineTo(8.2, 12);
  ctx.stroke();

  blob(function(){ ctx.ellipse(8.5, -10.5, 14.6, 13.4, 0.04, 0, Math.PI*2); }, orange);
  blob(function(){ ctx.moveTo(0.6, -18.5); ctx.lineTo(2.6, -30); ctx.lineTo(9.4, -16.2); ctx.closePath(); }, orange);
  blob(function(){ ctx.moveTo(12.2, -19.2); ctx.lineTo(16.2, -31); ctx.lineTo(21, -16); ctx.closePath(); }, orange);
  ctx.fillStyle = pink;
  ctx.beginPath(); ctx.moveTo(2.2, -18.4); ctx.lineTo(3.4, -25.6); ctx.lineTo(7.2, -16.6); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(13.6, -18.6); ctx.lineTo(16, -26); ctx.lineTo(18.6, -16.4); ctx.closePath(); ctx.fill();

  ctx.strokeStyle = ink; ctx.lineWidth = 2.45;
  ctx.beginPath();
  ctx.moveTo(5.2, -21); ctx.quadraticCurveTo(6.4, -13, 4.4, -7.4);
  ctx.moveTo(10.2, -22.4); ctx.quadraticCurveTo(11.2, -13, 9.2, -6.6);
  ctx.moveTo(15.2, -21); ctx.quadraticCurveTo(15.8, -13, 14.4, -6.8);
  ctx.stroke();

  ctx.fillStyle = '#fffdf6';
  ctx.strokeStyle = ink; ctx.lineWidth = 1.55;
  ctx.beginPath(); ctx.ellipse(7.2, -10.6, 4.3, 3.35, -0.06, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(16, -10.8, 4.3, 3.35, 0.06, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = orange;
  ctx.beginPath(); ctx.ellipse(7.2, -12.5, 4.5, 2.5, -0.06, Math.PI, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(16, -12.7, 4.5, 2.5, 0.06, Math.PI, Math.PI*2); ctx.fill();
  ctx.strokeStyle = ink; ctx.lineWidth = 2.35;
  ctx.beginPath();
  ctx.moveTo(3, -11.6); ctx.quadraticCurveTo(7.2, -15, 11.4, -10.8);
  ctx.moveTo(11.8, -11.6); ctx.quadraticCurveTo(16, -15.2, 20.2, -10.8);
  ctx.stroke();
  ctx.fillStyle = ink;
  ctx.beginPath(); ctx.ellipse(7.8, -9.8, 1.05, 1.75, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(16.6, -10, 1.05, 1.75, 0, 0, Math.PI*2); ctx.fill();

  ctx.fillStyle = belly;
  ctx.strokeStyle = ink; ctx.lineWidth = 1.55;
  ctx.beginPath(); ctx.ellipse(15.8, -4.4, 7.4, 5.2, 0.06, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#e56d88';
  ctx.beginPath(); ctx.moveTo(18, -5.8); ctx.lineTo(20.1, -3.5); ctx.lineTo(15.9, -3.5); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = ink; ctx.lineWidth = 1.25;
  ctx.beginPath();
  ctx.moveTo(18, -3.5); ctx.lineTo(18, -1.7);
  ctx.moveTo(18, -1.7); ctx.quadraticCurveTo(20.8, -0.4, 22.2, -2.1);
  ctx.stroke();
  ctx.fillStyle = ink;
  ctx.beginPath(); ctx.arc(13.2, -3.8, 0.85, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(13.4, -1.7, 0.85, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(21.2, -3.2, 0.75, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#f6f1e8'; ctx.lineWidth = 1.05;
  ctx.beginPath();
  ctx.moveTo(13.2, -3.8); ctx.lineTo(-1, -6.4);
  ctx.moveTo(13.4, -1.7); ctx.lineTo(-0.4, -0.6);
  ctx.moveTo(21.2, -3.2); ctx.lineTo(33, -5.6);
  ctx.moveTo(21, -2.1); ctx.lineTo(33, -1);
  ctx.moveTo(20.8, -1); ctx.lineTo(32, 2);
  ctx.stroke();
  ctx.restore();
}
