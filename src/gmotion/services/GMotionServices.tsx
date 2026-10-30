import React from 'react';
import {AbsoluteFill, Freeze, Html5Audio, Sequence, staticFile} from 'remotion';
import {gmotion, gmotionServices} from '../../config';
import {premium} from '../../theme';
import {keyClickFrames} from '../../lib/typing';
import {Grain, PremiumBackground} from '../Atmosphere';
import {CtaScene} from '../CtaScene';
import {HookScene} from '../HookScene';
import {FREEZE_AT} from '../timeline';
import {CodeScene} from './CodeScene';
import {MotionScene} from './MotionScene';
import {RecapScene} from './RecapScene';
import {WebScene} from './WebScene';
import {S} from './timeline';

const vol = gmotion.volumes;

const Sfx: React.FC<{at: number; file: string; volume: number}> = ({at, file, volume}) => (
	<Sequence from={Math.max(0, Math.round(at))} durationInFrames={75} layout="none">
		<Html5Audio src={staticFile(file)} volume={volume} />
	</Sequence>
);

// Effets sonores discrets, calés sur le beat (120 BPM : un temps = 15 images).
const ServicesSound: React.FC = () => {
	const m = S.motion;
	const w = S.web;
	const c = S.code;
	// Clics de clavier pendant que le code s'écrit
	const clicks = keyClickFrames(
		Array.from({length: 24}, (_, i) => c.from + c.typeStart + (i * (c.typeEnd - c.typeStart)) / 24),
		2,
	);
	return (
		<>
			<Html5Audio src={staticFile(gmotion.music)} volume={vol.music} />
			<Sfx at={S.hook.exitAt - 2} file="sfx/whoosh.wav" volume={vol.whoosh * 0.5} />
			<Sfx at={m.from + m.assembleAt} file="sfx/swoosh.wav" volume={vol.swoosh * 0.8} />
			<Sfx at={w.from - 4} file="sfx/whoosh.wav" volume={vol.whoosh * 0.5} />
			<Sfx at={w.from + w.phoneAt - 2} file="sfx/swoosh.wav" volume={vol.swoosh * 0.6} />
			<Sfx at={c.from - 4} file="sfx/whoosh.wav" volume={vol.whoosh * 0.45} />
			<Sfx at={c.from + 2} file="sfx/impact.wav" volume={vol.impact * 0.35} />
			{clicks.map((f, i) => (
				<Sfx key={`k${i}`} at={f} file={`sfx/key-${(i % 4) + 1}.wav`} volume={vol.keyClick * 0.7} />
			))}
			<Sfx at={S.recap.from - 4} file="sfx/whoosh.wav" volume={vol.whoosh * 0.45} />
			<Sfx at={S.cta.from} file="sfx/swoosh.wav" volume={vol.swoosh * 0.8} />
		</>
	);
};

// Pub verticale GMotion Studio présentant les 3 services — 1080x1920, 30 images/s, 15 s, sans voix off.
export const GMotionServices: React.FC = () => (
	<AbsoluteFill style={{backgroundColor: premium.bg}}>
		{/* Toute l'image se fige pendant les 0,5 dernière seconde */}
		<Freeze frame={FREEZE_AT} active={(f) => f >= FREEZE_AT}>
			<PremiumBackground />
			<Sequence from={S.hook.from} durationInFrames={S.hook.duration} name="Accroche">
				<HookScene lines={gmotionServices.hook} lineFrames={S.hook.lines} exitAt={S.hook.exitAt} />
			</Sequence>
			<Sequence from={S.motion.from} durationInFrames={S.motion.duration} name="Motion design">
				<MotionScene />
			</Sequence>
			<Sequence from={S.web.from} durationInFrames={S.web.duration} name="Sites web">
				<WebScene />
			</Sequence>
			<Sequence from={S.code.from} durationInFrames={S.code.duration} name="Applications & code">
				<CodeScene />
			</Sequence>
			<Sequence from={S.recap.from} durationInFrames={S.recap.duration} name="Récap">
				<RecapScene />
			</Sequence>
			<Sequence from={S.cta.from} durationInFrames={S.cta.duration} name="Final">
				<CtaScene />
			</Sequence>
			<Grain />
		</Freeze>
		<ServicesSound />
	</AbsoluteFill>
);
