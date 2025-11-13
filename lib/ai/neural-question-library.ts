/**
 * Neural Question Library - Concrete examples of adaptive questions
 *
 * Questions that adapt based on:
 * - Persona (CEO sees business language, CTO sees technical)
 * - Previous answers (conditional flow)
 * - Inference confidence (smart skipping)
 */

import {
  NeuralQuestion,
  AssessmentContext,
  adaptQuestionForPersona,
  inferTeamSize,
  inferBudgetRange,
  inferDeployFrequency
} from './neural-questions';

// ============================================
// DISCOVERY QUESTIONS (Q1-Q3)
// ============================================

/**
 * Q1: Main Challenge - Adapts language by persona
 */
export const Q_MAIN_CHALLENGE: NeuralQuestion = {
  id: 'main-challenge',
  category: 'discovery',

  text: (context) => {
    const persona = context.sessionMetadata.persona;

    if (persona === 'board-executive') {
      return 'Qual o principal desafio competitivo ou de negócio que sua empresa enfrenta hoje?';
    } else if (persona === 'engineering-tech') {
      return 'Qual o maior gargalo técnico ou de produtividade do seu time de engenharia?';
    } else if (persona === 'finance-ops') {
      return 'Qual processo ou área operacional está gerando maior custo ou ineficiência?';
    } else if (persona === 'product-business') {
      return 'Qual o maior obstáculo para lançar e validar produtos/features rapidamente?';
    } else {
      return 'Qual o principal problema que você precisa resolver nos próximos 6 meses?';
    }
  },

  placeholder: (context) => {
    const persona = context.sessionMetadata.persona;

    if (persona === 'board-executive') {
      return 'Ex: Perdendo mercado para competidores, time-to-market lento...';
    } else if (persona === 'engineering-tech') {
      return 'Ex: Cycle time de 3 semanas, alta taxa de bugs, deploys lentos...';
    } else {
      return 'Ex: Processos manuais, falta de automação, aprovações lentas...';
    }
  },

  dependencies: {},
  personas: ['board-executive', 'engineering-tech', 'finance-ops', 'product-business', 'it-devops'],

  relevance: () => 1.0, // Always highest priority (first question)

  inputType: 'text',
  required: true,

  dataExtractor: (answer, context) => {
    // Extract pain points and urgency from free text
    const answerLower = answer.toLowerCase();

    const painPoints: string[] = [];
    let urgency: 'low' | 'medium' | 'high' | 'critical' = 'medium';

    // Detect urgency keywords
    if (answerLower.match(/urgente|crítico|perdendo|agora|imediato/)) {
      urgency = 'critical';
    } else if (answerLower.match(/rápido|importante|preciso/)) {
      urgency = 'high';
    }

    // Detect pain point categories
    if (answerLower.match(/lento|demora|atraso|time-to-market/)) {
      painPoints.push('velocity');
    }
    if (answerLower.match(/bug|qualidade|erro|falha/)) {
      painPoints.push('quality');
    }
    if (answerLower.match(/custo|caro|dinheiro|orçamento/)) {
      painPoints.push('cost');
    }
    if (answerLower.match(/compliance|audit|regulat|segur/)) {
      painPoints.push('compliance');
    }

    // Update context urgency
    context.sessionMetadata.urgencyLevel = urgency;

    return {
      currentState: {
        painPoints: painPoints.length > 0 ? painPoints : ['outros']
      }
    };
  },

  nextQuestion: (answer, context) => {
    // If urgency is critical, ask about measurable impact immediately
    if (context.sessionMetadata.urgencyLevel === 'critical') {
      return 'measurable-impact';
    }

    // Otherwise, ask about company context
    return 'company-stage';
  },

  priority: 'essential'
};

/**
 * Q2: Company Stage - Quick company context
 */
