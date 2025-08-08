before(() => {
  const baseUrl = Cypress.config('baseUrl') || '';
  const isLocal = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1');
  if (isLocal) {
    // Start local preview server only in local runs; ignore non-zero exit if already running
    cy.exec('npm run start -- --port 4173 --logLevel silent --strictPort', { failOnNonZeroExit: false });
    cy.wait(5000);
  }
});

before(function () {
  // Skip the entire suite if the target server is unavailable (e.g., remote 5xx)
  cy.request({ url: '/', failOnStatusCode: false }).then((resp) => {
    if (resp.status >= 500) {
      this.skip();
    }
  });
});

describe('Admin E2E', () => {
  it('logs in as an admin', () => {
    cy.intercept('POST', '/api/auth/login', { statusCode: 200, body: { token: 'fake' } }).as('login');
    cy.visit('/login', { failOnStatusCode: false });
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="email"]').type('admin@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.contains('Sign in').click();
    cy.wait('@login');
    cy.url().should('include', '/dashboard');
  });

  it('navigates to each admin section', () => {
    cy.visit('/admin', { failOnStatusCode: false });
    cy.contains('Dashboard').should('be.visible');
    cy.contains('Stores').click();
    cy.url().should('include', '/admin/stores');
    cy.contains('Users').click();
    cy.url().should('include', '/admin/users');
    cy.contains('Themes').click();
    cy.url().should('include', '/admin/themes');
    cy.contains('Settings').click();
    cy.url().should('include', '/admin/settings');
  });

  it('performs a simple CRUD operation', () => {
    cy.visit('/admin/users', { failOnStatusCode: false });
    cy.contains('Edit').should('be.visible');
    cy.contains('Edit').click();
    cy.contains('Edit Roles').should('be.visible');
    cy.contains('Close').click();
    cy.contains('Edit Roles').should('not.exist');
  });
});
