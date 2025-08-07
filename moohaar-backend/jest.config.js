export default {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/', 'src/server.js', '/__tests__/'],
  collectCoverageFrom: ['src/**/*.{js,jsx}'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
