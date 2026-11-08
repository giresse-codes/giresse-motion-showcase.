import numpy as np, sys, subprocess, math, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
from multiprocessing import Pool
W,H,FPS=1080,1920,30
SW,SH=478,850
SRC=np.fromfile('bg/src.rgb',dtype=np.uint8).reshape(-1,SH,SW,3); NS=len(SRC); SDUR=NS/30
F=np.load('feat.npz'); low,kick,rms=F['low'],F['kick'],F['rms']
tB,tC,tC2,TOT=map(float,open('times.txt').read().split()); N=int(TOT*FPS)
def decay(a,k):
    o=a.copy()
    for i in range(1,len(a)): o[i]=max(a[i],o[i-1]*k)
    return o
K=decay(np.clip(kick-0.4,0,None)/1.1,0.72); L=decay(low,0.85)
P=0.496; BAR=4*P
# --- temps source (velocity) ---
dt=1/FPS; st=np.zeros(N); cur=0.0; wraps=[]
for i in range(N):
    t=i*dt
    if t<tB:   sp=1+0.72*math.cos(2*math.pi*((t-0.217)%BAR)/BAR)          # rapide sur le temps fort, ralenti en milieu de mesure
    elif t<tC: sp=1+0.55*math.cos(2*math.pi*((t-0.45)%BAR)/BAR)
    else:      sp=0.8
    st[i]=cur; cur+=sp*dt
    if cur>=SDUR-1/30: cur-=SDUR-1/30; wraps.append(t)
wraps=np.array(wraps)
SECT=[(0,'GIRESSE','PHONK REMIX'),(tB,'04','FINAL MIX'),(tC,'SLOWED + REVERB','0.8x'),(tC2,'COUPLET 1','SLOWED + REVERB 0.8x')]
FT=ImageFont.truetype('/usr/share/fonts/opentype/inter/InterDisplay-BlackItalic.otf',150)
FT2=ImageFont.truetype('/usr/share/fonts/opentype/inter/InterDisplay-Black.otf',120)
FS=ImageFont.truetype('/usr/share/fonts/opentype/inter/Inter-Bold.otf',44)
FW=ImageFont.truetype('/usr/share/fonts/opentype/inter/Inter-SemiBold.otf',34)
yy,xx=np.mgrid[0:H,0:W].astype(np.float32)
vign=(1-0.18*np.clip(np.sqrt(((xx-W/2)/(W*0.75))**2+((yy-H/2)/(H*0.75))**2),0,1)**2)[...,None]
def srcframe(t):
    f=t*30; a=int(f)%NS; b=(a+1)%NS; w=f-int(f)
    return SRC[a].astype(np.float32)*(1-w)+SRC[b].astype(np.float32)*w
