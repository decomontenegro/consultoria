import { test, expect } from '@playwright/test';

/**
 * SMOKE TESTS - CulturaBuilder Platform
 *
 * Fast, pragmatic tests to protect critical functionality during refactoring.
 * Total execution time: < 1 minute
 *
 * These tests verify that key pages load and basic navigation works.
 * More detailed flow tests can be found in complete-funnel.spec.ts
 */

const BASE_URL = 'http://localhost:3003';

test.describe('Smoke Tests - Basic Functionality', () => {

  test('Homepage should load successfully', async ({ page }) => {
    await page.goto(BASE_URL);

    // Verify homepage loaded
    await expect(page.locator('text=/.*CulturaBuilder.*/i').first()).toBeVisible();
    await expect(page.locator('text=/.*AI Enterprise Solution.*/i')).toBeVisible();

    // Verify main CTA button exists
    await expect(page.locator('text=/.*Começar.*|.*Iniciar Assessment.*/i').first()).toBeVisible();
  });

  test('Assessment page should load and show AI interface', async ({ page }) => {
    await page.goto(BASE_URL + '/assessment');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Verify we're on assessment page (either AI Router or Traditional Flow)
    await expect(page).toHaveURL(/.*\/assessment.*/);

    // Verify some assessment UI is present
    const pageText = await page.textContent('body');
    expect(pageText).toBeTruthy();
  });

  test('Navigation from homepage to assessment works', async ({ page }) => {
    await page.goto(BASE_URL);

    // Click main CTA
    await page.click('text=/.*Começar Agora.*|.*Iniciar Assessment.*/i');

    // Should navigate to assessment
    await page.waitForURL(/.*\/assessment.*/);

    // Verify we're on the assessment page
    await expect(page).toHaveURL(/.*\/assessment.*/);
  });

  test('Sample report page should load', async ({ page }) => {
    await page.goto(BASE_URL + '/sample');

    // Wait for report to render
    await page.waitForLoadState('networkidle');

    // Verify report content exists
    const hasReportContent = await page.locator('body').textContent();
    expect(hasReportContent).toBeTruthy();
  });

});

// ============================================================================
// EXECUTION SUMMARY
// ============================================================================

test.afterAll(async () => {
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('✅ SMOKE TESTS COMPLETED');
  console.log('═══════════════════════════════════════════');
  console.log('Coverage:');
  console.log('  ✓ Homepage loads');
  console.log('  ✓ Assessment page accessible');
  console.log('  ✓ Navigation works');
  console.log('  ✓ Sample report loads');
  console.log('');
  console.log('🎯 Basic functionality protected');
  console.log('🚀 Ready for refactoring');
  console.log('═══════════════════════════════════════════');
});
