import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {gmotion} from '../config';
import {brandLogo, premium} from '../theme';
import {fonts} from './fonts';
import {fadeUp, GoldRule, headline, progress} from './premium';
import {FREEZE_AT, G} from './timeline';

const LOGO = 360;

// Tracés vectoriels du G (repère 512 × 512, calés sur public/logo-G.svg) — dans les couleurs du logo
const STROKES = {
	arc: 'M 330 180 A 118 118 0 1 0 356 292',
	bar: 'M 356 292 L 362 262 L 268 258',
	chevron: 'M 233 214 L 209 255 L 233 297',
};

// Rythme du plan final (images locales) : tout est en place avant l'image figée
const T = {drawStart: 2, drawEnd: 20, logoAt: 18, nameAt: 22, servicesAt: 26, ruleAt: 28, buttonAt: 30};

const WhatsAppIcon: React.FC<{size: number; color: string}> = ({size, color}) => (
	<svg viewBox="0 0 24 24" width={size} height={size} fill="none">
		<path d="M12 2.5a9.5 9.5 0 0 0-8.2 14.3L2.5 21.5l4.8-1.3A9.5 9.5 0 1 0 12 2.5Z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
		<path
			d="M8.6 7.6c.3-.6.6-.6.9-.6h.6c.2 0 .5 0 .7.5l.9 2.1c.1.2.1.5-.1.7l-.6.7c-.2.2-.2.4 0 .6.8 1.4 1.8 2.3 3.2 3 .3.1.5.1.6-.1l.8-1c.2-.2.4-.2.7-.1l2 .9c.3.1.4.3.4.5 0 .9-.6 1.8-1.5 2.1-1 .3-2.4.2-4.4-.8-2.3-1.2-3.9-3.4-4.4-4.4-.6-1.2-.4-2.6.2-3.6Z"
			fill={color}
		/>
	</svg>
);

// 13 → 15 s : le logo G se dessine trait par trait, puis nom, services et bouton WhatsApp. Dernière image fixe.
export const CtaScene: React.FC = () => {
	const frame = useCurrentFrame();
	const still = FREEZE_AT - G.cta.from; // image locale à partir de laquelle tout est figé
	const draw = (from: number, to: number) => progress(frame, from, to - from);
	const plate = progress(frame, 0, 12);
	const logoIn = progress(frame, T.logoAt, 10);
	// Une seule respiration lumineuse autour du bouton, éteinte sur l'image figée
	const halo = interpolate(frame, [T.buttonAt + 6, still], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const [first, ...rest] = gmotion.brandName.split(' ');

	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40}}>
			<div style={{position: 'relative', width: LOGO, height: LOGO, opacity: plate, transform: `scale(${0.96 + 0.04 * plate})`}}>
				<div style={{position: 'absolute', inset: LOGO * 0.006, borderRadius: LOGO * 0.215, background: 'linear-gradient(150deg, #0B1638, #071233 55%, #0B1F55)', boxShadow: premium.shadow}} />
				<svg viewBox="0 0 512 512" width={LOGO} height={LOGO} style={{position: 'absolute', inset: 0, opacity: 1 - logoIn, overflow: 'visible'}}>
					<defs>
						<linearGradient id="g-stroke" x1="0.1" y1="0.1" x2="0.9" y2="0.9">
							<stop offset="0%" stopColor={brandLogo.white} />
							<stop offset="50%" stopColor={brandLogo.cyan} />
							<stop offset="100%" stopColor={brandLogo.electric} />
						</linearGradient>
					</defs>
					<path d={STROKES.arc} fill="none" stroke="url(#g-stroke)" strokeWidth={50} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw(T.drawStart, T.drawEnd - 4)} />
					<path d={STROKES.bar} fill="none" stroke={brandLogo.cyan} strokeWidth={50} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw(T.drawEnd - 7, T.drawEnd - 1)} />
					<path d={STROKES.chevron} fill="none" stroke={brandLogo.white} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw(T.drawEnd - 5, T.drawEnd)} />
				</svg>
				<Img src={staticFile(gmotion.logo)} style={{position: 'absolute', inset: 0, width: LOGO, height: LOGO, opacity: logoIn}} />
			</div>
			<div style={{...headline(88), whiteSpace: 'nowrap', marginTop: 16, ...fadeUp(frame, T.nameAt, 14, 20)}}>
				{first} <span style={{fontWeight: 400, color: premium.textMuted}}>{rest.join(' ')}</span>
			</div>
			<div style={{fontFamily: fonts.body, fontSize: 32, color: premium.textMuted, whiteSpace: 'nowrap', ...fadeUp(frame, T.servicesAt, 14, 16)}}>{gmotion.services}</div>
			<GoldRule frame={frame} at={T.ruleAt} width={120} style={{margin: '8px 0'}} />
			<div style={{position: 'relative', ...fadeUp(frame, T.buttonAt, 14, 16)}}>
				<div style={{position: 'absolute', inset: -6 - halo * 18, borderRadius: 999, border: `1.5px solid ${premium.gold}`, opacity: (1 - halo) * 0.8 * (halo > 0 ? 1 : 0)}} />
				<div style={{display: 'flex', alignItems: 'center', gap: 22, padding: '26px 48px', borderRadius: 999, background: premium.gold, color: premium.bg, fontFamily: fonts.body}}>
					<WhatsAppIcon size={60} color={premium.bg} />
					<div style={{display: 'flex', flexDirection: 'column'}}>
						<span style={{fontSize: 30, fontWeight: 500}}>{gmotion.ctaButton}</span>
						<span style={{fontSize: 44, fontWeight: 600, letterSpacing: 0.5}}>{gmotion.whatsapp}</span>
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};
