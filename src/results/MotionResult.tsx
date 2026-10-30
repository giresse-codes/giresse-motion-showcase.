import React from 'react';
import {interpolate, random, spring} from 'remotion';
import {theme} from '../theme';
import {clamp, springs} from '../lib/anim';
import {enterStyle, FPS, ResultProps, resultStyle} from './shared';

const FLAVORS = [
	{name: 'Mangue', liquid: ['#FDBA74', '#F97316']},
	{name: 'Ananas', liquid: ['#FDE68A', '#EAB308']},
	{name: 'Bissap', liquid: ['#F472B6', '#9D174D']},
];

const Bottle: React.FC<{size: number; liquid: string[]; label: string; brand: string; frame: number; delay: number}> = ({size, liquid, label, brand, frame, delay}) => {
	const drop = spring({frame: frame - delay, fps: FPS, config: springs.bouncy});
	const float = Math.sin((frame - delay) / 14) * size * 0.04;
	const fill = interpolate(frame, [delay + 4, delay + 30], [0.15, 0.82], clamp);
	return (
		<div
			style={{
				width: size,
				height: size * 2.3,
				transform: `translateY(${(1 - drop) * -size * 2.5 + float}px) rotate(${(1 - drop) * 25}deg)`,
				opacity: drop > 0.01 ? 1 : 0,
				position: 'relative',
				filter: `drop-shadow(0 ${size * 0.15}px ${size * 0.2}px rgba(0,0,0,0.45))`,
			}}
		>
			{/* Bouchon */}
			<div style={{position: 'absolute', left: '32%', width: '36%', top: 0, height: '9%', borderRadius: size * 0.05, background: '#14532D'}} />
			{/* Goulot + corps */}
			<div style={{position: 'absolute', left: '36%', width: '28%', top: '8%', height: '12%', background: 'rgba(255,255,255,0.35)'}} />
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: '18%',
					bottom: 0,
					borderRadius: `${size * 0.3}px ${size * 0.3}px ${size * 0.18}px ${size * 0.18}px`,
					background: 'rgba(255,255,255,0.22)',
					border: '2px solid rgba(255,255,255,0.5)',
					overflow: 'hidden',
				}}
			>
				<div
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						bottom: 0,
						height: `${fill * 100}%`,
						background: `linear-gradient(180deg, ${liquid[0]}, ${liquid[1]})`,
					}}
				/>
				<div
					style={{
						position: 'absolute',
						left: '8%',
						right: '8%',
						top: '38%',
						padding: `${size * 0.06}px 0`,
						borderRadius: size * 0.08,
						background: 'rgba(255,255,255,0.92)',
						textAlign: 'center',
						color: '#111',
						fontFamily: theme.fonts.display,
					}}
				>
					<div style={{fontWeight: 800, fontSize: size * 0.17}}>{brand}</div>
					<div style={{fontWeight: 600, fontSize: size * 0.12, color: liquid[1]}}>{label}</div>
				</div>
				<div style={{position: 'absolute', left: '12%', top: '6%', width: '12%', bottom: '10%', borderRadius: 99, background: 'rgba(255,255,255,0.35)'}} />
			</div>
		</div>
	);
};

const BrandLogo: React.FC<{size: number; frame: number; c1: string; c2: string; name: string}> = ({size, frame, c1, c2, name}) => {
	const pop = spring({frame, fps: FPS, config: springs.bouncy});
	const ring = interpolate(frame, [0, 24], [0, 1], {...clamp, easing: (t) => 1 - Math.pow(1 - t, 3)});
	const leaf = spring({frame: frame - 10, fps: FPS, config: springs.bouncy});
	return (
		<div style={{width: size, height: size, position: 'relative', transform: `scale(${pop}) rotate(${(1 - pop) * -90}deg)`}}>
			<svg viewBox="0 0 100 100" width={size} height={size} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
				<circle cx="50" cy="50" r="46" fill="rgba(255,255,255,0.95)" />
				<circle cx="50" cy="50" r="41" fill="none" stroke={c1} strokeWidth="4" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ring} transform="rotate(-90 50 50)" />
				<g transform={`translate(50 34) scale(${leaf}) rotate(${-20 + Math.sin(frame / 10) * 6})`}>
					<path d="M0 0 C 10 -14, 24 -10, 24 -10 C 22 4, 10 8, 0 0 Z" fill="#16A34A" />
					<path d="M0 0 C -8 -12, -20 -9, -20 -9 C -18 3, -8 6, 0 0 Z" fill="#22C55E" />
				</g>
			</svg>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					paddingTop: size * 0.18,
					fontFamily: theme.fonts.display,
					fontWeight: 800,
					color: c2,
					fontSize: size * 0.19,
					lineHeight: 0.95,
					letterSpacing: -size * 0.004,
				}}
			>
				{name.split(' ').map((w) => (
					<span key={w}>{w}</span>
				))}
			</div>
		</div>
	);
};

