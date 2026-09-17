import { useRef, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store'

const defaultPos = new THREE.Vector3(0, 3.2, 6.5)
const defaultTarget = new THREE.Vector3(0, 0, 0)
const mobileDefaultPos = new THREE.Vector3(0, 4.0, 7.5)
const mobileDefaultTarget = new THREE.Vector3(0, 0, 0)

const categoryPositions: Record<string, { pos: THREE.Vector3; target: THREE.Vector3 }> = {
  writing: {
    pos: new THREE.Vector3(-1.57, 2.8, 5.0),
    target: new THREE.Vector3(-1.57, 0, 0.5),
  },
  architecture: {
    pos: new THREE.Vector3(0.06, 2.8, 5.0),
    target: new THREE.Vector3(0.06, 0, 0.5),
  },
  research: {
    pos: new THREE.Vector3(1.86, 2.8, 5.0),
    target: new THREE.Vector3(1.86, 0, 0.5),
  },
}

export default function CameraRig() {
  const { camera } = useThree()
  const mouse = useRef({ x: 0, y: 0 })
  const targetPos = useRef(defaultPos.clone())
  const targetLookAt = useRef(defaultTarget.clone())
  // Lerped anchors. The camera is ASSIGNED from anchor + parallax offset
  // every frame — parallax is never accumulated with +=.
  const basePos = useRef(defaultPos.clone())
  const currentLookAt = useRef(defaultTarget.clone())
  const selectedCategory = useStore((s) => s.selectedCategory)
  const isTransitioning = useStore((s) => s.isTransitioning)
  const reducedMotion = useStore((s) => s.reducedMotion)
  const isMobile = useStore((s) => s.isMobile)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Let R3F set up the camera first, then take over
    const timer = setTimeout(() => {
      camera.position.copy(defaultPos)
      camera.lookAt(defaultTarget)
      setReady(true)
    }, 100)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clearTimeout(timer)
    }
  }, [camera])

  useEffect(() => {
    if (!ready) return
    if (selectedCategory && categoryPositions[selectedCategory]) {
      const { pos, target } = categoryPositions[selectedCategory]
      targetPos.current.copy(pos)
      targetLookAt.current.copy(target)
    } else {
      const base = isMobile ? mobileDefaultPos : defaultPos
      const baseTarget = isMobile ? mobileDefaultTarget : defaultTarget
      targetPos.current.copy(base)
      targetLookAt.current.copy(baseTarget)
    }
  }, [selectedCategory, isMobile, ready])

  useFrame((_, delta) => {
    if (!ready) return

    const speed = 2.5
    const k = Math.min(delta * speed, 1)
    basePos.current.lerp(targetPos.current, k)
    currentLookAt.current.lerp(targetLookAt.current, k)
    // Epsilon guards: snap idle interpolation instead of creeping forever.
    if (basePos.current.distanceToSquared(targetPos.current) < 1e-8) {
      basePos.current.copy(targetPos.current)
    }
    if (currentLookAt.current.distanceToSquared(targetLookAt.current) < 1e-8) {
      currentLookAt.current.copy(targetLookAt.current)
    }

    let offsetX = 0
    let offsetY = 0
    if (!reducedMotion && !isTransitioning && !isMobile) {
      offsetX = mouse.current.x * 0.03
      offsetY = mouse.current.y * 0.015
    }
    camera.position.set(
      basePos.current.x + offsetX,
      basePos.current.y + offsetY,
      basePos.current.z
    )

    camera.lookAt(currentLookAt.current)
  })

  return null
}
