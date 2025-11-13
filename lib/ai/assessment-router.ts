/**
 * AI Assessment Router
 *
 * Core logic for AI-first assessment journey:
 * - Analyzes initial conversation
 * - Auto-detects user persona
 * - Determines urgency and complexity
 * - Recommends assessment mode (express/guided/deep)
 */

import {
  UserPersona,
  AssessmentMode,
  UrgencyLevel,
  ComplexityLevel,
  AIRouterResult,
  ConversationMessage
} from '../types';
import {
  ENHANCED_DISCOVERY_QUESTIONS,
  getQuestionForPersona,
  shouldAskFollowUp,
  extractMetricsFromAnswer
} from './enhanced-discovery-questions';

/**
 * Initial discovery questions (max 6)
 * NOW USING: Enhanced PhD-style operational questions
 */
export const DISCOVERY_QUESTIONS = ENHANCED_DISCOVERY_QUESTIONS;

/**
 * Analyze conversation and detect persona
 */
export function detectPersona(messages: ConversationMessage[]): {
  persona: UserPersona | null;
  confidence: number;
} {
  const userMessages = messages
    .filter(m => m.role === 'user')
    .map(m => m.content.toLowerCase());

  const fullText = userMessages.join(' ');

  // Technical indicators
  const technicalTerms = [
    'ci/cd', 'deployment', 'devops', 'infrastructure', 'arquitetura',
    'código', 'cto', 'vp engineering', 'tech lead', 'desenvolvimento',
    'pipeline', 'kubernetes', 'docker', 'microservices'
  ];

  // Finance/Ops indicators
  const financeTerms = [
    'cfo', 'custos', 'roi', 'orçamento', 'budget', 'eficiência',
    'operacional', 'coo', 'finance', 'operational', 'savings'
  ];

  // Executive indicators
  const executiveTerms = [
    'ceo', 'board', 'conselho', 'estratégia', 'competitivo',
    'mercado', 'receita', 'crescimento', 'participação de mercado',
    'c-level', 'diretor geral'
  ];

  // Product/Business indicators
  const productTerms = [
    'produto', 'cpo', 'product', 'time-to-market', 'features',
    'cliente', 'experiência', 'inovação', 'lançamento'
  ];

  // IT/DevOps indicators
  const opsTerms = [
    'it manager', 'ti', 'infraestrutura', 'devops', 'sre',
    'operações', 'confiabilidade', 'automação', 'monitoring'
  ];

  // Count matches
  const scores = {
    'engineering-tech': technicalTerms.filter(t => fullText.includes(t)).length,
    'finance-ops': financeTerms.filter(t => fullText.includes(t)).length,
    'board-executive': executiveTerms.filter(t => fullText.includes(t)).length,
    'product-business': productTerms.filter(t => fullText.includes(t)).length,
    'it-devops': opsTerms.filter(t => fullText.includes(t)).length
  };

  // Find highest score
  const entries = Object.entries(scores) as [UserPersona, number][];
  const [persona, score] = entries.reduce((max, entry) =>
    entry[1] > max[1] ? entry : max
  );

  // Calculate confidence (0-1)
  const totalScore = Object.values(scores).reduce((sum, s) => sum + s, 0);
  const confidence = totalScore > 0 ? score / totalScore : 0;

  // Require minimum confidence of 0.3
  if (confidence < 0.3) {
    return { persona: null, confidence: 0 };
  }

  return { persona, confidence };
}

/**
 * Determine urgency level from conversation
 */
export function determineUrgency(messages: ConversationMessage[]): UrgencyLevel {
  const userMessages = messages
    .filter(m => m.role === 'user')
    .map(m => m.content.toLowerCase());

  const fullText = userMessages.join(' ');

  // Critical urgency indicators
  const criticalIndicators = [
    'urgente', 'crítico', 'perdendo clientes', 'concorrentes ganhando',
    'bleeding', 'hemorrhaging', 'emergency', 'imediato', 'agora'
  ];

  // High urgency indicators
  const highIndicators = [
    'rápido', 'pressão', 'atrás', 'competidor', 'perder mercado',
    'meta agressiva', '3 meses', 'trimestre', 'board pressionando'
  ];

  // Medium urgency indicators
  const mediumIndicators = [
    'melhorar', 'otimizar', '6 meses', 'semestre', 'planejar',
    'avaliar', 'considerar'
  ];

  // Check indicators
  if (criticalIndicators.some(i => fullText.includes(i))) {
    return 'critical';
  }

  if (highIndicators.some(i => fullText.includes(i))) {
    return 'high';
  }

  if (mediumIndicators.some(i => fullText.includes(i))) {
    return 'medium';
  }

  return 'low';
}

