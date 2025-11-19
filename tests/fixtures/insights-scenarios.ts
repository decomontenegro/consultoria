import { AssessmentData, UserPersona } from '@/lib/types';

/**
 * Test scenarios for Insights Engine (FASE 3)
 * Tests budget-aware generation, pattern detection, and financial impact calculation
 */

export type InsightsScenarioType =
  | 'high-budget'
  | 'critical-urgency'
  | 'high-pain'
  | 'low-value'
  | 'medium-value'
  | 'force-generate';

export interface InsightsScenario {
  testId: string;
  scenarioType: InsightsScenarioType;
  assessmentData: Partial<AssessmentData>;
  expectedBehavior: {
    shouldGenerate: boolean;
    cost: number;
    hasHighBudget?: boolean;
    isCritical?: boolean;
    hasHighPain?: boolean;
    expectedPatterns?: string[];
    expectedRecommendations?: number; // Number of recommendations expected
    expectedRedFlags?: number; // Number of red flags expected
  };
}

// Scenario templates
export const insightsScenarios: Record<InsightsScenarioType, InsightsScenario> = {
  'high-budget': {
    testId: 'insights-01-high-budget',
    scenarioType: 'high-budget',
    assessmentData: {
      persona: 'engineering-tech',
      companyInfo: {
        name: 'TechCorp',
        industry: 'SaaS',
        size: 'scaleup',
        revenue: 'R$10M-50M',
        country: 'Brasil',
      },
      currentState: {
        devTeamSize: 30,
        devSeniority: { junior: 10, mid: 12, senior: 6, lead: 2 },
        currentTools: ['GitHub', 'Jira'],
        deploymentFrequency: 'weekly',
        avgCycleTime: 14,
        bugRate: 8,
        aiToolsUsage: 'none',
        painPoints: ['Desenvolvimento lento', 'Bugs em produção'],
      },
      goals: {
        primaryGoals: ['Aumentar velocidade'],
        timeline: '6-months',
        budgetRange: 'R$500k-1M', // HIGH BUDGET
        successMetrics: ['Cycle time', 'Deploy frequency'],
      },
      contactInfo: {
        fullName: 'João Silva',
        title: 'CTO',
        email: 'joao@techcorp.com',
        company: 'TechCorp',
        agreeToContact: true,
      },
      submittedAt: new Date(),
    },
    expectedBehavior: {
      shouldGenerate: true,
      cost: 0.6,
      hasHighBudget: true,
      isCritical: false,
      hasHighPain: false,
      expectedPatterns: ['velocity-crisis', 'quality-crisis'],
      expectedRecommendations: 3,
      expectedRedFlags: 1,
    },
  },

  'critical-urgency': {
    testId: 'insights-02-critical-urgency',
    scenarioType: 'critical-urgency',
    assessmentData: {
      persona: 'board-executive',
      companyInfo: {
        name: 'UrgentCo',
        industry: 'Fintech',
        size: 'scaleup',
        revenue: 'R$5M-10M',
        country: 'Brasil',
      },
      currentState: {
        devTeamSize: 20,
        devSeniority: { junior: 8, mid: 8, senior: 3, lead: 1 },
        currentTools: ['GitHub'],
        deploymentFrequency: 'monthly',
        avgCycleTime: 30,
        bugRate: 15,
        aiToolsUsage: 'none',
        painPoints: ['Lentidão crítica', 'Board cobrando'],
      },
      goals: {
        primaryGoals: ['Resolver urgente'],
        timeline: '3-months', // CRITICAL URGENCY
        budgetRange: 'R$100k-200k',
        successMetrics: ['Velocidade'],
      },
      contactInfo: {
        fullName: 'Maria Santos',
        title: 'CEO',
        email: 'maria@urgentco.com',
        company: 'UrgentCo',
        agreeToContact: true,
      },
      submittedAt: new Date(),
    },
    expectedBehavior: {
      shouldGenerate: true,
      cost: 0.6,
      hasHighBudget: false,
      isCritical: true,
      hasHighPain: false,
      expectedPatterns: ['velocity-crisis', 'market-pressure'],
      expectedRecommendations: 3,
      expectedRedFlags: 2,
    },
  },

  'high-pain': {
    testId: 'insights-03-high-pain',
    scenarioType: 'high-pain',
    assessmentData: {
      persona: 'engineering-tech',
      companyInfo: {
        name: 'PainCo',
        industry: 'E-commerce',
        size: 'scaleup',
        revenue: 'R$10M-50M',
        country: 'Brasil',
      },
      currentState: {
        devTeamSize: 25,
        devSeniority: { junior: 12, mid: 10, senior: 2, lead: 1 },
        currentTools: ['GitHub', 'Jenkins'],
        deploymentFrequency: 'bi-weekly',
        avgCycleTime: 21,
        bugRate: 12,
        aiToolsUsage: 'exploring',
        painPoints: [
          'Desenvolvimento lento',
          'Bugs frequentes',
          'Equipe frustrada',
          'Débito técnico alto',
        ], // 4 PAIN POINTS (>= 3)
      },
      goals: {
        primaryGoals: ['Melhorar qualidade', 'Aumentar velocidade'],
        timeline: '12-months',
        budgetRange: 'R$100k-200k',
        successMetrics: ['Bug rate', 'Cycle time', 'Team satisfaction'],
      },
      contactInfo: {
        fullName: 'Pedro Costa',
        title: 'Engineering Manager',
        email: 'pedro@painco.com',
        company: 'PainCo',
        agreeToContact: true,
      },
      submittedAt: new Date(),
    },
    expectedBehavior: {
      shouldGenerate: true,
      cost: 0.6,
      hasHighBudget: false,
      isCritical: false,
      hasHighPain: true,
      expectedPatterns: ['tech-debt-spiral', 'quality-crisis', 'people-crisis'],
      expectedRecommendations: 4,
      expectedRedFlags: 2,
    },
  },

  'low-value': {
    testId: 'insights-04-low-value',
    scenarioType: 'low-value',
    assessmentData: {
      persona: 'it-devops',
      companyInfo: {
        name: 'SmallCo',
        industry: 'Startup',
        size: 'startup',
        revenue: 'R$1M-5M',
        country: 'Brasil',
      },
      currentState: {
        devTeamSize: 8,
        devSeniority: { junior: 4, mid: 3, senior: 1, lead: 0 },
        currentTools: ['GitHub'],
        deploymentFrequency: 'weekly',
        avgCycleTime: 10,
        bugRate: 5,
        aiToolsUsage: 'exploring',
        painPoints: ['Queremos explorar IA'], // VAGUE, LOW PAIN
      },
      goals: {
        primaryGoals: ['Explorar IA'],
        timeline: '12-months', // NOT CRITICAL
        budgetRange: 'R$50k-100k', // LOW BUDGET
        successMetrics: ['Produtividade'],
      },
      contactInfo: {
        fullName: 'Ana Lima',
        title: 'IT Manager',
        email: 'ana@smallco.com',
        company: 'SmallCo',
        agreeToContact: true,
      },
      submittedAt: new Date(),
    },
    expectedBehavior: {
      shouldGenerate: false,
      cost: 0.0,
      hasHighBudget: false,
      isCritical: false,
      hasHighPain: false,
    },
  },

  'medium-value': {
    testId: 'insights-05-medium-value',
    scenarioType: 'medium-value',
    assessmentData: {
      persona: 'product-business',
      companyInfo: {
        name: 'MediumCo',
        industry: 'SaaS',
        size: 'scaleup',
        revenue: 'R$5M-10M',
        country: 'Brasil',
      },
      currentState: {
        devTeamSize: 15,
        devSeniority: { junior: 5, mid: 7, senior: 2, lead: 1 },
        currentTools: ['GitHub', 'CircleCI'],
        deploymentFrequency: 'weekly',
        avgCycleTime: 14,
        bugRate: 6,
        aiToolsUsage: 'exploring',
        painPoints: ['Desenvolvimento lento', 'Time to market alto'], // 2 PAIN POINTS (< 3)
      },
      goals: {
        primaryGoals: ['Aumentar velocidade'],
        timeline: '6-months', // NOT CRITICAL
        budgetRange: 'R$100k-200k', // MEDIUM BUDGET (< R$200k)
        successMetrics: ['Time to market'],
      },
      contactInfo: {
        fullName: 'Carlos Mendes',
        title: 'Product Manager',
        email: 'carlos@mediumco.com',
        company: 'MediumCo',
        agreeToContact: true,
      },
      submittedAt: new Date(),
    },
    expectedBehavior: {
      shouldGenerate: false, // Não atinge nenhum critério (budget <R$200k, não critical, pain <3)
      cost: 0.0,
      hasHighBudget: false,
      isCritical: false,
      hasHighPain: false,
    },
  },

  'force-generate': {
    testId: 'insights-06-force-generate',
    scenarioType: 'force-generate',
    assessmentData: {
      // Same as low-value, but will force generation
      persona: 'it-devops',
      companyInfo: {
        name: 'ForceCo',
        industry: 'Startup',
        size: 'startup',
        revenue: 'R$1M-5M',
        country: 'Brasil',
      },
      currentState: {
        devTeamSize: 8,
        devSeniority: { junior: 4, mid: 3, senior: 1, lead: 0 },
        currentTools: ['GitHub'],
        deploymentFrequency: 'weekly',
        avgCycleTime: 10,
        bugRate: 5,
        aiToolsUsage: 'exploring',
        painPoints: ['Queremos explorar IA'],
      },
      goals: {
        primaryGoals: ['Explorar IA'],
        timeline: '12-months',
        budgetRange: 'R$50k-100k',
        successMetrics: ['Produtividade'],
      },
      contactInfo: {
        fullName: 'Teste Force',
        title: 'CTO',
        email: 'teste@forceco.com',
        company: 'ForceCo',
        agreeToContact: true,
      },
      submittedAt: new Date(),
    },
    expectedBehavior: {
      shouldGenerate: true, // forceGenerate = true
      cost: 0.6,
      hasHighBudget: false,
      isCritical: false,
      hasHighPain: false,
      expectedPatterns: ['velocity-crisis'],
      expectedRecommendations: 3,
      expectedRedFlags: 1,
    },
  },
};

// Generate all scenarios
export function getAllInsightsScenarios(): InsightsScenario[] {
  return Object.values(insightsScenarios);
}

// Get scenarios by type
export function getInsightsScenarioByType(type: InsightsScenarioType): InsightsScenario {
  return insightsScenarios[type];
}

// Get scenarios that should generate insights
export function getGenerateInsightsScenarios(): InsightsScenario[] {
  return getAllInsightsScenarios().filter((s) => s.expectedBehavior.shouldGenerate);
}

// Get scenarios that should skip insights
export function getSkipInsightsScenarios(): InsightsScenario[] {
  return getAllInsightsScenarios().filter((s) => !s.expectedBehavior.shouldGenerate);
}

/**
 * Generate test data for API requests
 */
export function generateInsightsAPIRequest(scenario: InsightsScenario, forceGenerate = false) {
  return {
    assessmentData: scenario.assessmentData,
    conversationHistory: [],
    forceGenerate,
  };
}
