// =============================================================================
//  CONFIGURATION — ton identité, ton contact et les textes de chaque vidéo.
//  Tu peux créer une nouvelle vidéo en dupliquant un bloc de `videos`
//  sans toucher au reste du code.
// =============================================================================

export const brand = {
	name: 'Giresse',
	services: 'Motion design, Développement web, Programmation',
	whatsapp: '673 236 084',
	whatsappCountryCode: '+237',
	city: 'Douala',
	ctaTitle: 'Votre projet mérite ce niveau.',
	ctaButton: 'Écrivez-moi sur WhatsApp',
};

// Un segment de voix off : le texte prononcé et son intervalle (en secondes).
// Les sous-titres animés sont générés à partir de ces segments, mot par mot.
export type VoiceSegment = {text: string; start: number; end: number};

export type ResultKind = 'motion' | 'web' | 'coding';

export type VideoScript = {
	/** Identifiant utilisé pour nommer les compositions (ex. WebDevPromo-Vertical) */
	id: string;
	kind: ResultKind;
	/** Accroche : entoure un mot d'astérisques pour le mettre en valeur (*UN*) */
	hook: string;
	/** Premier prompt, tapé caractère par caractère */
	prompt: string;
	/** Fichier et code qui défilent dans l'éditeur */
	code: {fileName: string; source: string};
	/** Étiquette affichée au moment de la révélation */
	revealLabel: string;
	/** Deuxième prompt (itération) et transformation appliquée au résultat */
	iteration: {
		prompt: string;
		fromGradient: [string, string];
		toGradient: [string, string];
		titleScale: number;
	};
	/** Le client local (contenu du résultat et de l'avant/après) */
	client: {
		name: string;
		tagline: string;
		sector: string;
		district: string;
		details: string[];
	};
	beforeLabel: string;
	afterLabel: string;
	/** Voix off : fichier dans public/ (lu automatiquement s'il existe) + texte synchronisé */
	voiceover: {file: string; segments: VoiceSegment[]};
};

