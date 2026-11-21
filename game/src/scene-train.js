// scene-train.js — "Night Train Platform": a vintage train waiting under a
// violet dusk, all lamplight and steam. The painter draws the whole scene
// from primitives; `alt` is the set of difference indexes switched on for
// the right-hand picture, so the two panels match except at the eight
// differences listed at the bottom.

import {
  TAU, rng, fillRect, gradientRect, glow, circle, ellipse, softShadow,
  line, poly, roundedRect, sparkle, moon, clockHands,
} from './art.js';

const SKY_COVER = '#2b2450'; // sky colour behind the moon, for its crescent

function drawStars(ctx) {
  const rand = rng(1101);
  for (let i = 0; i < 90; i++) {
    const x = rand() * 600;
    const y = rand() * 205;
    const a = 0.25 + rand() * 0.65;
    circle(ctx, x, y, rand() < 0.12 ? 1.8 : 1.1, `rgba(255,246,220,${a})`);
  }
  sparkle(ctx, 66, 52, 9, 'rgba(255,246,220,0.8)');
  sparkle(ctx, 388, 40, 7, 'rgba(255,246,220,0.65)');
  sparkle(ctx, 210, 118, 6, 'rgba(255,246,220,0.55)');
}

function drawRooftops(ctx, alt) {
  // Distant hill band, then a row of house silhouettes against the dusk.
  ctx.beginPath();
  ctx.moveTo(0, 292);
  ctx.quadraticCurveTo(140, 252, 300, 282);
  ctx.quadraticCurveTo(450, 306, 600, 278);
  ctx.lineTo(600, 336);
  ctx.lineTo(0, 336);
  ctx.closePath();
  ctx.fillStyle = '#1d1836';
  ctx.fill();

  const house = (x, w, top, roofH) => {
    fillRect(ctx, x, top, w, 336 - top, '#141226');
    poly(ctx, [[x - 6, top], [x + w / 2, top - roofH], [x + w + 6, top]], '#0e0c1e');
  };
  house(18, 64, 288, 22);
  house(96, 58, 272, 26);
  house(430, 72, 280, 24);
  house(520, 66, 292, 20);

  // The smoking chimney (difference 7): three soft puffs, or none.
  fillRect(ctx, 110, 240, 15, 34, '#141226');
  if (!alt.has(7)) {
    circle(ctx, 117, 228, 8, 'rgba(190,185,205,0.5)');
    circle(ctx, 124, 212, 11, 'rgba(190,185,205,0.38)');
    circle(ctx, 134, 192, 14, 'rgba(190,185,205,0.26)');
  }
  // Two lit windows, the same in both pictures.
  fillRect(ctx, 34, 302, 9, 12, '#ffb85e');
  fillRect(ctx, 452, 296, 9, 12, '#ffb85e');
}

function drawTrain(ctx, alt) {
  // Wheels and under-frame first, then the bodies above them.
  for (const x of [70, 130, 178, 258, 348, 452, 540]) {
    circle(ctx, x, 342, 13, '#0d1017');
    circle(ctx, x, 342, 5, '#3a4152');
  }
  fillRect(ctx, 30, 322, 548, 10, '#0d1017');

  // Locomotive.
  roundedRect(ctx, 36, 214, 168, 112, 8, '#1e4d3a');
  roundedRect(ctx, 36, 214, 168, 20, 8, '#2c6a4e');
  fillRect(ctx, 150, 188, 54, 40, '#173c2c'); // cab
  roundedRect(ctx, 158, 196, 34, 26, 4, '#ffca7a'); // cab window, lit
  fillRect(ctx, 62, 182, 18, 34, '#12291f'); // chimney
  fillRect(ctx, 56, 176, 30, 9, '#0d1f17');
  // Steam from the chimney — the same in both pictures.
  circle(ctx, 71, 162, 9, 'rgba(225,222,235,0.55)');
  circle(ctx, 80, 144, 13, 'rgba(225,222,235,0.4)');
  circle(ctx, 94, 122, 17, 'rgba(225,222,235,0.26)');
  glow(ctx, 44, 268, 30, 'rgba(255,190,90,0.5)');
  circle(ctx, 44, 268, 10, '#ffd98f'); // headlamp
  poly(ctx, [[30, 326], [66, 326], [30, 300]], '#8a2f35'); // cowcatcher hint
  line(ctx, 60, 312, 196, 312, '#c8b280', 3); // side rod

  // Two carriages with a cream stripe and lit windows.
  const carriage = (x, darkWindow) => {
    roundedRect(ctx, x, 208, 172, 118, 8, '#266050');
    ctx.beginPath();
    ctx.roundRect(x - 2, 196, 176, 18, 8);
    ctx.fillStyle = '#17352a';
    ctx.fill();
    fillRect(ctx, x, 250, 172, 13, '#e8d9a8');
    for (let i = 0; i < 3; i++) {
      const wx = x + 18 + i * 52;
      const isDark = darkWindow === i;
      roundedRect(ctx, wx, 222, 36, 42, 5, isDark ? '#1a2a33' : '#ffca7a');
      if (!isDark) {
        fillRect(ctx, wx + 4, 226, 12, 34, 'rgba(255,255,255,0.35)');
        if (i === 1) { // a passenger's silhouette, the same in both
          circle(ctx, wx + 18, 246, 7, 'rgba(90,50,30,0.55)');
          ellipse(ctx, wx + 18, 262, 10, 6, 'rgba(90,50,30,0.55)');
        }
      }
    }
    roundedRect(ctx, x + 66, 278, 40, 48, 4, '#1b4634'); // door
  };
  carriage(212, -1);
  carriage(404, alt.has(3) ? 0 : -1); // difference 3: a window gone dark
  fillRect(ctx, 392, 226, 12, 92, '#101d18'); // bellows between carriages
}

