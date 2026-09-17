"""Physically based materials for the portfolio asset pipeline.

Subtle by design: no obvious procedural noise, microscopic bump only.
All colors are linear-friendly sRGB hex -> RGBA tuples.

Blender 4.x Principled BSDF socket names are guarded so the same code
runs across 4.0-4.5 (Transmission Weight vs Transmission).
"""
import bpy


def _rgba(hex_str, alpha=1.0):
    h = hex_str.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) / 255.0 for i in (0, 2, 4))
    return (r, g, b, alpha)


def _principled(name):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    return mat, bsdf


def _set(bsdf, key, value):
    if key in bsdf.inputs:
        try:
            bsdf.inputs[key].default_value = value
        except (TypeError, AttributeError):
            pass


def _micro_bump(mat, bsdf, scale, strength):
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    tex = nodes.new("ShaderNodeTexNoise")
    tex.inputs["Scale"].default_value = scale
    tex.inputs["Detail"].default_value = 2.0
    tex.inputs["Roughness"].default_value = 0.7
    bump = nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = strength
    bump.inputs["Distance"].default_value = 0.0004
    links.new(tex.outputs["Fac"], bump.inputs["Height"])
    links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])


def paper():
    mat, bsdf = _principled("Paper")
    _set(bsdf, "Base Color", _rgba("#F5F1E8"))
    _set(bsdf, "Roughness", 0.90)
    _set(bsdf, "Metallic", 0.0)
    _set(bsdf, "Specular IOR Level", 0.4)
    _micro_bump(mat, bsdf, scale=900.0, strength=0.015)
    return mat


def book_cover():
    mat, bsdf = _principled("BookCover")
    _set(bsdf, "Base Color", _rgba("#DBD5C7"))
    _set(bsdf, "Roughness", 0.70)
    _set(bsdf, "Metallic", 0.0)
    _set(bsdf, "Specular IOR Level", 0.45)
    # Cloth grazing sheen (guarded: no-op where sockets absent).
    _set(bsdf, "Sheen Weight", 0.4)
    _set(bsdf, "Sheen Roughness", 0.55)
    _micro_bump(mat, bsdf, scale=320.0, strength=0.02)
    return mat


def book_spine():
    mat, bsdf = _principled("BookSpine")
    _set(bsdf, "Base Color", _rgba("#DAD4C8"))
    _set(bsdf, "Roughness", 0.72)
    _set(bsdf, "Metallic", 0.0)
    _micro_bump(mat, bsdf, scale=320.0, strength=0.02)
    return mat


def ribbon():
    mat, bsdf = _principled("Ribbon")
    _set(bsdf, "Base Color", _rgba("#B9B0A4"))
    _set(bsdf, "Roughness", 0.55)
    _set(bsdf, "Metallic", 0.0)
    return mat


def model_board():
    mat, bsdf = _principled("ModelBoard")
    _set(bsdf, "Base Color", _rgba("#E9E7E2"))
    _set(bsdf, "Roughness", 0.78)
    _set(bsdf, "Metallic", 0.0)
    _set(bsdf, "Specular IOR Level", 0.4)
    _micro_bump(mat, bsdf, scale=500.0, strength=0.015)
    return mat


def clear_acrylic():
    mat, bsdf = _principled("ClearAcrylic")
    _set(bsdf, "Base Color", _rgba("#DDE6EA"))
    _set(bsdf, "Roughness", 0.06)
    _set(bsdf, "Metallic", 0.0)
    _set(bsdf, "IOR", 1.49)
    _set(bsdf, "Transmission Weight", 0.95)
    _set(bsdf, "Transmission", 0.95)
    _set(bsdf, "Thickness", 0.05)
    return mat


def frosted_acrylic():
    mat, bsdf = _principled("FrostedAcrylic")
    _set(bsdf, "Base Color", _rgba("#E2E6E9"))
    _set(bsdf, "Roughness", 0.32)
    _set(bsdf, "Metallic", 0.0)
    _set(bsdf, "IOR", 1.47)
    _set(bsdf, "Transmission Weight", 0.7)
    _set(bsdf, "Transmission", 0.7)
    _set(bsdf, "Thickness", 0.04)
    return mat


