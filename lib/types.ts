/**
 * Type definitions for CulturaBuilder Assessment Platform
 */

// Helper type for deeply nested partial objects
export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

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

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface DataQuality {
  completeness: number; // 0-100% - percentage of data fields provided
  specificity: number; // 0-100% - how specific/detailed the data is
  missingCriticalData: string[]; // List of critical missing fields
  dataSource: 'self-reported' | 'integrated' | 'estimated'; // How data was obtained
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
  // Confidence tracking
  confidenceLevel: ConfidenceLevel;
  dataQuality: DataQuality;
  assumptions: string[]; // Key assumptions made in calculations
  uncertaintyRange: {
    // Conservative and optimistic scenarios
    conservativeNPV: number;
    optimisticNPV: number;
    mostLikelyNPV: number; // Same as threeYearNPV
  };
  // 4-Pillar Framework (optional, for enhanced ROI view)
  fourPillarROI?: FourPillarROI;
}

// ============================================
// 4-PILLAR ROI FRAMEWORK (Inspired by Writer AI)
// ============================================

export interface FourPillarROI {
  // Pillar 1: Efficiency Gains
  efficiency: {
    productivityIncrease: number; // Percentage
    timeToMarketReduction: number; // Percentage
    annualValue: number; // BRL
    keyMetrics: string[];
  };

  // Pillar 2: Revenue Acceleration
  revenue: {
    fasterProductLaunches: number; // Additional products per year
    customerAcquisitionGain: number; // Percentage increase
    marketShareGain: number; // Percentage
    annualValue: number; // BRL
    keyMetrics: string[];
  };

  // Pillar 3: Risk Mitigation
  risk: {
    codeQualityImprovement: number; // Percentage
    bugReduction: number; // Percentage
    securityImprovements: string[];
    annualValue: number; // BRL saved on incidents
    keyMetrics: string[];
  };

  // Pillar 4: Business Agility
  agility: {
    deploymentFrequencyIncrease: number; // Percentage
    experimentVelocity: number; // Additional A/B tests per quarter
    innovationCapacity: number; // New features per sprint increase
    annualValue: number; // BRL value of agility
    keyMetrics: string[];
  };

  // Overall 4-Pillar Summary
  totalValue: {
    efficiency: number;
    revenue: number;
    risk: number;
    agility: number;
    combined: number; // Total across all 4 pillars
  };
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

// FASE 3.5+: Conversation context for personalized reports
export interface ConversationMessage {
  question: string;
  answer: string;
  timestamp: Date;
}

export interface ConversationContext {
  mode: 'express' | 'adaptive' | 'guided';
  rawConversation: ConversationMessage[];
  // Future: keyQuotes for FASE 2
  // Future: userScenarios for FASE 4
}

export interface Report {
  id: string;
  assessmentData: AssessmentData;
  roi: ROICalculation;
  enterpriseROI?: EnterpriseROI; // Multi-departmental ROI if applicable
  benchmarks: BenchmarkComparison[];
  costOfInaction: CostOfInactionAnalysis;
  riskMatrix: RiskMatrix;
  recommendations: string[];
  roadmap: RoadmapPhase[];
  aiInsights?: string[]; // Insights from AI consultation (optional - deprecated)
  deepInsights?: any; // FASE 3: Deep insights from PhD consultant (DeepInsights type)
  conversationContext?: ConversationContext; // FASE 3.5+: Preserve conversation for personalization
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

// ============================================
// AI-FIRST ASSESSMENT JOURNEY
// ============================================

/**
 * Assessment modes for AI-first journey
 * Simplified to 2 clear options after user research + adaptive conversational mode
 */
export type AssessmentMode =
  | 'express'   // 5-7 min: AI-powered essential questions, executive report
  | 'deep'      // 15-20 min: Multi-specialist consultation, complete analysis
  | 'adaptive'; // 5-10 min: Conversational interview with LLM-generated questions (FASE 3.5)

/**
 * Urgency level detected by AI
 */
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * Complexity assessment
 */
export type ComplexityLevel = 'simple' | 'moderate' | 'complex';

/**
 * Conversation message for AI routing
 */
export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

/**
 * Result from AI router analysis
 */
export interface AIRouterResult {
  // Detected characteristics
  detectedPersona: UserPersona | null;
  personaConfidence: number; // 0-1

  urgencyLevel: UrgencyLevel;
  complexityLevel: ComplexityLevel;

  // Recommendation
  recommendedMode: AssessmentMode;
  reasoning: string;
  reasons: string[]; // Specific bullet points explaining the recommendation

  // Partial data collected during routing conversation
  partialData: {
    companyInfo?: Partial<CompanyInfo>;
    painPoints?: string[];
    mainGoal?: string;
    budget?: string;
  };

