/**
 * Test: Check Portuguese translations in reports
 */

import { test } from '@playwright/test';

test('Check Portuguese translations in imported report', async ({ page }) => {
  // Navigate to first imported report
  await page.goto('http://localhost:3003/report/1761310379985-yz3qhfo');

  // Wait for page to load
  await page.waitForTimeout(3000);

  // Take full page screenshot
  await page.screenshot({
    path: 'tests/screenshots/report-portuguese-check.png',
    fullPage: true
  });

  console.log('\n📸 Screenshot saved: tests/screenshots/report-portuguese-check.png');
  console.log('Review the screenshot to check for English terms that need translation\n');
});

test('Check Portuguese in imported reports index', async ({ page }) => {
  // Navigate to imported reports index
  await page.goto('http://localhost:3003/imported-reports');

  // Wait for page to load
  await page.waitForTimeout(2000);

  // Take screenshot
  await page.screenshot({
    path: 'tests/screenshots/imported-reports-portuguese-check.png',
    fullPage: true
  });

  console.log('\n📸 Screenshot saved: tests/screenshots/imported-reports-portuguese-check.png\n');
});
