/**
 * Type definitions for CulturaBuilder Assessment Platform
 */

export interface CompanyInfo {
  name: string;
  industry: string;
  size: 'startup' | 'scaleup' | 'enterprise';
  revenue: string;
  country: string;
}

export interface CurrentState {
  devTeamSize: number;
  devSeniority: {
    junior: number;
    mid: number;
    senior: number;
    lead: number;
  };
  currentTools: string[];
  deploymentFrequency: string;
  avgCycleTime: number; // in days
  bugRate?: number; // bugs per 1000 LOC
  aiToolsUsage: 'none' | 'exploring' | 'piloting' | 'production' | 'mature';
  painPoints: string[];
}

export interface Goals {
  primaryGoals: string[];
  timeline: '3-months' | '6-months' | '12-months' | '18-months';
  budgetRange: string;
  successMetrics: string[];
  competitiveThreats?: string;
}

export interface ContactInfo {
  fullName: string;
  title: string;
  email: string;
  phone?: string;
  company: string;
  agreeToContact: boolean;
}

export type UserPersona =
  | 'board-executive'    // Board Member / C-Level Executive (Strategic focus)
  | 'finance-ops'        // Finance / Operations Executive (Efficiency focus)
  | 'product-business'   // Product / Business Leader (Market focus)
  | 'engineering-tech'   // Engineering / Tech Leader (Technical focus)
  | 'it-devops';         // IT / DevOps Manager (Operations focus)

export interface NonTechCurrentState {
  deliverySpeed: 'very-slow' | 'slow' | 'moderate' | 'fast' | 'very-fast';
  techCompetitiveness: 'behind' | 'average' | 'competitive' | 'leading' | 'unknown';
  talentAttraction: 'difficult' | 'moderate' | 'good' | 'excellent' | 'unknown';
  marketResponsiveness: 'very-slow' | 'slow' | 'moderate' | 'fast' | 'very-fast';
  businessChallenges: string[];
  innovationLevel: 'low' | 'medium' | 'high';
}

export interface NonTechGoals {
  businessGoals: string[];
  timeline: '3-months' | '6-months' | '12-months' | '18-months';
  budgetRange: string;
  businessMetrics: string[];
  strategicPriority: 'low' | 'medium' | 'high' | 'critical';
}

// ============================================
// MULTI-DEPARTMENTAL AI APPLICATIONS
// ============================================

export interface AIApplicationScope {
  engineering: boolean;
  customerService: boolean;
  sales: boolean;
  marketing: boolean;
  operations: boolean;
  meetingIntelligence: boolean;
}

export interface CustomerServiceState {
  teamSize: number;
  monthlyTicketVolume: number;
  avgFirstResponseTime: number; // minutes
  firstContactResolution: number; // percentage 0-100
  costPerInteraction: number; // BRL
  channelsSupported: string[]; // ['chat', 'email', 'phone', 'social']
  automationLevel: 'none' | 'basic' | 'moderate' | 'advanced';
}

export interface SalesState {
  salesTeamSize: number;
  avgSalesCycle: number; // days
  leadConversionRate: number; // percentage 0-100
  avgLeadsPerRep: number; // per month
  timeOnAdminTasks: number; // percentage 0-100
  crmUsage: 'none' | 'basic' | 'advanced';
  avgDealSize: number; // BRL
}

export interface MarketingState {
  marketingTeamSize: number;
  campaignsPerMonth: number;
  contentCreationHours: number; // per week
  cac: number; // Customer Acquisition Cost (BRL)
  leadGenerationRate: number; // leads per month
  automationUsage: 'none' | 'basic' | 'moderate' | 'advanced';
}

export interface MeetingGovernanceState {
  executiveTeamSize: number;
  avgMeetingHoursPerWeek: number; // per executive
  strategicMeetingsPerMonth: number;
  minutesPreparationTime: number; // minutes per meeting
  decisionTrackingProcess: 'none' | 'manual' | 'automated';
  complianceAuditNeeds: boolean;
}

export interface OperationsState {
  opsTeamSize: number;
  manualProcessesIdentified: number;
  avgApprovalTime: number; // hours
  documentProcessingVolume: number; // per month
  processAutomationLevel: 'none' | 'basic' | 'moderate' | 'advanced';
}

