/**
 * Signal Detection
 *
 * Detects interesting signals in user answers that warrant intelligent follow-up questions.
 * Used by the adaptive question router to decide when to generate dynamic follow-ups.
 */

export type SignalCategory =
  | 'innovation' // User mentions innovation, new products, R&D
  | 'competition' // Competitive pressure, losing to rivals
  | 'pain-quantified' // Pain points with or without metrics
  | 'urgency' // Time pressure, board deadlines, investor pressure
  | 'growth' // Scaling challenges, team growth
  | 'cost' // Budget concerns, high costs
  | 'quality' // Quality issues, bugs, technical debt
  | 'none';

export interface InterestingSignals {
  hasSignals: boolean;
  category: SignalCategory;
  keywords: string[];
  confidence: number; // 0-1
  reasoning: string;
}

/**
 * Keywords by category
 */
const SIGNAL_KEYWORDS = {
  innovation: [
    'inovar',
    'inovação',
    'inovacao',
    'novo produto',
    'novos produtos',
    'lançar',
    'lancar',
    'desenvolver',
    'criar',
    'inventar',
    'diferencial',
    'disruptiv',
    'tecnologia nova',
    'mvp',
    'prototype',
    'protótipo',
    'prototipo',
    'experimento'
  ],
  competition: [
    'competidor',
    'concorrência',
    'concorrencia',
    'competitivo',
    'rival',
    'rivais',
    'mercado',
    'perder cliente',
    'perdendo cliente',
    'churn',
    'atrasados',
    'ficando para trás',
    'ficando para tras',
    'market share',
    'participação de mercado',
    'participacao de mercado'
  ],
  'pain-quantified': [
    'custo',
    'custos',
    'perdemos',
    'perdendo',
    'atraso',
    'atrasado',
    'demora',
    'lento',
    'lenta',
    'bug',
    'bugs',
    'problema',
    'problemas',
    'frustrad',
    'ineficiente',
    'desperdício',
    'desperdicio',
    'retrabalho',
    'overhead',
    'gargalo'
  ],
  urgency: [
    'urgente',
    'urgência',
    'urgencia',
    'rápido',
    'rapido',
    'já',
    'ja',
    'imediato',
    'board',
    'conselho',
    'investidor',
    'investidores',
    'prazo',
    'deadline',
    'crítico',
    'critico',
    'emergência',
    'emergencia',
    'agora',
    'asap'
  ],
  growth: [
    'crescendo',
    'crescimento',
    'scaling',
    'escalar',
    'expansão',
    'expansao',
    'contratar',
    'contratando',
    'dobrar',
    'triplicar',
    'aumentar equipe',
    'aumentar time',
    'mais pessoas',
    'novos membros'
  ],
  cost: [
    'orçamento',
    'orcamento',
    'budget',
    'caro',
    'cara',
    'muito caro',
    'muito cara',
    'custo alto',
    'custos altos',
    'não temos verba',
    'nao temos verba',
    'limitado',
    'recursos limitados',
    'r$',
    'reais',
    'mil',
    'milhão',
    'milhao'
  ],
  quality: [
    'qualidade',
    'bug',
    'bugs',
    'erro',
    'erros',
    'falha',
    'falhas',
    'quebra',
    'quebrado',
    'instável',
    'instavel',
    'dívida técnica',
    'divida tecnica',
    'technical debt',
    'refactoring',
    'refatorar',
    'código ruim',
    'codigo ruim',
    'legado'
  ]
};

/**
 * Detects interesting signals in a user answer
 */
