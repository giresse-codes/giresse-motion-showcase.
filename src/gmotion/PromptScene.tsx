import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {gmotion} from '../config';
import {premium} from '../theme';
import {makeTypingTimes, typedCount} from '../lib/typing';
import {fonts} from './fonts';
import {card, Eyebrow, fadeOut, fadeUp, progress} from './premium';
import {G} from './timeline';

// 2 → 5 s : interface de chat sobre, frappe lettre par lettre, zoom avant lent.
export const PromptScene: React.FC = () => {
	const frame = useCurrentFrame();
	const p = G.prompt;
	const times = makeTypingTimes(gmotion.prompt, p.typingStart, p.typingDuration, 'gm-prompt');
	const typed = gmotion.prompt.slice(0, typedCount(times, frame));
	const sent = frame >= p.sendAt;
	const zoom = interpolate(frame, [0, p.duration], [1, 1.04]);
	const bubble = progress(frame, p.sendAt, 14);

	return (
		<AbsoluteFill style={fadeOut(frame, p.duration - 12, 12, 24)}>
			<Eyebrow text={gmotion.steps.prompt} frame={frame} at={4} style={{position: 'absolute', top: gmotion.safeMargin + 90, left: 0, right: 0}} />
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
				<div style={{width: 860, overflow: 'hidden', fontFamily: fonts.body, transform: `scale(${zoom})`, ...card(36), ...fadeUp(frame, 0, 22, 40)}}>
					<div style={{display: 'flex', alignItems: 'center', gap: 20, padding: '28px 36px', borderBottom: `1px solid ${premium.line}`}}>
						<div style={{width: 60, height: 60, borderRadius: '50%', background: premium.steel, display: 'flex', alignItems: 'center', justifyContent: 'center', color: premium.text, fontWeight: 600, fontSize: 24}}>
							IA
						</div>
						<div>
							<div style={{fontWeight: 600, fontSize: 32, color: premium.text}}>{gmotion.assistantName}</div>
							<div style={{fontSize: 24, color: premium.textMuted}}>En ligne</div>
						</div>
					</div>
					<div style={{padding: 36, display: 'flex', flexDirection: 'column', gap: 24, minHeight: 440}}>
						<div style={{alignSelf: 'flex-start', maxWidth: '82%', padding: '20px 26px', borderRadius: 24, background: premium.surfaceStrong, color: premium.textMuted, fontSize: 32, lineHeight: 1.4}}>
							{gmotion.assistantGreeting}
						</div>
						{sent && (
							<div
								style={{
									alignSelf: 'flex-end',
									maxWidth: '82%',
									padding: '22px 28px',
									borderRadius: 24,
									background: premium.steel,
									color: premium.text,
									fontSize: 34,
									fontWeight: 500,
									lineHeight: 1.4,
									opacity: bubble,
									transform: `translateY(${(1 - bubble) * 20}px)`,
								}}
							>
								{gmotion.prompt}
							</div>
						)}
						{frame > p.sendAt + 10 && (
							<div style={{display: 'flex', gap: 10, paddingLeft: 6}}>
								{[0, 1, 2].map((i) => (
									<div key={i} style={{width: 12, height: 12, borderRadius: '50%', background: premium.text, opacity: 0.25 + 0.5 * Math.abs(Math.sin((frame - p.sendAt) / 8 - i * 0.6))}} />
								))}
							</div>
						)}
					</div>
					<div style={{padding: '0 36px 36px'}}>
						<div style={{display: 'flex', alignItems: 'flex-end', gap: 20, padding: '24px 26px', borderRadius: 24, background: 'rgba(5,12,26,0.45)', border: `1px solid ${premium.line}`}}>
							<div style={{flex: 1, fontSize: 40, lineHeight: 1.35, color: sent ? premium.textFaint : premium.text, minHeight: 54}}>
								{sent ? 'Écris un message…' : typed}
								{!sent && <span style={{display: 'inline-block', width: 2, height: 46, marginLeft: 4, verticalAlign: 'text-bottom', background: premium.text, opacity: Math.floor(frame / 15) % 2 === 0 ? 0.9 : 0}} />}
							</div>
							<div style={{width: 72, height: 72, flexShrink: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: sent ? premium.surfaceStrong : premium.steel, color: premium.text, fontSize: 34}}>↑</div>
						</div>
					</div>
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
