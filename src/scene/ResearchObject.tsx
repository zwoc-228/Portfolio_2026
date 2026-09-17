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

  const sheets = [
    { y: 0.005, x: 0, z: 0, w: 1.0, d: 1.3 },
    { y: 0.012, x: 0.008, z: -0.005, w: 0.99, d: 1.29 },
    { y: 0.019, x: -0.005, z: 0.008, w: 0.985, d: 1.285 },
    { y: 0.026, x: 0.006, z: -0.003, w: 0.98, d: 1.28 },
    { y: 0.033, x: -0.003, z: 0.006, w: 0.975, d: 1.275 },
    { y: 0.04, x: 0.004, z: -0.007, w: 0.97, d: 1.27 },
    { y: 0.047, x: -0.006, z: 0.004, w: 0.965, d: 1.265 },
    { y: 0.054, x: 0.003, z: -0.004, w: 0.96, d: 1.26 },
    { y: 0.061, x: -0.004, z: 0.005, w: 0.955, d: 1.255 },
  ]

  return (
    <group
      ref={groupRef}
      position={[1.6, 0, 0.5]}
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
      {/* Individual paper sheets with offsets */}
      {sheets.map((sheet, i) => (
        <mesh
          key={i}
          position={[sheet.x, sheet.y, sheet.z]}
          castShadow
        >
          <boxGeometry args={[sheet.w, 0.005, sheet.d]} />
          <meshStandardMaterial
            color={i < 5 ? '#f2f0ec' : '#eae8e4'}
            roughness={0.92}
            metalness={0}
          />
        </mesh>
      ))}

      {/* Top sheet — slightly larger, clean white */}
      <mesh position={[0.01, 0.068, -0.01]} rotation={[0, 0.015, 0]} castShadow>
        <boxGeometry args={[0.94, 0.004, 1.24]} />
        <meshStandardMaterial color="#f5f3ef" roughness={0.88} metalness={0} />
      </mesh>

      {/* Paper clip — metal torus geometry */}
      <group position={[0.38, 0.078, -0.42]} rotation={[0, 0.3, 0]}>
        {/* Outer clip arm */}
        <mesh castShadow>
          <torusGeometry args={[0.038, 0.003, 8, 24, Math.PI * 1.5]} />
          <meshStandardMaterial color="#c8ccd2" roughness={0.2} metalness={0.9} />
        </mesh>
        {/* Inner clip arm */}
        <mesh position={[0, -0.012, 0]} castShadow>
          <torusGeometry args={[0.024, 0.0025, 8, 24, Math.PI * 1.5]} />
          <meshStandardMaterial color="#d0d4da" roughness={0.22} metalness={0.88} />
        </mesh>
        {/* Clip bridge */}
        <mesh position={[0.038, -0.006, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <boxGeometry args={[0.012, 0.003, 0.003]} />
          <meshStandardMaterial color="#c0c4ca" roughness={0.25} metalness={0.85} />
        </mesh>
      </group>
    </group>
  )
}
