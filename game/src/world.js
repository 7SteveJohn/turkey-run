// The farmyard the turkey runs through: scenery, hazards and corn, all laid
// out along the 1200 m course and scrolled past the turkey. Scenery is
// generated from the run seed so a staged screenshot is stable; hazards are
// placed by the run's own seeded planner so the course is fair (never two
// tall jumps back to back, never a knife where a fence lands).
import { CFG } from './config.js';
import { mulberry32, pick } from './rng.js';

// Hazard kinds and how the turkey beats them.
export const HAZARDS = {
  fence: { w: 46, h: 74, beat: 'jump', label: 'FENCE' },
  hay: { w: 84, h: 62, beat: 'jump', label: 'HAY BALE' },
  oven: { w: 128, h: 150, beat: 'jump', label: 'OVEN' },
  cleaver: { w: 74, h: 46, beat: 'slide', label: 'CLEAVER' },
  gravy: { w: 120, h: 18, beat: 'jump', label: 'GRAVY' },
};

export function buildWorld(seed) {
  const rng = mulberry32(seed);
  const world = {
    seed,
    // Scenery strips, generated in 160 px slices across the whole course.
    clouds: [],
    trees: [],
    barns: [],
    fences: [],
    stalks: [],
    bales: [],
    hazards: [],
    corns: [],
    gateX: CFG.totalDistance * CFG.pxPerMetre, // world x of the forest gate
  };

  const coursePx = CFG.totalDistance * CFG.pxPerMetre + 900;
  for (let x = -200; x < coursePx; x += 160) {
    if (rng() < 0.2) world.clouds.push({ x: x + rng() * 120, y: 50 + rng() * 100, s: 0.5 + rng() * 0.5 });
    if (rng() < 0.45) world.trees.push({ x: x + rng() * 140, h: 70 + rng() * 80, kind: pick(rng, ['pine', 'oak', 'pine']) });
    if (rng() < 0.5) world.stalks.push({ x: x + rng() * 150, h: 46 + rng() * 30 });
    if (rng() < 0.22) world.bales.push({ x: x + rng() * 120 });
  }
  // The barn and silo sit near the start, the farmhouse mid-course.
  world.barns.push({ x: 420, kind: 'barn' });
  world.barns.push({ x: 640, kind: 'silo' });
  world.barns.push({ x: CFG.totalDistance * CFG.pxPerMetre * 0.52, kind: 'house' });

  // Fence posts line the lane all the way to the forest.
  for (let x = 0; x < coursePx; x += 118) world.fences.push({ x });

  // --- Hazards, planned in metres so the course stays fair. ---
  let d = CFG.firstHazardAt;
  let lastKind = null;
  let nextOven = CFG.ovenEveryMin + rng() * (CFG.ovenEveryMax - CFG.ovenEveryMin);
  while (d < CFG.totalDistance - 60) {
    let kind;
    if (d >= nextOven) {
      kind = 'oven';
      nextOven = d + CFG.ovenEveryMin + rng() * (CFG.ovenEveryMax - CFG.ovenEveryMin);
    } else {
      const pool = ['fence', 'hay', 'cleaver', 'gravy'];
      kind = pick(rng, pool);
      // Never the same tall jump twice in a row, and never a slide-knife
      // right after a jump — the player needs one clean beat at a time.
      if (kind === lastKind && (kind === 'fence' || kind === 'hay')) kind = 'cleaver';
      if (lastKind === 'cleaver' && kind === 'fence') kind = 'hay';
    }
    world.hazards.push({ kind, d, x: d * CFG.pxPerMetre, hit: false, passed: false });
    lastKind = kind;
    d += CFG.hazardGapMin + rng() * (CFG.hazardGapMax - CFG.hazardGapMin);
  }

  // --- Corn: little arcs of three kernels between hazards. ---
  let cd = 24;
  while (cd < CFG.totalDistance - 40) {
    const nearHazard = world.hazards.some((h) => Math.abs(h.d - cd) < 14);
    if (!nearHazard) {
      const base = cd * CFG.pxPerMetre;
      const arc = rng() < 0.5 ? 'low' : 'high';
      for (let i = 0; i < 3; i++) {
        world.corns.push({
          x: base + i * 34,
          y: arc === 'low' ? CFG.groundY - 52 : CFG.groundY - 150 - (i === 1 ? 34 : 0),
          taken: false,
        });
      }
    }
    cd += CFG.cornGapMin + rng() * (CFG.cornGapMax - CFG.cornGapMin);
  }
  return world;
}