// Logo animé + publicité animée pour une marque locale (Sawa Jus).
export const MotionResult: React.FC<ResultProps> = ({script, frame, iteration, width, height}) => {
	const {c1, c2, titleScale} = resultStyle(script, iteration);
	const {client} = script;
	// Mise en page verticale (story) ou horizontale (bannière / format carré)
	const portrait = height > width * 1.3;
	const base = Math.min(width, height);
	const tagWords = ['Frais.', 'Local.', 'Naturel.'];
	// Phase 1 : logo seul en grand ; phase 2 : il se range et la pub se déploie
	const settle = spring({frame: frame - 34, fps: FPS, config: springs.camera});
	const logoSize = interpolate(settle, [0, 1], [base * 0.62, base * (portrait ? 0.3 : 0.34)]);
	const logoX = portrait ? 0 : interpolate(settle, [0, 1], [0, -width * 0.3]);
	const logoY = portrait ? interpolate(settle, [0, 1], [0, -height * 0.34]) : interpolate(settle, [0, 1], [0, -height * 0.22]);
	const titleSize = base * (portrait ? 0.15 : 0.09) * titleScale;
	const pricePop = spring({frame: frame - 70, fps: FPS, config: springs.bouncy});

	return (
		<div
			style={{
				width,
				height,
				position: 'relative',
				overflow: 'hidden',
				background: `radial-gradient(circle at 30% 20%, ${c1}, transparent 60%), linear-gradient(160deg, ${c1}, ${c2})`,
				fontFamily: theme.fonts.display,
			}}
		>
			{/* Rayons de soleil qui tournent */}
			<div
				style={{
					position: 'absolute',
					left: '50%',
					top: '50%',
					width: base * 3,
					height: base * 3,
					marginLeft: -base * 1.5,
					marginTop: -base * 1.5,
					background: `repeating-conic-gradient(from ${frame * 0.8}deg, rgba(255,255,255,0.13) 0deg 8deg, transparent 8deg 22deg)`,
					maskImage: 'radial-gradient(circle, black 10%, transparent 55%)',
					WebkitMaskImage: 'radial-gradient(circle, black 10%, transparent 55%)',
				}}
			/>
			{/* Fruits flottants */}
			{new Array(14).fill(0).map((_, i) => {
				const s = base * (0.03 + random(`f-s-${i}`) * 0.05);
				const x = random(`f-x-${i}`) * width;
				const y = ((random(`f-y-${i}`) * height - frame * (1 + random(`f-v-${i}`) * 2)) % height + height) % height;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: x,
							top: y,
							width: s,
							height: s,
							borderRadius: '50%',
							background: FLAVORS[i % 3].liquid[0],
							boxShadow: `inset ${-s * 0.2}px ${-s * 0.2}px 0 rgba(0,0,0,0.15), 0 0 ${s}px rgba(255,255,255,0.4)`,
							opacity: 0.85,
						}}
					/>
				);
			})}
			<div
				style={{
					position: 'absolute',
					left: '50%',
					top: '50%',
					transform: `translate(-50%, -50%) translate(${logoX}px, ${logoY}px)`,
				}}
			>
				<BrandLogo size={logoSize} frame={frame} c1={c1} c2={c2} name={client.name} />
			</div>

			{/* Pub : titre cinétique, bouteilles, prix */}
			<div
				style={{
					position: 'absolute',
					left: portrait ? 0 : width * 0.08,
					right: portrait ? 0 : width * 0.42,
					top: portrait ? height * 0.27 : height * 0.4,
					textAlign: portrait ? 'center' : 'left',
					color: '#fff',
				}}
			>
				<div style={{display: 'flex', gap: titleSize * 0.25, justifyContent: portrait ? 'center' : 'flex-start', flexWrap: 'wrap'}}>
					{tagWords.map((w, i) => {
						const p = spring({frame: frame - 42 - i * 6, fps: FPS, config: springs.bouncy});
						return (
							<span
								key={w}
								style={{
									display: 'inline-block',
									fontWeight: 800,
									fontSize: titleSize,
									lineHeight: 1,
									transform: `scale(${p}) rotate(${(1 - p) * 20}deg)`,
									textShadow: `0 ${titleSize * 0.06}px 0 rgba(0,0,0,0.18)`,
								}}
							>
								{w}
							</span>
						);
					})}
				</div>
				<div style={{...enterStyle(frame, 60, 20), marginTop: base * 0.03, fontFamily: theme.fonts.body, fontWeight: 600, fontSize: base * 0.05}}>{client.tagline}</div>
			</div>
			<div
				style={{
					position: 'absolute',
					left: portrait ? 0 : width * 0.5,
					right: 0,
					bottom: portrait ? height * 0.1 : height * 0.12,
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'flex-end',
					gap: base * 0.04,
				}}
			>
				{FLAVORS.map((f, i) => (
					<Bottle key={f.name} size={base * (i === 1 ? 0.22 : 0.18)} liquid={f.liquid} label={f.name} brand={client.name} frame={frame} delay={48 + i * 5} />
				))}
			</div>
			<div
				style={{
					position: 'absolute',
					right: portrait ? width * 0.06 : width * 0.05,
					top: portrait ? height * 0.1 : height * 0.1,
					width: base * 0.24,
					height: base * 0.24,
					borderRadius: '50%',
					background: '#FACC15',
					color: '#111',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					transform: `scale(${pricePop}) rotate(${-12 + Math.sin(frame / 8) * 4}deg)`,
					boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
					fontWeight: 800,
				}}
			>
				<span style={{fontSize: base * 0.07, lineHeight: 1}}>500</span>
				<span style={{fontSize: base * 0.035}}>FCFA</span>
			</div>
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					bottom: portrait ? height * 0.035 : height * 0.03,
					textAlign: 'center',
					color: '#fff',
					fontFamily: theme.fonts.body,
					fontWeight: 700,
					fontSize: base * 0.04,
					...enterStyle(frame, 80, 20),
				}}
			>
				Disponible à Akwa et Bonapriso
			</div>
		</div>
	);
};
