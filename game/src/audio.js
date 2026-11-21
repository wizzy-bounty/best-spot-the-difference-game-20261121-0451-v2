// audio.js — tiny WebAudio feedback sounds, synthesized on the spot: a
// chime for a find, a low thud for a miss, a soft blip for a hint and a
// small fanfare when a scene is completed. No audio files, nothing loads.

let ctx = null;
let muted = false;

function audioContext() {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, at, dur, type, gainPeak) {
  const ac = audioContext();
  if (!ac || muted) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  const t0 = ac.currentTime + at;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(gainPeak, t0 + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export function playFind(streak) {
  const base = 620 + Math.min(streak, 8) * 45;
  tone(base, 0, 0.14, 'sine', 0.16);
  tone(base * 1.5, 0.07, 0.18, 'sine', 0.12);
}

export function playMiss() {
  tone(150, 0, 0.16, 'triangle', 0.2);
  tone(110, 0.05, 0.2, 'triangle', 0.14);
}

export function playHint() {
  tone(880, 0, 0.1, 'sine', 0.1);
  tone(1174, 0.08, 0.14, 'sine', 0.08);
}

export function playComplete() {
  for (const [i, f] of [523, 659, 784, 1046].entries()) {
    tone(f, i * 0.09, 0.22, 'sine', 0.13);
  }
}

export function playFail() {
  for (const [i, f] of [392, 330, 262].entries()) {
    tone(f, i * 0.11, 0.24, 'triangle', 0.13);
  }
}

export function toggleMute() {
  muted = !muted;
  return muted;
}
