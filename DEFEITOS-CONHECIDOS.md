# Defeitos e Comportamentos Conhecidos — ServeRest

Comportamentos encontrados durante a execução dos testes que fogem do esperado ou representam limitações da aplicação. Documentados aqui em vez de abertos como bug tracker formal, já que o ServeRest é um ambiente público de prática mantido por terceiros.

## DC-01 — Campo de preço do Cadastro de Produto não aceita valores decimais

- **Módulo:** Produtos (front-end)
- **Severidade:** Baixa
- **Descrição:** O campo "Preço" na tela de Cadastro de Produtos é um input HTML `type="number"` sem suporte a casas decimais configurado. Ao digitar um valor como `2,50`, o navegador rejeita com a mensagem nativa "Insira um valor válido. Os dois valores válidos mais próximos são 2 e 3".
- **Impacto:** Impede o cadastro de produtos com preços fracionados (ex: R$ 9,90) diretamente pela interface — só são aceitos valores inteiros.
- **Evidência:** Validação nativa do navegador reproduzida manualmente ao inserir "2,50" no campo.
- **Recomendação:** Ajustar o atributo `step` do input para aceitar casas decimais (ex: `step="0.01"`).

## DC-02 — Fluxo de Carrinho não implementado na interface

- **Módulo:** Carrinho (front-end)
- **Severidade:** Informativo (não é bug, é funcionalidade ausente)
- **Descrição:** Ao logar como usuário comum e acessar o menu "Carrinho", a tela exibe apenas "Em construção aguarde" — não há elementos de interface para adicionar produtos, visualizar ou finalizar compra.
- **Impacto:** Não é possível testar o fluxo de carrinho via E2E (Cypress). A cobertura desse fluxo é feita inteiramente via API (Postman — casos API-19 a API-26 em [CASOS-DE-TESTE.md](./CASOS-DE-TESTE.md)).
- **Recomendação:** Nenhuma ação necessária do lado de QA — documentado como limitação conhecida do ambiente de testes.
