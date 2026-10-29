# QA Pipeline: ServeRest + Automação + IA

[![QA Pipeline](https://github.com/ThiagoHAlonso/qa-serverest-ai/actions/workflows/qa.yml/badge.svg?event=push)](https://github.com/ThiagoHAlonso/qa-serverest-ai/actions/workflows/qa.yml)

Projeto de portfólio que mostra uma estratégia de QA de ponta a ponta sobre o [ServeRest](https://serverest.dev/) (API + front-end de e-commerce): testes de API, testes E2E, métricas, uma camada de IA que sugere cenários, revisa os testes e analisa falhas, e tudo rodando automaticamente no GitHub Actions.

## Resultados

| Camada | Ferramenta | Cobertura | Resultado |
|---|---|---|---|
| API | Postman + Newman | 27 requests em 4 módulos (Login, Usuários, Produtos, Carrinhos) e 61 assertions | 0 falhas |
| E2E | Cypress (Page Object Model) | 3 specs e 5 testes (login, cadastro de usuário, cadastro de produto) | 0 falhas |
| CI/CD | GitHub Actions | 2 jobs em paralelo, a cada push e pull request | verde |

## O que o projeto demonstra

- **Estratégia de QA:** escopo, matriz de risco por módulo e critérios de entrada e saída ([ESTRATEGIA-QA.md](./ESTRATEGIA-QA.md)).
- **Automação de API:** cenários positivos e negativos, variáveis encadeadas (token e IDs entre requests) e validação de contrato.
- **Dados de teste dinâmicos:** o ServeRest público é compartilhado e os dados mudam, então os testes criam os próprios usuários com e-mails únicos em vez de depender de credenciais fixas.
- **E2E com Page Object Model:** seletores `data-testid` confirmados na página real e preparação de dados via API.
- **IA aplicada a QA:** geração de cenários, revisão da suíte e triagem automática de falhas.
- **Métricas:** dashboard HTML e resumo direto na página de cada execução.
- **Investigação de causa raiz:** a suíte de API foi depurada de 40 falhas para zero encontrando 7 causas raiz, e os defeitos do sistema estão documentados ([DEFEITOS-CONHECIDOS.md](./DEFEITOS-CONHECIDOS.md)).

## Arquitetura

```
ServeRest (alvo: API + front-end)
  -> Estratégia de QA
  -> Testes de API (Postman/Newman) + Testes E2E (Cypress)
  -> Dashboard de métricas
  -> Camada de IA (Gemini): gerar, revisar e analisar falhas
  -> GitHub Actions (CI/CD)
```

## Pipeline (GitHub Actions)

O workflow [`qa.yml`](./.github/workflows/qa.yml) roda a cada push na `main`, a cada pull request e também sob demanda.

- **Job `testes-de-api`:** roda a collection no Newman. Se algo falhar, o Failure Analyzer classifica as falhas com IA. Depois gera o dashboard, publica os relatórios como artifact e escreve o resumo na página da execução.
- **Job `testes-e2e`:** roda os specs do Cypress no Chrome (em paralelo ao job de API) e guarda os screenshots se houver falha.
- **Demonstração da IA:** em **Actions > QA Pipeline > Run workflow**, marque "Simular uma falha de teste". O pipeline planta uma falha proposital, fica vermelho e mostra a análise da IA no resumo da execução.
- **Secret:** o passo da IA usa `GEMINI_API_KEY` (Settings > Secrets and variables > Actions). Sem ele, o passo é apenas pulado.

## Camada de IA (Google Gemini)

| Script | O que faz | Saída |
|---|---|---|
| `ai/test-generator.js` | Lê a estratégia e os casos já cobertos e sugere 10 cenários novos (bordas, negativos, fluxos combinados) | `reports/sugestoes-de-teste.json` |
| `ai/test-reviewer.js` | Revisa os specs do Cypress e a collection: pontos fortes, lacunas, anti-padrões e melhorias | `reports/revisao-de-testes.md` |
| `ai/failure-analyzer.js` | Lê o relatório do Newman e classifica cada falha (bug real, teste flaky, problema de ambiente ou teste desatualizado) | `reports/analise-de-falhas.json` |

Os scripts usam o plano gratuito da API, então têm limite de tempo, nova tentativa automática para erros de rede ou servidor ocupado e, em caso de falha total, um diagnóstico da conexão no log.

## Como rodar localmente

Pré-requisitos: Node.js 22 ou superior e Google Chrome.

```bash
npm ci

# Testes de API (gera newman-report.json)
npx newman run collection.json --reporters cli,json --reporter-json-export newman-report.json

# Dashboard de métricas (gera reports/dashboard.html)
node scripts/gerar-dashboard.js

# Testes E2E
npx cypress open        # modo interativo
npx cypress run         # modo headless
```

Para os scripts de IA, crie um arquivo `.env` na raiz com `GEMINI_API_KEY=sua-chave` (chave gratuita no Google AI Studio) e rode:

```bash
node ai/test-generator.js
node ai/test-reviewer.js
node ai/failure-analyzer.js   # precisa de um newman-report.json com falhas
```

## Documentação

- [Estratégia de QA](./ESTRATEGIA-QA.md)
- [Casos de teste](./CASOS-DE-TESTE.md)
- [Defeitos e limitações conhecidas](./DEFEITOS-CONHECIDOS.md)

## Defeitos e limitações encontrados

- **DC-01:** o campo de preço do cadastro de produto não aceita valores decimais (só números inteiros).
- **DC-02:** a tela de carrinho no front-end mostra "Em construção aguarde", então o fluxo de carrinho é coberto apenas pela API.

## Estrutura do repositório

```
qa-serverest-ai/
├── .github/workflows/qa.yml      pipeline de CI/CD
├── collection.json               collection do Postman (testes de API)
├── cypress/
│   ├── e2e/                      specs: login, cadastro de usuário, cadastro de produto
│   ├── support/pages/            Page Objects
│   └── fixtures/                 massa de apoio (imagem do produto)
├── ai/                           Test Generator, Test Reviewer e Failure Analyzer
├── scripts/gerar-dashboard.js    dashboard de métricas
├── reports/                      saídas da IA (sugestões e revisão)
├── ESTRATEGIA-QA.md
├── CASOS-DE-TESTE.md
├── DEFEITOS-CONHECIDOS.md
├── HANDOFF-progresso.md          notas de continuidade do projeto
└── cypress.config.js, package.json
```

## Autor

**Thiago Alonso**, QA em formação, com foco em automação de testes e IA aplicada à qualidade.
GitHub: [@ThiagoHAlonso](https://github.com/ThiagoHAlonso)
