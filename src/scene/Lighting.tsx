import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js'

/**
 * Simplified studio: one shadow-casting directional key, one weak fill,
 * one large RectAreaLight softbox for broad highlight shaping
 * (linen sheen, board edges, acrylic readability, floor gradient).
 * No ambient / hemisphere — they flattened material contrast.
 * R3F r155+ uses physically-correct lighting units, so modest
 * directional intensities are intentional.
 */
export default function Lighting() {
  const rectRef = useRef<THREE.RectAreaLight>(null)

  useEffect(() => {
    RectAreaLightUniformsLib.init()
    rectRef.current?.lookAt(0, 0, 0.5)
  }, [])

  return (
    <>
      {/* Key light - large soft from upper-left (primary shadows) */}
      <directionalLight
        position={[-4, 7, 5]}
        intensity={1.6}
        color="#f8f6f2"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={20}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-bias={-0.001}
        shadow-normalBias={0.02}
      />
      {/* Fill light - weak from right */}
      <directionalLight
        position={[4, 4, 3]}
        intensity={0.2}
        color="#eef1f4"
      />
      {/* Softbox - broad controlled highlight, no shadows */}
      <rectAreaLight
        ref={rectRef}
        position={[3.5, 6, 4.5]}
        width={7}
        height={5}
        intensity={2.5}
        color="#fdfbf8"
      />
    </>
  )
}
