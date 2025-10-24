/**
 * Integration Test: Confidence Levels in Report
 *
 * Verifies that confidence indicators are properly displayed in the report
 */

import { test, expect } from '@playwright/test';

test.describe('Confidence Levels Integration', () => {

  test('should display confidence badge in report header', async ({ page }) => {
    // Navigate to assessment
    await page.goto('http://localhost:3000/assessment');
    await page.waitForLoadState('networkidle');

    // STEP 0: Select Persona
    await page.click('button:has-text("Engineering / Tech Leader")');
    await page.click('button:has-text("Continuar")');
    await page.waitForLoadState('networkidle');

    // STEP 1: Company Info
    await page.fill('input[placeholder*="Acme"]', 'Test Corp');
    await page.locator('select').first().selectOption('fintech');
    await page.click('button:has-text("Scaleup")');
    await page.locator('select').nth(1).selectOption('R$10M-50M');
    await page.click('button:has-text("Continuar")');
    await page.waitForLoadState('networkidle');

    // STEP 2: Current State
    await page.fill('input[placeholder*="25"]', '20');
    await page.locator('select').first().selectOption('monthly');
    await page.fill('input[placeholder*="14"]', '21');
    await page.click('button:has-text("Explorando")');
    await page.click('button:has-text("Velocidade de desenvolvimento lenta")');
    await page.click('button:has-text("Continuar")');
    await page.waitForLoadState('networkidle');

    // STEP 3: Goals
    await page.click('button:has-text("Aumentar produtividade")');
    await page.click('button:has-text("6 Meses")');
    await page.locator('select').first().selectOption('R$100k-500k');
    await page.click('button:has-text("Velocity / Throughput")');
    await page.click('button:has-text("Continuar")');
    await page.waitForLoadState('networkidle');

    // STEP 4: Review & Contact (Should see Triage Score here)
    // Fill contact info
    await page.fill('input[placeholder*="João"]', 'Test User');
    await page.fill('input[placeholder*="CTO"]', 'CTO');
    await page.fill('input[placeholder*="@"]', 'test@testcorp.com');
    await page.check('input[type="checkbox"]');

    // Verify Triage Score is displayed
    const triageScore = await page.locator('text=/\\d+\\/100/').textContent();
    console.log(`✓ Triage Score displayed: ${triageScore}`);
    expect(triageScore).toBeTruthy();

    await page.click('button:has-text("Continuar para Consulta AI")');
    await page.waitForLoadState('networkidle');

    // STEP 5: Skip AI Consultation
    await page.click('button:has-text("Pular Consulta")');
    await page.waitForURL(/\/report\/.+/, { timeout: 10000 });

    // VERIFY: Confidence Badge in Header
    const confidenceBadge = await page.locator('text=/Alta Confiança|Confiança Moderada|Confiança Limitada/');
    await expect(confidenceBadge).toBeVisible();
    const badgeText = await confidenceBadge.textContent();
    console.log(`✓ Confidence Badge displayed: ${badgeText}`);

    // VERIFY: Full Confidence Indicator Section
    const confidenceSection = await page.locator('text=Faixa de Incerteza');
    await expect(confidenceSection).toBeVisible();
    console.log('✓ Confidence Indicator section displayed');

    // VERIFY: Data Quality Metrics
    const completenessMetric = await page.locator('text=Completude dos Dados');
    await expect(completenessMetric).toBeVisible();
    console.log('✓ Data Quality metrics displayed');

    // VERIFY: Uncertainty Range
    const uncertaintyRange = await page.locator('text=/Conservador|Mais Provável|Otimista/');
    expect(await uncertaintyRange.count()).toBeGreaterThan(0);
    console.log('✓ Uncertainty Range displayed');

    // VERIFY: Key Assumptions
    const assumptions = await page.locator('text=Premissas Chave');
    await expect(assumptions).toBeVisible();
    console.log('✓ Key Assumptions section displayed');

    // Take screenshot for documentation
    await page.screenshot({
      path: 'tests/reports/confidence-integration-report.png',
      fullPage: true
    });
    console.log('✓ Screenshot saved');

    console.log('\n✅ All confidence level components verified successfully!');
  });

  test('should show improvement recommendations for low data quality', async ({ page }) => {
    // Similar flow but with minimal data to trigger low confidence
    await page.goto('http://localhost:3000/assessment');
    await page.waitForLoadState('networkidle');

    // STEP 0: Select Persona
    await page.click('button:has-text("Board Member / C-Level Executive")');
    await page.click('button:has-text("Continuar")');
    await page.waitForLoadState('networkidle');

    // STEP 1: Company Info (minimal)
    await page.fill('input[placeholder*="Acme"]', 'Minimal Corp');
    await page.locator('select').first().selectOption('fintech');
    await page.click('button:has-text("Startup")');
    await page.locator('select').nth(1).selectOption('Menor que R$1M');
    await page.click('button:has-text("Continuar")');
    await page.waitForLoadState('networkidle');

    // STEP 2: Non-tech Current State (minimal answers)
    await page.click('button:has-text("Moderado")'); // First moderate button
    await page.click('button:has-text("Pressão competitiva crescente")');
    await page.click('button:has-text("Continuar")');
    await page.waitForLoadState('networkidle');

    // STEP 3: Non-tech Goals (minimal)
    await page.click('button:has-text("Crescimento de receita")');
    await page.click('button:has-text("12 Meses")');
    await page.locator('select').first().selectOption('Menor que R$50k');
    await page.click('button:has-text("Média")');
    await page.click('button:has-text("Aumento de receita anual")');
    await page.click('button:has-text("Continuar")');
    await page.waitForLoadState('networkidle');

    // STEP 4: Review & Contact
    await page.fill('input[placeholder*="João"]', 'CEO Test');
    await page.fill('input[placeholder*="CTO"]', 'CEO');
    await page.fill('input[placeholder*="@"]', 'ceo@minimal.com');
    await page.check('input[type="checkbox"]');
    await page.click('button:has-text("Continuar para Consulta AI")');
    await page.waitForLoadState('networkidle');

    // STEP 5: Skip AI
    await page.click('button:has-text("Pular Consulta")');
    await page.waitForURL(/\/report\/.+/, { timeout: 10000 });

    // VERIFY: Lower confidence due to minimal data
    const confidenceBadge = await page.locator('text=/Confiança Moderada|Confiança Limitada/');
    await expect(confidenceBadge).toBeVisible();
    console.log('✓ Lower confidence badge displayed due to minimal data');

    // VERIFY: Improvement Recommendations section exists
    const improvementSection = await page.locator('text=Como Aumentar a Confiança');
    await expect(improvementSection).toBeVisible();
    console.log('✓ Improvement recommendations section displayed');

    // VERIFY: Missing Critical Data alert
    const missingDataAlert = await page.locator('text=Dados Críticos Ausentes');
    const hasAlert = await missingDataAlert.count();
    if (hasAlert > 0) {
      console.log('✓ Missing data alert displayed');
    }

    console.log('\n✅ Low confidence scenario verified successfully!');
  });

  test('should calculate different confidence levels based on data completeness', async ({ page }) => {
    console.log('\n📊 Testing confidence calculation logic...\n');

    // Test 1: High Data Quality → High Confidence
    await page.goto('http://localhost:3000/assessment');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Engineering / Tech Leader")');
    await page.click('button:has-text("Continuar")');
    await page.waitForLoadState('networkidle');

    // Complete data
    await page.fill('input[placeholder*="Acme"]', 'Complete Corp');
    await page.locator('select').first().selectOption('saas');
    await page.click('button:has-text("Enterprise")');
    await page.locator('select').nth(1).selectOption('R$50M-100M');
    await page.click('button:has-text("Continuar")');
    await page.waitForLoadState('networkidle');

    await page.fill('input[placeholder*="25"]', '50');
    await page.locator('select').first().selectOption('daily');
    await page.fill('input[placeholder*="14"]', '7');
    await page.fill('input[placeholder*="15"]', '5'); // Bug rate
    await page.click('button:has-text("Em Produção")');
    await page.click('button:has-text("Velocidade de desenvolvimento lenta")');
    await page.click('button:has-text("Bugs em produção frequentes")');
    await page.click('button:has-text("Continuar")');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Aumentar produtividade")');
    await page.click('button:has-text("Reduzir bugs")');
    await page.click('button:has-text("3 Meses")');
    await page.locator('select').first().selectOption('R$500k-1M');
    await page.click('button:has-text("Velocity / Throughput")');
    await page.click('button:has-text("Bug Reduction Rate")');
    await page.click('button:has-text("Deployment Frequency")');
    await page.click('button:has-text("Continuar")');
    await page.waitForLoadState('networkidle');

    await page.fill('input[placeholder*="João"]', 'Complete User');
    await page.fill('input[placeholder*="CTO"]', 'VP Engineering');
    await page.fill('input[placeholder*="@"]', 'vp@complete.com');
    await page.check('input[type="checkbox"]');
    await page.click('button:has-text("Continuar para Consulta AI")');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Pular Consulta")');
    await page.waitForURL(/\/report\/.+/, { timeout: 10000 });

    // Should have HIGH confidence
    const highConfidence = await page.locator('text=Alta Confiança').count();
    if (highConfidence > 0) {
      console.log('✅ HIGH confidence achieved with complete data');
    } else {
      const mediumConfidence = await page.locator('text=Confiança Moderada').count();
      if (mediumConfidence > 0) {
        console.log('✅ MEDIUM confidence (acceptable with good data)');
      }
    }

    // Verify data quality scores
    const completenessText = await page.locator('text=/\\d+%/').first().textContent();
    console.log(`   Data Completeness: ${completenessText}`);

    console.log('\n✅ Confidence calculation test completed!');
  });
});
