import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {gmotionServices} from '../../config';
import {serviceColors, videoPalette} from '../../theme';
import {springs} from '../../lib/anim';
import {ClientMark, ClientWordmark} from '../ClientBrand';
import {ClientProvider} from '../client';
import {fonts} from '../fonts';
import {beatPulse} from '../timeline';
import {MintDashboard} from './CodeScene';
import {SiteBuild} from './WebScene';
import {S} from './timeline';

const titles = gmotionServices.titles;

/** Carte de la grille : bordure à la couleur du service, pulsation sur le beat */
const Card: React.FC<{at: number; color: string; label: string; width: number; height: number; children: React.ReactNode}> = ({at, color, label, width, height, children}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const p = spring({frame: frame - at, fps, config: springs.bouncy});
	const pulse = beatPulse(frame + S.recap.from, 4);
	return (
		<div
			style={{
				width,
				height,
				position: 'relative',
				borderRadius: 30,
				overflow: 'hidden',
				border: `3px solid ${color}`,
				boxShadow: `0 0 ${30 + 50 * pulse}px ${color}${pulse > 0.5 ? 'CC' : '77'}, 0 30px 80px rgba(0,0,0,0.6)`,
				transform: `scale(${p * (1 + 0.035 * pulse)}) rotate(${(1 - p) * 10}deg)`,
				opacity: Math.min(1, p * 1.5),
				background: '#0D0C14',
			}}
		>
			{children}
			<div
				style={{
					position: 'absolute',
					left: 16,
					bottom: 16,
					padding: '8px 18px',
					borderRadius: 999,
					background: color,
					color: '#0A0A0F',
					fontFamily: fonts.display,
					fontWeight: 900,
					fontSize: 26,
				}}
			>
				{label}
			</div>
		</div>
	);
};

/** Réduit un rendu de taille virtuelle pour qu'il remplisse une carte */
const Fit: React.FC<{vw: number; vh: number; width: number; height: number; children: React.ReactNode}> = ({vw, vh, width, height, children}) => {
	const scale = Math.max(width / vw, height / vh);
	return (
		<div style={{position: 'absolute', left: (width - vw * scale) / 2, top: 0, width: vw, height: vh, transform: `scale(${scale})`, transformOrigin: '0 0'}}>{children}</div>
	);
};

// 11 → 13 s : RÉCAP — les 3 résultats en grille, qui pulsent sur le beat.
export const RecapScene: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const r = S.recap;
	const exit = spring({frame: frame - (r.duration - 10), fps, config: springs.snappy});
	const [line1, line2] = gmotionServices.recap;
	const w1 = spring({frame: frame - 2, fps, config: springs.bouncy});
	const w2 = spring({frame: frame - 9, fps, config: springs.bouncy});
	const half = 465;

	return (
		<AbsoluteFill style={{opacity: 1 - exit, transform: `scale(${1 - exit * 0.25})`, filter: exit > 0.01 ? `blur(${exit * 16}px)` : undefined}}>
			<div style={{position: 'absolute', top: 180, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: fonts.display, fontWeight: 900, lineHeight: 1.05}}>
				<div style={{fontSize: 92, color: videoPalette.white, transform: `scale(${w1})`, opacity: Math.min(1, w1 * 1.5)}}>{line1}</div>
				<div
					style={{
						fontSize: 92,
						background: `linear-gradient(90deg, ${videoPalette.yellow}, ${videoPalette.magenta})`,
						WebkitBackgroundClip: 'text',
						backgroundClip: 'text',
						color: 'transparent',
						filter: `drop-shadow(0 0 24px ${videoPalette.magenta}AA)`,
						transform: `scale(${w2})`,
						opacity: Math.min(1, w2 * 1.5),
					}}
				>
					{line2}
				</div>
			</div>
			<div style={{position: 'absolute', top: 440, left: 60, right: 60, display: 'flex', flexDirection: 'column', gap: 30}}>
				<div style={{display: 'flex', gap: 30}}>
					<Card at={r.cards[0]} color={serviceColors.motion.main} label={titles.motion.title} width={half} height={560}>
						<ClientProvider client={gmotionServices.motionClient}>
							<div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, paddingBottom: 60, background: `radial-gradient(circle, ${serviceColors.motion.main}55, transparent 70%)`}}>
								<div style={{transform: `rotate(${Math.sin(frame / 10) * 8}deg)`}}>
									<ClientMark size={230} />
								</div>
								<ClientWordmark maxSize={56} maxWidth={400} />
							</div>
						</ClientProvider>
					</Card>
					<Card at={r.cards[1]} color={serviceColors.web.second} label={titles.web.title} width={half} height={560}>
						<Fit vw={390} vh={560 * (390 / half)} width={half} height={560}>
							<SiteBuild frame={200} width={390} height={560 * (390 / half)} compact />
						</Fit>
					</Card>
				</div>
				<Card at={r.cards[2]} color={serviceColors.code.main} label={titles.code.title} width={960} height={560}>
					<Fit vw={960} vh={560} width={960} height={560}>
						<div style={{transform: 'translateY(-20px)'}}>
							<MintDashboard frame={200 + frame} />
						</div>
					</Fit>
				</Card>
			</div>
		</AbsoluteFill>
	);
};
