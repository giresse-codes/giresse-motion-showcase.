import numpy as np, soundfile as sf, librosa
from pedalboard import (Pedalboard, HighpassFilter, LowpassFilter, LowShelfFilter, HighShelfFilter,
    PeakFilter, Compressor, Distortion, Limiter, Reverb, Gain)
from scipy.signal import butter, sosfiltfilt, sosfilt
x,sr=sf.read('in.wav',dtype='float32'); x=x.T.copy()  # (2,N)
P=0.496
def s(t): return int(round(t*sr))

# ---------- 1. Recalage (on ne retire QUE du silence, avec fondus) ----------
def remove_silence(x, center, dur, xf=0.008):
    a=s(center-dur/2); b=s(center+dur/2); f=s(xf)
    ramp=np.linspace(0,1,f,dtype='float32')
    mid=x[:,a-f:a]*(1-ramp)+x[:,b-f:b]*ramp
    return np.concatenate([x[:,:a-f],mid,x[:,b:]],axis=1)
x=remove_silence(x,29.24,0.125)          # la section 2 arrivait 125 ms en retard sur la grille
shift=0.125                               # (la section 3 suit la 2 : rien à corriger)
FIN=77.0-shift                            # début du mixage final superposé (04)
xa=x[:,:s(FIN)]; xb=x[:,s(FIN):]

def bandsplit(x,f,order=4):
    lo=sosfiltfilt(butter(order,f,'low',fs=sr,output='sos'),x,axis=1)
    return lo.astype('float32'),(x-lo).astype('float32')
def ms_widen(x,amt,fcut=180):
    m=(x[0]+x[1])/2; sd=(x[0]-x[1])/2
    lo,hi=bandsplit(sd[None],fcut); sd=lo[0]*0.3+hi[0]*amt   # basse en mono, aigus plus larges
    return np.stack([m+sd,m-sd]).astype('float32')

# ---------- 2. Chaîne phonk pour la partie principale ----------
phonk=Pedalboard([HighpassFilter(28),LowShelfFilter(75,3.5,0.7),PeakFilter(320,-2.5,1.0),
    PeakFilter(3200,1.5,0.9),HighShelfFilter(9000,2.0,0.7),
    Compressor(threshold_db=-18,ratio=3,attack_ms=15,release_ms=120)])
drive=Pedalboard([LowpassFilter(5000),Distortion(drive_db=14),HighpassFilter(60)])
def process_main(x):
    y=phonk(x,sr)
    d=drive(x,sr); d*=np.sqrt(np.mean(y**2)/(np.mean(d**2)+1e-12))
    y=y+0.22*d                                   # saturation parallèle (grain phonk)
    return ms_widen(y,1.25)
A=process_main(xa)

# ---------- 3. Mixage final superposé : on garde tout, on le rend lisible ----------
def process_final(x):
    lo,hi=bandsplit(x,120)
    lo=Pedalboard([Compressor(-24,5,8,90),Gain(1.5)])(lo,sr)            # basse superposée tenue
    mid,top=bandsplit(hi,2500)
    mid=Pedalboard([PeakFilter(300,-4,0.8),PeakFilter(550,-2,1.2),Compressor(-22,3,10,100)])(mid,sr)
    top=Pedalboard([HighShelfFilter(7000,2.5,0.7),Compressor(-26,2.5,5,80),Gain(2.0)])(top,sr)
    y=lo+mid+top
    y=Pedalboard([PeakFilter(1800,2.0,0.8)])(y,sr)
    # nivellement lent : évite que la zone superposée (78-83 s) écrase le reste
    e=np.sqrt(sosfilt(butter(2,0.7,'low',fs=sr,output='sos'),np.mean(y**2,0)))+1e-5
    tgt=np.median(e); g=np.clip((tgt/e)**0.6,0.45,1.4)
    y=y*g
    d=drive(y,sr); d*=np.sqrt(np.mean(y**2)/(np.mean(d**2)+1e-12)); y=y+0.15*d
    return ms_widen(y,1.4)
B=process_final(xb)

