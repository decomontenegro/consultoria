import { Report } from '@/lib/types';
import { getAllReports } from './report-service';

export interface IndustryBenchmark {
  industry: string;
  avgNPV: number;
  avgROI: number;
  avgPayback: number;
  reportCount: number;
}

export interface BenchmarkComparison {
  report: Report;
  industryBenchmark: IndustryBenchmark;
  npvDiff: number; // Percentage difference from industry avg
  roiDiff: number;
  paybackDiff: number;
  npvPercentile: number; // 0-100, where 100 is best
  overallRanking: 'top' | 'above-average' | 'average' | 'below-average';
}

/**
 * Calculate industry benchmarks from all reports
 */
export function calculateIndustryBenchmarks(): IndustryBenchmark[] {
  const reports = Object.values(getAllReports());

  if (reports.length === 0) return [];

  // Group reports by industry
  const byIndustry: Record<string, Report[]> = {};
  reports.forEach(report => {
    const industry = report.assessmentData.companyInfo.industry;
    if (!byIndustry[industry]) {
      byIndustry[industry] = [];
    }
    byIndustry[industry].push(report);
  });

  // Calculate averages per industry
  return Object.entries(byIndustry).map(([industry, industryReports]) => {
    const npvs = industryReports.map(r => r.roi.threeYearNPV);
    const rois = industryReports.map(r => r.roi.irr);
    const paybacks = industryReports.map(r => r.roi.paybackPeriodMonths);

    return {
      industry,
      avgNPV: npvs.reduce((a, b) => a + b, 0) / npvs.length,
      avgROI: rois.reduce((a, b) => a + b, 0) / rois.length,
      avgPayback: paybacks.reduce((a, b) => a + b, 0) / paybacks.length,
      reportCount: industryReports.length,
    };
  });
}

/**
 * Get benchmark comparison for a specific report
 */
export function getBenchmarkComparison(reportId: string): BenchmarkComparison | null {
  const reports = Object.values(getAllReports());
  const report = reports.find(r => r.id === reportId);

  if (!report) return null;

  const industry = report.assessmentData.companyInfo.industry;
  const industryReports = reports.filter(
    r => r.assessmentData.companyInfo.industry === industry
  );

  // Need at least 2 reports in industry for meaningful comparison
  if (industryReports.length < 2) {
    return null;
  }

  // Calculate industry averages
  const avgNPV = industryReports.reduce((sum, r) => sum + r.roi.threeYearNPV, 0) / industryReports.length;
  const avgROI = industryReports.reduce((sum, r) => sum + r.roi.irr, 0) / industryReports.length;
  const avgPayback = industryReports.reduce((sum, r) => sum + r.roi.paybackPeriodMonths, 0) / industryReports.length;

  // Calculate percentage differences
  const npvDiff = ((report.roi.threeYearNPV - avgNPV) / avgNPV) * 100;
  const roiDiff = ((report.roi.irr - avgROI) / avgROI) * 100;
  const paybackDiff = ((avgPayback - report.roi.paybackPeriodMonths) / avgPayback) * 100; // Inverted: lower is better

  // Calculate percentile (what % of reports are worse than this one)
  const betterNPVCount = industryReports.filter(r => r.roi.threeYearNPV < report.roi.threeYearNPV).length;
  const npvPercentile = (betterNPVCount / industryReports.length) * 100;

  // Overall ranking based on NPV percentile
  let overallRanking: 'top' | 'above-average' | 'average' | 'below-average';
  if (npvPercentile >= 75) {
    overallRanking = 'top';
  } else if (npvPercentile >= 50) {
    overallRanking = 'above-average';
  } else if (npvPercentile >= 25) {
    overallRanking = 'average';
  } else {
    overallRanking = 'below-average';
  }

  return {
    report,
    industryBenchmark: {
      industry,
      avgNPV,
      avgROI,
      avgPayback,
      reportCount: industryReports.length,
    },
    npvDiff,
    roiDiff,
    paybackDiff,
    npvPercentile,
    overallRanking,
  };
}

/**
 * Get global benchmarks across all industries
 */
export function getGlobalBenchmarks(): {
  totalReports: number;
  avgNPV: number;
  avgROI: number;
  avgPayback: number;
  topIndustry: string;
} | null {
  const reports = Object.values(getAllReports());

  if (reports.length === 0) return null;

  const avgNPV = reports.reduce((sum, r) => sum + r.roi.threeYearNPV, 0) / reports.length;
  const avgROI = reports.reduce((sum, r) => sum + r.roi.irr, 0) / reports.length;
  const avgPayback = reports.reduce((sum, r) => sum + r.roi.paybackPeriodMonths, 0) / reports.length;

  // Find top performing industry
  const benchmarks = calculateIndustryBenchmarks();
  const topIndustry = benchmarks.sort((a, b) => b.avgNPV - a.avgNPV)[0]?.industry || 'N/A';

  return {
    totalReports: reports.length,
    avgNPV,
    avgROI,
    avgPayback,
    topIndustry,
  };
}
