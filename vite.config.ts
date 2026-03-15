import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['ip-navigator-main.onrender.com'],
    host: true,
    port: 5173
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
