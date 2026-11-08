import numpy as np, librosa
y,sr=librosa.load('remix_m.wav',sr=22050,mono=True)
FPS=30; hop=sr//FPS  # 735
S=np.abs(librosa.stft(y,n_fft=2048,hop_length=hop,center=True))
f=librosa.fft_frequencies(sr=sr,n_fft=2048)
edges=np.geomspace(35,12000,73)
bands=np.stack([S[(f>=edges[i])&(f<edges[i+1])].mean(0) if ((f>=edges[i])&(f<edges[i+1])).any() else S[np.argmin(abs(f-edges[i]))] for i in range(72)],1)
bands=np.log1p(bands*8); bands/=np.percentile(bands,99,axis=0)+1e-6; bands=np.clip(bands,0,1.3)
low=np.log1p(S[f<130].sum(0)); low=(low-np.percentile(low,5))/(np.percentile(low,99)-np.percentile(low,5)); low=np.clip(low,0,1.2)
rms=librosa.feature.rms(y=y,hop_length=hop,frame_length=2048)[0]; rms/=np.percentile(rms,99)
lo_on=np.maximum(0,np.diff(np.log1p(S[f<150].sum(0)),prepend=0)); lo_on/=np.percentile(lo_on,99.5)
np.savez('feat.npz',bands=bands,low=low,rms=rms,kick=np.clip(lo_on,0,1.5))
print(bands.shape,len(low))
