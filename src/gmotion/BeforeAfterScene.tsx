import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {gmotion} from '../config';
import {premium} from '../theme';
import {fonts} from './fonts';
import {ease, Eyebrow, fadeOut, fadeUp} from './premium';
import {G} from './timeline';
import {ClientAd, ClientPosterBefore} from './ClientBrand';

const W = 900;
const H = 1200;
// Taille virtuelle de l'affiche, mise à l'échelle dans le panneau
const VW = 450;
const VH = (VW * H) / W;

const Label: React.FC<{text: string; side: 'left' | 'right'}> = ({text, side}) => (
	<div
		style={{
			position: 'absolute',
			top: 28,
			[side]: 28,
			padding: '10px 22px',
			borderRadius: 999,
			background: 'rgba(11,26,51,0.72)',
			color: premium.text,
			fontFamily: fonts.body,
			fontWeight: 500,
			fontSize: 24,
			letterSpacing: 4,
			textTransform: 'uppercase',
		}}
	>
		{text}
	</div>
);

// 11 → 13 s : écran partagé ; un masque glisse lentement de l'affiche terne vers la pub animée.
export const BeforeAfterScene: React.FC = () => {
	const frame = useCurrentFrame();
	const b = G.beforeAfter;
	const split = interpolate(frame, [b.wipeStart, b.wipeStart + b.wipeDuration], [1, 0.5], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
	const x = split * W;
	const wrap = (node: React.ReactNode) => <div style={{position: 'absolute', inset: 0, width: VW, height: VH, transform: `scale(${W / VW})`, transformOrigin: '0 0'}}>{node}</div>;

	return (
		<AbsoluteFill style={fadeOut(frame, b.duration - 10, 10, 24)}>
			<Eyebrow text={gmotion.steps.beforeAfter} frame={frame} at={2} style={{position: 'absolute', top: gmotion.safeMargin + 40, left: 0, right: 0}} />
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: 70}}>
				<div style={{width: W, height: H, position: 'relative', borderRadius: 32, overflow: 'hidden', border: `1px solid ${premium.line}`, boxShadow: premium.shadow, ...fadeUp(frame, 0, 20, 40)}}>
					{wrap(<ClientAd frame={frame + 60} width={VW} height={VH} />)}
					<div style={{position: 'absolute', inset: 0, clipPath: `inset(0 ${W - x}px 0 0)`}}>{wrap(<ClientPosterBefore width={VW} height={VH} />)}</div>
					<div style={{position: 'absolute', top: 0, bottom: 0, left: x - 1, width: 2, background: premium.gold}} />
					<div style={{opacity: interpolate(split, [0.55, 0.75], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
						<Label text={gmotion.after} side="right" />
					</div>
					<Label text={gmotion.before} side="left" />
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
