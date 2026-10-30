import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {iphoneAd} from '../config';
import {nocturne} from '../theme';
import {fonts} from '../gmotion/fonts';
import {makeTypingTimes, typedCount} from '../lib/typing';
import {ease, fadeUp, glassCard, Orb, progress, Reflect, sceneFade, title} from './kit';
import {Finish, LockScreen, Phone} from './Phone';
import {T} from './timeline';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const easeRange = (frame: number, input: number[], output: number[]) => interpolate(frame, input, output, {...clamp, easing: ease});

// -----------------------------------------------------------------------------
// 0 → 2,5 s : INTRO — un halo orange s'allume, des cartes en verre défilent sur un sol brillant
const ICONS = ['◆', '▣', '◎', '⊕', '⇄'];
const IntroCard: React.FC<{label: string; icon: string; i: number}> = ({label, icon, i}) => (
	<div style={{width: 360, height: 250, padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', ...glassCard(22)}}>
		<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
			<div style={{width: 54, height: 54, borderRadius: 14, border: `1px solid ${nocturne.lineStrong}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: nocturne.text, fontSize: 26}}>{icon}</div>
			<div style={{fontFamily: fonts.body, fontSize: 18, color: nocturne.textFaint}}>0{i + 1}</div>
		</div>
		<div>
			<div style={{...title(44)}}>{label}</div>
			<div style={{marginTop: 14, height: 6, width: 120 + i * 30, borderRadius: 3, background: 'rgba(255,255,255,0.14)'}} />
			<div style={{marginTop: 8, height: 6, width: 80 + i * 18, borderRadius: 3, background: 'rgba(255,255,255,0.08)'}} />
		</div>
	</div>
);

export const IntroScene: React.FC = () => {
	const frame = useCurrentFrame();
	const d = T.intro.duration;
	const orb = progress(frame, 0, 24);
	// Travelling latéral lent le long de la rangée de cartes
	const pan = easeRange(frame, [0, d], [380, -1060]);
	return (
		<AbsoluteFill style={sceneFade(frame, d, 1, 10)}>
			<Orb x={300} y={470} size={120 * (0.6 + 0.4 * orb)} intensity={orb} />
			<AbsoluteFill style={{perspective: 1600, top: 840}}>
				<div style={{position: 'absolute', left: 0, top: 0, display: 'flex', gap: 46, transform: `translateX(${pan}px) rotateX(14deg) rotateY(-12deg)`}}>
					{iphoneAd.introCards.map((label, i) => (
						<div key={label} style={fadeUp(frame, 6 + i * 4, 22, 30)}>
							<Reflect>
								<IntroCard label={label} icon={ICONS[i]} i={i} />
							</Reflect>
						</div>
					))}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

// -----------------------------------------------------------------------------
// 2,5 → 5 s : RECHERCHE — « Jusqu'où peut aller un smartphone ? » se tape dans une barre en verre
export const SearchScene: React.FC = () => {
	const frame = useCurrentFrame();
	const s = T.search;
	const times = makeTypingTimes(iphoneAd.search, s.typingStart, s.typingDuration, 'iphone-search');
	const typed = iphoneAd.search.slice(0, typedCount(times, frame));
	const tilt = easeRange(frame, [0, s.duration], [14, 4]);
	const sweep = easeRange(frame, [0, s.duration], [-30, 120]);
	return (
		<AbsoluteFill style={{...sceneFade(frame, s.duration, 10, 10), alignItems: 'center', justifyContent: 'center', perspective: 1600}}>
			{/* Lumière orange qui passe derrière la barre */}
			<div style={{position: 'absolute', top: '44%', left: `${sweep}%`, width: 520, height: 260, marginLeft: -260, borderRadius: '50%', background: `radial-gradient(ellipse, ${nocturne.orb}AA, transparent 70%)`, filter: 'blur(30px)'}} />
			<div style={{transform: `rotateX(${tilt}deg) rotateY(-5deg)`, ...fadeUp(frame, 0, 18, 40)}}>
				<Reflect opacity={0.22}>
					<div style={{width: 880, height: 140, borderRadius: 999, display: 'flex', alignItems: 'center', gap: 22, padding: '0 36px', ...glassCard(999), border: `1.5px solid rgba(255,255,255,0.35)`}}>
						<div style={{fontSize: 46, color: nocturne.text}}>✦</div>
						<div style={{flex: 1, fontFamily: fonts.display, fontWeight: 500, fontSize: 38, color: nocturne.text, whiteSpace: 'nowrap', letterSpacing: -0.5}}>
							{typed}
							<span style={{display: 'inline-block', width: 3, height: 46, marginLeft: 3, verticalAlign: 'middle', background: nocturne.orb, opacity: Math.floor(frame / 12) % 2 === 0 ? 1 : 0}} />
						</div>
						<div style={{width: 56, height: 56, borderRadius: 14, border: `1px solid ${nocturne.lineStrong}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: nocturne.textMuted, fontSize: 28}}>↵</div>
					</div>
				</Reflect>
			</div>
		</AbsoluteFill>
	);
};

// -----------------------------------------------------------------------------
// 5 → 9 s : RÉVÉLATION — le téléphone sort de l'ombre, éclairé par le halo, et pivote lentement
export const RevealScene: React.FC = () => {
	const frame = useCurrentFrame();
	const r = T.reveal;
	const rise = progress(frame, 0, 40);
	const ry = easeRange(frame, [0, r.duration], [215, 160]);
	const light = easeRange(frame, [10, 60], [0, 1]);
	return (
		<AbsoluteFill style={sceneFade(frame, r.duration, 8, 10)}>
			<Orb x={250} y={330} size={140} intensity={0.6 + 0.4 * light} />
			<AbsoluteFill style={{alignItems: 'center', top: 330, perspective: 2200}}>
				<div style={{opacity: rise, transform: `translateY(${(1 - rise) * 160}px)`, filter: `brightness(${0.35 + 0.65 * light})`}}>
					<Reflect opacity={0.2}>
						<Phone width={400} rotateY={ry} rotateX={4} edgeLight={light} />
					</Reflect>
				</div>
			</AbsoluteFill>
			<div style={{position: 'absolute', top: 1250, left: 0, right: 0, textAlign: 'center'}}>
				<div style={{...title(96), ...fadeUp(frame, r.titleAt, 20, 30)}}>{iphoneAd.reveal.title}</div>
				<div style={{fontFamily: fonts.body, fontSize: 40, color: nocturne.textMuted, marginTop: 18, ...fadeUp(frame, r.titleAt + 8, 20, 20)}}>{iphoneAd.reveal.subtitle}</div>
			</div>
		</AbsoluteFill>
	);
};

// -----------------------------------------------------------------------------
// 9 → 12,5 s : CARACTÉRISTIQUES — calques empilés en escalier 3D, une lumière orange les traverse
const Bars: React.FC<{seed: number}> = ({seed}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: 4, height: 70}}>
		{new Array(20).fill(0).map((_, i) => (
			<div key={i} style={{width: 5, height: 10 + Math.abs(Math.sin(i * 1.7 + seed) * Math.cos(i * 0.6 + seed * 2)) * 60, borderRadius: 2, background: 'rgba(255,255,255,0.55)'}} />
		))}
	</div>
);

