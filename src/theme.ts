// =============================================================================
//  THÈME VISUEL — couleurs, polices et logo.
//  Modifie ce fichier pour changer l'identité visuelle de toutes les vidéos.
// =============================================================================
import {loadFont as loadDisplay} from '@remotion/google-fonts/Sora';
import {loadFont as loadBody} from '@remotion/google-fonts/Inter';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';

const display = loadDisplay('normal', {
	weights: ['400', '600', '700', '800'],
	subsets: ['latin', 'latin-ext'],
});
const body = loadBody('normal', {
	weights: ['400', '500', '600', '700', '800'],
	subsets: ['latin', 'latin-ext'],
});
const mono = loadMono('normal', {
	weights: ['400', '500', '700'],
	subsets: ['latin', 'latin-ext'],
});

export const theme = {
	colors: {
		// Fond sombre
		bg: '#05060F',
		bgSoft: '#0B0E1F',
		// Dégradés néon bleu / violet
		blue: '#3B82F6',
		cyan: '#22D3EE',
		violet: '#8B5CF6',
		purple: '#A855F7',
		pink: '#EC4899',
		// Accent « actif » (mot surligné des sous-titres, curseur…)
		accent: '#22D3EE',
		highlight: '#FACC15',
		success: '#22C55E',
		whatsapp: '#25D366',
		// Textes
		text: '#F8FAFC',
		textMuted: '#94A3B8',
		textDim: '#64748B',
		// Verre (glassmorphism)
		glass: 'rgba(255, 255, 255, 0.06)',
		glassStrong: 'rgba(255, 255, 255, 0.10)',
		glassBorder: 'rgba(255, 255, 255, 0.14)',
	},
	// Coloration syntaxique de l'éditeur de code
	syntax: {
		keyword: '#C792EA',
		string: '#A5E844',
		number: '#F78C6C',
		comment: '#5C6A92',
		function: '#82AAFF',
		tag: '#FF5370',
		attr: '#FFCB6B',
		punctuation: '#89DDFF',
		plain: '#D6DEEB',
	},
	fonts: {
		display: display.fontFamily,
		body: body.fontFamily,
		mono: mono.fontFamily,
	},
	radius: {
		sm: 12,
		md: 20,
		lg: 32,
	},
	// Logo animé (monogramme vectoriel). Pour utiliser ton propre logo,
	// dépose une image dans public/logo/ et renseigne `image` (ex. 'logo/logo.png').
	logo: {
		image: null as string | null,
		monogram: 'G',
		// Tracé SVG (viewBox 0 0 100 100) dessiné progressivement pendant l'animation
		path: 'M72 30 A28 28 0 1 0 78 58 L52 58',
		gradient: ['#22D3EE', '#8B5CF6', '#EC4899'],
	},
};

export type Theme = typeof theme;
