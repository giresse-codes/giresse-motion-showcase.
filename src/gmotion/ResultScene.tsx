import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {gmotion} from '../config';
import {premium} from '../theme';
import {DeviceMockup, VIEWPORTS} from '../components/DeviceMockup';
import {fonts} from './fonts';
import {ease, Eyebrow, fadeOut, fadeUp, progress} from './premium';
import {G} from './timeline';
import {ClientAd, ClientMark, ClientWordmark, slideIn} from './ClientBrand';
import {useClient} from './client';

// 8 → 11 s : le logo du client s'assemble en douceur, puis la pub s'affiche dans un téléphone qui pivote lentement.
export const ResultScene: React.FC = () => {
	const frame = useCurrentFrame();
	const r = G.result;
	const {client, palette} = useClient();
	const phone = progress(frame, r.toPhoneAt + 2, 26);
	const ry = interpolate(frame, [r.toPhoneAt, r.duration], [-8, 4], {easing: ease});

	return (
		<AbsoluteFill style={fadeOut(frame, r.duration - 12, 12, 24)}>
			<Eyebrow text={gmotion.steps.result} frame={frame} at={4} style={{position: 'absolute', top: gmotion.safeMargin + 90, left: 0, right: 0}} />
			{/* 1. Assemblage du logo */}
			{frame < r.toPhoneAt + 16 && (
				<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', ...fadeOut(frame, r.toPhoneAt - 2, 16, 40)}}>
					<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40}}>
						<ClientMark size={360} piece={(i) => slideIn(frame, `p${i}`, r.assembleAt + i * 3, 16)} />
						<div style={fadeUp(frame, r.lockAt - 6, 18, 20)}>
							<ClientWordmark maxSize={72} maxWidth={820} color={premium.text} />
						</div>
						<div style={{fontFamily: fonts.body, fontSize: 28, letterSpacing: 4, textTransform: 'uppercase', color: premium.textMuted, ...fadeUp(frame, r.lockAt, 18, 14)}}>{client.sector}</div>
					</div>
				</AbsoluteFill>
			)}
			{/* 2. La pub dans le téléphone */}
			{frame >= r.toPhoneAt && (
				<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', perspective: 2400}}>
					<div style={{opacity: phone, transform: `translateY(${(1 - phone) * 90 + 40}px) rotateY(${ry}deg)`}}>
						<DeviceMockup type="phone" width={560} glowColor="#000000">
							<ClientAd frame={frame - r.toPhoneAt - 6} {...VIEWPORTS.phone} />
						</DeviceMockup>
					</div>
					{/* Ombre douce au sol, aux tons de la marque */}
					<div style={{position: 'absolute', bottom: 210, width: 520, height: 60, borderRadius: '50%', background: `radial-gradient(ellipse, ${palette.primary}33, transparent 70%)`, opacity: phone}} />
				</AbsoluteFill>
			)}
		</AbsoluteFill>
	);
};
