// Déroulé de GMotionPromo : 15 s à 30 images/s (450 images).
// À 120 BPM, un temps = 15 images : chaque changement de plan tombe sur un temps fort.
// Les plans se chevauchent de quelques images : fondu enchaîné, jamais de coupure sèche.
export const FPS = 30;
export const DURATION = 15 * FPS;
/** Dernière image animée : tout est figé ensuite (0,5 s d'image fixe et propre) */
export const FREEZE_AT = DURATION - 15;

export const G = {
	hook: {from: 0, duration: 66, lines: [10, 20, 30], exitAt: 52},
	prompt: {from: 58, duration: 96, typingStart: 14, typingDuration: 48, sendAt: 70},
	creation: {from: 146, duration: 98, playStart: 12, playEnd: 82},
	result: {from: 238, duration: 98, assembleAt: 4, lockAt: 28, toPhoneAt: 42},
	beforeAfter: {from: 326, duration: 68, wipeStart: 10, wipeDuration: 34},
	cta: {from: 388, duration: 62},
} as const;
