import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {gmotion} from '../../config';
import {videoPalette} from '../../theme';
import {springs} from '../../lib/anim';
import {fonts} from '../fonts';

type Props = {index: string; title: string; subtitle: string; main: string; second: string; enterAt?: number};

const MAX_WIDTH = 960;

// Titre d'un service : numéro, titre en dégradé (mot par mot, rebond) et sous-titre.
export const ServiceTitle: React.FC<Props> = ({index, title, subtitle, main, second, enterAt = 2}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const s = (delay: number) => spring({frame: frame - enterAt - delay, fps, config: springs.bouncy});
	// Taille adaptée pour ne jamais déborder (Montserrat ExtraBold ≈ 0,7 em par caractère)
	const size = Math.min(108, MAX_WIDTH / (title.length * 0.7));
	const words = title.split(' ');
	return (
		<div style={{position: 'absolute', top: gmotion.safeMargin + 30, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, zIndex: 20}}>
			<div
				style={{
					padding: '8px 22px',
					borderRadius: 999,
					border: `2px solid ${main}`,
					color: main,
					fontFamily: fonts.display,
					fontWeight: 800,
					fontSize: 28,
					letterSpacing: 4,
					transform: `scale(${s(0)})`,
					background: 'rgba(10,10,15,0.55)',
					boxShadow: `0 0 24px ${main}66`,
				}}
			>
				SERVICE {index}
			</div>
			<div style={{display: 'flex', gap: size * 0.25, maxWidth: MAX_WIDTH, flexWrap: 'wrap', justifyContent: 'center'}}>
				{words.map((w, i) => {
					const p = s(3 + i * 3);
					return (
						<span
							key={i}
							style={{
								display: 'inline-block',
								fontFamily: fonts.display,
								fontWeight: 900,
								fontSize: size,
								lineHeight: 1.05,
								letterSpacing: -2,
								background: `linear-gradient(180deg, ${videoPalette.white} 15%, ${second} 55%, ${main} 100%)`,
								WebkitBackgroundClip: 'text',
								backgroundClip: 'text',
								color: 'transparent',
								filter: `drop-shadow(0 0 22px ${main}AA)`,
								transform: `translateY(${(1 - p) * 70}px) scale(${p}) rotate(${(1 - p) * (i % 2 ? 8 : -8)}deg)`,
								opacity: Math.min(1, p * 1.5),
							}}
						>
							{w}
						</span>
					);
				})}
			</div>
			<div style={{fontFamily: fonts.body, fontWeight: 600, fontSize: 32, color: videoPalette.white, opacity: Math.min(1, s(10)) * 0.85}}>{subtitle}</div>
		</div>
	);
};
