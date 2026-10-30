import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {gmotion} from '../config';
import {videoPalette as colors} from '../theme';
import {clamp, springs} from '../lib/anim';
import {Camera3D} from '../components/Camera3D';
import {GlitchTransition} from '../components/GlitchTransition';
import {fonts} from './fonts';
import {GPill} from './Atmosphere';
import {G} from './timeline';
import {ClientMark} from './ClientBrand';
import {useClient} from './client';

const PANEL_W = 980;
const LABEL_W = 210;
const LANE_W = PANEL_W - LABEL_W - 40;
const ROW_H = 66;
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
	{d: 'M 0 0.9 C 0.25 0.9, 0.3 0.1, 0.55 0.15 S 0.85 0.6, 1 0.35', color: colors.yellow},
	{d: 'M 0 0.6 C 0.2 0.1, 0.45 0.95, 0.65 0.55 S 0.9 0.05, 1 0.2', color: colors.orange},
	{d: 'M 0 0.35 C 0.3 0.4, 0.4 0.85, 0.7 0.75 S 0.9 0.5, 1 0.65', color: colors.mint},
];

const scaleD = (d: string, w: number, h: number) =>
	d.replace(/(-?\d*\.?\d+) (-?\d*\.?\d+)/g, (_, x, y) => `${(parseFloat(x) * w).toFixed(1)} ${(parseFloat(y) * h).toFixed(1)}`);

