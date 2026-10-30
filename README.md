# giresse-motion-showcase

Vidéos publicitaires **« un seul prompt, et voilà le résultat »**, réalisées avec
[Remotion](https://www.remotion.dev) en TypeScript, pour présenter mes services
(motion design, développement web, programmation) aux entreprises.

Ce dépôt contient aussi les pubs **GMotionPromo**, **GMotionPromo2**, **GMotionServices** et le concept **IPhone15ProMaxAd** (voir plus bas).

Trois vidéos de 20 secondes (30 images/s), chacune en **9:16 (1080×1920)** et en
**16:9 (1920×1080)** :

| Composition            | Résultat montré                                                         |
| ---------------------- | ----------------------------------------------------------------------- |
| `MotionDesignPromo-*`  | Logo animé + publicité animée pour une marque locale (Sawa Jus)          |
| `WebDevPromo-*`        | Site vitrine premium et responsive (Wouri Luxe Immobilier, Douala)       |
| `CodingPromo-*`        | Tableau de bord interactif animé (Douala Express Livraisons)             |

`*` = `Vertical` (9:16) ou `Landscape` (16:9).

## Structure narrative (commune aux 3 vidéos)

| Temps     | Séquence          | Contenu                                                                     |
| --------- | ----------------- | --------------------------------------------------------------------------- |
| 0 → 2 s   | Accroche          | Typographie cinétique, mots un par un avec rebond                           |
| 2 → 5 s   | Prompt            | Chat sombre en verre dépoli, frappe caractère par caractère + clics clavier |
| 5 → 9 s   | Code              | Code qui défile, coloration syntaxique, caméra 3D, lueur néon               |
| 9 → 14 s  | Révélation        | Glitch + flash + whoosh + impact grave, appareil 3D, particules             |
| 14 → 17 s | Itération         | Deuxième prompt, le résultat se transforme en direct                        |
| 17 → 19 s | Avant / après     | Écran partagé avec balayage                                                 |
| 19 → 20 s | Appel à l'action  | Nom, services, WhatsApp, logo animé                                         |

## Installation

Prérequis : [Node.js](https://nodejs.org) 18 ou plus récent.

```bash
npm install
```

## Prévisualiser dans Remotion Studio

```bash
npm run dev
```

Le Studio s'ouvre sur <http://localhost:3000>. Les compositions sont rangées par
dossier (une vidéo = un dossier, deux formats).

## Exporter en MP4

Les fichiers sont créés dans `out/`.

```bash
# Une vidéo précise
npm run render:motion:vertical     # out/MotionDesignPromo-9x16.mp4
npm run render:motion:landscape    # out/MotionDesignPromo-16x9.mp4
npm run render:web:vertical        # out/WebDevPromo-9x16.mp4
npm run render:web:landscape       # out/WebDevPromo-16x9.mp4
npm run render:coding:vertical     # out/CodingPromo-9x16.mp4
npm run render:coding:landscape    # out/CodingPromo-16x9.mp4

# Les six vidéos d'un coup
npm run render:all

# Ou n'importe quelle composition
npx remotion render WebDevPromo-Vertical out/ma-video.mp4
```

Astuce : pour un aperçu rapide en basse résolution, ajoute `--scale=0.5`
(ex. `npx remotion render WebDevPromo-Vertical out/apercu.mp4 --scale=0.5`).

## Personnaliser sans toucher au code

### `src/config.ts` — toi et tes textes

- `brand` : ton nom, tes services, ton numéro WhatsApp (`673 236 084`), le texte
  du bouton d'appel à l'action.
- `videos` : une entrée par vidéo, avec l'accroche (`*UN*` = mot mis en valeur),
  le prompt, le code affiché, le prompt d'itération et les couleurs avant/après,
  le client local, et le texte de la voix off découpé en segments minutés.
- `mix` : volumes de la musique, de la voix off et des effets sonores.

**Créer une nouvelle vidéo** : duplique un bloc de `videos`, change son `id` et
ses textes. Elle apparaît automatiquement dans le Studio en 9:16 et en 16:9
(`kind` choisit le type de résultat : `motion`, `web` ou `coding`).

### `src/theme.ts` — identité visuelle

Couleurs (fond, néons bleu/violet, accent), coloration syntaxique, polices
(Sora, Inter, JetBrains Mono via Google Fonts) et logo (monogramme vectoriel ou
ton image dans `public/logo/`).

## Audio

| Élément              | Fichier                                   |
| -------------------- | ----------------------------------------- |
| Musique rythmée      | `public/music/background.wav`             |
| Clics de clavier     | `public/sfx/key-1.wav` … `key-4.wav`      |
| Whoosh               | `public/sfx/whoosh.wav`                   |
| Impact grave         | `public/sfx/impact.wav`                   |
| Glitch, riser, pop, swoosh | `public/sfx/glitch.wav`, `riser.wav`, `pop.wav`, `swoosh.wav` |
| Voix off             | `public/voiceover/*.mp3` (à fournir)      |

Les effets et la musique sont **synthétisés par un script** (libres de droits) ;
pour les régénérer : `npm run sfx`. Tu peux aussi les remplacer par tes propres
fichiers en gardant les mêmes noms.

**Voix off** : dépose `motion-design.mp3`, `web-dev.mp3` et `coding.mp3` dans
`public/voiceover/` (voir le README de ce dossier). Le fichier est détecté
automatiquement ; la musique baisse alors toute seule pendant que la voix parle
(ducking). Les sous-titres animés style TikTok (mot actif surligné) sont
synchronisés sur les segments définis dans `config.ts`.

## Organisation du code

```
src/
├── config.ts               ← ton nom, ton WhatsApp, les textes de chaque vidéo
├── theme.ts                ← couleurs, polices, logo
├── Root.tsx                ← déclaration des 6 compositions
├── PromoVideo.tsx          ← assemblage des scènes sur la timeline
├── lib/                    ← timeline, mise en page 9:16/16:9, animations, frappe, coloration
├── components/
│   ├── HookText.tsx           accroche en typographie cinétique
│   ├── FakeChatUI.tsx         interface de chat + frappe + curseur
│   ├── TypingCode.tsx         éditeur de code animé
│   ├── Camera3D.tsx           caméra 3D à ressorts + flou de mouvement
│   ├── DeviceMockup.tsx       navigateur / téléphone
│   ├── GlitchTransition.tsx   glitch RVB + flash lumineux
│   ├── BeforeAfter.tsx        écran partagé avec balayage
│   ├── AnimatedSubtitles.tsx  sous-titres style TikTok
│   ├── CallToAction.tsx       appel à l'action
│   ├── AnimatedLogo.tsx, Background.tsx, Particles.tsx, SoundDesign.tsx
└── results/                ← les résultats (pub, site, tableau de bord) et leurs versions « avant »
```

## Pubs GMotion (GMotion Studio)

Trois publicités verticales **1080×1920, 30 images/s, 15 secondes exactement, sans voix off**,
dans un style sobre et haut de gamme (type agence premium).

```bash
npx remotion render GMotionPromo out/gmotion-promo.mp4
npx remotion render GMotionPromo2 out/gmotion-promo-2.mp4
npx remotion render GMotionServices out/gmotion-services.mp4
```

(ou `npm run render:gmotion`, `npm run render:gmotion2` et `npm run render:services`)

### Charte visuelle commune

- **Palette unique** (`premium` dans `src/theme.ts`) : fond bleu nuit #0B1A33 avec un
  dégradé très léger vers #10234A, texte et surfaces blanc cassé #F5F7FA, bleu acier
  #2F6FD6 en secondaire, et **or doux #C9A45C** en accent. L'or ne sert qu'à un mot clé
  par plan, aux fines lignes de séparation et au bouton WhatsApp, jamais en grande surface.
- **Logo** (`public/logo-G.svg`) : il garde ses propres couleurs (`brandLogo`) et n'est
  jamais recoloré. Le tracé animé du G est dans `src/gmotion/CtaScene.tsx`.
- **Animations** : fondus avec léger glissement vers le haut, glissements et masques en
  ease-in-out, un seul mouvement principal à l'écran à la fois, caméra lente.
  Aucun glitch, flash, tremblement, néon ni rebond.
- **Typographie** : Inter, titres en SemiBold, beaucoup d'espace autour des éléments.
- **Mini-pubs des clients fictifs** : chacune garde sa propre charte, en tons doux
  (`clientPalettes`).
- Les 0,5 dernière seconde est une image fixe. Tout le texte reste à plus de 150 px du
  haut et du bas (zones de l'interface TikTok).
- Dans les textes de `config.ts`, un mot entre `*astérisques*` passe en or.

### GMotionPromo et GMotionPromo2

Même déroulé ; seul le client fictif change : `GMotionPromo` anime la marque de
boissons **NOVA** (vert sauge), `GMotionPromo2` la **Boulangerie Le Wouri**
(caramel et crème). Pour en créer une autre, ajoute un client dans `gmotionClients`
(`config.ts`) et sa charte dans `clientPalettes` (`theme.ts`).

| Temps      | Plan              | Contenu                                                                   |
| ---------- | ----------------- | ------------------------------------------------------------------------- |
| 0 → 2 s    | Accroche          | « Ta marque mérite de bouger. », ligne par ligne                          |
| 2 → 5 s    | Le brief          | Interface de chat, frappe lettre par lettre, zoom avant lent              |
| 5 → 8 s    | La création       | Timeline épurée, tête de lecture or, courbes et keyframes                 |
| 8 → 11 s   | Le résultat       | Le logo du client s'assemble, puis la pub apparaît sur un téléphone       |
| 11 → 13 s  | Avant / après     | Masque qui glisse de l'affiche terne vers la pub, fine ligne or           |
| 13 → 15 s  | Appel à l'action  | Logo G dessiné trait par trait, nom, services, bouton WhatsApp            |

Textes, numéro, tempo et volumes : objet `gmotion` dans `src/config.ts`.
Code : `src/gmotion/` (une scène par fichier, timeline dans `timeline.ts`).

### GMotionServices

Présente les trois services. Contact : +237 673 236 084 (wa.me/237673236084).

| Temps      | Plan                 | Contenu                                                              |
| ---------- | -------------------- | -------------------------------------------------------------------- |
| 0 → 2 s    | Accroche             | « Ton business mérite mieux qu’une affiche. »                         |
| 2 → 5 s    | Motion design        | Le logo d’Akwa Grill s’assemble, puis une timeline se lit             |
| 5 → 8 s    | Sites web            | Site construit bloc par bloc dans un navigateur, puis sur téléphone   |
| 8 → 11 s   | Applications & code  | Le code s’écrit, puis laisse place à un tableau de bord               |
| 11 → 13 s  | Récap                | Les 3 résultats en grille, « 1 studio. 3 expertises. »                |
| 13 → 15 s  | Final                | Logo G dessiné trait par trait, bouton WhatsApp                       |

Textes, entreprise fictive, site et code affichés : `gmotionServices` dans `src/config.ts`.
Code : `src/gmotion/services/`.

### Son

`public/music.mp3` est une piste provisoire à 120 BPM (générée par `npm run sfx:gmotion`) :
remplace-la par ta musique en gardant le même nom. Les plans changent à 2, 5, 8, 11 et
13 s, sur les temps forts d'un morceau à 120 BPM. Effets sonores discrets : clics clavier,
whoosh, impact léger, swoosh sur le logo (`public/sfx/`).

## Pub IPhone15ProMaxAd (concept non officiel)

Concept publicitaire **non officiel** pour l'iPhone 15 Pro Max, **1080×1920, 30 images/s,
20 secondes, sans voix off**, dans un style nocturne : noir profond, un seul halo orange,
interfaces en verre gris flottant en 3D, reflets sur sol brillant, traînées de lumière.

```bash
npx remotion render IPhone15ProMaxAd out/iphone-15-pro-max.mp4
```

(ou `npm run render:iphone`)

| Temps        | Plan                 | Contenu                                                              |
| ------------ | -------------------- | -------------------------------------------------------------------- |
| 0 → 2,5 s    | Intro                | Le halo s'allume, des cartes en verre défilent sur un sol brillant    |
| 2,5 → 5 s    | Recherche            | « Jusqu'où peut aller un smartphone ? » se tape dans une barre        |
| 5 → 9 s      | Révélation           | Le téléphone sort de l'ombre, liseré de lumière sur le titane         |
| 9 → 12,5 s   | Caractéristiques     | A17 Pro, 48 Mpx, téléobjectif 5x, bouton Action, USB-C en escalier 3D |
| 12,5 → 15,5 s| Zoom 5x              | Un viseur zoome de 24 à 120 mm sur le pont, au coucher du soleil      |
| 15,5 → 18 s  | Écran et finitions   | 6,7 pouces, ProMotion 120 Hz, puis les quatre finitions titane        |
| 18 → 20 s    | Fin                  | Nom du produit, bouton pilule orange, signature ; image fixe 0,5 s    |

- Le téléphone est entièrement dessiné en code (`src/iphone/Phone.tsx`) : aucune image ni
  aucun logo de marque n'est utilisé. Le plan final porte la mention « Concept publicitaire
  non officiel · non affilié à Apple ». iPhone est une marque d'Apple Inc.
- Textes : `iphoneAd` dans `src/config.ts`. Couleurs : `nocturne` dans `src/theme.ts`.
- Musique provisoire originale : `public/music-iphone.mp3` (120 BPM, générée par
  `npm run sfx:iphone`), à remplacer par la tienne en gardant le même nom.
- Code : `src/iphone/` (kit visuel, téléphone, scènes, timeline).

## Vérifier que tout compile

```bash
npm run typecheck
```
