import baseConfig from './jest.config.js';

export default {
  ...baseConfig,
  testMatch: ['**/__tests__/performance/**/*.+(ts|tsx)'],
  displayName: 'performance'
};
