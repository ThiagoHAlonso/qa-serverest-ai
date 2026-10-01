# QA Pipeline — ServeRest + Automação + IA

Projeto de portfólio que demonstra uma estratégia de QA completa sobre a API [ServeRest](https://serverest.dev/), combinando testes de API, testes E2E e uma camada de ferramentas de IA para geração, revisão e triagem de testes.

## Objetivo

Mostrar, na prática, como um QA pode usar IA como parte do processo de qualidade — não só como assistente de código, mas como um agente que gera cenários de teste, revisa a cobertura e analisa falhas.

## Arquitetura

```
ServeRest (alvo)
  → Estratégia de QA
  → Postman + Cypress (API e E2E)
  → Casos de teste e defeitos conhecidos
  → Camada de IA (Test Generator, Reviewer, Failure Analyzer)
  → Métricas
  → GitHub Actions (CI/CD)
```

## Stack

- **Testes de API:** Postman / Newman
- **Testes E2E:** Cypress (Page Object Model)
- **IA:** Claude API (Anthropic)
- **CI/CD:** GitHub Actions
- **Alvo dos testes:** [ServeRest](https://serverest.dev/) — API + front-end de e-commerce fictício

## Status do projeto

- [x] Fase 0 — Setup do repositório
- [x] Fase 1 — Estratégia de QA
- [x] Fase 2 — Testes de API (Postman/Newman) — 28 requests, 61 assertions, 0 falhas
- [x] Fase 3 — Testes E2E (Cypress) — 5 testes, 0 falhas
- [x] Fase 4 — Casos de teste e defeitos conhecidos
- [ ] Fase 5 — Camada de IA
- [ ] Fase 6 — Métricas
- [ ] Fase 7 — GitHub Actions

## Estrutura de pastas

```
qa-serverest-ai/
├── postman/             → collection e environment do ServeRest
├── cypress/              → e2e/, fixtures/, support/pages/ (Page Object Model)
├── ai/                    → scripts do Test Generator, Reviewer e Failure Analyzer
├── reports/               → saída dos testes e métricas
└── .github/workflows/     → pipelines do GitHub Actions
```

## Como rodar localmente

```bash
# Testes de API
npx newman run postman/collection.json

# Testes E2E
npx cypress open
```

## Documentação

- [Estratégia de QA](./ESTRATEGIA-QA.md)
- [Casos de teste](./CASOS-DE-TESTE.md)
- [Defeitos conhecidos](./DEFEITOS-CONHECIDOS.md)
- [Handoff de progresso](./HANDOFF-progresso.md)

## Autor

Thiago — QA em transição de carreira, com foco em automação e IA aplicada a testes.
