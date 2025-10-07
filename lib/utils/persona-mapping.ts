/**
 * Persona Mapping & Translation Layer
 * Maps non-technical business responses to technical data structure
 */

import { NonTechCurrentState, NonTechGoals, CurrentState, Goals } from '@/lib/types';

/**
 * Map non-technical current state to technical structure
 */
export function mapNonTechCurrentState(
  nonTech: NonTechCurrentState,
  companySize: 'startup' | 'scaleup' | 'enterprise'
): CurrentState {
  // Estimate dev team size based on company size and innovation level
  const devTeamSizeMap = {
    startup: { low: 5, medium: 8, high: 12 },
    scaleup: { low: 15, medium: 25, high: 40 },
    enterprise: { low: 50, medium: 100, high: 200 },
  };
  const devTeamSize = devTeamSizeMap[companySize][nonTech.innovationLevel];

  // Map delivery speed to deployment frequency
  const deploymentFrequencyMap = {
    'very-slow': 'quarterly',
    'slow': 'monthly',
    'moderate': 'biweekly',
    'fast': 'weekly',
    'very-fast': 'daily',
  };

  // Map delivery speed to cycle time (days)
  const cycleTimeMap = {
    'very-slow': 45,
    'slow': 30,
    'moderate': 14,
    'fast': 7,
    'very-fast': 3,
  };

  // Map market responsiveness to cycle time adjustment
  const responsivenessMultiplier = {
    'very-slow': 1.5,
    'slow': 1.2,
    'moderate': 1.0,
    'fast': 0.8,
    'very-fast': 0.6,
  };

  // Calculate adjusted cycle time
  const baseCycleTime = cycleTimeMap[nonTech.deliverySpeed];
  const avgCycleTime = Math.round(baseCycleTime * responsivenessMultiplier[nonTech.marketResponsiveness]);

  // Map tech competitiveness to AI tools usage
  const aiToolsUsageMap = {
    behind: 'none',
    average: 'exploring',
    competitive: 'piloting',
    leading: 'production',
    unknown: 'none',
  } as const;

  // Map business challenges to pain points
  const challengeToPainPointMap: { [key: string]: string[] } = {
    'Pressão competitiva crescente': ['Entrega lenta de features', 'Baixa produtividade dev'],
    'Dificuldade em inovar rapidamente': ['Acúmulo de débito técnico', 'Ciclos longos de code review'],
    'Demandas dos clientes não atendidas': ['Entrega lenta de features', 'Alta taxa de bugs'],
    'Custos operacionais elevados': ['Baixa produtividade dev', 'Sistemas legados limitantes'],
    'Perda de market share': ['Entrega lenta de features', 'Ansiedade em deploy'],
    'Dificuldade em atrair/reter talentos': ['Dificuldade em atrair talentos', 'Sistemas legados limitantes'],
    'Sistemas e processos legados': ['Sistemas legados limitantes', 'Acúmulo de débito técnico'],
    'Baixa satisfação do cliente': ['Alta taxa de bugs', 'Qualidade de código ruim'],
    'Incapacidade de escalar operações': ['Baixa produtividade dev', 'Silos de conhecimento'],
    'Regulação e compliance complexos': ['Qualidade de código ruim', 'Ansiedade em deploy'],
  };

  const painPoints = Array.from(
    new Set(
      nonTech.businessChallenges.flatMap(
        (challenge) => challengeToPainPointMap[challenge] || []
      )
    )
  ).slice(0, 5); // Limit to 5 pain points

  // Estimate seniority distribution based on talent attraction and company size
  const getSeniorityDistribution = () => {
    const talent = nonTech.talentAttraction;
    if (talent === 'excellent' || talent === 'good') {
      return { junior: 0.2, mid: 0.35, senior: 0.3, lead: 0.15 };
    } else if (talent === 'moderate') {
      return { junior: 0.3, mid: 0.4, senior: 0.2, lead: 0.1 };
    } else {
      return { junior: 0.4, mid: 0.4, senior: 0.15, lead: 0.05 };
    }
  };

  const seniorityRatios = getSeniorityDistribution();
  const devSeniority = {
    junior: Math.round(devTeamSize * seniorityRatios.junior),
    mid: Math.round(devTeamSize * seniorityRatios.mid),
    senior: Math.round(devTeamSize * seniorityRatios.senior),
    lead: Math.round(devTeamSize * seniorityRatios.lead),
  };

  // Estimate bug rate based on quality indicators
  const bugRateMap = {
    'very-slow': 18,
    'slow': 16,
    'moderate': 14,
    'fast': 10,
    'very-fast': 8,
  };
  const bugRate = nonTech.businessChallenges.includes('Baixa satisfação do cliente')
    ? bugRateMap[nonTech.deliverySpeed] + 5
    : bugRateMap[nonTech.deliverySpeed];

  return {
    devTeamSize,
    devSeniority,
    currentTools: [],
    deploymentFrequency: deploymentFrequencyMap[nonTech.deliverySpeed],
    avgCycleTime,
    bugRate,
    aiToolsUsage: aiToolsUsageMap[nonTech.techCompetitiveness],
    painPoints,
  };
}

