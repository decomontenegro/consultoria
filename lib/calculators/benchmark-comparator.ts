/**
 * Benchmark Comparison Engine
 * Compares company metrics against industry averages and top performers
 * Data sourced from DORA Report 2024
 */

import benchmarks from '@/data/benchmarks.json';
import industries from '@/data/industries.json';
import { AssessmentData, BenchmarkComparison } from '@/lib/types';

/**
 * Get industry benchmarks for a specific industry
 */
function getIndustryBenchmarks(industryId: string) {
  // Map industry IDs to benchmark data keys
  const industryMap: { [key: string]: keyof typeof benchmarks.industryBenchmarks } = {
    'fintech': 'fintech',
    'banking': 'fintech',
    'financial-services': 'fintech',
    'healthcare': 'healthcare',
    'healthtech': 'healthcare',
    'medical': 'healthcare',
    'retail': 'retail',
    'ecommerce': 'retail',
    'e-commerce': 'retail',
    'manufacturing': 'manufacturing',
    'industrial': 'manufacturing',
    'logistics': 'logistics',
    'transportation': 'logistics',
    'supply-chain': 'logistics',
    'saas': 'saas',
    'software': 'saas',
    'technology': 'saas',
    'education': 'education',
    'edtech': 'education',
    'e-learning': 'education',
    'media': 'media',
    'entertainment': 'media',
    'streaming': 'media',
    'publishing': 'media',
  };

  const benchmarkKey = industryMap[industryId.toLowerCase()] || 'saas'; // Default to saas
  return benchmarks.industryBenchmarks[benchmarkKey];
}

/**
 * Convert deployment frequency string to numeric value (deploys per month)
 */
function deploymentFrequencyToNumber(frequency: string): number {
  const mapping: { [key: string]: number } = {
    'multiple-daily': 60,  // ~2x per day * 30 days
    'daily': 30,           // 1x per day * 30 days
    'weekly': 4,           // 4 weeks per month
    'biweekly': 2,         // Every 2 weeks
    'monthly': 1,
    'quarterly': 0.33,     // ~1/3 month
  };

  return mapping[frequency] || 1;
}

/**
 * Parse industry average deployment frequency
 */
function parseIndustryDeploymentFrequency(freqString: string): number {
  // Examples: "8x/month", "daily", "weekly"
  if (freqString.includes('x/month')) {
    return parseInt(freqString);
  }
  if (freqString === 'daily') return 30;
  if (freqString === 'weekly') return 4;
  if (freqString.includes('x/week')) {
    return parseInt(freqString) * 4;
  }
  return 4; // Default weekly
}

/**
 * Parse industry average cycle time
 */
function parseIndustryCycleTime(cycleString: string): number {
  // Examples: "7 days", "2 days"
  return parseInt(cycleString);
}

/**
 * Parse industry average bug rate
 */
function parseIndustryBugRate(bugString: string): number {
  // Examples: "12 per 1000 LOC", "5 per 1000 LOC"
  return parseInt(bugString);
}

/**
 * Calculate percentile ranking
 * Returns percentile (0-100) where higher is better
 */
function calculatePercentile(yourValue: number, industryAvg: number, topPerformer: number, higherIsBetter: boolean = true): number {
  if (higherIsBetter) {
    // For metrics where higher is better (e.g., deployment frequency)
    if (yourValue >= topPerformer) return 95;
    if (yourValue <= industryAvg * 0.5) return 25;

    const range = topPerformer - (industryAvg * 0.5);
    const position = yourValue - (industryAvg * 0.5);
    return Math.round(25 + (position / range) * 70);
  } else {
    // For metrics where lower is better (e.g., cycle time, bug rate)
    if (yourValue <= topPerformer) return 95;
    if (yourValue >= industryAvg * 1.5) return 25;

    const range = (industryAvg * 1.5) - topPerformer;
    const position = (industryAvg * 1.5) - yourValue;
    return Math.round(25 + (position / range) * 70);
  }
}

/**
 * Create benchmark comparison for deployment frequency
 */
function compareDeploymentFrequency(assessment: AssessmentData): BenchmarkComparison {
  const industryData = getIndustryBenchmarks(assessment.companyInfo.industry);
  const yourValue = deploymentFrequencyToNumber(assessment.currentState.deploymentFrequency);
  const industryAvg = parseIndustryDeploymentFrequency(industryData.avgDeploymentFrequency);
  const topPerformer = parseIndustryDeploymentFrequency(industryData.topPerformer.deploymentFrequency);

  return {
    metric: 'Deployment Frequency',
    yourValue,
    industryAvg,
    topPerformer,
    percentile: calculatePercentile(yourValue, industryAvg, topPerformer, true),
    unit: 'per month',
  };
}

