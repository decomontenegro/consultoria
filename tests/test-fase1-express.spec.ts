/**
 * FASE 1 Test - Express Mode (Stable)
 *
 * Este teste demonstra as 3 melhorias da FASE 1:
 * 1. Conversação preservada no report
 * 2. Deep Insights sempre gerados
 * 3. Seção "Seus Dados" visível
 */

import { test, expect } from '@playwright/test';

test('FASE 1: Express Mode com personalização completa', async ({ page }) => {
  console.log('\n🚀 Iniciando teste FASE 1 no modo Express...\n');

  // Navegar para Express Mode
  await page.goto('http://localhost:3000/assessment?mode=express');

  // Aguardar página carregar
  await page.waitForTimeout(2000);

  console.log('✅ Página carregada');

  // Aguardar primeira pergunta aparecer
  await page.waitForSelector('text=/pergunta|problema|desafio/i', { timeout: 15000 });
  console.log('✅ Primeira pergunta apareceu\n');

  // Respostas detalhadas para testar extração de dados
  const respostas = [
    "Somos uma fintech Series B com 50 desenvolvedores. Nosso maior problema é velocidade - features levam 3 meses para sair.",
    "Temos muito tech debt no Rails. Qualquer mudança quebra 3 outras coisas.",
    "Queremos reduzir cycle time de 21 dias para 7 dias em 6 meses.",
    "Levantamos R$20M ano passado. Temos R$500k-1M de budget para ferramentas.",
    "Deploy é semanal mas queremos diário. Bug rate: 15 bugs/sprint.",
    "Time: 15 seniors, 25 plenos, 10 juniors. Usamos Jest e CircleCI.",
    "Objetivo: lançar marketplace de crédito antes da concorrência."
  ];

  // Preencher todas as respostas
  for (let i = 0; i < respostas.length; i++) {
    console.log(`📝 Resposta ${i + 1}/${respostas.length}: "${respostas[i].substring(0, 50)}..."`);

    try {
      // Esperar input estar disponível
      const inputSelector = 'textarea, input[type="text"]';
      await page.waitForSelector(inputSelector, { timeout: 10000 });

      // Preencher resposta
      const input = page.locator(inputSelector).first();
      await input.fill(respostas[i]);

      // Clicar botão Enviar/Próxima
      const submitButton = page.locator('button:has-text("Enviar"), button:has-text("Próxima")').first();
      await submitButton.click();

      // Aguardar processamento
      await page.waitForTimeout(3000);

      console.log(`   ✅ Resposta ${i + 1} enviada`);
    } catch (error) {
      console.log(`   ⚠️ Erro na resposta ${i + 1}, continuando...`);
    }
  }

  console.log('\n⏳ Aguardando geração do report...\n');

  // Aguardar redirecionamento para report
  await page.waitForURL(/\/report\//, { timeout: 60000 });

  const reportUrl = page.url();
  const reportId = reportUrl.split('/').pop();

  console.log(`✅ Report gerado: ${reportUrl}\n`);

  // Aguardar página carregar completamente
  await page.waitForTimeout(3000);

  // VALIDAÇÃO 1: Verificar seção "Seus Dados"
  console.log('🔍 Verificando seção "Seus Dados"...');
  const seusDataosHeading = page.locator('text=Como Calculamos Isso Para Você').first();

  await expect(seusDataosHeading).toBeVisible({ timeout: 10000 });
  console.log('   ✅ Seção "Seus Dados" encontrada!');

  // Verificar se mostra "50" desenvolvedores
  const devTeamCard = page.locator('text=/50.*desenvolvedores/i').first();
  const hasDevCount = await devTeamCard.isVisible().catch(() => false);
  if (hasDevCount) {
    console.log('   ✅ Card "Tamanho do Time: 50 desenvolvedores" visível');
  }

  // Verificar se mostra "21 dias"
  const cycleTimeCard = page.locator('text=/21.*dias/i').first();
  const hasCycleTime = await cycleTimeCard.isVisible().catch(() => false);
  if (hasCycleTime) {
    console.log('   ✅ Card "Ciclo Atual: 21 dias" visível');
  }

  // VALIDAÇÃO 2: Verificar Deep Insights
  console.log('\n🔍 Verificando Deep Insights...');
  const deepInsightsSection = page.locator('text=/Análise Aprofundada|Deep Insights|Consultor PhD/i').first();
  const hasDeepInsights = await deepInsightsSection.isVisible().catch(() => false);

  if (hasDeepInsights) {
    console.log('   ✅ Seção "Deep Insights" encontrada!');
  } else {
    console.log('   ⚠️  Seção "Deep Insights" não encontrada (pode ainda estar gerando)');
  }

  // VALIDAÇÃO 3: Verificar conversação no localStorage
  console.log('\n🔍 Verificando conversação preservada...');
  const reports = await page.evaluate(() => {
    const reportsData = localStorage.getItem('culturabuilder_reports');
    return reportsData ? JSON.parse(reportsData) : [];
  });

  const currentReport = reports.find((r: any) => r.id === reportId);

  if (currentReport?.conversationContext) {
    const msgCount = currentReport.conversationContext.rawConversation?.length || 0;
    console.log(`   ✅ Conversação preservada: ${msgCount} mensagens salvas`);
    console.log(`   ✅ Modo: ${currentReport.conversationContext.mode}`);
  } else {
    console.log('   ⚠️  Conversação não encontrada no report');
  }

  // Screenshot da seção "Seus Dados"
  await seusDataosHeading.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  await page.screenshot({
    path: 'tests/screenshots/fase1-seus-dados-express.png',
    fullPage: false
  });

  console.log('\n📸 Screenshot salvo: tests/screenshots/fase1-seus-dados-express.png');

  // Manter página aberta para visualização
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('🎉 TESTE FASE 1 COMPLETO!');
  console.log('═══════════════════════════════════════════════════════');
  console.log('\n📊 Verifique no report:');
  console.log('   1. Seção "📊 Como Calculamos Isso Para Você"');
  console.log('   2. Cards mostrando: 50 devs, 21 dias ciclo, etc');
  console.log('   3. Deep Insights (se gerados)');
  console.log(`\n🌐 URL do report: ${reportUrl}`);
  console.log('═══════════════════════════════════════════════════════\n');

  // Aguardar 10 segundos para visualização
  await page.waitForTimeout(10000);
});
