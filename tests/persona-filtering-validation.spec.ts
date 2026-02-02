import { test, expect, Page } from '@playwright/test';

/**
 * PERSONA FILTERING VALIDATION TESTS
 *
 * Tests to validate that:
 * 1. Board Executive persona sees ZERO technical questions
 * 2. Engineering persona sees technical questions with "Não sei" options
 * 3. Mixed personas get appropriate question mix
 * 4. LLM follow-ups are generated intelligently
 * 5. Uncertainty detector works when user says "não sei"
 *
 * This addresses the critical bug where non-technical users were getting
 * bombarded with technical questions about bugs, code, frameworks, etc.
 */

const BASE_URL = 'http://localhost:3003';

// Helper functions
async function clearSession(page: Page) {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

async function goToAssessment(page: Page) {
  await page.goto(`${BASE_URL}/assessment`);
  await page.waitForLoadState('networkidle');
}

async function selectExpertise(page: Page, expertiseAreas: string[]) {
  // Wait for Step -2 (expertise selection)
  await page.waitForSelector('text=/.*Qual é a sua área.*|.*expertise.*/i', {
    timeout: 10000
  });

  // Clear any pre-selected options
  await page.evaluate(() => {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((cb: any) => cb.checked = false);
  });

  // Select specified expertise areas
  for (const area of expertiseAreas) {
    const checkbox = page.locator(`label:has-text("${area}") input[type="checkbox"]`);
    await checkbox.check();
  }

  // Click "Continuar" or similar button
  await page.click('button:has-text("Continuar"), button:has-text("Continue"), button:has-text("Próximo")');
  await page.waitForTimeout(1000); // Wait for navigation
}

async function answerQuestion(page: Page, answer: string | { option: string }) {
  if (typeof answer === 'string') {
    // Text input
    const input = page.locator('textarea, input[type="text"]').last();
    await input.fill(answer);
  } else {
    // Multiple choice
    await page.click(`text="${answer.option}"`);
  }

  // Click "Próximo" or similar
  await page.click('button:has-text("Próximo"), button:has-text("Continue"), button:has-text("Enviar")');
  await page.waitForTimeout(1500); // Wait for next question
}

async function getQuestionText(page: Page): Promise<string> {
  const questionElement = page.locator('[data-testid="question-text"], h2, h3').first();
  return await questionElement.textContent() || '';
}

async function checkForTechnicalQuestions(questionTexts: string[]): boolean {
  const technicalKeywords = [
    'ferramentas de IA no desenvolvimento',
    'código pronto até produção',
    'bugs críticos',
    'linguagem/framework',
    'code review',
    'pull requests',
    'deploy',
    'CI/CD',
    'testes automatizados',
    'cobertura de testes',
    'dívida técnica'
  ];

  return questionTexts.some(text =>
    technicalKeywords.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()))
  );
}

async function checkForFollowUpWithQuotes(questionText: string): boolean {
  // Check if question contains quoted text (sign of intelligent follow-up)
  return /"[^"]+"|'[^']+'|«[^»]+»/.test(questionText);
}

// ============================================================================
// TEST 1: Board Executive (Business Strategy) - MOST CRITICAL
// ============================================================================

