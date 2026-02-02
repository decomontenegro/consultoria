/**
 * Enterprise-Wide ROI Calculator V2
 *
 * Complete refactoring to use verified industry benchmarks with full transparency.
 * Integrates with ROI Calculator V2 for Engineering and industry-benchmark-data for other departments.
 */

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
import { calculateROIV2 } from './roi-calculator-v2';
import { getDepartmentBenchmarks, hasRealDepartmentData } from '../utils/industry-benchmark-data';
import { calculateRangeFromValue, RangeResult } from './range-calculator';
import { SourceAttribution } from '../types/source-attribution';

/**
 * Calculate NPV with discount rate
 */
function calculateNPV(investment: number, annualSavings: number, years: number = 3): number {
  const discountRate = 0.10;
  let npv = -investment;

  for (let year = 1; year <= years; year++) {
    const discountedSavings = annualSavings / Math.pow(1 + discountRate, year);
    npv += discountedSavings;
  }

  return Math.round(npv);
}

/**
 * Department ROI with transparency
 */
interface TransparentDepartmentROI extends DepartmentROI {
  range?: RangeResult;
  sources?: SourceAttribution[];
  confidence?: number;
  disclaimer?: string;
}

/**
 * Calculate Customer Service ROI with verified benchmarks
 */
function calculateCustomerServiceROI(
  state: CustomerServiceState | undefined,
  companySize: 'startup' | 'scaleup' | 'enterprise',
  industry: string
): TransparentDepartmentROI {
  const benchmarks = getDepartmentBenchmarks(companySize, industry);
  const csBenchmark = benchmarks.customerService;

  if (!csBenchmark) {
    throw new Error('Customer Service benchmarks not available');
  }

  // Use user data if provided, otherwise use industry benchmarks
  const teamSize = state?.teamSize || csBenchmark.metrics.teamSize.value;
  const monthlyTicketVolume = state?.monthlyTicketVolume || csBenchmark.metrics.monthlyTicketVolume.value;
  const costPerInteraction = state?.costPerInteraction || csBenchmark.metrics.costPerInteraction.value;

  // Calculate savings
  const costReductionPercent = csBenchmark.metrics.costReductionPercentage.value;
  const currentAnnualCost = monthlyTicketVolume * 12 * costPerInteraction;
  const costAfterAI = currentAnnualCost * (1 - costReductionPercent);
  const annualSavings = currentAnnualCost - costAfterAI;

  // Investment
  const investmentPerAgent = csBenchmark.metrics.investmentPerAgent.value;
  const investment = teamSize * investmentPerAgent;

  // Metrics
  const paybackMonths = investment / (annualSavings / 12);
  const threeYearNPV = calculateNPV(investment, annualSavings);

  // Confidence (lower if using estimated data)
  const confidence = state ? 75 : 55; // Lower if using benchmarks instead of real data

  // Range calculation
  const range = calculateRangeFromValue(annualSavings, confidence, 'BRL');

  // Source attribution
  const sources: SourceAttribution[] = [
    csBenchmark.metrics.costReductionPercentage,
    csBenchmark.metrics.automationRate,
  ];

  return {
    department: 'Atendimento ao Cliente',
    investment: Math.round(investment),
    annualSavings: Math.round(annualSavings),
    paybackMonths: Math.round(paybackMonths * 10) / 10,
    threeYearNPV,
    keyMetrics: [
      `🤖 ${(csBenchmark.metrics.automationRate.value * 100).toFixed(0)}% dos tickets podem ser automatizados`,
      `💰 ${(costReductionPercent * 100).toFixed(0)}% redução no custo por interação`,
      `📊 Baseado em ${monthlyTicketVolume.toLocaleString('pt-BR')} tickets/mês`,
      `⚡ Time ${teamSize} agentes`,
      `📈 Fonte: ${csBenchmark.metrics.costReductionPercentage.source.name}`,
    ],
    enabled: true,
    range,
    sources,
    confidence,
    disclaimer: csBenchmark.disclaimer,
  };
}

