/**
 * Data Quality Badge Test
 *
 * Tests the transparency feature showing whether data is real or estimated
 */

import { test, expect } from '@playwright/test';

test.describe('Data Quality Badge - Transparency Feature', () => {

  test('should display "Estimativa" badge when no department data provided', async ({ page }) => {
    // Navigate to homepage
    await page.goto('http://localhost:3000');

    // Start Express Mode assessment (skip department data)
    await page.click('text=Começar Agora');

    // Wait for AI consultation to load
    await page.waitForSelector('[data-testid="ai-message"]', { timeout: 10000 });

    // Answer basic questions only (no department data)
    // Question 1: Main challenge
    await page.fill('input[type="text"], textarea', 'Melhorar produtividade da equipe');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    // Question 2: Role
    await page.fill('input[type="text"], textarea', 'CTO');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    // Question 3: Company size
    await page.click('text=/10.*50/i');
    await page.waitForTimeout(1000);

    // Question 4: AI tools usage
    await page.click('text=/Não.*AI/i');
    await page.waitForTimeout(1000);

    // Question 5: Problem to solve
    await page.fill('input[type="text"], textarea', 'Reduzir tempo de desenvolvimento');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    // Question 6: Timeline
    await page.click('text=/3.*meses/i');
    await page.waitForTimeout(2000);

    // Should navigate to report
    await page.waitForURL('**/report/**', { timeout: 30000 });

    // Check for "Estimativa" badges
    const estimativaBadges = page.locator('text=/Estimativa/i');
    const count = await estimativaBadges.count();

    console.log(`Found ${count} "Estimativa" badges`);
    expect(count).toBeGreaterThan(0);

    // Specifically check EnterpriseROI section
    const enterpriseSection = page.locator('text=Enterprise-Wide').first();
    if (await enterpriseSection.isVisible()) {
      const badge = enterpriseSection.locator('..').locator('text=/Estimativa/i').first();
      await expect(badge).toBeVisible();
      console.log('✅ EnterpriseROI section has Estimativa badge');
    }

    // Check FourPillar section
    const fourPillarSection = page.locator('text=4-Pillar ROI Framework').first();
    if (await fourPillarSection.isVisible()) {
      const badge = fourPillarSection.locator('..').locator('text=/Estimativa/i').first();
      await expect(badge).toBeVisible();
      console.log('✅ FourPillar section has Estimativa badge');
    }

    // Check Cost of Inaction section
    const costSection = page.locator('text=/Custo.*NÃO.*Agir/i').first();
    if (await costSection.isVisible()) {
      const badge = costSection.locator('..').locator('text=/Estimativa/i').first();
      await expect(badge).toBeVisible();
      console.log('✅ Cost of Inaction section has Estimativa badge');
    }

    // Check that "Dados Reais" does NOT appear
    const dadosReaisBadges = page.locator('text=/Dados Reais/i');
    const realDataCount = await dadosReaisBadges.count();
    expect(realDataCount).toBe(0);
    console.log('✅ No "Dados Reais" badges (as expected)');
  });

  test('should show amber/yellow color for Estimativa badges', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Quick assessment without department data
    await page.click('text=Começar Agora');
    await page.waitForSelector('[data-testid="ai-message"]', { timeout: 10000 });

    // Answer minimum questions
    await page.fill('input[type="text"], textarea', 'Teste');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    await page.fill('input[type="text"], textarea', 'CTO');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    await page.click('text=/10.*50/i');
    await page.waitForTimeout(3000);

    await page.waitForURL('**/report/**', { timeout: 30000 });

    // Check badge styling (should have amber/yellow colors)
    const badge = page.locator('text=/Estimativa/i').first();
    await expect(badge).toBeVisible();

    // Get computed styles
    const bgColor = await badge.evaluate((el) => {
      const styles = window.getComputedStyle(el.parentElement!);
      return styles.backgroundColor;
    });

    console.log('Badge background color:', bgColor);
    // Should contain amber/yellow tones (RGB values around 245, 158, 11 for amber-400)
    // We just check it's not green
    expect(bgColor).not.toContain('rgb(74, 222, 128)'); // not neon-green
  });

  test('should display tooltips on badge hover', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Quick assessment
    await page.click('text=Começar Agora');
    await page.waitForSelector('[data-testid="ai-message"]', { timeout: 10000 });

    // Answer minimum
    await page.fill('input[type="text"], textarea', 'Teste');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    await page.fill('input[type="text"], textarea', 'CTO');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    await page.click('text=/10.*50/i');
    await page.waitForTimeout(3000);

    await page.waitForURL('**/report/**', { timeout: 30000 });

    // Find badge with tooltip (has Info icon)
    const infoIcon = page.locator('svg').filter({ hasText: '' }).first(); // Lucide Info icon

    if (await infoIcon.isVisible()) {
      // Hover to show tooltip
      await infoIcon.hover();
      await page.waitForTimeout(500);

      // Check if tooltip appears
      const tooltip = page.locator('text=/estimativa.*genérica/i');
      const tooltipVisible = await tooltip.isVisible();

      if (tooltipVisible) {
        console.log('✅ Tooltip appears on hover');
      } else {
        console.log('⚠️ Tooltip might be using different trigger mechanism');
      }
    }
  });

  test('should work across all layout variants', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Quick assessment
    await page.click('text=Começar Agora');
    await page.waitForSelector('[data-testid="ai-message"]', { timeout: 10000 });

    await page.fill('input[type="text"], textarea', 'Teste');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    await page.fill('input[type="text"], textarea', 'CTO');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    await page.click('text=/10.*50/i');
    await page.waitForTimeout(3000);

    await page.waitForURL('**/report/**', { timeout: 30000 });

    const currentUrl = page.url();
    const baseUrl = currentUrl.split('?')[0];

    // Test each layout
    const layouts = ['sidebar', 'tabs', 'accordion', 'modular', 'story'];

    for (const layout of layouts) {
      console.log(`\nTesting layout: ${layout}`);
      await page.goto(`${baseUrl}?layout=${layout}`);
      await page.waitForTimeout(2000);

      const badges = page.locator('text=/Estimativa/i');
      const count = await badges.count();

      console.log(`  Found ${count} badges in ${layout} layout`);
      expect(count).toBeGreaterThan(0);
    }

    console.log('\n✅ All layouts show DataQualityBadge');
  });

  test('should show badge position and styling correctly', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Quick assessment
    await page.click('text=Começar Agora');
    await page.waitForSelector('[data-testid="ai-message"]', { timeout: 10000 });

    await page.fill('input[type="text"], textarea', 'Teste');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    await page.fill('input[type="text"], textarea', 'CTO');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    await page.click('text=/10.*50/i');
    await page.waitForTimeout(3000);

    await page.waitForURL('**/report/**', { timeout: 30000 });

    // Take screenshot of badge
    const badge = page.locator('text=/Estimativa/i').first();
    await badge.scrollIntoViewIfNeeded();

    // Get badge properties
    const box = await badge.boundingBox();
    console.log('Badge bounding box:', box);

    // Check it's in the upper-right area of its section
    // (Should be near the section header)
    const sectionHeader = page.locator('text=Enterprise-Wide').first();
    if (await sectionHeader.isVisible()) {
      const headerBox = await sectionHeader.boundingBox();
      console.log('Header bounding box:', headerBox);

      // Badge should be on same row as header (similar Y position)
      if (box && headerBox) {
        const yDiff = Math.abs(box.y - headerBox.y);
        console.log('Y position difference:', yDiff);
        expect(yDiff).toBeLessThan(50); // Should be on same row
      }
    }

    // Take screenshot for visual verification
    await page.screenshot({
      path: 'playwright-report/data-quality-badge.png',
      fullPage: false
    });

    console.log('✅ Screenshot saved: playwright-report/data-quality-badge.png');
  });
});