# ---------- 4. Copie slowed + reverb (0.8) ----------
def slowed(x,rate=0.8):
    n=int(x.shape[1]/rate)
    y=np.stack([librosa.resample(c,orig_sr=sr,target_sr=int(sr/rate),res_type='soxr_hq') for c in x])[:, :n]
    y=Pedalboard([LowShelfFilter(90,2.0,0.7),PeakFilter(250,-3,0.8),LowpassFilter(11000),
        Reverb(room_size=0.82,damping=0.55,wet_level=0.28,dry_level=0.8,width=1.0),
        Compressor(-20,2.5,20,200)])(y.astype('float32'),sr)
    return y
C=slowed(B)

# ---------- 5. Effets de transition générés ----------
def noise(n,seed=0): return np.random.default_rng(seed).standard_normal((2,n)).astype('float32')
def riser(dur,f0=300,f1=9000):
    n=s(dur); w=noise(n,1); env=np.linspace(0,1,n)**2.2
    out=np.zeros_like(w); fs=np.geomspace(f0,f1,16)
    for k in range(16):                      # bandpass glissant par blocs
        a=k*n//16; b=(k+1)*n//16
        sos=butter(2,[fs[k]*0.7,min(fs[k]*1.4,20000)],'band',fs=sr,output='sos')
        out[:,a:b]=sosfilt(sos,w[:,a:b],axis=1)
    return (out*env*0.18).astype('float32')
def impact(dur=1.6,f0=55,f1=33):
    n=s(dur); t=np.arange(n)/sr; f=f1+(f0-f1)*np.exp(-t*6)
    ph=2*np.pi*np.cumsum(f)/sr; sub=np.sin(ph)*np.exp(-t*2.6)
    sub=np.tanh(sub*2.2)*0.45
    nz=sosfilt(butter(2,900,'low',fs=sr,output='sos'),noise(n,2)[0])*np.exp(-t*14)*0.5
    return np.stack([sub+nz,sub+nz]).astype('float32')
def rev_swell(seg):
    r=Pedalboard([Reverb(room_size=0.95,damping=0.3,wet_level=1.0,dry_level=0.0)])
    pad=np.concatenate([seg[:,::-1],np.zeros((2,s(2.0)),'float32')],1)
    w=r(pad,sr)[:,::-1]; w=w[:, -s(1.2):]
    return (w*np.linspace(0,1,w.shape[1])**2*0.6).astype('float32')
def add(dst,src,at):
    a=s(at); b=min(dst.shape[1],a+src.shape[1]); dst[:,a:b]+=src[:,:b-a]

# assemblage
gap=0.0
out=np.concatenate([A,B,np.zeros((2,s(0.25)),'float32'),C],1)
tB=A.shape[1]/sr; tC=tB+B.shape[1]/sr+0.25
# reverse reverb + impact sur les trous (anciens blancs de calage)
for g_end in [29.45-shift, 57.22-shift]:
    add(out,rev_swell(A[:,s(g_end):s(g_end+0.8)]),g_end-1.2)
    add(out,impact()*0.7,g_end)
add(out,riser(3.9),tB-3.9); add(out,impact(),tB)                     # entrée du final
# transition vers le slowed : la fin de B part en écho, puis impact profond
tail=Pedalboard([Reverb(room_size=0.9,wet_level=1.0,dry_level=0)])(np.concatenate([B[:,-s(1.0):],np.zeros((2,s(3)),'float32')],1),sr)
tail=tail[:,s(1.0):]*np.linspace(0.5,0,tail.shape[1]-s(1.0))
add(out,tail.astype('float32'),tB+B.shape[1]/sr)
add(out,impact(2.4,48,28)*0.9,tC)

# ---------- 6. Master ----------
out=Pedalboard([HighpassFilter(25),Compressor(-14,2,25,200),Gain(4.0),Limiter(-1.0,150)])(out,sr)
fade=s(2.5); out[:,-fade:]*=np.linspace(1,0,fade)
sf.write('remix.wav',out.T,sr,subtype='PCM_24')
open('times.txt','w').write(f'{tB} {tC} {out.shape[1]/sr}\n')
print('final start',tB,'slowed start',tC,'total',out.shape[1]/sr)
