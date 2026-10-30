import React from 'react';
import {interpolate, spring} from 'remotion';
import {ClientPalette} from '../theme';
import {clamp, springs} from '../lib/anim';
import {fonts} from './fonts';
import {useClient} from './client';

export type PieceTransform = {x: number; y: number; rotate: number; scale: number; opacity: number};
const IDENTITY: PieceTransform = {x: 0, y: 0, rotate: 0, scale: 1, opacity: 1};

type Piece = {d: string; cx: number; cy: number};

/** Les 6 pièces du logo client (repère 0..100) : triangles d'un hexagone ou parts d'un disque */
const makePieces = (shape: 'hexagon' | 'round'): Piece[] =>
	new Array(6).fill(0).map((_, i) => {
		const a1 = ((-90 + 60 * i) * Math.PI) / 180;
		const a2 = ((-90 + 60 * (i + 1)) * Math.PI) / 180;
		const am = (a1 + a2) / 2;
		const cx = 50 + 26 * Math.cos(am);
		const cy = 50 + 26 * Math.sin(am);
		const shrink = (x: number, y: number) => [cx + (x - cx) * 0.9, cy + (y - cy) * 0.9].map((v) => v.toFixed(2)).join(' ');
		const p1 = [50 + 46 * Math.cos(a1), 50 + 46 * Math.sin(a1)];
		const p2 = [50 + 46 * Math.cos(a2), 50 + 46 * Math.sin(a2)];
		const d =
			shape === 'hexagon'
				? `M ${shrink(50, 50)} L ${shrink(p1[0], p1[1])} L ${shrink(p2[0], p2[1])} Z`
				: `M ${shrink(50, 50)} L ${shrink(p1[0], p1[1])} A ${46 * 0.9} ${46 * 0.9} 0 0 1 ${shrink(p2[0], p2[1])} Z`;
		return {d, cx, cy};
	});

const PIECES = {hexagon: makePieces('hexagon'), round: makePieces('round')};

const fills = (p: ClientPalette) => [p.primary, p.secondary, p.light, p.primary, p.secondary, p.accent];

// Logo du client fictif, en 6 pièces qui peuvent voler indépendamment.
export const ClientMark: React.FC<{
	size: number;
	/** Progression du tracé en mode fil de fer (0 → 1) */
	progress?: number;
	wireframe?: boolean;
	wireColor?: string;
	piece?: (i: number) => PieceTransform;
	glow?: number;
}> = ({size, progress = 1, wireframe = false, wireColor, piece = () => IDENTITY, glow = 1}) => {
	const {client, palette} = useClient();
	const pieces = PIECES[client.mark];
	const colors = fills(palette);
	const stroke = wireColor ?? palette.primary;
	return (
		<svg viewBox="0 0 100 100" width={size} height={size} style={{overflow: 'visible', filter: `drop-shadow(0 0 ${size * 0.08 * glow}px ${wireframe ? stroke : palette.primary})`}}>
			<defs>
				<linearGradient id="client-shine" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0%" stopColor="#fff" stopOpacity={0.5} />
					<stop offset="60%" stopColor="#fff" stopOpacity={0} />
				</linearGradient>
			</defs>
			{pieces.map((p, i) => {
				const t = piece(i);
				const visible = wireframe ? interpolate(progress, [i / 7, (i + 1.5) / 7], [0, 1], clamp) : 1;
				return (
					<g
						key={i}
						opacity={t.opacity}
						transform={`translate(${t.x} ${t.y}) rotate(${t.rotate} ${p.cx} ${p.cy}) translate(${p.cx} ${p.cy}) scale(${t.scale}) translate(${-p.cx} ${-p.cy})`}
					>
						<path
							d={p.d}
							fill={wireframe ? 'none' : colors[i]}
							stroke={wireframe ? stroke : 'rgba(255,255,255,0.45)'}
							strokeWidth={wireframe ? 1.2 : 0.6}
							strokeLinejoin="round"
							pathLength={1}
							strokeDasharray={wireframe ? 1 : undefined}
							strokeDashoffset={wireframe ? 1 - visible : undefined}
						/>
						{!wireframe && <path d={p.d} fill="url(#client-shine)" />}
					</g>
				);
			})}
			<circle cx={50} cy={50} r={wireframe ? 3 * progress : 5} fill={wireframe ? stroke : palette.light} />
		</svg>
	);
};

