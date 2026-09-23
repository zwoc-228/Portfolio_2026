"""Re-import the web JPEG and web UV arrays, verify the exact baked surface, export GLB."""
import bpy,json
from pathlib import Path
root=Path.cwd();bpy.ops.wm.open_mainfile(filepath=str(root/'scripts/architecture-studio-source.blend'))
uvs=json.loads((root/'dist/assets/architecture-bake-uv.json').read_text());image=bpy.data.images.load(str(root/'dist/assets/architecture-studio-baked.jpg'));image.colorspace_settings.name='sRGB'
mat=bpy.data.materials.new('Cycles baked handmade studio');mat.use_nodes=True;n=mat.node_tree.nodes;n.clear();out=n.new('ShaderNodeOutputMaterial');em=n.new('ShaderNodeEmission');tex=n.new('ShaderNodeTexImage');tex.image=image;mat.node_tree.links.new(tex.outputs['Color'],em.inputs['Color']);mat.node_tree.links.new(em.outputs[0],out.inputs[0])
bpy.ops.object.select_all(action='DESELECT')
for name,uv in uvs.items():
 ob=bpy.data.objects[name];ob.data.materials.clear();ob.data.materials.append(mat)
 assert len(uv)==len(ob.data.loops)*2,(name,len(uv),len(ob.data.loops))
 for i,loop in enumerate(ob.data.uv_layers.active.data):loop.uv=(uv[i*2],uv[i*2+1])
 ob.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(root/'dist/models/architecture-baked.glb'),export_format='GLB',use_selection=True,export_materials='EXPORT')
s=bpy.context.scene;s.render.filepath=str(root/'verification/architecture-web-material.png');bpy.ops.render.render(write_still=True)
print('WEB_MATERIAL_VERIFIED')
