import {interpolate, interpolateColors, spring} from 'remotion';
import type {VideoScript} from '../config';
import {clamp, springs} from '../lib/anim';

export type ResultProps = {
	script: VideoScript;
	/** Image locale de l'animation du résultat */
	frame: number;
	/** Progression de l'itération (0 = version initiale, 1 = version retouchée) */
	iteration: number;
	/** Taille virtuelle du rendu */
	width: number;
	height: number;
};

export const FPS = 30;

export const resultStyle = (script: VideoScript, iteration: number) => {
	const {fromGradient, toGradient, titleScale} = script.iteration;
	const c1 = interpolateColors(iteration, [0, 1], [fromGradient[0], toGradient[0]]);
	const c2 = interpolateColors(iteration, [0, 1], [fromGradient[1], toGradient[1]]);
	return {
		c1,
		c2,
		gradient: `linear-gradient(135deg, ${c1}, ${c2})`,
		titleScale: 1 + (titleScale - 1) * iteration,
	};
};

/** Entrée décalée d'un élément : renvoie {opacity, transform} */
export const enterStyle = (frame: number, delay: number, distance = 40) => {
	const p = spring({frame: frame - delay, fps: FPS, config: springs.snappy});
	return {
		opacity: interpolate(p, [0, 0.6], [0, 1], clamp),
		transform: `translateY(${(1 - p) * distance}px)`,
	};
};

export const countUp = (frame: number, delay: number, duration: number, target: number) =>
	Math.round(interpolate(frame, [delay, delay + duration], [0, target], {...clamp, easing: (t) => 1 - Math.pow(1 - t, 3)}));

export const formatNumber = (n: number) => n.toLocaleString('fr-FR').replace(/ | /g, ' ');