// Nom du client dont chaque lettre peut voler indépendamment.
export const ClientWordmark: React.FC<{maxSize: number; maxWidth: number; piece?: (i: number) => PieceTransform}> = ({maxSize, maxWidth, piece = () => IDENTITY}) => {
	const {client, palette} = useClient();
	const letters = client.name.toUpperCase().split('');
	const size = Math.min(maxSize, maxWidth / (letters.length * 0.82));
	return (
		<div style={{display: 'flex', gap: size * 0.06, fontFamily: fonts.display, fontWeight: 900, fontSize: size, lineHeight: 1, color: palette.light, whiteSpace: 'pre'}}>
			{letters.map((ch, i) => {
				const t = piece(i);
				return (
					<span
						key={i}
						style={{
							display: 'inline-block',
							transform: `translate(${t.x}px, ${t.y}px) rotate(${t.rotate}deg) scale(${t.scale})`,
							opacity: t.opacity,
							textShadow: `0 0 ${size * 0.25}px ${palette.primary}`,
						}}
					>
						{ch}
					</span>
				);
			})}
		</div>
	);
};

// Canette stylisée aux couleurs de la marque
const Can: React.FC<{width: number; frame: number; dull?: boolean}> = ({width, frame, dull = false}) => {
	const {client, palette} = useClient();
	const h = width * 1.85;
	const shine = dull ? 0 : ((frame * 3) % 160) - 30;
	return (
		<div
			style={{
				width,
				height: h,
				borderRadius: `${width * 0.12}px ${width * 0.12}px ${width * 0.1}px ${width * 0.1}px`,
				position: 'relative',
				overflow: 'hidden',
				background: dull
					? 'linear-gradient(90deg, #8c8c8c, #b5b5b5 45%, #8c8c8c)'
					: `linear-gradient(90deg, ${palette.dark}, ${palette.primary} 35%, ${palette.light} 55%, ${palette.secondary} 75%, ${palette.dark})`,
				boxShadow: dull ? 'none' : `0 ${width * 0.15}px ${width * 0.4}px rgba(0,0,0,0.5), 0 0 ${width * 0.5}px ${palette.primary}66`,
			}}
		>
			<div style={{position: 'absolute', top: 0, left: 0, right: 0, height: width * 0.1, background: dull ? '#777' : 'linear-gradient(90deg, #8a8f86, #f2f4ef, #8a8f86)'}} />
			<div style={{position: 'absolute', top: '30%', left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: width * 0.04}}>
				{dull ? (
					<div style={{fontFamily: 'Arial, sans-serif', fontSize: width * 0.24, color: '#333', fontWeight: 700}}>{client.name}</div>
				) : (
					<>
						<ClientMark size={width * 0.5} glow={0.3} />
						<div style={{fontFamily: fonts.display, fontWeight: 900, fontSize: width * 0.2, color: palette.ink}}>{client.name.toUpperCase()}</div>
					</>
				)}
			</div>
			{!dull && <div style={{position: 'absolute', top: 0, bottom: 0, left: `${shine}%`, width: '22%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)', transform: 'skewX(-12deg)'}} />}
		</div>
	);
};

// Pain (baguette + boule dorée) dessiné en CSS, avec un peu de vapeur
const Bread: React.FC<{width: number; frame: number; dull?: boolean}> = ({width, frame, dull = false}) => {
	const {palette} = useClient();
	const crust = dull ? 'linear-gradient(160deg, #a59c8f, #7d756a)' : `radial-gradient(circle at 35% 30%, ${palette.light}, ${palette.primary} 45%, ${palette.accent} 100%)`;
	const steam = (i: number) => (dull ? 0 : 0.5 + 0.5 * Math.sin(frame / 8 + i * 2));
	return (
		<div style={{position: 'relative', width: width * 1.8, height: width * 1.3}}>
			{!dull &&
				[0, 1, 2].map((i) => (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: `${30 + i * 18}%`,
							top: -width * 0.35 - steam(i) * width * 0.1,
							width: width * 0.08,
							height: width * 0.35,
							borderRadius: 99,
							background: `linear-gradient(0deg, ${palette.light}AA, transparent)`,
							opacity: steam(i),
							filter: 'blur(3px)',
						}}
					/>
				))}
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
					boxShadow: dull ? 'none' : `0 ${width * 0.08}px ${width * 0.2}px rgba(0,0,0,0.4), 0 0 ${width * 0.3}px ${palette.secondary}55`,
					overflow: 'hidden',
				}}
			>
				{[0, 1, 2, 3].map((k) => (
					<div key={k} style={{position: 'absolute', top: '30%', left: `${14 + k * 20}%`, width: '12%', height: '40%', borderRadius: 99, background: dull ? '#6d665c' : palette.light, opacity: 0.75, transform: 'rotate(28deg)'}} />
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
					boxShadow: dull ? 'none' : `0 ${width * 0.1}px ${width * 0.25}px rgba(0,0,0,0.45), 0 0 ${width * 0.35}px ${palette.secondary}66`,
					overflow: 'hidden',
				}}
			>
				<div style={{position: 'absolute', left: '20%', right: '20%', top: '28%', height: '10%', borderRadius: 99, background: dull ? '#6d665c' : palette.light, opacity: 0.7}} />
			</div>
		</div>
	);
};

