class CadastroUsuarioPage {
  elements = {
    nomeInput: () => cy.get('[data-testid="nome"]'),
    emailInput: () => cy.get('[data-testid="email"]'),
    senhaInput: () => cy.get('[data-testid="password"]'),
    administradorCheckbox: () => cy.get('[data-testid="checkbox"]'),
    cadastrarButton: () => cy.get('[data-testid="cadastrarUsuario"]'),
  };

  visit() {
    cy.get('[data-testid="cadastrar-usuarios"]').click();
  }

  cadastrar(nome, email, senha, administrador = true) {
    this.elements.nomeInput().type(nome);
    this.elements.emailInput().type(email);
    this.elements.senhaInput().type(senha, { log: false });

    if (administrador) {
      this.elements.administradorCheckbox().check();
    } else {
      this.elements.administradorCheckbox().uncheck();
    }

    this.elements.cadastrarButton().click();
  }
}

export default new CadastroUsuarioPage();
