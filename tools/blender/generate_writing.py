"""Generate public/models/writing.glb — architecture notebook (Phase 1 gate).

BLENDER Z-UP: footprint in X/Y (0.21 x 0.26), thickness stacked in +Z.
R3F applies SCALE=5.4 so the footprint matches the homepage composition.

Geometry (all real, no fakes):
  - back cover + front cover with 3mm overhang on fore-edge/head/tail
  - 22-slab recessed page block with seeded edge jitter (visible layering)
  - spine strip wrapping the bound (-X) edge
  - bookmark ribbon: bound segment + tail out the tail edge (+Y), drooping
Tiny manufactured-edge bevels; flat shading (sharp edges, no rounded look).

Headless:
    blender --background --python tools/blender/generate_writing.py -- public/models
Preview renders are written next to the GLB.
"""
import os
import random
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__))))

import common
import materials

SEED = 7
W, D = 0.210, 0.260          # footprint X/Y (m)
PAGE_W, PAGE_D = 0.204, 0.254
COVER_T = 0.0040             # premium hard cover with real thickness
SLABS = 22
SLAB_T = 0.0011


def build():
    common.clear_scene()
    random.seed(SEED)

    m_paper = materials.paper()
    m_cover = materials.book_cover()
    m_spine = materials.book_spine()
    m_ribbon = materials.ribbon()

    z = 0.0
    # Back cover (bottom)
    common.new_box("BackCover", (W, D, COVER_T), (0, 0, z + COVER_T / 2),
                   m_cover, bevel_width=0.0008)
    z += COVER_T

    # Page block: 22 jittered slabs, shifted +X so spine side stays flush
    for i in range(SLABS):
        jx = random.uniform(-0.0006, 0.0006)
        jy = random.uniform(-0.0006, 0.0006)
        w = PAGE_W - (i * 0.00008)
        common.new_box(f"Page{i:02d}", (w, PAGE_D - i * 0.00008, SLAB_T),
                       (0.002 + jx, jy, z + SLAB_T / 2),
                       m_paper, bevel_width=0.00025, bevel_segments=1)
        z += SLAB_T

    # Front cover (top)
    common.new_box("FrontCover", (W, D, COVER_T), (0, 0, z + COVER_T / 2),
                   m_cover, bevel_width=0.0008)
    z += COVER_T

    # Spine strip wrapping bound (-X) edge, full depth
    common.new_box("Spine", (0.012, D, z + 0.001),
                   (-W / 2 + 0.004, 0, (z + 0.001) / 2),
                   m_spine, bevel_width=0.0008)

    # Bookmark ribbon: bound segment sandwiched mid page-block near the
    # spine, tail emerging past the SPINE-side edge (-X) to lie on the
    # table pointing screen-left/down (matches ui-baseline.png: the tail
    # lies left of the spine, not toward the camera).
    page_top = z  # z == top of page block here
    common.new_box("RibbonInner", (0.06, 0.013, 0.0006),
                   (-0.08, -0.05, page_top - 0.004), m_ribbon)
    tip = common.new_box("RibbonTip", (0.105, 0.013, 0.0006),
                         (-0.160, -0.062, 0.0012), m_ribbon)
    tip.rotation_euler = (0, 0, -0.10)

    return z  # total height


def main():
    outdir = common.out_dir_from_argv("public/models")
    total_h = build()
    print(f"NOTEBOOK total height: {total_h:.4f} m, slabs: {SLABS}")

    # Preview: studio + light-aluminum floor.
    # Main: front-left-above (spine left, fore-edge pages right, ribbon front).
    m_floor = materials.preview_floor()
    cam = common.setup_studio(frame_target_loc=(0, 0.01, 0.015),
                              cam_loc=(-0.47, 0.82, 0.56),
                              floor_size=12.0, floor_mat=m_floor)
    common.render_preview(os.path.join(outdir, "writing_preview.png"))
    # Second angle: spine-side check (bound edge construction).
    cam.location = (-0.66, 0.28, 0.34)
    common.render_preview(os.path.join(outdir, "writing_preview_spine.png"))
    common.remove_studio()
    common.export_glb(os.path.join(outdir, "writing.glb"))


if __name__ == "__main__":
    main()
