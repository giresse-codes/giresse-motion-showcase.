// Déroulé de GMotionServices : 15 s à 30 images/s (450 images), 120 BPM = un temps toutes les 15 images.
// Les plans se chevauchent de quelques images pour éviter toute coupure sèche.
export const S = {
	hook: {from: 0, duration: 64, flashAt: 8, words: [15, 19, 23, 30, 38, 45], exitAt: 54},
	motion: {from: 56, duration: 98, assembleAt: 8, lockAt: 32, playStart: 10, playEnd: 84},
	web: {from: 146, duration: 98, blocks: [8, 14, 20, 26, 30, 34, 40], phoneAt: 54},
	code: {from: 238, duration: 98, typeStart: 4, typeEnd: 42, morphAt: 44},
	recap: {from: 326, duration: 68, cards: [4, 19, 34]},
	cta: {from: 388, duration: 62},
} as const;
