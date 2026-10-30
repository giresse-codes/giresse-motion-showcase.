import React from 'react';
import {AbsoluteFill, interpolate, interpolateColors, random, useCurrentFrame} from 'remotion';
import {gmotion} from '../config';
import {brandLogo, sceneColors, videoPalette} from '../theme';
import {clamp} from '../lib/anim';
import {useClient} from './client';
import {beatPulse, G} from './timeline';

const FADE = 8; // demi-durée des fondus de couleur entre deux plans

/** Couleurs dominantes (principale, secondaire, fond) à une image donnée, avec fondus aux changements de plan */
const useSceneColors = (frame: number) => {
	const {palette} = useClient();
	const stops = [
		{at: G.prompt.from, ...sceneColors.hook},
		{at: G.creation.from, ...sceneColors.prompt},
		{at: G.result.from, ...sceneColors.creation},
		{at: G.beforeAfter.from, main: palette.primary, second: palette.secondary},
		{at: G.cta.from, ...sceneColors.beforeAfter},
		{at: Infinity, ...sceneColors.cta},
	];
	const input: number[] = [];
	const mains: string[] = [];
	const seconds: string[] = [];
	let start = 0;
	stops.forEach((s, i) => {
		const end = s.at === Infinity ? G.cta.from + G.cta.duration : s.at;
		input.push(i === 0 ? start : start + FADE, end - FADE);
		mains.push(s.main, s.main);
		seconds.push(s.second, s.second);
		start = end;
	});
	return {
		main: interpolateColors(frame, input, mains),
		second: interpolateColors(frame, input, seconds),
		// Le fond passe du noir profond au bleu nuit du logo pour le plan final
		base: interpolateColors(frame, [G.cta.from - FADE, G.cta.from + FADE], [videoPalette.bg, brandLogo.night]),
	};
};

// Fond animé : dégradés de la couleur dominante du plan, lueur qui pulse sur le beat.
export const GBackground: React.FC = () => {
	const frame = useCurrentFrame();
	const {main, second, base} = useSceneColors(frame);
	const t = frame / 30;
	const pulse = beatPulse(frame);
	const blobs = [
		{color: main, x: 0.15 + 0.15 * Math.sin(t * 0.7), y: 0.2 + 0.08 * Math.cos(t * 0.5), r: 1.1, o: 0.5},
		{color: second, x: 0.9 + 0.08 * Math.cos(t * 0.6), y: 0.55 + 0.12 * Math.sin(t * 0.8), r: 0.85, o: 0.42},
		{color: main, x: 0.4 + 0.2 * Math.sin(t * 0.4 + 2), y: 0.95, r: 1.0, o: 0.42},
	];
	return (
		<AbsoluteFill style={{background: base, overflow: 'hidden'}}>
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
			<AbsoluteFill
				style={{
					background: `repeating-linear-gradient(${110 + Math.sin(t * 0.3) * 6}deg, transparent 0px, transparent 140px, rgba(255,255,255,0.03) 180px, transparent 240px)`,
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

// Flash lumineux plein écran.
export const GFlash: React.FC<{at: number; duration?: number; color?: string}> = ({at, duration = 14, color = videoPalette.magenta}) => {
	const frame = useCurrentFrame();
	const a = interpolate(frame, [at, at + 2, at + duration], [0, 1, 0], clamp);
	if (a <= 0) return null;
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<AbsoluteFill style={{background: `radial-gradient(circle at 50% 50%, #ffffff 0%, ${color} 35%, transparent 75%)`, opacity: a, transform: `scale(${0.8 + a * 0.6})`}} />
			<AbsoluteFill style={{background: color, opacity: a * a * 0.7, mixBlendMode: 'screen'}} />
		</AbsoluteFill>
	);
};

/** Pastille de verre en haut de l'écran (sous la marge TikTok) */
export const GPill: React.FC<{children: React.ReactNode; enter: number; font: string; accent: string}> = ({children, enter, font, accent}) => (
	<div style={{position: 'absolute', top: gmotion.safeMargin + 40, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 20}}>
		<div
			style={{
				padding: '16px 34px',
				borderRadius: 999,
				background: 'rgba(14,10,22,0.62)',
				border: `1px solid ${accent}77`,
				backdropFilter: 'blur(18px)',
				boxShadow: `0 0 40px ${accent}66`,
				color: videoPalette.white,
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
