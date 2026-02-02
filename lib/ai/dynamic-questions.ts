/**
 * Dynamic Question Engine for Express Mode
 *
 * Generates and selects next questions based on:
 * - User persona
 * - Previous answers
 * - Data completeness
 * - Minimum viable data requirements
 */

import {
  UserPersona,
  AssessmentData,
  CompanyInfo,
  ConversationMessage,
  DeepPartial
} from '../types';

/**
 * Question input type
 */
export type QuestionInputType =
  | 'text'           // Free text input
  | 'single-choice'  // Radio buttons / single select
  | 'multi-choice'   // Checkboxes / multi select
  | 'quick-chips';   // Quick selection chips (tags)

/**
 * Question option for choice-based questions
 */
export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
}

/**
 * Question template
 */
export interface QuestionTemplate {
  id: string;
  text: string;
  category: 'company' | 'pain-points' | 'goals' | 'context' | 'urgency';
  personas: UserPersona[]; // Which personas should see this
  requiresExpertise?: string[]; // NEW: Required expertise areas (e.g., ['engineering-tech']). Empty = everyone can answer
  priority: 'essential' | 'important' | 'optional';
  inputType: QuestionInputType;
  options?: QuestionOption[]; // For choice-based questions
  allowOther?: boolean; // Allow "Other" option with text input
  placeholder?: string; // For text inputs
  disableSuggestions?: boolean; // Disable AI suggestions for this question (e.g. free text fields like company name)
  followUpCondition?: (answer: string) => boolean;
  dataExtractor: (answer: string | string[], currentData: DeepPartial<AssessmentData>) => DeepPartial<AssessmentData>;
}

/**
 * Essential questions (7-10 total for Express Mode)
 */
