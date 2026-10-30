# giresse-motion-showcase

Vidéos publicitaires **« un seul prompt, et voilà le résultat »**, réalisées avec
[Remotion](https://www.remotion.dev) en TypeScript, pour présenter mes services
(motion design, développement web, programmation) aux entreprises.

Ce dépôt contient aussi la pub **GMotionPromo** (voir plus bas).

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

## Pubs GMotionPromo et GMotionPromo2 (GMotion Studio)

Publicité verticale **1080×1920, 30 images/s, 15 secondes exactement, sans voix off**,
pour les services de motion design de GMotion Studio.

```bash
npx remotion render GMotionPromo out/gmotion-promo.mp4
npx remotion render GMotionPromo2 out/gmotion-promo-2.mp4
```

(ou `npm run render:gmotion` et `npm run render:gmotion2`)

Les deux pubs ont le même déroulé ; seul le client fictif change :
`GMotionPromo` anime la marque de boissons **NOVA** (vert acide et menthe),
`GMotionPromo2` la **Boulangerie Le Wouri** (brun doré, crème et orange).
Pour en créer une autre, ajoute un client dans `gmotionClients` (`config.ts`)
et sa charte dans `clientPalettes` (`theme.ts`).

| Temps      | Plan              | Contenu                                                                        |
| ---------- | ----------------- | ------------------------------------------------------------------------------ |
| 0 → 2 s    | Accroche          | Noir, flash cyan, « Ta marque mérite de BOUGER. » mot par mot + tremblement    |
| 2 → 5 s    | Prompt            | Chat en verre dépoli, frappe lettre par lettre, clics, zoom avant progressif   |
| 5 → 8 s    | Création          | Glitch + whoosh, timeline 3D, keyframes néon, courbes de Bézier, étincelles    |
| 8 → 11 s   | Résultat          | Impact + flash blanc, logo NOVA qui s'assemble, téléphone 3D qui pivote        |
| 11 → 13 s  | Avant / après     | Affiche terne contre pub animée, balayage lumineux                             |
| 13 → 15 s  | Appel à l'action  | Logo G dessiné trait par trait, nom, services, bouton WhatsApp pulsant         |

Les 0,5 dernière seconde est une image fixe et propre. Tout le texte reste à
plus de 150 px du haut et du bas (zones de l'interface TikTok).

- **Textes, numéro, tempo et volumes** : objet `gmotion` dans `src/config.ts`,
  clients fictifs dans `gmotionClients`.
- **Couleurs** (`src/theme.ts`), en deux palettes séparées :
  - `brandLogo` (#050B1F, #1F5BFF, #5BC8FF, blanc) : réservée au logo G et au
    plan final. Le logo n'est jamais recoloré ;
  - `videoPalette` : tout le reste de la vidéo (noir #0A0A0F, violet, magenta,
    orange, jaune, menthe ; mots clés en jaune ou magenta) ;
  - `sceneColors` : couleur dominante de chaque plan (accroche magenta, prompt
    violet, timeline orange/jaune, avant/après menthe, plan final bleu du logo).
    Le plan « résultat » prend la charte du client (`clientPalettes`).
    Le fond passe d'une couleur à l'autre en fondu à chaque changement de plan.
- **Logo** : `public/logo-G.svg`. Le tracé animé du G est dans `src/gmotion/CtaScene.tsx`.
- **Musique** : `public/music.mp3`. Le fichier fourni est une piste électro/trap
  provisoire à 120 BPM (générée par `npm run sfx:gmotion`) : remplace-le par ta
  musique en gardant le même nom. Les plans changent à 2, 5, 8, 11 et 13 s, soit
  sur les temps forts d'un morceau à 120 BPM. Si ta musique a un autre tempo,
  règle `bpm` et `beatOffset` (temps du premier temps fort, en secondes) dans
  `config.ts` : les pulsations de lumière se recalent dessus.
- **Effets sonores** : clics clavier, whoosh, glitch, impact, swoosh (`public/sfx/`).
- Code de la pub : `src/gmotion/` (une scène par fichier, timeline dans `timeline.ts`).

## Vérifier que tout compile

```bash
npm run typecheck
```
