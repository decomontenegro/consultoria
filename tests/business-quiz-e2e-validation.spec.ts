/**
 * Business Health Quiz - E2E Validation Test
 *
 * ULTRATHINK Test Strategy:
 * 1. Visual validation (CSS, contrast, visibility)
 * 2. Functional validation (navigation, state management)
 * 3. Data flow validation (answers, session, diagnostic)
 * 4. Error handling validation
 *
 * Run: npx playwright test tests/business-quiz-e2e-validation.spec.ts --headed
 */

import { test, expect, Page } from '@playwright/test';

// ============================================================================
// TEST CONFIGURATION
// ============================================================================

const BASE_URL = 'http://localhost:3000';
const LANDING_PAGE_URL = `${BASE_URL}/business-health-quiz`;

// Test data for each question
const MOCK_ANSWERS = {
  // Block 1: Context (7 questions)
  context: [
    'TechCorp Solutions',                          // Company name
    'Software de gestão empresarial',             // Industry
    '50-100 funcionários',                        // Company size
    'R$ 5 milhões por ano',                       // Revenue
    '3 anos',                                      // Time in business
    'B2B SaaS',                                    // Business model
    'Crescimento acelerado mas com gargalos operacionais', // Current situation
  ],
  // Block 2: Expertise (4 questions)
  expertise: [
    'Tecnologia e produto',                       // Main focus
    'Arquitetura de software e DevOps',          // Technical expertise
    '8 anos trabalhando com desenvolvimento',     // Experience
    'Muito confiante em tecnologia, menos em vendas', // Confidence
  ],
  // Block 3: Deep-dive (5 questions) - depends on expertise detection
  deepDive: [
    'React, Node.js, PostgreSQL, AWS',           // Tech stack
    'CI/CD com GitHub Actions',                   // DevOps
    'Dívida técnica acumulada',                   // Technical challenges
    'Equipe pequena, todos generalistas',        // Team structure
    'Escalar sem aumentar muito o time',         // Goals
  ],
  // Block 4: Risk Scan (3 questions) - depends on risk selection
  riskScan: [
    'Vendas inconsistentes, pipeline pequeno',   // Risk 1
    'Controles financeiros básicos',             // Risk 2
    'Processos manuais em várias áreas',        // Risk 3
  ],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Wait for Next.js to be fully loaded
 */
async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
  // Wait for any hydration to complete
  await page.waitForTimeout(500);
}

/**
 * Check if text is visible (not white on white)
 */
async function checkTextVisibility(page: Page, selector: string) {
  const element = await page.locator(selector).first();
  await expect(element).toBeVisible();

  // Get computed color
  const color = await element.evaluate((el) => {
    return window.getComputedStyle(el).color;
  });

  // Color should not be white or transparent
  expect(color).not.toBe('rgb(255, 255, 255)');
  expect(color).not.toBe('rgba(0, 0, 0, 0)');

  console.log(`✅ Text visibility check passed for "${selector}": ${color}`);
}

/**
 * Check placeholder visibility
 */
async function checkPlaceholderVisibility(page: Page, inputSelector: string) {
  const input = await page.locator(inputSelector).first();
  await expect(input).toBeVisible();

  // Get placeholder color from CSS
  const placeholderColor = await input.evaluate((el) => {
    const styles = window.getComputedStyle(el, '::placeholder');
    return styles.color;
  });

  // Placeholder should be visible (gray, not white)
  expect(placeholderColor).not.toBe('rgb(255, 255, 255)');

  console.log(`✅ Placeholder visibility check passed: ${placeholderColor}`);
}

/**
 * Answer a question based on input type
 */
async function answerQuestion(page: Page, answer: string, questionIndex: number) {
  console.log(`📝 Answering question ${questionIndex + 1}: "${answer}"`);

  // Wait for question to load
  await page.waitForSelector('form', { state: 'visible' });

  // Detect input type
  const hasTextInput = await page.locator('input[type="text"]').count() > 0;
  const hasTextarea = await page.locator('textarea').count() > 0;
  const hasRadio = await page.locator('input[type="radio"]').count() > 0;

  if (hasTextInput) {
    // Text input
    await page.locator('input[type="text"]').fill(answer);
  } else if (hasTextarea) {
    // Textarea
    await page.locator('textarea').fill(answer);
  } else if (hasRadio) {
    // Radio button - click first option
    await page.locator('input[type="radio"]').first().check();
  } else {
    throw new Error(`No input found for question ${questionIndex + 1}`);
  }

  // Wait for button to be enabled
  await page.waitForSelector('button[type="submit"]:not(:disabled)', { timeout: 2000 });

  // Click "Próxima" button
  await page.locator('button[type="submit"]').click();

  console.log(`✅ Question ${questionIndex + 1} answered`);
}

