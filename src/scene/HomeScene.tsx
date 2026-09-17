import { Canvas } from '@react-three/fiber'
import { ContactShadows, Environment } from '@react-three/drei'
import * as THREE from 'three'
import CameraRig from './CameraRig'
import Lighting from './Lighting'
import InfinitePlane from './InfinitePlane'
import WritingObject from './WritingObject'
import ArchitectureObject from './ArchitectureObject'
import ResearchObject from './ResearchObject'
import WorldLabels from './WorldLabels'
import { useEffect, Suspense } from 'react'
import { useStore } from '../store'

// Phase-1 quality gate: Writing passed (browser-verified material parity).
// All three procedural GLB objects restored.
const FOCUS_WRITING = false

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
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      dpr={[1, 1.5]}
      onCreated={({ scene }) => {
        // HDRI is reflections-only support: tame it so paper never blows out.
        scene.environmentIntensity = 0.8
      }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    >
      <color attach="background" args={['#dde1e5']} />

      <CameraRig />
      <Lighting />
      {/* Local CC0 studio HDRI (public/hdri) — reflections only, no CDN. */}
      <Environment files={`${import.meta.env.BASE_URL}hdri/studio_small_09_1k.hdr`} background={false} />
      <InfinitePlane />

      <Suspense fallback={null}>
        <WritingObject />
        {!FOCUS_WRITING && <ArchitectureObject />}
        {!FOCUS_WRITING && <ResearchObject />}
      </Suspense>
      {!FOCUS_WRITING && <WorldLabels />}

      <ContactShadows
        position={[0, -0.499, 0]}
        opacity={0.28}
        scale={24}
        blur={3.0}
        far={5}
        color="#7a8088"
      />
    </Canvas>
  )
}
