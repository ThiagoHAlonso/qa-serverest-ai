# Handoff - Projeto QA ServeRest + Postman + Cypress + IA

Documento de continuidade. Cole o conteúdo disso numa nova conversa com o Claude pra retomar o projeto sem perder contexto.

## O projeto

Portfólio de QA integrando ServeRest, Postman/Newman, Cypress e uma camada de IA para geração de testes, revisão e análise de falhas, com CI/CD em GitHub Actions.

- **Repositório GitHub:** https://github.com/ThiagoHAlonso/qa-serverest-ai (público)
- **Repositório local:** `C:\Devlopment\Solo\Postman\serverest-QA`

## Roadmap (fases)

- [x] **Fase 0** - Setup do repositório
- [x] **Fase 1** - Estratégia de QA
- [x] **Fase 2** - Testes de API (Postman/Newman): 28 requests HTTP, 61 assertions, 0 falhas
- [x] **Fase 3** - Testes E2E (Cypress): 5 testes, 0 falhas
- [x] **Fase 4** - Casos de teste e defeitos conhecidos documentados
- [x] **Fase 5** - Camada de IA: Test Generator, Test Reviewer e Failure Analyzer (Gemini)
- [x] **Fase 6** - Métricas: dashboard HTML gerado a partir do relatório do Newman
- [~] **Fase 7** - GitHub Actions (CI/CD): **EM ANDAMENTO** (ver abaixo)

## Fase 7 - GitHub Actions

Workflow em `.github/workflows/qa.yml` (a pasta precisa ter exatamente esse caminho). Gatilhos: push na `main`, pull request e execução manual (`workflow_dispatch`).

**Feito e validado:**
- Job `testes-de-api`: checkout, Node 22, Newman, dashboard, upload do artifact `relatorios-qa` (dashboard.html, metricas.json, newman-report.json) e resumo com a tabela por módulo na página da execução. Execução #1 verde em 22 s: 28 requests, 61 assertions, 0 falhas (tempo médio 90 ms no GitHub contra ~290 ms local).

**Escrito, aguardando a primeira execução real:**
- Job `testes-e2e`: roda os 3 specs do Cypress (login, cadastro-usuario, cadastro-produto) com `cypress-io/github-action@v7` e Chrome. Em caso de falha, publica os screenshots como artifact `cypress-screenshots`. Roda em paralelo ao job de API. O `qa.yml` novo precisa ser commitado e enviado.

**Versões das actions (verificadas em 2026-10):** `actions/checkout@v6`, `actions/setup-node@v6`, `actions/upload-artifact@v7`, `cypress-io/github-action@v7`. O GitHub removeu o Node 20 dos runners em setembro de 2026, então versões antigas (checkout/setup-node v4, cypress action v6) estão obsoletas. Conferir as versões antes de criar novos workflows.

**Próximas sub-etapas:**
1. Confirmar a primeira execução do job do Cypress (se falhar, copiar o log do passo que ficou vermelho).
2. Rodar o Failure Analyzer só quando houver falha, usando o secret `GEMINI_API_KEY` (Settings > Secrets and variables > Actions, nunca imprimir a chave em log). O script precisa de `npm ci` no job para ter as dependências (`@google/generative-ai`, `dotenv`).
3. Badge de status do pipeline no README.
4. Opcional: publicar o dashboard com GitHub Pages; execução agendada (`schedule`).

**Pendência opcional de higiene:** conferir com `git ls-files cypress/e2e` se os specs de exemplo do Cypress (`1-getting-started/`, `2-advanced-examples/`, `spec.cy.js`) estão versionados. Se estiverem, remover com `git rm -r` pra deixar o portfólio só com os testes autorais.

## Fase 5 - Camada de IA (COMPLETA)

A API da Anthropic não funciona no plano gratuito via script (exige créditos pagos), então o projeto usa o **Google Gemini** (Google AI Studio). Chave em `.env` como `GEMINI_API_KEY`. Modelo atual confirmado: `gemini-3.8-flash` (modelos antigos foram descontinuados; se der 404, o nome correto costuma aparecer na mensagem de erro). Todos os scripts têm retry automático para erros 503.

