import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {theme} from '../theme';
import {clamp} from '../lib/anim';

type Props = {
	/** Image (relative) où commence l'effet */
	at: number;
	duration?: number;
	/** 'glitch' : séparation RVB + tranches décalées ; 'flash' : éclair lumineux seul */
	mode?: 'glitch' | 'flash';
	children?: React.ReactNode;
};

const SLICES = 7;

// Transition spectaculaire : glitch numérique puis flash lumineux.
export const GlitchTransition: React.FC<Props> = ({at, duration = 14, mode = 'glitch', children}) => {
	const frame = useCurrentFrame();
	const local = frame - at;
	const active = local >= 0 && local <= duration;
	const p = interpolate(local, [0, duration], [0, 1], clamp);
	const strength = active ? Math.sin(Math.PI * p) : 0;
	// Le flash culmine au milieu de la transition
	const flash = interpolate(local, [duration * 0.35, duration * 0.55, duration], [0, 1, 0], clamp);

	if (mode === 'flash') {
		return (
			<AbsoluteFill>
				{children}
				<FlashOverlay amount={flash} />
			</AbsoluteFill>
		);
	}

	if (!active) return <AbsoluteFill>{children}</AbsoluteFill>;

	const jitter = (k: string, amp: number) => (random(`${k}-${frame}`) - 0.5) * 2 * amp * strength;
	const split = 26 * strength;

	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
			<AbsoluteFill style={{transform: `translate(${jitter('jx', 18)}px, ${jitter('jy', 8)}px)`}}>{children}</AbsoluteFill>
			{/* Séparation des canaux RVB */}
			<AbsoluteFill style={{mixBlendMode: 'screen', opacity: 0.7 * strength, transform: `translateX(${split}px)`, filter: 'sepia(1) saturate(8) hue-rotate(-50deg)'}}>
				{children}
			</AbsoluteFill>
			<AbsoluteFill style={{mixBlendMode: 'screen', opacity: 0.7 * strength, transform: `translateX(${-split}px)`, filter: 'sepia(1) saturate(8) hue-rotate(150deg)'}}>
				{children}
			</AbsoluteFill>
			{/* Tranches horizontales décalées */}
			{new Array(SLICES).fill(0).map((_, i) => {
				const top = random(`top-${i}-${Math.floor(frame / 2)}`) * 100;
				const h = 2 + random(`h-${i}-${frame}`) * 9;
				return (
					<AbsoluteFill
						key={i}
						style={{
							clipPath: `inset(${top}% 0 ${Math.max(0, 100 - top - h)}% 0)`,
							transform: `translateX(${jitter(`s${i}`, 160)}px)`,
							filter: i % 2 ? 'hue-rotate(90deg) saturate(2)' : 'invert(0.15)',
						}}
					>
						{children}
					</AbsoluteFill>
				);
			})}
			{/* Bruit numérique */}
			<AbsoluteFill
				style={{
					opacity: 0.25 * strength,
					background: `repeating-linear-gradient(0deg, rgba(34,211,238,0.5) 0px, transparent 2px, transparent ${4 + Math.floor(random(`n-${frame}`) * 6)}px)`,
					mixBlendMode: 'screen',
				}}
			/>
			<FlashOverlay amount={flash} />
		</AbsoluteFill>
	);
};

export const FlashOverlay: React.FC<{amount: number}> = ({amount}) => {
	if (amount <= 0) return null;
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<AbsoluteFill
				style={{
					background: `radial-gradient(circle at 50% 50%, #ffffff 0%, ${theme.colors.cyan} 25%, ${theme.colors.violet} 55%, transparent 80%)`,
					opacity: amount,
					transform: `scale(${0.6 + amount})`,
					mixBlendMode: 'screen',
				}}
			/>
			<AbsoluteFill style={{background: '#ffffff', opacity: Math.pow(amount, 2) * 0.85}} />
			{/* Traînée lumineuse horizontale (lens flare anamorphique) */}
			<div
				style={{
					position: 'absolute',
					left: '-20%',
					right: '-20%',
					top: '50%',
					height: 6,
					transform: `translateY(-50%) scaleY(${1 + amount * 6})`,
					background: `linear-gradient(90deg, transparent, ${theme.colors.cyan}, #fff, ${theme.colors.cyan}, transparent)`,
					opacity: amount,
					filter: 'blur(2px)',
				}}
			/>
		</AbsoluteFill>
	);
};
