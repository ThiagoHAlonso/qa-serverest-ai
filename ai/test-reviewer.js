require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

function lerTodosOsSpecsCypress(dir) {
  const arquivos = fs.readdirSync(dir).filter((f) => f.endsWith('.cy.js'));
  return arquivos
    .map((f) => `--- ${f} ---\n${fs.readFileSync(path.join(dir, f), 'utf-8')}`)
    .join('\n\n');
}

const especsCypress = lerTodosOsSpecsCypress(path.join(__dirname, '..', 'cypress', 'e2e'));
const collectionPostman = fs.readFileSync(path.join(__dirname, '..', 'collection.json'), 'utf-8');

const prompt = `Você é um QA sênior revisando uma suíte de testes automatizados.

Abaixo estão os testes Cypress (E2E) e a collection do Postman (API) de um projeto que testa a API ServeRest.

## TESTES CYPRESS (E2E)
${especsCypress}

## COLLECTION POSTMAN (API) - JSON completo
${collectionPostman}

Revise essa suíte de testes e responda em Markdown, com estas seções:

## Pontos fortes
(o que está bem feito)

## Lacunas de cobertura
(cenários importantes que não são testados)

## Anti-padrões encontrados
(más práticas de automação, se houver: esperas fixas, seletores frágeis, asserts fracos, duplicação de código, etc)

## Sugestões de melhoria
(ações concretas e priorizadas)

Seja direto e específico, citando os arquivos/requests quando relevante.`;

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

async function gerarRevisao() {
  console.log('AI Test Reviewer iniciado...');
  console.log('Lendo specs do Cypress e collection do Postman...');

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-3.8-flash' });

  const result = await tentarComRetry(() => model.generateContent(prompt));
  const texto = result.response.text().trim();

  const outputPath = path.join(__dirname, '..', 'reports', 'revisao-de-testes.md');
  fs.writeFileSync(outputPath, texto, 'utf-8');

  console.log('\nRevisão salva em reports/revisao-de-testes.md');
  console.log('\n--- Prévia ---\n');
  console.log(texto.slice(0, 500) + '...');
}

gerarRevisao().catch((err) => {
  console.error('Erro inesperado:', err.message);
  process.exit(1);
});
