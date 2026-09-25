function attachTick(t){
  if (t.stuck || t.flung || cat.inv>0) return;
  t.stuck = true;
  cat.attached++;
  cat.inv = 0.55;
  shake = 8;
  flash = 0.18;
  for (let i=0;i<10;i++) particles.push({x:cat.x,y:cat.y,vx:rand(-40,40),vy:rand(-50,10),life:rand(.3,.7),c:'#6b2b1e'});
}

function burst(x,y,c){
  for (let i=0;i<16;i++) particles.push({x,y,vx:rand(-70,70),vy:rand(-80,40),life:rand(.4,.9),c});
}

function startGame(from){
  if (from==='fresh') level = 0;
  spawnLevel(level);
  aim = null;
  state = 'play';
  ui.classList.add('hidden');
}

function goToClaim(kind){
  try {
    localStorage.setItem('fit_tic_done', '1');
    localStorage.setItem('fit_tic_level', String(level+1));
  } catch (e) {}
  const q = new URLSearchParams({
    from: 'tic',
    level: String(level+1)
  });
  if (kind === 'clear') q.set('clear', '1');
  location.href = '/claim.html?' + q.toString();
}

function beginRescue(){
  state = 'rescue';
  const stuck = ticks.filter(t => t.stuck);
  stuck.forEach((t, i) => {
    t.peelAt = stuck.length ? (i + 0.35) / (stuck.length + 0.4) : 0.4;
  });
  rescue = { t: 0, dur: Math.max(1.7, 1.25 + stuck.length * 0.16), count: cat.attached };
  burst(human.x, human.y-10, '#f3c27a');
}

function finishRescue(){
  best = Math.max(best, level+1);
  localStorage.setItem('tic-best-level', String(best));
  if (level >= LEVELS.length-1) goToClaim('clear');
  else show('win');
}

function show(kind){
  state = kind;
  ui.classList.remove('hidden');
  if (kind==='title'){
    eyeEl.textContent = best ? ('Best reach \u00b7 ' + parkName(best-1) + ' / 10') : '10 dog parks';
    titleEl.textContent = 'TIC';
    copyEl.textContent = 'You are the cat. Each yard is a dog park. Beat ten parks. Start with eight tics, then one more each level. A park dog sheds two fleas every level \u2014 they hop for you after they fall. The dog runs a little faster toward you on each playground. Reach your human before the lamp burns out. Clear all ten to submit your wallet.';
    goBtn.textContent = 'Find them';
  } else if (kind==='win'){
    eyeEl.textContent = parkName(level) + ' \u00b7 ' + (level+1) + ' / 10';
    titleEl.textContent = 'Safe';
    copyEl.textContent = rescue && rescue.count
      ? 'They run a circle around you. '+rescue.count+' pest'+(rescue.count===1?'':'s')+' spin off into the dark. The dog dropped '+fleasDropped+' flea'+(fleasDropped===1?'':'s')+'. Next: '+parkName(level+1)+' \u2014 the dog runs harder at you, plus '+(9+level)+' tics and two more falling fleas.'
      : 'You reach them clean. The dog dropped '+fleasDropped+' flea'+(fleasDropped===1?'':'s')+'. Next: '+parkName(level+1)+'.';
    goBtn.textContent = parkName(level+1);
  } else if (kind==='clear'){
    eyeEl.textContent = 'Dog Park 10';
    titleEl.textContent = 'Home';
    copyEl.textContent = 'Ten dog parks. Your human ran the last circle. No tic or flea left on you. Submit your wallet.';
    goBtn.textContent = 'Claim wallet';
  } else if (kind==='lose'){
    eyeEl.textContent = 'Lamp out \u00b7 ' + parkName(level);
    titleEl.textContent = 'Too late';
    copyEl.textContent = 'The park goes dark. Tics and fleas keep their hold. Your human is a shape you cannot reach in time.';
    goBtn.textContent = 'Try ' + parkName(level) + ' again';
  }
}

function updateRescue(dt){
  rescue.t += dt;
  const p = Math.min(1, rescue.t / rescue.dur);
  const ang = rescue.t * 6.4;
  const radius = 36 + Math.sin(rescue.t * 5.2) * 5;
  human.x = cat.x + Math.cos(ang) * radius;
  human.y = cat.y + Math.sin(ang) * radius * 0.74;
  human.facing = ang + Math.PI/2;
  human.run = 1;
  cat.vx = 0; cat.vy = 0;
  for (const t of ticks){
    t.phase += dt * 12;
    if (t.stuck && !t.flung){
      if (p >= t.peelAt){
        t.flung = true;
        t.stuck = false;
        cat.attached = Math.max(0, cat.attached-1);
        const throwA = ang + rand(-0.35, 0.35);
        t.vx = Math.cos(throwA) * rand(210, 280);
        t.vy = Math.sin(throwA) * rand(210, 280);
        burst(t.x, t.y, '#b44532');
        shake = 5;
      } else {
        t.orbit += dt * 9;
        t.x = cat.x + Math.cos(t.orbit) * (cat.r + 6);
        t.y = cat.y + Math.sin(t.orbit) * (cat.r * 0.7 + 4);
      }
    } else if (t.flung){
      t.x += t.vx * dt;
      t.y += t.vy * dt;
      t.vx *= 0.985; t.vy *= 0.985;
    } else {
      const dx = t.x - cat.x, dy = t.y - cat.y;
      const d = Math.hypot(dx,dy) || 1;
      t.vx = (dx/d) * 90;
      t.vy = (dy/d) * 90;
      t.x += t.vx * dt;
      t.y += t.vy * dt;
    }
  }
  particles = particles.filter(pt=>{
    pt.life -= dt; pt.x += pt.vx*dt; pt.y += pt.vy*dt; pt.vy += 80*dt;
    return pt.life>0;
  });
  shake *= 0.86;
  flash = Math.max(0, flash-dt);
  if (rescue.t >= rescue.dur) finishRescue();
}

