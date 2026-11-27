// Turkey's Last Dash — every pixel the player sees, drawn on one Canvas 2D.
// Dusk on the farm: a low amber sun, purple sky, silhouetted barn and pines,
// and the turkey itself, big and readable, mid-stride in the middle of it all.
// No images, no fonts fetched: everything is paths, gradients and system type.
import { CFG } from './config.js';
import { HAZARDS } from './world.js';

const W = CFG.viewW;
const H = CFG.viewH;
const GROUND = CFG.groundY;

function sky(ctx, t) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#2b1a4e');
  g.addColorStop(0.42, '#7a2f5e');
  g.addColorStop(0.68, '#e2603c');
  g.addColorStop(0.86, '#f7a83c');
  g.addColorStop(1, '#ffd98a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // Low sun, half-sunk behind the far trees.
  const sx = W * 0.72;
  const sy = 430 + Math.sin(t * 0.1) * 2;
  const glow = ctx.createRadialGradient(sx, sy, 10, sx, sy, 260);
  glow.addColorStop(0, 'rgba(255, 214, 120, 0.95)');
  glow.addColorStop(0.35, 'rgba(255, 160, 70, 0.55)');
  glow.addColorStop(1, 'rgba(255, 140, 60, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(sx - 260, sy - 260, 520, 520);
  ctx.fillStyle = '#ffe9a8';
  ctx.beginPath();
  ctx.arc(sx, sy, 52, 0, Math.PI * 2);
  ctx.fill();
  // A few early stars up high.
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  for (let i = 0; i < 14; i++) {
    const x = (i * 173 + 40) % W;
    const y = 18 + ((i * 67) % 120);
    ctx.globalAlpha = 0.25 + 0.45 * Math.abs(Math.sin(t * 0.8 + i));
    ctx.fillRect(x, y, 2.5, 2.5);
  }
  ctx.globalAlpha = 1;
}

function cloud(ctx, x, y, s, a) {
  ctx.fillStyle = `rgba(255, 190, 150, ${a})`;
  ctx.beginPath();
  ctx.ellipse(x, y, 52 * s, 15 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(x - 30 * s, y + 6 * s, 32 * s, 11 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 32 * s, y + 6 * s, 34 * s, 12 * s, 0, 0, Math.PI * 2);
  ctx.fill();
}

function tree(ctx, x, baseY, h, kind, color = '#3a1f33') {
  ctx.fillStyle = color;
  if (kind === 'pine') {
    ctx.beginPath();
    ctx.moveTo(x, baseY - h);
    ctx.lineTo(x - h * 0.32, baseY - h * 0.35);
    ctx.lineTo(x - h * 0.16, baseY - h * 0.35);
    ctx.lineTo(x - h * 0.38, baseY);
    ctx.lineTo(x + h * 0.38, baseY);
    ctx.lineTo(x + h * 0.16, baseY - h * 0.35);
    ctx.lineTo(x + h * 0.32, baseY - h * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(x - 4, baseY - 8, 8, 10);
  } else {
    ctx.beginPath();
    ctx.arc(x, baseY - h * 0.72, h * 0.42, 0, Math.PI * 2);
    ctx.arc(x - h * 0.3, baseY - h * 0.5, h * 0.3, 0, Math.PI * 2);
    ctx.arc(x + h * 0.3, baseY - h * 0.5, h * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x - 5, baseY - h * 0.5, 10, h * 0.5);
  }
}

function barn(ctx, x, kind) {
  ctx.save();
  ctx.translate(x, 0);
  if (kind === 'silo') {
    ctx.fillStyle = '#5a2e4a';
    ctx.fillRect(-34, GROUND - 210, 68, 210);
    ctx.fillStyle = '#7a3a5e';
    ctx.beginPath();
    ctx.ellipse(0, GROUND - 210, 34, 26, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,220,160,0.25)';
    ctx.fillRect(-34, GROUND - 170, 10, 170);
    ctx.restore();
    return;
  }
  const w = kind === 'house' ? 190 : 230;
  const h = kind === 'house' ? 120 : 150;
  ctx.fillStyle = kind === 'house' ? '#4a2438' : '#6e2b2b';
  ctx.fillRect(-w / 2, GROUND - h, w, h);
  ctx.fillStyle = '#3a1a2e';
  ctx.beginPath();
  ctx.moveTo(-w / 2 - 16, GROUND - h);
  ctx.lineTo(0, GROUND - h - 62);
  ctx.lineTo(w / 2 + 16, GROUND - h);
  ctx.closePath();
  ctx.fill();
  // Lit windows: someone is home, and the oven is on.
  ctx.fillStyle = '#ffca6a';
  ctx.fillRect(-w / 2 + 26, GROUND - h + 34, 30, 34);
  ctx.fillRect(w / 2 - 56, GROUND - h + 34, 30, 34);
  ctx.fillStyle = '#2a1420';
  ctx.fillRect(-w / 2 + 26, GROUND - h + 49, 30, 3);
  ctx.fillRect(w / 2 - 56, GROUND - h + 49, 30, 3);
  if (kind === 'barn') {
    ctx.strokeStyle = 'rgba(255,220,160,0.5)';
    ctx.lineWidth = 4;
    ctx.strokeRect(-26, GROUND - 84, 52, 84);
    ctx.beginPath();
    ctx.moveTo(-26, GROUND - 84);
    ctx.lineTo(26, GROUND);
    ctx.moveTo(26, GROUND - 84);
    ctx.lineTo(-26, GROUND);
    ctx.stroke();
  }
  ctx.restore();
}

function ground(ctx, scrollX, t) {
  // Dirt track with a grassy verge, scrolled by the world.
  const g = ctx.createLinearGradient(0, GROUND, 0, H);
  g.addColorStop(0, '#8a5a2e');
  g.addColorStop(0.25, '#6e421f');
  g.addColorStop(1, '#3d2412');
  ctx.fillStyle = g;
  ctx.fillRect(0, GROUND, W, H - GROUND);
  ctx.fillStyle = '#5c7a2e';
  ctx.fillRect(0, GROUND, W, 10);
  // Track ruts and pebbles, scrolling with the world.
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  const off = ((scrollX % 90) + 90) % 90;
  for (let x = -off; x < W; x += 90) {
    ctx.beginPath();
    ctx.ellipse(x + 30, GROUND + 46, 26, 5, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 64, GROUND + 88, 18, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(60,30,10,0.5)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, GROUND + 26);
  ctx.lineTo(W, GROUND + 26);
  ctx.moveTo(0, GROUND + 108);
  ctx.lineTo(W, GROUND + 108);
  ctx.stroke();
  // Grass tufts along the verge.
  ctx.strokeStyle = '#7da23a';
  ctx.lineWidth = 2;
  const toff = ((scrollX % 70) + 70) % 70;
  for (let x = -toff; x < W; x += 70) {
    ctx.beginPath();
    ctx.moveTo(x, GROUND + 2);
    ctx.lineTo(x - 4, GROUND - 12);
    ctx.moveTo(x + 5, GROUND + 2);
    ctx.lineTo(x + 8, GROUND - 14);
    ctx.stroke();
  }
}

function fencePost(ctx, x) {
  ctx.fillStyle = '#7a4a26';
  ctx.fillRect(x - 5, GROUND - 58, 10, 58);
  ctx.fillStyle = '#8f5a30';
  ctx.beginPath();
  ctx.moveTo(x - 6, GROUND - 58);
  ctx.lineTo(x, GROUND - 68);
  ctx.lineTo(x + 6, GROUND - 58);
  ctx.closePath();
  ctx.fill();
}

function cornStalk(ctx, x, h) {
  ctx.strokeStyle = '#4e7a26';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x, GROUND);
  ctx.quadraticCurveTo(x + 6, GROUND - h * 0.6, x - 2, GROUND - h);
  ctx.stroke();
  ctx.fillStyle = '#f2c230';
  ctx.beginPath();
  ctx.ellipse(x + 8, GROUND - h * 0.55, 7, 15, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7da23a';
  ctx.beginPath();
  ctx.ellipse(x - 12, GROUND - h * 0.4, 16, 5, -0.5, 0, Math.PI * 2);
  ctx.ellipse(x + 12, GROUND - h * 0.7, 16, 5, 0.5, 0, Math.PI * 2);
  ctx.fill();
}

function hayBale(ctx, x) {
  ctx.fillStyle = '#c8933a';
  ctx.beginPath();
  ctx.arc(x, GROUND - 26, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#8a6420';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, GROUND - 26, 22, 0, Math.PI * 2);
  ctx.arc(x, GROUND - 26, 12, 0, Math.PI * 2);
  ctx.stroke();
}

// --- The turkey: a big, readable bird. runPhase drives the legs and wings. ---
function drawTurkey(ctx, x, y, o) {
  // y is the ground contact point; body sits above it. o: {phase, slide, stumble, invuln, air}
  ctx.save();
  ctx.translate(x, y);
  // Big and readable: the turkey is the star, so it draws larger than life.
  ctx.scale(1.18, 1.18);
  if (o.invuln && Math.floor(o.time * 14) % 2 === 0) ctx.globalAlpha = 0.35;
  const legSwing = o.air ? 0.5 : Math.sin(o.phase) * 0.9;
  const bodyBob = o.air ? 0 : Math.abs(Math.sin(o.phase)) * 3;

  if (o.slide) {
    // Low slide: body horizontal, tail up, feet forward.
    ctx.rotate(0.5);
    ctx.translate(0, 26);
  }
  // Tail fan.
  ctx.fillStyle = '#7a4a1e';
  for (let i = -2; i <= 2; i++) {
    ctx.save();
    ctx.rotate(i * 0.32 - 0.5);
    ctx.beginPath();
    ctx.ellipse(-34, -26, 10, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = i % 2 ? '#5e3614' : '#8a5a26';
    ctx.restore();
  }
  // Legs.
  ctx.strokeStyle = '#e07b2e';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  const hipY = -34;
  ctx.beginPath();
  ctx.moveTo(-6, hipY);
  ctx.lineTo(-6 + legSwing * 16, 0);
  ctx.moveTo(8, hipY);
  ctx.lineTo(8 - legSwing * 16, 0);
  ctx.stroke();
  // Body.
  const bodyG = ctx.createLinearGradient(0, -78, 0, -20);
  bodyG.addColorStop(0, '#a06a30');
  bodyG.addColorStop(1, '#6e421a');
  ctx.fillStyle = bodyG;
  ctx.beginPath();
  ctx.ellipse(0, -46 + bodyBob, 46, 36, 0, 0, Math.PI * 2);
  ctx.fill();
  // Wing, flapping with the run.
  const flap = o.air ? -0.7 : Math.sin(o.phase * 1.0) * 0.35 - 0.25;
  ctx.save();
  ctx.translate(-4, -48 + bodyBob);
  ctx.rotate(flap);
  ctx.fillStyle = '#5e3614';
  ctx.beginPath();
  ctx.ellipse(-14, 0, 26, 15, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8a5a26';
  ctx.beginPath();
  ctx.ellipse(-12, -2, 18, 9, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // Neck and head.
  ctx.strokeStyle = '#8a5a26';
  ctx.lineWidth = 13;
  ctx.beginPath();
  ctx.moveTo(30, -62 + bodyBob);
  ctx.quadraticCurveTo(44, -84 + bodyBob, 42, -96 + bodyBob);
  ctx.stroke();
  ctx.fillStyle = '#c98a4a';
  ctx.beginPath();
  ctx.arc(42, -100 + bodyBob, 15, 0, Math.PI * 2);
  ctx.fill();
  // Beak, wattle, eye — the face that sells the panic.
  ctx.fillStyle = '#e8a020';
  ctx.beginPath();
  ctx.moveTo(54, -102 + bodyBob);
  ctx.lineTo(70, -96 + bodyBob);
  ctx.lineTo(54, -92 + bodyBob);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#d9382b';
  ctx.beginPath();
  ctx.ellipse(50, -86 + bodyBob, 5, 9, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1c0f08';
  ctx.beginPath();
  ctx.arc(46, -104 + bodyBob, 3.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(47.5, -105.5 + bodyBob, 1.2, 0, Math.PI * 2);
  ctx.fill();
  // Panic sweat drop when stumbling.
  if (o.stumble) {
    ctx.fillStyle = '#bfe6ff';
    ctx.beginPath();
    ctx.ellipse(66, -122 + bodyBob, 5, 8, 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// --- The farmer: tall, aproned, cleaver raised, gaining on the bird. ---
function drawFarmer(ctx, x, y, o) {
  // y is ground contact; o: {phase, gap, raising} — the closer the gap, the higher the cleaver.
  ctx.save();
  ctx.translate(x, y);
  const swing = Math.sin(o.phase) * 0.8;
  const menace = Math.max(0, 1 - o.gap / 160); // 0 far away, 1 right behind
  // Legs, pounding.
  ctx.strokeStyle = '#3a2a1c';
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-8, -78);
  ctx.lineTo(-8 + swing * 20, 0);
  ctx.moveTo(10, -78);
  ctx.lineTo(10 - swing * 20, 0);
  ctx.stroke();
  // Body: shirt and apron.
  ctx.fillStyle = '#7a2f28';
  ctx.beginPath();
  ctx.ellipse(0, -112, 34, 46, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#efe6d0';
  ctx.beginPath();
  ctx.moveTo(-24, -138);
  ctx.lineTo(24, -138);
  ctx.lineTo(18, -72);
  ctx.lineTo(-18, -72);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#c94f38';
  ctx.fillRect(-24, -140, 48, 8);
  // Head with straw hat.
  ctx.fillStyle = '#e8b88a';
  ctx.beginPath();
  ctx.arc(6, -168, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#d8a848';
  ctx.beginPath();
  ctx.ellipse(6, -180, 34, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(6, -182, 15, Math.PI, 0);
  ctx.fill();
  // Angry eyes and moustache.
  ctx.fillStyle = '#1c0f08';
  ctx.fillRect(12, -172, 8, 3);
  ctx.fillRect(24, -172, 8, 3);
  ctx.fillStyle = '#5e3a1a';
  ctx.fillRect(12, -160, 20, 5);
  // Back arm pumping; front arm raises the cleaver as he closes in.
  ctx.strokeStyle = '#7a2f28';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(-26, -128);
  ctx.lineTo(-44, -100 - swing * 12);
  ctx.stroke();
  const raise = -2.2 + menace * 0.7; // arm angle: raised high, higher still when close
  const hx = 30 + Math.cos(raise) * 34;
  const hy = -136 + Math.sin(raise) * 34;
  ctx.beginPath();
  ctx.moveTo(24, -132);
  ctx.lineTo(hx, hy);
  ctx.stroke();
  // The carving knife, catching the sun.
  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(raise + 0.9);
  const steel = ctx.createLinearGradient(0, 0, 34, 0);
  steel.addColorStop(0, '#dfe6ea');
  steel.addColorStop(1, '#9aa8b0');
  ctx.fillStyle = steel;
  ctx.beginPath();
  ctx.moveTo(0, -9);
  ctx.lineTo(36, -11);
  ctx.lineTo(42, 0);
  ctx.lineTo(36, 9);
  ctx.lineTo(0, 7);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#3a2418';
  ctx.fillRect(-14, -7, 14, 14);
  ctx.restore();
  ctx.restore();
}

function drawOven(ctx, x, t) {
  // A brick oven on the lane, door glowing, heat shimmering above it.
  ctx.save();
  ctx.translate(x, GROUND);
  ctx.fillStyle = '#8a3a28';
  ctx.beginPath();
  ctx.moveTo(-64, 0);
  ctx.lineTo(-64, -96);
  ctx.quadraticCurveTo(-64, -150, 0, -150);
  ctx.quadraticCurveTo(64, -150, 64, -96);
  ctx.lineTo(64, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 2;
  for (let r = 0; r < 3; r++) {
    ctx.beginPath();
    ctx.moveTo(-60, -34 - r * 38);
    ctx.lineTo(60, -34 - r * 38);
    ctx.stroke();
  }
  // Glowing door.
  const flick = 0.75 + Math.sin(t * 9) * 0.12 + Math.sin(t * 23) * 0.08;
  const dg = ctx.createRadialGradient(0, -42, 4, 0, -42, 52);
  dg.addColorStop(0, `rgba(255, 220, 120, ${flick})`);
  dg.addColorStop(0.5, `rgba(255, 130, 40, ${flick * 0.85})`);
  dg.addColorStop(1, 'rgba(180, 50, 10, 0.9)');
  ctx.fillStyle = dg;
  ctx.beginPath();
  ctx.arc(0, -42, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2a1208';
  ctx.beginPath();
  ctx.arc(0, -42, 34, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = '#1c0d06';
  ctx.fillRect(-40, -84, 80, 10);
  // Heat shimmer rising from the door.
  ctx.strokeStyle = `rgba(255, 180, 90, ${0.5 * flick})`;
  ctx.lineWidth = 3;
  for (let i = 0; i < 3; i++) {
    const wx = -26 + i * 26;
    ctx.beginPath();
    ctx.moveTo(wx, -88);
    ctx.quadraticCurveTo(wx + 8, -116 - Math.sin(t * 6 + i) * 6, wx - 4, -142);
    ctx.stroke();
  }
  // Chimney with a lazy smoke curl.
  ctx.fillStyle = '#6e2a1e';
  ctx.fillRect(34, -168, 20, 24);
  ctx.fillStyle = 'rgba(230,220,210,0.5)';
  const sy = -176 - ((t * 22) % 40);
  ctx.beginPath();
  ctx.arc(44 + Math.sin(t * 2) * 6, sy, 9, 0, Math.PI * 2);
  ctx.arc(50, sy - 14, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCleaverHazard(ctx, x, t, warn = true) {
  // A carving knife spinning through the air at head height: slide under it.
  // Drawn big, blade catching the sun, with a red warning chevron above.
  const y = GROUND - 112 + Math.sin(t * 2.4) * 6;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(t * 2.4);
  const steel = ctx.createLinearGradient(-40, 0, 44, 0);
  steel.addColorStop(0, '#f2f6f8');
  steel.addColorStop(1, '#7e8c96');
  ctx.fillStyle = steel;
  ctx.beginPath();
  ctx.moveTo(-44, -13);
  ctx.lineTo(34, -16);
  ctx.lineTo(48, 0);
  ctx.lineTo(34, 14);
  ctx.lineTo(-44, 11);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(60,30,10,0.6)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#3a2418';
  ctx.fillRect(-62, -10, 20, 20);
  ctx.fillStyle = '#c8933a';
  ctx.fillRect(-62, -10, 20, 4);
  ctx.restore();
  // Motion arc and a warning chevron above.
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, 72, -0.6, 0.9);
  ctx.stroke();
  if (warn) {
    ctx.fillStyle = '#ffcf3d';
    ctx.beginPath();
    ctx.moveTo(x, y - 84);
    ctx.lineTo(x - 12, y - 102);
    ctx.lineTo(x + 12, y - 102);
    ctx.closePath();
    ctx.fill();
  }
}

function drawFenceHazard(ctx, x, warn = true) {
  ctx.fillStyle = '#7a4a26';
  ctx.fillRect(x - 23, GROUND - 74, 10, 74);
  ctx.fillRect(x + 13, GROUND - 74, 10, 74);
  ctx.fillStyle = '#9a6234';
  ctx.fillRect(x - 30, GROUND - 66, 60, 9);
  ctx.fillRect(x - 30, GROUND - 38, 60, 9);
  if (warn) {
    ctx.fillStyle = '#ffcf3d';
    ctx.beginPath();
    ctx.moveTo(x, GROUND - 108);
    ctx.lineTo(x - 11, GROUND - 92);
    ctx.lineTo(x + 11, GROUND - 92);
    ctx.closePath();
    ctx.fill();
  }
}

function drawHayHazard(ctx, x, warn = true) {
  hayBale(ctx, x);
  if (warn) {
    ctx.fillStyle = '#ffcf3d';
    ctx.beginPath();
    ctx.moveTo(x, GROUND - 96);
    ctx.lineTo(x - 11, GROUND - 80);
    ctx.lineTo(x + 11, GROUND - 80);
    ctx.closePath();
    ctx.fill();
  }
}

function drawGravy(ctx, x, warn = true) {
  ctx.fillStyle = '#5e3016';
  ctx.beginPath();
  ctx.ellipse(x, GROUND - 4, 62, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 200, 120, 0.5)';
  ctx.beginPath();
  ctx.ellipse(x - 18, GROUND - 8, 22, 4, -0.2, 0, Math.PI * 2);
  ctx.fill();
  if (warn) {
    ctx.fillStyle = '#ffcf3d';
    ctx.font = 'bold 15px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GRAVY!', x, GROUND - 34);
  }
}

function drawCorn(ctx, x, y, t) {
  const bob = Math.sin(t * 4 + x * 0.05) * 3;
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.fillStyle = 'rgba(242, 194, 48, 0.3)';
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f2c230';
  ctx.beginPath();
  ctx.ellipse(0, 0, 8, 13, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c8931e';
  for (let i = -1; i <= 1; i++) {
    ctx.fillRect(i * 4 - 1, -8, 2, 16);
  }
  ctx.restore();
}

function drawGate(ctx, x, t) {
  // The forest gate: two pines, a wooden arch, and green light beyond.
  ctx.save();
  ctx.translate(x, GROUND);
  const glow = ctx.createLinearGradient(0, -260, 0, 0);
  glow.addColorStop(0, 'rgba(140, 255, 150, 0.85)');
  glow.addColorStop(1, 'rgba(60, 140, 70, 0.9)');
  ctx.fillStyle = glow;
  ctx.fillRect(-110, -250, 220, 250);
  // Flanking pines in deep green, not silhouette black: they frame the
  // glow instead of swallowing it.
  tree(ctx, -150, 0, 210, 'pine', '#1f4d2a');
  tree(ctx, 150, 0, 225, 'pine', '#26532e');
  tree(ctx, -195, 0, 165, 'oak', '#1f4d2a');
  tree(ctx, 195, 0, 175, 'oak', '#26532e');
  ctx.fillStyle = '#5e3a1e';
  ctx.fillRect(-128, -240, 22, 240);
  ctx.fillRect(106, -240, 22, 240);
  ctx.fillStyle = '#7a4a26';
  ctx.fillRect(-138, -252, 276, 24);
  ctx.fillStyle = '#ffcf3d';
  ctx.font = 'bold 26px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('★ FOREST ★', 0, -262);
  ctx.restore();
}

function drawParticles(ctx, particles) {
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function heart(ctx, x, y, s, filled) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = filled ? '#ff4d6d' : 'rgba(255,255,255,0.25)';
  ctx.beginPath();
  ctx.moveTo(0, 8);
  ctx.bezierCurveTo(-12, -2, -8, -12, 0, -5);
  ctx.bezierCurveTo(8, -12, 12, -2, 0, 8);
  ctx.fill();
  ctx.restore();
}

function hud(ctx, s) {
  const remaining = Math.max(0, CFG.totalDistance - s.distance);
  // Top bar.
  ctx.fillStyle = 'rgba(20, 8, 20, 0.55)';
  ctx.fillRect(0, 0, W, 86);
  // Score, big.
  ctx.textAlign = 'left';
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 15px Arial, sans-serif';
  ctx.fillText('SCORE', 22, 26);
  ctx.font = 'bold 40px Arial, sans-serif';
  ctx.fillText(String(s.score).padStart(5, '0'), 20, 66);
  // Distance bar, centre.
  const bx = W / 2 - 260;
  const by = 22;
  const bw = 520;
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillRect(bx, by, bw, 20);
  const done = s.distance / CFG.totalDistance;
  const dg = ctx.createLinearGradient(bx, 0, bx + bw, 0);
  dg.addColorStop(0, '#ffb03d');
  dg.addColorStop(1, '#7ddb6a');
  ctx.fillStyle = dg;
  ctx.fillRect(bx, by, bw * done, 20);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.strokeRect(bx, by, bw, 20);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 15px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`FOREST GATE  ·  ${Math.ceil(remaining)} m TO FREEDOM`, W / 2, by + 38);
  // Turkey marker on the bar (a plain letter: headless runs have no emoji font).
  ctx.fillStyle = '#ffe9a8';
  ctx.beginPath();
  ctx.arc(bx + bw * done, by + 10, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2a1420';
  ctx.font = 'bold 11px Arial, sans-serif';
  ctx.fillText('T', bx + bw * done, by + 14);
  // Lives + corn, right.
  ctx.textAlign = 'right';
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 15px Arial, sans-serif';
  ctx.fillText('LIVES', W - 22, 26);
  for (let i = 0; i < CFG.lives; i++) heart(ctx, W - 34 - i * 34, 52, 1.5, i < s.lives);
  ctx.font = 'bold 17px Arial, sans-serif';
  ctx.fillStyle = '#f2c230';
  ctx.fillText(`🌽 ${s.corn}`, W - 22, 82 - 8);
  // Farmer warning.
  if ((s.farmerGap < 62 || s.warn) && s.state === 'play') {
    const blink = Math.floor(s.time * 6) % 2 === 0;
    if (blink) {
      ctx.fillStyle = '#ff4d4d';
      ctx.font = 'bold 30px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("HE'S RIGHT BEHIND YOU!", W / 2, 138);
    }
  }
  // Floating score popups.
  ctx.textAlign = 'center';
  for (const f of s.floaters) {
    ctx.globalAlpha = Math.max(0, f.life / 0.9);
    ctx.fillStyle = '#ffe9a8';
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.fillText(f.text, f.x, f.y);
  }
  ctx.globalAlpha = 1;
  // Speed + hint, bottom-left during play.
  if (s.state === 'play') {
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = 'bold 15px Arial, sans-serif';
    ctx.fillText(`SPEED ${(s.speed * 0.09).toFixed(0)} km/h   ·   SPACE jump · ↓ slide · P pause`, 18, H - 18);
  }
}

function bigText(ctx, text, y, size, color, stroke = '#2a1420') {
  ctx.font = `bold ${size}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.lineWidth = 8;
  ctx.strokeStyle = stroke;
  ctx.strokeText(text, W / 2, y);
  ctx.fillStyle = color;
  ctx.fillText(text, W / 2, y);
}

function titleScreen(ctx, s) {
  ctx.fillStyle = 'rgba(30, 10, 30, 0.38)';
  ctx.fillRect(0, 0, W, H);
  bigText(ctx, "TURKEY'S LAST DASH", 190, 84, '#ffe9a8');
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 26px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Thanksgiving dusk. One turkey. One farmer. One forest gate.', W / 2, 240);
  ctx.font = '20px Arial, sans-serif';
  ctx.fillStyle = '#ffe9a8';
  ctx.fillText('Outrun the farmer with the carving knife · leap the ovens · dodge the blades', W / 2, 278);
  ctx.fillText('Grab the corn for points · reach the forest gate and live to gobble another day', W / 2, 306);
  const pulse = 0.65 + Math.sin(s.time * 3) * 0.35;
  ctx.globalAlpha = pulse;
  bigText(ctx, 'PRESS SPACE OR CLICK TO RUN', 420, 44, '#ffcf3d');
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#fff';
  ctx.font = '18px Arial, sans-serif';
  ctx.fillText('SPACE / ↑ / CLICK — jump (twice in the air)      ↓ / S — slide under the cleavers', W / 2, 480);
  ctx.fillText('P — pause      R — restart      M — mute', W / 2, 510);
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '16px Arial, sans-serif';
  ctx.fillText('3 lives · every stumble lets the farmer closer · 1200 m to freedom', W / 2, 560);
}

function endScreen(ctx, s) {
  ctx.fillStyle = s.state === 'escaped' ? 'rgba(10, 40, 16, 0.32)' : 'rgba(30, 6, 6, 0.5)';
  ctx.fillRect(0, 0, W, H);
  if (s.state === 'escaped') {
    bigText(ctx, 'ESCAPED!', 190, 96, '#7ddb6a');
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 26px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('You burst through the forest gate — no dinner tonight!', W / 2, 250);
  } else {
    bigText(ctx, 'CAUGHT!', 190, 96, '#ff5a4d');
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 26px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('The farmer got his Thanksgiving dinner…', W / 2, 250);
    ctx.font = '20px Arial, sans-serif';
    ctx.fillStyle = '#ffd0c8';
    ctx.fillText(`You made it ${Math.floor(s.distance)} m of ${CFG.totalDistance} m — so close to the trees.`, W / 2, 288);
  }
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 26px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`SCORE  ${String(s.score).padStart(5, '0')}    ·    CORN ${s.corn}    ·    BEST ${String(s.best).padStart(5, '0')}`, W / 2, 400);
  const pulse = 0.65 + Math.sin(s.time * 3) * 0.35;
  ctx.globalAlpha = pulse;
  bigText(ctx, 'PRESS R OR CLICK TO RUN AGAIN', 545, 34, '#ffcf3d');
  ctx.globalAlpha = 1;
}

// --- The one entry point: draw the whole frame from the game state. ---
export function draw(ctx, s) {
  const scrollX = s.scrollX;
  const t = s.time;
  ctx.save();
  if (s.shake > 0) {
    ctx.translate((Math.random() - 0.5) * s.shake, (Math.random() - 0.5) * s.shake);
  }
  sky(ctx, t);
  // Clouds (far, sparse now: the sky should stay open).
  for (const c of s.world.clouds) {
    const x = ((c.x - scrollX * 0.15) % (W + 300) + W + 300) % (W + 300) - 150;
    cloud(ctx, x, c.y, c.s, 0.55);
  }
  // Far tree line.
  ctx.fillStyle = '#4a2340';
  ctx.beginPath();
  ctx.moveTo(0, GROUND - 40);
  for (let x = 0; x <= W; x += 40) {
    const wx = x + scrollX * 0.35;
    const h = 34 + Math.abs(Math.sin(wx * 0.021)) * 46;
    ctx.lineTo(x, GROUND - 40 - h);
    ctx.lineTo(x + 40, GROUND - 40);
  }
  ctx.lineTo(W, GROUND - 40);
  ctx.closePath();
  ctx.fill();
  // Midground: barns, silo, house.
  for (const b of s.world.barns) {
    const x = b.x - scrollX * 0.55;
    if (x > -320 && x < W + 320) barn(ctx, x, b.kind);
  }
  // Near scenery: trees, fence posts, corn stalks, bales.
  for (const tr of s.world.trees) {
    const x = tr.x - scrollX * 0.8;
    if (x > -160 && x < W + 160) tree(ctx, x, GROUND - 4, tr.h * 0.62, tr.kind);
  }
  ground(ctx, scrollX, t);
  for (const f of s.world.fences) {
    const x = f.x - scrollX;
    if (x > -20 && x < W + 20) fencePost(ctx, x);
  }
  for (const st of s.world.stalks) {
    const x = st.x - scrollX;
    if (x > -30 && x < W + 30) cornStalk(ctx, x, st.h);
  }
  for (const b of s.world.bales) {
    const x = b.x - scrollX;
    if (x > -60 && x < W + 60) hayBale(ctx, x);
  }
  // The forest gate, at the end of the course.
  const gateScreenX = s.world.gateX - scrollX;
  if (gateScreenX > -320 && gateScreenX < W + 320) drawGate(ctx, gateScreenX, t);
  // Corn pickups (hidden on the title screen: the menu is a clean yard).
  if (s.state !== 'title') {
    for (const c of s.world.corns) {
      if (c.taken) continue;
      const x = c.x - scrollX;
      if (x > -30 && x < W + 30) drawCorn(ctx, x, c.y, t);
    }
  }
  // Hazards. On the title screen the warnings stay off: the menu should
  // read as a farmyard, not a minefield.
  const showWarn = s.state !== 'title';
  for (const hz of s.world.hazards) {
    const x = hz.x - scrollX;
    if (x < -160 || x > W + 160) continue;
    if (s.state === 'title') continue;
    if (hz.kind === 'fence') drawFenceHazard(ctx, x, showWarn);
    else if (hz.kind === 'hay') drawHayHazard(ctx, x, showWarn);
    else if (hz.kind === 'oven') drawOven(ctx, x, t);
    else if (hz.kind === 'cleaver') drawCleaverHazard(ctx, x, t, showWarn);
    else if (hz.kind === 'gravy') drawGravy(ctx, x, showWarn);
    // A faint "passed" tick is not drawn: the course just keeps rolling.
  }
  // The farmer, always behind the turkey.
  const farmerX = CFG.turkeyX - s.farmerGap;
  drawFarmer(ctx, farmerX, GROUND, { phase: s.runPhase, gap: s.farmerGap });
  // The turkey.
  const turkeyY = GROUND - s.turkeyY;
  drawTurkey(ctx, CFG.turkeyX, turkeyY, {
    phase: s.runPhase,
    slide: s.sliding,
    stumble: s.stumbleT > 0,
    invuln: s.invulnT > 0,
    air: s.turkeyY > 2,
    time: t,
  });
  drawParticles(ctx, s.particles);
  ctx.restore();

  hud(ctx, s);
  if (s.state === 'title') titleScreen(ctx, s);
  else if (s.state === 'caught' || s.state === 'escaped') endScreen(ctx, s);
  else if (s.state === 'paused') {
    ctx.fillStyle = 'rgba(20, 8, 20, 0.6)';
    ctx.fillRect(0, 0, W, H);
    bigText(ctx, 'PAUSED', 330, 72, '#fff');
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Press P to keep running', W / 2, 400);
  }
}
