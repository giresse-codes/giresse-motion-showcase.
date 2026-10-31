import React from 'react';
import {AbsoluteFill, Freeze, getStaticFiles, Html5Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {config} from './config';
import {theme} from './theme';
import {FREEZE_AT, T} from './timeline';
import {Header, progress, Room, Stage} from './ui/kit';
import {DashboardScene, InboxScene, InvoiceScene, OrderScene, PhoneScene, PillsLayer, PlanningScene} from './scenes/Scenes';
import {EndScene} from './scenes/EndScene';

const hasFile = (name: string) => {
	try {
		return getStaticFiles().some((f) => f.name === name);
	} catch {
		return false;
	}
};

const Sfx: React.FC<{at: number; file: string; volume: number}> = ({at, file, volume}) => (
	<Sequence from={Math.max(0, at)} durationInFrames={60} layout="none">
		<Html5Audio src={staticFile(file)} volume={volume} />
	</Sequence>
);

/** Son : musique (si public/music.mp3 existe), whoosh doux sur les transitions, « ding » sur le paiement */
export const AdSound: React.FC = () => {
	const a = config.audio;
	const transitions = [T.order.from, T.invoice.from, T.phone.from, T.planning.from, T.dashboard.from, T.end.from];
	return (
		<>
			{hasFile(a.music) && <Html5Audio src={staticFile(a.music)} volume={(f) => a.musicVolume * Math.min(1, f / 20) * Math.min(1, (900 - f) / 30)} />}
			{transitions.map((t) => (
				<Sfx key={t} at={t - 6} file="sons/whoosh.wav" volume={a.whoosh} />
			))}
			<Sfx at={T.phone.from + T.phone.tapAt} file="sons/tap.wav" volume={a.tap} />
			<Sfx at={T.phone.from + T.phone.notifAt} file="sons/ding.wav" volume={a.ding} />
		</>
	);
};

/** Contenu visuel de la pub (sans le son) ; l'entête peut être masqué pour la variante filmée */
export const AdVisual: React.FC<{showHeader?: boolean}> = ({showHeader = true}) => {
	const frame = useCurrentFrame();
	// À 26 s, tout s'efface avant le logo
	const fadeAll = 1 - progress(frame, T.end.from, 16);
	return (
		<AbsoluteFill style={{background: theme.bg}}>
			<Freeze frame={FREEZE_AT} active={(f) => f >= FREEZE_AT}>
				<Room haloOpacity={0.4 + 0.6 * fadeAll} />
				<Stage opacity={fadeAll}>
					<InboxScene />
					<OrderScene />
					<InvoiceScene />
					<PillsLayer />
					<PhoneScene />
					<PlanningScene />
					<DashboardScene />
				</Stage>
				<EndScene />
				{showHeader && <Header />}
			</Freeze>
		</AbsoluteFill>
	);
};

// Pub GIRESSE Digital Studio — 1080x1920, 30 images/s, 30 s, sans voix off.
export const GiresseAd: React.FC = () => (
	<AbsoluteFill>
		<AdVisual />
		<AdSound />
	</AbsoluteFill>
);
