"""Preserve round44 geometry/UVs; clean dark paper facets and pad atlas gutters."""
from pathlib import Path
import json
import numpy as np
from PIL import Image,ImageDraw
from scipy.ndimage import distance_transform_edt
root=Path(__file__).resolve().parents[1]
groups=json.loads((root/'scripts/bake-input.json').read_text());report=[]
for group in [groups[0],groups[2]]:
 name=group['name'].lower();asset=root/'dist/assets';uvs=json.loads((asset/f'{name}-bake-uv.json').read_text())
 arr=np.asarray(Image.open(asset/f'{name}-studio-baked.png').convert('RGB')).copy();h,w=arr.shape[:2]
 occupied=Image.new('1',(w,h));edge=Image.new('1',(w,h));od=ImageDraw.Draw(occupied);ed=ImageDraw.Draw(edge)
 for mesh in group['meshes']:
  uv=np.array(uvs[mesh['name']]).reshape(-1,3,2);normal=np.array(mesh['normals']).reshape(-1,3,3).mean(axis=1)
  ispaper=('paper' in mesh['name'].lower() or 'research sheet' in mesh['name'] or 'cloth cover' in mesh['name']) and 'clip' not in mesh['name']
  for t,n in zip(uv,normal):
   points=[(float(x*(w-1)),float((1-y)*(h-1))) for x,y in t];od.polygon(points,fill=1)
   if ispaper and n[1]<.55:ed.polygon(points,fill=1)
 occ=np.array(occupied,dtype=bool);mask=np.array(edge,dtype=bool)
 lum=arr.astype(np.float32).mean(axis=2);target=np.maximum(lum,168+lum*.14)
 delta=np.maximum(0,target-lum);arr[mask]=np.clip(arr[mask].astype(float)+delta[mask,None],0,255).astype(np.uint8)
 _,indices=distance_transform_edt(~occ,return_indices=True)
 empty=~occ;arr[empty]=arr[indices[0][empty],indices[1][empty]]
 Image.fromarray(arr).save(asset/f'{name}-studio-clean.png',optimize=True)
 report.append({'model':name,'edgeTexels':int(mask.sum()),'originalEdgeMin':float(lum[mask].min()),'correctedEdgeMin':int(arr[mask].min()),'uvGuttersPadded':int(empty.sum())})
(root/'verification/paper-edge-cleanup.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