/**
 * Determine complexity level
 */
export function determineComplexity(messages: ConversationMessage[]): ComplexityLevel {
  const userMessages = messages
    .filter(m => m.role === 'user')
    .map(m => m.content.toLowerCase());

  const fullText = userMessages.join(' ');

  // Complex indicators
  const complexIndicators = [
    'múltiplos times', 'multi-regional', 'legacy systems', 'compliance',
    'regulatório', 'migração', 'transformação', 'centenas de',
    'enterprise', 'global'
  ];

  // Simple indicators
  const simpleIndicators = [
    'pequeno time', 'startup', 'mvp', 'piloto', 'começar',
    'explorar', 'poc', 'proof of concept'
  ];

  const complexCount = complexIndicators.filter(i => fullText.includes(i)).length;
  const simpleCount = simpleIndicators.filter(i => fullText.includes(i)).length;

  if (complexCount >= 2) return 'complex';
  if (simpleCount >= 2) return 'simple';
  return 'moderate';
}

/**
 * Recommend assessment mode based on analysis
 * Now returns detailed reasoning with specific reasons
 */
export function recommendMode(
  persona: UserPersona | null,
  urgency: UrgencyLevel,
  complexity: ComplexityLevel,
  messages: ConversationMessage[]
): {
  mode: AssessmentMode;
  reasoning: string;
  reasons: string[]; // Specific bullet points
  alternatives: AssessmentMode[];
} {
  const userMessages = messages.filter(m => m.role === 'user');
  const partialData = extractPartialData(messages);

  // Executive + high urgency → Express
  if (
    (persona === 'board-executive' || persona === 'finance-ops') &&
    (urgency === 'high' || urgency === 'critical')
  ) {
    return {
      mode: 'express',
      reasoning: 'Recomendo o Express Mode: você precisa de agilidade e foco executivo.',
      reasons: [
        'Você é C-level e precisa de decisões rápidas',
        'Alta urgência detectada nas suas respostas',
        'Express entrega análise acionável em 5-7 minutos',
        partialData.budget ? 'Orçamento já definido - foco em execução' : 'Análise rápida para definir próximos passos'
      ],
      alternatives: ['deep']
    };
  }

  // Technical + complex → Deep
  if (
    (persona === 'engineering-tech' || persona === 'it-devops') &&
    complexity === 'complex'
  ) {
    return {
      mode: 'deep',
      reasoning: 'Recomendo o Deep Dive: contexto técnico complexo precisa de análise multi-perspectiva.',
      reasons: [
        'Você tem expertise técnica para aproveitar análise profunda',
        'Complexidade detectada requer múltiplos especialistas',
        'Deep Dive oferece visão de Engineering, Finance e Strategy',
        'Relatório detalhado para embasar decisões técnicas importantes'
      ],
      alternatives: ['express']
    };
  }

  // Low urgency + simple → Express
  if (urgency === 'low' && complexity === 'simple') {
    return {
      mode: 'express',
      reasoning: 'Recomendo o Express Mode: perfeito para exploração inicial e análise focada.',
      reasons: [
        'Contexto simples não precisa de análise exaustiva',
        'Express oferece direcionamento claro em menos tempo',
        'Você pode fazer Deep Dive depois se precisar',
        'Ótimo custo-benefício para primeira análise'
      ],
      alternatives: ['deep']
    };
  }

  // Critical urgency + complex → Deep (need thorough but fast)
  if (urgency === 'critical' && complexity === 'complex') {
    return {
      mode: 'deep',
      reasoning: 'Recomendo o Deep Dive: situação crítica e complexa precisa de análise robusta antes de agir.',
      reasons: [
        'Urgência crítica + complexidade alta = risco de decisão errada',
        'Deep Dive oferece múltiplas perspectivas em 15-20 min',
        'Análise completa evita retrabalho e custos futuros',
        'Melhor investir 15min agora que meses corrigindo depois'
      ],
      alternatives: ['express']
    };
  }

  // Product/Business + moderate → Express (default for most)
  if (persona === 'product-business') {
    return {
      mode: 'express',
      reasoning: 'Recomendo o Express Mode: foco em resultados e métricas de negócio.',
      reasons: [
        'Você precisa de insights acionáveis para produto/negócio',
        'Express foca em ROI e impacto mensurável',
        'Relatório direto com próximos passos claros',
        'Tempo otimizado para profissionais de produto'
      ],
      alternatives: ['deep']
    };
  }

  // High budget / investment → Deep
  if (partialData.budget && (partialData.budget.includes('500k') || partialData.budget.includes('1M'))) {
    return {
      mode: 'deep',
      reasoning: 'Recomendo o Deep Dive: investimento alto merece análise completa multi-expert.',
      reasons: [
        'Investimento significativo detectado',
        'Deep Dive oferece análise de ROI detalhada',
        'Múltiplos especialistas validam a decisão',
        'Vale investir 15min para decisão de R$500k+'
      ],
      alternatives: ['express']
    };
  }

  // Default: Express (most common path)
  return {
    mode: 'express',
    reasoning: 'Recomendo o Express Mode: análise inteligente e focada para a maioria dos casos.',
    reasons: [
      'Express combina velocidade com qualidade de análise',
      'Perguntas personalizadas baseadas no seu contexto',
      'Relatório executivo com ações prioritárias',
      'Você sempre pode fazer Deep Dive depois se precisar'
    ],
    alternatives: ['deep']
  };
}

