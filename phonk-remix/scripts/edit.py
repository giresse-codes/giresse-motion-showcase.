import numpy as np, sys, subprocess, math, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from multiprocessing import Pool
W,H,FPS=1080,1920,30; w,h=540,960          # traitement à 540x960 puis upscale
SW,SH=478,850
SRC=np.fromfile('bg/src.rgb',dtype=np.uint8).reshape(-1,SH,SW,3); NS=len(SRC); SDUR=NS/30
F=np.load('feat.npz'); kick,low=F['kick'],F['low']
tB,tC,tC2,TOT=map(float,open('times.txt').read().split()); N=int(TOT*FPS)
P=0.496; BAR=4*P; UEND=106.62
def decay(a,k):
    o=a.copy()
    for i in range(1,len(a)): o[i]=max(a[i],o[i-1]*k)
    return o
K=decay(np.clip(kick-0.4,0,None)/1.1,0.72); L=decay(low,0.85)
# ---------- synchro : temps du morceau u(t) -> temps de la vidéo v ----------
segs=[list(s) for s in np.load('segs.npy')]
ANCH=[8.17,30.01,57.85,84.29]                         # passages où le son de la vidéo revient tel quel
for a in ANCH:                                         # on laisse la vidéo jouer en entier sur ces passages
    e=a+SDUR-0.05; new=[]
    for s0,e0,v in segs:
        if e0<=a or s0>=e: new.append([s0,e0,v])
        else:
            if s0<a: new.append([s0,a,v])
            if e0>e: new.append([e,e0,v])
    new.append([a,e,-a]); segs=sorted(new)
SEGS=np.array(segs)
def u_of(t):
    if t<tC: return min(t,UEND),1.0,'A' if t<tB else 'B'
    if t<tC2: return min(76.875+(t-tC)*0.8,UEND),0.8,'C'
    return min((t-tC2)*0.8,UEND),0.8,'D'
def v_of(u):
    k=np.searchsorted(SEGS[:,0],u,side='right')-1; k=max(0,k)
    return float(np.clip(u+SEGS[k,2],0,SDUR-0.04)),k
def grid(u):
    ph=0.217 if u<76.875 else 0.45
    b=(u-ph)/P; return int(math.floor(b/4)), (b/4)%1, b%1   # mesure, phase mesure, phase temps
def srcframe(v):
    f=v*30; a=int(f); b=min(a+1,NS-1); x=f-a
    return SRC[a].astype(np.float32)*(1-x)+SRC[b].astype(np.float32)*x
# ---------- effets ----------
yy,xx=np.mgrid[0:h,0:w].astype(np.float32)
rng0=np.random.default_rng(7); GR=[rng0.normal(0,1,(h,w,1)).astype(np.float32) for _ in range(8)]
vign=(1-0.22*np.clip(np.sqrt(((xx-w/2)/(w*0.72))**2+((yy-h/2)/(h*0.72))**2),0,1)**2)[...,None]
def lum(a): return a[...,0]*0.3+a[...,1]*0.59+a[...,2]*0.11
def g_warm(a): 
    m=lum(a)[...,None]; a=m+(a-m)*1.18; a=(a-128)*1.12+118; return a*np.array([1.03,1.0,0.95])
def g_film(a,i):  # style d_ed : film doux, noirs relevés, léger teal/orange, grain
    m=lum(a)[...,None]; a=m+(a-m)*1.05; a=a*0.9+18; a=a*np.array([1.03,1.0,0.97])+np.array([0,4,8])*(1-m/255)
    return a+GR[i%8]*7
def g_gold(a):    # style mikey : doré contrasté
    m=lum(a)[...,None]; a=m+(a-m)*1.3; a=(a-128)*1.3+112; return a*np.array([1.1,0.97,0.8])
def g_bw(a):      # style petrov : n&b contrasté
    m=lum(a)[...,None]; m=(m-128)*1.35+128; return np.repeat(m,3,2)*np.array([1.0,1.0,1.04])
def blur_img(a,r):
    return np.asarray(Image.fromarray(np.clip(a,0,255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))).astype(np.float32)
def bloom(a,amt,r=14):
    return a+np.maximum(blur_img(a,r)-150,0)*amt
def motion_h(a,amt):
    n=int(2+amt*10); d=max(1,int(amt*60/n)); acc=np.zeros_like(a)
    for k in range(-n,n+1): acc+=np.roll(a,k*d,1)
    return acc/(2*n+1)
