import { test, expect } from '@playwright/test';

test.describe('Layout Selector Order', () => {
  test('sidebar should be first option in dropdown', async ({ page }) => {
    await page.goto('http://localhost:3003/sample');

    // Click the layout selector button to open dropdown
    await page.click('button:has-text("Navegação Lateral")');

    // Wait for dropdown to appear
    await page.waitForSelector('text=Escolha o Layout');

    // Get all layout option buttons
    const options = await page.locator('.space-y-1 button').all();

    // Get the text of the first option
    const firstOptionText = await options[0].textContent();

    console.log('First option in dropdown:', firstOptionText);

    // Take screenshot of the dropdown
    await page.screenshot({
      path: 'tests/screenshots/layout-selector-dropdown.png'
    });

    // Verify sidebar is first
    expect(firstOptionText).toContain('Navegação Lateral');
  });
});
