# Casos de Teste — ServeRest

Casos de teste cobertos pelo projeto, organizados por camada (API via Postman/Newman, E2E via Cypress) e módulo.

## Testes de API (Postman/Newman) — 28 requests, 61 assertions

### Login

| ID | Caso | Resultado esperado |
|---|---|---|
| API-01 | Login com credenciais válidas | 200, retorna token Bearer |
| API-02 | Login com credenciais inválidas | 401, mensagem de erro |

### Usuários

| ID | Caso | Resultado esperado |
|---|---|---|
| API-03 | Listar todos os usuários | 200, lista com quantidade e array |
| API-04 | Listar usuários com filtro (administrador=true) | 200, retorna apenas admins |
| API-05 | Buscar usuário por ID | 200, usuário com todos os campos |
| API-06 | Cadastrar usuário administrador | 201, usuário criado |
| API-07 | Cadastrar usuário comum | 201, usuário criado |
| API-08 | Cadastrar usuário com email já existente | 400, erro de duplicidade |
| API-09 | Editar usuário por ID | 200, dados atualizados |
| API-10 | Remover usuário por ID | 200, usuário excluído |
| API-11 | Remover usuário com ID inexistente | 200, "nenhum registro excluído" |

### Produtos

| ID | Caso | Resultado esperado |
|---|---|---|
| API-12 | Listar todos os produtos | 200, lista completa |
| API-13 | Listar produtos com filtro por nome | 200, retorna produto correspondente |
| API-14 | Buscar produto por ID | 200, produto com todos os campos |
| API-15 | Cadastrar produto (com token admin) | 201, produto criado |
| API-16 | Cadastrar produto sem token | 401, acesso negado |
| API-17 | Editar produto por ID (com token admin) | 200, dados atualizados |
| API-18 | Remover produto por ID (com token admin) | 200, produto excluído |

### Carrinhos

| ID | Caso | Resultado esperado |
|---|---|---|
| API-19 | Listar todos os carrinhos | 200, lista completa |
| API-20 | Listar carrinhos com filtro por usuário | 200, retorna carrinho correspondente |
| API-21 | Buscar carrinho por ID | 200, carrinho com estrutura completa |
| API-22 | Criar carrinho (com token) | 201, carrinho criado |
| API-23 | Criar segundo carrinho pro mesmo usuário | 400, "não é permitido ter mais de 1 carrinho" |
| API-24 | Concluir compra | 200, carrinho removido |
| API-25 | Cancelar compra | 200, carrinho removido e estoque reposto |
| API-26 | Concluir compra sem carrinho ativo | 200, "nenhum registro excluído" |

## Testes E2E (Cypress) — 5 testes

### Login

| ID | Caso | Resultado esperado |
|---|---|---|
| E2E-01 | Login com credenciais válidas | Redireciona para `/admin/home` |
| E2E-02 | Login com senha inválida | Exibe "Email e/ou senha inválidos" |

### Cadastro de Usuário

| ID | Caso | Resultado esperado |
|---|---|---|
| E2E-03 | Cadastrar usuário comum | Redireciona pra lista, usuário aparece com Administrador=false |
| E2E-04 | Cadastrar usuário administrador | Redireciona pra lista, usuário aparece com Administrador=true |

### Cadastro de Produto

| ID | Caso | Resultado esperado |
|---|---|---|
| E2E-05 | Cadastrar produto com imagem | Redireciona pra lista, produto aparece com todos os dados |

## Fora de escopo / não testável no momento

- **Fluxo de carrinho na interface (E2E)** — não implementado no front-end (ver [DEFEITOS-CONHECIDOS.md](./DEFEITOS-CONHECIDOS.md)). Coberto integralmente via API (casos API-19 a API-26).
- Testes de carga/performance e segurança aprofundada — fora do escopo definido em [ESTRATEGIA-QA.md](./ESTRATEGIA-QA.md).
