"""Generate public/models/architecture.glb — study-model collection (AFTER writing gate).

BLENDER Z-UP: footprint in X/Y, heights in +Z.
R3F applies the same SCALE=5.4 as writing.

Composition (13 meshes, each with an architectural role):
  base plinth / tower / spanning slab / courtyard block / thin wall /
  clear acrylic bar / frosted acrylic block / cantilever plate + 2 pilotis /
  blue + terracotta + charcoal accents. No random cubes; acrylic volumes
  are kept clear of solid intersections.

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

    # 1 base plinth
    B("Base", (0.34, 0.27, 0.006), (0, 0, 0.003), m_board, BEV)
    z0 = 0.006

    # 2 tower, back-left
    B("Tower", (0.045, 0.042, 0.115), (-0.085, -0.055, z0 + 0.0575),
      m_board, BEV)
    # 3 spanning slab: rests on tower, cantilevers over the block
    B("SpanSlab", (0.20, 0.06, 0.008), (0.0, -0.02, z0 + 0.1195),
      m_board, bevel_width=0.0006)
    # 4 courtyard block, center
    B("CourtBlock", (0.07, 0.062, 0.052), (0.03, 0.01, z0 + 0.026),
      m_board, BEV)
    # 5 thin wall, right
    B("ThinWall", (0.008, 0.078, 0.058), (0.115, -0.03, z0 + 0.029),
      m_board, bevel_width=0.0005)
    # 6 clear acrylic bar, front-left (clear of solids)
    B("AcrylicClear", (0.055, 0.045, 0.04), (-0.075, 0.075, z0 + 0.02),
      m_clear, bevel_width=0.0012)
    # 7 frosted acrylic block, front-right
    B("AcrylicFrosted", (0.042, 0.036, 0.056), (0.075, 0.07, z0 + 0.028),
      m_frost, bevel_width=0.0012)
    # 8 cantilever plate on 2 pilotis, back-right
    B("PilotisA", (0.01, 0.01, 0.045), (0.055, -0.085, z0 + 0.0225),
      m_board, bevel_width=0.0004)
    B("PilotisB", (0.01, 0.01, 0.045), (0.135, -0.085, z0 + 0.0225),
      m_board, bevel_width=0.0004)
    B("Cantilever", (0.13, 0.06, 0.005), (0.095, -0.085, z0 + 0.048),
      m_board, bevel_width=0.0005)
    # 9-11 restrained accents
    B("AccentBlue", (0.036, 0.03, 0.018), (-0.02, 0.085, z0 + 0.009),
      m_blue, bevel_width=0.0005)
    B("AccentTerracotta", (0.028, 0.024, 0.016), (0.145, 0.05, z0 + 0.008),
      m_terra, bevel_width=0.0005)
    B("AccentCharcoal", (0.024, 0.024, 0.014), (-0.115, -0.005, z0 + 0.007),
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
