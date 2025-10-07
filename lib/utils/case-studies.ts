/**
 * Case Studies Utility Functions
 * Helper functions to work with real-world AI implementation case studies
 */

import caseStudiesData from '@/data/case-studies.json';
import caseStudiesDataPart2 from '@/data/case-studies-part2.json';
import { CaseStudy } from '@/lib/types';

/**
 * Get all case studies (merged from all sources)
 */
export function getAllCaseStudies(): CaseStudy[] {
  const part1 = caseStudiesData.caseStudies as CaseStudy[];
  const part2 = caseStudiesDataPart2.caseStudies as CaseStudy[];
  return [...part1, ...part2];
}

/**
 * Get featured case studies (for homepage)
 */
export function getFeaturedCaseStudies(): CaseStudy[] {
  return getAllCaseStudies().filter(cs => cs.featured);
}

/**
 * Get regional case studies (Brazilian/LatAm)
 */
export function getRegionalCaseStudies(): CaseStudy[] {
  return getAllCaseStudies().filter(cs => cs.regional);
}

/**
 * Get case study by ID
 */
export function getCaseStudyById(id: string): CaseStudy | undefined {
  return getAllCaseStudies().find(cs => cs.id === id);
}

/**
 * Filter case studies by industry
 */
export function getCaseStudiesByIndustry(industry: string): CaseStudy[] {
  const normalizedIndustry = industry.toLowerCase();
  return getAllCaseStudies().filter(cs =>
    cs.industry.toLowerCase().includes(normalizedIndustry)
  );
}

/**
 * Filter case studies by region
 */
export function getCaseStudiesByRegion(region: string): CaseStudy[] {
  return getAllCaseStudies().filter(cs =>
    cs.region.toLowerCase() === region.toLowerCase()
  );
}

/**
 * Filter case studies by area of implementation
 */
export function getCaseStudiesByArea(area: string): CaseStudy[] {
  const normalizedArea = area.toLowerCase();
  return getAllCaseStudies().filter(cs =>
    cs.area.toLowerCase().includes(normalizedArea)
  );
}

/**
 * Get similar case studies based on company profile
 * @param industry - Company's industry
 * @param region - Company's region
 * @param limit - Maximum number of results
 */
export function getSimilarCaseStudies(
  industry?: string,
  region?: string,
  limit: number = 3
): CaseStudy[] {
  let cases = getAllCaseStudies();

  // Prioritize featured cases
  cases = cases.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return 0;
  });

  // Filter by industry if provided
  if (industry) {
    const industryMatches = getCaseStudiesByIndustry(industry);
    if (industryMatches.length > 0) {
      cases = industryMatches;
    }
  }

  // Prioritize regional cases if in Latin America
  if (region && (region.toLowerCase().includes('brasil') || region.toLowerCase().includes('latin'))) {
    const regionalCases = getRegionalCaseStudies();
    if (regionalCases.length > 0) {
      cases = [...regionalCases, ...cases.filter(c => !c.regional)];
    }
  }

  return cases.slice(0, limit);
}

/**
 * Extract key metrics from case study results
 */
export function extractKeyMetrics(caseStudy: CaseStudy): string[] {
  const metrics: string[] = [];

  Object.values(caseStudy.results).forEach(result => {
    metrics.push(`${result.improvement}`);
  });

  return metrics;
}

/**
 * Format case study for display
 */
export function formatCaseStudyForDisplay(caseStudy: CaseStudy) {
  const keyMetrics = extractKeyMetrics(caseStudy);
  const resultCount = Object.keys(caseStudy.results).length;

  return {
    ...caseStudy,
    keyMetrics,
    resultCount,
    displayName: caseStudy.company,
    shortDescription: `${caseStudy.area} implementation in ${caseStudy.industry}`,
  };
}

/**
 * Get aggregate statistics
 */
export function getAggregateStats() {
  return caseStudiesData.aggregateStats;
}

/**
 * Get case studies grouped by industry
 */
export function getCaseStudiesGroupedByIndustry(): { [industry: string]: CaseStudy[] } {
  const grouped: { [industry: string]: CaseStudy[] } = {};

  getAllCaseStudies().forEach(cs => {
    if (!grouped[cs.industry]) {
      grouped[cs.industry] = [];
    }
    grouped[cs.industry].push(cs);
  });

  return grouped;
}

/**
 * Search case studies by keyword
 */
export function searchCaseStudies(keyword: string): CaseStudy[] {
  const normalizedKeyword = keyword.toLowerCase();

  return getAllCaseStudies().filter(cs =>
    cs.company.toLowerCase().includes(normalizedKeyword) ||
    cs.industry.toLowerCase().includes(normalizedKeyword) ||
    cs.area.toLowerCase().includes(normalizedKeyword) ||
    cs.tool.toLowerCase().includes(normalizedKeyword)
  );
}