export const EXPRESS_QUESTIONS: QuestionTemplate[] = [
  // Company Context (2-3 questions)
  {
    id: 'company-industry',
    text: 'Em qual setor sua empresa atua?',
    category: 'company',
    personas: ['board-executive', 'finance-ops', 'product-business', 'engineering-tech', 'it-devops'],
    priority: 'essential',
    inputType: 'single-choice',
    options: [
      { value: 'fintech', label: 'Fintech / Pagamentos', description: 'Serviços financeiros, pagamentos, banking' },
      { value: 'saas', label: 'SaaS B2B', description: 'Software como serviço para empresas' },
      { value: 'e-commerce', label: 'E-commerce / Marketplace', description: 'Comércio eletrônico, vendas online' },
      { value: 'healthtech', label: 'Healthtech', description: 'Saúde, telemedicina, hospitalar' },
      { value: 'edtech', label: 'Edtech', description: 'Educação, cursos, plataformas de ensino' },
      { value: 'logistics', label: 'Logística / Supply Chain', description: 'Transporte, entrega, gestão de estoque' },
      { value: 'retail', label: 'Varejo / Retail', description: 'Lojas físicas, omnichannel' },
      { value: 'agritech', label: 'Agritech', description: 'Agronegócio, tecnologia agrícola' }
    ],
    allowOther: true,
    dataExtractor: (answer, data) => {
      const industry = Array.isArray(answer) ? answer[0] : answer;
      return {
        companyInfo: {
          ...data.companyInfo,
          industry
        }
      };
    }
  },

  {
    id: 'company-name',
    text: 'Qual o nome da sua empresa?',
    category: 'company',
    personas: ['board-executive', 'finance-ops', 'product-business', 'engineering-tech', 'it-devops'],
    priority: 'essential',
    inputType: 'text',
    placeholder: 'Ex: TechCorp',
    disableSuggestions: true, // Nome é campo único, não precisa de sugestões
    dataExtractor: (answer, data) => {
      const companyName = Array.isArray(answer) ? answer[0] : answer;
      return {
        companyInfo: {
          ...data.companyInfo,
          name: companyName.trim()
        }
      };
    }
  },

  {
    id: 'team-size',
    text: 'Qual o tamanho do time de tecnologia/desenvolvimento?',
    category: 'company',
    personas: ['engineering-tech', 'it-devops', 'product-business'],
    priority: 'essential',
    inputType: 'single-choice',
    options: [
      { value: '1-5', label: '1-5 pessoas', description: 'Time muito pequeno' },
      { value: '6-15', label: '6-15 pessoas', description: 'Time pequeno' },
      { value: '16-30', label: '16-30 pessoas', description: 'Time médio' },
      { value: '31-50', label: '31-50 pessoas', description: 'Time grande' },
      { value: '51-100', label: '51-100 pessoas', description: 'Time muito grande' },
      { value: '100+', label: 'Mais de 100', description: 'Time enterprise' }
    ],
    dataExtractor: (answer, data) => {
      const range = Array.isArray(answer) ? answer[0] : answer;

      // Map range to approximate number for calculations
      const sizeMap: Record<string, number> = {
        '1-5': 3,
        '6-15': 10,
        '16-30': 23,
        '31-50': 40,
        '51-100': 75,
        '100+': 150
      };

      const teamSize = sizeMap[range] || 10;

      return {
        currentState: {
          ...data.currentState,
          devTeamSize: teamSize
        }
      };
    }
  },

  // Pain Points (2-3 questions)
  {
    id: 'main-pain-point',
    text: 'Quais são os principais desafios que a empresa enfrenta hoje? (Selecione até 3)',
    category: 'pain-points',
    personas: ['board-executive', 'finance-ops', 'product-business', 'engineering-tech', 'it-devops'],
    priority: 'essential',
    inputType: 'multi-choice',
    options: [
      { value: 'velocity', label: 'Desenvolvimento Lento', description: 'Time demora muito para entregar features' },
      { value: 'quality', label: 'Muitos Bugs', description: 'Qualidade baixa, retrabalho constante' },
      { value: 'cost', label: 'Custos Altos', description: 'Operação cara, precisa reduzir gastos' },
      { value: 'competition', label: 'Perdendo para Competidores', description: 'Concorrentes mais ágeis, market share caindo' },
      { value: 'scalability', label: 'Dificuldade de Escalar', description: 'Sistemas não aguentam crescimento' },
      { value: 'technical-debt', label: 'Technical Debt Alto', description: 'Código legado, arquitetura problemática' },
      { value: 'talent', label: 'Falta de Talentos', description: 'Difícil contratar e reter bons profissionais' },
      { value: 'process', label: 'Processos Ineficientes', description: 'Burocracia, falta de automação' }
    ],
    dataExtractor: (answer, data) => {
      const selectedPains = Array.isArray(answer) ? answer : [answer];

      return {
        currentState: {
          ...data.currentState,
          painPoints: selectedPains
        }
      };
    }
  },

  {
    id: 'impact-quantified',
    text: 'Esse problema tem impactado a empresa de alguma forma mensurável? (ex: perda de clientes, atraso em lançamentos, custos extras)',
    category: 'pain-points',
    personas: ['board-executive', 'finance-ops', 'product-business'],
    priority: 'important',
    inputType: 'text',
    placeholder: 'Ex: Perdemos 3 clientes no último trimestre...',
    dataExtractor: (answer, data) => {
      const answerStr = Array.isArray(answer) ? answer.join(' ') : answer;
      // Extract impact indicators
      const hasRevenueImpact = /receita|revenue|cliente|customer|churn/.test(answerStr.toLowerCase());
      const hasTimeImpact = /atraso|delay|tempo|time|lento/.test(answerStr.toLowerCase());
      const hasCostImpact = /custo|cost|caro|expensive|gasto/.test(answerStr.toLowerCase());

      return {
        goals: {
          ...data.goals,
          competitiveThreats: hasRevenueImpact ? answerStr.substring(0, 200) : undefined
        }
      };
    }
  },

  // Current AI Adoption (1 question)
  {
    id: 'ai-current-usage',
    text: 'A empresa já usa alguma ferramenta de AI/automação hoje? Se sim, quais?',
    category: 'context',
    personas: ['board-executive', 'finance-ops', 'product-business', 'engineering-tech', 'it-devops'],
    priority: 'essential',
    inputType: 'text',
    placeholder: 'Ex: GitHub Copilot, ChatGPT, nada ainda...',
    dataExtractor: (answer, data) => {
      const answerStr = Array.isArray(answer) ? answer.join(' ') : answer;
      const lowerAnswer = answerStr.toLowerCase();

      let aiUsage: 'none' | 'exploring' | 'piloting' | 'production' | 'mature' = 'none';

      if (/nada|nenhum|não|no/.test(lowerAnswer)) {
        aiUsage = 'none';
      } else if (/explorar|avaliar|considerar|thinking/.test(lowerAnswer)) {
        aiUsage = 'exploring';
      } else if (/piloto|teste|testing|experimenting/.test(lowerAnswer)) {
        aiUsage = 'piloting';
      } else if (/produção|production|usando|using/.test(lowerAnswer)) {
        aiUsage = 'production';
      } else if (/maduro|mature|consolidado|scaled/.test(lowerAnswer)) {
        aiUsage = 'mature';
      }

      return {
        currentState: {
          ...data.currentState,
          aiToolsUsage: aiUsage
        }
      };
    }
  },

  // Goals (2-3 questions)
  {
    id: 'primary-goal',
    text: 'Se pudesse resolver UM problema nos próximos 3-6 meses, qual seria?',
    category: 'goals',
    personas: ['board-executive', 'finance-ops', 'product-business', 'engineering-tech', 'it-devops'],
    priority: 'essential',
    inputType: 'text',
    placeholder: 'Ex: Reduzir cycle time para 5 dias...',
    dataExtractor: (answer, data) => {
      const answerStr = Array.isArray(answer) ? answer.join(' ') : answer;
      const goalKeywords = {
        'Aumentar produtividade': ['produtividade', 'productivity', 'eficiência', 'efficiency'],
        'Reduzir bugs': ['bug', 'qualidade', 'quality', 'defeito'],
        'Acelerar lançamentos': ['rápido', 'fast', 'velocidade', 'speed', 'lançamento'],
        'Reduzir custos': ['custo', 'cost', 'economizar', 'save'],
        'Melhorar competitividade': ['competitivo', 'competitive', 'mercado', 'market']
      };

      const detectedGoals: string[] = [];
      for (const [goal, keywords] of Object.entries(goalKeywords)) {
        if (keywords.some(k => answerStr.toLowerCase().includes(k))) {
          detectedGoals.push(goal);
        }
      }

      return {
        goals: {
          ...data.goals,
          primaryGoals: detectedGoals.length > 0 ? detectedGoals : ['Aumentar produtividade']
        }
      };
    }
  },

  {
    id: 'timeline',
    text: 'Qual o prazo ideal para ver resultados? (3 meses, 6 meses, 12 meses...)',
    category: 'goals',
    personas: ['board-executive', 'finance-ops', 'product-business', 'engineering-tech', 'it-devops'],
    priority: 'essential',
    inputType: 'text',
    placeholder: 'Ex: 6 meses',
    dataExtractor: (answer, data) => {
      const answerStr = Array.isArray(answer) ? answer.join(' ') : answer;
      const lowerAnswer = answerStr.toLowerCase();

      let timeline: '3-months' | '6-months' | '12-months' | '18-months' = '6-months';

      if (/3\s*mes|3\s*month|trimestre|quarter/.test(lowerAnswer)) {
        timeline = '3-months';
      } else if (/6\s*mes|6\s*month|semestre/.test(lowerAnswer)) {
        timeline = '6-months';
      } else if (/12\s*mes|12\s*month|ano|year/.test(lowerAnswer)) {
        timeline = '12-months';
      } else if (/18\s*mes|18\s*month/.test(lowerAnswer)) {
        timeline = '18-months';
      }

      return {
        goals: {
          ...data.goals,
          timeline
        }
      };
    }
  },

  // Budget/Investment (1 question)
  {
    id: 'budget-range',
    text: 'Tem orçamento aprovado ou estimativa para investir nessa área? (pode ser uma faixa)',
    category: 'urgency',
    personas: ['board-executive', 'finance-ops', 'product-business'],
    priority: 'important',
    inputType: 'text',
    placeholder: 'Ex: Entre 200k e 500k',
    dataExtractor: (answer, data) => {
      const answerStr = Array.isArray(answer) ? answer.join(' ') : answer;
      const lowerAnswer = answerStr.toLowerCase();

      let budgetRange = 'R$100k-500k'; // default

      if (/50k|cinquenta/.test(lowerAnswer) || /não|no budget|sem orçamento/.test(lowerAnswer)) {
        budgetRange = 'Menor que R$50k';
      } else if (/100k|500k|cem mil|quinhentos/.test(lowerAnswer)) {
        budgetRange = 'R$100k-500k';
      } else if (/1m|milhão|million/.test(lowerAnswer)) {
        budgetRange = 'R$500k-1M';
      } else if (/2m|3m|mais de|above/.test(lowerAnswer)) {
        budgetRange = 'Maior que R$1M';
      }

      return {
        goals: {
          ...data.goals,
          budgetRange
        }
      };
    }
  },

  // Success Metrics (1 question)
  {
    id: 'success-metrics',
    text: 'Como você vai medir se deu certo? Qual métrica é mais importante para você?',
    category: 'goals',
    personas: ['board-executive', 'finance-ops', 'product-business', 'engineering-tech', 'it-devops'],
    priority: 'important',
    inputType: 'text',
    placeholder: 'Ex: Deployment frequency e cycle time',
    dataExtractor: (answer, data) => {
      const answerStr = Array.isArray(answer) ? answer.join(' ') : answer;
      const metricKeywords = {
        'Velocity / Throughput': ['velocidade', 'velocity', 'throughput', 'produtividade'],
        'Bug Reduction Rate': ['bug', 'qualidade', 'quality', 'defeito'],
        'Deployment Frequency': ['deploy', 'lançamento', 'release', 'entrega'],
        'Cost Savings': ['custo', 'cost', 'economia', 'saving'],
        'Revenue Growth': ['receita', 'revenue', 'crescimento', 'growth']
      };

      const detectedMetrics: string[] = [];
      for (const [metric, keywords] of Object.entries(metricKeywords)) {
        if (keywords.some(k => answerStr.toLowerCase().includes(k))) {
          detectedMetrics.push(metric);
        }
      }

      return {
        goals: {
          ...data.goals,
          successMetrics: detectedMetrics.length > 0 ? detectedMetrics : ['Velocity / Throughput']
        }
      };
    }
  },

  // Contact Info (1 question - final)
  {
    id: 'contact-info',
    text: 'Perfeito! Para finalizar e enviar seu relatório, preciso de seu nome e email profissional.',
    category: 'context',
    personas: ['board-executive', 'finance-ops', 'product-business', 'engineering-tech', 'it-devops'],
    priority: 'essential',
    inputType: 'text',
    placeholder: 'Ex: João Silva, joao@empresa.com',
    dataExtractor: (answer, data) => {
      const answerStr = Array.isArray(answer) ? answer.join(' ') : answer;
      // Extract email
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
      const emailMatch = answerStr.match(emailRegex);
      const email = emailMatch ? emailMatch[0] : '';

      // Extract name (words before email or first 2-3 words)
      const words = answerStr.split(' ').filter(w => !w.includes('@'));
      const name = words.slice(0, 3).join(' ');

      return {
        contactInfo: {
          ...data.contactInfo,
          fullName: name,
          email: email,
          company: data.companyInfo?.name || '',
          agreeToContact: true
        }
      };
    }
  }
];

