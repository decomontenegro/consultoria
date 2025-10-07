/**
 * Report Generation Service
 * Orchestrates all calculators to generate complete assessment report
 */

import { AssessmentData, Report } from '@/lib/types';
import { calculateROI } from '@/lib/calculators/roi-calculator';
import { calculateEnterpriseROI } from '@/lib/calculators/enterprise-roi-calculator';
import { generateBenchmarkComparisons } from '@/lib/calculators/benchmark-comparator';
import { generateRoadmap, generateRecommendations } from '@/lib/calculators/roadmap-generator';
import { generateMockDepartmentData, hasRealDepartmentData } from '@/lib/utils/mock-department-data';
import { generateCostOfInaction } from '@/lib/calculators/cost-of-inaction-calculator';
import { generateRiskMatrix } from '@/lib/calculators/risk-matrix-calculator';

/**
 * Generate unique ID for report
 */
function generateReportId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${random}`;
}

/**
 * Generate complete assessment report
 */
export function generateReport(assessmentData: AssessmentData): Report {
  const reportId = generateReportId();

  // Calculate ROI (Engineering-focused)
  const roi = calculateROI(assessmentData);

  // Generate benchmarks
  const benchmarks = generateBenchmarkComparisons(assessmentData);

  // Generate recommendations
  const recommendations = generateRecommendations(assessmentData);

  // Generate roadmap
  const roadmap = generateRoadmap(assessmentData);

  // Prepare data for Enterprise ROI calculation
  let enterpriseData = { ...assessmentData };

  // If no multi-dept data provided, generate intelligent mock data
  if (!hasRealDepartmentData(assessmentData)) {
    const mockData = generateMockDepartmentData(
      assessmentData.companyInfo.size,
      assessmentData.companyInfo.industry
    );

    enterpriseData = {
      ...assessmentData,
      aiScope: {
        engineering: true,
        customerService: true,
        sales: true,
        marketing: true,
        operations: true,
        meetingIntelligence: true,
      },
      customerService: mockData.customerService,
      sales: mockData.sales,
      marketing: mockData.marketing,
      meetingIntelligence: mockData.meetingIntelligence,
      operations: mockData.operations,
    };
  }

  // Calculate Enterprise-Wide ROI
  const enterpriseROI = calculateEnterpriseROI(enterpriseData);

  // Generate Cost of Inaction Analysis
  const costOfInaction = generateCostOfInaction(assessmentData);

  // Generate Risk Matrix
  const riskMatrix = generateRiskMatrix(assessmentData);

  const report: Report = {
    id: reportId,
    assessmentData,
    roi,
    enterpriseROI, // Add enterprise ROI to report
    benchmarks,
    costOfInaction, // NEW
    riskMatrix, // NEW
    recommendations,
    roadmap,
    generatedAt: new Date(),
  };

  return report;
}

/**
 * Save report (client-side storage for now)
 */
export function saveReport(report: Report): void {
  if (typeof window === 'undefined') return;

  try {
    const reports = getAllReports();
    reports[report.id] = report;
    localStorage.setItem('culturabuilder_reports', JSON.stringify(reports));
  } catch (error) {
    console.error('Error saving report:', error);
  }
}

/**
 * Get report by ID
 */
export function getReport(id: string): Report | null {
  if (typeof window === 'undefined') return null;

  try {
    const reports = getAllReports();
    return reports[id] || null;
  } catch (error) {
    console.error('Error loading report:', error);
    return null;
  }
}

/**
 * Get all reports
 */
export function getAllReports(): { [key: string]: Report } {
  if (typeof window === 'undefined') return {};

  try {
    const data = localStorage.getItem('culturabuilder_reports');
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error loading reports:', error);
    return {};
  }
}

/**
 * Delete report
 */
export function deleteReport(id: string): void {
  if (typeof window === 'undefined') return;

  try {
    const reports = getAllReports();
    delete reports[id];
    localStorage.setItem('culturabuilder_reports', JSON.stringify(reports));
  } catch (error) {
    console.error('Error deleting report:', error);
  }
}
