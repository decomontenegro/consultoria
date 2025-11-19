/**
 * Report Generation Service
 * Orchestrates all calculators to generate complete assessment report
 */

import { AssessmentData, Report, ConversationContext } from '@/lib/types';
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
 * @param conversationContext - FASE 3.5+: Conversation history for personalized reports
 */
export function generateReport(
  assessmentData: AssessmentData,
  aiInsights?: string[],
  conversationContext?: ConversationContext
): Report {
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
    costOfInaction,
    riskMatrix,
    recommendations,
    roadmap,
    aiInsights, // AI consultation insights (optional)
    conversationContext, // FASE 3.5+: Preserve conversation for personalization
    generatedAt: new Date(),
  };

  return report;
}

/**
 * Send webhook notification to admin
 */
async function sendWebhookNotification(report: Report): Promise<void> {
  try {
    const payload = {
      reportId: report.id,
      companyName: report.assessmentData.companyInfo.name,
      contactEmail: report.assessmentData.contactInfo?.email || 'Não fornecido',
      contactName: report.assessmentData.contactInfo?.name || 'Não fornecido',
      industry: report.assessmentData.companyInfo.industry,
      teamSize: report.assessmentData.companyInfo.size,
      persona: report.assessmentData.persona,
      createdAt: report.generatedAt,
      summary: {
        paybackMonths: report.roi.paybackPeriodMonths,
        threeYearNPV: report.roi.threeYearNPV,
        annualROI: report.roi.irr,
      },
      fullReportData: report, // Send complete data for admin backup
    };

    const response = await fetch('/api/webhook/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log('✅ Admin notification sent');
    } else {
      console.warn('⚠️  Admin notification failed (non-blocking)');
    }
  } catch (error) {
    // Don't throw - webhook failure shouldn't break report generation
    console.warn('⚠️  Webhook notification error (non-blocking):', error);
  }
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

    // Send webhook notification to admin (non-blocking)
    sendWebhookNotification(report).catch(err => {
      console.warn('Webhook notification failed (non-critical):', err);
    });

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
