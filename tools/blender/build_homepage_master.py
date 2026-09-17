"""LOOKDEV MASTER: one complete homepage studio scene (headless, Eevee).

Assembles Writing + Architecture + Research at homepage spacing with a
brushed-metal floor, homepage camera and studio lighting, and renders
lookdev/home-preview.png — the visual truth the WebGL scene must
reproduce. Blender is the lookdev sandbox, NOT the shipping renderer.

Layout mirrors the R3F homepage EXACTLY (meters = scene units / 5.4):
  R3F (x, y, z) Y-up  →  Blender (x/5.4, -z/5.4, y/5.4); yaw about Z keeps
  the SAME sign as R3F yaw about Y. Camera R3F (0, 3.2, 6.5) fov31 →
  Blender (0, -1.2037, 0.5926), lens 36.5mm. Canonical (solved
  2026-09-18, all screen edges ≤1% vs home-layout.json):
  writing (-1.593, 0, -0.098) yaw +0.18 k1.15
  arch (0.06, 0, 0.135) k1.235 / research (2.138, 0, -0.237) yaw -0.185 k1.30
  ANY drift here invalidates the preview as web truth.

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


def _xform(objs, loc, rot_z, k):
    """Apply R3F group transform EXACTLY: T(loc) · Rz(yaw) · S(k).

    (Per-object scale/rot about own centers does NOT match group
    semantics — children positions must scale/rotate about the origin.)
    """
    from mathutils import Matrix
    M = (Matrix.Translation(loc) @ Matrix.Rotation(rot_z, 4, "Z")
         @ Matrix.Scale(k, 4))
    for o in objs:
        o.matrix_world = M @ o.matrix_world


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
    _xform(arch, (0.06 / S, -0.135 / S, 0), 0.0, 1.235)

    before = set(bpy.context.scene.objects)
    generate_writing.build()
    writing = _take_new(before)  # keep all (incl. ribbon)
    _xform(writing, (-1.593 / S, 0.098 / S, 0), 0.18, 1.15)

    before = set(bpy.context.scene.objects)
    generate_research.build()
    research = _take_new(before)
    _xform(research, (2.138 / S, 0.237 / S, 0), -0.185, 1.30)

    print(f"MASTER assembly: arch={len(arch)} writing={len(writing)} "
          f"research={len(research)}")

    # Brushed-metal display surface at z=0 (object bases sit on it).
    bpy.ops.mesh.primitive_plane_add(size=8.0, location=(0, 0, -0.0005))
    floor = bpy.context.active_object
    floor.name = "MasterFloor"
    floor.data.materials.append(materials.brushed_aluminum())

    # Camera EXACTLY mirrors R3F (0, 3.2, 6.5) fov31 lookAt origin:
    # Blender (0, -6.5/5.4, 3.2/5.4), target origin, 36.5mm lens.
    cam = common.setup_studio(frame_target_loc=(0, 0, 0),
                              cam_loc=(0, -1.2037, 0.5926),
                              floor_size=30.0, floor_mat=None)
    cam.data.lens = 36.5
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
    sc.render.resolution_x = 1672
    sc.render.resolution_y = 941
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
