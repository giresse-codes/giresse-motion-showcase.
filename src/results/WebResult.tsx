import React from 'react';
import {interpolate, random} from 'remotion';
import {theme} from '../theme';
import {clamp} from '../lib/anim';
import {enterStyle, ResultProps, resultStyle} from './shared';

// Silhouette de la ville (immeubles avec fenêtres éclairées)
const Skyline: React.FC<{width: number; height: number; frame: number; c1: string; c2: string}> = ({width, height, frame, c1, c2}) => {
	const buildings = new Array(11).fill(0).map((_, i) => ({
		w: 0.06 + random(`bw-${i}`) * 0.07,
		h: 0.35 + random(`bh-${i}`) * 0.6,
	}));
	let x = 0;
	return (
		<div style={{position: 'absolute', left: 0, bottom: 0, width, height}}>
			<div
				style={{
					position: 'absolute',
					right: width * 0.12,
					top: height * 0.02,
					width: height * 0.32,
					height: height * 0.32,
					borderRadius: '50%',
					background: `radial-gradient(circle, #fff7, ${c2} 45%, transparent 70%)`,
					filter: 'blur(2px)',
				}}
			/>
			{buildings.map((b, i) => {
				const left = x;
				x += b.w * width + 6;
				const rise = interpolate(frame, [i * 2, i * 2 + 20], [height, 0], {...clamp, easing: (t) => 1 - Math.pow(1 - t, 3)});
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left,
							bottom: 0,
							width: b.w * width,
							height: b.h * height,
							transform: `translateY(${rise}px)`,
							borderRadius: '10px 10px 0 0',
							background: `linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.03))`,
							border: '1px solid rgba(255,255,255,0.18)',
							backdropFilter: 'blur(6px)',
							display: 'grid',
							gridTemplateColumns: 'repeat(3, 1fr)',
							gap: 6,
							padding: 10,
							alignContent: 'start',
						}}
					>
						{new Array(Math.floor(b.h * 14)).fill(0).map((__, k) => (
							<div
								key={k}
								style={{
									height: 8,
									borderRadius: 2,
									background: random(`win-${i}-${k}`) > 0.45 ? (k % 3 ? '#FDE68A' : c1) : 'rgba(255,255,255,0.08)',
									opacity: 0.4 + 0.6 * Math.abs(Math.sin(frame / 20 + i + k)),
								}}
							/>
						))}
					</div>
				);
			})}
		</div>
	);
};

const ListingCard: React.FC<{title: string; price: string; i: number; frame: number; c1: string; c2: string; compact: boolean}> = ({title, price, i, frame, c1, c2, compact}) => {
	const e = enterStyle(frame, 26 + i * 6, 60);
	const float = Math.sin(frame / 18 + i) * 4;
	return (
		<div
			style={{
				...e,
				transform: `${e.transform} translateY(${float}px)`,
				flex: 1,
				borderRadius: 24,
				overflow: 'hidden',
				background: 'rgba(255,255,255,0.06)',
				border: '1px solid rgba(255,255,255,0.14)',
				boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
			}}
		>
			<div
				style={{
					height: compact ? 110 : 150,
					background: `linear-gradient(${120 + i * 40}deg, ${c1}, ${c2})`,
					position: 'relative',
				}}
			>
				<div style={{position: 'absolute', left: '18%', bottom: 0, width: '40%', height: '62%', background: 'rgba(255,255,255,0.22)', borderRadius: '8px 8px 0 0'}} />
				<div style={{position: 'absolute', left: '52%', bottom: 0, width: '30%', height: '42%', background: 'rgba(255,255,255,0.32)', borderRadius: '8px 8px 0 0'}} />
				<div style={{position: 'absolute', top: 12, right: 12, padding: '4px 12px', borderRadius: 999, background: 'rgba(0,0,0,0.45)', color: '#fff', fontSize: 14, fontWeight: 700}}>
					À la une
				</div>
			</div>
			<div style={{padding: compact ? 14 : 18}}>
				<div style={{color: '#fff', fontWeight: 700, fontSize: compact ? 18 : 22}}>{title}</div>
				<div style={{color: theme.colors.textMuted, fontSize: compact ? 14 : 16, marginTop: 4}}>{price}</div>
			</div>
		</div>
	);
};

const PRICES = ['450 M FCFA · 5 ch.', '280 M FCFA · 4 ch.', '190 M FCFA · 3 ch.'];

