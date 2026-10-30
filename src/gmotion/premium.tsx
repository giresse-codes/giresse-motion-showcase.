import React from 'react';
import {Easing, interpolate} from 'remotion';
import {premium} from '../theme';
import {fonts} from './fonts';

// Kit de mise en forme sobre : easing ease-in-out, fondus avec léger glissement, typographie.

/** Courbe ease-in-out douce utilisée partout */
export const ease = Easing.bezier(0.45, 0, 0.2, 1);

const clampEase = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease} as const;

/** Progression 0 → 1 entre deux images, avec easing */
export const progress = (frame: number, start: number, duration: number) => interpolate(frame, [start, start + duration], [0, 1], clampEase);

/** Fondu avec léger glissement vers le haut (sans rebond) */
export const fadeUp = (frame: number, start: number, duration = 18, distance = 24): React.CSSProperties => {
	const p = progress(frame, start, duration);
	return {opacity: p, transform: `translateY(${(1 - p) * distance}px)`};
};

/** Fondu de sortie avec léger glissement vers le haut */
export const fadeOut = (frame: number, start: number, duration = 12, distance = 20): React.CSSProperties => {
	const p = progress(frame, start, duration);
	return {opacity: 1 - p, transform: `translateY(${-p * distance}px)`};
};

/** Rend un texte dont le mot entre *astérisques* passe en or */
export const Accent: React.FC<{text: string}> = ({text}) => (
	<>
		{text.split(/(\*[^*]+\*)/).map((part, i) =>
			part.startsWith('*') ? (
				<span key={i} style={{color: premium.gold}}>
					{part.slice(1, -1)}
				</span>
			) : (
				<React.Fragment key={i}>{part}</React.Fragment>
			),
		)}
	</>
);

/** Petit titre en capitales espacées, précédé d'une fine ligne or */
export const Eyebrow: React.FC<{text: string; frame: number; at: number; style?: React.CSSProperties}> = ({text, frame, at, style}) => {
	const line = progress(frame, at, 20);
	return (
		<div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, ...fadeUp(frame, at, 18, 14), ...style}}>
			<div style={{width: 48 * line, height: 1.5, background: premium.gold}} />
			<div style={{fontFamily: fonts.body, fontWeight: 500, fontSize: 26, letterSpacing: 5, textTransform: 'uppercase', color: premium.textMuted, whiteSpace: 'nowrap'}}>
				<Accent text={text} />
			</div>
			<div style={{width: 48 * line, height: 1.5, background: premium.gold}} />
		</div>
	);
};

/** Fine ligne or qui se trace de gauche à droite */
export const GoldRule: React.FC<{frame: number; at: number; width: number; style?: React.CSSProperties}> = ({frame, at, width, style}) => (
	<div style={{width, height: 1.5, background: premium.gold, transform: `scaleX(${progress(frame, at, 24)})`, transformOrigin: '50% 50%', ...style}} />
);

/** Style des titres : Inter SemiBold, interlettrage serré */
export const headline = (size: number): React.CSSProperties => ({
	fontFamily: fonts.display,
	fontWeight: 600,
	fontSize: size,
	lineHeight: 1.12,
	letterSpacing: -size * 0.025,
	color: premium.text,
});

/** Carte sobre : surface très légère, fin liseré, ombre douce */
export const card = (radius = 28): React.CSSProperties => ({
	borderRadius: radius,
	background: `linear-gradient(180deg, ${premium.surfaceStrong}, ${premium.surface})`,
	border: `1px solid ${premium.line}`,
	boxShadow: premium.shadow,
});
