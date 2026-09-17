"""Canonical CI builder: public/models/writing.glb (procedural, seeded).

Writing geometry is controlled and simple, so procedural Blender Python
construction is the source of truth. Deterministic (SEED=7).

Headless (CI):
    blender --background --python tools/blender/build_writing.py -- public/models

NOTE: tools/blender/generate_writing.py remains as the local/manual
fallback and owns build(). This module is the CI entry point: same build,
shared preview helpers, shared export_gltf.
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__))))

import common
import materials
import export_gltf
import generate_writing


def main():
    outdir = common.out_dir_from_argv("public/models")
    total_h = generate_writing.build()
    print(f"NOTEBOOK total height: {total_h:.4f} m")

    # Preview: studio + light-aluminum floor (Eevee, CI-side only).
    m_floor = materials.preview_floor()
    cam = common.setup_studio(frame_target_loc=(0, 0.01, 0.015),
                              cam_loc=(-0.47, 0.82, 0.56),
                              floor_size=12.0, floor_mat=m_floor)
    common.render_preview(os.path.join(outdir, "writing_preview.png"))
    cam.location = (-0.66, 0.28, 0.34)
    common.render_preview(os.path.join(outdir, "writing_preview_spine.png"))
    common.remove_studio()
    export_gltf.export_glb(os.path.join(outdir, "writing.glb"))


if __name__ == "__main__":
    main()
