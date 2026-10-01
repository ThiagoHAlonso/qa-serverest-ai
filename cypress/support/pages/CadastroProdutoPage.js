class CadastroProdutoPage {
  elements = {
    nomeInput: () => cy.get('[data-testid="nome"]'),
    precoInput: () => cy.get('[data-testid="preco"]'),
    descricaoInput: () => cy.get('[data-testid="descricao"]'),
    quantidadeInput: () => cy.get('[data-testid="quantity"]'),
    imagemInput: () => cy.get('[data-testid="imagem"]'),
    cadastrarButton: () => cy.get('[data-testid="cadastarProdutos"]'),
  };

  visit() {
    cy.get('[data-testid="cadastrar-produtos"]').click();
  }

  cadastrar({ nome, preco, descricao, quantidade, imagem }) {
    this.elements.nomeInput().type(nome);
    this.elements.precoInput().type(preco);
    this.elements.descricaoInput().type(descricao);
    this.elements.quantidadeInput().type(quantidade);
    this.elements.imagemInput().selectFile(imagem);
    this.elements.cadastrarButton().click();
  }
}

export default new CadastroProdutoPage();
