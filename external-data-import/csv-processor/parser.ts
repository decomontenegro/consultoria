/**
 * CSV Parser for Klini/Hospital Casa Data
 */

import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { KliniCSVRow, ProcessedDepartment, CompanyData } from './types';

export function parseCSV(filePath: string): ProcessedDepartment[] {
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  // Parse CSV using csv-parse library (handles multiline fields correctly)
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_quotes: true,
    relax_column_count: true
  });

  const departments: ProcessedDepartment[] = [];

  for (const record of records) {
    const company = record['Company'] || '';
    const timestamp = record['Timestamp'] || '';
    const deptId = record['Dept ID Dept Name'] || '';
    const responsible = record['Responsible'] || '';
    const manualProcesses = record['Manual Processes'] || '';
    const processImpact = record['Process Impact'] || '';
    const successMetrics = record['Success Metrics'] || '';
    const dataUsage = record['Data Usage'] || 'someUse';
    const teamSize = record['Team Size'] || '1-5';
    const timeSpent = record['Time Spent'] || '1-2h';
    const currentSoftware = record['Current Software'] || '';
    const currentAI = record['Current AI'] || 'none';
    const businessImpact = record['Business Impact'] || 'medium';
    const integrationNeeds = record['Integration Needs'] || '';
    const monthlyBudget = record['Monthly Budget'] || '';
    const mainPain = record['Main Pain'] || '';

    // Skip test data
    if (responsible?.includes('teste') || responsible?.includes('53w53') || responsible?.includes('wewew')) {
      continue;
    }

    // Skip if essential fields are missing
    if (!company || !deptId || !responsible) {
      continue;
    }

    const csvRow: KliniCSVRow = {
      company: company.trim(),
      timestamp: timestamp.trim(),
      deptId: deptId.trim(),
      deptName: deptId.trim(),
      responsible: responsible.trim(),
      manualProcesses: manualProcesses?.trim() || '',
      processImpact: processImpact?.trim() || '',
      successMetrics: successMetrics?.trim() || '',
      dataUsage: (dataUsage?.trim() as any) || 'someUse',
      teamSize: (teamSize?.trim() as any) || '1-5',
      timeSpent: (timeSpent?.trim() as any) || '1-2h',
      currentSoftware: currentSoftware?.trim() || '',
      currentAI: (currentAI?.trim() as any) || 'none',
      businessImpact: (businessImpact?.trim() as any) || 'medium',
      integrationNeeds: integrationNeeds?.trim() || '',
      monthlyBudget: monthlyBudget?.trim() || '',
      mainPain: mainPain?.trim() || ''
    };

    departments.push({
      company: csvRow.company,
      department: csvRow.deptId,
      responsible: csvRow.responsible,
      timestamp: new Date(csvRow.timestamp),
      data: csvRow
    });
  }

  return departments;
}

export function groupByCompany(departments: ProcessedDepartment[]): CompanyData[] {
  const companies = new Map<string, ProcessedDepartment[]>();

  for (const dept of departments) {
    if (!companies.has(dept.company)) {
      companies.set(dept.company, []);
    }
    companies.get(dept.company)!.push(dept);
  }

  return Array.from(companies.entries()).map(([companyName, depts]) => ({
    companyName,
    departments: depts,
    submittedAt: new Date(Math.max(...depts.map(d => d.timestamp.getTime())))
  }));
}

export function getDepartmentStats(departments: ProcessedDepartment[]) {
  const byCompany = new Map<string, Set<string>>();

  for (const dept of departments) {
    if (!byCompany.has(dept.company)) {
      byCompany.set(dept.company, new Set());
    }
    byCompany.get(dept.company)!.add(dept.department);
  }

  return {
    totalDepartments: departments.length,
    uniqueCompanies: byCompany.size,
    departmentsByCompany: Array.from(byCompany.entries()).map(([company, depts]) => ({
      company,
      count: depts.size,
      departments: Array.from(depts)
    }))
  };
}
