// Tiny synthesized sound: no audio files, everything is an oscillator through
// one master gain. The context is created on the first player gesture, so
// browsers never block it, and M toggles mute.
let ctx = null;
let master = null;
let muted = false;

function ensure() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.22;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, dur, type = 'sine', vol = 1, when = 0, slideTo = null) {
  const c = ensure();
  if (!c) return;
  const t0 = c.currentTime + when;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g);
  g.connect(master);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}

export const audio = {
  unlock() {
    ensure();
  },
  toggleMute() {
    muted = !muted;
    if (master) master.gain.value = muted ? 0 : 0.22;
    return muted;
  },
  get muted() {
    return muted;
  },
  jump() {
    tone(420, 0.16, 'triangle', 0.9, 0, 760);
  },
  flap() {
    tone(300, 0.1, 'triangle', 0.5, 0, 520);
  },
  corn() {
    tone(880, 0.09, 'sine', 0.7);
    tone(1320, 0.12, 'sine', 0.5, 0.06);
  },
  hit() {
    tone(160, 0.28, 'sawtooth', 0.9, 0, 55);
    tone(90, 0.3, 'square', 0.5, 0.02, 45);
  },
  caught() {
    tone(220, 0.5, 'sawtooth', 0.8, 0, 110);
    tone(165, 0.7, 'sawtooth', 0.8, 0.35, 82);
  },
  escaped() {
    // A little dusk fanfare: C–E–G–C up the scale.
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.28, 'triangle', 0.7, i * 0.11));
  },
  click() {
    tone(660, 0.05, 'square', 0.35);
  },
};
