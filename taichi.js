/* FIT Tai Chi — CMC37 reference video + on-device pose compare */
(function () {
  const MP_VISION = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32';
  const POSE_MODEL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task';

  const VIDEOS = {
    sy5_d5QUbf8: {
      label: 'Cheng Man Ching — 37 Movement Tai Chi, superb quality (in colour). Uploaded by Boz Odusanya. Professor Cheng performing his own form.',
      chapters: [
        { t: 2, id: 'prep', name: '1. Preparation', cue: 'Feet settle. Soft knees. Arms hang. This is Professor Cheng’s opening.' },
        { t: 12, id: 'begin', name: '2. Beginning', cue: 'Wrists float up with the body, then settle. No shoulder lift.' },
        { t: 22, id: 'wol', name: '3. Ward Off Left', cue: 'Left arm rounds forward. Sit into the left side.' },
        { t: 34, id: 'wor', name: '4. Ward Off Right', cue: 'Right arm rounds forward. Hands follow the waist.' },
        { t: 44, id: 'rollback', name: '5. Roll Back', cue: 'Turn the waist. Arms roll across. Do not lean the chest.' },
        { t: 54, id: 'press', name: '6. Press', cue: 'Hands join and press. Weight goes forward a little.' },
        { t: 60, id: 'push', name: '7. Push', cue: 'Sit back, then both palms press forward.' },
        { t: 68, id: 'whip', name: '8. Single Whip', cue: 'Rear hand hooks. Front palm opens to the side.' },
        { t: 84, id: 'lift', name: '9. Lift Hands', cue: 'Both hands rise and meet, as if holding a lute.' },
        { t: 92, id: 'shoulder', name: '10. Shoulder Strike', cue: 'A short line forward with the shoulder and forearm.' },
        { t: 100, id: 'crane', name: '11. White Crane Spreads Wings', cue: 'One arm high, one low. Rise without locking the knee.' },
        { t: 108, id: 'brush', name: '12. Brush Knee Left', cue: 'One hand brushes past the knee. The other presses.' },
        { t: 120, id: 'lute', name: '13. Play the Lute', cue: 'Hands gather as if holding the pipa. Weight on the back leg.' },
        { t: 130, id: 'brush', name: 'Brush Knee Left', cue: 'Brush and press again. Same side.' },
        { t: 140, id: 'punch', name: '14. Deflect, Parry and Punch', cue: 'Deflect down, then a calm punch. Quiet shoulders.' },
        { t: 154, id: 'push', name: '15. Withdraw and Push', cue: 'Sit back. Both palms press forward together.' },
        { t: 164, id: 'cross', name: '16. Cross Hands', cue: 'Wrists cross in front of the chest. First third ends here.' },
        { t: 174, id: 'tiger', name: '17. Embrace Tiger, Return to Mountain', cue: 'Turn. Gather. Sit into the rear leg, then diagonal whip.' },
        { t: 202, id: 'elbow', name: '18. Fist Under Elbow', cue: 'One fist rests under the opposite elbow.' },
        { t: 214, id: 'monkey', name: '19–20. Repulse Monkey', cue: 'Step back. Palms push in turn. Do not lean.' },
        { t: 244, id: 'fly', name: '21. Diagonal Flying', cue: 'Open the arms on a long diagonal. Soft front knee.' },
        { t: 258, id: 'clouds', name: '22–23. Wave Hands Like Clouds', cue: 'Waist leads. Hands draw slow circles. Then Single Whip.' },
        { t: 294, id: 'snake', name: '24. Snake Creeps Down', cue: 'Sink only as low as is comfortable. Long spine.' },
        { t: 308, id: 'rooster', name: '25–26. Golden Rooster', cue: 'One-leg if you can. Touch a wall if you need it.' },
        { t: 330, id: 'sep', name: '27–28. Separate Feet', cue: 'Light separate or tap. Standing knee stays soft.' },
        { t: 354, id: 'lotus', name: '29. Turn and Heel Kick', cue: 'A small turn and kick. Skip the kick if balance is unsure.' },
        { t: 370, id: 'brush2', name: '30. Brush Knee Right', cue: 'Brush and press on the other side.' },
        { t: 386, id: 'low', name: '31. Punch Low', cue: 'A low fist. Spine stays long. Then sparrow’s tail and whip.' },
        { t: 422, id: 'shuttle', name: '32–33. Fair Lady Works the Shuttle', cue: 'Beautiful lady’s hand: side of the palm, wrist straight, no bend. One hand guards, one presses.' },
        { t: 460, id: 'stars', name: '34. Step Up to Seven Stars', cue: 'Fists rise together. Weight gathers forward.' },
        { t: 472, id: 'tiger2', name: '35. Retreat to Ride Tiger', cue: 'Sit back. Hands find a quiet open shape.' },
        { t: 482, id: 'lotus', name: '36. Sweep Lotus', cue: 'Turn. A light lotus sweep. Hold a wall if you need it.' },
        { t: 492, id: 'bow', name: '37. Bend Bow, Shoot Tiger', cue: 'Rear hand draws. Front hand aims. Soft eyes.' },
        { t: 502, id: 'close', name: 'Close · Punch, Push, Cross Hands', cue: 'Finish as the first third: punch, push, cross, stand still.' }
      ]
    },
    qdQNjyo1WD4: {
      label: 'First third, front view — Just Breathe Tai Chi (Kris Brinker)',
      chapters: [
        { t: 1, id: 'still', name: 'Stillness', cue: 'Feet under the hips. Arms rest. Soften the knees.' },
        { t: 9, id: 'prep', name: 'Preparation', cue: 'Sink a little. Crown lifted. Breath low.' },
        { t: 18, id: 'begin', name: 'Beginning', cue: 'Wrists float up to shoulder height, then settle.' },
        { t: 33, id: 'wol', name: 'Ward Off Left', cue: 'Left arm rounds forward. Right hand sits by the hip.' },
        { t: 41, id: 'wor', name: 'Ward Off Right', cue: 'Right arm rounds forward. Sit into the right leg.' },
        { t: 45, id: 'rollback', name: 'Roll Back', cue: 'Turn the waist. Arms roll across the body. Do not lean.' },
        { t: 69, id: 'whip', name: 'Single Whip', cue: 'Rear hand makes a hook. Front palm opens to the side.' },
        { t: 75, id: 'lift', name: 'Lift Hands', cue: 'Both hands rise and meet in front, as if holding a ball.' },
        { t: 79, id: 'shoulder', name: 'Shoulder Strike', cue: 'Step in. Shoulder and forearm take a short line forward.' },
        { t: 85, id: 'crane', name: 'White Crane Spreads Wings', cue: 'One arm high, one arm low. Rise without locking the knee.' },
        { t: 107, id: 'brush', name: 'Brush Knee and Press', cue: 'One hand brushes past the knee. The other presses forward.' },
        { t: 119, id: 'punch', name: 'Deflect, Parry and Punch', cue: 'Deflect down, then a calm punch. Shoulders stay quiet.' },
        { t: 127, id: 'push', name: 'Withdraw and Push', cue: 'Sit back, then both palms press forward together.' },
        { t: 138, id: 'cross', name: 'Cross Hands', cue: 'Wrists cross in front of the chest. Weight even.' },
        { t: 142, id: 'finish1', name: 'Finish First Third', cue: 'Hands return. Stand still. That is the first third.' }
      ]
    },
    L3ikwm_cuWI: {
      label: 'Second and third, front view — Just Breathe Tai Chi (Kris Brinker)',
      chapters: [
        { t: 2, id: 'cross2', name: 'Cross Hands', cue: 'Wrists cross. Find center before the next turn.' },
        { t: 9, id: 'tiger', name: 'Embrace Tiger, Return to Mountain', cue: 'Turn. Gather and sit into the rear leg.' },
        { t: 15, id: 'press', name: 'Press (Diagonal)', cue: 'Hands join and press on a diagonal.' },
        { t: 26, id: 'dwhip', name: 'Diagonal Single Whip', cue: 'Hook behind. Open the front palm.' },
        { t: 34, id: 'elbow', name: 'Fist Under Elbow', cue: 'One fist rests under the opposite elbow.' },
        { t: 38, id: 'monkey', name: 'Repulse Monkey', cue: 'Step back. Palms push in turn. Do not lean.' },
        { t: 55, id: 'fly', name: 'Diagonal Flying', cue: 'Open the arms on a long diagonal. Soft front knee.' },
        { t: 77, id: 'clouds', name: 'Wave Hands Like Clouds', cue: 'Waist leads. Hands draw slow circles.' },
        { t: 98, id: 'rooster', name: 'Golden Rooster', cue: 'Stand on one leg if you can. Touch a wall if you need it.' },
        { t: 114, id: 'sep', name: 'Separate Feet / Heel Kick', cue: 'Light kick or tap. Keep the standing knee soft.' },
        { t: 133, id: 'brush2', name: 'Brush Knee', cue: 'Brush and press again, both sides.' },
        { t: 145, id: 'low', name: 'Punch Low', cue: 'A low fist. Spine stays long.' },
        { t: 152, id: 'wor2', name: 'Ward Off Right', cue: 'Return to Ward Off on the right.' },
        { t: 181, id: 'shuttle', name: 'Fair Lady Works the Shuttles', cue: 'Four corners. One hand guards, one hand presses.' },
        { t: 217, id: 'wol2', name: 'Ward Off Left', cue: 'Ward Off left again. Stay unhurried.' },
        { t: 248, id: 'snake', name: 'Snake Creeps Down', cue: 'Sink only as low as is comfortable.' },
        { t: 258, id: 'tiger2', name: 'Sit Back, Ride Tiger', cue: 'Sit back. Hands find a quiet shape.' },
        { t: 265, id: 'lotus', name: 'Turn, Sweep Lotus', cue: 'A small turn. Skip the kick if balance is unsure.' },
        { t: 271, id: 'bow', name: 'Bend Bow, Shoot Tiger', cue: 'Rear hand draws. Front hand aims. Soft eyes.' },
        { t: 277, id: 'punch2', name: 'Deflect, Parry, Punch', cue: 'Same close as the first third.' },
        { t: 283, id: 'push2', name: 'Withdraw and Push', cue: 'Sit back, then push.' },
        { t: 304, id: 'close', name: 'Closing', cue: 'Hands gather. The form is complete.' }
      ]
    }
  };

  const $ = function (id) { return document.getElementById(id); };
  const startBtn = $('start-btn');
  const pauseBtn = $('pause-btn');
  const skipBtn = $('skip-btn');
  const lockBtn = $('lock-btn');
  const statusEl = $('status');
  const listEl = $('form-list');
  const nameEl = $('form-name');
  const cueEl = $('form-cue');
  const kickerEl = $('form-kicker');
  const pctEl = $('match-pct');
  const videoLabel = $('video-label');
  const urlInput = $('yt-url');

  let videoId = 'sy5_d5QUbf8';
  let chapters = VIDEOS[videoId].chapters;
  let chapterIndex = 0;
  let player = null;
  let ytReady = false;
  let poseLandmarker = null;
  let stream = null;
  let raf = 0;
  let running = false;
  let lastDetect = 0;
  let scored = {};
  let tickTimer = null;
  let lockHands = true;

  function parseYouTubeId(value) {
    if (!value) return '';
    const trimmed = value.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
    try {
      const u = new URL(trimmed);
      if (u.hostname.indexOf('youtu.be') !== -1) return u.pathname.replace('/', '').slice(0, 11);
      if (u.searchParams.get('v')) return u.searchParams.get('v');
      const parts = u.pathname.split('/');
      const idx = parts.indexOf('embed');
      if (idx !== -1 && parts[idx + 1]) return parts[idx + 1].slice(0, 11);
    } catch (e) {}
    return '';
  }

  function setVideo(id, customLabel) {
    videoId = id;
    const known = VIDEOS[id];
    chapters = known ? known.chapters : [
      { t: 0, id: 'follow', name: 'Follow the teacher', cue: 'We do not have chapter names for this clip. Copy the shape you see. Whole body in frame.' }
    ];
    chapterIndex = 0;
    scored = {};
    videoLabel.textContent = known
      ? ('Reference: ' + known.label)
      : (customLabel || 'Custom YouTube clip. Scoring uses a general Tai Chi shape, not named CMC37 chapters.');
    paintList();
    setChapter(0, true);
    if (player && player.loadVideoById) {
      player.loadVideoById(id);
      player.pauseVideo();
    }
  }

  function paintList() {
    listEl.innerHTML = chapters.map(function (ch, i) {
      const cls = scored[ch.id] ? 'ok' : (i === chapterIndex ? 'on' : '');
      const mark = scored[ch.id] ? Math.round(scored[ch.id]) + '%' : timeLabel(ch.t);
      return '<li class="' + cls + '" data-i="' + i + '"><span>' + ch.name + '</span><span>' + mark + '</span></li>';
    }).join('');
    listEl.querySelectorAll('li').forEach(function (el) {
      el.onclick = function () {
        const i = Number(el.dataset.i);
        chapterIndex = i;
        paintList();
        setChapter(i, true);
        if (player && player.seekTo) {
          player.seekTo(chapters[i].t, true);
          if (running) player.playVideo();
        }
      };
    });
  }

  function timeLabel(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m + ':' + String(s).padStart(2, '0');
  }

  function setChapter(i, force) {
    const ch = chapters[i] || chapters[0];
    if (!ch) return;
    kickerEl.textContent = 'CMC37 · move ' + (i + 1) + ' / ' + chapters.length;
    nameEl.textContent = ch.name;
    cueEl.textContent = ch.cue;
    if (force) pctEl.textContent = scored[ch.id] ? Math.round(scored[ch.id]) + '%' : '—';
  }

  function currentFromTime(sec) {
    let idx = 0;
    for (let i = 0; i < chapters.length; i++) {
      if (sec >= chapters[i].t) idx = i;
    }
    return idx;
  }

  function mid(a, b) { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: ((a.z || 0) + (b.z || 0)) / 2 }; }
  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function visible(p) { return p && (p.visibility === undefined || p.visibility > 0.35); }
  function angleAt(a, b, c) {
    if (!a || !b || !c) return 0;
    const v1 = { x: a.x - b.x, y: a.y - b.y, z: (a.z || 0) - (b.z || 0) };
    const v2 = { x: c.x - b.x, y: c.y - b.y, z: (c.z || 0) - (b.z || 0) };
    const d1 = Math.hypot(v1.x, v1.y, v1.z) || 1;
    const d2 = Math.hypot(v2.x, v2.y, v2.z) || 1;
    const dot = (v1.x * v2.x + v1.y * v2.y + v1.z * v2.z) / (d1 * d2);
    return Math.acos(Math.max(-1, Math.min(1, dot)));
  }
  function ladyHand(elbow, wrist, index, pinky, thumb) {
    if (!elbow || !wrist || !index) return { score: 0, straight: 0, side: 0 };
    const tip = pinky ? mid(index, pinky) : index;
    const straight = Math.max(0, Math.min(1, (angleAt(elbow, wrist, tip) - 2.35) / 0.7));
    const len = dist(wrist, index) || 0.01;
    const width = thumb && pinky ? dist(thumb, pinky) : (pinky ? dist(index, pinky) : len);
    const side = Math.max(0, Math.min(1, 1 - width / (len * 0.95)));
    const long = Math.max(0, Math.min(1, (len - 0.04) / 0.08));
    return { score: straight * 0.55 + side * 0.3 + long * 0.15, straight: straight, side: side };
  }

  function features(lm) {
    const P = function (i) { return visible(lm[i]) ? lm[i] : null; };
    const ls = P(11), rs = P(12), lh = P(23), rh = P(24);
    const le = P(13), re = P(14), lw = P(15), rw = P(16);
    const lk = P(25), rk = P(26), la = P(27), ra = P(28);
    const li = P(19), ri = P(20), lp = P(17), rp = P(18), lt = P(21), rt = P(22);
    if (!ls || !rs || !lh || !rh) return null;
    const shoulder = mid(ls, rs);
    const hip = mid(lh, rh);
    const torso = dist(shoulder, hip) || 0.2;
    const upright = Math.abs(shoulder.x - hip.x) / torso;
    const soft = (lk && rk) ? (((lk.y + rk.y) / 2) - hip.y) / torso : 0.3;
    const stance = (la && ra) ? dist(la, ra) / torso : 0.6;
    const leftUp = lw ? (shoulder.y - lw.y) / torso : 0;
    const rightUp = rw ? (shoulder.y - rw.y) / torso : 0;
    const leftOut = lw ? (lw.x - shoulder.x) / torso : 0;
    const rightOut = rw ? (rw.x - shoulder.x) / torso : 0;
    const leftFwd = lw ? (ls.z || 0) - (lw.z || 0) : 0;
    const rightFwd = rw ? (rs.z || 0) - (rw.z || 0) : 0;
    const wristsTogether = (lw && rw) ? dist(lw, rw) / torso : 2;
    const crossed = lw && rw && le && re && lw.x > rw.x && Math.abs(lw.y - rw.y) < 0.12;
    const leftLady = ladyHand(le, lw, li, lp, lt);
    const rightLady = ladyHand(re, rw, ri, rp, rt);
    const lady = Math.max(leftLady.score, rightLady.score);
    return {
      torso: torso, upright: upright, soft: soft, stance: stance,
      leftUp: leftUp, rightUp: rightUp, leftOut: leftOut, rightOut: rightOut,
      leftFwd: leftFwd, rightFwd: rightFwd, wristsTogether: wristsTogether, crossed: crossed,
      bodyInFrame: !!(la && ra && lw && rw),
      lady: lady, leftLady: leftLady, rightLady: rightLady
    };
  }

  function clamp01(n) { return Math.max(0, Math.min(1, n)); }

  function scoreMove(id, f) {
    if (!f) return { pct: 0, tip: 'Step back until feet and hands are in the frame.' };
    const bits = [];
    bits.push(f.bodyInFrame ? 1 : 0.2);
    bits.push(clamp01(1 - f.upright * 1.8));
    bits.push(clamp01(f.soft * 2.2));
    const openHand = id !== 'punch' && id !== 'punch2' && id !== 'low' && id !== 'elbow' && id !== 'stars';
    if (openHand) bits.push(clamp01(f.lady));
    const ladyTip = f.lady < 0.55
      ? 'Beautiful lady’s hand: show the side of the palm, wrist straight, no bend.'
      : null;

    function armHigh(v) { return clamp01((v - 0.15) / 0.7); }
    function armLow(v) { return clamp01(1 - (v + 0.15) / 0.6); }
    function openSide(v) { return clamp01((Math.abs(v) - 0.25) / 0.7); }

    let tip = 'Keep the knees soft and the head stacked over the hips.';
    if (id === 'still' || id === 'prep' || id === 'close' || id === 'finish1') {
      bits.push(armLow(f.leftUp)); bits.push(armLow(f.rightUp));
      tip = f.soft < 0.15 ? 'Unlock the knees a little.' : 'Quiet arms. Breathe low.';
    } else if (id === 'begin' || id === 'lift' || id === 'lute' || id === 'elbow' || id === 'stars') {
      bits.push(armHigh(f.leftUp)); bits.push(armHigh(f.rightUp));
      bits.push(clamp01(1.2 - f.wristsTogether));
      tip = f.wristsTogether > 0.9 ? 'Bring the hands toward each other at chest height.' : 'Float both wrists up.';
    } else if (id === 'wol' || id === 'wol2') {
      bits.push(armHigh(f.leftUp)); bits.push(clamp01(f.leftFwd + 0.3));
      tip = f.leftUp < 0.2 ? 'Round the left arm forward.' : 'Sit a little into the left side.';
    } else if (id === 'wor' || id === 'wor2') {
      bits.push(armHigh(f.rightUp)); bits.push(clamp01(f.rightFwd + 0.3));
      tip = f.rightUp < 0.2 ? 'Round the right arm forward.' : 'Sit a little into the right side.';
    } else if (id === 'rollback' || id === 'clouds' || id === 'monkey') {
      bits.push(openSide(f.leftOut) * 0.5 + openSide(f.rightOut) * 0.5);
      tip = 'Turn from the waist. Arms follow. Do not lean the chest.';
    } else if (id === 'whip' || id === 'dwhip') {
      bits.push(Math.max(openSide(f.leftOut), openSide(f.rightOut)));
      bits.push(Math.max(armHigh(f.leftUp), armHigh(f.rightUp)));
      tip = 'One hand hooks behind. The front palm opens to the side.';
    } else if (id === 'shuttle') {
      bits.push(clamp01(f.lady));
      bits.push(Math.abs(f.leftUp - f.rightUp) > 0.2 ? 1 : 0.4);
      tip = ladyTip || 'Fair lady: one hand guards, one presses. Wrist long and unbent.';
    } else if (id === 'crane' || id === 'fly') {
      bits.push(Math.abs(f.leftUp - f.rightUp) > 0.25 ? 1 : 0.35);
      tip = ladyTip || 'Split the arms — one higher, one lower. Keep both wrists long.';
    } else if (id === 'brush' || id === 'brush2' || id === 'punch' || id === 'punch2' || id === 'low' || id === 'shoulder' || id === 'bow') {
      bits.push(Math.max(clamp01(f.leftFwd + 0.2), clamp01(f.rightFwd + 0.2)));
      tip = 'One hand travels forward. Shoulders stay heavy and quiet.';
    } else if (id === 'push' || id === 'push2' || id === 'press') {
      bits.push(armHigh((f.leftUp + f.rightUp) / 2));
      bits.push(clamp01(1.4 - f.wristsTogether));
      tip = 'Both palms face forward at chest height.';
    } else if (id === 'cross' || id === 'cross2') {
      bits.push(f.crossed ? 1 : clamp01(1.3 - f.wristsTogether));
      tip = 'Cross the wrists in front of the heart.';
    } else if (id === 'rooster' || id === 'sep' || id === 'lotus') {
      bits.push(f.stance < 0.55 ? 0.9 : 0.4);
      tip = 'A narrow stance or one-leg shape. Use a wall if you need it.';
    } else if (id === 'snake') {
      bits.push(clamp01(f.soft * 1.4));
      tip = 'Sink only as far as is easy. Long spine.';
    } else {
      bits.push(armHigh((f.leftUp + f.rightUp) / 2) * 0.6 + 0.3);
      tip = ladyTip || 'Copy the teacher’s height of the hands and the width of the feet.';
    }
    if (ladyTip && id !== 'shuttle' && id !== 'prep' && id !== 'still' && id !== 'close' && id !== 'finish1' && id !== 'snake' && id !== 'rooster' && id !== 'punch' && id !== 'punch2' && id !== 'low' && id !== 'elbow' && id !== 'stars') {
      tip = ladyTip;
    }
    const pct = Math.round((bits.reduce(function (a, b) { return a + b; }, 0) / bits.length) * 100);
    return { pct: pct, tip: tip };
  }

  function drawPose(ctx, lm, w, h, color) {
    const pairs = [[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28]];
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    pairs.forEach(function (pair) {
      const a = lm[pair[0]], b = lm[pair[1]];
      if (!visible(a) || !visible(b)) return;
      ctx.beginPath();
      ctx.moveTo(a.x * w, a.y * h);
      ctx.lineTo(b.x * w, b.y * h);
      ctx.stroke();
    });
    function drawLady(elbowI, wristI, indexI) {
      const e = lm[elbowI], wr = lm[wristI], ix = lm[indexI];
      if (!visible(wr) || !visible(ix)) return;
      const ok = angleAt(e, wr, ix) > 2.5;
      ctx.strokeStyle = ok ? '#34d399' : '#f87171';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(wr.x * w, wr.y * h);
      ctx.lineTo(ix.x * w, ix.y * h);
      ctx.stroke();
    }
    drawLady(13, 15, 19);
    drawLady(14, 16, 20);
    ctx.fillStyle = '#fff6d8';
    [0, 11, 12, 15, 16, 19, 20, 23, 24, 27, 28].forEach(function (i) {
      const p = lm[i];
      if (!visible(p)) return;
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  async function loadPose() {
    if (poseLandmarker) return poseLandmarker;
    statusEl.textContent = 'Loading pose + MediaPipe Hands…';
    const mod = await import(MP_VISION + '/vision_bundle.mjs');
    const fileset = await mod.FilesetResolver.forVisionTasks(MP_VISION + '/wasm');
    try {
      poseLandmarker = await mod.PoseLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: POSE_MODEL, delegate: 'GPU' },
        runningMode: 'VIDEO',
        numPoses: 1
      });
    } catch (e) {
      poseLandmarker = await mod.PoseLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: POSE_MODEL },
        runningMode: 'VIDEO',
        numPoses: 1
      });
    }
    if (window.FitHands) {
      try { await window.FitHands.ensure(); } catch (e) {
        if (statusEl) statusEl.textContent = 'Hand model failed to load. Body tracker still works.';
      }
    }
    return poseLandmarker;
  }

  function tick() {
    const video = $('user-cam');
    const canvas = $('user-canvas');
    if (!running || !video || !canvas) return;
    if (!lockHands && !poseLandmarker) return;
    raf = requestAnimationFrame(tick);
    if (video.readyState < 2) return;
    if (canvas.width !== video.videoWidth && video.videoWidth) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
    const now = performance.now();
    if (now - lastDetect < 100) return;
    lastDetect = now;
    let result = null;
    if (!lockHands) {
      try { result = poseLandmarker.detectForVideo(video, now); } catch (e) { result = null; }
    }
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const lm = result && result.landmarks && result.landmarks[0];
    const hands = window.FitHands ? window.FitHands.detect(video) : null;
    const n = hands && hands.landmarks ? hands.landmarks.length : 0;
    if (lockHands) {
      if (window.FitHands) window.FitHands.draw(ctx, hands, canvas.width, canvas.height);
      pctEl.textContent = n ? (n === 2 ? 'LOCK' : '1/2') : '—';
      pctEl.style.color = n === 2 ? '#6ee7b7' : '#fdba74';
      cueEl.textContent = n === 2
        ? 'Hands locked. Keep the palms big in the frame, like the face drill.'
        : 'Fill the picture with both palms. Same idea as the face tracker.';
      if (statusEl) statusEl.textContent = n ? ('Hands lock · ' + n + ' / 2') : 'Hands lock · show both palms close';
      return;
    }
    if (!lm) {
      if (window.FitHands) window.FitHands.draw(ctx, hands, canvas.width, canvas.height);
      pctEl.textContent = n ? String(Math.min(40, n * 20)) + '%' : '—';
      cueEl.textContent = 'Sit closer. Chest and both hands in the middle.';
      if (statusEl) statusEl.textContent = n ? ('Hands · ' + n + '/2') : 'Looking for body…';
      return;
    }
    drawPose(ctx, lm, canvas.width, canvas.height, '#f97316');
    if (!n && window.FitHands) window.FitHands.drawPoseFingers(ctx, lm, canvas.width, canvas.height);
    if (window.FitHands) window.FitHands.draw(ctx, hands, canvas.width, canvas.height);
    const f = features(lm);
    if (statusEl) statusEl.textContent = n ? ('Hands live · ' + n + ' / 2') : 'Body live · raise palms toward the camera';
    if (n && f) {
      const lady = window.FitHands.bestLady(hands, lm[13], lm[14]);
      if (lady.count) f.lady = Math.max(f.lady || 0, lady.score);
    }
    const ch = chapters[chapterIndex] || chapters[0];
    const read = scoreMove(ch.id, f);
    pctEl.textContent = read.pct + '%';
    pctEl.style.color = read.pct >= 70 ? '#6ee7b7' : (read.pct >= 45 ? '#fdba74' : '#f87171');
    cueEl.textContent = read.tip;
    if (read.pct >= 62) {
      const prev = scored[ch.id] || 0;
      if (read.pct > prev) scored[ch.id] = read.pct;
    }
  }

  function syncChapterFromPlayer() {
    if (!player || !player.getCurrentTime) return;
    const t = player.getCurrentTime();
    const next = currentFromTime(t);
    if (next !== chapterIndex) {
      chapterIndex = next;
      setChapter(next, false);
      paintList();
    }
  }

  function loadYtApi() {
    return new Promise(function (resolve) {
      if (window.YT && window.YT.Player) { resolve(); return; }
      const ready = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = function () {
        if (ready) ready();
        resolve();
      };
      const s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(s);
    });
  }

  async function ensurePlayer() {
    await loadYtApi();
    if (player) return player;
    player = new YT.Player('yt-player', {
      videoId: videoId,
      width: '100%',
      height: '100%',
      playerVars: { rel: 0, modestbranding: 1, playsinline: 1, origin: location.origin },
      events: {
        onReady: function () { ytReady = true; }
      }
    });
    return player;
  }

  async function start() {
    try {
      startBtn.disabled = true;
      statusEl.textContent = 'Starting camera + MediaPipe Hands…';
      await ensurePlayer();
      if (!window.FitHands) throw new Error('Hands script missing');
      await window.FitHands.ensure();
      if (window.FitHands.setCloseUp) window.FitHands.setCloseUp(true);
      lockHands = true;
      if (lockBtn) lockBtn.textContent = 'Full body';
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } },
        audio: false
      });
      const video = $('user-cam');
      video.srcObject = stream;
      video.setAttribute('playsinline', 'true');
      await video.play().catch(function () {});
      running = true;
      if (player && player.playVideo) player.playVideo();
      statusEl.textContent = 'Hands tracker live. Fill the frame with both palms.';
      startBtn.textContent = 'Running';
      tick();
      if (tickTimer) clearInterval(tickTimer);
      tickTimer = setInterval(syncChapterFromPlayer, 400);
      loadPose().catch(function () {});
    } catch (err) {
      statusEl.textContent = (err && err.message) ? err.message : 'Camera or Hands failed. Allow the camera and try again.';
      startBtn.disabled = false;
    }
  }

  function pause() {
    running = !running;
    if (running) {
      pauseBtn.textContent = 'Pause';
      if (player && player.playVideo) player.playVideo();
      tick();
    } else {
      pauseBtn.textContent = 'Resume';
      if (player && player.pauseVideo) player.pauseVideo();
      if (raf) cancelAnimationFrame(raf);
    }
  }

  function skip() {
    const ch = chapters[chapterIndex];
    if (ch && scored[ch.id] == null) scored[ch.id] = 60;
    if (chapterIndex < chapters.length - 1) {
      chapterIndex += 1;
      setChapter(chapterIndex, true);
      paintList();
      if (player && player.seekTo) player.seekTo(chapters[chapterIndex].t, true);
    } else {
      statusEl.textContent = 'Sequence complete. You can replay any move from the list.';
    }
  }

  document.querySelectorAll('[data-vid]').forEach(function (btn) {
    btn.addEventListener('click', function () { setVideo(btn.getAttribute('data-vid')); });
  });
  $('load-url').addEventListener('click', function () {
    const id = parseYouTubeId(urlInput.value);
    if (!id) { statusEl.textContent = 'Paste a full YouTube link first.'; return; }
    setVideo(id);
  });
  function toggleLock() {
    lockHands = !lockHands;
    if (lockBtn) lockBtn.textContent = lockHands ? 'Full body' : 'Lock hands';
    if (window.FitHands && window.FitHands.setCloseUp) window.FitHands.setCloseUp(lockHands);
    if (statusEl) {
      statusEl.textContent = lockHands
        ? 'Hands lock on. Bring both palms close, like the face drill.'
        : 'Full body on. Hands are a second model — they need bigger palms.';
    }
  }
  startBtn.addEventListener('click', start);
  pauseBtn.addEventListener('click', pause);
  skipBtn.addEventListener('click', skip);
  if (lockBtn) lockBtn.addEventListener('click', toggleLock);
  window.addEventListener('pagehide', function () {
    running = false;
    if (stream) stream.getTracks().forEach(function (t) { t.stop(); });
    if (tickTimer) clearInterval(tickTimer);
  });

  paintList();
  setChapter(0, true);
  ensurePlayer().catch(function () {
    statusEl.textContent = 'YouTube player could not load. Check the connection, then refresh.';
  });
})();
