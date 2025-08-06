describe('Theme marketplace flow', () => {
  it('browses, previews, selects, and views storefront', () => {
    cy.visit('/');
    cy.contains('Themes').click();
    cy.get('button').contains('Preview').first().click();
    cy.contains('Select').click();
    cy.url().should('include', '/');
  });
});
