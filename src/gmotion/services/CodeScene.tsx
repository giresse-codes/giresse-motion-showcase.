import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {gmotionServices} from '../../config';
import {premium, premiumSyntax} from '../../theme';
import {tokenizeLine} from '../../lib/syntax';
import {fonts} from '../fonts';
import {card, ease, fadeOut, fadeUp, headline, progress} from '../premium';
import {ServiceTitle} from './ServiceTitle';
import {S} from './timeline';

const code = gmotionServices.code;
const dash = gmotionServices.dashboard;
const PANEL_W = 900;

const formatNumber = (n: number) => n.toLocaleString('fr-FR').replace(/ | /g, ' ');

/** Éditeur sobre : le code s'écrit rapidement, coloration syntaxique monochrome */
const CodeStream: React.FC<{frame: number}> = ({frame}) => {
	const c = S.code;
	const lines = useMemo(() => code.source.split('\n').map((l) => ({raw: l, tokens: tokenizeLine(l, premiumSyntax)})), []);
	const total = lines.reduce((s, l) => s + l.raw.length + 1, 0);
	const shown = Math.floor(interpolate(frame, [c.typeStart, c.typeEnd], [0, total], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease}));
	let remaining = shown;
	let active = 0;
	const visible = lines.map((l, i) => {
		const take = Math.max(0, Math.min(l.raw.length + 1, remaining));
		if (remaining > 0) active = i;
		remaining -= take;
		return Math.min(l.raw.length, take);
	});
	return (
		<div style={{width: PANEL_W, height: 860, overflow: 'hidden', ...card(30)}}>
			<div style={{display: 'flex', alignItems: 'center', height: 70, padding: '0 30px', borderBottom: `1px solid ${premium.line}`, fontFamily: fonts.body, fontSize: 22, color: premium.textMuted}}>
				{code.fileName}
			</div>
			<div style={{padding: '22px 0', fontFamily: fonts.mono}}>
				{lines.map((l, i) => {
					if (i > active + 1) return null;
					let left = visible[i];
					return (
						<div key={i} style={{display: 'flex', height: 36, alignItems: 'center', fontSize: 19, whiteSpace: 'pre', background: i === active && shown < total ? premium.surface : undefined}}>
							<span style={{width: 60, textAlign: 'right', paddingRight: 20, color: premium.textFaint, flexShrink: 0}}>{i + 1}</span>
							<span>
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
								{i === active && shown < total && <span style={{display: 'inline-block', width: 2, height: 24, marginLeft: 2, verticalAlign: 'middle', background: premium.text}} />}
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

/** Tableau de bord sobre : chiffres qui comptent, courbe qui se trace, barres qui s'allongent */
export const Dashboard: React.FC<{frame: number; width?: number}> = ({frame, width = PANEL_W}) => {
	const count = (target: number, delay: number) => Math.round(target * progress(frame, delay, 30));
	const chartW = width - 2 * 30 - 44;
	const chartH = 220;
	const max = Math.max(...SERIES);
	const pts = SERIES.map((v, i) => [(i / (SERIES.length - 1)) * chartW, chartH - (v / max) * chartH * 0.9]);
	const path = pts.map((p, i) => `${i ? 'L' : 'M'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
	const draw = progress(frame, 8, 32);
	const panel: React.CSSProperties = {borderRadius: 20, padding: 22, background: premium.surface, border: `1px solid ${premium.line}`};
	return (
		<div style={{width, padding: 30, display: 'flex', flexDirection: 'column', gap: 18, fontFamily: fonts.body, color: premium.text, ...card(30)}}>
			<div style={{display: 'flex', alignItems: 'baseline'}}>
				<div>
					<div style={{...headline(34)}}>{dash.name}</div>
					<div style={{fontSize: 21, color: premium.textMuted, marginTop: 4}}>{dash.title} · Douala</div>
				</div>
				<div style={{flex: 1}} />
				<div style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 19, color: premium.textMuted}}>
					<span style={{width: 9, height: 9, borderRadius: '50%', background: premium.steel}} />
					En direct
				</div>
			</div>
			<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14}}>
				{dash.kpis.map((k, i) => (
					<div key={k.label} style={{...panel, ...fadeUp(frame, 2 + i * 3, 16, 14)}}>
						<div style={{fontSize: 19, color: premium.textMuted}}>{k.label}</div>
						<div style={{fontWeight: 600, fontSize: 38, marginTop: 6, letterSpacing: -0.5}}>
							{formatNumber(count(k.value, 4 + i * 3))}
							<span style={{fontSize: 19, fontWeight: 400, color: premium.textMuted, marginLeft: 8}}>{k.unit}</span>
						</div>
					</div>
				))}
			</div>
			<div style={{...panel, ...fadeUp(frame, 8, 16, 14)}}>
				<div style={{fontSize: 21, marginBottom: 14, color: premium.textMuted}}>Livraisons par heure</div>
				<svg width={chartW} height={chartH} style={{overflow: 'visible'}}>
					<defs>
						<linearGradient id="dash-fill" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor={premium.steel} stopOpacity={0.28} />
							<stop offset="100%" stopColor={premium.steel} stopOpacity={0} />
						</linearGradient>
						<clipPath id="dash-clip">
							<rect x={0} y={-20} width={chartW * draw} height={chartH + 40} />
						</clipPath>
					</defs>
					{[0.25, 0.5, 0.75].map((g) => (
						<line key={g} x1={0} x2={chartW} y1={chartH * g} y2={chartH * g} stroke={premium.line} />
					))}
					<g clipPath="url(#dash-clip)">
						<path d={`${path} L ${chartW} ${chartH} L 0 ${chartH} Z`} fill="url(#dash-fill)" />
						<path d={path} fill="none" stroke={premium.steel} strokeWidth={3} strokeLinejoin="round" />
					</g>
				</svg>
			</div>
			<div style={{...panel, ...fadeUp(frame, 12, 16, 14)}}>
				{dash.zones.map((z, i) => {
					const g = ZONE_VALUES[i] * progress(frame, 14 + i * 3, 24);
					return (
						<div key={z} style={{marginBottom: i < dash.zones.length - 1 ? 12 : 0}}>
							<div style={{display: 'flex', justifyContent: 'space-between', fontSize: 19, color: premium.textMuted, marginBottom: 6}}>
								<span>{z}</span>
								<span style={{color: premium.text}}>{Math.round(g)}</span>
							</div>
							<div style={{height: 6, borderRadius: 3, background: premium.surfaceStrong}}>
								<div style={{width: `${g}%`, height: '100%', borderRadius: 3, background: premium.steel}} />
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

// 8 → 11 s : APPLICATIONS & CODE — le code s'écrit, puis laisse place au tableau de bord (fondu enchaîné).
export const CodeScene: React.FC = () => {
	const frame = useCurrentFrame();
	const c = S.code;
	const t = gmotionServices.titles.code;
	return (
		<AbsoluteFill style={fadeOut(frame, c.duration - 12, 12, 24)}>
			<ServiceTitle index={t.index} title={t.title} subtitle={t.subtitle} />
			<AbsoluteFill style={{alignItems: 'center', top: 580}}>
				{frame < c.morphAt + 16 && (
					<div style={{position: 'absolute', ...fadeUp(frame, 2, 20, 40), ...(frame >= c.morphAt ? fadeOut(frame, c.morphAt, 14, 30) : {})}}>
						<CodeStream frame={frame} />
					</div>
				)}
				{frame >= c.morphAt && (
					<div style={{position: 'absolute', ...fadeUp(frame, c.morphAt + 4, 18, 30)}}>
						<Dashboard frame={frame - c.morphAt} />
					</div>
				)}
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
