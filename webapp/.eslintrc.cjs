module.exports = {
  root: true,
  extends: ['next', 'next/core-web-vitals'],
  rules: {
    'prefer-const': 'warn',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
  },
};
