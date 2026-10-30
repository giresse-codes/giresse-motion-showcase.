// Génère la musique électro/trap provisoire de la pub GMotionPromo (public/music.mp3)
// et le son « swoosh » du logo. 120 BPM : un temps = 15 images à 30 images/s,
// donc chaque changement de plan (2 s, 5 s, 8 s, 11 s, 13 s) tombe sur un temps fort.
// Usage : npm run sfx:gmotion   (remplace ensuite public/music.mp3 par ta propre musique)
import {execSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {buffer, lowpass, noise, rand, softClip, SR, writeWav} from './audio-utils.mjs';

const publicDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'public');
const BPM = 120;
const BEAT = 60 / BPM;
const STEP = BEAT / 4; // double-croche
const DURATION = 15.4;
const mtof = (m) => 440 * 2 ** ((m - 69) / 12);

// --- Swoosh (logo) --------------------------------------------------------------
{
  const d = 0.55;
  const raw = buffer(d).map(() => noise());
  const swept = lowpass(raw, (t) => 900 + 9000 * (t / d) ** 0.7);
  let phase = 0;
  const out = swept.map((x, i) => {
    const t = i / SR;
    phase += (2 * Math.PI * (600 + 2600 * (t / d))) / SR;
    const env = Math.sin(Math.PI * Math.min(1, t / d)) ** 2;
    return softClip((x * 2.4 + Math.sin(phase) * 0.18) * env);
  });
  writeWav('sfx/swoosh.wav', out);
}

// --- Musique ----------------------------------------------------------------------
const b = buffer(DURATION);
const add = (start, samples, gain = 1) => {
  const s0 = Math.round(start * SR);
  for (let i = 0; i < samples.length && s0 + i < b.length; i++) b[s0 + i] += samples[i] * gain;
};

const kick = (() => {
  const k = buffer(0.4);
  let phase = 0;
  for (let i = 0; i < k.length; i++) {
    const t = i / SR;
    phase += (2 * Math.PI * (45 + 160 * Math.exp(-t * 35))) / SR;
    k[i] = softClip(Math.sin(phase) * Math.exp(-t * 8) * 1.6);
  }
  return k;
})();

const clap = (() => {
  const c = buffer(0.3);
  const raw = c.map(() => noise());
  const low = lowpass(raw, () => 900);
  const bp = lowpass(raw, () => 4500).map((v, i) => v - low[i]);
  for (let i = 0; i < c.length; i++) {
    const t = i / SR;
    const bursts = t < 0.035 ? (Math.floor(t * 280) % 2 === 0 ? 1 : 0.25) : 1;
    c[i] = bp[i] * Math.exp(-t * 16) * bursts * 2.2;
  }
  return c;
})();

const hat = (open = false) => {
  const h = buffer(open ? 0.25 : 0.05);
  let prev = 0;
  for (let i = 0; i < h.length; i++) {
    const t = i / SR;
    const n = noise();
    h[i] = (n - prev) * Math.exp(-t * (open ? 14 : 90)) * 0.5;
    prev = n;
  }
  return h;
};
const closedHat = hat(false);
const openHat = hat(true);

// 808 avec glissando vers la note suivante
const add808 = (start, note, length, glideTo = null) => {
  const s = buffer(length + 0.05);
  let phase = 0;
  for (let i = 0; i < s.length; i++) {
    const t = i / SR;
    const glide = glideTo === null ? 0 : Math.max(0, (t - length * 0.6) / (length * 0.4));
    const m = note + (glideTo === null ? 0 : (glideTo - note) * Math.min(1, glide));
    phase += (2 * Math.PI * mtof(m)) / SR;
    const env = Math.min(1, t * 200) * Math.exp(-t * 1.2) * Math.min(1, (length + 0.05 - t) * 30);
    s[i] = softClip(Math.sin(phase) * 2.2) * env * 0.55;
  }
  add(start, s);
};

// Accord « supersaw » en stab
const addStab = (start, notes, length, gain = 0.12, cutoff = 5000) => {
  const raw = buffer(length);
  notes.forEach((note) => {
    for (let v = 0; v < 5; v++) {
      const f = mtof(note) * (1 + (v - 2) * 0.006);
      let ph = rand();
      for (let i = 0; i < raw.length; i++) {
        ph += f / SR;
        raw[i] += ((ph % 1) * 2 - 1) * 0.2;
      }
    }
  });
  const lp = lowpass(raw, (t) => cutoff * Math.exp(-t * 3) + 400);
  for (let i = 0; i < lp.length; i++) {
    const t = i / SR;
    lp[i] *= Math.min(1, t * 400) * Math.exp(-t * (1.6 / length)) * Math.min(1, (length - t) * 20);
  }
  add(start, lp, gain);
};

