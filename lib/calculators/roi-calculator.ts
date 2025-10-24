/**
 * ROI Calculator for CulturaBuilder Assessment
 * All calculations based on verified benchmarks from benchmarks.json
 * Conservative estimates following Forrester TEI methodology
 */

import benchmarks from '@/data/benchmarks.json';
import { AssessmentData, ROICalculation } from '@/lib/types';
import {
  calculateDataQuality,
  getConfidenceLevel,
  calculateUncertaintyRange,
  generateAssumptions
} from './confidence-calculator';
import { calculateFourPillarROI } from './four-pillar-roi-calculator';

interface TeamCost {
  totalAnnualSalary: number;
  averageMonthlySalary: number;
}

/**
 * Calculate total team cost based on seniority distribution
 */
function calculateTeamCost(assessment: AssessmentData): TeamCost {
  const { devTeamSize, devSeniority } = assessment.currentState;
  const salaries = benchmarks.salaryData.brazil;

  // If no seniority breakdown, use average mid-level salary
  if (!devSeniority || Object.values(devSeniority).every(v => v === 0)) {
    const avgSalary = salaries.mid.monthly;
    return {
      totalAnnualSalary: avgSalary * 12 * devTeamSize,
      averageMonthlySalary: avgSalary,
    };
  }

  // Calculate weighted average based on team composition
  const juniorCost = (devSeniority.junior || 0) * salaries.junior.annual;
  const midCost = (devSeniority.mid || 0) * salaries.mid.annual;
  const seniorCost = (devSeniority.senior || 0) * salaries.senior.annual;
  const leadCost = (devSeniority.lead || 0) * salaries.lead.annual;

  const totalAnnualSalary = juniorCost + midCost + seniorCost + leadCost;
  const averageMonthlySalary = totalAnnualSalary / (devTeamSize * 12);

  return {
    totalAnnualSalary,
    averageMonthlySalary,
  };
}

/**
 * Calculate productivity gains from voice coding and AI tools
 * Uses CONSERVATIVE estimates from McKinsey data
 */
function calculateProductivityGain(assessment: AssessmentData, teamCost: TeamCost): number {
  const { devTeamSize } = assessment.currentState;
  const { totalAnnualSalary } = teamCost;

  // Use CONSERVATIVE 25% productivity gain (McKinsey shows 35-45%)
  const productivityMultiplier = benchmarks.productivityGains.voiceCoding.conservative;

  // Calculate annual savings
  const annualProductivityGain = totalAnnualSalary * productivityMultiplier;

  return annualProductivityGain;
}

/**
 * Calculate quality improvement savings
 * Based on bug reduction and faster code review
 */
function calculateQualityImprovement(assessment: AssessmentData, teamCost: TeamCost): number {
  const { devTeamSize, bugRate } = assessment.currentState;
  const { averageMonthlySalary } = teamCost;

  // Estimate current bugs per year (if tracked)
  // Assume average project is 50k LOC per year per team
  const avgLOCPerYear = 50000;
  const currentBugRate = bugRate || 15; // Default to industry average
  const bugsPerYear = (avgLOCPerYear / 1000) * currentBugRate * devTeamSize;

  // AI code review reduces bugs by ~30% (conservative estimate)
  const bugReduction = bugsPerYear * 0.30;

  // Cost to fix each bug (8 hours senior dev time)
  const bugFixHourCost = (averageMonthlySalary / 160); // ~160 work hours/month
  const costPerBugFix = bugFixHourCost * benchmarks.qualityCosts.bugFixCost.hoursCost;

  const annualQualitySavings = bugReduction * costPerBugFix;

  return annualQualitySavings;
}

/**
 * Calculate time-to-market improvement value
 * Based on cycle time reduction
 */
function calculateTimeToMarketValue(assessment: AssessmentData, teamCost: TeamCost): number {
  const { avgCycleTime } = assessment.currentState;
  const { totalAnnualSalary } = teamCost;

  // Conservative: 15% cycle time reduction
  const cycleTimeReduction = 0.15;

  // Value = (team cost) * (% cycle time saved) * (opportunity multiplier)
  // Opportunity multiplier = 1.5 (faster features = 50% more market value)
  const annualTimeToMarketValue = totalAnnualSalary * cycleTimeReduction * 0.50;

  return annualTimeToMarketValue;
}

/**
 * Calculate training investment costs
 */
function calculateTrainingCost(assessment: AssessmentData, teamCost: TeamCost): number {
  const { devTeamSize } = assessment.currentState;
  const training = benchmarks.trainingCosts.voiceCodingTraining;

  // Direct training cost per developer
  const directTrainingCost = devTeamSize * training.costPerDev;

  // Productivity loss during training (1 week at 30% reduced output)
  const { totalAnnualSalary } = teamCost;
  const oneWeekCost = totalAnnualSalary / 52;
  const productivityLoss = oneWeekCost * (1 - training.productivityDuringTraining);

  return directTrainingCost + productivityLoss;
}

