import React from 'react';
import {getStaticFiles, Img, staticFile} from 'remotion';
import {config} from '../config';

/** Proportions d'un iPhone 13 : 71,5 × 146,7 mm */
export const IPHONE13_RATIO = 146.7 / 71.5;

const hasFile = (name: string) => {
	try {
		return getStaticFiles().some((f) => f.name === name);
	} catch {
		return false;
	}
};

/**
 * Téléphone réaliste (iPhone 13) : cadre aluminium, écran bord à bord avec encoche,
 * boutons latéraux et reflet. Si public/iphone-13.png existe, il est posé par-dessus
 * comme cadre (l'écran doit y être transparent).
 */
export const Phone: React.FC<{width: number; children: React.ReactNode}> = ({width, children}) => {
	const height = width * IPHONE13_RATIO;
	const bezel = width * 0.045;
	const frameImage = hasFile(config.phone.frameImage);
	const button = (side: 'left' | 'right', top: number, h: number) => (
		<div style={{position: 'absolute', [side]: -width * 0.012, top: height * top, width: width * 0.014, height: height * h, borderRadius: 3, background: 'linear-gradient(90deg, #3A4560, #1B2238)'}} />
	);
	return (
		<div style={{position: 'relative', width, height}}>
			{!frameImage && (
				<>
					{button('left', 0.155, 0.035)}
					{button('left', 0.225, 0.065)}
					{button('left', 0.305, 0.065)}
					{button('right', 0.245, 0.1)}
				</>
			)}
			{/* Cadre aluminium */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					borderRadius: width * 0.165,
					background: frameImage ? 'transparent' : 'linear-gradient(135deg, #4A5674 0%, #1E263D 35%, #2C3652 70%, #141A2C 100%)',
					padding: frameImage ? 0 : width * 0.012,
					boxShadow: frameImage ? 'none' : '0 50px 100px rgba(0,0,0,0.6), 0 0 80px rgba(47,107,255,0.25)',
				}}
			>
				{/* Verre noir + écran */}
				<div style={{position: 'relative', width: '100%', height: '100%', borderRadius: width * 0.153, background: '#000', padding: bezel - width * 0.012}}>
					<div style={{position: 'relative', width: '100%', height: '100%', borderRadius: width * 0.12, overflow: 'hidden', background: '#0B1024'}}>
						{children}
						{!frameImage && (
							// Encoche
							<div style={{position: 'absolute', left: '50%', top: 0, width: width * 0.4, height: width * 0.075, transform: 'translateX(-50%)', borderRadius: `0 0 ${width * 0.05}px ${width * 0.05}px`, background: '#000'}}>
								<div style={{position: 'absolute', left: '62%', top: '30%', width: width * 0.03, height: width * 0.03, borderRadius: '50%', background: '#0D1424'}} />
								<div style={{position: 'absolute', left: '36%', top: '18%', width: width * 0.1, height: width * 0.012, borderRadius: 99, background: '#151B2C'}} />
							</div>
						)}
						{/* Reflet sur l'écran */}
						<div style={{position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(118deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.04) 26%, transparent 40%)'}} />
					</div>
				</div>
			</div>
			{frameImage && <Img src={staticFile(config.phone.frameImage)} style={{position: 'absolute', inset: 0, width, height}} />}
		</div>
	);
};
