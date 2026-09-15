# Handoff — Projeto QA ServeRest + Postman + Cypress + IA

Documento de continuidade. Cole o conteúdo disso numa nova conversa com o Claude pra retomar o projeto sem perder contexto.

## O projeto

Portfólio de QA integrando ServeRest, Postman/Newman, Cypress e uma camada de IA (Claude) para geração de testes, revisão e análise de falhas, com CI/CD em GitHub Actions. Repositório local do Postman em `C:\Devlopment\Solo\Postman\serverest-QA`.

## Roadmap (fases)

- [x] **Fase 0** — Setup do repositório (README.md e ESTRATEGIA-QA.md já gerados)
- [x] **Fase 1** — Estratégia de QA (matriz de risco por módulo: Login, Usuários, Produtos, Carrinhos)
- [~] **Fase 2** — Testes de API (Postman/Newman) — **quase 100% completa**, 63 de 64 assertions passando, falta 1 ajuste já pronto (ver abaixo)
- [ ] Fase 3 — Testes E2E (Cypress, reaproveitando o POM do projeto OrangeHRM)
- [ ] Fase 4 — Casos de teste e defeitos conhecidos documentados
- [ ] Fase 5 — Camada de IA (Test Generator, Reviewer, Failure Analyzer)
- [ ] Fase 6 — Métricas
- [ ] Fase 7 — GitHub Actions (CI/CD)

## Estado da collection Postman — histórico de bugs já RESOLVIDOS

1. **`baseUrl` ausente do JSON** — a variável não existia de fato no array `"variable"` da collection, mesmo aparecendo na interface do Postman. Resolvido adicionando-a diretamente no JSON e confirmando a presença no arquivo.
2. **Emails fixos colidindo** — "Cadastrar Novo Usuário (Admin)" e "Cadastrar Usuário Comum" usavam emails fixos (`fulano@qa.com`, `comprador@loja.com`) que já existiam no servidor. Resolvido com pre-request scripts que geram emails únicos por timestamp (`{{emailTemp}}`, `{{emailComum}}`).
3. **Login com credenciais mortas** — o Login usava um email/senha fixos que deixaram de funcionar no ServeRest (ambiente público, dados mudam). Resolvido: o Login agora tem um pre-request script que **cria um usuário admin novo antes de logar**, com timestamp, garantindo que sempre existe uma conta válida.
4. **Ordem de execução errada** — os "Buscar por ID" (Usuário, Produto, Carrinho) rodavam antes dos "Cadastrar/Criar" correspondentes. Resolvido reordenando os requests dentro de cada pasta.
5. **Produto deletado cedo demais** — o "DELETE Remover Produto por ID" limpava a variável `produtoId` antes da pasta Carrinhos precisar dele. Resolvido movendo esse DELETE pro final de toda a collection.
6. **Concluir Compra vs. Cancelar Compra disputando o mesmo carrinho** — os dois testes agiam sobre o mesmo carrinho, e o primeiro (Concluir) sempre consumia o carrinho antes do segundo (Cancelar) rodar. Resolvido duplicando o request "Criar Carrinho" e inserindo essa cópia entre os dois testes, dando um carrinho exclusivo pra cada um.

## Único item pendente agora

O teste "Mensagem de cancelamento" (dentro de "DELETE - Cancelar Compra") esperava a frase **exata** `"Registro excluído com sucesso"`, mas o ServeRest retorna uma frase mais longa (avisando que o estoque foi reposto). Já troquei o assert de `.to.eql(...)` para `.to.include(...)` — só que essa correção existe apenas no `collection.json` gerado no chat, **ainda não foi copiada pra pasta local do usuário**. Nas duas últimas rodadas de Newman, o erro persistiu porque o arquivo local continuava sendo o antigo.

### Passo imediato pra fechar a Fase 2

1. Baixar o `collection.json` mais recente compartilhado no chat (já tem o `.to.include(...)` aplicado)
2. Substituir o arquivo em `C:\Devlopment\Solo\Postman\serverest-QA\collection.json`
3. Rodar `npx newman run collection.json`
4. Esperado: 64/64 assertions passando (0 falhas) — aí a Fase 2 está oficialmente completa

## Regras de ouro aprendidas (repetir sempre)

1. Toda edição feita **só no arquivo exportado**, sem replicar dentro do Postman, se perde no próximo export feito de dentro do Postman.
2. Sempre que o Claude edita o `collection.json` diretamente no chat, essa edição só existe no arquivo baixado — precisa ser **copiada pra pasta local** (e idealmente reimportada no Postman) pra não se perder e pra não ser sobrescrita num próximo export.
3. Ao exportar do Postman, prestar atenção na extensão do arquivo salvo (deve ser `collection.json`, não só `collection` sem extensão) e na pasta de destino (deve ser a pasta do projeto, não Downloads).

## Depois que a Fase 2 fechar

Seguir pra Fase 3 (Cypress, reaproveitando o Page Object Model do projeto OrangeHRM: github.com/ThiagoHAlonso/first-test-E2E) e depois Fase 4 (documentar casos de teste e defeitos conhecidos).
