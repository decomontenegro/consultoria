import { test } from '@playwright/test';

test('Debug adaptive assessment - manual inspection', async ({ page }) => {
  // Enable console logging
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    console.log(`[BROWSER ${type.toUpperCase()}]`, text);
  });

  // Enable error logging
  page.on('pageerror', error => {
    console.log('[BROWSER ERROR]', error.message);
  });

  // Navigate to adaptive mode
  console.log('\n📋 Navigating to /assessment?mode=adaptive...\n');
  await page.goto('/assessment?mode=adaptive');

  // Wait to see what happens
  console.log('\n⏱️ Waiting 10 seconds to observe page state...\n');
  await page.waitForTimeout(10000);

  // Get page state
  const bodyHTML = await page.locator('body').innerHTML();
  console.log('\n📄 Page HTML length:', bodyHTML.length);

  // Check for loading state
  const loadingText = await page.locator('text=Analisando').count();
  console.log('🔄 "Analisando" elements found:', loadingText);

  // Check for input fields
  const textInputs = await page.locator('textarea, input[type="text"]').count();
  console.log('📝 Text inputs found:', textInputs);

  // Check current step
  const stepText = await page.locator('[class*="step"]').first().textContent().catch(() => 'Not found');
  console.log('📍 Step indicator:', stepText);

  console.log('\n✅ Debug complete - check logs above\n');
});