function update(dt){
  if (state==='rescue'){ updateRescue(dt); return; }
  if (state!=='play') return;
  timeLeft -= dt;
  if (timeLeft <= 0){
    timeLeft = 0;
    show('lose');
    return;
  }
  let ax=0, ay=0;
  if (keys['arrowleft']||keys['a']) ax -= 1;
  if (keys['arrowright']||keys['d']) ax += 1;
  if (keys['arrowup']||keys['w']) ay -= 1;
  if (keys['arrowdown']||keys['s']) ay += 1;
  ax += joy.x; ay += joy.y;
  if (aim){
    const dx = aim.x - cat.x, dy = aim.y - cat.y;
    if (Math.hypot(dx,dy) < 8) aim = null;
    else { ax += dx; ay += dy; }
  }
  const mag = Math.hypot(ax,ay);
  if (mag>1){ ax/=mag; ay/=mag; }
  const slow = 1 / (1 + cat.attached*0.22);
  const spd = 168 * slow;
  cat.vx = ax*spd; cat.vy = ay*spd;
  cat.x += cat.vx*dt; cat.y += cat.vy*dt;
  cat.inv = Math.max(0, cat.inv-dt);
  resolveBush(cat);
  if (dog){
    dog.phase += dt;
    dog.nextDrop -= dt;
    if (dog.nextDrop <= 0 && dog.dropLeft > 0){
      dropFleaFromDog();
      dog.nextDrop = dog.dropLeft ? rand(1.1, 2.2) : 99;
    }
    const wander = Math.max(16, 34 - level * 2);
    const chase = 22 + level * 10;
    dog.vx = Math.cos(dog.phase * 0.55) * wander;
    dog.vy = Math.sin(dog.phase * 0.37) * wander * 0.7;
    if (cat){
      const gap = Math.hypot(cat.x - dog.x, cat.y - dog.y) || 1;
      const pull = gap < 26 ? chase * 0.15 : chase;
      dog.vx += ((cat.x - dog.x) / gap) * pull;
      dog.vy += ((cat.y - dog.y) / gap) * pull;
    }
    dog.x += dog.vx * dt;
    dog.y += dog.vy * dt;
    if (dog.vx > 6) dog.facing = 1;
    if (dog.vx < -6) dog.facing = -1;
    dog.x = clamp(dog.x, 70, W - 90);
    dog.y = clamp(dog.y, 50, H - 50);
    resolveBush(dog);
  }
  for (const t of ticks){
    t.phase += dt*8;
    if (t.stuck){
      t.orbit += dt*(2.2 + cat.attached*0.15);
      t.x = cat.x + Math.cos(t.orbit)* (cat.r + 6);
      t.y = cat.y + Math.sin(t.orbit)* (cat.r*0.7 + 4);
      continue;
    }
    if (t.fall && t.fall > 0){
      t.fall -= dt;
      t.x += t.vx * dt;
      t.y += t.vy * dt;
      t.vy += 220 * dt;
      t.vx *= 0.96;
      continue;
    }
    const dx = cat.x - t.x, dy = cat.y - t.y;
    const d = Math.hypot(dx,dy)||1;
    const jitter = Math.sin(t.phase*0.7)*0.35;
    const hop = t.kind === 'flea' ? 1.18 : 1;
    t.vx = (dx/d)*t.speed*hop + Math.cos(t.phase)*28 + jitter*40;
    t.vy = (dy/d)*t.speed*hop + Math.sin(t.phase*1.3)*28;
    t.x += t.vx*dt; t.y += t.vy*dt;
    resolveBush(t);
    if (dist(t, cat) < cat.r + t.r - 2) attachTick(t);
  }
  if (dist(cat, human) < cat.r + human.r + 8){
    beginRescue();
    return;
  }
  particles = particles.filter(p=>{
    p.life -= dt; p.x += p.vx*dt; p.y += p.vy*dt; p.vy += 80*dt;
    return p.life>0;
  });
  shake *= 0.86;
  flash = Math.max(0, flash-dt);
}
