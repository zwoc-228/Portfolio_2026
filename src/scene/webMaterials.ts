import * as THREE from 'three'

/**
 * Web materials are the FINAL source of truth for realtime shading.
 * Blender GLBs carry geometry + base colors only (procedural bump does
 * not survive glTF export — verified: 0 embedded textures in all 3 GLBs).
 *
 * Phase-2 rule: NO shared stochastic micro-normal across unrelated
 * families. Each family owns its normal/roughness/specular behaviour:
 *   cloth → own fine textile normal, very low amplitude
 *   board → own even-finer normal, matte chalky
 *   paper → NO normal map (identity from edges/layering/shadow)
 *   floor → directional brushed normal + roughness variation (own generator)
 * CC0 1–2K maps (Poly Haven / ambientCG) are fetched in CI
 * (.github/workflows/assets.yml → vendor/cc0/) — local procedural maps
 * below are the bounded stand-ins, not the final 8K source.
 */

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Tileable value-noise lattice sampler. */
function makeLattice(rand: () => number, n: number) {
  const g: number[][] = []
  for (let y = 0; y <= n; y++) {
    g[y] = []
    for (let x = 0; x <= n; x++) g[y][x] = rand() * 2 - 1
  }
  return g
}

function sampleLattice(
  g: number[][],
  n: number,
  size: number,
  x: number,
  y: number
): number {
  const wx = ((x % size) + size) % size
  const wy = ((y % size) + size) % size
  const fx = (wx / size) * n
  const fy = (wy / size) * n
  const x0 = Math.floor(fx) % n
  const y0 = Math.floor(fy) % n
  const x1 = (x0 + 1) % n
  const y1 = (y0 + 1) % n
  const tx = fx - Math.floor(fx)
  const ty = fy - Math.floor(fy)
  const sx = tx * tx * (3 - 2 * tx)
  const sy = ty * ty * (3 - 2 * ty)
  return (
    g[y0][x0] * (1 - sx) * (1 - sy) +
    g[y0][x1] * sx * (1 - sy) +
    g[y1][x0] * (1 - sx) * sy +
    g[y1][x1] * sx * sy
  )
}

function heightToNormal(
  size: number,
  heightAt: (x: number, y: number) => number,
  strength: number
): THREE.DataTexture {
  const data = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (heightAt(x + 1, y) - heightAt(x - 1, y)) * strength
      const dy = (heightAt(x, y + 1) - heightAt(x, y - 1)) * strength
      const inv = 1 / Math.sqrt(dx * dx + dy * dy + 1)
      const i = (y * size + x) * 4
      data[i] = Math.round((-dx * inv * 0.5 + 0.5) * 255)
      data[i + 1] = Math.round((-dy * inv * 0.5 + 0.5) * 255)
      data[i + 2] = Math.round((inv * 0.5 + 0.5) * 255)
      data[i + 3] = 255
    }
  }
  const tex = new THREE.DataTexture(data, size, size)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.needsUpdate = true
  return tex
}

// ---------------------------------------------------------------------------
// Distinct family textures (cached separately — never shared across families)
// ---------------------------------------------------------------------------

let clothNormal: THREE.DataTexture | null = null
/** Family A: premium bookbinding cloth — very fine textile, matte. */
export function getClothNormal(): THREE.DataTexture {
  if (clothNormal) return clothNormal
  const size = 256
  const rand = mulberry32(7)
  const g1 = makeLattice(rand, 10)
  const g2 = makeLattice(rand, 40)
  const h = (x: number, y: number) =>
    sampleLattice(g1, 10, size, x, y) * 0.6 +
    sampleLattice(g2, 40, size, x, y) * 0.4
  clothNormal = heightToNormal(size, h, 0.28)
  return clothNormal
}

let boardNormal: THREE.DataTexture | null = null
/** Family C: museum model board — chalky matte, even finer than cloth. */
export function getBoardNormal(): THREE.DataTexture {
  if (boardNormal) return boardNormal
  const size = 256
  const rand = mulberry32(21)
  const g1 = makeLattice(rand, 6)
  const g2 = makeLattice(rand, 24)
  const h = (x: number, y: number) =>
    sampleLattice(g1, 6, size, x, y) * 0.6 +
    sampleLattice(g2, 24, size, x, y) * 0.4
  boardNormal = heightToNormal(size, h, 0.18)
  return boardNormal
}

let brushedNormal: THREE.DataTexture | null = null
/**
 * Family: satin/brushed aluminium floor — DIRECTIONAL streaks.
 * Noise is stretched ~60× along U so highlights break into long soft
 * bands instead of isotropic grain. Never reuse for cloth/board/paper.
 */
export function getBrushedNormal(): THREE.DataTexture {
  if (brushedNormal) return brushedNormal
  const size = 512
  const rand = mulberry32(42)
  const g1 = makeLattice(rand, 8)
  const g2 = makeLattice(rand, 48)
  // Stretch: sample y at 1/48th rate → long horizontal grain.
  const h = (x: number, y: number) => {
    const sy = y / 48
    return (
      sampleLattice(g1, 8, size, x, sy) * 0.7 +
      sampleLattice(g2, 48, size, x, sy) * 0.3
    )
  }
  brushedNormal = heightToNormal(size, h, 0.32)
  return brushedNormal
}