export const videos: VideoScript[] = [
	// ---------------------------------------------------------------------------
	{
		id: 'MotionDesignPromo',
		kind: 'motion',
		hook: 'Il m’a fait ce logo animé en *UN* seul prompt',
		prompt:
			'Crée un logo animé et une pub de 15 s pour Sawa Jus, une marque de jus naturels de Douala. Style premium, énergique, couleurs tropicales.',
		code: {
			fileName: 'SawaJusAd.tsx',
			source: `import {spring, interpolate, useCurrentFrame} from 'remotion';
import {Logo, Bottle, Splash} from './brand';

// Pub animée Sawa Jus — 100 % naturel, 100 % Douala
export const SawaJusAd = () => {
  const frame = useCurrentFrame();
  const pop = spring({frame, fps: 30, config: {damping: 12}});
  const rotate = interpolate(frame, [0, 90], [-8, 0]);

  return (
    <Scene gradient={['#F97316', '#EC4899']}>
      <Splash particles={64} burst={pop} />
      <Logo
        scale={pop}
        rotate={rotate}
        title="Sawa Jus"
        stroke="draw-on"
      />
      <Bottle flavor="mangue" float={0.6} />
      <Bottle flavor="ananas" float={0.4} delay={8} />
      <Tagline words={['Frais', 'Local', 'Naturel']} stagger={6} />
      <Price value={500} currency="FCFA" />
      <Cta label="Disponible à Akwa et Bonapriso" />
    </Scene>
  );
};

export const timeline = [
  {at: 0, run: 'logo-reveal', easing: 'spring'},
  {at: 45, run: 'bottle-drop', easing: 'bounce'},
  {at: 90, run: 'tagline-kinetic'},
  {at: 150, run: 'price-punch', sfx: 'impact'},
  {at: 210, run: 'cta-glow', loop: true},
];

export const render = {width: 1080, height: 1920, fps: 30};`,
		},
		revealLabel: 'Logo animé + pub prête à publier',
		iteration: {
			prompt: 'Passe le dégradé en bleu et agrandis le titre',
			fromGradient: ['#F97316', '#EC4899'],
			toGradient: ['#2563EB', '#06B6D4'],
			titleScale: 1.35,
		},
		client: {
			name: 'Sawa Jus',
			tagline: '100 % naturel, 100 % Douala',
			sector: 'Jus naturels',
			district: 'Akwa',
			details: ['Mangue', 'Ananas', 'Bissap', '500 FCFA'],
		},
		beforeLabel: 'Avant',
		afterLabel: 'Après',
		voiceover: {
			file: 'voiceover/motion-design.mp3',
			segments: [
				{text: 'Un seul prompt. Regardez bien.', start: 0.2, end: 1.9},
				{text: 'Je décris la marque, l’ambiance et les couleurs.', start: 2.2, end: 4.8},
				{text: 'L’animation s’écrit, et je peaufine chaque détail.', start: 5.2, end: 8.6},
				{text: 'Résultat : un logo animé et une pub prête pour vos réseaux.', start: 9.4, end: 13.6},
				{text: 'Une retouche ? Une seule phrase suffit.', start: 14.1, end: 16.6},
				{text: 'Avant, après. Aucune comparaison.', start: 17.1, end: 18.9},
				{text: 'Écrivez-moi sur WhatsApp.', start: 19.0, end: 19.9},
			],
		},
	},
	// ---------------------------------------------------------------------------
	{
		id: 'WebDevPromo',
		kind: 'web',
		hook: 'Il m’a fait ce site en *UN* seul prompt',
		prompt:
			'Crée le site vitrine premium et responsive de Wouri Luxe Immobilier, une agence de Douala : hero animé, biens à la une, contact WhatsApp.',
		code: {
			fileName: 'index.tsx',
			source: `import {Hero, Listings, Contact, Navbar} from '@/components';
import {motion} from 'framer-motion';

// Wouri Luxe Immobilier — site vitrine premium
export default function Home() {
  return (
    <main className="bg-night text-white antialiased">
      <Navbar logo="Wouri Luxe" links={['Biens', 'Services', 'Contact']} />
      <Hero
        title="Vivez Douala autrement"
        subtitle="Villas et appartements d'exception à Bonapriso"
        gradient="from-violet-600 to-fuchsia-500"
        cta={{label: 'Voir les biens', href: '#biens'}}
      />
      <section id="biens" className="grid gap-6 md:grid-cols-3">
        {listings.map((bien, i) => (
          <motion.article
            key={bien.id}
            initial={{opacity: 0, y: 40}}
            whileInView={{opacity: 1, y: 0}}
            transition={{delay: i * 0.12, type: 'spring'}}
            className="rounded-3xl backdrop-blur-xl bg-white/5"
          >
            <Listing {...bien} />
          </motion.article>
        ))}
      </section>
      <Contact whatsapp="+237 6XX XX XX XX" city="Douala" />
    </main>
  );
}

const listings = [
  {id: 1, title: 'Villa Bonapriso', price: '450 M FCFA', rooms: 5},
  {id: 2, title: 'Penthouse Akwa', price: '280 M FCFA', rooms: 4},
  {id: 3, title: 'Duplex Bonanjo', price: '190 M FCFA', rooms: 3},
];`,
		},
		revealLabel: 'Site vitrine premium et responsive',
		iteration: {
			prompt: 'Passe le dégradé en bleu et agrandis le titre',
			fromGradient: ['#7C3AED', '#D946EF'],
			toGradient: ['#2563EB', '#06B6D4'],
			titleScale: 1.3,
		},
		client: {
			name: 'Wouri Luxe Immobilier',
			tagline: 'Vivez Douala autrement',
			sector: 'Agence immobilière',
			district: 'Bonapriso',
			details: ['Villa Bonapriso', 'Penthouse Akwa', 'Duplex Bonanjo'],
		},
		beforeLabel: 'Avant',
		afterLabel: 'Après',
		voiceover: {
			file: 'voiceover/web-dev.mp3',
			segments: [
				{text: 'Un seul prompt. Regardez bien.', start: 0.2, end: 1.9},
				{text: 'Je décris l’entreprise et ce qu’elle veut montrer.', start: 2.2, end: 4.8},
				{text: 'Le code s’écrit, propre, rapide et optimisé.', start: 5.2, end: 8.6},
				{text: 'Et voici un site vitrine premium, parfait sur mobile.', start: 9.4, end: 13.6},
				{text: 'On ajuste ? Une phrase, et c’est fait.', start: 14.1, end: 16.6},
				{text: 'Avant, après. Votre image change tout.', start: 17.1, end: 18.9},
				{text: 'Écrivez-moi sur WhatsApp.', start: 19.0, end: 19.9},
			],
		},
	},
	// ---------------------------------------------------------------------------
	{
		id: 'CodingPromo',
		kind: 'coding',
		hook: 'Il m’a codé cette appli en *UN* seul prompt',
		prompt:
			'Code un tableau de bord interactif pour Douala Express Livraisons : commandes en temps réel, chiffre d’affaires, livreurs actifs et graphiques animés.',
		code: {
			fileName: 'dashboard.ts',
			source: `import {createStore, live} from './realtime';
import {LineChart, BarChart, KpiCard} from './ui';

type Order = {id: string; zone: string; amount: number; status: Status};
type Status = 'en_route' | 'livree' | 'en_attente';

// Douala Express — tableau de bord temps réel
const store = createStore<Order[]>([]);

live('orders', (order: Order) => {
  store.update((orders) => [order, ...orders].slice(0, 500));
});

export function computeKpis(orders: Order[]) {
  const revenue = orders.reduce((sum, o) => sum + o.amount, 0);
  const delivered = orders.filter((o) => o.status === 'livree');
  return {
    revenue,
    orders: orders.length,
    rate: Math.round((delivered.length / orders.length) * 100),
    couriers: new Set(orders.map((o) => o.zone)).size,
  };
}

export function byZone(orders: Order[]) {
  const zones = ['Akwa', 'Bonapriso', 'Deido', 'Makepe', 'Bonamoussadi'];
  return zones.map((zone) => ({
    zone,
    total: orders.filter((o) => o.zone === zone).length,
  }));
}

export const Dashboard = () => {
  const orders = store.use();
  const kpis = computeKpis(orders);
  return (
    <Grid columns={4} gap={24}>
      <KpiCard label="Chiffre d'affaires" value={kpis.revenue} unit="FCFA" />
      <KpiCard label="Commandes" value={kpis.orders} trend="+18 %" />
      <LineChart data={orders} animate="draw" />
      <BarChart data={byZone(orders)} stagger={0.08} />
    </Grid>
  );
};`,
		},
		revealLabel: 'Tableau de bord interactif en temps réel',
		iteration: {
			prompt: 'Passe le dégradé en bleu et agrandis le titre',
			fromGradient: ['#8B5CF6', '#EC4899'],
			toGradient: ['#2563EB', '#06B6D4'],
			titleScale: 1.3,
		},
		client: {
			name: 'Douala Express',
			tagline: 'Livraisons en temps réel',
			sector: 'Logistique',
			district: 'Deido',
			details: ['Akwa', 'Bonapriso', 'Deido', 'Makepe', 'Bonamoussadi'],
		},
		beforeLabel: 'Avant',
		afterLabel: 'Après',
		voiceover: {
			file: 'voiceover/coding.mp3',
			segments: [
				{text: 'Un seul prompt. Regardez bien.', start: 0.2, end: 1.9},
				{text: 'Je décris le besoin, les données, les écrans.', start: 2.2, end: 4.8},
				{text: 'La logique se code, testée et typée.', start: 5.2, end: 8.6},
				{text: 'Voici une appli qui suit vos livraisons en direct.', start: 9.4, end: 13.6},
				{text: 'Une modification ? Elle se fait en direct.', start: 14.1, end: 16.6},
				{text: 'Avant, un tableur. Après, un vrai outil.', start: 17.1, end: 18.9},
				{text: 'Écrivez-moi sur WhatsApp.', start: 19.0, end: 19.9},
			],
		},
	},
];

