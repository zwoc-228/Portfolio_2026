import { useRef, useState, Suspense, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../store'
import { METERS_TO_SCENE } from './WritingObject'

import { makeResearchPaperMaterial, makeSteelMaterial, applyAOMap, ensureUV1 } from './webMaterials'

// Base-aware URL: dev serves at /, Pages serves at /Portfolio_2026/.
const MODEL_URL = `${import.meta.env.BASE_URL}models/research.glb`

function ResearchModel({ fadeMats }: { fadeMats: React.MutableRefObject<THREE.Material[]> }) {
  const { scene } = useGLTF(MODEL_URL)
  const paper = useMemo(() => {
    const m = makeResearchPaperMaterial()
    applyAOMap(m, `${import.meta.env.BASE_URL}textures/research_ao.png`, 0.68)
    return m
  }, [])
  const steel = useMemo(() => makeSteelMaterial(), [])
  // Homepage idle = blank stack per ui-baseline.png. Printed research
  // content (researchPrint.ts) is reserved for a later reading state —
  // do NOT put the Information Relays sheet on the idle object.

  useEffect(() => {
    // Collect-once: shadow flags; sheets share the warm paper family
    // (no visible texture — geometry + micro-shadows carry it);
    // metal parts share restrained steel. Printed diagrams (if any)
    // keep their maps: only untitled/untextured mats are replaced.
    const seen = new Set<THREE.Material>()
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return
      child.castShadow = true
      child.receiveShadow = true
      ensureUV1(child.geometry)
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      const next = materials.map((m) => {
        const std = m as THREE.MeshStandardMaterial
        if (std.metalness !== undefined && std.metalness > 0.5) return steel
        if (std.map) return m // keep authored maps untouched (none on idle stack)
        return paper
      })
      child.material = Array.isArray(child.material) ? next : next[0]
      next.forEach((m) => {
        if (!seen.has(m)) {
          seen.add(m)
          fadeMats.current.push(m)
        }
      })
    })
    return () => {
      fadeMats.current = []
    }
  }, [scene, fadeMats, paper, steel])

  return <primitive object={scene} />
}

export default function ResearchObject() {
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
    const isReceded = selectedCategory && selectedCategory !== 'research'

    targetY.current = isActive ? 0.06 : 0
    currentY.current += (targetY.current - currentY.current) * delta * 8
    groupRef.current.position.y = currentY.current

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
      position={[2.138, 0, -0.237]}
      rotation={[0, -0.185, 0]}
      scale={METERS_TO_SCENE * 1.3}
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
      <Suspense fallback={null}>
        <ResearchModel fadeMats={fadeMats} />
      </Suspense>
    </group>
  )
}

useGLTF.preload(MODEL_URL)
