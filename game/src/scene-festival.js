// scene-festival.js — "Balloon Festival": a fairground at sunset, balloons
// over the hills and every light strung. The painter draws the whole scene
// from primitives; `alt` is the set of difference indexes switched on for
// the right-hand picture.

import {
  TAU, rng, gradientRect, glow, circle, ellipse, softShadow, line, poly,
  roundedRect, fillRect,
} from './art.js';

// A hot-air balloon: striped envelope (clipped vertical bands), ropes and
// a basket. `main` is the changing stripe colour.
function balloon(ctx, x, y, r, main, band) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.clip();
  fillRect(ctx, x - r, y - r, r * 2, r * 2, band);
  const stripeW = (r * 2) / 5;
  for (let i = 0; i < 5; i += 2) fillRect(ctx, x - r + i * stripeW, y - r, stripeW, r * 2, main);
  ctx.restore();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.strokeStyle = 'rgba(60,30,40,0.35)';
  ctx.lineWidth = 2;
  ctx.stroke();
  // The skirt tapering to the basket.
  poly(ctx, [[x - r * 0.32, y + r * 0.82], [x + r * 0.32, y + r * 0.82], [x + r * 0.16, y + r * 1.22], [x - r * 0.16, y + r * 1.22]], main);
  line(ctx, x - r * 0.16, y + r * 1.22, x - r * 0.16, y + r * 1.38, '#5a4028', 2);
  line(ctx, x + r * 0.16, y + r * 1.22, x + r * 0.16, y + r * 1.38, '#5a4028', 2);
  roundedRect(ctx, x - r * 0.22, y + r * 1.36, r * 0.44, r * 0.3, 3, '#8a5a33');
}

function drawWheel(ctx, alt) {
  const cx = 150, cy = 208, r = 100;
  line(ctx, cx, cy, cx - 48, 386, '#4a2c40', 8); // legs
  line(ctx, cx, cy, cx + 48, 386, '#4a2c40', 8);
  for (const rr of [r, r * 0.78]) {
    ctx.beginPath();
    ctx.arc(cx, cy, rr, 0, TAU);
    ctx.strokeStyle = '#5d3550';
    ctx.lineWidth = 5;
    ctx.stroke();
  }
  const cabinColours = ['#d94f5d', '#f2b13d', '#4a9a8a', '#7a4ec2', '#ff8fab', '#4a7ab5', '#f08a3d', '#6ab04c'];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU + 0.2;
    const gx = cx + Math.cos(a) * r;
    const gy = cy + Math.sin(a) * r;
    line(ctx, cx, cy, gx, gy, '#5d3550', 3);
    // Difference 1: one gondola has been taken down.
    if (i === 7 && alt.has(1)) continue;
    line(ctx, gx, gy, gx, gy + 8, '#4a2c40', 2.5);
    roundedRect(ctx, gx - 10, gy + 8, 20, 15, 4, cabinColours[i]);
    poly(ctx, [[gx - 12, gy + 9], [gx + 12, gy + 9], [gx, gy + 1]], '#3a2233');
  }
  circle(ctx, cx, cy, 11, '#f2b13d');
  circle(ctx, cx, cy, 5, '#8a6420');
}

function drawBunting(ctx, alt) {
  const p0 = [16, 84], p1 = [300, 130], p2 = [584, 66];
  ctx.beginPath();
  ctx.moveTo(p0[0], p0[1]);
  ctx.quadraticCurveTo(p1[0], p1[1], p2[0], p2[1]);
  ctx.strokeStyle = 'rgba(50,25,40,0.7)';
  ctx.lineWidth = 2;
  ctx.stroke();
  const colours = ['#d94f5d', '#f2b13d', '#4a9a8a', '#ff8fab', '#7a4ec2', '#f08a3d', '#4a7ab5'];
  for (let i = 0; i < 11; i++) {
    const t = (i + 0.5) / 11;
    const x = (1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0];
    const y = (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1];
    // Difference 2: the middle flag is amber — or violet.
    const colour = i === 5 ? (alt.has(2) ? '#7a4ec2' : '#f2b13d') : colours[i % colours.length];
    poly(ctx, [[x - 8, y], [x + 8, y], [x, y + 19]], colour);
  }
}