/**
 * Calculate Sales ROI with verified benchmarks
 */
function calculateSalesROI(
  state: SalesState | undefined,
  companySize: 'startup' | 'scaleup' | 'enterprise',
  industry: string
): TransparentDepartmentROI {
  const benchmarks = getDepartmentBenchmarks(companySize, industry);
  const salesBenchmark = benchmarks.sales;

  if (!salesBenchmark) {
    throw new Error('Sales benchmarks not available');
  }

  const teamSize = state?.salesTeamSize || salesBenchmark.metrics.teamSize.value;
  const avgQuotaPerRep = salesBenchmark.metrics.avgQuotaPerRep.value;

  // Productivity boost and lead conversion
  const productivityBoost = salesBenchmark.metrics.productivityBoost.value;
  const leadConversion = salesBenchmark.metrics.leadConversionImprovement.value;

  // Calculate value (conservative)
  const totalQuota = teamSize * avgQuotaPerRep;
  const productivityValue = totalQuota * productivityBoost;
  const conversionValue = totalQuota * leadConversion * 0.5; // 50% of conversion improvement translates to revenue

  const annualSavings = productivityValue + conversionValue;

  // Investment
  const investmentPerRep = salesBenchmark.metrics.investmentPerRep.value;
  const investment = teamSize * investmentPerRep;

  // Metrics
  const paybackMonths = investment / (annualSavings / 12);
  const threeYearNPV = calculateNPV(investment, annualSavings);

  const confidence = state ? 70 : 50;
  const range = calculateRangeFromValue(annualSavings, confidence, 'BRL');

  const sources: SourceAttribution[] = [
    salesBenchmark.metrics.productivityBoost,
    salesBenchmark.metrics.leadConversionImprovement,
  ];

  return {
    department: 'Vendas & CRM',
    investment: Math.round(investment),
    annualSavings: Math.round(annualSavings),
    paybackMonths: Math.round(paybackMonths * 10) / 10,
    threeYearNPV,
    keyMetrics: [
      `📈 +${(productivityBoost * 100).toFixed(1)}% produtividade de vendas`,
      `🎯 +${(leadConversion * 100).toFixed(0)}% conversão de leads`,
      `👥 Time de ${teamSize} vendedores`,
      `💰 Quota média: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(avgQuotaPerRep)}/ano`,
      `📊 Fonte: ${salesBenchmark.metrics.productivityBoost.source.name}`,
    ],
    enabled: true,
    range,
    sources,
    confidence,
    disclaimer: salesBenchmark.disclaimer,
  };
}

/**
 * Calculate Marketing ROI with verified benchmarks
 */
