const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..');
const relatorioPath = path.join(raiz, 'newman-report.json');
const colecaoPath = path.join(raiz, 'collection.json');
const analisePath = path.join(raiz, 'reports', 'analise-de-falhas.json');
const saidaHtml = path.join(raiz, 'reports', 'dashboard.html');
const saidaJson = path.join(raiz, 'reports', 'metricas.json');

if (!fs.existsSync(relatorioPath)) {
  console.error('newman-report.json não encontrado. Rode antes:');
  console.error('npx newman run collection.json --reporters cli,json --reporter-json-export newman-report.json');
  process.exit(1);
}

const relatorio = JSON.parse(fs.readFileSync(relatorioPath, 'utf-8'));
const colecao = JSON.parse(fs.readFileSync(colecaoPath, 'utf-8'));
const run = relatorio.run;

// Mapa: nome do request -> módulo (pasta da collection)
const moduloPorRequest = {};
function mapear(items, pasta) {
  items.forEach((it) => {
    if (it.item) mapear(it.item, it.name);
    else moduloPorRequest[it.name] = pasta || 'Sem pasta';
  });
}
mapear(colecao.item, null);

// Dados por request. O Newman pode registrar mais de uma execução para o mesmo
// request (ex: quando o pre-request script faz pm.sendRequest). Por isso agrupamos
// por módulo + nome e ficamos com a execução que tem mais assertions
// (a mais recente, em caso de empate).
const porRequest = new Map();
(run.executions || []).forEach((e) => {
  const asserts = e.assertions || [];
  const modulo = moduloPorRequest[e.item.name] || 'Outros';
  const registro = {
    nome: e.item.name,
    modulo,
    tempo: e.response && typeof e.response.responseTime === 'number' ? e.response.responseTime : null,
    assertions: asserts.length,
    falhas: asserts.filter((a) => a.error).length,
  };
  const chave = `${modulo}::${e.item.name}`;
  const anterior = porRequest.get(chave);
  if (!anterior || registro.assertions >= anterior.assertions) porRequest.set(chave, registro);
});
const execucoes = Array.from(porRequest.values());

// Dados por módulo
const modulos = {};
execucoes.forEach((e) => {
  const m = modulos[e.modulo] || (modulos[e.modulo] = { requests: 0, assertions: 0, falhas: 0, tempos: [] });
  m.requests += 1;
  m.assertions += e.assertions;
  m.falhas += e.falhas;
  if (e.tempo !== null) m.tempos.push(e.tempo);
});
Object.values(modulos).forEach((m) => {
  m.tempoMedio = m.tempos.length ? Math.round(m.tempos.reduce((a, b) => a + b, 0) / m.tempos.length) : 0;
  m.taxa = m.assertions ? ((m.assertions - m.falhas) / m.assertions) * 100 : 100;
});

// Totais
const stats = run.stats;
const totalAssertions = stats.assertions.total;
const falhasAssertions = stats.assertions.failed;
const taxaSucesso = totalAssertions ? ((totalAssertions - falhasAssertions) / totalAssertions) * 100 : 100;
const duracaoMs = run.timings.completed - run.timings.started;
const temposTodos = execucoes.filter((e) => e.tempo !== null).map((e) => e.tempo);
const tempoMedio =
  typeof run.timings.responseAverage === 'number'
    ? Math.round(run.timings.responseAverage)
    : temposTodos.length
    ? Math.round(temposTodos.reduce((a, b) => a + b, 0) / temposTodos.length)
    : 0;

const somaAssertionsModulos = execucoes.reduce((soma, e) => soma + e.assertions, 0);
const chamadasDeScripts = Math.max(stats.requests.total - execucoes.length, 0);
if (somaAssertionsModulos !== totalAssertions) {
  console.warn(
    `Atenção: a soma das assertions por módulo (${somaAssertionsModulos}) difere do total do Newman (${totalAssertions}).`
  );
}

const maisLentos = execucoes
  .filter((e) => e.tempo !== null)
  .sort((a, b) => b.tempo - a.tempo)
  .slice(0, 5);

const falhas = (run.failures || []).map((f) => ({
  nome: f.source && f.source.name ? f.source.name : 'desconhecido',
  mensagem: f.error && f.error.message ? f.error.message : '',
}));

