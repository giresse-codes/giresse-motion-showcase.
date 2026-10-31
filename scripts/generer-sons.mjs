// Génère les effets sonores doux de la pub (public/sons/) : whoosh, ding, tap.
// La musique (public/music.mp3) est à ajouter par toi ; elle est jouée automatiquement si elle existe.
// Usage : npm run sons
import fs from 'node:fs';
import path from 'node:path';

const SR = 44100;
const out = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'public', 'sons');
fs.mkdirSync(out, {recursive: true});

let seed = 7;
const noise = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return (seed / 4294967296) * 2 - 1;
};

const writeWav = (name, samples) => {
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((s, i) => data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, s)) * 32767), i * 2));
  const h = Buffer.alloc(44);
  h.write('RIFF', 0);
  h.writeUInt32LE(36 + data.length, 4);
  h.write('WAVE', 8);
  h.write('fmt ', 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write('data', 36);
  h.writeUInt32LE(data.length, 40);
  fs.writeFileSync(path.join(out, name), Buffer.concat([h, data]));
  console.log(`✔ sons/${name}`);
};

// Whoosh doux : bruit filtré dont la coupure monte puis redescend
{
  const d = 0.7;
  const n = Math.round(d * SR);
  const s = new Float32Array(n);
  let y = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const env = Math.sin(Math.PI * (t / d)) ** 2;
    const fc = 300 + 2600 * env;
    const a = 1 - Math.exp((-2 * Math.PI * fc) / SR);
    y += a * (noise() - y);
    s[i] = Math.tanh(y * 2.6 * env) * 0.8;
  }
  writeWav('whoosh.wav', s);
}

// Ding : deux partiels sinus avec une longue décroissance
{
  const d = 1.6;
  const n = Math.round(d * SR);
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const attack = Math.min(1, t / 0.004);
    s[i] = attack * (Math.sin(2 * Math.PI * 1318.5 * t) * Math.exp(-t * 3.2) * 0.5 + Math.sin(2 * Math.PI * 1975.5 * t) * Math.exp(-t * 4.5) * 0.25 + Math.sin(2 * Math.PI * 2637 * t) * Math.exp(-t * 7) * 0.12);
  }
  writeWav('ding.wav', s);
}

// Tap : petit clic feutré (doigt sur l'écran)
{
  const d = 0.08;
  const n = Math.round(d * SR);
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    s[i] = (Math.sin(2 * Math.PI * 220 * t) * 0.6 + noise() * 0.25) * Math.exp(-t * 70);
  }
  writeWav('tap.wav', s);
}