export interface AssessmentData {
  persona: UserPersona;
  companyInfo: CompanyInfo;

  // AI Application Scope - which departments to assess
  aiScope: AIApplicationScope;

  // Engineering (always collected)
  currentState: CurrentState;
  goals: Goals;

  // Multi-departmental data (optional based on aiScope)
  customerService?: CustomerServiceState;
  sales?: SalesState;
  marketing?: MarketingState;
  meetingIntelligence?: MeetingGovernanceState;
  operations?: OperationsState;

  contactInfo: ContactInfo;
  submittedAt: Date;

  // For non-technical personas, store original responses
  nonTechData?: {
    currentState?: NonTechCurrentState;
    goals?: NonTechGoals;
  };
}

export interface ROICalculation {
  investment: {
    trainingCost: number;
    productivityLossDuringTraining: number;
    total: number;
  };
  annualSavings: {
    productivityGain: number;
    qualityImprovement: number;
    fasterTimeToMarket: number;
    total: number;
  };
  paybackPeriodMonths: number;
  threeYearNPV: number;
  irr: number;
}

// ============================================
// ENTERPRISE-WIDE ROI CALCULATION
// ============================================

export interface DepartmentROI {
  department: string;
  investment: number;
  annualSavings: number;
  paybackMonths: number;
  threeYearNPV: number;
  keyMetrics: string[];
  enabled: boolean;
}

export interface EnterpriseROI {
  engineering: DepartmentROI;
  customerService?: DepartmentROI;
  sales?: DepartmentROI;
  marketing?: DepartmentROI;
  operations?: DepartmentROI;
  meetingIntelligence?: DepartmentROI;

  totalEnterprise: {
    totalInvestment: number;
    totalAnnualSavings: number;
    avgPaybackMonths: number;
    totalThreeYearNPV: number;
    enterpriseIRR: number;
  };
}

export interface BenchmarkComparison {
  metric: string;
  yourValue: number;
  industryAvg: number;
  topPerformer: number;
  percentile: number;
  unit: string;
}

export interface Report {
  id: string;
  assessmentData: AssessmentData;
  roi: ROICalculation;
  enterpriseROI?: EnterpriseROI; // Multi-departmental ROI if applicable
  benchmarks: BenchmarkComparison[];
  costOfInaction: CostOfInactionAnalysis; // NEW
  riskMatrix: RiskMatrix; // NEW
  recommendations: string[];
  roadmap: RoadmapPhase[];
  generatedAt: Date;
}

export interface RoadmapPhase {
  name: string;
  duration: string;
  objectives: string[];
  expectedResults: string;
}

export interface CaseStudyResult {
  metric: string;
  improvement: string;
  note: string;
}

export interface CaseStudy {
  id: string;
  company: string;
  logo: string;
  industry: string;
  size: 'Startup' | 'Scaleup' | 'Enterprise' | 'Mixed';
  region: string;
  country: string;
  area: string;
  tool: string;
  implementation: {
    teamSize: number | string;
    duration: string;
    approach: string;
  };
  results: {
    [key: string]: CaseStudyResult;
  };
  roi: {
    paybackPeriod: string;
    annualSavings: string;
  };
  timeframe: string;
  source: string;
  sourceUrl: string;
  verified: boolean;
  featured: boolean;
  regional?: boolean;
  publishedDate?: string; // ISO date string for timestamp
}

// ============================================
// COST OF INACTION ANALYSIS
// ============================================

export interface InactionCost {
  category: string;
  annualCost: number;
  threeYearCost: number;
  description: string;
  icon: string;
}

export interface CostOfInactionAnalysis {
  totalAnnualCost: number;
  totalThreeYearCost: number;
  opportunityCostVsCompetitors: number;
  costs: InactionCost[];
  summary: string;
}

// ============================================
// RISK MATRIX
// ============================================

export interface Risk {
  id: string;
  category: 'technology' | 'competition' | 'talent' | 'market' | 'operational';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  probability: 'low' | 'medium' | 'high';
  timeframe: 'immediate' | 'short-term' | 'medium-term' | 'long-term';
  mitigationStrategy: string;
  relatedToAssessment: string[]; // Which assessment answers triggered this risk
}

export interface RiskMatrix {
  overallRiskScore: number; // 0-100
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  risks: Risk[];
  summary: string;
}