export const Q_COMPANY_STAGE: NeuralQuestion = {
  id: 'company-stage',
  category: 'discovery',

  text: 'Em qual estágio está sua empresa?',

  dependencies: {
    requires: ['main-challenge']
  },

  personas: ['board-executive', 'engineering-tech', 'finance-ops', 'product-business', 'it-devops'],

  relevance: (context) => {
    // Essential if we don't know company size yet
    if (!context.currentData.companyInfo?.size) return 0.95;
    return 0.3; // Low if already known
  },

  inputType: 'single-choice',
  options: [
    {
      value: 'startup',
      label: 'Startup (até 50 pessoas)',
      description: 'Empresa jovem, foco em product-market fit'
    },
    {
      value: 'scaleup',
      label: 'Scale-up (50-500 pessoas)',
      description: 'Crescimento acelerado, escalando operações'
    },
    {
      value: 'enterprise',
      label: 'Enterprise (500+ pessoas)',
      description: 'Empresa consolidada, foco em eficiência e inovação'
    }
  ],
  required: true,

  dataExtractor: (answer) => ({
    companyInfo: {
      size: answer as 'startup' | 'scaleup' | 'enterprise'
    }
  }),

  nextQuestion: (answer, context) => {
    // Can we infer team size with high confidence?
    const companySize = answer as 'startup' | 'scaleup' | 'enterprise';
    const industry = context.currentData.companyInfo?.industry || 'tech';

    const inference = inferTeamSize(companySize, industry);

    if (inference.confidence > 0.75) {
      // Skip team size question, go to measurable impact
      context.inferences.set('team-size', {
        value: inference.inferredValue,
        confidence: inference.confidence,
        source: 'pattern'
      });

      return 'measurable-impact';
    }

    return 'team-size';
  },

  priority: 'essential'
};

/**
 * Q3: Team Size - Only if couldn't infer
 */
export const Q_TEAM_SIZE: NeuralQuestion = {
  id: 'team-size',
  category: 'quantification',

  text: (context) => {
    const persona = context.sessionMetadata.persona;

    if (persona === 'board-executive') {
      return 'Quantas pessoas trabalham na área de tecnologia/produto?';
    } else {
      return 'Qual o tamanho do time de tecnologia/desenvolvimento?';
    }
  },

  dependencies: {
    requires: ['company-stage']
  },

  personas: ['board-executive', 'engineering-tech', 'finance-ops', 'product-business', 'it-devops'],

  canInfer: (context) => {
    const companySize = context.currentData.companyInfo?.size;
    const industry = context.currentData.companyInfo?.industry || 'tech';

    if (!companySize) {
      return { canInfer: false, inferredValue: null, confidence: 0 };
    }

    return inferTeamSize(companySize, industry);
  },

  relevance: (context) => {
    // Check if already inferred
    const inference = context.inferences.get('team-size');
    if (inference && inference.confidence > 0.75) {
      return 0.2; // Very low, likely skip
    }

    // Essential if no team size data
    if (!context.currentData.currentState?.devTeamSize) {
      return 0.90;
    }

    return 0.5;
  },

  inputType: 'single-choice',
  options: [
    { value: '3', label: '1-5 pessoas', description: 'Time pequeno' },
    { value: '10', label: '6-15 pessoas', description: 'Time médio' },
    { value: '23', label: '16-30 pessoas', description: 'Time grande' },
    { value: '40', label: '31-50 pessoas', description: 'Time muito grande' },
    { value: '75', label: '51-100 pessoas', description: 'Múltiplos times' },
    { value: '150', label: '100+ pessoas', description: 'Organização complexa' }
  ],
  required: true,

  dataExtractor: (answer) => ({
    currentState: {
      devTeamSize: parseInt(answer)
    }
  }),

  nextQuestion: () => 'measurable-impact',

  priority: 'important'
};

// ============================================
// QUANTIFICATION QUESTIONS (Q4-Q6)
// ============================================

/**
 * Q4: Measurable Impact - Quantify the problem
 */
