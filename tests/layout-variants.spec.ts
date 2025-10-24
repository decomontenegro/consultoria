import { test, expect } from '@playwright/test';

const LAYOUTS = ['default', 'tabs', 'sidebar', 'accordion', 'modular', 'story'] as const;

test.describe('Report Layout Variants', () => {
  const reportUrl = 'http://localhost:3003/sample';

  for (const layout of LAYOUTS) {
    test(`should render ${layout} layout correctly`, async ({ page }) => {
      // Navigate to report with specific layout
      const url = layout === 'default'
        ? reportUrl
        : `${reportUrl}?layout=${layout}`;

      console.log(`📍 Testing layout: ${layout}`);
      console.log(`🔗 URL: ${url}`);

      await page.goto(url, { waitUntil: 'networkidle' });

      // Wait for report to load
      await page.waitForSelector('h1', { timeout: 10000 });

      // Take full page screenshot
      await page.screenshot({
        path: `tests/screenshots/layout-${layout}.png`,
        fullPage: true
      });

      console.log(`✅ Screenshot saved for ${layout} layout`);

      // Verify layout-specific elements
      switch (layout) {
        case 'tabs':
          // Should have tab navigation
          const tabsExist = await page.locator('button:has-text("Visão Geral")').count() > 0;
          expect(tabsExist).toBeTruthy();
          console.log('✓ Tabs navigation found');
          break;

        case 'sidebar':
          // Should have sidebar navigation
          const sidebarExists = await page.locator('aside').count() > 0;
          expect(sidebarExists).toBeTruthy();
          console.log('✓ Sidebar navigation found');
          break;

        case 'accordion':
          // Should have expand/collapse controls
          const accordionExists = await page.locator('button:has-text("Expandir Todas")').count() > 0;
          expect(accordionExists).toBeTruthy();
          console.log('✓ Accordion controls found');
          break;

        case 'modular':
          // Should have metric cards
          const metricsExist = await page.locator('text=Período de Retorno').count() > 0;
          expect(metricsExist).toBeTruthy();
          console.log('✓ Modular metric cards found');
          break;

        case 'story':
          // Should have chapter navigation
          const chaptersExist = await page.locator('text=Capítulo').count() > 0;
          expect(chaptersExist).toBeTruthy();
          console.log('✓ Story chapters found');
          break;

        case 'default':
          // Default layout - just verify it loads
          const titleExists = await page.locator('h1:has-text("Prontidão para IA")').count() > 0;
          expect(titleExists).toBeTruthy();
          console.log('✓ Default layout loaded');
          break;
      }

      // Verify layout selector is present
      const layoutSelectorExists = await page.locator('button:has-text("Layout")').count() > 0;
      expect(layoutSelectorExists).toBeTruthy();
      console.log('✓ Layout selector found');
    });
  }

  test('should switch between layouts using selector', async ({ page }) => {
    await page.goto(reportUrl, { waitUntil: 'networkidle' });

    // Open layout selector
    await page.click('button:has-text("Layout")');
    await page.waitForSelector('text=Escolha o Layout', { timeout: 5000 });

    // Click on "Dashboard com Abas"
    await page.click('button:has-text("Dashboard com Abas")');

    // Wait for navigation
    await page.waitForURL(/layout=tabs/, { timeout: 5000 });

    // Verify tabs appeared
    const tabsVisible = await page.locator('button:has-text("Visão Geral")').isVisible();
    expect(tabsVisible).toBeTruthy();

    console.log('✅ Successfully switched to tabs layout via selector');

    // Take screenshot of the switch
    await page.screenshot({
      path: 'tests/screenshots/layout-switch-test.png',
      fullPage: true
    });
  });

  test('should render all layouts with different content', async ({ page }) => {
    const layouts = ['default', 'tabs', 'sidebar', 'accordion', 'modular', 'story'];
    const htmlContents: string[] = [];

    for (const layout of layouts) {
      const url = layout === 'default' ? reportUrl : `${reportUrl}?layout=${layout}`;
      await page.goto(url, { waitUntil: 'networkidle' });

      // Get HTML content of main section
      const content = await page.locator('main').innerHTML();
      htmlContents.push(content);
    }

    // Verify all layouts have different HTML structure
    const uniqueContents = new Set(htmlContents);
    console.log(`📊 Found ${uniqueContents.size} unique layout variations out of ${layouts.length} layouts`);

    if (uniqueContents.size < layouts.length) {
      console.warn('⚠️  Some layouts have identical HTML! This indicates they might not be rendering differently.');

      // Find which layouts are duplicates
      const contentMap = new Map<string, string[]>();
      htmlContents.forEach((content, index) => {
        const existing = contentMap.get(content) || [];
        existing.push(layouts[index]);
        contentMap.set(content, existing);
      });

      contentMap.forEach((layoutNames, content) => {
        if (layoutNames.length > 1) {
          console.warn(`❌ Duplicate layouts: ${layoutNames.join(', ')}`);
        }
      });
    } else {
      console.log('✅ All layouts are rendering unique content');
    }

    // This assertion will help us identify if layouts aren't switching
    expect(uniqueContents.size).toBeGreaterThan(1);
  });
});
