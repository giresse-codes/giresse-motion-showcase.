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
//  PUBS GMOTION (GMotionPromo, GMotionPromo2, GMotionServices)
//  Style sobre et haut de gamme : une palette unique, un seul accent or.
// =============================================================================

/** Couleurs propres au logo G : le logo n'est jamais recoloré */
export const brandLogo = {
	night: '#050B1F',
	electric: '#1F5BFF',
	cyan: '#5BC8FF',
	white: '#FFFFFF',
};

/** Palette unique des pubs GMotion */
export const premium = {
	/** Fond bleu nuit, avec un dégradé très léger */
	bg: '#0B1A33',
	bgEnd: '#10234A',
	/** Texte et surfaces : blanc cassé */
	text: '#F5F7FA',
	textMuted: 'rgba(245, 247, 250, 0.64)',
	textFaint: 'rgba(245, 247, 250, 0.38)',
	surface: 'rgba(245, 247, 250, 0.04)',
	surfaceStrong: 'rgba(245, 247, 250, 0.08)',
	line: 'rgba(245, 247, 250, 0.12)',
	/** Secondaire : bleu acier */
	steel: '#2F6FD6',
	steelSoft: 'rgba(47, 111, 214, 0.18)',
	/** Accent or doux : un mot clé par plan, les fines lignes et le bouton WhatsApp. Jamais en grande surface. */
	gold: '#C9A45C',
	/** Ombre portée douce des cartes et appareils */
	shadow: '0 40px 90px rgba(3, 8, 20, 0.55)',
};

/** Coloration syntaxique monochrome (nuances de blanc et de bleu acier) */
export const premiumSyntax = {
	keyword: '#8DB3F0',
	string: '#BFD0E6',
	number: '#D7DEE8',
	comment: 'rgba(245, 247, 250, 0.36)',
	function: '#F5F7FA',
	tag: '#8DB3F0',
	attr: '#BFD0E6',
	punctuation: '#6F8DB8',
	plain: 'rgba(245, 247, 250, 0.82)',
};

export type ClientPalette = {
	/** Couleur principale, couleur secondaire, accent */
	primary: string;
	secondary: string;
	accent: string;
	/** Fond foncé et fond clair de la charte */
	dark: string;
	light: string;
	/** Couleur du texte posé sur le fond clair */
	ink: string;
};

/** Chartes des clients fictifs : leur propre identité, en tons doux */
export const clientPalettes: Record<string, ClientPalette> = {
	// NOVA, boisson énergétique : vert sauge et eucalyptus
	nova: {primary: '#8FB3A0', secondary: '#B9D0C2', accent: '#5E8473', dark: '#1B2A25', light: '#EEF3EF', ink: '#1B2A25'},
	// Boulangerie Le Wouri : caramel, beige et crème
	leWouri: {primary: '#B8946A', secondary: '#D9C3A0', accent: '#8A6A47', dark: '#2F251D', light: '#F6EFE4', ink: '#2F251D'},
	// Akwa Grill (GMotionServices) : terre cuite douce et sable
	akwaGrill: {primary: '#B9826A', secondary: '#DCC0AE', accent: '#8C5B47', dark: '#2B1E19', light: '#F5ECE6', ink: '#2B1E19'},
};

// =============================================================================
//  PUB « IPhone15ProMaxAd » — style nocturne : noir profond, un seul halo orange,
//  interfaces en verre gris, reflets au sol.
// =============================================================================
export const nocturne = {
	bg: '#040404',
	/** Halo orange (source de lumière unique) */
	orb: '#FF6A2B',
	orbCore: '#FFB27A',
	orange: '#FF5A1F',
	text: '#F4F4F5',
	textMuted: 'rgba(244, 244, 245, 0.6)',
	textFaint: 'rgba(244, 244, 245, 0.32)',
	glass: 'linear-gradient(160deg, rgba(38,38,40,0.92), rgba(12,12,13,0.96))',
	line: 'rgba(255, 255, 255, 0.12)',
	lineStrong: 'rgba(255, 255, 255, 0.22)',
	/** Finitions titane du téléphone dessiné */
	titanium: {
		natural: ['#8F8A80', '#C9C3B8', '#77736B'],
		blue: ['#3E4656', '#6C7487', '#2F3542'],
		white: ['#D9D7D2', '#F2F1EE', '#BDBAB3'],
		black: ['#3A3A3C', '#5A5A5E', '#2A2A2C'],
	},
};
