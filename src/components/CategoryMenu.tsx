import { useStore, CategoryKey } from '../store'
import { useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import projectsData from '../data/projects.json'
import architectureData from '../data/architecture.json'
import researchData from '../data/research.json'
import writingData from '../data/writing.json'

const panelStyle: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  width: '380px',
  maxHeight: '520px',
  borderRadius: '12px',
  background: 'rgba(238, 240, 240, 0.62)',
  backdropFilter: 'blur(18px) saturate(105%)',
  WebkitBackdropFilter: 'blur(18px) saturate(105%)',
  border: '1px solid rgba(255, 255, 255, 0.38)',
  boxShadow: '0 18px 50px rgba(30, 40, 50, 0.07)',
  padding: '32px',
  zIndex: 20,
  pointerEvents: 'auto',
  overflowY: 'auto',
}

function getCategoryTitle(key: CategoryKey): string {
  if (key === 'writing') return 'Writing'
  if (key === 'architecture') return 'Architecture'
  if (key === 'research') return 'Research'
  return ''
}

function getCategoryNumber(key: CategoryKey): string {
  if (key === 'writing') return '01'
  if (key === 'architecture') return '02'
  if (key === 'research') return '03'
  return ''
}

function getCategories(key: CategoryKey) {
  if (!key) return []
  return (projectsData as any)[key] || []
}

function getProjects(key: CategoryKey, categorySlug?: string) {
  if (!key) return []
  const allData: Record<string, any[]> = {
    architecture: architectureData,
    research: researchData,
    writing: writingData,
  }
  const projects = allData[key] || []
  if (!categorySlug) return projects
  const cats = getCategories(key)
  const cat = cats.find((c: any) => c.slug === categorySlug)
  if (!cat) return projects
  return projects.filter((p: any) => cat.projects.includes(p.slug))
}

export default function CategoryMenu() {
  const selectedCategory = useStore((s) => s.selectedCategory)
  const setSelectedCategory = useStore((s) => s.setSelectedCategory)
  const setSelectedProject = useStore((s) => s.setSelectedProject)
  const setTransitioning = useStore((s) => s.setTransitioning)
  const navigate = useNavigate()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedCategory) {
        setSelectedCategory(null)
        setSelectedProject(null)
        navigate('/')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedCategory, navigate, setSelectedCategory, setSelectedProject])

  if (!selectedCategory) return null

  const categories = getCategories(selectedCategory)
  const projects = getProjects(selectedCategory)
  const panelSide = selectedCategory === 'research' ? 'left' : 'right'

  const handleProjectClick = (slug: string) => {
    setTransitioning(true)
    setSelectedProject(slug)
    navigate(`/${selectedCategory}/${slug}`)
    setTimeout(() => setTransitioning(false), 1000)
  }

  return (
    <div
      ref={menuRef}
      style={{
        ...panelStyle,
        [panelSide]: selectedCategory === 'research' ? 'calc(50% - 320px)' : 'calc(50% + 60px)',
        opacity: 1,
        animation: 'fadeIn 320ms ease-out',
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-50%) translateX(${panelSide === 'right' ? '12px' : '-12px'}); }
          to { opacity: 1; transform: translateY(-50%) translateX(0); }
        }
      `}</style>

      <div style={{ marginBottom: '24px' }}>
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          color: '#999',
          letterSpacing: '0.05em',
        }}>
          {getCategoryNumber(selectedCategory)}
        </span>
        <h2 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '24px',
          fontWeight: 500,
          color: '#2a2a2a',
          marginTop: '4px',
        }}>
          {getCategoryTitle(selectedCategory)}
        </h2>
      </div>

      {/* Category sub-sections */}
      <div style={{ marginBottom: '20px' }}>
        {categories.map((cat: any) => (
          <div key={cat.slug} style={{ marginBottom: '16px' }}>
            <h3 style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: 500,
              color: '#888',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}>
              {cat.name}
            </h3>
            {cat.projects.length === 0 && (
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                color: '#bbb',
                fontStyle: 'italic',
              }}>
                Coming soon
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{
        height: '1px',
        background: 'rgba(0,0,0,0.08)',
        marginBottom: '20px',
      }} />

      {/* Project list */}
      <div>
        {projects.map((project: any) => (
          <button
            key={project.slug}
            onClick={() => handleProjectClick(project.slug)}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '10px 0',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              borderBottom: '1px solid rgba(0,0,0,0.04)',
            }}
          >
            <div style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '15px',
              color: '#2a2a2a',
              marginBottom: '2px',
            }}>
              {project.title}
            </div>
            <div style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              color: '#999',
            }}>
              {project.year}
            </div>
          </button>
        ))}
      </div>

      {selectedCategory === 'writing' && writingData.length === 0 && (
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          color: '#999',
          fontStyle: 'italic',
          lineHeight: 1.6,
        }}>
          Writing content will be populated as real articles are supplied.
        </p>
      )}
    </div>
  )
}
