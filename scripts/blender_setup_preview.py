"""Standalone Eevee preview setup for any Blender scene.

Reusable: applies lightweight preview settings without touching geometry
or materials, then renders one still and exits.

Usage:
    blender --background [scene.blend] --python scripts/blender_setup_preview.py -- OUT.png [WIDTH HEIGHT] [SAMPLES]

Defaults: 1280x720 @ 50%, 32 TAA samples. Env overrides: BL_PREVIEW_ENGINE
(eevee|cycles), BL_PREVIEW_PCT.
"""
import os
import sys

import bpy


def main():
    args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    out = args[0] if len(args) > 0 else "/tmp/preview.png"
    w = int(args[1]) if len(args) > 1 else 1280
    h = int(args[2]) if len(args) > 2 else 720
    samples = int(args[3]) if len(args) > 3 else 32

    scene = bpy.context.scene
    engine = os.environ.get("BL_PREVIEW_ENGINE", "eevee").lower()
    try:
        pct = int(os.environ.get("BL_PREVIEW_PCT", "50"))
    except ValueError:
        pct = 50

    scene.render.resolution_x = w
    scene.render.resolution_y = h
    scene.render.resolution_percentage = max(25, min(100, pct))
    scene.render.film_transparent = False
    if engine == "cycles":
        scene.render.engine = "CYCLES"
        scene.cycles.samples = samples * 2
        scene.cycles.use_denoising = True
    else:
        scene.render.engine = "BLENDER_EEVEE_NEXT"
        scene.eevee.taa_render_samples = samples
        for attr, val in (("use_bloom", False), ("use_gtao", False),
                          ("use_ssr", False), ("use_soft_shadows", True),
                          ("use_raytracing", False)):
            if hasattr(scene.eevee, attr):
                try:
                    setattr(scene.eevee, attr, val)
                except (TypeError, AttributeError):
                    pass
    try:
        scene.view_settings.view_transform = "AgX"
    except TypeError:
        scene.view_settings.view_transform = "Standard"
    scene.view_settings.look = "None"

    scene.render.filepath = os.path.abspath(out)
    scene.render.image_settings.file_format = "PNG"
    bpy.ops.render.render(write_still=True)
    print(f"PREVIEW: {out} [{engine}]")


if __name__ == "__main__":
    main()
