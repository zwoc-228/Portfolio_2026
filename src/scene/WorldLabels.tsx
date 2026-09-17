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
  const [opacity, setOpacity] = useState(0.5)

  useFrame((_, delta) => {
    const isReceded = selectedCategory && selectedCategory !== category
    const isHovered = hoveredObject === category && !selectedCategory
    const target = isReceded ? 0.1 : isHovered ? 0.85 : 0.5
    setOpacity((prev) => prev + (target - prev) * delta * 4)
  })

  return (
    <group position={position} rotation={rotation}>
      <Text
        fontSize={0.12}
        color="#6a6a6a"
        anchorX="center"
        anchorY="middle"
        fillOpacity={opacity}
        letterSpacing={0.08}
      >
        {text}
      </Text>
      <Text
        fontSize={0.055}
        color="#a0a0a0"
        anchorX="center"
        anchorY="middle"
        position={[0, -0.09, 0]}
        fillOpacity={opacity * 0.55}
        letterSpacing={0.1}
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
        position={[-1.6, -0.49, 1.6]}
        rotation={[-Math.PI / 2, 0, 0.06]}
        category="writing"
      />
      <WorldLabel
        text="Architecture"
        number="02"
        position={[0, -0.49, 1.7]}
        rotation={[-Math.PI / 2, 0, 0]}
        category="architecture"
      />
      <WorldLabel
        text="Research"
        number="03"
        position={[1.6, -0.49, 1.6]}
        rotation={[-Math.PI / 2, 0, -0.06]}
        category="research"
      />
    </>
  )
}