- `ai/test-generator.js`: gera 10 cenários novos em `reports/sugestoes-de-teste.json`.
- `ai/test-reviewer.js`: revisa specs do Cypress e a collection em `reports/revisao-de-testes.md`.
- `ai/failure-analyzer.js`: lê `newman-report.json` e classifica as falhas em `reports/analise-de-falhas.json`.

Melhoria futura: agrupar falhas em cascata por causa raiz.

## Fase 6 - Métricas (COMPLETA)

`scripts/gerar-dashboard.js` lê `newman-report.json` e `collection.json` e gera `reports/dashboard.html` e `reports/metricas.json`. Quando roda no GitHub Actions, também escreve o resumo da execução (`GITHUB_STEP_SUMMARY`).

```
npx newman run collection.json --reporters cli,json --reporter-json-export newman-report.json
node scripts/gerar-dashboard.js
start reports/dashboard.html
```

O Newman registra duas execuções do request que usa `pm.sendRequest` no pre-request (Login); o script agrupa por módulo + request e confere se a soma bate com o total.

## Estrutura atual do repositório

```
qa-serverest-ai/
├── .github/workflows/qa.yml       pipeline do GitHub Actions
├── collection.json                28 requests, 61 assertions (na raiz, não em postman/)
├── cypress/
│   ├── e2e/                       login, cadastro-usuario, cadastro-produto
│   ├── support/pages/             LoginPage, CadastroUsuarioPage, CadastroProdutoPage
│   └── fixtures/produto.png
├── ai/                            test-generator.js, test-reviewer.js, failure-analyzer.js
├── scripts/gerar-dashboard.js
├── reports/                       sugestoes-de-teste.json, revisao-de-testes.md (versionados)
│                                  dashboard.html, metricas.json, analise-de-falhas.json (gerados, fora do Git)
├── .env                           GEMINI_API_KEY (protegido pelo .gitignore)
├── .gitignore, cypress.config.js, package.json
└── README.md, ESTRATEGIA-QA.md, CASOS-DE-TESTE.md, DEFEITOS-CONHECIDOS.md, HANDOFF-progresso.md
```

## Seletores Cypress confirmados

- **Login:** `data-testid="email"`, `"senha"`, `"entrar"`
- **Cadastro Usuário:** `"nome"`, `"email"`, `"password"` (diferente do login), `"checkbox"`, `"cadastrarUsuario"`
- **Cadastro Produto:** `"nome"`, `"preco"`, `"descricao"`, `"quantity"`, `"imagem"`, `"cadastarProdutos"` (typo no app)

## Defeitos conhecidos documentados

- **DC-01:** campo de preço não aceita decimais (só inteiros)
- **DC-02:** tela de Carrinho no front mostra "Em construção aguarde", não testável via E2E

## Regras de ouro aprendidas

1. **A fonte da verdade é o `collection.json` do repositório, não a cópia dentro do Postman.** Exportar do Postman sobrescreve o arquivo e traz de volta bugs já corrigidos. Para recuperar: `git restore collection.json`.
2. Edição feita pelo Claude direto no arquivo precisa ser copiada pra pasta local antes do próximo commit.
3. Debugar por causa raiz, não falha por falha.
4. No Cypress: inspecionar os seletores reais na página antes de escrever o código.
5. Nem tudo que parece "faltando testar" é problema seu; às vezes a funcionalidade não existe na interface.
6. NUNCA commitar o `.env`. Confirmar com `git status` antes de `git push`.
7. A API da Anthropic não funciona no plano gratuito via script; usar Gemini.
8. Nomes de modelo do Gemini mudam com frequência; se der 404, a mensagem de erro costuma apontar o nome atual.
9. Preferir baixar e trocar o arquivo inteiro a colar heredocs no PowerShell.
10. Arquivos gerados a cada execução (relatórios, dashboard) ficam fora do Git.
11. Teste com dados simulados não pega as peculiaridades do formato real. Validar um script novo com a saída real e deixar conferências automáticas no código.
12. Versões de actions do GitHub mudam e ficam obsoletas. Conferir as versões atuais antes de escrever um workflow e validar o arquivo com `actionlint`.
13. O workflow só é lido se estiver em `.github/workflows/`. O push que adiciona ou altera o workflow é o gatilho da execução.