// 5 → 8 s : timeline de logiciel d'animation en 3D, keyframes néon, courbes de Bézier et étincelles.
export const CreationScene: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const c = G.creation;
	const {client} = useClient();
	const play = interpolate(frame, [c.playStart, c.playEnd], [0, 1], {...clamp, easing: (t) => t * (2 - t) * 0.6 + t * 0.4});
	const litFrame = (x: number) => c.playStart + x * (c.playEnd - c.playStart);
	const pill = spring({frame: frame - 6, fps, config: springs.bouncy});
	const tc = Math.floor(play * 90);
	const graphW = PANEL_W - 60;
	const graphH = 250;
	const previewH = 360;

	const lane = (row: number) => (
		<div key={row} style={{display: 'flex', height: ROW_H, alignItems: 'center', borderTop: '1px solid rgba(255,122,26,0.1)'}}>
			<div style={{width: LABEL_W, paddingLeft: 24, color: colors.muted, fontSize: 26, fontWeight: 600}}>{gmotion.timelineTracks[row]}</div>
			<div style={{position: 'relative', width: LANE_W, height: '100%'}}>
				<div style={{position: 'absolute', left: 0, right: 0, top: ROW_H / 2 - 2, height: 4, background: 'rgba(255,122,26,0.12)', borderRadius: 2}} />
				{KEYFRAMES[row].map((x, k) => {
					const lit = spring({frame: frame - litFrame(x), fps, config: springs.bouncy});
					const on = frame >= litFrame(x);
					return (
						<div
							key={k}
							style={{
								position: 'absolute',
								left: x * LANE_W - 15,
								top: ROW_H / 2 - 15,
								width: 30,
								height: 30,
								transform: `rotate(45deg) scale(${on ? 1 + 0.5 * (1 - lit) + 0.25 * lit : 0.8})`,
								borderRadius: 5,
								background: on ? colors.yellow : 'rgba(185,179,201,0.25)',
								boxShadow: on ? `0 0 ${18 + 30 * (1 - lit)}px ${colors.orange}, 0 0 6px #fff` : 'none',
								border: on ? '2px solid #fff' : '2px solid rgba(185,179,201,0.35)',
							}}
						/>
					);
				})}
			</div>
		</div>
	);

	// Étincelles jaunes et orange qui jaillissent de chaque keyframe au moment où elle s'allume
	const sparks: React.ReactNode[] = [];
	KEYFRAMES.forEach((row, r) =>
		row.forEach((x, k) => {
			const since = frame - litFrame(x);
			if (since < 0 || since > 24) return;
			for (let i = 0; i < 7; i++) {
				const id = `${r}-${k}-${i}`;
				const angle = -Math.PI / 2 + (random(`a-${id}`) - 0.5) * 2.2;
				const speed = 9 + random(`v-${id}`) * 12;
				const px = LABEL_W + x * LANE_W + Math.cos(angle) * speed * since;
				const py = r * ROW_H + ROW_H / 2 + Math.sin(angle) * speed * since + 0.6 * since * since;
				const size = 4 + random(`s-${id}`) * 6;
				sparks.push(
					<div
						key={id}
						style={{
							position: 'absolute',
							left: px - size / 2,
							top: py - size / 2,
							width: size,
							height: size,
							borderRadius: '50%',
							background: i % 3 === 0 ? '#fff' : i % 3 === 1 ? colors.yellow : colors.orange,
							boxShadow: `0 0 ${size * 3}px ${colors.orange}`,
							opacity: interpolate(since, [0, 18, 24], [1, 0.8, 0], clamp),
						}}
					/>,
				);
			}
		}),
	);

	const curveLen = 2200;
	return (
		<GlitchTransition at={-2} duration={c.glitchIn} slices={3} flashColors={[colors.yellow, colors.orange]}>
			<Camera3D
				perspective={1600}
				keys={[
					{at: 0, rotateX: 48, rotateY: -18, rotateZ: -14, z: -700, y: 260, scale: 0.9},
					{at: 30, rotateX: 30, rotateY: -10, rotateZ: -8, z: -160, y: 80},
					{at: 70, rotateX: 22, rotateY: 8, rotateZ: -3, z: 40, y: 20, x: -30},
					{at: 98, rotateX: 14, rotateY: 2, rotateZ: 0, z: 420, y: -40, x: -150, scale: 1.1},
				]}
			>
				<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
					<div
						style={{
							width: PANEL_W,
							borderRadius: 36,
							overflow: 'visible',
							position: 'relative',
							background: 'linear-gradient(160deg, rgba(58,26,8,0.92), rgba(14,10,12,0.96))',
							border: '1.5px solid rgba(255,122,26,0.3)',
							boxShadow: `0 60px 140px rgba(0,0,0,0.7), 0 0 120px ${colors.orange}66, inset 0 1px 0 rgba(255,255,255,0.12)`,
							fontFamily: fonts.body,
							color: colors.white,
						}}
					>
						{/* Barre d'outils */}
						<div style={{display: 'flex', alignItems: 'center', gap: 14, height: 76, padding: '0 28px', borderBottom: '1px solid rgba(255,122,26,0.15)'}}>
							{['#FF5F57', '#FEBC2E', '#28C840'].map((col) => (
								<div key={col} style={{width: 18, height: 18, borderRadius: '50%', background: col}} />
							))}
							<div style={{marginLeft: 16, fontSize: 26, fontWeight: 600, color: colors.muted}}>{client.name.replace(/\s+/g, '_')}_lancement.gm</div>
							<div style={{flex: 1}} />
							<div style={{fontFamily: 'monospace', fontSize: 28, color: colors.yellow}}>00:00:{String(Math.floor(tc / 30)).padStart(2, '0')}:{String(tc % 30).padStart(2, '0')}</div>
						</div>
						{/* Aperçu */}
						<div
							style={{
								height: previewH,
								margin: 24,
								borderRadius: 22,
								position: 'relative',
								overflow: 'hidden',
								background: `radial-gradient(circle at 50% 50%, ${colors.orange}33, transparent 70%), #0E0906`,
								backgroundImage: 'linear-gradient(rgba(255,122,26,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,122,26,0.07) 1px, transparent 1px)',
								backgroundSize: '40px 40px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<svg width={graphW} height={previewH} style={{position: 'absolute', inset: 0}}>
								<path
									d={`M 60 ${previewH - 60} C 260 ${previewH - 60}, 300 60, ${graphW / 2} ${previewH / 2}`}
									fill="none"
									stroke={colors.yellow}
									strokeWidth={3}
									strokeDasharray="10 12"
									opacity={0.6}
								/>
							</svg>
							<div style={{transform: `scale(${0.4 + 0.6 * play}) rotate(${(1 - play) * -120}deg)`, opacity: 0.4 + 0.6 * play}}>
								<ClientMark size={230} progress={play} wireframe={play < 0.98} wireColor={colors.yellow} />
							</div>
						</div>
						{/* Éditeur de courbes */}
						<div style={{height: graphH, margin: '0 24px 20px', position: 'relative', borderRadius: 18, background: 'rgba(0,0,0,0.25)', overflow: 'hidden'}}>
							<svg width={graphW - 48} height={graphH} style={{position: 'absolute', inset: 0}}>
								{[0.25, 0.5, 0.75].map((g) => (
									<line key={g} x1={0} x2={graphW} y1={graphH * g} y2={graphH * g} stroke="rgba(255,122,26,0.08)" />
								))}
								{CURVES.map((cv, i) => {
									const draw = interpolate(frame, [c.playStart + i * 6, c.playEnd - 10 + i * 4], [0, 1], {...clamp, easing: (t) => 1 - Math.pow(1 - t, 2)});
									return (
										<path
											key={i}
											d={scaleD(cv.d, graphW - 48, graphH)}
											fill="none"
											stroke={cv.color}
											strokeWidth={5}
											strokeLinecap="round"
											strokeDasharray={curveLen}
											strokeDashoffset={curveLen * (1 - draw)}
											style={{filter: `drop-shadow(0 0 10px ${cv.color})`}}
										/>
									);
								})}
								{/* Poignées de tangentes */}
								{[0.25, 0.55, 0.85].map((x, i) => {
									const show = spring({frame: frame - (c.playStart + 20 + i * 14), fps, config: springs.bouncy});
									const cx = x * (graphW - 48);
									const cy = graphH * [0.5, 0.15, 0.55][i];
									return (
										<g key={i} opacity={Math.min(1, show)} transform={`translate(${cx} ${cy}) scale(${show})`}>
											<line x1={-70} y1={20} x2={70} y2={-20} stroke="rgba(255,255,255,0.6)" strokeWidth={2} />
											<circle cx={-70} cy={20} r={8} fill={colors.bg} stroke="#fff" strokeWidth={2} />
											<circle cx={70} cy={-20} r={8} fill={colors.bg} stroke="#fff" strokeWidth={2} />
											<rect x={-11} y={-11} width={22} height={22} transform="rotate(45)" fill={colors.yellow} />
										</g>
									);
								})}
							</svg>
						</div>
						{/* Pistes et keyframes */}
						<div style={{position: 'relative', paddingBottom: 24}}>
							{gmotion.timelineTracks.map((_, r) => lane(r))}
							<div style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>{sparks}</div>
						</div>
						{/* Tête de lecture */}
						<div
							style={{
								position: 'absolute',
								top: 76,
								bottom: 0,
								left: LABEL_W + play * LANE_W - 2,
								width: 4,
								background: colors.orange,
								boxShadow: `0 0 24px ${colors.orange}, 0 0 6px #fff`,
							}}
						>
							<div style={{position: 'absolute', top: -14, left: -14, width: 32, height: 28, borderRadius: 6, background: colors.orange, boxShadow: `0 0 20px ${colors.orange}`}} />
						</div>
					</div>
				</AbsoluteFill>
			</Camera3D>
			<GPill enter={pill} font={fonts.display} accent={colors.orange}>
				⚡ {gmotion.creationLabel}… <span style={{color: colors.yellow}}>{Math.round(play * 100)} %</span>
			</GPill>
		</GlitchTransition>
	);
};
