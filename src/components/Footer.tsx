export default function Footer() {
  return (
    <footer style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: '24px 36px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      zIndex: 10,
      pointerEvents: 'none',
    }}>
      <div>
        <p style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '15px',
          fontWeight: 400,
          fontStyle: 'italic',
          color: '#444',
          lineHeight: 1.5,
          marginBottom: '12px',
        }}>
          Thinking through<br />
          Architecture, and the World.
        </p>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '10px',
          color: '#999',
          letterSpacing: '0.04em',
        }}>
          © 2024 Y. Zhu &nbsp;&nbsp; All rights reserved.
        </p>
      </div>

      <div style={{ textAlign: 'right' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          justifyContent: 'flex-end',
          marginBottom: '12px',
        }}>
          <div style={{
            width: '32px',
            height: '1px',
            background: '#aaa',
          }} />
          <div style={{
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            border: '1.5px solid #999',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: '#999',
            }} />
          </div>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            color: '#888',
            letterSpacing: '0.02em',
          }}>
            Scroll or click an object
          </span>
        </div>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          color: '#999',
          letterSpacing: '0.03em',
        }}>
          Seattle, WA &nbsp;|&nbsp; New York, NY
        </p>
      </div>
    </footer>
  )
}
