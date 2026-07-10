import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/Net-Assist/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-icons': ['lucide-react'],
          // Absolute path: Rollup matches object-form manualChunks against
          // resolved module IDs, so a bare './src/...' string can silently miss.
          'hyperlocal-data': [fileURLToPath(new URL('./src/services/hyperlocal5g.ts', import.meta.url))],
        },
      },
    },
  },
})
