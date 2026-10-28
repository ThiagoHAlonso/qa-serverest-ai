require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const MODELO = 'gemini-3.8-flash';
// Limite de tempo de cada chamada (evita esperar 5 minutos por uma resposta que não vem)
const TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS) || 45000;

const relatorioPath = path.join(__dirname, '..', 'newman-report.json');
const relatorio = JSON.parse(fs.readFileSync(relatorioPath, 'utf-8'));

// Extrai só as falhas do relatório do Newman
const falhas = relatorio.run.failures.map((f) => ({
  nome: f.source ? f.source.name : 'desconhecido',
  erro: f.error ? f.error.message : JSON.stringify(f),
}));

if (falhas.length === 0) {
  console.log('Nenhuma falha encontrada no relatório. Nada para analisar.');
  process.exit(0);
}

const prompt = `Você é um QA sênior fazendo triagem de falhas de testes automatizados.

Abaixo está uma lista de falhas de uma execução do Newman (Postman) sobre a API ServeRest:

${JSON.stringify(falhas, null, 2)}

Para cada falha, classifique como uma das opções:
- "bug real" (comportamento genuinamente incorreto da aplicação)
- "teste flaky" (falha intermitente, não relacionada a um bug real)
- "problema de ambiente" (rede, servidor instável, dados compartilhados etc)
- "teste desatualizado" (o teste espera um comportamento que mudou legitimamente)

Responda SOMENTE com um array JSON válido, sem texto fora do JSON, no formato:
{"falha":"nome da falha","classificacao":"...","justificativa":"explicação curta"}`;

// Erros que valem uma nova tentativa: servidor ocupado, limite de uso, problemas de rede e tempo esgotado
function eTemporario(err) {
  return /503|429|500|502|504|fetch failed|timeout|timed out|aborted|ECONNRESET/i.test((err && err.message) || '');
}

async function tentarComRetry(fn, tentativas = 3, espera = 3000) {
  for (let i = 1; i <= tentativas; i++) {
    try {
      return await fn();
    } catch (err) {
      if (eTemporario(err) && i < tentativas) {
        const resumo = String(err.message || '').split(': ').pop().slice(0, 90);
        console.log(`Falha temporária (${resumo}). Tentativa ${i}/${tentativas}. Aguardando ${espera / 1000}s...`);
        await new Promise((r) => setTimeout(r, espera));
        espera *= 2;
      } else {
        throw err;
      }
    }
  }
}

// Quando tudo falha, testa a conexão direta com a API pra mostrar a causa real no log
async function diagnosticarConexao() {
  console.log('Diagnóstico: testando a conexão direta com a API do Gemini...');
  try {
    const resp = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=100', {
      headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY || '' },
      signal: AbortSignal.timeout(20000),
    });
    console.log(`Resposta da API: HTTP ${resp.status}`);
    if (resp.ok) {
      const dados = await resp.json();
      const modelos = (dados.models || [])
        .filter((m) => (m.supportedGenerationMethods || []).includes('generateContent'))
        .map((m) => m.name.replace('models/', ''));
      console.log(`Modelos disponíveis para generateContent: ${modelos.join(', ')}`);
      if (!modelos.includes(MODELO)) {
        console.log(`Atenção: o modelo "${MODELO}" não aparece na lista acima.`);
      }
    } else {
      console.log((await resp.text()).slice(0, 300));
    }
  } catch (e) {
    const causa = e.cause ? e.cause.code || e.cause.message : e.message;
    console.log(`Não foi possível conectar com a API: ${causa}`);
  }
}

async function analisarFalhas() {
  console.log('AI Failure Analyzer iniciado...');
  console.log(`${falhas.length} falha(s) encontrada(s) no relatório. Enviando para análise...`);

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: MODELO }, { timeout: TIMEOUT_MS });

  let result;
  try {
    result = await tentarComRetry(() => model.generateContent(prompt));
  } catch (err) {
    console.error('Erro ao chamar o Gemini:', err.message);
    await diagnosticarConexao();
    process.exit(1);
  }

  const texto = result.response.text().trim();
  const textoLimpo = texto.replace(/```json/g, '').replace(/```/g, '').trim();

  let analises;
  try {
    analises = JSON.parse(textoLimpo);
  } catch (err) {
    console.error('Erro ao fazer parse do JSON retornado pela IA:');
    console.error(textoLimpo);
    process.exit(1);
  }

  const outputPath = path.join(__dirname, '..', 'reports', 'analise-de-falhas.json');
  fs.writeFileSync(outputPath, JSON.stringify(analises, null, 2), 'utf-8');

  console.log('\nAnálise salva em reports/analise-de-falhas.json\n');
  analises.forEach((a) => {
    console.log(`  [${a.classificacao}] ${a.falha}`);
    console.log(`    -> ${a.justificativa}`);
  });
}

analisarFalhas().catch((err) => {
  console.error('Erro inesperado:', err.message);
  process.exit(1);
});