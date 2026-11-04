import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import eslint from '@nabla/vite-plugin-eslint';

// Preserve CRA's PUBLIC_URL behavior by driving Vite's base. It must be an
// absolute path so assets keep resolving when the SPA is hard-loaded from a
// nested route (e.g. "/vehicle/permit-prices"); otherwise nginx's
// `try_files $uri /index.html` fallback serves index.html for missing JS files.
const publicUrl = process.env.PUBLIC_URL || '/';

export default defineConfig(({ mode }) => ({
  base: publicUrl,
  // Keep the existing REACT_APP_* variable names; only these are exposed to
  // import.meta.env. Never use '' here, as it would expose every variable.
  envPrefix: 'REACT_APP_',
  plugins: [react(), mode !== 'test' && eslint()],
  server: {
    // Bind to all interfaces so the dev server is reachable through the
    // container's published port mapping.
    host: true,
    port: 3000,
  },
  preview: {
    port: 3000,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
    reporters: ['verbose', 'junit'],
    outputFile: {
      junit: './jest-report.xml',
    },
    coverage: {
      reporter: ['clover', 'json', 'lcov', 'text', 'cobertura'],
      include: ['src/**/*'],
    },
  },
  build: {
    // Keep the build output directory as `build` so the Dockerfile and nginx
    // config (which copy/serve /app/build) do not need changes.
    outDir: 'build',
  },
}));
