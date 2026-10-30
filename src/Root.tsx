import React from 'react';
import {Composition, Folder} from 'remotion';
import {gmotionClients, videos} from './config';
import {DURATION, FPS} from './lib/timeline';
import {PromoVideo} from './PromoVideo';
import {GMotionPromo} from './gmotion/GMotionPromo';
import {DURATION as GMOTION_DURATION, FPS as GMOTION_FPS} from './gmotion/timeline';

const FORMATS = [
	{suffix: 'Vertical', width: 1080, height: 1920},
	{suffix: 'Landscape', width: 1920, height: 1080},
];

// Chaque vidéo de config.ts est déclinée en 9:16 (Vertical) et 16:9 (Landscape).
export const RemotionRoot: React.FC = () => (
	<>
		{videos.map((video) => (
			<Folder key={video.id} name={video.id}>
				{FORMATS.map((f) => (
					<Composition
						key={f.suffix}
						id={`${video.id}-${f.suffix}`}
						component={PromoVideo}
						durationInFrames={DURATION}
						fps={FPS}
						width={f.width}
						height={f.height}
						defaultProps={{videoId: video.id}}
					/>
				))}
			</Folder>
		))}
		{gmotionClients.map((client) => (
			<Composition
				key={client.compositionId}
				id={client.compositionId}
				component={GMotionPromo}
				durationInFrames={GMOTION_DURATION}
				fps={GMOTION_FPS}
				width={1080}
				height={1920}
				defaultProps={{compositionId: client.compositionId}}
			/>
		))}
	</>
);
