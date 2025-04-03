/** @type {import('jest').Config} */
export default {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js'
  ],
  transformIgnorePatterns: [
    '/node_modules/(?!axios)/'
  ],
  // Explicitly tell Jest this is using ES modules
  extensionsToTreatAsEsm: ['.jsx'],
  testRunner: 'jest-circus/runner'
};