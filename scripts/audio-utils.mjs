// Outils de synthèse audio partagés par les scripts de génération.
import fs from 'node:fs';
import path from 'node:path';

export const SR = 44100;
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'public');

// Générateur pseudo-aléatoire déterministe : les fichiers sont identiques à chaque génération.
let seed = 1337;
export const rand = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};
export const noise = () => rand() * 2 - 1;

export const writeWav = (relPath, samples) => {
  const file = path.join(root, relPath);
  fs.mkdirSync(path.dirname(file), {recursive: true});
  const data = Buffer.alloc(samples.length * 2);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    data.writeInt16LE(Math.round(s * 32767), i * 2);
  }
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(SR, 24);
  header.writeUInt32LE(SR * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.writeUInt32LE(data.length, 40);
  header.write('data', 36);
  fs.writeFileSync(file, Buffer.concat([header, data]));
  console.log(`✔ ${relPath} (${(samples.length / SR).toFixed(2)} s)`);
};

export const buffer = (seconds) => new Float32Array(Math.round(seconds * SR));
export const softClip = (x) => Math.tanh(x);

// Filtre passe-bas à un pôle, coupure variable
export const lowpass = (input, cutoffAt) => {
  const out = new Float32Array(input.length);
  let y = 0;
  for (let i = 0; i < input.length; i++) {
    const fc = cutoffAt(i / SR);
    const a = 1 - Math.exp((-2 * Math.PI * fc) / SR);
    y += a * (input[i] - y);
    out[i] = y;
  }
  return out;
};
export const highpass = (input, fc) => {
  const lp = lowpass(input, () => fc);
  return input.map((v, i) => v - lp[i]);
};
