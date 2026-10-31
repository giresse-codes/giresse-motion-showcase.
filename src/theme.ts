import {loadFont} from '@remotion/google-fonts/Inter';

const inter = loadFont('normal', {weights: ['400', '500', '600', '700', '800'], subsets: ['latin', 'latin-ext']});

// Charte de la pub : pièce sombre bleu nuit, interfaces en verre, un seul halo bleu.
export const theme = {
	font: inter.fontFamily,
	bg: '#070B1A',
	halo: '#2F6BFF',
	glass: 'rgba(25, 40, 85, 0.6)',
	glassSolid: 'rgba(16, 26, 58, 0.92)',
	border: 'rgba(140, 170, 255, 0.25)',
	divider: 'rgba(140, 170, 255, 0.14)',
	text: '#FFFFFF',
	soft: '#AFC3FF',
	muted: 'rgba(175, 195, 255, 0.62)',
	accent: '#2F6BFF',
	/** Vert réservé aux confirmations */
	success: '#22C55E',
	radius: 18,
	/** Marges réservées à l'interface TikTok */
	safe: 150,
};
