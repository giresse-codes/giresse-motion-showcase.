import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {gmotionServices} from '../../config';
import {serviceColors, videoPalette} from '../../theme';
import {clamp, springs} from '../../lib/anim';
import {DeviceMockup, VIEWPORTS} from '../../components/DeviceMockup';
import {GlitchTransition} from '../../components/GlitchTransition';
import {fonts} from '../fonts';
import {ServiceTitle} from './ServiceTitle';
import {S} from './timeline';

const {main, second} = serviceColors.web;
const site = gmotionServices.site;

/** Un bloc du site : squelette en pointillés, puis il « se pose » avec un ressort et un liseré néon */
const Block: React.FC<{frame: number; at: number; style?: React.CSSProperties; children: React.ReactNode}> = ({frame, at, style, children}) => {
	const p = spring({frame: frame - at, fps: 30, config: springs.bouncy});
	const flash = interpolate(frame - at, [0, 3, 14], [0, 1, 0], clamp);
	const built = frame >= at;
	return (
		<div style={{position: 'relative', ...style}}>
			{/* Squelette avant construction */}
			<div style={{position: 'absolute', inset: 0, borderRadius: 18, border: `2px dashed ${main}88`, opacity: built ? 1 - p : 0.9}} />
			<div
				style={{
					height: '100%',
					transform: `scale(${built ? 0.85 + 0.15 * p : 0.85}) translateY(${built ? (1 - p) * 30 : 30}px)`,
					opacity: built ? Math.min(1, p * 1.4) : 0,
					borderRadius: 18,
					boxShadow: flash > 0 ? `0 0 ${40 * flash}px ${second}, inset 0 0 0 ${3 * flash}px ${second}` : undefined,
				}}
			>
				{children}
			</div>
		</div>
	);
};

