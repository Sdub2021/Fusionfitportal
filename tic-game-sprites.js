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
  ctx.fillStyle = 'rgba(8,6,4,.4)';
  ctx.beginPath(); ctx.ellipse(0, 28, 14, 4.5, 0, 0, Math.PI*2); ctx.fill();

  function ink(path, fill){
    ctx.fillStyle = fill;
    ctx.strokeStyle = '#16120e';
    ctx.lineWidth = 1.7;
    path();
    ctx.fill();
    ctx.stroke();
  }
  // lanky legs, brown slacks, simple shoes
  ink(function(){ ctx.beginPath(); ctx.roundRect(-7.4, 6+L*0.08, 6.4, 18, 2); }, '#6a4630');
  ink(function(){ ctx.beginPath(); ctx.roundRect(1.2, 6+R*0.08, 6.4, 18, 2); }, '#6a4630');
  ink(function(){ ctx.beginPath(); ctx.ellipse(-4.2, 25+L*0.08, 5, 2.3, -0.1, 0, Math.PI*2); }, '#241c16');
  ink(function(){ ctx.beginPath(); ctx.ellipse(4.6, 25+R*0.08, 5, 2.3, 0.1, 0, Math.PI*2); }, '#241c16');
  // light blue collared shirt, thin torso
  ink(function(){ ctx.beginPath(); ctx.roundRect(-10, -16, 20, 24, 3); }, '#8ec8ef');
  ctx.fillStyle = '#f6d8bc';
  ctx.fillRect(-2.6, -15, 5.2, 7);
  ctx.strokeStyle = '#16120e'; ctx.lineWidth = 1.4;
  ctx.strokeRect(-2.6, -15, 5.2, 7);
  ctx.beginPath(); ctx.moveTo(0,-15); ctx.lineTo(0,7); ctx.stroke();
  ctx.fillStyle = '#6eb4e4';
  ctx.beginPath(); ctx.moveTo(-10,-8); ctx.lineTo(-2.4,-15); ctx.lineTo(-2.4,-5); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(10,-8); ctx.lineTo(2.4,-15); ctx.lineTo(2.4,-5); ctx.closePath(); ctx.fill(); ctx.stroke();
  if (state!=='rescue'){
    ctx.strokeStyle = '#16120e'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-9,-6); ctx.lineTo(-16, 2+L); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(9,-6); ctx.lineTo(16, 1+R); ctx.stroke();
    ink(function(){ ctx.beginPath(); ctx.arc(-16.4, 3.4+L, 2.8, 0, Math.PI*2); }, '#f6d8bc');
    ink(function(){ ctx.beginPath(); ctx.arc(16.4, 2.4+R, 2.8, 0, Math.PI*2); }, '#f6d8bc');
  }
  // long neck, oval head, big nose
  ctx.fillStyle = '#f6d8bc';
  ctx.fillRect(-2.8, -22, 5.6, 8);
  ink(function(){ ctx.beginPath(); ctx.ellipse(0, -32, 8.6, 10.4, 0, 0, Math.PI*2); }, '#f6d8bc');
  // brown hair with a side part and a front tuft
  ink(function(){
    ctx.beginPath();
    ctx.moveTo(-8.6, -34);
    ctx.quadraticCurveTo(-11, -46, -1.5, -44);
    ctx.quadraticCurveTo(2, -48, 8.8, -38);
    ctx.quadraticCurveTo(7, -33, 4.5, -35);
    ctx.quadraticCurveTo(-1, -38, -6.4, -33);
    ctx.closePath();
  }, '#6b3d1d');
  ctx.fillStyle = '#6b3d1d';
  ctx.beginPath(); ctx.ellipse(-7.2, -32, 2.6, 3.4, -0.5, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(7.4, -31, 2.3, 3.1, 0.4, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#16120e';
  ctx.beginPath(); ctx.ellipse(-3.1, -33.2, 1.15, 1.5, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(3.4, -33.2, 1.15, 1.5, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#efc4a6';
  ctx.beginPath(); ctx.ellipse(1.6, -29.4, 2.5, 3.1, 0.15, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#16120e'; ctx.lineWidth = 1.3;
  ctx.beginPath(); ctx.arc(1.7, -28.2, 2.2, 0.15, Math.PI-0.05); ctx.stroke();
  ctx.beginPath(); ctx.arc(0.4, -26.2, 2.6, 0.2, Math.PI-0.2); ctx.stroke();
  ctx.restore();
  ctx.fillStyle = 'rgba(243,194,122,.92)';
  ctx.font = '500 12px Outfit,sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(state==='rescue' ? 'rubbing them off' : 'your human', x, y-54);
}

function drawCat(){
  const x=cat.x, y=cat.y;
  const spd = Math.hypot(cat.vx||0, cat.vy||0);
  const bob = Math.sin(performance.now()/160) * Math.min(1.1, spd/120);
  ctx.save();
  ctx.translate(x, y+bob);
  const flip = cat.vx < -8 ? -1 : 1;
  ctx.scale(flip, 1);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.fillStyle = 'rgba(0,0,0,.32)';
  ctx.beginPath(); ctx.ellipse(4, 18, 22, 5.5, 0, 0, Math.PI*2); ctx.fill();

  // thick striped tail, curled up
  ctx.strokeStyle = '#f07818';
  ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(-14, 4); ctx.quadraticCurveTo(-30, 0, -24, -16); ctx.quadraticCurveTo(-20, -24, -12, -18); ctx.stroke();
  ctx.strokeStyle = '#16120e'; ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-22, -2); ctx.lineTo(-27, -6);
  ctx.moveTo(-24, -10); ctx.lineTo(-28, -14);
  ctx.moveTo(-18, -16); ctx.lineTo(-16, -22);
  ctx.stroke();

  // stubby paws
  ctx.fillStyle = '#f07818'; ctx.strokeStyle = '#16120e'; ctx.lineWidth = 1.7;
  ctx.beginPath(); ctx.ellipse(-8, 14, 5, 3.4, -0.2, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(8, 14.5, 5, 3.4, 0.2, 0, Math.PI*2); ctx.fill(); ctx.stroke();

  // very fat body
  ctx.fillStyle = '#f07818';
  ctx.beginPath(); ctx.ellipse(1, 3, 20, 13, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  // bold back stripes
  ctx.strokeStyle = '#16120e'; ctx.lineWidth = 2.3;
  ctx.beginPath();
  ctx.moveTo(-12, -2); ctx.quadraticCurveTo(-4, 8, -10, 12);
  ctx.moveTo(-4, -6); ctx.quadraticCurveTo(4, 6, -1, 14);
  ctx.moveTo(4, -5); ctx.quadraticCurveTo(11, 6, 7, 13);
  ctx.stroke();
  // pale belly with stripes
  ctx.fillStyle = '#f8ddb4';
  ctx.beginPath(); ctx.ellipse(3, 6.5, 10, 7.2, 0, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#16120e'; ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(-2, 2); ctx.lineTo(-2, 12);
  ctx.moveTo(3, 1); ctx.lineTo(3, 13);
  ctx.moveTo(8, 2); ctx.lineTo(8, 12);
  ctx.stroke();

  // huge round head
  ctx.fillStyle = '#f07818'; ctx.strokeStyle = '#16120e'; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.ellipse(10, -8, 13.5, 12.2, 0.08, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  // tiny ears
  ctx.beginPath(); ctx.moveTo(3, -16); ctx.lineTo(5.2, -26); ctx.lineTo(10, -15); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(13, -17); ctx.lineTo(16.6, -27); ctx.lineTo(20, -15); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#f4b0b4';
  ctx.beginPath(); ctx.moveTo(4.4, -16); ctx.lineTo(5.6, -22); ctx.lineTo(8.4, -15.4); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(14.2, -16.4); ctx.lineTo(16.2, -22.6); ctx.lineTo(18.4, -15.2); ctx.closePath(); ctx.fill();
  // forehead stripes
  ctx.strokeStyle = '#16120e'; ctx.lineWidth = 1.7;
  ctx.beginPath();
  ctx.moveTo(7, -18); ctx.quadraticCurveTo(8.2, -12, 6.4, -8);
  ctx.moveTo(11, -19); ctx.quadraticCurveTo(12, -12, 10.4, -7);
  ctx.moveTo(15, -18); ctx.quadraticCurveTo(15.6, -12, 14.6, -7);
  ctx.stroke();
  // muzzle
  ctx.fillStyle = '#fbe6c8';
  ctx.beginPath(); ctx.ellipse(16, -4, 6.2, 4.4, 0.1, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#16120e'; ctx.lineWidth = 1.4; ctx.stroke();
  // half-shut eyes
  ctx.fillStyle = '#fffdf8';
  ctx.beginPath(); ctx.ellipse(10.2, -8.4, 3.3, 1.7, -0.05, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(16.6, -8.6, 3.3, 1.7, 0.05, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#16120e'; ctx.lineWidth = 2.1;
  ctx.beginPath();
  ctx.moveTo(7, -9.4); ctx.quadraticCurveTo(10.2, -11.2, 13.4, -8.8);
  ctx.moveTo(13.4, -9.2); ctx.quadraticCurveTo(16.6, -11.4, 19.8, -8.6);
  ctx.stroke();
  ctx.fillStyle = '#16120e';
  ctx.beginPath(); ctx.ellipse(10.6, -7.8, 0.75, 1.15, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(17, -8, 0.75, 1.15, 0, 0, Math.PI*2); ctx.fill();
  // pink nose and flat smirk
  ctx.fillStyle = '#e9899a';
  ctx.beginPath(); ctx.moveTo(18.2, -5.2); ctx.lineTo(19.8, -3.6); ctx.lineTo(16.6, -3.6); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#16120e'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(18.2, -3.6); ctx.lineTo(18.2, -2.2);
  ctx.moveTo(18.2, -2.2); ctx.quadraticCurveTo(20.4, -1.4, 21.4, -2.4); ctx.stroke();
  // long whiskers
  ctx.strokeStyle = '#f7f1e8'; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(18.6, -3.4); ctx.lineTo(30, -6);
  ctx.moveTo(18.8, -2.4); ctx.lineTo(30, -2.2);
  ctx.moveTo(18.6, -1.5); ctx.lineTo(29, 1.4);
  ctx.stroke();
  ctx.restore();
}