let brushedRough: THREE.DataTexture | null = null
/**
 * Floor roughness variation: absolute values ~0.55–0.68 (Uint 140–173).
 * Material.roughness stays 1.0 so the map IS the roughness.
 * Same directional stretch as the normal map.
 */
export function getBrushedRoughness(): THREE.DataTexture {
  if (brushedRough) return brushedRough
  const size = 512
  const rand = mulberry32(99)
  const g1 = makeLattice(rand, 6)
  const g2 = makeLattice(rand, 36)
  const data = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const sy = y / 36
      const n =
        sampleLattice(g1, 6, size, x, sy) * 0.65 +
        sampleLattice(g2, 36, size, x, sy) * 0.35
      const v = Math.max(0, Math.min(255, Math.round(156 + n * 17)))
      const i = (y * size + x) * 4
      data[i] = v
      data[i + 1] = v
      data[i + 2] = v
      data[i + 3] = 255
    }
  }
  const tex = new THREE.DataTexture(data, size, size)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.needsUpdate = true
  brushedRough = tex
  return tex
}

// Deprecated: the old single shared micro-normal. Kept for back-compat
// only (old floor import). New code must use the family getters above.
let microNormal: THREE.DataTexture | null = null
export function getMicroNormal(): THREE.DataTexture {
  if (microNormal) return microNormal
  microNormal = getClothNormal()
  return microNormal
}
// Back-compat alias (linen removed — it banded).
export const getLinenNormal = getMicroNormal

export interface WritingMats {
  cover: THREE.MeshStandardMaterial
  paper: THREE.MeshStandardMaterial
  spine: THREE.MeshStandardMaterial
  ribbon: THREE.MeshStandardMaterial
}

/** Family A + B: Writing notebook (assign per-mesh). */
export function makeWritingMaterials(): WritingMats {
  const cover = new THREE.MeshPhysicalMaterial({
    color: '#e1ddd2',
    roughness: 0.72,
    metalness: 0,
    normalMap: getClothNormal(),
    // Disappears at homepage distance; lives in highlight breakup only.
    normalScale: new THREE.Vector2(0.035, 0.035),
    sheen: 0.3,
    sheenRoughness: 0.85,
    sheenColor: new THREE.Color('#f5f1e8'),
  })
  // Family B paper: NO normal map — identity from edges/layering/shadow.
  const paper = new THREE.MeshStandardMaterial({
    color: '#f1ece3',
    roughness: 0.85,
    metalness: 0,
  })
  const spine = new THREE.MeshPhysicalMaterial({
    color: '#d8d2c5',
    roughness: 0.75,
    metalness: 0,
    normalMap: getClothNormal(),
    normalScale: new THREE.Vector2(0.03, 0.03),
    sheen: 0.15,
    sheenRoughness: 0.85,
    sheenColor: new THREE.Color('#f5f1e8'),
  })
  const ribbon = new THREE.MeshStandardMaterial({
    color: '#b3aa9c',
    roughness: 0.6,
    metalness: 0,
  })
  return { cover, paper, spine, ribbon }
}

/**
 * Family C: architectural model board — warm-neutral chalky matte.
 * Roughness in ASSET_PIPELINE range 0.72–0.82; bevel highlights carry
 * the read, not visible texture.
 */
export function makeModelBoardMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: '#E8E6E1',
    roughness: 0.76,
    metalness: 0,
    normalMap: getBoardNormal(),
    normalScale: new THREE.Vector2(0.025, 0.025),
  })
}

/** Family B: warm paper shared by Writing + Research (no visible texture). */
export function makeResearchPaperMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: '#f1ece3',
    roughness: 0.85,
    metalness: 0,
  })
}

/** Family H: restrained steel — readable highlight, not chrome jewellery. */
export function makeSteelMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: '#c9ced4',
    roughness: 0.32,
    metalness: 1.0,
    envMapIntensity: 1.0,
  })
}

const aoCache = new Map<string, THREE.Texture>()

/** Baked-Blender AO multiply. Async load; material updates when ready. */
export function applyAOMap(
  material: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial,
  url: string,
  intensity = 0.55
): void {
  let tex = aoCache.get(url)
  if (!tex) {
    tex = new THREE.TextureLoader().load(url, () => {
      material.needsUpdate = true
    })
    tex.colorSpace = THREE.NoColorSpace
    aoCache.set(url, tex)
  }
  material.aoMap = tex
  material.aoMapIntensity = intensity
}

/** aoMap samples the second UV set — mirror uv into uv1 (shared ref). */
export function ensureUV1(geometry: THREE.BufferGeometry): void {
  const attrs = geometry.attributes as Record<string, THREE.BufferAttribute>
  if (attrs.uv && !attrs.uv1) {
    geometry.setAttribute('uv1', attrs.uv)
  }
}

/** Base-aware public URL helper. */
export function publicUrl(p: string): string {
  return `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`
}
