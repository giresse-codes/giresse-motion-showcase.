import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {gmotionServices} from '../../config';
import {mintSyntax, serviceColors, videoPalette} from '../../theme';
import {clamp, springs} from '../../lib/anim';
import {tokenizeLine} from '../../lib/syntax';
import {fonts} from '../fonts';
import {ServiceTitle} from './ServiceTitle';
import {S} from './timeline';

const {main, second} = serviceColors.code;
const code = gmotionServices.code;
const dash = gmotionServices.dashboard;
const PANEL_W = 960;

const formatFCFA = (n: number) => n.toLocaleString('fr-FR').replace(/ | /g, ' ');

/** Éditeur : le code défile très vite, coloration syntaxique et ligne active en néon */
const CodeStream: React.FC<{frame: number}> = ({frame}) => {
	const c = S.code;
	const lines = useMemo(() => code.source.split('\n').map((l) => ({raw: l, tokens: tokenizeLine(l, mintSyntax)})), []);
	const total = lines.reduce((s, l) => s + l.raw.length + 1, 0);
	const shown = Math.floor(interpolate(frame, [c.typeStart, c.typeEnd], [0, total], {...clamp, easing: (t) => Math.pow(t, 1.25)}));
	let remaining = shown;
	let active = 0;
	const visible = lines.map((l, i) => {
		const take = Math.max(0, Math.min(l.raw.length + 1, remaining));
		if (remaining > 0) active = i;
		remaining -= take;
		return Math.min(l.raw.length, take);
	});
	const lh = 40;
	const scroll = Math.max(0, (active - 13) * lh);
	return (
		<div
			style={{
				width: PANEL_W,
				height: 900,
				borderRadius: 30,
				overflow: 'hidden',
				background: 'linear-gradient(160deg, rgba(6,40,30,0.92), rgba(8,12,12,0.96))',
				border: `1.5px solid ${main}55`,
				boxShadow: `0 50px 120px rgba(0,0,0,0.7), 0 0 90px ${main}44`,
				fontFamily: 'JetBrains Mono, monospace',
			}}
		>
			<div style={{display: 'flex', alignItems: 'center', gap: 12, height: 64, padding: '0 24px', borderBottom: `1px solid ${main}33`}}>
				{['#FF5F57', '#FEBC2E', '#28C840'].map((col) => (
					<div key={col} style={{width: 16, height: 16, borderRadius: '50%', background: col}} />
				))}
				<div style={{marginLeft: 14, padding: '6px 18px', borderRadius: 10, background: 'rgba(255,255,255,0.07)', color: videoPalette.white, fontSize: 22, borderBottom: `2px solid ${main}`}}>{code.fileName}</div>
				<div style={{flex: 1}} />
				<div style={{color: main, fontSize: 20}}>● {Math.round((shown / total) * 100)} %</div>
			</div>
			<div style={{transform: `translateY(${-scroll + 14}px)`}}>
				{lines.map((l, i) => {
					if (i > active + 1) return null;
					let left = visible[i];
					const glow = interpolate(active - i, [0, 3], [1, 0], clamp) * (shown < total ? 1 : 0);
					return (
						<div
							key={i}
							style={{
								display: 'flex',
								height: lh,
								alignItems: 'center',
								fontSize: 21,
								whiteSpace: 'pre',
								background: glow > 0 ? `linear-gradient(90deg, rgba(46,230,166,${0.18 * glow}), transparent 70%)` : undefined,
								boxShadow: i === active && shown < total ? `inset 4px 0 0 ${main}` : undefined,
							}}
						>
							<span style={{width: 58, textAlign: 'right', paddingRight: 18, color: i === active ? main : '#4F6F64', flexShrink: 0}}>{i + 1}</span>
							<span style={{textShadow: glow > 0 ? `0 0 ${12 * glow}px rgba(46,230,166,${0.8 * glow})` : undefined}}>
								{l.tokens.map((tok, j) => {
									if (left <= 0) return null;
									const text = tok.text.slice(0, left);
									left -= tok.text.length;
									return (
										<span key={j} style={{color: tok.color}}>
											{text}
										</span>
									);
								})}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
};

const SERIES = [14, 22, 18, 30, 27, 38, 34, 46, 43, 55, 52, 64];
const ZONE_VALUES = [86, 64, 52, 71];

/** Tableau de bord interactif (menthe) : KPI qui comptent, courbe qui se dessine, barres qui poussent */
export const MintDashboard: React.FC<{frame: number; width?: number}> = ({frame, width = PANEL_W}) => {
	const s = (delay: number) => spring({frame: frame - delay, fps: 30, config: springs.snappy});
	const count = (target: number, delay: number) => Math.round(interpolate(frame, [delay, delay + 30], [0, target], {...clamp, easing: (t) => 1 - Math.pow(1 - t, 3)}));
	const chartW = width - 2 * 28 - 40;
	const chartH = 230;
	const max = Math.max(...SERIES);
	const pts = SERIES.map((v, i) => [(i / (SERIES.length - 1)) * chartW, chartH - (v / max) * chartH * 0.9]);
	const path = pts.map((p, i) => `${i ? 'L' : 'M'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
	const draw = interpolate(frame, [10, 40], [0, 1], {...clamp, easing: (t) => 1 - Math.pow(1 - t, 2)});
	const idx = Math.min(SERIES.length - 1, Math.floor(draw * (SERIES.length - 1)));
	const card: React.CSSProperties = {borderRadius: 22, padding: 22, background: 'linear-gradient(160deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))', border: `1px solid ${main}33`};

	return (
		<div
			style={{
				width,
				padding: 28,
				borderRadius: 30,
				display: 'flex',
				flexDirection: 'column',
				gap: 18,
				background: `radial-gradient(ellipse at 100% 0%, ${main}33, transparent 55%), #08110E`,
				border: `1.5px solid ${main}66`,
				boxShadow: `0 50px 120px rgba(0,0,0,0.7), 0 0 100px ${main}44`,
				fontFamily: fonts.body,
				color: videoPalette.white,
			}}
		>
			<div style={{display: 'flex', alignItems: 'center'}}>
				<div>
					<div style={{fontFamily: fonts.display, fontWeight: 900, fontSize: 38, color: main}}>{dash.name}</div>
					<div style={{fontSize: 22, color: videoPalette.muted}}>{dash.title} · Douala</div>
				</div>
				<div style={{flex: 1}} />
				<div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', borderRadius: 999, background: `${main}22`, color: main, fontWeight: 800, fontSize: 20}}>
					<span style={{width: 12, height: 12, borderRadius: '50%', background: main, boxShadow: `0 0 ${6 + 8 * Math.abs(Math.sin(frame / 6))}px ${main}`}} />
					EN DIRECT
				</div>
			</div>
			<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
				{dash.kpis.map((k, i) => (
					<div key={k.label} style={{...card, opacity: Math.min(1, s(2 + i * 3) * 1.4), transform: `translateY(${(1 - s(2 + i * 3)) * 40}px)`}}>
						<div style={{fontSize: 20, color: videoPalette.muted}}>{k.label}</div>
						<div style={{fontFamily: fonts.display, fontWeight: 900, fontSize: 40, marginTop: 4}}>
							{formatFCFA(count(k.value, 4 + i * 3))}
							<span style={{fontSize: 20, color: videoPalette.muted, marginLeft: 8}}>{k.unit}</span>
						</div>
						<div style={{fontSize: 18, fontWeight: 800, color: i === 0 ? videoPalette.yellow : main}}>▲ +{12 + i * 4} %</div>
					</div>
				))}
			</div>
			<div style={{...card, opacity: Math.min(1, s(8) * 1.4)}}>
				<div style={{fontWeight: 700, fontSize: 22, marginBottom: 12}}>Livraisons par heure</div>
				<svg width={chartW} height={chartH} style={{overflow: 'visible'}}>
					<defs>
						<linearGradient id="mint-fill" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor={main} stopOpacity={0.45} />
							<stop offset="100%" stopColor={main} stopOpacity={0} />
						</linearGradient>
						<clipPath id="mint-clip">
							<rect x={0} y={-20} width={chartW * draw} height={chartH + 40} />
						</clipPath>
					</defs>
					{[0.25, 0.5, 0.75].map((g) => (
						<line key={g} x1={0} x2={chartW} y1={chartH * g} y2={chartH * g} stroke="rgba(255,255,255,0.07)" />
					))}
					<g clipPath="url(#mint-clip)">
						<path d={`${path} L ${chartW} ${chartH} L 0 ${chartH} Z`} fill="url(#mint-fill)" />
						<path d={path} fill="none" stroke={main} strokeWidth={5} strokeLinejoin="round" style={{filter: `drop-shadow(0 0 8px ${main})`}} />
					</g>
					{draw > 0 && <circle cx={pts[idx][0]} cy={pts[idx][1]} r={9} fill="#fff" stroke={videoPalette.yellow} strokeWidth={4} />}
				</svg>
			</div>
			<div style={{...card, opacity: Math.min(1, s(12) * 1.4)}}>
				{dash.zones.map((z, i) => {
					const g = interpolate(frame, [14 + i * 3, 38 + i * 3], [0, ZONE_VALUES[i]], {...clamp, easing: (t) => 1 - Math.pow(1 - t, 3)});
					return (
						<div key={z} style={{marginBottom: i < dash.zones.length - 1 ? 12 : 0}}>
							<div style={{display: 'flex', justifyContent: 'space-between', fontSize: 20, color: videoPalette.muted, marginBottom: 6}}>
								<span>{z}</span>
								<span style={{color: '#fff', fontWeight: 800}}>{Math.round(g)}</span>
							</div>
							<div style={{height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.07)'}}>
								<div style={{width: `${g}%`, height: '100%', borderRadius: 6, background: `linear-gradient(90deg, ${second}, ${main})`, boxShadow: `0 0 12px ${main}`}} />
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

// 8 → 11 s : PROGRAMMATION (vert menthe) — le code se transforme en tableau de bord.
export const CodeScene: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const c = S.code;
	const enter = spring({frame, fps, config: {damping: 15, stiffness: 110}});
	const morph = spring({frame: frame - c.morphAt, fps, config: {damping: 16, mass: 0.8, stiffness: 100}});
	const exit = spring({frame: frame - (c.duration - 10), fps, config: springs.snappy});
	// Balayage lumineux qui « transforme » le code
	const scan = interpolate(frame, [c.morphAt - 4, c.morphAt + 14], [-10, 110], clamp);
	const t = gmotionServices.titles.code;

	return (
		<AbsoluteFill style={{opacity: 1 - exit, transform: `scale(${1 - exit * 0.2})`, filter: exit > 0.01 ? `blur(${exit * 14}px)` : undefined}}>
			<AbsoluteFill style={{alignItems: 'center', top: 470, perspective: 1600}}>
				{morph < 0.98 && (
					<div
						style={{
							position: 'absolute',
							transform: `translateY(${(1 - enter) * 700}px) rotateX(${(1 - enter) * 30 + morph * 50}deg) scale(${(0.9 + 0.1 * enter) * (1 - morph * 0.4)})`,
							opacity: Math.min(1, enter * 1.6) * (1 - morph),
							filter: morph > 0.01 ? `blur(${morph * 18}px)` : undefined,
						}}
					>
						<CodeStream frame={frame} />
					</div>
				)}
				{frame >= c.morphAt - 2 && (
					<div
						style={{
							position: 'absolute',
							transform: `rotateX(${(1 - morph) * -40}deg) scale(${0.6 + 0.4 * morph})`,
							opacity: Math.min(1, morph * 1.5),
							filter: morph < 0.99 ? `blur(${(1 - morph) * 18}px)` : undefined,
						}}
					>
						<MintDashboard frame={frame - c.morphAt} />
					</div>
				)}
			</AbsoluteFill>
			{scan > -10 && scan < 110 && (
				<div
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						top: `${20 + scan * 0.7}%`,
						height: 14,
						background: `linear-gradient(90deg, transparent, ${main}, #fff, ${main}, transparent)`,
						boxShadow: `0 0 50px 16px ${main}88`,
						opacity: 0.9,
					}}
				/>
			)}
			<ServiceTitle index={t.index} title={t.title} subtitle={t.subtitle} main={main} second={second} />
		</AbsoluteFill>
	);
};
