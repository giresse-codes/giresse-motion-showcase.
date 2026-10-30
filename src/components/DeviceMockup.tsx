import React from 'react';
import {theme} from '../theme';
import {useLayout} from '../lib/layout';

export type DeviceType = 'browser' | 'phone';

type Props = {
	type: DeviceType;
	/** Largeur affichée de l'appareil (px) */
	width: number;
	/** Taille « virtuelle » du contenu, mise à l'échelle dans l'écran */
	viewport?: {width: number; height: number};
	url?: string;
	glowColor?: string;
	children: React.ReactNode;
};

export const VIEWPORTS = {
	browser: {width: 1440, height: 900},
	phone: {width: 390, height: 844},
};

// Maquette 3D d'un navigateur ou d'un téléphone, avec reflets et lueur néon.
export const DeviceMockup: React.FC<Props> = ({type, width, viewport = VIEWPORTS[type], url = 'monsite.cm', glowColor = theme.colors.violet, children}) => {
	const {u} = useLayout();
	if (type === 'phone') {
		const bezel = width * 0.04;
		const screenW = width - bezel * 2;
		const scale = screenW / viewport.width;
		const screenH = viewport.height * scale;
		const height = screenH + bezel * 2;
		return (
			<div
				style={{
					width,
					height,
					borderRadius: width * 0.16,
					padding: bezel,
					background: 'linear-gradient(145deg, #3a3f55, #0d0f1a 40%, #23263a)',
					boxShadow: `0 0 0 ${2 * u}px rgba(255,255,255,0.12), 0 ${50 * u}px ${120 * u}px rgba(0,0,0,0.7), 0 0 ${120 * u}px ${glowColor}66`,
					position: 'relative',
				}}
			>
				<div style={{width: screenW, height: screenH, borderRadius: width * 0.125, overflow: 'hidden', position: 'relative', background: '#000'}}>
					<div style={{width: viewport.width, height: viewport.height, transform: `scale(${scale})`, transformOrigin: '0 0'}}>{children}</div>
					{/* Encoche dynamique */}
					<div
						style={{
							position: 'absolute',
							top: screenH * 0.015,
							left: '50%',
							width: screenW * 0.3,
							height: screenW * 0.085,
							transform: 'translateX(-50%)',
							borderRadius: 999,
							background: '#000',
						}}
					/>
					<div
						style={{
							position: 'absolute',
							inset: 0,
							background: 'linear-gradient(120deg, rgba(255,255,255,0.16) 0%, transparent 28%, transparent 100%)',
							pointerEvents: 'none',
						}}
					/>
				</div>
			</div>
		);
	}

	const barH = width * 0.045;
	const scale = width / viewport.width;
	const screenH = viewport.height * scale;
	return (
		<div
			style={{
				width,
				height: screenH + barH,
				borderRadius: width * 0.018,
				overflow: 'hidden',
				background: '#0d0f1a',
				boxShadow: `0 0 0 ${2 * u}px rgba(255,255,255,0.14), 0 ${50 * u}px ${140 * u}px rgba(0,0,0,0.75), 0 0 ${140 * u}px ${glowColor}55`,
				position: 'relative',
			}}
		>
			<div
				style={{
					height: barH,
					display: 'flex',
					alignItems: 'center',
					gap: barH * 0.25,
					padding: `0 ${barH * 0.4}px`,
					background: 'linear-gradient(180deg, #23263a, #171a2b)',
				}}
			>
				{['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
					<div key={c} style={{width: barH * 0.28, height: barH * 0.28, borderRadius: '50%', background: c}} />
				))}
				<div
					style={{
						flex: 1,
						margin: `0 ${barH * 1.2}px`,
						height: barH * 0.58,
						borderRadius: barH,
						background: 'rgba(255,255,255,0.08)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						gap: barH * 0.15,
						color: theme.colors.textMuted,
						fontFamily: theme.fonts.body,
						fontSize: barH * 0.32,
					}}
				>
					<span style={{color: theme.colors.success}}>🔒</span> {url}
				</div>
			</div>
			<div style={{width, height: screenH, overflow: 'hidden', position: 'relative'}}>
				<div style={{width: viewport.width, height: viewport.height, transform: `scale(${scale})`, transformOrigin: '0 0'}}>{children}</div>
				<div
					style={{
						position: 'absolute',
						inset: 0,
						background: 'linear-gradient(115deg, rgba(255,255,255,0.1) 0%, transparent 25%)',
						pointerEvents: 'none',
					}}
				/>
			</div>
		</div>
	);
};
