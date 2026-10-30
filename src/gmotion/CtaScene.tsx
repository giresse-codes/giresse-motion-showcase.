import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {gmotion} from '../config';
import {clamp, springs} from '../lib/anim';
import {fonts} from './fonts';
import {FREEZE_AT, G} from './timeline';

const {colors} = gmotion;
const LOGO = 400;
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

// Tracés vectoriels du G (repère 512 × 512, calés sur public/logo-G.svg)
const STROKES = {
	arc: 'M 330 180 A 118 118 0 1 0 356 292',
	bar: 'M 356 292 L 362 262 L 268 258',
	chevron: 'M 233 214 L 209 255 L 233 297',
};

const WhatsAppIcon: React.FC<{size: number}> = ({size}) => (
	<svg viewBox="0 0 24 24" width={size} height={size} fill="none">
		<path d="M12 2.5a9.5 9.5 0 0 0-8.2 14.3L2.5 21.5l4.8-1.3A9.5 9.5 0 1 0 12 2.5Z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
		<path
			d="M8.6 7.6c.3-.6.6-.6.9-.6h.6c.2 0 .5 0 .7.5l.9 2.1c.1.2.1.5-.1.7l-.6.7c-.2.2-.2.4 0 .6.8 1.4 1.8 2.3 3.2 3 .3.1.5.1.6-.1l.8-1c.2-.2.4-.2.7-.1l2 .9c.3.1.4.3.4.5 0 .9-.6 1.8-1.5 2.1-1 .3-2.4.2-4.4-.8-2.3-1.2-3.9-3.4-4.4-4.4-.6-1.2-.4-2.6.2-3.6Z"
			fill="white"
		/>
	</svg>
);

