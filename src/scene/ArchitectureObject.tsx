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
      {/* Base platform — thin, wide */}
      <mesh position={[0, 0.01, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.9, 0.025, 1.5]} />
        <meshStandardMaterial color="#e4e2de" roughness={0.72} metalness={0.02} />
      </mesh>

      {/* Tall tower — back left, narrow vertical */}
      <mesh position={[-0.4, 0.28, -0.2]} castShadow>
        <boxGeometry args={[0.22, 0.48, 0.2]} />
        <meshStandardMaterial color="#e8e6e2" roughness={0.78} metalness={0} />
      </mesh>

      {/* Long horizontal slab — spanning element */}
      <mesh position={[0.1, 0.14, 0.05]} castShadow>
        <boxGeometry args={[0.9, 0.03, 0.28]} />
        <meshStandardMaterial color="#e5e3df" roughness={0.76} metalness={0} />
      </mesh>

      {/* Medium block — center mass */}
      <mesh position={[0.05, 0.2, 0.1]} castShadow>
        <boxGeometry args={[0.3, 0.28, 0.26]} />
        <meshStandardMaterial color="#eae8e4" roughness={0.78} metalness={0} />
      </mesh>

      {/* Thin vertical wall — right accent */}
      <mesh position={[0.45, 0.15, -0.1]} castShadow>
        <boxGeometry args={[0.04, 0.24, 0.32]} />
        <meshStandardMaterial color="#e2e0dc" roughness={0.75} metalness={0} />
      </mesh>

      {/* Clear acrylic volume — front left, transmissive */}
      <mesh position={[-0.2, 0.12, 0.25]} castShadow>
        <boxGeometry args={[0.24, 0.18, 0.2]} />
        <meshPhysicalMaterial
          color="#dce4e8"
          roughness={0.08}
          transmission={0.88}
          thickness={0.6}
          ior={1.49}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Frosted acrylic — right side, partially transmissive */}
      <mesh position={[0.3, 0.16, 0.18]} castShadow>
        <boxGeometry args={[0.18, 0.24, 0.16]} />
        <meshPhysicalMaterial
          color="#e0e4e8"
          roughness={0.25}
          transmission={0.6}
          thickness={0.5}
          ior={1.47}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Muted blue accent — small piece */}
      <mesh position={[-0.3, 0.08, 0.32]} castShadow>
        <boxGeometry args={[0.16, 0.08, 0.14]} />
        <meshStandardMaterial color="#9cb8c8" roughness={0.72} metalness={0} />
      </mesh>

      {/* Terracotta accent — warm tone */}
      <mesh position={[0.35, 0.07, -0.25]} castShadow>
        <boxGeometry args={[0.12, 0.08, 0.1]} />
        <meshStandardMaterial color="#c49080" roughness={0.68} metalness={0} />
      </mesh>

      {/* Charcoal accent — dark anchor */}
      <mesh position={[0.15, 0.06, -0.3]} castShadow>
        <boxGeometry args={[0.1, 0.06, 0.1]} />
        <meshStandardMaterial color="#5a5c5e" roughness={0.62} metalness={0.08} />
      </mesh>
    </group>
  )
}
