import { Page, Route } from '@playwright/test';
import { UserPersona } from '@/lib/types';

/**
 * Mock responses for Consultant Follow-up API (/api/consultant-followup)
 * Simulates weak signal detection and context-aware follow-up generation
 */

export type WeakSignalType =
  | 'vague'
  | 'contradiction'
  | 'hesitation'
  | 'missing-metrics'
  | 'emotional'
  | 'none';

export type FollowUpType =
  | 'quantify-impact'
  | 'dig-deeper-root-cause'
  | 'challenge-assumption'
  | 'explore-constraint'
  | 'validate-commitment';

interface MockFollowUpResponse {
  shouldAskFollowUp: boolean;
  analysis: {
    weakSignals: {
      type: WeakSignalType;
      confidence: number;
      evidence: string;
    }[];
    extractedMetrics: Record<string, any>;
    urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
    hasDecisionAuthority: boolean;
  };
  followUpQuestion?: string;
  followUpType?: FollowUpType;
  reasoning?: string;
  cost: number;
}

// Mock scenarios for different response types
const mockScenarios: Record<WeakSignalType, MockFollowUpResponse> = {
  vague: {
    shouldAskFollowUp: true,
    analysis: {
      weakSignals: [
        {
          type: 'vague',
          confidence: 0.85,
          evidence: 'Resposta sem especificidade: "alguns problemas", "não sei bem"',
        },
      ],
      extractedMetrics: {},
      urgencyLevel: 'medium',
      hasDecisionAuthority: true,
    },
    followUpQuestion:
      'Você mencionou alguns problemas de produtividade. Consegue quantificar isso? Por exemplo, quantas horas por semana o time perde com retrabalho ou processos ineficientes?',
    followUpType: 'quantify-impact',
    reasoning: 'Resposta vaga detectada - preciso de métricas específicas',
    cost: 0.30,
  },
  contradiction: {
    shouldAskFollowUp: true,
    analysis: {
      weakSignals: [
        {
          type: 'contradiction',
          confidence: 0.92,
          evidence: 'Contradição detectada: "somos ágeis" mas "leva 3 meses para deploy"',
        },
      ],
      extractedMetrics: {
        deployTime: '3 meses',
      },
      urgencyLevel: 'high',
      hasDecisionAuthority: true,
    },
    followUpQuestion:
      'Você mencionou que a equipe é ágil, mas também que leva 3 meses para fazer deploy. O que está causando essa diferença entre a metodologia e a velocidade real?',
    followUpType: 'dig-deeper-root-cause',
    reasoning: 'Contradição detectada - explorar causa raiz',
    cost: 0.30,
  },
  hesitation: {
    shouldAskFollowUp: true,
    analysis: {
      weakSignals: [
        {
          type: 'hesitation',
          confidence: 0.78,
          evidence: 'Hesitação detectada: "talvez", "acho que", "não tenho certeza"',
        },
      ],
      extractedMetrics: {},
      urgencyLevel: 'medium',
      hasDecisionAuthority: false,
    },
    followUpQuestion:
      'Percebi alguma incerteza na sua resposta. Isso é algo que você tem autonomia para decidir, ou precisaria do aval de outras pessoas (CEO, board)?',
    followUpType: 'validate-commitment',
    reasoning: 'Hesitação detectada - validar autoridade de decisão',
    cost: 0.30,
  },
  'missing-metrics': {
    shouldAskFollowUp: true,
    analysis: {
      weakSignals: [
        {
          type: 'missing-metrics',
          confidence: 0.88,
          evidence: 'Nenhuma métrica quantitativa mencionada',
        },
      ],
      extractedMetrics: {},
      urgencyLevel: 'low',
      hasDecisionAuthority: true,
    },
    followUpQuestion:
      'Você mencionou que a produtividade está baixa. Consegue estimar o impacto financeiro disso? Por exemplo, quantos reais por mês a empresa perde com isso?',
    followUpType: 'quantify-impact',
    reasoning: 'Falta de métricas - precisamos quantificar',
    cost: 0.30,
  },
  emotional: {
    shouldAskFollowUp: true,
    analysis: {
      weakSignals: [
        {
          type: 'emotional',
          confidence: 0.95,
          evidence: 'Linguagem emocional detectada: "frustrado", "desesperado", "crítico"',
        },
      ],
      extractedMetrics: {},
      urgencyLevel: 'critical',
      hasDecisionAuthority: true,
    },
    followUpQuestion:
      'Você mencionou que a situação está crítica. Qual é o risco real se nada for feito nos próximos 3-6 meses? Perda de clientes, saída de talentos, ou algo mais?',
    followUpType: 'dig-deeper-root-cause',
    reasoning: 'Alta urgência emocional detectada - explorar consequências',
    cost: 0.30,
  },
  none: {
    shouldAskFollowUp: false,
    analysis: {
      weakSignals: [],
      extractedMetrics: {
        teamSize: 15,
        cycleTime: '2 semanas',
        budget: 'R$ 500k',
      },
      urgencyLevel: 'low',
      hasDecisionAuthority: true,
    },
    cost: 0.05,
  },
};

