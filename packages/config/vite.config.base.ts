import { defineConfig } from 'vite';

/**
 * Base Vite configuration for attendance-kit projects
 */
export const baseConfig = defineConfig({
  define: {
    'import.meta.env.VITE_PRIMARY_COLOR': JSON.stringify('#007CC0'),
  },
  server: {
    port: 5173,
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: true,
  },
});
