import {interpolate, spring, SpringConfig} from 'remotion';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const springs = {
	soft: {damping: 200, mass: 1, stiffness: 100} as Partial<SpringConfig>,
	bouncy: {damping: 11, mass: 0.6, stiffness: 140} as Partial<SpringConfig>,
	snappy: {damping: 20, mass: 0.5, stiffness: 220} as Partial<SpringConfig>,
	camera: {damping: 26, mass: 1.1, stiffness: 70} as Partial<SpringConfig>,
};

export const pop = (frame: number, fps: number, delay = 0, config = springs.bouncy) =>
	spring({frame: frame - delay, fps, config});

export const fade = (frame: number, start: number, end: number, from = 0, to = 1) =>
	interpolate(frame, [start, end], [from, to], clamp);

/** Fondu entrant puis sortant sur une fenêtre de temps */
export const fadeInOut = (frame: number, start: number, end: number, ramp = 8) =>
	interpolate(frame, [start, start + ramp, end - ramp, end], [0, 1, 1, 0], clamp);

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
