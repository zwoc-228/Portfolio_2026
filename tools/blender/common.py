"""Shared helpers for headless Blender asset generation.

Reproducible: every script sets random.seed(SEED) and clears the scene.
Units: meters. Scene scale matches the R3F homepage (notebook ~0.21m wide).

Usage (headless):
    blender --background --python tools/blender/generate_writing.py -- public/models
"""
import math
import os
import random
import sys

import bpy

SEED = 7


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for coll in (bpy.data.meshes, bpy.data.materials, bpy.data.images,
                 bpy.data.curves, bpy.data.cameras, bpy.data.lights):
        for x in list(coll):
            coll.remove(x)


def new_box(name, dims, loc, mat=None, bevel_width=0.0, bevel_segments=2,
            smooth=False):
    """dims=(x,y,z) full extents, loc=center. Tiny manufactured-edge bevel."""
    bpy.ops.mesh.primitive_cube_add(size=2.0, location=loc)
    obj = bpy.context.active_object
    obj.name = name
    obj.dimensions = dims
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if mat is not None:
        obj.data.materials.append(mat)
    if bevel_width > 0.0:
        mod = obj.modifiers.new("EdgeSoft", "BEVEL")
        mod.width = bevel_width
        mod.segments = bevel_segments
        mod.limit_method = "ANGLE"
        mod.angle_limit = math.radians(30.0)
    if smooth:
        bpy.ops.object.shade_smooth()
    return obj


def new_torus(name, major_radius, minor_radius, loc, rot, mat=None):
    bpy.ops.mesh.primitive_torus_add(
        location=loc, rotation=rot,
        major_radius=major_radius, minor_radius=minor_radius,
        major_segments=48, minor_segments=12)
    obj = bpy.context.active_object
    obj.name = name
    if mat is not None:
        obj.data.materials.append(mat)
    return obj


def remove_studio():
    """Delete preview-only helpers so they never ship in the GLB."""
    for name in ("StudioFloor", "FrameTarget", "PreviewCam",
                 "KeySoft", "FillRight", "TopSheen"):
        obj = bpy.data.objects.get(name)
        if obj is not None:
            bpy.data.objects.remove(obj, do_unlink=True)


def export_glb(path):
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=os.path.abspath(path),
        export_format="GLB",
        export_apply=True,
        export_yup=True,
        export_materials="EXPORT",
        export_cameras=False,
        export_lights=False,
        # No Draco: R3F's default GLTFLoader has no DRACO decoder.
        export_draco_mesh_compression_enable=False,
    )
    print(f"EXPORTED: {path} ({os.path.getsize(path)} bytes)")


def out_dir_from_argv(default):
    args = sys.argv
    if "--" in args:
        tail = args[args.index("--") + 1:]
        if tail:
            return tail[0]
    return default


def track_to(obj, target):
    con = obj.constraints.new("TRACK_TO")
    con.target = target
    con.track_axis = "TRACK_NEGATIVE_Z"
    con.up_axis = "UP_Y"
    return con


def apply_preview_engine(scene=None, samples=None):
    """Fast iteration renderer: Eevee unless BL_PREVIEW_ENGINE=cycles.

    Eevee ≈ correct fast visual reference for a WebGL target; Cycles is
    reserved for one-off bakes (BL_PREVIEW_ENGINE=cycles). Resolution
    percentage via BL_PREVIEW_PCT (default 50 while iterating).
    """
    import os as _os
    scene = scene or bpy.context.scene
    try:
        pct = int(_os.environ.get("BL_PREVIEW_PCT", "50"))
    except ValueError:
        pct = 50
    scene.render.resolution_percentage = max(25, min(100, pct))
    engine = _os.environ.get("BL_PREVIEW_ENGINE", "eevee").lower()
    if engine == "cycles":
        scene.render.engine = "CYCLES"
        scene.cycles.samples = samples or 64
        scene.cycles.use_denoising = True
        return "cycles"
    scene.render.engine = "BLENDER_EEVEE_NEXT"
    eevee = scene.eevee
    eevee.taa_render_samples = samples or 32
    for attr, val in (("use_bloom", False), ("use_gtao", False),
                      ("use_ssr", False), ("use_ssr_refraction", False),
                      ("use_volumetric_lights", False),
                      ("use_soft_shadows", True),
                      ("use_raytracing", False)):
        if hasattr(eevee, attr):
            try:
                setattr(eevee, attr, val)
            except (TypeError, AttributeError):
                pass
    return "eevee"


