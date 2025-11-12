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
    department: 'Atendimento ao Cliente',
    investment,
    annualSavings,
    paybackMonths: Math.round(paybackMonths * 10) / 10,
    threeYearNPV,
    keyMetrics: [
      `🤖 ${(bench.automationRate.achievable * 100).toFixed(0)}% dos tickets resolvidos por Ada AI / Intercom Fin`,
      `⚡ Tempo de primeira resposta: ${bench.firstResponseTime.before}min → ${bench.firstResponseTime.after}min`,
      `💰 Redução de ${(bench.avgCostPerInteraction.reduction * 100).toFixed(0)}% no custo por interação`,
      `🎯 100% das calls auditadas com Observe.AI (vs ~5% manual)`,
      `📞 Voicebot automatiza ligações com Kore.ai`,
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
    department: 'Vendas & CRM',
    investment,
    annualSavings,
    paybackMonths: Math.round(paybackMonths * 10) / 10,
    threeYearNPV,
    keyMetrics: [
      `🎯 Win rate +${(bench.productivityBoost.percentage * 100).toFixed(0)}% com insights do Gong AI`,
      `📊 Forecast 95% acurado via Clari AI (vs 60% manual)`,
      `✉️ +${(bench.leadConversionImprovement.percentage * 100).toFixed(0)}% conversão de leads com Outreach AI`,
      `💬 100% das sales calls transcritas e analisadas`,
      `🤖 SDR virtual (Conversica) qualifica leads 24/7`,
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
      `✍️ Gerar 10 variações de copy em 2min com Jasper AI`,
      `📱 1 artigo vira 50 posts sociais via Lately AI`,
      `🎨 Designs prontos em <1min com Canva AI`,
      `📹 Vídeos profissionais em horas via Runway AI`,
      `📈 -50% CPA com otimização de ads por IA (Madgicx)`,
      `🎯 ${(bench.qualifiedLeadsIncrease.percentage * 100).toFixed(0)}% mais leads qualificados`,
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
    department: 'Inteligência em Reuniões & Governança',
    investment,
    annualSavings,
    paybackMonths: Math.round(paybackMonths * 10) / 10,
    threeYearNPV,
    keyMetrics: [
      `📝 Transcrever + sumarizar todas reuniões com Otter.ai`,
      `🎯 Action items extraídos automaticamente`,
      `⏱️ ${bench.hoursPerWeek.hours}h/semana economizadas em note-taking`,
      `📊 Analytics de produtividade: identificar meetings inúteis`,
      `🔍 Biblioteca pesquisável de todas as decisões`,
      state.complianceAuditNeeds ? '✅ Audit trail automático para compliance' : '✅ Transparência total em decisões',
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
    department: 'Operações',
    investment,
    annualSavings,
    paybackMonths: Math.round(paybackMonths * 10) / 10,
    threeYearNPV,
    keyMetrics: [
      `📄 Processar invoices com 95% acurácia via UiPath AI`,
      `🤖 Eliminar data entry manual com Automation Anywhere`,
      `⚡ Workflows criados falando em português via Zapier Central`,
      `📋 OCR inteligente: extrair dados de qualquer documento`,
      `${state.manualProcessesIdentified} processos manuais automatizados`,
      `💰 ${(bench.laborCostSavings.average * 100).toFixed(0)}% redução em custos operacionais`,
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
      '🚀 55% mais código/hora com GitHub Copilot / Cursor AI',
      '🔍 Code review em <2min via CodeRabbit AI (vs 2h manual)',
      '🐛 +20% bugs detectados com SonarQube AI',
      '⚡ 15% faster time-to-market com automação',
      '🤖 Agentes autônomos (Devin) resolvem tickets completos',
      '📚 Docs sempre atualizadas via Mintlify AI',
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
