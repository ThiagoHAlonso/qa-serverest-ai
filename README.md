# 🧪 QA Pipeline — ServeRest + Automação + IA


Projeto de portfólio que demonstra uma estratégia de QA completa sobre a API [ServeRest](https://serverest.dev/), combinando testes de API, testes E2E e uma camada de ferramentas de IA para geração, revisão e triagem de testes.

## 🎯 Objetivo

Mostrar, na prática, como um QA pode usar IA como parte do processo de qualidade — não só como assistente de código, mas como um agente que gera cenários de teste, revisa a cobertura e analisa falhas.

## 🏗️ Arquitetura


```text
ServeRest (alvo)
  → Estratégia de QA
  → Postman + Cypress (API e E2E)
  → Casos de teste e defeitos conhecidos
  → Camada de IA (Test Generator, Reviewer, Failure Analyzer)
  → Métricas
  → GitHub Actions (CI/CD)
🛠️ Stack

svg

Testes de API: Postman / Newman
Testes E2E: Cypress (Page Object Model)
IA: Claude API (Anthropic)
CI/CD: GitHub Actions
Alvo dos testes: ServeRest — API + front-end de e-commerce fictício
📊 Status do Projeto

svg

Fase 0 — Setup do repositório
Fase 1 — Estratégia de QA
Fase 2 — Testes de API (Postman/Newman) — 28 requests, 61 assertions, 0 falhas
Fase 3 — Testes E2E (Cypress)
Fase 4 — Casos de teste e defeitos conhecidos
Fase 5 — Camada de IA
Fase 6 — Métricas
Fase 7 — GitHub Actions
📁 Estrutura de Pastas

svg

qa-serverest-ai/
├── postman/             → collection e environment do ServeRest
├── cypress/             → e2e/, fixtures/, support/ (Page Object Model)
├── test-cases/          → casos de teste e cenários de defeitos conhecidos
├── ai/                  → scripts do Test Generator, Reviewer e Failure Analyzer
├── reports/             → saída dos testes e métricas
└── .github/workflows/   → pipelines do GitHub Actions
🚀 Como Rodar Localmente

svg

Testes de API
npx newman run postman/collection.json
Testes E2E
npx cypress open
📚 Documentação

svg

Estratégia de QA
Handoff de progresso
👨‍💻 Autor

svg

Thiago — QA em transição de carreira, com foco em automação e IA aplicada a testes.
