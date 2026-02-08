import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@/ClockInOutPage': path.resolve(__dirname, 'src/ClockInOutPage'),
      '@/ClocksListPage': path.resolve(__dirname, 'src/ClocksListPage'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/shared/test/setup.ts',
    css: true,
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/*.e2e.spec.ts',
      '**/.storybook/**',
      '**/storybook-static/**',
    ],
  },
});
