# Voix off

Dépose ici une piste audio par vidéo (MP3 ou WAV), avec exactement ces noms :

| Vidéo             | Fichier             |
| ----------------- | ------------------- |
| MotionDesignPromo | `motion-design.mp3` |
| WebDevPromo       | `web-dev.mp3`       |
| CodingPromo       | `coding.mp3`        |

Le fichier est détecté automatiquement : dès qu'il est présent, il est joué et la
musique baisse (ducking) pendant chaque phrase. Sans fichier, la vidéo fonctionne
quand même (musique + sous-titres).

Le texte à enregistrer et le minutage de chaque phrase sont dans `src/config.ts`
(`voiceover.segments`). Enregistre en suivant ces temps, ou ajuste les temps
(`start` / `end`, en secondes) pour qu'ils collent à ton enregistrement : les
sous-titres se recaleront tout seuls.
