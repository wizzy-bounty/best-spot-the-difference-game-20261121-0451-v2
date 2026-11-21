// art.js — small canvas drawing helpers shared by every scene painter.
// Each helper takes the 2D context first and paints in panel coordinates
// (600 by 500, see layout.js). Everything is procedural: gradients, paths
// and seeded scatter, so the left and right pictures of a scene come out
// pixel-identical except where a difference changes them.

export const TAU = Math.PI * 2;

export function clamp(value, lo, hi) {
  return Math.max(lo, Math.min(hi, value));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

// A deterministic pseudo-random generator (mulberry32). Scenes scatter
// stars, pebbles and grain with a fixed seed per scene, so both panels
// scatter in exactly the same places.
export function rng(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function fillRect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

// A vertical linear gradient filling the rect; stops are [offset, colour].
export function gradientRect(ctx, x, y, w, h, stops) {
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  for (const [offset, colour] of stops) grad.addColorStop(offset, colour);
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);
}

// A soft radial glow (lamp light, the sun's halo): transparent at the rim.
export function glow(ctx, x, y, r, colour) {
  const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
  grad.addColorStop(0, colour);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

export function circle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fillStyle = fill;
  ctx.fill();
}

export function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
  ctx.fillStyle = fill;
  ctx.fill();
}

// A soft flat shadow: a translucent dark ellipse, squashed and blurred by
// stacking three passes at growing radii and falling alpha.
export function softShadow(ctx, x, y, rx, ry) {
  for (const [scale, alpha] of [[1, 0.16], [0.8, 0.14], [0.55, 0.12]]) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx * scale, ry * scale, 0, 0, TAU);
    ctx.fillStyle = `rgba(20,12,30,${alpha})`;
    ctx.fill();
  }
}

export function line(ctx, x1, y1, x2, y2, stroke, width) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = width;
  ctx.stroke();
}

export function poly(ctx, points, fill) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

export function roundedRect(ctx, x, y, w, h, r, fill) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

// A five-pointed star centred on (x, y), one point up.
export function star(ctx, x, y, r, fill) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const radius = i % 2 === 0 ? r : r * 0.45;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

// A four-point sparkle (a star's glint): two thin triangles crossing.
export function sparkle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fillStyle = fill;
  ctx.fill();
}

// A puffy cloud: a row of overlapping circles on a flat base.
export function cloud(ctx, x, y, s, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, 18 * s, Math.PI * 0.5, Math.PI * 1.5);
  ctx.arc(x + 20 * s, y - 10 * s, 24 * s, Math.PI * 0.95, Math.PI * 1.95);
  ctx.arc(x + 46 * s, y - 4 * s, 19 * s, Math.PI * 1.4, Math.PI * 0.45);
  ctx.arc(x + 62 * s, y, 15 * s, Math.PI * 1.5, Math.PI * 0.5);
  ctx.closePath();
  ctx.fill();
}

// The moon, whole or bitten into a crescent by a cover-coloured disc the
// caller matches to the sky behind it.
export function moon(ctx, x, y, r, fill, crescentCover) {
  circle(ctx, x, y, r, fill);
  circle(ctx, x - r * 0.18, y + r * 0.14, r * 0.14, 'rgba(120,120,150,0.25)');
  circle(ctx, x + r * 0.3, y - r * 0.3, r * 0.1, 'rgba(120,120,150,0.2)');
  if (crescentCover) circle(ctx, x - r * 0.45, y - r * 0.2, r * 0.85, crescentCover);
}

// Clock hands for the given hour and minute on a face centred (x, y).
export function clockHands(ctx, x, y, faceR, hour, minute, colour) {
  const minuteAngle = (minute / 60) * TAU - Math.PI / 2;
  const hourAngle = (((hour % 12) + minute / 60) / 12) * TAU - Math.PI / 2;
  line(ctx, x, y, x + Math.cos(hourAngle) * faceR * 0.52, y + Math.sin(hourAngle) * faceR * 0.52, colour, 4);
  line(ctx, x, y, x + Math.cos(minuteAngle) * faceR * 0.78, y + Math.sin(minuteAngle) * faceR * 0.78, colour, 3);
  circle(ctx, x, y, 3.5, colour);
}

// A hanging sign or plaque with centred text.
export function plaque(ctx, x, y, w, h, boardFill, textFill, text, fontPx) {
  roundedRect(ctx, x, y, w, h, 6, boardFill);
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 6);
  ctx.stroke();
  ctx.fillStyle = textFill;
  ctx.font = `700 ${fontPx}px Georgia, 'Times New Roman', serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + w / 2, y + h / 2 + 1);
}

// A five-armed starfish: a star with fat, rounded arms.
export function starfish(ctx, x, y, r, fill, dotFill) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const radius = i % 2 === 0 ? r : r * 0.62;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  for (let i = 0; i < 5; i++) {
    const angle = -Math.PI / 2 + (i * TAU) / 5;
    circle(ctx, x + Math.cos(angle) * r * 0.5, y + Math.sin(angle) * r * 0.5, r * 0.09, dotFill);
  }
  circle(ctx, x, y, r * 0.12, dotFill);
}
