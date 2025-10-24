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
 */
export function extractPartialData(messages: ConversationMessage[]) {
  const userMessages = messages.filter(m => m.role === 'user');
  const fullText = userMessages.map(m => m.content).join(' ');

  const partialData: AIRouterResult['partialData'] = {};

  // Extract company size
  // First try to get from question #3 specifically (most reliable - "Quantos funcionários...")
  const companySizeQuestionIndex = 2; // 0-indexed, question #3 is "Quantos funcionários..."
  let companySizeExtracted = false;

  if (userMessages.length > companySizeQuestionIndex) {
    const sizeAnswer = userMessages[companySizeQuestionIndex].content;

    // Try to extract number from answer
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
      console.log('✅ [AI Router] Extracted company size from question #3:', {
        answer: sizeAnswer,
        employeeCount,
        mappedSize: companySize
      });
    }
  }

  // Fallback: Try pattern matching if not extracted from question #3
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

  // Extract industry
  // First try to get from question #4 specifically (most reliable)
  const industryQuestionIndex = 3; // 0-indexed, question #4 is "Em qual setor..."
  if (userMessages.length > industryQuestionIndex) {
    const industryAnswer = userMessages[industryQuestionIndex].content;

    // Try to match common industries
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

    let matched = false;
    for (const [industry, pattern] of Object.entries(industryPatterns)) {
      if (pattern.test(industryAnswer)) {
        partialData.companyInfo = {
          ...partialData.companyInfo,
          industry
        };
        matched = true;
        console.log('✅ [AI Router] Extracted industry from question #4:', industry);
        break;
      }
    }

    // If no pattern matched, use the raw answer (for other industries)
    if (!matched && industryAnswer.trim()) {
      partialData.companyInfo = {
        ...partialData.companyInfo,
        industry: industryAnswer.trim().toLowerCase()
      };
      console.log('✅ [AI Router] Using raw industry answer:', industryAnswer);
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

  // If we've asked all 5 questions, MUST route (can't ask more questions)
  if (userMessagesCount >= DISCOVERY_QUESTIONS.length) return true;

  // Check if we detected a persona
  const { confidence } = detectPersona(messages);

  // Can route if we have some confidence in persona
  return confidence > 0.2;
}
