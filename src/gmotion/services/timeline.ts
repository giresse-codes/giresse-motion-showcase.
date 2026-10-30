// Déroulé de GMotionServices : 15 s à 30 images/s (450 images), 120 BPM = un temps toutes les 15 images.
// Les plans se chevauchent de quelques images : fondu enchaîné, jamais de coupure sèche.
export const S = {
	hook: {from: 0, duration: 66, lines: [10, 20, 30], exitAt: 52},
	motion: {from: 58, duration: 96, assembleAt: 8, playStart: 44, playEnd: 82},
	web: {from: 146, duration: 98, blocks: [10, 16, 22, 28, 32, 36, 42], phoneAt: 56},
	code: {from: 238, duration: 98, typeStart: 10, typeEnd: 44, morphAt: 48},
	recap: {from: 326, duration: 68, cards: [8, 16, 24]},
	cta: {from: 388, duration: 62},
} as const;