// Classificação da IA: só entra se houver falhas e a análise for mais nova que o relatório
let classificacoes = null;
if (falhas.length > 0 && fs.existsSync(analisePath)) {
  const analiseAtual = fs.statSync(analisePath).mtimeMs >= fs.statSync(relatorioPath).mtimeMs;
  if (analiseAtual) {
    classificacoes = {};
    JSON.parse(fs.readFileSync(analisePath, 'utf-8')).forEach((a) => {
      classificacoes[a.classificacao] = (classificacoes[a.classificacao] || 0) + 1;
    });
  }
}

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pct = (n) => `${n.toFixed(1)}%`;
const corTaxa = (n) => (n >= 100 ? '#1a7f37' : n >= 90 ? '#9a6700' : '#cf222e');

const linhasModulos = Object.entries(modulos)
  .map(
    ([nome, m]) => `
      <tr>
        <td>${esc(nome)}</td>
        <td>${m.requests}</td>
        <td>${m.assertions}</td>
        <td>${m.falhas}</td>
        <td>${m.tempoMedio} ms</td>
        <td>
          <div class="barra"><div class="preenchimento" style="width:${m.taxa}%;background:${corTaxa(m.taxa)}"></div></div>
          ${pct(m.taxa)}
        </td>
      </tr>`
  )
  .join('');

const linhasLentos = maisLentos
  .map((e) => `<tr><td>${esc(e.nome)}</td><td>${esc(e.modulo)}</td><td>${e.tempo} ms</td></tr>`)
  .join('');

const secaoFalhas = falhas.length
  ? `<h2>Falhas desta execução (${falhas.length})</h2>
     <table><tr><th>Request</th><th>Mensagem</th></tr>
     ${falhas.map((f) => `<tr><td>${esc(f.nome)}</td><td>${esc(f.mensagem)}</td></tr>`).join('')}
     </table>`
  : '';

const secaoIA = classificacoes
  ? `<h2>Classificação das falhas pela IA</h2>
     <table><tr><th>Classificação</th><th>Quantidade</th></tr>
     ${Object.entries(classificacoes)
       .map(([c, n]) => `<tr><td>${esc(c)}</td><td>${n}</td></tr>`)
       .join('')}
     </table>`
  : '';

const notas = [];
if (chamadasDeScripts > 0) {
  notas.push(
    `O total geral conta ${chamadasDeScripts} chamada(s) HTTP feita(s) dentro de scripts (como a criação do usuário admin antes do login), que não aparecem como request na tabela por módulo.`
  );
}
if (somaAssertionsModulos !== totalAssertions) {
  notas.push(
    `Atenção: a soma das assertions por módulo (${somaAssertionsModulos}) difere do total do Newman (${totalAssertions}).`
  );
}
const notaHtml = notas.length ? `<p class="nota">${notas.map(esc).join('<br>')}</p>` : '';

const banner =
  falhasAssertions === 0
    ? '<div class="banner ok">Todas as assertions passaram</div>'
    : `<div class="banner erro">${falhasAssertions} assertion(s) falharam</div>`;

