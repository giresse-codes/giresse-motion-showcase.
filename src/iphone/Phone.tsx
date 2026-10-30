import React from 'react';
import {nocturne} from '../theme';
import {fonts} from '../gmotion/fonts';

export type Finish = keyof typeof nocturne.titanium;

/** Proportions d'un grand smartphone (≈ 77 × 160 mm) */
export const PHONE_RATIO = 2.085;

const Lens: React.FC<{size: number; x: number; y: number; ring: string}> = ({size, x, y, ring}) => (
	<div
		style={{
			position: 'absolute',
			left: x - size / 2,
			top: y - size / 2,
			width: size,
			height: size,
			borderRadius: '50%',
			background: `radial-gradient(circle at 35% 30%, ${ring}, #1A1A1C 70%)`,
			boxShadow: `0 ${size * 0.06}px ${size * 0.12}px rgba(0,0,0,0.55), inset 0 0 0 ${size * 0.04}px rgba(255,255,255,0.18)`,
		}}
	>
		<div
			style={{
				position: 'absolute',
				inset: size * 0.14,
				borderRadius: '50%',
				background: 'radial-gradient(circle at 40% 38%, #3A3F55 0%, #0B0C12 45%, #000 70%)',
				boxShadow: 'inset 0 0 0 2px rgba(0,0,0,0.8)',
			}}
		>
			{/* Reflet de lentille */}
			<div style={{position: 'absolute', left: '26%', top: '22%', width: '22%', height: '22%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(170,180,255,0.75), transparent 70%)'}} />
			<div style={{position: 'absolute', right: '24%', bottom: '26%', width: '10%', height: '10%', borderRadius: '50%', background: 'rgba(255,200,160,0.5)'}} />
		</div>
	</div>
);

/** Dos du téléphone : verre mat, cadre titane, bloc photo à trois objectifs */
const Back: React.FC<{width: number; finish: Finish}> = ({width, finish}) => {
	const [dark, light, deep] = nocturne.titanium[finish];
	const h = width * PHONE_RATIO;
	const plate = width * 0.46;
	const lens = plate * 0.4;
	return (
		<div style={{position: 'absolute', inset: 0, borderRadius: width * 0.17, background: `linear-gradient(135deg, ${light}, ${dark} 40%, ${deep})`, padding: width * 0.018}}>
			<div style={{position: 'relative', width: '100%', height: '100%', borderRadius: width * 0.155, background: `linear-gradient(160deg, ${dark}, ${deep} 70%)`, overflow: 'hidden'}}>
				{/* Bloc photo légèrement surélevé */}
				<div
					style={{
						position: 'absolute',
						left: width * 0.045,
						top: width * 0.045,
						width: plate,
						height: plate,
						borderRadius: plate * 0.26,
						background: `linear-gradient(145deg, ${light}55, ${deep}AA)`,
						boxShadow: `inset 0 0 0 1.5px rgba(255,255,255,0.18), 0 ${width * 0.01}px ${width * 0.03}px rgba(0,0,0,0.35)`,
					}}
				>
					<Lens size={lens} x={plate * 0.29} y={plate * 0.28} ring={light} />
					<Lens size={lens} x={plate * 0.29} y={plate * 0.72} ring={light} />
					<Lens size={lens} x={plate * 0.72} y={plate * 0.5} ring={light} />
					{/* Flash, LiDAR et micro */}
					<div style={{position: 'absolute', left: plate * 0.72 - plate * 0.07, top: plate * 0.16 - plate * 0.07, width: plate * 0.14, height: plate * 0.14, borderRadius: '50%', background: 'radial-gradient(circle, #FFF6E0, #C9B98F)'}} />
					<div style={{position: 'absolute', left: plate * 0.72 - plate * 0.06, top: plate * 0.84 - plate * 0.06, width: plate * 0.12, height: plate * 0.12, borderRadius: '50%', background: '#151517'}} />
					<div style={{position: 'absolute', left: plate * 0.5 - 2, top: plate * 0.5 - 2, width: 4, height: 4, borderRadius: '50%', background: '#111'}} />
				</div>
				{/* Reflet du verre */}
				<div style={{position: 'absolute', inset: 0, background: `linear-gradient(115deg, rgba(255,255,255,0.12) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.05) 100%)`}} />
				<div style={{position: 'absolute', left: 0, right: 0, bottom: h * 0.08, textAlign: 'center', fontFamily: fonts.body, fontSize: width * 0.03, letterSpacing: width * 0.006, color: 'rgba(255,255,255,0.18)'}}>PRO MAX</div>
			</div>
		</div>
	);
};

