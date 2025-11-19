/**
 * Demo: FASE 1 - Personalização do Report
 *
 * Este teste preenche um assessment automaticamente para demonstrar
 * a seção "Seus Dados" e a conversação preservada no report.
 */

import { test, expect } from '@playwright/test';

test('Demo FASE 1: Assessment completo mostrando personalização', async ({ page }) => {
  console.log('🚀 Iniciando assessment no modo Adaptive...\n');

  // Navegar para o modo adaptativo
  await page.goto('http://localhost:3000/assessment?mode=adaptive');

  // Aguardar primeira pergunta ser gerada
  console.log('⏳ Aguardando primeira pergunta...');
  await page.waitForTimeout(8000);

  // Lista de respostas simulando um usuário real
  const respostas = [
    {
      resposta: "Somos uma fintech Series B com 50 desenvolvedores. Nosso maior problema é velocidade de entrega - features simples demoram 3 meses.",
      descricao: "Contexto da empresa + Pain point principal"
    },
    {
      resposta: "Temos muito tech debt no monolito Rails. Qualquer mudança quebra 3 outras coisas. Precisamos refatorar mas não temos tempo.",
      descricao: "Detalhes do tech debt"
    },
    {
      resposta: "Queremos reduzir o cycle time de 21 dias para 7 dias nos próximos 6 meses. É crítico para competir no mercado.",
      descricao: "Objetivo principal + timeline"
    },
    {
      resposta: "Levantamos R$20M ano passado. Temos budget de R$500k-1M para ferramentas e consultoria.",
      descricao: "Contexto financeiro"
    },
    {
      resposta: "Fazemos deploy semanal mas gostaríamos de fazer diário. Bug rate está em torno de 15 bugs/sprint.",
      descricao: "Métricas atuais"
    },
    {
      resposta: "O time tem 15 seniors, 25 plenos, 10 juniors. Usamos Jest, CircleCI, mas nada de AI ainda.",
      descricao: "Composição do time + ferramentas"
    },
    {
      resposta: "Objetivo principal: reduzir time-to-market para lançar marketplace de crédito antes da concorrência.",
      descricao: "Objetivo de negócio"
    },
    {
      resposta: "Exemplo: feature de open banking demorou 4 meses, deveria ter sido 6 semanas.",
      descricao: "Caso específico"
    }
  ];

  // Preencher assessment com as respostas
  for (let i = 0; i < respostas.length; i++) {
    console.log(`\n📝 Resposta ${i + 1}/${respostas.length}: ${respostas[i].descricao}`);
    console.log(`   "${respostas[i].resposta.substring(0, 60)}..."`);

    // Aguardar input estar disponível
    await page.waitForSelector('textarea, input[type="text"]', { timeout: 10000 });

    // Preencher resposta
    const input = page.locator('textarea, input[type="text"]').first();
    await input.fill(respostas[i].resposta);

    // Clicar em enviar
    const submitButton = page.locator('button:has-text("Enviar"), button:has-text("Próxima")').first();
    await submitButton.click();

    // Aguardar processamento (LLM extrai dados + gera próxima pergunta)
    console.log('   ⏳ Processando...');
    await page.waitForTimeout(6000);
  }

  console.log('\n✅ Assessment completo! Aguardando geração do report...');
  await page.waitForTimeout(3000);

  // Verificar se foi para página de report
  await page.waitForURL(/\/report\//, { timeout: 30000 });

  const reportUrl = page.url();
  console.log(`\n🎉 Report gerado: ${reportUrl}`);
  console.log('\n📊 Verifique a seção "Como Calculamos Isso Para Você" no report!');
  console.log('📝 A conversação completa foi preservada no objeto report.');

  // Aguardar página carregar completamente
  await page.waitForTimeout(2000);

  // Tirar screenshot da seção "Seus Dados"
  const seusDataosSection = page.locator('text=Como Calculamos Isso Para Você').first();

  if (await seusDataosSection.isVisible()) {
    console.log('\n✅ Seção "Seus Dados" encontrada!');

    // Scroll até a seção
    await seusDataosSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // Screenshot
    await page.screenshot({
      path: 'tests/screenshots/fase1-seus-dados-section.png',
      fullPage: false
    });

    console.log('📸 Screenshot salvo: tests/screenshots/fase1-seus-dados-section.png');
  }

  console.log('\n🎯 DEMO COMPLETO!');
  console.log('Abra o report no browser para ver:');
  console.log(`  ${reportUrl}`);
  console.log('\nProcure por:');
  console.log('  1. Seção "📊 Como Calculamos Isso Para Você"');
  console.log('  2. Cards mostrando seus dados (50 devs, 21 dias ciclo, etc)');
  console.log('  3. Deep Insights (agora gerados para todos!)');

  // Manter página aberta por 10 segundos para visualização
  await page.waitForTimeout(10000);
});
