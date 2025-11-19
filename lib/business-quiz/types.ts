/**
 * Business Health Quiz - Core Types
 *
 * Sistema de diagnóstico holístico de saúde empresarial
 * Detecta área de expertise do usuário e faz deep-dive + risk scan
 */

// ============================================================================
// BUSINESS AREAS
// ============================================================================

export type BusinessArea =
  | 'marketing-growth'
  | 'sales-commercial'
  | 'product'
  | 'operations-logistics'
  | 'financial'
  | 'people-culture'
  | 'technology-data';

export const BUSINESS_AREAS: Record<BusinessArea, string> = {
  'marketing-growth': 'Marketing & Growth',
  'sales-commercial': 'Sales & Commercial',
  'product': 'Product',
  'operations-logistics': 'Operations & Logistics',
  'financial': 'Financial',
  'people-culture': 'People & Culture',
  'technology-data': 'Technology & Data',
};

// ============================================================================
// QUESTION BLOCKS
// ============================================================================

export type QuestionBlock =
  | 'context'           // Bloco 1: Perguntas fixas de contexto (7 perguntas)
  | 'expertise'         // Bloco 2: Detecção de expertise (3-4 perguntas abertas)
  | 'deep-dive'         // Bloco 3: Aprofundamento na área detectada (5-7 perguntas)
  | 'risk-scan';        // Bloco 4: Scan rápido de riscos em outras áreas (2-3 perguntas)

// ============================================================================
// QUESTION METADATA
// ============================================================================

export interface BusinessQuestionMetadata {
  id: string;                           // Identificador único (ex: 'mktg-growth-001')
  block: QuestionBlock;                 // Em qual bloco aparece
  area: BusinessArea;                   // Área de negócio relacionada

  // Conteúdo
  questionText: string;                 // Pergunta a ser exibida
  placeholder?: string;                 // Placeholder do input
  helpText?: string;                    // Texto de ajuda (tooltip)

  // Tipo de input
  inputType: 'text' | 'textarea' | 'single-choice' | 'multi-choice' | 'scale';
  options?: string[];                   // Opções para choice/scale
  scaleRange?: { min: number; max: number; labels?: { min: string; max: string } };

  // Metadados de roteamento
  level: 'foundational' | 'intermediate' | 'advanced';  // Nível de profundidade
  weight: number;                       // Peso para detecção de expertise (0-1)

  // Relações
  upstream?: BusinessArea[];            // Áreas que influenciam esta
  downstream?: BusinessArea[];          // Áreas influenciadas por esta
  criticalFor?: BusinessArea[];         // Áreas críticas relacionadas

  // Extração de dados
  dataFields: string[];                 // Campos do BusinessAssessmentData que preenche
  dataExtractor?: (answer: string) => Record<string, any>;  // Função para extrair dados estruturados

  // Condições de exibição
  showIf?: (context: Partial<BusinessQuizContext>) => boolean;
  skipIf?: (context: Partial<BusinessQuizContext>) => boolean;
}

// ============================================================================
// QUIZ SESSION STATE
// ============================================================================

export interface QuizAnswer {
  questionId: string;
  questionText: string;
  answer: string;
  timestamp: Date;
  block: QuestionBlock;
  area: BusinessArea;
}

export interface ExpertiseSignals {
  area: BusinessArea;
  score: number;                        // 0-1, quanto maior mais expertise detectada
  evidences: string[];                  // Frases/padrões que indicam expertise
}

export interface BusinessQuizContext {
  // Identificação
  sessionId: string;
  startedAt: Date;

  // Progresso
  currentBlock: QuestionBlock;
  currentQuestionIndex: number;
  totalQuestionsAsked: number;

  // Respostas
  answers: QuizAnswer[];

  // Detecção de expertise (após Bloco 2)
  expertiseSignals?: ExpertiseSignals[];  // Todas as áreas analisadas
  detectedExpertise?: BusinessArea;       // Área com maior score
  expertiseConfidence?: number;           // Confiança da detecção (0-1)

  // Roteamento (Bloco 3 e 4)
  deepDiveArea?: BusinessArea;            // Área escolhida para deep-dive
  riskScanAreas?: BusinessArea[];         // Áreas para risk scan

  // Dados estruturados extraídos
  extractedData: Partial<BusinessAssessmentData>;
}

// ============================================================================
// ASSESSMENT DATA (Output Final)
// ============================================================================

export interface BusinessAssessmentData {
  // CONTEXTO (Bloco 1)
  company: {
    name?: string;
    industry?: string;
    stage: 'startup' | 'scaleup' | 'enterprise';
    teamSize: number;
    monthlyRevenue?: string;
    yearFounded?: number;
  };

  // MARKETING & GROWTH
  marketingGrowth: {
    primaryChannel?: string;
    cacKnown: boolean;
    cac?: number;
    ltvKnown: boolean;
    ltv?: number;
    conversionRate?: number;
    topChallenge?: string;
    activationStrategy?: string;
  };