/** Site vitrine fictif (restaurant de Douala), construit bloc par bloc */
export const SiteBuild: React.FC<{frame: number; width: number; height: number; compact?: boolean}> = ({frame, width, height, compact = false}) => {
	const b = S.web.blocks;
	const pad = compact ? 18 : 40;
	const gradient = `linear-gradient(135deg, ${main}, ${second})`;
	return (
		<div
			style={{
				width,
				height,
				overflow: 'hidden',
				padding: pad,
				display: 'flex',
				flexDirection: 'column',
				gap: compact ? 14 : 22,
				background: `radial-gradient(ellipse at 85% 0%, ${second}33, transparent 55%), #0D0814`,
				fontFamily: fonts.body,
				color: videoPalette.white,
			}}
		>
			<Block frame={frame} at={b[0]} style={{height: compact ? 44 : 60}}>
				<div style={{display: 'flex', alignItems: 'center', height: '100%', gap: 18}}>
					<div style={{width: compact ? 30 : 40, height: compact ? 30 : 40, borderRadius: 12, background: gradient}} />
					<div style={{fontFamily: fonts.display, fontWeight: 800, fontSize: compact ? 18 : 26}}>{site.name}</div>
					<div style={{flex: 1}} />
					{compact ? (
						<div style={{width: 28, height: 18, borderTop: '3px solid #fff', borderBottom: '3px solid #fff'}} />
					) : (
						site.nav.map((n) => (
							<div key={n} style={{fontSize: 20, color: videoPalette.muted, fontWeight: 600}}>
								{n}
							</div>
						))
					)}
				</div>
			</Block>
			<div style={{display: 'flex', flexDirection: compact ? 'column' : 'row', gap: compact ? 14 : 26}}>
				<Block frame={frame} at={b[1]} style={{flex: 1.2}}>
					<div style={{padding: compact ? 4 : 10}}>
						<div style={{fontFamily: fonts.display, fontWeight: 900, fontSize: compact ? 28 : 54, lineHeight: 1.05, letterSpacing: -1}}>
							{site.heroTitle.split(' ').map((w, i, arr) => (
								<span key={i} style={i >= arr.length - 1 ? {background: gradient, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'} : undefined}>
									{w}{' '}
								</span>
							))}
						</div>
						<div style={{marginTop: compact ? 8 : 16, fontSize: compact ? 14 : 21, color: videoPalette.muted, lineHeight: 1.45}}>{site.heroText}</div>
						<div style={{display: 'inline-block', marginTop: compact ? 12 : 22, padding: compact ? '10px 18px' : '14px 28px', borderRadius: 999, background: gradient, fontWeight: 800, fontSize: compact ? 14 : 20}}>
							{site.heroCta} →
						</div>
					</div>
				</Block>
				<Block frame={frame} at={b[2]} style={{flex: 1, height: compact ? 150 : 300}}>
					<div
						style={{
							height: '100%',
							borderRadius: 18,
							background: `radial-gradient(circle at 70% 30%, ${videoPalette.yellow}, ${videoPalette.orange} 30%, ${second} 65%, ${main})`,
							position: 'relative',
							overflow: 'hidden',
						}}
					>
						{/* Assiette stylisée */}
						<div style={{position: 'absolute', left: '22%', top: '22%', width: '56%', aspectRatio: '1', borderRadius: '50%', background: '#FFF6EA', boxShadow: '0 20px 40px rgba(0,0,0,0.35)'}}>
							<div style={{position: 'absolute', inset: '18%', borderRadius: '50%', background: 'radial-gradient(circle at 40% 40%, #3F7D2C, #24501A)'}} />
						</div>
					</div>
				</Block>
			</div>
			<div style={{display: 'flex', gap: compact ? 10 : 20}}>
				{site.cards.slice(0, compact ? 2 : 3).map((c, i) => (
					<Block key={c} frame={frame} at={b[3 + i]} style={{flex: 1}}>
						<div style={{borderRadius: 18, overflow: 'hidden', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)'}}>
							<div style={{height: compact ? 64 : 110, background: `linear-gradient(${120 + i * 50}deg, ${main}, ${second})`}} />
							<div style={{padding: compact ? 10 : 16}}>
								<div style={{fontWeight: 700, fontSize: compact ? 14 : 20}}>{c}</div>
								<div style={{color: videoPalette.yellow, fontWeight: 700, fontSize: compact ? 12 : 17, marginTop: 4}}>{site.prices[i]}</div>
							</div>
						</div>
					</Block>
				))}
			</div>
			<Block frame={frame} at={b[6]} style={{height: compact ? 48 : 64}}>
				<div style={{height: '100%', borderRadius: 18, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontWeight: 700, fontSize: compact ? 14 : 20}}>
					<span style={{color: videoPalette.mint}}>●</span> Ouvert aujourd’hui · Bonapriso, Douala
				</div>
			</Block>
		</div>
	);
};

// 5 → 8 s : DÉVELOPPEMENT WEB (violet / magenta).
export const WebScene: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const w = S.web;
	const enter = spring({frame: frame - 2, fps, config: {damping: 15, mass: 0.9, stiffness: 90}});
	const toPhone = spring({frame: frame - w.phoneAt, fps, config: springs.camera});
	const phoneIn = spring({frame: frame - w.phoneAt, fps, config: {damping: 14, stiffness: 90}});
	const exit = spring({frame: frame - (w.duration - 10), fps, config: springs.snappy});
	const ry = interpolate(frame, [0, w.duration], [-26, 16]) + Math.sin(frame / 14) * 3;
	const viewport = {width: 1200, height: 900};
	const t = gmotionServices.titles.web;

	return (
		<GlitchTransition at={-2} duration={12} slices={3} flashColors={[videoPalette.magenta, videoPalette.violet]}>
			<AbsoluteFill style={{opacity: 1 - exit, transform: `scale(${1 - exit * 0.2})`, filter: exit > 0.01 ? `blur(${exit * 14}px)` : undefined}}>
				<AbsoluteFill style={{perspective: 1800, alignItems: 'center', top: 520, justifyContent: 'flex-start'}}>
					<div
						style={{
							transformStyle: 'preserve-3d',
							transform: `translateY(${(1 - enter) * 900 + toPhone * -40}px) translateX(${toPhone * -150}px) translateZ(${toPhone * -260}px) rotateY(${ry}deg) rotateX(${8 + (1 - enter) * 30}deg) scale(${0.9 + 0.1 * enter})`,
							opacity: Math.min(1, enter * 1.6) * (1 - toPhone * 0.35),
						}}
					>
						<DeviceMockup type="browser" width={940} viewport={viewport} url={site.url} glowColor={second}>
							<SiteBuild frame={frame} {...viewport} />
						</DeviceMockup>
					</div>
				</AbsoluteFill>
				{frame >= w.phoneAt - 2 && (
					<AbsoluteFill style={{perspective: 1600}}>
						<div
							style={{
								position: 'absolute',
								right: 70,
								top: 820,
								transform: `translateY(${(1 - phoneIn) * 1200}px) rotateY(${-14 + Math.sin(frame / 16) * 5}deg) rotateZ(${(1 - phoneIn) * 16 + 3}deg)`,
							}}
						>
							<DeviceMockup type="phone" width={380} glowColor={main}>
								<SiteBuild frame={frame + 30} {...VIEWPORTS.phone} compact />
							</DeviceMockup>
						</div>
					</AbsoluteFill>
				)}
			</AbsoluteFill>
			<ServiceTitle index={t.index} title={t.title} subtitle={t.subtitle} main={main} second={second} />
		</GlitchTransition>
	);
};
