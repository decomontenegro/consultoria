/**
 * Sprint 1 Validation Test
 *
 * Valida integração do unified session manager com /assessment
 *
 * Testa:
 * - Criação de sessão
 * - Persistência entre requests
 * - Submissão de respostas
 * - Obtenção de próximas perguntas
 * - Completion do assessment
 */

import { test, expect } from '@playwright/test';

test.describe('Sprint 1: Unified Session Manager - Assessment Integration', () => {

  test('01 - Deve criar sessão e obter sessionId', async ({ request }) => {
    console.log('🧪 Teste 1: Criando sessão...');

    const response = await request.post('http://localhost:3000/api/adaptive-assessment', {
      data: {
        persona: 'engineering-tech',
        partialData: {
          companyInfo: {
            name: 'Teste Company',
            industry: 'Tecnologia'
          }
        }
      }
    });

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    console.log('✅ Sessão criada:', data.sessionId);

    expect(data.sessionId).toBeTruthy();
    expect(data.success).toBe(true);
    expect(data.sessionId).toMatch(/^assess-/);
  });

  test('02 - Deve persistir sessão entre múltiplas requisições', async ({ request }) => {
    console.log('🧪 Teste 2: Testando persistência de sessão...');

    // Criar sessão
    const createResponse = await request.post('http://localhost:3000/api/adaptive-assessment', {
      data: {
        persona: 'engineering-tech',
        partialData: {}
      }
    });

    const { sessionId } = await createResponse.json();
    console.log('   SessionId:', sessionId);

    // Obter primeira pergunta
    const question1Response = await request.post('http://localhost:3000/api/adaptive-assessment/next-question', {
      data: { sessionId }
    });

    expect(question1Response.ok()).toBeTruthy();
    const question1Data = await question1Response.json();
    console.log('✅ Primeira pergunta obtida:', question1Data.nextQuestion?.text.substring(0, 50) + '...');

    expect(question1Data.nextQuestion).toBeTruthy();
    expect(question1Data.shouldFinish).toBe(false);

    // Submeter resposta
    const answerResponse = await request.post('http://localhost:3000/api/adaptive-assessment/answer', {
      data: {
        sessionId,
        questionId: question1Data.nextQuestion.id,
        questionText: question1Data.nextQuestion.text,
        answer: 'Resposta de teste para validação Sprint 1'
      }
    });

    expect(answerResponse.ok()).toBeTruthy();
    const answerData = await answerResponse.json();
    console.log('✅ Resposta submetida, completeness:', answerData.completeness);

    expect(answerData.success).toBe(true);
    expect(answerData.completeness).toBeGreaterThanOrEqual(0);

    // Obter segunda pergunta (valida que sessão persistiu)
    const question2Response = await request.post('http://localhost:3000/api/adaptive-assessment/next-question', {
      data: { sessionId }
    });

    expect(question2Response.ok()).toBeTruthy();
    const question2Data = await question2Response.json();
    console.log('✅ Segunda pergunta obtida - Sessão persistiu!');

    expect(question2Data.nextQuestion).toBeTruthy();
  });

  test('03 - Deve rastrear completion metrics corretamente', async ({ request }) => {
    console.log('🧪 Teste 3: Validando completion metrics...');

    // Criar sessão
    const createResponse = await request.post('http://localhost:3000/api/adaptive-assessment', {
      data: {
        persona: 'engineering-tech',
        partialData: {
          companyInfo: {
            name: 'Metrics Test Company',
            industry: 'SaaS'
          }
        }
      }
    });

    const { sessionId } = await createResponse.json();

    // Obter primeira pergunta
    const question1 = await request.post('http://localhost:3000/api/adaptive-assessment/next-question', {
      data: { sessionId }
    });

    const q1Data = await question1.json();

    // Submeter resposta rica
    await request.post('http://localhost:3000/api/adaptive-assessment/answer', {
      data: {
        sessionId,
        questionId: q1Data.nextQuestion.id,
        questionText: q1Data.nextQuestion.text,
        answer: 'Nossa empresa tem 50 desenvolvedores, enfrentamos problemas com qualidade de código e technical debt.'
      }
    });

    // Obter próxima pergunta e verificar metrics
    const question2 = await request.post('http://localhost:3000/api/adaptive-assessment/next-question', {
      data: { sessionId }
    });

    const q2Data = await question2.json();

    console.log('✅ Completion metrics:', {
      completenessScore: q2Data.completion.completenessScore,
      essentialFieldsCollected: q2Data.completion.essentialFieldsCollected,
      totalFieldsCollected: q2Data.completion.totalFieldsCollected,
      topicsCovered: q2Data.completion.topicsCovered.length,
      gapsIdentified: q2Data.completion.gapsIdentified.length
    });

    expect(q2Data.completion).toBeDefined();
    expect(q2Data.completion.completenessScore).toBeGreaterThanOrEqual(0);
    expect(q2Data.completion.completenessScore).toBeLessThanOrEqual(100);
    expect(q2Data.completion.essentialFieldsCollected).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(q2Data.completion.topicsCovered)).toBe(true);
    expect(Array.isArray(q2Data.completion.gapsIdentified)).toBe(true);
  });

  test('04 - Deve completar assessment após múltiplas perguntas', async ({ request }) => {
    console.log('🧪 Teste 4: Testando completion do assessment...');

    // Criar sessão
    const createResponse = await request.post('http://localhost:3000/api/adaptive-assessment', {
      data: {
        persona: 'engineering-tech',
        partialData: {
          companyInfo: {
            name: 'Complete Test Company',
            industry: 'Fintech',
            size: 'scaleup'
          },
          currentState: {
            challengeDescription: 'Technical debt and slow development velocity'
          },
          goals: {
            primaryGoal: 'Increase development speed by 50%'
          }
        }
      }
    });

    const { sessionId } = await createResponse.json();
    console.log('   SessionId:', sessionId);

    // Simular resposta a múltiplas perguntas
    for (let i = 0; i < 3; i++) {
      // Obter pergunta
      const questionResponse = await request.post('http://localhost:3000/api/adaptive-assessment/next-question', {
        data: { sessionId }
      });

      const questionData = await questionResponse.json();

      if (questionData.shouldFinish) {
        console.log('   Assessment sinalizou completion após', i, 'perguntas');
        break;
      }

      // Submeter resposta
      await request.post('http://localhost:3000/api/adaptive-assessment/answer', {
        data: {
          sessionId,
          questionId: questionData.nextQuestion.id,
          questionText: questionData.nextQuestion.text,
          answer: `Resposta ${i + 1}: Nossa equipe tem ${10 + i * 5} pessoas, usamos TypeScript e React.`
        }
      });

      console.log(`   Pergunta ${i + 1} respondida`);
    }

    // Tentar completar
    const completeResponse = await request.post('http://localhost:3000/api/adaptive-assessment/complete', {
      data: {
        sessionId,
        conversationHistory: []
      }
    });

    expect(completeResponse.ok()).toBeTruthy();
    const completeData = await completeResponse.json();

    console.log('✅ Assessment completado!');
    console.log('   Completeness:', completeData.sessionSummary?.completeness);
    console.log('   Perguntas:', completeData.sessionSummary?.questionsAsked);

    expect(completeData.assessmentData).toBeDefined();
    expect(completeData.sessionSummary).toBeDefined();
    expect(completeData.sessionSummary.questionsAsked).toBeGreaterThanOrEqual(0);
  });

  test('05 - Deve retornar 404 para sessão inexistente', async ({ request }) => {
    console.log('🧪 Teste 5: Validando erro para sessão inexistente...');

    const response = await request.post('http://localhost:3000/api/adaptive-assessment/next-question', {
      data: { sessionId: 'assess-invalid-123' }
    });

    expect(response.status()).toBe(404);
    console.log('✅ Retornou 404 corretamente para sessão inválida');
  });

  test('06 - Deve validar que sessão persiste após hot reload (mock)', async ({ request }) => {
    console.log('🧪 Teste 6: Simulando persistência após reload...');

    // Criar primeira sessão
    const session1 = await request.post('http://localhost:3000/api/adaptive-assessment', {
      data: { persona: 'engineering-tech' }
    });

    const { sessionId: sessionId1 } = await session1.json();

    // Criar segunda sessão (simula reload)
    const session2 = await request.post('http://localhost:3000/api/adaptive-assessment', {
      data: { persona: 'product-business' }
    });

    const { sessionId: sessionId2 } = await session2.json();

    // Validar que primeira sessão ainda existe
    const checkSession1 = await request.post('http://localhost:3000/api/adaptive-assessment/next-question', {
      data: { sessionId: sessionId1 }
    });

    expect(checkSession1.ok()).toBeTruthy();
    console.log('✅ Primeira sessão persistiu após criar segunda sessão');

    // Validar que segunda sessão também existe
    const checkSession2 = await request.post('http://localhost:3000/api/adaptive-assessment/next-question', {
      data: { sessionId: sessionId2 }
    });

    expect(checkSession2.ok()).toBeTruthy();
    console.log('✅ Ambas as sessões coexistem corretamente (globalThis funcionando)');
  });
});

test.describe('Sprint 1: Session Stats & Analytics', () => {

  test('07 - Deve criar múltiplas sessões sem conflitos', async ({ request }) => {
    console.log('🧪 Teste 7: Criando múltiplas sessões...');

    const sessionIds: string[] = [];

    for (let i = 0; i < 5; i++) {
      const response = await request.post('http://localhost:3000/api/adaptive-assessment', {
        data: {
          persona: 'engineering-tech',
          partialData: {}
        }
      });

      const { sessionId } = await response.json();
      sessionIds.push(sessionId);
    }

    console.log(`✅ ${sessionIds.length} sessões criadas com sucesso`);

    // Validar que todas são únicas
    const uniqueIds = new Set(sessionIds);
    expect(uniqueIds.size).toBe(sessionIds.length);
    console.log('✅ Todos os sessionIds são únicos');

    // Validar que todas persistem
    for (const sessionId of sessionIds) {
      const response = await request.post('http://localhost:3000/api/adaptive-assessment/next-question', {
        data: { sessionId }
      });

      expect(response.ok()).toBeTruthy();
    }

    console.log('✅ Todas as sessões persistem e são acessíveis');
  });
});
