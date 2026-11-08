import numpy as np, sys, subprocess, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from multiprocessing import Pool
W,H,FPS=1080,1920,30
F=np.load('feat.npz'); bands,low,rms,kick=F['bands'],F['low'],F['rms'],F['kick']
tB,tC,TOT=map(float,open('times.txt').read().split())
N=int(TOT*FPS)
def smooth(a,k): 
    o=np.copy(a)
    for i in range(1,len(a)): o[i]=max(a[i],o[i-1]*k)
    return o
lowS=smooth(low,0.86); kickS=smooth(np.clip(kick-0.35,0,None),0.75)
bandS=np.copy(bands)
for i in range(1,len(bands)): bandS[i]=np.maximum(bands[i],bandS[i-1]*0.82)
FB=ImageFont.truetype('/usr/share/fonts/opentype/inter/InterDisplay-BlackItalic.otf',190)
FM=ImageFont.truetype('/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Bold.ttf',40)
FS=ImageFont.truetype('/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Bold.ttf',30)
yy,xx=np.mgrid[0:H,0:W].astype(np.float32)
cx,cy=W/2,H*0.44
dist=np.sqrt((xx-cx)**2+(yy-cy)**2)/H
vign=np.clip(1.25-np.sqrt(((xx-W/2)/W)**2+((yy-H/2)/H)**2)*1.6,0,1)[...,None]
scan=(0.86+0.14*(np.arange(H)%4<2))[:,None,None].astype(np.float32)
rng=np.random.default_rng(3); grains=[rng.normal(0,1,(H//2,W//2)).astype(np.float32) for _ in range(6)]
SECT=[(0,'PHONK REMIX','// 121 BPM'),(tB,'04 — FINAL MIX','// LAYERED'),(tC,'SLOWED + REVERB','// 0.8x')]
def palette(t):
    if t<tB: return np.array([255,30,60]),np.array([120,0,255])
    if t<tC: return np.array([255,60,20]),np.array([255,0,120])
    return np.array([150,60,255]),np.array([40,140,255])
def frame(i):
    t=i/FPS; j=min(i,len(low)-1)
    c1,c2=palette(t); slow=t>=tC
    L=lowS[j]; K=kickS[j]
    since=min([t-s for s,_,_ in SECT if t>=s]+[99])
    flash=max(0,1-since*2.5)
    # fond
    g=np.exp(-dist*(3.2-1.2*L))[...,None]
    img=(g*(c1*0.16*(0.3+L)+c2*0.06))
    img=img+ (0.5+0.5*np.sin(yy[...,None]/H*20-t*(1.5 if slow else 4)))*c2*0.04
    im=Image.fromarray(np.clip(img,0,255).astype(np.uint8))
    d=ImageDraw.Draw(im,'RGBA')
    # anneau spectral
    R=230+90*L+(40*K)
    b=bandS[j]; nb=len(b); rot=t*(0.15 if slow else 0.4)
    for side in (1,-1):
        for k in range(nb):
            a=rot+side*(k+0.5)/nb*math.pi - math.pi/2
            ln=18+300*b[k]**1.6
            x0,y0=cx+math.cos(a)*R,cy+math.sin(a)*R
            x1,y1=cx+math.cos(a)*(R+ln),cy+math.sin(a)*(R+ln)
            col=tuple(int(v) for v in (c1*(1-k/nb)+c2*(k/nb)))
            d.line([(x0,y0),(x1,y1)],fill=col+(235,),width=9)
    d.ellipse([cx-R+14,cy-R+14,cx+R-14,cy+R-14],outline=(255,255,255,int(90+120*K)),width=4)
    d.ellipse([cx-R*0.62,cy-R*0.62,cx+R*0.62,cy+R*0.62],fill=(0,0,0,200))
    # glow
    glow=im.filter(ImageFilter.GaussianBlur(28))
    arr=np.asarray(im).astype(np.float32)+np.asarray(glow).astype(np.float32)*(0.7+0.8*L)
    im=Image.fromarray(np.clip(arr,0,255).astype(np.uint8)); d=ImageDraw.Draw(im,'RGBA')
    # titre
    title='GIRESSE'; tw=d.textlength(title,font=FB); ty=H*0.74
    off=int(4+26*K)
    for dx,col in ((-off,(255,0,60,170)),(off,(0,220,255,150)),(0,(255,255,255,255))):
        d.text((W/2-tw/2+dx,ty),title,font=FB,fill=col)
    name=[s for s in SECT if t>=s[0]][-1]
    st=name[1]; sw=d.textlength(st,font=FM)
    d.text((W/2-sw/2,ty+230),st,font=FM,fill=(255,255,255,230))
    s2=name[2]; d.text((W/2-d.textlength(s2,font=FS)/2,ty+285),s2,font=FS,fill=tuple(int(v) for v in c1)+(220,))
    # progression
    p=t/TOT; d.rectangle([60,H-110,W-60,H-104],fill=(255,255,255,50)); d.rectangle([60,H-110,60+(W-120)*p,H-104],fill=tuple(int(v) for v in c1)+(255,))
    for s,_,_ in SECT[1:]: x=60+(W-120)*s/TOT; d.rectangle([x-2,H-118,x+2,H-96],fill=(255,255,255,200))
    mm=f'{int(t//60):02d}:{int(t%60):02d}'; d.text((60,H-90),mm,font=FS,fill=(255,255,255,170))
    d.text((W-60-d.textlength('REC ●',font=FS),70),'REC ●',font=FS,fill=(255,40,40,255 if int(t*2)%2 else 90))
    d.text((60,70),'VHS  SP  ▶',font=FS,fill=(255,255,255,180))
    arr=np.asarray(im).astype(np.float32)
    # glitch sur gros kicks
    if K>0.35 and not slow:
        r=np.random.default_rng(i)
        for _ in range(int(3+8*K)):
            y0=r.integers(0,H-80); hh=r.integers(8,70); arr[y0:y0+hh]=np.roll(arr[y0:y0+hh],r.integers(-60,60)*int(1+2*K),axis=1)
    # aberration chromatique
    ca=int(2+12*K+ (6 if slow else 0))
    arr[...,0]=np.roll(arr[...,0],ca,axis=1); arr[...,2]=np.roll(arr[...,2],-ca,axis=1)
    # shake + zoom
    sh=(14 if slow else 30)*K; r=np.random.default_rng(i+999)
    zx,zy=r.uniform(-sh,sh),r.uniform(-sh,sh)
    zoom=1+0.04*L+0.03*K
    im=Image.fromarray(np.clip(arr,0,255).astype(np.uint8))
    nw,nh=int(W*zoom),int(H*zoom); im=im.resize((nw,nh),Image.BILINEAR)
    l=int((nw-W)/2+zx); tp=int((nh-H)/2+zy); l=max(0,min(nw-W,l)); tp=max(0,min(nh-H,tp))
    arr=np.asarray(im.crop((l,tp,l+W,tp+H))).astype(np.float32)
    if slow: arr=arr*0.8+np.asarray(Image.fromarray(arr.astype(np.uint8)).filter(ImageFilter.GaussianBlur(6))).astype(np.float32)*0.35
    gr=np.kron(grains[i%6],np.ones((2,2),np.float32))[...,None]
    arr=arr*scan*vign+gr*(10 if not slow else 14)
    arr=arr+flash*255*0.85
    if t<0.8: arr*=t/0.8
    if t>TOT-2.5: arr*=max(0,(TOT-t)/2.5)
    return np.clip(arr,0,255).astype(np.uint8).tobytes()
if __name__=='__main__':
    if len(sys.argv)>1:
        for k in sys.argv[1:]: Image.frombytes('RGB',(W,H),frame(int(float(k)*FPS))).save(f'prev_{k}.png')
        sys.exit()
    p=subprocess.Popen(['ffmpeg','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-',
        '-i','remix_m.wav','-c:v','libx264','-preset','medium','-crf','19','-pix_fmt','yuv420p','-c:a','aac','-b:a','320k','-shortest','-movflags','+faststart','phonk.mp4'],stdin=subprocess.PIPE)
    with Pool(4) as pool:
        for n,b in enumerate(pool.imap(frame,range(N),chunksize=8)):
            p.stdin.write(b)
            if n%300==0: print(n,'/',N,flush=True)
    p.stdin.close(); p.wait()
