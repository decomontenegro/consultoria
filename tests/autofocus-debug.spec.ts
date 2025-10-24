/**
 * Auto-Focus Debug Test
 *
 * Deep investigation into why input doesn't auto-focus after answering questions.
 * Tests multiple scenarios and tracks what element is stealing focus.
 */

import { test, expect } from '@playwright/test';

test.describe('Auto-Focus Debug', () => {

  test('should track focus events and identify focus thief', async ({ page }) => {
    console.log('🔍 Starting deep auto-focus investigation...');

    // Track all focus events
    await page.goto('http://localhost:3002/assessment');

    // Inject focus tracker
    await page.evaluate(() => {
      const focusLog: any[] = [];
      (window as any).focusLog = focusLog;

      document.addEventListener('focus', (e) => {
        const target = e.target as HTMLElement;
        focusLog.push({
          type: 'focus',
          time: Date.now(),
          tag: target.tagName,
          id: target.id,
          className: target.className,
          placeholder: target.getAttribute('placeholder')
        });
        console.log('🔵 FOCUS:', target.tagName, target.className);
      }, true);

      document.addEventListener('blur', (e) => {
        const target = e.target as HTMLElement;
        focusLog.push({
          type: 'blur',
          time: Date.now(),
          tag: target.tagName,
          id: target.id,
          className: target.className
        });
        console.log('🔴 BLUR:', target.tagName, target.className);
      }, true);
    });

    console.log('✅ Focus tracker injected');

    // Wait for AI Router
    await page.waitForSelector('text=Olá! Sou o CulturaBuilder AI', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Fast-forward to Express Mode
    console.log('📝 Answering AI Router questions...');

    await page.fill('input[type="text"]', 'Desenvolvimento lento');
    await page.press('input[type="text"]', 'Enter');
    await page.waitForTimeout(1000);

    await page.fill('input[type="text"]', 'CEO');
    await page.press('input[type="text"]', 'Enter');
    await page.waitForTimeout(1000);

    await page.fill('input[type="text"]', '100');
    await page.press('input[type="text"]', 'Enter');
    await page.waitForTimeout(1000);

    await page.fill('input[type="text"]', 'Fintech');
    await page.press('input[type="text"]', 'Enter');
    await page.waitForTimeout(1000);

    // Select Express Mode
    await page.waitForSelector('text=Express Mode', { timeout: 10000 });
    await page.locator('button:has-text("Express Mode")').first().click();
    await page.waitForTimeout(2000);

    // Wait for Express Mode to load
    await page.waitForSelector('text=Express AI', { timeout: 5000 });
    await page.waitForTimeout(1000);

    console.log('⚡ Express Mode loaded');

    // Answer first question (single-choice - should have Continue button)
    const firstOption = page.locator('button').filter({ hasText: /Fintech|SaaS/ }).first();
    if (await firstOption.isVisible()) {
      await firstOption.click();
      await page.waitForTimeout(500);
      await page.locator('button:has-text("Continuar")').click();
      console.log('✅ Answered first choice question');
      await page.waitForTimeout(1500);
    }

    // Answer second question (multi-choice pain points)
    const painOption1 = page.locator('button:has-text("Desenvolvimento Lento")').first();
    const painOption2 = page.locator('button:has-text("Muitos Bugs")').first();

    if (await painOption1.isVisible()) {
      await painOption1.click();
      await page.waitForTimeout(300);
      await painOption2.click();
      await page.waitForTimeout(300);
      await page.locator('button:has-text("Continuar")').click();
      console.log('✅ Answered second choice question');
      await page.waitForTimeout(1500);
    }

    // Now should be at a text question
    console.log('🔍 Looking for text input...');

    const textInput = page.locator('input[placeholder*="Digite"]');
    const textInputVisible = await textInput.isVisible();

    console.log(`📌 Text input visible: ${textInputVisible}`);

    if (textInputVisible) {
      // Check if it's focused immediately
      const isFocusedImmediately = await page.evaluate((selector) => {
        const input = document.querySelector(selector) as HTMLInputElement;
        const activeElement = document.activeElement;
        console.log('Active element:', activeElement?.tagName, activeElement?.getAttribute('placeholder'));
        return activeElement === input;
      }, 'input[placeholder*="Digite"]');

      console.log(`📌 Input focused immediately: ${isFocusedImmediately}`);

      if (!isFocusedImmediately) {
        console.log('❌ Input NOT focused!');

        // Get active element details
        const activeElementInfo = await page.evaluate(() => {
          const active = document.activeElement;
          return {
            tag: active?.tagName,
            id: active?.id,
            className: active?.className,
            placeholder: active?.getAttribute('placeholder'),
            role: active?.getAttribute('role'),
            href: active?.getAttribute('href')
          };
        });

        console.log('🔍 Current active element:', JSON.stringify(activeElementInfo, null, 2));

        // Get focus log
        const focusLog = await page.evaluate(() => (window as any).focusLog);
        console.log('📋 Focus log (last 10 events):');
        focusLog.slice(-10).forEach((log: any) => {
          console.log(`  ${log.type.toUpperCase()}: ${log.tag} ${log.className || ''} ${log.placeholder || ''}`);
        });

        // Try to identify patterns
        const lastFocusEvents = focusLog.slice(-5).filter((log: any) => log.type === 'focus');
        console.log('\n🔍 Last 5 focus events:');
        lastFocusEvents.forEach((log: any) => {
          console.log(`  → ${log.tag} ${log.className} ${log.placeholder || ''}`);
        });
      }

      // Try typing without clicking
      console.log('⌨️  Attempting to type without clicking...');
      await page.keyboard.type('Test typing');
      await page.waitForTimeout(300);

      const inputValue = await textInput.inputValue();
      console.log(`Input value after typing: "${inputValue}"`);

      const canTypeWithoutClicking = inputValue.includes('Test');
      console.log(`${canTypeWithoutClicking ? '✅' : '❌'} Can type without clicking: ${canTypeWithoutClicking}`);

      // Now click and try again
      console.log('\n🖱️  Clicking input manually...');
      await textInput.click();
      await page.waitForTimeout(300);

      await page.keyboard.type(' After Click');
      await page.waitForTimeout(300);

      const inputValue2 = await textInput.inputValue();
      console.log(`Input value after clicking: "${inputValue2}"`);

      // Get final focus log
      const finalFocusLog = await page.evaluate(() => (window as any).focusLog);
      console.log('\n📋 Focus events after click:');
      finalFocusLog.slice(-5).forEach((log: any) => {
        console.log(`  ${log.type.toUpperCase()}: ${log.tag} ${log.className || ''}`);
      });

      expect(canTypeWithoutClicking).toBe(true);
    } else {
      console.log('⚠️ Text input not found, might still be on choice questions');
    }

    // Keep browser open for inspection
    await page.waitForTimeout(3000);
  });

  test('should test different timing strategies for auto-focus', async ({ page }) => {
    console.log('🔍 Testing timing strategies...');

    await page.goto('http://localhost:3002/assessment');
    await page.waitForSelector('text=Olá! Sou o CulturaBuilder AI', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Fast-forward
    await page.fill('input[type="text"]', 'Lento');
    await page.press('input[type="text"]', 'Enter');
    await page.waitForTimeout(500);

    await page.fill('input[type="text"]', 'CTO');
    await page.press('input[type="text"]', 'Enter');
    await page.waitForTimeout(500);

    await page.fill('input[type="text"]', '50');
    await page.press('input[type="text"]', 'Enter');
    await page.waitForTimeout(500);

    await page.fill('input[type="text"]', 'SaaS');
    await page.press('input[type="text"]', 'Enter');
    await page.waitForTimeout(500);

    await page.waitForSelector('text=Express Mode', { timeout: 10000 });
    await page.locator('button:has-text("Express Mode")').first().click();
    await page.waitForTimeout(2000);

    await page.waitForSelector('text=Express AI', { timeout: 5000 });

    // Test: Check focus at different intervals
    const intervals = [0, 100, 300, 500, 800, 1000, 1500];

    for (const delay of intervals) {
      console.log(`\n⏱️  Testing at ${delay}ms delay...`);
      await page.waitForTimeout(delay);

      const isFocused = await page.evaluate(() => {
        const input = document.querySelector('input[placeholder*="Digite"]') as HTMLInputElement;
        return document.activeElement === input;
      });

      console.log(`  ${delay}ms: ${isFocused ? '✅' : '❌'} Input focused`);
    }
  });
});
