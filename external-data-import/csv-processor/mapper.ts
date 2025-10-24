/**
 * Maps CSV data to AssessmentData format
 */

import { KliniCSVRow, ProcessedDepartment } from './types';
import { AssessmentData } from '../../lib/types';

const TEAM_SIZE_MAP: Record<string, number> = {
  '1-5': 3,
  '6-10': 8,
  '11-20': 15,
  '21-50': 35,
  '50+': 75
};

const COMPANY_SIZE_MAP: Record<string, 'startup' | 'scaleup' | 'enterprise'> = {
  '1-5': 'startup',
  '6-10': 'startup',
  '11-20': 'scaleup',
  '21-50': 'scaleup',
  '50+': 'enterprise'
};

const BUDGET_MAP: Record<string, number> = {
  'under500': 300,
  '500-1k': 750,
  '1k-2k': 1500,
  '2k-5k': 3500,
  '5k-10k': 7500,
  '10k+': 15000
};

function extractToolsFromSoftware(software: string): string[] {
  const tools: string[] = [];

  // Map common tools mentioned in CSV
  const toolMap: Record<string, string> = {
    'excel': 'excel',
    'planilha': 'excel',
    'google': 'google-workspace',
    'trello': 'trello',
    'clickup': 'clickup',
    'jira': 'jira',
    'power bi': 'powerbi',
    'powerbi': 'powerbi',
    'bi': 'powerbi',
    'github': 'github',
    'docker': 'docker',
    'git': 'git'
  };

  const softwareLower = software.toLowerCase();

  for (const [key, value] of Object.entries(toolMap)) {
    if (softwareLower.includes(key)) {
      if (!tools.includes(value)) {
        tools.push(value);
      }
    }
  }

  return tools.length > 0 ? tools : ['other'];
}

function mapAIToolsUsage(aiUsage: string): 'none' | 'exploring' | 'piloting' | 'production' {
  switch (aiUsage) {
    case 'none':
      return 'none';
    case 'basic':
      return 'exploring';
    case 'some':
      return 'piloting';
    case 'advanced':
      return 'production';
    default:
      return 'none';
  }
}

function getCompanySizeFromTotal(totalTeamSize: number): 'startup' | 'scaleup' | 'enterprise' {
  if (totalTeamSize <= 10) return 'startup';
  if (totalTeamSize <= 50) return 'scaleup';
  return 'enterprise';
}

function extractPainPoints(impact: string, mainPain: string): string[] {
  const painPoints: string[] = [];

  const painMap: Record<string, string> = {
    'retrabalho': 'manual-work',
    'tempo': 'slow-process',
    'erro': 'error-prone',
    'integra': 'integration-issues',
    'planilha': 'excel-overload',
    'duplica': 'data-redundancy',
    'qualidade': 'quality-issues'
  };

  const combined = `${impact} ${mainPain}`.toLowerCase();

  for (const [key, value] of Object.entries(painMap)) {
    if (combined.includes(key)) {
      if (!painPoints.includes(value)) {
        painPoints.push(value);
      }
    }
  }

  return painPoints.length > 0 ? painPoints : ['other'];
}

