import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {gmotion} from '../config';
import {Accent, Eyebrow, fadeOut, fadeUp, headline} from './premium';

type Props = {
	/** Lignes de l'accroche ; le mot entre *astérisques* passe en or */
	lines?: readonly string[];
	/** Image d'apparition de chaque ligne */
	lineFrames?: readonly number[];
	exitAt?: number;
	fontSize?: number;
};

// 0 → 2 s : l'accroche apparaît ligne par ligne, en fondu avec un léger glissement vers le haut.
export const HookScene: React.FC<Props> = ({lines = gmotion.hook, lineFrames = [10, 20, 30], exitAt = 52, fontSize = 104}) => {
	const frame = useCurrentFrame();
	// Mouvement de caméra lent et subtil
	const drift = interpolate(frame, [0, exitAt + 12], [1, 1.03]);
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', ...fadeOut(frame, exitAt, 12, 24)}}>
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 44, transform: `scale(${drift})`}}>
				<Eyebrow text={gmotion.brandName} frame={frame} at={2} />
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
					{lines.map((line, i) => (
						<div key={i} style={{...headline(fontSize), textAlign: 'center', whiteSpace: 'nowrap', ...fadeUp(frame, lineFrames[i] ?? 10 + i * 10, 18, 28)}}>
							<Accent text={line} />
						</div>
					))}
				</div>
			</div>
		</AbsoluteFill>
	);
};
