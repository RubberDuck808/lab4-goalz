export class LoginPage {
  visit() {
    cy.visit('/');
    return this;
  }

  emailInput()    { return cy.get('#email'); }
  passwordInput() { return cy.get('#password'); }
  signInButton()  { return cy.contains('button', 'Sign In'); }
  errorMessage()  { return cy.get('.text-red-700'); }

  fillEmail(email: string)       { this.emailInput().clear().type(email);       return this; }
  fillPassword(password: string) { this.passwordInput().clear().type(password); return this; }
  submit()                       { this.signInButton().click();                 return this; }

  fillAndSubmit(email: string, password: string) {
    return this.fillEmail(email).fillPassword(password).submit();
  }
}
