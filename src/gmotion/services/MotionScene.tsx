import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {gmotionServices} from '../../config';
import {premium} from '../../theme';
import {ClientMark, ClientWordmark, slideIn} from '../ClientBrand';
import {ClientProvider, useClient} from '../client';
import {fonts} from '../fonts';
import {card, ease, fadeOut, fadeUp, progress} from '../premium';
import {ServiceTitle} from './ServiceTitle';
import {S} from './timeline';

const TRACKS = ['Position', 'Échelle', 'Opacité'];
const KEYS = [
	[0.05, 0.35, 0.7, 0.95],
	[0.15, 0.5, 0.85],
	[0.08, 0.42, 0.78],
];
const STRIP_W = 860;
const LABEL_W = 190;
const LANE_W = STRIP_W - LABEL_W - 48;
const ROW_H = 64;

/** Le logo de l'entreprise fictive s'assemble : chaque pièce glisse doucement à sa place */
const LogoAssembly: React.FC = () => {
	const frame = useCurrentFrame();
	const {client} = useClient();
	const m = S.motion;
	return (
		<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34}}>
			<ClientMark size={300} piece={(i) => slideIn(frame, `m${i}`, m.assembleAt + i * 3, 16)} />
			<div style={fadeUp(frame, m.assembleAt + 22, 18, 18)}>
				<ClientWordmark maxSize={60} maxWidth={760} color={premium.text} />
			</div>
			<div style={{fontFamily: fonts.body, fontSize: 26, letterSpacing: 4, textTransform: 'uppercase', color: premium.textMuted, ...fadeUp(frame, m.assembleAt + 28, 18, 12)}}>{client.sector}</div>
		</div>
	);
};

/** Mini-timeline : la tête de lecture (fine ligne or) remplit les keyframes une à une */
const KeyframeStrip: React.FC = () => {
	const frame = useCurrentFrame();
	const m = S.motion;
	const play = interpolate(frame, [m.playStart, m.playEnd], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
	const litAt = (x: number) => m.playStart + x * (m.playEnd - m.playStart);
	return (
		<div style={{width: STRIP_W, position: 'relative', padding: '14px 0', fontFamily: fonts.body, ...card(26), ...fadeUp(frame, m.playStart - 10, 18, 30)}}>
			{TRACKS.map((t, r) => (
				<div key={t} style={{display: 'flex', alignItems: 'center', height: ROW_H, borderTop: r ? `1px solid ${premium.line}` : undefined}}>
					<div style={{width: LABEL_W, paddingLeft: 30, color: premium.textMuted, fontSize: 24}}>{t}</div>
					<div style={{position: 'relative', width: LANE_W, height: '100%'}}>
						{KEYS[r].map((x, k) => {
							const on = progress(frame, litAt(x), 8);
							return (
								<div
									key={k}
									style={{
										position: 'absolute',
										left: x * LANE_W - 10,
										top: ROW_H / 2 - 10,
										width: 20,
										height: 20,
										borderRadius: 4,
										transform: 'rotate(45deg)',
										border: `1.5px solid ${on > 0 ? premium.text : premium.textFaint}`,
										background: `rgba(245,247,250,${0.9 * on})`,
									}}
								/>
							);
						})}
					</div>
				</div>
			))}
			<div style={{position: 'absolute', top: 0, bottom: 0, left: LABEL_W + play * LANE_W, width: 1.5, background: premium.gold}} />
		</div>
	);
};

// 2 → 5 s : MOTION DESIGN — le logo s'assemble, puis la timeline se lit.
export const MotionScene: React.FC = () => {
	const frame = useCurrentFrame();
	const m = S.motion;
	const drift = interpolate(frame, [0, m.duration], [1, 1.03]);
	const t = gmotionServices.titles.motion;
	return (
		<ClientProvider client={gmotionServices.motionClient}>
			<AbsoluteFill style={fadeOut(frame, m.duration - 12, 12, 24)}>
				<ServiceTitle index={t.index} title={t.title} subtitle={t.subtitle} />
				<AbsoluteFill style={{alignItems: 'center', top: 560, height: 620, justifyContent: 'center', transform: `scale(${drift})`}}>
					<LogoAssembly />
				</AbsoluteFill>
				<AbsoluteFill style={{alignItems: 'center', top: 1260}}>
					<KeyframeStrip />
				</AbsoluteFill>
			</AbsoluteFill>
		</ClientProvider>
	);
};
