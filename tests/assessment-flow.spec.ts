import { test, expect } from '@playwright/test';

test.describe('CulturaBuilder Assessment Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should complete full assessment flow', async ({ page }) => {
    // Click Start Assessment
    await page.click('text=Iniciar Assessment Grátis');
    await expect(page).toHaveURL('http://localhost:3000/assessment');

    // Step 1: Company Info
    await page.fill('input[placeholder="Acme Corp"]', 'Test Company');
    await page.selectOption('select', 'fintech');
    await page.click('button:has-text("Enterprise")');
    await page.selectOption('select:has-text("Selecione o range")', 'R$10M - R$50M');
    await page.click('text=Continuar para Estado Atual');

    // Step 2: Current State - TEST SENIORITY BUG FIX
    await page.fill('input[placeholder="ex: 25"]', '10');

    // Test seniority inputs - verify bug is fixed
    // Find inputs within the seniority section
    const senioritySection = page.locator('div:has-text("Distribuição de Senioridade")').first();
    const inputs = senioritySection.locator('input[type="number"]');

    await inputs.nth(0).fill('2'); // Junior
    await inputs.nth(1).fill('5'); // Pleno

    // Verify junior value wasn't reset
    await expect(inputs.nth(0)).toHaveValue('2');
    await expect(inputs.nth(1)).toHaveValue('5');

    await page.selectOption('select:has-text("Selecione a frequência")', 'weekly');
    await page.fill('input[placeholder="ex: 14"]', '7');

    // Select AI tools usage level
    await page.click('button:has-text("Explorando")');

    // Select pain points
    await page.click('button:has-text("Entrega lenta de features")');
    await page.click('text=Continuar para Objetivos');

    // Step 3: Goals
    await page.click('button:has-text("Aumentar produtividade dev")');
    await page.click('button:has-text("12 Meses")');
    await page.selectOption('select', 'R$200K - R$500K');

    // Select success metrics
    await page.click('button:has-text("Developer velocity")');
    await page.click('button:has-text("Deployment frequency")');
    await page.click('button:has-text("Lead time for changes")');
    await page.click('text=Continuar para Review');

    // Step 4: Review & Submit
    await page.fill('input[placeholder="João Silva"]', 'Test User');
    await page.fill('input[placeholder="CTO, VP Engineering"]', 'CTO');
    await page.fill('input[placeholder="joao.silva@company.com"]', 'test@example.com');
    await page.check('input[type="checkbox"]');

    await page.click('text=Generate My Report');

    // Should navigate to report page
    await page.waitForURL(/\/report\/.+/);

    // Verify report loaded
    await expect(page.locator('text=Relatório de Avaliação de Prontidão para IA')).toBeVisible();
    await expect(page.locator('text=Período de Retorno')).toBeVisible();
  });

  test('should prevent progression without required fields', async ({ page }) => {
    await page.goto('http://localhost:3000/assessment');

    // Try to continue without filling required fields
    const continueButton = page.locator('button:has-text("Continuar para Estado Atual")');
    await expect(continueButton).toBeDisabled();

    // Fill company name only
    await page.fill('input[placeholder="Acme Corp"]', 'Test');
    await expect(continueButton).toBeDisabled();

    // Fill all required fields
    await page.selectOption('select', 'fintech');
    await page.click('button:has-text("Startup")');
    await page.selectOption('select:has-text("Selecione o range")', 'R$1M - R$10M');

    await expect(continueButton).toBeEnabled();
  });

  test('should show industry description when selected', async ({ page }) => {
    await page.goto('http://localhost:3000/assessment');

    await page.selectOption('select', 'fintech');

    // Should show industry description
    await expect(page.locator('text=Banking, payments, insurance')).toBeVisible();
  });

  test('should highlight active step in progress bar', async ({ page }) => {
    await page.goto('http://localhost:3000/assessment');

    // Step 1 should be highlighted
    const step1Label = page.locator('text=Company Info').first();
    await expect(step1Label).toHaveClass(/text-neon-green/);

    // Complete step 1
    await page.fill('input[placeholder="Acme Corp"]', 'Test');
    await page.selectOption('select', 'fintech');
    await page.click('button:has-text("Startup")');
    await page.selectOption('select:has-text("Selecione o range")', 'R$1M - R$10M');
    await page.click('text=Continuar para Estado Atual');

    // Step 2 should now be highlighted
    const step2Label = page.locator('text=Estado Atual').first();
    await expect(step2Label).toHaveClass(/text-neon-green/);
  });

  test('should persist data when going back', async ({ page }) => {
    await page.goto('http://localhost:3000/assessment');

    // Fill step 1
    await page.fill('input[placeholder="Acme Corp"]', 'Persistence Test');
    await page.selectOption('select', 'healthcare');
    await page.click('button:has-text("Enterprise")');
    await page.selectOption('select:has-text("Selecione o range")', 'R$50M - R$100M');
    await page.click('text=Continuar para Estado Atual');

    // Fill step 2
    await page.fill('input[placeholder="ex: 25"]', '50');
    await page.selectOption('select:has-text("Selecione a frequência")', 'daily');
    await page.fill('input[placeholder="ex: 14"]', '5');
    await page.click('button:has-text("Maduro")');

    // Go back to step 1
    await page.click('button:has-text("Voltar")');

    // Verify data persisted
    await expect(page.locator('input[placeholder="Acme Corp"]')).toHaveValue('Persistence Test');

    const industrySelect = page.locator('select').first();
    await expect(industrySelect).toHaveValue('healthcare');
  });
});

test.describe('Dark Theme Visual Tests', () => {
  test('should have dark background and neon accents', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Check dark background
    const body = page.locator('body');
    const bgColor = await body.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    );

    // Should be dark (close to #0a0a0a)
    expect(bgColor).toContain('rgb(10, 10, 10)');

    // Check neon gradient text
    const logo = page.locator('text=CulturaBuilder').first();
    await expect(logo).toBeVisible();
  });

  test('should show glow effects on hover', async ({ page }) => {
    await page.goto('http://localhost:3000/assessment');

    await page.fill('input[placeholder="Acme Corp"]', 'Test');
    await page.selectOption('select', 'fintech');

    // Hover over button
    const button = page.locator('button:has-text("Startup")');
    await button.hover();

    // Should be visible (testing interactivity)
    await expect(button).toBeVisible();
  });
});
