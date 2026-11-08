# GIRESSE — Phonk Remix (vidéo + audio)

Source : mixage BandLab « Sans titre 8 nov. 2026 » (1 min 46 s).
Résultat : `giresse-phonk-remix.mp4` (1080×1920, 30 fps) et `giresse-phonk-remix.mp3` (320 kb/s), 2 min 23 s.

## Structure

| Temps | Partie |
|---|---|
| 0:00 – 1:16 | Remix phonk de la partie principale |
| 1:16 – 1:46 | Mixage final « 04 » (couches superposées conservées) |
| 1:46 – 2:23 | Copie du mixage final en **slowed + reverb 0.8x** |

## Ce qui a été fait

- **Calage** : la grille rythmique (~121 BPM) dérivait de +125 ms après le blanc vers 0:29 (clip mal positionné).
  On a retiré uniquement 125 ms de *silence* dans ce blanc (fondus de 8 ms) : aucun son supprimé.
  Les sections 1, 2 et 3 tombent maintenant sur la même grille (écart < 20 ms).
- **Blancs comblés** : reverse reverb + impact 808 sur les anciens trous (0:29 et 0:57).
- **Chaîne phonk** (pedalboard) : passe-haut 28 Hz, low shelf +3,5 dB à 75 Hz, creux -2,5 dB à 320 Hz,
  présence 3,2 kHz, air 9 kHz, compression 3:1, saturation parallèle (22 %), basses en mono et aigus élargis.
- **Mixage final superposé** : laissé tel quel, rendu plus lisible grâce à une compression multibande
  (<120 Hz / 120 Hz–2,5 kHz / >2,5 kHz), un nettoyage de la boue (-4 dB à 300 Hz), +2 dB à 1,8 kHz,
  un nivellement lent (la zone 1:18–1:23 n'écrase plus le reste) et un élargissement stéréo des aigus.
- **Slowed + reverb** : rééchantillonnage à 0,8x (tempo et hauteur baissés comme un slowed classique),
  reverb (taille 0,82, wet 28 %), low shelf +2 dB, -3 dB à 250 Hz, passe-bas 11 kHz.
  Transition : queue de reverb de la fin + impact profond.
- **Transitions** : riser + impact à l'entrée du mixage final.
- **Master** : -8,9 LUFS, true peak -1,4 dBTP (limiteur suréchantillonné à 4x).

## Vidéo

Visualiseur réactif à l'audio : anneau spectral, glitch et tremblement de caméra sur les kicks,
aberration chromatique, look VHS (scanlines, grain), flash à chaque changement de partie,
palette rouge/magenta, puis orange pour le mixage final et violet/bleu pour le slowed.

## Régénérer

```bash
pip install numpy scipy librosa soundfile pedalboard pillow
python scripts/mix.py      # in.wav -> remix.wav (+ times.txt)
ffmpeg -i remix.wav -af "aresample=192000,alimiter=limit=0.84:attack=1:release=80:level=disabled,aresample=48000" remix_m.wav
python scripts/feat.py     # caractéristiques audio par image
python scripts/render.py   # -> phonk.mp4
```
