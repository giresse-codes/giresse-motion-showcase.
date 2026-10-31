import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame} from 'remotion';
import {config} from '../config';
import {theme} from '../theme';
import {FPS, T} from '../timeline';

// -----------------------------------------------------------------------------
// Animation : courbes douces, ressorts amortis (pas de rebond marqué)

export const ease = Easing.bezier(0.45, 0, 0.2, 1);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Progression 0 → 1 avec easing doux */
export const progress = (frame: number, start: number, duration: number) => interpolate(frame, [start, start + duration], [0, 1], {...clamp, easing: ease});

/** Ressort doux (0 → 1) */
export const soft = (frame: number, start: number, durationInFrames = 24) =>
	spring({frame: frame - start, fps: FPS, config: {damping: 200, stiffness: 90, mass: 1}, durationInFrames});

/** Apparition en fondu avec léger glissement vers le haut */
export const fadeUp = (frame: number, start: number, duration = 16, distance = 20): React.CSSProperties => {
	const p = progress(frame, start, duration);
	return {opacity: p, transform: `translateY(${(1 - p) * distance}px)`};
};

// -----------------------------------------------------------------------------
// Décor : pièce bleu nuit, sol en perspective avec grille discrète, halo bleu

export const Room: React.FC<{haloOpacity?: number}> = ({haloOpacity = 1}) => {
	const frame = useCurrentFrame();
	const drift = Math.sin(frame / 90) * 3;
	return (
		<AbsoluteFill style={{background: `radial-gradient(ellipse 120% 70% at 50% 30%, #0D1530 0%, ${theme.bg} 60%)`}}>
			{/* Sol en perspective */}
			<AbsoluteFill style={{perspective: 900, perspectiveOrigin: '50% 40%'}}>
				<div
					style={{
						position: 'absolute',
						left: '-60%',
						width: '220%',
						top: '58%',
						height: '70%',
						transform: 'rotateX(76deg)',
						transformOrigin: '50% 0%',
						backgroundImage: 'linear-gradient(rgba(140,170,255,0.09) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(140,170,255,0.09) 1.5px, transparent 1.5px)',
						backgroundSize: '90px 90px',
						backgroundPosition: `${drift}px 0`,
						maskImage: 'linear-gradient(to bottom, black 0%, transparent 75%)',
						WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 75%)',
					}}
				/>
			</AbsoluteFill>
			{/* Halo bleu sous les fenêtres */}
			<div style={{position: 'absolute', left: '50%', top: '66%', width: 1100, height: 420, marginLeft: -550, borderRadius: '50%', background: `radial-gradient(ellipse, ${theme.halo}55 0%, ${theme.halo}18 40%, transparent 70%)`, filter: 'blur(20px)', opacity: haloOpacity}} />
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 50%, rgba(2,4,12,0.65) 100%)'}} />
		</AbsoluteFill>
	);
};

// -----------------------------------------------------------------------------
// Caméra : la scène 3D tourne lentement autour des fenêtres, avec des ressorts doux

type CamKey = {at: number; rx: number; ry: number; z: number; y: number};
const CAMERA: CamKey[] = [
	{at: T.inbox.from, rx: 15, ry: -10, z: 0, y: 0},
	{at: T.order.from, rx: 13, ry: -6, z: 20, y: 0},
	{at: T.invoice.from, rx: 16, ry: -12, z: 0, y: 0},
	{at: T.phone.from, rx: 10, ry: -4, z: 40, y: 0},
	{at: T.planning.from, rx: 15, ry: -9, z: 0, y: 0},
	{at: T.dashboard.from, rx: 14, ry: -13, z: 10, y: 0},
	{at: T.end.from, rx: 0, ry: 0, z: 0, y: 0},
];

export const cameraAt = (frame: number) => {
	const c = {...CAMERA[0]};
	for (let i = 1; i < CAMERA.length; i++) {
		const p = soft(frame, CAMERA[i].at - 6, 40);
		c.rx += (CAMERA[i].rx - CAMERA[i - 1].rx) * p;
		c.ry += (CAMERA[i].ry - CAMERA[i - 1].ry) * p;
		c.z += (CAMERA[i].z - CAMERA[i - 1].z) * p;
		c.y += (CAMERA[i].y - CAMERA[i - 1].y) * p;
	}
	// Orbite très lente et continue
	c.ry += Math.sin(frame / 70) * 2;
	c.rx += Math.cos(frame / 95) * 1;
	return c;
};

