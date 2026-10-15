require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Lê os documentos do projeto como contexto
const casosDeTeste = fs.readFileSync(path.join(__dirname, '..', 'CASOS-DE-TESTE.md'), 'utf-8');
const estrategia = fs.readFileSync(path.join(__dirname, '..', 'ESTRATEGIA-QA.md'), 'utf-8');

const prompt = `Você é um QA sênior especialista em testes de API REST.

Abaixo estão dois documentos de um projeto de testes sobre a API ServeRest:

## ESTRATÉGIA DE QA
${estrategia}

## CASOS DE TESTE JÁ COBERTOS
${casosDeTeste}

Com base nesses documentos, sugira 10 cenários de teste que ainda NÃO foram cobertos.
Foque em:
- Casos de borda (valores extremos, campos vazios, tipos errados)
- Cenários negativos que ainda faltam
- Fluxos que combinam mais de um módulo
- Validações de contrato (campos obrigatórios, tipos de dados, formato da resposta)

Responda SOMENTE com um array JSON válido, sem texto adicional, sem markdown, sem explicações fora do JSON.
Formato de cada item:
{"id":"GEN-01","modulo":"Login","caso":"descrição clara do cenário","tipo":"negativo","resultado_esperado":"o que a API deve retornar"}`;

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

async function gerarCenarios() {
  console.log('AI Test Generator iniciado...');
  console.log('Lendo CASOS-DE-TESTE.md e ESTRATEGIA-QA.md...');

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-3.8-flash' });

  const result = await tentarComRetry(() => model.generateContent(prompt));
  const texto = result.response.text().trim();
  const textoLimpo = texto.replace(/```json/g, '').replace(/```/g, '').trim();

  let cenarios;
  try {
    cenarios = JSON.parse(textoLimpo);
  } catch (err) {
    console.error('Erro ao fazer parse do JSON retornado pela IA:');
    console.error(textoLimpo);
    process.exit(1);
  }

  const outputPath = path.join(__dirname, '..', 'reports', 'sugestoes-de-teste.json');
  fs.writeFileSync(outputPath, JSON.stringify(cenarios, null, 2), 'utf-8');

  console.log(`\n${cenarios.length} cenários gerados e salvos em reports/sugestoes-de-teste.json`);
  console.log('\nPrévia dos cenários gerados:');
  cenarios.forEach((c) => {
    console.log(`  [${c.id}] [${c.tipo}] ${c.modulo} - ${c.caso}`);
  });
}

gerarCenarios().catch((err) => {
  console.error('Erro inesperado:', err.message);
  process.exit(1);
});
