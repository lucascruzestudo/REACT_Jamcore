import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: '/',
  esbuild: {
    // Remove all console.* and debugger statements from production builds
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
}))
