export default {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'src/server.js',
    '/__tests__/',
    '/src/seeds/',
    '/src/services/',
    '/src/utils/',
  ],
  collectCoverageFrom: ['src/**/*.{js,jsx}'],
  coverageThreshold: {
    global: {
      branches: 28,
      functions: 45,
      lines: 37,
      statements: 37,
    },
  },
};