def zoom_blur(a,amt):
    im=Image.fromarray(np.clip(a,0,255).astype(np.uint8)); acc=a.copy(); n=4
    for k in range(1,n+1):
        z=1+amt*0.08*k/n; zw,zh=int(w*z),int(h*z)
        acc+=np.asarray(im.resize((zw,zh),Image.BILINEAR).crop(((zw-w)//2,(zh-h)//2,(zw-w)//2+w,(zh-h)//2+h))).astype(np.float32)
    return acc/(n+1)
def neon(a,col,amt):
    m=blur_img(a,1.5); l=lum(m)
    gx=np.abs(np.diff(l,axis=1,prepend=l[:,:1])); gy=np.abs(np.diff(l,axis=0,prepend=l[:1]))
    e=np.clip((gx+gy-6)*6,0,255)[...,None]
    e=blur_img(np.repeat(e,3,2),2.5)[...,:1]
    return a*(1-0.25*amt)+e/255*np.array(col)*1.6*amt
def pink_light(a,amt,side=1):
    g=np.clip((xx/w if side>0 else 1-xx/w)*1.6-0.7,0,1)[...,None]**1.5
    return a+g*np.array([255,40,190])*amt
def blocks(a,i,amt):
    r=np.random.default_rng(i*3+1); a=a.copy()
    for _ in range(int(2+5*amt)):
        bw,bh=r.integers(60,260),r.integers(30,160); x0,y0=r.integers(0,w-bw),r.integers(0,h-bh)
        dx,dy=r.integers(-50,50),r.integers(-30,30)
        sx,sy=np.clip(x0+dx,0,w-bw),np.clip(y0+dy,0,h-bh)
        a[y0:y0+bh,x0:x0+bw]=a[sy:sy+bh,sx:sx+bw]*(0.9+0.3*r.random())
    return a
def star(a,amt,i):
    l=blur_img(a,4); reg=lum(l)[h//6:h*2//3,w//6:w*5//6]
    y0,x0=np.unravel_index(np.argmax(reg),reg.shape); y0+=h//6; x0+=w//6
    d=np.sqrt((xx-x0)**2+(yy-y0)**2)+1; rot=i*0.03
    ax=np.abs((xx-x0)*math.cos(rot)+(yy-y0)*math.sin(rot)); ay=np.abs(-(xx-x0)*math.sin(rot)+(yy-y0)*math.cos(rot))
    s=np.exp(-ay/1.6)*np.exp(-ax/70)+np.exp(-ax/1.6)*np.exp(-ay/70)+np.exp(-d/9)
    return a+(s*255*amt)[...,None]
def mirror4(a):
    t=a[:h//2,:w//2]; top=np.concatenate([t,t[:,::-1]],1); return np.concatenate([top,top[::-1]],0)
# ---------- programmes de looks (mélange des 3 styles) ----------
LOOK_D=['film_zoom','gold','bw','neon','film','mirror','gold_pink','bloom','neon','gold']   # dernier couplet : mélange complet
LOOK_C=['film','gold','film_zoom','gold_pink']
LOOK_B=['warm','warm','bw','warm_neon','warm','mirror','warm','gold']
def frame(i):
    t=i/FPS; j=min(i,len(K)-1); k=K[j]; l=L[j]
    u,rate,sec=u_of(t); v,segk=v_of(u)
    bar,bph,bt=grid(u); slow=rate<1
    if sec=='A': look='warm' if bar%8!=7 else 'gold'
    elif sec=='B': look=LOOK_B[bar%len(LOOK_B)]
    elif sec=='C': look=LOOK_C[bar%len(LOOK_C)]
    else: look=LOOK_D[bar%len(LOOK_D)]
    # cadrage : zoom punch / dérive douce
    r=np.random.default_rng(i)
    if slow:
        zoom=1.05+0.08*bph+0.05*k; sh=5*k; rot=1.2*math.sin(t*0.45)
    else:
        zoom=1.06+0.11*k+(0.04 if look=='film_zoom' else 0); sh=18*k; rot=r.uniform(-1.2,1.2)*k
    if look=='film_zoom': zoom+=0.12*bph
    ox,oy=r.uniform(-sh,sh),r.uniform(-sh,sh)
    img=Image.fromarray(srcframe(v).astype(np.uint8))
    cw,ch=SW/zoom,SH/zoom; cx=SW/2+ox*SW/w; cy=SH/2+oy*SH/h
    if abs(rot)>0.05: img=img.rotate(rot,resample=Image.BICUBIC,center=(cx,cy))
    a=np.asarray(img.crop((cx-cw/2,cy-ch/2,cx+cw/2,cy+ch/2)).resize((w,h),Image.BICUBIC)).astype(np.float32)
    # étalonnage selon le look
    if look in('warm','warm_neon'): a=g_warm(a); a=bloom(a,0.2+0.2*l)
    elif look in('film','film_zoom'): a=g_film(a,i); a=bloom(a,0.15)
    elif look in('gold','gold_pink'): a=g_gold(a); a=bloom(a,0.35+0.25*l)
    elif look=='bw': a=g_bw(a); a=bloom(a,0.3)
    elif look=='neon': a=g_gold(a)*0.85
    elif look=='mirror': a=g_warm(a); a=a[:,::-1]
    elif look=='bloom': a=g_warm(a); a=bloom(a,0.5+1.2*max(0,1-bph*2),22)
    if look in('neon','warm_neon'): a=neon(a,(255,60,200) if bar%2 else (90,255,160),1.7 if look=="neon" else 0.8)
    if look=='gold_pink': a=pink_light(a,0.55,1 if bar%2 else -1)
    if look in('gold','gold_pink') and slow: a=star(a,0.9*(0.5+0.5*math.sin(t*3)),i)
    # transitions en début de mesure
    tbar=bph*BAR/rate
    if sec=='D' or sec=='B' or (sec=='A' and bar%4==0) or (sec=='C' and bar%2==0):
        if tbar<0.22:
            x=1-tbar/0.22; kind=bar%3
            if kind==0: a=motion_h(a,x)
            elif kind==1: a=zoom_blur(a,x*1.5); a=a+x*70
            else: a=bloom(a,1.8*x,24)
    # sur les kicks
    if not slow and k>0.3:
        ca=int(2+10*k); a[...,0]=np.roll(a[...,0],ca,1); a[...,2]=np.roll(a[...,2],-ca,1)
    if sec=='B' and k>0.6: a=blocks(a,i,k)
    if slow and k>0.5 and sec=='D': a=zoom_blur(a,k)
    if sec=='D':   # bouquet final : les 3 styles se superposent en plus du look de la mesure
        if k>0.55: a=blocks(a,i,k*0.7)                                   # petrov : blocs décalés
        if bt<0.12 and bar%2==1: a=g_bw(a)                               # petrov : flash n&b sur le temps
        if look not in('gold','gold_pink'): a=star(a,0.5*(0.5+0.5*math.sin(t*2.3)),i)   # mikey : reflet étoile
        if bar%4==3: a=pink_light(a,0.35,-1 if bar%8==3 else 1)          # mikey : lumière rose
        a=a*0.94+12+GR[i%8]*6                                            # d_ed : grain film, noirs relevés
        ca=int(3+6*k); a[...,0]=np.roll(a[...,0],ca,1); a[...,2]=np.roll(a[...,2],-ca,1)
    a=a*vign+GR[(i*3)%8]*4
    # fondu blanc d'ouverture, flash aux changements de partie
    for s in (tB,tC,tC2):
        if 0<=t-s<0.35: a=a+(1-(t-s)/0.35)*255
    if t<0.6: a=a*(t/0.6)+255*(1-t/0.6)
    if t>TOT-2.5: a=a*max(0,(TOT-t)/2.5)
    im=Image.fromarray(np.clip(a,0,255).astype(np.uint8)).resize((W,H),Image.LANCZOS)
    im=im.filter(ImageFilter.UnsharpMask(2,50,2))
    im=name_layer(im,t,i)
    return im.tobytes()
# ---------- le nom GIRESSE qui passe de temps en temps ----------
FB=ImageFont.truetype('/usr/share/fonts/opentype/inter/InterDisplay-Black.otf',84)
FI=ImageFont.truetype('/usr/share/fonts/opentype/inter/InterDisplay-BlackItalic.otf',76)
FL=ImageFont.truetype('/usr/share/fonts/opentype/inter/Inter-Bold.otf',62)
FR=ImageFont.truetype('/usr/share/fonts/opentype/inter/Inter-SemiBold.otf',26)
NAMES=[(1.0,3.4,0)]   # le nom n'apparaît qu'au début
def ease(x): return x*x*(3-2*x)
def name_layer(im,t,i):
    for t0,dur,sty in NAMES:
        x=(t-t0)/dur
        if 0<=x<=1: break
    else: return im
    r=np.random.default_rng(int(t0*10))
    inn=min(1,x*5); out=min(1,(1-x)*5); alpha=ease(inn)*ease(out)
    lay=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(lay)
    txt='GIRESSE'
    if sty==0:   # gros blanc qui glisse et glitche (mikey)
        f=FB; tw=d.textlength(txt,font=f); px=W/2-tw/2+(x-0.5)*-120; py=H*0.835+math.sin(x*5)*10
        nshow=len(txt)
        d.text((px,py),txt,font=f,fill=(255,255,255,int(255*alpha)))
        d.text((W/2-d.textlength('remix',font=FR)/2+(x-0.5)*120,py+100),'remix',font=FR,fill=(255,255,255,int(200*alpha)))
        glow_col=(255,255,255); slices=True
    elif sty==1: # néon rose qui grossit (mikey/purr)
        sc=0.9+0.15*ease(x); f=ImageFont.truetype(FI.path,int(76*sc)); tw=d.textlength(txt,font=f)
        px=W/2-tw/2; py=H*0.85-f.size/2+math.sin(x*4)*8
        d.text((px,py),txt,font=f,fill=(255,120,230,int(255*alpha)))
        glow_col=(255,40,200); slices=False
    else:        # lettres qui apparaissent une à une avec étincelles (petrov)
        f=FL; tw=d.textlength(txt,font=f); px=W/2-tw/2+math.sin(x*3)*25; py=H*0.85+(0.5-x)*30
        n=min(len(txt),int(x*len(txt)*3.5)+1); cx=px
        for q,ch in enumerate(txt):
            cw=d.textlength(ch,font=f)
            if q<n: d.text((cx,py+math.sin(q*1.3+x*8)*4),ch,font=f,fill=(225,235,255,int(255*alpha)))
            cx+=cw
        for s in range(18):
            sx=px+r.uniform(0,tw)+math.sin(x*6+s)*20; sy=py+r.uniform(-15,75)-x*40*r.random()
            rr=r.uniform(1.5,3.5); d.ellipse([sx-rr,sy-rr,sx+rr,sy+rr],fill=(160,210,255,int(230*alpha*r.random())))
        glow_col=(120,170,255); slices=False
    A=np.asarray(lay).astype(np.float32)
    gl=np.asarray(lay.filter(ImageFilter.GaussianBlur(9))).astype(np.float32)
    if slices and x>0.05:     # tranches qui glissent + séparation RGB
        rr=np.random.default_rng(i)
        for _ in range(4):
            y0=rr.integers(int(H*0.83),int(H*0.88)); hh=rr.integers(5,18); A[y0:y0+hh]=np.roll(A[y0:y0+hh],rr.integers(-20,20),1)
    base=np.asarray(im).astype(np.float32)
    al=A[...,3:]/255; ga=gl[...,3:]/255
    sd=np.asarray(lay.filter(ImageFilter.GaussianBlur(5))).astype(np.float32)[...,3:]/255
    base=base*(1-0.5*np.roll(np.roll(sd,3,0),3,1))
    base=base+ga*np.array(glow_col)*0.4*alpha
    if slices:
        sh=4; base[...,0]+=np.roll(al[...,0],sh,1)*80; base[...,2]+=np.roll(al[...,0],-sh,1)*80
    base=base*(1-al)+A[...,:3]*al
    return Image.fromarray(np.clip(base,0,255).astype(np.uint8))
if __name__=='__main__':
    if len(sys.argv)>1:
        for q in sys.argv[1:]: Image.frombytes('RGB',(W,H),frame(int(float(q)*FPS))).save(f'e2_{q}.png')
        sys.exit()
    p=subprocess.Popen(['ffmpeg','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-',
        '-c:v','libx264','-preset','veryfast','-crf','16','-pix_fmt','yuv420p',os.environ.get('OUT','edit_raw.mp4')],stdin=subprocess.PIPE)
    with Pool(4) as pool:
        for n,b in enumerate(pool.imap(frame,range(int(os.environ.get('START_FRAME','0')),N),chunksize=8)):
            p.stdin.write(b)
            if n%300==0: print(n,'/',N,flush=True)
    p.stdin.close(); p.wait(); print('done',flush=True)