function calculateMarketingROI(
  state: MarketingState | undefined,
  companySize: 'startup' | 'scaleup' | 'enterprise',
  industry: string
): TransparentDepartmentROI {
  const benchmarks = getDepartmentBenchmarks(companySize, industry);
  const marketingBenchmark = benchmarks.marketing;

  if (!marketingBenchmark) {
    throw new Error('Marketing benchmarks not available');
  }

  const teamSize = state?.marketingTeamSize || marketingBenchmark.metrics.teamSize.value;
  const monthlyLeads = state?.leadGenerationRate || marketingBenchmark.metrics.monthlyLeads.value;

  // Productivity and lead quality improvements
  const productivityIncrease = marketingBenchmark.metrics.productivityIncrease.value;
  const leadQualityImprovement = marketingBenchmark.metrics.leadQualityImprovement.value;

  // Calculate savings (conservative approach)
  // Assume average marketer salary from company size
  const avgMarketerSalary = companySize === 'startup' ? 60000 : companySize === 'scaleup' ? 90000 : 120000;
  const teamCost = teamSize * avgMarketerSalary;

  const productivitySavings = teamCost * productivityIncrease;

  // Lead quality improvement value (conservative: 10% of marketing budget translates to revenue)
  const leadValue = (monthlyLeads * 12) * (avgMarketerSalary / 12) * 0.1 * leadQualityImprovement;

  const annualSavings = productivitySavings + leadValue;

  // Investment
  const investmentPerMarketer = marketingBenchmark.metrics.investmentPerMarketer.value;
  const investment = teamSize * investmentPerMarketer;

  const paybackMonths = investment / (annualSavings / 12);
  const threeYearNPV = calculateNPV(investment, annualSavings);

  const confidence = state ? 65 : 45;
  const range = calculateRangeFromValue(annualSavings, confidence, 'BRL');

  const sources: SourceAttribution[] = [
    marketingBenchmark.metrics.productivityIncrease,
    marketingBenchmark.metrics.leadQualityImprovement,
  ];

  return {
    department: 'Marketing',
    investment: Math.round(investment),
    annualSavings: Math.round(annualSavings),
    paybackMonths: Math.round(paybackMonths * 10) / 10,
    threeYearNPV,
    keyMetrics: [
      `✍️ +${(productivityIncrease * 100).toFixed(0)}% produtividade em criação de conteúdo`,
      `🎯 +${(leadQualityImprovement * 100).toFixed(0)}% melhoria na qualidade de leads`,
      `👥 Time de ${teamSize} profissionais de marketing`,
      `📊 ${monthlyLeads.toLocaleString('pt-BR')} leads/mês`,
      `📈 Fonte: ${marketingBenchmark.metrics.productivityIncrease.source.name}`,
    ],
    enabled: true,
    range,
    sources,
    confidence,
    disclaimer: marketingBenchmark.disclaimer,
  };
}

/**
 * Calculate Meeting Intelligence ROI with verified benchmarks
 */
function calculateMeetingIntelligenceROI(
  state: MeetingGovernanceState | undefined,
  companySize: 'startup' | 'scaleup' | 'enterprise',
  industry: string
): TransparentDepartmentROI {
  const benchmarks = getDepartmentBenchmarks(companySize, industry);
  const meetingBenchmark = benchmarks.meetingIntelligence;

  if (!meetingBenchmark) {
    throw new Error('Meeting Intelligence benchmarks not available');
  }

  const executivesCount = state?.executiveTeamSize || meetingBenchmark.metrics.executivesCount.value;

  // Time savings from Federal Reserve study (tier-1 source!)
  const timeSavingsPercent = meetingBenchmark.metrics.timeSavingsPercent.value;
  const productivityDuringUse = meetingBenchmark.metrics.productivityDuringUse.value;

  // Executive cost (conservative: 2x tech lead salary)
  const avgExecutiveSalary = companySize === 'startup' ? 250000 : companySize === 'scaleup' ? 350000 : 500000;
  const totalExecutiveCost = executivesCount * avgExecutiveSalary;

  // Time savings value
  const timeSavingsValue = totalExecutiveCost * timeSavingsPercent;

  // Productivity boost (50% of time using AI tools)
  const productivityValue = totalExecutiveCost * productivityDuringUse * 0.5;

  // Governance value (if compliance needed)
  const governanceValue = state?.complianceAuditNeeds ? 50000 : 0;

  const annualSavings = timeSavingsValue + productivityValue + governanceValue;

  // Investment
  const investmentPerExecutive = meetingBenchmark.metrics.investmentPerExecutive.value;
  const investment = executivesCount * investmentPerExecutive;

  const paybackMonths = investment / (annualSavings / 12);
  const threeYearNPV = calculateNPV(investment, annualSavings);

  // High confidence - Federal Reserve source!
  const confidence = 85;
  const range = calculateRangeFromValue(annualSavings, confidence, 'BRL');

  const sources: SourceAttribution[] = [
    meetingBenchmark.metrics.timeSavingsPercent,
    meetingBenchmark.metrics.productivityDuringUse,
  ];

  return {
    department: 'Inteligência em Reuniões',
    investment: Math.round(investment),
    annualSavings: Math.round(annualSavings),
    paybackMonths: Math.round(paybackMonths * 10) / 10,
    threeYearNPV,
    keyMetrics: [
      `⏱️ ${(timeSavingsPercent * 100).toFixed(1)}% do tempo de trabalho economizado`,
      `📈 +${(productivityDuringUse * 100).toFixed(0)}% produtividade durante uso de IA`,
      `👥 ${executivesCount} executivos/gerentes`,
      `📝 Transcrição + sumarização automática`,
      `📊 Fonte: ${meetingBenchmark.metrics.timeSavingsPercent.source.name} (tier-1!)`,
    ],
    enabled: true,
    range,
    sources,
    confidence,
    disclaimer: meetingBenchmark.disclaimer,
  };
}

