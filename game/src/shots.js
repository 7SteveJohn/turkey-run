// Screenshot staging: put the real simulation into one composed frame and
// hold it, so the screenshots are the game itself, not a mock-up.
//   ?shot=title   — the title screen over the dusk farmyard
//   ?shot=chase   — the cover: turkey mid-leap, farmer closing in behind with
//                   the cleaver high, the oven glowing ahead, HUD on top
//   ?shot=oven    — clearing an oven's heat on the jump arc
//   ?shot=escaped — the win screen at the forest gate
import { CFG } from './config.js';

function setPlay(s, { distance, score, corn, lives, farmerGap, turkeyY, sliding, phase }) {
  s.state = 'play';
  s.distance = distance;
  s.score = score;
  s.corn = corn;
  s.lives = lives;
  s.farmerGap = farmerGap;
  s.turkeyY = turkeyY;
  s.sliding = sliding;
  s.runPhase = phase;
  s.speed = CFG.startSpeed + distance * CFG.speedRamp;
  s.scrollX = distance * CFG.pxPerMetre - CFG.turkeyX;
  s.time = 12.4; // late dusk: sun low, sky at its richest
}

export function stageShot(s, name) {
  if (name === 'title') {
    s.state = 'title';
    s.time = 12.4;
    // Open stretch of track: barn and silo off to the left, the turkey and
    // the farmer standing clear against the dusk sky.
    s.scrollX = 1200;
    s.runPhase = 1.2;
    return;
  }
  if (name === 'chase') {
    // The decisive frame: 640 m in, score 6,480, the farmer a clear step
    // behind with the cleaver up (no overlap with the bird), the turkey at
    // the top of its jump over a fence, and the next oven glowing ahead.
    setPlay(s, { distance: 640, score: 6480, corn: 8, lives: 3, farmerGap: 92, turkeyY: 118, sliding: false, phase: 2.1 });
    s.warn = true; // keep the "right behind you" alarm on for the cover
    // Compose the course around this frame: a fence under the turkey, an
    // oven ahead, a cleaver spinning in, corn arcing overhead.
    const base = s.scrollX;
    s.world.hazards.push(
      { kind: 'fence', d: 0, x: base + CFG.turkeyX, hit: false, passed: false },
      { kind: 'oven', d: 0, x: base + 1010, hit: false, passed: false },
      { kind: 'cleaver', d: 0, x: base + 760, hit: false, passed: false },
    );
    s.world.corns.push(
      { x: base + 560, y: CFG.groundY - 190, taken: false },
      { x: base + 594, y: CFG.groundY - 224, taken: false },
      { x: base + 628, y: CFG.groundY - 190, taken: false },
    );
    return;
  }
  if (name === 'oven') {
    // Mid-flight over the oven door: heat shimmer, door glowing, farmer
    // well back so he never overlaps the oven, one life already lost.
    setPlay(s, { distance: 428, score: 4410, corn: 5, lives: 2, farmerGap: 150, turkeyY: 172, sliding: false, phase: 4.4 });
    const base = s.scrollX;
    s.world.hazards.push({ kind: 'oven', d: 0, x: base + CFG.turkeyX, hit: false, passed: false });
    s.world.hazards.push({ kind: 'cleaver', d: 0, x: base + 880, hit: false, passed: false });
    return;
  }
  if (name === 'escaped') {
    s.state = 'escaped';
    s.distance = CFG.totalDistance;
    s.score = 12840;
    s.corn = 14;
    s.lives = 2;
    s.time = 12.4;
    // Gate on the right, turkey clear of it on the left: both read at once.
    // Clear any near tree that would fall across the gate on screen.
    s.scrollX = s.world.gateX - 1050;
    s.world.trees = s.world.trees.filter((tr) => {
      const sx = tr.x - s.scrollX * 0.8;
      return sx < 720 || sx > 1280;
    });
    s.runPhase = 0.6;
    s.best = 12840;
    for (let i = 0; i < 26; i++) {
      s.particles.push({
        x: 200 + Math.random() * 880, y: 120 + Math.random() * 380,
        vx: (Math.random() - 0.5) * 30, vy: 12 + Math.random() * 26,
        r: 3 + Math.random() * 4, color: ['#7ddb6a', '#ffe9a8', '#f2c230'][i % 3],
        life: 5, max: 5,
      });
    }
    return;
  }
  // Unknown ?shot=: fall back to the title screen.
  s.state = 'title';
  s.time = 12.4;
}
