"""Canonical CI bake entry: crevice AO atlases → public/textures/*_ao.png.

Headless Cycles one-off (CPU). AO multiplies in three.js only — no
lighting is baked into base color.

  writing / research: procedural build() (controlled, simple geometry)
  architecture:        import-and-fix via build_architecture (source GLB)

Headless (CI):
    blender --background --python tools/blender/bake.py -- public/textures [writing|research|architecture|all]

Thin entry point — the atlas worker lives in bake_ao.py (shared).
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__))))

import bake_ao
import generate_writing
import generate_research
import build_architecture


JOBS = {
    "writing": generate_writing,
    "research": generate_research,
    "architecture": build_architecture,
}


def main():
    args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    outdir = args[0] if len(args) > 0 else "public/textures"
    which = args[1] if len(args) > 1 else "all"
    if which == "all":
        for name, mod in JOBS.items():
            bake_ao.bake_object(mod, name, outdir)
    else:
        bake_ao.bake_object(JOBS[which], which, outdir)
    print("AO BAKE DONE")


if __name__ == "__main__":
    main()
