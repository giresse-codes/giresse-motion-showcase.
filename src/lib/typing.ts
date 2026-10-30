import {random} from 'remotion';

/**
 * Calcule l'image d'apparition de chaque caractère avec un rythme naturel
 * (petites variations, pauses après la ponctuation), réparti sur `duration` images.
 */
export const makeTypingTimes = (text: string, start: number, duration: number, seed = 'typing') => {
	const raw: number[] = [];
	let acc = 0;
	for (let i = 0; i < text.length; i++) {
		const ch = text[i];
		let step = 0.6 + random(`${seed}-${i}`) * 0.8;
		if (ch === ' ') step += 0.3;
		if (/[,.:;!?]/.test(text[i - 1] ?? '')) step += 2.2;
		acc += step;
		raw.push(acc);
	}
	const total = acc || 1;
	return raw.map((t) => start + (t / total) * duration);
};

export const typedCount = (times: number[], frame: number) => {
	let n = 0;
	while (n < times.length && times[n] <= frame) n++;
	return n;
};

/** Images (entières, sans doublon) où un son de touche doit être joué */
export const keyClickFrames = (times: number[], minGap = 2) => {
	const frames: number[] = [];
	for (const t of times) {
		const f = Math.floor(t);
		if (frames.length === 0 || f - frames[frames.length - 1] >= minGap) frames.push(f);
	}
	return frames;
};