export const Q_MEASURABLE_IMPACT: NeuralQuestion = {
  id: 'measurable-impact',
  category: 'quantification',

  text: (context) => {
    const persona = context.sessionMetadata.persona;
    const painPoints = context.currentData.currentState?.painPoints || [];

    if (persona === 'board-executive') {
      if (painPoints.includes('velocity')) {
        return 'Quanto tempo/oportunidade de mercado está sendo perdido com esse problema?';
      }
      return 'Esse problema tem impacto mensurável em revenue, market share ou retenção?';
    } else if (persona === 'engineering-tech') {
      return 'Consegue quantificar o impacto? (ex: X bugs/semana, Y horas perdidas, Z deploys falhando)';
    } else {
      return 'Esse problema tem impacto mensurável? (perda de clientes, custos extras, atrasos em projetos)';
    }
  },

  placeholder: 'Ex: Perdemos 2 clientes/trimestre, R$50k/mês em retrabalho...',

  dependencies: {
    requires: ['main-challenge']
  },

  personas: ['board-executive', 'engineering-tech', 'finance-ops', 'product-business', 'it-devops'],

  relevance: (context) => {
    // High priority if urgency is high/critical
    if (context.sessionMetadata.urgencyLevel === 'critical') return 0.95;
    if (context.sessionMetadata.urgencyLevel === 'high') return 0.85;
    return 0.75;
  },

  inputType: 'text',
  required: true,

  dataExtractor: (answer, context) => {
    const answerLower = answer.toLowerCase();

    // Extract numbers (basic regex)
    const numbers = answerLower.match(/\d+/g);
    const hasMeasurableImpact = numbers && numbers.length > 0;

    // Update urgency based on measured impact
    if (hasMeasurableImpact) {
      // If they can quantify, it's more urgent
      if (context.sessionMetadata.urgencyLevel === 'medium') {
        context.sessionMetadata.urgencyLevel = 'high';
      }
    }

    return {
      currentState: {
        painPoints: [
          ...(context.currentData.currentState?.painPoints || []),
          hasMeasurableImpact ? 'measurable-impact' : 'qualitative-impact'
        ]
      }
    };
  },

  nextQuestion: (answer, context) => {
    // If they quantified impact, ask about budget commitment
    const numbers = answer.toLowerCase().match(/\d+/g);
    if (numbers && numbers.length > 0) {
      return 'budget-commitment';
    }

    // Otherwise, ask about timeline first
    return 'timeline-urgency';
  },

  priority: 'important'
};

/**
 * Q5: Timeline Urgency - When do they need results?
 */
export const Q_TIMELINE_URGENCY: NeuralQuestion = {
  id: 'timeline-urgency',
  category: 'qualification',

  text: (context) => {
    const persona = context.sessionMetadata.persona;

    if (persona === 'board-executive') {
      return 'Qual o prazo para resolver esse problema? (pressão de board, fiscal year, competição)';
    } else {
      return 'Em quanto tempo você precisa ver resultados concretos?';
    }
  },

  dependencies: {
    requires: ['main-challenge']
  },

  personas: ['board-executive', 'engineering-tech', 'finance-ops', 'product-business', 'it-devops'],

  relevance: () => 0.80, // Always important

  inputType: 'single-choice',
  options: [
    { value: '3-months', label: '3 meses', description: 'Urgente, preciso de ganhos rápidos' },
    { value: '6-months', label: '6 meses', description: 'Médio prazo, resultado consistente' },
    { value: '12-months', label: '12 meses', description: 'Longo prazo, transformação profunda' }
  ],
  required: true,

  dataExtractor: (answer) => ({
    goals: {
      timeline: answer as '3-months' | '6-months' | '12-months'
    }
  }),

  nextQuestion: () => 'budget-commitment',

  priority: 'important'
};

/**
 * Q6: Budget Commitment - Can they invest?
 */
export const Q_BUDGET_COMMITMENT: NeuralQuestion = {
  id: 'budget-commitment',
  category: 'commitment',

  text: (context) => {
    const persona = context.sessionMetadata.persona;

    if (persona === 'board-executive') {
      return 'Há orçamento aprovado ou em análise para investir em upskilling do time em IA?';
    } else if (persona === 'finance-ops') {
      return 'Qual a faixa de investimento que faz sentido para resolver esse problema?';
    } else {
      return 'Tem orçamento ou estimativa para investir em educação/treinamento do time?';
    }
  },

  placeholder: 'Ex: R$200k aprovado, ou faixa R$100k-300k em discussão',

  dependencies: {
    requires: ['main-challenge']
  },

  personas: ['board-executive', 'engineering-tech', 'finance-ops', 'product-business', 'it-devops'],

  canInfer: (context) => {
    const companySize = context.currentData.companyInfo?.size;
    const urgency = context.sessionMetadata.urgencyLevel || 'medium';

    if (!companySize) {
      return { canInfer: false, inferredValue: null, confidence: 0 };
    }

    return inferBudgetRange(companySize, urgency);
  },

  relevance: (context) => {
    // Very high priority - determines lead quality
    if (context.sessionMetadata.urgencyLevel === 'critical') return 0.98;
    return 0.85;
  },

  inputType: 'single-choice',
  options: [
    { value: 'R$50k-100k', label: 'R$50k-100k', description: 'Investimento inicial' },
    { value: 'R$100k-200k', label: 'R$100k-200k', description: 'Investimento moderado' },
    { value: 'R$200k-500k', label: 'R$200k-500k', description: 'Investimento significativo' },
    { value: 'R$500k-1M', label: 'R$500k-1M', description: 'Investimento robusto' },
    { value: 'R$1M+', label: 'R$1M+', description: 'Investimento enterprise' }
  ],
  required: true,

  dataExtractor: (answer) => ({
    goals: {
      budgetRange: answer
    }
  }),

  nextQuestion: (answer, context) => {
    // If high budget (R$500k+), ask about AI maturity
    if (answer.includes('500k') || answer.includes('1M')) {
      return 'ai-maturity';
    }

    // Otherwise, finish with success metrics
    return 'success-metrics';
  },

  priority: 'essential'
};

