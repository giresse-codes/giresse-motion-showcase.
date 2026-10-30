import React from 'react';
import {interpolate, spring} from 'remotion';
import {gmotion} from '../config';
import {clamp, springs} from '../lib/anim';
import {fonts} from './fonts';

const {colors, client} = gmotion;

export type PieceTransform = {x: number; y: number; rotate: number; scale: number; opacity: number};
const IDENTITY: PieceTransform = {x: 0, y: 0, rotate: 0, scale: 1, opacity: 1};

/** Les 6 triangles du logo hexagonal (repère 0..100), légèrement espacés */
export const NOVA_PIECES = new Array(6).fill(0).map((_, i) => {
	const a1 = ((-90 + 60 * i) * Math.PI) / 180;
	const a2 = ((-90 + 60 * (i + 1)) * Math.PI) / 180;
	const pts = [
		[50, 50],
		[50 + 46 * Math.cos(a1), 50 + 46 * Math.sin(a1)],
		[50 + 46 * Math.cos(a2), 50 + 46 * Math.sin(a2)],
	];
	const cx = (pts[0][0] + pts[1][0] + pts[2][0]) / 3;
	const cy = (pts[0][1] + pts[1][1] + pts[2][1]) / 3;
	const shrunk = pts.map(([x, y]) => [cx + (x - cx) * 0.9, cy + (y - cy) * 0.9]);
	return {points: shrunk.map((p) => p.map((v) => v.toFixed(2)).join(',')).join(' '), cx, cy};
});
const FILLS = [colors.cyan, colors.electric, '#7FD6FF', '#2B6BFF', '#A9E4FF', '#1747D6'];

// Logo de l'entreprise fictive : un hexagone en 6 pièces.
export const NovaMark: React.FC<{
	size: number;
	/** Progression du tracé en mode fil de fer (0 → 1) */
	progress?: number;
	wireframe?: boolean;
	piece?: (i: number) => PieceTransform;
	glow?: number;
}> = ({size, progress = 1, wireframe = false, piece = () => IDENTITY, glow = 1}) => (
	<svg viewBox="0 0 100 100" width={size} height={size} style={{overflow: 'visible', filter: `drop-shadow(0 0 ${size * 0.08 * glow}px ${colors.cyan})`}}>
		<defs>
			<linearGradient id="nova-shine" x1="0" y1="0" x2="1" y2="1">
				<stop offset="0%" stopColor="#fff" stopOpacity={0.55} />
				<stop offset="60%" stopColor="#fff" stopOpacity={0} />
			</linearGradient>
		</defs>
		{NOVA_PIECES.map((p, i) => {
			const t = piece(i);
			const visible = wireframe ? interpolate(progress, [i / 7, (i + 1.5) / 7], [0, 1], clamp) : 1;
			return (
				<g
					key={i}
					opacity={t.opacity}
					transform={`translate(${t.x} ${t.y}) rotate(${t.rotate} ${p.cx} ${p.cy}) translate(${p.cx} ${p.cy}) scale(${t.scale}) translate(${-p.cx} ${-p.cy})`}
				>
					<polygon
						points={p.points}
						fill={wireframe ? 'none' : FILLS[i]}
						stroke={wireframe ? colors.cyan : 'rgba(255,255,255,0.5)'}
						strokeWidth={wireframe ? 1.2 : 0.6}
						strokeLinejoin="round"
						pathLength={1}
						strokeDasharray={wireframe ? 1 : undefined}
						strokeDashoffset={wireframe ? 1 - visible : undefined}
					/>
					{!wireframe && <polygon points={p.points} fill="url(#nova-shine)" />}
				</g>
			);
		})}
		<circle cx={50} cy={50} r={wireframe ? 3 * progress : 5} fill="#fff" />
	</svg>
);

// Mot-symbole « NOVA » dont chaque lettre peut voler indépendamment.
export const NovaWordmark: React.FC<{size: number; piece?: (i: number) => PieceTransform}> = ({size, piece = () => IDENTITY}) => (
	<div style={{display: 'flex', gap: size * 0.08, fontFamily: fonts.display, fontWeight: 900, fontSize: size, lineHeight: 1, color: colors.white, letterSpacing: size * 0.02}}>
		{client.name.split('').map((ch, i) => {
			const t = piece(i);
			return (
				<span
					key={i}
					style={{
						display: 'inline-block',
						transform: `translate(${t.x}px, ${t.y}px) rotate(${t.rotate}deg) scale(${t.scale})`,
						opacity: t.opacity,
						textShadow: `0 0 ${size * 0.25}px ${colors.cyan}`,
					}}
				>
					{ch}
				</span>
			);
		})}
	</div>
);

