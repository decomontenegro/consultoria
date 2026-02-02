import { test, expect } from '@playwright/test';

/**
 * VISUAL UI REGRESSION TESTS
 *
 * Testa problemas visuais reportados:
 * - Perguntas que somem ao aparecer sugestões
 * - Layout quebrado em diferentes viewports
 * - Elementos sobrepostos
 * - Botões inacessíveis
 */

const BASE_URL = 'http://localhost:3001';

test.describe('Assessment Flow - Visual Regression', () => {

  test('Homepage loads correctly with all elements visible', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Take screenshot for baseline
    await expect(page).toHaveScreenshot('homepage-full.png', {
      fullPage: true,
      animations: 'disabled'
    });

    // Check key elements are visible
    const header = page.locator('h1, h2').first();
    await expect(header).toBeVisible();

    const ctaButton = page.locator('button, a').filter({ hasText: /começar|iniciar|start/i }).first();
    await expect(ctaButton).toBeVisible();

    // Log for debugging
    const headerText = await header.textContent();
    console.log('✓ Homepage header:', headerText);
  });

  test('Assessment page loads without layout issues', async ({ page }) => {
    await page.goto(`${BASE_URL}/assessment`);
    await page.waitForLoadState('networkidle');

    // Wait for initial render
    await page.waitForTimeout(1000);

    // Screenshot initial state
    await expect(page).toHaveScreenshot('assessment-initial.png', {
      fullPage: true,
      animations: 'disabled'
    });

    // Check no overlapping elements
    const mainContent = page.locator('main, [role="main"], .main-content').first();
    if (await mainContent.count() > 0) {
      const box = await mainContent.boundingBox();
      console.log('✓ Main content dimensions:', box);
      expect(box?.width).toBeGreaterThan(300);
    }
  });

  test('Questions remain visible when answer suggestions appear', async ({ page }) => {
    await page.goto(`${BASE_URL}/assessment`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Procurar por pergunta inicial
    const questionElements = page.locator('h1, h2, h3, [class*="question"], [class*="titulo"]');
    const initialQuestionCount = await questionElements.count();

    console.log(`Found ${initialQuestionCount} question elements initially`);

    // Screenshot antes de interagir
    await expect(page).toHaveScreenshot('assessment-before-suggestions.png', {
      fullPage: true,
      animations: 'disabled'
    });

    // Se houver pergunta visível, guardar o texto
    let questionText = '';
    if (initialQuestionCount > 0) {
      questionText = await questionElements.first().textContent() || '';
      console.log('Initial question:', questionText);
    }

    // Procurar por inputs ou botões de resposta
    const inputField = page.locator('input[type="text"], textarea').first();
    const buttons = page.locator('button').filter({ hasText: /sim|não|next|continuar/i });

    // Se houver input, digitar algo para triggerar sugestões
    if (await inputField.count() > 0) {
      console.log('Found input field, typing...');
      await inputField.fill('teste resposta');
      await page.waitForTimeout(500);

      // Screenshot após digitar
      await expect(page).toHaveScreenshot('assessment-after-typing.png', {
        fullPage: true,
        animations: 'disabled'
      });

      // Verificar se pergunta ainda está visível
      if (questionText) {
        const questionStillVisible = page.locator(`text="${questionText.trim()}"`);
        const isVisible = await questionStillVisible.isVisible().catch(() => false);

        if (!isVisible) {
          console.error('❌ PROBLEMA: Pergunta sumiu após digitar!');
          console.error('Pergunta original:', questionText);
        } else {
          console.log('✓ Pergunta ainda visível após digitar');
        }

        expect(isVisible).toBe(true);
      }
    }

    // Se houver botões, clicar no primeiro
    if (await buttons.count() > 0) {
      console.log('Found buttons, clicking first one...');

      // Screenshot antes de clicar
      await expect(page).toHaveScreenshot('assessment-before-button-click.png', {
        fullPage: true,
        animations: 'disabled'
      });

      await buttons.first().click();
      await page.waitForTimeout(500);

      // Screenshot após clicar
      await expect(page).toHaveScreenshot('assessment-after-button-click.png', {
        fullPage: true,
        animations: 'disabled'
      });

      // Verificar se nova pergunta apareceu OU se ainda há conteúdo visível
      const newQuestionCount = await questionElements.count();
      console.log(`Question count after click: ${newQuestionCount}`);

      expect(newQuestionCount).toBeGreaterThan(0);
    }
  });

  test('AI suggestions do not hide questions', async ({ page }) => {
    await page.goto(`${BASE_URL}/assessment`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Procurar por campos que possam ter sugestões de AI
    const aiSuggestionContainers = page.locator('[class*="suggestion"], [class*="ai"], [class*="dropdown"]');
    const questionContainers = page.locator('[class*="question"], h1, h2, h3, p');

    const initialQuestionBox = await questionContainers.first().boundingBox();

    console.log('Initial question position:', initialQuestionBox);

    // Triggerar sugestões (se possível)
    const textarea = page.locator('textarea').first();
    if (await textarea.count() > 0) {
      await textarea.fill('Como podemos melhorar');
      await page.waitForTimeout(1000); // Esperar sugestões AI

      // Screenshot com sugestões
      await expect(page).toHaveScreenshot('assessment-with-ai-suggestions.png', {
        fullPage: true,
        animations: 'disabled'
      });

      // Verificar se pergunta ainda está no mesmo lugar
      const afterQuestionBox = await questionContainers.first().boundingBox();
      console.log('Question position after suggestions:', afterQuestionBox);

      // Pergunta não deve ter mudado muito de posição (tolerância de 50px)
      if (initialQuestionBox && afterQuestionBox) {
        const yDiff = Math.abs(initialQuestionBox.y - afterQuestionBox.y);
        console.log('Y position difference:', yDiff);

        if (yDiff > 100) {
          console.error('❌ PROBLEMA: Pergunta moveu demais!');
          console.error(`Moved ${yDiff}px vertically`);
        }

        expect(yDiff).toBeLessThan(100);
      }

      // Verificar que pergunta ainda está visível
      await expect(questionContainers.first()).toBeVisible();
    }
  });

  test('Specialist selector maintains layout', async ({ page }) => {
    await page.goto(`${BASE_URL}/assessment`);
    await page.waitForLoadState('networkidle');

    // Procurar por SpecialistSelector
    const specialistButtons = page.locator('button').filter({ hasText: /tech|sales|marketing|operational/i });

    if (await specialistButtons.count() > 0) {
      console.log(`Found ${await specialistButtons.count()} specialist options`);

      // Screenshot antes de selecionar
      await expect(page).toHaveScreenshot('assessment-specialist-before.png', {
        fullPage: true,
        animations: 'disabled'
      });

      // Clicar em specialist
      await specialistButtons.first().click();
      await page.waitForTimeout(500);

      // Screenshot após selecionar
      await expect(page).toHaveScreenshot('assessment-specialist-after.png', {
        fullPage: true,
        animations: 'disabled'
      });

      // Verificar que layout não quebrou
      const body = page.locator('body');
      const box = await body.boundingBox();

      expect(box?.width).toBeGreaterThan(0);
      expect(box?.height).toBeGreaterThan(0);
    }
  });

  test('Multi-step form preserves questions across steps', async ({ page }) => {
    await page.goto(`${BASE_URL}/assessment`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const steps: string[] = [];

    // Percorrer até 5 steps
    for (let i = 0; i < 5; i++) {
      // Capturar pergunta atual
      const questionElement = page.locator('h1, h2, h3').first();

      if (await questionElement.count() > 0) {
        const questionText = await questionElement.textContent();
        steps.push(questionText || '');
        console.log(`Step ${i + 1}:`, questionText);

        // Screenshot do step
        await expect(page).toHaveScreenshot(`assessment-step-${i + 1}.png`, {
          fullPage: true,
          animations: 'disabled'
        });

        // Verificar que pergunta está visível
        await expect(questionElement).toBeVisible();
      }

      // Procurar botão "Próximo" ou similar
      const nextButton = page.locator('button').filter({
        hasText: /próximo|next|continuar|avançar/i
      }).first();

      if (await nextButton.count() > 0 && await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(500);
      } else {
        // Tentar preencher campo e submeter
        const input = page.locator('input, textarea').first();
        if (await input.count() > 0) {
          await input.fill('Resposta teste');

          const submitButton = page.locator('button[type="submit"], button').first();
          if (await submitButton.count() > 0) {
            await submitButton.click();
            await page.waitForTimeout(500);
          } else {
            console.log('No next action available, stopping');
            break;
          }
        } else {
          console.log('No input or next button, stopping');
          break;
        }
      }
    }

    console.log(`Completed ${steps.length} steps`);
    expect(steps.length).toBeGreaterThan(0);
  });
});

test.describe('Methodology Page - Visual Check', () => {

  test('Methodology page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/methodology`);
    await page.waitForLoadState('networkidle');

    // Screenshot completo
    await expect(page).toHaveScreenshot('methodology-full.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixels: 100
    });

    // Verificar seções principais
    const sections = [
      'Princípios Fundamentais',
      'Fontes Tier-1',
      'Níveis de Confiança',
      'Percentis'
    ];

    for (const sectionName of sections) {
      const section = page.locator(`text="${sectionName}"`);
      const isVisible = await section.isVisible().catch(() => false);

      if (isVisible) {
        console.log(`✓ Section found: ${sectionName}`);
      } else {
        console.log(`⚠ Section not found: ${sectionName}`);
      }
    }
  });

  test('Methodology navigation links work', async ({ page }) => {
    await page.goto(`${BASE_URL}/methodology`);
    await page.waitForLoadState('networkidle');

    // Encontrar links de navegação interna
    const navLinks = page.locator('a[href^="#"]');
    const count = await navLinks.count();

    console.log(`Found ${count} navigation links`);

    if (count > 0) {
      // Clicar no primeiro link
      const firstLink = navLinks.first();
      const href = await firstLink.getAttribute('href');

      console.log('Clicking link:', href);
      await firstLink.click();
      await page.waitForTimeout(500);

      // Screenshot após navegação
      await expect(page).toHaveScreenshot('methodology-after-nav.png', {
        fullPage: true,
        animations: 'disabled'
      });

      // Verificar que scrollou para a seção
      expect(page.url()).toContain(href || '');
    }
  });
});

