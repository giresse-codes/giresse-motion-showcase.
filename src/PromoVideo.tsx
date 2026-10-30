import React from 'react';
import {AbsoluteFill, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {videos, VideoScript} from './config';
import {theme} from './theme';
import {clamp, springs} from './lib/anim';
import {useLayout} from './lib/layout';
import {SCENES} from './lib/timeline';
import {Background} from './components/Background';
import {Particles} from './components/Particles';
import {HookText} from './components/HookText';
import {FakeChatUI} from './components/FakeChatUI';
import {TypingCode} from './components/TypingCode';
import {Camera3D} from './components/Camera3D';
import {DeviceMockup, VIEWPORTS} from './components/DeviceMockup';
import {FlashOverlay, GlitchTransition} from './components/GlitchTransition';
import {BeforeAfter} from './components/BeforeAfter';
import {AnimatedSubtitles} from './components/AnimatedSubtitles';
import {CallToAction} from './components/CallToAction';
import {SoundDesign} from './components/SoundDesign';
import {BeforeVisual, ResultVisual} from './results';

export type PromoVideoProps = {videoId: string};

/** Pastille de verre affichée en haut de l'écran */
const Pill: React.FC<{children: React.ReactNode; delay?: number; top?: number}> = ({children, delay = 0, top}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {isVertical, u} = useLayout();
	const p = spring({frame: frame - delay, fps, config: springs.bouncy});
	return (
		<div style={{position: 'absolute', top: top ?? (isVertical ? 150 : 50) * u, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 20}}>
			<div
				style={{
					padding: `${16 * u}px ${34 * u}px`,
					borderRadius: 999,
					background: 'rgba(15,18,40,0.6)',
					border: `1px solid ${theme.colors.glassBorder}`,
					backdropFilter: 'blur(18px)',
					boxShadow: `0 0 ${40 * u}px rgba(139,92,246,0.35)`,
					color: theme.colors.text,
					fontFamily: theme.fonts.display,
					fontWeight: 700,
					fontSize: (isVertical ? 40 : 34) * u,
					transform: `scale(${p}) translateY(${(1 - p) * -30 * u}px)`,
					opacity: Math.min(1, p * 1.5),
					whiteSpace: 'nowrap',
				}}
			>
				{children}
			</div>
		</div>
	);
};

// ---------------------------------------------------------------------------
// 2 → 5 s : le prompt
const PromptScene: React.FC<{script: VideoScript}> = ({script}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const p = SCENES.prompt;
	const exit = spring({frame: frame - (p.duration - 14), fps, config: springs.snappy});
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
			<div style={{transform: `scale(${1 - exit * 0.25}) translateY(${-exit * 200}px)`, opacity: 1 - exit, filter: `blur(${exit * 14}px)`}}>
				<FakeChatUI prompt={script.prompt} typingStart={p.typingStart} typingDuration={p.typingDuration} sendAt={p.sendAt} seed="prompt" />
			</div>
		</AbsoluteFill>
	);
};

// ---------------------------------------------------------------------------
// 5 → 9 s : le code
const CodeScene: React.FC<{script: VideoScript}> = ({script}) => {
	const c = SCENES.code;
	const frame = useCurrentFrame();
	const progress = interpolate(frame, [c.typingStart, c.typingEnd], [0, 100], clamp);
	return (
		<GlitchTransition at={c.glitchAt} duration={c.glitchDuration}>
			<Camera3D
				keys={[
					{at: 0, rotateX: 28, rotateY: -32, rotateZ: 4, z: -700, y: 260, scale: 0.9},
					{at: 30, rotateX: 14, rotateY: -16, rotateZ: 1, z: -120, y: 40},
					{at: 72, rotateX: 8, rotateY: 14, rotateZ: -1, z: 120, x: -60, y: -20, scale: 1.04},
					{at: 112, rotateX: 2, rotateY: 2, rotateZ: 0, z: 420, x: 0, y: 0, scale: 1.12},
				]}
			>
				<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
					<TypingCode fileName={script.code.fileName} source={script.code.source} start={c.typingStart} end={c.typingEnd} />
				</AbsoluteFill>
			</Camera3D>
			<Pill delay={4}>
				⚡ Génération du code… <span style={{color: theme.colors.accent}}>{Math.round(progress)} %</span>
			</Pill>
		</GlitchTransition>
	);
};

