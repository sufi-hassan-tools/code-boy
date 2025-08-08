module.exports = {
  e2e: {
    baseUrl: process.env.RENDER_URL || process.env.CYPRESS_BASE_URL || process.env.BASE_URL || 'http://localhost:4173',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/index.js',
    defaultCommandTimeout: 10000,
  },
};
