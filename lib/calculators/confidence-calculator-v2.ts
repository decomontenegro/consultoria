/**
 * Confidence Calculator V2
 *
 * Expanded logic to consider:
 * - Source quality (peer-reviewed > case study > vendor report)
 * - Data recency and relevance
 * - Benchmark applicability (industry match, company size match)
 * - User data completeness
 *
 * Integrates with source attribution system for comprehensive confidence scoring.
 */

import {
  AssessmentData,
  ConfidenceLevel,
  DataQuality,
  CurrentState,
  NonTechCurrentState,
} from '../types';
import {
  SourceAttribution,
  TransparentMetric,
  calculateSourceConfidence,
  getConfidenceLevel as getConfidenceLevelFromScore,
} from '../types/source-attribution';

/**
 * Enhanced data quality with source quality factors
 */
export interface EnhancedDataQuality extends DataQuality {
  sourceQualityScore: number; // 0-100
  dataRecencyScore: number; // 0-100
  applicabilityScore: number; // 0-100
  overallScore: number; // 0-100 (weighted average)
  factors: {
    userDataCompleteness: number;
    userDataSpecificity: number;
    benchmarkQuality: number;
    contextMatch: number;
  };
  recommendations: string[];
}

/**
 * Calculate overall data quality score (from original)
 */
export function calculateDataQuality(data: AssessmentData): DataQuality {
  const missingCriticalData: string[] = [];
  let completenessScore = 100;
  let specificityScore = 100;

  // Check completeness of company info (weight: 15%)
  if (!data.companyInfo.name) {
    missingCriticalData.push('Company name');
    completenessScore -= 5;
  }
  if (!data.companyInfo.industry) {
    missingCriticalData.push('Industry');
    completenessScore -= 5;
  }
  if (!data.companyInfo.revenue) {
    missingCriticalData.push('Revenue range');
    completenessScore -= 5;
    specificityScore -= 10;
  }

  // Check completeness of current state (weight: 40%)
  const isTechnical = 'devTeamSize' in data.currentState;

  if (isTechnical) {
    const techState = data.currentState as Partial<CurrentState>;

    if (!techState.devTeamSize || techState.devTeamSize === 0) {
      missingCriticalData.push('Development team size');
      completenessScore -= 15;
    }

    if (!techState.deploymentFrequency) {
      missingCriticalData.push('Deployment frequency');
      completenessScore -= 10;
    }

    if (!techState.avgCycleTime || techState.avgCycleTime === 0) {
      missingCriticalData.push('Average cycle time');
      completenessScore -= 10;
    }

    if (!techState.bugRate || techState.bugRate === 0) {
      specificityScore -= 10;
    }

    if (!techState.devSeniority) {
      specificityScore -= 15;
    }

    if (!techState.painPoints || techState.painPoints.length === 0) {
      missingCriticalData.push('Pain points');
      completenessScore -= 5;
      specificityScore -= 10;
    }
  } else {
    const nonTechState = data.currentState as Partial<NonTechCurrentState>;

    if (!nonTechState.deliverySpeed) {
      missingCriticalData.push('Delivery speed assessment');
      completenessScore -= 15;
    }

    if (!nonTechState.techCompetitiveness) {
      specificityScore -= 15;
    }

    if (!nonTechState.businessChallenges || nonTechState.businessChallenges.length === 0) {
      missingCriticalData.push('Business challenges');
      completenessScore -= 10;
      specificityScore -= 10;
    }
  }

  // Check completeness of goals (weight: 25%)
  if (!data.goals.primaryGoals || data.goals.primaryGoals.length === 0) {
    missingCriticalData.push('Primary goals');
    completenessScore -= 10;
  }

  if (!data.goals.timeline) {
    missingCriticalData.push('Timeline');
    completenessScore -= 8;
  }

  if (!data.goals.budgetRange) {
    missingCriticalData.push('Budget range');
    completenessScore -= 7;
    specificityScore -= 15;
  }

  if (!data.goals.successMetrics || data.goals.successMetrics.length === 0) {
    specificityScore -= 10;
  }

  completenessScore = Math.max(0, completenessScore);
  specificityScore = Math.max(0, specificityScore);

  return {
    completeness: Math.round(completenessScore),
    specificity: Math.round(specificityScore),
    missingCriticalData,
    dataSource: 'self-reported',
  };
}

/**
 * Calculate enhanced confidence with source quality considerations
 */