/**
 * Get next question based on persona and current data
 * PHASE 2: Now includes contextual questions based on AI Router data
 */
export function getNextExpressQuestion(
  persona: UserPersona,
  currentData: DeepPartial<AssessmentData>,
  answeredQuestionIds: string[],
  aiRouterPartialData?: any // NEW: AI Router context
): QuestionTemplate | null {
  // ========== PHASE 2: Inject contextual questions dynamically ==========
  let allQuestions = [...EXPRESS_QUESTIONS];

  // If we have AI Router data, add contextual questions
  if (aiRouterPartialData) {
    try {
      // Dynamically import contextual questions
      const { getAllContextualQuestions } = require('./express-contextual-questions');
      const contextualQuestions = getAllContextualQuestions(persona, aiRouterPartialData);

      // Add contextual questions to the pool
      allQuestions = [...allQuestions, ...contextualQuestions];

      console.log(`✨ [Express Phase 2] Added ${contextualQuestions.length} contextual questions based on AI Router data`);
    } catch (error) {
      console.warn('⚠️ Could not load contextual questions:', error);
    }
  }
  // ======================================================================

  // Filter questions for this persona that haven't been answered
  const availableQuestions = allQuestions.filter(q =>
    q.personas.includes(persona) &&
    !answeredQuestionIds.includes(q.id)
  );

  if (availableQuestions.length === 0) return null;

  // ALWAYS save contact-info for last - never return it unless it's the only one left
  const nonContactQuestions = availableQuestions.filter(q => q.id !== 'contact-info');
  const contactQuestion = availableQuestions.find(q => q.id === 'contact-info');

  // If there are other questions besides contact-info, pick from those first
  if (nonContactQuestions.length > 0) {
    const questionsToConsider = nonContactQuestions;

    // Prioritize essential questions first
    const essentialQuestions = questionsToConsider.filter(q => q.priority === 'essential');
    if (essentialQuestions.length > 0) {
      return essentialQuestions[0];
    }

    // Then important questions
    const importantQuestions = questionsToConsider.filter(q => q.priority === 'important');
    if (importantQuestions.length > 0) {
      return importantQuestions[0];
    }

    // Finally optional questions
    return questionsToConsider[0] || null;
  }

  // Only return contact-info when it's the last question remaining
  return contactQuestion || null;
}

