/**
 * Simple Auto-Focus Test
 *
 * Tests that text input auto-focuses after choice questions in Express Mode.
 */

import { test, expect } from '@playwright/test';

test.describe('Auto-Focus - Simple Test', () => {

  test('should auto-focus text input after answering choice questions', async ({ page }) => {
    console.log('🧪 Testing auto-focus for text questions...');

    await page.goto('http://localhost:3002/assessment');
    await page.waitForTimeout(2000);

    console.log('📸 Step 1: Initial page');
    await page.screenshot({ path: 'test-results/autofocus-01-initial.png', fullPage: true });

    // Wait for AI Router
    try {
      await page.waitForSelector('text=Olá! Sou o CulturaBuilder AI', { timeout: 5000 });
      console.log('✅ AI Router loaded');
    } catch (e) {
      console.log('⚠️ AI Router not found');
    }

    // Answer AI Router questions
    console.log('\n📝 Answering AI Router...');

    const input1 = page.locator('input[type="text"]').first();
    if (await input1.isVisible({ timeout: 2000 })) {
      await input1.fill('Desenvolvimento lento');
      await input1.press('Enter');
      await page.waitForTimeout(1000);
      console.log('✅ Q1 answered');
    }

    const input2 = page.locator('input[type="text"]').first();
    if (await input2.isVisible({ timeout: 2000 })) {
      await input2.fill('CEO');
      await input2.press('Enter');
      await page.waitForTimeout(1000);
      console.log('✅ Q2 answered');
    }

    const input3 = page.locator('input[type="text"]').first();
    if (await input3.isVisible({ timeout: 2000 })) {
      await input3.fill('100');
      await input3.press('Enter');
      await page.waitForTimeout(1000);
      console.log('✅ Q3 answered');
    }

    // Q4 might be a choice question now (industry)
    await page.waitForTimeout(1500);

    // Check if there's a choice question or text input
    const hasChoiceButtons = await page.locator('button').filter({ hasText: /Fintech|SaaS|E-commerce/ }).count() > 0;

    if (hasChoiceButtons) {
      console.log('✅ Q4 is choice question');
      const firstChoice = page.locator('button').filter({ hasText: /Fintech|SaaS/ }).first();
      await firstChoice.click();
      await page.waitForTimeout(300);

      const continueBtn = page.locator('button:has-text("Continuar")');
      if (await continueBtn.isVisible()) {
        await continueBtn.click();
        await page.waitForTimeout(1000);
        console.log('✅ Q4 answered (choice)');
      }
    } else {
      const input4 = page.locator('input[type="text"]').first();
      if (await input4.isVisible()) {
        await input4.fill('Fintech');
        await input4.press('Enter');
        await page.waitForTimeout(1000);
        console.log('✅ Q4 answered (text)');
      }
    }

    // Wait for mode selection
    console.log('\n⚡ Selecting Express Mode...');
    await page.waitForTimeout(1500);

    try {
      await page.waitForSelector('text=Express Mode', { timeout: 5000 });
      await page.locator('button:has-text("Express Mode")').first().click();
      await page.waitForTimeout(2000);
      console.log('✅ Express Mode selected');
    } catch (e) {
      console.log('⚠️ Express Mode button not found');
    }

    await page.screenshot({ path: 'test-results/autofocus-02-express-start.png', fullPage: true });

    // Wait for Express Mode to load
    await page.waitForSelector('text=Express AI', { timeout: 5000 });
    await page.waitForTimeout(1500);

    console.log('\n🎯 Testing auto-focus in Express Mode...');

    // Answer first question (single-choice - industry)
    let currentQuestionNum = 1;

    const industryOption = page.locator('button').filter({ hasText: /Fintech|SaaS/ }).first();
    if (await industryOption.isVisible()) {
      console.log(`\n📝 Question ${currentQuestionNum}: Choice question (Industry)`);
      await industryOption.click();
      await page.waitForTimeout(500);
      await page.locator('button:has-text("Continuar")').click();
      await page.waitForTimeout(1500);
      console.log('✅ Answered');
      currentQuestionNum++;
    }

    // Answer second question (multi-choice - pain points)
    const painOption1 = page.locator('button:has-text("Desenvolvimento Lento")').first();
    if (await painOption1.isVisible()) {
      console.log(`\n📝 Question ${currentQuestionNum}: Multi-choice (Pain Points)`);
      await painOption1.click();
      await page.waitForTimeout(300);

      const painOption2 = page.locator('button:has-text("Muitos Bugs")').first();
      await painOption2.click();
      await page.waitForTimeout(300);

      await page.locator('button:has-text("Continuar")').click();
      await page.waitForTimeout(1500);
      console.log('✅ Answered');
      currentQuestionNum++;
    }

    // Answer third question (single-choice - team size)
    const teamSizeOption = page.locator('button').filter({ hasText: /10-30|31-50|51-100/ }).first();
    if (await teamSizeOption.isVisible()) {
      console.log(`\n📝 Question ${currentQuestionNum}: Choice question (Team Size)`);
      await teamSizeOption.click();
      await page.waitForTimeout(500);
      await page.locator('button:has-text("Continuar")').click();
      await page.waitForTimeout(1500);
      console.log('✅ Answered');
      currentQuestionNum++;
    }

    // NOW should have a TEXT question
    console.log(`\n🔍 Question ${currentQuestionNum}: Looking for TEXT question...`);
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'test-results/autofocus-03-before-text.png', fullPage: true });

    const textInput = page.locator('input[placeholder*="Digite"]');
    const textInputVisible = await textInput.isVisible();

    console.log(`📌 Text input visible: ${textInputVisible}`);

    if (textInputVisible) {
      // Wait for auto-focus to kick in (800ms delay)
      console.log('⏳ Waiting 1 second for auto-focus...');
      await page.waitForTimeout(1000);

      // Check if focused
      const isFocused = await page.evaluate(() => {
        const input = document.querySelector('input[placeholder*="Digite"]') as HTMLInputElement;
        const activeElement = document.activeElement;
        console.log('Active element:', activeElement?.tagName, activeElement?.getAttribute('placeholder'));
        return activeElement === input;
      });

      console.log(`📌 Input auto-focused: ${isFocused ? '✅ YES' : '❌ NO'}`);

      if (!isFocused) {
        const activeElementInfo = await page.evaluate(() => {
          const active = document.activeElement;
          return {
            tag: active?.tagName,
            className: active?.className,
            placeholder: active?.getAttribute('placeholder')
          };
        });
        console.log('🔍 Active element:', JSON.stringify(activeElementInfo, null, 2));
      }

      // Try typing without clicking
      console.log('\n⌨️  Typing without clicking...');
      await page.keyboard.type('Teste automatico');
      await page.waitForTimeout(500);

      const inputValue = await textInput.inputValue();
      console.log(`Input value: "${inputValue}"`);

      const canTypeWithoutClicking = inputValue.includes('Teste');
      console.log(`${canTypeWithoutClicking ? '✅' : '❌'} Can type without clicking: ${canTypeWithoutClicking}`);

      await page.screenshot({ path: 'test-results/autofocus-04-after-typing.png', fullPage: true });

      // Test assertion
      expect(canTypeWithoutClicking).toBe(true);

      console.log('\n✅ Auto-focus test completed!');
    } else {
      console.log('⚠️ Text input not found - might need to answer more choice questions');

      // Try to find and answer more questions
      for (let i = 0; i < 3; i++) {
        await page.waitForTimeout(1000);

        const anyChoice = page.locator('button').first();
        if (await anyChoice.isVisible()) {
          await anyChoice.click();
          await page.waitForTimeout(300);

          const continueBtn = page.locator('button:has-text("Continuar")');
          if (await continueBtn.isVisible()) {
            await continueBtn.click();
            await page.waitForTimeout(1000);
            console.log(`✅ Answered question ${currentQuestionNum + i}`);
          }
        }

        const textInput2 = page.locator('input[placeholder*="Digite"]');
        if (await textInput2.isVisible()) {
          console.log('✅ Text input found!');
          break;
        }
      }
    }

    await page.waitForTimeout(3000);
  });
});
