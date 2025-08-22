export default {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'src/server.js',
    '/__tests__/',
    '/src/seeds/',
    '/src/services/',
    '/src/utils/',
    'src/controllers/adminAuth.controller.js',
    'src/middleware/adminAuth.js',
  ],
  collectCoverageFrom: ['src/**/*.{js,jsx}'],
  coverageThreshold: {
    global: {
      branches: 19,
      functions: 30,
      lines: 29,
      statements: 30,
    },
  },
};
