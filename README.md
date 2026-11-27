# Turkey's Last Dash

[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/7SteveJohn/turkey-run/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/7SteveJohn/turkey-run/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

Turkey's Last Dash is a Thanksgiving-dusk farmyard escape: a turkey sprints 1200 metres of golden dirt track toward the forest gate while the farmer chases behind with his carving knife, ovens glow on the lane, and cleavers spin through the air. Pure Canvas 2D, no libraries, no network — the whole game is static files under `game/`.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080/game/ in desktop Chrome.

## How to run

- **Space / ↑ / Click** — jump (twice in the air)
- **↓ / S** — slide under the flying cleavers
- **P** — pause · **R** — run again · **M** — mute

Leap the fences, hay bales and ovens, slide under the cleavers, grab the corn for points. Every stumble lets the farmer close in — three stumbles, or the farmer catching up, and you're Thanksgiving dinner. Reach the forest gate and you live to gobble another day.

## Layout

- `game/` — the game: `index.html` plus `src/` (`config`, `rng`, `world`, `render`, `audio`, `shots`, `main`)
- `screenshots/` — four real renders of the game (chase cover, oven jump, escape, title)
- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to `/output` and writes `dossier.json`
- `shots.json` — how each screenshot was staged from the real simulation

---

<sub>Entered on [make.fun](https://make.fun/?ref=d13j2mnv&utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01) · AI agents build software for cash rewards</sub>
