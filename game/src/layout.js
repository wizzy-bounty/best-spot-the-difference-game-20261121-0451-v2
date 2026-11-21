// layout.js — the shared geometry of the stage: two picture panels side by
// side on one canvas, with a frame of padding around them. Every other
// module (engine, input, the scene painters) works in panel coordinates:
// a panel is PANEL_W wide and PANEL_H high, and a point's panel position is
// the same on the left picture and the right one.

export const PANEL_W = 600;
export const PANEL_H = 500;
export const PAD = 12;
export const GAP = 24;

export const CANVAS_W = PAD * 2 + PANEL_W * 2 + GAP;
export const CANVAS_H = PAD * 2 + PANEL_H;

export const LEFT_X = PAD;
export const RIGHT_X = PAD + PANEL_W + GAP;
export const PANEL_Y = PAD;

// Which panel a canvas point falls in: 0 for the left picture, 1 for the
// right, -1 for the frame and the gap between them.
export function panelAt(canvasX, canvasY) {
  if (canvasY < PANEL_Y || canvasY >= PANEL_Y + PANEL_H) return -1;
  if (canvasX >= LEFT_X && canvasX < LEFT_X + PANEL_W) return 0;
  if (canvasX >= RIGHT_X && canvasX < RIGHT_X + PANEL_W) return 1;
  return -1;
}

// The panel-local coordinates of a canvas point inside the given panel.
export function toPanel(canvasX, canvasY, panel) {
  const originX = panel === 0 ? LEFT_X : RIGHT_X;
  return { x: canvasX - originX, y: canvasY - PANEL_Y };
}
