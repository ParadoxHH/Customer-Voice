import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '#types': fileURLToPath(new URL('../TYPES.ts', import.meta.url))
    }
  },
  server: {
    port: 5173,
    host: true,
    fs: {
      allow: [fileURLToPath(new URL('..', import.meta.url))]
    }
  }
});
