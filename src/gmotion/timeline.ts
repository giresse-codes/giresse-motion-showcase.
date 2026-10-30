import {gmotion} from '../config';

// Déroulé de GMotionPromo : 15 s à 30 images/s (450 images).
// À 120 BPM, un temps = 15 images : chaque changement de plan tombe sur un temps fort.
export const FPS = 30;
export const DURATION = 15 * FPS;
/** Dernière image animée : tout est figé ensuite (0,5 s d'image fixe et propre) */
export const FREEZE_AT = DURATION - 15;

export const G = {
	hook: {from: 0, duration: 66, flashAt: 8, words: [15, 23, 30, 38, 45], exitAt: 56},
	prompt: {from: 58, duration: 96, typingStart: 14, typingDuration: 48, sendAt: 70},
	creation: {from: 146, duration: 98, glitchIn: 12, playStart: 10, playEnd: 84},
	result: {from: 238, duration: 98, flashAt: 2, assembleAt: 6, lockAt: 28, toPhoneAt: 40},
	beforeAfter: {from: 326, duration: 68, wipeStart: 8, wipeDuration: 36},
	cta: {from: 388, duration: 62, drawEnd: 22, logoAt: 20, nameAt: 28, servicesAt: 33, buttonAt: 38},
} as const;

const framesPerBeat = (FPS * 60) / gmotion.bpm;

/** Intensité (0 → 1) d'une pulsation qui retombe après chaque temps de la musique */
export const beatPulse = (frame: number, decay = 5) => {
	const offset = gmotion.beatOffset * FPS;
	const sinceBeat = (((frame - offset) % framesPerBeat) + framesPerBeat) % framesPerBeat;
	return Math.exp(-sinceBeat / decay);
};