/** Plan 3D sur lequel sont posées toutes les fenêtres (repère : 1000 × 1400 px) */
export const STAGE = {width: 1000, height: 1400, left: 40, top: 380};

export const Stage: React.FC<{children: React.ReactNode; opacity?: number}> = ({children, opacity = 1}) => {
	const frame = useCurrentFrame();
	const c = cameraAt(frame);
	return (
		<AbsoluteFill style={{perspective: 2000, perspectiveOrigin: '50% 45%', opacity}}>
			<div
				style={{
					position: 'absolute',
					left: STAGE.left,
					top: STAGE.top,
					width: STAGE.width,
					height: STAGE.height,
					transformStyle: 'preserve-3d',
					transform: `translateY(${c.y}px) translateZ(${c.z}px) rotateX(${c.rx}deg) rotateY(${c.ry}deg)`,
				}}
			>
				{children}
			</div>
		</AbsoluteFill>
	);
};

// -----------------------------------------------------------------------------
// Fenêtre façon macOS en verre

type WindowProps = {
	title: string;
	x: number;
	y: number;
	width: number;
	height: number;
	/** Menu latéral, avec l'entrée active (indice dans config.menu) */
	sidebar?: number;
	style?: React.CSSProperties;
	children: React.ReactNode;
};

export const AppWindow: React.FC<WindowProps> = ({title, x, y, width, height, sidebar, style, children}) => (
	<div
		style={{
			position: 'absolute',
			left: x,
			top: y,
			width,
			height,
			borderRadius: theme.radius,
			background: theme.glass,
			border: `1px solid ${theme.border}`,
			backdropFilter: 'blur(18px)',
			WebkitBackdropFilter: 'blur(18px)',
			boxShadow: `0 40px 90px rgba(0,0,0,0.55), 0 0 60px ${theme.halo}22, inset 0 1px 0 rgba(255,255,255,0.08)`,
			overflow: 'hidden',
			display: 'flex',
			flexDirection: 'column',
			fontFamily: theme.font,
			color: theme.text,
			...style,
		}}
	>
		<div style={{height: 56, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px', borderBottom: `1px solid ${theme.divider}`, background: 'rgba(10,18,44,0.35)'}}>
			{['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
				<div key={c} style={{width: 14, height: 14, borderRadius: '50%', background: c}} />
			))}
			<div style={{flex: 1, textAlign: 'center', fontSize: 22, fontWeight: 600, color: theme.soft, marginRight: 60}}>{title}</div>
		</div>
		<div style={{flex: 1, display: 'flex', minHeight: 0}}>
			{sidebar !== undefined && <Sidebar active={sidebar} />}
			<div style={{flex: 1, minWidth: 0, position: 'relative'}}>{children}</div>
		</div>
	</div>
);

export const Sidebar: React.FC<{active: number}> = ({active}) => (
	<div style={{width: 230, flexShrink: 0, padding: '22px 14px', borderRight: `1px solid ${theme.divider}`, background: 'rgba(8,14,36,0.35)'}}>
		<div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '0 10px 22px'}}>
			<div style={{width: 30, height: 30, borderRadius: 9, background: `linear-gradient(135deg, ${theme.accent}, #6E93FF)`}} />
			<div style={{fontSize: 21, fontWeight: 700}}>{config.appName}</div>
		</div>
		{config.menu.map((item, i) => (
			<div
				key={item}
				style={{
					padding: '13px 12px',
					marginBottom: 4,
					borderRadius: 10,
					fontSize: 20,
					fontWeight: i === active ? 600 : 500,
					color: i === active ? theme.text : theme.muted,
					background: i === active ? 'rgba(47,107,255,0.28)' : 'transparent',
					whiteSpace: 'nowrap',
				}}
			>
				{item}
			</div>
		))}
	</div>
);

/** Pastille bleue lumineuse (info détectée) */
export const Pill: React.FC<{text: string; glow: number; style?: React.CSSProperties}> = ({text, glow, style}) => (
	<div
		style={{
			display: 'inline-flex',
			alignItems: 'center',
			padding: '12px 22px',
			borderRadius: 999,
			fontFamily: theme.font,
			fontSize: 26,
			fontWeight: 600,
			color: theme.text,
			background: `rgba(47,107,255,${0.35 + 0.35 * glow})`,
			border: '1px solid rgba(175,195,255,0.55)',
			boxShadow: `0 0 ${12 + 30 * glow}px rgba(47,107,255,${0.35 + 0.45 * glow})`,
			whiteSpace: 'nowrap',
			...style,
		}}
	>
		{text}
	</div>
);
