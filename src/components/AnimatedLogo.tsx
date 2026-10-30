import React from 'react';
import {Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {theme} from '../theme';
import {clamp, springs} from '../lib/anim';

// Logo animé : anneau en dégradé, tracé du monogramme dessiné puis rebond.
export const AnimatedLogo: React.FC<{size: number; delay?: number}> = ({size, delay = 0}) => {
	const frame = useCurrentFrame() - delay;
	const {fps} = useVideoConfig();
	const pop = spring({frame, fps, config: springs.bouncy});
	const draw = interpolate(frame, [0, 16], [0, 1], {...clamp, easing: (t) => 1 - Math.pow(1 - t, 3)});
	const [c1, c2, c3] = theme.logo.gradient;
	const id = `logo-grad-${size}`;

	if (theme.logo.image) {
		return (
			<Img
				src={staticFile(theme.logo.image)}
				style={{width: size, height: size, objectFit: 'contain', transform: `scale(${pop}) rotate(${(1 - pop) * -30}deg)`}}
			/>
		);
	}

	return (
		<div style={{width: size, height: size, transform: `scale(${pop}) rotate(${(1 - pop) * -60}deg)`, filter: `drop-shadow(0 0 ${size * 0.15}px ${c2})`}}>
			<svg viewBox="0 0 100 100" width={size} height={size}>
				<defs>
					<linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
						<stop offset="0%" stopColor={c1} />
						<stop offset="50%" stopColor={c2} />
						<stop offset="100%" stopColor={c3} />
					</linearGradient>
				</defs>
				<rect x="4" y="4" width="92" height="92" rx="26" fill="rgba(11,14,31,0.9)" stroke={`url(#${id})`} strokeWidth="3" />
				<circle
					cx="50"
					cy="50"
					r="40"
					fill="none"
					stroke={`url(#${id})`}
					strokeWidth="1.5"
					strokeDasharray="6 10"
					transform={`rotate(${frame * 6} 50 50)`}
					opacity={0.6}
				/>
				<path
					d={theme.logo.path}
					fill="none"
					stroke={`url(#${id})`}
					strokeWidth="9"
					strokeLinecap="round"
					strokeLinejoin="round"
					pathLength={1}
					strokeDasharray={1}
					strokeDashoffset={1 - draw}
				/>
			</svg>
		</div>
	);
};