function drawTent(ctx, alt) {
  softShadow(ctx, 408, 428, 92, 8);
  // Walls with a dark doorway.
  fillRect(ctx, 330, 356, 156, 68, '#f6ecd2');
  fillRect(ctx, 330, 356, 156, 10, '#e3d3ac');
  poly(ctx, [[392, 424], [424, 424], [408, 378]], '#4a2c40');
  // The striped cone roof, clipped bands over a triangle.
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(312, 360);
  ctx.lineTo(504, 360);
  ctx.lineTo(408, 272);
  ctx.closePath();
  ctx.clip();
  fillRect(ctx, 312, 272, 192, 88, '#fdf6ec');
  for (let i = 0; i < 6; i += 2) fillRect(ctx, 312 + i * 32, 272, 32, 88, '#d94f5d');
  ctx.restore();
  line(ctx, 312, 360, 408, 272, 'rgba(90,40,50,0.4)', 2);
  line(ctx, 504, 360, 408, 272, 'rgba(90,40,50,0.4)', 2);
  // Difference 4: the pennant flying from the peak.
  line(ctx, 408, 272, 408, 248, '#4a2c40', 3);
  if (!alt.has(4)) poly(ctx, [[408, 248], [430, 254], [408, 261]], '#d94f5d');
}

function drawStall(ctx, alt) {
  softShadow(ctx, 531, 472, 60, 7);
  fillRect(ctx, 484, 392, 94, 76, '#7a4a5e');
  fillRect(ctx, 484, 392, 94, 10, '#5d3550');
  // Jars of sweets on the counter.
  for (const [x, c] of [[498, '#d94f5d'], [520, '#f2b13d'], [542, '#4a9a8a']]) {
    roundedRect(ctx, x, 372, 16, 22, 4, 'rgba(230,240,250,0.5)');
    circle(ctx, x + 8, 384, 4.5, c);
    circle(ctx, x + 5, 376, 3, c);
  }
  // Difference 6: a striped awning — or a plain one.
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(474, 362);
  ctx.lineTo(588, 362);
  ctx.lineTo(576, 336);
  ctx.lineTo(486, 336);
  ctx.closePath();
  ctx.clip();
  fillRect(ctx, 474, 336, 114, 26, alt.has(6) ? '#a8d8b9' : '#fdf6ec');
  if (!alt.has(6)) {
    for (let i = 0; i < 7; i += 2) fillRect(ctx, 474 + i * 17, 336, 17, 26, '#ff8fab');
  }
  ctx.restore();
  line(ctx, 484, 392, 484, 362, '#4a2c40', 4);
  line(ctx, 578, 392, 578, 362, '#4a2c40', 4);
}

function drawLanterns(ctx, alt) {
  // A string of paper lanterns across the fairground's front.
  line(ctx, 30, 452, 30, 394, '#33202e', 6);
  line(ctx, 570, 452, 570, 394, '#33202e', 6);
  ctx.beginPath();
  ctx.moveTo(30, 396);
  ctx.quadraticCurveTo(300, 430, 570, 396);
  ctx.strokeStyle = 'rgba(30,16,26,0.8)';
  ctx.lineWidth = 2;
  ctx.stroke();
  const spots = [[90, 405], [170, 412], [250, 416], [330, 416], [410, 412], [490, 405]];
  spots.forEach(([x, y], i) => {
    // Difference 7: one lantern has gone dark.
    const dark = i === 1 && alt.has(7);
    if (!dark) glow(ctx, x, y + 11, 17, 'rgba(255,196,100,0.55)');
    ellipse(ctx, x, y + 11, 8.5, 10, dark ? '#6a4a5c' : '#ffd98f');
    line(ctx, x, y, x, y + 2, '#33202e', 2);
    line(ctx, x - 5, y + 4, x - 5, y + 18, 'rgba(120,70,60,0.5)', 1.2);
    line(ctx, x + 5, y + 4, x + 5, y + 18, 'rgba(120,70,60,0.5)', 1.2);
  });
}

