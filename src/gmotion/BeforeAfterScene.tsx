import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {gmotion} from '../config';
import {springs} from '../lib/anim';
import {BeforeAfter} from '../components/BeforeAfter';
import {G} from './timeline';
import {NovaAd, NovaPosterBefore} from './Nova';

const {colors} = gmotion;
const W = 940;
const H = 1380;
// Taille virtuelle de l'affiche, mise à l'échelle dans le panneau
const VW = 470;
const VH = (VW * H) / W;

// 11 → 13 s : écran partagé avec balayage lumineux, affiche terne contre pub animée.
export const BeforeAfterScene: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const b = G.beforeAfter;
	const enter = spring({frame, fps, config: {damping: 15, mass: 0.8, stiffness: 100}});
	const exit = spring({frame: frame - (b.duration - 8), fps, config: springs.snappy});
	const wrap = (node: React.ReactNode) => <div style={{width: VW, height: VH, transform: `scale(${W / VW})`, transformOrigin: '0 0'}}>{node}</div>;
	return (
		<AbsoluteFill
			style={{
				alignItems: 'center',
				justifyContent: 'center',
				transform: `translateY(${(1 - enter) * 900 - exit * 700}px) rotate(${(1 - enter) * 8}deg) scale(${1 - exit * 0.3})`,
				opacity: 1 - exit,
				filter: exit > 0.01 ? `blur(${exit * 16}px)` : undefined,
			}}
		>
			<BeforeAfter
				width={W}
				height={H}
				wipeStart={b.wipeStart}
				wipeDuration={b.wipeDuration}
				beforeLabel={gmotion.before}
				afterLabel={gmotion.after}
				accents={[colors.cyan, colors.electric, colors.cyan]}
				before={wrap(<NovaPosterBefore width={VW} height={VH} />)}
				after={wrap(<NovaAd frame={frame + 60} width={VW} height={VH} />)}
			/>
		</AbsoluteFill>
	);
};
