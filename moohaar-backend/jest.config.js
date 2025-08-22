export default {
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/mocks/'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'src/server.js',
    '/__tests__/',
    '/src/seeds/',
    '/src/services/',
    '/src/utils/',
    'src/controllers/adminAuth.controller.js',
    'src/middleware/adminAuth.js',
    '/mocks/'
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
