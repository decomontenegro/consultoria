/**
 * Final Auto-Focus Test
 *
 * Directly tests that text input receives focus automatically
 * after choice questions are answered.
 */

import { test, expect } from '@playwright/test';

test.describe('Auto-Focus - Final Test', () => {

  test('text input should auto-focus after choice questions', async ({ page }) => {
    console.log('🎯 FINAL AUTO-FOCUS TEST\n');

    await page.goto('http://localhost:3002/assessment');
    await page.waitForTimeout(2000);

    // Fast-forward through AI Router
    console.log('⚡ Fast-forwarding to Express Mode...');

    await page.waitForSelector('text=Olá! Sou o CulturaBuilder AI', { timeout: 10000 });

    // Q1
    const input1 = page.locator('input[type="text"]').first();
    await input1.fill('Desenvolvimento lento');
    await input1.press('Enter');
    await page.waitForTimeout(800);

    // Q2
    const input2 = page.locator('input[type="text"]').first();
    await input2.fill('CEO');
    await input2.press('Enter');
    await page.waitForTimeout(800);

    // Q3
    const input3 = page.locator('input[type="text"]').first();
    await input3.fill('100');
    await input3.press('Enter');
    await page.waitForTimeout(800);

    // Q4 - might be choice
    await page.waitForTimeout(1000);
    const hasChoice = await page.locator('button:has-text("Fintech")').count() > 0;
    if (hasChoice) {
      await page.locator('button:has-text("Fintech")').first().click();
      await page.waitForTimeout(300);
      await page.locator('button:has-text("Continuar")').click();
      await page.waitForTimeout(800);
      console.log('  ✅ Q4 (choice)');
    } else {
      const input4 = page.locator('input[type="text"]').first();
      await input4.fill('Fintech');
      await input4.press('Enter');
      await page.waitForTimeout(800);
      console.log('  ✅ Q4 (text)');
    }

    // Select Express Mode
    await page.waitForTimeout(1500);
    await page.waitForSelector('text=Express Mode', { timeout: 10000 });
    await page.locator('button:has-text("Express Mode")').first().click();
    await page.waitForTimeout(2000);
    console.log('✅ Express Mode selected\n');

    await page.waitForSelector('text=Express AI', { timeout: 5000 });
    await page.waitForTimeout(1500);

    console.log('📝 Answering Express Mode questions...\n');

    // Q1: Industry (single-choice)
    let q = 1;
    const industry = page.locator('button').filter({ hasText: /Fintech|SaaS/ }).first();
    if (await industry.isVisible({ timeout: 2000 })) {
      console.log(`  Q${q}: Industry (single-choice)`);
      await industry.click();
      await page.waitForTimeout(500);
      await page.locator('button:has-text("Continuar")').click();
      await page.waitForTimeout(1500);
      q++;
    }

    // Q2: Team Size (single-choice)
    const teamSize = page.locator('button').filter({ hasText: /10-30|31-50|51-100/ }).first();
    if (await teamSize.isVisible({ timeout: 2000 })) {
      console.log(`  Q${q}: Team Size (single-choice)`);
      await teamSize.click();
      await page.waitForTimeout(500);
      await page.locator('button:has-text("Continuar")').click();
      await page.waitForTimeout(1500);
      q++;
    }

    // Q3: Pain Points (multi-choice) - might be next
    const painPoint = page.locator('button:has-text("Desenvolvimento Lento")').first();
    if (await painPoint.isVisible({ timeout: 2000 })) {
      console.log(`  Q${q}: Pain Points (multi-choice)`);
      await painPoint.click();
      await page.waitForTimeout(300);

      const painPoint2 = page.locator('button:has-text("Muitos Bugs")').first();
      if (await painPoint2.isVisible()) {
        await painPoint2.click();
        await page.waitForTimeout(300);
      }

      await page.locator('button:has-text("Continuar")').click();
      await page.waitForTimeout(1500);
      q++;
    }

    // Now should have TEXT input
    console.log(`\n🔍 Q${q}: Looking for TEXT input...\n`);
    await page.waitForTimeout(1500);

    const textInput = page.locator('input[placeholder*="Digite"]');
    const isVisible = await textInput.isVisible();

    if (!isVisible) {
      console.log('❌ Text input not visible yet - test incomplete');
      expect(isVisible).toBe(true);
      return;
    }

    console.log('✅ Text input is VISIBLE\n');

    // Wait for auto-focus (our code tries at 0ms, RAF, and 800ms)
    console.log('⏳ Waiting 1200ms for auto-focus to complete...');
    await page.waitForTimeout(1200);

    // TEST 1: Check if input is focused
    const isFocused = await page.evaluate(() => {
      const input = document.querySelector('input[placeholder*="Digite"]') as HTMLInputElement;
      const activeElement = document.activeElement;
      return activeElement === input;
    });

    console.log(`\n📌 INPUT IS FOCUSED: ${isFocused ? '✅ YES' : '❌ NO'}`);

    if (!isFocused) {
      const activeInfo = await page.evaluate(() => {
        const active = document.activeElement;
        return {
          tag: active?.tagName,
          className: active?.className,
          id: active?.id
        };
      });
      console.log('   Current active element:', activeInfo);
    }

    // TEST 2: Try typing without clicking
    console.log('\n⌨️  TEST: Typing without clicking...');
    await page.keyboard.type('Auto typed text');
    await page.waitForTimeout(500);

    const inputValue = await textInput.inputValue();
    console.log(`   Input value: "${inputValue}"`);

    const canTypeWithoutClicking = inputValue.includes('Auto typed');
    console.log(`\n${canTypeWithoutClicking ? '✅' : '❌'} CAN TYPE WITHOUT CLICKING: ${canTypeWithoutClicking}`);

    // Take screenshots
    await page.screenshot({ path: 'test-results/autofocus-final-result.png', fullPage: true });

    // ASSERTIONS
    console.log('\n📊 FINAL RESULTS:\n');
    console.log(`   1. Input focused: ${isFocused ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   2. Can type without click: ${canTypeWithoutClicking ? '✅ PASS' : '❌ FAIL'}`);

    expect(isFocused).toBe(true);
    expect(canTypeWithoutClicking).toBe(true);

    console.log('\n🎉 AUTO-FOCUS TEST PASSED! 🎉\n');

    await page.waitForTimeout(2000);
  });
});
