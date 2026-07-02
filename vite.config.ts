import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    return {
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      test: {
        include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
        exclude: ['e2e/**', 'node_modules/**'],
      }
    };
});
