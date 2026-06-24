import { defineConfig, loadEnv } from '@rsbuild/core';
import { pluginBabel } from '@rsbuild/plugin-babel';
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

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginSass(),
    // Keep graphql.macro (and other babel-plugin-macros) working until they are
    // replaced with gql tagged templates in a later migration phase.
    pluginBabel({
      include: /\.(?:jsx?|tsx?)$/,
      babelLoaderOptions(opts) {
        // Do not read babel.config.js here; it is Jest-only and would make
        // Babel re-run the TS/React presets that SWC already handles.
        opts.configFile = false;
        opts.babelrc = false;
        opts.plugins ??= [];
        opts.plugins.push('babel-plugin-macros');
      },
    }),
  ],
  html: {
    template: './public/index.html',
  },
  server: {
    // Bind to all interfaces so the dev server is reachable through the
    // container's published port mapping.
    host: '0.0.0.0',
    port: 3000,
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
    // Keep the build output directory as `build` so the Dockerfile and nginx
    // config (which copy/serve /app/build) do not need changes.
    distPath: {
      root: 'build',
    },
  },
});
