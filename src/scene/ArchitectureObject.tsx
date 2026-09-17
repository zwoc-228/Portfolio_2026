import { useRef, useState, Suspense, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../store'
import { METERS_TO_SCENE } from './WritingObject'

import { makeModelBoardMaterial, applyAOMap, ensureUV1 } from './webMaterials'
import { writingDebug } from './WritingObject'

// Base-aware URL: dev serves at /, Pages serves at /Portfolio_2026/.
const MODEL_URL = `${import.meta.env.BASE_URL}models/architecture.glb`

const _tmpColor = new THREE.Color()

/** Near-white low-saturation solids → model board; accents untouched. */
function isModelBoardMat(m: THREE.Material): boolean {
  const mat = m as THREE.MeshStandardMaterial
  if (mat.color === undefined || mat.metalness === undefined) return false
  _tmpColor.copy(mat.color)
  // sRGB luminance + saturation heuristic on the authored GLB palette.
  const r = _tmpColor.r
  const g = _tmpColor.g
  const b = _tmpColor.b
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
  const sat = Math.max(r, g, b) - Math.min(r, g, b)
  return lum > 0.62 && sat < 0.05 && mat.metalness < 0.5
}

function tuneAcrylic(m: THREE.Material): void {
  const mat = m as THREE.MeshPhysicalMaterial
  if (mat.roughness === undefined || mat.transmission === undefined) return
  if (mat.roughness < 0.15) {
    // Clear acrylic: real transmission, never opacity-faked.
    mat.transmission = 0.92
    mat.roughness = 0.08
    mat.ior = 1.49
    mat.thickness = 0.015
    mat.attenuationColor = new THREE.Color('#f2f6f6')
    mat.attenuationDistance = 1.5
    mat.envMapIntensity = 1.6
  } else {
    // Frosted acrylic.
    mat.transmission = 0.65
    mat.roughness = 0.28
    mat.ior = 1.47
    mat.thickness = 0.02
    mat.attenuationColor = new THREE.Color('#e8eef0')
    mat.attenuationDistance = 0.35
    mat.envMapIntensity = 1.0
  }
  mat.metalness = 0
}

function ArchitectureModel({ fadeMats }: { fadeMats: React.MutableRefObject<THREE.Material[]> }) {
  const { scene } = useGLTF(MODEL_URL)
  const board = useMemo(() => {
    const m = makeModelBoardMaterial()
    applyAOMap(m, `${import.meta.env.BASE_URL}textures/architecture_ao.png`, 0.5)
    return m
  }, [])

  useEffect(() => {
    // Collect-once: shadow flags, model-board override for white solids,
    // physical tuning for transmission acrylic, fade targets.
    const seen = new Set<THREE.Material>()
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return
      child.castShadow = true
      child.receiveShadow = true
      ensureUV1(child.geometry)
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      const next = materials.map((m) => {
        const physical = m as THREE.MeshPhysicalMaterial
        if (physical.transmission !== undefined && physical.transmission > 0) {
          tuneAcrylic(m)
          return m
        }
        if (isModelBoardMat(m)) return board
        return m
      })
      child.material = Array.isArray(child.material) ? next : next[0]
      next.forEach((m) => {
        if (!seen.has(m)) {
          seen.add(m)
          fadeMats.current.push(m)
        }
        const sm = m as THREE.MeshStandardMaterial
        const pm = m as THREE.MeshPhysicalMaterial
        writingDebug.rows.push({
          mesh: child.name || '(unnamed)',
          material: `arch:${pm.transmission !== undefined && pm.transmission > 0 ? 'acrylic' : sm.color ? '#' + sm.color.getHexString() : '?'}`,
          color: sm.color ? `#${sm.color.getHexString()}` : '?',
          roughness: sm.roughness ?? -1,
          metalness: sm.metalness ?? -1,
          map: sm.map ? 'yes' : 'no',
          normalMap: sm.normalMap ? 'yes' : 'no',
        })
      })
    })
    return () => {
      fadeMats.current = []
    }
  }, [scene, fadeMats, board])

  return <primitive object={scene} />
}

export default function ArchitectureObject() {
  const groupRef = useRef<THREE.Group>(null)
  const fadeMats = useRef<THREE.Material[]>([])
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
    for (const m of fadeMats.current) {
      const mat = m as THREE.MeshStandardMaterial
      mat.opacity += (targetOpacity - mat.opacity) * delta * 4
      // transparent only while actually fading: blending + transmission
      // otherwise render the material faithfully (esp. transmissive acrylic).
      mat.transparent = mat.opacity < 0.999
    }
  })

  return (
    <group
      ref={groupRef}
      position={[0, 0, 0.3]}
      scale={METERS_TO_SCENE}
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
      <Suspense fallback={null}>
        <ArchitectureModel fadeMats={fadeMats} />
      </Suspense>
    </group>
  )
}

useGLTF.preload(MODEL_URL)
