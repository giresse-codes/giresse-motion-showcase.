// Génère les effets sonores et la musique de fond (100 % synthétisés, libres de droits).
// Usage : npm run sfx
import {buffer, highpass, lowpass, noise, rand, softClip, SR, writeWav} from './audio-utils.mjs';

// --- Clics de clavier (4 variantes) -------------------------------------------
for (let v = 1; v <= 4; v++) {
  const b = buffer(0.07);
  const tone = 1800 + v * 260;
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    const click = noise() * Math.exp(-t * 260);
    const thock = Math.sin(2 * Math.PI * (180 + v * 25) * t) * Math.exp(-t * 90) * 0.6;
    const ping = Math.sin(2 * Math.PI * tone * t) * Math.exp(-t * 400) * 0.25;
    b[i] = click * 0.7 + thock + ping;
  }
  writeWav(`sfx/key-${v}.wav`, highpass(b, 120).map((x) => softClip(x * 0.9)));
}

// --- Whoosh -------------------------------------------------------------------
{
  const d = 0.9;
  const raw = buffer(d).map(() => noise());
  const swept = lowpass(raw, (t) => 300 + 5200 * Math.sin(Math.PI * Math.min(1, t / d)) ** 2);
  const out = swept.map((x, i) => {
    const t = i / SR;
    const env = Math.sin(Math.PI * Math.min(1, t / d)) ** 1.6;
    return softClip(x * env * 3.2);
  });
  writeWav('sfx/whoosh.wav', out);
}

// --- Impact grave (révélation) ------------------------------------------------
{
  const d = 2.2;
  const b = buffer(d);
  let phase = 0;
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    const f = 38 + 110 * Math.exp(-t * 9);
    phase += (2 * Math.PI * f) / SR;
    const sub = Math.sin(phase) * Math.exp(-t * 1.9);
    const hit = noise() * Math.exp(-t * 35) * 0.8;
    const body = Math.sin(2 * Math.PI * 70 * t) * Math.exp(-t * 6) * 0.4;
    b[i] = softClip((sub * 1.6 + hit + body) * 1.3);
  }
  const lp = lowpass(b, (t) => 4000 * Math.exp(-t * 2) + 200);
  writeWav('sfx/impact.wav', lp.map((x) => softClip(x * 1.6)));
}

// --- Glitch -------------------------------------------------------------------
{
  const d = 0.45;
  const b = buffer(d);
  let hold = 0;
  let freq = 400;
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    if (i % 1400 === 0) freq = 120 + rand() * 1600;
    if (i % 6 === 0) hold = Math.sign(Math.sin(2 * Math.PI * freq * t)) * 0.5 + noise() * 0.35;
    const gate = Math.floor(t * 38) % 3 === 0 ? 0.25 : 1;
    b[i] = hold * gate * Math.exp(-t * 3.5);
  }
  writeWav('sfx/glitch.wav', b);
}

// --- Riser (avant/après) -------------------------------------------------------
{
  const d = 1.1;
  const raw = buffer(d).map(() => noise());
  const swept = lowpass(raw, (t) => 200 + 7000 * (t / d) ** 2);
  let phase = 0;
  const out = swept.map((x, i) => {
    const t = i / SR;
    phase += (2 * Math.PI * (200 + 900 * (t / d) ** 2)) / SR;
    const env = (t / d) ** 1.5 * Math.min(1, (d - t) * 25);
    return softClip((x * 2 + Math.sin(phase) * 0.25) * env);
  });
  writeWav('sfx/riser.wav', out);
}

// --- Pop (apparition d'éléments) ----------------------------------------------
{
  const b = buffer(0.18);
  let phase = 0;
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    phase += (2 * Math.PI * (520 + 900 * Math.exp(-t * 30))) / SR;
    b[i] = Math.sin(phase) * Math.exp(-t * 28) * 0.8;
  }
  writeWav('sfx/pop.wav', b);
}

