import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store'

export default function ArchitectureObject() {
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
    const isReceded = selectedCategory && selectedCategory !== 'architecture'

    targetY.current = isActive ? 0.06 : 0
    currentY.current += (targetY.current - currentY.current) * delta * 8
    groupRef.current.position.y = currentY.current

    const targetOpacity = isReceded ? 0.35 : 1
    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const mat = child.material as THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial
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
      position={[0, 0, 0.3]}
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
      <mesh position={[0, 0.01, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.04, 1.4]} />
        <meshStandardMaterial color="#e2e0dc" roughness={0.75} metalness={0.02} />
      </mesh>
      <mesh position={[-0.35, 0.14, -0.15]} castShadow>
        <boxGeometry args={[0.65, 0.2, 0.22]} />
        <meshStandardMaterial color="#e7e7e3" roughness={0.78} />
      </mesh>
      <mesh position={[0.05, 0.22, 0.05]} castShadow>
        <boxGeometry args={[0.28, 0.36, 0.28]} />
        <meshStandardMaterial color="#e5e3df" roughness={0.78} />
      </mesh>
      <mesh position={[0.4, 0.12, 0.15]} castShadow>
        <boxGeometry args={[0.3, 0.16, 0.25]} />
        <meshStandardMaterial color="#eae8e4" roughness={0.78} />
      </mesh>
      <mesh position={[-0.2, 0.1, -0.35]} castShadow>
        <boxGeometry args={[0.25, 0.12, 0.2]} />
        <meshStandardMaterial color="#e8e6e2" roughness={0.78} />
      </mesh>
      <mesh position={[0.05, 0.44, 0.05]} castShadow>
        <boxGeometry args={[0.15, 0.08, 0.15]} />
        <meshStandardMaterial color="#e0deda" roughness={0.78} />
      </mesh>
      <mesh position={[-0.15, 0.13, 0.2]} castShadow>
        <boxGeometry args={[0.22, 0.18, 0.18]} />
        <meshPhysicalMaterial color="#d8e0e4" roughness={0.28} transmission={0.55} thickness={0.5} ior={1.47} transparent opacity={0.65} />
      </mesh>
      <mesh position={[0.25, 0.18, -0.2]} castShadow>
        <boxGeometry args={[0.15, 0.28, 0.12]} />
        <meshPhysicalMaterial color="#e0e4e8" roughness={0.1} transmission={0.85} thickness={0.5} ior={1.49} transparent opacity={0.55} />
      </mesh>
      <mesh position={[-0.3, 0.08, 0.3]} castShadow>
        <boxGeometry args={[0.18, 0.1, 0.16]} />
        <meshStandardMaterial color="#a8c0cc" roughness={0.72} />
      </mesh>
      <mesh position={[0.35, 0.1, -0.1]} castShadow>
        <boxGeometry args={[0.12, 0.12, 0.12]} />
        <meshStandardMaterial color="#c49080" roughness={0.7} />
      </mesh>
      <mesh position={[0.15, 0.08, 0.3]} castShadow>
        <boxGeometry args={[0.14, 0.08, 0.1]} />
        <meshStandardMaterial color="#5a5c5e" roughness={0.65} metalness={0.1} />
      </mesh>
    </group>
  )
}
