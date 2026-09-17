"""Generate public/models/architecture.glb — study-model collection.

BLENDER Z-UP: footprint in X/Y, heights in +Z.
R3F applies the same SCALE=5.4 as writing.

Composition (14 meshes, re-authored 2026-09-17 from ui-baseline.png):
compact plinth cluster — tower center-back, stacked frosted volumes
left, clear + muted-blue front-left, spanning slab tower→terracotta,
terracotta mid-right, smoked-charcoal front-right, thin wall right,
cantilever on 2 pilotis back-right. Real 2-4mm separations; acrylic
volumes never intersect solids.

Headless:
    blender --background --python tools/blender/generate_architecture.py -- public/models
"""
import os
import random
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__))))

import common
import materials

SEED = 21
BEV = 0.0008


def build():
    common.clear_scene()
    random.seed(SEED)
    m_board = materials.model_board()
    m_clear = materials.clear_acrylic()
    m_frost = materials.frosted_acrylic()
    m_blue = materials.accent_blue()
    m_terra = materials.accent_terracotta()
    m_char = materials.accent_charcoal()

    B = common.new_box  # (name, dims=(x,y,h), loc, mat, bevel_width, ...)

    # 1 base plinth (compact: reference cluster is tight)
    B("Base", (0.17, 0.15, 0.006), (0, 0, 0.003), m_board, BEV)
    z0 = 0.006

    # 2 tower, center-back
    B("Tower", (0.042, 0.040, 0.100), (-0.01, 0.030, z0 + 0.050),
      m_board, BEV)
    # 3 spanning slab: tower → terracotta, modest, just above mid height
    B("SpanSlab", (0.110, 0.045, 0.007), (0.020, 0.010, z0 + 0.060),
      m_board, bevel_width=0.0006)
    # 4 low center block + thin cap slab (thickness hierarchy)
    B("CourtBlock", (0.030, 0.028, 0.030), (0.010, -0.010, z0 + 0.015),
      m_board, BEV)
    B("SlabThin", (0.050, 0.030, 0.003), (0.010, -0.010, z0 + 0.0315),
      m_board, bevel_width=0.0004)
    # 4b vertical fin, back-left (slim vertical accent)
    B("FinWall", (0.004, 0.050, 0.055), (-0.075, 0.045, z0 + 0.0275),
      m_board, bevel_width=0.0004)
    # 4c small solid cube, front-center (density between transparents)
    B("BlockSmall", (0.018, 0.018, 0.018), (0.030, -0.045, z0 + 0.009),
      m_board, bevel_width=0.0004)
    # 5 thin wall, right edge
    B("ThinWall", (0.006, 0.060, 0.045), (0.072, -0.010, z0 + 0.0225),
      m_board, bevel_width=0.0005)
    # 6 clear acrylic, front-center (screen-overlaps CourtBlock behind it,
    # 3D separation kept) — layered transparent read without intersection
    B("AcrylicClear", (0.034, 0.030, 0.022), (-0.005, -0.042, z0 + 0.011),
      m_clear, bevel_width=0.0012)
    # 7a frosted lower + 7b frosted upper, stacked left (layer lines read)
    B("AcrylicFrosted", (0.036, 0.034, 0.050), (-0.058, -0.005, z0 + 0.025),
      m_frost, bevel_width=0.0012)
    B("AcrylicFrostedTall", (0.034, 0.032, 0.035), (-0.048, 0.022, z0 + 0.0675),
      m_frost, bevel_width=0.0012)
    # 8 cantilever plate on 2 slim pilotis, back-right
    B("PilotisA", (0.006, 0.006, 0.038), (0.030, 0.052, z0 + 0.019),
      m_board, bevel_width=0.0003)
    B("PilotisB", (0.006, 0.006, 0.038), (0.068, 0.052, z0 + 0.019),
      m_board, bevel_width=0.0003)
    B("Cantilever", (0.060, 0.035, 0.005), (0.052, 0.052, z0 + 0.041),
      m_board, bevel_width=0.0005)
    # 9-11 restrained accents: blue front-left, terracotta mid-right,
    # smoked charcoal front-right (dark translucent in reference)
    B("AccentBlue", (0.034, 0.030, 0.028), (-0.060, -0.048, z0 + 0.014),
      m_blue, bevel_width=0.0005)
    B("AccentTerracotta", (0.030, 0.028, 0.035), (0.055, 0.005, z0 + 0.0175),
      m_terra, bevel_width=0.0005)
    B("AccentCharcoal", (0.030, 0.028, 0.032), (0.058, -0.048, z0 + 0.016),
      m_char, bevel_width=0.0005)


def main():
    outdir = common.out_dir_from_argv("public/models")
    build()
    m_floor = materials.preview_floor()
    common.setup_studio(frame_target_loc=(0, 0, 0.04),
                        cam_loc=(-0.55, 0.9, 0.6),
                        floor_size=12.0, floor_mat=m_floor)
    common.render_preview(os.path.join(outdir, "architecture_preview.png"))
    common.remove_studio()
    common.export_glb(os.path.join(outdir, "architecture.glb"))


if __name__ == "__main__":
    main()
