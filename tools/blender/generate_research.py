"""Generate public/models/research.glb — loose paper stack (runs AFTER writing gate).

BLENDER Z-UP: footprint in X/Y (A4 0.21 x 0.297), sheets stacked in +Z.
R3F applies the same SCALE=5.4 as writing.

Geometry:
  - 9 loose sheets, each 0.4mm thick, seeded x/y offsets + tiny yaw
  - top sheet with a barely-there corner curl (subdivided plane, +Z lift)
  - real metal paperclip: two torus arms + bridge, steel material

Headless:
    blender --background --python tools/blender/generate_research.py -- public/models
"""
import math
import os
import random
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__))))

import bpy
import common
import materials

SEED = 11
W, D = 0.210, 0.297
SHEET_T = 0.0004


def build():
    common.clear_scene()
    random.seed(SEED)
    m_paper = materials.paper()
    m_steel = materials.steel()

    z = 0.0
    for i in range(10):
        jx = random.uniform(-0.0038, 0.0038)
        jy = random.uniform(-0.0038, 0.0038)
        w = W - i * 0.0007
        obj = common.new_box(f"Sheet{i:02d}", (w, D - i * 0.0007, SHEET_T),
                             (jx, jy, z + SHEET_T / 2),
                             m_paper, bevel_width=0.00015, bevel_segments=1)
        obj.rotation_euler = (0, 0, random.uniform(-0.018, 0.018))
        z += SHEET_T + 0.00012

    # Top sheet: subdivided plane (already XY, facing +Z) with slight
    # corner lift toward +X/+Y, max ~1.2mm. Solidified for thickness.
    bpy.ops.mesh.primitive_plane_add(size=1.0, location=(0, 0, z + 0.0002))
    top = bpy.context.active_object
    top.name = "TopSheet"
    top.scale = (W - 0.003, D - 0.003, 1.0)
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.subdivide(number_cuts=6)
    bpy.ops.object.mode_set(mode="OBJECT")
    mesh = top.data
    for v in mesh.vertices:
        fx = max(0.0, v.co.x / (W / 2))
        fy = max(0.0, v.co.y / (D / 2))
        v.co.z += 0.0012 * fx * fx * fy * fy
    top.rotation_euler = (0, 0, 0.01)
    mesh.materials.append(m_paper)
    solid = top.modifiers.new("Thickness", "SOLIDIFY")
    solid.thickness = SHEET_T
    z += 0.0016

    # Paperclip: torus default lies in XY (flat on the stack) — correct as-is.
    # Straddles the FAR top edge (+Y: maps to R3F -Z, away from camera —
    # matches ui-baseline.png where the clip sits at the top/far edge).
    cx, cy = 0.055, D / 2 - 0.0085
    common.new_torus("ClipOuter", 0.011, 0.0011, (cx, cy, z + 0.0012),
                     (0, 0, 0.0), m_steel)
    common.new_torus("ClipInner", 0.0068, 0.0009, (cx, cy, z - 0.0018),
                     (0, 0, 0.0), m_steel)
    common.new_box("ClipBridge", (0.0012, 0.0012, 0.0032),
                   (cx + 0.0105, cy, z - 0.0003), m_steel)
    return z


def main():
    outdir = common.out_dir_from_argv("public/models")
    total_h = build()
    print(f"STACK total height: {total_h:.4f} m")
    m_floor = materials.preview_floor()
    common.setup_studio(frame_target_loc=(0, 0, 0.01),
                        cam_loc=(-0.5, 0.9, 0.5),
                        floor_size=12.0, floor_mat=m_floor)
    common.render_preview(os.path.join(outdir, "research_preview.png"))
    common.remove_studio()
    common.export_glb(os.path.join(outdir, "research.glb"))


if __name__ == "__main__":
    main()
