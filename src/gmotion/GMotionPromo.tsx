import React from 'react';
import {AbsoluteFill, Freeze, Html5Audio, Sequence, staticFile} from 'remotion';
import {gmotion} from '../config';
import {keyClickFrames, makeTypingTimes} from '../lib/typing';
import {GBackground, Grain} from './Atmosphere';
import {HookScene} from './HookScene';
import {PromptScene} from './PromptScene';
import {CreationScene} from './CreationScene';
import {ResultScene} from './ResultScene';
import {BeforeAfterScene} from './BeforeAfterScene';
import {CtaScene} from './CtaScene';
import {FREEZE_AT, G} from './timeline';

const vol = gmotion.volumes;

const Sfx: React.FC<{at: number; file: string; volume: number}> = ({at, file, volume}) => (
	<Sequence from={Math.max(0, Math.round(at))} durationInFrames={75} layout="none">
		<Html5Audio src={staticFile(file)} volume={volume} />
	</Sequence>
);

// Effets sonores, tous calés sur les images clés de l'animation.
const GMotionSound: React.FC = () => {
	const p = G.prompt;
	const clicks = keyClickFrames(makeTypingTimes(gmotion.prompt, p.from + p.typingStart, p.typingDuration, 'gm-prompt'));
	const r = G.result;
	const c = G.cta;
	return (
		<>
			<Html5Audio src={staticFile(gmotion.music)} volume={vol.music} />
			{/* Accroche : coup sur le flash et whoosh vers le chat */}
			<Sfx at={G.hook.flashAt} file="sfx/impact.wav" volume={vol.impact * 0.6} />
			<Sfx at={G.hook.exitAt - 2} file="sfx/whoosh.wav" volume={vol.whoosh} />
			{/* Prompt */}
			{clicks.map((f, i) => (
				<Sfx key={i} at={f} file={`sfx/key-${(i % 4) + 1}.wav`} volume={vol.keyClick * (0.75 + ((i * 7) % 5) * 0.08)} />
			))}
			<Sfx at={p.from + p.sendAt} file="sfx/pop.wav" volume={vol.pop} />
			{/* Création : glitch + whoosh */}
			<Sfx at={G.creation.from - 6} file="sfx/whoosh.wav" volume={vol.whoosh} />
			<Sfx at={G.creation.from - 2} file="sfx/glitch.wav" volume={vol.glitch} />
			{/* Résultat : impact grave, swoosh des pièces du logo, verrouillage */}
			<Sfx at={r.from + r.flashAt} file="sfx/impact.wav" volume={vol.impact} />
			<Sfx at={r.from + r.assembleAt} file="sfx/swoosh.wav" volume={vol.swoosh} />
			<Sfx at={r.from + r.lockAt} file="sfx/pop.wav" volume={vol.pop * 1.4} />
			<Sfx at={r.from + r.toPhoneAt - 4} file="sfx/whoosh.wav" volume={vol.whoosh * 0.8} />
			{/* Avant / après */}
			<Sfx at={G.beforeAfter.from - 4} file="sfx/whoosh.wav" volume={vol.whoosh} />
			<Sfx at={G.beforeAfter.from + G.beforeAfter.wipeStart} file="sfx/swoosh.wav" volume={vol.swoosh * 0.8} />
			{/* Appel à l'action : swoosh du logo dessiné */}
			<Sfx at={c.from - 4} file="sfx/whoosh.wav" volume={vol.whoosh * 0.8} />
			<Sfx at={c.from + 2} file="sfx/swoosh.wav" volume={vol.swoosh} />
			<Sfx at={c.from + c.logoAt} file="sfx/pop.wav" volume={vol.pop * 1.4} />
			<Sfx at={c.from + c.buttonAt} file="sfx/pop.wav" volume={vol.pop} />
		</>
	);
};

// Pub verticale GMotion Studio — 1080x1920, 30 images/s, 15 s, sans voix off.
export const GMotionPromo: React.FC = () => (
	<AbsoluteFill style={{backgroundColor: gmotion.colors.night}}>
		{/* Toute l'image se fige pendant les 0,5 dernière seconde */}
		<Freeze frame={FREEZE_AT} active={(f) => f >= FREEZE_AT}>
			<GBackground />
			<Sequence from={G.hook.from} durationInFrames={G.hook.duration} name="Accroche">
				<HookScene />
			</Sequence>
			<Sequence from={G.prompt.from} durationInFrames={G.prompt.duration} name="Prompt">
				<PromptScene />
			</Sequence>
			<Sequence from={G.result.from} durationInFrames={G.result.duration} name="Résultat">
				<ResultScene />
			</Sequence>
			<Sequence from={G.creation.from} durationInFrames={G.creation.duration} name="Création">
				<CreationScene />
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
);
