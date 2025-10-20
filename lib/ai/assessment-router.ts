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

/**
 * Initial discovery questions (max 5)
 */
export const DISCOVERY_QUESTIONS = [
  {
    id: 'main-challenge',
    text: 'Olá! Sou o CulturaBuilder AI. Para começar, me conte: qual o principal desafio de tecnologia ou inovação da sua empresa hoje?',
    extractors: ['pain_points', 'urgency_indicators', 'technical_language']
  },
  {
    id: 'user-role',
    text: 'Entendi. Qual seu cargo ou função na empresa?',
    extractors: ['persona', 'seniority_level']
  },
  {
    id: 'company-size',
    text: 'Quantos funcionários tem sua empresa aproximadamente?',
    extractors: ['company_size', 'company_stage']
  },
  {
    id: 'industry',
    text: 'Em qual setor ou indústria sua empresa atua?',
    extractors: ['industry', 'complexity_indicators']
  },
  {
    id: 'budget-timeline',
    text: 'Você já tem orçamento definido para investir nessa área ou ainda está explorando possibilidades?',
    extractors: ['budget', 'urgency', 'readiness']
  }
];

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
 */
export function recommendMode(
  persona: UserPersona | null,
  urgency: UrgencyLevel,
  complexity: ComplexityLevel,
  messages: ConversationMessage[]
): {
  mode: AssessmentMode;
  reasoning: string;
  alternatives: AssessmentMode[];
} {
  // Executive + high urgency → Express
  if (
    (persona === 'board-executive' || persona === 'finance-ops') &&
    (urgency === 'high' || urgency === 'critical')
  ) {
    return {
      mode: 'express',
      reasoning: 'Como executivo com alta urgência, recomendo o Express Mode (5-7 min) para análise rápida e acionável.',
      alternatives: ['guided', 'deep']
    };
  }

  // Technical + complex → Deep
  if (
    (persona === 'engineering-tech' || persona === 'it-devops') &&
    complexity === 'complex'
  ) {
    return {
      mode: 'deep',
      reasoning: 'Contexto técnico complexo se beneficia de análise profunda com múltiplos especialistas (Deep Dive).',
      alternatives: ['guided', 'express']
    };
  }

  // Low urgency + simple → Express
  if (urgency === 'low' && complexity === 'simple') {
    return {
      mode: 'express',
      reasoning: 'Para exploração inicial, Express Mode oferece análise rápida suficiente.',
      alternatives: ['guided', 'deep']
    };
  }

  // Critical urgency + complex → Deep (need thorough analysis)
  if (urgency === 'critical' && complexity === 'complex') {
    return {
      mode: 'deep',
      reasoning: 'Situação crítica e complexa requer análise profunda e multi-perspectiva.',
      alternatives: ['guided', 'express']
    };
  }

  // Default: Guided mode (balanced)
  return {
    mode: 'guided',
    reasoning: 'Modo Guided recomendado: balanceia profundidade e eficiência com questionário inteligente.',
    alternatives: ['express', 'deep']
  };
}

/**
 * Extract partial data from conversation
 */
export function extractPartialData(messages: ConversationMessage[]) {
  const userMessages = messages.filter(m => m.role === 'user');
  const fullText = userMessages.map(m => m.content).join(' ');

  const partialData: AIRouterResult['partialData'] = {};

  // Extract company size
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
      break;
    }
  }

  // Extract industry (basic)
  const industries = ['fintech', 'saas', 'e-commerce', 'varejo', 'healthtech', 'edtech'];
  for (const industry of industries) {
    if (fullText.toLowerCase().includes(industry)) {
      partialData.companyInfo = {
        ...partialData.companyInfo,
        industry
      };
      break;
    }
  }

  // Extract pain points
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

  // Extract budget indicators
  const budgetPatterns = {
    'Menor que R$50k': /50k|cinquenta mil|baixo orçamento/i,
    'R$100k-500k': /100k|500k|cem mil|quinhentos/i,
    'R$500k-1M': /500k|1m|um milhão/i,
    'Maior que R$1M': /milhão|milhões|large budget/i
  };

  for (const [range, pattern] of Object.entries(budgetPatterns)) {
    if (pattern.test(fullText)) {
      partialData.budget = range;
      break;
    }
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
 */
export function getNextQuestion(
  messages: ConversationMessage[],
  questionsAsked: number
): string | null {
  if (questionsAsked >= DISCOVERY_QUESTIONS.length) {
    return null; // All questions asked
  }

  return DISCOVERY_QUESTIONS[questionsAsked].text;
}

/**
 * Check if enough info to route
 */
export function canRoute(messages: ConversationMessage[]): boolean {
  const userMessagesCount = messages.filter(m => m.role === 'user').length;

  // Need at least 3 user responses
  if (userMessagesCount < 3) return false;

  // Check if we detected a persona
  const { confidence } = detectPersona(messages);

  // Can route if we have some confidence in persona
  return confidence > 0.2;
}
