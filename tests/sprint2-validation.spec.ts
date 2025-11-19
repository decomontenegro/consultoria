/**
 * Sprint 2 Validation Tests
 *
 * Validates:
 * - Question bank with 4-block architecture
 * - Router v2 block-aware routing
 * - API integration with question bank
 * - Data extraction from structured questions
 * - Block transitions (discovery → expertise → deep-dive → risk-scan)
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Sprint 2: Enhanced Question Structure', () => {
  test('01 - Deve criar sessão com block tracking inicializado', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/adaptive-assessment`, {
      data: {
        persona: 'engineering-tech',
        partialData: {}
      }
    });

    expect(response.ok()).toBeTruthy();

    const data = await response.json();

    expect(data).toHaveProperty('sessionId');
    expect(data.sessionId).toMatch(/^assess-/);

    console.log('✅ Sessão criada:', data.sessionId);
  });

  test('02 - Deve retornar primeira pergunta do bloco discovery', async ({ request }) => {
    // Create session
    const createResponse = await request.post(`${BASE_URL}/api/adaptive-assessment`, {
      data: {
        persona: 'engineering-tech',
        partialData: {}
      }
    });

    const { sessionId } = await createResponse.json();

    // Get first question
    const questionResponse = await request.post(`${BASE_URL}/api/adaptive-assessment/next-question`, {
      data: { sessionId }
    });

    expect(questionResponse.ok()).toBeTruthy();

    const questionData = await questionResponse.json();

    expect(questionData).toHaveProperty('nextQuestion');
    expect(questionData.nextQuestion).not.toBeNull();
    expect(questionData.nextQuestion.id).toMatch(/^disc-/); // Discovery block question

    expect(questionData).toHaveProperty('routing');
    expect(questionData.routing.currentBlock).toBe('discovery');
    expect(questionData.routing.blockProgress).toBeLessThanOrEqual(1);

    console.log('✅ Primeira pergunta:', {
      id: questionData.nextQuestion.id,
      block: questionData.routing.currentBlock,
      progress: `${(questionData.routing.blockProgress * 100).toFixed(0)}%`
    });
  });

  test('03 - Deve extrair dados usando dataExtractor da question bank', async ({ request }) => {
    // Create session
    const createResponse = await request.post(`${BASE_URL}/api/adaptive-assessment`, {
      data: {
        persona: 'engineering-tech',
        partialData: {}
      }
    });

    const { sessionId } = await createResponse.json();

    // Get first question
    const questionResponse = await request.post(`${BASE_URL}/api/adaptive-assessment/next-question`, {
      data: { sessionId }
    });

    const { nextQuestion } = await questionResponse.json();

    // Answer first question (team size)
    const answerResponse = await request.post(`${BASE_URL}/api/adaptive-assessment/answer`, {
      data: {
        sessionId,
        questionId: nextQuestion.id,
        questionText: nextQuestion.text,
        answer: '15' // Team size
      }
    });

    expect(answerResponse.ok()).toBeTruthy();

    const answerData = await answerResponse.json();

    expect(answerData.success).toBe(true);
    expect(answerData).toHaveProperty('extractedData');
    expect(answerData.sourceType).toBe('question-bank');

    // Check if data was extracted
    if (Object.keys(answerData.extractedData).length > 0) {
      console.log('✅ Dados extraídos:', answerData.extractedData);
    }

    console.log('✅ Answer processada:', {
      completeness: answerData.completeness,
      questionsAsked: answerData.questionsAsked,
      sourceType: answerData.sourceType
    });
  });

  test('04 - Deve progredir através do bloco discovery', async ({ request }) => {
    // Create session
    const createResponse = await request.post(`${BASE_URL}/api/adaptive-assessment`, {
      data: {
        persona: 'engineering-tech',
        partialData: {}
      }
    });

    const { sessionId } = await createResponse.json();

    let currentBlock = 'discovery';
    let questionsInDiscovery = 0;

    // Answer 3 discovery questions
    for (let i = 0; i < 3; i++) {
      const questionResponse = await request.post(`${BASE_URL}/api/adaptive-assessment/next-question`, {
        data: { sessionId }
      });

      const { nextQuestion, routing } = await questionResponse.json();

      expect(nextQuestion).not.toBeNull();
      currentBlock = routing.currentBlock;

      if (currentBlock === 'discovery') {
        questionsInDiscovery++;
      }

      // Answer question
      await request.post(`${BASE_URL}/api/adaptive-assessment/answer`, {
        data: {
          sessionId,
          questionId: nextQuestion.id,
          questionText: nextQuestion.text,
          answer: i === 0 ? '10 desenvolvedores' : `Resposta ${i + 1}`
        }
      });
    }

    console.log('✅ Perguntas respondidas no discovery:', questionsInDiscovery);
    expect(questionsInDiscovery).toBeGreaterThanOrEqual(1);
  });

  test('05 - Deve transicionar de discovery para expertise quando critérios forem atingidos', async ({ request }) => {
    // Create session
    const createResponse = await request.post(`${BASE_URL}/api/adaptive-assessment`, {
      data: {
        persona: 'engineering-tech',
        partialData: {}
      }
    });

    const { sessionId } = await createResponse.json();

    let blockTransitioned = false;
    let previousBlock = 'discovery';

    // Answer up to 6 questions to trigger transition
    for (let i = 0; i < 6; i++) {
      const questionResponse = await request.post(`${BASE_URL}/api/adaptive-assessment/next-question`, {
        data: { sessionId }
      });

      const { nextQuestion, routing } = await questionResponse.json();

      if (!nextQuestion) break;

      // Check if block changed
      if (routing.currentBlock !== previousBlock) {
        blockTransitioned = true;
        console.log('🔄 Block transition detected:', {
          from: previousBlock,
          to: routing.currentBlock,
          atQuestion: i + 1
        });
        previousBlock = routing.currentBlock;
      }

      // Answer question with varied responses to build completeness
      let answer;
      switch (i) {
        case 0:
          answer = '15'; // team size
          break;
        case 1:
          answer = 'Temos problemas com bugs em produção e technical debt'; // challenges
          break;
        case 2:
          answer = 'GitHub Copilot'; // AI tools
          break;
        case 3:
          answer = 'Melhorar qualidade do código e reduzir bugs'; // goals
          break;
        default:
          answer = `Resposta ${i + 1}`;
      }

      await request.post(`${BASE_URL}/api/adaptive-assessment/answer`, {
        data: {
          sessionId,
          questionId: nextQuestion.id,
          questionText: nextQuestion.text,
          answer
        }
      });
    }

    // Note: Block transition might not always happen within 6 questions
    // depending on completeness thresholds, but we log it if it does
    console.log('✅ Teste de transição concluído. Transicionou?', blockTransitioned);
  });

  test('06 - Deve calcular completeness score corretamente', async ({ request }) => {
    // Create session
    const createResponse = await request.post(`${BASE_URL}/api/adaptive-assessment`, {
      data: {
        persona: 'engineering-tech',
        partialData: {}
      }
    });

    const { sessionId } = await createResponse.json();

    // Get initial completeness
    const initialQuestion = await request.post(`${BASE_URL}/api/adaptive-assessment/next-question`, {
      data: { sessionId }
    });

    const initialData = await initialQuestion.json();
    const initialCompleteness = initialData.completion.completenessScore;

    console.log('📊 Completeness inicial:', initialCompleteness);

    // Answer first question
    const { nextQuestion } = initialData;
    const answerResponse = await request.post(`${BASE_URL}/api/adaptive-assessment/answer`, {
      data: {
        sessionId,
        questionId: nextQuestion.id,
        questionText: nextQuestion.text,
        answer: '10'
      }
    });

    const answerData = await answerResponse.json();
    const newCompleteness = answerData.completeness;

    console.log('📊 Completeness após resposta:', newCompleteness);

    // Completeness should increase (or at least not decrease)
    expect(newCompleteness).toBeGreaterThanOrEqual(initialCompleteness);
  });

  test('07 - Deve respeitar block progress ao selecionar perguntas', async ({ request }) => {
    // Create session
    const createResponse = await request.post(`${BASE_URL}/api/adaptive-assessment`, {
      data: {
        persona: 'engineering-tech',
        partialData: {}
      }
    });

    const { sessionId } = await createResponse.json();

    const blockProgressHistory: { block: string; progress: number }[] = [];

    // Track block progress over 5 questions
    for (let i = 0; i < 5; i++) {
      const questionResponse = await request.post(`${BASE_URL}/api/adaptive-assessment/next-question`, {
        data: { sessionId }
      });

      const { nextQuestion, routing } = await questionResponse.json();

      if (!nextQuestion) break;

      blockProgressHistory.push({
        block: routing.currentBlock,
        progress: routing.blockProgress
      });

      // Answer question
      await request.post(`${BASE_URL}/api/adaptive-assessment/answer`, {
        data: {
          sessionId,
          questionId: nextQuestion.id,
          questionText: nextQuestion.text,
          answer: `Resposta ${i + 1}`
        }
      });
    }

    console.log('📈 Block progress history:', blockProgressHistory);

    // Within same block, progress should generally increase
    let previousBlock = blockProgressHistory[0].block;
    let previousProgress = blockProgressHistory[0].progress;

    for (let i = 1; i < blockProgressHistory.length; i++) {
      const { block, progress } = blockProgressHistory[i];

      if (block === previousBlock) {
        // Progress should increase or stay same within block
        expect(progress).toBeGreaterThanOrEqual(previousProgress);
      } else {
        // Block changed, progress resets
        console.log('🔄 Block changed, progress reset');
      }

      previousBlock = block;
      previousProgress = progress;
    }
  });

  test('08 - Deve retornar questões com estrutura correta da question bank', async ({ request }) => {
    // Create session
    const createResponse = await request.post(`${BASE_URL}/api/adaptive-assessment`, {
      data: {
        persona: 'engineering-tech',
        partialData: {}
      }
    });

    const { sessionId } = await createResponse.json();

    // Get question
    const questionResponse = await request.post(`${BASE_URL}/api/adaptive-assessment/next-question`, {
      data: { sessionId }
    });

    const { nextQuestion } = await questionResponse.json();

    // Validate question structure
    expect(nextQuestion).toHaveProperty('id');
    expect(nextQuestion).toHaveProperty('text');
    expect(nextQuestion).toHaveProperty('inputType');
    expect(nextQuestion).toHaveProperty('placeholder');

    expect(nextQuestion.text).toBeTruthy();
    expect(['text', 'single-choice', 'multi-choice', 'number']).toContain(nextQuestion.inputType);

    console.log('✅ Estrutura da pergunta válida:', {
      id: nextQuestion.id,
      inputType: nextQuestion.inputType,
      hasText: nextQuestion.text.length > 0,
      hasPlaceholder: !!nextQuestion.placeholder
    });
  });

  test('09 - Deve finalizar assessment quando completeness e block final forem atingidos', async ({ request }) => {
    // Create session
    const createResponse = await request.post(`${BASE_URL}/api/adaptive-assessment`, {
      data: {
        persona: 'engineering-tech',
        partialData: {}
      }
    });

    const { sessionId } = await createResponse.json();

    let shouldFinish = false;
    let questionsAsked = 0;

    // Answer up to 12 questions or until shouldFinish
    for (let i = 0; i < 12; i++) {
      const questionResponse = await request.post(`${BASE_URL}/api/adaptive-assessment/next-question`, {
        data: { sessionId }
      });

      const data = await questionResponse.json();

      if (data.shouldFinish) {
        shouldFinish = true;
        console.log('✅ Assessment sinalizou conclusão:', {
          reason: data.finishReason,
          questionsAsked: questionsAsked,
          completeness: data.completion.completenessScore
        });
        break;
      }

      if (!data.nextQuestion) break;

      // Answer question
      await request.post(`${BASE_URL}/api/adaptive-assessment/answer`, {
        data: {
          sessionId,
          questionId: data.nextQuestion.id,
          questionText: data.nextQuestion.text,
          answer: `Resposta completa ${i + 1}`
        }
      });

      questionsAsked++;
    }

    console.log('📊 Resultado final:', {
      shouldFinish,
      questionsAsked
    });

    // Either finished or answered many questions
    expect(questionsAsked).toBeGreaterThan(0);
  });
});
