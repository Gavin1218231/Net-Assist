import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Strict Content-Security-Policy for the deployed app. Injected only for the
// production build (GitHub Pages can't set response headers, so a <meta> tag is
// the delivery mechanism). It is deliberately NOT applied in dev because Vite's
// HMR needs inline scripts / eval that a strict policy would block.
//
// - script-src 'self': all app code is bundled; no inline scripts remain
//   (the service-worker registration was moved into main.tsx).
// - style-src 'unsafe-inline': required for React inline style attributes
//   (style={{...}}) and Tailwind; Google Fonts CSS is host-allowlisted.
// - connect-src: locked to the three third-party APIs the app actually calls.
// frame-ancestors is intentionally omitted (ignored in <meta>; set it plus
// X-Frame-Options at the hosting layer if clickjacking protection is needed).
function cspPlugin(): Plugin {
  const policy = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data:",
    "connect-src 'self' https://speed.cloudflare.com https://geocoding.geo.census.gov https://api.zippopotam.us",
    "manifest-src 'self'",
    "worker-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')
  return {
    name: 'inject-csp',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace(
        '</title>',
        `</title>\n    <meta http-equiv="Content-Security-Policy" content="${policy}" />`,
      )
    },
  }
}

export default defineConfig({
  base: '/Net-Assist/',
  plugins: [react(), tailwindcss(), cspPlugin()],
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
