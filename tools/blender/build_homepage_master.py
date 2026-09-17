"""LOOKDEV MASTER: one complete homepage studio scene (headless, Eevee).

Assembles Writing + Architecture + Research at homepage spacing with a
brushed-metal floor, homepage camera and studio lighting, and renders
lookdev/home-preview.png — the visual truth the WebGL scene must
reproduce. Blender is the lookdev sandbox, NOT the shipping renderer.

Layout mirrors the R3F homepage (meters = scene units / 5.4):
  R3F (x, y, z) Y-up  →  Blender (x/5.4, z/5.4, y/5.4), yaw about Z negated.
  writing (-1.6, 0, 0.5) r+0.15 / arch (0, 0, 0.3) / research (+1.6, 0, 0.5) r-0.12
  camera R3F (0, 3.2, 6.5) → Blender (0, -1.204, 0.593), 65mm (~31deg HFOV)

Headless, Eevee-first, bounded (policy: 960x540, stop if ~90s):
    BL_PREVIEW_PCT=100 blender --background --python tools/blender/build_homepage_master.py

Output: lookdev/home-preview.png (+ lookdev/ only; never ships to public/).
"""
import os
import sys
import time

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__))))

import bpy
from mathutils import Vector

import common
import materials

# Builders clear the scene on entry — neutralize so all three assets
# coexist. Same module instances (shared sys.path), so patching works.
common.clear_scene = lambda: None  # noqa: E731

import generate_writing
import generate_research
import generate_architecture

S = 5.4  # METERS_TO_SCENE (web) — master works in meters
T0 = time.time()


def _take_new(before):
    after = set(bpy.context.scene.objects)
    return [o for o in after if o not in before]


def _place(objs, loc, rot_z):
    for o in objs:
        o.location.x += loc[0]
        o.location.y += loc[1]
        o.location.z += loc[2]
        o.rotation_euler[2] += rot_z


def main():
    t_argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    outdir = t_argv[0] if len(t_argv) > 0 else "lookdev"
    os.makedirs(outdir, exist_ok=True)

    # Genuine empty start (builders' own clears are neutralized).
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)

    # Architecture FIRST is irrelevant now (no clears) — build in any order.
    # NOTE: procedural generate_architecture.build() (re-authored arrangement).
    # build_architecture.load_source() imports the SHIPPED GLB instead —
    # ship path, not the iteration path.
    before = set(bpy.context.scene.objects)
    generate_architecture.build()
    arch = _take_new(before)
    _place(arch, (0.10 / S, 0.3 / S, 0), 0.0)

    before = set(bpy.context.scene.objects)
    generate_writing.build()
    writing = _take_new(before)
    _place(writing, (-1.05 / S, 0.5 / S, 0), 0.10)

    before = set(bpy.context.scene.objects)
    generate_research.build()
    research = _take_new(before)
    _place(research, (1.25 / S, 0.5 / S, 0), 0.03)

    print(f"MASTER assembly: arch={len(arch)} writing={len(writing)} "
          f"research={len(research)}")

    # Brushed-metal display surface at z=0 (object bases sit on it).
    bpy.ops.mesh.primitive_plane_add(size=8.0, location=(0, 0, -0.0005))
    floor = bpy.context.active_object
    floor.name = "MasterFloor"
    floor.data.materials.append(materials.brushed_aluminum())

    # Studio: wide framing of the full trio. Longer lens (flatter,
    # closer to reference): 80mm @ 1.50m holds ~24deg pitch.
    cam = common.setup_studio(frame_target_loc=(0, 0, 0.03),
                              cam_loc=(0, -1.50, 0.69),
                              floor_size=30.0, floor_mat=None)
    cam.data.lens = 80.0
    # Composition iterations use half samples (material calls use full).
    try:
        bpy.context.scene.eevee.taa_render_samples = 16
    except (AttributeError, TypeError):
        pass
    # setup_studio adds its own preview floor — remove, keep MasterFloor.
    studio_floor = bpy.data.objects.get("StudioFloor")
    if studio_floor is not None:
        bpy.data.objects.remove(studio_floor, do_unlink=True)

    sc = bpy.context.scene
    sc.render.resolution_x = 1280
    sc.render.resolution_y = 720
    sc.render.resolution_percentage = 100
    print(f"MASTER lens={cam.data.lens} sensor_fit={cam.data.sensor_fit} "
          f"sensor_width={cam.data.sensor_width}")
    report_framing(cam, {
        "writing": writing, "arch": arch, "research": research})
    path = os.path.abspath(os.path.join(outdir, "home-preview.png"))
    common.render_preview(path)
    print(f"MASTER preview: {path} in {time.time() - T0:.0f}s")
    return path


def report_framing(cam, groups):
    """Project each group's world bbox to screen fractions (diagnostic)."""
    from bpy_extras.object_utils import world_to_camera_view
    sc = bpy.context.scene
    for name, objs in groups.items():
        corners = []
        for o in objs:
            if o.type != "MESH":
                continue
            for c in o.bound_box:
                w = o.matrix_world @ Vector(c)
                ndc = world_to_camera_view(sc, cam, w)
                corners.append((ndc.x, ndc.y))
        if not corners:
            continue
        xs = [c[0] for c in corners]
        ys = [c[1] for c in corners]
        print(f"FRAME {name}: x [{min(xs):.3f},{max(xs):.3f}] "
              f"cx={(min(xs)+max(xs))/2:.3f} w={max(xs)-min(xs):.3f} | "
              f"y [{min(ys):.3f},{max(ys):.3f}] "
              f"cy={(min(ys)+max(ys))/2:.3f} h={max(ys)-min(ys):.3f}")


if __name__ == "__main__":
    main()
