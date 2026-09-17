"""Canonical CI builder: public/models/research.glb (procedural, seeded).

Research geometry (loose sheets + torus paperclip) is controlled and
simple, so procedural Blender Python construction is the source of truth.
Deterministic (SEED=11).

Headless (CI):
    blender --background --python tools/blender/build_research.py -- public/models

NOTE: tools/blender/generate_research.py remains as the local/manual
fallback and owns build(). This module is the CI entry point: same build,
shared preview helpers, shared export_gltf.
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__))))

import common
import materials
import export_gltf
import generate_research


def main():
    outdir = common.out_dir_from_argv("public/models")
    total_h = generate_research.build()
    print(f"STACK total height: {total_h:.4f} m")

    m_floor = materials.preview_floor()
    common.setup_studio(frame_target_loc=(0, 0, 0.01),
                        cam_loc=(-0.5, 0.9, 0.5),
                        floor_size=12.0, floor_mat=m_floor)
    common.render_preview(os.path.join(outdir, "research_preview.png"))
    common.remove_studio()
    export_gltf.export_glb(os.path.join(outdir, "research.glb"))


if __name__ == "__main__":
    main()
