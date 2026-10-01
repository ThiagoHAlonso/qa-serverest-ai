import loginPage from '../support/pages/LoginPage';
import cadastroProdutoPage from '../support/pages/CadastroProdutoPage';

describe('Cadastro de Produto', () => {
  const senhaAdmin = 'Teste@123';
  let emailAdmin;

  beforeEach(() => {
    // Cria um admin novo via API e loga por ele, pra poder acessar
    // a tela de Cadastro de Produto (protegida por login).
    emailAdmin = `admin_cypress_${Date.now()}@qa.com`;

    cy.request('POST', 'https://serverest.dev/usuarios', {
      nome: 'Admin Cypress',
      email: emailAdmin,
      password: senhaAdmin,
      administrador: 'true',
    });

    loginPage.visit();
    loginPage.login(emailAdmin, senhaAdmin);
    cadastroProdutoPage.visit();
  });

  it('deve cadastrar um produto com sucesso', () => {
    const nome = `Produto Cypress ${Date.now()}`;

    cadastroProdutoPage.cadastrar({
      nome,
      preco: '150', // o campo só aceita número inteiro (confirmado manualmente)
      descricao: 'Produto criado automaticamente pelo teste Cypress',
      quantidade: '10',
      imagem: 'cypress/fixtures/produto.png',
    });

    cy.url().should('include', '/admin/listarprodutos');
    cy.contains(nome).should('be.visible');
  });
});
