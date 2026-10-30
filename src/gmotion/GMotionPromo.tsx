import React from 'react';
import {AbsoluteFill, Freeze, Html5Audio, Sequence, staticFile} from 'remotion';
import {gmotion} from '../config';
import {premium} from '../theme';
import {keyClickFrames, makeTypingTimes} from '../lib/typing';
import {Grain, PremiumBackground} from './Atmosphere';
import {HookScene} from './HookScene';
import {PromptScene} from './PromptScene';
import {CreationScene} from './CreationScene';
import {ResultScene} from './ResultScene';
import {BeforeAfterScene} from './BeforeAfterScene';
import {CtaScene} from './CtaScene';
import {FREEZE_AT, G} from './timeline';
import {ClientProvider} from './client';

const vol = gmotion.volumes;

const Sfx: React.FC<{at: number; file: string; volume: number}> = ({at, file, volume}) => (
	<Sequence from={Math.max(0, Math.round(at))} durationInFrames={75} layout="none">
		<Html5Audio src={staticFile(file)} volume={volume} />
	</Sequence>
);

// Effets sonores discrets, calés sur les changements de plan (tous sur un temps de la musique).
const GMotionSound: React.FC = () => {
	const p = G.prompt;
	const clicks = keyClickFrames(makeTypingTimes(gmotion.prompt, p.from + p.typingStart, p.typingDuration, 'gm-prompt'));
	const r = G.result;
	const c = G.cta;
	return (
		<>
			<Html5Audio src={staticFile(gmotion.music)} volume={vol.music} />
			<Sfx at={G.hook.exitAt - 2} file="sfx/whoosh.wav" volume={vol.whoosh * 0.5} />
			{clicks.map((f, i) => (
				<Sfx key={i} at={f} file={`sfx/key-${(i % 4) + 1}.wav`} volume={vol.keyClick * (0.7 + ((i * 7) % 5) * 0.06)} />
			))}
			<Sfx at={p.from + p.sendAt} file="sfx/pop.wav" volume={vol.pop * 0.8} />
			<Sfx at={G.creation.from - 6} file="sfx/whoosh.wav" volume={vol.whoosh * 0.5} />
			<Sfx at={r.from} file="sfx/impact.wav" volume={vol.impact * 0.45} />
			<Sfx at={r.from + r.assembleAt} file="sfx/swoosh.wav" volume={vol.swoosh * 0.8} />
			<Sfx at={r.from + r.toPhoneAt - 2} file="sfx/whoosh.wav" volume={vol.whoosh * 0.45} />
			<Sfx at={G.beforeAfter.from + G.beforeAfter.wipeStart} file="sfx/swoosh.wav" volume={vol.swoosh * 0.6} />
			<Sfx at={c.from} file="sfx/swoosh.wav" volume={vol.swoosh * 0.8} />
		</>
	);
};

export type GMotionPromoProps = {compositionId: string};

// Pub verticale GMotion Studio — 1080x1920, 30 images/s, 15 s, sans voix off.
// Une composition par client fictif (voir gmotionClients dans config.ts).
export const GMotionPromo: React.FC<GMotionPromoProps> = ({compositionId}) => (
	<ClientProvider compositionId={compositionId}>
		<AbsoluteFill style={{backgroundColor: premium.bg}}>
			{/* Toute l'image se fige pendant les 0,5 dernière seconde */}
			<Freeze frame={FREEZE_AT} active={(f) => f >= FREEZE_AT}>
				<PremiumBackground />
				<Sequence from={G.hook.from} durationInFrames={G.hook.duration} name="Accroche">
					<HookScene />
				</Sequence>
				<Sequence from={G.prompt.from} durationInFrames={G.prompt.duration} name="Prompt">
					<PromptScene />
				</Sequence>
				<Sequence from={G.creation.from} durationInFrames={G.creation.duration} name="Création">
					<CreationScene />
				</Sequence>
				<Sequence from={G.result.from} durationInFrames={G.result.duration} name="Résultat">
					<ResultScene />
				</Sequence>
				<Sequence from={G.beforeAfter.from} durationInFrames={G.beforeAfter.duration} name="Avant / après">
					<BeforeAfterScene />
				</Sequence>
				<Sequence from={G.cta.from} durationInFrames={G.cta.duration} name="Appel à l'action">
					<CtaScene />
				</Sequence>
				<Grain />
			</Freeze>
			<GMotionSound />
		</AbsoluteFill>
	</ClientProvider>
);
