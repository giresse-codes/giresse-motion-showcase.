import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';
import {gmotionServices} from '../../config';
import {serviceColors, videoPalette} from '../../theme';
import {clamp, springs} from '../../lib/anim';
import {GlitchTransition} from '../../components/GlitchTransition';
import {Particles} from '../../components/Particles';
import {ClientMark, ClientWordmark, flyIn} from '../ClientBrand';
import {ClientProvider, useClient} from '../client';
import {fonts} from '../fonts';
import {ServiceTitle} from './ServiceTitle';
import {S} from './timeline';

const {main, second} = serviceColors.motion;
const TRACKS = ['Position', 'Échelle', 'Rotation'];
const KEYS = [
	[0.05, 0.3, 0.55, 0.85],
	[0.12, 0.42, 0.72],
	[0.08, 0.36, 0.64, 0.95],
];
const STRIP_W = 900;
const LABEL_W = 190;
const LANE_W = STRIP_W - LABEL_W - 40;
const ROW_H = 72;

/** Le logo de l'entreprise fictive s'assemble en morceaux qui volent puis se verrouillent */
const LogoAssembly: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {client, palette} = useClient();
	const m = S.motion;
	const lock = spring({frame: frame - m.lockAt, fps, config: springs.snappy});
	const ring = interpolate(frame - m.lockAt, [0, 4, 16], [0, 1, 0], clamp);
	return (
		<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22}}>
			<div style={{position: 'relative'}}>
				<div
					style={{
						position: 'absolute',
						inset: 0,
						borderRadius: '50%',
						border: `6px solid ${palette.secondary}`,
						transform: `scale(${0.8 + lock * 0.9})`,
						opacity: ring,
						boxShadow: `0 0 60px ${palette.primary}`,
					}}
				/>
				<ClientMark size={330} glow={1 + ring * 2} piece={(i) => flyIn(frame, fps, `m${i}`, m.assembleAt + i * 2, 260)} />
			</div>
			<ClientWordmark maxSize={104} maxWidth={900} piece={(i) => flyIn(frame, fps, `mw${i}`, m.assembleAt + 8 + i * 1.5, 900)} />
			<div style={{fontFamily: fonts.body, fontWeight: 600, fontSize: 32, color: palette.light, opacity: interpolate(frame, [m.lockAt, m.lockAt + 8], [0, 1], clamp)}}>
				{client.sector}
			</div>
		</div>
	);
};

