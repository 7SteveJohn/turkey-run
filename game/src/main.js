// Turkey's Last Dash — the simulation: states, physics, collisions, input.
// The turkey auto-runs; the player jumps, double-jumps and slides. Every
// stumble lets the farmer close in; three stumbles (or the farmer catching
// up) ends the run caught, and the forest gate at 1200 m ends it escaped.
import { CFG } from './config.js';
import { buildWorld, HAZARDS } from './world.js';
import { draw } from './render.js';
import { audio } from './audio.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');

function fitCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = CFG.viewW * dpr;
  canvas.height = CFG.viewH * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
fitCanvas();
window.addEventListener('resize', fitCanvas);

const params = new URLSearchParams(location.search);
const shotName = params.get('shot');

function newState(seed) {
  return {
    state: 'title',
    seed,
    world: buildWorld(seed),
    time: 0,
    distance: 0,
    score: 0,
    corn: 0,
    lives: CFG.lives,
    speed: CFG.startSpeed,
    // The turkey's world x is distance * pxPerMetre; the camera sits one
    // turkeyX behind it, so the course and the HUD agree on every metre.
    scrollX: -CFG.turkeyX,
    runPhase: 0,
    turkeyY: 0, // height above the ground in px
    turkeyVy: 0,
    jumps: 0,
    sliding: false,
    slideT: 0,
    slideCd: 0,
    stumbleT: 0,
    invulnT: 0,
    farmerGap: CFG.farmerGapStart,
    particles: [],
    floaters: [],
    shake: 0,
    best: readBest(),
    over: false,
  };
}

function readBest() {
  try {
    return Number(localStorage.getItem('tld-best') || 0);
  } catch {
    return 0;
  }
}

function saveBest(v) {
  try {
    localStorage.setItem('tld-best', String(v));
  } catch {
    /* headless / private contexts: the best score just doesn't persist */
  }
}

let s = newState((Math.random() * 1e9) | 0);

function announce(msg) {
  statusEl.textContent = msg;
}

function burst(x, y, color, n, spread = 90) {
  for (let i = 0; i < n; i++) {
    s.particles.push({
      x, y,
      vx: (Math.random() - 0.5) * spread * 2,
      vy: -Math.random() * spread - 20,
      r: 2 + Math.random() * 4,
      color,
      life: 0.5 + Math.random() * 0.4,
      max: 0.9,
    });
  }
}

function floater(x, y, text) {
  s.floaters.push({ x, y, text, life: 0.9 });
}

function startRun() {
  const seed = (Math.random() * 1e9) | 0;
  s = newState(seed);
  s.state = 'play';
  audio.unlock();
  audio.click();
  announce('Running! Jump the fences, slide under the cleavers, reach the forest gate.');
}

function endRun(escaped) {
  s.state = escaped ? 'escaped' : 'caught';
  s.over = true;
  if (s.score > s.best) {
    s.best = s.score;
    saveBest(s.best);
  }
  if (escaped) {
    audio.escaped();
    burst(CFG.turkeyX, CFG.groundY - 120, '#7ddb6a', 40, 160);
    burst(CFG.turkeyX, CFG.groundY - 120, '#ffe9a8', 30, 140);
    announce(`Escaped! Score ${s.score}. Press R to run again.`);
  } else {
    audio.caught();
    s.shake = 14;
    announce(`Caught after ${Math.floor(s.distance)} metres. Score ${s.score}. Press R to run again.`);
  }
}

