/**
 * Risk Matrix Calculator
 * Analyzes assessment data to identify specific risks facing the organization
 */

import { AssessmentData, RiskMatrix, Risk } from '@/lib/types';

/**
 * Analyze technology risks based on current state
 */
function analyzeTechnologyRisks(assessmentData: AssessmentData): Risk[] {
  const { currentState } = assessmentData;
  const risks: Risk[] = [];

  // Legacy tools risk
  const hasModernTools = currentState.currentTools.some(tool =>
    ['copilot', 'cursor', 'tabnine', 'codeium'].some(modern => tool.toLowerCase().includes(modern))
  );

  if (!hasModernTools && currentState.aiToolsUsage === 'none') {
    risks.push({
      id: 'tech-legacy-tools',
      category: 'technology',
      title: 'Ferramentas de Desenvolvimento Defasadas',
      description: 'Time trabalhando sem ferramentas AI modernas enquanto competidores aumentam produtividade em 25-40%.',
      impact: 'high',
      probability: 'high',
      timeframe: 'immediate',
      mitigationStrategy: 'Implementar piloto com GitHub Copilot ou Cursor em 2-4 semanas. Começar com 20% do time (early adopters) e expandir baseado em métricas.',
      relatedToAssessment: ['currentTools', 'aiToolsUsage'],
    });
  }

  // Slow deployment frequency
  if (currentState.deploymentFrequency === 'quarterly' || currentState.deploymentFrequency === 'yearly') {
    risks.push({
      id: 'tech-slow-deployment',
      category: 'technology',
      title: 'Frequência de Deploy Crítica',
      description: 'Deploys infrequentes indicam débito técnico acumulado e processos manuais. Times high-performing fazem deploys múltiplas vezes por dia.',
      impact: 'high',
      probability: 'high',
      timeframe: 'short-term',
      mitigationStrategy: 'Automatizar pipeline CI/CD com AI-powered testing. Implementar feature flags e deployment incremental.',
      relatedToAssessment: ['deploymentFrequency'],
    });
  }

  // Long cycle times
  if (currentState.avgCycleTime > 7) {
    risks.push({
      id: 'tech-long-cycles',
      category: 'technology',
      title: 'Ciclos de Desenvolvimento Longos',
      description: `Cycle time de ${currentState.avgCycleTime} dias está acima do benchmark de elite (<1 dia). Indica gargalos em code review, testing ou aprovações.`,
      impact: 'medium',
      probability: 'high',
      timeframe: 'short-term',
      mitigationStrategy: 'Implementar AI-assisted code review, automated testing e continuous integration para reduzir cycle time em 50-70%.',
      relatedToAssessment: ['avgCycleTime'],
    });
  }

  return risks;
}

/**
 * Analyze competitive risks
 */
function analyzeCompetitiveRisks(assessmentData: AssessmentData): Risk[] {
  const { goals, currentState, companyInfo } = assessmentData;
  const risks: Risk[] = [];

  // Check for explicit competitive threats
  if (goals.competitiveThreats && goals.competitiveThreats.length > 50) {
    risks.push({
      id: 'comp-direct-threat',
      category: 'competition',
      title: 'Ameaças Competitivas Identificadas',
      description: 'Competidores já estão se movendo. Cada mês de atraso amplia o gap tecnológico e competitivo.',
      impact: 'critical',
      probability: 'high',
      timeframe: 'immediate',
      mitigationStrategy: 'Acelerar timeline de implementação. Focar em quick wins (30-60 dias) para começar a fechar o gap imediatamente.',
      relatedToAssessment: ['competitiveThreats'],
    });
  }

  // Market responsiveness risk
  if (assessmentData.nonTechData?.currentState?.marketResponsiveness === 'very-slow' ||
      assessmentData.nonTechData?.currentState?.marketResponsiveness === 'slow') {
    risks.push({
      id: 'comp-market-speed',
      category: 'competition',
      title: 'Velocidade de Resposta ao Mercado Insuficiente',
      description: 'Incapacidade de responder rapidamente a mudanças de mercado significa perda de oportunidades para competidores mais ágeis.',
      impact: 'high',
      probability: 'high',
      timeframe: 'short-term',
      mitigationStrategy: 'AI pode reduzir time-to-market em 40-50%. Implementar rapid prototyping com AI-assisted development.',
      relatedToAssessment: ['marketResponsiveness'],
    });
  }

  // Tech competitiveness risk
  if (assessmentData.nonTechData?.currentState?.techCompetitiveness === 'behind') {
    risks.push({
      id: 'comp-tech-gap',
      category: 'competition',
      title: 'Gap Tecnológico vs. Concorrentes',
      description: 'Estar significativamente atrás em adoção tecnológica cria desvantagem estrutural difícil de reverter.',
      impact: 'critical',
      probability: 'high',
      timeframe: 'immediate',
      mitigationStrategy: 'Transformação acelerada é crítica. Focar em áreas de maior impacto primeiro para começar a fechar o gap.',
      relatedToAssessment: ['techCompetitiveness'],
    });
  }

  return risks;
}

