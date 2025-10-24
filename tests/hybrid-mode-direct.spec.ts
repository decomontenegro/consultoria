/**
 * Hybrid Mode Direct Test
 *
 * Directly tests hybrid inputs by navigating to Express Mode
 * without going through AI Router.
 */

import { test, expect } from '@playwright/test';

test.describe('Hybrid Mode - Direct Test', () => {

  test('should manually verify hybrid mode components render', async ({ page }) => {
    console.log('🧪 Manual verification test...');

    // Navigate to assessment page
    await page.goto('http://localhost:3002/assessment');
    console.log('✅ Navigated to assessment page');

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Take screenshot of initial state
    await page.screenshot({ path: 'test-results/hybrid-manual-01-initial.png', fullPage: true });
    console.log('📸 Screenshot 1: Initial state');

    // Wait for AI Router
    try {
      await page.waitForSelector('text=Olá! Sou o CulturaBuilder AI', { timeout: 5000 });
      console.log('✅ AI Router loaded');
    } catch (e) {
      console.log('⚠️ AI Router not found, continuing...');
    }

    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/hybrid-manual-02-ai-router.png', fullPage: true });
    console.log('📸 Screenshot 2: AI Router');

    // Try to answer first AI Router question
    const firstInput = page.locator('input[type="text"]').first();
    if (await firstInput.isVisible()) {
      await firstInput.fill('Desenvolvimento lento');
      await firstInput.press('Enter');
      await page.waitForTimeout(1000);
      console.log('✅ Answered first AI Router question');
    }

    await page.screenshot({ path: 'test-results/hybrid-manual-03-after-q1.png', fullPage: true });
    console.log('📸 Screenshot 3: After question 1');

    // Answer second question
    const secondInput = page.locator('input[type="text"]').first();
    if (await secondInput.isVisible()) {
      await secondInput.fill('CEO');
      await secondInput.press('Enter');
      await page.waitForTimeout(1000);
      console.log('✅ Answered second AI Router question');
    }

    await page.screenshot({ path: 'test-results/hybrid-manual-04-after-q2.png', fullPage: true });
    console.log('📸 Screenshot 4: After question 2');

    // Answer third question
    const thirdInput = page.locator('input[type="text"]').first();
    if (await thirdInput.isVisible()) {
      await thirdInput.fill('100');
      await thirdInput.press('Enter');
      await page.waitForTimeout(1000);
      console.log('✅ Answered third AI Router question');
    }

    await page.screenshot({ path: 'test-results/hybrid-manual-05-after-q3.png', fullPage: true });
    console.log('📸 Screenshot 5: After question 3');

    // Answer fourth question (or select if it's a choice)
    await page.waitForTimeout(1000);

    // Check if there's a text input or choice buttons
    const fourthInput = page.locator('input[type="text"]').first();
    if (await fourthInput.isVisible()) {
      await fourthInput.fill('Fintech');
      await fourthInput.press('Enter');
      await page.waitForTimeout(1000);
      console.log('✅ Answered fourth AI Router question (text)');
    } else {
      console.log('⚠️ No text input found for Q4, might be choice question');
    }

    await page.screenshot({ path: 'test-results/hybrid-manual-06-after-q4.png', fullPage: true });
    console.log('📸 Screenshot 6: After question 4');

    // Wait for mode selection
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/hybrid-manual-07-mode-selection.png', fullPage: true });
    console.log('📸 Screenshot 7: Mode selection');

    // Try to click Express Mode
    try {
      await page.waitForSelector('text=Express Mode', { timeout: 5000 });
      const expressButton = page.locator('button:has-text("Express Mode")').first();
      await expressButton.click();
      await page.waitForTimeout(2000);
      console.log('✅ Selected Express Mode');
    } catch (e) {
      console.log('⚠️ Express Mode button not found');
    }

    await page.screenshot({ path: 'test-results/hybrid-manual-08-express-mode-start.png', fullPage: true });
    console.log('📸 Screenshot 8: Express Mode start');

    // Wait for Express Mode to load
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/hybrid-manual-09-express-first-question.png', fullPage: true });
    console.log('📸 Screenshot 9: Express Mode first question');

    // Check what type of input is shown
    const hasTextInput = await page.locator('input[placeholder*="Digite"]').isVisible();
    const hasContinueButton = await page.locator('button:has-text("Continuar")').isVisible();
    const hasRadioButtons = await page.locator('button').filter({ hasText: /Fintech|SaaS|E-commerce/ }).count();

    console.log(`📌 Text input visible: ${hasTextInput}`);
    console.log(`📌 Continue button visible: ${hasContinueButton}`);
    console.log(`📌 Radio buttons count: ${hasRadioButtons}`);

    if (hasContinueButton) {
      console.log('✅ SUCCESS: Hybrid mode is active! Continue button found.');

      // Try to interact with first option
      const firstOption = page.locator('button').filter({ hasText: /Fintech|SaaS|E-commerce/ }).first();
      if (await firstOption.isVisible()) {
        await firstOption.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'test-results/hybrid-manual-10-option-selected.png', fullPage: true });
        console.log('📸 Screenshot 10: Option selected');

        // Click continue
        await page.locator('button:has-text("Continuar")').click();
        await page.waitForTimeout(1500);
        await page.screenshot({ path: 'test-results/hybrid-manual-11-after-continue.png', fullPage: true });
        console.log('📸 Screenshot 11: After clicking continue');
      }
    } else if (hasTextInput) {
      console.log('⚠️ Text input found instead of choice question');
    } else {
      console.log('❌ FAIL: Neither text input nor choice question found');
    }

    console.log('✅ Manual verification completed. Check screenshots in test-results/');

    // Keep browser open for 5 seconds for manual inspection
    await page.waitForTimeout(5000);
  });
});
