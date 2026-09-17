export default function Footer() {
  return (
    <footer style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: '22px 36px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      zIndex: 10,
      pointerEvents: 'none',
    }}>
      <div>
        <p style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '14.5px',
          fontWeight: 400,
          fontStyle: 'italic',
          color: '#3a3a3a',
          lineHeight: 1.5,
          marginBottom: '10px',
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
          marginBottom: '10px',
        }}>
          <div style={{
            width: '28px',
            height: '1px',
            background: '#aaa',
          }} />
          <div style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            border: '1.5px solid #999',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              width: '3.5px',
              height: '3.5px',
              borderRadius: '50%',
              background: '#999',
            }} />
          </div>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '10.5px',
            color: '#888',
            letterSpacing: '0.01em',
          }}>
            Scroll or click an object
          </span>
        </div>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '10.5px',
          color: '#999',
          letterSpacing: '0.03em',
        }}>
          Seattle, WA &nbsp;|&nbsp; New York, NY
        </p>
      </div>
    </footer>
  )
}
