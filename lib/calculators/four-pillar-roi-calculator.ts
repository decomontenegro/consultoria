import { FourPillarROI } from '../types';

/**
 * 4-Pillar ROI Calculator
 *
 * Inspired by Writer AI's Agentic ROI Matrix
 * Calculates ROI across 4 strategic pillars:
 * 1. Efficiency Gains
 * 2. Revenue Acceleration
 * 3. Risk Mitigation
 * 4. Business Agility
 *
 * Based on McKinsey, Forrester, and GitHub research
 */

interface FourPillarInput {
  // Company context
  teamSize: number;
  averageSalary: number;
  industry: string;
  companySize: 'startup' | 'scaleup' | 'enterprise';

  // Current metrics
  currentDeploymentFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  currentBugRate?: number; // bugs per 1000 LOC
  currentTimeToMarket?: number; // days for typical feature

  // AI adoption level
  aiAdoptionLevel: 'none' | 'exploring' | 'piloting' | 'production' | 'mature';
}

/**
 * Calculate 4-Pillar ROI
 */
export function calculateFourPillarROI(input: FourPillarInput): FourPillarROI {
  const {
    teamSize,
    averageSalary,
    companySize,
    currentDeploymentFrequency,
    currentBugRate = 2.5, // Default: 2.5 bugs per 1000 LOC
    currentTimeToMarket = 30, // Default: 30 days
    aiAdoptionLevel,
  } = input;

  // ========================================
  // Pillar 1: Efficiency Gains
  // ========================================

  // Productivity increase: 25-45% (using conservative 30%)
  const productivityIncrease = aiAdoptionLevel === 'mature' ? 40 : 30;

  // Time-to-market reduction: 20-40%
  const timeToMarketReduction = aiAdoptionLevel === 'mature' ? 35 : 25;

  // Annual value calculation
  const totalTeamCost = teamSize * averageSalary;
  const productivityValue = totalTeamCost * (productivityIncrease / 100);

  // Time-to-market value (estimated as 10% of revenue impact)
  const timeToMarketValue = companySize === 'enterprise' ? 500000 :
                            companySize === 'scaleup' ? 200000 : 50000;

  const efficiencyAnnualValue = productivityValue + timeToMarketValue;

  const efficiency = {
    productivityIncrease,
    timeToMarketReduction,
    annualValue: efficiencyAnnualValue,
    keyMetrics: [
      `${productivityIncrease}% productivity increase`,
      `${timeToMarketReduction}% faster time-to-market`,
      `${Math.round(productivityValue / 1000)}k saved in labor costs`,
    ],
  };

  // ========================================
  // Pillar 2: Revenue Acceleration
  // ========================================

  // Faster product launches (based on reduced time-to-market)
  const currentFeaturesPerYear = 12; // Assumption
  const fasterProductLaunches = Math.round(
    currentFeaturesPerYear * (timeToMarketReduction / 100)
  ); // Additional features per year

  // Customer acquisition gain (faster features = more competitive)
  const customerAcquisitionGain = companySize === 'enterprise' ? 8 :
                                  companySize === 'scaleup' ? 12 : 15;

  // Market share gain (conservative estimate)
  const marketShareGain = companySize === 'enterprise' ? 2 :
                          companySize === 'scaleup' ? 5 : 10;

  // Revenue impact estimation
  const avgRevenuePerCustomer = companySize === 'enterprise' ? 50000 :
                                 companySize === 'scaleup' ? 15000 : 5000;

  const additionalCustomers = Math.round(
    100 * (customerAcquisitionGain / 100) // Baseline 100 customers
  );

  const revenueAnnualValue = additionalCustomers * avgRevenuePerCustomer;

  const revenue = {
    fasterProductLaunches,
    customerAcquisitionGain,
    marketShareGain,
    annualValue: revenueAnnualValue,
    keyMetrics: [
      `+${fasterProductLaunches} additional product launches/year`,
      `${customerAcquisitionGain}% increase in customer acquisition`,
      `${marketShareGain}% potential market share gain`,
      `R$ ${Math.round(revenueAnnualValue / 1000)}k additional revenue`,
    ],
  };

  // ========================================
  // Pillar 3: Risk Mitigation
  // ========================================

  // Code quality improvement (AI-assisted code review)
  const codeQualityImprovement = 30; // 30% improvement

  // Bug reduction (based on better code quality)
  const bugReduction = 40; // 40% fewer bugs

  // Security improvements
  const securityImprovements = [
    'Automated security scanning',
    'Vulnerability detection',
    'Code pattern analysis',
  ];

  // Cost of bugs estimation
  const avgCostPerBug = 5000; // BRL per bug to fix
  const currentBugsPerYear = (teamSize * 1000 * 12 * currentBugRate) / 1000; // Rough estimate
  const bugsAvoided = currentBugsPerYear * (bugReduction / 100);
  const bugCostSavings = bugsAvoided * avgCostPerBug;

  // Incident cost savings (production issues)
  const incidentCostSavings = companySize === 'enterprise' ? 200000 :
                              companySize === 'scaleup' ? 75000 : 25000;

  const riskAnnualValue = bugCostSavings + incidentCostSavings;

  const risk = {
    codeQualityImprovement,
    bugReduction,
    securityImprovements,
    annualValue: riskAnnualValue,
    keyMetrics: [
      `${codeQualityImprovement}% code quality improvement`,
      `${bugReduction}% fewer production bugs`,
      `${Math.round(bugsAvoided)} bugs avoided annually`,
      `R$ ${Math.round(riskAnnualValue / 1000)}k saved on incidents`,
    ],
  };

  // ========================================
  // Pillar 4: Business Agility
  // ========================================

  // Deployment frequency increase
  const deploymentMapping = {
    daily: 100,
    weekly: 50,
    biweekly: 25,
    monthly: 10,
  };

  const currentDeploys = deploymentMapping[currentDeploymentFrequency];
  const deploymentFrequencyIncrease = 50; // 50% more deployments
  const additionalDeploys = currentDeploys * (deploymentFrequencyIncrease / 100);

  // Experiment velocity (A/B tests)
  const experimentVelocity = companySize === 'enterprise' ? 8 :
                             companySize === 'scaleup' ? 4 : 2; // Additional tests per quarter

  // Innovation capacity
  const innovationCapacity = 25; // 25% more features per sprint

  // Value of agility (faster adaptation to market)
  const agilityValue = companySize === 'enterprise' ? 300000 :
                       companySize === 'scaleup' ? 120000 : 40000;

  const agility = {
    deploymentFrequencyIncrease,
    experimentVelocity,
    innovationCapacity,
    annualValue: agilityValue,
    keyMetrics: [
      `${deploymentFrequencyIncrease}% increase in deployment frequency`,
      `+${experimentVelocity} additional A/B tests per quarter`,
      `${innovationCapacity}% more features per sprint`,
      `R$ ${Math.round(agilityValue / 1000)}k value from market responsiveness`,
    ],
  };

  // ========================================
  // Overall Summary
  // ========================================

  const totalValue = {
    efficiency: efficiencyAnnualValue,
    revenue: revenueAnnualValue,
    risk: riskAnnualValue,
    agility: agilityValue,
    combined: efficiencyAnnualValue + revenueAnnualValue + riskAnnualValue + agilityValue,
  };

  return {
    efficiency,
    revenue,
    risk,
    agility,
    totalValue,
  };
}

/**
 * Format 4-Pillar ROI for display
 */
export function formatPillarValue(value: number): string {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `R$ ${Math.round(value / 1000)}k`;
  } else {
    return `R$ ${Math.round(value)}`;
  }
}

/**
 * Get pillar color for visualization
 */
export function getPillarColor(pillar: 'efficiency' | 'revenue' | 'risk' | 'agility'): string {
  const colors = {
    efficiency: 'neon-green',
    revenue: 'neon-cyan',
    risk: 'neon-purple',
    agility: 'yellow-400',
  };
  return colors[pillar];
}
