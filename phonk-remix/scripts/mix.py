import numpy as np, soundfile as sf, librosa
from pedalboard import (Pedalboard, HighpassFilter, LowpassFilter, LowShelfFilter, HighShelfFilter,
    PeakFilter, Compressor, Limiter, Reverb, Gain)
from scipy.signal import butter, sosfiltfilt, sosfilt
x,sr=sf.read('in.wav',dtype='float32'); x=x.T.copy()
def s(t): return int(round(t*sr))

# ---------- 1. Recalage : on retire seulement 125 ms de silence dans le blanc de 0:29 ----------
def remove_silence(x, center, dur, xf=0.008):
    a=s(center-dur/2); b=s(center+dur/2); f=s(xf); r=np.linspace(0,1,f,dtype='float32')
    return np.concatenate([x[:,:a-f],x[:,a-f:a]*(1-r)+x[:,b-f:b]*r,x[:,b:]],axis=1)
x=remove_silence(x,29.24,0.125); shift=0.125
FIN=77.0-shift
COUPLET_END=29.04            # fin du premier couplet (juste avant le blanc)
xa=x[:,:s(FIN)]; xb=x[:,s(FIN):]

def ms_width(x,amt,fcut=150):
    m=(x[0]+x[1])/2; sd=(x[0]-x[1])/2
    lo=sosfiltfilt(butter(4,fcut,'low',fs=sr,output='sos'),sd); sd=lo*0.2+(sd-lo)*amt
    return np.stack([m+sd,m-sd]).astype('float32')
def level(y,k=0.5,lo=0.6,hi=1.3,fc=0.5):
    e=np.sqrt(sosfilt(butter(2,fc,'low',fs=sr,output='sos'),np.mean(y**2,0)))+1e-5
    return (y*np.clip((np.median(e)/e)**k,lo,hi)).astype('float32')

# ---------- 2. Partie principale : propre, chaude, sans saturation ----------
main=Pedalboard([HighpassFilter(30),LowShelfFilter(70,2.0,0.7),PeakFilter(300,-2.0,0.9),
    PeakFilter(3500,-1.0,1.0),HighShelfFilter(10000,-1.0,0.7),
    Compressor(threshold_db=-20,ratio=2,attack_ms=25,release_ms=200)])
A=ms_width(main(xa,sr),1.1)

# ---------- 3. Mixage final superposé : on garde les couches, on enlève le bruit ----------
final=Pedalboard([HighpassFilter(32),
    PeakFilter(60,-1.5,1.0),            # basses superposées qui s'additionnent
    PeakFilter(280,-3.5,0.8),           # boue entre les couches
    PeakFilter(3000,-3.0,0.9),          # zone qui « gratte »
    PeakFilter(6500,-2.5,1.2),          # sifflements
    HighShelfFilter(9000,-3.0,0.7),LowpassFilter(15000),
    Compressor(threshold_db=-22,ratio=2,attack_ms=30,release_ms=250)])
B=level(final(xb,sr))*10**(0.5/20)
B=ms_width(B,1.0)

# ---------- 4. Slowed + reverb 0.8 : final puis premier couplet ----------
def slowed(x,rate=0.8):
    y=np.stack([librosa.resample(c,orig_sr=sr,target_sr=int(sr/rate),res_type='soxr_hq') for c in x]).astype('float32')
    return Pedalboard([HighpassFilter(28),PeakFilter(220,-3,0.8),PeakFilter(2500,-2,0.9),LowpassFilter(9000),
        Reverb(room_size=0.82,damping=0.6,wet_level=0.3,dry_level=0.8,width=1.0),
        Compressor(-22,2,30,250),Gain(2.0)])(y,sr)
C1=slowed(B)
C2=slowed(A[:,:s(COUPLET_END)])
# raccord direct : la fin du final slowed se fond dans le début du couplet slowed
xf=s(1.2); r=np.linspace(0,1,xf,dtype='float32')
C=np.concatenate([C1[:,:-xf],C1[:,-xf:]*np.cos(r*np.pi/2)+C2[:,:xf]*np.sin(r*np.pi/2),C2[:,xf:]],1)

# ---------- 5. Transitions douces (pas de bruit) ----------
def impact(dur=1.4,f0=50,f1=34,a=0.35):
    t=np.arange(s(dur))/sr; f=f1+(f0-f1)*np.exp(-t*6)
    y=np.sin(2*np.pi*np.cumsum(f)/sr)*np.exp(-t*3)*a
    return np.stack([y,y]).astype('float32')
def rev_swell(seg,a=0.4):
    r=Pedalboard([Reverb(room_size=0.95,damping=0.7,wet_level=1.0,dry_level=0.0),LowpassFilter(6000)])
    w=r(np.concatenate([seg[:,::-1],np.zeros((2,s(2.0)),'float32')],1),sr)[:,::-1][:, -s(1.2):]
    return (w*np.linspace(0,1,w.shape[1])**2*a).astype('float32')
def add(dst,src,at):
    a=s(at); b=min(dst.shape[1],a+src.shape[1]); dst[:,a:b]+=src[:,:b-a]

out=np.concatenate([A,B,np.zeros((2,s(0.25)),'float32'),C],1)
tB=A.shape[1]/sr; tC=tB+B.shape[1]/sr+0.25; tC2=tC+(C1.shape[1]-xf)/sr
for g in [29.45-shift,57.22-shift]:
    add(out,rev_swell(A[:,s(g):s(g+0.8)]),g-1.2); add(out,impact(a=0.25),g)
add(out,rev_swell(B[:,:s(0.8)],0.35),tB-1.2); add(out,impact(),tB)
tail=Pedalboard([Reverb(room_size=0.9,damping=0.7,wet_level=1.0,dry_level=0),LowpassFilter(5000)])(np.concatenate([B[:,-s(1.0):],np.zeros((2,s(3)),'float32')],1),sr)[:,s(1.0):]
add(out,(tail*np.linspace(0.4,0,tail.shape[1])).astype('float32'),tB+B.shape[1]/sr)
add(out,impact(2.0,44,30,0.3),tC)

# ---------- 6. Master doux ----------
out=Pedalboard([HighpassFilter(25),Compressor(-16,1.6,30,250),Gain(2.0),Limiter(-2.0,200)])(out,sr)
fade=s(3.0); out[:,-fade:]*=np.linspace(1,0,fade)
sf.write('remix.wav',out.T,sr,subtype='PCM_24')
open('times.txt','w').write(f'{tB} {tC} {tC2} {out.shape[1]/sr}\n')
print('final',tB,'slowed04',tC,'slowedCouplet',tC2,'total',out.shape[1]/sr)
