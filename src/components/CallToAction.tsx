import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {theme} from '../theme';
import {brand} from '../config';
import {useLayout} from '../lib/layout';
import {clamp, springs} from '../lib/anim';
import {AnimatedLogo} from './AnimatedLogo';

const WhatsAppIcon: React.FC<{size: number}> = ({size}) => (
	<svg viewBox="0 0 24 24" width={size} height={size} fill="none">
		<path d="M12 2.5a9.5 9.5 0 0 0-8.2 14.3L2.5 21.5l4.8-1.3A9.5 9.5 0 1 0 12 2.5Z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
		<path
			d="M8.6 7.6c.3-.6.6-.6.9-.6h.6c.2 0 .5 0 .7.5l.9 2.1c.1.2.1.5-.1.7l-.6.7c-.2.2-.2.4 0 .6.8 1.4 1.8 2.3 3.2 3 .3.1.5.1.6-.1l.8-1c.2-.2.4-.2.7-.1l2 .9c.3.1.4.3.4.5 0 .9-.6 1.8-1.5 2.1-1 .3-2.4.2-4.4-.8-2.3-1.2-3.9-3.4-4.4-4.4-.6-1.2-.4-2.6.2-3.6Z"
			fill="white"
		/>
	</svg>
);

type Props = {name?: string; services?: string; whatsapp?: string};

// Appel à l'action : nom, services, contact WhatsApp et logo animé.
export const CallToAction: React.FC<Props> = ({name = brand.name, services = brand.services, whatsapp = brand.whatsapp}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {isVertical, u} = useLayout();
	const s = (delay: number) => spring({frame: frame - delay, fps, config: springs.bouncy});
	const nameP = s(3);
	const servP = s(6);
	const waP = s(9);
	const shine = interpolate(frame, [10, 28], [-30, 130], clamp);
	const glowPulse = 0.6 + 0.4 * Math.sin(frame / 3);
	const serviceList = services.split(',').map((x) => x.trim());

	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: (isVertical ? 40 : 26) * u}}>
			<AnimatedLogo size={(isVertical ? 230 : 170) * u} />
			<div
				style={{
					fontFamily: theme.fonts.display,
					fontWeight: 800,
					fontSize: (isVertical ? 130 : 110) * u,
					lineHeight: 1,
					letterSpacing: -3 * u,
					background: `linear-gradient(120deg, #fff 30%, ${theme.colors.cyan} 60%, ${theme.colors.violet})`,
					WebkitBackgroundClip: 'text',
					backgroundClip: 'text',
					color: 'transparent',
					transform: `translateY(${(1 - nameP) * 60 * u}px) scale(${0.7 + 0.3 * nameP})`,
					opacity: Math.min(1, nameP * 1.4),
					filter: `drop-shadow(0 0 ${30 * u}px rgba(139,92,246,0.6))`,
				}}
			>
				{name}
			</div>
			<div
				style={{
					display: 'flex',
					flexWrap: 'wrap',
					justifyContent: 'center',
					gap: 14 * u,
					maxWidth: (isVertical ? 960 : 1500) * u,
					transform: `translateY(${(1 - servP) * 40 * u}px)`,
					opacity: Math.min(1, servP * 1.4),
				}}
			>
				{serviceList.map((sv, i) => (
					<div
						key={sv}
						style={{
							padding: `${12 * u}px ${26 * u}px`,
							borderRadius: 999,
							background: theme.colors.glassStrong,
							border: `1px solid ${theme.colors.glassBorder}`,
							backdropFilter: 'blur(14px)',
							color: theme.colors.text,
							fontFamily: theme.fonts.body,
							fontWeight: 600,
							fontSize: (isVertical ? 38 : 34) * u,
							transform: `scale(${s(6 + i * 2)})`,
						}}
					>
						{sv}
					</div>
				))}
			</div>
			<div
				style={{
					position: 'relative',
					overflow: 'hidden',
					display: 'flex',
					alignItems: 'center',
					gap: 22 * u,
					padding: `${22 * u}px ${44 * u}px`,
					borderRadius: 999,
					background: `linear-gradient(135deg, ${theme.colors.whatsapp}, #128C7E)`,
					boxShadow: `0 0 ${60 * glowPulse * u}px rgba(37,211,102,0.75), 0 ${20 * u}px ${50 * u}px rgba(0,0,0,0.5)`,
					transform: `scale(${waP})`,
					color: 'white',
					fontFamily: theme.fonts.display,
				}}
			>
				<WhatsAppIcon size={(isVertical ? 70 : 60) * u} />
				<div style={{display: 'flex', flexDirection: 'column'}}>
					<span style={{fontSize: (isVertical ? 30 : 26) * u, fontWeight: 600, opacity: 0.9}}>{brand.ctaButton}</span>
					<span style={{fontSize: (isVertical ? 66 : 56) * u, fontWeight: 800, letterSpacing: 1 * u}}>{whatsapp}</span>
				</div>
				<div
					style={{
						position: 'absolute',
						top: 0,
						bottom: 0,
						left: `${shine}%`,
						width: '22%',
						background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)',
						transform: 'skewX(-20deg)',
					}}
				/>
			</div>
		</AbsoluteFill>
	);
};