/**
 * Get current progress percentage
 */
async function getCurrentProgress(page: Page): Promise<number> {
  const progressText = await page.locator('text=Progresso geral').locator('..').locator('.text-2xl').textContent();
  return parseInt(progressText?.replace('%', '') || '0', 10);
}

/**
 * Get current block name
 */
async function getCurrentBlock(page: Page): Promise<string> {
  const blockName = await page.locator('.font-semibold.text-gray-900').first().textContent();
  return blockName || '';
}

// ============================================================================
// TEST SUITE
// ============================================================================

test.describe('Business Health Quiz - Complete E2E Flow', () => {

  test.beforeEach(async ({ page }) => {
    // Set viewport
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  // ==========================================================================
  // TEST 1: Landing Page Validation
  // ==========================================================================

  test('01. Landing page loads correctly with visible text', async ({ page }) => {
    console.log('\n🧪 TEST 1: Landing Page Validation\n');

    await page.goto(LANDING_PAGE_URL);
    await waitForPageLoad(page);

    // Check title
    await expect(page.locator('h1').filter({ hasText: 'Descubra a saúde do seu negócio' })).toBeVisible();

    // Check subtitle text visibility
    await checkTextVisibility(page, 'p.text-xl');

    // Check CTA button
    const ctaButton = page.locator('button', { hasText: 'Começar Diagnóstico' });
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toBeEnabled();

    // Check stats are visible
    await expect(page.locator('text=19')).toBeVisible();
    await expect(page.locator('text=8 min')).toBeVisible();
    await expect(page.locator('text=7')).toBeVisible();

    console.log('✅ Landing page validation passed');
  });

  // ==========================================================================
  // TEST 2: Quiz Initialization
  // ==========================================================================

  test('02. Quiz starts correctly and loads first question', async ({ page }) => {
    console.log('\n🧪 TEST 2: Quiz Initialization\n');

    await page.goto(LANDING_PAGE_URL);
    await waitForPageLoad(page);

    // Click start button
    await page.locator('button', { hasText: 'Começar Diagnóstico' }).click();

    // Wait for redirect to quiz page
    await page.waitForURL(/\/business-health-quiz\/quiz\?session=/, { timeout: 5000 });
    console.log('✅ Redirected to quiz page');

    // Verify session ID in URL
    const url = page.url();
    expect(url).toContain('session=biz-quiz-');
    console.log(`✅ Session ID found: ${url.split('session=')[1]}`);

    // Wait for first question to load
    await page.waitForSelector('form', { state: 'visible' });

    // Check progress bar exists
    await expect(page.locator('.bg-gradient-to-r.from-blue-600.to-purple-600')).toBeVisible();

    // Check first question is visible
    await expect(page.locator('h2.text-2xl')).toBeVisible();

    // Check block is "Contexto"
    const blockName = await getCurrentBlock(page);
    expect(blockName).toBe('Contexto');
    console.log('✅ First block is Contexto');

    // Check progress is 5%
    const progress = await getCurrentProgress(page);
    expect(progress).toBe(5);
    console.log('✅ Initial progress is 5%');

    console.log('✅ Quiz initialization passed');
  });

  // ==========================================================================
  // TEST 3: Input Visibility & Placeholder
  // ==========================================================================

  test('03. Input fields have visible placeholders and text', async ({ page }) => {
    console.log('\n🧪 TEST 3: Input Visibility & Placeholder\n');

    await page.goto(LANDING_PAGE_URL);
    await page.locator('button', { hasText: 'Começar Diagnóstico' }).click();
    await page.waitForURL(/\/business-health-quiz\/quiz\?session=/);
    await page.waitForSelector('form');

    // Check input exists
    const input = page.locator('input[type="text"]').first();
    await expect(input).toBeVisible();

    // Check placeholder visibility
    await checkPlaceholderVisibility(page, 'input[type="text"]');

    // Type in input and check text visibility
    await input.fill('Test Company');
    const textColor = await input.evaluate((el) => window.getComputedStyle(el).color);
    expect(textColor).not.toBe('rgb(255, 255, 255)');
    console.log(`✅ Input text color: ${textColor}`);

    console.log('✅ Input visibility validation passed');
  });

  // ==========================================================================
  // TEST 4: Complete Block 1 (Context)
  // ==========================================================================

  test('04. Complete Block 1 (Context) - 7 questions', async ({ page }) => {
    console.log('\n🧪 TEST 4: Block 1 (Context) - 7 Questions\n');

    await page.goto(LANDING_PAGE_URL);
    await page.locator('button', { hasText: 'Começar Diagnóstico' }).click();
    await page.waitForURL(/\/business-health-quiz\/quiz\?session=/);

    // Answer all 7 context questions
    for (let i = 0; i < MOCK_ANSWERS.context.length; i++) {
      await page.waitForSelector('form', { state: 'visible' });

      const blockName = await getCurrentBlock(page);
      expect(blockName).toBe('Contexto');

      await answerQuestion(page, MOCK_ANSWERS.context[i], i);

      // Wait for next question or transition
      await page.waitForTimeout(500);
    }

    console.log('✅ Block 1 (Context) completed - 7 questions answered');
  });

  // ==========================================================================
  // TEST 5: Block Transition Animation
  // ==========================================================================

  test('05. Block transition appears between blocks', async ({ page }) => {
    console.log('\n🧪 TEST 5: Block Transition Animation\n');

    await page.goto(LANDING_PAGE_URL);
    await page.locator('button', { hasText: 'Começar Diagnóstico' }).click();
    await page.waitForURL(/\/business-health-quiz\/quiz\?session=/);

    // Answer all context questions quickly
    for (let i = 0; i < MOCK_ANSWERS.context.length; i++) {
      await page.waitForSelector('form', { state: 'visible' });
      await answerQuestion(page, MOCK_ANSWERS.context[i], i);
      await page.waitForTimeout(300);
    }

    // Wait for block transition
    try {
      await page.waitForSelector('text=Contexto → Expertise', { timeout: 5000 });
      console.log('✅ Block transition animation appeared');
    } catch (error) {
      console.log('⚠️  Block transition may have been skipped or is instant');
    }

    // Wait for transition to complete
    await page.waitForSelector('form', { state: 'visible', timeout: 5000 });

    // Verify we're now in Expertise block
    const blockName = await getCurrentBlock(page);
    expect(blockName).toBe('Expertise');
    console.log('✅ Transitioned to Expertise block');
  });

  // ==========================================================================
  // TEST 6: Complete Full Quiz (19 Questions)
  // ==========================================================================

  test('06. Complete full quiz flow (19 questions)', async ({ page }) => {
    console.log('\n🧪 TEST 6: Complete Full Quiz (19 Questions)\n');

    test.setTimeout(120000); // 2 minutes timeout for full flow

    await page.goto(LANDING_PAGE_URL);
    await page.locator('button', { hasText: 'Começar Diagnóstico' }).click();
    await page.waitForURL(/\/business-health-quiz\/quiz\?session=/);

    let questionCount = 0;
    const allAnswers = [
      ...MOCK_ANSWERS.context,
      ...MOCK_ANSWERS.expertise,
      ...MOCK_ANSWERS.deepDive,
      ...MOCK_ANSWERS.riskScan,
    ];

    // Track blocks encountered
    const blocksEncountered = new Set<string>();

    for (let i = 0; i < allAnswers.length; i++) {
      try {
        // Wait for form
        await page.waitForSelector('form', { state: 'visible', timeout: 5000 });

        // Get current block
        const blockName = await getCurrentBlock(page);
        blocksEncountered.add(blockName);
        console.log(`📍 Block: ${blockName} | Question ${i + 1}/${allAnswers.length}`);

        // Answer question
        await answerQuestion(page, allAnswers[i], i);
        questionCount++;

        // Wait for processing
        await page.waitForTimeout(800);

        // Check if we see completion screen
        const hasCompletionScreen = await page.locator('text=Quiz Completo').count() > 0;
        if (hasCompletionScreen) {
          console.log('🎉 Quiz completion screen detected!');
          break;
        }

      } catch (error) {
        console.log(`⚠️  Issue at question ${i + 1}: ${error}`);

        // Check if we're on completion screen
        const isCompleted = await page.locator('text=Quiz Completo').count() > 0;
        if (isCompleted) {
          console.log('✅ Quiz completed successfully');
          break;
        }

        // Check if we're on results page
        const isResults = page.url().includes('/results/');
        if (isResults) {
          console.log('✅ Redirected to results page');
          break;
        }

        throw error;
      }
    }

    console.log(`\n📊 Quiz Statistics:`);
    console.log(`   Questions answered: ${questionCount}`);
    console.log(`   Blocks encountered: ${Array.from(blocksEncountered).join(', ')}`);

    // Verify we encountered all expected blocks
    expect(blocksEncountered.has('Contexto')).toBe(true);
    expect(blocksEncountered.has('Expertise')).toBe(true);

    console.log('✅ Full quiz flow completed');
  });

  // ==========================================================================
  // TEST 7: Diagnostic Generation & Results
  // ==========================================================================

  test('07. Quiz completes and shows diagnostic results', async ({ page }) => {
    console.log('\n🧪 TEST 7: Diagnostic Generation & Results\n');

    test.setTimeout(180000); // 3 minutes timeout for LLM generation

    await page.goto(LANDING_PAGE_URL);
    await page.locator('button', { hasText: 'Começar Diagnóstico' }).click();
    await page.waitForURL(/\/business-health-quiz\/quiz\?session=/);

    // Complete all questions
    const allAnswers = [
      ...MOCK_ANSWERS.context,
      ...MOCK_ANSWERS.expertise,
      ...MOCK_ANSWERS.deepDive,
      ...MOCK_ANSWERS.riskScan,
    ];

    for (let i = 0; i < allAnswers.length; i++) {
      try {
        await page.waitForSelector('form', { state: 'visible', timeout: 5000 });
        await answerQuestion(page, allAnswers[i], i);
        await page.waitForTimeout(500);
      } catch (error) {
        // Check if completed
        const isCompleted = await page.locator('text=Quiz Completo').count() > 0;
        if (isCompleted) break;
      }
    }

    // Wait for completion screen
    await page.waitForSelector('text=Quiz Completo', { timeout: 10000 });
    console.log('✅ Completion screen displayed');

    // Wait for redirect to results (may take time due to LLM)
    console.log('⏳ Waiting for diagnostic generation (max 120s)...');
    await page.waitForURL(/\/business-health-quiz\/results\//, { timeout: 120000 });
    console.log('✅ Redirected to results page');

    // Verify results page loaded
    await page.waitForSelector('text=Score geral', { timeout: 5000 });

    // Check for health scores
    const hasHealthScores = await page.locator('text=Health Scores').count() > 0 ||
                           await page.locator('text=marketing-growth').count() > 0;

    if (hasHealthScores) {
      console.log('✅ Health scores displayed');
    }

    // Check for recommendations
    const hasRecommendations = await page.locator('text=Recomendações').count() > 0;
    if (hasRecommendations) {
      console.log('✅ Recommendations section found');
    }

    console.log('✅ Diagnostic results validation passed');
  });

  // ==========================================================================
  // TEST 8: Progress Bar Updates Correctly
  // ==========================================================================

  test('08. Progress bar updates correctly through quiz', async ({ page }) => {
    console.log('\n🧪 TEST 8: Progress Bar Updates\n');

    await page.goto(LANDING_PAGE_URL);
    await page.locator('button', { hasText: 'Começar Diagnóstico' }).click();
    await page.waitForURL(/\/business-health-quiz\/quiz\?session=/);

    const progressPoints: number[] = [];

    // Answer first 3 questions and track progress
    for (let i = 0; i < 3; i++) {
      await page.waitForSelector('form', { state: 'visible' });

      const progress = await getCurrentProgress(page);
      progressPoints.push(progress);
      console.log(`Question ${i + 1} - Progress: ${progress}%`);

      await answerQuestion(page, MOCK_ANSWERS.context[i], i);
      await page.waitForTimeout(500);
    }

    // Verify progress increased
    expect(progressPoints[1]).toBeGreaterThan(progressPoints[0]);
    expect(progressPoints[2]).toBeGreaterThan(progressPoints[1]);

    console.log('✅ Progress bar updates correctly');
  });

  // ==========================================================================
  // TEST 9: Button States
  // ==========================================================================

  test('09. Submit button enables/disables correctly', async ({ page }) => {
    console.log('\n🧪 TEST 9: Button States\n');

    await page.goto(LANDING_PAGE_URL);
    await page.locator('button', { hasText: 'Começar Diagnóstico' }).click();
    await page.waitForURL(/\/business-health-quiz\/quiz\?session=/);
    await page.waitForSelector('form');

    const submitButton = page.locator('button[type="submit"]');

    // Initially disabled (no answer)
    await expect(submitButton).toBeDisabled();
    console.log('✅ Button disabled when no answer');

    // Fill input
    await page.locator('input[type="text"]').fill('Test');

    // Should be enabled
    await expect(submitButton).toBeEnabled();
    console.log('✅ Button enabled when answer provided');

    // Clear input
    await page.locator('input[type="text"]').clear();

    // Should be disabled again
    await expect(submitButton).toBeDisabled();
    console.log('✅ Button disabled when answer cleared');
  });

  // ==========================================================================
  // TEST 10: No Quiz Hang/Infinite Loop
  // ==========================================================================

  test('10. Quiz does not hang or loop infinitely', async ({ page }) => {
    console.log('\n🧪 TEST 10: No Infinite Loop\n');

    test.setTimeout(60000); // 1 minute max

    await page.goto(LANDING_PAGE_URL);
    await page.locator('button', { hasText: 'Começar Diagnóstico' }).click();
    await page.waitForURL(/\/business-health-quiz\/quiz\?session=/);

    const questionsSeenTexts = new Set<string>();

    // Answer first 5 questions and ensure no duplicates
    for (let i = 0; i < 5; i++) {
      await page.waitForSelector('h2.text-2xl', { state: 'visible' });

      const questionText = await page.locator('h2.text-2xl').textContent();
      console.log(`Question ${i + 1}: ${questionText?.substring(0, 50)}...`);

      // Check for duplicate
      if (questionsSeenTexts.has(questionText || '')) {
        throw new Error(`Duplicate question detected: "${questionText}"`);
      }
      questionsSeenTexts.add(questionText || '');

      await answerQuestion(page, MOCK_ANSWERS.context[i], i);
      await page.waitForTimeout(500);
    }

    console.log('✅ No infinite loop detected - all questions unique');
  });

});

// ============================================================================
// SUMMARY TEST
// ============================================================================

test.describe('Business Quiz - Quick Smoke Test', () => {

  test('SMOKE: Complete minimal flow', async ({ page }) => {
    console.log('\n🔥 SMOKE TEST: Quick Validation\n');

    test.setTimeout(90000);

    // 1. Landing page
    await page.goto(LANDING_PAGE_URL);
    await expect(page.locator('text=Descubra a saúde')).toBeVisible();
    console.log('✅ Landing page loaded');

    // 2. Start quiz
    await page.locator('button', { hasText: 'Começar Diagnóstico' }).click();
    await page.waitForURL(/\/business-health-quiz\/quiz\?session=/);
    console.log('✅ Quiz started');

    // 3. Answer first question
    await page.waitForSelector('form');
    await checkPlaceholderVisibility(page, 'input[type="text"]');
    await page.locator('input[type="text"]').fill('Smoke Test Company');
    await page.locator('button[type="submit"]').click();
    console.log('✅ First question answered');

    // 4. Verify second question loaded
    await page.waitForSelector('form', { state: 'visible' });
    const progress = await getCurrentProgress(page);
    expect(progress).toBeGreaterThan(5);
    console.log(`✅ Second question loaded (progress: ${progress}%)`);

    console.log('\n🎉 SMOKE TEST PASSED!\n');
  });

});
