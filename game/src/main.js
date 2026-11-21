// main.js — the boot module: builds the level pills, wires the HUD and
// buttons to the state machine, runs the clock, and drives the engine's
// render loop. Every player action (click, key, button) funnels through
// the handlers here, so the rules live in state.js and only here.

import { SCENES, totalDifferences } from './scenes.js';
import {
  createRun, loadScene, recordFind, recordMiss, spendHint, tickSecond, remaining,
} from './state.js';
import { createEngine } from './engine.js';
import { attachInput } from './input.js';
import { playFind, playMiss, playHint, playComplete, playFail, toggleMute } from './audio.js';

const $ = (id) => document.getElementById(id);

const canvas = $('game');
const engine = createEngine(canvas);
let run = createRun();
engine.renderPanels(run);

let toastTimer = 0;
function showToast(text) {
  const toast = $('toast');
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

function formatClock(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function buildPills() {
  const nav = $('level-pills');
  nav.innerHTML = '';
  SCENES.forEach((scene, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pill';
    if (i === run.sceneIndex) btn.classList.add('current');
    if (i < run.unlocked && i !== run.sceneIndex) btn.classList.add('open');
    if (i >= run.unlocked) {
      btn.classList.add('locked');
      btn.disabled = true;
    }
    btn.textContent = `${i + 1} · ${scene.short}`;
    btn.addEventListener('click', () => selectScene(i));
    nav.appendChild(btn);
  });
}

function syncHud() {
  const scene = SCENES[run.sceneIndex];
  const s = run.scene;
  $('scene-name').textContent = scene.name;
  $('scene-sub').textContent = scene.sub;
  $('counter-num').textContent = remaining(run);
  $('score-num').textContent = run.score.toLocaleString('en-US');
  $('streak-num').textContent = `×${s.streak}`;
  $('hints-num').textContent = s.hintsLeft;
  $('timer-num').textContent = formatClock(s.timeLeft);
  $('total-found').textContent = `${run.totalFound} / ${totalDifferences()} found overall`;

  const dots = $('found-dots');
  dots.innerHTML = '';
  scene.diffs.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.className = 'dot' + (s.found.has(i) ? ' found' : s.hinted.has(i) ? ' hinted' : '');
    dots.appendChild(dot);
  });
  const strikes = $('strikes-dots');
  strikes.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('span');
    dot.className = 'dot strike' + (i < s.strikes ? ' spent' : '');
    strikes.appendChild(dot);
  }
  $('btn-next').disabled = s.phase !== 'complete';
  $('btn-hint').disabled = s.phase !== 'playing' || s.hintsLeft <= 0;
  $('btn-pause').textContent = s.paused ? 'Resume (P)' : 'Pause (P)';
  buildPills();
}

function startScene(index) {
  loadScene(run, index);
  engine.renderPanels(run);
  syncHud();
}

function selectScene(index) {
  if (index < run.unlocked && index !== run.sceneIndex) startScene(index);
}

function handleGuess(panel, x, y) {
  const s = run.scene;
  if (s.phase !== 'playing' || s.paused) return;
  const idx = engine.guessAt(run, x, y);
  const now = performance.now();
  if (idx === -1) {
    const failed = recordMiss(run);
    engine.noteMiss(panel, x, y, now);
    playMiss();
    if (failed) {
      playFail();
      showToast('Three strikes — the scene is over. Press R to try again.');
    } else {
      showToast(`Miss — that's the same in both pictures. Strike ${s.strikes} of 3.`);
    }
  } else if (s.found.has(idx)) {
    showToast('Already found — it is circled in gold.');
  } else {
    const earned = recordFind(run, idx);
    engine.noteFind(idx, now);
    playFind(s.streak);
    const note = SCENES[run.sceneIndex].diffs[idx].note;
    if (s.phase === 'complete') {
      playComplete();
      showToast(`Found: ${note}. Scene complete!`);
    } else {
      showToast(`Found: ${note} (+${earned})`);
    }
  }
  syncHud();
}

function handleHint() {
  const idx = spendHint(run);
  if (idx === -1) {
    if (run.scene.phase === 'playing') showToast('No hints left for this scene.');
    return;
  }
  playHint();
  showToast('A hint circles one difference softly — it still counts when you click it.');
  syncHud();
}

function handleNext() {
  if (run.scene.phase !== 'complete') return;
  if (run.finishedAll) {
    run = createRun();
    startScene(0);
    showToast('A fresh hunt — all five scenes again.');
  } else {
    startScene(run.sceneIndex + 1);
  }
}

function handleRestart() {
  if (run.finishedAll) {
    run = createRun();
    startScene(0);
  } else {
    startScene(run.sceneIndex);
  }
  showToast('Scene restarted — the clock is running.');
}

function handlePause() {
  const s = run.scene;
  if (s.phase !== 'playing') return;
  s.paused = !s.paused;
  syncHud();
}

attachInput(canvas, {
  onGuess: handleGuess,
  onHover: (point) => engine.setHover(point),
  onToggleLens: () => {
    engine.setLens(!engine.lensOn);
    $('btn-lens').classList.toggle('active', engine.lensOn);
  },
  onHint: handleHint,
  onNext: handleNext,
  onRestart: handleRestart,
  onPause: handlePause,
  onSelectScene: selectScene,
  onToggleMute: () => {
    const muted = toggleMute();
    $('btn-mute').textContent = muted ? 'Sound: off (M)' : 'Sound: on (M)';
  },
});

$('btn-hint').addEventListener('click', handleHint);
$('btn-next').addEventListener('click', handleNext);
$('btn-restart').addEventListener('click', handleRestart);
$('btn-pause').addEventListener('click', handlePause);
$('btn-lens').addEventListener('click', () => {
  engine.setLens(!engine.lensOn);
  $('btn-lens').classList.toggle('active', engine.lensOn);
});
$('btn-mute').addEventListener('click', () => {
  const muted = toggleMute();
  $('btn-mute').textContent = muted ? 'Sound: off (M)' : 'Sound: on (M)';
});

// The clock: accumulate real elapsed time while playing, one tick a second.
let lastNow = performance.now();
let acc = 0;
function loop(now) {
  const dt = now - lastNow;
  lastNow = now;
  const s = run.scene;
  if (s.phase === 'playing' && !s.paused) {
    acc += dt;
    while (acc >= 1000) {
      acc -= 1000;
      if (tickSecond(run)) {
        playFail();
        showToast('Out of time — press R to try the scene again.');
        syncHud();
      }
    }
    const scene = SCENES[run.sceneIndex];
    const shown = Math.max(0, s.timeLeft - acc / 1000);
    $('timer-fill').style.width = `${(shown / scene.time) * 100}%`;
    $('timer-num').textContent = formatClock(Math.ceil(shown));
    if (s.timeLeft <= 30) $('timer-fill').classList.add('low');
    else $('timer-fill').classList.remove('low');
  }
  engine.frame(run, now);
  requestAnimationFrame(loop);
}

syncHud();
requestAnimationFrame(loop);
