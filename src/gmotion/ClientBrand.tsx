import React from 'react';
import {random} from 'remotion';
import {ClientPalette} from '../theme';
import {fonts} from './fonts';
import {useClient} from './client';
import {fadeUp, progress} from './premium';

export type PieceTransform = {x: number; y: number; rotate: number; scale: number; opacity: number};
const IDENTITY: PieceTransform = {x: 0, y: 0, rotate: 0, scale: 1, opacity: 1};

/** Une pièce glisse doucement depuis un léger décalage jusqu'à sa place (ease-in-out, sans rebond) */
export const slideIn = (frame: number, key: string, delay: number, distance: number, duration = 22): PieceTransform => {
	const p = progress(frame, delay, duration);
	const angle = random(`ang-${key}`) * Math.PI * 2;
	return {
		x: Math.cos(angle) * distance * (1 - p),
		y: Math.sin(angle) * distance * (1 - p),
		rotate: (random(`rot-${key}`) - 0.5) * 24 * (1 - p),
		scale: 0.92 + 0.08 * p,
		opacity: p,
	};
};

type Piece = {d: string; cx: number; cy: number};

/** Les 6 pièces du logo client (repère 0..100) : triangles d'un hexagone ou parts d'un disque */
const makePieces = (shape: 'hexagon' | 'round'): Piece[] =>
	new Array(6).fill(0).map((_, i) => {
		const a1 = ((-90 + 60 * i) * Math.PI) / 180;
		const a2 = ((-90 + 60 * (i + 1)) * Math.PI) / 180;
		const am = (a1 + a2) / 2;
		const cx = 50 + 26 * Math.cos(am);
		const cy = 50 + 26 * Math.sin(am);
		const shrink = (x: number, y: number) => [cx + (x - cx) * 0.92, cy + (y - cy) * 0.92].map((v) => v.toFixed(2)).join(' ');
		const p1 = [50 + 46 * Math.cos(a1), 50 + 46 * Math.sin(a1)];
		const p2 = [50 + 46 * Math.cos(a2), 50 + 46 * Math.sin(a2)];
		const d =
			shape === 'hexagon'
				? `M ${shrink(50, 50)} L ${shrink(p1[0], p1[1])} L ${shrink(p2[0], p2[1])} Z`
				: `M ${shrink(50, 50)} L ${shrink(p1[0], p1[1])} A ${46 * 0.92} ${46 * 0.92} 0 0 1 ${shrink(p2[0], p2[1])} Z`;
		return {d, cx, cy};
	});

const PIECES = {hexagon: makePieces('hexagon'), round: makePieces('round')};

const fills = (p: ClientPalette) => [p.primary, p.secondary, p.light, p.accent, p.secondary, p.primary];

// Logo du client fictif, en 6 pièces qui peuvent glisser indépendamment.
export const ClientMark: React.FC<{
	size: number;
	/** Progression du tracé en mode fil de fer (0 → 1) */
	progress?: number;
	wireframe?: boolean;
	wireColor?: string;
	piece?: (i: number) => PieceTransform;
}> = ({size, progress: drawn = 1, wireframe = false, wireColor, piece = () => IDENTITY}) => {
	const {client, palette} = useClient();
	const pieces = PIECES[client.mark];
	const colors = fills(palette);
	const stroke = wireColor ?? palette.primary;
	return (
		<svg viewBox="0 0 100 100" width={size} height={size} style={{overflow: 'visible'}}>
			{pieces.map((p, i) => {
				const t = piece(i);
				const visible = wireframe ? Math.max(0, Math.min(1, (drawn - i / 7) * 4)) : 1;
				return (
					<g
						key={i}
						opacity={t.opacity}
						transform={`translate(${t.x} ${t.y}) rotate(${t.rotate} ${p.cx} ${p.cy}) translate(${p.cx} ${p.cy}) scale(${t.scale}) translate(${-p.cx} ${-p.cy})`}
					>
						<path
							d={p.d}
							fill={wireframe ? 'none' : colors[i]}
							stroke={wireframe ? stroke : 'none'}
							strokeWidth={wireframe ? 0.8 : 0}
							strokeLinejoin="round"
							pathLength={1}
							strokeDasharray={wireframe ? 1 : undefined}
							strokeDashoffset={wireframe ? 1 - visible : undefined}
						/>
					</g>
				);
			})}
			<circle cx={50} cy={50} r={wireframe ? 2 * drawn : 4} fill={wireframe ? stroke : palette.light} />
		</svg>
	);
};

