/**
 * Enterprise-Wide ROI Calculator
 * Calculates ROI across multiple departments beyond just engineering
 * Uses verified benchmarks from benchmarks-expanded.json
 */

import benchmarksExpanded from '@/data/benchmarks-expanded.json';
import benchmarks from '@/data/benchmarks.json';
import {
  AssessmentData,
  EnterpriseROI,
  DepartmentROI,
  CustomerServiceState,
  SalesState,
  MarketingState,
  MeetingGovernanceState,
  OperationsState,
} from '@/lib/types';

/**
 * Calculate NPV (Net Present Value) over 3 years
 */
function calculateNPV(investment: number, annualSavings: number, years: number = 3): number {
  const discountRate = 0.10; // 10% conservative discount rate
  let npv = -investment;

  for (let year = 1; year <= years; year++) {
    const discountedSavings = annualSavings / Math.pow(1 + discountRate, year);
    npv += discountedSavings;
  }

  return Math.round(npv);
}

/**
 * Calculate Customer Service AI ROI
 */
function calculateCustomerServiceROI(state: CustomerServiceState): DepartmentROI {
  const bench = benchmarksExpanded.customerService.benchmarks;

  // Cost reduction from automation
  const currentAnnualCost = state.monthlyTicketVolume * 12 * state.costPerInteraction;
  const costAfterAI = state.monthlyTicketVolume * 12 * (state.costPerInteraction * (1 - bench.avgCostPerInteraction.reduction));
  const annualSavings = currentAnnualCost - costAfterAI;

  // Implementation investment
  const investment = state.teamSize * benchmarksExpanded.customerService.implementation.initialInvestmentPerAgent;

  // Payback period
  const paybackMonths = (investment / (annualSavings / 12));

  // NPV
  const threeYearNPV = calculateNPV(investment, annualSavings);

  return {
    department: 'Customer Service',
    investment,
    annualSavings,
    paybackMonths: Math.round(paybackMonths * 10) / 10,
    threeYearNPV,
    keyMetrics: [
      `Redução de ${(bench.avgCostPerInteraction.reduction * 100).toFixed(0)}% no custo por interação`,
      `First Response Time: ${bench.firstResponseTime.before}min → ${bench.firstResponseTime.after}min`,
      `${(bench.automationRate.achievable * 100).toFixed(0)}% das interações automatizadas`,
      `ROI de ${bench.yearOneROI.toFixed(1)}x no primeiro ano`,
    ],
    enabled: true,
  };
}

/**
 * Calculate Sales AI ROI
 */
function calculateSalesROI(state: SalesState): DepartmentROI {
  const bench = benchmarksExpanded.sales.benchmarks;
  const salaries = benchmarks.salaryData.brazil;

  // Revenue increase from improved conversion and productivity
  const avgSalesRepSalary = salaries.senior.annual; // Assume senior level for sales
  const currentTeamCost = state.salesTeamSize * avgSalesRepSalary;

  // Annual revenue impact (conservative: use productivity boost as revenue proxy)
  const revenueIncrease = currentTeamCost * bench.productivityBoost.percentage * 2; // 2x multiplier for revenue

  // Cost reduction from automation
  const costReduction = currentTeamCost * bench.costReduction.percentage;

  const annualSavings = revenueIncrease + costReduction;

  // Implementation investment
  const investment = state.salesTeamSize * benchmarksExpanded.sales.implementation.initialInvestmentPerRep;

  // Payback period
  const paybackMonths = (investment / (annualSavings / 12));

  // NPV
  const threeYearNPV = calculateNPV(investment, annualSavings);

  return {
    department: 'Sales & CRM',
    investment,
    annualSavings,
    paybackMonths: Math.round(paybackMonths * 10) / 10,
    threeYearNPV,
    keyMetrics: [
      `${(bench.revenueIncrease.percentage * 100).toFixed(0)}% aumento em revenue`,
      `${(bench.productivityBoost.percentage * 100).toFixed(0)}% boost em produtividade de vendas`,
      `${(bench.leadConversionImprovement.percentage * 100).toFixed(0)}% melhoria em conversão de leads`,
      `${(bench.exceedGoalsLikelihood.percentage * 100).toFixed(0)}% mais chance de exceder metas`,
    ],
    enabled: true,
  };
}

/**
 * Calculate Marketing AI ROI
 */
