import React, {useMemo} from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {theme} from '../theme';
import {useLayout} from '../lib/layout';
import {clamp} from '../lib/anim';
import {tokenizeLine} from '../lib/syntax';

type Props = {
	fileName: string;
	source: string;
	/** Image de début / fin de la frappe (relative à la séquence) */
	start?: number;
	end?: number;
	width?: number;
	height?: number;
};

// Éditeur de code : le code défile très vite, coloration syntaxique et lueur néon sur la ligne active.
export const TypingCode: React.FC<Props> = ({fileName, source, start = 0, end = 100, width, height}) => {
	const frame = useCurrentFrame();
	const {isVertical, u} = useLayout();
	const lines = useMemo(() => source.split('\n').map((l) => ({raw: l, tokens: tokenizeLine(l)})), [source]);
	const totalChars = lines.reduce((s, l) => s + l.raw.length + 1, 0);

	// Accélération progressive : la frappe démarre vite et finit en trombe
	const progress = interpolate(frame, [start, end], [0, 1], clamp);
	const eased = progress < 1 ? Math.pow(progress, 1.35) : 1;
	const shown = Math.floor(eased * totalChars);

	let remaining = shown;
	let activeLine = 0;
	let activeFrac = 0;
	const visibleLines = lines.map((line, i) => {
		const len = line.raw.length + 1;
		const take = Math.max(0, Math.min(len, remaining));
		if (remaining > 0) {
			activeLine = i;
			activeFrac = take / len;
		}
		remaining -= take;
		return Math.min(line.raw.length, take);
	});

	const w = width ?? (isVertical ? 980 : 1500) * u;
	const h = height ?? (isVertical ? 1180 : 800) * u;
	const fs = (isVertical ? 25 : 26) * u;
	const lh = fs * 1.6;
	const headerH = 70 * u;
	const bodyH = h - headerH;
	const capacity = bodyH / lh;
	const scroll = Math.max(0, (activeLine + activeFrac - capacity * 0.62) * lh);

	return (
		<div
			style={{
				width: w,
				height: h,
				borderRadius: 28 * u,
				overflow: 'hidden',
				background: 'linear-gradient(160deg, rgba(17,20,42,0.92), rgba(7,8,20,0.95))',
				border: `1px solid ${theme.colors.glassBorder}`,
				boxShadow: `0 ${40 * u}px ${120 * u}px rgba(0,0,0,0.7), 0 0 ${80 * u}px rgba(59,130,246,0.25), inset 0 1px 0 rgba(255,255,255,0.1)`,
				fontFamily: theme.fonts.mono,
				position: 'relative',
			}}
		>
			{/* Barre d'onglets */}
			<div
				style={{
					height: headerH,
					display: 'flex',
					alignItems: 'center',
					gap: 14 * u,
					padding: `0 ${26 * u}px`,
					background: 'rgba(255,255,255,0.04)',
					borderBottom: `1px solid ${theme.colors.glassBorder}`,
				}}
			>
				{['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
					<div key={c} style={{width: 18 * u, height: 18 * u, borderRadius: '50%', background: c}} />
				))}
				<div
					style={{
						marginLeft: 20 * u,
						padding: `${10 * u}px ${22 * u}px`,
						borderRadius: 12 * u,
						background: 'rgba(255,255,255,0.08)',
						color: theme.colors.text,
						fontSize: fs * 0.9,
						borderBottom: `2px solid ${theme.colors.accent}`,
					}}
				>
					{fileName}
				</div>
				<div style={{flex: 1}} />
				<div style={{color: theme.colors.success, fontSize: fs * 0.8}}>
					● {Math.round(eased * lines.length)} / {lines.length} lignes
				</div>
			</div>
			{/* Code */}
			<div style={{position: 'absolute', top: headerH, left: 0, right: 0, bottom: 0, overflow: 'hidden'}}>
				<div style={{transform: `translateY(${-scroll + 16 * u}px)`}}>
					{lines.map((line, i) => {
						if (i > activeLine + 1) return null;
						const n = visibleLines[i];
						const isActive = i === activeLine && progress < 1;
						const dist = activeLine - i;
						const glow = interpolate(dist, [0, 3], [1, 0], clamp) * (progress < 1 ? 1 : 0);
						let left = n;
						return (
							<div
								key={i}
								style={{
									display: 'flex',
									height: lh,
									alignItems: 'center',
									fontSize: fs,
									whiteSpace: 'pre',
									position: 'relative',
									background: glow > 0 ? `linear-gradient(90deg, rgba(34,211,238,${0.16 * glow}), rgba(139,92,246,${0.08 * glow}) 60%, transparent)` : undefined,
									boxShadow: isActive ? `inset ${4 * u}px 0 0 ${theme.colors.accent}` : undefined,
								}}
							>
								<span style={{width: 70 * u, textAlign: 'right', paddingRight: 24 * u, color: isActive ? theme.colors.accent : theme.colors.textDim, flexShrink: 0}}>
									{i + 1}
								</span>
								<span style={{textShadow: glow > 0 ? `0 0 ${14 * glow * u}px rgba(130,170,255,${0.9 * glow})` : undefined}}>
									{line.tokens.map((tok, j) => {
										if (left <= 0) return null;
										const text = tok.text.slice(0, left);
										left -= tok.text.length;
										return (
											<span key={j} style={{color: tok.color}}>
												{text}
											</span>
										);
									})}
								</span>
								{isActive && (
									<span
										style={{
											display: 'inline-block',
											width: 3 * u,
											height: fs * 1.2,
											background: theme.colors.accent,
											boxShadow: `0 0 ${12 * u}px ${theme.colors.accent}`,
											marginLeft: 2,
										}}
									/>
								)}
							</div>
						);
					})}
				</div>
			</div>
			{/* Reflet de verre */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					pointerEvents: 'none',
					background: 'linear-gradient(115deg, rgba(255,255,255,0.08) 0%, transparent 30%, transparent 70%, rgba(139,92,246,0.06) 100%)',
				}}
			/>
		</div>
	);
};
