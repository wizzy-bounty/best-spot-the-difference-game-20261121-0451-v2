// scene-workshop.js — "Clockwork Workshop": a lamplit workroom of gears,
// jars and half-finished inventions. The painter draws the whole scene
// from primitives; `alt` is the set of difference indexes switched on for
// the right-hand picture.

import {
  TAU, rng, gradientRect, glow, circle, ellipse, softShadow, line, poly,
  roundedRect, fillRect, clockHands,
} from './art.js';

// A gear: alternating tooth and root radii around a hub with bolt holes.
function gear(ctx, x, y, r, teeth, fill, hubFill) {
  ctx.beginPath();
  const steps = teeth * 2;
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * TAU;
    const aMid = ((i + 0.5) / steps) * TAU;
    const radius = i % 2 === 0 ? r : r * 0.84;
    const px = x + Math.cos(a) * radius;
    const py = y + Math.sin(a) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
    ctx.lineTo(x + Math.cos(aMid) * (i % 2 === 0 ? r * 0.84 : r), y + Math.sin(aMid) * (i % 2 === 0 ? r * 0.84 : r));
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  circle(ctx, x, y, r * 0.52, '#75522f');
  circle(ctx, x, y, r * 0.3, hubFill);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU + 0.4;
    circle(ctx, x + Math.cos(a) * r * 0.41, y + Math.sin(a) * r * 0.41, r * 0.07, 'rgba(40,26,14,0.6)');
  }
}

function drawWindow(ctx, alt) {
  roundedRect(ctx, 52, 62, 168, 188, 6, '#4a3220');
  gradientRect(ctx, 62, 72, 148, 168, [[0, '#1d2a4a'], [1, '#31456b']]);
  const rand = rng(3303);
  for (let i = 0; i < 22; i++) circle(ctx, 68 + rand() * 136, 78 + rand() * 156, 1.1, 'rgba(255,246,220,0.7)');
  circle(ctx, 182, 98, 11, '#f4ecd8');
  circle(ctx, 178, 95, 9, '#31456b'); // a crescent cut from the pane's sky
  line(ctx, 136, 72, 136, 240, '#4a3220', 7);
  line(ctx, 62, 156, 210, 156, '#4a3220', 7);
  // Difference 7: the curtain is drawn across — or tied back.
  if (!alt.has(7)) {
    fillRect(ctx, 140, 72, 70, 168, '#a03a4a');
    for (let x = 150; x < 208; x += 12) line(ctx, x, 72, x - 4, 240, 'rgba(70,16,26,0.5)', 3);
    fillRect(ctx, 140, 72, 70, 8, '#7e2c3a');
  } else {
    fillRect(ctx, 192, 72, 18, 168, '#a03a4a');
    for (let x = 196; x < 210; x += 6) line(ctx, x, 72, x, 240, 'rgba(70,16,26,0.5)', 2);
    fillRect(ctx, 190, 168, 22, 7, '#c8a24a'); // the tie band
  }
}

function drawClock(ctx, alt) {
  roundedRect(ctx, 252, 84, 84, 272, 10, '#5a3d22');
  roundedRect(ctx, 258, 90, 72, 260, 8, '#6e4a2a');
  circle(ctx, 294, 142, 36, '#c8a24a');
  circle(ctx, 294, 142, 31, '#f6ecd2');
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    line(ctx, 294 + Math.cos(a) * 25, 142 + Math.sin(a) * 25,
      294 + Math.cos(a) * 28, 142 + Math.sin(a) * 28, '#5a4632', 2);
  }
  // Difference 0: three o'clock — or twenty-five past four.
  if (alt.has(0)) clockHands(ctx, 294, 142, 31, 4, 25, '#33241a');
  else clockHands(ctx, 294, 142, 31, 3, 0, '#33241a');
  // The pendulum behind its glass.
  roundedRect(ctx, 272, 196, 44, 138, 6, '#2c1e10');
  line(ctx, 294, 200, 288, 292, '#c8a24a', 3);
  circle(ctx, 288, 300, 11, '#d9a441');
  circle(ctx, 288, 300, 5, '#f2d98a');
}

