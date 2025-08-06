const baseUrl = process.env.RENDER_URL || 'https://moohaarapp.onrender.com';

module.exports = {
  e2e: {
    baseUrl,
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/index.js',
  },
};
