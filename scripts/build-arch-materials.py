from pathlib import Path
from PIL import Image, ImageFilter
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'dist' / 'assets'
SRC = Path('/mnt/data/new_materials')


def load_rgb(path):
    return np.asarray(Image.open(path).convert('RGB'), dtype=np.float32) / 255.0

def load_gray(path):
    return np.asarray(Image.open(path).convert('L'), dtype=np.float32) / 255.0

def srgb_save(arr, path, quality=91):
    arr = np.clip(arr * 255.0 + 0.5, 0, 255).astype(np.uint8)
    Image.fromarray(arr, 'RGB').save(path, quality=quality, optimize=True, progressive=True, subsampling=0)

def gray_save(arr, path, quality=91):
    arr = np.clip(arr * 255.0 + 0.5, 0, 255).astype(np.uint8)
    Image.fromarray(arr, 'L').save(path, quality=quality, optimize=True, progressive=True)

def remap_roughness(src, lo, hi):
    q05, q95 = np.quantile(src, [0.05, 0.95])
    if q95 <= q05 + 1e-6:
        return np.full_like(src, (lo + hi) * 0.5)
    t = np.clip((src - q05) / (q95 - q05), 0, 1)
    # smoothstep avoids abrupt clipped bands in glancing highlights
    t = t * t * (3 - 2 * t)
    return lo + (hi - lo) * t

def bake_normal(normal_path, displacement_path, normal_gain, disp_gain, blur_radius=1.1):
    n = load_rgb(normal_path)
    # decode tangent-space X/Y from OpenGL normal map
    xy = n[..., :2] * 2.0 - 1.0
    xy *= normal_gain

    disp_img = Image.open(displacement_path).convert('L').filter(ImageFilter.GaussianBlur(radius=blur_radius))
    d = np.asarray(disp_img, dtype=np.float32) / 255.0
    gy, gx = np.gradient(d)
    # Bake displacement into the normal map offline: same runtime sampler count, more surface read.
    x = xy[..., 0] - gx * disp_gain
    y = xy[..., 1] - gy * disp_gain
    z = np.ones_like(x)
    length = np.sqrt(x * x + y * y + z * z)
    packed = np.stack((x / length, y / length, z / length), axis=-1)
    return packed * 0.5 + 0.5

# Marble021 -> light architectural mineral / polished stone.
marble = SRC / 'marble'
marble_color = load_rgb(marble / 'Marble021_1K-JPG_Color.jpg')
# Keep the warm veining, but prevent the white model from blowing out under the brighter desk lighting.
marble_color = np.clip((marble_color - 0.5) * 0.96 + 0.5, 0, 1)
srgb_save(marble_color, OUT / 'arch-marble-color.jpg')
marble_rough = remap_roughness(load_gray(marble / 'Marble021_1K-JPG_Roughness.jpg'), 0.56, 0.80)
gray_save(marble_rough, OUT / 'arch-marble-rough.jpg')
marble_normal = bake_normal(
    marble / 'Marble021_1K-JPG_NormalGL.jpg',
    marble / 'Marble021_1K-JPG_Displacement.jpg',
    normal_gain=2.5,
    disp_gain=0.72,
    blur_radius=1.15,
)
srgb_save(marble_normal, OUT / 'arch-marble-normal.jpg', quality=93)

# Metal044A -> graphite/silver metal volume. Metalness is essentially 1.0 in the source,
# so keep it as a scalar at runtime rather than paying for a metalness texture lookup.
metal = SRC / 'metal'
metal_color = load_rgb(metal / 'Metal044A_1K-JPG_Color.jpg')
# Preserve subtle cold/warm variation while avoiding a mirror-white result after material tinting.
metal_color = np.clip((metal_color - 0.5) * 1.10 + 0.5, 0, 1)
srgb_save(metal_color, OUT / 'arch-metal-color.jpg')
metal_rough = remap_roughness(load_gray(metal / 'Metal044A_1K-JPG_Roughness.jpg'), 0.46, 0.68)
gray_save(metal_rough, OUT / 'arch-metal-rough.jpg')
metal_normal = bake_normal(
    metal / 'Metal044A_1K-JPG_NormalGL.jpg',
    metal / 'Metal044A_1K-JPG_Displacement.jpg',
    normal_gain=3.2,
    disp_gain=1.55,
    blur_radius=1.0,
)
srgb_save(metal_normal, OUT / 'arch-metal-normal.jpg', quality=93)

# Plastic013A -> frosted acrylic roughness only. Color and micro-normal statistics are folded
# into scalar material parameters, so the transparent shader gains no additional map slots.
plastic = SRC / 'plastic'
plastic_rough = remap_roughness(load_gray(plastic / 'Plastic013A_1K-JPG_Roughness.jpg'), 0.50, 0.72)
gray_save(plastic_rough, OUT / 'arch-plastic-rough.jpg')

# Report source averages used for scalar parameters.
plastic_color = load_rgb(plastic / 'Plastic013A_1K-JPG_Color.jpg').mean(axis=(0,1))
print('plastic_average_srgb=', [round(float(v), 5) for v in plastic_color])
print('generated:', *(p.name for p in sorted(OUT.glob('arch-*.jpg'))), sep='\n  ')
