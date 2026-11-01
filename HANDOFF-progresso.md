# Handoff - Projeto QA ServeRest + Postman + Cypress + IA

Documento de continuidade. Cole o conteúdo numa nova conversa com o Claude para retomar o projeto sem perder contexto.

## Estado: projeto concluído (Fases 0 a 7)

- **Repositório:** https://github.com/ThiagoHAlonso/qa-serverest-ai (público)
- **Pasta local:** `C:\Devlopment\Solo\Postman\serverest-QA`

| Fase | Entrega | Resultado |
|---|---|---|
| 0 e 1 | Repositório e estratégia de QA | `ESTRATEGIA-QA.md` com matriz de risco |
| 2 | API (Postman/Newman), `collection.json` na raiz | 27 requests, 28 chamadas HTTP, 61 assertions, 0 falhas |
| 3 | E2E (Cypress, Page Object Model) | 3 specs, 5 testes, 0 falhas |
| 4 | Documentação | `CASOS-DE-TESTE.md` e `DEFEITOS-CONHECIDOS.md` |
| 5 | IA (Google Gemini) | Test Generator, Test Reviewer, Failure Analyzer |
| 6 | Métricas | `scripts/gerar-dashboard.js` gera `reports/dashboard.html` e `metricas.json` |
| 7 | GitHub Actions | `.github/workflows/qa.yml`, 2 jobs em paralelo, selo no README |

## Como o pipeline funciona

- Gatilhos: push na `main`, pull request e execução manual.
- Job `testes-de-api`: Newman, depois (só se falhar) o Failure Analyzer, depois o dashboard e o upload do artifact `relatorios-qa`. O resumo aparece na página da execução.
- Job `testes-e2e`: Cypress no Chrome (`cypress-io/github-action`), com screenshots como artifact se falhar.
- **Falha simulada:** Actions > QA Pipeline > Run workflow > marcar "Simular uma falha". Planta uma falha na collection (cópia gerada em tempo de execução), fica vermelho de propósito e mostra a análise da IA. Execuções vermelhas com "Manually run" são essa demonstração.
- Secret necessário: `GEMINI_API_KEY` (sem ele o passo da IA é pulado). O passo da IA usa `continue-on-error`.
- Selo do README com `?event=push`, para demonstrações manuais não mudarem o status.
- Versões das actions (conferidas em 2026-10): `checkout@v6`, `setup-node@v6`, `upload-artifact@v7`, `cypress-io/github-action@v7`. O GitHub removeu o Node 20 dos runners em set/2026, então versões antigas ficam obsoletas. Validar workflows com `actionlint`.

## Decisões importantes

- **Gemini em vez de Anthropic:** a API da Anthropic exige créditos pagos via script. O Gemini tem plano gratuito, que fica sobrecarregado com frequência.
- **Modelo atual:** `gemini-3.8-flash`. Se der 404, a mensagem de erro (ou o diagnóstico do Failure Analyzer) mostra os modelos disponíveis.
- **Resiliência:** os scripts usam timeout de 45 s por chamada, até 3 tentativas para erro de rede, 503, 429 ou tempo esgotado, e diagnóstico da conexão se tudo falhar. O limite padrão do Node para uma resposta que não chega é de 5 minutos, por isso sempre definir timeout em chamadas externas.
- **Fonte da verdade:** o `collection.json` do repositório. A cópia dentro do Postman fica velha; exportar de lá sobrescreve o arquivo e traz os bugs de volta (recuperar com `git restore collection.json`).
- **Dados dinâmicos:** o ServeRest público é compartilhado, então os testes criam usuários próprios com e-mails únicos.

## Pendências opcionais

1. Seção "Demonstração" do README com 3 prints em `docs/img/` (`pipeline-execucoes.png`, `failure-analyzer-resumo.png`, `dashboard.png`), se ainda não foi feita.
2. Trocar a chave do Gemini uma última vez (as anteriores passaram pelo chat): gerar nova, atualizar `.env` e o secret do GitHub, apagar as antigas no Google AI Studio.
3. Conferir com `git ls-files cypress/e2e` se os specs de exemplo do Cypress estão versionados e remover (`git rm -r`).
4. Olhar o aviso de vulnerabilidades do `npm ci` com `npm audit` (dependências de desenvolvimento).
5. Melhorias futuras: agrupar falhas em cascata por causa raiz no Failure Analyzer, publicar o dashboard com GitHub Pages, execução agendada (`schedule`).

## Regras de ouro aprendidas

1. Debugar por causa raiz, não falha por falha: uma causa pode derrubar dezenas de assertions em cascata.
2. Inspecionar os seletores reais da página antes de escrever o teste de UI.
3. NUNCA commitar o `.env` nem colar chaves em chats, documentos ou arquivos versionados. Conferir com `git status` antes do `git push`.
4. Arquivos gerados a cada execução (relatórios, dashboard) ficam fora do Git.
5. Teste com dados simulados não pega as peculiaridades do formato real: validar com a saída real e deixar conferências automáticas no código.
6. "Re-run jobs" reexecuta o commit antigo. Para testar uma correção, faça uma execução nova.
7. Conferir as versões atuais das actions antes de escrever um workflow.
8. O workflow só é lido em `.github/workflows/`, e o push que o altera é o gatilho da execução.
9. Edição feita direto no arquivo precisa ser copiada para a pasta local do projeto antes do próximo commit.
10. Nem tudo que parece faltar testar é problema do teste: às vezes a funcionalidade não existe na interface (caso do carrinho).
