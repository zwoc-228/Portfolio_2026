from pathlib import Path
from PIL import Image
from scipy.ndimage import gaussian_filter
import numpy as np
p=Path('dist/assets');n=1024;r=np.random.default_rng(20260919);y,x=np.mgrid[:n,:n];a=r.normal(0,1,(n,n));fine=gaussian_filter(a,.55);broad=gaussian_filter(a,18);broad/=broad.std()
def save(name,a):Image.fromarray(np.uint8(np.clip(a,0,255))).save(p/name)
# Textile yarn relief is finer than a thread at final view; color carries only subtle fiber variation.
warp=np.sin(x*1.9+gaussian_filter(a,2)*2);weft=np.sin(y*1.92+gaussian_filter(a,3)*2)
weave=warp*(.55+.45*np.sin(y*.95))+weft*(.55+.45*np.sin(x*.95))
save('linen-bump.png',128+weave*7+fine*3)
save('linen-color.png',np.stack([248+fine*2+broad*.7,247+fine*2+broad*.7,244+fine*2+broad*.7],-1))
save('linen-rough.png',228+weave*4+fine*2)
# Sparse mineral pores and irregular low-contrast fissures.
vein=np.sin(x*.013+y*.022+broad*.3);fissure=np.exp(-(vein/.033)**2)*5
stone=249+broad*.65+fine*3-fissure
save('stone-color.png',np.stack([stone,stone-.5,stone-1.8],-1));save('stone-bump.png',128+fine*5-fissure*.7);save('stone-rough.png',230+fine*3+broad)
save('paper-color.png',np.stack([252+fine,251+fine,248+fine],-1));save('paper-bump.png',128+fine*2)
for key in ['linen','stone','paper']:
 a=np.array(Image.open(p/(key+'-bump.png')).convert('L')).astype(float)/255;gy,gx=np.gradient(a);v=np.dstack((-gx*2,-gy*2,np.ones_like(a)));v/=np.linalg.norm(v,axis=2,keepdims=True);save(key+'-normal.png',(v*.5+.5)*255)