/**
 * Analyze talent risks
 */
function analyzeTalentRisks(assessmentData: AssessmentData): Risk[] {
  const { currentState } = assessmentData;
  const risks: Risk[] = [];

  // Team seniority imbalance
  const juniorRatio = currentState.devSeniority.junior / currentState.devTeamSize;
  const seniorRatio = (currentState.devSeniority.senior + currentState.devSeniority.lead) / currentState.devTeamSize;

  if (juniorRatio > 0.4 && seniorRatio < 0.2) {
    risks.push({
      id: 'talent-seniority-gap',
      category: 'talent',
      title: 'Desequilíbrio de Senioridade',
      description: 'Time muito júnior sem seniores suficientes pode levar a decisões de arquitetura ruins e acúmulo de débito técnico.',
      impact: 'high',
      probability: 'medium',
      timeframe: 'medium-term',
      mitigationStrategy: 'AI pode atuar como "force multiplier" para juniors, fornecendo guidance e best practices. Reduz necessidade de contratação imediata de seniores (que é caro e lento).',
      relatedToAssessment: ['devSeniority'],
    });
  }

  // Talent attraction difficulty
  if (assessmentData.nonTechData?.currentState?.talentAttraction === 'difficult') {
    risks.push({
      id: 'talent-attraction',
      category: 'talent',
      title: 'Dificuldade em Atrair Talentos',
      description: 'Não conseguir atrair desenvolvedores top-tier limita capacidade de inovação e crescimento. Talentos querem trabalhar com tecnologia moderna.',
      impact: 'high',
      probability: 'high',
      timeframe: 'short-term',
      mitigationStrategy: 'Implementar AI tools modernas torna a empresa mais atrativa para talentos. 67% dos developers consideram ferramentas de AI um fator decisivo na escolha de empregador.',
      relatedToAssessment: ['talentAttraction'],
    });
  }

  return risks;
}

/**
 * Analyze operational risks
 */
function analyzeOperationalRisks(assessmentData: AssessmentData): Risk[] {
  const { currentState, goals } = assessmentData;
  const risks: Risk[] = [];

  // High bug rate
  if (currentState.bugRate && currentState.bugRate > 15) {
    risks.push({
      id: 'ops-quality',
      category: 'operational',
      title: 'Taxa de Bugs Acima do Aceitável',
      description: `Bug rate de ${currentState.bugRate} bugs/1000 LOC está acima do benchmark da indústria (5-10). Impacta confiabilidade e customer satisfaction.`,
      impact: 'medium',
      probability: 'high',
      timeframe: 'immediate',
      mitigationStrategy: 'AI-powered testing e code review podem reduzir bugs em 30-40%. Implementar static analysis com AI.',
      relatedToAssessment: ['bugRate'],
    });
  }

  // Innovation capacity
  if (assessmentData.nonTechData?.currentState?.innovationLevel === 'low') {
    risks.push({
      id: 'ops-innovation',
      category: 'operational',
      title: 'Baixa Capacidade de Inovação',
      description: 'Time focado principalmente em manutenção não consegue inovar. Risco de estagnação e perda de relevância de mercado.',
      impact: 'critical',
      probability: 'high',
      timeframe: 'medium-term',
      mitigationStrategy: 'AI pode reduzir tempo em manutenção em 30-50%, liberando capacidade para inovação. Automatizar tarefas repetitivas.',
      relatedToAssessment: ['innovationLevel'],
    });
  }

  return risks;
}

/**
 * Analyze market/strategic risks
 */
