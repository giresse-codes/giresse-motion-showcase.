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

// =============================================================================
//  PUBS GMOTION (GMotionPromo, GMotionPromo2, GMotionServices) — deux palettes séparées
// =============================================================================

/** Couleurs du logo G : réservées au logo et au plan final. Ne jamais recolorer le logo. */
export const brandLogo = {
	night: '#050B1F',
	electric: '#1F5BFF',
	cyan: '#5BC8FF',
	white: '#FFFFFF',
};

/** Palette vive utilisée pour tout le reste de la vidéo */
export const videoPalette = {
	bg: '#0A0A0F',
	violet: '#7B2FF7',
	magenta: '#FF2E93',
	orange: '#FF7A1A',
	yellow: '#FFD23F',
	mint: '#2EE6A6',
	white: '#FFFFFF',
	muted: '#B9B3C9',
	whatsapp: '#25D366',
};

/** Couleur dominante de chaque plan (le plan « résultat » prend la charte du client) */
export const sceneColors = {
	hook: {main: videoPalette.magenta, second: videoPalette.violet},
	prompt: {main: videoPalette.violet, second: videoPalette.magenta},
	creation: {main: videoPalette.orange, second: videoPalette.yellow},
	beforeAfter: {main: videoPalette.mint, second: videoPalette.violet},
	cta: {main: brandLogo.electric, second: brandLogo.cyan},
};

export type ClientPalette = {
	/** Couleur principale, couleur secondaire, accent */
	primary: string;
	secondary: string;
	accent: string;
	/** Fond foncé et fond clair de la charte */
	dark: string;
	light: string;
	/** Couleur du texte posé sur le fond principal */
	ink: string;
};

/** Chartes graphiques des clients fictifs : chaque marque a sa propre identité */
export const clientPalettes: Record<string, ClientPalette> = {
	// NOVA, boisson énergétique : vert acide et menthe sur fond quasi noir
	nova: {primary: '#B8F24A', secondary: '#2EE6A6', accent: '#FFD23F', dark: '#0D1A10', light: '#EFFFD6', ink: '#0D1A10'},
	// Boulangerie Le Wouri : brun doré, crème et orange
	leWouri: {primary: '#C8862E', secondary: '#FF8A2A', accent: '#7A4A1E', dark: '#3B2210', light: '#FFF1D6', ink: '#3B2210'},
};

/** Pub GMotionServices : couleur dominante de chaque plan (un service = une couleur) */
export const serviceColors = {
	hook: {main: videoPalette.magenta, second: videoPalette.violet},
	motion: {main: videoPalette.orange, second: videoPalette.yellow},
	web: {main: videoPalette.violet, second: videoPalette.magenta},
	code: {main: videoPalette.mint, second: '#12B886'},
	recap: {main: videoPalette.magenta, second: videoPalette.orange},
	cta: {main: brandLogo.electric, second: brandLogo.cyan},
};

/** Coloration syntaxique « menthe » du plan Programmation */
export const mintSyntax = {
	keyword: '#FF2E93',
	string: '#FFD23F',
	number: '#FF7A1A',
	comment: '#5E8C7C',
	function: '#2EE6A6',
	tag: '#FF7A1A',
	attr: '#FFD23F',
	punctuation: '#9FF5D6',
	plain: '#F2FFF9',
};

clientPalettes.akwaGrill = {primary: '#FF7A1A', secondary: '#FFD23F', accent: '#B23A0E', dark: '#2A1206', light: '#FFF4E0', ink: '#2A1206'};
