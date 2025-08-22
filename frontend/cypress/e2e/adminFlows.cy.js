// Cypress E2E test: Admin flows (login, create category, create product)
// Assumes the app is running at https://judiths-haven-frontend.onrender.com

describe('Admin E2E Flows', () => {
  const adminEmail = 'ojomiracle20@gmail.com'; // Use a known admin email
  const adminPassword = 'Test1234!'; // Use the correct admin password
  let categoryName = `AdminCat${Date.now()}`;
  let productName = `AdminProduct${Date.now()}`;

  it('Logs in as admin', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type(adminEmail);
    cy.get('input[name="password"]').type(adminPassword);
    cy.get('button[type="submit"]').click();
    cy.contains('Admin').should('exist');
  });

  it('Creates a new category', () => {
    cy.contains('Admin').click();
    cy.contains('Categories').click();
    cy.contains('Add Category').click();
    cy.get('input[name="name"]').type(categoryName);
    cy.get('input[name="description"]').type('E2E Category');
    cy.get('input[type="file"]').attachFile('public/images/default-avatar.png');
    cy.get('button[type="submit"]').click();
    cy.contains(categoryName).should('exist');
  });

  it('Creates a new product', () => {
    cy.contains('Admin').click();
    cy.contains('Products').click();
    cy.contains('Add Product').click();
    cy.get('input[name="name"]').type(productName);
    cy.get('input[name="price"]').type('99');
    cy.get('input[name="countInStock"]').type('10');
    cy.get('input[name="brand"]').type('E2E Brand');
    cy.get('textarea[name="description"]').type('E2E Product Description');
    cy.get('select[name="category"]').select(categoryName);
    cy.get('input[type="file"]').attachFile('public/images/default-avatar.png');
    cy.get('button[type="submit"]').click();
    cy.contains(productName).should('exist');
  });

  it('Verifies product appears on home page', () => {
    cy.visit('/');
    cy.contains(productName).should('exist');
  });
}); 