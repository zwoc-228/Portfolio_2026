import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store'

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
        const mat = child.material as THREE.MeshStandardMaterial
        if (mat.opacity !== undefined) {
          mat.opacity += (targetOpacity - mat.opacity) * delta * 4
          mat.transparent = true
        }
      }
    })
  })

  return (
    <group
      ref={groupRef}
      position={[-2.2, 0, 0.5]}
      rotation={[0, 0.15, 0]}
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
      <mesh position={[0, 0.08, 0]} castShadow>
        <boxGeometry args={[1.1, 0.06, 1.5]} />
        <meshStandardMaterial color="#e8e4de" roughness={0.78} metalness={0} />
      </mesh>
      <mesh position={[0, 0.04, 0]} castShadow>
        <boxGeometry args={[1.06, 0.06, 1.46]} />
        <meshStandardMaterial color="#f5f3ef" roughness={0.9} metalness={0} />
      </mesh>
      <mesh position={[0, 0.01, 0]} castShadow>
        <boxGeometry args={[1.1, 0.02, 1.5]} />
        <meshStandardMaterial color="#e0dcd6" roughness={0.82} metalness={0} />
      </mesh>
      <mesh position={[-0.55, 0.05, 0]} castShadow>
        <boxGeometry args={[0.02, 0.1, 1.5]} />
        <meshStandardMaterial color="#d8d4ce" roughness={0.75} metalness={0.05} />
      </mesh>
      <mesh position={[0.2, 0.12, 0.75]} castShadow>
        <boxGeometry args={[0.02, 0.005, 0.2]} />
        <meshStandardMaterial color="#c0b8b0" roughness={0.6} metalness={0} />
      </mesh>
    </group>
  )
}
