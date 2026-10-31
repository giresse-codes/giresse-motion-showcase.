// =============================================================================
//  TEXTES DE LA PUB — change le client, le produit ou le prix ici,
//  puis relance le rendu : aucune autre modification n'est nécessaire.
// =============================================================================

export const config = {
	/** Entête fixe, visible pendant toute la vidéo */
	header: 'Le nouveau motion design de Claude 🤯💀',

	studio: {
		name: 'GIRESSE Digital Studio',
		logo: 'logo-giresse.png',
		tagline: 'Du message au paiement, sans rien ressaisir.',
		cta: 'Et chez vous ? → WhatsApp +237 673 236 084',
	},

	/** Devise et format des montants */
	currency: '$',

	/** Menu latéral des fenêtres de l'application */
	menu: ['Tableau de bord', 'Clients', 'Commandes', 'Factures', 'Planning', 'Automatisations'],
	appName: 'Giresse OS',

	client: {
		name: 'Mme Ngo Bassa',
		company: 'Boutique Élégance, Akwa',
		initials: 'NB',
		phone: '+237 6•• •• •• 12',
	},

	inbox: {
		title: 'Boîte de réception',
		time: '09:42',
		/** Le message ; chaque info clé est entre [crochets] et sera détectée */
		message: 'Bonjour, je veux [20 robes] wax [taille M] livrées [samedi] à [Bonapriso]. C’est combien ?',
		/** Autres conversations affichées dans la liste */
		others: [
			{name: 'Pharmacie du Wouri', preview: 'Merci pour la facture !', time: '08:15'},
			{name: 'Hôtel La Falaise', preview: 'Le site est en ligne ?', time: 'Hier'},
			{name: 'Kribi Transports', preview: 'Planning reçu, parfait.', time: 'Hier'},
		],
		detectedLabel: 'Infos détectées',
		/** Pastilles allumées une par une (dans l'ordre des [crochets] du message) */
		pills: ['20 robes', 'taille M', 'samedi', 'Bonapriso'],
	},

	order: {
		title: 'Nouvelle commande',
		fields: {
			client: 'Client',
			article: 'Article',
			quantity: 'Quantité',
			size: 'Taille',
			delivery: 'Livraison',
			address: 'Adresse',
		},
		article: 'Robe wax',
		/** Valeurs remplies par chaque pastille (même ordre que inbox.pills) */
		values: ['20', 'M', 'Samedi 7 nov.', 'Bonapriso, Douala'],
		status: 'Remplie automatiquement',
	},

	invoice: {
		number: 'Facture N° 2026-0187',
		date: '31 octobre 2026',
		columns: ['Désignation', 'Qté', 'Prix', 'Montant'],
		lines: [
			{label: 'Robe wax, taille M', qty: 20, price: 27.5},
			{label: 'Livraison Bonapriso, samedi', qty: 1, price: 25},
		],
		totalLabel: 'Total',
		send: 'Envoyer',
	},

	phone: {
		merchant: 'GIRESSE Digital Studio',
		pay: 'Payer',
		notification: 'Paiement reçu',
		notificationApp: 'Giresse OS',
		/** Cadre d'iPhone 13 optionnel : si public/iphone-13.png existe, il est utilisé */
		frameImage: 'iphone-13.png',
	},

	planning: {
		title: 'Planning',
		week: 'Semaine du 2 au 8 novembre',
		days: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
		event: 'Livraison · Boutique Élégance',
		eventPlace: 'Bonapriso · 10:00',
		chainTitle: 'Automatisation',
		steps: ['Commande créée', 'Livraison planifiée', 'Facture envoyée', 'Paiement reçu', 'Relance programmée'],
	},

	dashboard: {
		title: 'Tableau de bord',
		kpis: [
			{label: 'Commandes', value: 18},
			{label: 'Livrées', value: 11},
			{label: 'En cours', value: 7},
		],
		todayLabel: 'aujourd’hui',
		chartTitle: 'Commandes de la semaine',
		chart: [6, 9, 7, 12, 10, 15, 18],
	},

	/** Volumes du mixage (0 à 1). La musique (public/music.mp3) est jouée si le fichier existe. */
	audio: {music: 'music.mp3', musicVolume: 0.5, whoosh: 0.35, ding: 0.55, tap: 0.4},
};

/** Montant total de la facture, calculé à partir des lignes */
export const invoiceTotal = config.invoice.lines.reduce((sum, l) => sum + l.qty * l.price, 0);

/** Formate un montant : 27.5 → « 27,50 $ » */
export const money = (n: number, decimals = 2) =>
	`${n.toLocaleString('fr-FR', {minimumFractionDigits: decimals, maximumFractionDigits: decimals}).replace(/ | /g, ' ')} ${config.currency}`;
