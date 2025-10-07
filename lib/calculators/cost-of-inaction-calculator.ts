/**
 * Cost of Inaction Calculator
 * Calculates the financial and strategic costs of NOT implementing AI
 */

import { AssessmentData, CostOfInactionAnalysis, InactionCost } from '@/lib/types';

/**
 * Calculate annual salary cost per developer
 */
function calculateAvgDevSalary(size: string): number {
  const salaries = {
    startup: 120000,
    scaleup: 150000,
    enterprise: 180000,
  };
  return salaries[size as keyof typeof salaries] || 150000;
}

/**
 * Calculate opportunity cost of slower development
 */
function calculateSlowDevelopmentCost(assessmentData: AssessmentData): InactionCost {
  const { currentState, companyInfo } = assessmentData;
  const devTeamSize = currentState.devTeamSize;
  const avgSalary = calculateAvgDevSalary(companyInfo.size);

  // Conservative estimate: competitors with AI are 25% faster
  // This means you need 25% more people to keep pace, OR you fall behind
  const productivityGap = 0.25;
  const wastedCapacity = devTeamSize * productivityGap * avgSalary;

  return {
    category: 'Perda de Produtividade',
    annualCost: wastedCapacity,
    threeYearCost: wastedCapacity * 3,
    description: `Seus concorrentes que usam AI são ~25% mais produtivos. Isso significa que sua equipe está efetivamente trabalhando com 25% menos capacidade vs. competidores AI-enabled.`,
    icon: 'productivity',
  };
}

/**
 * Calculate cost of delayed time-to-market
 */
function calculateTimeToMarketCost(assessmentData: AssessmentData): InactionCost {
  const { companyInfo, currentState } = assessmentData;

  // Estimate revenue impact based on company size
  const annualRevenue = {
    startup: 2000000,
    scaleup: 20000000,
    enterprise: 100000000,
  }[companyInfo.size] || 20000000;

  // Conservative estimate: 2-3 months delay in feature launches = 5-8% revenue impact
  const delayedFeatures = currentState.deploymentFrequency === 'monthly' ? 3 :
                          currentState.deploymentFrequency === 'quarterly' ? 2 :
                          currentState.deploymentFrequency === 'yearly' ? 1 : 4;

  const revenueImpactRate = 0.06; // 6% conservative
  const annualCost = annualRevenue * revenueImpactRate;

  return {
    category: 'Atraso em Time-to-Market',
    annualCost,
    threeYearCost: annualCost * 3,
    description: `Lançamentos atrasados significam oportunidades perdidas. Empresas AI-first lançam features 40% mais rápido, capturando market share enquanto você ainda está desenvolvendo.`,
    icon: 'clock',
  };
}

/**
 * Calculate cost of quality issues and tech debt
 */
function calculateQualityCost(assessmentData: AssessmentData): InactionCost {
  const { currentState, companyInfo } = assessmentData;
  const devTeamSize = currentState.devTeamSize;
  const avgSalary = calculateAvgDevSalary(companyInfo.size);

  // Average developer spends 20-30% of time on bug fixes and tech debt
  // AI tools reduce this by 30-40%
  const timeOnMaintenance = 0.25;
  const aiReduction = 0.35;
  const potentialSavings = devTeamSize * avgSalary * timeOnMaintenance * aiReduction;

  return {
    category: 'Débito Técnico & Qualidade',
    annualCost: potentialSavings,
    threeYearCost: potentialSavings * 3.2, // Compounds over time
    description: `Cada mês sem AI, seu tech debt cresce. Times com AI reduzem bugs em 30-40% e gastam menos tempo em manutenção, liberando capacidade para inovação.`,
    icon: 'bug',
  };
}

/**
 * Calculate talent acquisition and retention costs
 */
function calculateTalentCost(assessmentData: AssessmentData): InactionCost {
  const { currentState, companyInfo } = assessmentData;
  const devTeamSize = currentState.devTeamSize;
  const avgSalary = calculateAvgDevSalary(companyInfo.size);

  // Cost to replace a developer: 6-9 months salary (recruiting + ramp-up)
  const replacementCost = avgSalary * 0.75;

  // Developer turnover increases by 15-25% when tools are outdated
  // Assume baseline 12% annual turnover, increases to 18% without AI
  const baselineTurnover = 0.12;
  const increasedTurnover = 0.18;
  const additionalAttrition = increasedTurnover - baselineTurnover;

  const annualCost = devTeamSize * additionalAttrition * replacementCost;

  return {
    category: 'Atração & Retenção de Talentos',
    annualCost,
    threeYearCost: annualCost * 3,
    description: `Desenvolvedores top-tier querem trabalhar com tecnologia de ponta. Empresas sem AI moderno têm 40% mais dificuldade em atrair e reter talentos, resultando em maior turnover.`,
    icon: 'users',
  };
}

/**
 * Calculate competitive disadvantage cost
 */
function calculateCompetitiveCost(assessmentData: AssessmentData): InactionCost {
  const { companyInfo, currentState, goals } = assessmentData;

  // Estimate based on strategic priority and competitive threats
  const annualRevenue = {
    startup: 2000000,
    scaleup: 20000000,
    enterprise: 100000000,
  }[companyInfo.size] || 20000000;

  // Conservative market share loss: 1-3% per year to AI-enabled competitors
  const marketShareLoss = 0.015; // 1.5%
  const annualCost = annualRevenue * marketShareLoss;

  return {
    category: 'Desvantagem Competitiva',
    annualCost,
    threeYearCost: annualCost * 3.5, // Accelerates over time
    description: `Enquanto você espera, competidores AI-enabled ganham vantagens estruturais. Empresas que adotam AI primeiro capturam 25-30% mais market share nos primeiros 3 anos.`,
    icon: 'trending-down',
  };
}

/**
 * Generate Cost of Inaction Analysis
 */
export function generateCostOfInaction(assessmentData: AssessmentData): CostOfInactionAnalysis {
  const costs: InactionCost[] = [
    calculateSlowDevelopmentCost(assessmentData),
    calculateTimeToMarketCost(assessmentData),
    calculateQualityCost(assessmentData),
    calculateTalentCost(assessmentData),
    calculateCompetitiveCost(assessmentData),
  ];

  const totalAnnualCost = costs.reduce((sum, cost) => sum + cost.annualCost, 0);
  const totalThreeYearCost = costs.reduce((sum, cost) => sum + cost.threeYearCost, 0);

  // Compare to competitors who ARE using AI
  const opportunityCostVsCompetitors = totalThreeYearCost * 1.25; // 25% additional opportunity cost

  const summary = `Não agir tem um custo real. Em 3 anos, o custo de inação pode chegar a ${formatCurrency(totalThreeYearCost)}, ` +
    `sem contar a vantagem estrutural que competidores AI-enabled ganharão. ` +
    `Cada trimestre de espera amplia o gap competitivo.`;

  return {
    totalAnnualCost,
    totalThreeYearCost,
    opportunityCostVsCompetitors,
    costs,
    summary,
  };
}

/**
 * Helper to format currency
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
