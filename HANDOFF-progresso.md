# Handoff — Projeto QA ServeRest + Postman + Cypress + IA

Documento de continuidade. Cole o conteúdo disso numa nova conversa com o Claude pra retomar o projeto sem perder contexto.

## O projeto

Portfólio de QA integrando ServeRest, Postman/Newman, Cypress e uma camada de IA (Claude) para geração de testes, revisão e análise de falhas, com CI/CD em GitHub Actions.

- **Repositório GitHub:** https://github.com/ThiagoHAlonso/qa-serverest-ai (público)
- **Repositório local:** `C:\Devlopment\Solo\Postman\serverest-QA`

## Roadmap (fases)

- [x] **Fase 0** — Setup do repositório
- [x] **Fase 1** — Estratégia de QA
- [x] **Fase 2** — Testes de API (Postman/Newman) — 28 requests, 61 assertions, 0 falhas
- [x] **Fase 3** — Testes E2E (Cypress) — **✅ COMPLETA**: 5 testes, 0 falhas, cobrindo tudo que é realmente testável via UI (ver nota sobre Carrinho abaixo)
- [x] **Fase 4** — Casos de teste e defeitos conhecidos documentados — **✅ COMPLETA**
- [ ] Fase 5 — Camada de IA (Test Generator, Reviewer, Failure Analyzer via @anthropic-ai/sdk)
- [ ] Fase 6 — Métricas / dashboard
- [ ] Fase 7 — GitHub Actions (CI/CD)

## ✅ Fase 3 — Resultado final (Cypress)

```
specs       │ 3 │ 0 falhas
testes      │ 5 │ 0 falhas
```

**Arquivos no repositório:**
```
cypress/
├── support/pages/
│   ├── LoginPage.js
│   ├── CadastroUsuarioPage.js
│   └── CadastroProdutoPage.js
├── e2e/
│   ├── login.cy.js              (2 testes: sucesso + senha inválida)
│   ├── cadastro-usuario.cy.js   (2 testes: comum + administrador)
│   └── cadastro-produto.cy.js   (1 teste: cadastro com upload de imagem)
└── fixtures/
    └── produto.png
```

**⚠️ Importante — Carrinho não foi automatizado no Cypress, e isso é intencional:** ao logar como usuário comum e acessar "Carrinho" no front-end, a tela mostra **"Em construção aguarde"** — a funcionalidade nunca foi implementada na interface. O fluxo de Carrinho já está 100% coberto via API no Postman (Fase 2); no front, não existe elemento nenhum pra automatizar. Isso vira um item de defeito/limitação conhecida na Fase 4.

### Seletores confirmados por tela (referência)

- **Login:** email `data-testid="email"`, senha `data-testid="senha"`, botão `data-testid="entrar"`
- **Cadastro de Usuário:** nome `data-testid="nome"`, email `data-testid="email"`, senha `data-testid="password"` (⚠️ diferente do login), checkbox admin `data-testid="checkbox"` (name="administrador"), botão `data-testid="cadastrarUsuario"`
- **Cadastro de Produto:** nome `data-testid="nome"`, preço `data-testid="preco"` (name="price"), descrição `data-testid="descricao"`, quantidade `data-testid="quantity"`, imagem `data-testid="imagem"` (upload obrigatório), botão `data-testid="cadastarProdutos"` (⚠️ typo no app)
- **Links do menu:** `data-testid="cadastrar-usuarios"`, `data-testid="cadastrar-produtos"`

### Comportamentos/defeitos encontrados (material pronto pra Fase 4)

1. Campo de preço no Cadastro de Produto não aceita valores decimais (ex: "2,50") — só números inteiros.
2. Tela de Carrinho no front-end (usuário comum) mostra "Em construção aguarde" — funcionalidade não implementada na UI, só existe via API.

## ✅ Fase 4 — Documentos gerados

- `CASOS-DE-TESTE.md` — 26 casos de API + 5 casos E2E, organizados por módulo
- `DEFEITOS-CONHECIDOS.md` — DC-01 (preço decimal) e DC-02 (carrinho não implementado no front)

## Próximo passo imediato — Fase 5

- **Fase 5** — Camada de IA (Test Generator, Reviewer, Failure Analyzer)
- **Fase 6** — Métricas
- **Fase 7** — GitHub Actions

## Regras de ouro aprendidas

1. Toda edição deve ser feita dentro do Postman — senão se perde no próximo export.
2. Edição feita pelo Claude direto no arquivo precisa ser copiada pra pasta local antes do próximo export/commit sobrescrever.
3. Debugar por causa raiz, não falha por falha.
4. No Cypress: sempre inspecionar os seletores reais na página antes de escrever o código — evitou qualquer loop de debug na Fase 3.
5. Nem tudo que parece "faltando testar" é um problema seu — às vezes a funcionalidade simplesmente não existe na interface, e isso também é um achado de QA válido.