/**
 * Check if we have minimum viable data to generate report
 */
export function hasMinimumViableData(data: DeepPartial<AssessmentData>): boolean {
  const checks = [
    !!data.persona,
    !!data.companyInfo?.name,
    !!data.companyInfo?.industry,
    !!data.currentState?.painPoints && data.currentState.painPoints.length > 0,
    !!data.goals?.primaryGoals && data.goals.primaryGoals.length > 0,
    !!data.goals?.timeline,
    !!data.contactInfo?.email
  ];

  // Need at least 5/7 checks to pass
  const passedChecks = checks.filter(Boolean).length;
  return passedChecks >= 5;
}

/**
 * Calculate completion percentage
 */
export function calculateCompleteness(data: DeepPartial<AssessmentData>): number {
  const checks = [
    !!data.persona,
    !!data.companyInfo?.name,
    !!data.companyInfo?.industry,
    !!data.companyInfo?.size,
    !!data.currentState?.devTeamSize,
    !!data.currentState?.painPoints && data.currentState.painPoints.length > 0,
    !!data.currentState?.aiToolsUsage,
    !!data.goals?.primaryGoals && data.goals.primaryGoals.length > 0,
    !!data.goals?.timeline,
    !!data.goals?.budgetRange,
    !!data.goals?.successMetrics && data.goals.successMetrics.length > 0,
    !!data.contactInfo?.fullName,
    !!data.contactInfo?.email
  ];

  const passedChecks = checks.filter(Boolean).length;
  return Math.round((passedChecks / checks.length) * 100);
}

