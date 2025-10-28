import baseConfig from './jest.config.js';

export default {
  ...baseConfig,
  testMatch: ['**/__tests__/integration/**/*.+(ts|tsx)'],
  displayName: 'integration'
};
