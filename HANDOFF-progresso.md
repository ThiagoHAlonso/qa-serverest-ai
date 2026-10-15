# Handoff - Projeto QA ServeRest + Postman + Cypress + IA

Documento de continuidade. Cole o conteúdo disso numa nova conversa com o Claude pra retomar o projeto sem perder contexto.

## O projeto

Portfólio de QA integrando ServeRest, Postman/Newman, Cypress e uma camada de IA para geração de testes, revisão e análise de falhas, com CI/CD em GitHub Actions.

- **Repositório GitHub:** https://github.com/ThiagoHAlonso/qa-serverest-ai (público)
- **Repositório local:** `C:\Devlopment\Solo\Postman\serverest-QA`

## Roadmap (fases)

- [x] **Fase 0** - Setup do repositório
- [x] **Fase 1** - Estratégia de QA
- [x] **Fase 2** - Testes de API (Postman/Newman): 28 requests, 61 assertions, 0 falhas
- [x] **Fase 3** - Testes E2E (Cypress): 5 testes, 0 falhas
- [x] **Fase 4** - Casos de teste e defeitos conhecidos documentados
- [x] **Fase 5** - Camada de IA: Test Generator, Test Reviewer e Failure Analyzer (Gemini)
- [x] **Fase 6** - Métricas: dashboard HTML gerado a partir do relatório do Newman
- [ ] **Fase 7** - GitHub Actions (CI/CD) ← **PRÓXIMA**

## Commits pendentes (conferir com `git log` e `git status` antes)

1. **Camada de IA.** Antes, adicionar a linha `newman-report.json` ao `.gitignore`. Depois:
   ```
   git add ai/ package.json package-lock.json HANDOFF-progresso.md .gitignore reports/sugestoes-de-teste.json reports/revisao-de-testes.md
   git commit -m "feat: adiciona camada de IA com Gemini (Test Generator, Reviewer e Failure Analyzer)"
   git push
   ```
2. **Dashboard de métricas** (substituir antes o HANDOFF da pasta por esta versão):
   ```
   git add scripts/gerar-dashboard.js HANDOFF-progresso.md
   git commit -m "feat: adiciona dashboard de metricas gerado a partir do relatorio do Newman"
   git push
   ```

**Nunca commitar:** `.env`, `newman-report.json`, `reports/dashboard.html`, `reports/metricas.json`, `reports/analise-de-falhas.json` (são gerados a cada execução).

## Fase 5 - Camada de IA (COMPLETA)

A API da Anthropic não funciona no plano gratuito via script (exige créditos pagos), então o projeto usa o **Google Gemini** (Google AI Studio), com camada gratuita via API. Chave em `.env` como `GEMINI_API_KEY`.

Modelo atual confirmado: `gemini-3.8-flash`. Modelos antigos (`1.5`, `2.0`, `2.5`) estão indisponíveis; se der 404, o nome correto costuma aparecer na mensagem de erro. Todos os scripts têm retry automático (5 tentativas, espera crescente) para erros 503, comuns no tier gratuito.

- `ai/test-generator.js`: lê `CASOS-DE-TESTE.md` e `ESTRATEGIA-QA.md`, pede 10 cenários novos, salva em `reports/sugestoes-de-teste.json`.
- `ai/test-reviewer.js`: lê os specs do Cypress e o `collection.json`, gera a revisão em `reports/revisao-de-testes.md`.
- `ai/failure-analyzer.js`: lê `newman-report.json` e classifica cada falha (bug real, flaky, ambiente, teste desatualizado), salva em `reports/analise-de-falhas.json`. Validado com falhas reais.

Melhoria futura: agrupar falhas em cascata por causa raiz (hoje devolve uma linha por falha).

## Fase 6 - Métricas (COMPLETA)

`scripts/gerar-dashboard.js` lê `newman-report.json` e `collection.json` e gera `reports/dashboard.html` e `reports/metricas.json`.

```
npx newman run collection.json --reporters cli,json --reporter-json-export newman-report.json
node scripts/gerar-dashboard.js
start reports/dashboard.html
```

Mostra: requests HTTP executados, assertions, taxa de sucesso, duração, tempo médio de resposta, resultado por módulo, requests mais lentos e, quando há falhas, a lista delas com a classificação da IA (só se a análise for mais nova que o relatório).

Validado com dados reais: 28 requests HTTP, 61 assertions, 100%. Por módulo: Login 2 requests e 6 assertions, Usuários 9 e 21, Produtos 6 e 14, Carrinhos 10 e 20.

Peculiaridade do Newman: o request que usa `pm.sendRequest` no pre-request (Login) aparece duas vezes em `run.executions`, duplicando as assertions. O script agrupa por módulo + request e confere se a soma dos módulos bate com o total, avisando se não bater. O total de 28 requests HTTP inclui 1 chamada feita por script (criação do admin); a tabela por módulo mostra 27.

## Próximo passo: Fase 7 - GitHub Actions

Criar `.github/workflows/qa.yml`. Ordem sugerida, uma sub-etapa por vez:

1. Workflow mínimo: checkout, setup-node, `npm ci`, Newman rodando a collection.
2. Gerar o dashboard e publicar como artifact (`actions/upload-artifact`).
3. Adicionar o Cypress (`cypress-io/github-action`).
4. Rodar o Failure Analyzer só quando houver falha, usando o secret `GEMINI_API_KEY` (Settings > Secrets and variables > Actions).
5. Badge de status no README.

Cuidados: o ServeRest público é compartilhado (os testes já criam os próprios usuários); o Gemini gratuito dá 503 de vez em quando (retry já existe); nunca imprimir a chave em log.

## Estrutura atual do repositório

```
qa-serverest-ai/
├── collection.json                28 requests, 61 assertions (na raiz, não em postman/)
├── cypress/
│   ├── e2e/                       3 specs, 5 testes
│   ├── support/pages/             LoginPage, CadastroUsuarioPage, CadastroProdutoPage
│   └── fixtures/produto.png
├── ai/                            test-generator.js, test-reviewer.js, failure-analyzer.js
├── scripts/gerar-dashboard.js
├── reports/                       sugestoes-de-teste.json, revisao-de-testes.md (versionados)
│                                  dashboard.html, metricas.json, analise-de-falhas.json (gerados, não versionados)
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

1. **A fonte da verdade é o `collection.json` do repositório, não a cópia dentro do Postman.** Exportar do Postman sobrescreve o arquivo com a versão antiga e traz de volta os bugs já corrigidos. Para recuperar: `git restore collection.json`.
2. Edição feita pelo Claude direto no arquivo precisa ser copiada pra pasta local antes do próximo commit.
3. Debugar por causa raiz, não falha por falha.
4. No Cypress: inspecionar os seletores reais na página antes de escrever o código.
5. Nem tudo que parece "faltando testar" é problema seu; às vezes a funcionalidade não existe na interface.
6. NUNCA commitar o `.env`. Confirmar com `git status` antes de `git push`.
7. A API da Anthropic não funciona no plano gratuito via script; usar Gemini.
8. Nomes de modelo do Gemini mudam com frequência; se der 404, a mensagem de erro costuma apontar o nome atual.
9. Preferir baixar e trocar o arquivo inteiro a colar heredocs no PowerShell.
10. Arquivos gerados a cada execução (relatórios, dashboard) ficam fora do Git.
11. Teste com dados simulados não pega as peculiaridades do formato real (foi o caso do Login duplicado no relatório do Newman). Sempre validar um script novo com a saída real e deixar conferências automáticas no próprio código.
