/// <reference types="cypress" />

// Story: US EP 1.1 (staff account creation — admin-only feature)

describe('Settings — Create Staff User', () => {
  beforeEach(() => {
    cy.stubOverviewApi();
  });

  context('Admin user', () => {
    beforeEach(() => {
      cy.loginAs('Admin');
      cy.contains('p', 'Settings').click();
    });

    it('shows the Create Staff User form', () => {
      cy.contains('Create Staff User').should('be.visible');
      cy.contains('label', 'Full Name').should('be.visible');
      cy.contains('label', 'Email').should('be.visible');
      cy.contains('label', 'Password').should('be.visible');
    });

    it('shows a validation error when form is submitted empty', () => {
      cy.contains('button', 'Create Staff User').click();
      cy.contains('Please fill in all fields').should('be.visible');
    });

    it('shows success message after creating a staff user', () => {
      cy.intercept('POST', '**/api/dashboard/auth/create-user', {
        statusCode: 201,
        body: { email: 'newstaff@humber.ca', role: 'Staff' },
      }).as('createUser');

      cy.contains('label', 'Full Name').parent().find('input').type('Jane Smith');
      cy.contains('label', 'Email').parent().find('input').type('newstaff@humber.ca');
      cy.contains('label', 'Password').parent().find('input').type('StaffPass123!');
      cy.contains('button', 'Create Staff User').click();

      cy.wait('@createUser');
      cy.contains('Staff account created for newstaff@humber.ca').should('be.visible');
    });

    it('shows an error when the email is already taken', () => {
      cy.intercept('POST', '**/api/dashboard/auth/create-user', {
        statusCode: 409,
        body: {},
      }).as('createUserConflict');

      cy.contains('label', 'Full Name').parent().find('input').type('Dup Staff');
      cy.contains('label', 'Email').parent().find('input').type('existing@humber.ca');
      cy.contains('label', 'Password').parent().find('input').type('StaffPass123!');
      cy.contains('button', 'Create Staff User').click();

      cy.wait('@createUserConflict');
      cy.contains('An account with this email already exists').should('be.visible');
    });
  });

  context('Non-admin (Staff) user', () => {
    beforeEach(() => {
      cy.loginAs('Staff');
      cy.contains('p', 'Settings').click();
    });

    it('shows a restricted-access message instead of the form', () => {
      cy.contains('Only admins can create new staff accounts').should('be.visible');
    });

    it('does not render the Create Staff User form', () => {
      cy.contains('button', 'Create Staff User').should('not.exist');
    });
  });
});