/** Face avant : écran bord à bord, Dynamic Island, écran verrouillé */
const Front: React.FC<{width: number; finish: Finish; screen?: React.ReactNode}> = ({width, finish, screen}) => {
	const [dark, light, deep] = nocturne.titanium[finish];
	return (
		<div style={{position: 'absolute', inset: 0, borderRadius: width * 0.17, background: `linear-gradient(135deg, ${light}, ${dark} 40%, ${deep})`, padding: width * 0.018}}>
			<div style={{position: 'relative', width: '100%', height: '100%', borderRadius: width * 0.155, background: '#000', padding: width * 0.03}}>
				<div style={{position: 'relative', width: '100%', height: '100%', borderRadius: width * 0.13, overflow: 'hidden', background: '#000'}}>
					{screen}
					<div style={{position: 'absolute', left: '50%', top: width * 0.03, width: width * 0.3, height: width * 0.085, transform: 'translateX(-50%)', borderRadius: 999, background: '#000'}} />
					<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(255,255,255,0.1) 0%, transparent 28%)'}} />
				</div>
			</div>
		</div>
	);
};

/** Écran verrouillé : fond d'écran orange chaud, heure et date */
export const LockScreen: React.FC<{width: number}> = ({width}) => (
	<div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 78%, ${nocturne.orbCore} 0%, ${nocturne.orb} 22%, #6B1A06 52%, #120402 85%)`, fontFamily: fonts.display, color: '#FFF4EC', textAlign: 'center'}}>
		<div style={{marginTop: width * 0.3, fontSize: width * 0.05, fontWeight: 500, opacity: 0.85}}>Jeudi 30 octobre</div>
		<div style={{fontSize: width * 0.25, fontWeight: 600, letterSpacing: -width * 0.008, lineHeight: 1}}>10:24</div>
	</div>
);

/**
 * Téléphone dessiné en code, en 3D : `rotateY` à 0° montre la face avant, à 180° le dos.
 * Aucune image ni aucun logo de marque n'est utilisé.
 */
export const Phone: React.FC<{width: number; rotateY?: number; rotateX?: number; finish?: Finish; screen?: React.ReactNode; edgeLight?: number}> = ({
	width,
	rotateY = 0,
	rotateX = 0,
	finish = 'natural',
	screen,
	edgeLight = 0,
}) => {
	const height = width * PHONE_RATIO;
	// Les boutons latéraux dépassent légèrement du cadre
	const button = (top: number, h: number, side: 'left' | 'right') => (
		<div style={{position: 'absolute', top: height * top, [side]: -width * 0.012, width: width * 0.016, height: height * h, borderRadius: 4, background: nocturne.titanium[finish][1]}} />
	);
	return (
		<div style={{width, height, position: 'relative', transformStyle: 'preserve-3d', transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`}}>
			<div style={{position: 'absolute', inset: 0, backfaceVisibility: 'hidden'}}>
				{button(0.17, 0.05, 'left')}
				{button(0.25, 0.08, 'left')}
				{button(0.35, 0.08, 'left')}
				{button(0.27, 0.13, 'right')}
				<Front width={width} finish={finish} screen={screen ?? <LockScreen width={width} />} />
			</div>
			<div style={{position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)'}}>
				{button(0.17, 0.05, 'right')}
				{button(0.25, 0.08, 'right')}
				{button(0.35, 0.08, 'right')}
				{button(0.27, 0.13, 'left')}
				<Back width={width} finish={finish} />
				{/* Liseré de lumière sur la tranche titane */}
				{edgeLight > 0 && (
					<div style={{position: 'absolute', inset: 0, borderRadius: width * 0.17, boxShadow: `inset 0 0 0 ${width * 0.012}px rgba(255,190,140,${0.6 * edgeLight}), 0 0 ${width * 0.12}px rgba(255,106,43,${0.35 * edgeLight})`}} />
				)}
			</div>
		</div>
	);
};
