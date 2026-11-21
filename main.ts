// Second Glance — hand-in program (Node 22, standard library only).
//
// The game itself is the static site under game/ (game/index.html and its ES
// modules, no build step, no network). This program hands it in: it copies
// game/ and screenshots/ from beside this file into the output directory and
// writes dossier.json there with the vendored make.fun dossier library, so
// the sealed gate can rebuild the same dossier from the same files and
// compare the two byte for byte.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The gate's caps, as the bounty's RULES.txt states them: the dossier text is
// capped at 160 KiB, at most 4 screenshots of at most 256 KiB each, game/
// holds at most 993 files and directories and 48 MiB, and no path under
// game/ runs past 1,000 UTF-8 bytes.
const GATE_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function handIn() {
  mkdirSync(outputDir, { recursive: true });
  cpSync(join(repoDir, 'game'), join(outputDir, 'game'), { recursive: true });
  const shotsDir = join(repoDir, 'screenshots');
  if (existsSync(shotsDir)) {
    cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });
  }
  const dossier = buildDossier(outputDir, GATE_CAPS);
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
}

handIn();
