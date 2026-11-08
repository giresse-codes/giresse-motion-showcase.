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

La vidéo fournie (15,8 s) passe en fond, en boucle sur tout le morceau (flash blanc à chaque reprise).
Style lumineux façon edit : étalonnage chaud et saturé, léger bloom, light leaks, vignette légère.
- **Remix et final** : velocity calée sur les mesures (rapide sur le temps fort, ralenti au milieu),
  zoom punch, tremblement, aberration RGB et zoom blur sur les kicks, flash et pop-zoom à chaque partie.
- **Slowed** : vidéo ralentie à 0.8x, mouvement doux, teinte lavande.
- Titres de partie qui apparaissent avec un effet pop, signature discrète en bas.

## Régénérer

```bash
pip install numpy scipy librosa soundfile pedalboard pillow
python scripts/mix.py      # in.wav -> remix.wav (+ times.txt)
ffmpeg -i remix.wav -af "aresample=192000,alimiter=limit=0.84:attack=2:release=120:level=disabled,aresample=48000" remix_m.wav
python scripts/feat.py     # caractéristiques audio par image
ffmpeg -i fond.mp4 -f rawvideo -pix_fmt rgb24 bg/src.rgb   # vidéo de fond (478x850)
python scripts/edit.py     # -> edit_raw.mp4 (puis muxer avec remix_m.wav)
```
