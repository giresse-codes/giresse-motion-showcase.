import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {theme} from '../theme';
import {useLayout} from '../lib/layout';
import {clamp, springs} from '../lib/anim';

type Props = {
	/** Texte de l'accroche ; un mot entre *astérisques* est mis en valeur */
	text: string;
	/** Écart en images entre deux mots */
	stagger?: number;
	/** Image à laquelle l'accroche s'efface */
	exitAt?: number;
};

// Typographie cinétique : les mots apparaissent un par un avec un léger rebond.
export const HookText: React.FC<Props> = ({text, stagger = 3, exitAt = 9999}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {isVertical, u} = useLayout();
	const words = text.split(/\s+/).map((w) => ({
		word: w.replace(/\*/g, ''),
		emphasis: /^\*.*\*$/.test(w),
	}));

	const exit = spring({frame: frame - exitAt, fps, config: springs.snappy});
	const fontSize = (isVertical ? 96 : 84) * u;

	return (
		<div
			style={{
				position: 'absolute',
				top: (isVertical ? 170 : 70) * u,
				left: 0,
				right: 0,
				display: 'flex',
				flexWrap: 'wrap',
				justifyContent: 'center',
				alignItems: 'baseline',
				gap: `${0.12 * fontSize}px ${0.28 * fontSize}px`,
				padding: `0 ${(isVertical ? 70 : 160) * u}px`,
				fontFamily: theme.fonts.display,
				fontWeight: 800,
				fontSize,
				lineHeight: 1.1,
				letterSpacing: -0.02 * fontSize,
				color: theme.colors.text,
				textAlign: 'center',
				transform: `translateY(${-exit * 140 * u}px) scale(${1 - exit * 0.15})`,
				opacity: 1 - exit,
				filter: `blur(${exit * 12}px)`,
			}}
		>
			{words.map(({word, emphasis}, i) => {
				const s = spring({frame: frame - i * stagger, fps, config: springs.bouncy});
				const y = interpolate(s, [0, 1], [60 * u, 0]);
				const rot = interpolate(s, [0, 1], [-8, 0]);
				const blur = interpolate(frame - i * stagger, [0, 6], [10, 0], clamp);
				// Le mot mis en valeur pulse légèrement après son apparition
				const pulse = emphasis ? 1 + 0.06 * Math.sin(Math.max(0, frame - i * stagger - 8) / 4) : 1;
				return (
					<span
						key={i}
						style={{
							display: 'inline-block',
							transform: `translateY(${y}px) rotate(${rot}deg) scale(${s * pulse * (emphasis ? 1.25 : 1)})`,
							opacity: Math.min(1, s * 1.5),
							...(emphasis
								? {
										background: `linear-gradient(120deg, ${theme.colors.cyan}, ${theme.colors.violet} 50%, ${theme.colors.pink})`,
										WebkitBackgroundClip: 'text',
										backgroundClip: 'text',
										color: 'transparent',
										textShadow: 'none',
										padding: `0 ${0.1 * fontSize}px`,
										filter: `blur(${blur}px) drop-shadow(0 0 ${24 * u}px rgba(139,92,246,0.9))`,
									}
								: {filter: `blur(${blur}px)`, textShadow: `0 ${6 * u}px ${30 * u}px rgba(0,0,0,0.6)`}),
						}}
					>
						{word}
					</span>
				);
			})}
		</div>
	);
};
