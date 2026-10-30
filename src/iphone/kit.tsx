import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {nocturne} from '../theme';
import {fonts} from '../gmotion/fonts';
import {ease, progress} from '../gmotion/premium';

export {ease, fadeUp, fadeOut, progress} from '../gmotion/premium';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Halo orange : un cœur lumineux et une large lueur diffuse */
export const Orb: React.FC<{x: number; y: number; size: number; intensity?: number}> = ({x, y, size, intensity = 1}) => (
	<div style={{position: 'absolute', left: x - size * 3, top: y - size * 3, width: size * 6, height: size * 6, pointerEvents: 'none', opacity: intensity}}>
		<div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: `radial-gradient(circle, ${nocturne.orb}55 0%, ${nocturne.orb}18 30%, transparent 62%)`}} />
		<div
			style={{
				position: 'absolute',
				left: size * 2.5,
				top: size * 2.5,
				width: size,
				height: size,
				borderRadius: '50%',
				background: `radial-gradient(circle at 45% 45%, ${nocturne.orbCore} 0%, ${nocturne.orb} 55%, #E2430F 100%)`,
				boxShadow: `0 0 ${size * 0.6}px ${size * 0.2}px ${nocturne.orb}AA, 0 0 ${size * 1.6}px ${size * 0.6}px ${nocturne.orb}55`,
				filter: 'blur(1.5px)',
			}}
		/>
	</div>
);

/** Fond noir profond avec un léger vignettage */
export const NightBackground: React.FC = () => (
	<AbsoluteFill style={{background: nocturne.bg}}>
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(40,22,14,0.35), transparent 70%)'}} />
	</AbsoluteFill>
);

/** Reflet sur sol brillant : copie retournée, atténuée, sous l'élément */
export const Reflect: React.FC<{children: React.ReactNode; opacity?: number; style?: React.CSSProperties}> = ({children, opacity = 0.28, style}) => (
	<div style={{position: 'relative', ...style}}>
		{children}
		<div
			style={{
				position: 'absolute',
				left: 0,
				right: 0,
				top: '100%',
				height: '100%',
				transform: 'scaleY(-1)',
				opacity,
				pointerEvents: 'none',
				maskImage: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 45%)',
				WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 45%)',
				filter: 'blur(1.5px)',
			}}
		>
			{children}
		</div>
	</div>
);

/** Carte en verre sombre, fin liseré */
export const glassCard = (radius = 26): React.CSSProperties => ({
	borderRadius: radius,
	background: nocturne.glass,
	border: `1px solid ${nocturne.lineStrong}`,
	boxShadow: '0 30px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)',
});

/** Titre : Inter SemiBold, interlettrage serré */
export const title = (size: number): React.CSSProperties => ({
	fontFamily: fonts.display,
	fontWeight: 600,
	fontSize: size,
	lineHeight: 1.08,
	letterSpacing: -size * 0.03,
	color: nocturne.text,
});

/** Traînée de lumière chaude qui traverse l'écran pendant une transition (flou de mouvement) */
export const LightStreak: React.FC<{at: number; seed: string}> = ({at, seed}) => {
	const frame = useCurrentFrame();
	const local = frame - at;
	if (local < 0 || local > 14) return null;
	const p = interpolate(local, [0, 14], [0, 1], {...clamp, easing: ease});
	return (
		<AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
			{[0, 1, 2].map((i) => {
				const y = 25 + random(`${seed}-y-${i}`) * 50;
				const w = 40 + random(`${seed}-w-${i}`) * 50;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							top: `${y}%`,
							left: `${-60 + p * 160 - i * 8}%`,
							width: `${w}%`,
							height: 6 + i * 5,
							borderRadius: 99,
							background: `linear-gradient(90deg, transparent, ${i === 1 ? '#FFFFFF' : nocturne.orb}, transparent)`,
							filter: `blur(${6 + i * 4}px)`,
							opacity: Math.sin(Math.PI * p) * (i === 1 ? 0.5 : 0.8),
						}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};

/** Fondu d'entrée / sortie d'un plan entier */
export const sceneFade = (frame: number, duration: number, fadeIn = 10, fadeOutLen = 10): React.CSSProperties => ({
	opacity: progress(frame, 0, fadeIn) * (1 - progress(frame, duration - fadeOutLen, fadeOutLen)),
});
