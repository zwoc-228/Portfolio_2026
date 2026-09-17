import { Routes, Route, useLocation } from 'react-router-dom'
import HomeScene from './scene/HomeScene'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import CategoryMenu from './components/CategoryMenu'
import DebugPanel from './components/DebugPanel'
import ArcOverlay from './components/ArcOverlay'
import ProjectPage from './pages/ProjectPage'

export default function App() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Canvas layer - z-index 0 */}
      <HomeScene />

      {/* DOM overlay layer - z-index 10, pointer-events: none on container */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 10,
        pointerEvents: 'none',
      }}>
        <ArcOverlay />
        <Navigation />
        <Footer />
        <CategoryMenu />
        <DebugPanel />
      </div>

      {/* Project page overlay - z-index 30 */}
      {!isHome && (
        <Routes>
          <Route path="/:category/:slug" element={<ProjectPage />} />
        </Routes>
      )}
    </div>
  )
}
