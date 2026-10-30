import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {gmotion} from '../config';
import {clamp} from '../lib/anim';
import {beatPulse} from './timeline';

const {colors} = gmotion;

// Fond animé en dégradé bleu, avec une lueur qui pulse sur le beat.
export const GBackground: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / 30;
	const pulse = beatPulse(frame);
	const blobs = [
		{color: colors.electric, x: 0.15 + 0.15 * Math.sin(t * 0.7), y: 0.2 + 0.08 * Math.cos(t * 0.5), r: 1.1, o: 0.55},
		{color: colors.cyan, x: 0.9 + 0.08 * Math.cos(t * 0.6), y: 0.55 + 0.12 * Math.sin(t * 0.8), r: 0.8, o: 0.3},
		{color: colors.electric, x: 0.4 + 0.2 * Math.sin(t * 0.4 + 2), y: 0.95, r: 1.0, o: 0.45},
	];
	return (
		<AbsoluteFill style={{background: colors.night, overflow: 'hidden'}}>
			{blobs.map((b, i) => (
				<div
					key={i}
					style={{
						position: 'absolute',
						left: b.x * 1080 - (b.r * 1920) / 2,
						top: b.y * 1920 - (b.r * 1920) / 2,
						width: b.r * 1920,
						height: b.r * 1920,
						borderRadius: '50%',
						background: `radial-gradient(circle, ${b.color} 0%, transparent 62%)`,
						opacity: b.o * (0.85 + 0.25 * pulse),
						filter: 'blur(30px)',
					}}
				/>
			))}
			{/* Rayons de lumière lents */}
			<AbsoluteFill
				style={{
					background: `repeating-linear-gradient(${110 + Math.sin(t * 0.3) * 6}deg, transparent 0px, transparent 140px, rgba(91,200,255,0.035) 180px, transparent 240px)`,
				}}
			/>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)'}} />
		</AbsoluteFill>
	);
};

// Grain argentique léger (bruit SVG qui change à chaque image).
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.09}) => {
	const frame = useCurrentFrame();
	const seed = Math.floor(random(`grain-${frame}`) * 1000);
	return (
		<AbsoluteFill style={{pointerEvents: 'none', opacity, mixBlendMode: 'overlay'}}>
			<svg width="100%" height="100%">
				<filter id="gm-grain">
					<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} stitchTiles="stitch" />
					<feColorMatrix type="saturate" values="0" />
				</filter>
				<rect width="100%" height="100%" filter="url(#gm-grain)" />
			</svg>
		</AbsoluteFill>
	);
};

// Flash lumineux (cyan ou blanc) plein écran.
export const GFlash: React.FC<{at: number; duration?: number; color?: string}> = ({at, duration = 14, color = colors.cyan}) => {
	const frame = useCurrentFrame();
	const a = interpolate(frame, [at, at + 2, at + duration], [0, 1, 0], clamp);
	if (a <= 0) return null;
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<AbsoluteFill style={{background: `radial-gradient(circle at 50% 50%, #ffffff 0%, ${color} 35%, transparent 75%)`, opacity: a, transform: `scale(${0.8 + a * 0.6})`}} />
			<AbsoluteFill style={{background: color === colors.white ? '#fff' : color, opacity: a * a * 0.7, mixBlendMode: 'screen'}} />
		</AbsoluteFill>
	);
};

/** Pastille de verre en haut de l'écran (sous la marge TikTok) */
export const GPill: React.FC<{children: React.ReactNode; enter: number; font: string}> = ({children, enter, font}) => (
	<div style={{position: 'absolute', top: gmotion.safeMargin + 40, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 20}}>
		<div
			style={{
				padding: '16px 34px',
				borderRadius: 999,
				background: 'rgba(8,18,48,0.6)',
				border: '1px solid rgba(91,200,255,0.35)',
				backdropFilter: 'blur(18px)',
				boxShadow: `0 0 40px ${colors.electric}66`,
				color: colors.white,
				fontFamily: font,
				fontWeight: 800,
				fontSize: 38,
				transform: `scale(${enter}) translateY(${(1 - enter) * -30}px)`,
				opacity: Math.min(1, enter * 1.5),
				whiteSpace: 'nowrap',
			}}
		>
			{children}
		</div>
	</div>
);
