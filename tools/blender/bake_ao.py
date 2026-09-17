"""One-off AO bake for homepage GLB assets (Blender 4.2, headless, CPU).

Reuses the procedural build() from each generate_* module, repacks UVs
with lightmap_pack (box UVs are otherwise unused — no color maps), bakes
ambient occlusion to 1024px PNGs, saves to public/textures/.

NO lighting is baked into base color — AO maps multiply in three.js only.

Usage:
    blender --background --python tools/blender/bake_ao.py -- public/textures [writing|research|architecture|all]
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__))))

import bpy
import common

PX = 1024
SAMPLES = 24

# Meshes excluded from the AO atlas (keep original UVs / materials).
SKIP = {
    "research": ("TopSheet", "ClipOuter", "ClipInner", "ClipBridge"),
    "writing": (),
    "architecture": (),
}


def bake_object(mod, name, outdir, px=PX, samples=SAMPLES):
    mod.build()  # leaves ONLY object meshes in the scene (no studio yet)
    meshes = [o for o in bpy.context.scene.objects
              if o.type == "MESH" and not o.name.startswith(tuple(SKIP.get(name, ())))]
    # NOTE: skipped meshes keep Blender box UVs; they must not share the
    # AO image (TopSheet gets its own print material without aoMap).
    skipped = [o for o in bpy.context.scene.objects
               if o.type == "MESH" and o not in meshes]
    print(f"AO {name}: packing {len(meshes)} meshes, skipping {[o.name for o in skipped]}")

    bpy.ops.object.select_all(action="DESELECT")
    for o in meshes:
        o.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    # Exact 4.2 signature verified via rna_type (no image-size param).
    bpy.ops.uv.lightmap_pack(
        PREF_CONTEXT="ALL_FACES",
        PREF_PACK_IN_ONE=True,
        PREF_NEW_UVLAYER=False,
        PREF_BOX_DIV=24,
        PREF_MARGIN_DIV=0.05,
    )

    img = bpy.data.images.new(f"{name}_AO", px, px, alpha=False,
                              float_buffer=False)
    img.colorspace_settings.name = "Non-Color"
    img.file_format = "PNG"
    mats = set()
    for o in meshes:
        for slot in o.material_slots:
            if slot.material is not None:
                mats.add(slot.material)
    for mat in mats:
        tex = mat.node_tree.nodes.new("ShaderNodeTexImage")
        tex.image = img
        mat.node_tree.nodes.active = tex

    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.samples = samples
    sc.cycles.device = "CPU"
    bpy.ops.object.bake(type="AO", margin=8, use_clear=True)

    path = os.path.abspath(os.path.join(outdir, f"{name}_ao.png"))
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.filepath_raw = path
    img.save()
    print(f"AO SAVED: {path} ({os.path.getsize(path)} bytes)")

    common.clear_scene()
    for m in list(bpy.data.materials):
        bpy.data.materials.remove(m)
    for i in list(bpy.data.images):
        bpy.data.images.remove(i)


def main():
    import generate_writing
    import generate_research
    import generate_architecture
    args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    outdir = args[0] if len(args) > 0 else "public/textures"
    which = args[1] if len(args) > 1 else "all"
    jobs = {
        "writing": generate_writing,
        "research": generate_research,
        "architecture": generate_architecture,
    }
    if which == "all":
        for name, mod in jobs.items():
            bake_object(mod, name, outdir)
    else:
        bake_object(jobs[which], which, outdir)
    print("AO BAKE DONE")


if __name__ == "__main__":
    main()
