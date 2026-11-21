// scene-garden.js — "Rooftop Garden": a golden-hour garden above the city,
// sunflowers, tomato vines and a string of lights. The painter draws the
// whole scene from primitives; `alt` is the set of difference indexes
// switched on for the right-hand picture.

import {
  rng, gradientRect, glow, circle, ellipse, softShadow, line, poly,
  roundedRect, cloud, fillRect,
} from './art.js';

function drawSkyline(ctx) {
  // Pale rooftops and a water tower behind the parapet.
  const blocks = [[8, 226, 54], [70, 206, 44], [122, 236, 62], [196, 196, 40], [244, 222, 58], [392, 210, 48], [448, 232, 56]];
  for (const [x, top, w] of blocks) fillRect(ctx, x, top, w, 300 - top, '#c98d7a');
  const rand = rng(2202);
  ctx.fillStyle = 'rgba(255,240,210,0.5)';
  for (let i = 0; i < 26; i++) {
    ctx.fillRect(14 + rand() * 480, 214 + rand() * 70, 5, 7);
  }
  fillRect(ctx, 524, 196, 34, 44, '#b57a63'); // water tower tank
  poly(ctx, [[520, 196], [562, 196], [541, 178]], '#96604c');
  line(ctx, 528, 240, 524, 300, '#96604c', 4);
  line(ctx, 554, 240, 558, 300, '#96604c', 4);
}

function drawStringLights(ctx, alt) {
  // A catenary of bulbs sagging across the garden.
  const p0 = [24, 116], p1 = [300, 152], p2 = [576, 94];
  ctx.beginPath();
  ctx.moveTo(p0[0], p0[1]);
  ctx.quadraticCurveTo(p1[0], p1[1], p2[0], p2[1]);
  ctx.strokeStyle = 'rgba(70,40,30,0.75)';
  ctx.lineWidth = 2;
  ctx.stroke();
  const colours = ['#ffd98f', '#ff9e7d', '#a8e063', '#7ec8e3', '#ffd98f', '#ff9e7d', '#a8e063', '#7ec8e3', '#ffd98f', '#ff9e7d', '#a8e063'];
  for (let i = 0; i < colours.length; i++) {
    const t = (i + 0.5) / colours.length;
    const x = (1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0];
    const y = (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1];
    // Difference 2: the middle bulb burns amber — or blue.
    const colour = i === 5 && alt.has(2) ? '#5e9eff' : colours[i];
    line(ctx, x, y, x, y + 7, 'rgba(70,40,30,0.8)', 1.5);
    glow(ctx, x, y + 13, 13, 'rgba(255,205,110,0.4)');
    circle(ctx, x, y + 13, 5.5, colour);
  }
}

function drawSunflower(ctx, x, baseY, headY, r, withHead) {
  ctx.beginPath();
  ctx.moveTo(x, baseY);
  ctx.quadraticCurveTo(x + 6, (baseY + headY) / 2, x, headY);
  ctx.strokeStyle = '#4a7a3a';
  ctx.lineWidth = 5;
  ctx.stroke();
  ellipse(ctx, x - 10, (baseY + headY) / 2 + 16, 13, 6, '#5d9146');
  ellipse(ctx, x + 11, (baseY + headY) / 2 + 34, 12, 5.5, '#54853f');
  if (!withHead) return;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ellipse(ctx, x + Math.cos(a) * r * 0.78, headY + Math.sin(a) * r * 0.78, r * 0.42, r * 0.24, '#f7b731');
  }
  circle(ctx, x, headY, r * 0.58, '#6b4423');
  circle(ctx, x - r * 0.2, headY - r * 0.15, r * 0.09, '#8a5f30');
  circle(ctx, x + r * 0.22, headY + r * 0.1, r * 0.09, '#8a5f30');
  circle(ctx, x + r * 0.05, headY + r * 0.28, r * 0.08, '#8a5f30');
}

