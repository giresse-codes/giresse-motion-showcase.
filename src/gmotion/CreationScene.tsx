import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {gmotion} from '../config';
import {premium} from '../theme';
import {fonts} from './fonts';
import {card, Eyebrow, ease, fadeOut, fadeUp, progress} from './premium';
import {G} from './timeline';
import {ClientMark} from './ClientBrand';
import {useClient} from './client';

const PANEL_W = 920;
const LABEL_W = 200;
const LANE_W = PANEL_W - LABEL_W - 48;
const ROW_H = 64;
// Positions des keyframes (0 → 1) sur chaque piste
const KEYFRAMES = [
	[0.06, 0.34, 0.62, 0.9],
	[0.14, 0.5, 0.84],
	[0.1, 0.42, 0.7],
	[0.04, 0.3, 0.56, 0.8],
	[0.2, 0.6, 0.95],
];
// Courbes de Bézier de l'éditeur de graphes (repère 0..1)
const CURVES = [
	{d: 'M 0 0.85 C 0.3 0.85, 0.35 0.15, 0.6 0.2 S 0.85 0.55, 1 0.35', color: premium.steel},
	{d: 'M 0 0.45 C 0.25 0.2, 0.45 0.8, 0.7 0.6 S 0.9 0.3, 1 0.4', color: premium.textMuted},
];

const scaleD = (d: string, w: number, h: number) =>
	d.replace(/(-?\d*\.?\d+) (-?\d*\.?\d+)/g, (_, x, y) => `${(parseFloat(x) * w).toFixed(1)} ${(parseFloat(y) * h).toFixed(1)}`);

// 5 → 8 s : timeline épurée d'un logiciel d'animation ; la tête de lecture allume les keyframes.
export const CreationScene: React.FC = () => {
	const frame = useCurrentFrame();
	const c = G.creation;
	const {client} = useClient();
	const play = interpolate(frame, [c.playStart, c.playEnd], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
	const litFrame = (x: number) => c.playStart + x * (c.playEnd - c.playStart);
	// Caméra lente : la timeline se redresse doucement
	const tilt = interpolate(frame, [0, c.duration], [14, 4], {easing: ease});
	const graphW = PANEL_W - 48 * 2;
	const graphH = 210;
	const tc = Math.floor(play * 90);

	return (
		<AbsoluteFill style={fadeOut(frame, c.duration - 12, 12, 24)}>
			<Eyebrow text={gmotion.steps.creation} frame={frame} at={6} style={{position: 'absolute', top: gmotion.safeMargin + 90, left: 0, right: 0}} />
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', perspective: 2200}}>
				<div style={{width: PANEL_W, position: 'relative', fontFamily: fonts.body, color: premium.text, transform: `rotateX(${tilt}deg)`, ...card(32), ...fadeUp(frame, 0, 22, 40)}}>
					<div style={{display: 'flex', alignItems: 'center', height: 76, padding: '0 32px', borderBottom: `1px solid ${premium.line}`}}>
						<div style={{fontSize: 24, fontWeight: 500, color: premium.textMuted}}>{client.name.replace(/\s+/g, '_')}_lancement</div>
						<div style={{flex: 1}} />
						<div style={{fontFamily: fonts.mono, fontSize: 24, color: premium.textMuted}}>
							00:00:{String(Math.floor(tc / 30)).padStart(2, '0')}:{String(tc % 30).padStart(2, '0')}
						</div>
					</div>
					{/* Aperçu : le logo se trace au fil de la lecture */}
					<div style={{height: 330, margin: '24px 24px 0', borderRadius: 20, background: 'rgba(5,12,26,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<ClientMark size={200} progress={play} wireframe wireColor={premium.text} />
					</div>
					{/* Éditeur de courbes */}
					<div style={{height: graphH, margin: '20px 24px 0', position: 'relative'}}>
						<svg width={graphW} height={graphH} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
							{[0.25, 0.5, 0.75].map((g) => (
								<line key={g} x1={0} x2={graphW} y1={graphH * g} y2={graphH * g} stroke={premium.line} />
							))}
							{CURVES.map((cv, i) => (
								<path key={i} d={scaleD(cv.d, graphW, graphH)} fill="none" stroke={cv.color} strokeWidth={3} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - play} />
							))}
						</svg>
					</div>
					{/* Pistes et keyframes */}
					<div style={{padding: '16px 0 24px'}}>
						{gmotion.timelineTracks.map((track, r) => (
							<div key={track} style={{display: 'flex', alignItems: 'center', height: ROW_H, borderTop: `1px solid ${premium.line}`}}>
								<div style={{width: LABEL_W, paddingLeft: 32, fontSize: 24, color: premium.textMuted}}>{track}</div>
								<div style={{position: 'relative', width: LANE_W, height: '100%'}}>
									{KEYFRAMES[r].map((x, k) => {
										const on = progress(frame, litFrame(x), 8);
										return (
											<div
												key={k}
												style={{
													position: 'absolute',
													left: x * LANE_W - 11,
													top: ROW_H / 2 - 11,
													width: 22,
													height: 22,
													transform: 'rotate(45deg)',
													borderRadius: 4,
													border: `1.5px solid ${on > 0 ? premium.text : premium.textFaint}`,
													background: `rgba(245,247,250,${0.9 * on})`,
												}}
											/>
										);
									})}
								</div>
							</div>
						))}
					</div>
					{/* Tête de lecture : fine ligne or */}
					<div style={{position: 'absolute', top: 76, bottom: 0, left: LABEL_W + play * LANE_W, width: 1.5, background: premium.gold}} />
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
