
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Allow the Cloudflare tunnel domain
    allowedHosts: ["southampton-allocated-handheld-released.trycloudflare.com"],
    headers: {
      // Allow Firebase Google sign-in popup to communicate without warnings
      "Cross-Origin-Opener-Policy": "unsafe-none",
      "Cross-Origin-Embedder-Policy": "unsafe-none",
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
})