function drawPlatform(ctx, alt) {
  gradientRect(ctx, 0, 336, 600, 164, [[0, '#7d5a40'], [0.25, '#6d4c39'], [1, '#453050']]);
  fillRect(ctx, 0, 336, 600, 9, '#a37f56'); // platform edge
  fillRect(ctx, 0, 345, 600, 5, '#d9a441'); // safety stripe
  ctx.strokeStyle = 'rgba(30,18,20,0.35)';
  ctx.lineWidth = 2;
  for (let x = 38; x < 600; x += 74) line(ctx, x, 356, x - 8, 498, 'rgba(30,18,20,0.35)', 2);
  line(ctx, 0, 428, 600, 428, 'rgba(30,18,20,0.3)', 2);
  // A puddle holding the moon.
  ellipse(ctx, 148, 470, 66, 10, 'rgba(38,50,88,0.85)');
  ellipse(ctx, 132, 468, 20, 3.5, 'rgba(210,220,255,0.5)');
  ellipse(ctx, 176, 473, 12, 2.5, 'rgba(255,200,120,0.4)');
}

function drawSign(ctx, alt) {
  // A gantry beam and a hanging board: "AMBER BAY" and an arrow.
  fillRect(ctx, 0, 30, 600, 10, '#0e0c1e');
  line(ctx, 200, 40, 200, 54, '#0e0c1e', 4);
  line(ctx, 316, 40, 316, 54, '#0e0c1e', 4);
  roundedRect(ctx, 166, 54, 184, 38, 6, '#1d1836');
  ctx.strokeStyle = '#c8a24a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(166, 54, 184, 38, 6);
  ctx.stroke();
  ctx.fillStyle = '#f2e3b2';
  ctx.font = "700 19px Georgia, 'Times New Roman', serif";
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('AMBER BAY', 246, 74);
  // Difference 5: the arrow points the other way.
  const dir = alt.has(5) ? -1 : 1;
  const ax = 322;
  line(ctx, ax - 12 * dir, 73, ax + 12 * dir, 73, '#f2e3b2', 3.5);
  poly(ctx, [[ax + 16 * dir, 73], [ax + 4 * dir, 66], [ax + 4 * dir, 80]], '#f2e3b2');
}

function drawLamp(ctx, x, lit) {
  line(ctx, x, 352, x, 196, '#0d0f1c', 6);
  ctx.beginPath();
  ctx.arc(x, 196, 14, Math.PI, 0);
  ctx.strokeStyle = '#0d0f1c';
  ctx.lineWidth = 5;
  ctx.stroke();
  fillRect(ctx, x - 9, 344, 18, 8, '#0d0f1c');
  if (lit) {
    glow(ctx, x, 182, 46, 'rgba(255,186,92,0.55)');
    circle(ctx, x, 182, 10, '#ffd98f');
    circle(ctx, x, 182, 5, '#fff3cf');
  } else {
    circle(ctx, x, 182, 10, '#272c3d');
  }
}

function drawClock(ctx, alt) {
  line(ctx, 320, 352, 320, 190, '#0d0f1c', 6);
  fillRect(ctx, 311, 344, 18, 8, '#0d0f1c');
  circle(ctx, 320, 158, 29, '#c8a24a');
  circle(ctx, 320, 158, 24, '#f6ecd2');
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    line(ctx, 320 + Math.cos(a) * 19, 158 + Math.sin(a) * 19,
      320 + Math.cos(a) * 22, 158 + Math.sin(a) * 22, '#5a4632', 2);
  }
  // Difference 1: the last train left at 7:10 — or was it 8:35?
  if (alt.has(1)) clockHands(ctx, 320, 158, 24, 8, 35, '#33241a');
  else clockHands(ctx, 320, 158, 24, 7, 10, '#33241a');
}

