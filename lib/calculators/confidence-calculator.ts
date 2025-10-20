/**
 * Confidence Level Calculator
 *
 * Inspired by medical diagnostic confidence scoring, this module
 * assesses data quality and assigns confidence levels to ROI projections
 */

import {
  AssessmentData,
  ConfidenceLevel,
  DataQuality,
  CurrentState,
  NonTechCurrentState
} from '../types';

/**
 * Calculate overall data quality score
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
      // Not critical but affects specificity
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

  // Ensure scores don't go below 0
  completenessScore = Math.max(0, completenessScore);
  specificityScore = Math.max(0, specificityScore);

  return {
    completeness: Math.round(completenessScore),
    specificity: Math.round(specificityScore),
    missingCriticalData,
    dataSource: 'self-reported' // Currently all data is self-reported
  };
}

/**
 * Determine confidence level based on data quality
 */
export function getConfidenceLevel(dataQuality: DataQuality): ConfidenceLevel {
  const avgScore = (dataQuality.completeness + dataQuality.specificity) / 2;

  // High confidence: >85% average, <2 missing critical fields
  if (avgScore >= 85 && dataQuality.missingCriticalData.length < 2) {
    return 'high';
  }

  // Low confidence: <60% average or >4 missing critical fields
  if (avgScore < 60 || dataQuality.missingCriticalData.length > 4) {
    return 'low';
  }

  // Medium confidence: everything else
  return 'medium';
}

/**
 * Calculate uncertainty range for ROI projections
 *
 * Based on confidence level, we apply different variance factors
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
      varianceFactor = 0.15; // ±15% range
      break;
    case 'medium':
      varianceFactor = 0.25; // ±25% range
      break;
    case 'low':
      varianceFactor = 0.40; // ±40% range
      break;
  }

  return {
    conservativeNPV: Math.round(baseNPV * (1 - varianceFactor)),
    optimisticNPV: Math.round(baseNPV * (1 + varianceFactor)),
    mostLikelyNPV: baseNPV
  };
}

/**
 * Generate key assumptions list based on assessment data
 */
export function generateAssumptions(data: AssessmentData): string[] {
  const assumptions: string[] = [];
  const isTechnical = 'devTeamSize' in data.currentState;

  // Universal assumptions
  assumptions.push('Estimativas baseadas em benchmarks verificados (McKinsey, Forrester, DORA)');
  assumptions.push('Premissas conservadoras: 25% ganho de produtividade (vs 35-45% reportado)');

  if (isTechnical) {
    const techState = data.currentState as CurrentState;

    assumptions.push(
      `Cálculo baseado em time de ${techState.devTeamSize} desenvolvedores`
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
          `Mix de senioridade: ${seniorPercentage}% sênior/lead - impacta velocidade de adoção`
        );
      }
    }

    if (techState.aiToolsUsage === 'none' || techState.aiToolsUsage === 'exploring') {
      assumptions.push(
        'Assumido tempo de ramp-up de 3-6 meses para ferramentas AI (time inexperiente)'
      );
    } else {
      assumptions.push(
        'Time já tem experiência com AI - assumido ramp-up mais rápido (1-3 meses)'
      );
    }

    if (techState.deploymentFrequency?.includes('monthly') || techState.deploymentFrequency?.includes('quarterly')) {
      assumptions.push(
        'Deployment lento indica gargalos de processo - automação pode ter impacto maior'
      );
    }

  } else {
    const nonTechState = data.currentState as Partial<NonTechCurrentState>;

    assumptions.push('Métricas técnicas estimadas baseadas em indicators de negócio');

    if (nonTechState.deliverySpeed === 'very-slow' || nonTechState.deliverySpeed === 'slow') {
      assumptions.push(
        'Velocidade lenta indica oportunidade significativa de aceleração com AI'
      );
    }

    if (nonTechState.techCompetitiveness === 'behind') {
      assumptions.push(
        'Posição competitiva defasada - assumido impacto estratégico maior da transformação'
      );
    }
  }

  // Timeline assumptions
  if (data.goals.timeline === '3-months' || data.goals.timeline === '6-months') {
    assumptions.push(
      `Timeline agressivo (${data.goals.timeline}) - requer priorização de quick wins`
    );
  }

  // Budget assumptions
  if (!data.goals.budgetRange || data.goals.budgetRange === 'Menor que R$50k') {
    assumptions.push(
      'Orçamento limitado - foco em ferramentas SaaS vs custom development'
    );
  }

  return assumptions;
}

/**
 * Get confidence indicator styling
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
        icon: '✓✓✓'
      };
    case 'medium':
      return {
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        label: 'Confiança Moderada',
        icon: '✓✓'
      };
    case 'low':
      return {
        color: 'text-orange-400',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/30',
        label: 'Confiança Limitada',
        icon: '✓'
      };
  }
}

/**
 * Get recommendations to improve confidence
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
