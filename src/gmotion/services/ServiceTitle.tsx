import React from 'react';
import {useCurrentFrame} from 'remotion';
import {gmotion} from '../../config';
import {premium} from '../../theme';
import {fonts} from '../fonts';
import {Accent, Eyebrow, fadeUp, headline} from '../premium';

type Props = {index: string; title: string; subtitle: string; enterAt?: number};

// Titre d'un service : petit titre numéroté, titre SemiBold, sous-titre avec un mot clé en or.
export const ServiceTitle: React.FC<Props> = ({index, title, subtitle, enterAt = 2}) => {
	const frame = useCurrentFrame();
	return (
		<div style={{position: 'absolute', top: gmotion.safeMargin + 70, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22}}>
			<Eyebrow text={`Service ${index}`} frame={frame} at={enterAt} />
			<div style={{...headline(88), whiteSpace: 'nowrap', ...fadeUp(frame, enterAt + 4, 18, 24)}}>{title}</div>
			<div style={{fontFamily: fonts.body, fontSize: 32, color: premium.textMuted, whiteSpace: 'nowrap', ...fadeUp(frame, enterAt + 10, 18, 16)}}>
				<Accent text={subtitle} />
			</div>
		</div>
	);
};
