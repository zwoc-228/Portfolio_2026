import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'

/** Device-independent render stats (draw calls, tris) + rAF fps.
 * Written here; read by DebugPanel (?debug=materials). */
export const perfInfo: {
  fps: number
  calls: number
  triangles: number
  geometries: number
  textures: number
  programs: number
} = { fps: 0, calls: 0, triangles: 0, geometries: 0, textures: 0, programs: 0 }

export default function PerfProbe() {
  const gl = useThree((s) => s.gl)
  const frames = useRef(0)
  const last = useRef(performance.now())

  useFrame(() => {
    frames.current++
    const now = performance.now()
    if (now - last.current >= 1000) {
      perfInfo.fps = frames.current
      frames.current = 0
      last.current = now
      perfInfo.calls = gl.info.render.calls
      perfInfo.triangles = gl.info.render.triangles
      perfInfo.geometries = gl.info.memory.geometries
      perfInfo.textures = gl.info.memory.textures
      perfInfo.programs = gl.info.programs?.length ?? 0
    }
  })

  return null
}