def smoked_acrylic():
    """Dense premium smoked acrylic: transparent, never opaque black
    plastic. Web layer refines attenuation per asset."""
    mat, bsdf = _principled("SmokedAcrylic")
    _set(bsdf, "Base Color", _rgba("#4A5055"))
    _set(bsdf, "Roughness", 0.18)
    _set(bsdf, "Metallic", 0.0)
    _set(bsdf, "IOR", 1.49)
    _set(bsdf, "Transmission Weight", 0.55)
    _set(bsdf, "Transmission", 0.55)
    _set(bsdf, "Thickness", 0.05)
    return mat


def brushed_aluminum():
    """Lookdev floor: light satin aluminium (never chrome, never grey paint).

    Reads via a large soft specular — needs the high-key area rig
    (master), not exposure. Roughness ~0.38 keeps the left softbox as a
    broad band instead of washing it out."""
    mat, bsdf = _principled("BrushedAluminum")
    _set(bsdf, "Base Color", _rgba("#D6DBE0"))
    _set(bsdf, "Metallic", 1.0)
    _set(bsdf, "Roughness", 0.32)
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    # Fine directional brushing: stretched noise -> bump + slight roughness var.
    tex = nodes.new("ShaderNodeTexNoise")
    tex.inputs["Scale"].default_value = 18.0
    tex.inputs["Detail"].default_value = 3.0
    mapping = nodes.new("ShaderNodeMapping")
    mapping.inputs["Scale"].default_value = (1.0, 60.0, 1.0)
    links.new(mapping.outputs["Vector"], tex.inputs["Vector"])
    bump = nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.02
    bump.inputs["Distance"].default_value = 0.0002
    links.new(tex.outputs["Fac"], bump.inputs["Height"])
    links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    return mat


def steel():
    mat, bsdf = _principled("Steel")
    _set(bsdf, "Base Color", _rgba("#C6CACF"))
    _set(bsdf, "Metallic", 1.0)
    _set(bsdf, "Roughness", 0.22)
    return mat


def preview_floor():
    """PREVIEW-ONLY floor for validation renders (not shipped).

    Real brushed_aluminum() goes fully dark without a strong studio env;
    this lighter variant approximates the reference's light-aluminum read
    so geometry/materials can be judged. R3F uses its own floor.
    """
    mat, bsdf = _principled("PreviewFloor")
    _set(bsdf, "Base Color", _rgba("#CFD4D9"))
    _set(bsdf, "Metallic", 0.85)
    _set(bsdf, "Roughness", 0.5)
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    tex = nodes.new("ShaderNodeTexNoise")
    tex.inputs["Scale"].default_value = 18.0
    tex.inputs["Detail"].default_value = 3.0
    mapping = nodes.new("ShaderNodeMapping")
    mapping.inputs["Scale"].default_value = (1.0, 60.0, 1.0)
    links.new(mapping.outputs["Vector"], tex.inputs["Vector"])
    bump = nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.03
    bump.inputs["Distance"].default_value = 0.0002
    links.new(tex.outputs["Fac"], bump.inputs["Height"])
    links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    return mat


def accent_blue():
    mat, bsdf = _principled("AccentBlue")
    _set(bsdf, "Base Color", _rgba("#9CB8C8"))
    _set(bsdf, "Roughness", 0.72)
    return mat


def accent_terracotta():
    mat, bsdf = _principled("AccentTerracotta")
    _set(bsdf, "Base Color", _rgba("#C49080"))
    _set(bsdf, "Roughness", 0.68)
    return mat


def accent_charcoal():
    mat, bsdf = _principled("AccentCharcoal")
    _set(bsdf, "Base Color", _rgba("#5A5C5E"))
    _set(bsdf, "Roughness", 0.62)
    _set(bsdf, "Metallic", 0.08)
    return mat