// Nom du client en capitales espacées ; chaque lettre peut glisser indépendamment.
export const ClientWordmark: React.FC<{maxSize: number; maxWidth: number; color?: string; piece?: (i: number) => PieceTransform}> = ({maxSize, maxWidth, color, piece = () => IDENTITY}) => {
	const {client, palette} = useClient();
	const letters = client.name.toUpperCase().split('');
	const size = Math.min(maxSize, maxWidth / (letters.length * 0.9));
	return (
		<div style={{display: 'flex', fontFamily: fonts.display, fontWeight: 600, fontSize: size, lineHeight: 1, letterSpacing: size * 0.16, color: color ?? palette.light, whiteSpace: 'pre'}}>
			{letters.map((ch, i) => {
				const t = piece(i);
				return (
					<span key={i} style={{display: 'inline-block', transform: `translate(${t.x}px, ${t.y}px)`, opacity: t.opacity}}>
						{ch}
					</span>
				);
			})}
		</div>
	);
};

// Canette stylisée aux couleurs de la marque
const Can: React.FC<{width: number; dull?: boolean}> = ({width, dull = false}) => {
	const {client, palette} = useClient();
	return (
		<div
			style={{
				width,
				height: width * 1.85,
				borderRadius: `${width * 0.12}px ${width * 0.12}px ${width * 0.1}px ${width * 0.1}px`,
				position: 'relative',
				overflow: 'hidden',
				background: dull
					? 'linear-gradient(90deg, #8c8c8c, #b5b5b5 45%, #8c8c8c)'
					: `linear-gradient(90deg, ${palette.accent}, ${palette.primary} 40%, ${palette.secondary} 60%, ${palette.accent})`,
				boxShadow: dull ? 'none' : `0 ${width * 0.12}px ${width * 0.3}px rgba(0,0,0,0.25)`,
			}}
		>
			<div style={{position: 'absolute', top: 0, left: 0, right: 0, height: width * 0.1, background: dull ? '#777' : 'linear-gradient(90deg, #9aa09b, #eef0ee, #9aa09b)'}} />
			<div style={{position: 'absolute', top: '32%', left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: width * 0.05}}>
				{dull ? (
					<div style={{fontFamily: 'Arial, sans-serif', fontSize: width * 0.24, color: '#333', fontWeight: 700}}>{client.name}</div>
				) : (
					<>
						<ClientMark size={width * 0.44} />
						<div style={{fontFamily: fonts.display, fontWeight: 600, fontSize: width * 0.15, letterSpacing: width * 0.02, color: palette.light}}>{client.name.toUpperCase()}</div>
					</>
				)}
			</div>
		</div>
	);
};

// Pain (baguette + boule) dessiné en CSS
const Bread: React.FC<{width: number; dull?: boolean}> = ({width, dull = false}) => {
	const {palette} = useClient();
	const crust = dull ? 'linear-gradient(160deg, #a59c8f, #7d756a)' : `radial-gradient(circle at 35% 30%, ${palette.light}, ${palette.secondary} 35%, ${palette.primary} 70%, ${palette.accent})`;
	return (
		<div style={{position: 'relative', width: width * 1.8, height: width * 1.3}}>
			<div
				style={{
					position: 'absolute',
					left: 0,
					top: width * 0.1,
					width: width * 1.8,
					height: width * 0.36,
					borderRadius: 99,
					background: crust,
					transform: 'rotate(-14deg)',
					boxShadow: dull ? 'none' : `0 ${width * 0.08}px ${width * 0.2}px rgba(0,0,0,0.22)`,
					overflow: 'hidden',
				}}
			>
				{[0, 1, 2, 3].map((k) => (
					<div key={k} style={{position: 'absolute', top: '30%', left: `${14 + k * 20}%`, width: '12%', height: '40%', borderRadius: 99, background: dull ? '#6d665c' : palette.light, opacity: 0.6, transform: 'rotate(28deg)'}} />
				))}
			</div>
			<div
				style={{
					position: 'absolute',
					left: width * 0.45,
					top: width * 0.42,
					width: width * 0.9,
					height: width * 0.72,
					borderRadius: '50% 50% 42% 42%',
					background: crust,
					boxShadow: dull ? 'none' : `0 ${width * 0.1}px ${width * 0.25}px rgba(0,0,0,0.25)`,
					overflow: 'hidden',
				}}
			>
				<div style={{position: 'absolute', left: '20%', right: '20%', top: '28%', height: '10%', borderRadius: 99, background: dull ? '#6d665c' : palette.light, opacity: 0.6}} />
			</div>
		</div>
	);
};

