// scenes.js — the scene registry: the five hunts in play order, and the
// lookup helpers the HUD and engine use. Each scene module paints itself
// and lists its eight differences (see the scene-*.js files).

import { scene as train } from './scene-train.js';
import { scene as garden } from './scene-garden.js';
import { scene as workshop } from './scene-workshop.js';
import { scene as cove } from './scene-cove.js';
import { scene as festival } from './scene-festival.js';

export const SCENES = [train, garden, workshop, cove, festival];

export function sceneAt(index) {
  return SCENES[Math.max(0, Math.min(SCENES.length - 1, index))];
}

export function totalDifferences() {
  return SCENES.reduce((sum, scene) => sum + scene.diffs.length, 0);
}
