/**
 * Screen-space editorial overlay, measured from reference/ui-baseline.png.
 *
 * Components (all in viewport-fraction coordinates, Y DOWN):
 *  1. Labels — italic serif ("Writing" / "Architecture" / "Research")
 *  2. Ticks — short horizontal line above each number
 *  3. Numbers — "01" / "02" / "03"
 *
 * Everything lives in this single component so labels + ticks + numbers
 * form one coherent editorial system. pointer-events: none — purely
 * decorative overlay above the R3F canvas.
 */
import layoutData from '../../reference/home-layout.json'

interface LabelEntry {
  anchor: [number, number]
  rotate_deg: number
  number: string
  number_anchor: [number, number]
}

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
      {/* ── Labels + ticks + numbers ──────────────────────────── */}
      {LABELS.map((l) => (
        <div key={l.key}>
          {/* Label text */}
          <div
            style={{
              position: 'absolute',
              left: `${l.ax}%`,
              top: `${l.ay}%`,
              transform: `translate(-50%, -50%) rotate(${l.rot}deg)`,
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontStyle: 'italic',
              fontSize: 'clamp(14px, 1.8vw, 22px)',
              color: '#4a4a4a',
              opacity: 0.85,
              whiteSpace: 'nowrap',
              letterSpacing: '0.02em',
            }}
          >
            {l.text}
          </div>

          {/* Tick mark (short horizontal line above number) */}
          <div
            style={{
              position: 'absolute',
              left: `${l.nx}%`,
              top: `calc(${l.ny}% - 1.0vh)`,
              transform: 'translate(-50%, -50%)',
              width: 'clamp(16px, 1.5vw, 26px)',
              height: '1.5px',
              background: '#7a7f84',
              opacity: 0.7,
              borderRadius: '0.5px',
            }}
          />

          {/* Number */}
          <div
            style={{
              position: 'absolute',
              left: `${l.nx}%`,
              top: `${l.ny}%`,
              transform: 'translate(-50%, -50%)',
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 'clamp(10px, 1.1vw, 14px)',
              color: '#9a9fa4',
              opacity: 0.8,
              letterSpacing: '0.06em',
            }}
          >
            {l.number}
          </div>
        </div>
      ))}
    </div>
  )
}
