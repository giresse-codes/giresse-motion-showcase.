import React from 'react';
import {AbsoluteFill, Freeze, Html5Audio, Sequence, staticFile} from 'remotion';
import {gmotion, gmotionServices} from '../../config';
import {serviceColors, videoPalette} from '../../theme';
import {keyClickFrames} from '../../lib/typing';
import {ColorStop, GBackground, Grain} from '../Atmosphere';
import {CtaScene} from '../CtaScene';
import {HookScene} from '../HookScene';
import {FREEZE_AT} from '../timeline';
import {CodeScene} from './CodeScene';
import {MotionScene} from './MotionScene';
import {RecapScene} from './RecapScene';
import {WebScene} from './WebScene';
import {S} from './timeline';

const vol = gmotion.volumes;

/** Couleur dominante de chaque plan : un service = une couleur, bleu uniquement pour le final */
const STOPS: ColorStop[] = [
	{until: S.motion.from, ...serviceColors.hook},
	{until: S.web.from + 4, ...serviceColors.motion},
	{until: S.code.from + 2, ...serviceColors.web},
	{until: S.recap.from + 4, ...serviceColors.code},
	{until: S.cta.from, ...serviceColors.recap},
	{until: S.cta.from + S.cta.duration, ...serviceColors.cta},
];

const Sfx: React.FC<{at: number; file: string; volume: number}> = ({at, file, volume}) => (
	<Sequence from={Math.max(0, Math.round(at))} durationInFrames={75} layout="none">
		<Html5Audio src={staticFile(file)} volume={volume} />
	</Sequence>
);

// Effets sonores calés sur le beat (120 BPM : un temps = 15 images).
const ServicesSound: React.FC = () => {
	const m = S.motion;
	const w = S.web;
	const c = S.code;
	// Clics de clavier pendant que le code défile (une frappe toutes les 2 images)
	const clicks = keyClickFrames(
		Array.from({length: 40}, (_, i) => c.from + c.typeStart + (i * (c.typeEnd - c.typeStart)) / 40),
		2,
	);
	return (
		<>
			<Html5Audio src={staticFile(gmotion.music)} volume={vol.music} />
			{/* Accroche */}
			<Sfx at={S.hook.flashAt} file="sfx/impact.wav" volume={vol.impact * 0.6} />
			<Sfx at={S.hook.exitAt - 2} file="sfx/whoosh.wav" volume={vol.whoosh} />
			{/* Motion design : swoosh des morceaux du logo, verrouillage */}
			<Sfx at={m.from + m.assembleAt} file="sfx/swoosh.wav" volume={vol.swoosh} />
			<Sfx at={m.from + m.lockAt} file="sfx/pop.wav" volume={vol.pop * 1.4} />
			{/* Web : glitch + whoosh, pops des blocs, whoosh vers le téléphone */}
			<Sfx at={w.from - 6} file="sfx/whoosh.wav" volume={vol.whoosh} />
			<Sfx at={w.from - 2} file="sfx/glitch.wav" volume={vol.glitch} />
			{w.blocks.map((b, i) => (
				<Sfx key={`b${i}`} at={w.from + b} file="sfx/pop.wav" volume={vol.pop * 0.6} />
			))}
			<Sfx at={w.from + w.phoneAt - 4} file="sfx/whoosh.wav" volume={vol.whoosh * 0.8} />
			{/* Programmation : impact sur le drop, clics, swoosh de la transformation */}
			<Sfx at={c.from - 6} file="sfx/whoosh.wav" volume={vol.whoosh} />
			<Sfx at={c.from + 2} file="sfx/impact.wav" volume={vol.impact} />
			{clicks.map((f, i) => (
				<Sfx key={`k${i}`} at={f} file={`sfx/key-${(i % 4) + 1}.wav`} volume={vol.keyClick * 0.8} />
			))}
			<Sfx at={c.from + c.morphAt - 2} file="sfx/swoosh.wav" volume={vol.swoosh} />
			{/* Récap : un pop par carte, sur les temps */}
			<Sfx at={S.recap.from - 4} file="sfx/whoosh.wav" volume={vol.whoosh} />
			{S.recap.cards.map((at, i) => (
				<Sfx key={`c${i}`} at={S.recap.from + at} file="sfx/pop.wav" volume={vol.pop * 1.2} />
			))}
			{/* Final : swoosh du logo dessiné */}
			<Sfx at={S.cta.from - 4} file="sfx/whoosh.wav" volume={vol.whoosh * 0.8} />
			<Sfx at={S.cta.from + 2} file="sfx/swoosh.wav" volume={vol.swoosh} />
			<Sfx at={S.cta.from + 20} file="sfx/pop.wav" volume={vol.pop * 1.4} />
			<Sfx at={S.cta.from + 38} file="sfx/pop.wav" volume={vol.pop} />
		</>
	);
};

// Pub verticale GMotion Studio présentant les 3 services — 1080x1920, 30 images/s, 15 s, sans voix off.
export const GMotionServices: React.FC = () => {
	const h = gmotionServices.hook;
	return (
		<AbsoluteFill style={{backgroundColor: videoPalette.bg}}>
			{/* Toute l'image se fige pendant les 0,5 dernière seconde */}
			<Freeze frame={FREEZE_AT} active={(f) => f >= FREEZE_AT}>
				<GBackground stops={STOPS} brandFrom={S.cta.from} />
				<Sequence from={S.hook.from} durationInFrames={S.hook.duration} name="Accroche">
					<HookScene words={h.words} lines={h.lines} emphasis={h.emphasis} wordFrames={S.hook.words} flashAt={S.hook.flashAt} exitAt={S.hook.exitAt} fontSize={96} />
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
};