// ---------------------------------------------------------------------------
// Appareils affichant le résultat, selon le service et le format
const ResultDevices: React.FC<{script: VideoScript; iteration: number; frame: number}> = ({script, iteration, frame}) => {
	const {isVertical, u} = useLayout();
	const {fps} = useVideoConfig();
	const second = spring({frame: frame - 16, fps, config: springs.bouncy});
	const float = Math.sin(frame / 22) * 10 * u;

	if (script.kind === 'web') {
		const browserW = (isVertical ? 980 : 1080) * u;
		const phoneW = (isVertical ? 330 : 270) * u;
		return (
			<div style={{position: 'relative', transformStyle: 'preserve-3d', transform: `translateY(${isVertical ? -260 * u : -50 * u}px)`}}>
				<DeviceMockup type="browser" width={browserW} url="wouri-luxe.cm">
					<ResultVisual script={script} frame={frame} iteration={iteration} {...VIEWPORTS.browser} />
				</DeviceMockup>
				<div
					style={{
						position: 'absolute',
						right: (isVertical ? 20 : -110) * u,
						top: (isVertical ? 330 : 200) * u,
						transform: `translateZ(${120 * u}px) translateY(${(1 - second) * 500 * u + float}px) rotate(${(1 - second) * 12 + 3}deg)`,
						opacity: Math.min(1, second * 2),
					}}
				>
					<DeviceMockup type="phone" width={phoneW}>
						<ResultVisual script={script} frame={frame - 6} iteration={iteration} {...VIEWPORTS.phone} />
					</DeviceMockup>
				</div>
			</div>
		);
	}

	if (script.kind === 'coding') {
		const viewport = isVertical ? {width: 1180, height: 1050} : VIEWPORTS.browser;
		return (
			<DeviceMockup type="browser" width={(isVertical ? 1000 : 1120) * u} viewport={viewport} url="app.douala-express.cm" glowColor={theme.colors.blue}>
				<ResultVisual script={script} frame={frame} iteration={iteration} {...viewport} />
			</DeviceMockup>
		);
	}

	// Motion design : la pub au format story sur téléphone (+ version 16:9 en paysage)
	if (isVertical) {
		return (
			<div style={{transform: `translateY(${-110 * u}px)`}}>
				<DeviceMockup type="phone" width={500 * u} glowColor={theme.colors.pink}>
					<ResultVisual script={script} frame={frame} iteration={iteration} {...VIEWPORTS.phone} />
				</DeviceMockup>
			</div>
		);
	}
	const wide = {width: 1280, height: 720};
	return (
		<div style={{display: 'flex', alignItems: 'center', gap: 60 * u, transformStyle: 'preserve-3d'}}>
			<DeviceMockup type="phone" width={290 * u} glowColor={theme.colors.pink}>
				<ResultVisual script={script} frame={frame} iteration={iteration} {...VIEWPORTS.phone} />
			</DeviceMockup>
			<div style={{transform: `translateY(${(1 - second) * 400 * u + float}px)`, opacity: Math.min(1, second * 2)}}>
				<DeviceMockup type="browser" width={900 * u} viewport={wide} url="sawajus.cm/pub" glowColor={theme.colors.pink}>
					<ResultVisual script={script} frame={frame - 6} iteration={iteration} {...wide} />
				</DeviceMockup>
			</div>
		</div>
	);
};

// ---------------------------------------------------------------------------
// 9 → 17 s : révélation puis itération en direct
const ResultScene: React.FC<{script: VideoScript}> = ({script}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {isVertical, u} = useLayout();
	const r = SCENES.result;
	const enter = spring({frame, fps, config: {damping: 14, mass: 0.9, stiffness: 90}});
	const iteration = spring({frame: frame - r.morphAt, fps, config: springs.soft, durationInFrames: 22});
	const exit = spring({frame: frame - (r.duration - 12), fps, config: springs.snappy});
	// Balayage lumineux pendant la transformation
	const shimmer = interpolate(frame, [r.morphAt - 2, r.morphAt + 20], [-40, 140], clamp);
	const morphing = frame > r.morphAt - 2 && frame < r.morphAt + 22;
	const flash = interpolate(frame, [0, 10], [0.9, 0], clamp);

	return (
		<AbsoluteFill>
			<Particles mode="burst" count={70} seed="burst" burstAt={2} />
			<Camera3D
				motionBlur={0.4}
				keys={[
					{at: 0, rotateX: 20, rotateY: -35, z: -900, y: 120, scale: 0.8},
					{at: 40, rotateX: 6, rotateY: -10, z: -80, y: 0, scale: 1},
					{at: 100, rotateX: 4, rotateY: 8, z: 0, x: 0},
					{at: r.iterationAt, rotateX: 2, rotateY: -4, z: -40, y: isVertical ? 60 : 30, scale: 0.94},
					{at: r.morphAt + 10, rotateX: 0, rotateY: 3, z: 60, y: isVertical ? 60 : 30, scale: 1},
				]}
			>
				<AbsoluteFill
					style={{
						alignItems: 'center',
						justifyContent: 'center',
						transform: `scale(${(0.6 + 0.4 * enter) * (1 - exit * 0.2)})`,
						opacity: Math.min(1, enter * 2) * (1 - exit),
						filter: exit > 0.01 ? `blur(${exit * 12}px)` : undefined,
					}}
				>
					<div style={{position: 'relative'}}>
						<ResultDevices script={script} iteration={iteration} frame={frame} />
						{morphing && (
							<div
								style={{
									position: 'absolute',
									inset: -20 * u,
									pointerEvents: 'none',
									background: `linear-gradient(100deg, transparent ${shimmer - 20}%, rgba(255,255,255,0.45) ${shimmer}%, rgba(34,211,238,0.3) ${shimmer + 5}%, transparent ${shimmer + 20}%)`,
									mixBlendMode: 'screen',
								}}
							/>
						)}
					</div>
				</AbsoluteFill>
			</Camera3D>
			{frame < r.iterationAt - 4 && <Pill delay={14}>✨ {script.revealLabel}</Pill>}
			<Sequence from={r.iterationAt} layout="none">
				<IterationPrompt script={script} />
			</Sequence>
			<FlashOverlay amount={flash} />
		</AbsoluteFill>
	);
};

