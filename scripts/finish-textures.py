from pathlib import Path
from PIL import Image
import json
root=Path.cwd();assets=root/'dist/assets'
Image.open(assets/'architecture-studio-baked.png').convert('RGB').save(assets/'architecture-studio-baked.jpg',quality=96,subsampling=0,optimize=True)
p=assets/'architecture-bake-uv.json';data=json.loads(p.read_text());p.write_text(json.dumps({name:[round(v,6) for v in uv] for name,uv in data.items()},separators=(',',':')))
print('JPEG and runtime UV ready')