export function paint(ctx, alt) {
  gradientRect(ctx, 0, 0, 600, 500, [
    [0, '#ffd9a0'], [0.3, '#ffab7d'], [0.55, '#e87a7d'], [0.72, '#8a5570'], [1, '#46304a'],
  ]);
  glow(ctx, 300, 322, 110, 'rgba(255,220,150,0.55)');
  // The far hills and the fairground.
  ctx.beginPath();
  ctx.moveTo(0, 336);
  ctx.quadraticCurveTo(160, 292, 330, 326);
  ctx.quadraticCurveTo(470, 350, 600, 322);
  ctx.lineTo(600, 500);
  ctx.lineTo(0, 500);
  ctx.closePath();
  ctx.fillStyle = '#8a5570';
  ctx.fill();
  circle(ctx, 300, 330, 38, '#ffe9a8'); // the low sun, half behind the hills
  gradientRect(ctx, 0, 384, 600, 116, [[0, '#5d3a52'], [1, '#46304a']]);
  fillRect(ctx, 0, 380, 600, 5, '#6e4660');
  // Balloons: the small far one (difference 5) may not have launched.
  if (!alt.has(5)) balloon(ctx, 118, 82, 15, '#7a4a8c', '#a87ec2');
  balloon(ctx, 492, 142, 29, '#f2b13d', '#f6d789');
  // Difference 0: the big balloon's stripes are crimson — or teal.
  balloon(ctx, 306, 112, 46, alt.has(0) ? '#2a9a8e' : '#d94f5d', '#fdf6ec');
  drawBunting(ctx, alt);
  drawWheel(ctx, alt);
  drawTent(ctx, alt);
  drawStall(ctx, alt);
  // Difference 3: a kite dancing over the stalls.
  if (!alt.has(3)) {
    poly(ctx, [[524, 212], [546, 238], [524, 264], [502, 238]], '#ff7a66');
    line(ctx, 524, 212, 524, 264, 'rgba(90,40,30,0.5)', 1.5);
    line(ctx, 502, 238, 546, 238, 'rgba(90,40,30,0.5)', 1.5);
    ctx.beginPath();
    ctx.moveTo(518, 262);
    ctx.quadraticCurveTo(506, 292, 516, 318);
    ctx.strokeStyle = 'rgba(50,25,40,0.65)';
    ctx.lineWidth = 1.8;
    ctx.stroke();
    for (const [x, y] of [[510, 278], [508, 296], [512, 310]]) {
      poly(ctx, [[x - 6, y], [x + 6, y], [x, y + 7]], '#f2b13d');
    }
  }
  // A carousel roof peeking in at the left.
  poly(ctx, [[8, 428], [128, 428], [68, 384]], '#7a4ec2');
  poly(ctx, [[68, 384], [128, 428], [68, 428]], '#8a5ed1');
  fillRect(ctx, 8, 428, 120, 6, '#5d3550');
  fillRect(ctx, 30, 434, 8, 34, '#4a2c40');
  fillRect(ctx, 98, 434, 8, 34, '#4a2c40');
  ellipse(ctx, 68, 452, 13, 8, '#f2b13d'); // a carousel horse's back
  drawLanterns(ctx, alt);
  // Fairgoers as soft silhouettes along the bottom.
  const crowd = [[36, 486], [96, 492], [168, 484], [238, 492], [352, 486], [428, 492], [556, 486]];
  for (const [x, y] of crowd) {
    circle(ctx, x, y - 12, 9, '#2c1e33');
    roundedRect(ctx, x - 12, y - 4, 24, 18, 8, '#2c1e33');
  }
  // Fireflies and dust in the sunset air.
  const rand = rng(5505);
  for (let i = 0; i < 24; i++) {
    circle(ctx, 20 + rand() * 560, 350 + rand() * 120, 1.4, 'rgba(255,214,140,0.5)');
  }
}

export const scene = {
  id: 'festival',
  name: 'Balloon Festival',
  short: 'Festival',
  sub: 'The balloons go up at sunset and the fair lights come on.',
  time: 300,
  paint,
  diffs: [
    { x: 306, y: 112, r: 50, note: "The big balloon's stripes changed colour" },
    { x: 234, y: 158, r: 27, note: 'A gondola has been taken off the wheel' },
    { x: 300, y: 100, r: 25, note: 'One bunting flag changed colour' },
    { x: 524, y: 238, r: 32, note: 'The kite has come down' },
    { x: 416, y: 254, r: 25, note: 'The tent pennant is missing' },
    { x: 118, y: 82, r: 25, note: 'The little balloon never launched' },
    { x: 531, y: 350, r: 34, note: 'The stall awning lost its stripes' },
    { x: 170, y: 423, r: 25, note: 'One paper lantern has gone dark' },
  ],
};
