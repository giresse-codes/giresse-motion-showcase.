// Déroulé de la pub IPhone15ProMaxAd : 20 s à 30 images/s (600 images), musique à 120 BPM.
// Chaque changement de plan tombe sur un temps (multiple de 15 images) ; les plans se chevauchent
// de quelques images pour des fondus enchaînés.
export const FPS = 30;
export const DURATION = 20 * FPS;
/** Dernière image animée : 0,5 s d'image fixe à la fin */
export const FREEZE_AT = DURATION - 15;

export const T = {
	intro: {from: 0, duration: 84},
	search: {from: 75, duration: 84, typingStart: 12, typingDuration: 46},
	reveal: {from: 150, duration: 128, titleAt: 50},
	stack: {from: 270, duration: 112, scanStart: 30, scanEnd: 96},
	zoom: {from: 375, duration: 98, zoomStart: 22, zoomEnd: 70},
	display: {from: 465, duration: 84, finishesAt: 36},
	end: {from: 540, duration: 60},
} as const;

/** Images où une traînée de lumière balaie l'écran (transitions) */
export const STREAKS = [T.search.from - 2, T.reveal.from - 2, T.stack.from - 2, T.zoom.from - 2, T.display.from - 2, T.end.from - 2];