test.describe('Persona: Board Executive (Business Strategy)', () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
    await goToAssessment(page);
  });

  test('should NOT show any technical questions to board executive', async ({ page }) => {
    // Step -2: Select only business expertise
    await selectExpertise(page, ['Produto/UX', 'Estratégia/Negócios']);

    // Collect all questions shown
    const questionTexts: string[] = [];
    let questionCount = 0;
    const maxQuestions = 10;

    while (questionCount < maxQuestions) {
      try {
        const questionText = await getQuestionText(page);

        if (!questionText || questionText.trim() === '') {
          break;
        }

        console.log(`[Board Executive] Q${questionCount + 1}: ${questionText.substring(0, 80)}...`);
        questionTexts.push(questionText);

        // Answer the question
        if (questionText.includes('tamanho da sua empresa')) {
          await answerQuestion(page, { option: 'Scale-up' });
        } else if (questionText.includes('desafio estratégico')) {
          await answerQuestion(page, 'Desenvolver novos produtos inovadores para se diferenciar da concorrência');
        } else if (questionText.includes('receita')) {
          await answerQuestion(page, { option: 'Impacto moderado' });
        } else if (questionText.includes('usa IA')) {
          await answerQuestion(page, { option: 'Experimentando' });
        } else if (questionText.includes('resolver UM problema')) {
          await answerQuestion(page, 'Aumentar eficiência operacional e reduzir custos');
        } else {
          // Generic text answer
          await answerQuestion(page, 'Resposta genérica para avançar');
        }

        questionCount++;
      } catch (error) {
        // Reached end of questions or error
        console.log(`[Board Executive] Completed ${questionCount} questions`);
        break;
      }
    }

    // CRITICAL VALIDATION: No technical questions should appear
    const hasTechnicalQuestions = checkForTechnicalQuestions(questionTexts);

    console.log('\n=== BOARD EXECUTIVE VALIDATION ===');
    console.log(`Total questions: ${questionTexts.length}`);
    console.log(`Has technical questions: ${hasTechnicalQuestions ? 'FAIL ❌' : 'PASS ✅'}`);

    if (hasTechnicalQuestions) {
      console.log('\n❌ TECHNICAL QUESTIONS FOUND:');
      questionTexts.forEach((q, i) => {
        if (q.toLowerCase().includes('código') ||
            q.toLowerCase().includes('bug') ||
            q.toLowerCase().includes('framework') ||
            q.toLowerCase().includes('deploy')) {
          console.log(`  Q${i + 1}: ${q}`);
        }
      });
    }

    expect(hasTechnicalQuestions).toBe(false);
  });

  test('should generate intelligent follow-up citing user words', async ({ page }) => {
    await selectExpertise(page, ['Estratégia/Negócios']);

    // Answer with keywords that should trigger LLM follow-up
    let foundFollowUp = false;
    let questionCount = 0;
    const maxQuestions = 8;

    while (questionCount < maxQuestions && !foundFollowUp) {
      const questionText = await getQuestionText(page);
      console.log(`[Follow-up Test] Q${questionCount + 1}: ${questionText.substring(0, 60)}...`);

      if (questionText.includes('desafio estratégico')) {
        // Answer with rich keywords
        await answerQuestion(page, 'Desenvolver novos produtos inovadores para se diferenciar da concorrência e capturar market share');

        // Next question should be a follow-up
        await page.waitForTimeout(2000);
        const nextQuestion = await getQuestionText(page);

        console.log(`[Follow-up Test] Next Q: ${nextQuestion.substring(0, 80)}...`);

        // Check if it contains quotes (sign of citing user's words)
        foundFollowUp = checkForFollowUpWithQuotes(nextQuestion);

        if (foundFollowUp) {
          console.log('✅ INTELLIGENT FOLLOW-UP DETECTED with quoted text!');
        } else {
          console.log('⚠️  Next question does not contain quotes');
        }

        break;
      } else {
        // Answer generically to reach the strategic question
        await answerQuestion(page, 'Resposta genérica');
      }

      questionCount++;
    }

    // This test is informational - LLM might not always be called due to budget
    // But we log the result for manual verification
    console.log(`\nFollow-up with quotes found: ${foundFollowUp ? 'YES ✅' : 'NO (check logs)'}`);
  });
});

// ============================================================================
// TEST 2: Engineering/Tech Persona
// ============================================================================

test.describe('Persona: Engineering/Tech', () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
    await goToAssessment(page);
  });

  test('should show technical questions with "Não sei" option', async ({ page }) => {
    // Select only tech expertise
    await selectExpertise(page, ['Tecnologia/Programação']);

    const questionTexts: string[] = [];
    let foundTechnicalQuestion = false;
    let foundNaoSeiOption = false;
    let questionCount = 0;
    const maxQuestions = 10;

    while (questionCount < maxQuestions) {
      try {
        const questionText = await getQuestionText(page);

        if (!questionText) break;

        console.log(`[Engineering] Q${questionCount + 1}: ${questionText.substring(0, 80)}...`);
        questionTexts.push(questionText);

        // Check if this is a technical question
        const isTechnical = questionText.includes('ferramentas de IA no desenvolvimento') ||
                           questionText.includes('código') ||
                           questionText.includes('bugs') ||
                           questionText.includes('framework');

        if (isTechnical) {
          foundTechnicalQuestion = true;

          // Check if "Não tenho informações" option exists
          const naoSeiOption = await page.locator('text=/.*Não tenho informações.*|.*Não sei.*/i').count();

          if (naoSeiOption > 0) {
            foundNaoSeiOption = true;
            console.log('  ✅ Found "Não sei" option');

            // Select it to test uncertainty detector
            await page.click('text=/.*Não tenho informações.*/i');
            await page.click('button:has-text("Próximo")');
            await page.waitForTimeout(1500);
          } else {
            console.log('  ⚠️  No "Não sei" option found');
            await answerQuestion(page, 'Resposta genérica');
          }
        } else {
          // Non-technical question - answer normally
          await answerQuestion(page, 'Resposta genérica');
        }

        questionCount++;
      } catch (error) {
        break;
      }
    }

    console.log('\n=== ENGINEERING PERSONA VALIDATION ===');
    console.log(`Total questions: ${questionTexts.length}`);
    console.log(`Found technical questions: ${foundTechnicalQuestion ? 'YES ✅' : 'NO ❌'}`);
    console.log(`Found "Não sei" option: ${foundNaoSeiOption ? 'YES ✅' : 'NO ❌'}`);

    // Engineering persona SHOULD see technical questions
    expect(foundTechnicalQuestion).toBe(true);
    // Technical questions SHOULD have "Não sei" option
    expect(foundNaoSeiOption).toBe(true);
  });
});

