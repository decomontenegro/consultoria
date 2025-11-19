import { Page, Route } from '@playwright/test';

/**
 * Mock responses for Insights Generation API (/api/insights/generate)
 * Simulates deep insights from PhD consultant
 */

export type InsightsScenarioType = 'high-value' | 'low-value' | 'critical-urgency' | 'high-pain';

interface MockInsightsResponse {
  generated: boolean;
  insights: any | null;
  cost: number;
  reason?: string;
}

// Mock deep insights for high-value leads
const mockHighValueInsights = {
  patterns: [
    {
      type: 'velocity-crisis',
      severity: 'high',
      description:
        'Ciclo de desenvolvimento lento (14 dias) combinado com deploy semanal indica gargalos críticos no processo',
      evidence: [
        'Cycle time de 14 dias está 2x acima do benchmark (7 dias)',
        'Deploy frequency semanal limita capacidade de resposta',
        'Time reporta frustração com processos lentos',
      ],
    },
    {
      type: 'quality-crisis',
      severity: 'medium',
      description: 'Taxa de bugs elevada está causando retrabalho e impactando confiança do cliente',
      evidence: [
        'Bugs em produção mencionados como pain point',
        'Clientes reclamando de qualidade',
        'Time passando tempo em firefighting',
      ],
    },
  ],
  rootCauses: {
    primary: 'Falta de automação no pipeline de desenvolvimento e deploy',
    secondary: [
      'Processos de code review lentos (sem revisão automatizada)',
      'Ausência de CI/CD robusto causando deploys manuais',
      'Débito técnico acumulado dificultando mudanças',
    ],
    reasoning:
      'Analisando os pain points reportados, o problema central não é falta de pessoas, mas sim processos manuais que criam gargalos. A equipe tem 15 pessoas mas está presa em tarefas que poderiam ser automatizadas.',
  },
  financialImpact: {
    directCostMonthly: 140000,
    opportunityCostAnnual: 800000,
    totalAnnualImpact: 2480000,
    confidence: 0.75,
    breakdown:
      'Custo direto: 15 devs × 25h/semana firefighting × R$15k/mês ÷ 160h = R$140k/mês. Custo de oportunidade: Estimamos 2 features/mês não entregues × R$400k ARR/feature × 12 meses = R$800k/ano perdidos. Total anual: (R$140k × 12) + R$800k = R$2.48M',
  },
  urgencyAnalysis: {
    timelinePressure: 'Board cobrando resultados em 3 meses (Q1)',
    budgetAdequacy: 'adequate',
    roi: 4.96,
    recommendation:
      'Budget de R$500k é adequado para problema de R$2.48M/ano. ROI de 4.96x em 1 ano. Recomendação: Investir em automação (CI/CD, AI pair programming) antes de contratar mais pessoas.',
  },
  recommendations: [
    {
      priority: 1,
      action:
        'Implementar CI/CD completo com GitHub Actions e automação de testes (reduzir deploy de dias para horas)',
      reasoning:
        'Maior gargalo identificado. Deploy manual está bloqueando velocidade. Automação desbloqueia todo o pipeline.',
      impact: 'high',
      estimatedCost: 'R$80k-120k',
      timeframe: '1-2 meses',
    },
    {
      priority: 2,
      action: 'Adotar AI pair programming (GitHub Copilot ou similar) para os 10 devs pleno/junior',
      reasoning:
        '67% do time é pleno/junior. AI pode acelerar produtividade em 30% e melhorar qualidade de código.',
      impact: 'high',
      estimatedCost: 'R$30k/ano',
      timeframe: '2 semanas (quick win)',
    },
    {
      priority: 3,
      action: 'Contratar 1 senior especialista em DevOps/Platform Engineering (não mais devs júnior)',
      reasoning:
        'Time precisa de expertise técnica senior para arquitetar automação. Contratar mais júniors pioraria o problema.',
      impact: 'medium',
      estimatedCost: 'R$25k/mês',
      timeframe: '3 meses (hiring + onboarding)',
    },
  ],
  redFlags: [
    {
      flag: 'Risco de burnout e saída de talentos seniors',
      severity: 'critical',
      reasoning:
        'Seniors estão frustrados com processos lentos e fazendo trabalho operacional. Risco de turnover alto.',
      consequence:
        'Se perder 1-2 seniors, conhecimento crítico vai embora e situação piora drasticamente. Custo de substituição: R$150k+ por pessoa.',
    },
    {
      flag: 'Timeline de 3 meses pode ser agressiva demais para mudança cultural',
      severity: 'warning',
      reasoning:
        'Implementar CI/CD e mudar processos exige mudança cultural. 3 meses é possível mas requer buy-in total.',
      consequence:
        'Se implementação falhar por resistência, investimento é perdido e moral do time cai ainda mais.',
    },
  ],
  executiveSummary:
    'Sua empresa está em uma crise de velocidade: ciclo de 14 dias e bugs frequentes estão custando R$2.48M/ano em produtividade perdida e oportunidades. A causa raiz não é falta de pessoas, mas sim processos manuais. Investir R$500k em automação (CI/CD + AI pair programming) pode gerar ROI de 4.96x em 1 ano. Ação urgente: implementar CI/CD em 1-2 meses antes que seniors saiam da empresa.',
};

