# GIRESSE Digital Studio — pub Remotion

Publicité verticale **1080×1920, 30 images/s, 30 secondes, sans voix off**, réalisée avec
[Remotion](https://www.remotion.dev) en TypeScript. Elle raconte une histoire de client
concrète : du message WhatsApp au paiement reçu, sans rien ressaisir.

| Composition       | Description                                                            |
| ----------------- | ---------------------------------------------------------------------- |
| `GiresseAd`       | La pub : interfaces premium flottant en 3D dans une pièce sombre        |
| `GiresseAdFilmed` | La même pub, comme filmée sur un écran d'ordinateur dans une pièce sombre |

## Installation

```bash
npm install
```

## Prévisualiser dans Remotion Studio

```bash
npm run dev
```

## Exporter en MP4

```bash
npx remotion render GiresseAd out/giresse-ad.mp4
npx remotion render GiresseAdFilmed out/giresse-ad-filmed.mp4
```

(ou `npm run render` et `npm run render:filmed`)

## Déroulé

| Temps      | Plan               | Contenu                                                                     |
| ---------- | ------------------ | --------------------------------------------------------------------------- |
| 0 → 5 s    | Messagerie         | Message de la cliente ; les infos clés s'allument en pastilles bleues       |
| 5 → 9 s    | Saisie auto        | Les pastilles s'envolent et remplissent la fenêtre « Nouvelle commande »    |
| 9 → 13 s   | Facture            | La facture se construit ligne par ligne, le total monte jusqu'à 575 $       |
| 13 → 17 s  | Téléphone          | La facture arrive sur un iPhone 13 ; « Payer », puis « Paiement reçu »      |
| 17 → 22 s  | Planning           | Vue semaine, puis la chaîne d'automatisation se coche étape par étape       |
| 22 → 26 s  | Tableau de bord    | Chiffres qui comptent, carte « 575 $ aujourd'hui », barres qui montent      |
| 26 → 30 s  | Fin                | Logo, « GIRESSE Digital Studio », signature et WhatsApp ; image fixe 0,5 s  |

Tout le texte reste à plus de 150 px du haut et du bas (zones de l'interface TikTok).

## Refaire une pub en 2 minutes

Tous les textes sont dans **`src/config.ts`** : client, message (les infos clés entre
`[crochets]`), valeurs du formulaire, lignes et prix de la facture (le total se calcule
tout seul), devise, étapes d'automatisation, chiffres du tableau de bord, signature.
Change-les, puis relance le rendu.

- Couleurs et police : `src/theme.ts` (bleu nuit #070B1A, halo #2F6BFF, verre, texte #AFC3FF ;
  le vert #22C55E est réservé aux confirmations).
- Minutage des plans : `src/timeline.ts`.

## Médias

| Fichier                     | Rôle                                                                     |
| --------------------------- | ------------------------------------------------------------------------ |
| `public/logo-giresse.png`   | Logo affiché sur le plan final, sans modification de ses couleurs         |
| `public/music.mp3`          | Musique calme (à ajouter) ; jouée automatiquement si le fichier existe    |
| `public/iphone-13.png`      | Optionnel : cadre d'iPhone 13 (écran transparent) posé sur le téléphone   |
| `public/sons/*.wav`         | Whoosh doux, « ding » du paiement, tap ; régénérables avec `npm run sons` |

Le téléphone est dessiné en code aux proportions exactes d'un iPhone 13 (encoche, coins
arrondis, boutons latéraux, reflet sur l'écran).

## Vérifier que tout compile

```bash
npm run typecheck
```
