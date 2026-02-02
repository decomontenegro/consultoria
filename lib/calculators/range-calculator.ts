/**
 * Range Calculator
 *
 * Calculates best/worst/most-likely scenarios based on benchmark percentiles
 * and confidence levels. Provides transparent uncertainty quantification.
 */

import { VerifiedBenchmark } from '../types/source-attribution';
import { getUncertaintyRange } from '../types/source-attribution';

/**
 * Scenario types for projections
 */
export type ScenarioType = 'conservative' | 'realistic' | 'optimistic';

/**
 * A calculated scenario with full transparency
 */
export interface Scenario {
  type: ScenarioType;
  value: number;
  percentile: 25 | 50 | 75 | 90;
  confidence: number;
  uncertaintyRange: number; // ±X%
  description: string;
}

/**
 * Range calculation result
 */
export interface RangeResult {
  /** Primary value (defaults to optimistic for C-level) */
  primaryValue: number;

  /** Primary scenario type */
  primaryScenario: ScenarioType;

  /** All three scenarios */
  scenarios: {
    conservative: Scenario;
    realistic: Scenario;
    optimistic: Scenario;
  };

  /** Absolute min and max */
  absoluteRange: {
    min: number;
    max: number;
  };

  /** Expected value (probability-weighted) */
  expectedValue: number;

  /** Recommended value to show (respects user preference) */
  recommendedValue: number;

  /** Unit of measurement */
  unit?: string;
}

/**
 * Calculate range from a verified benchmark
 */
export function calculateRangeFromBenchmark(
  benchmark: VerifiedBenchmark,
  preferredScenario: ScenarioType = 'optimistic'
): RangeResult {
  const { percentiles, range, confidenceScore, unit } = benchmark;

  // Conservative scenario (p25)
  const conservative: Scenario = {
    type: 'conservative',
    value: percentiles.p25,
    percentile: 25,
    confidence: confidenceScore,
    uncertaintyRange: getUncertaintyRange(confidenceScore),
    description: 'Lower quartile - realistic worst case under normal conditions',
  };

  // Realistic scenario (p50)
  const realistic: Scenario = {
    type: 'realistic',
    value: percentiles.p50,
    percentile: 50,
    confidence: confidenceScore,
    uncertaintyRange: getUncertaintyRange(confidenceScore),
    description: 'Median outcome - most likely result for typical implementation',
  };

  // Optimistic scenario (p75)
  const optimistic: Scenario = {
    type: 'optimistic',
    value: percentiles.p75,
    percentile: 75,
    confidence: confidenceScore,
    uncertaintyRange: getUncertaintyRange(confidenceScore),
    description: 'Upper quartile - achievable with strong execution and favorable conditions',
  };

  // Expected value (weighted average, slightly optimistic)
  const expectedValue =
    percentiles.p25 * 0.2 +
    percentiles.p50 * 0.5 +
    percentiles.p75 * 0.3;

  // Select primary value based on preference
  let primaryValue: number;
  let primaryScenario: ScenarioType;

  switch (preferredScenario) {
    case 'conservative':
      primaryValue = conservative.value;
      primaryScenario = 'conservative';
      break;
    case 'realistic':
      primaryValue = realistic.value;
      primaryScenario = 'realistic';
      break;
    case 'optimistic':
    default:
      primaryValue = optimistic.value;
      primaryScenario = 'optimistic';
      break;
  }

  return {
    primaryValue,
    primaryScenario,
    scenarios: {
      conservative,
      realistic,
      optimistic,
    },
    absoluteRange: {
      min: range.min,
      max: range.max,
    },
    expectedValue,
    recommendedValue: primaryValue, // Same as primary for now
    unit,
  };
}

/**
 * Calculate range from a custom value with uncertainty
 */
export function calculateRangeFromValue(
  value: number,
  confidenceScore: number,
  unit?: string
): RangeResult {
  const uncertaintyRange = getUncertaintyRange(confidenceScore);
  const uncertaintyMultiplier = uncertaintyRange / 100;

  const minValue = value * (1 - uncertaintyMultiplier);
  const maxValue = value * (1 + uncertaintyMultiplier);

  // Generate scenarios based on uncertainty
  const conservative: Scenario = {
    type: 'conservative',
    value: minValue,
    percentile: 25,
    confidence: confidenceScore,
    uncertaintyRange,
    description: 'Lower bound based on uncertainty assessment',
  };

  const realistic: Scenario = {
    type: 'realistic',
    value: value,
    percentile: 50,
    confidence: confidenceScore,
    uncertaintyRange,
    description: 'Expected value based on available data',
  };

  const optimistic: Scenario = {
    type: 'optimistic',
    value: maxValue,
    percentile: 75,
    confidence: confidenceScore,
    uncertaintyRange,
    description: 'Upper bound based on uncertainty assessment',
  };

  return {
    primaryValue: value,
    primaryScenario: 'realistic',
    scenarios: {
      conservative,
      realistic,
      optimistic,
    },
    absoluteRange: {
      min: minValue,
      max: maxValue,
    },
    expectedValue: value,
    recommendedValue: value,
    unit,
  };
}

/**
 * Calculate ROI range with multiple year projections
 */
export interface MultiYearRange {
  year1: RangeResult;
  year2: RangeResult;
  year3: RangeResult;
  cumulative: RangeResult;
}

