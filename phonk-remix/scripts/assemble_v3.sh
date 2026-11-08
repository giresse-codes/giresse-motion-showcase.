#!/bin/bash
# Version courte : intro (0 à 9,07 s de l'edit) en speed up 1.25x, puis l'edit à partir de 2:21 jusqu'à la fin.
# edit_raw.mp4 = edit complet, tail_raw.mp4 = edit re-rendu à partir de l'image 4230 (2:21) sans le nom :
#   START_FRAME=4230 OUT=tail_raw.mp4 python scripts/edit.py
FC="[0:v]trim=end_frame=272,setpts=(PTS-STARTPTS)/1.25,fps=30[v1];[1:v]setpts=PTS-STARTPTS,fade=in:st=0:d=0.25:color=white[v2];[v1][v2]concat=n=2:v=1:a=0[v];[2:a]atrim=0:9.0667,asetpts=PTS-STARTPTS,asetrate=60000,aresample=48000[a1];[2:a]atrim=start=141.0,asetpts=PTS-STARTPTS[a2];[a1][a2]acrossfade=d=0.06[a]"
ffmpeg -y -i edit_raw.mp4 -i tail_raw.mp4 -i remix_m.wav -filter_complex "$FC" -map "[v]" -map "[a]" \
  -c:v libx264 -b:v 6000k -pix_fmt yuv420p -c:a aac -b:a 256k -movflags +faststart giresse-phonk-edit-v3.mp4