function drawShelf(ctx, alt) {
  fillRect(ctx, 366, 90, 208, 9, '#4a3220');
  poly(ctx, [[380, 99], [394, 99], [380, 116]], '#3a2716');
  poly(ctx, [[546, 99], [560, 99], [560, 116]], '#3a2716');
  // Two jars: buttons and cogs in one, and in the other…
  const jar = (x, w) => {
    roundedRect(ctx, x, 52, w, 38, 5, 'rgba(205,225,245,0.28)');
    fillRect(ctx, x - 2, 44, w + 4, 9, '#8a8f99');
  };
  jar(386, 34);
  circle(ctx, 398, 74, 5, '#c9973f');
  circle(ctx, 410, 80, 4, '#6a707c');
  circle(ctx, 404, 64, 3.4, '#b03a4a');
  jar(430, 36);
  // Difference 2: fireflies, caught and glowing — or an empty jar.
  if (!alt.has(2)) {
    glow(ctx, 448, 70, 24, 'rgba(255,233,138,0.5)');
    for (const [x, y] of [[440, 62], [454, 58], [448, 74], [458, 78], [438, 80]]) {
      circle(ctx, x, y, 2.4, '#ffe98a');
    }
  }
  // Books leaning, and a thimble of pencils.
  const spines = [[478, '#7a3a4a'], [492, '#3a5a7a'], [506, '#4a7a4e']];
  for (const [x, c] of spines) fillRect(ctx, x, 48, 13, 42, c);
  fillRect(ctx, 524, 58, 26, 32, '#8a5a33');
  line(ctx, 530, 58, 526, 40, '#d9a441', 2.5);
  line(ctx, 537, 58, 539, 38, '#b03a4a', 2.5);
  line(ctx, 544, 58, 550, 42, '#3a5a7a', 2.5);
}

function drawBenchItems(ctx, alt) {
  // The lantern (difference 5): lit, or cold.
  softShadow(ctx, 96, 370, 24, 5);
  fillRect(ctx, 80, 356, 32, 8, '#2c2c34');
  roundedRect(ctx, 83, 316, 26, 42, 4, 'rgba(205,225,245,0.3)');
  fillRect(ctx, 91, 338, 10, 20, '#e8ddc8'); // candle
  poly(ctx, [[83, 316], [109, 316], [96, 304]], '#2c2c34');
  if (!alt.has(5)) {
    glow(ctx, 96, 330, 40, 'rgba(255,184,94,0.55)');
    ellipse(ctx, 96, 330, 4.5, 8, '#ffb85e');
    ellipse(ctx, 96, 333, 2.2, 4.5, '#fff0b8');
  }
  // A mug, a stack of books, an oil can.
  roundedRect(ctx, 168, 338, 26, 26, 4, '#3a5a7a');
  ctx.beginPath();
  ctx.arc(198, 351, 7, -Math.PI / 2, Math.PI / 2);
  ctx.strokeStyle = '#3a5a7a';
  ctx.lineWidth = 4;
  ctx.stroke();
  fillRect(ctx, 214, 348, 52, 16, '#7a3a4a');
  fillRect(ctx, 220, 332, 44, 16, '#4a7a4e');
  poly(ctx, [[344, 364], [344, 336], [352, 324], [360, 336], [360, 364]], '#8a8f99');
  fillRect(ctx, 340, 362, 24, 5, '#5a5f68');
  // The robot toy, mid-repair (difference 3: its eyes are lit — or dark).
  softShadow(ctx, 488, 370, 34, 5);
  roundedRect(ctx, 462, 288, 52, 62, 8, '#b8c4cc');
  roundedRect(ctx, 472, 306, 32, 26, 4, '#7e8c96');
  circle(ctx, 482, 319, 4, '#d94f3d');
  circle(ctx, 494, 319, 4, '#f2b13d');
  roundedRect(ctx, 468, 248, 40, 42, 8, '#c8d2da');
  line(ctx, 488, 248, 488, 232, '#7e8c96', 3);
  circle(ctx, 488, 228, 5, '#d94f3d');
  if (!alt.has(3)) {
    glow(ctx, 488, 268, 20, 'rgba(126,240,232,0.5)');
    circle(ctx, 480, 268, 4, '#7ef0e8');
    circle(ctx, 496, 268, 4, '#7ef0e8');
  } else {
    circle(ctx, 480, 268, 4, '#2a3438');
    circle(ctx, 496, 268, 4, '#2a3438');
  }
  line(ctx, 484, 280, 492, 280, '#5a666e', 2.5);
  line(ctx, 462, 300, 446, 322, '#8a97a1', 6); // arms
  line(ctx, 514, 300, 530, 322, '#8a97a1', 6);
  fillRect(ctx, 468, 350, 14, 16, '#7e8c96');
  fillRect(ctx, 494, 350, 14, 16, '#7e8c96');
}

function drawWallTools(ctx, alt) {
  // Peg rail with a hammer, a wrench and a saw.
  fillRect(ctx, 366, 246, 198, 8, '#4a3220');
  const hook = (x) => line(ctx, x, 254, x, 262, '#2c1e10', 3);
  hook(392); hook(452); hook(522);
  // Hammer.
  line(ctx, 392, 262, 392, 306, '#8a5a33', 5);
  roundedRect(ctx, 380, 254, 24, 12, 3, '#6a707c');
  // Difference 6: the wrench is out on a job.
  if (!alt.has(6)) {
    line(ctx, 452, 262, 452, 300, '#9aa2ac', 6);
    circle(ctx, 452, 266, 6, '#9aa2ac');
    circle(ctx, 452, 266, 3, '#75522f');
    roundedRect(ctx, 447, 296, 10, 12, 3, '#9aa2ac');
  }
  // Saw.
  poly(ctx, [[508, 262], [548, 262], [540, 292], [512, 288]], '#b8c0c8');
  roundedRect(ctx, 502, 256, 14, 18, 3, '#8a5a33');
}