// Mock insights scenarios
const mockScenarios: Record<InsightsScenarioType, MockInsightsResponse> = {
  'high-value': {
    generated: true,
    insights: mockHighValueInsights,
    cost: 0.6,
    reason: 'High-value lead: insights generated',
  },
  'critical-urgency': {
    generated: true,
    insights: {
      ...mockHighValueInsights,
      urgencyAnalysis: {
        ...mockHighValueInsights.urgencyAnalysis,
        timelinePressure: 'Timeline crítica de 3 meses - board exigindo resultados urgentes',
      },
    },
    cost: 0.6,
    reason: 'Critical urgency (3 months): insights generated',
  },
  'high-pain': {
    generated: true,
    insights: {
      ...mockHighValueInsights,
      patterns: [
        ...mockHighValueInsights.patterns,
        {
          type: 'people-crisis',
          severity: 'high',
          description: 'Múltiplos pain points indicam problemas sistêmicos em várias áreas',
          evidence: ['3+ pain points mencionados', 'Problemas em dev, deploy, e qualidade', 'Frustração generalizada'],
        },
      ],
    },
    cost: 0.6,
    reason: 'High pain (3+ pain points): insights generated',
  },
  'low-value': {
    generated: false,
    insights: null,
    cost: 0.0,
    reason: 'Skipped: Low budget or low urgency (budget-aware optimization)',
  },
};

/**
 * Setup Insights API mock for Playwright tests
 */
export async function setupInsightsMock(page: Page, scenario: InsightsScenarioType = 'high-value') {
  await page.route('**/api/insights/generate', async (route: Route) => {
    const request = route.request();

    // Handle GET (health check)
    if (request.method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'ok',
          service: 'Insights Generation API',
          version: '1.0.0',
          features: [
            'Deep pattern detection (tech debt spiral, velocity crisis, etc.)',
            'Root cause analysis',
            'Financial impact calculation',
            'Strategic recommendations',
            'Red flag detection',
            'Budget-aware generation (R$ 0.60 per analysis)',
          ],
          conditions: ['High budget (R$ 200k+)', 'Critical urgency (3 months timeline)', 'High pain (3+ pain points)'],
        }),
      });
      return;
    }

    // Handle POST
    const body = request.postDataJSON();
    const { forceGenerate = false } = body;

    // If forceGenerate is true, always return high-value insights
    const effectiveScenario = forceGenerate ? 'high-value' : scenario;
    const mockResponse = mockScenarios[effectiveScenario];

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockResponse),
    });
  });
}

/**
 * Setup mock that returns error (for testing error handling)
 */
export async function setupInsightsMockError(page: Page, errorType: 'network' | 'invalid-json' | 'api-error') {
  await page.route('**/api/insights/generate', async (route: Route) => {
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
          message: 'Claude API failed to generate insights',
        }),
      });
    }
  });
}

/**
 * Helper to simulate budget-aware conditional logic (for testing)
 */
export function shouldGenerateInsights(assessmentData: {
  budget?: string;
  timeline?: string;
  painPointsCount?: number;
}): boolean {
  const { budget = '', timeline = '', painPointsCount = 0 } = assessmentData;

  // High budget
  const hasHighBudget =
    budget.includes('200k') ||
    budget.includes('500k') ||
    budget.includes('1M') ||
    budget.includes('2M') ||
    budget.includes('5M');

  // Critical urgency
  const isCritical = timeline.includes('3-months') || timeline.includes('3 meses') || timeline.includes('urgent');

  // High pain
  const hasHighPain = painPointsCount >= 3;

  return hasHighBudget || isCritical || hasHighPain;
}
