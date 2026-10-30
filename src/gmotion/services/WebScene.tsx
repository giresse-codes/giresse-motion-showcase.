import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {gmotionServices} from '../../config';
import {premium} from '../../theme';
import {DeviceMockup, VIEWPORTS} from '../../components/DeviceMockup';
import {fonts} from '../fonts';
import {ease, fadeOut, fadeUp, headline, progress} from '../premium';
import {ServiceTitle} from './ServiceTitle';
import {S} from './timeline';

const site = gmotionServices.site;

/** Site vitrine fictif (restaurant de Douala) : chaque bloc apparaît en fondu, l'un après l'autre */
export const SiteBuild: React.FC<{frame: number; width: number; height: number; compact?: boolean}> = ({frame, width, height, compact = false}) => {
	const b = S.web.blocks;
	const pad = compact ? 20 : 44;
	const block = (i: number): React.CSSProperties => fadeUp(frame, b[i], 14, 16);
	return (
		<div style={{width, height, overflow: 'hidden', padding: pad, display: 'flex', flexDirection: 'column', gap: compact ? 16 : 26, background: '#0E1F3D', fontFamily: fonts.body, color: premium.text}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 16, height: compact ? 40 : 52, ...block(0)}}>
				<div style={{width: compact ? 26 : 32, height: compact ? 26 : 32, borderRadius: '50%', border: `1.5px solid ${premium.text}`}} />
				<div style={{fontWeight: 600, fontSize: compact ? 17 : 24}}>{site.name}</div>
				<div style={{flex: 1}} />
				{compact ? (
					<div style={{width: 24, height: 12, borderTop: `2px solid ${premium.text}`, borderBottom: `2px solid ${premium.text}`}} />
				) : (
					site.nav.map((n) => (
						<div key={n} style={{fontSize: 19, color: premium.textMuted}}>
							{n}
						</div>
					))
				)}
			</div>
			<div style={{display: 'flex', flexDirection: compact ? 'column' : 'row', gap: compact ? 16 : 32, alignItems: compact ? 'stretch' : 'center'}}>
				<div style={{flex: 1.15, ...block(1)}}>
					<div style={{...headline(compact ? 30 : 50)}}>{site.heroTitle}</div>
					<div style={{marginTop: compact ? 10 : 16, fontSize: compact ? 14 : 20, color: premium.textMuted, lineHeight: 1.5}}>{site.heroText}</div>
					<div style={{display: 'inline-block', marginTop: compact ? 14 : 24, padding: compact ? '10px 18px' : '14px 28px', borderRadius: 999, background: premium.steel, fontWeight: 500, fontSize: compact ? 14 : 19}}>{site.heroCta}</div>
				</div>
				<div style={{flex: 1, height: compact ? 140 : 280, borderRadius: 20, position: 'relative', overflow: 'hidden', background: 'linear-gradient(160deg, #2A4F86, #15305C)', ...block(2)}}>
					{/* Assiette stylisée */}
					<div style={{position: 'absolute', left: '26%', top: '18%', width: '48%', aspectRatio: '1', borderRadius: '50%', background: '#EEF1F5', boxShadow: '0 16px 30px rgba(0,0,0,0.3)'}}>
						<div style={{position: 'absolute', inset: '20%', borderRadius: '50%', background: 'radial-gradient(circle at 40% 40%, #5E7D5A, #3E5A3B)'}} />
					</div>
				</div>
			</div>
			<div style={{display: 'flex', gap: compact ? 12 : 22}}>
				{site.cards.slice(0, compact ? 2 : 3).map((c, i) => (
					<div key={c} style={{flex: 1, borderRadius: 18, overflow: 'hidden', background: premium.surfaceStrong, border: `1px solid ${premium.line}`, ...block(3 + i)}}>
						<div style={{height: compact ? 60 : 100, background: `linear-gradient(160deg, #2A4F86, #1A3766)`}} />
						<div style={{padding: compact ? 10 : 16}}>
							<div style={{fontWeight: 500, fontSize: compact ? 14 : 19}}>{c}</div>
							<div style={{color: premium.textMuted, fontSize: compact ? 12 : 16, marginTop: 4}}>{site.prices[i]}</div>
						</div>
					</div>
				))}
			</div>
			<div style={{height: 1, background: premium.line, ...block(6)}} />
			<div style={{fontSize: compact ? 13 : 18, color: premium.textMuted, textAlign: 'center', ...block(6)}}>Ouvert aujourd’hui · Bonapriso, Douala</div>
		</div>
	);
};

// 5 → 8 s : SITES WEB — le site se construit dans un navigateur qui pivote lentement, puis s'affiche sur téléphone.
export const WebScene: React.FC = () => {
	const frame = useCurrentFrame();
	const w = S.web;
	const ry = interpolate(frame, [0, w.duration], [-10, 3], {easing: ease});
	const phone = progress(frame, w.phoneAt, 24);
	const viewport = {width: 1200, height: 900};
	const t = gmotionServices.titles.web;

	return (
		<AbsoluteFill style={fadeOut(frame, w.duration - 12, 12, 24)}>
			<ServiceTitle index={t.index} title={t.title} subtitle={t.subtitle} />
			<AbsoluteFill style={{perspective: 2400, alignItems: 'center', top: 640}}>
				<div style={{transform: `rotateY(${ry}deg) rotateX(4deg) translateX(${-phone * 60}px)`, ...fadeUp(frame, 2, 22, 40)}}>
					<DeviceMockup type="browser" width={900} viewport={viewport} url={site.url} glowColor="#000000">
						<SiteBuild frame={frame} {...viewport} />
					</DeviceMockup>
				</div>
			</AbsoluteFill>
			{frame >= w.phoneAt && (
				<div style={{position: 'absolute', right: 80, top: 900, opacity: phone, transform: `translateX(${(1 - phone) * 80}px)`}}>
					<DeviceMockup type="phone" width={330} glowColor="#000000">
						<SiteBuild frame={frame + 60} {...VIEWPORTS.phone} compact />
					</DeviceMockup>
				</div>
			)}
		</AbsoluteFill>
	);
};
