import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig(({ command }) => {
    return {
      plugins: [react(), cloudflare()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      server: {
        middlewareMode: false,
      },
      test: {
        include: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'src/**/*.test.tsx', 'src/**/*.spec.tsx'],
        exclude: ['e2e/**', 'node_modules/**'],
      }
    };
});