export class OverviewPage {
  visit() {
    cy.loginAs('Admin');
    return this;
  }

  pageTitle()            { return cy.contains('h1', 'Alboretum Overview'); }
  navItem(name: string)  { return cy.contains('p', name); }

  clickNavItem(name: string) {
    this.navItem(name).click();
    return this;
  }

  sectionTitle(title: string) { return cy.contains('h1', title); }

  chartCard(title: string) {
    return cy.contains('.border', title);
  }
}