export function calculateEnhancedConfidence(
  data: AssessmentData,
  sources: SourceAttribution[]
): EnhancedDataQuality {
  // 1. Get base data quality from user input
  const baseQuality = calculateDataQuality(data);

  // 2. Calculate source quality score (average of all sources used)
  const sourceQualityScore = sources.length > 0
    ? sources.reduce((sum, s) => sum + s.confidence, 0) / sources.length
    : 50; // Default if no sources

  // 3. Calculate data recency score
  const dataRecencyScore = calculateRecencyScore(sources);

  // 4. Calculate applicability score (how well benchmarks match user context)
  const applicabilityScore = calculateApplicabilityScore(data, sources);

  // 5. Calculate weighted overall score
  const factors = {
    userDataCompleteness: baseQuality.completeness,
    userDataSpecificity: baseQuality.specificity,
    benchmarkQuality: sourceQualityScore,
    contextMatch: applicabilityScore,
  };

  // Weighted average:
  // - User data completeness: 30%
  // - User data specificity: 25%
  // - Benchmark quality: 30%
  // - Context match: 15%
  const overallScore = Math.round(
    baseQuality.completeness * 0.30 +
    baseQuality.specificity * 0.25 +
    sourceQualityScore * 0.30 +
    applicabilityScore * 0.15
  );

  // 6. Generate recommendations
  const recommendations = generateConfidenceRecommendations(
    baseQuality,
    sourceQualityScore,
    applicabilityScore,
    data
  );

  return {
    ...baseQuality,
    sourceQualityScore: Math.round(sourceQualityScore),
    dataRecencyScore: Math.round(dataRecencyScore),
    applicabilityScore: Math.round(applicabilityScore),
    overallScore,
    factors,
    recommendations,
  };
}

/**
 * Calculate recency score based on source publish dates
 */
function calculateRecencyScore(sources: SourceAttribution[]): number {
  if (sources.length === 0) return 50;

  const currentYear = 2025;
  const scores = sources.map(source => {
    const publishYear = parseInt(source.source.publishDate.substring(0, 4));
    const age = currentYear - publishYear;

    // Recency scoring:
    if (age === 0) return 100; // Current year
    if (age === 1) return 85;  // 1 year old
    if (age === 2) return 65;  // 2 years old
    if (age === 3) return 45;  // 3 years old
    return 25; // 4+ years old
  });

  return scores.reduce((sum, s) => sum + s, 0) / scores.length;
}

/**
 * Calculate how well benchmarks match user's context
 */
function calculateApplicabilityScore(
  data: AssessmentData,
  sources: SourceAttribution[]
): number {
  if (sources.length === 0) return 50;

  let totalScore = 0;
  let scoredSources = 0;

  sources.forEach(source => {
    let score = 100; // Start at 100%

    // Industry match
    if (source.source.industries) {
      const hasIndustryMatch = source.source.industries.some(ind =>
        ind.toLowerCase().includes(data.companyInfo.industry.toLowerCase()) ||
        data.companyInfo.industry.toLowerCase().includes(ind.toLowerCase())
      );

      if (!hasIndustryMatch) {
        score -= 20; // Penalty for industry mismatch
      }
    }

    // Geography match
    if (source.source.geography) {
      const isRelevantGeography =
        source.source.geography === 'brazil' ||
        source.source.geography === 'latam' ||
        source.source.geography === 'global';

      if (!isRelevantGeography) {
        score -= 15; // Penalty for geography mismatch
      }
    }

    // Sample size relevance
    if (source.source.sampleSize) {
      if (source.source.sampleSize < 100) {
        score -= 15; // Small sample size
      } else if (source.source.sampleSize < 500) {
        score -= 5; // Moderate sample size
      }
      // Large sample size (>=500) = no penalty
    }

    totalScore += Math.max(0, score);
    scoredSources++;
  });

  return scoredSources > 0 ? totalScore / scoredSources : 50;
}

/**
 * Generate comprehensive recommendations to improve confidence
 */
