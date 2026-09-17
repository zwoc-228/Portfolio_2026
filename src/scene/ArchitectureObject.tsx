import { useRef, useState, Suspense, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../store'
import { METERS_TO_SCENE } from './WritingObject'

// Base-aware URL: dev serves at /, Pages serves at /Portfolio_2026/.
const MODEL_URL = `${import.meta.env.BASE_URL}models/architecture.glb`

function ArchitectureModel({ fadeMats }: { fadeMats: React.MutableRefObject<THREE.Material[]> }) {
  const { scene } = useGLTF(MODEL_URL)

  useEffect(() => {
    // GLB materials were authored in Blender per ASSET_PIPELINE.md
    // (model board, clear/frosted acrylic with real transmission, accents).
    // Keep them; only set shadow flags and collect fade targets once.
    const seen = new Set<THREE.Material>()
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return
      child.castShadow = true
      child.receiveShadow = true
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      materials.forEach((m) => {
        if (!seen.has(m)) {
          seen.add(m)
          fadeMats.current.push(m)
        }
      })
    })
    return () => {
      fadeMats.current = []
    }
  }, [scene, fadeMats])

  return <primitive object={scene} />
}

export default function ArchitectureObject() {
  const groupRef = useRef<THREE.Group>(null)
  const fadeMats = useRef<THREE.Material[]>([])
  const [hovered, setHovered] = useState(false)
  const selectedCategory = useStore((s) => s.selectedCategory)
  const setHoveredStore = useStore((s) => s.setHovered)
  const setSelectedCategory = useStore((s) => s.setSelectedCategory)

  const targetY = useRef(0)
  const currentY = useRef(0)

  useFrame((_, delta) => {
    if (!groupRef.current) return

    const isActive = hovered && !selectedCategory
    const isReceded = selectedCategory && selectedCategory !== 'architecture'

    targetY.current = isActive ? 0.06 : 0
    currentY.current += (targetY.current - currentY.current) * delta * 8
    groupRef.current.position.y = currentY.current

    const targetOpacity = isReceded ? 0.35 : 1
    for (const m of fadeMats.current) {
      const mat = m as THREE.MeshStandardMaterial
      mat.opacity += (targetOpacity - mat.opacity) * delta * 4
      mat.transparent = true
    }
  })

  return (
    <group
      ref={groupRef}
      position={[0, 0, 0.3]}
      scale={METERS_TO_SCENE}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        setHoveredStore('architecture')
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        setHoveredStore(null)
        document.body.style.cursor = 'default'
      }}
      onClick={(e) => {
        e.stopPropagation()
        if (!selectedCategory) setSelectedCategory('architecture')
      }}
    >
      <Suspense fallback={null}>
        <ArchitectureModel fadeMats={fadeMats} />
      </Suspense>
    </group>
  )
}

useGLTF.preload(MODEL_URL)
