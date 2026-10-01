import loginPage from '../support/pages/LoginPage';
import cadastroUsuarioPage from '../support/pages/CadastroUsuarioPage';

describe('Cadastro de Usuário', () => {
  const senhaAdmin = 'Teste@123';
  let emailAdmin;

  beforeEach(() => {
    // Cria um admin novo via API e loga por ele, pra poder acessar
    // a tela de Cadastro de Usuário (protegida por login).
    emailAdmin = `admin_cypress_${Date.now()}@qa.com`;

    cy.request('POST', 'https://serverest.dev/usuarios', {
      nome: 'Admin Cypress',
      email: emailAdmin,
      password: senhaAdmin,
      administrador: 'true',
    });

    loginPage.visit();
    loginPage.login(emailAdmin, senhaAdmin);
    cadastroUsuarioPage.visit();
  });

  it('deve cadastrar um usuário comum com sucesso', () => {
    const nome = 'Usuário Comum Cypress';
    const email = `comum_cypress_${Date.now()}@qa.com`;

    cadastroUsuarioPage.cadastrar(nome, email, 'Teste@123', false);

    cy.url().should('include', '/admin/listarusuarios');
    cy.contains(nome).should('be.visible');
  });

  it('deve cadastrar um usuário administrador com sucesso', () => {
    const nome = 'Usuário Admin Cypress';
    const email = `novoadmin_cypress_${Date.now()}@qa.com`;

    cadastroUsuarioPage.cadastrar(nome, email, 'Teste@123', true);

    cy.url().should('include', '/admin/listarusuarios');
    cy.contains(nome).should('be.visible');
  });
});