function generateConfidenceRecommendations(
  baseQuality: DataQuality,
  sourceQuality: number,
  applicability: number,
  data: AssessmentData
): string[] {
  const recommendations: string[] = [];

  // User data recommendations
  if (baseQuality.completeness < 80) {
    recommendations.push(
      `📊 Dados incompletos: Forneça informações sobre ${baseQuality.missingCriticalData.join(', ').toLowerCase()} para aumentar precisão`
    );
  }

  if (baseQuality.specificity < 70) {
    recommendations.push(
      '🎯 Adicione métricas específicas: bug rates, deployment frequency, team seniority para estimativas mais refinadas'
    );
  }

  // Source quality recommendations
  if (sourceQuality < 70) {
    recommendations.push(
      '⚠️ Benchmarks de média qualidade: Alguns valores usam fontes tier-2. Considere fornecer dados reais para maior confiança.'
    );
  }

  // Applicability recommendations
  if (applicability < 70) {
    recommendations.push(
      `🌍 Mismatch contextual: Benchmarks podem não refletir perfeitamente sua indústria (${data.companyInfo.industry}) ou geografia (Brasil)`
    );
  }

  // Specific field recommendations
  if (baseQuality.missingCriticalData.includes('Budget range')) {
    recommendations.push(
      '💰 Defina budget range para recomendações de ferramentas mais direcionadas e cálculos de ROI mais precisos'
    );
  }

  if (baseQuality.missingCriticalData.includes('Revenue range')) {
    recommendations.push(
      '📈 Compartilhe faixa de receita para cálculos de impacto financeiro baseados em % de revenue'
    );
  }

  const isTechnical = 'devTeamSize' in data.currentState;
  if (isTechnical) {
    const techState = data.currentState as Partial<CurrentState>;

    if (!techState.bugRate) {
      recommendations.push(
        '🐛 Forneça bug rate real (ex: de SonarQube, Jira) para cálculos de qualidade mais precisos'
      );
    }

    if (!techState.devSeniority) {
      recommendations.push(
        '👥 Distribua senioridade do time (junior/mid/senior/lead) para estimativas salariais corretas'
      );
    }
  }

  // Integration recommendation (always show if not connected)
  if (baseQuality.dataSource === 'self-reported') {
    recommendations.push(
      '🔗 Integre GitHub/Jira/DORA metrics para dados objetivos e confiança máxima (não implementado ainda)'
    );
  }

  // If everything is great
  if (recommendations.length === 0) {
    recommendations.push(
      '✅ Excelente qualidade de dados! Suas projeções têm alta confiabilidade.'
    );
  }

  return recommendations;
}

/**
 * Determine confidence level from enhanced score
 */
export function getConfidenceLevel(dataQuality: DataQuality | EnhancedDataQuality): ConfidenceLevel {
  // If enhanced quality, use overall score
  if ('overallScore' in dataQuality) {
    const enhanced = dataQuality as EnhancedDataQuality;
    return getConfidenceLevelFromScore(enhanced.overallScore);
  }

  // Otherwise use original logic
  const avgScore = (dataQuality.completeness + dataQuality.specificity) / 2;

  if (avgScore >= 85 && dataQuality.missingCriticalData.length < 2) {
    return 'high';
  }

  if (avgScore < 60 || dataQuality.missingCriticalData.length > 4) {
    return 'low';
  }

  return 'medium';
}

/**
 * Calculate uncertainty range (preserved from original)
 */
export function calculateUncertaintyRange(
  baseNPV: number,
  confidenceLevel: ConfidenceLevel
): {
  conservativeNPV: number;
  optimisticNPV: number;
  mostLikelyNPV: number;
} {
  let varianceFactor: number;

  switch (confidenceLevel) {
    case 'high':
      varianceFactor = 0.15;
      break;
    case 'medium':
      varianceFactor = 0.25;
      break;
    case 'low':
      varianceFactor = 0.40;
      break;
  }

  return {
    conservativeNPV: Math.round(baseNPV * (1 - varianceFactor)),
    optimisticNPV: Math.round(baseNPV * (1 + varianceFactor)),
    mostLikelyNPV: baseNPV,
  };
}

/**
 * Generate key assumptions (preserved from original with enhancements)
 */
