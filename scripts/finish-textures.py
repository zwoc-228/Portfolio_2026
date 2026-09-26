from pathlib import Path
from PIL import Image
import json
assets=Path.cwd()/'dist/assets'
for name in ['writing','architecture','research']:
 Image.open(assets/(name+'-studio-baked.png')).convert('RGB').save(assets/(name+'-studio-baked.jpg'),quality=96,subsampling=0,optimize=True)
print('Three runtime atlases ready')
