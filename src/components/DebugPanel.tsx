import { useEffect, useState } from 'react'
import { writingDebug } from '../scene/WritingObject'
import { perfInfo } from '../scene/PerfProbe'

/** Dev-only overlay. Enable with ?debug=materials. Hidden in production by default. */
export default function DebugPanel() {
  const [enabled, setEnabled] = useState(false)
  const [fps, setFps] = useState(0)
  const [, tick] = useState(0)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('debug') !== 'materials') return
    setEnabled(true)
    let frames = 0
    let last = performance.now()
    let raf = 0
    const loop = () => {
      frames++
      const now = performance.now()
      if (now - last >= 1000) {
        setFps(frames)
        frames = 0
        last = now
        tick((t) => t + 1) // refresh mesh table once/sec
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  if (!enabled) return null

  return (
    <div style={{
      position: 'absolute',
      top: 70,
      right: 12,
      zIndex: 50,
      pointerEvents: 'auto',
      background: 'rgba(20,22,24,0.88)',
      color: '#d8d8d8',
      fontFamily: 'monospace',
      fontSize: '10px',
      lineHeight: 1.5,
      padding: '10px 12px',
      borderRadius: '6px',
      maxWidth: '330px',
      maxHeight: '60vh',
      overflowY: 'auto',
    }}>
      <div style={{ color: '#fff', marginBottom: '6px' }}>
        ?debug=materials — fps:{fps} dpr:{window.devicePixelRatio} vw:{window.innerWidth}x{window.innerHeight}
      </div>
      <div style={{ color: '#9fd49f', marginBottom: '6px' }}>
        calls:{perfInfo.calls} tris:{perfInfo.triangles} geo:{perfInfo.geometries} tex:{perfInfo.textures} prog:{perfInfo.programs}
      </div>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr style={{ color: '#888' }}>
            <th align="left">mesh</th>
            <th align="left">mat</th>
            <th align="left">color</th>
            <th align="left">r/m</th>
            <th align="left">nrm</th>
          </tr>
        </thead>
        <tbody>
          {writingDebug.rows.slice(0, 30).map((r, i) => (
            <tr key={i}>
              <td>{r.mesh}</td>
              <td>{r.material}</td>
              <td>{r.color}</td>
              <td>{r.roughness.toFixed(2)}/{r.metalness.toFixed(2)}</td>
              <td>{r.normalMap}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ color: '#888', marginTop: '4px' }}>
        {writingDebug.rows.length} meshes audited
      </div>
    </div>
  )
}
