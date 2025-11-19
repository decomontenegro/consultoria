import { UserPersona } from '@/lib/types';

/**
 * Test scenarios for Follow-up Orchestrator (FASE 2)
 * Tests weak signal detection and context-aware follow-up generation
 */

export type FollowUpScenarioType =
  | 'vague-response'
  | 'contradiction'
  | 'hesitation'
  | 'missing-metrics'
  | 'emotional-urgency'
  | 'complete-answer'
  | 'max-followups';

export interface FollowUpScenario {
  testId: string;
  scenarioType: FollowUpScenarioType;
  questionId: string;
  question: string;
  answer: string;
  persona: UserPersona | null;
  expectedBehavior: {
    shouldAskFollowUp: boolean;
    weakSignalTypes: string[];
    urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
    hasDecisionAuthority?: boolean;
    followUpType?:
      | 'quantify-impact'
      | 'dig-deeper-root-cause'
      | 'challenge-assumption'
      | 'explore-constraint'
      | 'validate-commitment';
  };
  conversationHistory?: Array<{
    questionId: string;
    question: string;
    answer: string;
  }>;
}

// Scenario templates
export const followUpScenarios: Record<FollowUpScenarioType, FollowUpScenario> = {
  'vague-response': {
    testId: 'followup-01-vague',
    scenarioType: 'vague-response',
    questionId: 'pain-points',
    question: 'Quais os principais desafios que a equipe enfrenta hoje?',
    answer: 'Ah, temos alguns problemas de produtividade... não sei bem explicar, mas as coisas estão meio lentas.',
    persona: 'engineering-tech',
    expectedBehavior: {
      shouldAskFollowUp: true,
      weakSignalTypes: ['vague', 'missing-metrics'],
      urgencyLevel: 'medium',
      followUpType: 'quantify-impact',
    },
  },

  contradiction: {
    testId: 'followup-02-contradiction',
    scenarioType: 'contradiction',
    questionId: 'development-cycle',
    question: 'Como está o processo de desenvolvimento?',
    answer:
      'Somos muito ágeis, temos dailys e sprints de 2 semanas. Mas na prática leva uns 3 meses para colocar algo em produção.',
    persona: 'engineering-tech',
    expectedBehavior: {
      shouldAskFollowUp: true,
      weakSignalTypes: ['contradiction'],
      urgencyLevel: 'high',
      followUpType: 'dig-deeper-root-cause',
    },
  },

  hesitation: {
    testId: 'followup-03-hesitation',
    scenarioType: 'hesitation',
    questionId: 'budget',
    question: 'Tem orçamento aprovado para investir em melhorias?',
    answer: 'Talvez... acho que sim. Não tenho certeza se posso decidir isso sozinho. Pode ser que precise do CEO.',
    persona: 'product-business',
    expectedBehavior: {
      shouldAskFollowUp: true,
      weakSignalTypes: ['hesitation'],
      urgencyLevel: 'medium',
      hasDecisionAuthority: false,
      followUpType: 'validate-commitment',
    },
  },

  'missing-metrics': {
    testId: 'followup-04-missing-metrics',
    scenarioType: 'missing-metrics',
    questionId: 'productivity-impact',
    question: 'Qual o impacto da baixa produtividade?',
    answer: 'A produtividade está muito baixa. O time está frustrado e entregamos pouco.',
    persona: 'engineering-tech',
    expectedBehavior: {
      shouldAskFollowUp: true,
      weakSignalTypes: ['missing-metrics', 'emotional'],
      urgencyLevel: 'medium',
      followUpType: 'quantify-impact',
    },
  },

  'emotional-urgency': {
    testId: 'followup-05-emotional',
    scenarioType: 'emotional-urgency',
    questionId: 'situation-urgency',
    question: 'Como está a situação atual da empresa?',
    answer:
      'Estamos desesperados! A situação está crítica, perdemos 2 clientes grandes por causa de bugs. O board está cobrando resultados URGENTES.',
    persona: 'board-executive',
    expectedBehavior: {
      shouldAskFollowUp: true,
      weakSignalTypes: ['emotional'],
      urgencyLevel: 'critical',
      followUpType: 'dig-deeper-root-cause',
    },
  },

  'complete-answer': {
    testId: 'followup-06-complete',
    scenarioType: 'complete-answer',
    questionId: 'team-metrics',
    question: 'Como está a produtividade do time?',
    answer:
      'Temos 15 pessoas no time (3 seniors, 7 plenos, 5 juniors). Cycle time médio de 14 dias. Deploy semanal. Estimamos que perdemos R$120k/mês com retrabalho e bugs. Budget aprovado de R$500k para melhorias.',
    persona: 'engineering-tech',
    expectedBehavior: {
      shouldAskFollowUp: false,
      weakSignalTypes: [],
      urgencyLevel: 'low',
    },
  },

  'max-followups': {
    testId: 'followup-07-max-reached',
    scenarioType: 'max-followups',
    questionId: 'followup-4',
    question: 'Mais algum detalhe sobre os desafios?',
    answer: 'Sim, temos muitos outros problemas também...',
    persona: 'engineering-tech',
    expectedBehavior: {
      shouldAskFollowUp: false, // Budget control: max 3 follow-ups already reached
      weakSignalTypes: [],
      urgencyLevel: 'low',
    },
    conversationHistory: [
      {
        questionId: 'q1',
        question: 'Pergunta 1',
        answer: 'Resposta vaga 1',
      },
      {
        questionId: 'followup-1',
        question: 'Follow-up 1',
        answer: 'Resposta vaga 2',
      },
      {
        questionId: 'followup-2',
        question: 'Follow-up 2',
        answer: 'Resposta vaga 3',
      },
      {
        questionId: 'followup-3',
        question: 'Follow-up 3',
        answer: 'Resposta vaga 4',
      },
    ],
  },
};

// Generate all scenarios
export function getAllFollowUpScenarios(): FollowUpScenario[] {
  return Object.values(followUpScenarios);
}

// Get scenarios by type
export function getFollowUpScenariosByType(type: FollowUpScenarioType): FollowUpScenario {
  return followUpScenarios[type];
}

// Persona-specific scenarios
export const personaFollowUpScenarios: Record<UserPersona, FollowUpScenario[]> = {
  'board-executive': [followUpScenarios['emotional-urgency'], followUpScenarios['hesitation']],
  'finance-ops': [followUpScenarios['missing-metrics'], followUpScenarios['vague-response']],
  'product-business': [followUpScenarios['hesitation'], followUpScenarios['contradiction']],
  'engineering-tech': [
    followUpScenarios['vague-response'],
    followUpScenarios['contradiction'],
    followUpScenarios['complete-answer'],
  ],
  'it-devops': [followUpScenarios['missing-metrics'], followUpScenarios['vague-response']],
};

/**
 * Generate test data for API requests
 */
export function generateFollowUpAPIRequest(scenario: FollowUpScenario) {
  return {
    questionId: scenario.questionId,
    question: scenario.question,
    answer: scenario.answer,
    persona: scenario.persona,
    conversationHistory: scenario.conversationHistory || [],
    maxFollowUps: 3,
  };
}
