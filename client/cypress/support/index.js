// Custom Cypress support commands can be added here.

beforeEach(() => {
  // CSRF token bootstrap
  cy.intercept('GET', '/api/csrf-token', {
    statusCode: 200,
    body: { csrfToken: 'test-token' },
    headers: {
      'set-cookie': 'XSRF-TOKEN=test-token; Path=/; HttpOnly; SameSite=Strict',
    },
  }).as('csrf');

  // Auth status
  cy.intercept('GET', '/api/auth/me', {
    statusCode: 200,
    body: { user: { id: 'u1', role: 'admin', email: 'admin@example.com' }, role: 'admin' },
  }).as('authMe');

  // Silent refresh
  cy.intercept('POST', '/api/auth/refresh', { statusCode: 200 }).as('refresh');
});
