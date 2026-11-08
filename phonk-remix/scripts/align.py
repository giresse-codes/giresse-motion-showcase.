import librosa, numpy as np
from scipy.signal import correlate
sr=22050; hop=256
c,_=librosa.load('bg/clip.wav',sr=sr)
y,_=librosa.load('in.wav',sr=sr,mono=True)
# même recalage que le mix : on retire 125 ms autour de 29.24 s
a=int((29.24-0.0625)*sr); b=int((29.24+0.0625)*sr); y=np.concatenate([y[:a],y[b:]])
y=y[:int(106.62*sr)]
def feats(x):
    C=librosa.feature.chroma_stft(y=x,sr=sr,hop_length=hop)
    o=librosa.onset.onset_strength(y=x,sr=sr,hop_length=hop)[None]
    o=(o-o.mean())/(o.std()+1e-9)
    C=(C-C.mean(1,keepdims=True))/(C.std(1,keepdims=True)+1e-9)
    return np.vstack([C*0.5,o*1.5])
Fc=feats(c); Fy=feats(y); Nc=Fc.shape[1]; Ny=Fy.shape[1]
Lw=int(3.0*sr/hop); step=11            # fenêtre 3 s, pas ~0.128 s
starts=list(range(0,Ny-Lw,step)); No=Nc-Lw
S=np.zeros((len(starts),No))
for wi,s0 in enumerate(starts):
    seg=Fy[:,s0:s0+Lw]; num=np.zeros(No)
    for r in range(seg.shape[0]): num+=correlate(Fc[r],seg[r],mode='valid')[:No]
    # normalisation par l'énergie locale du clip
    e=np.sqrt(np.convolve((Fc**2).sum(0),np.ones(Lw),'valid')[:No])*np.linalg.norm(seg)+1e-9
    S[wi]=num/e
J=0.35   # pénalité de saut
T=len(starts); dp=np.full((T,No),-1e9); bp=np.zeros((T,No),int)
dp[0]=S[0]
for w in range(1,T):
    prev=dp[w-1]; cont=np.full(No,-1e9); cont[step:]=prev[:-step]
    best=prev.max(); bi=prev.argmax()
    jump=best-J
    take_cont=cont>=jump
    dp[w]=np.where(take_cont,cont,jump)+S[w]
    bp[w]=np.where(take_cont,np.arange(No)-step,bi)
path=np.zeros(T,int); path[-1]=dp[-1].argmax()
for w in range(T-1,0,-1): path[w-1]=bp[w][path[w]]
uw=np.array(starts)*hop/sr; off=path*hop/sr
v0=off-uw   # v = u + v0 (constant tant que c'est continu)
segs=[]; cur=[uw[0],v0[0]]
for k in range(1,T):
    if abs(v0[k]-v0[k-1])>0.02: segs.append((cur[0],uw[k],cur[1])); cur=[uw[k],v0[k]]
segs.append((cur[0],106.62,cur[1]))
for s,e,v in segs:
    m=(uw>=s)&(uw<e); print(f'u {s:6.2f}-{e:6.2f}  clip {s+v:5.2f}-{e+v:5.2f}  score {S[np.where(m)[0],path[m]].mean():.2f}')
np.save('segs.npy',np.array(segs))