const IterationPrompt: React.FC<{script: VideoScript}> = ({script}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {isVertical, u} = useLayout();
	const r = SCENES.result;
	const local = (n: number) => n - r.iterationAt;
	const exit = spring({frame: frame - local(r.morphAt + 26), fps, config: springs.snappy});
	return (
		<div
			style={{
				position: 'absolute',
				top: (isVertical ? 110 : 30) * u,
				left: 0,
				right: 0,
				display: 'flex',
				justifyContent: 'center',
				zIndex: 30,
				transform: `translateY(${-exit * 120 * u}px)`,
				opacity: 1 - exit,
			}}
		>
			<FakeChatUI
				compact
				prompt={script.iteration.prompt}
				typingStart={local(r.iterTypingStart)}
				typingDuration={r.iterTypingDuration}
				sendAt={local(r.iterSendAt)}
				seed="iteration"
			/>
		</div>
	);
};

// ---------------------------------------------------------------------------
// 17 → 19 s : avant / après
const BeforeAfterScene: React.FC<{script: VideoScript}> = ({script}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {isVertical, u} = useLayout();
	const b = SCENES.beforeAfter;
	const w = (isVertical ? 960 : 1500) * u;
	const h = (isVertical ? 1060 : 720) * u;
	// Taille virtuelle des visuels, mise à l'échelle dans le panneau
	const vw = isVertical ? 640 : 1440;
	const vh = (vw * h) / w;
	const scale = w / vw;
	const exit = spring({frame: frame - (b.duration - 8), fps, config: springs.snappy});
	const wrap = (node: React.ReactNode) => (
		<div style={{width: vw, height: vh, transform: `scale(${scale})`, transformOrigin: '0 0'}}>{node}</div>
	);
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: 1 - exit, transform: `scale(${1 + exit * 0.1})`}}>
			<div style={{transform: `translateY(${(isVertical ? -150 : -50) * u}px)`}}>
				<BeforeAfter
					width={w}
					height={h}
					wipeStart={b.wipeStart}
					wipeDuration={b.wipeDuration}
					beforeLabel={script.beforeLabel}
					afterLabel={script.afterLabel}
					before={wrap(<BeforeVisual script={script} width={vw} height={vh} />)}
					after={wrap(<ResultVisual script={script} frame={frame + 120} iteration={1} width={vw} height={vh} />)}
				/>
			</div>
			<div style={{position: 'absolute', top: (isVertical ? 70 : 24) * u, opacity: interpolate(frame, [0, 8], [0, 1], clamp), fontFamily: theme.fonts.display, fontWeight: 700, fontSize: (isVertical ? 34 : 28) * u, color: theme.colors.textMuted}}>
				{script.client.name} · {script.client.district}, Douala
			</div>
		</AbsoluteFill>
	);
};

// ---------------------------------------------------------------------------
export const PromoVideo: React.FC<PromoVideoProps> = ({videoId}) => {
	const script = videos.find((v) => v.id === videoId) ?? videos[0];
	return (
		<AbsoluteFill style={{backgroundColor: theme.colors.bg}}>
			<Background />
			<Particles count={45} seed="dust" opacity={0.7} />

			<Sequence from={SCENES.hook.from} durationInFrames={SCENES.hook.duration} name="Accroche">
				<HookText text={script.hook} exitAt={SCENES.hook.exitAt} />
			</Sequence>
			<Sequence from={SCENES.prompt.from} durationInFrames={SCENES.prompt.duration} name="Prompt">
				<PromptScene script={script} />
			</Sequence>
			<Sequence from={SCENES.result.from} durationInFrames={SCENES.result.duration} name="Révélation + itération">
				<ResultScene script={script} />
			</Sequence>
			<Sequence from={SCENES.code.from} durationInFrames={SCENES.code.duration} name="Code">
				<CodeScene script={script} />
			</Sequence>
			<Sequence from={SCENES.beforeAfter.from} durationInFrames={SCENES.beforeAfter.duration} name="Avant / après">
				<BeforeAfterScene script={script} />
			</Sequence>
			<Sequence from={SCENES.cta.from} durationInFrames={SCENES.cta.duration} name="Appel à l'action">
				<CallToAction />
			</Sequence>

			<AnimatedSubtitles segments={script.voiceover.segments} />
			<SoundDesign script={script} />
		</AbsoluteFill>
	);
};
