[![make.fun bounty](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/wizzy-bounty/best-spot-the-difference-game-20261121-0451-v2/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/wizzy-bounty/best-spot-the-difference-game-20261121-0451-v2/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

# Second Glance — a spot-the-difference hunt

An original spot-the-difference game built for the
[make.fun "best spot the difference game" bounty](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451).
Five hand-drawn scenes — a night-train platform, a rooftop garden, a clockwork
workshop, a tide-pool cove and a balloon festival — each hiding 8 differences
(40 to find in all), drawn procedurally on canvas: no image assets, no network,
everything runs offline from the static files under `game/`.

## How to play

Open `game/index.html` in a desktop browser (or serve `game/` with any static
file server). Click a difference in either picture to mark it on both.

- **Mouse** — hover to inspect, click to guess; hold the magnifier lens over a
  panel to study the details.
- **Keyboard** — arrow keys or WASD move the crosshair, `Enter` guesses,
  `Tab` switches panel, `H` spends a hint, `L` toggles the lens, `N` next
  scene, `R` restart, `P` pause, `1`–`5` jump to a scene.
- Finds build your **streak** and score; wrong guesses cost a **strike**
  (three end the scene) and the clock is always running.

## Layout

- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to the
  output directory and writes `dossier.json` with the vendored library.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.
- `game/index.html`, `game/styles.css` — the page and its presentation.
- `game/src/` — the game itself, one job per file: `art.js` (drawing helpers),
  five `scene-*.js` painters with their difference lists, `scenes.js` (the
  registry), `state.js` (score, streak, strikes, timer), `engine.js` (panel
  rendering, markers, lens, overlays), `input.js` (mouse and keyboard),
  `audio.js` (WebAudio feedback sounds) and `main.js` (boot and HUD wiring).
- `screenshots/` — real renders of the game in play.

MIT licensed — see `LICENSE`.
