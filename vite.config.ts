import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relatieve paden werken ook onder de repository-map van GitHub Pages.
  base: '/surplus/',
  plugins: [react()],
})
