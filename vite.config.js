import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// User site (ktodoran.github.io) is served from the domain root.
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    target: 'es2023',
  },
});
