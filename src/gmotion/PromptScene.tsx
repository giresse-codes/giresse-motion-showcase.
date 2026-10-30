import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {gmotion} from '../config';
import {clamp, springs} from '../lib/anim';
import {makeTypingTimes, typedCount} from '../lib/typing';
import {GlitchTransition} from '../components/GlitchTransition';
import {fonts} from './fonts';
import {G} from './timeline';

const {colors} = gmotion;

// 2 → 5 s : interface de chat en glassmorphism, frappe lettre par lettre et zoom avant progressif.
export const PromptScene: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const p = G.prompt;
	const times = makeTypingTimes(gmotion.prompt, p.typingStart, p.typingDuration, 'gm-prompt');
	const typed = gmotion.prompt.slice(0, typedCount(times, frame));
	const sent = frame >= p.sendAt;

	const enter = spring({frame, fps, config: {damping: 16, mass: 0.8, stiffness: 110}});
	const zoom = interpolate(frame, [0, p.duration], [1, 1.12], {...clamp, easing: (t) => t * t * (3 - 2 * t)});
	const bubble = spring({frame: frame - p.sendAt, fps, config: springs.bouncy});
	const press = interpolate(frame, [p.sendAt - 3, p.sendAt, p.sendAt + 4], [1, 0.8, 1], clamp);
	const dots = [0, 1, 2].map((i) => 0.3 + 0.7 * Math.abs(Math.sin((frame - p.sendAt) / 4 - i * 0.7)));

	return (
		<GlitchTransition at={p.duration - 14} duration={14} flashColors={[colors.cyan, colors.electric]}>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', perspective: 1800}}>
				<div
					style={{
						width: 880,
						borderRadius: 44,
						overflow: 'hidden',
						background: 'linear-gradient(150deg, rgba(31,91,255,0.18), rgba(5,11,31,0.78) 45%, rgba(5,11,31,0.85))',
						border: '1.5px solid rgba(91,200,255,0.28)',
						backdropFilter: 'blur(28px)',
						boxShadow: `0 40px 120px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.18), 0 0 90px ${colors.electric}55`,
						transform: `scale(${zoom * (0.7 + 0.3 * enter)}) translateY(${(1 - enter) * 500}px) rotateX(${(1 - enter) * 35}deg)`,
						opacity: Math.min(1, enter * 1.5),
						fontFamily: fonts.body,
					}}
				>
					<div style={{display: 'flex', alignItems: 'center', gap: 20, padding: '26px 34px', borderBottom: '1px solid rgba(91,200,255,0.18)'}}>
						<Img src={staticFile(gmotion.logo)} style={{width: 72, height: 72, borderRadius: 18, boxShadow: `0 0 30px ${colors.electric}`}} />
						<div>
							<div style={{fontFamily: fonts.display, fontWeight: 800, fontSize: 36, color: colors.white}}>{gmotion.assistantName}</div>
							<div style={{fontSize: 26, color: colors.cyan}}>● en ligne</div>
						</div>
					</div>
					<div style={{padding: 34, display: 'flex', flexDirection: 'column', gap: 26, minHeight: 470}}>
						<div style={{alignSelf: 'flex-start', maxWidth: '85%', padding: '22px 28px', borderRadius: '28px 28px 28px 8px', background: 'rgba(255,255,255,0.07)', color: colors.muted, fontSize: 34}}>
							{gmotion.assistantGreeting}
						</div>
						{sent && (
							<div
								style={{
									alignSelf: 'flex-end',
									maxWidth: '85%',
									padding: '24px 30px',
									borderRadius: '30px 30px 8px 30px',
									background: `linear-gradient(135deg, ${colors.electric}, ${colors.cyan})`,
									color: colors.white,
									fontSize: 38,
									fontWeight: 600,
									lineHeight: 1.35,
									transform: `scale(${bubble})`,
									transformOrigin: '100% 100%',
									boxShadow: `0 14px 50px ${colors.electric}99`,
								}}
							>
								{gmotion.prompt}
							</div>
						)}
						{frame > p.sendAt + 6 && (
							<div style={{display: 'flex', gap: 12, paddingLeft: 10}}>
								{dots.map((o, i) => (
									<div key={i} style={{width: 18, height: 18, borderRadius: '50%', background: colors.cyan, opacity: o, boxShadow: `0 0 14px ${colors.cyan}`}} />
								))}
							</div>
						)}
					</div>
					<div style={{padding: '0 34px 34px'}}>
						<div
							style={{
								display: 'flex',
								alignItems: 'flex-end',
								gap: 20,
								padding: '26px 28px',
								borderRadius: 28,
								background: 'rgba(2,6,20,0.65)',
								border: `1.5px solid ${sent ? 'rgba(91,200,255,0.2)' : colors.cyan}`,
								boxShadow: sent ? 'none' : `0 0 40px ${colors.cyan}44`,
							}}
						>
							<div style={{flex: 1, fontSize: 46, lineHeight: 1.3, color: sent ? 'rgba(143,163,200,0.6)' : colors.white, fontWeight: 600, minHeight: 60}}>
								{sent ? 'Écris un message…' : typed}
								{!sent && (
									<span
										style={{
											display: 'inline-block',
											width: 5,
											height: 54,
											marginLeft: 4,
											verticalAlign: 'text-bottom',
											background: colors.cyan,
											boxShadow: `0 0 14px ${colors.cyan}`,
											opacity: Math.floor(frame / 8) % 2 === 0 ? 1 : 0.1,
										}}
									/>
								)}
							</div>
							<div
								style={{
									width: 84,
									height: 84,
									flexShrink: 0,
									borderRadius: '50%',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									background: `linear-gradient(135deg, ${colors.electric}, ${colors.cyan})`,
									color: colors.white,
									fontSize: 44,
									fontWeight: 900,
									transform: `scale(${press})`,
									boxShadow: `0 0 ${frame > p.sendAt - 10 && !sent ? 50 : 18}px ${colors.cyan}`,
								}}
							>
								↑
							</div>
						</div>
					</div>
				</div>
			</AbsoluteFill>
		</GlitchTransition>
	);
};
