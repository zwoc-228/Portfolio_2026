from PIL import Image,ImageDraw,ImageFont,ImageFilter
import numpy as np
from pathlib import Path
p=Path('dist/assets');rng=np.random.default_rng(24);n=1024
# Deterministic material data, no lighting baked into diffuse maps.
y,x=np.mgrid[:n,:n];noise=rng.normal(0,1,(n,n))
def gray(name,a):Image.fromarray(np.clip(a,0,255).astype('uint8'),'L').convert('RGB').save(p/name)
gray('metal-rough.png',128+noise*5+np.repeat(rng.normal(0,9,(n,1)),n,axis=1))
gray('metal-bump.png',128+noise*2+np.repeat(rng.normal(0,2,(n,1)),n,axis=1))
gray('linen-bump.png',128+14*np.sin(x*2.2)+14*np.sin(y*2.2)+noise*9)
gray('stone-bump.png',128+noise*20)
gray('paper-bump.png',128+noise*4)
font='dist/assets/instrument-serif.ttf';im=Image.new('RGB',(1000,1300),(238,237,231));d=ImageDraw.Draw(im)
def txt(pos,t,size,fill=(78,79,77)):d.text(pos,t,font=ImageFont.truetype(font,size),fill=fill)
txt((94,86),'Research notes',60)
for yy in [188,201,214,227]:d.line((95,yy,892,yy),fill=(215,215,209),width=1)
# Muted map excerpt directly from supplied reference, used as printed graphic only.
ref=Image.open('dist/references/733B4843-FDFE-4226-B71E-1A773AAB24A8.jpeg');m=ref.crop((1090,388,1327,445)).convert('L').resize((782,265));m=Image.blend(Image.new('L',m.size,230),m,.55);im.paste(m.convert('RGB'),(100,414))
for i,t in enumerate(['Environment','Urban Systems','Society','Spatial Typologies']):txt((99,873+i*45),t,32)
for yy in range(879,1100,25):d.line((533,yy,879,yy),fill=(219,219,214),width=1)
d.line([(544,1080),(610,1069),(677,1040),(727,986),(780,952),(872,914)],fill=(195,197,193),width=2);txt((820,1184),'Vol. 01',20,(151,151,146));im.save(p/'research-print.png')
# Explicit contact-sheet crops for private reference-study content and QA.
b=Image.open('dist/references/86288B39-20A1-4CA8-9067-9D192B8D5678.jpeg')
for name,box in {'writing-preview':(18,410,520,622),'architecture-preview':(530,410,1011,622),'research-preview':(1021,410,1519,622),'writing-index':(18,633,573,829),'architecture-index':(582,633,1148,829),'research-index':(1158,633,1519,829)}.items():b.crop(box).save('dist/references/'+name+'.png')
for i,box in enumerate([(145,669,210,698),(145,710,210,738),(145,749,210,777),(145,789,210,818),(708,669,803,766),(815,669,910,766),(923,669,1017,766),(1029,669,1124,766),(1290,669,1387,766),(1400,669,1497,766)]):b.crop(box).save(p/f'index-{i}.png')
print('Materials, print and reference crops written')
for key in ['linen','stone','paper']:
 a=np.array(Image.open(p/(key+'-bump.png')).convert('L')).astype(float)/255
 gy,gx=np.gradient(a);v=np.dstack((-gx*2,-gy*2,np.ones_like(a)));v/=np.linalg.norm(v,axis=2,keepdims=True)
 Image.fromarray(np.uint8((v*.5+.5)*255)).save(p/(key+'-normal.png'))
