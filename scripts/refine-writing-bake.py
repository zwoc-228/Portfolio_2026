"""Rebake narrow paper edges with fractional padding and diffuse-only irradiance."""
import bpy,json,math
from pathlib import Path
root=Path.cwd();bpy.ops.wm.open_mainfile(filepath=str(root/'scripts/studio-source.blend'));s=bpy.context.scene;s.cycles.samples=96
names=json.loads((root/'dist/assets/writing-bake-uv.json').read_text());objects=[bpy.data.objects[n] for n in names]
for ob in bpy.context.scene.objects:
 if ob.type=='MESH':ob.hide_render=ob not in objects and ob.name!='Studio desk';ob.hide_set(ob not in objects and ob.name!='Studio desk')
bpy.ops.object.select_all(action='DESELECT')
for ob in objects:ob.select_set(True)
bpy.context.view_layer.objects.active=objects[0]
bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(angle_limit=math.radians(66),margin_method='FRACTION',island_margin=.008);bpy.ops.object.mode_set(mode='OBJECT')
uvs={}
for ob in objects:
 uv=ob.data.uv_layers.active.data;uvs[ob.name]=[round(v,6) for p in ob.data.polygons for li in p.loop_indices for v in uv[li].uv]
(root/'dist/assets/writing-bake-uv.json').write_text(json.dumps(uvs,separators=(',',':')))
image=bpy.data.images.new('Writing diffuse lighting',width=4096,height=4096,alpha=False);image.colorspace_settings.name='sRGB'
for ob in objects:
 for m in ob.data.materials:
  ns=m.node_tree.nodes
  if not any(n.type=='TEX_IMAGE' and n.image==image for n in ns):
   n=ns.new('ShaderNodeTexImage');n.image=image;ns.active=n
copies=[]
for ob in objects:
 c=ob.copy();c.data=ob.data.copy();bpy.context.collection.objects.link(c);copies.append(c);ob.hide_render=True;ob.hide_set(True)
bpy.ops.object.select_all(action='DESELECT')
for c in copies:c.select_set(True)
bpy.context.view_layer.objects.active=copies[0];bpy.ops.object.join();combined=bpy.context.object
s.render.bake.margin=8;s.render.bake.use_clear=True
bpy.ops.object.bake(type='DIFFUSE',pass_filter={'COLOR','DIRECT','INDIRECT'})
image.filepath_raw=str(root/'dist/assets/writing-studio-baked.png');image.file_format='PNG';image.save()
bpy.data.objects.remove(combined,do_unlink=True)
for o in objects:o.hide_render=False;o.hide_set(False)
s.cycles.samples=48
bpy.ops.wm.save_as_mainfile(filepath=str(root/'scripts/studio-source.blend'))
print('WRITING_EDGE_BAKE_COMPLETE')
