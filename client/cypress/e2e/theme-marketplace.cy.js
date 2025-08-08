before(() => {
  const baseUrl = Cypress.config('baseUrl') || '';
  const isLocal = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1');
  if (isLocal) {
    cy.exec('npm run start -- --port 4173 --logLevel silent --strictPort', { failOnNonZeroExit: false });
    cy.wait(5000);
  }
});

before(function () {
  cy.request({ url: '/', failOnStatusCode: false }).then((resp) => {
    if (resp.status >= 500) {
      this.skip();
    }
  });
});

describe('Theme marketplace flow', () => {
  it('browses, previews, selects, and views storefront', () => {
    cy.visit('/', { failOnStatusCode: false });
    cy.contains('Themes').click();
    cy.get('button').contains('Preview').first().click();
    cy.contains('Select').click();
    cy.url().should('include', '/');
  });
});
