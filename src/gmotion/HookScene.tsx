import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {gmotion} from '../config';
import {videoPalette as colors} from '../theme';
import {clamp, springs} from '../lib/anim';
import {fonts} from './fonts';
import {GFlash} from './Atmosphere';
import {G} from './timeline';

type Props = {
	words?: string[];
	/** Indices des mots sur chaque ligne */
	lines?: number[][];
	/** Indice du mot mis en valeur (plus gros, en jaune) */
	emphasis?: number;
	/** Image d'apparition de chaque mot */
	wordFrames?: readonly number[];
	flashAt?: number;
	exitAt?: number;
	fontSize?: number;
};

// 0 → 2 s : écran noir, flash magenta, puis typographie cinétique avec tremblement de caméra.
// Par défaut : « Ta marque / mérite de / BOUGER. » (GMotionPromo).
export const HookScene: React.FC<Props> = ({
	words = gmotion.hook,
	lines = [
		[0, 1],
		[2, 3],
		[4],
	],
	emphasis = words.length - 1,
	wordFrames = G.hook.words,
	flashAt = G.hook.flashAt,
	exitAt = G.hook.exitAt,
	fontSize = 118,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const h = {words: wordFrames, flashAt, exitAt};
	const last = emphasis;

	// Tremblement : une secousse qui retombe à chaque mot (plus forte sur le mot mis en valeur)
	let shake = 0;
	h.words.forEach((at, i) => {
		const since = frame - at;
		if (since >= 0) shake += Math.exp(-since / 5) * (i === last ? 26 : 9);
	});
	const sx = (random(`sx-${frame}`) - 0.5) * 2 * shake;
	const sy = (random(`sy-${frame}`) - 0.5) * 2 * shake;
	const rot = (random(`sr-${frame}`) - 0.5) * shake * 0.08;

	// Sortie : zoom à travers le texte vers la scène suivante
	const exit = spring({frame: frame - h.exitAt, fps, config: springs.snappy});
	const black = interpolate(frame, [h.flashAt, h.flashAt + 10], [1, 0], clamp);

	return (
		<AbsoluteFill>
			<AbsoluteFill style={{background: '#000', opacity: black}} />
			<AbsoluteFill
				style={{
					alignItems: 'center',
					justifyContent: 'center',
					flexDirection: 'column',
					gap: 10,
					transform: `translate(${sx}px, ${sy}px) rotate(${rot}deg) scale(${1 + exit * 1.8})`,
					opacity: 1 - exit,
					filter: exit > 0.01 ? `blur(${exit * 24}px)` : undefined,
				}}
			>
				{lines.map((line, li) => (
					<div key={li} style={{display: 'flex', gap: 30, alignItems: 'baseline'}}>
						{line.map((wi) => {
							const at = h.words[wi];
							const s = spring({frame: frame - at, fps, config: springs.bouncy});
							const big = wi === last;
							const blur = interpolate(frame - at, [0, 5], [14, 0], clamp);
							return (
								<span
									key={wi}
									style={{
										display: 'inline-block',
										fontFamily: fonts.display,
										fontWeight: 900,
										fontSize: big ? fontSize * 1.46 : fontSize,
										lineHeight: 1.05,
										letterSpacing: big ? -4 : -2,
										transform: `translateY(${(1 - s) * 90}px) scale(${s}) rotate(${(1 - s) * (wi % 2 ? 10 : -10)}deg)`,
										opacity: Math.min(1, s * 1.6),
										...(big
											? {
													background: `linear-gradient(180deg, #FFF6C9 5%, ${colors.yellow} 45%, ${colors.orange} 100%)`,
													WebkitBackgroundClip: 'text',
													backgroundClip: 'text',
													color: 'transparent',
													filter: `blur(${blur}px) drop-shadow(0 0 30px ${colors.magenta}) drop-shadow(0 0 8px ${colors.magenta})`,
													padding: '0 10px',
												}
											: {color: colors.white, filter: `blur(${blur}px)`, textShadow: '0 8px 30px rgba(0,0,0,0.6)'}),
									}}
								>
									{words[wi]}
								</span>
							);
						})}
					</div>
				))}
			</AbsoluteFill>
			<GFlash at={h.flashAt} duration={14} color={colors.magenta} />
		</AbsoluteFill>
	);
};