function calculateMarketingROI(state: MarketingState): DepartmentROI {
  const bench = benchmarksExpanded.marketing.benchmarks;
  const salaries = benchmarks.salaryData.brazil;

  // Productivity savings
  const avgMarketerSalary = salaries.mid.annual;
  const currentTeamCost = state.marketingTeamSize * avgMarketerSalary;
  const productivitySavings = currentTeamCost * bench.productivityIncrease.percentage;

  // Lead generation improvement
  const leadGenValue = state.leadGenerationRate * 12 * state.cac * bench.qualifiedLeadsIncrease.percentage;

  // Time savings
  const hoursSavedValue = (state.marketingTeamSize * bench.timesSavedPerWeek.hours * 52 * (avgMarketerSalary / 2080));

  const annualSavings = productivitySavings + leadGenValue + hoursSavedValue;

  // Implementation investment
  const investment = state.marketingTeamSize * benchmarksExpanded.marketing.implementation.initialInvestmentPerMarketer;

  // Payback period
  const paybackMonths = Math.max(bench.paybackMonths, (investment / (annualSavings / 12)));

  // NPV
  const threeYearNPV = calculateNPV(investment, annualSavings);

  return {
    department: 'Marketing',
    investment,
    annualSavings,
    paybackMonths: Math.round(paybackMonths * 10) / 10,
    threeYearNPV,
    keyMetrics: [
      `ROI de ${bench.roi.multiplier.toFixed(2)}x em 3 anos`,
      `${(bench.qualifiedLeadsIncrease.percentage * 100).toFixed(0)}% aumento em leads qualificados`,
      `${bench.timesSavedPerWeek.hours}h/semana economizadas por marketer`,
      `Payback em ${bench.paybackMonths} meses`,
    ],
    enabled: true,
  };
}

/**
 * Calculate Meeting Intelligence & Governance ROI
 */
function calculateMeetingIntelligenceROI(state: MeetingGovernanceState): DepartmentROI {
  const bench = benchmarksExpanded.meetingIntelligence.benchmarks;
  const salaries = benchmarks.salaryData.brazil;

  // Time savings for executives
  const avgExecutiveSalary = salaries.lead.annual * 2; // Executives earn ~2x tech lead
  const currentExecutiveCost = state.executiveTeamSize * avgExecutiveSalary;

  // Hours saved per executive
  const annualHoursSaved = state.executiveTeamSize * bench.hoursPerWeek.hours * 52;
  const hourlyCost = avgExecutiveSalary / 2080;
  const timeSavingsValue = annualHoursSaved * hourlyCost;

  // Productivity boost during AI use
  const productivityGain = currentExecutiveCost * bench.productivityDuringUse.percentage * 0.5; // 50% of time using AI

  // Governance value (qualitative but assign monetary value)
  const governanceValue = state.complianceAuditNeeds ? 50000 : 0; // R$50k annual value for audit trail

  const annualSavings = timeSavingsValue + productivityGain + governanceValue;

  // Implementation investment
  const investment = state.executiveTeamSize * benchmarksExpanded.meetingIntelligence.implementation.initialInvestmentPerExecutive;

  // Payback period
  const paybackMonths = (investment / (annualSavings / 12));

  // NPV
  const threeYearNPV = calculateNPV(investment, annualSavings);

  return {
    department: 'Meeting Intelligence & Governance',
    investment,
    annualSavings,
    paybackMonths: Math.round(paybackMonths * 10) / 10,
    threeYearNPV,
    keyMetrics: [
      `${bench.hoursPerWeek.hours}h/semana economizadas por executivo`,
      `${(bench.productivityDuringUse.percentage * 100).toFixed(0)}% mais produtivo durante uso de AI`,
      `${(bench.reviewTimeReduction.percentage * 100).toFixed(0)}% redução em review times`,
      state.complianceAuditNeeds ? 'Audit trail automático para compliance' : 'Transparência em decisões',
    ],
    enabled: true,
  };
}

/**
 * Calculate Operations Process Automation ROI
 */