  // Alternative modes available
  alternativeModes: AssessmentMode[];
}

/**
 * AI Router conversation state
 */
export interface AIRouterState {
  messages: ConversationMessage[];
  questionsAsked: number;
  maxQuestions: number;
  isComplete: boolean;
  result: AIRouterResult | null;
}

// ============================================
// ADAPTIVE ASSESSMENT SYSTEM (FASE 3.5)
// ============================================

/**
 * Question source tracking
 */
export interface QuestionSource {
  type: 'pool' | 'follow-up' | 'custom-generated';
  poolId?: string; // If from question pool
  parentQuestionId?: string; // If follow-up to another question
  generatedBy?: 'ai-router' | 'orchestrator' | 'adaptive-engine'; // If custom generated
  generatedAt?: Date;
}

/**
 * Weak signals detected in user responses
 * Used to trigger follow-up questions
 */
export interface WeakSignals {
  isVague: boolean; // Lack of specificity ("alguns", "meio que")
  hasContradiction: boolean; // Contradictory statements
  hasHesitation: boolean; // Hesitant language ("acho que", "talvez")
  lacksMetrics: boolean; // No concrete numbers when relevant
  hasEmotionalLanguage: boolean; // Strong emotion ("frustrado", "desesperado")
  hasPressureIndicators: boolean; // Urgency signals ("ontem", "ASAP")
}

/**
 * Insights extracted from conversation so far
 */
export interface ConversationInsights {
  urgencyLevel: UrgencyLevel;
  complexityLevel: ComplexityLevel;
  detectedPatterns: string[]; // e.g., ['tech-debt-spiral', 'velocity-crisis']
  mentionedTools: string[]; // Tools/technologies mentioned
  mentionedCompetitors: string[];
  hasQuantifiableImpact: boolean;
  hasDecisionAuthority: boolean;
  hasBudget: boolean;
}

/**
 * Completion metrics for adaptive assessment
 */
export interface CompletionMetrics {
  completenessScore: number; // 0-100
  essentialFieldsCollected: number;
  totalFieldsCollected: number;
  topicsCovered: string[];
  metricsCollected: string[];
  gapsIdentified: string[]; // What's still missing
}

/**
 * Conversation context for adaptive question routing
 * Maintains complete state of the conversation
 */
export interface ConversationContext {
  // Session identification
  sessionId: string;
  startTime: Date;
  lastUpdated: Date;

  // Persona detection
  persona: UserPersona | null;
  personaConfidence: number; // 0-1

  // Assessment data collected so far
  assessmentData: DeepPartial<AssessmentData>;

  // Essential data for conversational interviewer (FASE 3.5)
  essentialData?: any; // Will be EssentialData type from conversational-interviewer

  // Questions tracking
  questionsAsked: Array<{
    id: string;
    questionText: string;
    answer: any;
    source: QuestionSource;
    askedAt: Date;
  }>;
  questionsAnsweredIds: string[]; // Just IDs for quick lookup

  // Topic tracking (semantic, not just field tracking)
  topicsCovered: Set<string>; // e.g., ['velocity', 'bugs', 'cost', 'team-size']

  // Metrics tracking
  metricsCollected: string[]; // e.g., ['cycle_time', 'bug_rate', 'team_size']

  // Weak signals detected
  weakSignals: WeakSignals;

  // Insights extracted
  insights: ConversationInsights;

  // Completion tracking
  completion: CompletionMetrics;

  // Session metadata
  questionsRemaining: number; // Target questions left (e.g., started with 15, now 7 left)
  canFinish: boolean; // Whether assessment has enough data to finish
}

/**
 * AI routing decision for next question
 * Result from adaptive question router
 */
export interface RoutingDecision {
  questionId: string;
  reasoning: string; // 1-2 sentences explaining why this question is best
  confidence: number; // 0-1
  alternativeQuestions?: string[]; // Other good options considered
}

/**
 * Sprint 2: Enhanced Types for Question Structure
 */

/**
 * Question Block Type (4-block architecture from business-quiz)
 */
export type QuestionBlock = 'discovery' | 'expertise' | 'deep-dive' | 'risk-scan';

/**
 * Enhanced Routing Decision with Block Context
 */
export interface EnhancedRoutingDecision extends RoutingDecision {
  currentBlock: QuestionBlock;
  suggestedNextBlock?: QuestionBlock;
  blockProgress: number; // 0-1, progress within current block
  shouldTransition?: boolean; // Should transition to next block
}

/**
 * Follow-up Question (LLM-generated)
 */
export interface FollowUpQuestion {
  id: string; // Generated ID like "followup-disc-002-1"
  text: string; // LLM-generated question
  inputType: 'text' | 'single-choice' | 'multi-choice';
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;

  // Context
  triggeredBy: string; // ID of question that triggered this
  reason: string; // Why this follow-up was generated
  targetGap: string; // What gap it's trying to fill

  // Metadata
  generatedAt: Date;
  llmModel: string; // 'sonnet' | 'haiku'
}

/**
 * Block Transition Event
 */
export interface BlockTransition {
  from: QuestionBlock;
  to: QuestionBlock;
  reason: string; // Why transition happened
  questionsAsked: number; // How many questions were asked in previous block
  completenessAtTransition: number; // 0-100
  timestamp: Date;
}

/**
 * Question Prerequisites Check
 */
export interface QuestionPrerequisites {
  questionId: string;
  required: string[]; // Question IDs that must be answered first
  allSatisfied: boolean;
  missingSome?: string[]; // IDs of prerequisites not yet satisfied
}

/**
 * Deep-Dive Area Detection
 */
export interface DeepDiveAreaDetection {
  area: 'velocity' | 'quality' | 'onboarding' | 'documentation';
  confidence: number; // 0-1
  reasoning: string;
  basedOn: string[]; // Question IDs that informed this detection
}

/**
 * Request to adaptive question engine
 */
export interface AdaptiveQuestionRequest {
  context: ConversationContext;
  availableQuestions: string[]; // Question IDs
  forceCategory?: string; // Force a specific category
  maxQuestions?: number; // Max questions remaining
}

/**
 * Response from adaptive question engine
 */
export interface AdaptiveQuestionResponse {
  nextQuestion: {
    id: string;
    text: string;
    inputType: string;
    options?: any[];
    placeholder?: string;
  } | null; // null if should finish
  routing: RoutingDecision | null;
  shouldFinish: boolean;
  finishReason?: 'completeness_reached' | 'max_questions' | 'all_essential_covered';
  completion: CompletionMetrics;
}
