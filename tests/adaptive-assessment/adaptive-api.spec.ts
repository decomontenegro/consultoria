/**
 * Adaptive Assessment API Integration Tests
 *
 * Tests the complete adaptive assessment flow with 4 API endpoints:
 * 1. POST /api/adaptive-assessment (initialize)
 * 2. POST /api/adaptive-assessment/next-question (get question)
 * 3. POST /api/adaptive-assessment/answer (submit answer)
 * 4. POST /api/adaptive-assessment/complete (finish)
 *
 * STRATEGY: 100% Real API (like FASE 2/3)
 * - Serial execution to manage session state + rate limits
 * - 60s timeout for Claude API calls (question routing)
 * - 2s delay between tests for rate limit buffer
 * - Estimated cost: ~R$1.50-2.00 per full run (~15-20 Claude calls)
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3003';
const RATE_LIMIT_DELAY = 2000; // 2s between tests

// Helper to add delay between tests
async function delayForRateLimit() {
  await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
}

// Sample valid personas (from types)
const VALID_PERSONAS = ['cto', 'ceo', 'product-manager', 'dev-lead'];

// Sample answers for different input types
const SAMPLE_ANSWERS = {
  text: 'Nossa empresa atua em Fintech e tem cerca de 50 funcionários.',
  singleChoice: 'fintech',
  multiChoice: ['github-copilot', 'chatgpt'],
  number: 15,
};

// ============================================================================
// GROUP 1: Happy Paths
// ============================================================================

test.describe('Adaptive Assessment API - Happy Paths', () => {
  test.describe.configure({ mode: 'serial' });

  let sessionId: string;
  let firstQuestionId: string;

  test('1. Initialize session successfully', async ({ request }) => {
    console.log('\n🚀 [Test 1] Initializing new session...');

    const response = await request.post(`${BASE_URL}/api/adaptive-assessment`, {
      data: {
        persona: 'cto',
        partialData: {
          companyInfo: {
            name: 'Test Corp',
            industry: 'fintech'
          }
        }
      }
    });

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('sessionId');
    expect(data).toHaveProperty('success');
    expect(data.success).toBe(true);
    expect(typeof data.sessionId).toBe('string');
    expect(data.sessionId.length).toBeGreaterThan(0);

    // Store for next tests
    sessionId = data.sessionId;

    console.log('✅ [Test 1] Session created:', sessionId);

    await delayForRateLimit();
  });

  test('2. Get first question (should not be null)', async ({ request }) => {
    test.setTimeout(60000); // Claude API can take time

    console.log('\n🔍 [Test 2] Getting first question for session:', sessionId);

    const response = await request.post(`${BASE_URL}/api/adaptive-assessment/next-question`, {
      data: { sessionId }
    });

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('nextQuestion');
    expect(data).toHaveProperty('shouldFinish');
    expect(data).toHaveProperty('completion');

    // First question should NOT be null
    expect(data.nextQuestion).not.toBeNull();
    expect(data.shouldFinish).toBe(false);

    // Question structure validation
    expect(data.nextQuestion).toHaveProperty('id');
    expect(data.nextQuestion).toHaveProperty('text');
    expect(data.nextQuestion).toHaveProperty('inputType');

    // Store for next test
    firstQuestionId = data.nextQuestion.id;

    console.log('✅ [Test 2] Got question:', {
      id: data.nextQuestion.id,
      inputType: data.nextQuestion.inputType,
      completeness: data.completion.completenessScore,
      shouldFinish: data.shouldFinish
    });

    await delayForRateLimit();
  });

  test('3. Submit answer and verify context update', async ({ request }) => {
    console.log('\n📝 [Test 3] Submitting answer for question:', firstQuestionId);

    // Determine answer based on question (use single choice as safe default)
    const answer = SAMPLE_ANSWERS.singleChoice;

    const response = await request.post(`${BASE_URL}/api/adaptive-assessment/answer`, {
      data: {
        sessionId,
        questionId: firstQuestionId,
        answer
      }
    });

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('success');
    expect(data).toHaveProperty('completeness');
    expect(data).toHaveProperty('questionsAsked');
    expect(data.success).toBe(true);

    // After first answer, should have 1 question asked
    expect(data.questionsAsked).toBeGreaterThanOrEqual(1);

    // Completeness should be > 0
    expect(data.completeness).toBeGreaterThan(0);

    console.log('✅ [Test 3] Answer submitted:', {
      questionsAsked: data.questionsAsked,
      completeness: data.completeness,
      topicsCovered: data.topicsCovered
    });

    await delayForRateLimit();
  });

  test('4. Complete flow (init → 3-5 Q&A → complete)', async ({ request }) => {
    test.setTimeout(120000); // 2 minutes for full flow

    console.log('\n🔄 [Test 4] Testing complete flow...');

    // 4.1. Initialize new session
    console.log('  Step 1/4: Initialize session');
    const initResponse = await request.post(`${BASE_URL}/api/adaptive-assessment`, {
      data: { persona: 'ceo' }
    });
    expect(initResponse.status()).toBe(200);
    const { sessionId: flowSessionId } = await initResponse.json();

    await delayForRateLimit();

    // 4.2. Answer 3-5 questions
    const maxQuestions = 5;
    const completenessHistory: number[] = [];

    for (let i = 0; i < maxQuestions; i++) {
      console.log(`  Step 2/${i + 1}: Get question ${i + 1}`);

      // Get next question
      const questionResponse = await request.post(
        `${BASE_URL}/api/adaptive-assessment/next-question`,
        { data: { sessionId: flowSessionId } }
      );
      expect(questionResponse.status()).toBe(200);

      const questionData = await questionResponse.json();

      // If should finish, break
      if (questionData.shouldFinish || !questionData.nextQuestion) {
        console.log('  → Assessment ready to finish (high completeness or no more questions)');
        break;
      }

      await delayForRateLimit();

      // Submit answer
      console.log(`  Step 3/${i + 1}: Submit answer ${i + 1}`);
      const answerResponse = await request.post(
        `${BASE_URL}/api/adaptive-assessment/answer`,
        {
          data: {
            sessionId: flowSessionId,
            questionId: questionData.nextQuestion.id,
            answer: getAnswerForQuestion(questionData.nextQuestion)
          }
        }
      );
      expect(answerResponse.status()).toBe(200);

      const answerData = await answerResponse.json();
      completenessHistory.push(answerData.completeness);

      console.log(`    → Completeness: ${answerData.completeness}%`);

      await delayForRateLimit();
    }

    // 4.3. Complete assessment
    console.log('  Step 4/4: Complete assessment');
    const completeResponse = await request.post(
      `${BASE_URL}/api/adaptive-assessment/complete`,
      {
        data: {
          sessionId: flowSessionId,
          conversationHistory: []
        }
      }
    );
    expect(completeResponse.status()).toBe(200);

    const completeData = await completeResponse.json();
    expect(completeData).toHaveProperty('assessmentData');
    expect(completeData).toHaveProperty('sessionSummary');
    expect(completeData.sessionSummary.questionsAsked).toBeGreaterThan(0);

    console.log('✅ [Test 4] Complete flow finished:', {
      questionsAsked: completeData.sessionSummary.questionsAsked,
      completeness: completeData.sessionSummary.completeness,
      completenessProgression: completenessHistory,
      hasInsights: !!completeData.deepInsights
    });

    await delayForRateLimit();
  });

  test('5. Verify completeness progression (monotonic increase)', async ({ request }) => {
    test.setTimeout(120000);

    console.log('\n📈 [Test 5] Verifying completeness progression...');

    // Initialize
    const initResponse = await request.post(`${BASE_URL}/api/adaptive-assessment`, {
      data: { persona: 'product-manager' }
    });
    const { sessionId: testSessionId } = await initResponse.json();

    await delayForRateLimit();

    const completenessValues: number[] = [];

    // Answer 3 questions and track completeness
    for (let i = 0; i < 3; i++) {
      // Get question
      const questionResponse = await request.post(
        `${BASE_URL}/api/adaptive-assessment/next-question`,
        { data: { sessionId: testSessionId } }
      );
      const questionData = await questionResponse.json();

      if (!questionData.nextQuestion) break;

      await delayForRateLimit();

      // Submit answer
      const answerResponse = await request.post(
        `${BASE_URL}/api/adaptive-assessment/answer`,
        {
          data: {
            sessionId: testSessionId,
            questionId: questionData.nextQuestion.id,
            answer: getAnswerForQuestion(questionData.nextQuestion)
          }
        }
      );
      const answerData = await answerResponse.json();
      completenessValues.push(answerData.completeness);

      console.log(`  Question ${i + 1}: Completeness = ${answerData.completeness}%`);

      await delayForRateLimit();
    }

    // Verify monotonic increase
    for (let i = 1; i < completenessValues.length; i++) {
      expect(completenessValues[i]).toBeGreaterThanOrEqual(completenessValues[i - 1]);
    }

    console.log('✅ [Test 5] Completeness progression is monotonic:', completenessValues);

    // Cleanup
    await request.post(`${BASE_URL}/api/adaptive-assessment/complete`, {
      data: { sessionId: testSessionId, conversationHistory: [] }
    });

    await delayForRateLimit();
  });
});

// ============================================================================
// GROUP 2: Error Handling
// ============================================================================

test.describe('Adaptive Assessment API - Error Handling', () => {
  test.describe.configure({ mode: 'serial' });

  test('6. Error: Missing sessionId (next-question)', async ({ request }) => {
    console.log('\n❌ [Test 6] Testing missing sessionId error...');

    const response = await request.post(`${BASE_URL}/api/adaptive-assessment/next-question`, {
      data: {} // No sessionId
    });

    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('Missing sessionId');

    console.log('✅ [Test 6] Correctly returned 400 for missing sessionId');

    await delayForRateLimit();
  });

  test('7. Error: Invalid persona (init)', async ({ request }) => {
    console.log('\n❌ [Test 7] Testing invalid persona error...');

    const response = await request.post(`${BASE_URL}/api/adaptive-assessment`, {
      data: { persona: 'invalid-persona-xyz' }
    });

    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('Invalid or missing persona');

    console.log('✅ [Test 7] Correctly returned 400 for invalid persona');

    await delayForRateLimit();
  });

  test('8. Error: Session not found (next-question)', async ({ request }) => {
    console.log('\n❌ [Test 8] Testing session not found error...');

    const response = await request.post(`${BASE_URL}/api/adaptive-assessment/next-question`, {
      data: { sessionId: 'non-existent-session-id-12345' }
    });

    expect(response.status()).toBe(404);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('Session not found');

    console.log('✅ [Test 8] Correctly returned 404 for non-existent session');

    await delayForRateLimit();
  });

  test('9. Error: Invalid question ID (answer)', async ({ request }) => {
    console.log('\n❌ [Test 9] Testing invalid question ID error...');

    // First create a valid session
    const initResponse = await request.post(`${BASE_URL}/api/adaptive-assessment`, {
      data: { persona: 'cto' }
    });
    const { sessionId } = await initResponse.json();

    await delayForRateLimit();

    // Try to submit answer for invalid question
    const response = await request.post(`${BASE_URL}/api/adaptive-assessment/answer`, {
      data: {
        sessionId,
        questionId: 'invalid-question-id-xyz',
        answer: 'test answer'
      }
    });

    expect(response.status()).toBe(404);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('Question not found');

    console.log('✅ [Test 9] Correctly returned 404 for invalid question ID');

    // Cleanup
    await request.post(`${BASE_URL}/api/adaptive-assessment/complete`, {
      data: { sessionId, conversationHistory: [] }
    });

    await delayForRateLimit();
  });

  test('10. Error: Missing answer (answer)', async ({ request }) => {
    console.log('\n❌ [Test 10] Testing missing answer error...');

    // Create session and get a question
    const initResponse = await request.post(`${BASE_URL}/api/adaptive-assessment`, {
      data: { persona: 'cto' }
    });
    const { sessionId } = await initResponse.json();

    await delayForRateLimit();

    const questionResponse = await request.post(
      `${BASE_URL}/api/adaptive-assessment/next-question`,
      { data: { sessionId } }
    );
    const { nextQuestion } = await questionResponse.json();

    await delayForRateLimit();

    // Try to submit without answer
    const response = await request.post(`${BASE_URL}/api/adaptive-assessment/answer`, {
      data: {
        sessionId,
        questionId: nextQuestion.id,
        answer: null // Explicitly null
      }
    });

    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('Missing answer');

    console.log('✅ [Test 10] Correctly returned 400 for missing answer');

    // Cleanup
    await request.post(`${BASE_URL}/api/adaptive-assessment/complete`, {
      data: { sessionId, conversationHistory: [] }
    });

    await delayForRateLimit();
  });
});

// ============================================================================
// GROUP 3: Edge Cases
// ============================================================================

test.describe('Adaptive Assessment API - Edge Cases', () => {
  test.describe.configure({ mode: 'serial' });

  test('11. Verify session cleanup after complete', async ({ request }) => {
    console.log('\n🗑️  [Test 11] Testing session cleanup...');

    // Create session
    const initResponse = await request.post(`${BASE_URL}/api/adaptive-assessment`, {
      data: { persona: 'dev-lead' }
    });
    const { sessionId } = await initResponse.json();

    await delayForRateLimit();

    // Complete assessment (should delete session)
    const completeResponse = await request.post(
      `${BASE_URL}/api/adaptive-assessment/complete`,
      {
        data: { sessionId, conversationHistory: [] }
      }
    );
    expect(completeResponse.status()).toBe(200);

    await delayForRateLimit();

    // Try to use sessionId again (should fail)
    const nextQuestionResponse = await request.post(
      `${BASE_URL}/api/adaptive-assessment/next-question`,
      { data: { sessionId } }
    );

    expect(nextQuestionResponse.status()).toBe(404);

    const data = await nextQuestionResponse.json();
    expect(data.error).toContain('Session not found');

    console.log('✅ [Test 11] Session correctly cleaned up after complete');

    await delayForRateLimit();
  });

  test('12. Complete works even if insights fail (graceful degradation)', async ({ request }) => {
    test.setTimeout(90000);

    console.log('\n🛡️  [Test 12] Testing graceful degradation (insights optional)...');

    // Create session and answer 1 question
    const initResponse = await request.post(`${BASE_URL}/api/adaptive-assessment`, {
      data: { persona: 'cto' }
    });
    const { sessionId } = await initResponse.json();

    await delayForRateLimit();

    // Get and answer one question
    const questionResponse = await request.post(
      `${BASE_URL}/api/adaptive-assessment/next-question`,
      { data: { sessionId } }
    );
    const { nextQuestion } = await questionResponse.json();

    if (nextQuestion) {
      await delayForRateLimit();

      await request.post(`${BASE_URL}/api/adaptive-assessment/answer`, {
        data: {
          sessionId,
          questionId: nextQuestion.id,
          answer: getAnswerForQuestion(nextQuestion)
        }
      });

      await delayForRateLimit();
    }

    // Complete should work even if insights API is unavailable/fails
    // (The endpoint has try-catch around insights generation)
    const completeResponse = await request.post(
      `${BASE_URL}/api/adaptive-assessment/complete`,
      {
        data: { sessionId, conversationHistory: [] }
      }
    );

    expect(completeResponse.status()).toBe(200);

    const data = await completeResponse.json();
    expect(data).toHaveProperty('assessmentData');
    expect(data).toHaveProperty('sessionSummary');

    // Insights might be null (if budget control skipped or failed)
    console.log('  Insights generated:', !!data.deepInsights);

    console.log('✅ [Test 12] Complete succeeded (insights:', !!data.deepInsights, ')');

    await delayForRateLimit();
  });
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate appropriate answer based on question input type
 */
function getAnswerForQuestion(question: any): any {
  switch (question.inputType) {
    case 'text':
      return 'Esta é uma resposta de teste com informações relevantes sobre a empresa.';

    case 'single-choice':
      // Return first option if available
      return question.options?.[0]?.value || 'option-1';

    case 'multi-choice':
      // Return first two options if available
      const values = question.options?.slice(0, 2).map((opt: any) => opt.value) || [];
      return values.length > 0 ? values : ['option-1'];

    case 'number':
      return 15;

    default:
      return 'Resposta padrão';
  }
}
