import { Canvas } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import CameraRig from './CameraRig'
import Lighting from './Lighting'
import InfinitePlane from './InfinitePlane'
import WritingObject from './WritingObject'
import ArchitectureObject from './ArchitectureObject'
import ResearchObject from './ResearchObject'
import WorldLabels from './WorldLabels'
import { useStore } from '../store'
import { useEffect } from 'react'

export default function HomeScene() {
  const setIsMobile = useStore((s) => s.setIsMobile)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [setIsMobile])

  return (
    <Canvas
      camera={{
        fov: 31,
        near: 0.1,
        far: 100,
        position: [0, 3.2, 6.5],
      }}
      gl={{
        antialias: true,
        toneMapping: 3,
        toneMappingExposure: 1.25,
      }}
      dpr={[1, 2]}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    >
      <color attach="background" args={['#c5c9cc']} />

      <CameraRig />
      <Lighting />
      <InfinitePlane />

      <WritingObject />
      <ArchitectureObject />
      <ResearchObject />
      <WorldLabels />

      <ContactShadows
        position={[0, -0.499, 0]}
        opacity={0.35}
        scale={20}
        blur={2.5}
        far={4}
        color="#8a9094"
      />
    </Canvas>
  )
}
