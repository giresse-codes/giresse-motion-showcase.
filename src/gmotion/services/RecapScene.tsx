import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {gmotionServices} from '../../config';
import {premium} from '../../theme';
import {ClientMark, ClientWordmark} from '../ClientBrand';
import {ClientProvider} from '../client';
import {fonts} from '../fonts';
import {Accent, fadeOut, fadeUp, headline} from '../premium';
import {Dashboard} from './CodeScene';
import {SiteBuild} from './WebScene';
import {S} from './timeline';

const titles = gmotionServices.titles;

/** Carte de la grille : fin liseré, libellé discret, apparition en fondu */
const Card: React.FC<{at: number; label: string; width: number; height: number; children: React.ReactNode}> = ({at, label, width, height, children}) => {
	const frame = useCurrentFrame();
	return (
		<div style={{width, ...fadeUp(frame, at, 18, 30)}}>
			<div style={{width, height, position: 'relative', borderRadius: 26, overflow: 'hidden', border: `1px solid ${premium.line}`, boxShadow: premium.shadow, background: '#0E1F3D'}}>{children}</div>
			<div style={{marginTop: 16, fontFamily: fonts.body, fontSize: 24, letterSpacing: 3, textTransform: 'uppercase', color: premium.textMuted}}>{label}</div>
		</div>
	);
};

/** Réduit un rendu de taille virtuelle pour qu'il remplisse une carte */
const Fit: React.FC<{vw: number; width: number; children: React.ReactNode}> = ({vw, width, children}) => (
	<div style={{position: 'absolute', left: 0, top: 0, width: vw, transform: `scale(${width / vw})`, transformOrigin: '0 0'}}>{children}</div>
);

// 11 → 13 s : RÉCAP — les 3 résultats en grille, « 1 studio. 3 expertises. »
export const RecapScene: React.FC = () => {
	const frame = useCurrentFrame();
	const r = S.recap;
	const [line1, line2] = gmotionServices.recap;
	const half = 450;
	return (
		<AbsoluteFill style={fadeOut(frame, r.duration - 10, 10, 24)}>
			<div style={{position: 'absolute', top: 220, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<div style={{...headline(84), ...fadeUp(frame, 0, 18, 24)}}>{line1}</div>
				<div style={{...headline(84), ...fadeUp(frame, 4, 18, 24)}}>
					<Accent text={line2} />
				</div>
			</div>
			<div style={{position: 'absolute', top: 520, left: 90, right: 90, display: 'flex', flexDirection: 'column', gap: 40}}>
				<div style={{display: 'flex', justifyContent: 'space-between'}}>
					<Card at={r.cards[0]} label={titles.motion.title} width={half} height={460}>
						<ClientProvider client={gmotionServices.motionClient}>
							<div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26}}>
								<ClientMark size={190} />
								<ClientWordmark maxSize={30} maxWidth={360} color={premium.text} />
							</div>
						</ClientProvider>
					</Card>
					<Card at={r.cards[1]} label={titles.web.title} width={half} height={460}>
						<Fit vw={390} width={half}>
							<SiteBuild frame={200} width={390} height={530} compact />
						</Fit>
					</Card>
				</div>
				<Card at={r.cards[2]} label={titles.code.title} width={900} height={420}>
					<Fit vw={900} width={900}>
						<Dashboard frame={200} />
					</Fit>
				</Card>
			</div>
		</AbsoluteFill>
	);
};
