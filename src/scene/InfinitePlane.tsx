import { useMemo } from 'react'
import * as THREE from 'three'
import { getMicroNormal } from './webMaterials'

export default function InfinitePlane() {
  // Extremely weak brushed micro-normal: 60-unit plane repeats the 256px
  // map 60x so features land at ~cm scale. No visible tiling at distance.
  const brushed = useMemo(() => {
    const tex = getMicroNormal().clone()
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(60, 60)
    tex.needsUpdate = true
    return tex
  }, [])

  return (
    <group>
      {/* Main floor - matte brushed aluminum */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.5, 0]}
        receiveShadow
      >
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial
          color="#cfd2d4"
          metalness={0.84}
          roughness={0.48}
          envMapIntensity={2.6}
          normalMap={brushed}
          normalScale={new THREE.Vector2(0.03, 0.03)}
        />
      </mesh>
    </group>
  )
}
