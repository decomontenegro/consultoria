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
 * Initial discovery questions (max 6)
 * New approach: Extract OPERATIONAL CONTEXT, not just generic info
 */
export const DISCOVERY_QUESTIONS = [
  {
    id: 'urgency-context',
    text: 'Olá! Sou o CulturaBuilder AI. Para começar: o que te trouxe aqui hoje? Tem algum problema específico que você precisa resolver nos próximos 3-6 meses?',
    extractors: ['urgency', 'specific_problem', 'timeline', 'pain_points']
  },
  {
    id: 'role-responsibilities',
    text: 'Entendi. Me conta: qual seu cargo e, mais importante, o que você é responsável por entregar na empresa?',
    extractors: ['persona', 'responsibilities', 'kpis', 'seniority_level']
  },
  {
    id: 'team-structure',
    text: 'Quantas pessoas tem na empresa no total? E especificamente, quantas pessoas no time de tecnologia/produto?',
    extractors: ['company_size', 'tech_team_size', 'team_structure']
  },
  {
    id: 'current-process',
    text: 'Me conte um pouco sobre como vocês trabalham hoje: desde uma ideia até estar em produção, demora quanto tempo tipicamente? Quais as principais dores desse processo?',
    extractors: ['current_process', 'cycle_time', 'bottlenecks', 'maturity']
  },
  {
    id: 'measurable-impact',
    text: 'Esse problema tem impactado a empresa de alguma forma mensurável? Por exemplo: perda de clientes, atraso em lançamentos, custos extras, oportunidades perdidas?',
    extractors: ['measurable_impact', 'cost_of_inaction', 'urgency', 'business_impact']
  },
  {
    id: 'budget-investment',
    text: 'Tem orçamento aprovado ou estimativa para investir nessa área? Se tiver, pode compartilhar a faixa de investimento que considera viável?',
    extractors: ['budget', 'budget_range', 'decision_stage', 'readiness']
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
 * Enhanced to extract operational context from new questions
 */
export function extractPartialData(messages: ConversationMessage[]) {
  const userMessages = messages.filter(m => m.role === 'user');
  const fullText = userMessages.map(m => m.content).join(' ');

  const partialData: AIRouterResult['partialData'] = {};

  // === NEW: Extract specific problem and urgency from Q1 ===
  if (userMessages.length > 0) {
    const q1Answer = userMessages[0].content.toLowerCase();

    // Check for urgency indicators
    const urgentKeywords = [
      'urgente', 'rápido', 'já', 'agora', 'imediato', 'crítico',
      'board', 'decisão', 'trimestre', '3 meses', 'q1', 'q2',
      'perdendo', 'concorrente', 'atrasado'
    ];

    const hasUrgency = urgentKeywords.some(keyword => q1Answer.includes(keyword));

    if (hasUrgency) {
      partialData.urgencyIndicators = urgentKeywords.filter(k => q1Answer.includes(k));
    }

    // Extract specific problem mentioned
    if (q1Answer.length > 10) {
      partialData.specificProblem = userMessages[0].content.substring(0, 200);
    }
  }

  // === NEW: Extract responsibilities from Q2 ===
  if (userMessages.length > 1) {
    const q2Answer = userMessages[1].content;

    // Extract responsibilities/KPIs mentioned
    const responsibilityKeywords = [
      'responsável', 'entregar', 'kpi', 'meta', 'objetivo',
      'velocidade', 'qualidade', 'custo', 'receita', 'crescimento',
      'time-to-market', 'eficiência', 'produtividade'
    ];

    const responsibilities = responsibilityKeywords.filter(keyword =>
      q2Answer.toLowerCase().includes(keyword)
    );

    if (responsibilities.length > 0) {
      partialData.responsibilities = responsibilities;
    }
  }

  // === NEW: Extract tech team size from Q3 ===
  if (userMessages.length > 2) {
    const q3Answer = userMessages[2].content;

    // Try to extract tech team size
    // Patterns: "5 devs", "30 em tech", "10 pessoas em tecnologia"
    const techSizePatterns = [
      /(\d+)\s*(?:dev|engenheiro|desenvolvedor|tech|tecnologia|produto|ti)/gi,
      /tech.*?(\d+)/gi,
      /(\d+).*?(?:tech|dev|engenheiro)/gi
    ];

    for (const pattern of techSizePatterns) {
      const match = q3Answer.match(pattern);
      if (match) {
        const numbers = q3Answer.match(/\d+/g);
        if (numbers && numbers.length >= 2) {
          partialData.techTeamSize = parseInt(numbers[1]); // Second number is usually tech team
        }
        break;
      }
    }
  }

  // === NEW: Extract process and cycle time from Q4 ===
  if (userMessages.length > 3) {
    const q4Answer = userMessages[3].content.toLowerCase();

    // Extract cycle time mentions
    const timePatterns = [
      /(\d+)\s*(?:semanas?|weeks?)/gi,
      /(\d+)\s*(?:meses|months?)/gi,
      /(\d+)\s*(?:dias?|days?)/gi
    ];

    for (const pattern of timePatterns) {
      const match = q4Answer.match(pattern);
      if (match) {
        partialData.cycleTime = match[0];
        break;
      }
    }

    // Extract bottleneck mentions
    const bottleneckKeywords = [
      'review', 'teste', 'aprovação', 'deploy', 'manual',
      'burocracia', 'lento', 'gargalo', 'demora', 'travado'
    ];

    const bottlenecks = bottleneckKeywords.filter(keyword => q4Answer.includes(keyword));
    if (bottlenecks.length > 0) {
      partialData.bottlenecks = bottlenecks;
    }
  }

  // === NEW: Extract measurable impact from Q5 ===
  if (userMessages.length > 4) {
    const q5Answer = userMessages[4].content.toLowerCase();

    // Check for measurable impact indicators
    const impactKeywords = [
      'perdemos', 'perda', 'atras', 'custo', 'cliente',
      'oportunidade', 'competidor', 'mercado', 'receita'
    ];

    const impacts = impactKeywords.filter(keyword => q5Answer.includes(keyword));
    if (impacts.length > 0) {
      partialData.measurableImpact = impacts;
    }

    // Try to extract numbers (lost customers, delays, costs)
    const numberMatches = q5Answer.match(/(\d+)\s*(?:clientes?|meses|dias|mil|k|reais)/gi);
    if (numberMatches) {
      partialData.impactNumbers = numberMatches;
    }
  }

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

  // === NEW: Extract budget from Q6 ===
  if (userMessages.length > 5) {
    const q6Answer = userMessages[5].content.toLowerCase();

    // Extract budget range more accurately
    const budgetPatterns = {
      'Entre R$ 20k-50k': /20.*50|vinte.*cinquenta|20k.*50k/i,
      'Entre R$ 50k-100k': /50.*100|cinquenta.*cem|50k.*100k/i,
      'Entre R$ 100k-300k': /100.*300|cem.*trezentos|100k.*300k/i,
      'Entre R$ 300k-500k': /300.*500|trezentos.*quinhentos|300k.*500k/i,
      'Acima de R$ 500k': /500k|quinhentos mil|acima.*500|mais.*500/i,
      'Ainda sem orçamento': /ainda.*não|sem orçamento|não.*definido|explorando|analisando/i,
      'Preciso justificar': /justificar|apresentar|board|aprovação pendente/i
    };

    for (const [range, pattern] of Object.entries(budgetPatterns)) {
      if (pattern.test(q6Answer)) {
        partialData.budget = range;
        console.log('✅ [AI Router] Extracted budget from Q6:', range);
        break;
      }
    }

    // Check if budget is approved vs still analyzing
    const approvedKeywords = ['aprovado', 'approved', 'sim', 'tenho', 'temos'];
    const exploringKeywords = ['ainda', 'explorando', 'analisando', 'não', 'sem'];

    const hasApproved = approvedKeywords.some(k => q6Answer.includes(k));
    const hasExploring = exploringKeywords.some(k => q6Answer.includes(k));

    if (hasApproved && !hasExploring) {
      partialData.budgetStatus = 'approved';
    } else if (hasExploring) {
      partialData.budgetStatus = 'exploring';
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
