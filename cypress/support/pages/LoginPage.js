class LoginPage {
  elements = {
    emailInput: () => cy.get('[data-testid="email"]'),
    passwordInput: () => cy.get('[data-testid="senha"]'),
    loginButton: () => cy.get('[data-testid="entrar"]'),
  };

  visit() {
    cy.visit('/');
  }

  login(email, password) {
    this.elements.emailInput().type(email);
    this.elements.passwordInput().type(password, { log: false });
    this.elements.loginButton().click();
  }
}

export default new LoginPage();
