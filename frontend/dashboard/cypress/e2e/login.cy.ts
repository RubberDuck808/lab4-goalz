/// <reference types="cypress" />
import { LoginPage } from '../pages/LoginPage';

// Story: US EP 1.1 (staff dashboard auth — admin/staff login)

describe('Dashboard Login', () => {
  const page = new LoginPage();

  beforeEach(() => {
    page.visit();
  });

  context('Field validation', () => {
    it('shows a validation error when both fields are empty', () => {
      page.submit();
      page.errorMessage().should('contain', 'Please enter both email and password');
    });

    it('shows a validation error when only email is filled', () => {
      page.fillEmail('admin@goalz-test.internal').submit();
      page.errorMessage().should('contain', 'Please enter both email and password');
    });

    it('shows a validation error when only password is filled', () => {
      page.fillPassword('AdminPass123!').submit();
      page.errorMessage().should('contain', 'Please enter both email and password');
    });

    it('password input type is password', () => {
      page.passwordInput().should('have.attr', 'type', 'password');
    });
  });

  context('Failed authentication', () => {
    it('shows an error message on wrong credentials', () => {
      cy.intercept('POST', '**/api/dashboard/auth/login', {
        statusCode: 404,
        body: {},
      }).as('loginFail');

      page.fillAndSubmit('admin@goalz-test.internal', 'WrongPassword');

      cy.wait('@loginFail');
      page.errorMessage().should('contain', 'Invalid email or password');
    });
  });

  context('Successful authentication', () => {
    it('redirects to /overview on valid credentials', () => {
      cy.intercept('POST', '**/api/dashboard/auth/login', {
        statusCode: 200,
        body: { email: 'admin@goalz-test.internal', name: 'Test Admin', role: 'Admin' },
      }).as('loginOk');

      cy.intercept('GET', '**/api/dashboard/overview', {
        statusCode: 200,
        body: { element: [], sensors: [] },
      }).as('overviewApi');

      page.fillAndSubmit('admin@goalz-test.internal', 'AdminPass123!');

      cy.wait('@loginOk');
      cy.url().should('include', '/overview');
    });

    it('stores user data in localStorage after login', () => {
      cy.intercept('POST', '**/api/dashboard/auth/login', {
        statusCode: 200,
        body: { email: 'admin@goalz-test.internal', name: 'Test Admin', role: 'Admin' },
      }).as('loginOk');

      cy.intercept('GET', '**/api/dashboard/overview', {
        statusCode: 200,
        body: { element: [], sensors: [] },
      });

      page.fillAndSubmit('admin@goalz-test.internal', 'AdminPass123!');
      cy.wait('@loginOk');

      cy.window().then((win) => {
        const user = JSON.parse(win.localStorage.getItem('user') ?? '{}');
        expect(user.email).to.eq('admin@goalz-test.internal');
        expect(user.role).to.eq('Admin');
      });
    });
  });
});
