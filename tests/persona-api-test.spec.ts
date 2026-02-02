import { test, expect } from '@playwright/test';

/**
 * PERSONA API TESTS
 *
 * Test the API endpoints to validate persona filtering logic without browser UI
 */

const BASE_URL = 'http://localhost:3003';

test.describe('Persona Filtering API Tests', () => {
  test('should start adaptive assessment and get first question', async ({ request }) => {
    console.log('Starting adaptive assessment API test...');

    // Step 1: Start assessment with board-executive persona
    const startResponse = await request.post(`${BASE_URL}/api/adaptive-assessment`, {
      data: {
        persona: 'board-executive',
        userExpertise: ['product-ux', 'strategy-business']
      }
    });

    expect(startResponse.ok()).toBeTruthy();
    const startData = await startResponse.json();

    console.log('✅ Assessment started');
    console.log(`Session ID: ${startData.sessionId}`);
    console.log(`First question: ${startData.question?.text?.substring(0, 60)}...`);

    expect(startData.sessionId).toBeTruthy();
    expect(startData.question).toBeTruthy();
    expect(startData.question.text).toBeTruthy();

    // Verify it's not a technical question
    const firstQuestion = startData.question.text.toLowerCase();
    const technicalKeywords = ['código', 'bugs', 'framework', 'deploy', 'ci/cd', 'pull request'];
    const isTechnical = technicalKeywords.some(keyword => firstQuestion.includes(keyword));

    console.log(`Is first question technical? ${isTechnical ? 'YES (BAD ❌)' : 'NO (GOOD ✅)'}`);
    expect(isTechnical).toBe(false);

    return startData.sessionId;
  });

  test('should answer question and get next question for board-executive', async ({ request }) => {
    console.log('\n=== Board Executive Flow ===');

    // Start assessment
    const startResponse = await request.post(`${BASE_URL}/api/adaptive-assessment`, {
      data: {
        persona: 'board-executive',
        userExpertise: ['strategy-business']
      }
    });

    const startData = await startResponse.json();
    const sessionId = startData.sessionId;
    const firstQuestionId = startData.question.id;

    console.log(`Q1: ${startData.question.text.substring(0, 70)}...`);

    // Answer first question
    const answerResponse = await request.post(`${BASE_URL}/api/adaptive-assessment/answer`, {
      data: {
        sessionId,
        questionId: firstQuestionId,
        answer: 'Scale-up (51-500 pessoas)'
      }
    });

    expect(answerResponse.ok()).toBeTruthy();
    const answerData = await answerResponse.json();

    console.log(`Q2: ${answerData.nextQuestion.text.substring(0, 70)}...`);

    // Verify second question is also not technical
    const secondQuestion = answerData.nextQuestion.text.toLowerCase();
    const technicalKeywords = ['código', 'bugs', 'framework', 'deploy', 'ci/cd', 'pull request'];
    const isTechnical = technicalKeywords.some(keyword => secondQuestion.includes(keyword));

    console.log(`Is second question technical? ${isTechnical ? 'YES (BAD ❌)' : 'NO (GOOD ✅)'}`);
    expect(isTechnical).toBe(false);
  });

  test('should NOT show technical questions to board-executive in full flow', async ({ request }) => {
    console.log('\n=== Full Board Executive Flow (10 questions) ===');

    // Start assessment
    const startResponse = await request.post(`${BASE_URL}/api/adaptive-assessment`, {
      data: {
        persona: 'board-executive',
        userExpertise: ['product-ux', 'strategy-business']
      }
    });

    const startData = await startResponse.json();
    let sessionId = startData.sessionId;
    let currentQuestion = startData.question;

    const allQuestions: string[] = [currentQuestion.text];
    const technicalQuestions: string[] = [];

    console.log(`\nQ1: ${currentQuestion.text}`);

    // Answer up to 10 questions
    for (let i = 1; i < 10; i++) {
      try {
        const answerResponse = await request.post(`${BASE_URL}/api/adaptive-assessment/answer`, {
          data: {
            sessionId,
            questionId: currentQuestion.id,
            answer: i === 2 ? 'Desenvolver novos produtos inovadores para se diferenciar da concorrência' : 'Resposta genérica'
          }
        });

        if (!answerResponse.ok()) {
          console.log(`Stopped at question ${i + 1} (assessment may be complete)`);
          break;
        }

        const answerData = await answerResponse.json();

        if (!answerData.nextQuestion) {
          console.log(`Assessment complete at question ${i + 1}`);
          break;
        }

        currentQuestion = answerData.nextQuestion;
        allQuestions.push(currentQuestion.text);

        console.log(`Q${i + 1}: ${currentQuestion.text}`);

        // Check if technical
        const technicalKeywords = [
          'código',
          'bugs',
          'framework',
          'deploy',
          'ci/cd',
          'pull request',
          'ferramentas de ia no desenvolvimento',
          'testes automatizados',
          'cobertura de testes'
        ];

        const questionLower = currentQuestion.text.toLowerCase();
        const isTechnical = technicalKeywords.some(keyword => questionLower.includes(keyword));

        if (isTechnical) {
          technicalQuestions.push(currentQuestion.text);
        }
      } catch (error) {
        console.log(`Error at question ${i + 1}:`, error);
        break;
      }
    }

    console.log('\n=== RESULTS ===');
    console.log(`Total questions: ${allQuestions.length}`);
    console.log(`Technical questions: ${technicalQuestions.length}`);

    if (technicalQuestions.length > 0) {
      console.log('\n❌ TECHNICAL QUESTIONS FOUND:');
      technicalQuestions.forEach((q, i) => console.log(`  ${i + 1}. ${q}`));
    } else {
      console.log('✅ No technical questions found!');
    }

    // CRITICAL ASSERTION: Board executive should see ZERO technical questions
    expect(technicalQuestions.length).toBe(0);
  });

  test('should show technical questions to engineering-tech persona', async ({ request }) => {
    console.log('\n=== Engineering Tech Flow ===');

    // Start assessment with technical persona
    const startResponse = await request.post(`${BASE_URL}/api/adaptive-assessment`, {
      data: {
        persona: 'engineering-tech',
        userExpertise: ['tech-engineering']
      }
    });

    const startData = await startResponse.json();
    let sessionId = startData.sessionId;
    let currentQuestion = startData.question;

    const allQuestions: string[] = [currentQuestion.text];
    const technicalQuestions: string[] = [];

    console.log(`Q1: ${currentQuestion.text}`);

    // Answer up to 10 questions
    for (let i = 1; i < 10; i++) {
      try {
        const answerResponse = await request.post(`${BASE_URL}/api/adaptive-assessment/answer`, {
          data: {
            sessionId,
            questionId: currentQuestion.id,
            answer: 'Resposta genérica'
          }
        });

        if (!answerResponse.ok()) break;

        const answerData = await answerResponse.json();
        if (!answerData.nextQuestion) break;

        currentQuestion = answerData.nextQuestion;
        allQuestions.push(currentQuestion.text);

        console.log(`Q${i + 1}: ${currentQuestion.text}`);

        // Check if technical
        const technicalKeywords = [
          'código',
          'bugs',
          'framework',
          'deploy',
          'ferramentas de ia no desenvolvimento'
        ];

        const questionLower = currentQuestion.text.toLowerCase();
        const isTechnical = technicalKeywords.some(keyword => questionLower.includes(keyword));

        if (isTechnical) {
          technicalQuestions.push(currentQuestion.text);
        }
      } catch (error) {
        break;
      }
    }

    console.log('\n=== ENGINEERING RESULTS ===');
    console.log(`Total questions: ${allQuestions.length}`);
    console.log(`Technical questions: ${technicalQuestions.length}`);

    // Engineering persona SHOULD see technical questions
    console.log(`Found technical questions: ${technicalQuestions.length > 0 ? 'YES ✅' : 'NO ❌'}`);

    expect(technicalQuestions.length).toBeGreaterThan(0);
  });
});
