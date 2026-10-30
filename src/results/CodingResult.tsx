import React from 'react';
import {interpolate} from 'remotion';
import {theme} from '../theme';
import {clamp} from '../lib/anim';
import {countUp, enterStyle, formatNumber, ResultProps, resultStyle} from './shared';

const SERIES = [12, 18, 15, 24, 22, 31, 28, 36, 34, 45, 41, 52, 49, 60];
const ORDERS = [
	{id: '#4821', zone: 'Akwa', amount: '12 500', status: 'Livrée'},
	{id: '#4822', zone: 'Bonapriso', amount: '8 000', status: 'En route'},
	{id: '#4823', zone: 'Makepe', amount: '15 750', status: 'En route'},
	{id: '#4824', zone: 'Deido', amount: '6 200', status: 'En attente'},
	{id: '#4825', zone: 'Bonamoussadi', amount: '22 000', status: 'Livrée'},
];
const STATUS_COLOR: Record<string, string> = {Livrée: '#22C55E', 'En route': '#38BDF8', 'En attente': '#FACC15'};

const Card: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
	<div
		style={{
			borderRadius: 22,
			padding: 20,
			background: 'linear-gradient(160deg, rgba(255,255,255,0.08), rgba(255,255,255,0.025))',
			border: '1px solid rgba(255,255,255,0.12)',
			boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
			...style,
		}}
	>
		{children}
	</div>
);

