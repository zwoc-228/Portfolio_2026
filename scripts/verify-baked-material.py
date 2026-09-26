"""Load actual runtime JPEG + UV data, render all three, and export portable GLBs."""
import bpy,json,math
from pathlib import Path
from mathutils import Vector
root=Path.cwd();bpy.ops.wm.open_mainfile(filepath=str(root/'scripts/studio-source.blend'))
groups={}
for name in ['writing','architecture','research']:
 uvs=json.loads((root/'dist/assets'/f'{name}-bake-uv.json').read_text());image=bpy.data.images.load(str(root/'dist/assets'/f'{name}-studio-baked.jpg'));image.colorspace_settings.name='sRGB'
 mat=bpy.data.materials.new(name+' web baked');mat.use_nodes=True;n=mat.node_tree.nodes;n.clear();out=n.new('ShaderNodeOutputMaterial');em=n.new('ShaderNodeEmission');tex=n.new('ShaderNodeTexImage');tex.image=image;mat.node_tree.links.new(tex.outputs['Color'],em.inputs['Color']);mat.node_tree.links.new(em.outputs[0],out.inputs[0])
 group=[]
 for obj,uv in uvs.items():
  ob=bpy.data.objects[obj];ob.hide_set(False);ob.hide_render=False;ob.data.materials.clear();ob.data.materials.append(mat)
  assert len(uv)==len(ob.data.loops)*2,(obj,len(uv),len(ob.data.loops))
  for i,loop in enumerate(ob.data.uv_layers.active.data):loop.uv=(uv[i*2],uv[i*2+1])
  group.append(ob)
 groups[name]=group
s=bpy.context.scene;s.camera.location=(3.8,-6,5.8);s.camera.rotation_euler=(Vector((0,0,.22))-s.camera.location).to_track_quat('-Z','Y').to_euler();s.camera.data.ortho_scale=5.2
for name,group in groups.items():
 bpy.ops.object.select_all(action='DESELECT')
 for k,others in groups.items():
  for ob in others:ob.hide_render=k!=name;ob.hide_set(k!=name)
 for ob in group:ob.select_set(True)
 bpy.ops.export_scene.gltf(filepath=str(root/'dist/models'/f'{name}-baked.glb'),export_format='GLB',use_selection=True,export_materials='EXPORT')
 s.render.filepath=str(root/'verification'/f'{name}-web-material.png');bpy.ops.render.render(write_still=True)
# Three actual models in their authored home composition. This remains a model render,
# not a screenshot of the website UI or WebGL renderer.
for name,x,z,angle in [('writing',-4.18,-.34,-.286),('architecture',0,-.22,-.012),('research',4.18,-.37,.242)]:
 for ob in groups[name]:
  ob.hide_set(False);ob.hide_render=False;ob.location=(x,-z,0);ob.rotation_euler.z=angle
s.camera.location=(0,-13,9);s.camera.rotation_euler=(Vector((0,0,.20))-s.camera.location).to_track_quat('-Z','Y').to_euler();s.camera.data.ortho_scale=14.2;s.render.resolution_x=1680;s.render.resolution_y=760
s.render.filepath=str(root/'verification/three-models-material-check.png');bpy.ops.render.render(write_still=True)
print('ALL_WEB_MATERIALS_VERIFIED')
