// Génère la musique provisoire de la pub IPhone15ProMaxAd (public/music-iphone.mp3) :
// électro cinématique sombre, 120 BPM (un temps = 15 images à 30 images/s).
// Coups forts sur la révélation du téléphone (5 s) et sur le plan final (18 s).
// Usage : npm run sfx:iphone
import {execSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {buffer, lowpass, noise, rand, softClip, SR, writeWav} from './audio-utils.mjs';

const publicDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'public');
const BEAT = 0.5;
const STEP = BEAT / 4;
const DURATION = 20.4;
const mtof = (m) => 440 * 2 ** ((m - 69) / 12);

const b = buffer(DURATION);
const add = (start, samples, gain = 1) => {
  const s0 = Math.round(start * SR);
  for (let i = 0; i < samples.length && s0 + i < b.length; i++) b[s0 + i] += samples[i] * gain;
};

const kick = (() => {
  const k = buffer(0.5);
  let phase = 0;
  for (let i = 0; i < k.length; i++) {
    const t = i / SR;
    phase += (2 * Math.PI * (42 + 110 * Math.exp(-t * 30))) / SR;
    k[i] = softClip(Math.sin(phase) * Math.exp(-t * 6) * 1.4);
  }
  return k;
})();

const tick = (() => {
  const h = buffer(0.04);
  let prev = 0;
  for (let i = 0; i < h.length; i++) {
    const n = noise();
    h[i] = (n - prev) * Math.exp(-(i / SR) * 120) * 0.4;
    prev = n;
  }
  return h;
})();

const clap = (() => {
  const raw = buffer(0.35).map(() => noise());
  const low = lowpass(raw, () => 1200);
  const bp = lowpass(raw, () => 5000).map((v, i) => v - low[i]);
  return bp.map((v, i) => v * Math.exp(-(i / SR) * 14) * 1.6);
})();

// Accord doux (sinus + légère harmonique), enveloppe lente
const addChord = (start, notes, length, gain, attack = 0.02) => {
  const s = buffer(length);
  notes.forEach((note) => {
    const f = mtof(note);
    const ph = rand() * Math.PI * 2;
    for (let i = 0; i < s.length; i++) {
      const t = i / SR;
      const env = Math.min(1, t / attack) * Math.min(1, (length - t) / 0.6);
      s[i] += (Math.sin(2 * Math.PI * f * t + ph) + 0.25 * Math.sin(4 * Math.PI * f * t)) * env;
    }
  });
  add(start, s, gain / notes.length);
};

const addPluck = (start, note, gain) => {
  const s = buffer(0.4);
  const f = mtof(note);
  for (let i = 0; i < s.length; i++) {
    const t = i / SR;
    s[i] = (Math.sin(2 * Math.PI * f * t) + 0.4 * Math.sin(6 * Math.PI * f * t) * Math.exp(-t * 20)) * Math.exp(-t * 9);
  }
  add(start, s, gain);
};

const addBoom = (start, gain) => {
  const s = buffer(2.5);
  let phase = 0;
  for (let i = 0; i < s.length; i++) {
    const t = i / SR;
    phase += (2 * Math.PI * (32 + 70 * Math.exp(-t * 5))) / SR;
    s[i] = softClip(Math.sin(phase) * Math.exp(-t * 1.3) * 1.5 + noise() * Math.exp(-t * 14) * 0.35);
  }
  add(start, s, gain);
};

const addRiser = (start, d, gain) => {
  const raw = buffer(d).map(() => noise());
  const swept = lowpass(raw, (t) => 200 + 6000 * (t / d) ** 2);
  add(start, swept.map((x, i) => x * (i / SR / d) ** 2), gain);
};

// Drone grave continu (la) qui s'ouvre progressivement
{
  const s = buffer(DURATION);
  for (let i = 0; i < s.length; i++) {
    const t = i / SR;
    const swell = Math.min(1, t / 2);
    s[i] = (Math.sin(2 * Math.PI * mtof(33) * t) * 0.6 + Math.sin(2 * Math.PI * mtof(40) * t) * 0.25) * swell;
  }
  add(0, s, 0.22);
}

const chords = [
  [57, 60, 64], // la mineur
  [53, 57, 60], // fa
  [48, 52, 55], // do
  [55, 59, 62], // sol
];
const barOf = (t) => Math.floor(t / (BEAT * 4)) % 4;

for (let step = 0; step * STEP < DURATION; step++) {
  const t = step * STEP;
  const inBeat = step % 4;
  const beat = Math.floor(step / 4);
  const bar = barOf(t);
  // Battement de cœur pendant l'intro
  if (t < 2.5 && inBeat === 0 && beat % 2 === 0) add(t, kick, 0.6);
  // 2,5 → 5 s : basse pulsée en croches + tics
  if (t >= 2.5 && t < 5 && step % 2 === 0) addPluck(t, 33 + (step % 8 === 6 ? 7 : 0), 0.18);
  if (t >= 2.5 && t < 18 && step % 2 === 1) add(t, tick, t < 5 ? 0.25 : 0.4);
  // 5 → 18 s : groove
  if (t >= 5 && t < 17.5) {
    if (inBeat === 0) add(t, kick, 0.85);
    if (inBeat === 0 && beat % 2 === 1) add(t, clap, 0.35);
    if (step % 2 === 0) addPluck(t, chords[bar][(step / 2) % 3] + 12, 0.06);
    if (step % 2 === 0) addPluck(t, chords[bar][0] - 24, 0.14);
    if (inBeat === 0 && beat % 4 === 0) addChord(t, chords[bar], BEAT * 4, 0.16, 0.3);
  }
}

addBoom(5.0, 0.8);
addChord(5.0, [57, 64, 69, 72], 2.5, 0.22, 0.01);
addRiser(16.2, 1.8, 0.5);
addBoom(18.0, 0.9);
addChord(18.0, [45, 57, 64, 69, 72], 2.3, 0.3, 0.01);

const out = b.map((x, i) => {
  const t = i / SR;
  const fadeIn = Math.min(1, t / 0.3);
  const fadeOut = Math.min(1, Math.max(0, (DURATION - 0.1 - t) / 0.5));
  return softClip(x * 0.85) * fadeIn * fadeOut * 0.7;
});
const tmp = 'music/.iphone-tmp.wav';
writeWav(tmp, out);
execSync(`npx remotion ffmpeg -y -loglevel error -i "${path.join(publicDir, tmp)}" -codec:a libmp3lame -b:a 192k "${path.join(publicDir, 'music-iphone.mp3')}"`, {stdio: 'inherit'});
fs.unlinkSync(path.join(publicDir, tmp));
console.log('✔ music-iphone.mp3 (120 BPM) — remplace-le par ta propre musique quand tu veux.');
