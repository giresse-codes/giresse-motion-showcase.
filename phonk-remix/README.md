# GIRESSE — Phonk Remix (vidéo + audio)

Source : mixage BandLab « Sans titre 8 nov. 2026 » (1 min 46 s).
Résultat : `giresse-phonk-remix.mp4` (1080×1920, 30 fps) et `giresse-phonk-remix.mp3` (320 kb/s), 2 min 59 s.

## Structure

| Temps | Partie |
|---|---|
| 0:00 – 1:16 | Remix de la partie principale |
| 1:16 – 1:46 | Mixage final « 04 » (couches superposées conservées) |
| 1:46 – 2:22 | Mixage final en **slowed + reverb 0.8x** |
| 2:22 – 2:59 | Premier couplet en **slowed + reverb 0.8x**, enchaîné directement |

## Ce qui a été fait

- **Calage** : la grille (~121 BPM) dérivait de +125 ms après le blanc vers 0:29.
  On a retiré uniquement 125 ms de *silence* dans ce blanc : aucun son supprimé.
- **Aucune saturation** : la v1 ajoutait de la distorsion et poussait les aigus (+10 dB sur le final),
  ce qui donnait du bruit. Tout a été retiré.
- **Partie principale** : passe-haut 30 Hz, +2 dB à 70 Hz, -2 dB à 300 Hz, aigus légèrement adoucis,
  compression douce 2:1.
- **Mixage final superposé** : couches gardées telles quelles ; -3,5 dB à 280 Hz (boue), -3 dB à 3 kHz
  (zone qui gratte), -2,5 dB à 6,5 kHz (sifflements), aigus adoucis, passe-bas 15 kHz, nivellement lent.
  Son équilibre spectral est revenu proche de l'original.
- **Slowed + reverb 0.8x** : rééchantillonnage (tempo et hauteur baissés), reverb (taille 0,82, wet 30 %),
  passe-bas 9 kHz. Le final slowed se fond dans le couplet slowed (fondu de 1,2 s).
- **Transitions** : reverse reverb filtrée + impact grave propre (sans bruit).
- **Master** : -10,4 LUFS, true peak -1,4 dBTP, niveau homogène entre les parties.

## Vidéo (edit)

**Synchro des mouvements** : l'audio de la vidéo fournie (15,8 s) a été retrouvé dans le morceau.
Il revient 4 fois (0:08, 0:30, 0:58, 1:24 ; corrélation 0,91). La vidéo y joue exactement sur le son,
donc chaque mouvement tombe sur le bon mot ou le bon temps. Entre ces passages, un alignement par
programmation dynamique (`scripts/align.py`, chroma et attaques sur des fenêtres de 3 s) choisit la partie
de la vidéo qui correspond au son. Sur les parties slowed, la vidéo est ralentie à 0.8x et reste calée.
Aucun effet de vitesse ne touche à la vidéo, pour ne pas casser la synchro.

**Style** : mélange de trois références d'edits.
- *Film doux* (d_ed) : noirs relevés, grain, zooms lents, flou de mouvement en transition.
- *Énergique* (petrov_zx) : noir et blanc contrasté, miroir, blocs décalés, nom en lettres avec étincelles.
- *Doré néon* (mikey.edits76) : lumière dorée, contours néon rose ou vert, éclairage rose latéral,
  reflet étoile, halo blanc, gros nom qui glisse et glitche.

Remix : chaud et lumineux, zooms et décalage RGB sur les kicks. Final 04 : plus nerveux (n&b, miroir,
blocs, néon). Slowed 04 : film doux et doré. **Dernier couplet slowed** : les trois styles en alternance
à chaque mesure, avec des transitions (flou de mouvement, zoom blur, halo) au début de chaque mesure.

**Nom** : « GIRESSE » apparaît 10 fois, environ 3 à 4 s à chaque fois, en se déplaçant avec l'un des trois
styles, puis disparaît.

## Régénérer

```bash
pip install numpy scipy librosa soundfile pedalboard pillow
python scripts/mix.py      # in.wav -> remix.wav (+ times.txt)
ffmpeg -i remix.wav -af "aresample=192000,alimiter=limit=0.84:attack=2:release=120:level=disabled,aresample=48000" remix_m.wav
python scripts/feat.py     # caractéristiques audio par image
ffmpeg -i fond.mp4 -f rawvideo -pix_fmt rgb24 bg/src.rgb   # vidéo de fond (478x850)
python scripts/align.py    # synchro vidéo/son -> segs.npy
python scripts/edit.py     # -> edit_raw.mp4 (puis muxer avec remix_m.wav)
```