/**
 * Extract partial data from conversation
 * NOW ENHANCED: Uses PhD-style metrics extraction
 */
export function extractPartialData(messages: ConversationMessage[]) {
  const userMessages = messages.filter(m => m.role === 'user');
  const fullText = userMessages.map(m => m.content).join(' ');

  const partialData: AIRouterResult['partialData'] = {};

  // === Q1: Operational Baseline (cycle time, deploy frequency) ===
  if (userMessages.length > 0 && DISCOVERY_QUESTIONS.length > 0) {
    const q1Answer = userMessages[0].content;
    const q1 = DISCOVERY_QUESTIONS[0];

    const q1Metrics = extractMetricsFromAnswer(q1Answer, q1.extractors);

    // Store cycle time
    if (q1Metrics.cycle_time_days) {
      partialData.cycleTime = `${q1Metrics.cycle_time_days} dias`;
    }

    // Store deploy frequency
    if (q1Metrics.deploy_frequency) {
      partialData.deployFrequency = q1Metrics.deploy_frequency;
    }

    console.log('[AI Router] Q1 metrics extracted:', q1Metrics);
  }

  // === Q2: Quantified Pain (bugs, rework hours, incidents) ===
  if (userMessages.length > 1 && DISCOVERY_QUESTIONS.length > 1) {
    const q2Answer = userMessages[1].content;
    const q2 = DISCOVERY_QUESTIONS[1];

    const q2Metrics = extractMetricsFromAnswer(q2Answer, q2.extractors);

    // Store pain metrics
    if (q2Metrics.bugs_per_month) {
      partialData.bugsPerMonth = q2Metrics.bugs_per_month;
    }

    if (q2Metrics.rework_hours_per_week) {
      partialData.reworkHoursPerWeek = q2Metrics.rework_hours_per_week;
    }

    if (q2Metrics.time_wasted_percentage) {
      partialData.timeWastedPercentage = q2Metrics.time_wasted_percentage;
    }

    console.log('[AI Router] Q2 metrics extracted:', q2Metrics);
  }

  // === Q3: Cost of Inaction (monthly cost, revenue at risk, customers lost) ===
  if (userMessages.length > 2 && DISCOVERY_QUESTIONS.length > 2) {
    const q3Answer = userMessages[2].content;
    const q3 = DISCOVERY_QUESTIONS[2];

    const q3Metrics = extractMetricsFromAnswer(q3Answer, q3.extractors);

    // Store cost metrics
    if (q3Metrics.monthly_cost_brl) {
      partialData.monthlyCost = q3Metrics.monthly_cost_brl;
    }

    if (q3Metrics.customers_lost) {
      partialData.customersLost = q3Metrics.customers_lost;
    }

    console.log('[AI Router] Q3 metrics extracted:', q3Metrics);
  }

  // === Q4: Team Context (company size, tech team, AI maturity) ===
  if (userMessages.length > 3 && DISCOVERY_QUESTIONS.length > 3) {
    const q4Answer = userMessages[3].content;
    const q4 = DISCOVERY_QUESTIONS[3];

    const q4Metrics = extractMetricsFromAnswer(q4Answer, q4.extractors);

    // Store team metrics
    if (q4Metrics.tech_team_size) {
      partialData.techTeamSize = q4Metrics.tech_team_size;
    }

    console.log('[AI Router] Q4 metrics extracted:', q4Metrics);
  }

  // === Q5: Urgency Pressure (timeline, external pressure) ===
  if (userMessages.length > 4 && DISCOVERY_QUESTIONS.length > 4) {
    const q5Answer = userMessages[4].content;

    // Extract urgency indicators
    const urgentKeywords = [
      'urgente', 'crítico', 'board', 'competidor', 'já',
      'imediato', '3 meses', 'q1', 'q2', 'deadline'
    ];

    const urgencyIndicators = urgentKeywords.filter(k =>
      q5Answer.toLowerCase().includes(k)
    );

    if (urgencyIndicators.length > 0) {
      partialData.urgencyIndicators = urgencyIndicators;
    }

    console.log('[AI Router] Q5 urgency extracted:', urgencyIndicators);
  }

  // === Q6: Budget Authority (budget range, decision authority) ===
  if (userMessages.length > 5 && DISCOVERY_QUESTIONS.length > 5) {
    const q6Answer = userMessages[5].content;
    const q6 = DISCOVERY_QUESTIONS[5];

    const q6Metrics = extractMetricsFromAnswer(q6Answer, q6.extractors);

    // Store budget metrics
    if (q6Metrics.budget_range) {
      partialData.budget = q6Metrics.budget_range;
    }

    // Check if budget is approved vs still analyzing
    const approvedKeywords = ['aprovado', 'approved', 'sim', 'tenho', 'temos'];
    const exploringKeywords = ['ainda', 'explorando', 'analisando', 'não', 'sem'];

    const hasApproved = approvedKeywords.some(k => q6Answer.toLowerCase().includes(k));
    const hasExploring = exploringKeywords.some(k => q6Answer.toLowerCase().includes(k));

    if (hasApproved && !hasExploring) {
      partialData.budgetStatus = 'approved';
    } else if (hasExploring) {
      partialData.budgetStatus = 'exploring';
    }

    console.log('[AI Router] Q6 budget extracted:', q6Metrics);
  }

  // Extract company size from Q4 (Team Context)
  // Q4 now asks: "quantas pessoas tem no total na empresa?"
  const companySizeQuestionIndex = 3; // 0-indexed, Q4 is Team Context
  let companySizeExtracted = false;

  if (userMessages.length > companySizeQuestionIndex && DISCOVERY_QUESTIONS.length > companySizeQuestionIndex) {
    const sizeAnswer = userMessages[companySizeQuestionIndex].content;

    // Try to extract employee count from answer
    const numberMatch = sizeAnswer.match(/(\d+)/);
    if (numberMatch) {
      const employeeCount = parseInt(numberMatch[1]);
      let companySize: 'startup' | 'scaleup' | 'enterprise';

      if (employeeCount < 50) {
        companySize = 'startup';
      } else if (employeeCount < 200) {
        companySize = 'scaleup';
      } else {
        companySize = 'enterprise';
      }

      partialData.companyInfo = {
        ...partialData.companyInfo,
        size: companySize
      };
      companySizeExtracted = true;
      console.log('✅ [AI Router] Extracted company size from Q4:', {
        employeeCount,
        mappedSize: companySize
      });
    }
  }

  // Fallback: Try pattern matching if not extracted from Q4
  if (!companySizeExtracted) {
    const sizePatterns = {
      startup: /startup|pequen[ao]|10-50|menos de 50/i,
      scaleup: /scaleup|médio|50-200|100-500/i,
      enterprise: /enterprise|grande|500\+|mil|centenas/i
    };

    for (const [size, pattern] of Object.entries(sizePatterns)) {
      if (pattern.test(fullText)) {
        partialData.companyInfo = {
          ...partialData.companyInfo,
          size: size as 'startup' | 'scaleup' | 'enterprise'
        };
        console.log('✅ [AI Router] Extracted company size from patterns:', size);
        break;
      }
    }
  }

  // Extract industry from Q4 (Team Context - board-executive variant asks for sector)
  // NOTE: Enhanced Q4 doesn't explicitly ask for industry in base text, so we use fallback patterns
  const industryPatterns = {
    'fintech': /fintech|pagamento|banco|financ|criptomoeda/i,
    'saas': /saas|software.*serviço|b2b/i,
    'e-commerce': /e-commerce|marketplace|loja.*online|varejo.*online/i,
    'healthtech': /health|saúde|hospital|médic|telemedicina/i,
    'edtech': /edtech|educação|ensino|escola|curso/i,
    'logistics': /logística|transporte|entrega|supply chain/i,
    'retail': /varejo|retail|loja/i,
    'agritech': /agro|agrícola|fazenda/i
  };

  for (const [industry, pattern] of Object.entries(industryPatterns)) {
    if (pattern.test(fullText)) {
      partialData.companyInfo = {
        ...partialData.companyInfo,
        industry
      };
      console.log('✅ [AI Router] Extracted industry from patterns:', industry);
      break;
    }
  }

  // Extract pain points from full conversation (fallback/enhancement)
  const painKeywords = [
    'lento', 'slow', 'bugs', 'qualidade', 'quality', 'atraso', 'delay',
    'competidor', 'competitor', 'custo', 'cost', 'eficiência', 'efficiency'
  ];

  const painPoints = painKeywords.filter(keyword =>
    fullText.toLowerCase().includes(keyword)
  );

  if (painPoints.length > 0) {
    partialData.painPoints = painPoints;
  }

  return partialData;
}

