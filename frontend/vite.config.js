import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window',
    'process.env': {},
  },
  resolve: {
    alias: {
      util: 'util'
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000',
    }
  }
})
