import React from 'react';
import {AbsoluteFill, spring, SpringConfig, useCurrentFrame, useVideoConfig} from 'remotion';
import {useLayout} from '../lib/layout';
import {springs} from '../lib/anim';

export type CameraKey = {
	/** Image (relative à la séquence) où la caméra atteint cette position */
	at: number;
	rotateX?: number;
	rotateY?: number;
	rotateZ?: number;
	/** Déplacements en unités u (1 u ≈ 1 px en 1080p) */
	x?: number;
	y?: number;
	z?: number;
	scale?: number;
};

type Props = {
	keys: CameraKey[];
	perspective?: number;
	/** Force du flou de mouvement calculé à partir de la vitesse de la caméra */
	motionBlur?: number;
	config?: Partial<SpringConfig>;
	children: React.ReactNode;
};

const PROPS = ['rotateX', 'rotateY', 'rotateZ', 'x', 'y', 'z', 'scale'] as const;
type Prop = (typeof PROPS)[number];
const DEFAULTS: Record<Prop, number> = {rotateX: 0, rotateY: 0, rotateZ: 0, x: 0, y: 0, z: 0, scale: 1};

const cameraAt = (keys: CameraKey[], frame: number, fps: number, config: Partial<SpringConfig>) => {
	const state = {...DEFAULTS};
	PROPS.forEach((p) => {
		state[p] = keys[0][p] ?? DEFAULTS[p];
	});
	for (let i = 1; i < keys.length; i++) {
		const prev = keys[i - 1];
		const next = keys[i];
		const progress = spring({
			frame: frame - prev.at,
			fps,
			config,
			durationInFrames: Math.max(1, next.at - prev.at),
		});
		PROPS.forEach((p) => {
			const a = prev[p] ?? DEFAULTS[p];
			const b = next[p] ?? a;
			next[p] = b;
			state[p] += (b - a) * progress;
		});
	}
	return state;
};

// Caméra 3D fluide : interpole des positions clés avec des ressorts (spring).
export const Camera3D: React.FC<Props> = ({keys, perspective = 1800, motionBlur = 0.6, config = springs.camera, children}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {u} = useLayout();
	// Copie : cameraAt complète les valeurs manquantes des clés
	const k = keys.map((key) => ({...key}));
	const c = cameraAt(k, frame, fps, config);
	const p = cameraAt(k.map((key) => ({...key})), frame - 1, fps, config);
	const speed =
		Math.abs(c.x - p.x) + Math.abs(c.y - p.y) + Math.abs(c.z - p.z) * 0.5 +
		(Math.abs(c.rotateX - p.rotateX) + Math.abs(c.rotateY - p.rotateY)) * 8 +
		Math.abs(c.scale - p.scale) * 400;
	const blur = Math.min(10, speed * 0.08 * motionBlur);

	return (
		<AbsoluteFill style={{perspective: perspective * u, perspectiveOrigin: '50% 50%'}}>
			<AbsoluteFill
				style={{
					transformStyle: 'preserve-3d',
					transform: `translate3d(${c.x * u}px, ${c.y * u}px, ${c.z * u}px) rotateX(${c.rotateX}deg) rotateY(${c.rotateY}deg) rotateZ(${c.rotateZ}deg) scale(${c.scale})`,
					filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
				}}
			>
				{children}
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
