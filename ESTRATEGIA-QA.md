# Estratégia de QA — ServeRest

## 1. Objetivo

Definir o escopo, os riscos e os critérios de teste para o projeto de automação sobre a API e a interface do ServeRest, servindo de base para as fases seguintes (Postman, Cypress, IA e CI/CD).

## 2. Aplicação sob teste

**ServeRest** (https://serverest.dev/) — API REST pública criada para prática de testes, com front-end de e-commerce fictício associado (http://front.serverest.dev). Módulos principais:

| Módulo | Descrição | Endpoint base |
|---|---|---|
| Login | Autenticação e geração de token | `/login` |
| Usuários | Cadastro, edição, listagem e exclusão de usuários | `/usuarios` |
| Produtos | CRUD de produtos (edição/exclusão exige token de admin) | `/produtos` |
| Carrinhos | Criação, conclusão e cancelamento de compra | `/carrinhos` |

## 3. Escopo

**Dentro do escopo:**
- Testes funcionais de API (cenários positivos e negativos) para os 4 módulos acima
- Testes E2E de UI para os fluxos equivalentes no front-end (login, cadastro, compra)
- Testes exploratórios manuais complementares nos módulos de maior risco

**Fora do escopo:**
- Testes de carga/performance
- Testes de segurança aprofundados (pentest)
- Testes de acessibilidade

## 4. Matriz de risco

| Módulo | Risco | Prioridade | Justificativa |
|---|---|---|---|
| Login | Alto | P0 | Bloqueia o acesso a todos os módulos autenticados |
| Carrinhos | Alto | P0 | Regra de negócio mais complexa (estoque, quantidade, status da compra) |
| Usuários | Médio | P1 | CRUD relativamente simples, mas é a base da autenticação |
| Produtos | Médio | P1 | CRUD simples, porém depende de permissão de administrador |

## 5. Tipos de teste

- **Funcional de API:** cenários positivos, negativos, validação de contrato (schema) e status code
- **E2E:** fluxos críticos de usuário na interface (cadastro, login, montagem e finalização de compra)
- **Exploratório:** sessões livres focadas nos módulos P0

## 6. Critérios de entrada

- Ambiente ServeRest acessível (API e front-end)
- Massa de dados de teste definida (usuários comuns, usuário admin, produtos de teste)

## 7. Critérios de saída

- 100% dos casos de teste planejados executados
- Nenhum defeito crítico (P0) em aberto sem justificativa registrada
- Pipeline de CI/CD executando sem falhas de infraestrutura

## 8. Ferramentas

Postman/Newman, Cypress, GitHub Actions, e Claude (Anthropic) para geração de cenários, revisão de testes e análise de falhas.

## 9. Próximos passos

Ver o roadmap completo de fases no [README](./README.md).
