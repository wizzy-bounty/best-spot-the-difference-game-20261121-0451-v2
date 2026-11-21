// scene-cove.js — "Tide-Pool Cove": a bright morning on a sandy cove, a
// lighthouse on the rocks and the tide just gone out. The painter draws
// the whole scene from primitives; `alt` is the set of difference indexes
// switched on for the right-hand picture.

import {
  rng, gradientRect, glow, circle, ellipse, softShadow, line, poly,
  roundedRect, fillRect, cloud, starfish,
} from './art.js';

function gull(ctx, x, y, s) {
  ctx.beginPath();
  ctx.moveTo(x - 11 * s, y);
  ctx.quadraticCurveTo(x - 4 * s, y - 7 * s, x, y);
  ctx.quadraticCurveTo(x + 4 * s, y - 7 * s, x + 11 * s, y);
  ctx.strokeStyle = '#3a5a6a';
  ctx.lineWidth = 2.4;
  ctx.stroke();
}

function drawLighthouse(ctx, alt) {
  // Rocky point.
  poly(ctx, [[0, 322], [18, 268], [52, 250], [96, 244], [138, 262], [158, 322]], '#5d646e');
  poly(ctx, [[18, 268], [52, 250], [70, 268], [44, 286]], '#767e88');
  poly(ctx, [[96, 244], [138, 262], [120, 284], [92, 272]], '#6e757f');
  // The tower, in white and red bands.
  poly(ctx, [[64, 258], [69, 214], [91, 214], [96, 258]], '#f4f1e8');
  poly(ctx, [[69, 214], [72, 178], [88, 178], [91, 214]], '#d94f3d');
  poly(ctx, [[72, 178], [74, 150], [86, 150], [88, 178]], '#f4f1e8');
  fillRect(ctx, 63, 256, 34, 6, '#4a5058');
  // Lamp room and roof.
  fillRect(ctx, 66, 122, 28, 28, '#2c3e50');
  fillRect(ctx, 62, 116, 36, 7, '#22303e');
  poly(ctx, [[60, 116], [100, 116], [80, 96]], '#8a2f35');
  // Difference 0: the lamp is lit, sweeping a beam — or dark.
  if (!alt.has(0)) {
    poly(ctx, [[94, 128], [330, 168], [330, 226], [94, 146]], 'rgba(255,240,170,0.16)');
    glow(ctx, 80, 136, 30, 'rgba(255,240,170,0.65)');
    circle(ctx, 80, 136, 7, '#fff3b0');
  } else {
    circle(ctx, 80, 136, 7, '#57606a');
  }
}

function drawBoat(ctx, alt) {
  ellipse(ctx, 486, 296, 66, 7, 'rgba(20,60,80,0.25)');
  line(ctx, 482, 262, 482, 166, '#5a4028', 4);
  poly(ctx, [[482, 166], [496, 176], [482, 178]], '#d94f3d'); // pennant
  // Difference 4: the sail is raised — or furled on the boom.
  if (!alt.has(4)) {
    poly(ctx, [[486, 176], [486, 254], [532, 254]], '#fdfdf8');
    line(ctx, 486, 200, 514, 254, 'rgba(120,130,140,0.4)', 1.5);
    line(ctx, 486, 226, 500, 254, 'rgba(120,130,140,0.4)', 1.5);
    poly(ctx, [[478, 186], [478, 254], [452, 254]], '#f2ecd8');
  } else {
    roundedRect(ctx, 482, 246, 50, 11, 5, '#e8e2d2');
    line(ctx, 494, 246, 494, 257, '#8a7a5c', 2);
    line(ctx, 512, 246, 512, 257, '#8a7a5c', 2);
  }
  poly(ctx, [[428, 262], [544, 262], [528, 290], [444, 290]], '#8a5a33');
  fillRect(ctx, 428, 258, 116, 6, '#6e4525');
  line(ctx, 452, 276, 520, 276, '#6e4525', 2.5);
}

function drawUmbrella(ctx, alt) {
  // A striped beach umbrella, clipped wedges over a scalloped canopy.
  line(ctx, 492, 428, 486, 316, '#7a5230', 5);
  const stripe = alt.has(3) ? '#2a9a8e' : '#ff7a66'; // difference 3
  ctx.save();
  ctx.beginPath();
  ctx.arc(492, 318, 64, Math.PI, 0);
  ctx.quadraticCurveTo(460, 330, 428, 318);
  ctx.quadraticCurveTo(492, 336, 556, 318);
  ctx.closePath();
  ctx.clip();
  for (let i = 0; i < 8; i++) {
    fillRect(ctx, 428 + i * 16, 250, 16, 90, i % 2 === 0 ? stripe : '#fdf6ec');
  }
  ctx.restore();
  ctx.beginPath();
  ctx.arc(492, 318, 64, Math.PI, 0);
  ctx.strokeStyle = 'rgba(90,50,30,0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();
  circle(ctx, 492, 252, 4, '#7a5230');
  // Its towel, with a paperback left open.
  fillRect(ctx, 442, 432, 104, 20, '#6db3e8');
  fillRect(ctx, 442, 440, 104, 4, '#fdf6ec');
  poly(ctx, [[478, 446], [494, 438], [494, 448], [478, 450]], '#f6ecd2');
  poly(ctx, [[510, 446], [494, 438], [494, 448], [510, 450]], '#efe3c8');
}

