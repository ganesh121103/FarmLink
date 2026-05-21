
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Allow the Cloudflare tunnel domain
    allowedHosts: ["southampton-allocated-handheld-released.trycloudflare.com"],
    headers: {
      // Allow Firebase Google sign-in popup to communicate without warnings
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
      "Cross-Origin-Embedder-Policy": "unsafe-none",
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'ws://127.0.0.1:5000',
        ws: true,
      }
    }
  },
})
