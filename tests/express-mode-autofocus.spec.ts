/**
 * Express Mode Auto-Focus Test
 *
 * Tests that the input field automatically receives focus after each answer,
 * allowing users to type immediately without clicking.
 */

import { test, expect } from '@playwright/test';

test.describe('Express Mode Auto-Focus', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to assessment page
    await page.goto('http://localhost:3002/assessment');

    // Wait for AI Router to load
    await page.waitForSelector('text=Olá! Sou o CulturaBuilder AI', { timeout: 10000 });
  });

  test('input should auto-focus after each question in Express Mode', async ({ page }) => {
    console.log('🧪 Starting auto-focus test...');

    // Step 1: Complete AI Router (3-5 questions)
    console.log('📝 Completing AI Router...');

    // Answer question 1
    await page.fill('input[type="text"]', 'Desenvolvimento muito lento, perdemos para competidores');
    await page.press('input[type="text"]', 'Enter');
    await page.waitForTimeout(500);

    // Answer question 2
    await page.fill('input[type="text"]', 'CEO');
    await page.press('input[type="text"]', 'Enter');
    await page.waitForTimeout(500);

    // Answer question 3
    await page.fill('input[type="text"]', '200');
    await page.press('input[type="text"]', 'Enter');
    await page.waitForTimeout(500);

    // Answer question 4
    await page.fill('input[type="text"]', 'Fintech');
    await page.press('input[type="text"]', 'Enter');
    await page.waitForTimeout(500);

    // Wait for mode selection
    console.log('⏳ Waiting for mode selection...');
    await page.waitForSelector('text=Express Mode', { timeout: 10000 });

    // Select Express Mode
    console.log('⚡ Selecting Express Mode...');
    const expressButton = page.locator('button:has-text("Express Mode")').first();
    await expressButton.click();
    await page.waitForTimeout(1000);

    // Step 2: Test auto-focus in Express Mode
    console.log('🎯 Testing auto-focus behavior...');

    // Wait for first Express question
    await page.waitForSelector('text=Express AI', { timeout: 5000 });
    await page.waitForTimeout(500);

    // Check if input is focused initially
    const inputSelector = 'input[placeholder="Digite sua resposta..."]';
    await page.waitForSelector(inputSelector, { timeout: 5000 });

    const isInitiallyFocused = await page.evaluate((selector) => {
      const input = document.querySelector(selector) as HTMLInputElement;
      return document.activeElement === input;
    }, inputSelector);

    console.log(`📌 Input initially focused: ${isInitiallyFocused}`);

    // Answer first Express question
    console.log('💬 Answering first question...');
    await page.fill(inputSelector, 'Liqi, tokenização de ativos');
    await page.press(inputSelector, 'Enter');

    // Wait for response to be processed
    await page.waitForTimeout(1000);

    // Check if input is focused after first answer
    const isFocusedAfterFirst = await page.evaluate((selector) => {
      const input = document.querySelector(selector) as HTMLInputElement;
      const activeElement = document.activeElement;
      console.log('Active element:', activeElement?.tagName, activeElement?.getAttribute('placeholder'));
      return activeElement === input;
    }, inputSelector);

    console.log(`📌 Input focused after 1st answer: ${isFocusedAfterFirst}`);

    if (!isFocusedAfterFirst) {
      console.error('❌ FAIL: Input not focused after first answer!');

      // Debug: Get active element info
      const activeElementInfo = await page.evaluate(() => {
        const active = document.activeElement;
        return {
          tag: active?.tagName,
          id: active?.id,
          className: active?.className,
          placeholder: active?.getAttribute('placeholder')
        };
      });
      console.log('Current active element:', activeElementInfo);
    }

    // Try typing without clicking
    console.log('⌨️  Attempting to type without clicking...');
    await page.keyboard.type('Testing auto-type');
    await page.waitForTimeout(300);

    // Check if text was entered
    const inputValue = await page.inputValue(inputSelector);
    console.log(`Input value after typing: "${inputValue}"`);

    const canTypeWithoutClicking = inputValue.includes('Testing');
    console.log(`✅ Can type without clicking: ${canTypeWithoutClicking}`);

    // Clear and answer second question
    await page.fill(inputSelector, '');
    await page.fill(inputSelector, '10 pessoas');
    await page.press(inputSelector, 'Enter');
    await page.waitForTimeout(1000);

    // Check focus after second answer
    const isFocusedAfterSecond = await page.evaluate((selector) => {
      const input = document.querySelector(selector) as HTMLInputElement;
      return document.activeElement === input;
    }, inputSelector);

    console.log(`📌 Input focused after 2nd answer: ${isFocusedAfterSecond}`);

    // Final assertions
    expect(isFocusedAfterFirst).toBe(true);
    expect(canTypeWithoutClicking).toBe(true);
    expect(isFocusedAfterSecond).toBe(true);

    console.log('✅ Auto-focus test completed!');
  });

  test('should focus input immediately on Express Mode start', async ({ page }) => {
    console.log('🧪 Testing initial focus on Express Mode entry...');

    // Fast-forward through AI Router
    await page.fill('input[type="text"]', 'Desenvolvimento lento');
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

    // Select Express Mode
    await page.waitForSelector('text=Express Mode', { timeout: 10000 });
    const expressButton = page.locator('button:has-text("Express Mode")').first();
    await expressButton.click();
    await page.waitForTimeout(1500);

    // Check if input is focused immediately
    const inputSelector = 'input[placeholder="Digite sua resposta..."]';
    await page.waitForSelector(inputSelector, { timeout: 5000 });

    const isFocused = await page.evaluate((selector) => {
      const input = document.querySelector(selector) as HTMLInputElement;
      return document.activeElement === input;
    }, inputSelector);

    console.log(`📌 Input focused on Express Mode entry: ${isFocused}`);

    // Try typing immediately
    await page.keyboard.type('Immediate typing test');
    await page.waitForTimeout(200);

    const value = await page.inputValue(inputSelector);
    const canTypeImmediately = value.includes('Immediate');

    console.log(`✅ Can type immediately on entry: ${canTypeImmediately}`);

    expect(isFocused).toBe(true);
    expect(canTypeImmediately).toBe(true);
  });
});
