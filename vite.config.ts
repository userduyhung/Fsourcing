import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['lucide-react'],
  },
  server: {
    fs: {
      strict: false,
    },
    // Dev-time proxy: forward `/api/*` calls to backend during development.
    // Use BACKEND_URL env var to override the default. Default now points
    // to the Railway backend so local dev doesn't hit the FE host and avoids CORS.
    proxy: {
      '/api': {
        target: process.env.BACKEND_URL || 'https://uni-b2b-fixed-production.up.railway.app',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    },
    open: true,
  },
});