function analyzeMarketRisks(assessmentData: AssessmentData): Risk[] {
  const { goals } = assessmentData;
  const risks: Risk[] = [];

  // Strategic priority misalignment
  if (assessmentData.nonTechData?.goals?.strategicPriority === 'critical' &&
      goals.timeline === '18-months') {
    risks.push({
      id: 'market-urgency',
      category: 'market',
      title: 'Desalinhamento entre Urgência e Timeline',
      description: 'Iniciativa marcada como "crítica" mas com timeline longo pode indicar falta de senso de urgência. Mercado não espera.',
      impact: 'high',
      probability: 'medium',
      timeframe: 'immediate',
      mitigationStrategy: 'Considerar abordagem faseada com quick wins em 30-60 dias enquanto constrói transformação de longo prazo.',
      relatedToAssessment: ['strategicPriority', 'timeline'],
    });
  }

  // Delivery speed
  if (assessmentData.nonTechData?.currentState?.deliverySpeed === 'very-slow') {
    risks.push({
      id: 'market-speed',
      category: 'market',
      title: 'Velocidade de Entrega Crítica',
      description: 'Levar meses ou trimestres para lançar significa perder janelas de mercado. First-mover advantage é real.',
      impact: 'critical',
      probability: 'high',
      timeframe: 'immediate',
      mitigationStrategy: 'AI-accelerated development pode reduzir time-to-market em 40-60%. Focar em agilidade primeiro.',
      relatedToAssessment: ['deliverySpeed'],
    });
  }

  return risks;
}

/**
 * Calculate overall risk score
 */
function calculateRiskScore(risks: Risk[]): number {
  const weights = {
    impact: {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4,
    },
    probability: {
      low: 1,
      medium: 2,
      high: 3,
    },
  };

  const totalScore = risks.reduce((sum, risk) => {
    const impactScore = weights.impact[risk.impact];
    const probabilityScore = weights.probability[risk.probability];
    return sum + (impactScore * probabilityScore);
  }, 0);

  // Normalize to 0-100 scale
  const maxPossibleScore = risks.length * 12; // 4 (critical) * 3 (high)
  return maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
}

/**
 * Determine risk level from score
 */
function getRiskLevel(score: number): 'low' | 'moderate' | 'high' | 'critical' {
  if (score >= 75) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'moderate';
  return 'low';
}

/**
 * Generate Risk Matrix
 */
export function generateRiskMatrix(assessmentData: AssessmentData): RiskMatrix {
  const risks: Risk[] = [
    ...analyzeTechnologyRisks(assessmentData),
    ...analyzeCompetitiveRisks(assessmentData),
    ...analyzeTalentRisks(assessmentData),
    ...analyzeOperationalRisks(assessmentData),
    ...analyzeMarketRisks(assessmentData),
  ];

  // Sort risks by severity (impact * probability)
  const riskSeverity = (risk: Risk) => {
    const impactScore = { low: 1, medium: 2, high: 3, critical: 4 }[risk.impact];
    const probScore = { low: 1, medium: 2, high: 3 }[risk.probability];
    return impactScore * probScore;
  };

  risks.sort((a, b) => riskSeverity(b) - riskSeverity(a));

  const overallRiskScore = calculateRiskScore(risks);
  const riskLevel = getRiskLevel(overallRiskScore);

  const criticalCount = risks.filter(r => r.impact === 'critical').length;
  const highCount = risks.filter(r => r.impact === 'high').length;

  let summary = '';
  if (riskLevel === 'critical') {
    summary = `Situação de alto risco identificada. ${criticalCount} riscos críticos e ${highCount} riscos altos detectados. ` +
      `Ação imediata é necessária para evitar perda significativa de competitividade.`;
  } else if (riskLevel === 'high') {
    summary = `Riscos significativos identificados que podem impactar competitividade. ${highCount} riscos de alto impacto requerem atenção prioritária.`;
  } else if (riskLevel === 'moderate') {
    summary = `Riscos moderados identificados. Agir agora previne que esses riscos se tornem críticos nos próximos 6-12 meses.`;
  } else {
    summary = `Perfil de risco controlado, mas é importante manter vigilância e continuar evoluindo para não ficar para trás.`;
  }

  return {
    overallRiskScore,
    riskLevel,
    risks,
    summary,
  };
}