/**
 * Calculate Operations ROI with verified benchmarks
 */
function calculateOperationsROI(
  state: OperationsState | undefined,
  companySize: 'startup' | 'scaleup' | 'enterprise',
  industry: string
): TransparentDepartmentROI {
  const benchmarks = getDepartmentBenchmarks(companySize, industry);
  const opsBenchmark = benchmarks.operations;

  if (!opsBenchmark) {
    throw new Error('Operations benchmarks not available');
  }

  const teamSize = state?.opsTeamSize || opsBenchmark.metrics.teamSize.value;
  const manualProcesses = state?.manualProcessesIdentified || Math.floor(teamSize * 2); // Estimate 2 processes per person

  // Labor cost savings
  const laborSavings = opsBenchmark.metrics.laborCostSavings.value;
  const processSpeedImprovement = opsBenchmark.metrics.processSpeedImprovement.value;

  // Calculate value
  const avgOpsSalary = companySize === 'startup' ? 70000 : companySize === 'scaleup' ? 100000 : 140000;
  const teamCost = teamSize * avgOpsSalary;

  const laborCostSavings = teamCost * laborSavings;
  const processCostReduction = manualProcesses * 8000; // R$8k per process (conservative)

  const annualSavings = laborCostSavings + processCostReduction;

  // Investment
  const investmentPerProcess = opsBenchmark.metrics.investmentPerProcess.value;
  const investment = manualProcesses * investmentPerProcess;

  const paybackMonths = investment / (annualSavings / 12);
  const threeYearNPV = calculateNPV(investment, annualSavings);

  const confidence = state ? 65 : 45;
  const range = calculateRangeFromValue(annualSavings, confidence, 'BRL');

  const sources: SourceAttribution[] = [
    opsBenchmark.metrics.laborCostSavings,
    opsBenchmark.metrics.processSpeedImprovement,
  ];

  return {
    department: 'Operações',
    investment: Math.round(investment),
    annualSavings: Math.round(annualSavings),
    paybackMonths: Math.round(paybackMonths * 10) / 10,
    threeYearNPV,
    keyMetrics: [
      `💰 ${(laborSavings * 100).toFixed(0)}% redução em custos de mão de obra`,
      `⚡ ${(processSpeedImprovement * 100).toFixed(0)}% melhoria na velocidade de processos`,
      `🤖 ${manualProcesses} processos manuais a automatizar`,
      `👥 Time de ${teamSize} profissionais de operações`,
      `📊 Fonte: ${opsBenchmark.metrics.laborCostSavings.source.name}`,
    ],
    enabled: true,
    range,
    sources,
    confidence,
    disclaimer: opsBenchmark.disclaimer,
  };
}

/**
 * Main Enterprise ROI Calculator V2
 * Integrates ROI Calculator V2 for Engineering
 */
