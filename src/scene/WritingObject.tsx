import { useRef, useState, Suspense, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../store'
import { makeWritingMaterials, applyAOMap, ensureUV1, publicUrl } from './webMaterials'

// Real-world meters (Blender) -> homepage scene units.
export const METERS_TO_SCENE = 5.4

// Base-aware URL: dev serves at /, Pages serves at /Portfolio_2026/.
const MODEL_URL = `${import.meta.env.BASE_URL}models/writing.glb`

export interface MeshDebugRow {
  mesh: string
  material: string
  color: string
  roughness: number
  metalness: number
  map: string
  normalMap: string
}

/** Written once during the collect pass; read by ?debug=materials. */
export const writingDebug: { rows: MeshDebugRow[] } = { rows: [] }

function WritingModel({ fadeMats }: { fadeMats: React.MutableRefObject<THREE.Material[]> }) {
  const { scene } = useGLTF(MODEL_URL)
  const mats = useMemo(() => {
    const m = makeWritingMaterials()
    // Blender-baked crevice AO (page block, spine folds). Base color untouched.
    const ao = publicUrl('textures/writing_ao.png')
    applyAOMap(m.cover, ao, 0.5)
    applyAOMap(m.paper, ao, 0.6)
    applyAOMap(m.spine, ao, 0.5)
    return m
  }, [])

  useEffect(() => {
    const seen = new Set<THREE.Material>()
    const rows: MeshDebugRow[] = []
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return
      child.castShadow = true
      child.receiveShadow = true
      ensureUV1(child.geometry)
      const n = child.name
      let mat: THREE.Material = mats.paper
      if (n.startsWith('BackCover') || n.startsWith('FrontCover')) mat = mats.cover
      else if (n.startsWith('Spine')) mat = mats.spine
      else if (n.startsWith('Ribbon')) mat = mats.ribbon
      child.material = mat
      if (!seen.has(mat)) {
        seen.add(mat)
        fadeMats.current.push(mat)
      }
      const std = mat as THREE.MeshStandardMaterial
      rows.push({
        mesh: n || '(unnamed)',
        material: `${n.startsWith('BackCover') || n.startsWith('FrontCover') ? 'cover' : n.startsWith('Spine') ? 'spine' : n.startsWith('Ribbon') ? 'ribbon' : 'paper'}`,
        color: `#${std.color.getHexString()}`,
        roughness: std.roughness,
        metalness: std.metalness,
        map: std.map ? 'yes' : 'no',
        normalMap: std.normalMap ? 'linen' : 'no',
      })
    })
    writingDebug.rows = rows
    return () => {
      fadeMats.current = []
      writingDebug.rows = []
    }
  }, [scene, mats, fadeMats])

  return <primitive object={scene} />
}

export default function WritingObject() {
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
    const isReceded = selectedCategory && selectedCategory !== 'writing'

    targetY.current = isActive ? 0.06 : 0
    currentY.current += (targetY.current - currentY.current) * delta * 8
    groupRef.current.position.y = currentY.current

    // Collected once — no scene-graph traversal per frame.
    const targetOpacity = isReceded ? 0.35 : 1
    for (const m of fadeMats.current) {
      const mat = m as THREE.MeshStandardMaterial
      mat.opacity += (targetOpacity - mat.opacity) * delta * 4
      mat.transparent = mat.opacity < 0.999
    }
  })

  return (
    <group
      ref={groupRef}
      position={[-1.593, 0, -0.098]}
      rotation={[0, 0.27, 0]}
      scale={METERS_TO_SCENE * 1.15}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        setHoveredStore('writing')
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        setHoveredStore(null)
        document.body.style.cursor = 'default'
      }}
      onClick={(e) => {
        e.stopPropagation()
        if (!selectedCategory) setSelectedCategory('writing')
      }}
    >
      <Suspense fallback={null}>
        <WritingModel fadeMats={fadeMats} />
      </Suspense>
    </group>
  )
}

useGLTF.preload(MODEL_URL)
