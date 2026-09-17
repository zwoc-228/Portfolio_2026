import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Project site: https://zwoc-228.github.io/Portfolio_2026/
  base: '/Portfolio_2026/',
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
})
