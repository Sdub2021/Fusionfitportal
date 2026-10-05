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
  const L = Math.sin(walk)*3.4;
  const R = Math.sin(walk+Math.PI)*3.4;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(8,6,4,.4)';
  ctx.beginPath(); ctx.ellipse(0, 24, 16, 5, 0, 0, Math.PI*2); ctx.fill();
  ctx.lineJoin = 'round';
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = '#1a120c';
  // shoes
  ctx.fillStyle = '#2a2118';
  ctx.beginPath(); ctx.ellipse(-5.2, 22+L*0.12, 5.2, 2.4, -0.15, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(5.4, 22+R*0.12, 5.2, 2.4, 0.15, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  // brown slacks
  ctx.fillStyle = '#6b4a2e';
  ctx.beginPath(); ctx.roundRect(-8.2, 4+L*0.08, 7.2, 16, 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(1.1, 4+R*0.08, 7.2, 16, 2); ctx.fill(); ctx.stroke();
  // blue comic shirt
  ctx.fillStyle = '#7eb6e6';
  ctx.beginPath(); ctx.roundRect(-11, -16, 22, 22, 4); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#f4d7b8';
  ctx.fillRect(-3.2, -15.2, 6.4, 8);
  ctx.strokeRect(-3.2, -15.2, 6.4, 8);
  ctx.fillStyle = '#5aa0dc';
  ctx.beginPath(); ctx.moveTo(-11,-8); ctx.lineTo(-3,-14); ctx.lineTo(-3,-6); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(11,-8); ctx.lineTo(3,-14); ctx.lineTo(3,-6); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#1a120c';
  ctx.beginPath(); ctx.moveTo(0,-14); ctx.lineTo(0,5); ctx.stroke();
  // arms
  if (state!=='rescue'){
    ctx.strokeStyle = '#1a120c';
    ctx.lineWidth = 4.2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-10, -8); ctx.lineTo(-16, 1+L); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(10, -8); ctx.lineTo(16, 0+R); ctx.stroke();
    ctx.fillStyle = '#f4d7b8';
    ctx.beginPath(); ctx.arc(-16.2, 2.2+L, 2.7, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(16.2, 1.2+R, 2.7, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  }
  // neck + head
  ctx.fillStyle = '#f4d7b8';
  ctx.fillRect(-3.2, -20, 6.4, 6);
  ctx.beginPath(); ctx.ellipse(0, -28, 9.2, 10.2, 0, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#1a120c'; ctx.lineWidth = 1.6;
  ctx.stroke();
  // Jon hair: brown side part and forelock
  ctx.fillStyle = '#5a3418';
  ctx.beginPath();
  ctx.moveTo(-9.2, -30);
  ctx.quadraticCurveTo(-10, -42, -1, -40);
  ctx.quadraticCurveTo(4, -43, 9.4, -34);
  ctx.quadraticCurveTo(8, -30, 6, -31);
  ctx.quadraticCurveTo(0, -34, -6, -30);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(-7.4, -28, 2.4, 3.2, -0.4, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(7.6, -27.4, 2.2, 3, 0.4, 0, Math.PI*2); ctx.fill();
  // big comic nose
  ctx.fillStyle = '#f0c7a4';
  ctx.beginPath(); ctx.ellipse(1.4, -26.2, 2.3, 2.8, 0.2, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#1a120c'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(1.6, -25.2, 2.1, 0.2, Math.PI); ctx.stroke();
  // dot eyes, small smile
  ctx.fillStyle = '#1a120c';
  ctx.beginPath(); ctx.ellipse(-3.3, -29.2, 1.15, 1.45, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(3.6, -29.2, 1.15, 1.45, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(0.2, -23.4, 2.4, 0.25, Math.PI-0.25); ctx.stroke();
  ctx.restore();
  ctx.fillStyle = '#f3c27a';
  ctx.font = '600 12px Outfit,sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(state==='rescue' ? 'rubbing them off' : 'Jon', x, y-52);
}

function drawCat(){
  const x=cat.x, y=cat.y;
  const spd = Math.hypot(cat.vx||0, cat.vy||0);
  const bob = Math.sin(performance.now()/140) * Math.min(1.2, spd/110);
  ctx.save();
  ctx.translate(x, y+bob);
  const flip = cat.vx < -8 ? -1 : 1;
  ctx.scale(flip, 1);
  ctx.lineJoin = 'round';
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#1a120c';
  ctx.fillStyle = 'rgba(0,0,0,.3)';
  ctx.beginPath(); ctx.ellipse(2, 16, 18, 5, 0, 0, Math.PI*2); ctx.fill();
  // striped tail
  ctx.strokeStyle = '#e07a1f';
  ctx.lineWidth = 5.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-12, 2); ctx.quadraticCurveTo(-24, -6, -18, -16); ctx.stroke();
  ctx.strokeStyle = '#1a120c'; ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.moveTo(-16, -8); ctx.lineTo(-18, -14);
  ctx.moveTo(-18, -4); ctx.lineTo(-21, -8); ctx.stroke();
  // stubby feet
  ctx.fillStyle = '#e07a1f';
  ctx.strokeStyle = '#1a120c'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.ellipse(-7, 12, 4.2, 3.2, -0.2, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(6, 12.4, 4.2, 3.2, 0.2, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  // fat body
  const fur = ctx.createRadialGradient(-2, -2, 2, 0, 2, 20);
  fur.addColorStop(0, '#f0a24a');
  fur.addColorStop(1, '#e07a1f');
  ctx.fillStyle = fur;
  ctx.beginPath(); ctx.ellipse(0, 3, 16.5, 11.2, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  // black back stripes
  ctx.strokeStyle = '#1a120c'; ctx.lineWidth = 1.6;
  for (let i=0;i<4;i++){
    ctx.beginPath();
    ctx.ellipse(-2, 1, 11-i*1.4, 7.2-i*0.6, 0, 3.45, 5.95);
    ctx.stroke();
  }
  // belly
  ctx.fillStyle = '#f6d7a8';
  ctx.beginPath(); ctx.ellipse(2, 6, 8.5, 6.2, 0, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#1a120c'; ctx.lineWidth = 1.1;
  ctx.beginPath(); ctx.moveTo(-2, 3); ctx.lineTo(-2, 10);
  ctx.moveTo(2, 2.5); ctx.lineTo(2, 11);
  ctx.moveTo(6, 3.4); ctx.lineTo(6, 10); ctx.stroke();
  // huge head
  ctx.fillStyle = '#e8892e';
  ctx.beginPath(); ctx.ellipse(8, -6, 11.5, 10.2, 0.15, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#1a120c'; ctx.lineWidth = 1.5; ctx.stroke();
  // small ears
  ctx.fillStyle = '#e8892e';
  ctx.beginPath(); ctx.moveTo(2.4, -12); ctx.lineTo(4.2, -20); ctx.lineTo(8.2, -12); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(10.2, -13); ctx.lineTo(13.4, -20.5); ctx.lineTo(16.4, -11); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#f3b7b0';
  ctx.beginPath(); ctx.moveTo(3.6, -12.2); ctx.lineTo(4.6, -17.4); ctx.lineTo(7.2, -12.2); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(11.4, -12.6); ctx.lineTo(13.2, -17.6); ctx.lineTo(15.2, -11.6); ctx.closePath(); ctx.fill();
  // head stripes
  ctx.strokeStyle = '#1a120c'; ctx.lineWidth = 1.3;
  ctx.beginPath(); ctx.moveTo(6, -14); ctx.quadraticCurveTo(7, -9, 5.2, -6);
  ctx.moveTo(9.2, -15); ctx.quadraticCurveTo(10, -9, 8.6, -5.5);
  ctx.moveTo(12.4, -14.5); ctx.quadraticCurveTo(13, -9, 12.2, -5); ctx.stroke();
  // muzzle
  ctx.fillStyle = '#f8e2c4';
  ctx.beginPath(); ctx.ellipse(13.2, -2.2, 5.4, 3.8, 0.15, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  // half-lidded eyes
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.ellipse(9.2, -6.2, 2.5, 1.7, -0.1, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(14.6, -6.4, 2.5, 1.7, 0.1, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#1a120c';
  ctx.beginPath(); ctx.ellipse(9.5, -5.7, 0.7, 1.15, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(14.9, -5.9, 0.7, 1.15, 0, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#1a120c'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(6.8, -7.6); ctx.quadraticCurveTo(9.2, -8.6, 11.6, -7.2);
  ctx.moveTo(12.2, -7.4); ctx.quadraticCurveTo(14.6, -8.6, 17.2, -7.1); ctx.stroke();
  // pink nose + smirk
  ctx.fillStyle = '#e48a9a';
  ctx.beginPath(); ctx.ellipse(15.6, -3.2, 1.35, 0.9, 0.2, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#1a120c'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(15.6, -2.5); ctx.lineTo(15.6, -1.2);
  ctx.moveTo(15.6, -1.2); ctx.quadraticCurveTo(17.4, -0.6, 18.2, -1.6); ctx.stroke();
  // whiskers
  ctx.strokeStyle = '#f8efe2'; ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(16.4, -2.2); ctx.lineTo(26, -4.4);
  ctx.moveTo(16.6, -1.4); ctx.lineTo(26.2, -1.2);
  ctx.moveTo(16.4, -0.6); ctx.lineTo(25.4, 1.6);
  ctx.stroke();
  ctx.restore();
}
