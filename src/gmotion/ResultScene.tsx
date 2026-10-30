import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';
import {gmotion} from '../config';
import {clamp, springs} from '../lib/anim';
import {DeviceMockup, VIEWPORTS} from '../components/DeviceMockup';
import {fonts} from './fonts';
import {GFlash, GPill} from './Atmosphere';
import {G} from './timeline';
import {NovaAd, NovaMark, NovaWordmark, PieceTransform} from './Nova';

const {colors, client} = gmotion;
const MARK = 440;

/** Une pièce part d'une position aléatoire et vient se verrouiller (ressort) */
const flyIn = (frame: number, fps: number, key: string, delay: number, spread: number): PieceTransform => {
	const p = spring({frame: frame - delay, fps, config: {damping: 13, mass: 0.7, stiffness: 120}});
	const angle = random(`ang-${key}`) * Math.PI * 2;
	const dist = spread * (0.7 + random(`dist-${key}`) * 0.6);
	return {
		x: Math.cos(angle) * dist * (1 - p),
		y: Math.sin(angle) * dist * (1 - p),
		rotate: (random(`rot-${key}`) - 0.5) * 540 * (1 - p),
		scale: 0.4 + 0.6 * p,
		opacity: interpolate(frame - delay, [0, 4], [0, 1], clamp),
	};
};

const LogoAssembly: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const r = G.result;
	const lock = spring({frame: frame - r.lockAt, fps, config: springs.snappy});
	const lockPulse = interpolate(frame - r.lockAt, [0, 4, 16], [0, 1, 0], clamp);
	return (
		<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30}}>
			<div style={{position: 'relative'}}>
				{/* Onde de verrouillage */}
				<div
					style={{
						position: 'absolute',
						left: '50%',
						top: '50%',
						width: MARK,
						height: MARK,
						marginLeft: -MARK / 2,
						marginTop: -MARK / 2,
						borderRadius: '50%',
						border: `6px solid ${colors.cyan}`,
						transform: `scale(${0.8 + lock * 0.9})`,
						opacity: lockPulse,
						boxShadow: `0 0 60px ${colors.cyan}`,
					}}
				/>
				<NovaMark size={MARK} glow={1 + lockPulse * 2} piece={(i) => flyIn(frame, fps, `p${i}`, r.assembleAt + i * 2, 220)} />
			</div>
			<NovaWordmark size={150} piece={(i) => flyIn(frame, fps, `w${i}`, r.assembleAt + 8 + i * 2, 900)} />
			<div style={{fontFamily: fonts.body, fontWeight: 600, fontSize: 40, color: colors.muted, opacity: interpolate(frame, [r.lockAt, r.lockAt + 8], [0, 1], clamp), letterSpacing: 4, textTransform: 'uppercase'}}>
				{client.sector}
			</div>
		</div>
	);
};

// 8 → 11 s : impact + flash blanc, le logo s'assemble puis s'affiche dans un téléphone 3D.
export const ResultScene: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const r = G.result;
	const toPhone = spring({frame: frame - r.toPhoneAt, fps, config: springs.camera});
	const phoneIn = spring({frame: frame - (r.toPhoneAt - 2), fps, config: {damping: 15, mass: 0.9, stiffness: 80}});
	const exit = spring({frame: frame - (r.duration - 10), fps, config: springs.snappy});
	const pill = spring({frame: frame - (r.toPhoneAt + 12), fps, config: springs.bouncy});
	const ry = Math.sin((frame - r.toPhoneAt) / 22) * 14;
	const rx = 6 + Math.cos((frame - r.toPhoneAt) / 30) * 3;
	const glare = interpolate(ry, [-14, 14], [-60, 160]);
	const assembling = frame < r.lockAt + 6;

	const logo = (
		<AbsoluteFill
			style={{
				alignItems: 'center',
				justifyContent: 'center',
				transform: `translateY(${-toPhone * 520}px) scale(${1 - toPhone * 0.7})`,
				opacity: 1 - toPhone,
			}}
		>
			<LogoAssembly />
		</AbsoluteFill>
	);

	return (
		<AbsoluteFill style={{transform: `scale(${1 - exit * 0.25})`, opacity: 1 - exit, filter: exit > 0.01 ? `blur(${exit * 14}px)` : undefined}}>
			{assembling ? (
				<CameraMotionBlur shutterAngle={200} samples={6}>
					{logo}
				</CameraMotionBlur>
			) : (
				logo
			)}
			{frame >= r.toPhoneAt - 2 && (
				<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', perspective: 1800}}>
					{/* Lueur néon au sol */}
					<div
						style={{
							position: 'absolute',
							bottom: 230,
							width: 700,
							height: 120,
							borderRadius: '50%',
							background: `radial-gradient(ellipse, ${colors.cyan}AA, transparent 70%)`,
							filter: 'blur(20px)',
							opacity: phoneIn,
						}}
					/>
					<div
						style={{
							position: 'relative',
							transform: `translateY(${(1 - phoneIn) * 1500 + 40}px) rotateY(${ry}deg) rotateX(${rx}deg) rotateZ(${(1 - phoneIn) * -14}deg)`,
							transformStyle: 'preserve-3d',
						}}
					>
						<DeviceMockup type="phone" width={590} glowColor={colors.electric}>
							<NovaAd frame={frame - r.toPhoneAt - 4} {...VIEWPORTS.phone} />
						</DeviceMockup>
						{/* Reflet mobile qui suit la rotation */}
						<div
							style={{
								position: 'absolute',
								inset: 0,
								borderRadius: 94,
								pointerEvents: 'none',
								background: `linear-gradient(110deg, transparent ${glare - 40}%, rgba(255,255,255,0.22) ${glare}%, transparent ${glare + 25}%)`,
							}}
						/>
					</div>
				</AbsoluteFill>
			)}
			<GPill enter={pill} font={fonts.display}>
				✨ {gmotion.resultLabel}
			</GPill>
			<GFlash at={r.flashAt} duration={12} color={colors.white} />
		</AbsoluteFill>
	);
};
