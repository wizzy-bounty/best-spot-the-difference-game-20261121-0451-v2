// state.js — the run's bookkeeping: which scene is loaded, what has been
// found, the score and streak, strikes and hints, the countdown, and which
// scenes the player has unlocked. Pure logic, no drawing: the engine reads
// the state after every change and re-renders from it.

import { SCENES } from './scenes.js';

export const MAX_STRIKES = 3;
export const HINTS_PER_SCENE = 3;
export const FIND_POINTS = 100;
export const STREAK_BONUS = 10; // extra points per streak step past the first
export const HINT_COST = 25;
export const MISS_COST = 10;

export function createRun() {
  return {
    sceneIndex: 0,
    score: 0,
    totalFound: 0,
    unlocked: 1, // scenes are unlocked one by one as they are completed
    finishedAll: false,
    scene: freshSceneState(0),
  };
}

function freshSceneState(index) {
  return {
    found: new Set(),
    strikes: 0,
    hintsLeft: HINTS_PER_SCENE,
    hinted: new Set(), // differences a hint has circled softly
    streak: 0,
    bestStreak: 0,
    timeLeft: SCENES[index].time,
    phase: 'playing', // 'playing' | 'complete' | 'failed'
    paused: false,
  };
}

// Load a scene (keeping the run's score) and return the run for chaining.
export function loadScene(run, index) {
  run.sceneIndex = index;
  run.scene = freshSceneState(index);
  run.finishedAll = false;
  return run;
}

// Record a correct find: points for the find plus the streak bonus.
// Returns the points earned, or 0 when the spot was already found.
export function recordFind(run, diffIndex) {
  const s = run.scene;
  if (s.phase !== 'playing' || s.found.has(diffIndex)) return 0;
  s.found.add(diffIndex);
  s.hinted.delete(diffIndex);
  s.streak += 1;
  s.bestStreak = Math.max(s.bestStreak, s.streak);
  run.totalFound += 1;
  const earned = FIND_POINTS + (s.streak - 1) * STREAK_BONUS;
  run.score += earned;
  if (s.found.size === SCENES[run.sceneIndex].diffs.length) {
    s.phase = 'complete';
    run.unlocked = Math.max(run.unlocked, Math.min(SCENES.length, run.sceneIndex + 2));
    if (run.sceneIndex === SCENES.length - 1) run.finishedAll = true;
  }
  return earned;
}

// Record a wrong guess: a strike, the streak resets, a few points lost.
// The third strike ends the scene.
export function recordMiss(run) {
  const s = run.scene;
  if (s.phase !== 'playing') return false;
  s.strikes += 1;
  s.streak = 0;
  run.score = Math.max(0, run.score - MISS_COST);
  if (s.strikes >= MAX_STRIKES) s.phase = 'failed';
  return s.phase === 'failed';
}

// Spend a hint on the first unfound difference. Returns its index, or -1
// when no hint is left or nothing remains to find.
export function spendHint(run) {
  const s = run.scene;
  if (s.phase !== 'playing' || s.hintsLeft <= 0) return -1;
  const diffs = SCENES[run.sceneIndex].diffs;
  for (let i = 0; i < diffs.length; i++) {
    if (!s.found.has(i) && !s.hinted.has(i)) {
      s.hintsLeft -= 1;
      s.hinted.add(i);
      run.score = Math.max(0, run.score - HINT_COST);
      return i;
    }
  }
  return -1;
}

// One second off the clock. Returns true when time has run out.
export function tickSecond(run) {
  const s = run.scene;
  if (s.phase !== 'playing' || s.paused) return false;
  s.timeLeft -= 1;
  if (s.timeLeft <= 0) {
    s.timeLeft = 0;
    s.phase = 'failed';
    return true;
  }
  return false;
}

export function remaining(run) {
  return SCENES[run.sceneIndex].diffs.length - run.scene.found.size;
}
