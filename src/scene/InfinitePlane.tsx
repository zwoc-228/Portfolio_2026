import { useMemo } from 'react'
import * as THREE from 'three'
import { getBrushedNormal, getBrushedRoughness } from './webMaterials'

/**
 * Infinite display surface — satin / brushed aluminium.
 * Directional grain (own brushed maps, never the shared micro noise),
 * broad soft studio reflection, subtle anisotropy. Matte, never chrome.
 */
export default function InfinitePlane() {
  const material = useMemo(() => {
    const normal = getBrushedNormal().clone()
    normal.wrapS = THREE.RepeatWrapping
    normal.wrapT = THREE.RepeatWrapping
    // Large tiles → streaks read at desk scale, no visible tiling.
    normal.repeat.set(18, 18)
    normal.needsUpdate = true

    const rough = getBrushedRoughness().clone()
    rough.wrapS = THREE.RepeatWrapping
    rough.wrapT = THREE.RepeatWrapping
    rough.repeat.set(18, 18)
    rough.needsUpdate = true

    const mat = new THREE.MeshPhysicalMaterial({
      color: '#cbd0d4',
      metalness: 0.85,
      // Absolute roughness lives in the map (~0.38–0.54, satin).
      roughness: 1.0,
      roughnessMap: rough,
      normalMap: normal,
      normalScale: new THREE.Vector2(0.04, 0.04),
      envMapIntensity: 1.35,
    })
    // Subtle directional response where the renderer supports it (r155+).
    try {
      mat.anisotropy = 0.5
      mat.anisotropyRotation = 0
    } catch {
      /* older pipeline — maps + studio still carry the read */
    }
    return mat
  }, [])

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        material={material}
        receiveShadow
      >
        <planeGeometry args={[60, 60]} />
      </mesh>
    </group>
  )
}
