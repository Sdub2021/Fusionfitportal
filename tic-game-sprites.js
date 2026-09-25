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
  const walk = state==='play' ? (performance.now()/240) : run*10;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(8,6,4,.35)';
  ctx.beginPath(); ctx.ellipse(1, 20, 16, 5.5, 0, 0, Math.PI*2); ctx.fill();
  const L = Math.sin(walk)*3.2;
  const R = Math.sin(walk+Math.PI)*3.2;
  ctx.fillStyle = '#3a2a18';
  ctx.beginPath(); ctx.roundRect(-7.5, 8+L*0.15, 6.2, 13, 2); ctx.fill();
  ctx.beginPath(); ctx.roundRect(1.4, 8+R*0.15, 6.2, 13, 2); ctx.fill();
  ctx.fillStyle = '#1c140c';
  ctx.beginPath(); ctx.ellipse(-4.2, 21+L*0.15, 4.2, 2.1, -0.2, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(4.6, 21+R*0.15, 4.2, 2.1, 0.2, 0, Math.PI*2); ctx.fill();
  const jeans = ctx.createLinearGradient(-8, 4, 8, 16);
  jeans.addColorStop(0, '#3d4a5c'); jeans.addColorStop(1, '#2a3340');
  ctx.fillStyle = jeans;
  ctx.beginPath(); ctx.roundRect(-8, 2, 16, 12, 3); ctx.fill();
  const coat = ctx.createLinearGradient(-10, -16, 10, 6);
  coat.addColorStop(0, '#c9853c'); coat.addColorStop(0.5, '#a86b2e'); coat.addColorStop(1, '#7a4c1e');
  ctx.fillStyle = coat;
  ctx.beginPath(); ctx.roundRect(-9.5, -15, 19, 20, 5); ctx.fill();
  ctx.fillStyle = '#5c3814';
  ctx.fillRect(-1, -14, 2.2, 16);
  ctx.fillStyle = '#e8a54b';
  ctx.beginPath(); ctx.arc(7.5, -8, 2.4, 0, Math.PI*2); ctx.fill();
  if (state!=='rescue'){
    ctx.strokeStyle = '#c9a36a';
    ctx.lineWidth = 3.4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-8, -10); ctx.lineTo(-13, -1+L); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(8, -10); ctx.lineTo(13, -2+R); ctx.stroke();
    ctx.fillStyle = '#e2c39a';
    ctx.beginPath(); ctx.ellipse(-13.2, 0.4+L, 2.6, 2.2, 0.3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(13.4, -0.4+R, 2.6, 2.2, -0.3, 0, Math.PI*2); ctx.fill();
  }
  ctx.fillStyle = '#e2c39a';
  ctx.beginPath(); ctx.ellipse(0, -18, 7.2, 8.1, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#3b2414';
  ctx.beginPath();
  ctx.ellipse(0, -23.5, 7.6, 4.2, 0, Math.PI, Math.PI*2);
  ctx.fill();
  ctx.beginPath(); ctx.arc(-6.4, -20, 2.4, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(6.4, -20, 2.4, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#e2c39a';
  ctx.beginPath(); ctx.ellipse(-6.6, -17.5, 1.7, 2.2, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.ellipse(-2.3, -18.4, 1.5, 1.7, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(2.1, -18.4, 1.5, 1.7, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#2a1a10';
  ctx.beginPath(); ctx.arc(-2.1, -18.2, 0.85, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(2.3, -18.2, 0.85, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#c9a07a';
  ctx.beginPath(); ctx.moveTo(0,-17.2); ctx.lineTo(1.1,-15.2); ctx.lineTo(-0.2,-15); ctx.fill();
  ctx.strokeStyle = '#8a5a3a';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(0, -14.2, 2.1, 0.2, Math.PI-0.2); ctx.stroke();
  ctx.restore();
  ctx.fillStyle = 'rgba(232,165,75,.9)';
  ctx.font = '500 12px Outfit,sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(state==='rescue' ? 'rubbing them off' : 'your human', x, y-46);
}

function drawCat(){
  const x=cat.x, y=cat.y;
  const spd = Math.hypot(cat.vx||0, cat.vy||0);
  const bob = Math.sin(performance.now()/90) * Math.min(1.4, spd/90);
  ctx.save();
  ctx.translate(x, y+bob);
  const flip = cat.vx < -8 ? -1 : 1;
  ctx.scale(flip, 1);
  ctx.fillStyle = 'rgba(0,0,0,.28)';
  ctx.beginPath(); ctx.ellipse(1, 15, 15, 5, 0, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#b8894c';
  ctx.lineWidth = 3.2; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-12, 4);
  ctx.quadraticCurveTo(-22, 2+bob, -18, 12);
  ctx.stroke();
  ctx.fillStyle = '#8a5a28';
  ctx.beginPath(); ctx.ellipse(-6, 9, 3.4, 4.2, -0.2, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(5, 9.5, 3.2, 4, 0.15, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#3a2412';
  ctx.beginPath(); ctx.ellipse(-6, 13, 2.2, 1.4, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(5.4, 13.2, 2.2, 1.4, 0, 0, Math.PI*2); ctx.fill();
  const fur = ctx.createRadialGradient(-2, -2, 2, 0, 2, 18);
  fur.addColorStop(0, '#f0d2a0');
  fur.addColorStop(0.45, '#d4a05a');
  fur.addColorStop(1, '#8b5a28');
  ctx.fillStyle = fur;
  ctx.beginPath(); ctx.ellipse(0, 1.5, 14.5, 9.6, 0, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = 'rgba(90,50,18,.45)';
  ctx.lineWidth = 1.1;
  for (let i=0;i<4;i++){
    ctx.beginPath();
    ctx.ellipse(-1+i*0.3, 1, 10-i*1.6, 7-i, 0, 0.15, Math.PI-0.15);
    ctx.stroke();
  }
  ctx.fillStyle = '#c48a40';
  ctx.beginPath(); ctx.ellipse(5, 8.5, 2.6, 3.6, 0.4, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(9, 7.2, 2.3, 3.3, 0.5, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#e4c08a';
  ctx.beginPath(); ctx.ellipse(9.2, 0.2, 7.4, 6.2, 0.15, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#c47a38';
  ctx.beginPath(); ctx.moveTo(4.2, -3); ctx.lineTo(5.6, -14); ctx.lineTo(9.2, -4); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(11.2, -3.2); ctx.lineTo(14.4, -13.5); ctx.lineTo(15.6, -2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f3c7b0';
  ctx.beginPath(); ctx.moveTo(5.6, -4.5); ctx.lineTo(6.4, -11.5); ctx.lineTo(8.2, -4.2); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(12.2, -4.4); ctx.lineTo(13.8, -11.2); ctx.lineTo(14.6, -3.6); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f6e2c0';
  ctx.beginPath(); ctx.ellipse(12.6, 1.6, 3.6, 2.6, 0.2, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#d97a8a';
  ctx.beginPath(); ctx.ellipse(15.4, 1.5, 1.05, 0.7, 0.2, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#7ecf6a';
  ctx.beginPath(); ctx.ellipse(10.6, -0.6, 1.7, 1.9, 0.1, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#14200e';
  ctx.beginPath(); ctx.ellipse(11.05, -0.55, 0.7, 1.5, 0.1, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(10.3, -1.2, 0.45, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,236,210,.7)';
  ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(15.6, 2.2); ctx.lineTo(24, 0.4);
  ctx.moveTo(15.8, 3.1); ctx.lineTo(23.4, 4.6);
  ctx.moveTo(15.4, 1.2); ctx.lineTo(23, -1.8);
  ctx.stroke();
  ctx.restore();
}