const Product: React.FC<{width: number; frame: number; dull?: boolean}> = (props) => {
	const {client} = useClient();
	return client.product === 'bread' ? <Bread {...props} /> : <Can {...props} />;
};

// Pub de lancement animée du client, à sa propre charte (téléphone et partie « APRÈS »).
export const ClientAd: React.FC<{frame: number; width: number; height: number}> = ({frame, width, height}) => {
	const {client, palette} = useClient();
	const base = Math.min(width, height * 0.6);
	const s = (delay: number) => spring({frame: frame - delay, fps: 30, config: springs.bouncy});
	const words = client.adTitle.split(' ');
	return (
		<div
			style={{
				width,
				height,
				position: 'relative',
				overflow: 'hidden',
				background: `radial-gradient(circle at 50% 28%, ${palette.secondary}CC, transparent 55%), linear-gradient(170deg, ${palette.primary}, ${palette.dark} 72%)`,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				paddingTop: height * 0.08,
				gap: height * 0.022,
				fontFamily: fonts.display,
				color: palette.light,
				textAlign: 'center',
			}}
		>
			<div
				style={{
					position: 'absolute',
					left: '50%',
					top: '32%',
					width: base * 3,
					height: base * 3,
					marginLeft: -base * 1.5,
					marginTop: -base * 1.5,
					background: `repeating-conic-gradient(from ${frame * 1.2}deg, rgba(255,255,255,0.12) 0deg 7deg, transparent 7deg 20deg)`,
					maskImage: 'radial-gradient(circle, black 5%, transparent 50%)',
					WebkitMaskImage: 'radial-gradient(circle, black 5%, transparent 50%)',
				}}
			/>
			<div style={{transform: `scale(${s(0)}) rotate(${Math.sin(frame / 15) * 8}deg)`}}>
				<ClientMark size={base * 0.34} />
			</div>
			<ClientWordmark maxSize={base * 0.2} maxWidth={width * 0.86} piece={() => ({x: 0, y: 0, rotate: 0, scale: s(4), opacity: 1})} />
			<div style={{display: 'flex', gap: base * 0.025, flexWrap: 'wrap', justifyContent: 'center', padding: `0 ${base * 0.06}px`}}>
				{words.map((w, i) => (
					<span
						key={`${w}-${i}`}
						style={{
							display: 'inline-block',
							fontWeight: 800,
							fontSize: base * 0.095,
							transform: `translateY(${(1 - s(8 + i * 3)) * 40}px)`,
							opacity: Math.min(1, s(8 + i * 3) * 1.5),
							color: i === words.length - 1 ? palette.secondary : palette.light,
							textShadow: `0 ${base * 0.01}px ${base * 0.03}px ${palette.dark}`,
						}}
					>
						{w}
					</span>
				))}
			</div>
			<div style={{fontFamily: fonts.body, fontWeight: 600, fontSize: base * 0.05, color: palette.light, opacity: Math.min(1, s(14)) * 0.85}}>{client.sector}</div>
			<div style={{marginTop: height * 0.02, transform: `translateY(${(1 - s(12)) * height * 0.5 + Math.sin(frame / 12) * base * 0.02}px) rotate(${-4 + Math.sin(frame / 18) * 3}deg)`}}>
				<Product width={base * 0.3} frame={frame} />
			</div>
			<div style={{position: 'absolute', bottom: height * 0.14, fontFamily: fonts.body, fontWeight: 600, fontSize: base * 0.045, color: palette.light, opacity: Math.min(1, s(18))}}>{client.adSubtitle}</div>
			<div
				style={{
					position: 'absolute',
					bottom: height * 0.06,
					padding: `${base * 0.035}px ${base * 0.08}px`,
					borderRadius: 999,
					background: palette.light,
					color: palette.ink,
					fontWeight: 800,
					fontSize: base * 0.055,
					transform: `scale(${s(20) * (1 + 0.04 * Math.sin(frame / 4))})`,
					boxShadow: `0 0 ${base * 0.08}px ${palette.secondary}`,
				}}
			>
				{client.adCta} →
			</div>
		</div>
	);
};

// Version « AVANT » : affiche statique et terne.
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
			<Product width={base * 0.3} frame={0} dull />
			<div style={{fontSize: base * 0.06, fontWeight: 700}}>{client.beforeTagline}</div>
			<div style={{fontSize: base * 0.05}}>{client.adSubtitle}</div>
		</div>
	);
};
