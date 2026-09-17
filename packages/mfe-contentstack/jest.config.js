module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'js', 'json'],
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  transform: {
    '^.+\\.ts$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@contentstack/delivery-sdk$': '<rootDir>/src/__mocks__/delivery-sdk.ts',
    '^@contentstack/live-preview-utils$': '<rootDir>/src/__mocks__/live-preview-utils.ts',
    '^@contentstack/utils$': '<rootDir>/src/__mocks__/utils.ts',
  },
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '!**/*.spec.ts',
    '!**/index.ts',
    '!**/types.ts',
    '!**/__mocks__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  coverageReporters: ['html', 'lcov', 'text'],
};