export function paint(ctx, alt) {
  gradientRect(ctx, 0, 0, 600, 500, [[0, '#8a6242'], [0.66, '#75522f'], [1, '#5a3a24']]);
  ctx.strokeStyle = 'rgba(46,29,15,0.4)';
  for (let x = 24; x < 600; x += 46) line(ctx, x, 0, x, 336, 'rgba(46,29,15,0.4)', 2);
  fillRect(ctx, 0, 336, 600, 164, '#54371f');
  line(ctx, 0, 336, 600, 336, '#2c1e10', 4);
  drawWindow(ctx, alt);
  drawClock(ctx, alt);
  gear(ctx, 408, 140, 50, 12, '#c9973f', '#8a6420');
  // Difference 1: the small gear is brass — or verdigris.
  gear(ctx, 488, 216, 35, 10, alt.has(1) ? '#4f9a8a' : '#c9973f', '#8a6420');
  gear(ctx, 350, 224, 27, 9, '#6a707c', '#454a54');
  drawShelf(ctx, alt);
  // Difference 4: the pinned blueprint.
  if (!alt.has(4)) {
    roundedRect(ctx, 36, 268, 96, 74, 3, '#dfe8f2');
    circle(ctx, 74, 298, 17, 'none');
    ctx.beginPath();
    ctx.arc(74, 298, 17, 0, TAU);
    ctx.strokeStyle = '#4a6a9a';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(74, 298, 6, 0, TAU);
    ctx.stroke();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU;
      line(ctx, 74 + Math.cos(a) * 6, 298 + Math.sin(a) * 6, 74 + Math.cos(a) * 17, 298 + Math.sin(a) * 17, '#4a6a9a', 2);
    }
    line(ctx, 100, 282, 124, 282, 'rgba(74,106,154,0.7)', 2);
    line(ctx, 100, 292, 124, 292, 'rgba(74,106,154,0.7)', 2);
    line(ctx, 44, 322, 124, 322, 'rgba(74,106,154,0.55)', 2);
    circle(ctx, 42, 274, 3.5, '#b03a4a');
    circle(ctx, 126, 274, 3.5, '#b03a4a');
  } else {
    circle(ctx, 42, 274, 3, '#2c1e10');
  }
  drawWallTools(ctx, alt);
  // The workbench and everything on it.
  softShadow(ctx, 300, 470, 270, 10);
  fillRect(ctx, 36, 368, 528, 15, '#7a5230');
  fillRect(ctx, 36, 383, 528, 6, '#5a3a20');
  fillRect(ctx, 52, 389, 14, 92, '#4a3018');
  fillRect(ctx, 534, 389, 14, 92, '#4a3018');
  fillRect(ctx, 52, 438, 496, 9, '#4a3018'); // lower shelf
  fillRect(ctx, 90, 402, 60, 36, '#6e4525'); // crate under the bench
  fillRect(ctx, 420, 406, 74, 32, '#5a6b7d');
  drawBenchItems(ctx, alt);
  // A stool and a worn rug.
  ellipse(ctx, 176, 404, 30, 9, '#8a5a33');
  fillRect(ctx, 158, 408, 6, 40, '#5a3a20');
  fillRect(ctx, 188, 408, 6, 40, '#5a3a20');
  ellipse(ctx, 310, 476, 150, 17, '#7a3a3a');
  ellipse(ctx, 310, 476, 118, 12.5, '#a05a4a');
  ellipse(ctx, 310, 476, 84, 8.5, '#7a3a3a');
  // Dust motes drifting in the lamplight.
  const rand = rng(3311);
  for (let i = 0; i < 26; i++) {
    circle(ctx, 40 + rand() * 300, 60 + rand() * 300, 1.2, 'rgba(255,230,170,0.35)');
  }
}

export const scene = {
  id: 'workshop',
  name: 'Clockwork Workshop',
  short: 'Workshop',
  sub: 'Something in here is ticking that should not be.',
  time: 270,
  paint,
  diffs: [
    { x: 294, y: 142, r: 38, note: 'The pendulum clock tells a different time' },
    { x: 488, y: 216, r: 40, note: 'The small gear has tarnished green' },
    { x: 448, y: 68, r: 27, note: 'The fireflies have left their jar' },
    { x: 488, y: 268, r: 30, note: "The robot's eyes have gone dark" },
    { x: 84, y: 305, r: 40, note: 'The blueprint has been taken down' },
    { x: 96, y: 330, r: 28, note: 'The lantern has gone out' },
    { x: 452, y: 278, r: 27, note: 'The wrench is out on a job' },
    { x: 172, y: 156, r: 42, note: 'The window curtain has been tied back' },
  ],
};
