"""Update embedded atlas in round44 GLBs without changing geometry."""
import json,struct
from pathlib import Path
for name in ['writing','research']:
 p=Path('dist/models')/(name+'-baked.glb');data=p.read_bytes();length=struct.unpack_from('<I',data,12)[0];j=json.loads(data[20:20+length]);pos=20+length;binlen=struct.unpack_from('<I',data,pos)[0];binary=data[pos+8:pos+8+binlen]
 texture=Path(f'dist/assets/{name}-studio-clean.png').read_bytes();offset=len(binary);binary+=texture;binary+=b'\x00'*((-len(binary))%4)
 view=len(j['bufferViews']);j['bufferViews'].append({'buffer':0,'byteOffset':offset,'byteLength':len(texture)})
 for im in j['images']:im['bufferView']=view;im['mimeType']='image/png'
 if name=='research':
  mi=len(j['materials']);j['materials'].append({'name':'Neutral satin steel clip','pbrMetallicRoughness':{'baseColorFactor':[.558,.558,.558,1],'metallicFactor':1,'roughnessFactor':.24}})
  for node in j['nodes']:
   if node.get('name')=='Bent satin steel paperclip':
    for prim in j['meshes'][node['mesh']]['primitives']:prim['material']=mi
 j['buffers'][0]['byteLength']=len(binary);js=json.dumps(j,separators=(',',':')).encode();js+=b' '*((-len(js))%4)
 p.write_bytes(struct.pack('<III',0x46546c67,2,28+len(js)+len(binary))+struct.pack('<II',len(js),0x4e4f534a)+js+struct.pack('<II',len(binary),0x004e4942)+binary)
 print(name,'atlas updated; geometry retained')
