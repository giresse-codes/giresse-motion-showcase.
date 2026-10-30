import React from 'react';
import {AbsoluteFill, Freeze, Html5Audio, Sequence, staticFile} from 'remotion';
import {iphoneAd} from '../config';
import {nocturne} from '../theme';
import {keyClickFrames, makeTypingTimes} from '../lib/typing';
import {Grain} from '../gmotion/Atmosphere';
import {LightStreak, NightBackground} from './kit';
import {DisplayScene, EndScene, IntroScene, RevealScene, SearchScene, StackScene, ZoomScene} from './Scenes';
import {FREEZE_AT, STREAKS, T} from './timeline';

const vol = iphoneAd.volumes;

const Sfx: React.FC<{at: number; file: string; volume: number}> = ({at, file, volume}) => (
	<Sequence from={Math.max(0, Math.round(at))} durationInFrames={75} layout="none">
		<Html5Audio src={staticFile(file)} volume={volume} />
	</Sequence>
);

// Sons calés sur les changements de plan (tous sur un temps à 120 BPM).
const AdSound: React.FC = () => {
	const s = T.search;
	const clicks = keyClickFrames(makeTypingTimes(iphoneAd.search, s.from + s.typingStart, s.typingDuration, 'iphone-search'));
	return (
		<>
			<Html5Audio src={staticFile(iphoneAd.music)} volume={vol.music} />
			{STREAKS.map((at, i) => (
				<Sfx key={`w${i}`} at={at - 4} file="sfx/whoosh.wav" volume={vol.whoosh} />
			))}
			{clicks.map((f, i) => (
				<Sfx key={`k${i}`} at={f} file={`sfx/key-${(i % 4) + 1}.wav`} volume={vol.keyClick * (0.75 + ((i * 7) % 5) * 0.06)} />
			))}
			<Sfx at={T.reveal.from} file="sfx/impact.wav" volume={vol.impact} />
			<Sfx at={T.reveal.from + T.reveal.titleAt} file="sfx/swoosh.wav" volume={vol.swoosh} />
			<Sfx at={T.display.from + T.display.finishesAt} file="sfx/swoosh.wav" volume={vol.swoosh * 0.8} />
			<Sfx at={T.end.from} file="sfx/impact.wav" volume={vol.impact * 0.8} />
		</>
	);
};

// Concept publicitaire non officiel pour l'iPhone 15 Pro Max — 1080x1920, 30 images/s, 20 s, sans voix off.
// Style inspiré de la référence : noir profond, halo orange unique, verre gris, reflets au sol.
export const IPhone15ProMaxAd: React.FC = () => (
	<AbsoluteFill style={{backgroundColor: nocturne.bg}}>
		{/* La dernière demi-seconde est une image fixe */}
		<Freeze frame={FREEZE_AT} active={(f) => f >= FREEZE_AT}>
			<NightBackground />
			<Sequence from={T.intro.from} durationInFrames={T.intro.duration} name="Intro">
				<IntroScene />
			</Sequence>
			<Sequence from={T.search.from} durationInFrames={T.search.duration} name="Recherche">
				<SearchScene />
			</Sequence>
			<Sequence from={T.reveal.from} durationInFrames={T.reveal.duration} name="Révélation">
				<RevealScene />
			</Sequence>
			<Sequence from={T.stack.from} durationInFrames={T.stack.duration} name="Caractéristiques">
				<StackScene />
			</Sequence>
			<Sequence from={T.zoom.from} durationInFrames={T.zoom.duration} name="Zoom 5x">
				<ZoomScene />
			</Sequence>
			<Sequence from={T.display.from} durationInFrames={T.display.duration} name="Écran et finitions">
				<DisplayScene />
			</Sequence>
			<Sequence from={T.end.from} durationInFrames={T.end.duration} name="Fin">
				<EndScene />
			</Sequence>
			{STREAKS.map((at, i) => (
				<LightStreak key={i} at={at} seed={`streak-${i}`} />
			))}
			<Grain opacity={0.06} />
		</Freeze>
		<AdSound />
	</AbsoluteFill>
);
