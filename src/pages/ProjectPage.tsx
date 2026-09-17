import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { useEffect } from 'react'
import architectureData from '../data/architecture.json'
import researchData from '../data/research.json'
import writingData from '../data/writing.json'

export default function ProjectPage() {
  const { category, slug } = useParams<{ category: string; slug: string }>()
  const navigate = useNavigate()
  const setSelectedCategory = useStore((s) => s.setSelectedCategory)
  const setSelectedProject = useStore((s) => s.setSelectedProject)
  const setTransitioning = useStore((s) => s.setTransitioning)

  const allData: Record<string, any[]> = {
    architecture: architectureData,
    research: researchData,
    writing: writingData,
  }

  const projects = allData[category || ''] || []
  const project = projects.find((p: any) => p.slug === slug)

  useEffect(() => {
    if (category) {
      setSelectedCategory(category as any)
    }
    if (slug) {
      setSelectedProject(slug)
    }
  }, [category, slug, setSelectedCategory, setSelectedProject])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleClose = () => {
    setTransitioning(true)
    setSelectedCategory(null)
    setSelectedProject(null)
    navigate('/')
    setTimeout(() => setTransitioning(false), 900)
  }

  if (!project) {
    return (
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(238, 240, 240, 0.85)',
        backdropFilter: 'blur(20px)',
        zIndex: 30,
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: '#666' }}>
            Project not found
          </p>
          <button onClick={handleClose} style={{
            marginTop: '16px',
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            color: '#888',
            cursor: 'pointer',
          }}>
            ← Back to home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'rgba(238, 240, 240, 0.88)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      zIndex: 30,
      overflowY: 'auto',
      animation: 'projectFadeIn 420ms ease-out',
    }}>
      <style>{`
        @keyframes projectFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .project-content { max-width: 720px; margin: 0 auto; padding: 100px 40px 80px; }
        .project-hero { width: 70vw; max-width: 900px; margin: 0 auto 48px; }
        .project-hero img { width: 100%; height: auto; display: block; }
        .project-close {
          position: fixed; top: 28px; right: 36px; z-index: 40;
          font-family: var(--font-sans); font-size: 13px; color: #666;
          cursor: pointer; background: none; border: none;
        }
        .project-close:hover { color: #2a2a2a; }
      `}</style>

      <button className="project-close" onClick={handleClose}>
        ← Close
      </button>

      <div className="project-content">
        {/* Project number + title */}
        <div style={{ marginBottom: '32px' }}>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            color: '#999',
            letterSpacing: '0.05em',
            display: 'block',
            marginBottom: '8px',
          }}>
            {category === 'architecture' ? '02' : category === 'research' ? '03' : '01'}
          </span>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '36px',
            fontWeight: 500,
            color: '#2a2a2a',
            lineHeight: 1.2,
          }}>
            {project.title}
          </h1>
          {project.subtitle && (
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '16px',
              fontStyle: 'italic',
              color: '#888',
              marginTop: '8px',
            }}>
              {project.subtitle}
            </p>
          )}
        </div>

        {/* Metadata */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '16px',
          marginBottom: '40px',
          padding: '20px 0',
          borderTop: '1px solid rgba(0,0,0,0.06)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}>
          {[
            { label: 'Year', value: project.year },
            { label: 'Location', value: project.location },
            { label: 'Type', value: project.type },
            ...(project.instructors?.length ? [{ label: 'Instructors', value: project.instructors.join(', ') }] : []),
            ...(project.collaborators?.length ? [{ label: 'Collaborators', value: project.collaborators.join(', ') }] : []),
          ].map((item) => (
            <div key={item.label}>
              <dt style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '10px',
                fontWeight: 500,
                color: '#999',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '4px',
              }}>
                {item.label}
              </dt>
              <dd style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                color: '#444',
              }}>
                {item.value}
              </dd>
            </div>
          ))}
        </div>

        {/* Summary */}
        <p style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '17px',
          lineHeight: 1.7,
          color: '#444',
          marginBottom: '48px',
        }}>
          {project.summary}
        </p>

        {/* Hero placeholder */}
        <div className="project-hero" style={{
          background: 'rgba(0,0,0,0.03)',
          borderRadius: '4px',
          aspectRatio: '16/9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '48px',
        }}>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '12px',
            color: '#bbb',
          }}>
            Portfolio content from source PDFs
          </span>
        </div>

        {/* Narrative placeholder */}
        <div style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '15px',
          lineHeight: 1.8,
          color: '#555',
        }}>
          <p style={{ marginBottom: '24px' }}>
            Full project narrative, diagrams, drawings, and renderings will be
            extracted from the portfolio PDFs and presented in their original
            editorial sequence.
          </p>
          <p>
            Source: {project.pages ? `pp. ${project.pages[0]}–${project.pages[project.pages.length - 1]}` : 'PDF source'}
          </p>
        </div>

        {/* Next project */}
        <div style={{
          marginTop: '80px',
          paddingTop: '32px',
          borderTop: '1px solid rgba(0,0,0,0.06)',
          textAlign: 'center',
        }}>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '10px',
            color: '#bbb',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            Next Project
          </span>
        </div>
      </div>
    </div>
  )
}
