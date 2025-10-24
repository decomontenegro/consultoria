/**
 * Playwright Script to Process Klini/Hospital Casa CSV Data
 *
 * This script:
 * 1. Parses the CSV file from the external quiz
 * 2. Maps each department's data to our assessment format
 * 3. Generates individual reports for each department
 * 4. Generates aggregated reports for each company
 */

import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { parseCSV, groupByCompany, getDepartmentStats } from '../external-data-import/csv-processor/parser';
import { mapDepartmentToAssessment, createAggregatedAssessment } from '../external-data-import/csv-processor/mapper';
import { generateReport } from '../lib/services/report-service';

const CSV_PATH = path.join(__dirname, '..', 'external-data-import', 'klini-responses.csv');
const OUTPUT_DIR = path.join(__dirname, '..', 'external-data-import', 'reports');

test.describe('Process Klini/Hospital Casa CSV Data', () => {
  test.beforeAll(() => {
    // Create output directory
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
  });

  test('should analyze CSV structure and show statistics', async () => {
    console.log('\n📊 ANALYZING CSV DATA...\n');

    const departments = parseCSV(CSV_PATH);
    const stats = getDepartmentStats(departments);

    console.log(`Total valid departments: ${stats.totalDepartments}`);
    console.log(`Total companies: ${stats.uniqueCompanies}\n`);

    for (const { company, count, departments: depts } of stats.departmentsByCompany) {
      console.log(`\n🏢 ${company}: ${count} departments`);
      depts.forEach(dept => console.log(`   - ${dept}`));
    }

    // Save analysis
    const analysisPath = path.join(OUTPUT_DIR, 'csv-analysis.json');
    fs.writeFileSync(analysisPath, JSON.stringify({
      analyzedAt: new Date().toISOString(),
      totalDepartments: stats.totalDepartments,
      companies: stats.departmentsByCompany,
      departments: departments.map(d => ({
        company: d.company,
        department: d.department,
        responsible: d.responsible,
        timestamp: d.timestamp.toISOString()
      }))
    }, null, 2));

    console.log(`\n✅ Analysis saved to: ${analysisPath}\n`);

    expect(stats.totalDepartments).toBeGreaterThan(0);
  });

  test('should generate individual department reports', async () => {
    console.log('\n📄 GENERATING INDIVIDUAL DEPARTMENT REPORTS...\n');

    const departments = parseCSV(CSV_PATH);
    const reports: any[] = [];

    for (const dept of departments) {
      try {
        console.log(`Processing: ${dept.company} - ${dept.department} (${dept.responsible})`);

        // Map to assessment data
        const assessmentData = mapDepartmentToAssessment(dept);

        // Generate report
        const report = generateReport(assessmentData, {
          keyInsights: [
            `Departamento: ${dept.department}`,
            `Responsável: ${dept.responsible}`,
            `Time: ${dept.data.teamSize} pessoas`,
            `Uso atual de AI: ${dept.data.currentAI}`,
            `Principal dor: ${dept.data.mainPain.substring(0, 200)}...`
          ],
          recommendations: [
            'Análise baseada em dados reais do departamento',
            'ROI calculado para o contexto específico da área',
            'Roadmap personalizado considerando processos manuais atuais'
          ],
          concerns: []
        });

        // Save individual report
        const filename = `${dept.company.replace(/\s+/g, '-')}_${dept.department}_${dept.responsible.replace(/\s+/g, '-')}.json`;
        const reportPath = path.join(OUTPUT_DIR, 'individual', filename);

        if (!fs.existsSync(path.dirname(reportPath))) {
          fs.mkdirSync(path.dirname(reportPath), { recursive: true });
        }

        fs.writeFileSync(reportPath, JSON.stringify({
          ...report,
          metadata: {
            ...report.metadata,
            originalData: {
              manualProcesses: dept.data.manualProcesses.substring(0, 500),
              processImpact: dept.data.processImpact.substring(0, 500),
              successMetrics: dept.data.successMetrics.substring(0, 500),
              integrationNeeds: dept.data.integrationNeeds.substring(0, 500)
            }
          }
        }, null, 2));

        console.log(`   ✅ Report saved: ${filename}`);

        reports.push({
          company: dept.company,
          department: dept.department,
          responsible: dept.responsible,
          reportId: report.id,
          reportPath
        });
      } catch (error) {
        console.error(`   ❌ Error processing ${dept.company} - ${dept.department}:`, error);
      }
    }

    // Save reports index
    const indexPath = path.join(OUTPUT_DIR, 'individual-reports-index.json');
    fs.writeFileSync(indexPath, JSON.stringify({
      generatedAt: new Date().toISOString(),
      totalReports: reports.length,
      reports
    }, null, 2));

    console.log(`\n✅ Generated ${reports.length} individual reports`);
    console.log(`📋 Index saved to: ${indexPath}\n`);

    expect(reports.length).toBeGreaterThan(0);
  });

  test('should generate aggregated company reports', async () => {
    console.log('\n🏢 GENERATING AGGREGATED COMPANY REPORTS...\n');

    const departments = parseCSV(CSV_PATH);
    const companies = groupByCompany(departments);
    const aggregatedReports: any[] = [];

    for (const company of companies) {
      try {
        console.log(`\nProcessing company: ${company.companyName}`);
        console.log(`  Departments: ${company.departments.length}`);

        // Create aggregated assessment
        const aggregatedAssessment = createAggregatedAssessment(
          company.companyName,
          company.departments
        );

        // Collect all insights from departments
        const allInsights = company.departments.flatMap(dept => [
          `${dept.department}: ${dept.data.mainPain.substring(0, 150)}...`
        ]);

        // Generate aggregated report
        const report = generateReport(aggregatedAssessment, {
          keyInsights: [
            `Consolidado de ${company.departments.length} departamentos`,
            `Total de ${aggregatedAssessment.companyInfo.size} pessoas`,
            ...allInsights.slice(0, 5)
          ],
          recommendations: [
            'Análise consolidada de toda a organização',
            'ROI calculado considerando sinergia entre departamentos',
            'Roadmap integrado para implementação em toda empresa'
          ],
          concerns: []
        });

        // Save aggregated report
        const filename = `${company.companyName.replace(/\s+/g, '-')}_CONSOLIDATED.json`;
        const reportPath = path.join(OUTPUT_DIR, 'consolidated', filename);

        if (!fs.existsSync(path.dirname(reportPath))) {
          fs.mkdirSync(path.dirname(reportPath), { recursive: true });
        }

        fs.writeFileSync(reportPath, JSON.stringify({
          ...report,
          metadata: {
            ...report.metadata,
            departments: company.departments.map(d => ({
              name: d.department,
              responsible: d.responsible,
              teamSize: d.data.teamSize,
              mainPain: d.data.mainPain.substring(0, 200)
            }))
          }
        }, null, 2));

        console.log(`   ✅ Consolidated report saved: ${filename}`);

        aggregatedReports.push({
          company: company.companyName,
          departmentCount: company.departments.length,
          reportId: report.id,
          reportPath
        });
      } catch (error) {
        console.error(`   ❌ Error processing ${company.companyName}:`, error);
      }
    }

    // Save aggregated reports index
    const indexPath = path.join(OUTPUT_DIR, 'consolidated-reports-index.json');
    fs.writeFileSync(indexPath, JSON.stringify({
      generatedAt: new Date().toISOString(),
      totalReports: aggregatedReports.length,
      reports: aggregatedReports
    }, null, 2));

    console.log(`\n✅ Generated ${aggregatedReports.length} consolidated reports`);
    console.log(`📋 Index saved to: ${indexPath}\n`);

    expect(aggregatedReports.length).toBeGreaterThan(0);
  });

  test('should create summary report', async () => {
    console.log('\n📊 CREATING SUMMARY REPORT...\n');

    const departments = parseCSV(CSV_PATH);
    const companies = groupByCompany(departments);

    const summary = {
      generatedAt: new Date().toISOString(),
      totalCompanies: companies.length,
      totalDepartments: departments.length,
      companies: companies.map(c => ({
        name: c.companyName,
        departments: c.departments.map(d => ({
          name: d.department,
          responsible: d.responsible,
          teamSize: d.data.teamSize,
          aiUsage: d.data.currentAI,
          businessImpact: d.data.businessImpact
        }))
      })),
      reportLocations: {
        individual: 'external-data-import/reports/individual/',
        consolidated: 'external-data-import/reports/consolidated/'
      }
    };

    const summaryPath = path.join(OUTPUT_DIR, 'SUMMARY.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

    console.log(`✅ Summary report saved to: ${summaryPath}\n`);
    console.log(`📊 Total: ${summary.totalCompanies} companies, ${summary.totalDepartments} departments\n`);

    expect(summary.totalCompanies).toBeGreaterThan(0);
  });
});
