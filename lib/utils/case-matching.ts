/**
 * Case Matching & Similarity Algorithm
 * Intelligent matching of case studies based on company profile
 */

import { CaseStudy, CompanyInfo } from '@/lib/types';
import { getAllCaseStudies } from './case-studies';

interface SimilarityScore {
  caseStudy: CaseStudy;
  score: number;
  reasons: string[];
}

/**
 * Calculate similarity score between user's company and a case study
 * Returns 0-100 score where higher is more similar
 */
function calculateSimilarity(
  companyInfo: Pick<CompanyInfo, 'industry' | 'size' | 'country'>,
  caseStudy: CaseStudy
): SimilarityScore {
  let score = 0;
  const reasons: string[] = [];
  const maxScore = 100;

  // Industry Match (40% weight)
  const industryWeight = 40;
  const normalizedIndustry = companyInfo.industry.toLowerCase();
  const caseIndustry = caseStudy.industry.toLowerCase();

  if (caseIndustry.includes(normalizedIndustry) || normalizedIndustry.includes(caseIndustry)) {
    score += industryWeight;
    reasons.push(`Mesma indústria: ${caseStudy.industry}`);
  } else if (
    // Related industries
    (normalizedIndustry.includes('tech') && caseIndustry.includes('tech')) ||
    (normalizedIndustry.includes('finance') && caseIndustry.includes('fintech')) ||
    (normalizedIndustry.includes('retail') && caseIndustry.includes('commerce')) ||
    (normalizedIndustry.includes('health') && caseIndustry.includes('health'))
  ) {
    score += industryWeight * 0.5;
    reasons.push(`Indústria relacionada: ${caseStudy.industry}`);
  }

  // Company Size Match (20% weight)
  const sizeWeight = 20;
  if (companyInfo.size === caseStudy.size) {
    score += sizeWeight;
    reasons.push(`Mesmo porte: ${caseStudy.size}`);
  } else if (caseStudy.size === 'Mixed') {
    score += sizeWeight * 0.3;
    reasons.push('Case cobre múltiplos portes');
  }

  // Regional Match (25% weight)
  const regionWeight = 25;
  const userCountry = companyInfo.country.toLowerCase();
  const caseCountry = caseStudy.country.toLowerCase();

  if (caseCountry === userCountry) {
    score += regionWeight;
    reasons.push(`Mesmo país: ${caseStudy.country}`);
  } else if (caseStudy.regional && (userCountry.includes('brasil') || userCountry.includes('brazil'))) {
    score += regionWeight;
    reasons.push('Case brasileiro/LatAm relevante');
  } else if (caseCountry === 'global') {
    score += regionWeight * 0.5;
    reasons.push('Case global aplicável');
  }

  // Featured Bonus (15% weight)
  const featuredWeight = 15;
  if (caseStudy.featured) {
    score += featuredWeight;
    reasons.push('Case destacado com resultados excepcionais');
  } else if (caseStudy.verified) {
    score += featuredWeight * 0.5;
    reasons.push('Case verificado com fontes confiáveis');
  }

  // Normalize score to 0-100
  const normalizedScore = Math.min(score, maxScore);

  return {
    caseStudy,
    score: normalizedScore,
    reasons
  };
}

/**
 * Get similar case studies with intelligent matching
 */
export function getSimilarCaseStudiesWithScores(
  industry?: string,
  size?: string,
  country?: string,
  limit: number = 7
): SimilarityScore[] {
  const allCases = getAllCaseStudies();

  // Create company profile for matching
  const companyProfile = {
    industry: industry || '',
    size: (size as any) || 'Enterprise',
    country: country || 'Brasil'
  };

  // Calculate similarity scores
  const scoredCases = allCases.map(caseStudy =>
    calculateSimilarity(companyProfile, caseStudy)
  );

  // Sort by score (highest first) and return top N
  return scoredCases
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Get industry-specific cases
 */
export function getCasesByIndustryCategory(category: string): CaseStudy[] {
  const allCases = getAllCaseStudies();
  const categoryMap: { [key: string]: string[] } = {
    'Technology': ['Technology', 'Tech', 'Software', 'SaaS'],
    'Financial Services': ['FinTech', 'Banking', 'Insurance', 'Finance'],
    'Retail & E-commerce': ['Retail', 'E-commerce', 'Commerce'],
    'Healthcare': ['Healthcare', 'Health', 'Medical'],
    'Manufacturing': ['Manufacturing', 'Industrial'],
    'Services': ['Legal', 'Consulting', 'Professional Services'],
    'Hospitality': ['Hospitality', 'Travel', 'Hotel'],
    'Telecommunications': ['Telecommunications', 'Telecom'],
    'Media': ['Media', 'Entertainment', 'Streaming'],
    'Education': ['Education', 'EdTech', 'Learning'],
    'Logistics': ['Logistics', 'Supply Chain', 'Warehouse']
  };

  const keywords = categoryMap[category] || [category];

  return allCases.filter(caseStudy =>
    keywords.some(keyword =>
      caseStudy.industry.toLowerCase().includes(keyword.toLowerCase())
    )
  );
}

/**
 * Get implementation area statistics
 */
export function getImplementationAreaStats(): { area: string; count: number }[] {
  const allCases = getAllCaseStudies();
  const areaCount: { [key: string]: number } = {};

  allCases.forEach(caseStudy => {
    const area = caseStudy.area;
    areaCount[area] = (areaCount[area] || 0) + 1;
  });

  return Object.entries(areaCount)
    .map(([area, count]) => ({ area, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get ROI distribution statistics
 */
export function getROIDistribution(): { range: string; count: number }[] {
  const allCases = getAllCaseStudies();
  const ranges = {
    '0-3 months': 0,
    '3-6 months': 0,
    '6-12 months': 0,
    '12+ months': 0,
    'Continuous': 0
  };

  allCases.forEach(caseStudy => {
    const payback = caseStudy.roi.paybackPeriod.toLowerCase();

    if (payback.includes('continuous') || payback.includes('immediate')) {
      ranges['Continuous']++;
    } else if (payback.includes('3') && !payback.includes('12') && !payback.includes('18')) {
      ranges['0-3 months']++;
    } else if (payback.includes('6') || payback.includes('4-6') || payback.includes('3-6')) {
      ranges['3-6 months']++;
    } else if (payback.includes('12') || payback.includes('9')) {
      ranges['6-12 months']++;
    } else {
      ranges['12+ months']++;
    }
  });

  return Object.entries(ranges).map(([range, count]) => ({ range, count }));
}
