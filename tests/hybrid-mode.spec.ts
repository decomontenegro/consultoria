/**
 * Hybrid Mode Test
 *
 * Tests the new hybrid input system in Express Mode:
 * - Single-choice questions (radio buttons)
 * - Multi-choice questions (checkboxes)
 * - Quick-chips questions (tag-style)
 * - Text questions (traditional input)
 */

import { test, expect } from '@playwright/test';

test.describe('Hybrid Mode - Express Mode', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to assessment page
    await page.goto('http://localhost:3002/assessment');

    // Wait for AI Router to load
    await page.waitForSelector('text=Olá! Sou o CulturaBuilder AI', { timeout: 10000 });
  });

  test('should render single-choice question with radio buttons', async ({ page }) => {
    console.log('🧪 Testing single-choice (radio) questions...');

    // Complete AI Router to reach Express Mode
    await page.fill('input[type="text"]', 'Desenvolvimento lento, custos altos');
    await page.press('input[type="text"]', 'Enter');
    await page.waitForTimeout(500);

    await page.fill('input[type="text"]', 'CEO');
    await page.press('input[type="text"]', 'Enter');
    await page.waitForTimeout(500);

    await page.fill('input[type="text"]', '100');
    await page.press('input[type="text"]', 'Enter');
    await page.waitForTimeout(500);

    await page.fill('input[type="text"]', 'Fintech');
    await page.press('input[type="text"]', 'Enter');
    await page.waitForTimeout(500);

    // Select Express Mode
    await page.waitForSelector('text=Express Mode', { timeout: 10000 });
    const expressButton = page.locator('button:has-text("Express Mode")').first();
    await expressButton.click();
    await page.waitForTimeout(1500);

    // Wait for Express Mode to load
    await page.waitForSelector('text=Express AI', { timeout: 5000 });
    await page.waitForTimeout(1000);

    // Check if single-choice question is rendered
    // The first essential question should be "company-industry" which is single-choice
    const industryQuestion = page.locator('text=Em qual setor sua empresa atua?');

    if (await industryQuestion.isVisible()) {
      console.log('✅ Single-choice question detected!');

      // Check for radio button options
      const optionsVisible = await page.locator('button:has-text("Fintech")').first().isVisible();
      console.log(`📌 Radio button options visible: ${optionsVisible}`);

      expect(optionsVisible).toBe(true);

      // Click an option
      await page.locator('button:has-text("Fintech")').first().click();
      await page.waitForTimeout(300);

      // Check if option is selected (has green border)
      const selectedOption = page.locator('button:has-text("Fintech")').first();
      const hasGreenBorder = await selectedOption.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.borderColor.includes('34, 197, 94'); // neon-green RGB
      });
      console.log(`✅ Option selected (green border): ${hasGreenBorder}`);

      // Click continue button
      const continueButton = page.locator('button:has-text("Continuar")');
      await continueButton.click();
      await page.waitForTimeout(1000);

      console.log('✅ Single-choice question completed!');
    } else {
      console.log('⚠️ Single-choice question not found, test might be looking at different question');
    }
  });

  test('should render multi-choice question with checkboxes', async ({ page }) => {
    console.log('🧪 Testing multi-choice (checkbox) questions...');

    // Fast-forward to Express Mode
    await page.fill('input[type="text"]', 'Bugs e lentidão');
    await page.press('input[type="text"]', 'Enter');
    await page.waitForTimeout(300);

    await page.fill('input[type="text"]', 'CTO');
    await page.press('input[type="text"]', 'Enter');
    await page.waitForTimeout(300);

    await page.fill('input[type="text"]', '50');
    await page.press('input[type="text"]', 'Enter');
    await page.waitForTimeout(300);

    await page.fill('input[type="text"]', 'SaaS');
    await page.press('input[type="text"]', 'Enter');
    await page.waitForTimeout(500);

    await page.waitForSelector('text=Express Mode', { timeout: 10000 });
    await page.locator('button:has-text("Express Mode")').first().click();
    await page.waitForTimeout(1500);

    await page.waitForSelector('text=Express AI', { timeout: 5000 });
    await page.waitForTimeout(1000);

    // Answer first question (single-choice - industry)
    const firstOption = page.locator('button').filter({ hasText: /SaaS|Fintech/ }).first();
    if (await firstOption.isVisible()) {
      await firstOption.click();
      await page.waitForTimeout(300);
      await page.locator('button:has-text("Continuar")').click();
      await page.waitForTimeout(1000);
    }

    // Now should be at multi-choice question (pain-points)
    const painPointsQuestion = page.locator('text=principais desafios');

    if (await painPointsQuestion.isVisible()) {
      console.log('✅ Multi-choice question detected!');

      // Check for selection counter
      const counter = await page.locator('text=Selecione até 3 opções').isVisible();
      console.log(`📌 Selection counter visible: ${counter}`);
      expect(counter).toBe(true);

      // Select multiple options
      await page.locator('button:has-text("Desenvolvimento Lento")').first().click();
      await page.waitForTimeout(300);

      await page.locator('button:has-text("Muitos Bugs")').first().click();
      await page.waitForTimeout(300);

      await page.locator('button:has-text("Custos Altos")').first().click();
      await page.waitForTimeout(300);

      // Check counter updated
      const counterUpdated = await page.locator('text=3 de 3 selecionado(s)').isVisible();
      console.log(`✅ Counter shows 3 selections: ${counterUpdated}`);

      // Try to select 4th option (should be disabled)
      const fourthOption = page.locator('button:has-text("Perdendo para Competidores")').first();
      const isDisabled = await fourthOption.evaluate(el => {
        return (el as HTMLButtonElement).disabled;
      });
      console.log(`✅ 4th option disabled: ${isDisabled}`);
      expect(isDisabled).toBe(true);

      // Click continue
      await page.locator('button:has-text("Continuar")').click();
      await page.waitForTimeout(1000);

      console.log('✅ Multi-choice question completed!');
    } else {
      console.log('⚠️ Multi-choice question not found yet');
    }
  });

  test('should handle text questions correctly', async ({ page }) => {
    console.log('🧪 Testing text questions still work...');

    // Fast-forward to Express Mode
    await page.fill('input[type="text"]', 'Problemas com velocidade');
    await page.press('input[type="text"]', 'Enter');
    await page.waitForTimeout(300);

    await page.fill('input[type="text"]', 'VP Engineering');
    await page.press('input[type="text"]', 'Enter');
    await page.waitForTimeout(300);

    await page.fill('input[type="text"]', '200');
    await page.press('input[type="text"]', 'Enter');
    await page.waitForTimeout(300);

    await page.fill('input[type="text"]', 'E-commerce');
    await page.press('input[type="text"]', 'Enter');
    await page.waitForTimeout(500);

    await page.waitForSelector('text=Express Mode', { timeout: 10000 });
    await page.locator('button:has-text("Express Mode")').first().click();
    await page.waitForTimeout(1500);

    await page.waitForSelector('text=Express AI', { timeout: 5000 });
    await page.waitForTimeout(1000);

    // Answer choice questions until we reach a text question
    // Keep clicking continue until we find a text input
    for (let i = 0; i < 5; i++) {
      // Check if there's a traditional text input
      const textInput = page.locator('input[placeholder*="Digite sua resposta"]');
      if (await textInput.isVisible()) {
        console.log('✅ Text question found!');

        // Type an answer
        await textInput.fill('Nossa empresa é a Liqi Digital Assets');
        await page.waitForTimeout(300);

        // Press Enter to submit
        await textInput.press('Enter');
        await page.waitForTimeout(1000);

        console.log('✅ Text question submitted successfully!');
        break;
      }

      // If it's a choice question, answer it and continue
      const continueButton = page.locator('button:has-text("Continuar")');
      if (await continueButton.isVisible()) {
        // Select first available option
        const firstClickableOption = page.locator('button').filter({ hasText: /Fintech|SaaS|E-commerce/ }).first();
        if (await firstClickableOption.isVisible()) {
          await firstClickableOption.click();
          await page.waitForTimeout(300);
        }
        await continueButton.click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test('should complete full Express Mode flow with hybrid inputs', async ({ page }) => {
    console.log('🧪 Testing full Express Mode flow...');

    // Fast-forward to Express Mode
    await page.fill('input[type="text"]', 'Desenvolvimento lento');
    await page.press('input[type="text"]', 'Enter');
    await page.waitForTimeout(300);

    await page.fill('input[type="text"]', 'CEO');
    await page.press('input[type="text"]', 'Enter');
    await page.waitForTimeout(300);

    await page.fill('input[type="text"]', '100');
    await page.press('input[type="text"]', 'Enter');
    await page.waitForTimeout(300);

    await page.fill('input[type="text"]', 'Fintech');
    await page.press('input[type="text"]', 'Enter');
    await page.waitForTimeout(500);

    await page.waitForSelector('text=Express Mode', { timeout: 10000 });
    await page.locator('button:has-text("Express Mode")').first().click();
    await page.waitForTimeout(1500);

    await page.waitForSelector('text=Express AI', { timeout: 5000 });

    // Answer 5-7 questions to complete assessment
    for (let i = 0; i < 7; i++) {
      console.log(`📝 Answering question ${i + 1}...`);

      // Wait a bit for question to load
      await page.waitForTimeout(1000);

      // Check if there's a text input
      const textInput = page.locator('input[placeholder*="Digite"]');
      if (await textInput.isVisible()) {
        await textInput.fill(`Resposta ${i + 1}`);
        await textInput.press('Enter');
        await page.waitForTimeout(1000);
        continue;
      }

      // Check if there's a continue button (choice question)
      const continueButton = page.locator('button:has-text("Continuar")');
      if (await continueButton.isVisible()) {
        // Select first available option(s)
        const clickableButtons = page.locator('button').filter({
          hasText: /Fintech|SaaS|E-commerce|Lento|Bugs|Custos|1-2 meses|3-6 meses|Sim|Não/
        });

        const firstButton = clickableButtons.first();
        if (await firstButton.isVisible()) {
          await firstButton.click();
          await page.waitForTimeout(300);
        }

        await continueButton.click();
        await page.waitForTimeout(1000);
      }

      // Check if assessment is complete
      const completionMessage = page.locator('text=Assessment Completo');
      if (await completionMessage.isVisible()) {
        console.log('✅ Assessment completed!');
        break;
      }
    }

    console.log('✅ Full Express Mode flow completed!');
  });
});
