"""Repair only the baked hinge shadow on the upper cover; preserve UVs and other faces."""
import json
from pathlib import Path
import numpy as np
from PIL import Image
from scipy.ndimage import distance_transform_edt, binary_dilation
root=Path(__file__).resolve().parents[1]
data=json.loads((root/'tools/cover.json').read_text())
im=np.array(Image.open(root/'assets/writing-studio-clean.png').convert('RGB'));h,w=im.shape[:2]
p=np.array(data['positions']).reshape(-1,3,3);n=np.array(data['normals']).reshape(-1,3,3)
u=np.array(data['uv']).reshape(-1,3,2)*[w,-h]+[0,h]
face=np.zeros((h,w),bool);strip=np.zeros((h,w),bool)
for pos,norm,uv in zip(p,n,u):
 if norm[:,1].mean()<.99:continue
 x0,y0=np.maximum(np.floor(uv.min(0)).astype(int),0);x1,y1=np.minimum(np.ceil(uv.max(0)).astype(int),[w-1,h-1])
 xx,yy=np.meshgrid(np.arange(x0,x1+1)+.5,np.arange(y0,y1+1)+.5)
 a,b,c=uv;det=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
 if abs(det)<1e-8:continue
 qx=xx-a[0];qy=yy-a[1]
 wb=(qx*(c[1]-a[1])-qy*(c[0]-a[0]))/det
 wc=((b[0]-a[0])*qy-(b[1]-a[1])*qx)/det
 wa=1-wb-wc;inside=(wa>=0)&(wb>=0)&(wc>=0)
 localx=wa*pos[0,0]+wb*pos[1,0]+wc*pos[2,0]
 face[y0:y1+1,x0:x1+1]|=inside
 strip[y0:y1+1,x0:x1+1]|=inside&(abs(localx+1.135)<.055)
ys,xs=np.where(face);sl=(slice(ys.min(),ys.max()+1),slice(xs.min(),xs.max()+1))
valid=face[sl]&~binary_dilation(strip[sl],iterations=2)
idx=distance_transform_edt(~valid,return_distances=False,return_indices=True)
patch=im[sl];mask=strip[sl];patch[mask]=patch[tuple(idx[:,mask])]
Image.fromarray(im).save(root/'assets/writing-studio-round53.png',optimize=True)
Image.fromarray(im[sl]).resize((900,900)).save(root/'tools/cover-preview.png')
print('Repaired cover pixels:',int(strip.sum()),'top face:',int(face.sum()))