export function mapDepartmentToAssessment(dept: ProcessedDepartment): AssessmentData {
  const { data, company } = dept;

  // Determine industry based on company name
  const industry = company.includes('Hospital') || company.includes('Klini') ? 'healthcare' : 'other';

  // Determine persona based on department
  let persona: AssessmentData['persona'] = 'cto';
  if (data.deptId.includes('commercial') || data.deptId.includes('sales')) {
    persona = 'cmo';
  } else if (data.deptId.includes('operation') || data.deptId.includes('hospitality')) {
    persona = 'ops-manager';
  }

  const assessment: AssessmentData = {
    persona,
    companyInfo: {
      name: `${company} - ${data.deptName}`,
      industry,
      size: COMPANY_SIZE_MAP[data.teamSize] || 'scaleup',
      revenue: 'not-disclosed',
      country: 'BR'
    },
    aiScope: {
      engineering: data.deptId.includes('it') || data.deptId.includes('tech'),
      product: data.deptId.includes('product'),
      operations: data.deptId.includes('operation') || data.deptId.includes('hospitality'),
      sales: data.deptId.includes('commercial') || data.deptId.includes('sales'),
      marketing: data.deptId.includes('marketing'),
      support: data.deptId.includes('support') || data.deptId.includes('postsales'),
      other: !['it', 'tech', 'product', 'operation', 'commercial', 'sales', 'marketing', 'support'].some(key => data.deptId.includes(key))
    },
    currentState: {
      devTeamSize: TEAM_SIZE_MAP[data.teamSize] || 10,
      devSeniority: {
        junior: 30,
        mid: 40,
        senior: 20,
        lead: 10
      },
      currentTools: extractToolsFromSoftware(data.currentSoftware),
      deploymentFrequency: 'weekly',
      avgCycleTime: 10,
      bugRate: 3,
      aiToolsUsage: mapAIToolsUsage(data.currentAI),
      painPoints: extractPainPoints(data.processImpact, data.mainPain)
    },
    goals: {
      primaryGoals: ['reduce-costs', 'improve-efficiency'],
      timeline: '6-months',
      budgetRange: data.monthlyBudget || 'under-10k',
      successMetrics: ['productivity', 'time-to-market', 'cost-reduction']
    },
    contactInfo: {
      fullName: dept.responsible,
      title: data.deptName,
      email: `${dept.responsible.toLowerCase().replace(/\s+/g, '.')}@${company.toLowerCase().replace(/\s+/g, '')}.com`,
      company: company,
      agreeToContact: true
    },
    submittedAt: dept.timestamp,
    metadata: {
      source: 'csv-import',
      originalDepartment: data.deptId,
      originalCompany: company,
      manualProcesses: data.manualProcesses,
      processImpact: data.processImpact,
      successMetrics: data.successMetrics,
      integrationNeeds: data.integrationNeeds,
      monthlyBudget: data.monthlyBudget,
      mainPain: data.mainPain
    }
  };

  return assessment;
}

export function createAggregatedAssessment(
  companyName: string,
  departments: ProcessedDepartment[]
): AssessmentData {
  // Aggregate data from all departments
  const totalTeamSize = departments.reduce((sum, dept) =>
    sum + (TEAM_SIZE_MAP[dept.data.teamSize] || 10), 0
  );

  const allTools = new Set<string>();
  departments.forEach(dept => {
    extractToolsFromSoftware(dept.data.currentSoftware).forEach(tool => allTools.add(tool));
  });

  const allPainPoints = new Set<string>();
  departments.forEach(dept => {
    extractPainPoints(dept.data.processImpact, dept.data.mainPain).forEach(pain => allPainPoints.add(pain));
  });

  // Find most advanced AI usage
  const aiUsages = departments.map(d => mapAIToolsUsage(d.data.currentAI));
  const mostAdvancedAI = ['production', 'piloting', 'exploring', 'none'].find(level =>
    aiUsages.includes(level as any)
  ) as any;

  const industry = companyName.includes('Hospital') || companyName.includes('Klini') ? 'healthcare' : 'other';

  const assessment: AssessmentData = {
    persona: 'cto',
    companyInfo: {
      name: `${companyName} (Consolidado)`,
      industry,
      size: getCompanySizeFromTotal(totalTeamSize),
      revenue: 'not-disclosed',
      country: 'BR'
    },
    aiScope: {
      engineering: departments.some(d => d.data.deptId.includes('it')),
      product: departments.some(d => d.data.deptId.includes('product')),
      operations: departments.some(d => d.data.deptId.includes('operation') || d.data.deptId.includes('hospitality')),
      sales: departments.some(d => d.data.deptId.includes('commercial') || d.data.deptId.includes('sales')),
      marketing: departments.some(d => d.data.deptId.includes('marketing')),
      support: departments.some(d => d.data.deptId.includes('support') || d.data.deptId.includes('postsales')),
      other: true
    },
    currentState: {
      devTeamSize: totalTeamSize,
      devSeniority: {
        junior: 30,
        mid: 40,
        senior: 20,
        lead: 10
      },
      currentTools: Array.from(allTools),
      deploymentFrequency: 'weekly',
      avgCycleTime: 10,
      bugRate: 3,
      aiToolsUsage: mostAdvancedAI,
      painPoints: Array.from(allPainPoints)
    },
    goals: {
      primaryGoals: ['reduce-costs', 'improve-efficiency', 'scale-operations'],
      timeline: '12-months',
      budgetRange: '50k+',
      successMetrics: ['productivity', 'time-to-market', 'cost-reduction', 'quality']
    },
    contactInfo: {
      fullName: 'Gestão Consolidada',
      title: 'Consolidado de Todas as Áreas',
      email: `gestao@${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
      company: companyName,
      agreeToContact: true
    },
    submittedAt: new Date(Math.max(...departments.map(d => d.timestamp.getTime()))),
    metadata: {
      source: 'csv-import-aggregated',
      departments: departments.map(d => d.department),
      totalDepartments: departments.length
    }
  };

  return assessment;
}
