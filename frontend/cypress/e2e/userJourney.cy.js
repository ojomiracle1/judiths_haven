// Cypress E2E test: Simulates a real user journey through the UI
// Assumes the app is running at https://judiths-haven-frontend.onrender.com

describe('E2E User Journey', () => {
  const email = `e2euser${Date.now()}@example.com`;
  const password = 'Test1234!';

  it('Registers a new user', () => {
    cy.visit('/register');
    cy.get('input[name="name"]').type('E2E User');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.contains('Profile').should('exist');
  });

  it('Logs out and logs in', () => {
    cy.contains('Logout').click();
    cy.visit('/login');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.contains('Profile').should('exist');
  });

  it('Adds a product to cart and checks out', () => {
    cy.visit('/');
    cy.get('[data-testid="product-card"]').first().click();
    cy.contains('Add to Cart').click();
    cy.visit('/cart');
    cy.contains('Checkout').click();
    cy.get('input[name="address"]').type('123 Main St');
    cy.get('input[name="city"]').type('City');
    cy.get('input[name="postalCode"]').type('0000');
    cy.get('input[name="country"]').type('Country');
    cy.get('button[type="submit"]').contains('Continue').click();
    cy.get('button[type="submit"]').contains('Place Order').click();
    cy.contains('Order Success').should('exist');
  });
}); 