const geradoEm = new Date().toLocaleString('pt-BR');

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Dashboard de QA - ServeRest</title>
<style>
  body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; margin: 0; background: #f6f8fa; color: #1f2328; }
  main { max-width: 980px; margin: 0 auto; padding: 24px; }
  h1 { margin-bottom: 4px; }
  h2 { margin-top: 32px; }
  .sub { color: #656d76; margin-top: 0; }
  .banner { padding: 12px 16px; border-radius: 8px; font-weight: 600; margin: 16px 0; }
  .banner.ok { background: #dafbe1; color: #1a7f37; }
  .banner.erro { background: #ffebe9; color: #cf222e; }
  .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; }
  .card { background: #fff; border: 1px solid #d0d7de; border-radius: 8px; padding: 16px; }
  .card .valor { font-size: 28px; font-weight: 700; }
  .card .rotulo { color: #656d76; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #d0d7de; border-radius: 8px; }
  th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #d0d7de; font-size: 14px; }
  th { background: #f6f8fa; }
  .barra { background: #eaeef2; border-radius: 4px; height: 8px; width: 120px; display: inline-block; margin-right: 8px; vertical-align: middle; }
  .preenchimento { height: 8px; border-radius: 4px; }
  .nota { color: #656d76; font-size: 12px; margin-top: 8px; }
  footer { color: #656d76; font-size: 12px; margin-top: 32px; }
</style>
</head>
<body>
<main>
  <h1>Dashboard de QA - ServeRest</h1>
  <p class="sub">Resultado da suíte de API (Postman/Newman)</p>
  ${banner}
  <div class="cards">
    <div class="card"><div class="valor">${stats.requests.total}</div><div class="rotulo">Requests HTTP executados</div></div>
    <div class="card"><div class="valor">${totalAssertions}</div><div class="rotulo">Assertions</div></div>
    <div class="card"><div class="valor" style="color:${corTaxa(taxaSucesso)}">${pct(taxaSucesso)}</div><div class="rotulo">Taxa de sucesso</div></div>
    <div class="card"><div class="valor">${(duracaoMs / 1000).toFixed(1)} s</div><div class="rotulo">Duração total</div></div>
    <div class="card"><div class="valor">${tempoMedio} ms</div><div class="rotulo">Tempo médio de resposta</div></div>
  </div>

  <h2>Resultado por módulo</h2>
  <table>
    <tr><th>Módulo</th><th>Requests da collection</th><th>Assertions</th><th>Falhas</th><th>Tempo médio</th><th>Taxa de sucesso</th></tr>
    ${linhasModulos}
  </table>
  ${notaHtml}

  <h2>Requests mais lentos</h2>
  <table>
    <tr><th>Request</th><th>Módulo</th><th>Tempo</th></tr>
    ${linhasLentos}
  </table>

  ${secaoFalhas}
  ${secaoIA}

  <footer>Gerado em ${esc(geradoEm)} a partir de newman-report.json</footer>
</main>
</body>
</html>`;

fs.mkdirSync(path.join(raiz, 'reports'), { recursive: true });
fs.writeFileSync(saidaHtml, html, 'utf-8');

const metricas = {
  geradoEm: new Date().toISOString(),
  requests: {
    total: stats.requests.total,
    falhas: stats.requests.failed,
    daCollection: execucoes.length,
    chamadasDeScripts,
  },
  assertions: { total: totalAssertions, falhas: falhasAssertions },
  taxaSucessoPercentual: Number(taxaSucesso.toFixed(2)),
  duracaoMs,
  tempoMedioRespostaMs: tempoMedio,
  modulos: Object.fromEntries(
    Object.entries(modulos).map(([nome, m]) => [
      nome,
      { requests: m.requests, assertions: m.assertions, falhas: m.falhas, tempoMedioMs: m.tempoMedio, taxaSucessoPercentual: Number(m.taxa.toFixed(2)) },
    ])
  ),
  falhas: falhas.length,
  classificacoesIA: classificacoes,
};
fs.writeFileSync(saidaJson, JSON.stringify(metricas, null, 2), 'utf-8');

console.log('Dashboard gerado em reports/dashboard.html');
console.log('Métricas salvas em reports/metricas.json');
console.log(`Taxa de sucesso: ${pct(taxaSucesso)} (${totalAssertions - falhasAssertions}/${totalAssertions} assertions)`);

// Quando roda no GitHub Actions, escreve um resumo na página da execução
if (process.env.GITHUB_STEP_SUMMARY) {
  const linhasResumo = [
    '## Resultado dos testes de API (Newman)',
    '',
    `- Requests HTTP executados: **${stats.requests.total}**`,
    `- Assertions: **${totalAssertions}** (${falhasAssertions} falha(s))`,
    `- Taxa de sucesso: **${pct(taxaSucesso)}**`,
    `- Duração: **${(duracaoMs / 1000).toFixed(1)} s**, tempo médio de resposta: **${tempoMedio} ms**`,
    '',
    '| Módulo | Requests | Assertions | Falhas | Taxa de sucesso |',
    '|---|---|---|---|---|',
    ...Object.entries(modulos).map(
      ([nome, m]) => `| ${nome} | ${m.requests} | ${m.assertions} | ${m.falhas} | ${pct(m.taxa)} |`
    ),
    '',
  ];
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, linhasResumo.join('\n'));
}
