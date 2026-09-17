import { create } from 'zustand'

export type CategoryKey = 'writing' | 'architecture' | 'research' | null

interface AppState {
  hoveredObject: CategoryKey
  selectedCategory: CategoryKey
  selectedProject: string | null
  isTransitioning: boolean
  reducedMotion: boolean
  isMobile: boolean
  setHovered: (key: CategoryKey) => void
  setSelectedCategory: (key: CategoryKey) => void
  setSelectedProject: (slug: string | null) => void
  setTransitioning: (val: boolean) => void
  setIsMobile: (val: boolean) => void
}

export const useStore = create<AppState>((set) => ({
  hoveredObject: null,
  selectedCategory: null,
  selectedProject: null,
  isTransitioning: false,
  reducedMotion: typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false,
  isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  setHovered: (key) => set({ hoveredObject: key }),
  setSelectedCategory: (key) => set({ selectedCategory: key }),
  setSelectedProject: (slug) => set({ selectedProject: slug }),
  setTransitioning: (val) => set({ isTransitioning: val }),
  setIsMobile: (val) => set({ isMobile: val }),
}))
