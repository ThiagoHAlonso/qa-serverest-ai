require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

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

async function tentarComRetry(fn, tentativas = 5, espera = 3000) {
  for (let i = 1; i <= tentativas; i++) {
    try {
      return await fn();
    } catch (err) {
      const servidorOcupado = err.message && err.message.includes('503');
      if (servidorOcupado && i < tentativas) {
        console.log(`Servidor ocupado, tentativa ${i}/${tentativas}. Aguardando ${espera / 1000}s...`);
        await new Promise((r) => setTimeout(r, espera));
        espera *= 2;
      } else {
        throw err;
      }
    }
  }
}

async function analisarFalhas() {
  console.log('AI Failure Analyzer iniciado...');
  console.log(`${falhas.length} falha(s) encontrada(s) no relatório. Enviando para análise...`);

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-3.8-flash' });

  const result = await tentarComRetry(() => model.generateContent(prompt));
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
    console.log(`    → ${a.justificativa}`);
  });
}

analisarFalhas().catch((err) => {
  console.error('Erro inesperado:', err.message);
  process.exit(1);
});
