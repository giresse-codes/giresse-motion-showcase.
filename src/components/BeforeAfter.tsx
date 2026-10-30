import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {theme} from '../theme';
import {useLayout} from '../lib/layout';
import {clamp, springs} from '../lib/anim';

type Props = {
	before: React.ReactNode;
	after: React.ReactNode;
	beforeLabel?: string;
	afterLabel?: string;
	width: number;
	height: number;
	/** Image de début du balayage */
	wipeStart?: number;
	wipeDuration?: number;
};

// Écran partagé avec balayage : à gauche la version basique, à droite la version transformée.
export const BeforeAfter: React.FC<Props> = ({before, after, beforeLabel = 'Avant', afterLabel = 'Après', width, height, wipeStart = 6, wipeDuration = 30}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {u} = useLayout();
	const enter = spring({frame, fps, config: springs.soft});
	// La version basique occupe d'abord l'écran, le balayage révèle la nouvelle version puis se pose au centre
	const sweep = interpolate(frame, [wipeStart, wipeStart + wipeDuration * 0.6, wipeStart + wipeDuration], [0.98, 0.14, 0.5], {
		...clamp,
		easing: (t) => 1 - Math.pow(1 - t, 3),
	});
	const split = sweep * width;
	const labelStyle: React.CSSProperties = {
		position: 'absolute',
		top: 24 * u,
		padding: `${12 * u}px ${26 * u}px`,
		borderRadius: 999,
		fontFamily: theme.fonts.display,
		fontWeight: 800,
		fontSize: 30 * u,
		letterSpacing: 2 * u,
		textTransform: 'uppercase',
		backdropFilter: 'blur(12px)',
	};

	return (
		<div
			style={{
				width,
				height,
				position: 'relative',
				borderRadius: 32 * u,
				overflow: 'hidden',
				transform: `scale(${0.9 + 0.1 * enter})`,
				opacity: enter,
				boxShadow: `0 ${40 * u}px ${120 * u}px rgba(0,0,0,0.7), 0 0 ${100 * u}px rgba(139,92,246,0.35)`,
				border: `1px solid ${theme.colors.glassBorder}`,
			}}
		>
			<div style={{position: 'absolute', inset: 0}}>{after}</div>
			<div style={{position: 'absolute', inset: 0, clipPath: `inset(0 ${width - split}px 0 0)`}}>{before}</div>
			{/* Ligne de balayage lumineuse */}
			<div
				style={{
					position: 'absolute',
					top: 0,
					bottom: 0,
					left: split - 3 * u,
					width: 6 * u,
					background: `linear-gradient(180deg, ${theme.colors.cyan}, #fff, ${theme.colors.violet})`,
					boxShadow: `0 0 ${30 * u}px ${8 * u}px rgba(34,211,238,0.7)`,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					top: '50%',
					left: split,
					width: 84 * u,
					height: 84 * u,
					transform: 'translate(-50%, -50%)',
					borderRadius: '50%',
					background: 'rgba(5,6,15,0.85)',
					border: `${3 * u}px solid ${theme.colors.cyan}`,
					boxShadow: `0 0 ${30 * u}px ${theme.colors.cyan}`,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					color: 'white',
					fontSize: 36 * u,
					fontWeight: 800,
				}}
			>
				⇆
			</div>
			<div style={{...labelStyle, left: 24 * u, background: 'rgba(0,0,0,0.55)', color: '#fff', opacity: interpolate(split / width, [0.2, 0.35], [0, 1], clamp)}}>
				{beforeLabel}
			</div>
			<div
				style={{
					...labelStyle,
					right: 24 * u,
					background: `linear-gradient(135deg, ${theme.colors.blue}, ${theme.colors.violet})`,
					color: '#fff',
					boxShadow: `0 0 ${24 * u}px rgba(139,92,246,0.8)`,
					opacity: interpolate(split / width, [0.65, 0.8], [1, 0], clamp),
				}}
			>
				{afterLabel}
			</div>
		</div>
	);
};
