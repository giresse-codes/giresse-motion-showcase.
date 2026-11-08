# GIRESSE — Phonk Remix (vidéo + audio)

Source : mixage BandLab « Sans titre 8 nov. 2026 » (1 min 46 s).
Résultat : `giresse-phonk-remix.mp4` (1080×1920, 30 fps) et `giresse-phonk-remix.mp3` (320 kb/s), 3 min 09 s.

## Structure

| Temps | Partie |
|---|---|
| 0:00 – 1:16 | Remix de la partie principale |
| 1:16 – 1:46 | Mixage final « 04 » (couches superposées conservées) |
| 1:46 – 2:27 | Mixage final en **slowed + reverb 0.7x** |
| 2:27 – 3:09 | Premier couplet en **slowed + reverb 0.7x**, enchaîné directement |

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
- **Slowed + reverb 0.7x** : rééchantillonnage (tempo et hauteur baissés), reverb (taille 0,82, wet 30 %),
  passe-bas 9 kHz. Le final slowed se fond dans le couplet slowed (fondu de 1,2 s).
- **Transitions** : reverse reverb filtrée + impact grave propre (sans bruit).
- **Master** : -10,6 LUFS (toutes les parties entre -10,2 et -10,9), true peak -1,4 dBTP.

## Régénérer

```bash
pip install numpy scipy librosa soundfile pedalboard pillow
python scripts/mix.py      # in.wav -> remix.wav (+ times.txt)
ffmpeg -i remix.wav -af "aresample=192000,alimiter=limit=0.84:attack=2:release=120:level=disabled,aresample=48000" remix_m.wav
python scripts/feat.py     # caractéristiques audio par image
python scripts/render.py   # -> phonk.mp4
```