/** Mini-timeline : keyframes qui s'allument en néon au passage de la tête de lecture, avec étincelles */
const KeyframeStrip: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const m = S.motion;
	const play = interpolate(frame, [m.playStart, m.playEnd], [0, 1], clamp);
	const litAt = (x: number) => m.playStart + x * (m.playEnd - m.playStart);
	const enter = spring({frame: frame - 6, fps, config: {damping: 16, stiffness: 100}});

	const sparks: React.ReactNode[] = [];
	KEYS.forEach((row, r) =>
		row.forEach((x, k) => {
			const since = frame - litAt(x);
			if (since < 0 || since > 22) return;
			for (let i = 0; i < 6; i++) {
				const id = `${r}-${k}-${i}`;
				const a = -Math.PI / 2 + (random(`ma-${id}`) - 0.5) * 2.4;
				const v = 8 + random(`mv-${id}`) * 11;
				const size = 4 + random(`ms-${id}`) * 6;
				sparks.push(
					<div
						key={id}
						style={{
							position: 'absolute',
							left: LABEL_W + x * LANE_W + Math.cos(a) * v * since - size / 2,
							top: r * ROW_H + ROW_H / 2 + Math.sin(a) * v * since + 0.6 * since * since - size / 2,
							width: size,
							height: size,
							borderRadius: '50%',
							background: i % 3 === 0 ? '#fff' : i % 2 ? second : main,
							boxShadow: `0 0 ${size * 3}px ${main}`,
							opacity: interpolate(since, [0, 16, 22], [1, 0.8, 0], clamp),
						}}
					/>,
				);
			}
		}),
	);

	return (
		<div
			style={{
				width: STRIP_W,
				position: 'relative',
				padding: '18px 0',
				borderRadius: 30,
				background: 'linear-gradient(160deg, rgba(70,30,6,0.85), rgba(14,10,12,0.92))',
				border: `1.5px solid ${main}66`,
				boxShadow: `0 40px 100px rgba(0,0,0,0.6), 0 0 80px ${main}44`,
				transform: `perspective(1400px) rotateX(${18 + (1 - enter) * 30}deg) translateY(${(1 - enter) * 300}px)`,
				opacity: Math.min(1, enter * 1.5),
				fontFamily: fonts.body,
			}}
		>
			<div style={{position: 'relative'}}>
				{TRACKS.map((t, r) => (
					<div key={t} style={{display: 'flex', alignItems: 'center', height: ROW_H}}>
						<div style={{width: LABEL_W, paddingLeft: 26, color: videoPalette.muted, fontSize: 26, fontWeight: 600}}>{t}</div>
						<div style={{position: 'relative', width: LANE_W, height: '100%'}}>
							<div style={{position: 'absolute', left: 0, right: 0, top: ROW_H / 2 - 2, height: 4, borderRadius: 2, background: `${main}22`}} />
							{KEYS[r].map((x, k) => {
								const on = frame >= litAt(x);
								const lit = spring({frame: frame - litAt(x), fps, config: springs.bouncy});
								return (
									<div
										key={k}
										style={{
											position: 'absolute',
											left: x * LANE_W - 15,
											top: ROW_H / 2 - 15,
											width: 30,
											height: 30,
											borderRadius: 5,
											transform: `rotate(45deg) scale(${on ? 1.25 + 0.5 * (1 - lit) : 0.8})`,
											background: on ? second : 'rgba(185,179,201,0.25)',
											border: on ? '2px solid #fff' : '2px solid rgba(185,179,201,0.35)',
											boxShadow: on ? `0 0 ${18 + 30 * (1 - lit)}px ${main}, 0 0 6px #fff` : 'none',
										}}
									/>
								);
							})}
						</div>
					</div>
				))}
				<div style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>{sparks}</div>
				<div
					style={{
						position: 'absolute',
						top: -10,
						bottom: -10,
						left: LABEL_W + play * LANE_W - 2,
						width: 4,
						background: main,
						boxShadow: `0 0 24px ${main}, 0 0 6px #fff`,
					}}
				/>
			</div>
		</div>
	);
};

// 2 → 5 s : MOTION DESIGN (orange / jaune).
export const MotionScene: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const m = S.motion;
	const enter = spring({frame, fps, config: {damping: 15, stiffness: 100}});
	const push = interpolate(frame, [0, m.duration], [1, 1.06]);
	// Petite secousse quand le logo se verrouille
	const shake = Math.exp(-Math.max(0, frame - m.lockAt) / 4) * (frame >= m.lockAt ? 10 : 0);
	const sx = (random(`msx-${frame}`) - 0.5) * 2 * shake;
	const sy = (random(`msy-${frame}`) - 0.5) * 2 * shake;
	const assembling = frame >= m.assembleAt - 2 && frame < m.lockAt + 6;
	const logo = (
		<AbsoluteFill style={{alignItems: 'center', top: 470, height: 680, justifyContent: 'center'}}>
			<LogoAssembly />
		</AbsoluteFill>
	);
	const t = gmotionServices.titles.motion;

	return (
		<ClientProvider client={gmotionServices.motionClient}>
			<GlitchTransition at={m.duration - 14} duration={14} slices={3} flashColors={[videoPalette.magenta, videoPalette.violet]}>
				<AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px) scale(${push * (0.85 + 0.15 * enter)})`, opacity: Math.min(1, enter * 1.6)}}>
					{assembling ? (
						<CameraMotionBlur shutterAngle={200} samples={6}>
							{logo}
						</CameraMotionBlur>
					) : (
						logo
					)}
					<Particles mode="burst" count={46} seed="motion-burst" burstAt={m.lockAt} colors={[main, second, '#ffffff']} />
					<AbsoluteFill style={{alignItems: 'center', top: 1190}}>
						<KeyframeStrip />
					</AbsoluteFill>
				</AbsoluteFill>
				<ServiceTitle index={t.index} title={t.title} subtitle={t.subtitle} main={main} second={second} />
			</GlitchTransition>
		</ClientProvider>
	);
};
