import React from 'react';
import {CodingResult} from './CodingResult';
import {MotionResult} from './MotionResult';
import {WebResult} from './WebResult';
import type {ResultProps} from './shared';

export {BeforeVisual} from './Before';
export type {ResultProps} from './shared';

// Choisit le rendu final adapté au type de service.
export const ResultVisual: React.FC<ResultProps> = (props) => {
	if (props.script.kind === 'web') return <WebResult {...props} />;
	if (props.script.kind === 'motion') return <MotionResult {...props} />;
	return <CodingResult {...props} />;
};
