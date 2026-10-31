import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {config} from '../config';
import {theme} from '../theme';
import {T} from '../timeline';
import {fadeUp, progress} from '../ui/kit';

// 26 → 30 s : le logo apparaît avec un léger halo (couleurs d'origine conservées), puis la signature.
export const EndScene: React.FC = () => {
	const frame = useCurrentFrame();
	const e = T.end;
	const local = frame - e.from;
	if (local < 0) return null;
	const logo = progress(local, e.logoAt, 20);
	const size = 430;
	return (
		<AbsoluteFill style={{alignItems: 'center', fontFamily: theme.font, color: theme.text}}>
			<div style={{position: 'absolute', top: 470, width: size, height: size, opacity: logo, transform: `scale(${0.94 + 0.06 * logo})`}}>
				{/* Halo léger derrière le logo */}
				<div style={{position: 'absolute', inset: -120, borderRadius: '50%', background: `radial-gradient(circle, ${theme.halo}66 0%, ${theme.halo}22 40%, transparent 70%)`, filter: 'blur(10px)'}} />
				<Img src={staticFile(config.studio.logo)} style={{position: 'relative', width: size, height: size, borderRadius: 28, boxShadow: '0 30px 80px rgba(0,0,0,0.55)'}} />
			</div>
			<div style={{position: 'absolute', top: 960, left: 60, right: 60, textAlign: 'center'}}>
				<div style={{fontSize: 66, fontWeight: 800, letterSpacing: -1, ...fadeUp(local, e.titleAt, 16, 18)}}>{config.studio.name}</div>
				<div style={{fontSize: 36, color: theme.soft, marginTop: 18, ...fadeUp(local, e.taglineAt, 16, 14)}}>{config.studio.tagline}</div>
				<div style={{display: 'inline-block', marginTop: 44, padding: '20px 34px', borderRadius: 999, fontSize: 32, fontWeight: 700, background: 'rgba(47,107,255,0.22)', border: `1px solid ${theme.border}`, ...fadeUp(local, e.ctaAt, 16, 14)}}>{config.studio.cta}</div>
			</div>
		</AbsoluteFill>
	);
};
