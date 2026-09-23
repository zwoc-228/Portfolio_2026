"""Run from project root: blender -b -t 8 --python scripts/bake-studio.py.
Bake exact website geometry, not a replacement illustration.
"""
import bpy, json, math
from pathlib import Path
from mathutils import Matrix, Vector
ROOT=Path.cwd(); ASSETS=ROOT/'dist/assets'; VERIFY=ROOT/'verification'; VERIFY.mkdir(exist_ok=True)
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.device='CPU';s.cycles.samples=48
s.render.threads_mode='FIXED';s.render.threads=8;s.cycles.use_denoising=True
s.world.use_nodes=True;s.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.80,.84,.88,1);s.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.30
s.view_settings.view_transform='AgX'
def material(name,color,rough=.7,metal=0):
 m=bpy.data.materials.new(name);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal;return m
groups={}; source=json.loads((ROOT/'scripts/bake-input.json').read_text())
for group in source:
 objects=[]
 for src in group['meshes']:
  a=src['matrix']; mat=Matrix([[a[c*4+r] for c in range(4)] for r in range(4)]); nm=mat.to_3x3().inverted().transposed()
  vertices=[]; lookup={}; indices=[]; normals=[]
  for i in range(0,len(src['positions']),3):
   p=mat@Vector(src['positions'][i:i+3]); v=(p.x,-p.z,p.y);key=tuple(round(t,7) for t in v)
   if key not in lookup: lookup[key]=len(vertices);vertices.append(v)
   indices.append(lookup[key]);n=nm@Vector(src['normals'][i:i+3]);n.normalize();normals.append((n.x,-n.z,n.y))
  faces=[indices[i:i+3] for i in range(0,len(indices),3)]
  mesh=bpy.data.meshes.new(src['name']);mesh.from_pydata(vertices,[],faces);mesh.update()
  ob=bpy.data.objects.new(src['name'],mesh);bpy.context.collection.objects.link(ob)
  for poly in mesh.polygons:poly.use_smooth=True
  mesh.normals_split_custom_set(normals)
  ob.data.materials.append(material(src['name'],src['color'],src['roughness'],src['metalness']))
  objects.append(ob)
 groups[group['name']]=objects

def visible_group(name):
 for k,objects in groups.items():
  for ob in objects:ob.hide_render=k!=name;ob.hide_set(k!=name)

def select(objects):
 bpy.ops.object.select_all(action='DESELECT')
 for o in objects:o.select_set(True)
 bpy.context.view_layer.objects.active=objects[0]

def light(name,loc,power,size,color):
 d=bpy.data.lights.new(name,'AREA');d.energy=power;d.shape='DISK';d.size=size;d.color=color
 o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o);o.location=loc;o.rotation_euler=(-o.location).to_track_quat('-Z','Y').to_euler()
light('Large warm softbox',(-3.5,-4,6),440,5,(1,.95,.88));light('Cool bounce',(4,-1,3.6),170,4.5,(.84,.92,1));light('Ceiling diffusion',(0,3.5,6),240,5,(1,1,1))
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.016));desk=bpy.context.object;desk.name='Studio desk';desk.data.materials.append(material('Quiet silver',(.46,.50,.52),.48,.40))
visible_group('Architecture');arch=groups['Architecture'];select(arch)
bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(angle_limit=math.radians(66),island_margin=.012);bpy.ops.object.mode_set(mode='OBJECT')
uvs={}
for ob in arch:
 uv=ob.data.uv_layers.active.data
 uvs[ob.name]=[v for poly in ob.data.polygons for li in poly.loop_indices for v in uv[li].uv]
(ASSETS/'architecture-bake-uv.json').write_text(json.dumps(uvs,separators=(',',':')))
image=bpy.data.images.new('Architecture studio lighting',width=2048,height=2048,alpha=False);image.colorspace_settings.name='sRGB'
for ob in arch:
 for m in ob.data.materials:
  nodes=m.node_tree.nodes;n=nodes.new('ShaderNodeTexImage');n.image=image;nodes.active=n
s.render.bake.margin=16;s.render.bake.use_clear=False
bpy.ops.object.bake(type='COMBINED')
image.filepath_raw=str(ASSETS/'architecture-studio-baked.png');image.file_format='PNG';image.save()
# Ground-contact AO for all three actual model silhouettes.
desk.hide_render=True;layout=[]
for name,objects in groups.items():
 visible_group(name)
 bounds=[o.matrix_world@Vector(v) for o in objects for v in o.bound_box]
 xmin=min(p.x for p in bounds)-.38;xmax=max(p.x for p in bounds)+.38;ymin=min(p.y for p in bounds)-.38;ymax=max(p.y for p in bounds)+.38
 bpy.ops.mesh.primitive_plane_add(size=2,location=((xmin+xmax)/2,(ymin+ymax)/2,-.014));plane=bpy.context.object;plane.name=name+' contact receiver';plane.scale=((xmax-xmin)/2,(ymax-ymin)/2,1)
 m=bpy.data.materials.new(name+' AO');m.use_nodes=True;n=m.node_tree.nodes;n.clear();out=n.new('ShaderNodeOutputMaterial');em=n.new('ShaderNodeEmission');ao=n.new('ShaderNodeAmbientOcclusion');ao.inputs['Distance'].default_value=.42;ao.samples=64;m.node_tree.links.new(ao.outputs['AO'],em.inputs['Color']);m.node_tree.links.new(em.outputs[0],out.inputs['Surface']);plane.data.materials.append(m)
 im=bpy.data.images.new(name+' contact',width=512,height=512,alpha=False);im.colorspace_settings.name='Non-Color';node=n.new('ShaderNodeTexImage');node.image=im;n.active=node
 select([plane]);s.render.bake.use_clear=True;bpy.ops.object.bake(type='EMIT');filename=name.lower()+'-contact-ao.png';im.filepath_raw=str(ASSETS/filename);im.file_format='PNG';im.save()
 layout.append(dict(name=name,file=filename,width=xmax-xmin,depth=ymax-ymin,x=(xmin+xmax)/2,z=-(ymin+ymax)/2))
 bpy.data.objects.remove(plane,do_unlink=True)
(ASSETS/'contact-ao-layout.json').write_text(json.dumps(layout,indent=2))
visible_group('Architecture');desk.hide_render=False
bpy.ops.object.camera_add(location=(4.6,-6.5,4.2));camera=bpy.context.object;camera.rotation_euler=(Vector((0,0,.38))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.ortho_scale=5.4;s.camera=camera
s.render.resolution_x=1100;s.render.resolution_y=850;s.render.resolution_percentage=100
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'scripts/architecture-studio-source.blend'))
s.render.filepath=str(VERIFY/'architecture-studio-source.png');bpy.ops.render.render(write_still=True)
print('STUDIO_BAKE_COMPLETE')