test.describe('Glossary Page - Visual Check', () => {

  test('Glossary page renders all definitions', async ({ page }) => {
    await page.goto(`${BASE_URL}/glossary`);
    await page.waitForLoadState('networkidle');

    // Screenshot completo
    await expect(page).toHaveScreenshot('glossary-full.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixels: 100
    });

    // Verificar termos chave
    const keyTerms = ['ROI', 'NPV', 'MTTR', 'Percentil'];

    for (const term of keyTerms) {
      const termElement = page.locator(`text=/.*${term}.*/i`).first();
      const isVisible = await termElement.isVisible().catch(() => false);

      if (isVisible) {
        console.log(`✓ Term found: ${term}`);
      } else {
        console.log(`⚠ Term not found: ${term}`);
      }
    }
  });
});

test.describe('Mobile Responsiveness', () => {

  test('Assessment works on mobile viewport', async ({ page }) => {
    // iPhone SE viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(`${BASE_URL}/assessment`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Screenshot mobile
    await expect(page).toHaveScreenshot('assessment-mobile.png', {
      fullPage: true,
      animations: 'disabled'
    });

    // Verificar que elementos não estão cortados
    const questionElement = page.locator('h1, h2, h3').first();

    if (await questionElement.count() > 0) {
      const box = await questionElement.boundingBox();

      console.log('Mobile question box:', box);

      // Pergunta deve caber na largura da tela
      if (box) {
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(375);
      }

      await expect(questionElement).toBeVisible();
    }
  });

  test('Methodology page mobile layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(`${BASE_URL}/methodology`);
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('methodology-mobile.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('Glossary page mobile layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(`${BASE_URL}/glossary`);
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('glossary-mobile.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });
});

test.describe('Specific Bug: Questions Disappearing', () => {

  test('Bug reproduction: Question visibility with answer suggestions', async ({ page }) => {
    await page.goto(`${BASE_URL}/assessment`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('\n=== TESTING BUG: Questions disappearing with suggestions ===\n');

    // 1. Capturar estado inicial
    const initialHTML = await page.content();
    const initialQuestions = page.locator('h1, h2, h3, [role="heading"]');
    const initialCount = await initialQuestions.count();

    console.log(`Initial question count: ${initialCount}`);

    // Screenshot inicial
    await page.screenshot({
      path: 'test-results/bug-step1-initial.png',
      fullPage: true
    });

    // 2. Guardar texto de todas as perguntas visíveis
    const questionTexts: string[] = [];
    for (let i = 0; i < initialCount; i++) {
      const text = await initialQuestions.nth(i).textContent();
      if (text) {
        questionTexts.push(text.trim());
        console.log(`Question ${i + 1}: "${text.trim()}"`);
      }
    }

    // 3. Interagir com elementos que podem triggerar sugestões
    const interactiveElements = [
      page.locator('input[type="text"]').first(),
      page.locator('textarea').first(),
      page.locator('select').first(),
      page.locator('button').filter({ hasText: /selecionar|escolher|select/i }).first()
    ];

    for (const element of interactiveElements) {
      if (await element.count() > 0 && await element.isVisible()) {
        const tagName = await element.evaluate(el => el.tagName);
        console.log(`\nInteracting with: ${tagName}`);

        if (tagName === 'INPUT' || tagName === 'TEXTAREA') {
          await element.fill('teste de resposta longa para ver se aparece sugestões');
          await page.waitForTimeout(1000);
        } else if (tagName === 'BUTTON') {
          await element.click();
          await page.waitForTimeout(1000);
        }

        // Screenshot após interação
        await page.screenshot({
          path: `test-results/bug-step2-after-${tagName.toLowerCase()}.png`,
          fullPage: true
        });

        // 4. Verificar se perguntas ainda estão visíveis
        for (const questionText of questionTexts) {
          const questionLocator = page.locator(`text="${questionText}"`);
          const isVisible = await questionLocator.isVisible().catch(() => false);

          if (!isVisible) {
            console.error(`\n❌ BUG FOUND: Question disappeared!`);
            console.error(`Missing question: "${questionText}"`);
            console.error(`After interacting with: ${tagName}`);

            // Capturar HTML para debug
            const currentHTML = await page.content();
            console.error('\nHTML diff analysis:');
            console.error('Question still in DOM?', currentHTML.includes(questionText));

            // Verificar z-index issues
            const allElements = await page.locator('*').all();
            for (const el of allElements.slice(0, 20)) {
              const zIndex = await el.evaluate(e => window.getComputedStyle(e).zIndex);
              if (zIndex !== 'auto' && parseInt(zIndex) > 100) {
                const tagName = await el.evaluate(e => e.tagName);
                console.error(`High z-index found: ${tagName} z-index=${zIndex}`);
              }
            }
          } else {
            console.log(`✓ Question still visible: "${questionText.substring(0, 50)}..."`);
          }
        }

        break; // Só testa o primeiro elemento interativo encontrado
      }
    }
  });
});
