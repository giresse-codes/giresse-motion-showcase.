import React from 'react';
import {AbsoluteFill, Freeze, useCurrentFrame} from 'remotion';
import {AdSound, AdVisual} from './GiresseAd';
import {FREEZE_AT} from './timeline';
import {Header} from './ui/kit';

// Écran (orientation portrait) : la pub 1080x1920 y est affichée à l'échelle
const SCREEN_W = 820;
const SCREEN_H = (SCREEN_W * 1920) / 1080;
const BEZEL = 22;

/** Légère dérive de caméra à main levée, très douce */
const useHandheld = () => {
	const frame = useCurrentFrame();
	const f = Math.min(frame, FREEZE_AT);
	return {
		x: Math.sin(f / 47) * 6 + Math.sin(f / 13) * 1.2,
		y: Math.cos(f / 53) * 5 + Math.cos(f / 17) * 1,
		r: Math.sin(f / 61) * 0.35,
	};
};

// Variante : la même pub, comme filmée sur un écran d'ordinateur dans une pièce sombre.
export const GiresseAdFilmed: React.FC = () => {
	const cam = useHandheld();
	const frame = useCurrentFrame();
	const flicker = 0.92 + 0.04 * Math.sin(Math.min(frame, FREEZE_AT) / 5);
	return (
		<AbsoluteFill style={{background: '#020308', overflow: 'hidden'}}>
			<AbsoluteFill style={{transform: `translate(${cam.x}px, ${cam.y}px) rotate(${cam.r}deg) scale(1.04)`}}>
				{/* Mur sombre éclairé par l'écran */}
				<AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 50% at 50% 42%, rgba(30,50,110,0.45), rgba(4,6,14,1) 75%)'}} />
				{/* Bureau : reflet bleu de l'écran */}
				<div style={{position: 'absolute', left: -100, right: -100, top: 1640, bottom: -100, background: 'linear-gradient(180deg, #0B0F1C 0%, #05070E 100%)', borderTop: '1px solid rgba(140,170,255,0.08)'}}>
					<div style={{position: 'absolute', left: '50%', top: 0, width: 900, height: 260, marginLeft: -450, background: `radial-gradient(ellipse at 50% 0%, rgba(47,107,255,${0.38 * flicker}), transparent 70%)`, filter: 'blur(14px)'}} />
				</div>
				{/* Moniteur en légère perspective */}
				<AbsoluteFill style={{perspective: 2200, alignItems: 'center'}}>
					<div style={{position: 'absolute', top: 120, transform: 'rotateY(-9deg) rotateX(3deg)', transformStyle: 'preserve-3d'}}>
						<div style={{position: 'relative', width: SCREEN_W + BEZEL * 2, height: SCREEN_H + BEZEL * 2, borderRadius: 26, padding: BEZEL, background: 'linear-gradient(135deg, #2A2F3C, #0E1118 60%, #1A1E28)', boxShadow: `0 0 120px rgba(47,107,255,${0.35 * flicker}), 0 60px 120px rgba(0,0,0,0.8)`}}>
							<div style={{position: 'relative', width: SCREEN_W, height: SCREEN_H, overflow: 'hidden', borderRadius: 6, background: '#000'}}>
								<div style={{width: 1080, height: 1920, transform: `scale(${SCREEN_W / 1080})`, transformOrigin: '0 0'}}>
									<AdVisual showHeader={false} />
								</div>
								{/* Reflet sur la dalle et légère trame d'écran */}
								<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(115deg, rgba(255,255,255,0.08) 0%, transparent 30%, transparent 75%, rgba(255,255,255,0.03) 100%)'}} />
								<div style={{position: 'absolute', inset: 0, opacity: 0.06, background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.5) 0px, transparent 1px, transparent 3px)'}} />
							</div>
						</div>
						{/* Pied du moniteur */}
						<div style={{position: 'absolute', left: '50%', bottom: -60, width: 160, height: 60, marginLeft: -80, background: 'linear-gradient(180deg, #151923, #0B0E15)'}} />
					</div>
				</AbsoluteFill>
				{/* Vignettage */}
				<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(0,0,0,0.75) 100%)'}} />
			</AbsoluteFill>
			{/* Entête par-dessus l'image filmée */}
			<Freeze frame={FREEZE_AT} active={(f) => f >= FREEZE_AT}>
				<Header />
			</Freeze>
			<AdSound />
		</AbsoluteFill>
	);
};