export function detectInterestingSignals(answer: string): InterestingSignals {
  if (!answer || typeof answer !== 'string') {
    return {
      hasSignals: false,
      category: 'none',
      keywords: [],
      confidence: 0,
      reasoning: 'Empty or invalid answer'
    };
  }

  const lowerAnswer = answer.toLowerCase();

  // Count matches for each category
  const categoryScores: Record<SignalCategory, { count: number; keywords: string[] }> = {
    innovation: { count: 0, keywords: [] },
    competition: { count: 0, keywords: [] },
    'pain-quantified': { count: 0, keywords: [] },
    urgency: { count: 0, keywords: [] },
    growth: { count: 0, keywords: [] },
    cost: { count: 0, keywords: [] },
    quality: { count: 0, keywords: [] },
    none: { count: 0, keywords: [] }
  };

  // Check each category for keywords
  for (const [category, keywords] of Object.entries(SIGNAL_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerAnswer.includes(keyword)) {
        categoryScores[category as SignalCategory].count++;
        categoryScores[category as SignalCategory].keywords.push(keyword);
      }
    }
  }

  // Find category with highest score
  const sortedCategories = Object.entries(categoryScores)
    .filter(([cat]) => cat !== 'none')
    .sort(([, a], [, b]) => b.count - a.count);

  if (sortedCategories.length === 0 || sortedCategories[0][1].count === 0) {
    return {
      hasSignals: false,
      category: 'none',
      keywords: [],
      confidence: 0,
      reasoning: 'No interesting keywords detected'
    };
  }

  const [topCategory, topData] = sortedCategories[0];
  const category = topCategory as SignalCategory;

  // Calculate confidence based on number of matches
  // 1 keyword = 0.5, 2 keywords = 0.7, 3+ keywords = 0.9
  const confidence = Math.min(0.9, 0.3 + topData.count * 0.2);

  // Generate reasoning
  const reasoning = generateReasoning(category, topData.keywords, lowerAnswer);

  return {
    hasSignals: true,
    category,
    keywords: topData.keywords,
    confidence,
    reasoning
  };
}

/**
 * Generates human-readable reasoning for detected signals
 */
function generateReasoning(
  category: SignalCategory,
  keywords: string[],
  answer: string
): string {
  const keywordList = keywords.slice(0, 3).join(', ');

  const reasoningMap: Record<SignalCategory, string> = {
    innovation: `User mentioned innovation/new products (keywords: ${keywordList}). Worth exploring product vision and competitive positioning.`,
    competition: `Competitive pressure detected (keywords: ${keywordList}). Should quantify threat and understand timeline.`,
    'pain-quantified': `Pain points mentioned (keywords: ${keywordList}). Should dig deeper to quantify impact and understand root cause.`,
    urgency: `Urgency signals detected (keywords: ${keywordList}). Should understand timeline pressures and decision-making context.`,
    growth: `Growth/scaling mentioned (keywords: ${keywordList}). Should explore challenges and capacity planning.`,
    cost: `Budget/cost concerns mentioned (keywords: ${keywordList}). Should understand financial constraints and ROI expectations.`,
    quality: `Quality issues mentioned (keywords: ${keywordList}). Should quantify impact and understand severity.`,
    none: 'No specific signals detected.'
  };

  return reasoningMap[category] || 'Interesting points detected.';
}

/**
 * Checks if answer is detailed enough to warrant follow-up
 */
export function isAnswerSubstantive(answer: string): boolean {
  if (!answer || typeof answer !== 'string') {
    return false;
  }

  // Too short answers are not substantive
  if (answer.trim().length < 20) {
    return false;
  }

  // Check for generic/vague responses
  const vaguePhrases = [
    'não sei',
    'nao sei',
    'talvez',
    'depende',
    'mais ou menos',
    'sim',
    'não',
    'nao'
  ];

  const lowerAnswer = answer.toLowerCase().trim();
  const isVague = vaguePhrases.some(phrase => lowerAnswer === phrase);

  return !isVague;
}

/**
 * Determines if we should generate a follow-up based on signals
 */
export function shouldGenerateFollowUp(
  signals: InterestingSignals,
  isSubstantive: boolean,
  dynamicFollowupsUsed: number,
  maxFollowups: number = 3
): {
  should: boolean;
  reason: string;
} {
  // Budget check
  if (dynamicFollowupsUsed >= maxFollowups) {
    return {
      should: false,
      reason: `Already used ${dynamicFollowupsUsed}/${maxFollowups} dynamic follow-ups`
    };
  }

  // Must have interesting signals
  if (!signals.hasSignals) {
    return {
      should: false,
      reason: 'No interesting signals detected'
    };
  }

  // Must be substantive answer
  if (!isSubstantive) {
    return {
      should: false,
      reason: 'Answer too short or vague for follow-up'
    };
  }

  // Confidence threshold
  if (signals.confidence < 0.6) {
    return {
      should: false,
      reason: `Signal confidence too low (${signals.confidence})`
    };
  }

  return {
    should: true,
    reason: `Detected ${signals.category} signals with ${signals.confidence} confidence`
  };
}
