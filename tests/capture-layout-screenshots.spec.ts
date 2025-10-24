import { test } from '@playwright/test';

const LAYOUTS = [
  { id: 'default', name: 'Padrão (Default)' },
  { id: 'tabs', name: 'Dashboard com Abas' },
  { id: 'sidebar', name: 'Navegação Lateral' },
  { id: 'accordion', name: 'Accordion/Collapsível' },
  { id: 'modular', name: 'Dashboard Modular' },
  { id: 'story', name: 'Narrativa por Capítulos' }
];

test.describe('Capture Layout Screenshots for Comparison', () => {
  for (const layout of LAYOUTS) {
    test(`Capture ${layout.name}`, async ({ page }) => {
      const url = layout.id === 'default'
        ? 'http://localhost:3003/sample'
        : `http://localhost:3003/sample?layout=${layout.id}`;

      console.log(`📸 Capturing: ${layout.name}`);

      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000); // Wait for animations

      // Take full page screenshot
      await page.screenshot({
        path: `tests/layout-comparison/${layout.id}.png`,
        fullPage: true
      });

      // Also take a "above the fold" screenshot (first view)
      await page.screenshot({
        path: `tests/layout-comparison/${layout.id}-hero.png`,
        clip: { x: 0, y: 0, width: 1280, height: 800 }
      });

      console.log(`✅ Captured: ${layout.name}`);
    });
  }
});
