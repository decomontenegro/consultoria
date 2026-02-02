/**
 * Source Attribution System
 *
 * Provides complete traceability from metrics to their verified sources.
 * Enables confidence scoring and range calculation for all projections.
 */

/**
 * Classification of source quality
 */
export type SourceType =
  | 'peer-reviewed'        // Academic or industry research (McKinsey, Forrester, DORA)
  | 'industry-report'      // Professional research firms (Gartner, IDC, Bain)
  | 'case-study'          // Vendor case studies (Salesforce, HubSpot) - higher bias
  | 'benchmark'           // Industry benchmarks (Stack Overflow, GitHub)
  | 'internal-estimate';  // CulturaBuilder internal estimates - lowest confidence

/**
 * Confidence level for a data point
 */
export type ConfidenceLevel = 'high' | 'medium' | 'low';

/**
 * Geographic scope of the source data
 */
export type Geography = 'global' | 'brazil' | 'north-america' | 'europe' | 'asia' | 'latam';

/**
 * Source attribution for a single metric
 */
export interface SourceAttribution {
  /** Name of the metric */
  metric: string;

  /** Calculated value */
  value: number;

  /** Unit of measurement (%, dollars, days, etc) */
  unit?: string;

  /** Range of possible values */
  range?: {
    min: number;
    max: number;
    p25?: number;  // 25th percentile (conservative)
    p50?: number;  // 50th percentile (realistic)
    p75?: number;  // 75th percentile (optimistic)
    p90?: number;  // 90th percentile (very optimistic)
  };

  /** Source information */
  source: {
    /** Full name of the source */
    name: string;

    /** Type/classification of source */
    type: SourceType;

    /** URL to source (if publicly available) */
    url?: string;

    /** Publication date (YYYY-MM-DD or YYYY) */
    publishDate: string;

    /** Sample size of the study */
    sampleSize?: number;

    /** Industries covered */
    industries?: string[];

    /** Geographic coverage */
    geography?: Geography;

    /** Specific page or section reference */
    pageReference?: string;
  };

  /** Confidence score (0-100) */
  confidence: number;

  /** Which percentile this value represents */
  percentile?: 25 | 50 | 75 | 90;

  /** Additional context or caveats */
  notes?: string;

  /** Last verified date (YYYY-MM-DD) */
  lastVerified?: string;
}

/**
 * A metric with full transparency and traceability
 */
export interface TransparentMetric extends SourceAttribution {
  /** Human-readable description */
  description: string;

  /** Factors affecting confidence */
  confidenceFactors?: {
    sourceQuality: number;      // 0-100
    dataRecency: number;        // 0-100
    applicability: number;      // 0-100 (how well it matches user's context)
    sampleSize: number;         // 0-100
    overall: number;            // 0-100 (weighted average)
  };

  /** How to improve confidence */
  recommendations?: string[];

  /** Uncertainty range as percentage */
  uncertaintyRange?: number;  // ±X%

  /** Assumptions made in calculation */
  assumptions?: string[];
}

/**
 * Verified benchmark with percentile data
 */
export interface VerifiedBenchmark {
  /** Unique identifier */
  id: string;

  /** Category (productivity, quality, cost, etc) */
  category: string;

  /** Metric name */
  metric: string;

  /** Human-readable description */
  description: string;

  /** Primary value (typically p75 for optimistic or p50 for realistic) */
  value: number;

  /** Unit of measurement */
  unit: string;

  /** Percentile distribution */
  percentiles: {
    p25: number;   // Conservative
    p50: number;   // Realistic
    p75: number;   // Optimistic
    p90?: number;  // Very optimistic
  };

  /** Absolute range */
  range: {
    min: number;
    max: number;
  };

  /** Source information */
  source: {
    name: string;
    type: SourceType;
    url?: string;
    publishDate: string;
    sampleSize?: number;
    industries?: string[];
    geography?: Geography;
    pageReference?: string;
  };

  /** Confidence level */
  confidence: ConfidenceLevel;

  /** Confidence score (0-100) */
  confidenceScore: number;

  /** Last verified date */
  lastVerified: string;

  /** Additional notes or caveats */
  notes?: string;

  /** Related benchmarks */
  relatedMetrics?: string[];