// ============================================
// OPTIONAL DEEP QUESTIONS (Q7-Q8)
// ============================================

/**
 * Q7: AI Maturity - Only for high-budget leads
 */
export const Q_AI_MATURITY: NeuralQuestion = {
  id: 'ai-maturity',
  category: 'qualification',

  text: 'A empresa já usa ferramentas de IA/automação hoje? Se sim, quais?',

  placeholder: 'Ex: GitHub Copilot, ChatGPT, nada ainda...',

  dependencies: {
    requires: ['budget-commitment']
  },

  personas: ['board-executive', 'engineering-tech', 'finance-ops', 'product-business', 'it-devops'],

  relevance: (context) => {
    // Only relevant for high-budget leads
    const budget = context.currentData.goals?.budgetRange || '';
    if (budget.includes('500k') || budget.includes('1M')) {
      return 0.70;
    }
    return 0.30; // Low priority otherwise
  },

  inputType: 'text',
  required: false,

  dataExtractor: (answer) => {
    const answerLower = answer.toLowerCase();

    let aiUsage: 'none' | 'exploring' | 'piloting' | 'production' | 'mature' = 'none';

    if (answerLower.includes('nada') || answerLower.includes('não')) {
      aiUsage = 'none';
    } else if (answerLower.match(/copilot|chatgpt|claude/)) {
      aiUsage = 'exploring';
    } else if (answerLower.match(/produção|production|escalando/)) {
      aiUsage = 'production';
    } else {
      aiUsage = 'piloting';
    }

    return {
      currentState: {
        aiToolsUsage: aiUsage
      }
    };
  },

  nextQuestion: () => 'success-metrics',

  priority: 'optional'
};

/**
 * Q8: Success Metrics - How will they measure success?
 */
export const Q_SUCCESS_METRICS: NeuralQuestion = {
  id: 'success-metrics',
  category: 'qualification',

  text: (context) => {
    const persona = context.sessionMetadata.persona;

    if (persona === 'board-executive') {
      return 'Como você vai medir sucesso desse investimento em 6-12 meses?';
    } else if (persona === 'engineering-tech') {
      return 'Quais métricas de engenharia você quer melhorar? (cycle time, deploy freq, bugs, etc)';
    } else {
      return 'Como você vai saber que o problema foi resolvido? Quais métricas importam?';
    }
  },

  placeholder: 'Ex: Reduzir cycle time em 50%, aumentar deploy frequency, diminuir bugs...',

  dependencies: {
    requires: ['main-challenge']
  },

  personas: ['board-executive', 'engineering-tech', 'finance-ops', 'product-business', 'it-devops'],

  relevance: () => 0.65, // Moderately important

  inputType: 'text',
  required: false,

  dataExtractor: (answer) => ({
    goals: {
      successMetrics: [answer]
    }
  }),

  nextQuestion: () => null, // Last question

  priority: 'optional'
};

// ============================================
// EXPORT ALL QUESTIONS
// ============================================

export const NEURAL_QUESTION_LIBRARY: NeuralQuestion[] = [
  Q_MAIN_CHALLENGE,
  Q_COMPANY_STAGE,
  Q_TEAM_SIZE,
  Q_MEASURABLE_IMPACT,
  Q_TIMELINE_URGENCY,
  Q_BUDGET_COMMITMENT,
  Q_AI_MATURITY,
  Q_SUCCESS_METRICS
];
