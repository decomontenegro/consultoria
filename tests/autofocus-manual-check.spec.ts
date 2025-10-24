/**
 * Manual Auto-Focus Check
 *
 * Opens the browser and pauses for manual inspection of auto-focus behavior.
 */

import { test } from '@playwright/test';

test.describe('Auto-Focus - Manual Check', () => {

  test('manual inspection of auto-focus', async ({ page }) => {
    console.log('\n🔍 MANUAL AUTO-FOCUS INSPECTION\n');
    console.log('Instructions:');
    console.log('1. Browser will open and navigate to assessment');
    console.log('2. Complete AI Router questions manually');
    console.log('3. Select Express Mode');
    console.log('4. Answer choice questions by clicking options + Continue');
    console.log('5. When a TEXT input appears, DO NOT CLICK IT');
    console.log('6. Just start typing immediately');
    console.log('7. If you can type without clicking = AUTO-FOCUS WORKS ✅');
    console.log('8. If you need to click first = AUTO-FOCUS BROKEN ❌\n');

    await page.goto('http://localhost:3002/assessment');

    console.log('✅ Page loaded');
    console.log('⏸️  Test paused - interact with the page manually\n');
    console.log('Press Ctrl+C to end the test when done.\n');

    // Pause indefinitely for manual testing
    await page.pause();
  });

  test('quick path to text input', async ({ page }) => {
    console.log('\n⚡ QUICK PATH TO TEXT INPUT\n');

    await page.goto('http://localhost:3002/assessment');
    await page.waitForTimeout(2000);

    console.log('📝 Answering AI Router (3 questions)...');

    // Answer AI Router
    await page.waitForSelector('text=Olá! Sou o CulturaBuilder AI', { timeout: 10000 });

    const input1 = page.locator('input[type="text"]').first();
    await input1.fill('Desenvolvimento lento');
    await input1.press('Enter');
    await page.waitForTimeout(1000);
    console.log('  ✅ Q1');

    const input2 = page.locator('input[type="text"]').first();
    await input2.fill('CEO');
    await input2.press('Enter');
    await page.waitForTimeout(1000);
    console.log('  ✅ Q2');

    const input3 = page.locator('input[type="text"]').first();
    await input3.fill('100');
    await input3.press('Enter');
    await page.waitForTimeout(1000);
    console.log('  ✅ Q3');

    // Wait for mode selection
    await page.waitForTimeout(2000);
    console.log('\n⚡ Selecting Express Mode...');

    const expressBtn = page.locator('button').filter({ hasText: /Express Mode/ }).first();
    await expressBtn.waitFor({ state: 'visible', timeout: 10000 });
    await expressBtn.click();
    await page.waitForTimeout(2500);
    console.log('✅ Express Mode selected\n');

    // Wait for Express Mode to load
    await page.waitForSelector('text=Express AI', { timeout: 5000 });
    await page.waitForTimeout(2000);

    console.log('📝 Answering Express Mode questions...\n');

    // Answer up to 5 choice questions to reach a text question
    for (let i = 1; i <= 5; i++) {
      await page.waitForTimeout(1000);

      // Check if we have a text input
      const textInput = page.locator('input[placeholder*="Digite"]');
      if (await textInput.isVisible({ timeout: 1000 })) {
        console.log(`\n🎯 TEXT INPUT FOUND at question ${i}!\n`);

        console.log('⏳ Waiting 1.5s for auto-focus...');
        await page.waitForTimeout(1500);

        // Check focus
        const isFocused = await page.evaluate(() => {
          const input = document.querySelector('input[placeholder*="Digite"]') as HTMLInputElement;
          return document.activeElement === input;
        });

        console.log(`📌 Input focused: ${isFocused ? '✅ YES' : '❌ NO'}\n`);

        if (!isFocused) {
          const active = await page.evaluate(() => {
            const el = document.activeElement;
            return { tag: el?.tagName, class: el?.className };
          });
          console.log(`   Active element: ${active.tag} ${active.class}\n`);
        }

        console.log('⏸️  PAUSED - Try typing now (without clicking)');
        console.log('   If text appears in input = ✅ SUCCESS');
        console.log('   If nothing happens = ❌ FAIL\n');

        await page.pause();
        return;
      }

      // If not text input, try to answer choice question
      const continueBtn = page.locator('button:has-text("Continuar")');
      if (await continueBtn.isVisible({ timeout: 1000 })) {
        // Find and click first available option
        const allButtons = await page.locator('button').all();

        for (const btn of allButtons) {
          const text = await btn.textContent();
          if (text && !text.includes('Continuar') && !text.includes('Express Mode')) {
            try {
              await btn.click({ timeout: 500 });
              console.log(`  Q${i}: Clicked option`);
              await page.waitForTimeout(300);
              break;
            } catch (e) {
              // Button might be disabled, try next
            }
          }
        }

        // Click continue
        await continueBtn.click();
        await page.waitForTimeout(1500);
        console.log(`  ✅ Q${i} answered (choice)`);
      }
    }

    console.log('\n⚠️ No text input found after 5 questions');
    await page.pause();
  });
});
