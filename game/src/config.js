// Turkey's Last Dash — tuning. One place for every number the game plays by,
// so the feel can be retuned without touching the simulation or the drawing.
export const CFG = {
  // Logical canvas; the canvas scales to the window, the game always thinks in these.
  viewW: 1280,
  viewH: 720,
  groundY: 600,

  // The run: 1200 metres of farmyard between the coop and the forest gate.
  totalDistance: 1200,
  startSpeed: 210, // px/s of world scroll at the start line
  maxSpeed: 430, // px/s once the turkey is flying down the lane
  speedRamp: 0.055, // extra px/s per metre covered
  pxPerMetre: 11.5, // world scroll per metre of the distance HUD

  // The turkey.
  turkeyX: 300, // fixed screen x; the world runs past it
  gravity: 2600,
  jumpVel: -980,
  doubleJumpVel: -820,
  slideTime: 0.55, // seconds a slide lasts
  slideCooldown: 0.25,

  // Lives and the farmer behind.
  lives: 3,
  farmerGapStart: 150, // px of breathing room at the start
  farmerGapMin: 26, // px: any closer and the cleaver comes down
  farmerGainPerHit: 52, // px the farmer closes on every stumble
  farmerRecover: 7, // px/s the gap re-opens while running clean
  stumbleTime: 0.85, // seconds of slowed, flashing running after a hit
  invulnTime: 1.4, // seconds of mercy after a hit

  // Spawning, in metres of distance.
  firstHazardAt: 55,
  hazardGapMin: 34,
  hazardGapMax: 62,
  cornGapMin: 26,
  cornGapMax: 48,
  ovenEveryMin: 210, // an oven shows up roughly every 210–300 m
  ovenEveryMax: 300,
};