function drawPlanters(ctx, alt) {
  const planter = (x, w, tomatoes) => {
    softShadow(ctx, x + w / 2, 436, w / 2, 7);
    roundedRect(ctx, x, 380, w, 52, 4, '#8a5a33');
    fillRect(ctx, x, 380, w, 9, '#6e4525');
    fillRect(ctx, x + 4, 372, w - 8, 10, '#3a2a1c'); // soil
    for (const [tx, ty, green] of tomatoes) {
      ctx.beginPath();
      ctx.moveTo(tx, 376);
      ctx.quadraticCurveTo(tx + 6, 360, tx + 2, ty + 8);
      ctx.strokeStyle = '#4a7a3a';
      ctx.lineWidth = 3;
      ctx.stroke();
      ellipse(ctx, tx + 12, ty + 16, 11, 6, '#5d9146');
      circle(ctx, tx, ty, 9, green ? '#7ab648' : '#d94f3d');
      circle(ctx, tx - 3, ty - 3, 2.6, 'rgba(255,255,255,0.45)');
    }
  };
  planter(326, 150, [[352, 396, false], [388, 406, false], [420, 392, false], [452, 400, false]]);
  planter(486, 96, [[508, 396, false], [542, 404, false], [564, 392, false]]);
  // Difference 4: one tomato is still green — redrawn over the red one.
  if (alt.has(4)) {
    circle(ctx, 452, 400, 9, '#7ab648');
    circle(ctx, 449, 397, 2.6, 'rgba(255,255,255,0.45)');
  }
}

function drawBirdhouse(ctx, alt) {
  line(ctx, 520, 332, 520, 214, '#6e4525', 7);
  softShadow(ctx, 520, 336, 26, 5);
  roundedRect(ctx, 490, 152, 60, 62, 5, '#e2725b');
  poly(ctx, [[484, 154], [550, 154], [520, 126]], '#8a4a3a');
  circle(ctx, 520, 182, 10, '#3a241c');
  line(ctx, 508, 200, 532, 200, '#6e4525', 4); // perch
  fillRect(ctx, 490, 152, 60, 7, 'rgba(0,0,0,0.12)');
  // Difference 1: a robin resting on the roof.
  if (!alt.has(1)) {
    ellipse(ctx, 520, 122, 11, 8, '#5a6b7d');
    circle(ctx, 520, 124, 5.5, '#e8763a');
    circle(ctx, 529, 116, 5, '#5a6b7d');
    poly(ctx, [[533, 115], [540, 117], [533, 119]], '#33241a');
    poly(ctx, [[510, 124], [500, 132], [512, 130]], '#48586a');
    circle(ctx, 530, 115, 1.2, '#14100c');
  }
}

function drawChairAndCan(ctx, alt) {
  // A striped deck chair.
  softShadow(ctx, 434, 452, 52, 7);
  const stripeA = alt.has(6) ? '#6db3e8' : '#ff7a66'; // difference 6
  for (let i = 0; i < 6; i++) {
    fillRect(ctx, 402 + i * 11, 388, 11, 52, i % 2 === 0 ? stripeA : '#fdf6ec');
  }
  line(ctx, 398, 386, 398, 452, '#6e4525', 5);
  line(ctx, 472, 386, 472, 452, '#6e4525', 5);
  line(ctx, 398, 452, 472, 452, '#6e4525', 5);
  line(ctx, 398, 386, 472, 386, '#6e4525', 4);
  // Difference 3: the watering can, left by the sunflowers.
  if (!alt.has(3)) {
    softShadow(ctx, 142, 458, 30, 5);
    roundedRect(ctx, 118, 420, 46, 36, 6, '#9fb4bd');
    fillRect(ctx, 118, 420, 46, 8, '#87a0aa');
    poly(ctx, [[118, 432], [96, 418], [100, 410], [120, 424]], '#87a0aa');
    circle(ctx, 97, 413, 6, '#6e8894');
    ctx.beginPath();
    ctx.arc(164, 428, 12, -Math.PI * 0.4, Math.PI * 0.7);
    ctx.strokeStyle = '#87a0aa';
    ctx.lineWidth = 5;
    ctx.stroke();
  }
}

