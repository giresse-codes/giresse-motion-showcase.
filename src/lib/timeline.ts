// Structure narrative commune : 20 secondes à 30 images/s (600 images).
//   Accroche      0 → 2 s   |  Prompt   2 → 5 s   |  Code  5 → 9 s
//   Révélation    9 → 14 s  |  Itération 14 → 17 s
//   Avant/après  17 → 19 s  |  Appel à l'action 19 → 20 s
// Les scènes se chevauchent de quelques images pour des transitions fluides.
export const FPS = 30;
export const DURATION = 20 * FPS;

export const SCENES = {
	hook: {from: 0, duration: 64, exitAt: 52},
	prompt: {from: 54, duration: 100, typingStart: 8, typingDuration: 56, sendAt: 70},
	code: {from: 146, duration: 130, typingStart: 10, typingEnd: 112, glitchAt: 114, glitchDuration: 14},
	// La révélation (9 s) et l'itération (14 s) partagent la même scène pour garder l'appareil à l'écran
	result: {from: 268, duration: 248, iterationAt: 152, iterTypingStart: 160, iterTypingDuration: 26, iterSendAt: 190, morphAt: 192},
	beforeAfter: {from: 508, duration: 64, wipeStart: 6, wipeDuration: 34},
	cta: {from: 568, duration: 32},
} as const;
