/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /** Sets localStorage to simulate a logged-in session, then visits the given path. */
      loginAs(role: 'Admin' | 'Staff', path?: string): Chainable<void>;
      /** Stubs GET /api/dashboard/overview so the map section doesn't error. */
      stubOverviewApi(): Chainable<void>;
    }
  }
}

const USERS = {
  Admin: { email: 'admin@goalz-test.internal', name: 'Test Admin', role: 'Admin' },
  Staff: { email: 'staff@goalz-test.internal', name: 'Test Staff', role: 'Staff' },
};

Cypress.Commands.add('loginAs', (role: 'Admin' | 'Staff', path = '/overview') => {
  const user = USERS[role];
  cy.visit(path, {
    onBeforeLoad(win) {
      win.localStorage.setItem('user', JSON.stringify(user));
    },
  });
});

Cypress.Commands.add('stubOverviewApi', () => {
  cy.intercept('GET', '**/api/dashboard/overview', {
    statusCode: 200,
    body: { element: [], sensors: [] },
  }).as('overviewApi');
});

export {};
