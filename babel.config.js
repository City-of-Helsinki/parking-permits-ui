// Babel config used by Jest (via babel-jest) only.
// Vite does NOT read this file. Removed together with Jest in Phase 2.
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
  ],
};
