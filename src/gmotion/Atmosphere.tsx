import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {premium} from '../theme';

// Fond bleu nuit avec un dégradé très léger et une lumière douce qui dérive lentement.
export const PremiumBackground: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / 30;
	const x = 30 + Math.sin(t * 0.25) * 8;
	const y = 22 + Math.cos(t * 0.2) * 5;
	return (
		<AbsoluteFill style={{background: `linear-gradient(180deg, ${premium.bg} 0%, ${premium.bgEnd} 100%)`}}>
			<AbsoluteFill style={{background: `radial-gradient(ellipse 70% 45% at ${x}% ${y}%, rgba(47,111,214,0.16), transparent 70%)`}} />
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(4,10,22,0.45) 100%)'}} />
		</AbsoluteFill>
	);
};

// Grain argentique très léger (bruit SVG qui change à chaque image).
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.05}) => {
	const frame = useCurrentFrame();
	const seed = Math.floor(random(`grain-${frame}`) * 1000);
	return (
		<AbsoluteFill style={{pointerEvents: 'none', opacity, mixBlendMode: 'overlay'}}>
			<svg width="100%" height="100%">
				<filter id="gm-grain">
					<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} stitchTiles="stitch" />
					<feColorMatrix type="saturate" values="0" />
				</filter>
				<rect width="100%" height="100%" filter="url(#gm-grain)" />
			</svg>
		</AbsoluteFill>
	);
};
