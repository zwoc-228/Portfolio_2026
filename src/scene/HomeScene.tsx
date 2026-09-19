import { Canvas } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import CameraRig from './CameraRig'
import Lighting, { StudioEnvironment } from './Lighting'
import InfinitePlane from './InfinitePlane'
import WritingObject from './WritingObject'
import ArchitectureObject from './ArchitectureObject'
import ResearchObject from './ResearchObject'
import PerfProbe from './PerfProbe'
import { useEffect, Suspense } from 'react'
import { useStore } from '../store'

// Phase-1 quality gate: Writing passed (browser-verified material parity).
// All three procedural GLB objects restored.
const FOCUS_WRITING = false

// A/B gate 2026-09-17: AgX wins (cleaner highlight rolloff, better
// separation, less haze than ACES). ?tm=aces kept for regression.
function resolveToneMapping() {
  if (typeof window !== 'undefined') {
    const tm = new URLSearchParams(window.location.search).get('tm')
    if (tm === 'aces') {
      return THREE.ACESFilmicToneMapping
    }
  }
  return THREE.AgXToneMapping
}

export default function HomeScene() {
  const setIsMobile = useStore((s) => s.setIsMobile)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check() // initial value on mount; listener covers resizes
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [setIsMobile])

  return (
    <Canvas
      shadows
      camera={{
        fov: 31,
        near: 0.1,
        far: 100,
        position: [0, 3.2, 6.5],
      }}
      gl={{
        antialias: true,
        toneMapping: resolveToneMapping(),
        toneMappingExposure: 0.9,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      dpr={[1, 1.5]}
      onCreated={({ scene }) => {
        // Studio env is reflections support: strong enough to model the
        // whites, tame enough that paper never blows out.
        scene.environmentIntensity = 0.82
        // Backdrop lift is INDEPENDENT of lighting: AgX crushes light-grey
        // backgrounds to murk, so the canvas backdrop gets its own gain
        // instead of raising exposure (which would blow paper out).
        scene.backgroundIntensity = 1.12
        // ?envrot=<radians> rotates the studio for A/B tests (default 0).
        // Puts a bright softbox behind camera-facing normals (acrylic faces).
        if (typeof window !== 'undefined') {
          const raw = new URLSearchParams(window.location.search).get('envrot')
          const rot = raw !== null && isFinite(parseFloat(raw)) ? parseFloat(raw) : 0
          scene.environmentRotation.y = rot
        }
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
      <color attach="background" args={['#d5d9dd']} />

      <CameraRig />
      <PerfProbe />
      <Lighting />
      {/* Reflection-controlled studio (Lightformer cards, frames=1 static).
          Local CC0 HDRI public/hdri/studio_small_09_1k.hdr remains the
          Blender-preview / CI-bake source — web runtime uses the designed
          studio so acrylic/metal reflect intentional shapes, not a photo. */}
      <StudioEnvironment />
      <InfinitePlane />

      <Suspense fallback={null}>
        <WritingObject />
        {!FOCUS_WRITING && <ArchitectureObject />}
        {!FOCUS_WRITING && <ResearchObject />}
      </Suspense>
      {/* Labels + guide arc are screen-space DOM now (ArcOverlay):
          pixel-precise, no perspective guesswork. WorldLabels kept
          on disk but unmounted. */}

      <ContactShadows
        position={[0, 0.001, 0]}
        opacity={0.18}
        scale={10}
        blur={1.6}
        far={3}
        frames={1}
        color="#7a8088"
      />
    </Canvas>
  )
}
