import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    maxWorkers: 2,
    pool: 'threads',
    exclude: ['tests/tailor/known-issues.spec.ts', '**/node_modules/**', '**/dist/**'],
  },
});
