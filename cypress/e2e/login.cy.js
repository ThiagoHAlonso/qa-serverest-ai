import loginPage from '../support/pages/LoginPage';

describe('Login', () => {
  const senha = 'Teste@123';
  let email;

  beforeEach(() => {
    // Cria um usuário novo antes de cada teste, evitando depender
    // de credenciais fixas que podem não existir mais no servidor.
    email = `usuario_cypress_${Date.now()}@qa.com`;

    cy.request('POST', 'https://serverest.dev/usuarios', {
      nome: 'Usuário Cypress',
      email,
      password: senha,
      administrador: 'true',
    });

    loginPage.visit();
  });

  it('deve logar com sucesso usando credenciais válidas', () => {
    loginPage.login(email, senha);

    cy.url().should('include', '/admin/home');
    cy.contains('Bem Vindo').should('be.visible');
  });

  it('não deve logar com senha inválida', () => {
    loginPage.login(email, 'senhaErrada123');

    cy.contains('Email e/ou senha inválidos').should('be.visible');
    cy.url().should('not.include', '/admin/home');
  });
});