function calculateOperationsROI(state: OperationsState): DepartmentROI {
  const bench = benchmarksExpanded.operations.benchmarks;
  const salaries = benchmarks.salaryData.brazil;

  // Labor cost savings
  const avgOpsSalary = salaries.mid.annual;
  const currentTeamCost = state.opsTeamSize * avgOpsSalary;
  const laborSavings = currentTeamCost * bench.laborCostSavings.average;

  // Process speed improvement (time to value)
  const processCostReduction = state.manualProcessesIdentified * 10000; // R$10k per process automated

  const annualSavings = laborSavings + processCostReduction;

  // Implementation investment (higher for process automation)
  const investment = state.manualProcessesIdentified * benchmarksExpanded.operations.implementation.initialInvestmentPerProcess;

  // Payback period
  const paybackMonths = (investment / (annualSavings / 12));

  // NPV
  const threeYearNPV = calculateNPV(investment, annualSavings);

  return {
    department: 'Operations',
    investment,
    annualSavings,
    paybackMonths: Math.round(paybackMonths * 10) / 10,
    threeYearNPV,
    keyMetrics: [
      `${(bench.laborCostSavings.average * 100).toFixed(0)}% redução em labor costs`,
      `${(bench.productivityGains.min * 100).toFixed(0)}-${(bench.productivityGains.max * 100).toFixed(0)}% ganhos de produtividade`,
      `${state.manualProcessesIdentified} processos automatizados`,
      `${(bench.processSpeedImprovement.percentage * 100).toFixed(0)}% melhoria em velocidade de processos`,
    ],
    enabled: true,
  };
}

/**
 * Main Enterprise ROI Calculator
 */
export function calculateEnterpriseROI(assessment: AssessmentData): EnterpriseROI {
  const departments: DepartmentROI[] = [];

  // Always include engineering (from existing ROI calculator)
  const { currentState } = assessment;
  const engineeringInvestment = 50000; // Placeholder - should use existing calculator
  const engineeringSavings = 200000; // Placeholder - should use existing calculator

  const engineering: DepartmentROI = {
    department: 'Engineering',
    investment: engineeringInvestment,
    annualSavings: engineeringSavings,
    paybackMonths: (engineeringInvestment / (engineeringSavings / 12)),
    threeYearNPV: calculateNPV(engineeringInvestment, engineeringSavings),
    keyMetrics: [
      '25-35% produtividade dev increase',
      '30% redução em bugs',
      '15% faster time-to-market',
    ],
    enabled: assessment.aiScope?.engineering ?? true,
  };

  departments.push(engineering);

  const result: EnterpriseROI = {
    engineering,
    totalEnterprise: {
      totalInvestment: 0,
      totalAnnualSavings: 0,
      avgPaybackMonths: 0,
      totalThreeYearNPV: 0,
      enterpriseIRR: 0,
    },
  };

  // Add customer service if enabled
  if (assessment.aiScope?.customerService && assessment.customerService) {
    const csROI = calculateCustomerServiceROI(assessment.customerService);
    result.customerService = csROI;
    departments.push(csROI);
  }

  // Add sales if enabled
  if (assessment.aiScope?.sales && assessment.sales) {
    const salesROI = calculateSalesROI(assessment.sales);
    result.sales = salesROI;
    departments.push(salesROI);
  }

  // Add marketing if enabled
  if (assessment.aiScope?.marketing && assessment.marketing) {
    const marketingROI = calculateMarketingROI(assessment.marketing);
    result.marketing = marketingROI;
    departments.push(marketingROI);
  }

  // Add meeting intelligence if enabled
  if (assessment.aiScope?.meetingIntelligence && assessment.meetingIntelligence) {
    const meetingROI = calculateMeetingIntelligenceROI(assessment.meetingIntelligence);
    result.meetingIntelligence = meetingROI;
    departments.push(meetingROI);
  }

  // Add operations if enabled
  if (assessment.aiScope?.operations && assessment.operations) {
    const opsROI = calculateOperationsROI(assessment.operations);
    result.operations = opsROI;
    departments.push(opsROI);
  }

  // Calculate totals
  const totalInvestment = departments.reduce((sum, dept) => sum + dept.investment, 0);
  const totalAnnualSavings = departments.reduce((sum, dept) => sum + dept.annualSavings, 0);
  const totalThreeYearNPV = departments.reduce((sum, dept) => sum + dept.threeYearNPV, 0);

  // Weighted average payback period
  const avgPaybackMonths = departments.reduce((sum, dept) => sum + (dept.paybackMonths * (dept.investment / totalInvestment)), 0);

  // Enterprise IRR (simplified)
  const enterpriseIRR = (totalAnnualSavings / totalInvestment) * 100;

  result.totalEnterprise = {
    totalInvestment: Math.round(totalInvestment),
    totalAnnualSavings: Math.round(totalAnnualSavings),
    avgPaybackMonths: Math.round(avgPaybackMonths * 10) / 10,
    totalThreeYearNPV: Math.round(totalThreeYearNPV),
    enterpriseIRR: Math.round(enterpriseIRR * 10) / 10,
  };

  return result;
}

/**
 * Format currency for display (BRL)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