/**
 * Suggest additional questions if time permits
 */
export function suggestAdditionalQuestions(
  persona: UserPersona,
  currentData: DeepPartial<AssessmentData>,
  answeredQuestionIds: string[]
): QuestionTemplate[] {
  // Get optional questions that might add value
  const optionalQuestions = EXPRESS_QUESTIONS.filter(q =>
    q.personas.includes(persona) &&
    !answeredQuestionIds.includes(q.id) &&
    q.priority === 'optional'
  );

  return optionalQuestions.slice(0, 2); // Max 2 additional
}

/**
 * Map AI Router pain point keywords to Express Mode pain point options
 *
 * AI Router extracts keywords like: ['lento', 'bugs', 'custo']
 * This maps them to Express options like: ['velocity', 'quality', 'cost']
 */
export function mapAIRouterPainPointsToExpressOptions(painPoints: string[]): string[] {
  if (!painPoints || painPoints.length === 0) return [];

  const mapping: Record<string, string[]> = {
    'velocity': ['lento', 'slow', 'atraso', 'delay'],
    'quality': ['bugs', 'qualidade', 'quality'],
    'cost': ['custo', 'cost'],
    'competition': ['competidor', 'competitor'],
    'process': ['eficiência', 'efficiency']
  };

  const selectedOptions: Set<string> = new Set();

  // For each pain point keyword, find matching option
  painPoints.forEach(keyword => {
    const lowerKeyword = keyword.toLowerCase();

    Object.entries(mapping).forEach(([option, keywords]) => {
      if (keywords.some(k => lowerKeyword.includes(k) || k.includes(lowerKeyword))) {
        selectedOptions.add(option);
      }
    });
  });

  const result = Array.from(selectedOptions);
  console.log('🔄 [Pain Points Mapping]', {
    input: painPoints,
    output: result
  });

  return result;
}

/**
 * Map AI Router company size to suggested team-size range
 *
 * Uses company size as a hint to suggest likely team-size range
 */
export function suggestTeamSizeFromCompanySize(companySize?: 'startup' | 'scaleup' | 'enterprise'): string | null {
  if (!companySize) return null;

  const sizeHints: Record<string, string> = {
    'startup': '6-15',      // Startups typically have small tech teams
    'scaleup': '16-30',     // Scaleups have medium teams
    'enterprise': '51-100'  // Enterprises have large teams
  };

  const hint = sizeHints[companySize] || null;

  if (hint) {
    console.log('💡 [Team Size Hint]', {
      companySize,
      suggestedRange: hint
    });
  }

  return hint;
}