/**
 * Main analysis function: analyze conversation and return routing decision
 */
export function analyzeConversation(messages: ConversationMessage[]): AIRouterResult {
  // Detect persona
  const { persona: detectedPersona, confidence: personaConfidence } = detectPersona(messages);

  // Determine characteristics
  const urgencyLevel = determineUrgency(messages);
  const complexityLevel = determineComplexity(messages);

  // Get recommendation
  const { mode, reasoning, alternatives } = recommendMode(
    detectedPersona,
    urgencyLevel,
    complexityLevel,
    messages
  );

  // Extract partial data
  const partialData = extractPartialData(messages);

  return {
    detectedPersona,
    personaConfidence,
    urgencyLevel,
    complexityLevel,
    recommendedMode: mode,
    reasoning,
    partialData,
    alternativeModes: alternatives
  };
}

/**
 * Get next question based on conversation so far
 * NOW ENHANCED: Adapts question by persona + supports follow-ups
 */
export function getNextQuestion(
  messages: ConversationMessage[],
  questionsAsked: number,
  detectedPersona?: UserPersona | null
): string | null {
  if (questionsAsked >= DISCOVERY_QUESTIONS.length) {
    return null; // All questions asked
  }

  // Check if last answer triggered a follow-up
  if (messages.length > 0 && questionsAsked > 0) {
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage.role === 'user') {
      const lastQuestion = DISCOVERY_QUESTIONS[questionsAsked - 1];
      const followUp = shouldAskFollowUp(lastQuestion, lastUserMessage.content);

      if (followUp) {
        console.log(`[AI Router] Triggered follow-up for ${lastQuestion.id}`);
        return followUp;
      }
    }
  }

  // Get next question with persona variant
  const question = DISCOVERY_QUESTIONS[questionsAsked];
  return getQuestionForPersona(question, detectedPersona || null);
}

/**
 * Check if enough info to route
 */
export function canRoute(messages: ConversationMessage[]): boolean {
  const userMessagesCount = messages.filter(m => m.role === 'user').length;

  // Need at least 3 user responses
  if (userMessagesCount < 3) return false;

  // If we've asked all 5 questions, MUST route (can't ask more questions)
  if (userMessagesCount >= DISCOVERY_QUESTIONS.length) return true;

  // Check if we detected a persona
  const { confidence } = detectPersona(messages);

  // Can route if we have some confidence in persona
  return confidence > 0.2;
}
