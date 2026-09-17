import { useRef, useState, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../store'

// Real-world meters (Blender) -> homepage scene units.
export const METERS_TO_SCENE = 5.4

// Base-aware URL: dev serves at /, Pages serves at /Portfolio_2026/.
const MODEL_URL = `${import.meta.env.BASE_URL}models/writing.glb`

function WritingModel() {
  const { scene } = useGLTF(MODEL_URL)
  return <primitive object={scene} />
}

export default function WritingObject() {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const selectedCategory = useStore((s) => s.selectedCategory)
  const setHoveredStore = useStore((s) => s.setHovered)
  const setSelectedCategory = useStore((s) => s.setSelectedCategory)

  const targetY = useRef(0)
  const currentY = useRef(0)

  useFrame((_, delta) => {
    if (!groupRef.current) return

    const isActive = hovered && !selectedCategory
    const isReceded = selectedCategory && selectedCategory !== 'writing'

    targetY.current = isActive ? 0.06 : 0
    currentY.current += (targetY.current - currentY.current) * delta * 8
    groupRef.current.position.y = currentY.current

    const targetOpacity = isReceded ? 0.35 : 1
    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material]
        materials.forEach((m) => {
          const mat = m as THREE.MeshStandardMaterial
          if (mat.opacity !== undefined) {
            mat.opacity += (targetOpacity - mat.opacity) * delta * 4
            mat.transparent = true
          }
        })
      }
    })
  })

  return (
    <group
      ref={groupRef}
      position={[-1.6, 0, 0.5]}
      rotation={[0, 0.15, 0]}
      scale={METERS_TO_SCENE}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        setHoveredStore('writing')
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        setHoveredStore(null)
        document.body.style.cursor = 'default'
      }}
      onClick={(e) => {
        e.stopPropagation()
        if (!selectedCategory) setSelectedCategory('writing')
      }}
    >
      <Suspense fallback={null}>
        <WritingModel />
      </Suspense>
    </group>
  )
}

useGLTF.preload(MODEL_URL)
