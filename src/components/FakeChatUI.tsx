import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {theme} from '../theme';
import {useLayout} from '../lib/layout';
import {clamp, springs} from '../lib/anim';
import {makeTypingTimes, typedCount} from '../lib/typing';

type Props = {
	prompt: string;
	typingStart?: number;
	typingDuration?: number;
	/** Image où le message est envoyé (bulle + « réflexion ») */
	sendAt?: number;
	/** Version compacte flottante, utilisée pour l'itération */
	compact?: boolean;
	width?: number;
	seed?: string;
};

const Cursor: React.FC<{frame: number; height: number}> = ({frame, height}) => (
	<span
		style={{
			display: 'inline-block',
			width: Math.max(3, height * 0.08),
			height,
			marginLeft: 4,
			verticalAlign: 'text-bottom',
			background: theme.colors.accent,
			boxShadow: `0 0 12px ${theme.colors.accent}`,
			opacity: Math.floor(frame / 8) % 2 === 0 ? 1 : 0.15,
		}}
	/>
);

// Interface de chat sombre et élégante (glassmorphism) avec frappe caractère par caractère.
export const FakeChatUI: React.FC<Props> = ({
	prompt,
	typingStart = 6,
	typingDuration = 60,
	sendAt = 72,
	compact = false,
	width,
	seed = 'chat',
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {isVertical, u} = useLayout();
	const times = makeTypingTimes(prompt, typingStart, typingDuration, seed);
	const count = typedCount(times, frame);
	const typed = prompt.slice(0, count);
	const sent = frame >= sendAt;

	const enter = spring({frame, fps, config: springs.soft});
	const bubble = spring({frame: frame - sendAt, fps, config: springs.bouncy});
	const press = interpolate(frame, [sendAt - 3, sendAt, sendAt + 4], [1, 0.82, 1], clamp);

	const w = width ?? (compact ? (isVertical ? 900 : 1000) : isVertical ? 940 : 1180) * u;
	const fs = (compact ? (isVertical ? 34 : 30) : isVertical ? 38 : 34) * u;
	const pad = 28 * u;

	const glass: React.CSSProperties = {
		background: 'linear-gradient(145deg, rgba(30,34,64,0.72), rgba(12,14,30,0.78))',
		border: `1px solid ${theme.colors.glassBorder}`,
		backdropFilter: 'blur(24px)',
		WebkitBackdropFilter: 'blur(24px)',
		boxShadow: `0 ${30 * u}px ${80 * u}px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.12), 0 0 ${60 * u}px rgba(139,92,246,0.25)`,
	};

	const inputBox = (
		<div
			style={{
				display: 'flex',
				alignItems: 'flex-end',
				gap: 18 * u,
				padding: `${22 * u}px ${24 * u}px`,
				borderRadius: 22 * u,
				background: 'rgba(5,6,15,0.6)',
				border: `1px solid ${sent ? theme.colors.glassBorder : 'rgba(34,211,238,0.45)'}`,
				boxShadow: sent ? 'none' : `0 0 ${30 * u}px rgba(34,211,238,0.18)`,
			}}
		>
			<div
				style={{
					flex: 1,
					fontFamily: theme.fonts.body,
					fontSize: fs,
					lineHeight: 1.4,
					color: sent ? theme.colors.textDim : theme.colors.text,
					minHeight: fs * 1.4,
				}}
			>
				{sent ? (
					<span>Écris ton prochain prompt…</span>
				) : (
					<>
						{typed}
						<Cursor frame={frame} height={fs * 1.2} />
					</>
				)}
			</div>
			<div
				style={{
					width: fs * 1.8,
					height: fs * 1.8,
					borderRadius: '50%',
					flexShrink: 0,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					background: `linear-gradient(135deg, ${theme.colors.blue}, ${theme.colors.violet})`,
					transform: `scale(${press})`,
					boxShadow: `0 0 ${(frame > sendAt - 10 && !sent ? 40 : 16) * u}px rgba(139,92,246,0.8)`,
					color: 'white',
					fontSize: fs * 0.9,
					fontWeight: 800,
				}}
			>
				↑
			</div>
		</div>
	);

	if (compact) {
		return (
			<div
				style={{
					width: w,
					padding: pad * 0.7,
					borderRadius: 30 * u,
					transform: `translateY(${(1 - enter) * 80 * u}px) scale(${0.9 + enter * 0.1})`,
					opacity: enter,
					...glass,
				}}
			>
				{inputBox}
			</div>
		);
	}

	const dots = [0, 1, 2].map((i) => 0.3 + 0.7 * Math.abs(Math.sin((frame - sendAt) / 5 - i * 0.6)));

	return (
		<div
			style={{
				width: w,
				borderRadius: 36 * u,
				overflow: 'hidden',
				transform: `perspective(${1600 * u}px) rotateX(${(1 - enter) * 18}deg) translateY(${(1 - enter) * 160 * u}px) scale(${0.85 + 0.15 * enter})`,
				opacity: enter,
				...glass,
			}}
		>
			{/* En-tête */}
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 18 * u,
					padding: `${22 * u}px ${pad}px`,
					borderBottom: `1px solid ${theme.colors.glassBorder}`,
				}}
			>
				<div
					style={{
						width: 56 * u,
						height: 56 * u,
						borderRadius: 16 * u,
						background: `conic-gradient(from ${frame * 4}deg, ${theme.colors.cyan}, ${theme.colors.violet}, ${theme.colors.pink}, ${theme.colors.cyan})`,
						boxShadow: `0 0 ${24 * u}px rgba(139,92,246,0.7)`,
					}}
				/>
				<div style={{fontFamily: theme.fonts.display, color: theme.colors.text}}>
					<div style={{fontSize: 30 * u, fontWeight: 700}}>Assistant IA</div>
					<div style={{fontSize: 22 * u, color: theme.colors.success}}>● en ligne</div>
				</div>
				<div style={{flex: 1}} />
				{[0, 1, 2].map((i) => (
					<div key={i} style={{width: 14 * u, height: 14 * u, borderRadius: '50%', background: 'rgba(255,255,255,0.18)'}} />
				))}
			</div>
			{/* Conversation */}
			<div style={{padding: pad, display: 'flex', flexDirection: 'column', gap: 22 * u, minHeight: (isVertical ? 420 : 300) * u}}>
				<div
					style={{
						alignSelf: 'flex-start',
						maxWidth: '80%',
						padding: `${18 * u}px ${24 * u}px`,
						borderRadius: `${24 * u}px ${24 * u}px ${24 * u}px ${6 * u}px`,
						background: 'rgba(255,255,255,0.07)',
						color: theme.colors.textMuted,
						fontFamily: theme.fonts.body,
						fontSize: fs * 0.85,
					}}
				>
					Bonjour 👋 Que veux-tu créer aujourd’hui ?
				</div>
				{sent && (
					<div
						style={{
							alignSelf: 'flex-end',
							maxWidth: '88%',
							padding: `${20 * u}px ${26 * u}px`,
							borderRadius: `${26 * u}px ${26 * u}px ${6 * u}px ${26 * u}px`,
							background: `linear-gradient(135deg, ${theme.colors.blue}, ${theme.colors.violet})`,
							color: 'white',
							fontFamily: theme.fonts.body,
							fontSize: fs * 0.82,
							lineHeight: 1.4,
							transform: `scale(${bubble}) translateY(${(1 - bubble) * 40 * u}px)`,
							transformOrigin: '100% 100%',
							boxShadow: `0 ${10 * u}px ${40 * u}px rgba(139,92,246,0.5)`,
						}}
					>
						{prompt}
					</div>
				)}
				{frame > sendAt + 8 && (
					<div style={{display: 'flex', gap: 10 * u, paddingLeft: 10 * u}}>
						{dots.map((o, i) => (
							<div
								key={i}
								style={{
									width: 16 * u,
									height: 16 * u,
									borderRadius: '50%',
									background: theme.colors.accent,
									opacity: o,
									boxShadow: `0 0 12px ${theme.colors.accent}`,
								}}
							/>
						))}
					</div>
				)}
			</div>
			<div style={{padding: `0 ${pad}px ${pad}px`}}>{inputBox}</div>
		</div>
	);
};
