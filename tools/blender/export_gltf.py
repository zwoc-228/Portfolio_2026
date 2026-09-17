"""Shared GLB export for the homepage asset pipeline (headless CI).

Single source of export settings so every builder ships identical GLBs:
apply transforms + modifiers, +Y up, materials exported, no cameras,
no lights, NO Draco (R3F's default GLTFLoader has no DRACO decoder —
Meshopt via glTF Transform happens after export, in CI).
"""
import os

import bpy


def export_glb(path: str) -> str:
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=os.path.abspath(path),
        export_format="GLB",
        export_apply=True,
        export_yup=True,
        export_materials="EXPORT",
        export_cameras=False,
        export_lights=False,
        export_draco_mesh_compression_enable=False,
    )
    print(f"EXPORTED: {path} ({os.path.getsize(path)} bytes)")
    return os.path.abspath(path)