/**
 * Map non-technical goals to technical structure
 */
export function mapNonTechGoals(nonTech: NonTechGoals): Goals {
  // Map business goals to technical goals
  const businessToTechGoalsMap: { [key: string]: string } = {
    'Crescimento de receita': 'Acelerar time-to-market',
    'Vantagem competitiva sustentável': 'Habilitar inovação de produto',
    'Eficiência operacional': 'Aumentar produtividade dev',
    'Melhor experiência do cliente': 'Melhorar qualidade de código',
    'Redução de custos operacionais': 'Aumentar produtividade dev',
    'Expansão para novos mercados': 'Acelerar time-to-market',
    'Inovação em produtos/serviços': 'Habilitar inovação de produto',
    'Transformação digital': 'Modernizar práticas dev',
    'Atração e retenção de talentos': 'Atrair e reter talentos',
    'Mitigação de riscos competitivos': 'Escalar org de engenharia',
  };

  const primaryGoals = Array.from(
    new Set(
      nonTech.businessGoals.map(
        (goal) => businessToTechGoalsMap[goal] || 'Aumentar produtividade dev'
      )
    )
  ).slice(0, 4);

  // Map business metrics to technical metrics
  const businessToTechMetricsMap: { [key: string]: string } = {
    'Aumento de receita anual': 'Taxa de entrega de features',
    'Market share': 'Lead time para mudanças',
    'Satisfação do cliente (NPS/CSAT)': 'Taxa de escape de bugs',
    'Redução de custos operacionais': 'Velocidade dev (story points/sprint)',
    'Tempo de lançamento de produtos': 'Lead time para mudanças',
    'Taxa de retenção de clientes': 'Taxa de escape de bugs',
    'Produtividade geral da empresa': 'Velocidade dev (story points/sprint)',
    'Retorno sobre investimento (ROI)': 'Lead time para mudanças',
    'Margem de lucro': 'Velocidade dev (story points/sprint)',
    'Valor de marca e reputação': 'Taxa de escape de bugs',
    'Taxa de inovação': 'Tempo em inovação vs. manutenção',
    'Employee satisfaction': 'Satisfação do dev (NPS)',
  };

  const successMetrics = Array.from(
    new Set(
      nonTech.businessMetrics.map(
        (metric) => businessToTechMetricsMap[metric] || 'Velocidade dev (story points/sprint)'
      )
    )
  ).slice(0, 5);

  // Add competitive context based on strategic priority
  const competitiveThreats =
    nonTech.strategicPriority === 'critical' || nonTech.strategicPriority === 'high'
      ? 'Alta prioridade estratégica indica pressão competitiva significativa e necessidade urgente de transformação.'
      : nonTech.strategicPriority === 'medium'
      ? 'Prioridade média sugere ambiente competitivo moderado com oportunidade de ganhos incrementais.'
      : 'Fase exploratória focada em aprendizado e experimentação.';

  return {
    primaryGoals,
    timeline: nonTech.timeline,
    budgetRange: nonTech.budgetRange,
    successMetrics,
    competitiveThreats,
  };
}

/**
 * Determine if persona is technical or non-technical
 */
export function isTechnicalPersona(
  persona: string
): boolean {
  return persona === 'engineering-tech' || persona === 'it-devops';
}

/**
 * Get persona display name
 */
export function getPersonaDisplayName(persona: string): string {
  const displayNames: { [key: string]: string } = {
    'board-executive': 'Board Member / C-Level Executive',
    'finance-ops': 'Finance / Operations Executive',
    'product-business': 'Product / Business Leader',
    'engineering-tech': 'Engineering / Tech Leader',
    'it-devops': 'IT / DevOps Manager',
  };
  return displayNames[persona] || persona;
}
