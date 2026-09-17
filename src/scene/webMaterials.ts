import * as THREE from 'three'

/**
 * Web materials are the FINAL source of truth for realtime shading.
 * Blender GLBs carry geometry + base colors only (procedural bump does
 * not survive glTF export — verified: 0 textures in writing.glb).
 * Values follow ASSET_PIPELINE.md ranges.
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

let microNormal: THREE.DataTexture | null = null

/**
 * Genuinely stochastic multi-scale micro-normal. Value noise on two
 * octaves (no sine/grid anywhere, so no banding or moiré), deterministic
 * seed. Affects highlights only at normal viewing distance.
 */
export function getMicroNormal(): THREE.DataTexture {
  if (microNormal) return microNormal
  const size = 256
  const rand = mulberry32(7)
  const lattice = (n: number) => {
    const g: number[][] = []
    for (let y = 0; y <= n; y++) {
      g[y] = []
      for (let x = 0; x <= n; x++) g[y][x] = rand() * 2 - 1
    }
    return g
  }
  // Tileable lattices: wrap indices.
  const g1 = lattice(8)
  const g2 = lattice(32)
  const at = (g: number[][], n: number, x: number, y: number) => {
    // Wrap query coords (JS % keeps the sign of negatives).
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
  const data = new Uint8Array(size * size * 4)
  const strength = 0.55
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const h = (xx: number, yy: number) =>
        at(g1, 8, xx, yy) * 0.65 + at(g2, 32, xx, yy) * 0.35
      const dx = (h(x + 1, y) - h(x - 1, y)) * strength
      const dy = (h(x, y + 1) - h(x, y - 1)) * strength
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
  microNormal = tex
  return tex
}

// Back-compat alias (linen removed — it banded).
export const getLinenNormal = getMicroNormal;

export interface WritingMats {
  cover: THREE.MeshStandardMaterial
  paper: THREE.MeshStandardMaterial
  spine: THREE.MeshStandardMaterial
  ribbon: THREE.MeshStandardMaterial
}

/** Fresh override materials for the Writing notebook (assign per-mesh). */
export function makeWritingMaterials(): WritingMats {
  const micro = getMicroNormal()
  const cover = new THREE.MeshPhysicalMaterial({
    color: '#e0dcd3',
    roughness: 0.8,
    metalness: 0,
    normalMap: micro,
    normalScale: new THREE.Vector2(0.06, 0.06),
    sheen: 0.2,
    sheenRoughness: 0.8,
    sheenColor: new THREE.Color('#f5f1e8'),
  })
  // Paper: same family as cover but lighter/warmer, NO visible texture.
  const paper = new THREE.MeshStandardMaterial({
    color: '#f0ebe2',
    roughness: 0.92,
    metalness: 0,
  })
  const spine = new THREE.MeshPhysicalMaterial({
    color: '#d9d3c6',
    roughness: 0.72,
    metalness: 0,
    normalMap: micro,
    normalScale: new THREE.Vector2(0.05, 0.05),
    sheen: 0.15,
    sheenRoughness: 0.8,
    sheenColor: new THREE.Color('#f5f1e8'),
  })
  const ribbon = new THREE.MeshStandardMaterial({
    color: '#b3aa9c',
    roughness: 0.55,
    metalness: 0,
  })
  return { cover, paper, spine, ribbon }
}

/** Architectural model-board: neutral warm plaster, lower roughness so
 * micro-beveled edges catch controlled highlights. */
export function makeModelBoardMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: '#E7E5DE',
    roughness: 0.7,
    metalness: 0,
    normalMap: getMicroNormal(),
    normalScale: new THREE.Vector2(0.04, 0.04),
  })
}

/** Warm paper shared by Writing + Research (no visible texture). */
export function makeResearchPaperMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: '#f0ebe2',
    roughness: 0.92,
    metalness: 0,
  })
}

/** Restrained steel: readable highlight, not chrome jewelry. */
export function makeSteelMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: '#c9ced4',
    roughness: 0.3,
    metalness: 1.0,
    envMapIntensity: 1.2,
  })
}