def setup_studio(frame_target_loc=(0, 0, 0.03), cam_loc=(0.0, 3.4, 1.9),
                 floor_size=30.0, floor_mat=None, seed=SEED):
    """Minimal product-photography studio used for preview renders.

    BLENDER Z-UP: +Z is up, +Y is scene-front, +X is scene-right.
    Very large soft key upper-left/front, restrained fill from right,
    dim cool world (no painted gradient tricks in the shipped asset;
    this only lights the *preview render*).
    """
    random.seed(seed)
    scene = bpy.context.scene
    used = apply_preview_engine(scene)
    print(f"PREVIEW ENGINE: {used}")
    scene.render.film_transparent = False
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 720
    # Modern color management; geometry/materials untouched.
    try:
        scene.view_settings.view_transform = "AgX"
    except TypeError:
        scene.view_settings.view_transform = "Standard"
    scene.view_settings.look = "None"
    scene.view_settings.exposure = 0.0

    world = bpy.data.worlds.new("StudioWorld")
    world.use_nodes = True
    nodes = world.node_tree.nodes
    links = world.node_tree.links
    nodes.remove(nodes["Background"])
    out = nodes["World Output"]
    tex = nodes.new("ShaderNodeTexEnvironment")
    hdri = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                        "..", "..", "public", "hdri", "studio_small_09_1k.hdr")
    tex.image = bpy.data.images.load(os.path.abspath(hdri))
    bg = nodes.new("ShaderNodeBackground")
    bg.inputs["Strength"].default_value = 0.55
    links.new(tex.outputs["Color"], bg.inputs["Color"])
    links.new(bg.outputs["Background"], out.inputs["Surface"])
    scene.world = world

    # Infinite floor (Blender Z-up: plain XY plane, top at z~0)
    bpy.ops.mesh.primitive_plane_add(size=floor_size, location=(0, 0, -0.0005))
    floor = bpy.context.active_object
    floor.name = "StudioFloor"
    if floor_mat is not None:
        floor.data.materials.append(floor_mat)

    # Target empty + camera (31mm-equiv ~65mm lens for 31deg HFOV)
    bpy.ops.object.empty_add(location=frame_target_loc)
    target = bpy.context.active_object
    target.name = "FrameTarget"
    bpy.ops.object.camera_add(location=cam_loc)
    cam = bpy.context.active_object
    cam.name = "PreviewCam"
    cam.data.lens = 65.0
    track_to(cam, target)
    scene.camera = cam

    def area(name, loc, power, size, color):
        bpy.ops.object.light_add(type="AREA", location=loc)
        lamp = bpy.context.active_object
        lamp.name = name
        lamp.data.energy = power
        lamp.data.size = size
        lamp.data.color = color
        track_to(lamp, target)
        return lamp

    # Very large soft key, upper-left/front
    area("KeySoft", (-2.6, 3.4, 3.2), 145.0, 6.0, (1.0, 0.97, 0.93))
    # Restrained fill, right
    area("FillRight", (3.0, 1.8, 2.0), 70.0, 3.0, (0.93, 0.95, 1.0))
    # Gentle top sheen for metal/paper separation
    area("TopSheen", (0.4, 0.6, 4.2), 15.0, 4.0, (1.0, 1.0, 1.0))
    return cam


def render_preview(path):
    scene = bpy.context.scene
    scene.render.filepath = os.path.abspath(path)
    scene.render.image_settings.file_format = "PNG"
    bpy.ops.render.render(write_still=True)
    print(f"PREVIEW: {path}")