export const StackScene: React.FC = () => {
	const frame = useCurrentFrame();
	const st = T.stack;
	const scan = easeRange(frame, [st.scanStart, st.scanEnd], [-10, 110]);
	const percent = Math.round(easeRange(frame, [st.scanStart, st.scanEnd], [0, 100]));
	const rot = easeRange(frame, [0, st.duration], [-30, -20]);
	return (
		<AbsoluteFill style={sceneFade(frame, st.duration, 10, 10)}>
			<AbsoluteFill style={{perspective: 1800, alignItems: 'center', top: 330}}>
				<div style={{position: 'relative', width: 820, transform: `translateX(-90px) rotateY(${rot}deg) rotateX(12deg)`}}>
					{/* Indicateur de progression, comme un rendu en cours */}
					<div style={{position: 'absolute', right: 40, top: -130, width: 300, padding: '18px 24px', ...glassCard(18), ...fadeUp(frame, 4, 16, 20)}}>
						<div style={{display: 'flex', justifyContent: 'space-between', fontFamily: fonts.body, fontSize: 24, color: nocturne.textMuted}}>
							<span>{iphoneAd.featuresProgressLabel}</span>
							<span style={{color: nocturne.text, fontWeight: 600}}>{percent} %</span>
						</div>
						<div style={{marginTop: 12, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.12)'}}>
							<div style={{width: `${percent}%`, height: '100%', borderRadius: 2, background: nocturne.orb}} />
						</div>
					</div>
					{iphoneAd.features.map((f, i) => (
						<div
							key={f.title}
							style={{
								position: 'relative',
								marginLeft: i * 34,
								marginBottom: 26,
								width: 780,
								height: 170,
								padding: '0 34px',
								display: 'flex',
								alignItems: 'center',
								gap: 30,
								overflow: 'hidden',
								...glassCard(22),
								...fadeUp(frame, 6 + i * 5, 18, 40),
							}}
						>
							<div style={{flex: 1, minWidth: 0}}>
								<div style={{...title(38), whiteSpace: 'nowrap'}}>{f.title}</div>
								<div style={{fontFamily: fonts.body, fontSize: 23, color: nocturne.textMuted, marginTop: 8, whiteSpace: 'nowrap'}}>{f.detail}</div>
							</div>
							<Bars seed={i * 3.1} />
						</div>
					))}
					{/* Colonne de lumière orange qui balaie la pile */}
					<div style={{position: 'absolute', top: -60, bottom: -40, left: `${scan}%`, width: 70, marginLeft: -35, background: `linear-gradient(180deg, transparent, ${nocturne.orb}, ${nocturne.orbCore}, ${nocturne.orb}, transparent)`, filter: 'blur(18px)', mixBlendMode: 'screen', opacity: scan > -5 && scan < 105 ? 0.9 : 0}} />
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

// -----------------------------------------------------------------------------
// 12,5 → 15,5 s : ZOOM 5x — un viseur zoome de 24 mm à 120 mm sur le pont, au coucher du soleil
const CityScene: React.FC = () => (
	<div style={{position: 'absolute', inset: 0, background: `linear-gradient(180deg, #0A0706 0%, #2A120A 45%, #7A2A0E 70%, #1A0C08 71%, #0B0706 100%)`}}>
		<div style={{position: 'absolute', left: '62%', top: '52%', width: 90, height: 90, borderRadius: '50%', background: `radial-gradient(circle, ${nocturne.orbCore}, ${nocturne.orb} 60%)`, boxShadow: `0 0 80px 30px ${nocturne.orb}66`}} />
		{/* Immeubles */}
		{[
			[2, 18, 34],
			[13, 10, 26],
			[22, 14, 40],
			[78, 12, 30],
			[88, 10, 44],
		].map(([x, w, h], i) => (
			<div key={i} style={{position: 'absolute', left: `${x}%`, bottom: '29%', width: `${w}%`, height: `${h}%`, background: '#0C0807'}}>
				{new Array(6).fill(0).map((_, k) => (
					<div key={k} style={{position: 'absolute', left: `${15 + (k % 2) * 45}%`, top: `${12 + Math.floor(k / 2) * 22}%`, width: '22%', height: '7%', background: k % 3 ? '#3A1E10' : '#C9733A'}} />
				))}
			</div>
		))}
		{/* Le pont et ses arches */}
		<div style={{position: 'absolute', left: '30%', width: '46%', bottom: '31%', height: 6, background: '#120B08'}} />
		{new Array(7).fill(0).map((_, i) => (
			<div key={i} style={{position: 'absolute', left: `${30 + i * 6.6}%`, bottom: '29%', width: '5.4%', height: 22, borderRadius: '50% 50% 0 0', border: '3px solid #120B08', borderBottom: 'none'}} />
		))}
		{/* Le détail visé par le zoom : une pirogue sur le fleuve */}
		<div style={{position: 'absolute', left: '50.5%', top: '73.5%', width: 26, height: 5, borderRadius: '0 0 50% 50%', background: '#0A0605'}} />
		<div style={{position: 'absolute', left: '51.3%', top: '71.6%', width: 2, height: 8, background: '#0A0605'}} />
		<div style={{position: 'absolute', left: 0, right: 0, top: '72%', height: '1px', background: 'rgba(255,170,110,0.35)'}} />
	</div>
);

export const ZoomScene: React.FC = () => {
	const frame = useCurrentFrame();
	const z = T.zoom;
	const zoom = easeRange(frame, [z.zoomStart, z.zoomEnd], [1, 5]);
	const mm = Math.round(easeRange(frame, [z.zoomStart, z.zoomEnd], [24, 120]));
	const W = 860;
	const H = 1040;
	const bracket = (pos: React.CSSProperties, rot: number) => (
		<div style={{position: 'absolute', width: 60, height: 60, borderTop: '2px solid rgba(255,255,255,0.85)', borderLeft: '2px solid rgba(255,255,255,0.85)', transform: `rotate(${rot}deg)`, ...pos}} />
	);
	const levels = [1, 2, 3, 5];
	return (
		<AbsoluteFill style={{...sceneFade(frame, z.duration, 10, 10), alignItems: 'center', perspective: 2000}}>
			<div style={{position: 'absolute', top: 210, left: 0, right: 0, textAlign: 'center'}}>
				<div style={{...title(80), ...fadeUp(frame, 2, 18, 24)}}>{iphoneAd.zoom.title}</div>
				<div style={{fontFamily: fonts.body, fontSize: 36, color: nocturne.textMuted, marginTop: 14, ...fadeUp(frame, 8, 18, 16)}}>{iphoneAd.zoom.caption}</div>
			</div>
			<div style={{position: 'absolute', top: 470, width: W, height: H, transform: `rotateY(${easeRange(frame, [0, z.duration], [-8, 4])}deg)`, ...fadeUp(frame, 0, 20, 40)}}>
				<div style={{position: 'absolute', inset: 0, borderRadius: 28, overflow: 'hidden', border: `1px solid ${nocturne.lineStrong}`, boxShadow: '0 40px 100px rgba(0,0,0,0.7)'}}>
					<div style={{position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '51.5% 73%'}}>
						<CityScene />
					</div>
				</div>
				{/* Viseur */}
				{bracket({left: 40, top: 40}, 0)}
				{bracket({right: 40, top: 40}, 90)}
				{bracket({right: 40, bottom: 40}, 180)}
				{bracket({left: 40, bottom: 40}, 270)}
				<div style={{position: 'absolute', left: 0, right: 0, bottom: 70, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
					<div style={{fontFamily: fonts.body, fontWeight: 600, fontSize: 30, color: nocturne.text, padding: '8px 20px', borderRadius: 999, background: 'rgba(0,0,0,0.5)'}}>{mm} mm</div>
					<div style={{display: 'flex', gap: 14, padding: 8, borderRadius: 999, background: 'rgba(0,0,0,0.5)'}}>
						{levels.map((l) => {
							const active = zoom >= l - 0.5 && (l === 5 ? true : zoom < levels[levels.indexOf(l) + 1] - 0.5);
							return (
								<div key={l} style={{width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fonts.body, fontWeight: 600, fontSize: 24, color: active ? '#120804' : nocturne.text, background: active ? nocturne.orb : 'rgba(255,255,255,0.08)'}}>
									{l}x
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};

// -----------------------------------------------------------------------------
// 15,5 → 18 s : ÉCRAN ET FINITIONS — la face avant, puis les quatre finitions titane
const FINISHES: Finish[] = ['natural', 'blue', 'white', 'black'];

export const DisplayScene: React.FC = () => {
	const frame = useCurrentFrame();
	const dsp = T.display;
	const ry = easeRange(frame, [0, dsp.duration], [-14, 8]);
	return (
		<AbsoluteFill style={sceneFade(frame, dsp.duration, 10, 10)}>
			<Orb x={880} y={330} size={110} intensity={0.8} />
			<AbsoluteFill style={{alignItems: 'center', top: 220, perspective: 2200}}>
				<div style={fadeUp(frame, 0, 20, 40)}>
					<Phone width={330} rotateY={ry} screen={<LockScreen width={330} />} />
				</div>
			</AbsoluteFill>
			<div style={{position: 'absolute', top: 960, left: 0, right: 0, textAlign: 'center'}}>
				<div style={{...title(84), ...fadeUp(frame, 8, 18, 24)}}>{iphoneAd.display.title}</div>
				<div style={{fontFamily: fonts.body, fontSize: 34, color: nocturne.textMuted, marginTop: 12, ...fadeUp(frame, 14, 18, 16)}}>{iphoneAd.display.subtitle}</div>
			</div>
			<div style={{position: 'absolute', top: 1210, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 46}}>
				{FINISHES.map((f, i) => (
					<div key={f} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, ...fadeUp(frame, dsp.finishesAt + i * 5, 18, 30)}}>
						<div style={{perspective: 1200}}>
							<Phone width={150} rotateY={180 + ry * 0.5} finish={f} />
						</div>
						<div style={{fontFamily: fonts.body, fontSize: 22, color: nocturne.textMuted, whiteSpace: 'nowrap'}}>{iphoneAd.finishes[i]}</div>
					</div>
				))}
			</div>
		</AbsoluteFill>
	);
};

// -----------------------------------------------------------------------------
// 18 → 20 s : FIN — halo orange, nom du produit, bouton pilule orange, signature
export const EndScene: React.FC = () => {
	const frame = useCurrentFrame();
	const orb = progress(frame, 0, 18);
	return (
		<AbsoluteFill style={{...sceneFade(frame, 999, 8, 1), alignItems: 'center', justifyContent: 'center'}}>
			<Orb x={540} y={640} size={150 * (0.7 + 0.3 * orb)} intensity={orb} />
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 42, marginTop: 220}}>
				<div style={{...title(104), whiteSpace: 'nowrap', ...fadeUp(frame, 6, 18, 24)}}>{iphoneAd.end.title}</div>
				<div style={{padding: '22px 54px', borderRadius: 999, background: nocturne.orange, color: '#FFFFFF', fontFamily: fonts.body, fontWeight: 600, fontSize: 38, boxShadow: `0 0 50px ${nocturne.orb}66`, ...fadeUp(frame, 14, 18, 18)}}>{iphoneAd.end.button}</div>
				<div style={{fontFamily: fonts.body, fontSize: 40, color: nocturne.text, ...fadeUp(frame, 20, 18, 16)}}>{iphoneAd.end.tagline}</div>
			</div>
			<div style={{position: 'absolute', bottom: 190, left: 60, right: 60, textAlign: 'center', fontFamily: fonts.body, fontSize: 22, color: nocturne.textFaint, ...fadeUp(frame, 24, 16, 8)}}>{iphoneAd.credit}</div>
		</AbsoluteFill>
	);
};