function drawCrab(ctx) {
  softShadow(ctx, 330, 452, 22, 5);
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      line(ctx, 330 + s * 14, 440 + i * 3, 330 + s * (26 + i * 3), 448 + i * 5, '#c2452f', 3);
    }
    circle(ctx, 330 + s * 22, 428, 7, '#e05a41');
    circle(ctx, 330 + s * 22, 428, 3.4, '#c2452f');
    line(ctx, 330 + s * 5, 432, 330 + s * 8, 420, '#c2452f', 2.5);
    circle(ctx, 330 + s * 8, 418, 2.6, '#33241a');
  }
  ellipse(ctx, 330, 440, 17, 11, '#d94f3d');
  ellipse(ctx, 330, 436, 11, 6, '#e8735c');
}

export function paint(ctx, alt) {
  gradientRect(ctx, 0, 0, 600, 500, [
    [0, '#a8dcff'], [0.3, '#e8f9ff'], [0.34, '#3a9ab8'], [0.6, '#2a7a9e'], [0.64, '#d9a45e'], [1, '#dfae62'],
  ]);
  glow(ctx, 540, 68, 70, 'rgba(255,240,170,0.6)');
  circle(ctx, 540, 68, 27, '#fff3b0');
  cloud(ctx, 84, 52, 0.9, 'rgba(255,255,255,0.95)');
  cloud(ctx, 322, 104, 0.66, 'rgba(255,255,255,0.85)');
  gull(ctx, 248, 84, 1);
  gull(ctx, 302, 60, 0.8);
  if (!alt.has(5)) gull(ctx, 352, 96, 0.9); // difference 5: one gull fewer
  // Sea sparkle.
  const rand = rng(4404);
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  for (let i = 0; i < 34; i++) {
    const x = 150 + rand() * 440;
    const y = 168 + rand() * 118;
    line(ctx, x, y, x + 6 + rand() * 8, y, 'rgba(255,255,255,0.5)', 1.6);
  }
  drawLighthouse(ctx, alt);
  drawBoat(ctx, alt);
  // Foam scallops where the sea lets go of the sand.
  for (let x = 8; x < 600; x += 26) {
    ctx.beginPath();
    ctx.arc(x, 302, 13, 0, Math.PI);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fill();
  }
  // Tide pools with bright reflections.
  ellipse(ctx, 172, 394, 88, 26, '#57b6cf');
  ellipse(ctx, 172, 390, 76, 20, '#79c9dd');
  line(ctx, 120, 386, 168, 386, 'rgba(255,255,255,0.65)', 3);
  line(ctx, 150, 398, 210, 398, 'rgba(255,255,255,0.4)', 2.5);
  ellipse(ctx, 452, 452, 62, 19, '#57b6cf');
  ellipse(ctx, 452, 449, 52, 14, '#79c9dd');
  line(ctx, 420, 446, 462, 446, 'rgba(255,255,255,0.55)', 2.5);
  // Pebbles and shells scattered on the sand.
  const peb = rng(4410);
  for (let i = 0; i < 40; i++) {
    ellipse(ctx, 16 + peb() * 570, 330 + peb() * 160, 2 + peb() * 3.4, 1.6 + peb() * 2,
      peb() < 0.5 ? 'rgba(160,120,80,0.6)' : 'rgba(255,244,220,0.7)');
  }
  // Difference 1: the starfish is orange — or purple.
  softShadow(ctx, 262, 376, 20, 5);
  if (alt.has(1)) starfish(ctx, 262, 366, 21, '#9a6ad9', '#6d3fb3');
  else starfish(ctx, 262, 366, 21, '#f08a3d', '#c25e1e');
  if (!alt.has(2)) drawCrab(ctx); // difference 2: the crab has scuttled off
  drawUmbrella(ctx, alt);
  // Difference 6: a conch shell by the pool.
  if (!alt.has(6)) {
    softShadow(ctx, 96, 460, 18, 4);
    circle(ctx, 96, 448, 13, '#f2c4a8');
    ctx.beginPath();
    ctx.arc(96, 448, 8.5, 0.6, 5.2);
    ctx.strokeStyle = '#d98a68';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(96, 448, 4, 0.6, 5.2);
    ctx.stroke();
    poly(ctx, [[106, 440], [118, 434], [108, 450]], '#e8a888');
  }
  // Difference 7: the bucket is red — or yellow.
  softShadow(ctx, 372, 470, 20, 4);
  poly(ctx, [[354, 436], [390, 436], [385, 468], [359, 468]], alt.has(7) ? '#f2b13d' : '#d94f3d');
  ctx.beginPath();
  ctx.arc(372, 436, 17, Math.PI, 0);
  ctx.strokeStyle = '#8a8f99';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  line(ctx, 398, 452, 410, 436, '#8a5a33', 4); // the spade
  poly(ctx, [[404, 422], [418, 422], [411, 440]], '#f2b13d');
  // Seaweed tufts at the pools' edges.
  for (const [x, y] of [[84, 380], [556, 428], [238, 420]]) {
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(x + i * 5, y);
      ctx.quadraticCurveTo(x + i * 8, y - 12, x + i * 11, y - 16);
      ctx.strokeStyle = '#3f7a4e';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }
}

export const scene = {
  id: 'cove',
  name: 'Tide-Pool Cove',
  short: 'Cove',
  sub: 'The tide has gone out and left its treasures behind.',
  time: 285,
  paint,
  diffs: [
    { x: 80, y: 136, r: 34, note: 'The lighthouse lamp has gone dark' },
    { x: 262, y: 366, r: 28, note: 'The starfish changed colour' },
    { x: 330, y: 438, r: 30, note: 'The crab has scuttled away' },
    { x: 492, y: 306, r: 44, note: 'The umbrella stripes changed colour' },
    { x: 496, y: 218, r: 40, note: 'The boat has furled its sail' },
    { x: 352, y: 96, r: 26, note: 'One gull fewer over the cove' },
    { x: 96, y: 448, r: 27, note: 'The conch shell is gone' },
    { x: 372, y: 452, r: 28, note: 'The bucket changed colour' },
  ],
};
