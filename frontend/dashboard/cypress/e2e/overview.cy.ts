/// <reference types="cypress" />
import { OverviewPage } from '../pages/OverviewPage';

// Story: US EP 2.4 (leaderboard/overview — staff dashboard view of sensors & elements)

describe('Dashboard Overview', () => {
  const page = new OverviewPage();

  beforeEach(() => {
    cy.stubOverviewApi();
    page.visit();
  });

  it('renders the overview page title', () => {
    page.pageTitle().should('be.visible');
  });

  it('renders the Green vs Non-Green chart', () => {
    cy.contains('Green vs Non-Green').should('be.visible');
  });

  it('renders the Element Types chart', () => {
    cy.contains('Element Types').should('be.visible');
  });

  it('renders the Sensor Readings chart', () => {
    cy.contains('Sensor Readings').should('be.visible');
  });

  it('renders the Canopy Coverage chart', () => {
    cy.contains('Canopy Coverage').should('be.visible');
  });

  it('displays the green percentage derived from mock data', () => {
    // Mock: 10 green out of 15 elements = 67%
    cy.contains('67% Green').should('be.visible');
  });

  it('displays the correct total element count', () => {
    cy.contains('15 Elements').should('be.visible');
  });

  it('displays the correct sensor count', () => {
    cy.contains('4 Sensors').should('be.visible');
  });

  it('displays the canopy percentage derived from mock data', () => {
    // Mock: 3 trees out of 15 elements = 20%
    cy.contains('20% Canopy').should('be.visible');
  });
});