export function calculateMultiYearRange(
  annualValue: number,
  confidenceScore: number,
  growthRate: number = 0, // Annual growth/decline rate
  unit?: string
): MultiYearRange {
  const year1 = calculateRangeFromValue(annualValue, confidenceScore, unit);

  const year2Value = annualValue * (1 + growthRate);
  const year2 = calculateRangeFromValue(year2Value, confidenceScore * 0.9, unit); // Slightly lower confidence for year 2

  const year3Value = year2Value * (1 + growthRate);
  const year3 = calculateRangeFromValue(year3Value, confidenceScore * 0.8, unit); // Lower confidence for year 3

  const cumulativeValue = year1.primaryValue + year2.primaryValue + year3.primaryValue;
  const cumulative = calculateRangeFromValue(
    cumulativeValue,
    confidenceScore * 0.85,
    unit
  );

  return {
    year1,
    year2,
    year3,
    cumulative,
  };
}

/**
 * Format range for display
 */
export function formatRange(range: RangeResult, decimals: number = 0): string {
  const { scenarios, unit } = range;

  const formatValue = (val: number) => {
    if (unit === 'percentage' || unit === '%') {
      return `${(val * 100).toFixed(decimals)}%`;
    }
    if (unit === 'BRL' || unit === 'USD') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: unit === 'BRL' ? 'BRL' : 'USD',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(val);
    }
    return val.toFixed(decimals) + (unit ? ` ${unit}` : '');
  };

  return `${formatValue(scenarios.conservative.value)} - ${formatValue(scenarios.optimistic.value)} (most likely: ${formatValue(scenarios.realistic.value)})`;
}

/**
 * Get visual color coding for confidence level
 */
export function getConfidenceColor(confidenceScore: number): string {
  if (confidenceScore >= 80) return 'green';
  if (confidenceScore >= 60) return 'amber';
  if (confidenceScore >= 40) return 'orange';
  return 'red';
}

/**
 * Get confidence level label
 */
export function getConfidenceLabel(confidenceScore: number): string {
  if (confidenceScore >= 80) return 'High Confidence';
  if (confidenceScore >= 60) return 'Medium Confidence';
  if (confidenceScore >= 40) return 'Low Confidence';
  return 'Very Low Confidence';
}

/**
 * Calculate payback period range
 */
export interface PaybackPeriodRange {
  conservative: number; // months
  realistic: number;
  optimistic: number;
  description: string;
}

export function calculatePaybackPeriodRange(
  investment: number,
  annualSavingsRange: RangeResult
): PaybackPeriodRange {
  const { scenarios } = annualSavingsRange;

  // Conservative: use lower savings estimate
  const conservativeMonths = (investment / (scenarios.conservative.value / 12));

  // Realistic: use median savings
  const realisticMonths = (investment / (scenarios.realistic.value / 12));

  // Optimistic: use upper savings estimate
  const optimisticMonths = (investment / (scenarios.optimistic.value / 12));

  let description = '';
  if (realisticMonths <= 6) {
    description = 'Excellent payback - investment recovers quickly';
  } else if (realisticMonths <= 12) {
    description = 'Good payback - typical for AI implementations';
  } else if (realisticMonths <= 24) {
    description = 'Moderate payback - requires patience';
  } else {
    description = 'Long payback - consider if strategic value justifies timeline';
  }

  return {
    conservative: conservativeMonths,
    realistic: realisticMonths,
    optimistic: optimisticMonths,
    description,
  };
}

/**
 * Combine multiple range results (for aggregating departmental ROIs)
 */
export function combineRanges(ranges: RangeResult[], unit?: string): RangeResult {
  if (ranges.length === 0) {
    throw new Error('Cannot combine empty ranges array');
  }

  // Sum conservative scenarios
  const conservativeValue = ranges.reduce(
    (sum, r) => sum + r.scenarios.conservative.value,
    0
  );

  // Sum realistic scenarios
  const realisticValue = ranges.reduce(
    (sum, r) => sum + r.scenarios.realistic.value,
    0
  );

  // Sum optimistic scenarios
  const optimisticValue = ranges.reduce(
    (sum, r) => sum + r.scenarios.optimistic.value,
    0
  );

  // Average confidence (weighted by value)
  const totalValue = realisticValue;
  const weightedConfidence = ranges.reduce((sum, r, idx) => {
    const weight = r.scenarios.realistic.value / totalValue;
    return sum + (r.scenarios.realistic.confidence * weight);
  }, 0);

  const uncertaintyRange = getUncertaintyRange(weightedConfidence);

  return {
    primaryValue: optimisticValue, // Default to optimistic
    primaryScenario: 'optimistic',
    scenarios: {
      conservative: {
        type: 'conservative',
        value: conservativeValue,
        percentile: 25,
        confidence: weightedConfidence,
        uncertaintyRange,
        description: 'Sum of all conservative scenarios',
      },
      realistic: {
        type: 'realistic',
        value: realisticValue,
        percentile: 50,
        confidence: weightedConfidence,
        uncertaintyRange,
        description: 'Sum of all realistic scenarios',
      },
      optimistic: {
        type: 'optimistic',
        value: optimisticValue,
        percentile: 75,
        confidence: weightedConfidence,
        uncertaintyRange,
        description: 'Sum of all optimistic scenarios',
      },
    },
    absoluteRange: {
      min: conservativeValue * (1 - uncertaintyRange / 100),
      max: optimisticValue * (1 + uncertaintyRange / 100),
    },
    expectedValue: realisticValue,
    recommendedValue: optimisticValue,
    unit,
  };
}
