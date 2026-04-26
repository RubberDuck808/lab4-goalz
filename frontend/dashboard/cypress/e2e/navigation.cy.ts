/// <reference types="cypress" />
import { OverviewPage } from '../pages/OverviewPage';

// Story: US EP 1.1 (dashboard navigation after staff login)

describe('Dashboard Navigation', () => {
  const page = new OverviewPage();

  beforeEach(() => {
    cy.stubOverviewApi();
    page.visit();
  });

  it('renders all five sidebar navigation items', () => {
    ['Overview', 'Arboretum Map', 'Reports', 'Import dataset', 'Settings'].forEach((name) => {
      page.navItem(name).should('be.visible');
    });
  });

  it('shows the Overview section by default', () => {
    page.pageTitle().should('be.visible');
  });

  it('switches to the Arboretum Map section', () => {
    page.clickNavItem('Arboretum Map');
    cy.contains('h1', 'Alboretum Map').should('be.visible');
  });

  it('switches to the Reports section', () => {
    page.clickNavItem('Reports');
    cy.contains('h1', 'Reports').should('be.visible');
  });

  it('switches to the Import Dataset section', () => {
    page.clickNavItem('Import dataset');
    cy.contains('h1', 'Import Dataset').should('be.visible');
  });

  it('switches to the Settings section', () => {
    page.clickNavItem('Settings');
    cy.contains('h1', 'Settings').should('be.visible');
  });

  it('returns to Overview when the Overview nav item is clicked again', () => {
    page.clickNavItem('Reports');
    cy.contains('h1', 'Reports').should('be.visible');
    page.clickNavItem('Overview');
    page.pageTitle().should('be.visible');
  });
});
