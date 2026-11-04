import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// Preserve CRA's PUBLIC_URL behavior by driving Vite's base. It must be an
// absolute path so assets keep resolving when the SPA is hard-loaded from a
// nested route (e.g. "/vehicle/permit-prices"); otherwise nginx's
// `try_files $uri /index.html` fallback serves index.html for missing JS files.
const publicUrl = process.env.PUBLIC_URL || '/';

export default defineConfig(({ mode }) => {
  // Temporary shim: expose REACT_APP_* variables as a plain process.env object
  // so dynamic access (process.env[key], as used in getEnv) keeps working.
  // Removed when variables are renamed to VITE_* (migration Phase 3).
  const reactAppEnv = loadEnv(mode, process.cwd(), 'REACT_APP_');

  return {
    base: publicUrl,
    plugins: [react()],
    server: {
      // Bind to all interfaces so the dev server is reachable through the
      // container's published port mapping.
      host: true,
      port: 3000,
    },
    build: {
      // Keep the build output directory as `build` so the Dockerfile and nginx
      // config (which copy/serve /app/build) do not need changes.
      outDir: 'build',
    },
    define: {
      'process.env': JSON.stringify({
        NODE_ENV: mode === 'production' ? 'production' : 'development',
        PUBLIC_URL: process.env.PUBLIC_URL || '',
        ...reactAppEnv,
      }),
    },
  };
});