  // SALES & COMMERCIAL
  salesCommercial: {
    salesCycleLength?: number;           // dias
    avgTicket?: number;
    winRate?: number;                    // 0-100
    churnRate?: number;                  // 0-100
    salesTeamSize?: number;
    crmUsage?: 'none' | 'basic' | 'advanced';
    topChallenge?: string;
  };

  // PRODUCT
  product: {
    developmentCycle?: number;           // semanas
    releasesPerMonth?: number;
    productMarketFit?: 'searching' | 'iterating' | 'scaling';
    userFeedbackLoop?: 'ad-hoc' | 'systematic' | 'data-driven';
    topChallenge?: string;
    roadmapHorizon?: '1-month' | '3-months' | '6-months' | '12-months';
  };

  // OPERATIONS & LOGISTICS
  operationsLogistics: {
    fulfillmentTime?: number;            // horas ou dias
    errorRate?: number;                  // 0-100
    processDocumentation?: 'none' | 'partial' | 'complete';
    automationLevel?: 'manual' | 'semi-automated' | 'fully-automated';
    topChallenge?: string;
  };

  // FINANCIAL
  financial: {
    cashRunway?: number;                 // meses
    burnRate?: number;                   // R$ por mês
    profitMargin?: number;               // percentual
    budgetPlanning?: 'none' | 'annual' | 'quarterly' | 'monthly';
    financialControls?: 'basic' | 'intermediate' | 'advanced';
    topChallenge?: string;
  };

  // PEOPLE & CULTURE
  peopleCulture: {
    headcount: number;
    growthRate?: number;                 // % ao ano
    turnoverRate?: number;               // % ao ano
    nps?: number;                        // Employee NPS
    onboardingTime?: number;             // dias
    cultureDefined: boolean;
    topChallenge?: string;
  };

  // TECHNOLOGY & DATA
  technologyData: {
    techStack?: string[];
    dataInfrastructure?: 'none' | 'basic' | 'advanced';
    cicdPipeline: boolean;
    testCoverage?: number;               // 0-100
    incidentFrequency?: 'daily' | 'weekly' | 'monthly' | 'rarely';
    topChallenge?: string;
  };

  // META
  primaryGoal?: string;                  // Objetivo principal do diagnóstico
  timeline?: string;                     // Horizonte de implementação
}

// ============================================================================
// DIAGNOSTIC OUTPUT
// ============================================================================

export interface BusinessHealthScore {
  area: BusinessArea;
  score: number;                         // 0-100
  status: 'critical' | 'attention' | 'good' | 'excellent';
  keyMetrics: {
    name: string;
    value: string | number;
    benchmark?: string | number;
    status: 'below' | 'at' | 'above';
  }[];
}

export interface BusinessDiagnostic {
  id: string;
  generatedAt: Date;

  // Dados do assessment
  assessmentData: BusinessAssessmentData;
  quizContext: BusinessQuizContext;      // Conversação completa

  // Scores por área
  healthScores: BusinessHealthScore[];
  overallScore: number;                  // 0-100

  // Insights LLM-gerados
  executiveSummary: string;
  detectedPatterns: {
    pattern: string;
    evidence: string[];
    impact: 'high' | 'medium' | 'low';
  }[];

  rootCauses: {
    issue: string;
    relatedAreas: BusinessArea[];
    explanation: string;
  }[];

  recommendations: {
    area: BusinessArea;
    priority: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    expectedImpact: string;
    timeframe: string;
    effort: 'low' | 'medium' | 'high';
    dependencies?: BusinessArea[];
  }[];

  // Roadmap sugerido (30-60-90 dias)
  roadmap?: {
    phase: '30-days' | '60-days' | '90-days';
    focus: BusinessArea[];
    keyActions: string[];
  }[];
}

// ============================================================================
// API TYPES
// ============================================================================

export interface StartQuizRequest {
  initialContext?: Partial<BusinessAssessmentData>;
}

export interface StartQuizResponse {
  sessionId: string;
  firstQuestion: BusinessQuestionMetadata;
  context: BusinessQuizContext;
}

export interface SubmitAnswerRequest {
  sessionId: string;
  questionId: string;
  answer: string;
}

export interface SubmitAnswerResponse {
  success: boolean;
  nextQuestion?: BusinessQuestionMetadata;
  blockTransition?: {
    from: QuestionBlock;
    to: QuestionBlock;
    message: string;
  };
  expertiseDetected?: {
    area: BusinessArea;
    confidence: number;
  };
  completed: boolean;
  diagnostic?: BusinessDiagnostic;
}

export interface GetSessionRequest {
  sessionId: string;
}

export interface GetSessionResponse {
  context: BusinessQuizContext;
  currentQuestion?: BusinessQuestionMetadata;
}
