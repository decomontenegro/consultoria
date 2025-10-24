/**
 * Playwright Test: Imported Reports UI
 *
 * Tests the user interface for viewing imported CSV reports
 */

import { test, expect } from '@playwright/test';

test.describe('Imported Reports UI', () => {
  test('should display imported reports index page', async ({ page }) => {
    console.log('\n📊 TESTING IMPORTED REPORTS INDEX PAGE...\n');

    // Navigate to imported reports page
    await page.goto('http://localhost:3003/imported-reports');

    // Wait for page to load
    await page.waitForSelector('h1:has-text("Relatórios Importados")', { timeout: 10000 });

    // Check header
    const header = await page.locator('h1').textContent();
    console.log(`✅ Header found: ${header}`);
    expect(header).toContain('Relatórios Importados');

    // Check summary stats
    const companies = await page.locator('text=Empresas').count();
    expect(companies).toBeGreaterThan(0);
    console.log('✅ Summary stats visible');

    // Check consolidated reports section
    const consolidatedSection = await page.locator('h2:has-text("Consolidados")');
    expect(await consolidatedSection.count()).toBeGreaterThan(0);
    console.log('✅ Consolidated reports section found');

    // Check if report cards are visible
    const reportCards = await page.locator('.card-professional').count();
    console.log(`✅ Found ${reportCards} report cards`);
    expect(reportCards).toBeGreaterThan(0);

    // Take screenshot
    await page.screenshot({
      path: 'tests/screenshots/imported-reports-index.png',
      fullPage: true
    });
    console.log('📸 Screenshot saved: tests/screenshots/imported-reports-index.png\n');
  });

  test('should display individual report from CSV', async ({ page }) => {
    console.log('\n📄 TESTING INDIVIDUAL CSV REPORT VIEW...\n');

    // First, get a report ID from the API
    const response = await page.request.get('http://localhost:3003/api/imported-reports');
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.reports.individual.length).toBeGreaterThan(0);

    const firstReport = data.reports.individual[0];
    console.log(`📋 Testing report: ${firstReport.companyName}`);
    console.log(`   Department: ${firstReport.department}`);
    console.log(`   ID: ${firstReport.id}`);

    // Navigate to the report page
    await page.goto(`http://localhost:3003/report/${firstReport.id}`);

    // Wait for report to load
    await page.waitForSelector('text=/ROI|Report|Relatório/i', { timeout: 15000 });

    // Check if company name is visible
    const companyNameVisible = await page.locator(`text=${firstReport.companyName.split('-')[0].trim()}`).count();
    expect(companyNameVisible).toBeGreaterThan(0);
    console.log(`✅ Company name visible: ${firstReport.companyName}`);

    // Check if ROI section is visible
    const roiSection = await page.locator('text=/ROI|Retorno/i').count();
    expect(roiSection).toBeGreaterThan(0);
    console.log('✅ ROI section visible');

    // Check if roadmap section is visible
    const roadmapSection = await page.locator('text=/Roadmap|Roteiro/i').count();
    expect(roadmapSection).toBeGreaterThan(0);
    console.log('✅ Roadmap section visible');

    // Check layout selector
    const layoutSelector = await page.locator('text=/Layout|Escolha/i').count();
    expect(layoutSelector).toBeGreaterThan(0);
    console.log('✅ Layout selector visible');

    // Take screenshot
    await page.screenshot({
      path: `tests/screenshots/csv-report-${firstReport.id}.png`,
      fullPage: true
    });
    console.log(`📸 Screenshot saved: tests/screenshots/csv-report-${firstReport.id}.png\n`);
  });

  test('should display consolidated report from CSV', async ({ page }) => {
    console.log('\n🏢 TESTING CONSOLIDATED CSV REPORT VIEW...\n');

    // Get consolidated report ID from API
    const response = await page.request.get('http://localhost:3003/api/imported-reports');
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.reports.consolidated.length).toBeGreaterThan(0);

    const consolidatedReport = data.reports.consolidated[0];
    console.log(`📋 Testing report: ${consolidatedReport.companyName}`);
    console.log(`   Departments: ${consolidatedReport.departmentCount}`);
    console.log(`   ID: ${consolidatedReport.id}`);

    // Navigate to the report page
    await page.goto(`http://localhost:3003/report/${consolidatedReport.id}`);

    // Wait for report to load
    await page.waitForSelector('text=/ROI|Report|Relatório/i', { timeout: 15000 });

    // Check if company name is visible
    const companyNameVisible = await page.locator(`text=${consolidatedReport.companyName.split('(')[0].trim()}`).count();
    expect(companyNameVisible).toBeGreaterThan(0);
    console.log(`✅ Company name visible: ${consolidatedReport.companyName}`);

    // Check if NPV is visible (should be high for consolidated)
    const npvText = await page.locator('text=/NPV|R\\$/i').first().textContent();
    console.log(`✅ NPV visible: ${npvText}`);

    // Take screenshot
    await page.screenshot({
      path: `tests/screenshots/csv-consolidated-${consolidatedReport.id}.png`,
      fullPage: true
    });
    console.log(`📸 Screenshot saved: tests/screenshots/csv-consolidated-${consolidatedReport.id}.png\n`);
  });

  test('should navigate from index to report and back', async ({ page }) => {
    console.log('\n🔄 TESTING NAVIGATION FLOW...\n');

    // Start at imported reports index
    await page.goto('http://localhost:3003/imported-reports');
    await page.waitForSelector('h1:has-text("Relatórios Importados")');
    console.log('✅ Started at index page');

    // Click on first report card
    const firstReportLink = page.locator('.card-professional').first();
    await firstReportLink.click();

    // Wait for report page to load
    await page.waitForSelector('text=/ROI|Report/i', { timeout: 15000 });
    console.log('✅ Navigated to report page');

    // Check URL changed
    const reportUrl = page.url();
    expect(reportUrl).toContain('/report/');
    console.log(`✅ URL changed to: ${reportUrl}`);

    // Go back to home
    await page.goto('http://localhost:3003/');
    await page.waitForSelector('text=CulturaBuilder');
    console.log('✅ Navigated to home page');

    // Check if "Relatórios CSV" link is visible in header
    const csvLink = await page.locator('text=Relatórios CSV').count();
    expect(csvLink).toBeGreaterThan(0);
    console.log('✅ CSV reports link visible in header\n');
  });
});
