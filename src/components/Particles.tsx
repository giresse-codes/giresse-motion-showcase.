import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {theme} from '../theme';
import {useLayout} from '../lib/layout';
import {clamp} from '../lib/anim';

type Props = {
	count?: number;
	seed?: string;
	/** 'drift' : poussière lumineuse qui flotte ; 'burst' : explosion depuis le centre */
	mode?: 'drift' | 'burst';
	/** Image de départ de l'explosion (mode burst) */
	burstAt?: number;
	opacity?: number;
	colors?: string[];
};

// Particules lumineuses déterministes (identiques à chaque rendu).
export const Particles: React.FC<Props> = ({
	count = 50,
	seed = 'p',
	mode = 'drift',
	burstAt = 0,
	opacity = 1,
	colors = [theme.colors.cyan, theme.colors.violet, theme.colors.blue, '#ffffff'],
}) => {
	const frame = useCurrentFrame();
	const {width, height, u} = useLayout();

	const particles = useMemo(
		() =>
			new Array(count).fill(0).map((_, i) => ({
				x: random(`${seed}-x-${i}`),
				y: random(`${seed}-y-${i}`),
				size: 2 + random(`${seed}-s-${i}`) * 6,
				speed: 0.3 + random(`${seed}-v-${i}`) * 1.2,
				angle: random(`${seed}-a-${i}`) * Math.PI * 2,
				phase: random(`${seed}-ph-${i}`) * Math.PI * 2,
				color: colors[Math.floor(random(`${seed}-c-${i}`) * colors.length)],
			})),
		[count, seed, colors],
	);

	return (
		<AbsoluteFill style={{pointerEvents: 'none', opacity}}>
			{particles.map((p, i) => {
				let x: number;
				let y: number;
				let alpha: number;
				let scale = 1;
				if (mode === 'drift') {
					x = p.x * width + Math.sin(frame / 40 + p.phase) * 30 * u;
					y = ((p.y * height - frame * p.speed * 2 * u) % height + height) % height;
					alpha = 0.35 + 0.65 * Math.abs(Math.sin(frame / 25 + p.phase));
				} else {
					const local = frame - burstAt;
					const prog = interpolate(local, [0, 50], [0, 1], clamp);
					const eased = 1 - Math.pow(1 - prog, 3);
					const dist = eased * (0.25 + p.speed * 0.45) * Math.max(width, height) * 0.6;
					x = width / 2 + Math.cos(p.angle) * dist;
					y = height / 2 + Math.sin(p.angle) * dist + local * local * 0.02 * u;
					alpha = local < 0 ? 0 : interpolate(local, [0, 4, 40, 60], [0, 1, 0.7, 0], clamp);
					scale = 1 + (1 - prog) * 1.5;
				}
				const s = p.size * u * scale;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: x - s / 2,
							top: y - s / 2,
							width: s,
							height: s,
							borderRadius: '50%',
							background: p.color,
							opacity: alpha,
							boxShadow: `0 0 ${s * 3}px ${s}px ${p.color}`,
						}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};
