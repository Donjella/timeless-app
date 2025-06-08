import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Use bucket-specific base path for Google Cloud Storage
  base: '/timeless-frontend-prod/',
  
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: 'index.html'  // ← FIXED: Remove leading slash
    }
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/setupTests.js'],
    },
  },
});