/**
 * Screen-space guide system, measured from reference/home-layout.json.
 *
 * The reference arc is a shallow SMILE: ends high, center low
 * (centerLowY > sideY, Y grows downward). Built directly in screen
 * space — never inferred from 3D world positions.
 *
 * Curve lives in SVG (fades at both ends, like the reference);
 * labels/numbers are DOM divs at % anchors (no aspect distortion).
 * pointer-events: none — purely editorial overlay above the canvas.
 */
import layoutData from '../../reference/home-layout.json'

interface LabelEntry {
  anchor: [number, number]
  rotate_deg: number
  number: string
  number_anchor: [number, number]
}

const ARC_PATH: string = (layoutData as unknown as { arc: { svg_cubic: string } })
  .arc.svg_cubic
const LABEL_MAP = (layoutData as unknown as { labels: Record<string, LabelEntry> })
  .labels

const LABELS = Object.entries(LABEL_MAP).map(([key, v]) => ({
  key,
  text: key.charAt(0).toUpperCase() + key.slice(1),
  number: v.number,
  ax: v.anchor[0] * 100,
  ay: v.anchor[1] * 100,
  rot: v.rotate_deg,
  nx: v.number_anchor[0] * 100,
  ny: v.number_anchor[1] * 100,
}))

export default function ArcOverlay() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <defs>
          <linearGradient id="arcFade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8a8f94" stopOpacity="0" />
            <stop offset="12%" stopColor="#8a8f94" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#8a8f94" stopOpacity="0.5" />
            <stop offset="88%" stopColor="#8a8f94" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#8a8f94" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={ARC_PATH}
          fill="none"
          stroke="url(#arcFade)"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {LABELS.map((l) => (
        <div key={l.key}>
          <div
            style={{
              position: 'absolute',
              left: `${l.ax}%`,
              top: `${l.ay}%`,
              transform: `translate(-50%, -50%) rotate(${l.rot}deg)`,
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontStyle: 'italic',
              fontSize: '2.5vh',
              color: '#4d4d4d',
              opacity: 0.8,
              whiteSpace: 'nowrap',
            }}
          >
            {l.text}
          </div>
          <div
            style={{
              position: 'absolute',
              left: `${l.nx}%`,
              top: `${l.ny}%`,
              transform: 'translate(-50%, -50%)',
              width: '2.2%',
              height: '1px',
              background: '#8a8f94',
              opacity: 0.5,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: `${l.nx}%`,
              top: `calc(${l.ny}% + 1.6vh)`,
              transform: 'translate(-50%, -50%)',
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: '1.4vh',
              color: '#8a8f94',
              opacity: 0.85,
            }}
          >
            {l.number}
          </div>
        </div>
      ))}
    </div>
  )
}
