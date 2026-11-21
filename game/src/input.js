// input.js — mouse and keyboard control. The mouse hovers and clicks
// directly; the keyboard drives a crosshair that roams across both
// pictures (crossing the middle moves it to the other panel), guesses with
// Enter, and reaches every game action without the mouse. All decisions
// are forwarded to the callbacks main.js supplies.

import { PANEL_W, PANEL_H, panelAt, toPanel } from './layout.js';

const STEP = 14;
const FAST_STEP = 36;

export function attachInput(canvas, callbacks) {
  // The keyboard cursor lives in a virtual double-width space: 0..600 is
  // the left picture, 600..1200 the right, so arrows roam across both.
  const cursor = { vx: PANEL_W / 2, y: PANEL_H / 2 };

  const cursorPoint = () => {
    const panel = cursor.vx < PANEL_W ? 0 : 1;
    return { panel, x: cursor.vx - panel * PANEL_W, y: cursor.y };
  };

  const showCursor = () => callbacks.onHover(cursorPoint());

  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);
    return { x, y };
  }

  canvas.addEventListener('mousemove', (event) => {
    const { x, y } = canvasPoint(event);
    const panel = panelAt(x, y);
    if (panel === -1) {
      callbacks.onHover(null);
      return;
    }
    const local = toPanel(x, y, panel);
    cursor.vx = panel * PANEL_W + local.x;
    cursor.y = local.y;
    callbacks.onHover({ panel, x: local.x, y: local.y });
  });

  canvas.addEventListener('mousedown', (event) => {
    const { x, y } = canvasPoint(event);
    const panel = panelAt(x, y);
    if (panel === -1) return;
    const local = toPanel(x, y, panel);
    callbacks.onGuess(panel, local.x, local.y);
  });

  canvas.addEventListener('mouseleave', () => callbacks.onHover(null));

  const MOVE_KEYS = {
    ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1],
    a: [-1, 0], d: [1, 0], w: [0, -1], s: [0, 1],
  };

  window.addEventListener('keydown', (event) => {
    const key = event.key;
    if (MOVE_KEYS[key]) {
      const [dx, dy] = MOVE_KEYS[key];
      const step = event.shiftKey ? FAST_STEP : STEP;
      cursor.vx = Math.max(0, Math.min(PANEL_W * 2 - 1, cursor.vx + dx * step));
      cursor.y = Math.max(0, Math.min(PANEL_H - 1, cursor.y + dy * step));
      showCursor();
      event.preventDefault();
      return;
    }
    switch (key) {
      case 'Enter':
      case ' ': {
        const p = cursorPoint();
        callbacks.onGuess(p.panel, p.x, p.y);
        event.preventDefault();
        break;
      }
      case 'Tab':
        cursor.vx = (cursor.vx + PANEL_W) % (PANEL_W * 2);
        showCursor();
        event.preventDefault();
        break;
      case 'h': case 'H': callbacks.onHint(); break;
      case 'l': case 'L': callbacks.onToggleLens(); break;
      case 'm': case 'M': callbacks.onToggleMute(); break;
      case 'n': case 'N': callbacks.onNext(); break;
      case 'r': case 'R': callbacks.onRestart(); break;
      case 'p': case 'P': callbacks.onPause(); break;
      case '1': case '2': case '3': case '4': case '5':
        callbacks.onSelectScene(Number(key) - 1);
        break;
      default:
        break;
    }
  });

  showCursor();
}