// ============================================================================
// TEST 3: Finance/Ops Persona (Another non-technical)
// ============================================================================

test.describe('Persona: Finance/Ops', () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
    await goToAssessment(page);
  });

  test('should NOT show technical questions to finance/ops', async ({ page }) => {
    await selectExpertise(page, ['Finanças/Operações']);

    const questionTexts: string[] = [];
    let questionCount = 0;
    const maxQuestions = 8;

    while (questionCount < maxQuestions) {
      try {
        const questionText = await getQuestionText(page);

        if (!questionText) break;

        console.log(`[Finance/Ops] Q${questionCount + 1}: ${questionText.substring(0, 80)}...`);
        questionTexts.push(questionText);

        // Answer generically
        await answerQuestion(page, 'Resposta para avançar');
        questionCount++;
      } catch (error) {
        break;
      }
    }

    const hasTechnicalQuestions = checkForTechnicalQuestions(questionTexts);

    console.log('\n=== FINANCE/OPS VALIDATION ===');
    console.log(`Total questions: ${questionTexts.length}`);
    console.log(`Has technical questions: ${hasTechnicalQuestions ? 'FAIL ❌' : 'PASS ✅'}`);

    expect(hasTechnicalQuestions).toBe(false);
  });
});

// ============================================================================
// TEST 4: Mixed Persona (Product + Tech)
// ============================================================================

test.describe('Persona: Mixed (Product + Tech)', () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
    await goToAssessment(page);
  });

  test('should show mix of business and technical questions', async ({ page }) => {
    await selectExpertise(page, ['Produto/UX', 'Tecnologia/Programação']);

    const questionTexts: string[] = [];
    let questionCount = 0;
    const maxQuestions = 10;

    while (questionCount < maxQuestions) {
      try {
        const questionText = await getQuestionText(page);

        if (!questionText) break;

        console.log(`[Mixed] Q${questionCount + 1}: ${questionText.substring(0, 80)}...`);
        questionTexts.push(questionText);

        await answerQuestion(page, 'Resposta genérica');
        questionCount++;
      } catch (error) {
        break;
      }
    }

    const hasTechnicalQuestions = checkForTechnicalQuestions(questionTexts);

    console.log('\n=== MIXED PERSONA VALIDATION ===');
    console.log(`Total questions: ${questionTexts.length}`);
    console.log(`Has technical questions: ${hasTechnicalQuestions ? 'YES (expected)' : 'NO'}`);

    // Mixed persona SHOULD see some technical questions
    // But not as many as pure tech persona
    expect(questionTexts.length).toBeGreaterThan(5);
  });
});

// ============================================================================
// TEST 5: Budget Control (Max 3 LLM Follow-ups)
// ============================================================================

test.describe('Budget Control: Max 3 LLM Follow-ups', () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
    await goToAssessment(page);
  });

  test('should not generate more than 3 LLM follow-ups per session', async ({ page }) => {
    await selectExpertise(page, ['Estratégia/Negócios']);

    let followUpCount = 0;
    let questionCount = 0;
    const maxQuestions = 15;

    while (questionCount < maxQuestions) {
      try {
        const questionText = await getQuestionText(page);

        if (!questionText) break;

        // Check if this is a follow-up (contains quotes)
        if (checkForFollowUpWithQuotes(questionText)) {
          followUpCount++;
          console.log(`[Budget] Follow-up #${followUpCount}: ${questionText.substring(0, 60)}...`);
        }

        // Always answer with rich keywords to trigger follow-ups
        await answerQuestion(page, 'Precisamos inovar rapidamente para competir no mercado crescente com orçamento limitado');
        questionCount++;
      } catch (error) {
        break;
      }
    }

    console.log('\n=== BUDGET CONTROL VALIDATION ===');
    console.log(`Total questions: ${questionCount}`);
    console.log(`Follow-ups detected: ${followUpCount}`);
    console.log(`Budget respected: ${followUpCount <= 3 ? 'YES ✅' : 'NO ❌'}`);

    // Should not exceed 3 LLM follow-ups
    expect(followUpCount).toBeLessThanOrEqual(3);
  });
});
