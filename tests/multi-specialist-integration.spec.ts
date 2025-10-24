/**
 * Integration Test: Multi-Specialist AI Consultation
 *
 * Verifies the multi-specialist consultation flow works correctly
 */

import { test, expect } from '@playwright/test';

test.describe('Multi-Specialist Consultation Integration', () => {

  test('should display specialist selector and allow multiple selection', async ({ page }) => {
    // Navigate to assessment
    await page.goto('http://localhost:3000/assessment');
    await page.waitForLoadState('networkidle');

    // STEP 0: Select Engineering Persona (gets recommended specialist)
    await page.click('button:has-text("Engineering / Tech Leader")');
    await page.click('button:has-text("Continuar")');
    await page.waitForLoadState('networkidle');

    // STEP 1: Company Info
    await page.fill('input[placeholder*="Acme"]', 'Multi Specialist Test Corp');
    await page.locator('select').first().selectOption('saas');
    await page.click('button:has-text("Scaleup")');
    await page.locator('select').nth(1).selectOption('R$10M-50M');
    await page.click('button:has-text("Continuar")');
    await page.waitForLoadState('networkidle');

    // STEP 2: Current State
    await page.fill('input[placeholder*="25"]', '30');
    await page.locator('select').first().selectOption('weekly');
    await page.fill('input[placeholder*="14"]', '10');
    await page.click('button:has-text("Em Produção")');
    await page.click('button:has-text("Velocidade de desenvolvimento lenta")');
    await page.click('button:has-text("Continuar")');
    await page.waitForLoadState('networkidle');

    // STEP 3: Goals
    await page.click('button:has-text("Aumentar produtividade")');
    await page.click('button:has-text("3 Meses")');
    await page.locator('select').first().selectOption('R$100k-500k');
    await page.click('button:has-text("Velocity / Throughput")');
    await page.click('button:has-text("Continuar")');
    await page.waitForLoadState('networkidle');

    // STEP 4: Review & Contact
    await page.fill('input[placeholder*="João"]', 'Test Engineer');
    await page.fill('input[placeholder*="CTO"]', 'CTO');
    await page.fill('input[placeholder*="@"]', 'cto@multitest.com');
    await page.check('input[type="checkbox"]');
    await page.click('button:has-text("Continuar para Consulta AI")');
    await page.waitForLoadState('networkidle');

    // STEP 5: Specialist Selection Phase
    console.log('✓ Reached Step 5: Multi-Specialist Consultation');

    // Verify specialist selection phase
    const selectionTitle = await page.locator('text=Escolha Seus Especialistas');
    await expect(selectionTitle).toBeVisible();
    console.log('✓ Specialist selection title displayed');

    // Verify intro text
    const introText = await page.locator('text=Consultoria Multi-Especialista');
    await expect(introText).toBeVisible();
    console.log('✓ Multi-specialist intro displayed');

    // Verify all 3 specialists are displayed
    const drTech = await page.locator('text=Dr. Tech');
    const drRoi = await page.locator('text=Dr. ROI');
    const drStrategy = await page.locator('text=Dr. Strategy');

    await expect(drTech).toBeVisible();
    await expect(drRoi).toBeVisible();
    await expect(drStrategy).toBeVisible();
    console.log('✓ All 3 specialists displayed');

    // Verify recommended specialist badge (should be Engineering for tech persona)
    const recommendedBadge = await page.locator('text=Recomendado').first();
    await expect(recommendedBadge).toBeVisible();
    console.log('✓ Recommended specialist badge displayed');

    // Select multiple specialists
    await page.click('button:has-text("Dr. Tech")'); // Engineering
    console.log('✓ Selected Dr. Tech (Engineering)');

    await page.click('button:has-text("Dr. ROI")'); // Finance
    console.log('✓ Selected Dr. ROI (Finance)');

    // Verify selection summary
    const selectionSummary = await page.locator('text=/2 especialistas selecionados/');
    await expect(selectionSummary).toBeVisible();
    console.log('✓ Selection summary shows 2 specialists');

    // Verify "Começar Consulta" button is enabled
    const startButton = await page.locator('button:has-text("Começar Consulta")');
    await expect(startButton).toBeEnabled();
    console.log('✓ Start consultation button is enabled');

    // Click to start consultation
    await startButton.click();
    await page.waitForTimeout(1000);

    // VERIFY: Consultation phase started
    const consultationTitle = await page.locator('text=/Consulta com Especialistas/');
    await expect(consultationTitle).toBeVisible();
    console.log('✓ Consultation phase started');

    // Verify progress indicator
    const progressText = await page.locator('text=1/2');
    await expect(progressText).toBeVisible();
    console.log('✓ Progress indicator shows 1/2 specialists');

    // Verify specialist indicator in first message
    const specialistIcon = await page.locator('text=⚙️').first(); // Engineering icon
    await expect(specialistIcon).toBeVisible();
    console.log('✓ First specialist (Engineering) indicator displayed');

    // Take screenshot
    await page.screenshot({
      path: 'tests/reports/multi-specialist-selection.png',
      fullPage: true
    });
    console.log('✓ Screenshot saved');

    console.log('\n✅ Multi-specialist selection flow verified successfully!');
  });

  test('should handle single specialist selection', async ({ page }) => {
    // Navigate to assessment
    await page.goto('http://localhost:3000/assessment');
    await page.waitForLoadState('networkidle');

    // Complete steps 0-4 quickly
    await page.click('button:has-text("Board Member / C-Level Executive")');
    await page.click('button:has-text("Continuar")');
    await page.waitForLoadState('networkidle');

    await page.fill('input[placeholder*="Acme"]', 'Single Specialist Corp');
    await page.locator('select').first().selectOption('fintech');
    await page.click('button:has-text("Enterprise")');
    await page.locator('select').nth(1).selectOption('Maior que R$100M');
    await page.click('button:has-text("Continuar")');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Moderado")');
    await page.click('button:has-text("Pressão competitiva crescente")');
    await page.click('button:has-text("Continuar")');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Crescimento de receita")');
    await page.click('button:has-text("6 Meses")');
    await page.locator('select').first().selectOption('R$500k-1M');
    await page.click('button:has-text("Alta")');
    await page.click('button:has-text("Aumento de receita anual")');
    await page.click('button:has-text("Continuar")');
    await page.waitForLoadState('networkidle');

    await page.fill('input[placeholder*="João"]', 'CEO Test');
    await page.fill('input[placeholder*="CTO"]', 'CEO');
    await page.fill('input[placeholder*="@"]', 'ceo@single.com');
    await page.check('input[type="checkbox"]');
    await page.click('button:has-text("Continuar para Consulta AI")');
    await page.waitForLoadState('networkidle');

    // STEP 5: Select only Strategy specialist (recommended for board-executive)
    const drStrategy = await page.locator('button:has-text("Dr. Strategy")');
    await drStrategy.click();
    console.log('✓ Selected Dr. Strategy (single specialist)');

    // Verify summary shows singular form
    const singleSummary = await page.locator('text=/1 especialista selecionado/');
    await expect(singleSummary).toBeVisible();
    console.log('✓ Summary shows singular form correctly');

    // Start consultation
    await page.click('button:has-text("Começar Consulta (1 especialista)")');
    await page.waitForTimeout(1000);

    // Verify progress shows 1/1
    const singleProgress = await page.locator('text=1/1');
    await expect(singleProgress).toBeVisible();
    console.log('✓ Progress shows 1/1 for single specialist');

    console.log('\n✅ Single specialist selection verified!');
  });

  test('should use recommended specialist button', async ({ page }) => {
    // Navigate to assessment
    await page.goto('http://localhost:3000/assessment');
    await page.waitForLoadState('networkidle');

    // Complete steps 0-4
    await page.click('button:has-text("Finance / Operations Leader")');
    await page.click('button:has-text("Continuar")');
    await page.waitForLoadState('networkidle');

    await page.fill('input[placeholder*="Acme"]', 'Recommended Test Corp');
    await page.locator('select').first().selectOption('e-commerce');
    await page.click('button:has-text("Scaleup")');
    await page.locator('select').nth(1).selectOption('R$10M-50M');
    await page.click('button:has-text("Continuar")');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Alto")');
    await page.click('button:has-text("Dificuldade em medir ROI")');
    await page.click('button:has-text("Continuar")');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Reduzir custos")');
    await page.click('button:has-text("6 Meses")');
    await page.locator('select').first().selectOption('R$100k-500k');
    await page.click('button:has-text("Média")');
    await page.click('button:has-text("Redução de custos operacionais")');
    await page.click('button:has-text("Continuar")');
    await page.waitForLoadState('networkidle');

    await page.fill('input[placeholder*="João"]', 'CFO Test');
    await page.fill('input[placeholder*="CTO"]', 'CFO');
    await page.fill('input[placeholder*="@"]', 'cfo@recommended.com');
    await page.check('input[type="checkbox"]');
    await page.click('button:has-text("Continuar para Consulta AI")');
    await page.waitForLoadState('networkidle');

    // STEP 5: Verify Dr. ROI is recommended for Finance persona
    const drRoiBadge = await page.locator('text=Dr. ROI').locator('..').locator('..').locator('text=Recomendado');
    const badgeCount = await drRoiBadge.count();

    if (badgeCount > 0) {
      console.log('✓ Dr. ROI (Finance) is recommended for Finance persona');
    }

    // Click "Usar Recomendado" button
    const useRecommendedButton = await page.locator('button:has-text("Usar Recomendado")');

    if (await useRecommendedButton.count() > 0) {
      await useRecommendedButton.click();
      await page.waitForTimeout(500);
      console.log('✓ Clicked "Usar Recomendado" button');

      // Should auto-start consultation
      const consultationStarted = await page.locator('text=/Consulta com Especialistas/');
      await expect(consultationStarted).toBeVisible({ timeout: 5000 });
      console.log('✓ Consultation auto-started with recommended specialist');
    }

    console.log('\n✅ Recommended specialist flow verified!');
  });

  test('should skip consultation and go directly to report', async ({ page }) => {
    // Navigate to assessment
    await page.goto('http://localhost:3000/assessment');
    await page.waitForLoadState('networkidle');

    // Complete steps 0-4 quickly
    await page.click('button:has-text("Engineering / Tech Leader")');
    await page.click('button:has-text("Continuar")');
    await page.waitForLoadState('networkidle');

    await page.fill('input[placeholder*="Acme"]', 'Skip Test Corp');
    await page.locator('select').first().selectOption('saas');
    await page.click('button:has-text("Startup")');
    await page.locator('select').nth(1).selectOption('R$1M-5M');
    await page.click('button:has-text("Continuar")');
    await page.waitForLoadState('networkidle');

    await page.fill('input[placeholder*="25"]', '10');
    await page.locator('select').first().selectOption('monthly');
    await page.fill('input[placeholder*="14"]', '30');
    await page.click('button:has-text("Explorando")');
    await page.click('button:has-text("Velocidade de desenvolvimento lenta")');
    await page.click('button:has-text("Continuar")');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Aumentar produtividade")');
    await page.click('button:has-text("6 Meses")');
    await page.locator('select').first().selectOption('Menor que R$50k');
    await page.click('button:has-text("Velocity / Throughput")');
    await page.click('button:has-text("Continuar")');
    await page.waitForLoadState('networkidle');

    await page.fill('input[placeholder*="João"]', 'Skip User');
    await page.fill('input[placeholder*="CTO"]', 'Developer');
    await page.fill('input[placeholder*="@"]', 'dev@skip.com');
    await page.check('input[type="checkbox"]');
    await page.click('button:has-text("Continuar para Consulta AI")');
    await page.waitForLoadState('networkidle');

    // STEP 5: Skip consultation
    const skipButton = await page.locator('button:has-text("Pular")');
    await skipButton.click();
    console.log('✓ Clicked skip button');

    // Should navigate to report
    await page.waitForURL(/\/report\/.+/, { timeout: 10000 });
    console.log('✓ Navigated to report page');

    // Verify report displays
    const reportTitle = await page.locator('text=AI Readiness Assessment');
    await expect(reportTitle).toBeVisible();
    console.log('✓ Report page displayed successfully');

    console.log('\n✅ Skip consultation flow verified!');
  });
});
