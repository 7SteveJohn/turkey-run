// Turkey's Last Dash — the hand-in program (Node 22, standard library only).
//
// What it does: gather the game (game/) and its screenshots (screenshots/)
// from beside this file, lay them out under the output directory, and write
// the dossier the judge reads — the file list, the source text and the
// screenshots — with the vendored make.fun library. It runs twice in the
// grader and must write the same bytes both times, so there is no clock, no
// randomness and no network anywhere in here.
//
// One hard rule, learned from an earlier entry: never remove the output
// directory itself. In the grader /output is a mount point on a read-only
// filesystem, and removing it fails the run with exit 1. Clear what is
// inside it instead and leave the directory in place.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const gameDir = join(repoRoot, 'game');
const shotsDir = join(repoRoot, 'screenshots');
const outGame = join(outDir, 'game');
const outShots = join(outDir, 'screenshots');

// Start from a clean slate so a stale file from an earlier run can never
// leak into the hand-in. Clear the output directory's contents, but never
// remove the directory itself (see the note at the top of this file).
if (existsSync(outDir)) {
  for (const entry of readdirSync(outDir)) {
    rmSync(join(outDir, entry), { recursive: true, force: true });
  }
}
mkdirSync(outGame, { recursive: true });
mkdirSync(outShots, { recursive: true });

cpSync(gameDir, outGame, { recursive: true });
if (existsSync(shotsDir)) {
  cpSync(shotsDir, outShots, { recursive: true });
}

// The scorer's caps for this bounty (game/ 993 files / 48 MiB, index.html
// 1 MiB, 4 screenshots at most 256 KiB each, dossier text 160 KiB): the
// dossier is refused when the hand-in breaks them, so they are enforced
// here, at the source, rather than after the fact.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});

writeFileSync(join(outDir, 'dossier.json'), dossier);
