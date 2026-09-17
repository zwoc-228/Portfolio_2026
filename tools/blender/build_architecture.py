"""Canonical CI pipeline for the architecture maquette.

Single source of truth: tools/blender/generate_architecture.py
(deterministic, version-controlled re-author from ui-baseline.png).
This module builds procedurally, then applies the production fix pass:

  normals → angle-limited micro-bevel → UV validation →
  production material slots → preview → GLB export.

Legacy import path (existing GLB as source) remains via explicit path
arg for one-off comparisons — NOT the ship path.

Headless (CI):
    blender --background --python tools/blender/build_architecture.py -- public/models [import-source.glb]

`build()` (no export) is also the bake.py entry point.
"""
import math
import os
import sys

import bpy

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__))))

import common
import materials
import export_gltf
import generate_architecture

# Physically plausible manufactured-edge radius for maquette parts.
BEVEL_WIDTH = 0.0004
BEVEL_ANGLE = math.radians(30.0)


def _family_material(name: str):
    """Map an authored slot/material name to a production family."""
    n = (name or "").lower()
    if "smok" in n:
        return materials.smoked_acrylic()
    if "clear" in n:
        return materials.clear_acrylic()
    if "frost" in n:
        return materials.frosted_acrylic()
    if "terracotta" in n or "terra" in n:
        return materials.accent_terracotta()
    if "blue" in n or "cyan" in n:
        return materials.accent_blue()
    if "charcoal" in n or "char" in n:
        return materials.accent_charcoal()
    if "board" in n or "plaster" in n or "solid" in n:
        return materials.model_board()
    return None  # unknown: preserved untouched + warned


def _activate(o):
    bpy.ops.object.select_all(action="DESELECT")
    o.select_set(True)
    bpy.context.view_layer.objects.active = o


def load_source(path=None):
    """Procedural build + production hygiene (ship path).

    Pass an explicit GLB path for the legacy import comparison path.
    Returns the mesh list (placed at origin — positioning is the
    lookdev-master / web-layout concern, not the asset's).
    """
    if path:
        return _import_source(path)
    common.clear_scene()
    generate_architecture.build()
    meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
    print(f"ARCH PROCEDURAL: {len(meshes)} meshes")
    _fix(meshes)
    return meshes


def _import_source(path):
    """Legacy path: import an existing GLB and hygienize it."""
    common.clear_scene()
    src = os.path.abspath(path)
    print(f"ARCH SOURCE: {src} ({os.path.getsize(src)} bytes)")
    bpy.ops.import_scene.gltf(filepath=src)
    meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
    print(f"ARCH IMPORT: {len(meshes)} meshes")
    for o in meshes:
        _activate(o)
        # Bake transforms into the mesh (scene units are meters).
        bpy.ops.object.transform_apply(location=True, rotation=True,
                                       scale=True)
        o.select_set(False)
    _fix(meshes)
    return meshes


def _fix(meshes):
    """Shared production hygiene: normals, micro-bevel, UVs, slots."""
    for o in meshes:
        _activate(o)
        # 1. Clean, outward-consistent normals.
        bpy.ops.object.mode_set(mode="EDIT")
        bpy.ops.mesh.select_all(action="SELECT")
        bpy.ops.mesh.normals_make_consistent(inside=False)
        bpy.ops.object.mode_set(mode="OBJECT")
        # 3. Micro-bevel only where the import has none: angle-limited so
        #    already-beveled faces are untouched. Applied on export.
        if not any(md.type == "BEVEL" for md in o.modifiers):
            mod = o.modifiers.new("EdgeFix", "BEVEL")
            mod.width = BEVEL_WIDTH
            mod.segments = 2
            mod.limit_method = "ANGLE"
            mod.angle_limit = BEVEL_ANGLE
        # 4. UV presence (bake.py repacks into an atlas; the web needs
        #    SOME uv set for aoMap sampling).
        if not o.data.uv_layers:
            try:
                bpy.ops.object.mode_set(mode="EDIT")
                bpy.ops.mesh.select_all(action="SELECT")
                bpy.ops.uv.smart_project(angle_limit=66, island_margin=0.02)
                bpy.ops.object.mode_set(mode="OBJECT")
                print(f"ARCH UV projected: {o.name}")
            except (RuntimeError, TypeError) as e:
                print(f"ARCH UV WARN {o.name}: {e}")
                bpy.ops.object.mode_set(mode="OBJECT")
        # 5. Production material slots — segmentation preserved by name.
        for slot in o.material_slots:
            current = slot.material.name if slot.material else o.name
            fam = _family_material(current)
            if fam is not None:
                slot.material = fam
            else:
                print(f"ARCH SLOT KEEP {o.name}: '{current}' (unknown family)")
        o.select_set(False)
    return meshes


def validate(meshes):
    """Report-only topology audit (never auto-repairs design intent)."""
    import bmesh
    total_nm = 0
    for o in meshes:
        bm = bmesh.new()
        bm.from_mesh(o.data)
        nm = [e for e in bm.edges if not e.is_manifold and not e.is_boundary]
        bnd = [e for e in bm.edges if e.is_boundary]
        bm.free()
        uv = len(o.data.uv_layers)
        print(f"ARCH CHECK {o.name}: nonmanifold={len(nm)} "
              f"boundary={len(bnd)} uv_layers={uv} "
              f"mats={[s.material.name if s.material else '?' for s in o.material_slots]}")
        total_nm += len(nm)
    print(f"ARCH VALIDATE: {len(meshes)} meshes, {total_nm} non-manifold edges")
    return total_nm


def build():
    """Bake/preview entry: import + hygiene only (no export)."""
    return load_source()


def main():
    args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    outdir = args[0] if len(args) > 0 else "public/models"
    source = args[1] if len(args) > 1 else None
    meshes = load_source(source)
    validate(meshes)

    m_floor = materials.preview_floor()
    common.setup_studio(frame_target_loc=(0, 0, 0.04),
                        cam_loc=(-0.55, 0.9, 0.6),
                        floor_size=12.0, floor_mat=m_floor)
    common.render_preview(os.path.join(outdir, "architecture_preview.png"))
    common.remove_studio()
    export_gltf.export_glb(os.path.join(outdir, "architecture.glb"))


if __name__ == "__main__":
    main()