// Tableau de bord interactif qui s'anime : KPI, graphiques et commandes en temps réel.
export const CodingResult: React.FC<ResultProps> = ({script, frame, iteration, width, height}) => {
	const {c1, c2, gradient, titleScale} = resultStyle(script, iteration);
	const compact = width < 800;
	const {client} = script;
	const pad = compact ? 18 : 30;

	const kpis = [
		{label: 'Chiffre d’affaires', value: `${formatNumber(countUp(frame, 10, 40, 4875000))}`, unit: 'FCFA', trend: '+24 %'},
		{label: 'Commandes', value: formatNumber(countUp(frame, 12, 40, 1284)), unit: '', trend: '+18 %'},
		{label: 'Livreurs actifs', value: String(countUp(frame, 14, 40, 47)), unit: '', trend: '+6'},
		{label: 'Taux de livraison', value: `${countUp(frame, 16, 40, 97)}`, unit: '%', trend: '+3 pts'},
	].slice(0, compact ? 2 : 4);

	// Graphique en ligne qui se dessine
	const chartW = compact ? width - pad * 2 - 40 : ((width - 230 - pad * 2 - 18) * 1.6) / 2.6 - 40;
	const chartH = compact ? 150 : 250;
	const max = Math.max(...SERIES);
	const pts = SERIES.map((v, i) => [(i / (SERIES.length - 1)) * chartW, chartH - (v / max) * chartH * 0.9]);
	const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
	const draw = interpolate(frame, [18, 60], [0, 1], {...clamp, easing: (t) => 1 - Math.pow(1 - t, 2)});
	const liveIdx = Math.min(SERIES.length - 1, Math.floor(draw * (SERIES.length - 1)));

	const zones = client.details;
	const zoneValues = [82, 64, 48, 71, 39];
	const visibleOrders = Math.min(ORDERS.length, Math.max(0, Math.floor((frame - 24) / 7)));

	return (
		<div
			style={{
				width,
				height,
				display: 'flex',
				overflow: 'hidden',
				background: `radial-gradient(ellipse at 100% 0%, ${c1}33, transparent 50%), #080A17`,
				fontFamily: theme.fonts.body,
				color: '#fff',
			}}
		>
			{!compact && (
				<div style={{width: 230, padding: 26, borderRight: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', ...enterStyle(frame, 0, 0)}}>
					<div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40}}>
						<div style={{width: 36, height: 36, borderRadius: 10, background: gradient, boxShadow: `0 0 20px ${c1}`}} />
						<div style={{fontFamily: theme.fonts.display, fontWeight: 800, fontSize: 19}}>DX Pro</div>
					</div>
					{['Vue d’ensemble', 'Commandes', 'Livreurs', 'Zones', 'Clients', 'Paramètres'].map((l, i) => (
						<div
							key={l}
							style={{
								padding: '12px 14px',
								borderRadius: 12,
								marginBottom: 6,
								fontSize: 16,
								fontWeight: i === 0 ? 700 : 500,
								color: i === 0 ? '#fff' : theme.colors.textMuted,
								background: i === 0 ? `${c1}33` : 'transparent',
								borderLeft: i === 0 ? `3px solid ${c1}` : '3px solid transparent',
							}}
						>
							{l}
						</div>
					))}
				</div>
			)}
			<div style={{flex: 1, padding: pad, display: 'flex', flexDirection: 'column', gap: compact ? 14 : 20}}>
				{/* En-tête */}
				<div style={{display: 'flex', alignItems: 'center', gap: 16, ...enterStyle(frame, 2, -20)}}>
					<div>
						<div style={{fontFamily: theme.fonts.display, fontWeight: 800, fontSize: (compact ? 24 : 34) * titleScale, lineHeight: 1.1}}>
							<span style={{background: gradient, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>{client.name}</span>
						</div>
						<div style={{color: theme.colors.textMuted, fontSize: compact ? 13 : 16}}>{client.tagline} · Douala</div>
					</div>
					<div style={{flex: 1}} />
					<div style={{display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 999, background: 'rgba(34,197,94,0.15)', color: '#4ADE80', fontWeight: 700, fontSize: compact ? 12 : 15}}>
						<span style={{width: 10, height: 10, borderRadius: '50%', background: '#22C55E', boxShadow: `0 0 ${6 + 6 * Math.abs(Math.sin(frame / 6))}px #22C55E`}} />
						EN DIRECT
					</div>
				</div>
				{/* KPI */}
				<div style={{display: 'flex', gap: compact ? 12 : 18}}>
					{kpis.map((k, i) => (
						<Card key={k.label} style={{flex: 1, padding: compact ? 14 : 20, ...enterStyle(frame, 6 + i * 4, 40)}}>
							<div style={{color: theme.colors.textMuted, fontSize: compact ? 12 : 15}}>{k.label}</div>
							<div style={{fontFamily: theme.fonts.display, fontWeight: 800, fontSize: compact ? 22 : 32, marginTop: 6}}>
								{k.value}
								<span style={{fontSize: compact ? 13 : 17, color: theme.colors.textMuted, marginLeft: 6}}>{k.unit}</span>
							</div>
							<div style={{marginTop: 6, fontSize: compact ? 12 : 14, fontWeight: 700, color: '#4ADE80'}}>▲ {k.trend}</div>
						</Card>
					))}
				</div>
				{/* Graphiques */}
				<div style={{display: 'flex', gap: 18, flexDirection: compact ? 'column' : 'row'}}>
					<Card style={{flex: 1.6, ...enterStyle(frame, 14, 50)}}>
						<div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 12}}>
							<div style={{fontWeight: 700, fontSize: compact ? 15 : 18}}>Commandes par heure</div>
							<div style={{color: theme.colors.textMuted, fontSize: compact ? 12 : 14}}>Aujourd’hui</div>
						</div>
						<svg width={chartW} height={chartH} style={{overflow: 'visible'}}>
							<defs>
								<linearGradient id="dx-line" x1="0" x2="1">
									<stop offset="0%" stopColor={c1} />
									<stop offset="100%" stopColor={c2} />
								</linearGradient>
								<linearGradient id="dx-fill" x1="0" y1="0" x2="0" y2="1">
									<stop offset="0%" stopColor={c1} stopOpacity={0.45} />
									<stop offset="100%" stopColor={c1} stopOpacity={0} />
								</linearGradient>
								<clipPath id="dx-clip">
									<rect x={0} y={-20} width={chartW * draw} height={chartH + 40} />
								</clipPath>
							</defs>
							{[0.25, 0.5, 0.75, 1].map((g) => (
								<line key={g} x1={0} x2={chartW} y1={chartH * g} y2={chartH * g} stroke="rgba(255,255,255,0.07)" />
							))}
							<g clipPath="url(#dx-clip)">
								<path d={`${path} L ${chartW} ${chartH} L 0 ${chartH} Z`} fill="url(#dx-fill)" />
								<path d={path} fill="none" stroke="url(#dx-line)" strokeWidth={4} strokeLinejoin="round" style={{filter: `drop-shadow(0 0 8px ${c1})`}} />
							</g>
							{draw > 0 && <circle cx={pts[liveIdx][0]} cy={pts[liveIdx][1]} r={8} fill="#fff" stroke={c2} strokeWidth={4} />}
						</svg>
					</Card>
					<Card style={{flex: 1, ...enterStyle(frame, 18, 50)}}>
						<div style={{fontWeight: 700, fontSize: compact ? 15 : 18, marginBottom: 14}}>Livraisons par quartier</div>
						{zones.slice(0, compact ? 3 : 5).map((z, i) => {
							const grow = interpolate(frame, [24 + i * 3, 50 + i * 3], [0, zoneValues[i]], {...clamp, easing: (t) => 1 - Math.pow(1 - t, 3)});
							return (
								<div key={z} style={{marginBottom: compact ? 8 : 12}}>
									<div style={{display: 'flex', justifyContent: 'space-between', fontSize: compact ? 12 : 14, color: theme.colors.textMuted, marginBottom: 5}}>
										<span>{z}</span>
										<span style={{color: '#fff', fontWeight: 700}}>{Math.round(grow)}</span>
									</div>
									<div style={{height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.07)'}}>
										<div style={{width: `${grow}%`, height: '100%', borderRadius: 5, background: gradient, boxShadow: `0 0 12px ${c1}`}} />
									</div>
								</div>
							);
						})}
					</Card>
				</div>
				{/* Commandes en temps réel */}
				{!compact && (
					<Card style={{...enterStyle(frame, 22, 50), padding: 16}}>
						<div style={{display: 'flex', gap: 10, flexDirection: 'column'}}>
							{ORDERS.slice(0, 3).map((o, i) => {
								const shown = i < visibleOrders;
								return (
									<div key={o.id} style={{display: 'flex', alignItems: 'center', gap: 20, fontSize: 15, opacity: shown ? 1 : 0, transform: `translateX(${shown ? 0 : -30}px)`}}>
										<span style={{fontFamily: theme.fonts.mono, color: theme.colors.textMuted, width: 70}}>{o.id}</span>
										<span style={{flex: 1, fontWeight: 600}}>{o.zone}</span>
										<span style={{width: 130, fontWeight: 700}}>{o.amount} FCFA</span>
										<span style={{padding: '4px 12px', borderRadius: 999, fontSize: 13, fontWeight: 700, color: STATUS_COLOR[o.status], background: `${STATUS_COLOR[o.status]}22`}}>{o.status}</span>
									</div>
								);
							})}
						</div>
					</Card>
				)}
			</div>
		</div>
	);
};