// Volumes du mixage audio (0 à 1)
export const mix = {
	music: 0.32,
	musicDucked: 0.1,
	voiceover: 1,
	keyClick: 0.35,
	whoosh: 0.55,
	impact: 0.7,
	glitch: 0.45,
	riser: 0.5,
	pop: 0.4,
};

// =============================================================================
//  PUB « GMotionPromo » — 1080x1920, 30 images/s, 15 secondes, sans voix off.
//  Textes et contact modifiables ici (les couleurs sont dans theme.ts :
//  brandLogo, videoPalette, sceneColors et clientPalettes).
// =============================================================================
export type GMotionClient = {
	/** Identifiant de la composition (GMotionPromo, GMotionPromo2…) */
	compositionId: string;
	name: string;
	sector: string;
	adTitle: string;
	adSubtitle: string;
	adCta: string;
	/** Clé de la charte graphique dans clientPalettes (theme.ts) */
	palette: string;
	/** Forme du logo en pièces et produit montré dans la pub */
	mark: 'hexagon' | 'round';
	product: 'can' | 'bread';
	/** Texte de l'affiche « AVANT » */
	beforeTagline: string;
};

/** Une composition par client fictif : même déroulé, charte différente */
export const gmotionClients: GMotionClient[] = [
	{
		compositionId: 'GMotionPromo',
		name: 'NOVA',
		sector: 'Boissons énergétiques',
		adTitle: 'Nouvelle saveur',
		adSubtitle: 'Disponible dès maintenant',
		adCta: 'Goûte l’énergie',
		palette: 'nova',
		mark: 'hexagon',
		product: 'can',
		beforeTagline: 'Boisson énergétique en vente ici',
	},
	{
		compositionId: 'GMotionPromo2',
		name: 'Le Wouri',
		sector: 'Boulangerie artisanale',
		adTitle: 'Pain chaud dès 6 h',
		adSubtitle: 'Bonapriso, Douala',
		adCta: 'Commander',
		palette: 'leWouri',
		mark: 'round',
		product: 'bread',
		beforeTagline: 'Pain - gâteaux - viennoiseries',
	},
];