export function calculateEnterpriseROIV2(assessment: AssessmentData): EnterpriseROI & {
  transparentDepartments: TransparentDepartmentROI[];
  overallConfidence: number;
} {
  const departments: TransparentDepartmentROI[] = [];
  const { companyInfo } = assessment;

  // 1. Engineering (use ROI Calculator V2 for real calculation)
  const engineeringROI = calculateROIV2(assessment, 'optimistic');

  const engineering: TransparentDepartmentROI = {
    department: 'Engineering',
    investment: engineeringROI.investment.total,
    annualSavings: engineeringROI.annualSavings.total,
    paybackMonths: engineeringROI.paybackPeriodMonths,
    threeYearNPV: engineeringROI.threeYearNPV,
    keyMetrics: [
      `🚀 +${((engineeringROI.annualSavings.productivityGain / engineeringROI.annualSavings.total) * 100).toFixed(0)}% ganho de produtividade`,
      `🐛 +${((engineeringROI.annualSavings.qualityImprovement / engineeringROI.annualSavings.total) * 100).toFixed(0)}% melhoria de qualidade`,
      `⚡ +${((engineeringROI.annualSavings.fasterTimeToMarket / engineeringROI.annualSavings.total) * 100).toFixed(0)}% time-to-market`,
      `📊 Time de ${assessment.currentState.devTeamSize} desenvolvedores`,
      `✅ Confiança: ${engineeringROI.confidenceLevel}`,
    ],
    enabled: assessment.aiScope?.engineering ?? true,
    range: engineeringROI.allRanges?.npv,
    sources: engineeringROI.transparentMetrics,
    confidence: engineeringROI.dataQuality?.completeness || 70,
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

  // 2. Other departments (use industry benchmarks if no real data)
  const hasRealData = hasRealDepartmentData(assessment);

  if (assessment.aiScope?.customerService) {
    const csROI = calculateCustomerServiceROI(
      assessment.customerService,
      companyInfo.size,
      companyInfo.industry
    );
    result.customerService = csROI;
    departments.push(csROI);
  }

  if (assessment.aiScope?.sales) {
    const salesROI = calculateSalesROI(
      assessment.sales,
      companyInfo.size,
      companyInfo.industry
    );
    result.sales = salesROI;
    departments.push(salesROI);
  }

  if (assessment.aiScope?.marketing) {
    const marketingROI = calculateMarketingROI(
      assessment.marketing,
      companyInfo.size,
      companyInfo.industry
    );
    result.marketing = marketingROI;
    departments.push(marketingROI);
  }

  if (assessment.aiScope?.meetingIntelligence) {
    const meetingROI = calculateMeetingIntelligenceROI(
      assessment.meetingIntelligence,
      companyInfo.size,
      companyInfo.industry
    );
    result.meetingIntelligence = meetingROI;
    departments.push(meetingROI);
  }

  if (assessment.aiScope?.operations) {
    const opsROI = calculateOperationsROI(
      assessment.operations,
      companyInfo.size,
      companyInfo.industry
    );
    result.operations = opsROI;
    departments.push(opsROI);
  }

  // Calculate totals
  const totalInvestment = departments.reduce((sum, dept) => sum + dept.investment, 0);
  const totalAnnualSavings = departments.reduce((sum, dept) => sum + dept.annualSavings, 0);
  const totalThreeYearNPV = departments.reduce((sum, dept) => sum + dept.threeYearNPV, 0);

  const avgPaybackMonths = departments.reduce(
    (sum, dept) => sum + (dept.paybackMonths * (dept.investment / totalInvestment)),
    0
  );

  const enterpriseIRR = (totalAnnualSavings / totalInvestment) * 100;

  // Calculate overall confidence (weighted by investment)
  const overallConfidence = departments.reduce((sum, dept) => {
    const weight = dept.investment / totalInvestment;
    return sum + ((dept.confidence || 50) * weight);
  }, 0);

  result.totalEnterprise = {
    totalInvestment: Math.round(totalInvestment),
    totalAnnualSavings: Math.round(totalAnnualSavings),
    avgPaybackMonths: Math.round(avgPaybackMonths * 10) / 10,
    totalThreeYearNPV: Math.round(totalThreeYearNPV),
    enterpriseIRR: Math.round(enterpriseIRR * 10) / 10,
  };

  return {
    ...result,
    transparentDepartments: departments,
    overallConfidence: Math.round(overallConfidence),
  };
}

// Export V2 as default
export { calculateEnterpriseROIV2 as calculateEnterpriseROI };
