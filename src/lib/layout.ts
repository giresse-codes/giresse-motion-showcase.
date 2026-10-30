import {useVideoConfig} from 'remotion';

// Donne des dimensions adaptées au format (9:16 ou 16:9).
// `u` est une unité de mise à l'échelle : 1 u = 1 px sur un écran de 1080 px de petit côté.
export const useLayout = () => {
	const {width, height} = useVideoConfig();
	const isVertical = height > width;
	const u = Math.min(width, height) / 1080;
	return {width, height, isVertical, u};
};