function drawBenchAndCases(ctx, alt) {
  // Bench.
  softShadow(ctx, 456, 436, 74, 8);
  for (let i = 0; i < 3; i++) roundedRect(ctx, 394, 396 + i * 11, 124, 7, 3, '#8a5a33');
  fillRect(ctx, 402, 402, 8, 34, '#4a3520');
  fillRect(ctx, 502, 402, 8, 34, '#4a3520');
  // A stack of suitcases waiting for the train.
  softShadow(ctx, 292, 464, 58, 7);
  roundedRect(ctx, 246, 428, 92, 34, 5, '#7a4a2a');
  roundedRect(ctx, 254, 402, 76, 28, 5, '#9a6a35');
  // Difference 6: the top case is crimson — or teal.
  roundedRect(ctx, 262, 376, 60, 28, 5, alt.has(6) ? '#2a7a78' : '#b03a4a');
  for (const [x, y, w, h] of [[246, 428, 92, 34], [254, 402, 76, 28], [262, 376, 60, 28]]) {
    line(ctx, x + 14, y, x + 14, y + h, 'rgba(40,22,10,0.5)', 3);
    line(ctx, x + w - 14, y, x + w - 14, y + h, 'rgba(40,22,10,0.5)', 3);
  }
  line(ctx, 282, 376, 302, 376, '#3a2413', 4); // handle
}

function drawCat(ctx) {
  // The station cat, sitting by the bench, watching the train.
  softShadow(ctx, 548, 452, 22, 5);
  ellipse(ctx, 548, 434, 15, 19, '#14101e');
  circle(ctx, 548, 410, 10.5, '#14101e');
  poly(ctx, [[541, 404], [543, 394], [548, 402]], '#14101e');
  poly(ctx, [[555, 404], [553, 394], [548, 402]], '#14101e');
  ctx.beginPath();
  ctx.arc(566, 446, 12, Math.PI * 0.9, Math.PI * 1.9);
  ctx.strokeStyle = '#14101e';
  ctx.lineWidth = 5;
  ctx.stroke();
  circle(ctx, 544.5, 410, 1.6, '#ffb85e');
  circle(ctx, 551.5, 410, 1.6, '#ffb85e');
}

export function paint(ctx, alt) {
  gradientRect(ctx, 0, 0, 600, 500, [
    [0, '#171f3d'], [0.4, '#3c2d5a'], [0.62, '#8a4a52'], [0.72, '#c97a4a'], [0.78, '#5a3a4a'], [1, '#453050'],
  ]);
  drawStars(ctx);
  // Difference 0: a full moon — or a crescent.
  moon(ctx, 505, 78, 30, '#f4ecd8', alt.has(0) ? SKY_COVER : null);
  // Overhead wires sagging across the top.
  ctx.strokeStyle = 'rgba(10,8,20,0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 14);
  ctx.quadraticCurveTo(300, 34, 600, 12);
  ctx.stroke();
  drawRooftops(ctx, alt);
  drawTrain(ctx, alt);
  drawPlatform(ctx, alt);
  drawSign(ctx, alt);
  drawLamp(ctx, 90, true);
  drawLamp(ctx, 470, !alt.has(2)); // difference 2: the far lamp has gone out
  drawClock(ctx, alt);
  drawBenchAndCases(ctx, alt);
  if (!alt.has(4)) drawCat(ctx); // difference 4: the cat has wandered off
  fillRect(ctx, 0, 478, 600, 22, 'rgba(10,6,18,0.18)');
}

export const scene = {
  id: 'train',
  name: 'Night Train Platform',
  short: 'Train',
  sub: 'The last train to Amber Bay is running late.',
  time: 240,
  paint,
  diffs: [
    { x: 505, y: 78, r: 38, note: 'The moon has thinned to a crescent' },
    { x: 320, y: 158, r: 34, note: 'The station clock tells a different time' },
    { x: 470, y: 182, r: 34, note: 'The far lamp has gone out' },
    { x: 437, y: 243, r: 28, note: 'A carriage window has gone dark' },
    { x: 548, y: 426, r: 32, note: 'The station cat has wandered off' },
    { x: 258, y: 73, r: 46, note: 'The sign arrow points the other way' },
    { x: 292, y: 390, r: 32, note: 'The top suitcase changed colour' },
    { x: 122, y: 212, r: 34, note: 'The chimney smoke has stopped' },
  ],
};
