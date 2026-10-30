import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {theme} from '../theme';
import {useLayout} from '../lib/layout';

// Fond sombre avec dégradés bleu / violet animés, grille en perspective et vignettage.
export const Background: React.FC<{intensity?: number}> = ({intensity = 1}) => {
	const frame = useCurrentFrame();
	const {width, height} = useLayout();
	const t = frame / 30;
	const blobs = [
		{color: theme.colors.violet, x: 0.2 + 0.12 * Math.sin(t * 0.6), y: 0.25 + 0.1 * Math.cos(t * 0.5), r: 0.75},
		{color: theme.colors.blue, x: 0.85 + 0.1 * Math.cos(t * 0.45), y: 0.65 + 0.12 * Math.sin(t * 0.7), r: 0.8},
		{color: theme.colors.pink, x: 0.5 + 0.2 * Math.sin(t * 0.35 + 2), y: 0.95 + 0.06 * Math.sin(t), r: 0.55},
		{color: theme.colors.cyan, x: 0.1 + 0.08 * Math.cos(t * 0.8), y: 0.8, r: 0.4},
	];
	const size = Math.max(width, height);
	const gridShift = (frame * 2) % 80;

	return (
		<AbsoluteFill style={{backgroundColor: theme.colors.bg, overflow: 'hidden'}}>
			{blobs.map((b, i) => (
				<div
					key={i}
					style={{
						position: 'absolute',
						left: b.x * width - (b.r * size) / 2,
						top: b.y * height - (b.r * size) / 2,
						width: b.r * size,
						height: b.r * size,
						borderRadius: '50%',
						background: `radial-gradient(circle, ${b.color} 0%, transparent 65%)`,
						opacity: (i === 2 ? 0.28 : 0.38) * intensity,
						filter: 'blur(40px)',
					}}
				/>
			))}
			{/* Grille au sol en perspective */}
			<AbsoluteFill style={{perspective: 900, perspectiveOrigin: '50% 30%'}}>
				<div
					style={{
						position: 'absolute',
						left: '-50%',
						width: '200%',
						height: '70%',
						bottom: '-12%',
						transform: 'rotateX(72deg)',
						transformOrigin: '50% 100%',
						backgroundImage: `linear-gradient(rgba(139,92,246,0.35) 2px, transparent 2px), linear-gradient(90deg, rgba(59,130,246,0.3) 2px, transparent 2px)`,
						backgroundSize: '80px 80px',
						backgroundPosition: `0 ${gridShift}px`,
						maskImage: 'linear-gradient(to top, black 10%, transparent 85%)',
						WebkitMaskImage: 'linear-gradient(to top, black 10%, transparent 85%)',
						opacity: 0.35 * intensity,
					}}
				/>
			</AbsoluteFill>
			{/* Vignettage */}
			<AbsoluteFill
				style={{
					background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.75) 100%)',
				}}
			/>
			<AbsoluteFill
				style={{
					opacity: interpolate(Math.sin(t * 2), [-1, 1], [0.02, 0.05]),
					background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.6) 0px, transparent 1px, transparent 3px)',
				}}
			/>
		</AbsoluteFill>
	);
};