function hitObstacle(hz) {
  if (s.invulnT > 0 || s.state !== 'play') return;
  hz.hit = true;
  s.lives -= 1;
  s.stumbleT = CFG.stumbleTime;
  s.invulnT = CFG.invulnTime;
  s.farmerGap = Math.max(CFG.farmerGapMin, s.farmerGap - CFG.farmerGainPerHit);
  s.shake = 12;
  audio.hit();
  burst(CFG.turkeyX, CFG.groundY - 60, '#fff', 14, 120);
  burst(CFG.turkeyX, CFG.groundY - 60, '#a06a30', 10, 100);
  floater(CFG.turkeyX, CFG.groundY - 160, 'OUCH!');
  if (s.lives <= 0 || s.farmerGap <= CFG.farmerGapMin + 1) {
    endRun(false);
  } else {
    announce(`Stumble! ${s.lives} ${s.lives === 1 ? 'life' : 'lives'} left — the farmer is closer.`);
  }
}

function doJump() {
  if (s.state === 'title') { startRun(); return; }
  if (s.state === 'caught' || s.state === 'escaped') { startRun(); return; }
  if (s.state !== 'play') return;
  audio.unlock();
  if (s.turkeyY <= 2 && s.jumps === 0) {
    s.turkeyVy = CFG.jumpVel;
    s.jumps = 1;
    s.sliding = false;
    audio.jump();
  } else if (s.jumps === 1) {
    s.turkeyVy = CFG.doubleJumpVel;
    s.jumps = 2;
    audio.flap();
    burst(CFG.turkeyX - 20, CFG.groundY - s.turkeyY - 30, '#e8d8b0', 6, 60);
  }
}

function doSlide() {
  if (s.state !== 'play' || s.slideCd > 0) return;
  audio.unlock();
  s.sliding = true;
  s.slideT = CFG.slideTime;
  s.slideCd = CFG.slideTime + CFG.slideCooldown;
}

// --- Collision: the turkey's body box vs each hazard's box. ---
function turkeyBox() {
  const y = CFG.groundY - s.turkeyY;
  if (s.sliding) return { x: CFG.turkeyX - 52, y: y - 42, w: 104, h: 42 };
  return { x: CFG.turkeyX - 34, y: y - 96, w: 76, h: 96 };
}

function hazardBox(hz) {
  const def = HAZARDS[hz.kind];
  const x = hz.x - s.scrollX;
  if (hz.kind === 'cleaver') return { x: x - 52, y: CFG.groundY - 142, w: 104, h: 60 };
  if (hz.kind === 'gravy') return { x: x - 58, y: CFG.groundY - 14, w: 116, h: 14 };
  return { x: x - def.w / 2, y: CFG.groundY - def.h, w: def.w, h: def.h };
}

function overlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function update(dt) {
  s.time += dt;
  // Floating texts and particles always animate.
  for (const f of s.floaters) { f.life -= dt; f.y -= 34 * dt; }
  s.floaters = s.floaters.filter((f) => f.life > 0);
  for (const p of s.particles) {
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 320 * dt;
  }
  s.particles = s.particles.filter((p) => p.life > 0);
  if (s.shake > 0) s.shake = Math.max(0, s.shake - 40 * dt);

  if (s.state === 'title' || s.state === 'paused') {
    // A gentle idle: the turkey bobs on the spot, the world creeps.
    s.runPhase += dt * 2;
    s.scrollX += 12 * dt;
    return;
  }
  if (s.state === 'caught' || s.state === 'escaped') {
    s.runPhase += dt * 1.5;
    return;
  }

  // --- play ---
  const targetSpeed = Math.min(CFG.maxSpeed, CFG.startSpeed + s.distance * CFG.speedRamp);
  s.speed = s.stumbleT > 0 ? targetSpeed * 0.45 : targetSpeed;
  s.distance += (s.speed * dt) / CFG.pxPerMetre;
  s.scrollX = s.distance * CFG.pxPerMetre - CFG.turkeyX;
  s.runPhase += dt * (s.speed / 26);
  s.score = Math.floor(s.distance * 10) + s.corn * 50;

  // Farmer: closes in on stumbles, drifts back while the run is clean.
  if (s.stumbleT <= 0) s.farmerGap = Math.min(CFG.farmerGapStart, s.farmerGap + CFG.farmerRecover * dt);
  if (s.farmerGap <= CFG.farmerGapMin + 1) { endRun(false); return; }

  // Vertical physics.
  s.turkeyVy += CFG.gravity * dt;
  s.turkeyY -= s.turkeyVy * dt;
  if (s.turkeyY <= 0) {
    s.turkeyY = 0;
    s.turkeyVy = 0;
    s.jumps = 0;
  }
  // Slide timer.
  if (s.slideT > 0) {
    s.slideT -= dt;
    if (s.slideT <= 0) s.sliding = false;
  }
  if (s.slideCd > 0) s.slideCd -= dt;
  if (s.stumbleT > 0) s.stumbleT -= dt;
  if (s.invulnT > 0) s.invulnT -= dt;

  // Dust puffs while running on the ground.
  if (s.turkeyY <= 0 && Math.random() < dt * 14) {
    s.particles.push({
      x: CFG.turkeyX - 44, y: CFG.groundY - 4,
      vx: -40 - Math.random() * 40, vy: -14 - Math.random() * 22,
      r: 2 + Math.random() * 3, color: '#c8a06a', life: 0.4, max: 0.4,
    });
  }

  // Hazards: collision, and a clean pass is worth 10 points of relief.
  const tb = turkeyBox();
  for (const hz of s.world.hazards) {
    const hx = hz.x - s.scrollX;
    if (hx < -200 || hx > CFG.viewW + 200) continue;
    if (!hz.passed && hx < CFG.turkeyX - 60) {
      hz.passed = true;
      if (!hz.hit) s.score += 10;
    }
    if (!hz.hit && overlap(tb, hazardBox(hz))) hitObstacle(hz);
    if (s.state !== 'play') return;
  }

  // Corn.
  for (const c of s.world.corns) {
    if (c.taken) continue;
    const cx = c.x - s.scrollX;
    if (cx < -40 || cx > CFG.viewW + 40) continue;
    const dx = cx - CFG.turkeyX;
    const dy = c.y - (CFG.groundY - s.turkeyY - 46);
    if (Math.abs(dx) < 52 && Math.abs(dy) < 62) {
      c.taken = true;
      s.corn += 1;
      s.score += 50;
      audio.corn();
      floater(cx, c.y - 30, '+50');
      burst(cx, c.y, '#f2c230', 6, 70);
    }
  }

  // The gate: crossing it is the win.
  if (s.distance >= CFG.totalDistance) {
    endRun(true);
  }
}

// --- Input: keyboard and mouse/touch. ---
window.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  const k = e.key;
  if (k === ' ' || k === 'ArrowUp' || k === 'w' || k === 'W') {
    e.preventDefault();
    doJump();
  } else if (k === 'ArrowDown' || k === 's' || k === 'S') {
    e.preventDefault();
    doSlide();
  } else if (k === 'p' || k === 'P') {
    if (s.state === 'play') { s.state = 'paused'; announce('Paused.'); }
    else if (s.state === 'paused') { s.state = 'play'; announce('Running!'); }
  } else if (k === 'r' || k === 'R') {
    startRun();
  } else if (k === 'm' || k === 'M') {
    const m = audio.toggleMute();
    announce(m ? 'Muted.' : 'Sound on.');
  }
});
canvas.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  audio.unlock();
  if (s.state === 'title' || s.state === 'caught' || s.state === 'escaped') startRun();
  else doJump();
});
canvas.addEventListener('contextmenu', (e) => e.preventDefault());

// --- Main loop. ---
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!s.frozen) update(dt);
  draw(ctx, s);
  requestAnimationFrame(frame);
}

if (shotName) {
  // A staged screenshot: freeze the simulation on one composed frame.
  stageShot(s, shotName);
  s.frozen = true;
  draw(ctx, s);
} else {
  requestAnimationFrame(frame);
}

// Exposed for headless play-testing: drive the game from the console or CDP.
window.__tld = {
  state: () => s,
  start: startRun,
  jump: doJump,
  slide: doSlide,
};
