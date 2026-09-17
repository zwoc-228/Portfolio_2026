import { Text } from '@react-three/drei'
import { useStore } from '../store'
import { useState } from 'react'
import { useFrame } from '@react-three/fiber'

interface LabelProps {
  text: string
  number: string
  position: [number, number, number]
  rotation: [number, number, number]
  category: 'writing' | 'architecture' | 'research'
}

function WorldLabel({ text, number, position, rotation, category }: LabelProps) {
  const selectedCategory = useStore((s) => s.selectedCategory)
  const hoveredObject = useStore((s) => s.hoveredObject)
  const [opacity, setOpacity] = useState(0.6)

  useFrame((_, delta) => {
    const isReceded = selectedCategory && selectedCategory !== category
    const isHovered = hoveredObject === category && !selectedCategory
    const target = isReceded ? 0.15 : isHovered ? 1 : 0.6
    setOpacity((prev) => prev + (target - prev) * delta * 4)
  })

  return (
    <group position={position} rotation={rotation}>
      <Text
        fontSize={0.2}
        color="#3a3a3a"
        anchorX="center"
        anchorY="middle"
        fillOpacity={opacity}
      >
        {text}
      </Text>
      <Text
        fontSize={0.1}
        color="#888"
        anchorX="center"
        anchorY="middle"
        position={[0, -0.14, 0]}
        fillOpacity={opacity * 0.65}
      >
        {number}
      </Text>
    </group>
  )
}

export default function WorldLabels() {
  return (
    <>
      <WorldLabel
        text="Writing"
        number="01"
        position={[-2.2, -0.48, 1.8]}
        rotation={[-Math.PI / 2, 0, 0.09]}
        category="writing"
      />
      <WorldLabel
        text="Architecture"
        number="02"
        position={[0, -0.48, 2.0]}
        rotation={[-Math.PI / 2, 0, 0]}
        category="architecture"
      />
      <WorldLabel
        text="Research"
        number="03"
        position={[2.2, -0.48, 1.8]}
        rotation={[-Math.PI / 2, 0, -0.09]}
        category="research"
      />
    </>
  )
}
