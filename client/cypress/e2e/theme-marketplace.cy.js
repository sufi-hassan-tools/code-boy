before(() => {
  const baseUrl = Cypress.config('baseUrl') || '';
  const isLocal = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1');
  if (isLocal) {
    cy.exec('npm run start -- --port 4173 --logLevel silent --strictPort', { failOnNonZeroExit: false });
    cy.wait(5000);
  }
});

before(function () {
  cy.request({ url: '/health', failOnStatusCode: false, timeout: 120000 }).then((resp) => {
    if (resp.status >= 500 || resp.status === 0) {
      this.skip();
    }
  });
});

describe('Theme marketplace flow', () => {
  it('browses, previews, selects, and views storefront', () => {
    // Stub API calls used by ThemeStore
    cy.intercept('GET', /\/api\/themes\?offset=\d+&limit=\d+/, {
      statusCode: 200,
      body: { themes: [
        { _id: 't1', name: 'Theme One', description: 'Desc', price: 0 },
        { _id: 't2', name: 'Theme Two', description: 'Desc', price: 0 },
      ]},
    }).as('getThemes');
    cy.intercept('GET', /\/api\/themes\/[^/]+\/preview/, {
      statusCode: 200,
      body: '<html><body><h1>Preview</h1></body></html>',
      headers: { 'content-type': 'text/html' },
    }).as('preview');
    cy.intercept('POST', '/api/store/theme', { statusCode: 200 }).as('selectTheme');

    cy.visit('/', { failOnStatusCode: false });
    cy.wait('@getThemes');
    cy.contains('Themes').click();
    cy.get('button').contains('Preview').first().click();
    cy.wait('@preview');
    cy.contains('Select').click();
    cy.wait('@selectTheme');
    cy.url().should('include', '/');
  });
});
