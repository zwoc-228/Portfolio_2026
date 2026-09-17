import { useStore } from '../store'
import { useNavigate } from 'react-router-dom'

export default function Navigation() {
  const selectedCategory = useStore((s) => s.selectedCategory)
  const setSelectedCategory = useStore((s) => s.setSelectedCategory)
  const setSelectedProject = useStore((s) => s.setSelectedProject)
  const navigate = useNavigate()

  const handleBack = () => {
    setSelectedCategory(null)
    setSelectedProject(null)
    navigate('/')
  }

  return (
    <header style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      padding: '28px 36px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      zIndex: 10,
      pointerEvents: 'none',
    }}>
      <div style={{ pointerEvents: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '21px',
            fontWeight: 500,
            letterSpacing: '0.01em',
            color: '#2c2c2c',
            margin: 0,
          }}>
            Yuanlong Zhu
          </h1>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '10.5px',
            fontWeight: 400,
            color: '#8a8a8a',
            letterSpacing: '0.01em',
          }}>
            40.8075°N 73.9626°W
          </span>
        </div>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11.5px',
          fontWeight: 400,
          color: '#999',
          marginTop: '3px',
          letterSpacing: '0.04em',
        }}>
          Architect  |  Researcher  |  Writer
        </p>
      </div>

      <nav style={{
        display: 'flex',
        alignItems: 'center',
        gap: '26px',
        pointerEvents: 'auto',
      }}>
        {selectedCategory && (
          <button
            onClick={handleBack}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '12.5px',
              fontWeight: 400,
              color: '#666',
              letterSpacing: '0.01em',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: '4px 0',
            }}
          >
            ← Back
          </button>
        )}
        {['About', 'Archive', 'Contact'].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '12.5px',
              fontWeight: 400,
              color: '#555',
              letterSpacing: '0.01em',
              textDecoration: 'none',
              padding: '4px 0',
            }}
          >
            {item}
          </a>
        ))}
        <button
          style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            border: '1.5px solid #8a8a8a',
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
            <circle cx="5" cy="5" r="2" fill="#8a8a8a" />
          </svg>
        </button>
      </nav>
    </header>
  )
}
