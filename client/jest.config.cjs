module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  moduleNameMapper: {
    '^recharts$': '<rootDir>/src/__mocks__/recharts.js',
  },
  collectCoverageFrom: ['src/**/*.{js,jsx}'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/',
    '<rootDir>/src/pages/',
    '<rootDir>/src/services/',
    '<rootDir>/src/utils/',
    '<rootDir>/src/hooks/',
    '<rootDir>/src/components/Loading.jsx',
    '<rootDir>/src/components/ThemeCard.jsx',
  ],
  coverageThreshold: {
    global: {
      branches: 15,
      functions: 15,
      lines: 13,
      statements: 13,
    },
  },
};