// Site vitrine premium et responsive pour une entreprise de Douala.
export const WebResult: React.FC<ResultProps> = ({script, frame, iteration, width, height}) => {
	const {c1, c2, gradient, titleScale} = resultStyle(script, iteration);
	const compact = width < 800;
	const {client} = script;
	const pad = compact ? 22 : 64;
	const titleSize = (compact ? 40 : 76) * titleScale;
	const words = client.tagline.split(' ');

	return (
		<div
			style={{
				width,
				height,
				position: 'relative',
				overflow: 'hidden',
				background: `radial-gradient(ellipse at 80% 0%, ${c1}55, transparent 55%), radial-gradient(ellipse at 0% 100%, ${c2}44, transparent 50%), #070814`,
				fontFamily: theme.fonts.body,
				color: '#fff',
			}}
		>
			{/* Barre de navigation */}
			<div style={{...enterStyle(frame, 2, -30), display: 'flex', alignItems: 'center', padding: `${compact ? 18 : 26}px ${pad}px`, gap: 24}}>
				<div style={{width: compact ? 30 : 38, height: compact ? 30 : 38, borderRadius: 10, background: gradient, boxShadow: `0 0 20px ${c1}`}} />
				<div style={{fontFamily: theme.fonts.display, fontWeight: 800, fontSize: compact ? 18 : 24}}>{client.name}</div>
				<div style={{flex: 1}} />
				{compact ? (
					<div style={{display: 'flex', flexDirection: 'column', gap: 5}}>
						{[0, 1, 2].map((i) => (
							<div key={i} style={{width: 26, height: 3, borderRadius: 2, background: '#fff'}} />
						))}
					</div>
				) : (
					<>
						{['Biens', 'Services', 'Quartiers', 'Contact'].map((l) => (
							<div key={l} style={{color: theme.colors.textMuted, fontSize: 18, fontWeight: 500}}>
								{l}
							</div>
						))}
						<div style={{padding: '12px 24px', borderRadius: 999, background: gradient, fontWeight: 700, fontSize: 16}}>Prendre RDV</div>
					</>
				)}
			</div>

			{/* Section héro */}
			<div style={{display: 'flex', flexDirection: compact ? 'column' : 'row', padding: `${compact ? 14 : 40}px ${pad}px`, gap: compact ? 20 : 40}}>
				<div style={{flex: 1.1}}>
					<div
						style={{
							...enterStyle(frame, 6, 20),
							display: 'inline-block',
							padding: '8px 16px',
							borderRadius: 999,
							border: `1px solid ${c1}`,
							color: '#fff',
							background: `${c1}22`,
							fontSize: compact ? 13 : 16,
							fontWeight: 600,
						}}
					>
						★ {client.sector} premium · {client.district}, Douala
					</div>
					<div
						style={{
							marginTop: compact ? 14 : 24,
							fontFamily: theme.fonts.display,
							fontWeight: 800,
							fontSize: titleSize,
							lineHeight: 1.02,
							letterSpacing: -0.03 * titleSize,
						}}
					>
						{words.map((w, i) => (
							<span
								key={i}
								style={{
									display: 'inline-block',
									marginRight: '0.25em',
									...enterStyle(frame, 10 + i * 3, 50),
									...(i >= words.length - 1
										? {background: gradient, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}
										: {}),
								}}
							>
								{w}
							</span>
						))}
					</div>
					<div style={{...enterStyle(frame, 20), marginTop: compact ? 12 : 22, color: theme.colors.textMuted, fontSize: compact ? 15 : 21, lineHeight: 1.5, maxWidth: 560}}>
						Villas, appartements et bureaux d’exception, sélectionnés pour vous à Bonapriso, Akwa et Bonanjo.
					</div>
					<div style={{...enterStyle(frame, 24), display: 'flex', gap: 14, marginTop: compact ? 16 : 30}}>
						<div style={{padding: compact ? '12px 20px' : '16px 32px', borderRadius: 999, background: gradient, fontWeight: 700, fontSize: compact ? 15 : 19, boxShadow: `0 10px 40px ${c1}88`}}>
							Voir les biens →
						</div>
						<div style={{padding: compact ? '12px 20px' : '16px 32px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.25)', fontWeight: 600, fontSize: compact ? 15 : 19}}>
							WhatsApp
						</div>
					</div>
				</div>
				<div
					style={{
						flex: 1,
						height: compact ? 190 : 380,
						borderRadius: 32,
						position: 'relative',
						overflow: 'hidden',
						background: `linear-gradient(160deg, ${c1}AA, ${c2}55 60%, #0B0E1F)`,
						border: '1px solid rgba(255,255,255,0.16)',
						boxShadow: `0 30px 80px ${c1}55`,
						...enterStyle(frame, 8, 80),
					}}
				>
					<Skyline width={compact ? width - pad * 2 : 600} height={compact ? 190 : 380} frame={frame} c1={c1} c2={c2} />
					<div
						style={{
							position: 'absolute',
							left: 20,
							bottom: 20,
							padding: '12px 18px',
							borderRadius: 18,
							background: 'rgba(10,12,28,0.6)',
							backdropFilter: 'blur(14px)',
							border: '1px solid rgba(255,255,255,0.18)',
							fontSize: compact ? 13 : 16,
							...enterStyle(frame, 34, 20),
						}}
					>
						<div style={{fontWeight: 700}}>+120 biens vendus</div>
						<div style={{color: theme.colors.textMuted}}>Note clients 4,9/5 ★★★★★</div>
					</div>
				</div>
			</div>

			{/* Biens à la une */}
			<div style={{display: 'flex', flexDirection: 'row', gap: compact ? 12 : 24, padding: `${compact ? 4 : 10}px ${pad}px`}}>
				{client.details.slice(0, compact ? 2 : 3).map((d, i) => (
					<ListingCard key={d} title={d} price={PRICES[i]} i={i} frame={frame} c1={c1} c2={c2} compact={compact} />
				))}
			</div>
		</div>
	);
};