const Product: React.FC<{width: number; dull?: boolean}> = (props) => {
	const {client} = useClient();
	return client.product === 'bread' ? <Bread {...props} /> : <Can {...props} />;
};

// Pub de lancement du client, à sa propre charte en tons doux (téléphone et partie « Après »).
export const ClientAd: React.FC<{frame: number; width: number; height: number}> = ({frame, width, height}) => {
	const {client, palette} = useClient();
	const base = Math.min(width, height * 0.6);
	return (
		<div
			style={{
				width,
				height,
				position: 'relative',
				overflow: 'hidden',
				background: `linear-gradient(180deg, ${palette.light} 0%, ${palette.secondary} 100%)`,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				paddingTop: height * 0.1,
				gap: height * 0.024,
				fontFamily: fonts.body,
				color: palette.ink,
				textAlign: 'center',
			}}
		>
			<div style={fadeUp(frame, 0, 18, 16)}>
				<ClientMark size={base * 0.26} />
			</div>
			<div style={fadeUp(frame, 4, 18, 16)}>
				<ClientWordmark maxSize={base * 0.085} maxWidth={width * 0.8} color={palette.ink} />
			</div>
			<div style={{width: base * 0.12, height: 1, background: palette.accent, opacity: 0.6, ...fadeUp(frame, 7, 18, 0)}} />
			<div style={{fontFamily: fonts.display, fontWeight: 600, fontSize: base * 0.1, lineHeight: 1.12, letterSpacing: -base * 0.002, padding: `0 ${base * 0.08}px`, ...fadeUp(frame, 9, 20, 18)}}>
				{client.adTitle}
			</div>
			<div style={{fontSize: base * 0.045, color: palette.accent, ...fadeUp(frame, 13, 18, 12)}}>{client.sector}</div>
			<div style={{marginTop: height * 0.03, ...fadeUp(frame, 16, 22, 30)}}>
				<Product width={base * 0.28} />
			</div>
			<div style={{position: 'absolute', bottom: height * 0.15, fontSize: base * 0.042, color: palette.accent, ...fadeUp(frame, 20, 16, 10)}}>{client.adSubtitle}</div>
			<div
				style={{
					position: 'absolute',
					bottom: height * 0.065,
					padding: `${base * 0.03}px ${base * 0.08}px`,
					borderRadius: 999,
					background: palette.ink,
					color: palette.light,
					fontWeight: 600,
					fontSize: base * 0.045,
					...fadeUp(frame, 23, 16, 10),
				}}
			>
				{client.adCta}
			</div>
		</div>
	);
};

// Version « Avant » : affiche statique et terne.
export const ClientPosterBefore: React.FC<{width: number; height: number}> = ({width, height}) => {
	const {client} = useClient();
	const base = Math.min(width, height * 0.6);
	return (
		<div
			style={{
				width,
				height,
				background: '#CFCBC0',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				paddingTop: height * 0.1,
				gap: height * 0.03,
				fontFamily: 'Arial, sans-serif',
				color: '#3a3a3a',
				textAlign: 'center',
				filter: 'saturate(0.4)',
			}}
		>
			<div style={{fontSize: base * 0.14, fontWeight: 700}}>{client.name}</div>
			<div style={{fontSize: base * 0.06}}>{client.sector}</div>
			<Product width={base * 0.3} dull />
			<div style={{fontSize: base * 0.06, fontWeight: 700}}>{client.beforeTagline}</div>
			<div style={{fontSize: base * 0.05}}>{client.adSubtitle}</div>
		</div>
	);
};
