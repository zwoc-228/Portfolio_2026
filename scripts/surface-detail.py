"""Deterministic seamless PBR microstructure; run after refine-materials.py."""
from pathlib import Path
from PIL import Image
from scipy.ndimage import gaussian_filter
import numpy as np
p=Path('dist/assets'); n=1024
r=np.random.default_rng(20260920); y,x=np.mgrid[:n,:n]
def smooth(a,s):return gaussian_filter(a,s,mode='wrap')
def save(name,a):Image.fromarray(np.uint8(np.clip(a,0,255))).save(p/name)
noise=r.normal(size=(n,n)); broad=smooth(noise,12);broad/=broad.std()
# Yarn crossovers: irregular thread width, with restrained alternating relief.
phase=2*np.pi*128/n
warp=np.cos(x*phase+.12*broad);weft=np.cos(y*phase+.12*broad)
over=np.cos(x*phase/2)*np.cos(y*phase/2)
relief=(warp*(.65+.25*over)+weft*(.65-.25*over))
fiber=smooth(noise,(.5,2))
save('linen-bump.png',128+relief*12+fiber*3)
save('linen-rough.png',225+relief*5+broad*1.2)
base=247+fiber*2+broad*.6
save('linen-color.png',np.stack([base,base-1,base-3],-1))
# Fine mineral grains and isolated pinholes, rather than drawn marble veins.
grain=smooth(noise,.6);pore=smooth((r.random((n,n))>.9985).astype(float),.8)
mineral=249+grain*2+broad*.7-pore*36
save('stone-color.png',np.stack([mineral,mineral-.5,mineral-1.5],-1))
save('stone-bump.png',128+grain*4-pore*65)
save('stone-rough.png',231+grain*5+broad*1.5-pore*10)
save('copper-rough.png',222+smooth(noise,(1,18))*22+broad*2)
save('steel-rough.png',232+smooth(noise,(.4,16))*15)
for key in ['linen','stone','paper']:
 a=np.asarray(Image.open(p/(key+'-bump.png')).convert('L'),dtype=float)/255
 gx=(np.roll(a,-1,1)-np.roll(a,1,1))*.5;gy=(np.roll(a,-1,0)-np.roll(a,1,0))*.5
 normal=np.dstack((-gx*2,-gy*2,np.ones_like(a)));normal/=np.linalg.norm(normal,axis=2,keepdims=True)
 save(key+'-normal.png',(normal*.5+.5)*255)
