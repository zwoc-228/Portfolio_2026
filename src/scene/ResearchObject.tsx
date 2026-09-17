import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store'

export default function ResearchObject() {
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
    const isReceded = selectedCategory && selectedCategory !== 'research'

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
      position={[2.2, 0, 0.5]}
      rotation={[0, -0.12, 0]}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        setHoveredStore('research')
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        setHoveredStore(null)
        document.body.style.cursor = 'default'
      }}
      onClick={(e) => {
        e.stopPropagation()
        if (!selectedCategory) setSelectedCategory('research')
      }}
    >
      <mesh position={[0, 0.005, 0]} castShadow>
        <boxGeometry args={[1.0, 0.008, 1.3]} />
        <meshStandardMaterial color="#f0eeea" roughness={0.92} metalness={0} />
      </mesh>
      {[0.015, 0.025, 0.035, 0.045, 0.055, 0.065, 0.075].map((y, i) => (
        <mesh
          key={i}
          position={[(i % 2 === 0 ? 0.01 : -0.01), y, (i % 3 === 0 ? 0.015 : i % 3 === 1 ? -0.01 : 0)]}
          castShadow
        >
          <boxGeometry args={[0.98 - i * 0.005, 0.006, 1.28 - i * 0.005]} />
          <meshStandardMaterial color={i < 5 ? '#f2f0ec' : '#eae8e4'} roughness={0.9} metalness={0} />
        </mesh>
      ))}
      <mesh position={[0.02, 0.085, -0.01]} rotation={[0, 0.02, 0]} castShadow>
        <boxGeometry args={[0.95, 0.005, 1.25]} />
        <meshStandardMaterial color="#f5f3ef" roughness={0.88} metalness={0} />
      </mesh>
      <group position={[0.35, 0.095, -0.45]} rotation={[0, 0.3, 0]}>
        <mesh castShadow>
          <torusGeometry args={[0.04, 0.004, 8, 20, Math.PI * 1.5]} />
          <meshStandardMaterial color="#b8bcc0" roughness={0.3} metalness={0.85} />
        </mesh>
        <mesh position={[0, -0.015, 0]} castShadow>
          <torusGeometry args={[0.025, 0.003, 8, 20, Math.PI * 1.5]} />
          <meshStandardMaterial color="#c0c4c8" roughness={0.3} metalness={0.85} />
        </mesh>
      </group>
    </group>
  )
}
