import { defineConfig, loadEnv } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSass } from '@rsbuild/plugin-sass';

// Expose REACT_APP_* variables (from .env files and process.env) to the app.
const { rawPublicVars } = loadEnv({ prefixes: ['REACT_APP_'] });

// Build a plain process.env object so dynamic access (process.env[key], as used
// in getEnv) keeps working the same way it did under create-react-app.
const reactAppEnv = Object.entries(rawPublicVars).reduce<Record<string, unknown>>(
  (acc, [key, value]) => {
    acc[key.replace(/^process\.env\./, '')] = value;
    return acc;
  },
  {}
);

// Preserve CRA's PUBLIC_URL behavior by driving Rsbuild's asset prefix, which
// also fills the `<%= assetPrefix %>` template variable used in index.html.
const publicUrl = process.env.PUBLIC_URL || '';

export default defineConfig({
  plugins: [pluginReact(), pluginSass()],
  html: {
    template: './public/index.html',
  },
  server: {
    // Bind to all interfaces so the dev server is reachable through the
    // container's published port mapping.
    host: '0.0.0.0',
    port: 3000,
  },
  dev: {
    assetPrefix: publicUrl || '/',
  },
  source: {
    define: {
      'process.env': JSON.stringify({
        NODE_ENV: process.env.NODE_ENV || 'development',
        PUBLIC_URL: process.env.PUBLIC_URL || '',
        ...reactAppEnv,
      }),
    },
  },
  output: {
    // Must match `dev.assetPrefix` above. Using 'auto' here would emit
    // relative script/link tags (e.g. "static/js/foo.js"). Those resolve
    // fine when the page is loaded from "/", but break when the SPA is
    // hard-loaded from a nested route (e.g. after the login redirect lands
    // on "/vehicle/permit-prices"), because the browser then resolves them
    // as "/vehicle/static/js/foo.js". Nginx's `try_files $uri /index.html`
    // fallback then serves index.html for that missing JS file, and the
    // browser fails to parse the HTML as JavaScript ("Unexpected token '<'").
    assetPrefix: publicUrl || '/',
    // Keep the build output directory as `build` so the Dockerfile and nginx
    // config (which copy/serve /app/build) do not need changes.
    distPath: {
      root: 'build',
    },
  },
});