  /** Industry-specific values (if applicable) */
  byIndustry?: {
    [industry: string]: {
      value: number;
      percentiles: { p25: number; p50: number; p75: number };
      source?: string;
    };
  };

  /** Company size specific values (if applicable) */
  byCompanySize?: {
    startup: { value: number; range: { min: number; max: number } };
    scaleup: { value: number; range: { min: number; max: number } };
    enterprise: { value: number; range: { min: number; max: number } };
  };
}

/**
 * Collection of verified benchmarks by category
 */
export interface BenchmarkLibrary {
  metadata: {
    version: string;
    lastUpdated: string;
    curator: string;
  };

  /** Benchmarks organized by category */
  categories: {
    productivity: VerifiedBenchmark[];
    quality: VerifiedBenchmark[];
    cost: VerifiedBenchmark[];
    timeToMarket: VerifiedBenchmark[];
    customerService: VerifiedBenchmark[];
    sales: VerifiedBenchmark[];
    marketing: VerifiedBenchmark[];
    engineering: VerifiedBenchmark[];
    operations: VerifiedBenchmark[];
  };

  /** Blacklist of questionable sources */
  blacklistedSources: string[];
}

/**
 * Helper to calculate confidence score based on source attributes
 */
export function calculateSourceConfidence(source: SourceAttribution['source']): number {
  let score = 0;

  // Source type quality (0-40 points)
  switch (source.type) {
    case 'peer-reviewed':
      score += 40;
      break;
    case 'industry-report':
      score += 30;
      break;
    case 'benchmark':
      score += 25;
      break;
    case 'case-study':
      score += 15;
      break;
    case 'internal-estimate':
      score += 5;
      break;
  }

  // Recency (0-30 points)
  const publishYear = parseInt(source.publishDate.substring(0, 4));
  const currentYear = 2025;
  const age = currentYear - publishYear;

  if (age === 0) score += 30;      // Current year
  else if (age === 1) score += 25; // 1 year old
  else if (age === 2) score += 15; // 2 years old
  else if (age === 3) score += 5;  // 3 years old
  // Older = 0 points

  // Sample size (0-20 points)
  if (source.sampleSize) {
    if (source.sampleSize >= 1000) score += 20;
    else if (source.sampleSize >= 500) score += 15;
    else if (source.sampleSize >= 100) score += 10;
    else if (source.sampleSize >= 50) score += 5;
  } else {
    score += 5; // Unknown sample size
  }

  // Geographic relevance (0-10 points)
  if (source.geography === 'brazil' || source.geography === 'latam') {
    score += 10; // Most relevant for Brazilian market
  } else if (source.geography === 'global') {
    score += 7;  // Good general applicability
  } else {
    score += 4;  // Less relevant but still useful
  }

  return Math.min(100, score);
}

/**
 * Helper to determine confidence level from score
 */
export function getConfidenceLevel(score: number): ConfidenceLevel {
  if (score >= 75) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
}

/**
 * Helper to calculate uncertainty range based on confidence
 */
export function getUncertaintyRange(confidenceScore: number): number {
  if (confidenceScore >= 80) return 15;  // ±15%
  if (confidenceScore >= 60) return 25;  // ±25%
  if (confidenceScore >= 40) return 40;  // ±40%
  return 60;  // ±60% for very low confidence
}

/**
 * Blacklist of questionable sources (vendor marketing, not research)
 */
export const BLACKLISTED_SOURCES = [
  'WinSavvy',
  'CRM.org',
  'Kixie',
  'Jeff Bullas',
  'Firework',
  'Digital Silk',
  'Bitrix24',
  // Add more as identified
];

/**
 * Tier-1 trusted sources (peer-reviewed and industry-leading)
 */
export const TIER_1_SOURCES = [
  'McKinsey',
  'Forrester',
  'DORA',
  'Gartner',
  'IDC',
  'Bain & Company',
  'Deloitte',
  'PwC',
  'GitHub',
  'Stack Overflow',
  'Harvard Business Review',
  'MIT Sloan',
];

/**
 * Tier-2 acceptable sources (vendor studies with good methodology)
 */
export const TIER_2_SOURCES = [
  'Salesforce',
  'HubSpot',
  'Zendesk',
  'Microsoft',
  'Google Cloud',
  'AWS',
  'Atlassian',
];
