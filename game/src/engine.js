// engine.js — everything that touches the stage canvas: painting the two
// panels from the scene painters, the found markers and hint rings, the
// magnifier lens, find-burst particles, the keyboard crosshair, and the
// end-of-scene overlays. It also owns the hit test that turns a click in
// panel coordinates into a difference index.

import {
  PANEL_W, PANEL_H, LEFT_X, RIGHT_X, PANEL_Y,
} from './layout.js';
import { SCENES } from './scenes.js';
import { TAU, clamp } from './art.js';

const EMPTY = new Set();
const GOLD = '#f5b942';
const INK = '#171226';

export function createEngine(canvas) {
  const ctx = canvas.getContext('2d');
  const panels = [document.createElement('canvas'), document.createElement('canvas')];
  for (const p of panels) {
    p.width = PANEL_W;
    p.height = PANEL_H;
  }

  let sceneIndex = -1;
  let hover = null; // {panel, x, y} in panel coordinates
  let lensOn = false;
  let particles = [];
  let misses = []; // {panel, x, y, at}
  const findTimes = new Map(); // diff index -> timestamp of the find
  let lastFrame = 0;

  // Re-paint both panels for the run's current scene. The left picture is
  // the scene as painted; the right one has every difference switched on.
  function renderPanels(run) {
    sceneIndex = run.sceneIndex;
    const scene = SCENES[sceneIndex];
    const all = new Set(scene.diffs.map((_, i) => i));
    scene.paint(panels[0].getContext('2d'), EMPTY);
    scene.paint(panels[1].getContext('2d'), all);
    particles = [];
    misses = [];
    findTimes.clear();
  }

  // The difference a panel point hits, or -1. When two hotspots overlap,
  // the nearest centre wins.
  function guessAt(run, x, y) {
    const diffs = SCENES[run.sceneIndex].diffs;
    let best = -1;
    let bestDist = Infinity;
    for (let i = 0; i < diffs.length; i++) {
      const d = Math.hypot(x - diffs[i].x, y - diffs[i].y);
      if (d <= diffs[i].r && d < bestDist) {
        best = i;
        bestDist = d;
      }
    }
    return best;
  }

  function noteFind(diffIndex, now) {
    findTimes.set(diffIndex, now);
    const d = SCENES[sceneIndex].diffs[diffIndex];
    for (const panel of [0, 1]) {
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * TAU + Math.random() * 0.3;
        const speed = 40 + Math.random() * 90;
        particles.push({
          panel, x: d.x, y: d.y,
          vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - 30,
          life: 0, maxLife: 0.55 + Math.random() * 0.4,
          r: 1.6 + Math.random() * 2.2,
          colour: i % 3 === 0 ? '#ffffff' : GOLD,
        });
      }
    }
  }

  function noteMiss(panel, x, y, now) {
    misses.push({ panel, x, y, at: now });
  }

  function panelOrigin(panel) {
    return panel === 0 ? LEFT_X : RIGHT_X;
  }

  function drawMarker(x, y, r, scale, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(x, y, r * scale, 0, TAU);
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 4.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, r * scale + 4.5, 0, TAU);
    ctx.strokeStyle = 'rgba(23,18,38,0.55)';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    // A small check at the top of the ring.
    const cx = x, cy = y - r * scale;
    ctx.beginPath();
    ctx.moveTo(cx - 5, cy + 1);
    ctx.lineTo(cx - 1.5, cy + 4.5);
    ctx.lineTo(cx + 5.5, cy - 3.5);
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }

  function drawPanelChrome() {
    for (const panel of [0, 1]) {
      const x = panelOrigin(panel);
      ctx.beginPath();
      ctx.roundRect(x - 3, PANEL_Y - 3, PANEL_W + 6, PANEL_H + 6, 10);
      ctx.strokeStyle = '#0e0a1a';
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.beginPath();
      ctx.roundRect(x - 1, PANEL_Y - 1, PANEL_W + 2, PANEL_H + 2, 8);
      ctx.strokeStyle = 'rgba(245,185,66,0.5)';
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
  }

  function drawLens() {
    if (!lensOn || !hover) return;
    const R = 76;
    const mag = 1.7;
    const cx = panelOrigin(hover.panel) + hover.x;
    const cy = PANEL_Y + hover.y;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, TAU);
    ctx.clip();
    ctx.fillStyle = '#0e0a1a';
    ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
    const srcHalf = R / mag;
    ctx.drawImage(
      panels[hover.panel],
      clamp(hover.x - srcHalf, 0, PANEL_W - srcHalf * 2),
      clamp(hover.y - srcHalf, 0, PANEL_H - srcHalf * 2),
      srcHalf * 2, srcHalf * 2,
      cx - R, cy - R, R * 2, R * 2,
    );
    ctx.restore();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, TAU);
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 3.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + R * 0.72, cy + R * 0.72);
    ctx.lineTo(cx + R * 0.98, cy + R * 0.98);
    ctx.strokeStyle = '#0e0a1a';
    ctx.lineWidth = 7;
    ctx.stroke();
  }

  function drawCrosshair() {
    if (!hover) return;
    for (const panel of [0, 1]) {
      const x = panelOrigin(panel) + hover.x;
      const y = PANEL_Y + hover.y;
      const active = panel === hover.panel;
      ctx.save();
      ctx.globalAlpha = active ? 0.9 : 0.3;
      ctx.strokeStyle = active ? GOLD : '#ffffff';
      ctx.lineWidth = active ? 2 : 1.4;
      ctx.beginPath();
      ctx.arc(x, y, 13, 0, TAU);
      ctx.stroke();
      for (const [dx, dy] of [[0, -21], [0, 21], [-21, 0], [21, 0]]) {
        ctx.beginPath();
        ctx.moveTo(x + dx * 0.62, y + dy * 0.62);
        ctx.lineTo(x + dx, y + dy);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  function banner(title, lines) {
    ctx.fillStyle = 'rgba(14,10,26,0.62)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const w = 520, h = 168;
    const x = (canvas.width - w) / 2, y = (canvas.height - h) / 2;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 14);
    ctx.fillStyle = 'rgba(23,18,38,0.94)';
    ctx.fill();
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.fillStyle = GOLD;
    ctx.font = "700 30px Georgia, 'Times New Roman', serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, canvas.width / 2, y + 46);
    ctx.fillStyle = '#f2ead8';
    ctx.font = "16px Georgia, 'Times New Roman', serif";
    lines.forEach((text, i) => {
      ctx.fillText(text, canvas.width / 2, y + 88 + i * 26);
    });
  }

  // Draw one frame: panels, lens, markers, effects, crosshair, overlays.
  function frame(run, now) {
    const dt = lastFrame ? Math.min(0.05, (now - lastFrame) / 1000) : 0.016;
    lastFrame = now;
    if (sceneIndex !== run.sceneIndex) renderPanels(run);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(panels[0], LEFT_X, PANEL_Y);
    ctx.drawImage(panels[1], RIGHT_X, PANEL_Y);
    drawPanelChrome();
    drawLens();

    const scene = SCENES[run.sceneIndex];
    const s = run.scene;
    // Hint rings pulse softly on both panels until the spot is found.
    for (const i of s.hinted) {
      if (s.found.has(i)) continue;
      const d = scene.diffs[i];
      const pulse = 1 + Math.sin(now / 260) * 0.1;
      for (const panel of [0, 1]) {
        ctx.save();
        ctx.globalAlpha = 0.55;
        ctx.beginPath();
        ctx.arc(panelOrigin(panel) + d.x, PANEL_Y + d.y, (d.r + 7) * pulse, 0, TAU);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.stroke();
        ctx.restore();
      }
    }
    // Found markers pop in, then settle.
    for (const i of s.found) {
      const d = scene.diffs[i];
      const at = findTimes.get(i);
      const age = at ? (now - at) / 240 : 1;
      const scale = age < 1 ? 0.6 + 0.4 * (1 - Math.pow(1 - age, 3)) : 1;
      for (const panel of [0, 1]) {
        drawMarker(panelOrigin(panel) + d.x, PANEL_Y + d.y, d.r + 5, scale, 1);
      }
    }
    // Miss marks fade over half a second.
    misses = misses.filter((m) => now - m.at < 550);
    for (const m of misses) {
      const alpha = 1 - (now - m.at) / 550;
      const x = panelOrigin(m.panel) + m.x;
      const y = PANEL_Y + m.y;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = '#e5484d';
      ctx.lineWidth = 3.5;
      for (const [dx, dy] of [[-8, -8], [8, 8], [-8, 8], [8, -8]]) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + dx, y + dy);
        ctx.stroke();
      }
      ctx.restore();
    }
    // Find-burst particles.
    particles = particles.filter((p) => p.life < p.maxLife);
    for (const p of particles) {
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 190 * dt;
      const alpha = 1 - p.life / p.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.colour;
      ctx.beginPath();
      ctx.arc(panelOrigin(p.panel) + p.x, PANEL_Y + p.y, p.r, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    if (s.phase === 'playing' && !s.paused) drawCrosshair();

    if (s.paused && s.phase === 'playing') {
      banner('PAUSED', ['The clock is stopped. Press P to keep looking.']);
    } else if (s.phase === 'complete' && run.finishedAll) {
      banner('ALL FIVE SCENES COMPLETE', [
        `Final score ${run.score.toLocaleString('en-US')} — every one of the 40 differences found.`,
        'Press R to play the whole hunt again.',
      ]);
    } else if (s.phase === 'complete') {
      banner(`${scene.name} — COMPLETE`, [
        `Best streak ×${s.bestStreak} · ${s.timeLeft} seconds to spare.`,
        'Press N for the next scene.',
      ]);
    } else if (s.phase === 'failed') {
      banner(s.timeLeft <= 0 ? 'OUT OF TIME' : 'THREE STRIKES', [
        `${s.found.size} of ${scene.diffs.length} differences found in ${scene.name}.`,
        'Press R to try this scene again.',
      ]);
    }
  }

  return {
    renderPanels,
    guessAt,
    noteFind,
    noteMiss,
    frame,
    setHover(point) { hover = point; },
    setLens(on) { lensOn = on; },
    get lensOn() { return lensOn; },
  };
}
