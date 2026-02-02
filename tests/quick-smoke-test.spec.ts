import { test, expect } from '@playwright/test';

test('quick smoke test - can access home page', async ({ page }) => {
  console.log('Starting quick smoke test...');

  await page.goto('http://localhost:3003');
  console.log('Navigated to home page');

  await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
  console.log('Page loaded');

  const title = await page.title();
  console.log(`Page title: ${title}`);

  // Just check that we got some content
  const body = await page.textContent('body');
  expect(body).toBeTruthy();
  expect(body!.length).toBeGreaterThan(50);

  console.log('✅ Smoke test passed!');
});
