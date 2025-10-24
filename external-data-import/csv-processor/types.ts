/**
 * Types for Klini/Hospital Casa CSV Import
 */

export interface KliniCSVRow {
  company: string;
  timestamp: string;
  deptId: string;
  deptName: string;
  responsible: string;
  manualProcesses: string;
  processImpact: string;
  successMetrics: string;
  dataUsage: 'littleUse' | 'someUse' | 'goodUse' | 'fullUse';
  teamSize: '1-5' | '6-10' | '11-20' | '21-50' | '50+';
  timeSpent: 'less1h' | '1-2h' | '2-4h' | '4-6h' | 'more6h';
  currentSoftware: string;
  currentAI: 'none' | 'basic' | 'some' | 'advanced';
  businessImpact: 'minimal' | 'low' | 'medium' | 'high' | 'veryHigh';
  integrationNeeds: string;
  monthlyBudget: string;
  mainPain: string;
}

export interface ProcessedDepartment {
  company: string;
  department: string;
  responsible: string;
  timestamp: Date;
  data: KliniCSVRow;
}

export interface CompanyData {
  companyName: string;
  departments: ProcessedDepartment[];
  submittedAt: Date;
}
