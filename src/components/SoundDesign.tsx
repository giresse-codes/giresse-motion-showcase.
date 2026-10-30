import React from 'react';
import {getStaticFiles, Html5Audio, interpolate, Sequence, staticFile} from 'remotion';
import {mix, VideoScript} from '../config';
import {SCENES} from '../lib/timeline';
import {keyClickFrames, makeTypingTimes} from '../lib/typing';

const FPS = 30;

const Sfx: React.FC<{at: number; file: string; volume: number}> = ({at, file, volume}) => (
	<Sequence from={Math.max(0, Math.round(at))} durationInFrames={90} layout="none">
		<Html5Audio src={staticFile(file)} volume={volume} />
	</Sequence>
);

/** Le fichier de voix off est-il présent dans public/ ? */
const hasFile = (name: string) => {
	try {
		return getStaticFiles().some((f) => f.name === name);
	} catch {
		return false;
	}
};

// Design sonore : clics de clavier, whoosh, impact, musique rythmée avec ducking sous la voix off.
export const SoundDesign: React.FC<{script: VideoScript}> = ({script}) => {
	const voice = hasFile(script.voiceover.file);
	const segments = script.voiceover.segments;

	// Ducking automatique : la musique baisse pendant chaque segment de voix off
	const musicVolume = (f: number) => {
		if (!voice) return mix.music;
		const t = f / FPS;
		let duck = 0;
		for (const s of segments) {
			duck = Math.max(duck, interpolate(t, [s.start - 0.25, s.start, s.end, s.end + 0.35], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
		}
		const fadeOut = interpolate(f, [570, 600], [1, 0.6], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
		return (mix.music - (mix.music - mix.musicDucked) * duck) * fadeOut;
	};

	const p = SCENES.prompt;
	const promptClicks = keyClickFrames(makeTypingTimes(script.prompt, p.from + p.typingStart, p.typingDuration, 'prompt'));
	const r = SCENES.result;
	const iterClicks = keyClickFrames(
		makeTypingTimes(script.iteration.prompt, r.from + r.iterTypingStart, r.iterTypingDuration, 'iteration'),
	);
	const clicks = [...promptClicks, ...iterClicks];

	return (
		<>
			<Html5Audio src={staticFile('music/background.wav')} volume={musicVolume} />
			{voice && <Html5Audio src={staticFile(script.voiceover.file)} volume={mix.voiceover} />}

			{clicks.map((f, i) => (
				<Sfx key={`k${i}`} at={f} file={`sfx/key-${(i % 4) + 1}.wav`} volume={mix.keyClick * (0.75 + ((i * 7) % 5) * 0.08)} />
			))}
			{/* Envoi des prompts */}
			<Sfx at={p.from + p.sendAt} file="sfx/pop.wav" volume={mix.pop} />
			<Sfx at={r.from + r.iterSendAt} file="sfx/pop.wav" volume={mix.pop} />

			{/* Transitions */}
			<Sfx at={SCENES.hook.exitAt - 4} file="sfx/whoosh.wav" volume={mix.whoosh * 0.7} />
			<Sfx at={SCENES.code.from - 8} file="sfx/whoosh.wav" volume={mix.whoosh} />
			<Sfx at={SCENES.code.from + SCENES.code.glitchAt} file="sfx/glitch.wav" volume={mix.glitch} />
			<Sfx at={SCENES.code.from + SCENES.code.glitchAt - 10} file="sfx/whoosh.wav" volume={mix.whoosh} />
			{/* Impact grave sur la révélation */}
			<Sfx at={SCENES.result.from} file="sfx/impact.wav" volume={mix.impact} />
			<Sfx at={r.from + r.morphAt} file="sfx/whoosh.wav" volume={mix.whoosh * 0.6} />
			<Sfx at={SCENES.beforeAfter.from - 30} file="sfx/riser.wav" volume={mix.riser} />
			<Sfx at={SCENES.beforeAfter.from + SCENES.beforeAfter.wipeStart} file="sfx/whoosh.wav" volume={mix.whoosh} />
			<Sfx at={SCENES.cta.from - 4} file="sfx/whoosh.wav" volume={mix.whoosh * 0.8} />
			<Sfx at={SCENES.cta.from + 2} file="sfx/impact.wav" volume={mix.impact * 0.55} />
		</>
	);
};