// --- Musique de fond : 20 s à 120 BPM, la mineur (Am - F - C - G) -------------
{
  const bpm = 120;
  const beat = 60 / bpm;
  const d = 20.5;
  const b = buffer(d);
  const mtof = (m) => 440 * 2 ** ((m - 69) / 12);
  const chords = [
    [57, 60, 64], // Am
    [53, 57, 60], // F
    [48, 52, 55], // C
    [55, 59, 62], // G
  ];
  const bassRoots = [45, 41, 36, 43];

  // Grosse caisse
  const addKick = (start, gain = 1) => {
    const s0 = Math.round(start * SR);
    let phase = 0;
    for (let i = 0; i < 0.35 * SR && s0 + i < b.length; i++) {
      const t = i / SR;
      phase += (2 * Math.PI * (48 + 120 * Math.exp(-t * 28))) / SR;
      b[s0 + i] += Math.sin(phase) * Math.exp(-t * 9) * 0.9 * gain;
    }
  };
  // Charleston
  const addHat = (start, gain) => {
    const s0 = Math.round(start * SR);
    let prev = 0;
    for (let i = 0; i < 0.06 * SR && s0 + i < b.length; i++) {
      const t = i / SR;
      const n = noise();
      b[s0 + i] += (n - prev) * Math.exp(-t * 80) * gain;
      prev = n;
    }
  };
  // Clap
  const addClap = (start) => {
    const s0 = Math.round(start * SR);
    for (let i = 0; i < 0.25 * SR && s0 + i < b.length; i++) {
      const t = i / SR;
      const bursts = t < 0.03 ? (Math.floor(t * 300) % 2 === 0 ? 1 : 0.3) : 1;
      b[s0 + i] += noise() * Math.exp(-t * 22) * 0.35 * bursts;
    }
  };

  const totalBeats = Math.floor(d / beat);
  for (let k = 0; k < totalBeats; k++) {
    const t = k * beat;
    const intro = k < 4; // intro plus légère
    addKick(t, intro ? 0.6 : 1);
    if (!intro && k % 2 === 1) addClap(t);
    addHat(t + beat / 2, 0.22);
    addHat(t + beat / 4, 0.08);
    addHat(t + (3 * beat) / 4, 0.08);
  }

  // Basse et nappe, avec « sidechain » sur la grosse caisse
  let bassPhase = 0;
  const padPhases = [0, 0, 0, 0, 0, 0];
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    const beatPos = (t / beat) % 1;
    const bar = Math.floor(t / (beat * 4)) % 4;
    const duck = 0.35 + 0.65 * Math.min(1, beatPos * 3.5);
    // Basse en croches
    const eighth = (t / (beat / 2)) % 1;
    const octave = Math.floor(t / (beat / 2)) % 4 === 3 ? 12 : 0;
    bassPhase += (2 * Math.PI * mtof(bassRoots[bar] + octave)) / SR;
    const bassEnv = Math.exp(-eighth * 3.2);
    const bass = (Math.sin(bassPhase) + 0.3 * Math.sin(bassPhase * 2)) * bassEnv * 0.32;
    // Nappe : deux oscillateurs légèrement désaccordés par note
    let pad = 0;
    chords[bar].forEach((note, j) => {
      const f = mtof(note);
      padPhases[j * 2] += (2 * Math.PI * f * 1.003) / SR;
      padPhases[j * 2 + 1] += (2 * Math.PI * f * 0.997) / SR;
      pad += Math.sin(padPhases[j * 2]) + Math.sin(padPhases[j * 2 + 1]);
    });
    pad *= 0.045;
    // Arpège pluck en double-croches à partir de la mesure 2
    let arp = 0;
    if (t > beat * 8) {
      const step = Math.floor(t / (beat / 4));
      const stepPos = (t / (beat / 4)) % 1;
      const note = chords[bar][step % 3] + 12 * (1 + (Math.floor(step / 3) % 2));
      arp = Math.sin(2 * Math.PI * mtof(note) * t) * Math.exp(-stepPos * 6) * 0.07;
    }
    const fadeIn = Math.min(1, t / 0.6);
    const fadeOut = Math.min(1, (d - t) / 1.2);
    b[i] = (b[i] + (bass + pad + arp) * duck) * fadeIn * fadeOut;
  }
  writeWav('music/background.wav', b.map((x) => softClip(x * 0.85)));
}

console.log('Audio généré dans public/sfx et public/music.');
