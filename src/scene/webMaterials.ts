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

let linenNormal: THREE.DataTexture | null = null

/** Deterministic 256px woven micro-normal. Subtle by design. */
export function getLinenNormal(): THREE.DataTexture {
  if (linenNormal) return linenNormal
  const size = 256
  const data = new Uint8Array(size * size * 4)
  const rand = mulberry32(7)
  const noise: number[][] = []
  for (let y = 0; y < size; y++) {
    noise[y] = []
    for (let x = 0; x < size; x++) {
      const weave =
        Math.sin((x / size) * Math.PI * 2 * 48) * 0.5 +
        Math.sin((y / size) * Math.PI * 2 * 48) * 0.5
      noise[y][x] = weave * 0.35 + (rand() - 0.5) * 0.3
    }
  }
  const strength = 1.6
  const h = (x: number, y: number) =>
    noise[(y + size) % size][(x + size) % size]
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
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
  linenNormal = tex
  return tex
}

export interface WritingMats {
  cover: THREE.MeshStandardMaterial
  paper: THREE.MeshStandardMaterial
  spine: THREE.MeshStandardMaterial
  ribbon: THREE.MeshStandardMaterial
}

/** Fresh override materials for the Writing notebook (assign per-mesh). */
export function makeWritingMaterials(): WritingMats {
  const linen = getLinenNormal()
  const cover = new THREE.MeshStandardMaterial({
    color: '#e3ded4',
    roughness: 0.8,
    metalness: 0,
    normalMap: linen,
    normalScale: new THREE.Vector2(0.12, 0.12),
  })
  const paper = new THREE.MeshStandardMaterial({
    color: '#f2eee5',
    roughness: 0.9,
    metalness: 0,
    normalMap: linen,
    normalScale: new THREE.Vector2(0.05, 0.05),
  })
  const spine = new THREE.MeshStandardMaterial({
    color: '#d9d3c6',
    roughness: 0.72,
    metalness: 0,
    normalMap: linen,
    normalScale: new THREE.Vector2(0.1, 0.1),
  })
  const ribbon = new THREE.MeshStandardMaterial({
    color: '#b3aa9c',
    roughness: 0.55,
    metalness: 0,
  })
  return { cover, paper, spine, ribbon }
}