// 13 → 15 s : le logo G se dessine, puis nom, services et bouton WhatsApp. Dernière image fixe.
export const CtaScene: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const c = G.cta;
	const still = FREEZE_AT - G.cta.from; // image locale à partir de laquelle tout est figé
	const draw = (from: number, to: number) => interpolate(frame, [from, to], [0, 1], {...clamp, easing: ease});
	const plate = spring({frame, fps, config: springs.bouncy});
	const logoIn = draw(c.logoAt, c.logoAt + 8);
	const glowFlash = interpolate(frame, [c.logoAt + 2, c.logoAt + 6, c.logoAt + 16], [0, 1, 0], clamp);
	const s = (delay: number) => spring({frame: frame - delay, fps, config: springs.bouncy});
	const name = s(c.nameAt);
	const services = s(c.servicesAt);
	const button = s(c.buttonAt);
	// Pulsation du bouton : s'éteint exactement sur la dernière image animée
	const pulseAmp = interpolate(frame, [c.buttonAt + 2, still], [1, 0], clamp);
	const pulse = 1 + 0.06 * pulseAmp * Math.sin(((frame - c.buttonAt) / 9) * 2 * Math.PI);
	const shine = interpolate(frame, [c.buttonAt + 2, still - 1], [-40, 140], clamp);
	const dots = s(18);

	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 44}}>
			<div style={{position: 'relative', width: LOGO, height: LOGO, transform: `scale(${0.5 + 0.5 * plate})`}}>
				<div
					style={{
						position: 'absolute',
						inset: LOGO * 0.006,
						borderRadius: LOGO * 0.215,
						background: 'linear-gradient(150deg, #0B1638, #071233 55%, #0B1F55)',
						boxShadow: `0 0 ${80 + glowFlash * 120}px ${colors.electric}${glowFlash > 0.5 ? 'FF' : 'AA'}, 0 30px 80px rgba(0,0,0,0.6)`,
						opacity: Math.min(1, plate * 1.5),
					}}
				/>
				<svg viewBox="0 0 512 512" width={LOGO} height={LOGO} style={{position: 'absolute', inset: 0, opacity: 1 - logoIn, overflow: 'visible'}}>
					<defs>
						<linearGradient id="g-stroke" x1="0.1" y1="0.1" x2="0.9" y2="0.9">
							<stop offset="0%" stopColor={colors.white} />
							<stop offset="50%" stopColor={colors.cyan} />
							<stop offset="100%" stopColor={colors.electric} />
						</linearGradient>
						<mask id="g-ring">
							<circle cx={250} cy={252} r={186} fill="none" stroke="#fff" strokeWidth={10} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw(2, 16)} transform="rotate(-60 250 252)" />
						</mask>
					</defs>
					<circle cx={250} cy={252} r={186} fill="none" stroke={colors.cyan} strokeOpacity={0.6} strokeWidth={3} strokeDasharray="3 11" mask="url(#g-ring)" />
					<g style={{filter: `drop-shadow(0 0 14px ${colors.cyan})`}}>
						<path d={STROKES.arc} fill="none" stroke="url(#g-stroke)" strokeWidth={50} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw(4, 17)} />
						<path d={STROKES.bar} fill="none" stroke={colors.cyan} strokeWidth={50} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw(14, 20)} />
						<path d={STROKES.chevron} fill="none" stroke={colors.white} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw(16, 21)} />
					</g>
					{[
						[398, 150, 7],
						[410, 128, 4],
						[383, 116, 3],
					].map(([x, y, r], i) => (
						<circle key={i} cx={x} cy={y} r={r * dots} fill={colors.cyan} />
					))}
				</svg>
				<Img src={staticFile(gmotion.logo)} style={{position: 'absolute', inset: 0, width: LOGO, height: LOGO, opacity: logoIn}} />
			</div>
			<div
				style={{
					fontFamily: fonts.display,
					fontWeight: 900,
					fontSize: 92,
					lineHeight: 1,
					letterSpacing: -2,
					color: colors.white,
					transform: `translateY(${(1 - name) * 70}px) scale(${0.7 + 0.3 * name})`,
					opacity: Math.min(1, name * 1.5),
					textShadow: `0 0 40px ${colors.electric}`,
					whiteSpace: 'nowrap',
				}}
			>
				{gmotion.brandName.split(' ')[0]}{' '}
				<span style={{background: `linear-gradient(90deg, ${colors.cyan}, ${colors.electric})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>
					{gmotion.brandName.split(' ').slice(1).join(' ')}
				</span>
			</div>
			<div
				style={{
					fontFamily: fonts.body,
					fontWeight: 600,
					fontSize: 36,
					color: '#CFE0FF',
					transform: `translateY(${(1 - services) * 40}px)`,
					opacity: Math.min(1, services * 1.5),
					whiteSpace: 'nowrap',
				}}
			>
				{gmotion.services}
			</div>
			<div
				style={{
					position: 'relative',
					overflow: 'hidden',
					marginTop: 20,
					display: 'flex',
					alignItems: 'center',
					gap: 26,
					padding: '28px 52px',
					borderRadius: 999,
					background: `linear-gradient(135deg, ${colors.whatsapp}, #128C7E)`,
					boxShadow: `0 0 ${40 + 50 * pulseAmp * Math.max(0, Math.sin(((frame - c.buttonAt) / 9) * 2 * Math.PI))}px ${colors.whatsapp}AA, 0 20px 50px rgba(0,0,0,0.5)`,
					transform: `scale(${button * pulse})`,
					color: colors.white,
					fontFamily: fonts.display,
				}}
			>
				<WhatsAppIcon size={84} />
				<div style={{display: 'flex', flexDirection: 'column'}}>
					<span style={{fontSize: 38, fontWeight: 800}}>{gmotion.ctaButton}</span>
					<span style={{fontSize: 50, fontWeight: 900, letterSpacing: 1}}>{gmotion.whatsapp}</span>
				</div>
				<div style={{position: 'absolute', top: 0, bottom: 0, left: `${shine}%`, width: '20%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)', transform: 'skewX(-20deg)'}} />
			</div>
		</AbsoluteFill>
	);
};