export const gmotion = {
	brandName: 'GMotion Studio',
	logo: 'logo-G.svg',
	whatsapp: '+237 673 236 084',
	/** Musique (à remplacer) et tempo : les plans et les accents sont calés sur ce BPM */
	music: 'music.mp3',
	bpm: 120,
	/** Décalage (en secondes) du premier temps fort dans ta musique */
	beatOffset: 0,
	/** Accroche ; le mot mis en valeur (jaune) est le dernier */
	hook: ['Ta', 'marque', 'mérite', 'de', 'BOUGER.'],
	prompt: 'Anime mon logo pour une pub de lancement',
	/** Mots du prompt surlignés en jaune dans la bulle envoyée */
	promptKeywords: ['logo', 'pub'],
	assistantName: 'GMotion IA',
	assistantGreeting: 'Salut ! Qu’est-ce qu’on anime aujourd’hui ?',
	creationLabel: 'Création en cours',
	timelineTracks: ['Logo', 'Échelle', 'Rotation', 'Opacité', 'Lueur'],
	resultLabel: 'Pub de lancement prête',
	before: 'AVANT',
	after: 'APRÈS',
	services: 'Motion design • Pubs animées • Logos animés',
	ctaButton: 'Écris-moi sur WhatsApp',
	/** Marge de sécurité en haut et en bas (interface TikTok), en pixels */
	safeMargin: 150,
	volumes: {
		music: 0.7,
		keyClick: 0.4,
		whoosh: 0.55,
		glitch: 0.45,
		impact: 0.65,
		swoosh: 0.4,
		pop: 0.22,
	},
};