export function generateAssumptions(data: AssessmentData): string[] {
  const assumptions: string[] = [];
  const isTechnical = 'devTeamSize' in data.currentState;

  // Universal assumptions with source references
  assumptions.push(
    '📚 Benchmarks verificados: McKinsey (produtividade), DORA (deployment), Forrester (qualidade), Stack Overflow (tech debt)'
  );
  assumptions.push(
    '🎯 Cenário otimista: Usando percentil 75 (p75) dos benchmarks para projeções C-level'
  );
  assumptions.push(
    '💰 Valores conservadores: 25% produtividade vs 35-45% reportado; multiplicadores de receita 3-5x'
  );

  if (isTechnical) {
    const techState = data.currentState as CurrentState;

    assumptions.push(
      `👥 Time: ${techState.devTeamSize} desenvolvedores`
    );

    if (techState.devSeniority) {
      const seniorCount =
        (techState.devSeniority.senior || 0) + (techState.devSeniority.lead || 0);
      const totalCount =
        (techState.devSeniority.junior || 0) +
        (techState.devSeniority.mid || 0) +
        (techState.devSeniority.senior || 0) +
        (techState.devSeniority.lead || 0);

      if (totalCount > 0) {
        const seniorPercentage = Math.round((seniorCount / totalCount) * 100);
        assumptions.push(
          `🎓 Seniority: ${seniorPercentage}% sênior/lead (impacta velocidade de adoção)`
        );
      }
    } else {
      assumptions.push(
        '⚠️ Seniority não fornecida: Assumido salário mid-level médio'
      );
    }

    if (techState.aiToolsUsage === 'none' || techState.aiToolsUsage === 'exploring') {
      assumptions.push(
        '⏰ Ramp-up: 3-6 meses (time inexperiente com IA)'
      );
    } else {
      assumptions.push(
        '⚡ Ramp-up: 1-3 meses (time com experiência em IA)'
      );
    }

    if (!techState.bugRate) {
      assumptions.push(
        `🐛 Bug rate: Assumido ${data.companyInfo.industry} industry average (DORA) - forneça dados reais para maior precisão`
      );
    }
  } else {
    const nonTechState = data.currentState as Partial<NonTechCurrentState>;

    assumptions.push(
      '📊 Métricas técnicas estimadas a partir de indicadores de negócio'
    );

    if (nonTechState.deliverySpeed === 'very-slow' || nonTechState.deliverySpeed === 'slow') {
      assumptions.push(
        '🚀 Velocidade lenta detectada: Maior potencial de aceleração com IA'
      );
    }

    if (nonTechState.techCompetitiveness === 'behind') {
      assumptions.push(
        '⚠️ Tech competitiveness defasado: Impacto estratégico amplificado'
      );
    }
  }

  // Timeline
  if (data.goals.timeline === '3-months' || data.goals.timeline === '6-months') {
    assumptions.push(
      `⏱️ Timeline agressivo (${data.goals.timeline}): Foco em quick wins e SaaS tools`
    );
  }

  // Budget
  if (!data.goals.budgetRange || data.goals.budgetRange === 'Menor que R$50k') {
    assumptions.push(
      '💵 Budget limitado: Priorizar ferramentas SaaS vs custom development'
    );
  }

  return assumptions;
}

/**
 * Get confidence indicator styling (preserved from original)
 */
export function getConfidenceStyle(level: ConfidenceLevel): {
  color: string;
  bg: string;
  border: string;
  label: string;
  icon: string;
} {
  switch (level) {
    case 'high':
      return {
        color: 'text-neon-green',
        bg: 'bg-neon-green/10',
        border: 'border-neon-green/30',
        label: 'Alta Confiança',
        icon: '✓✓✓',
      };
    case 'medium':
      return {
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        label: 'Confiança Moderada',
        icon: '✓✓',
      };
    case 'low':
      return {
        color: 'text-orange-400',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/30',
        label: 'Confiança Limitada',
        icon: '✓',
      };
  }
}

/**
 * Get confidence improvements (preserved from original)
 */
export function getConfidenceImprovements(dataQuality: DataQuality): string[] {
  const improvements: string[] = [];

  if (dataQuality.completeness < 80) {
    improvements.push(
      'Forneça dados mais completos sobre seu time e processos para projeções mais precisas'
    );
  }

  if (dataQuality.specificity < 70) {
    improvements.push(
      'Inclua métricas específicas (bug rates, test coverage, etc) para estimativas mais refinadas'
    );
  }

  if (dataQuality.missingCriticalData.includes('Budget range')) {
    improvements.push(
      'Defina um range de orçamento para recomendações de ferramentas mais direcionadas'
    );
  }

  if (dataQuality.missingCriticalData.includes('Revenue range')) {
    improvements.push(
      'Compartilhe faixa de receita para cálculos de impacto financeiro mais precisos'
    );
  }

  if (dataQuality.dataSource === 'self-reported') {
    improvements.push(
      'Conecte ferramentas (GitHub, Jira) para dados objetivos e projeções de alta confiança'
    );
  }

  if (improvements.length === 0) {
    improvements.push(
      'Qualidade de dados excelente! Para aumentar ainda mais a confiança, considere integrar dados reais de GitHub/Jira.'
    );
  }

  return improvements;
}
