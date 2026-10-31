import React from 'react';
import {Composition} from 'remotion';
import {GiresseAd} from './GiresseAd';
import {GiresseAdFilmed} from './GiresseAdFilmed';
import {DURATION, FPS} from './timeline';

export const RemotionRoot: React.FC = () => (
	<>
		<Composition id="GiresseAd" component={GiresseAd} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} />
		<Composition id="GiresseAdFilmed" component={GiresseAdFilmed} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} />
	</>
);