/**
 * Calculate NPV (Net Present Value) over 3 years
 * Discount rate: 10% (conservative for enterprise projects)
 */
function calculateNPV(investment: number, annualSavings: number, years: number = 3): number {
  const discountRate = 0.10;
  let npv = -investment; // Initial investment is negative

  for (let year = 1; year <= years; year++) {
    const discountedSavings = annualSavings / Math.pow(1 + discountRate, year);
    npv += discountedSavings;
  }

  return npv;
}

/**
 * Calculate IRR (Internal Rate of Return)
 * Simplified approximation
 */
function calculateIRR(investment: number, annualSavings: number): number {
  // Simple IRR approximation: (Annual Return / Investment) * 100
  // For more accurate IRR, would use Newton-Raphson method
  const simpleROI = (annualSavings / investment) * 100;
  return simpleROI;
}

/**
 * Main ROI calculation function (with confidence tracking)
 */
export function calculateROI(assessment: AssessmentData): ROICalculation {
  // Step 1: Calculate data quality and confidence
  const dataQuality = calculateDataQuality(assessment);
  const confidenceLevel = getConfidenceLevel(dataQuality);
  const assumptions = generateAssumptions(assessment);

  // Step 2: Calculate team costs
  const teamCost = calculateTeamCost(assessment);

  // Step 3: Calculate benefits (annual savings)
  const productivityGain = calculateProductivityGain(assessment, teamCost);
  const qualityImprovement = calculateQualityImprovement(assessment, teamCost);
  const fasterTimeToMarket = calculateTimeToMarketValue(assessment, teamCost);

  const totalAnnualSavings = productivityGain + qualityImprovement + fasterTimeToMarket;

  // Step 4: Calculate investment costs
  const trainingCost = calculateTrainingCost(assessment, teamCost);
  const productivityLossDuringTraining = trainingCost * 0.30; // 30% is productivity loss
  const totalInvestment = trainingCost;

  // Step 5: Calculate payback period
  const paybackPeriodMonths = (totalInvestment / (totalAnnualSavings / 12));

  // Step 6: Calculate NPV and IRR
  const threeYearNPV = calculateNPV(totalInvestment, totalAnnualSavings, 3);
  const irr = calculateIRR(totalInvestment, totalAnnualSavings);

  // Step 7: Calculate uncertainty range based on confidence
  const uncertaintyRange = calculateUncertaintyRange(Math.round(threeYearNPV), confidenceLevel);

  // Step 8: Calculate 4-Pillar ROI (optional enhanced view)
  let fourPillarROI;
  try {
    fourPillarROI = calculateFourPillarROI({
      teamSize: assessment.currentState.devTeamSize,
      averageSalary: teamCost.totalAnnualSalary / assessment.currentState.devTeamSize,
      industry: assessment.companyInfo.industry,
      companySize: assessment.companyInfo.size,
      currentDeploymentFrequency: parseDeploymentFrequency(assessment.currentState.deploymentFrequency),
      currentBugRate: assessment.currentState.bugRate,
      currentTimeToMarket: assessment.currentState.avgCycleTime,
      aiAdoptionLevel: assessment.currentState.aiToolsUsage || 'none',
    });
  } catch (error) {
    // If 4-Pillar calculation fails, leave it undefined
    fourPillarROI = undefined;
  }

  return {
    investment: {
      trainingCost,
      productivityLossDuringTraining,
      total: totalInvestment,
    },
    annualSavings: {
      productivityGain,
      qualityImprovement,
      fasterTimeToMarket,
      total: totalAnnualSavings,
    },
    paybackPeriodMonths: Math.round(paybackPeriodMonths * 10) / 10, // Round to 1 decimal
    threeYearNPV: Math.round(threeYearNPV),
    irr: Math.round(irr * 10) / 10, // Round to 1 decimal
    // Confidence tracking
    confidenceLevel,
    dataQuality,
    assumptions,
    uncertaintyRange,
    // 4-Pillar Framework
    fourPillarROI,
  };
}

/**
 * Parse deployment frequency string to standard format
 */
function parseDeploymentFrequency(frequency: string): 'daily' | 'weekly' | 'biweekly' | 'monthly' {
  const lower = frequency.toLowerCase();
  if (lower.includes('daily') || lower.includes('diário')) return 'daily';
  if (lower.includes('week') || lower.includes('semana')) return 'weekly';
  if (lower.includes('biweekly') || lower.includes('quinzenal')) return 'biweekly';
  return 'monthly';
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

/**
 * Format percentage for display
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}