/**
 * Create benchmark comparison for cycle time
 */
function compareCycleTime(assessment: AssessmentData): BenchmarkComparison {
  const industryData = getIndustryBenchmarks(assessment.companyInfo.industry);
  const yourValue = assessment.currentState.avgCycleTime;
  const industryAvg = parseIndustryCycleTime(industryData.avgCycleTime);
  const topPerformer = parseIndustryCycleTime(industryData.topPerformer.cycleTime);

  return {
    metric: 'Average Cycle Time',
    yourValue,
    industryAvg,
    topPerformer,
    percentile: calculatePercentile(yourValue, industryAvg, topPerformer, false),
    unit: 'days',
  };
}

/**
 * Create benchmark comparison for bug rate
 */
function compareBugRate(assessment: AssessmentData): BenchmarkComparison | null {
  // Only if user provided bug rate data
  if (!assessment.currentState.bugRate) return null;

  const industryData = getIndustryBenchmarks(assessment.companyInfo.industry);
  const yourValue = assessment.currentState.bugRate;
  const industryAvg = parseIndustryBugRate(industryData.avgBugRate);
  const topPerformer = parseIndustryBugRate(industryData.topPerformer.bugRate);

  return {
    metric: 'Bug Density',
    yourValue,
    industryAvg,
    topPerformer,
    percentile: calculatePercentile(yourValue, industryAvg, topPerformer, false),
    unit: 'per 1000 LOC',
  };
}

/**
 * Create benchmark comparison for AI adoption maturity
 */
function compareAIAdoption(assessment: AssessmentData): BenchmarkComparison {
  const adoptionLevels: { [key: string]: number } = {
    'none': 0,
    'exploring': 25,
    'piloting': 50,
    'production': 75,
    'mature': 100,
  };

  const yourValue = adoptionLevels[assessment.currentState.aiToolsUsage] || 0;

  // Industry average from Gartner data: most companies in piloting/exploring
  const industryAvg = 40; // Between exploring and piloting
  const topPerformer = 100; // Mature adoption

  return {
    metric: 'AI Tools Maturity',
    yourValue,
    industryAvg,
    topPerformer,
    percentile: yourValue,
    unit: 'maturity score',
  };
}

/**
 * Main function: Generate all benchmark comparisons
 */
export function generateBenchmarkComparisons(assessment: AssessmentData): BenchmarkComparison[] {
  const comparisons: BenchmarkComparison[] = [
    compareDeploymentFrequency(assessment),
    compareCycleTime(assessment),
    compareAIAdoption(assessment),
  ];

  // Add bug rate comparison if data available
  const bugRateComparison = compareBugRate(assessment);
  if (bugRateComparison) {
    comparisons.push(bugRateComparison);
  }

  return comparisons;
}

/**
 * Get improvement opportunities based on benchmarks
 */
export function getImprovementOpportunities(comparisons: BenchmarkComparison[]): string[] {
  const opportunities: string[] = [];

  comparisons.forEach(comp => {
    if (comp.percentile < 50) {
      // Below median - significant opportunity
      const gapPercent = Math.round(((comp.industryAvg - comp.yourValue) / comp.yourValue) * 100);

      if (comp.metric === 'Deployment Frequency') {
        opportunities.push(`Increase deployment frequency by ${gapPercent}% to match industry average`);
      } else if (comp.metric === 'Average Cycle Time') {
        opportunities.push(`Reduce cycle time by ${Math.abs(gapPercent)}% to reach industry average`);
      } else if (comp.metric === 'Bug Density') {
        opportunities.push(`Improve code quality to reduce bugs by ${Math.abs(gapPercent)}%`);
      } else if (comp.metric === 'AI Tools Maturity') {
        opportunities.push(`Advance AI adoption from current stage to at least piloting phase`);
      }
    }
  });

  return opportunities;
}

/**
 * Calculate overall maturity score (0-100)
 */
export function calculateMaturityScore(comparisons: BenchmarkComparison[]): number {
  const totalPercentile = comparisons.reduce((sum, comp) => sum + comp.percentile, 0);
  return Math.round(totalPercentile / comparisons.length);
}
