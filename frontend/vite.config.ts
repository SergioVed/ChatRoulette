import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: loadEnv(mode, process.cwd(), '').API_PROXY_TARGET || 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
    allowedHosts: [
      'colours-bid-jesse-mailto.trycloudflare.com',
    ],
  },
}))