export function paint(ctx, alt) {
  gradientRect(ctx, 0, 0, 600, 500, [
    [0, '#ffe9bb'], [0.35, '#ffc98a'], [0.58, '#ffab7a'], [0.66, '#e88a63'], [1, '#7a4e30'],
  ]);
  glow(ctx, 92, 76, 90, 'rgba(255,214,120,0.65)');
  circle(ctx, 92, 76, 32, '#fff0b8');
  circle(ctx, 92, 76, 26, '#ffdf7e');
  cloud(ctx, 168, 56, 1.0, 'rgba(255,252,244,0.95)');
  cloud(ctx, 330, 130, 0.62, 'rgba(255,248,232,0.8)');
  // Difference 5: a small cloud over the skyline.
  if (!alt.has(5)) cloud(ctx, 428, 78, 0.8, 'rgba(255,252,244,0.92)');
  drawSkyline(ctx);
  // Parapet and deck.
  fillRect(ctx, 0, 296, 600, 32, '#b06a4e');
  fillRect(ctx, 0, 296, 600, 7, '#d9a37e');
  ctx.strokeStyle = 'rgba(90,40,25,0.35)';
  ctx.lineWidth = 1.5;
  for (let x = 26; x < 600; x += 52) line(ctx, x, 303, x, 328, 'rgba(90,40,25,0.35)', 1.5);
  gradientRect(ctx, 0, 328, 600, 172, [[0, '#a06a42'], [1, '#7a4e30']]);
  for (let y = 356; y < 500; y += 28) line(ctx, 0, y, 600, y, 'rgba(70,40,18,0.35)', 2);
  drawStringLights(ctx, alt);
  // Sunflowers along the parapet; difference 0: one has lost its head.
  drawSunflower(ctx, 66, 432, 272, 19, true);
  drawSunflower(ctx, 112, 432, 246, 21, true);
  drawSunflower(ctx, 158, 432, 284, 17, true);
  drawSunflower(ctx, 204, 432, 258, 20, !alt.has(0));
  drawSunflower(ctx, 246, 432, 292, 16, true);
  // Herb pots in the corner.
  for (const [x, s] of [[36, 1], [66, 0.8], [94, 0.9]]) {
    poly(ctx, [[x, 452], [x + 26 * s, 452], [x + 22 * s, 470], [x + 4 * s, 470]], '#c96f4a');
    ellipse(ctx, x + 13 * s, 446, 12 * s, 7 * s, '#5d9146');
    ellipse(ctx, x + 8 * s, 440, 7 * s, 6 * s, '#6fa653');
    ellipse(ctx, x + 18 * s, 441, 7 * s, 6 * s, '#54853f');
  }
  drawPlanters(ctx, alt);
  drawBirdhouse(ctx, alt);
  drawChairAndCan(ctx, alt);
  // A coiled hose and two bees, the same in both pictures.
  for (const r of [16, 10]) {
    ctx.beginPath();
    ctx.arc(268, 458, r, 0, Math.PI * 2);
    ctx.strokeStyle = '#3f7a4e';
    ctx.lineWidth = 5;
    ctx.stroke();
  }
  for (const [x, y] of [[300, 300], [86, 330]]) {
    ellipse(ctx, x, y, 4.5, 3.2, '#3a2c14');
    ellipse(ctx, x - 2, y - 4, 4, 2.2, 'rgba(255,255,255,0.75)');
  }
  // Difference 7: a butterfly over the planters.
  if (!alt.has(7)) {
    ellipse(ctx, 346, 292, 9, 6, '#9a6ad9');
    ellipse(ctx, 358, 292, 9, 6, '#b48ae8');
    ellipse(ctx, 348, 302, 7, 4.5, '#7a4ec2');
    ellipse(ctx, 356, 302, 7, 4.5, '#8a5ed1');
    fillRect(ctx, 350, 288, 3.5, 16, '#33241a');
  }
}

export const scene = {
  id: 'garden',
  name: 'Rooftop Garden',
  short: 'Garden',
  sub: 'Golden hour above the city, and the tomatoes are nearly ripe.',
  time: 255,
  paint,
  diffs: [
    { x: 204, y: 258, r: 30, note: 'A sunflower has lost its head' },
    { x: 520, y: 130, r: 28, note: 'The robin has flown from the birdhouse' },
    { x: 300, y: 136, r: 24, note: 'One string light burns a different colour' },
    { x: 140, y: 436, r: 32, note: 'The watering can is gone' },
    { x: 452, y: 400, r: 26, note: 'One tomato is still green' },
    { x: 464, y: 84, r: 38, note: 'A small cloud has drifted away' },
    { x: 434, y: 416, r: 36, note: 'The deck chair stripes changed colour' },
    { x: 352, y: 296, r: 25, note: 'The butterfly has fluttered off' },
  ],
};