// Canette stylisée (CSS) aux couleurs de la marque
const Can: React.FC<{width: number; frame: number; dull?: boolean}> = ({width, frame, dull = false}) => {
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
					: `linear-gradient(90deg, #0A1D5C, ${colors.electric} 35%, ${colors.cyan} 55%, ${colors.electric} 75%, #0A1D5C)`,
				boxShadow: dull ? 'none' : `0 ${width * 0.15}px ${width * 0.4}px rgba(0,0,0,0.5), 0 0 ${width * 0.5}px ${colors.cyan}66`,
			}}
		>
			<div style={{position: 'absolute', top: 0, left: 0, right: 0, height: width * 0.1, background: dull ? '#777' : 'linear-gradient(90deg, #8a96b0, #e6ecf7, #8a96b0)'}} />
			<div style={{position: 'absolute', top: '30%', left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: width * 0.04}}>
				{dull ? (
					<div style={{fontFamily: 'Arial, sans-serif', fontSize: width * 0.26, color: '#333', fontWeight: 700}}>{client.name}</div>
				) : (
					<>
						<NovaMark size={width * 0.5} glow={0.4} />
						<div style={{fontFamily: fonts.display, fontWeight: 900, fontSize: width * 0.22, color: '#fff'}}>{client.name}</div>
					</>
				)}
			</div>
			{!dull && (
				<div style={{position: 'absolute', top: 0, bottom: 0, left: `${shine}%`, width: '22%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)', transform: 'skewX(-12deg)'}} />
			)}
		</div>
	);
};

// Pub de lancement animée (contenu du téléphone et de la partie « APRÈS »).
export const NovaAd: React.FC<{frame: number; width: number; height: number}> = ({frame, width, height}) => {
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
				background: `radial-gradient(circle at 50% 30%, ${colors.cyan}AA, transparent 55%), linear-gradient(170deg, ${colors.electric}, #0A1D5C 70%, ${colors.night})`,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				paddingTop: height * 0.08,
				gap: height * 0.025,
				fontFamily: fonts.display,
				color: '#fff',
			}}
		>
			{/* Rayons tournants */}
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
				<NovaMark size={base * 0.36} />
			</div>
			<div style={{transform: `scale(${s(4)})`, fontWeight: 900, fontSize: base * 0.2, lineHeight: 1, letterSpacing: base * 0.01, textShadow: `0 0 ${base * 0.06}px ${colors.cyan}`}}>{client.name}</div>
			<div style={{display: 'flex', gap: base * 0.025, flexWrap: 'wrap', justifyContent: 'center'}}>
				{words.map((w, i) => (
					<span key={w} style={{display: 'inline-block', fontWeight: 800, fontSize: base * 0.1, transform: `translateY(${(1 - s(8 + i * 3)) * 40}px)`, opacity: Math.min(1, s(8 + i * 3) * 1.5), color: i === words.length - 1 ? colors.cyan : '#fff'}}>
						{w}
					</span>
				))}
			</div>
			<div style={{fontFamily: fonts.body, fontWeight: 600, fontSize: base * 0.05, color: '#D6E6FF', opacity: Math.min(1, s(14))}}>{client.sector}</div>
			<div style={{marginTop: height * 0.01, transform: `translateY(${(1 - s(12)) * height * 0.5 + Math.sin(frame / 12) * base * 0.02}px) rotate(${-6 + Math.sin(frame / 18) * 4}deg)`}}>
				<Can width={base * 0.3} frame={frame} />
			</div>
			<div
				style={{
					position: 'absolute',
					bottom: height * 0.07,
					padding: `${base * 0.035}px ${base * 0.08}px`,
					borderRadius: 999,
					background: '#fff',
					color: colors.electric,
					fontWeight: 800,
					fontSize: base * 0.055,
					transform: `scale(${s(20) * (1 + 0.04 * Math.sin(frame / 4))})`,
					boxShadow: `0 0 ${base * 0.08}px ${colors.cyan}`,
				}}
			>
				{client.adCta} →
			</div>
		</div>
	);
};

// Version « AVANT » : affiche statique et terne.
export const NovaPosterBefore: React.FC<{width: number; height: number}> = ({width, height}) => {
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
				filter: 'saturate(0.4)',
			}}
		>
			<div style={{fontSize: base * 0.16, fontWeight: 700}}>{client.name}</div>
			<div style={{fontSize: base * 0.06}}>{client.sector}</div>
			<Can width={base * 0.3} frame={0} dull />
			<div style={{fontSize: base * 0.065, fontWeight: 700}}>{client.adTitle}</div>
			<div style={{fontSize: base * 0.05}}>{client.adSubtitle}</div>
		</div>
	);
};
