export default {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/', 'src/server.js'],
  collectCoverageFrom: ['src/__tests__/**/*.js', 'src/controllers/__tests__/**/*.js'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