def frame(i):
    t=i/FPS; j=min(i,len(K)-1); k=K[j]; l=L[j]; slow=t>=tC
    since=min(t-s for s,_,_ in SECT if t<=TOT and t>=s)
    sec=[s for s in SECT if t>=s[0]][-1]
    wsince=min([t-w for w in wraps if t>=w]+[99])
    flash=max(0,1-since*3)+0.7*max(0,1-wsince*4)
    # zoom punch + shake + rotation légère
    base=1.06 if not slow else 1.04+0.02*math.sin(t*0.6)
    zoom=base+(0.10 if not slow else 0.04)*k+0.10*max(0,1-since*2.5)
    r=np.random.default_rng(i); sh=(22 if not slow else 6)*k
    ox,oy=r.uniform(-sh,sh),r.uniform(-sh,sh); rot=(r.uniform(-1.5,1.5)*k if not slow else 0.6*math.sin(t*0.5))
    img=Image.fromarray(srcframe(st[i]).astype(np.uint8))
    cw,chh=SW/zoom,SH/zoom; cx=SW/2+ox*SW/W; cy=SH/2+oy*SH/H
    img=img.rotate(rot,resample=Image.BICUBIC,center=(cx,cy)) if abs(rot)>0.05 else img
    img=img.crop((cx-cw/2,cy-chh/2,cx+cw/2,cy+chh/2)).resize((W,H),Image.LANCZOS)
    # étalonnage lumineux : chaud, saturé, contraste, bloom
    img=ImageEnhance.Color(img).enhance(1.22 if not slow else 1.1)
    img=ImageEnhance.Contrast(img).enhance(1.15)
    img=ImageEnhance.Brightness(img).enhance(0.98)
    img=img.filter(ImageFilter.UnsharpMask(2,60,2))
    arr=np.asarray(img).astype(np.float32)
    bloom=np.asarray(img.resize((W//8,H//8)).filter(ImageFilter.GaussianBlur(6)).resize((W,H),Image.BILINEAR)).astype(np.float32)
    arr=arr*0.85+np.maximum(arr,bloom)*0.15+bloom*(0.03+0.07*l+(0.04 if slow else 0))
    # light leak chaud qui se balade
    lx=W*(0.5+0.6*math.sin(t*0.35)); ly=H*(0.3+0.4*math.cos(t*0.27))
    leak=np.exp(-(((xx-lx)/(W*0.55))**2+((yy-ly)/(H*0.35))**2))[...,None]
    tint=np.array([255,150,90]) if not slow else np.array([200,150,255])
    arr=arr+leak*tint*(0.07+0.06*l)
    # aberration RGB sur les gros kicks
    if k>0.3 and not slow:
        ca=int(4+18*k); arr[...,0]=np.roll(arr[...,0],ca,1); arr[...,2]=np.roll(arr[...,2],-ca,1)
    # flou de mouvement sur les punchs (zoom blur)
    if k>0.55 and not slow:
        im2=Image.fromarray(np.clip(arr,0,255).astype(np.uint8)); acc=arr.copy()
        for z in (1.03,1.06):
            zw,zh=int(W*z),int(H*z); acc+=np.asarray(im2.resize((zw,zh)).crop(((zw-W)//2,(zh-H)//2,(zw-W)//2+W,(zh-H)//2+H))).astype(np.float32)
        arr=acc/3
    arr=arr*vign+flash*255
    im=Image.fromarray(np.clip(arr,0,255).astype(np.uint8)); d=ImageDraw.Draw(im,'RGBA')
    # textes
    if since<2.6:
        a=min(1,since*6)*min(1,(2.6-since)*3); pop=1+0.25*max(0,1-since*5)
        font=FT if len(sec[1])>3 else FT2
        f2=ImageFont.truetype(font.path,int(font.size*pop*(0.62 if len(sec[1])>10 else 1)))
        tw=d.textlength(sec[1],font=f2); y0=H*0.70
        for dx,dy,c in ((8,8,(0,0,0,int(110*a))),(0,0,(255,255,255,int(255*a)))):
            d.text((W/2-tw/2+dx,y0+dy),sec[1],font=f2,fill=c)
        sw=d.textlength(sec[2],font=FS)
        d.rounded_rectangle([W/2-sw/2-26,y0+f2.size*1.2,W/2+sw/2+26,y0+f2.size*1.2+70],radius=35,fill=(255,255,255,int(230*a)))
        d.text((W/2-sw/2,y0+f2.size*1.2+10),sec[2],font=FS,fill=(255,70,110,int(255*a)) if not slow else (130,80,230,int(255*a)))
    wm='giresse  •  phonk remix'; d.text((W/2-d.textlength(wm,font=FW)/2+2,H-132),wm,font=FW,fill=(0,0,0,70)); d.text((W/2-d.textlength(wm,font=FW)/2,H-134),wm,font=FW,fill=(255,255,255,200))
    arr=np.asarray(im).astype(np.float32)
    if t<0.5: arr=arr*(t/0.5)+255*(1-t/0.5)
    if t>TOT-2.5: arr*=max(0,(TOT-t)/2.5)
    return np.clip(arr,0,255).astype(np.uint8).tobytes()
if __name__=='__main__':
    if len(sys.argv)>1:
        for k in sys.argv[1:]: Image.frombytes('RGB',(W,H),frame(int(float(k)*FPS))).save(f'eprev_{k}.png')
        sys.exit()
    p=subprocess.Popen(['ffmpeg','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-',
        '-c:v','libx264','-preset','veryfast','-crf','16','-pix_fmt','yuv420p','edit_raw.mp4'],stdin=subprocess.PIPE)
    with Pool(4) as pool:
        for n,b in enumerate(pool.imap(frame,range(N),chunksize=8)):
            p.stdin.write(b)
            if n%300==0: print(n,'/',N,flush=True)
    p.stdin.close(); p.wait(); print('done',flush=True)
