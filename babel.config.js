// Babel config used by Jest (via babel-jest) only.
// Rsbuild transforms source with SWC and adds babel-plugin-macros separately,
// so it does NOT read this file (configFile is disabled in rsbuild.config.ts).
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
  ],
  plugins: ['babel-plugin-macros'],
};
