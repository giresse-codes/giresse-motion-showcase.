// Déroulé de GiresseAd : 30 s à 30 images/s (900 images).
export const FPS = 30;
export const DURATION = 30 * FPS;
/** Dernière image animée : image fixe pendant les 0,5 dernière seconde */
export const FREEZE_AT = DURATION - 15;

const s = (sec: number) => Math.round(sec * FPS);

export const T = {
	inbox: {from: 0, to: s(5), windowIn: 6, messageAt: 30, pills: [62, 78, 94, 110]},
	order: {from: s(5), to: s(9), flyStart: 8, fieldsAt: [22, 40, 58, 76], clientAt: 4},
	invoice: {from: s(9), to: s(13), linesAt: [14, 30], totalStart: 50, totalEnd: 86, sendAt: 96},
	phone: {from: s(13), to: s(17), flyEnd: 30, tapAt: 66, notifAt: 78},
	planning: {from: s(17), to: s(22), eventAt: 22, chainAt: 50, stepsAt: [62, 80, 98, 116, 134]},
	dashboard: {from: s(22), to: s(26), kpisAt: 10, todayAt: 40, barsAt: 64},
	end: {from: s(26), to: s(30), logoAt: 16, titleAt: 34, taglineAt: 44, ctaAt: 54},
} as const;