// Impact (drop) : boom grave + souffle
const addBoom = (start, gain = 1) => {
  const s = buffer(2.2);
  let phase = 0;
  for (let i = 0; i < s.length; i++) {
    const t = i / SR;
    phase += (2 * Math.PI * (35 + 90 * Math.exp(-t * 6))) / SR;
    s[i] = softClip(Math.sin(phase) * Math.exp(-t * 1.6) * 1.8 + noise() * Math.exp(-t * 12) * 0.5);
  }
  add(start, s, gain);
};

// Montée (riser) avant le drop
const addRiser = (start, d) => {
  const raw = buffer(d).map(() => noise());
  const swept = lowpass(raw, (t) => 300 + 9000 * (t / d) ** 2);
  add(start, swept.map((x, i) => x * ((i / SR / d) ** 2) * 1.4));
};

const chords = [
  [57, 60, 64, 69], // la mineur
  [53, 57, 60, 65], // fa
  [48, 52, 55, 60], // do
  [55, 59, 62, 67], // sol
];
const roots = [33, 29, 36, 31];
const barOf = (t) => Math.floor(t / (BEAT * 4)) % 4;

// 0 → 2 s : accroche. Coup d'éclat sur le flash puis un stab par mot
[0.5, 0.75, 1.0, 1.25].forEach((t, i) => addStab(t, chords[0].map((n) => n + 12 * (i === 3 ? 1 : 0)), 0.22, 0.09, 6000));
addStab(1.5, chords[0], 0.5, 0.16, 8000);
add(1.5, kick, 0.9);

for (let step = 0; step * STEP < DURATION; step++) {
  const t = step * STEP;
  const inBeat = step % 4;
  const beat = Math.floor(step / 4);
  const bar = barOf(t);

  // 2 → 8 s : prompt et création
  if (t >= 2 && t < 7.75) {
    if (inBeat === 0) add(t, kick, t < 5 ? 0.7 : 0.9);
    if (t >= 5 && inBeat === 0 && beat % 2 === 1) add(t, clap, 0.7);
    if (step % 2 === 0) add(t + STEP, closedHat, t < 5 ? 0.35 : 0.5);
    if (t >= 5) add(t, closedHat, 0.25);
    if (inBeat === 0 && beat % 2 === 0) add808(t, roots[bar], BEAT * 2 - 0.02);
    if (t >= 5 && step % 2 === 0) {
      const note = chords[bar][(step / 2) % 4] + 12;
      addStab(t, [note], STEP * 1.6, 0.05, 3500);
    }
  }
  // Roulement de caisse claire avant le drop
  if (t >= 7 && t < 7.75) add(t, clap, 0.25 + ((t - 7) / 0.75) * 0.5);

  // 8 → 13 s : drop
  if (t >= 8 && t < 13) {
    if (inBeat === 0) add(t, kick, 1);
    if (inBeat === 0 && beat % 2 === 1) add(t, clap, 0.9);
    // Charleston avec roulements en triolets toutes les deux mesures
    if (beat % 8 === 7 && inBeat >= 2) {
      for (let r = 0; r < 3; r++) add(t + (r * STEP) / 1.5, closedHat, 0.4);
    } else {
      add(t, closedHat, inBeat === 2 ? 0.55 : 0.35);
    }
    if (inBeat === 2 && beat % 2 === 0) add(t, openHat, 0.25);
    if (inBeat === 0 && beat % 2 === 0) add808(t, roots[bar], BEAT * 2 - 0.02, beat % 4 === 2 ? roots[(bar + 1) % 4] : null);
    if (inBeat === 0) addStab(t, chords[bar], BEAT * 0.9, 0.11, 7000);
    if (inBeat === 3 && beat % 2 === 1) addStab(t, chords[bar].map((n) => n + 12), STEP, 0.07, 9000);
  }
}
addRiser(6.3, 1.45);
addBoom(8.0, 1);
addStab(8.0, chords[0].map((n) => n + 12), 0.8, 0.14, 10000);

// 13 → 15 s : appel à l'action, un dernier impact et un accord qui s'éteint proprement
addBoom(13.0, 0.75);
add(13.0, kick, 1);
addStab(13.0, chords[2], 1.9, 0.15, 6000);
addStab(13.0, chords[2].map((n) => n + 12), 1.9, 0.07, 9000);
for (let t = 13.5; t < 14.5; t += BEAT / 2) add(t, closedHat, 0.18 * (14.5 - t));
add808(13.0, 36, 1.9);

// Fondus et normalisation
const out = b.map((x, i) => {
  const t = i / SR;
  const fadeOut = Math.min(1, Math.max(0, (DURATION - 0.1 - t) / 0.4));
  return softClip(x * 0.8) * fadeOut * 0.7;
});
const tmp = 'music/.gmotion-tmp.wav';
writeWav(tmp, out);
execSync(`npx remotion ffmpeg -y -loglevel error -i "${path.join(publicDir, tmp)}" -codec:a libmp3lame -b:a 192k "${path.join(publicDir, 'music.mp3')}"`, {stdio: 'inherit'});
fs.unlinkSync(path.join(publicDir, tmp));
console.log('✔ music.mp3 (120 BPM) — remplace-le par ta propre musique quand tu veux.');