// =============================================================================
//  PUB « GMotionServices » — 1080x1920, 30 images/s, 15 s, sans voix off.
//  Présente les 3 services. Couleurs : serviceColors dans theme.ts.
// =============================================================================
export const gmotionServices = {
	hook: {
		words: ['Ton', 'business', 'mérite', 'MIEUX', 'qu’une', 'affiche.'],
		/** Indices des mots sur chaque ligne */
		lines: [[0, 1], [2], [3], [4, 5]],
		/** Mot mis en valeur (jaune) */
		emphasis: 3,
	},
	/** Titre de chaque plan service */
	titles: {
		motion: {index: '01', title: 'Motion design', subtitle: 'Logos animés • Pubs animées'},
		web: {index: '02', title: 'Sites web', subtitle: 'Vitrines rapides et responsives'},
		code: {index: '03', title: 'Applications & code', subtitle: 'Tableaux de bord • Outils métier'},
	},
	recap: ['1 studio.', '3 expertises.'],
	/** Entreprise fictive de Douala dont le logo s'assemble */
	motionClient: {
		compositionId: 'GMotionServices',
		name: 'Akwa Grill',
		sector: 'Restaurant · Akwa, Douala',
		adTitle: 'Grillades au feu de bois',
		adSubtitle: 'Akwa, Douala',
		adCta: 'Réserver',
		palette: 'akwaGrill',
		mark: 'round',
		product: 'can',
		beforeTagline: '',
	} as GMotionClient,
	/** Site vitrine construit bloc par bloc */
	site: {
		name: 'Maison Ndolé',
		url: 'maison-ndole.cm',
		nav: ['Menu', 'Réserver', 'Contact'],
		heroTitle: 'La cuisine de Douala, revisitée',
		heroText: 'Ndolé, poulet DG et poisson braisé, à Bonapriso.',
		heroCta: 'Réserver une table',
		cards: ['Ndolé crevettes', 'Poulet DG', 'Poisson braisé'],
		prices: ['6 500 FCFA', '8 000 FCFA', '7 500 FCFA'],
	},
	/** Code qui défile puis se transforme en tableau de bord */
	code: {
		fileName: 'livraisons.ts',
		source: `import {live, chart, kpi} from './dashboard';

type Livraison = {id: string; quartier: string; montant: number};

// Wouri Logistique : suivi des livraisons en temps réel
export async function tableauDeBord(flux: Livraison[]) {
  const total = flux.reduce((s, l) => s + l.montant, 0);
  const parQuartier = grouper(flux, (l) => l.quartier);

  kpi('Chiffre du jour', total, 'FCFA');
  kpi('Livraisons', flux.length);
  chart('line', heureParHeure(flux), {animate: true});
  chart('bar', parQuartier, {stagger: 0.08});

  live('livraisons', (l) => flux.unshift(l));
  return {total, quartiers: Object.keys(parQuartier)};
}

const grouper = <T,>(liste: T[], cle: (t: T) => string) =>
  liste.reduce((acc, t) => ({...acc, [cle(t)]: [...(acc[cle(t)] ?? []), t]}), {});`,
	},
	dashboard: {
		name: 'Wouri Logistique',
		title: 'Livraisons du jour',
		kpis: [
			{label: 'Chiffre du jour', value: 2450000, unit: 'FCFA'},
			{label: 'Livraisons', value: 386, unit: ''},
			{label: 'Livreurs actifs', value: 42, unit: ''},
			{label: 'À l’heure', value: 97, unit: '%'},
		],
		zones: ['Akwa', 'Bonapriso', 'Deido', 'Makepe'],
	},
};
