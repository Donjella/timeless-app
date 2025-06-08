import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',  // ✅ Correct for Google Cloud Storage hosting
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: 'index.html',  // ✅ Correct (no leading slash)
    },
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