/**
 * Setup Follow-up API mock for Playwright tests
 */
export async function setupFollowUpMock(page: Page, scenario: WeakSignalType = 'none') {
  let followUpCount = 0;
  const maxFollowUps = 3;

  await page.route('**/api/consultant-followup', async (route: Route) => {
    const request = route.request();

    // Handle GET (health check)
    if (request.method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'ok',
          service: 'Consultant Follow-up API',
          version: '1.0.0',
          features: [
            'Response analysis (weak signals, insights)',
            'Context-aware follow-up generation',
            'Budget control (max 3 follow-ups)',
          ],
        }),
      });
      return;
    }

    // Handle POST
    const body = request.postDataJSON();
    const { maxFollowUps: requestMaxFollowUps = 3 } = body;

    // Budget control: block if exceeded max follow-ups
    if (followUpCount >= requestMaxFollowUps) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          shouldAskFollowUp: false,
          analysis: {
            weakSignals: [],
            extractedMetrics: {},
            urgencyLevel: 'low',
            hasDecisionAuthority: true,
          },
          reasoning: `Max follow-ups (${requestMaxFollowUps}) reached`,
          cost: 0.0,
        }),
      });
      return;
    }

    // Get mock response for scenario
    const mockResponse = mockScenarios[scenario];

    // Increment follow-up count if we're asking a follow-up
    if (mockResponse.shouldAskFollowUp) {
      followUpCount++;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockResponse),
    });
  });

  return {
    getFollowUpCount: () => followUpCount,
    resetCount: () => {
      followUpCount = 0;
    },
  };
}

/**
 * Setup mock that returns error (for testing error handling)
 */
export async function setupFollowUpMockError(page: Page, errorType: 'network' | 'invalid-json' | 'api-error') {
  await page.route('**/api/consultant-followup', async (route: Route) => {
    const request = route.request();

    if (request.method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'ok' }),
      });
      return;
    }

    if (errorType === 'network') {
      await route.abort('failed');
    } else if (errorType === 'invalid-json') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: 'invalid json {',
      });
    } else if (errorType === 'api-error') {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Internal server error',
          message: 'Claude API failed',
        }),
      });
    }
  });
}

/**
 * Helper to detect weak signals in response text (for testing)
 */
export function detectWeakSignals(responseText: string): WeakSignalType[] {
  const signals: WeakSignalType[] = [];

  // Vague
  if (/não sei|mais ou menos|uns|alguns|meio que/i.test(responseText)) {
    signals.push('vague');
  }

  // Hesitation
  if (/talvez|acho que|não tenho certeza|pode ser/i.test(responseText)) {
    signals.push('hesitation');
  }

  // Emotional
  if (/frustrado|desesperado|crítico|urgente|caos/i.test(responseText)) {
    signals.push('emotional');
  }

  // Missing metrics
  if (!/\d+|R\$|%/i.test(responseText)) {
    signals.push('missing-metrics');
  }

  if (signals.length === 0) {
    signals.push('none');
  }

  return signals;
}
