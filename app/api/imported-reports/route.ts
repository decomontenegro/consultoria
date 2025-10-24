/**
 * API Route: List Imported Reports from CSV Processing
 *
 * GET /api/imported-reports - List all imported reports
 */

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const REPORTS_DIR = path.join(process.cwd(), 'external-data-import', 'reports');

export async function GET() {
  try {
    // Read individual reports
    const individualDir = path.join(REPORTS_DIR, 'individual');
    const consolidatedDir = path.join(REPORTS_DIR, 'consolidated');

    const individualFiles = fs.existsSync(individualDir)
      ? fs.readdirSync(individualDir).filter(f => f.endsWith('.json'))
      : [];

    const consolidatedFiles = fs.existsSync(consolidatedDir)
      ? fs.readdirSync(consolidatedDir).filter(f => f.endsWith('.json'))
      : [];

    // Read individual reports
    const individualReports = individualFiles.map(filename => {
      const filePath = path.join(individualDir, filename);
      const content = fs.readFileSync(filePath, 'utf-8');
      const report = JSON.parse(content);

      return {
        id: report.id,
        filename,
        type: 'individual',
        companyName: report.assessmentData?.companyInfo?.name || 'Unknown',
        department: report.metadata?.originalDepartment || 'Unknown',
        responsible: report.assessmentData?.contactInfo?.fullName || 'Unknown',
        generatedAt: report.generatedAt,
        roi: {
          npv: report.roi?.threeYearNPV,
          payback: report.roi?.paybackPeriodMonths
        }
      };
    });

    // Read consolidated reports
    const consolidatedReports = consolidatedFiles.map(filename => {
      const filePath = path.join(consolidatedDir, filename);
      const content = fs.readFileSync(filePath, 'utf-8');
      const report = JSON.parse(content);

      return {
        id: report.id,
        filename,
        type: 'consolidated',
        companyName: report.assessmentData?.companyInfo?.name || 'Unknown',
        departmentCount: report.metadata?.totalDepartments || 0,
        departments: report.metadata?.departments || [],
        generatedAt: report.generatedAt,
        roi: {
          npv: report.roi?.threeYearNPV,
          payback: report.roi?.paybackPeriodMonths
        }
      };
    });

    // Read summary
    const summaryPath = path.join(REPORTS_DIR, 'SUMMARY.json');
    const summary = fs.existsSync(summaryPath)
      ? JSON.parse(fs.readFileSync(summaryPath, 'utf-8'))
      : null;

    return NextResponse.json({
      success: true,
      summary,
      reports: {
        individual: individualReports,
        consolidated: consolidatedReports,
        total: individualReports.length + consolidatedReports.length
      }
    });

  } catch (error) {
    console.error('Error loading imported reports:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load imported reports' },
      { status: 500 }
    );
  }
}
