/**
 * Neural Question System - Adaptive Questions based on Context and Persona
 *
 * Purpose: Create intelligent, adaptive questions that change based on:
 * - User persona (CEO sees business language, CTO sees technical)
 * - Previous answers (each question depends on context)
 * - Inference confidence (skip redundant questions)
 * - Business goal (B2B conversion focus)
 */

import { AssessmentData, UserPersona, DeepPartial } from '@/lib/types';

// ============================================
// CORE TYPES
// ============================================

/**
 * Persona Language Styles - How each persona should be addressed
 */
export type PersonaLanguageStyle = {
  tone: 'business' | 'technical' | 'strategic' | 'operational';
  focusArea: 'ROI' | 'tech-specs' | 'market-impact' | 'people-impact' | 'efficiency';
  complexityLevel: 'high-level' | 'detailed' | 'tactical';
};

export const PERSONA_STYLES: Record<UserPersona, PersonaLanguageStyle> = {
  'board-executive': {
    tone: 'strategic',
    focusArea: 'ROI',
    complexityLevel: 'high-level'
  },
  'finance-ops': {
    tone: 'business',
    focusArea: 'efficiency',
    complexityLevel: 'tactical'
  },
  'product-business': {
    tone: 'business',
    focusArea: 'market-impact',
    complexityLevel: 'detailed'
  },
  'engineering-tech': {
    tone: 'technical',
    focusArea: 'tech-specs',
    complexityLevel: 'detailed'
  },
  'it-devops': {
    tone: 'operational',
    focusArea: 'efficiency',
    complexityLevel: 'tactical'
  }
};

/**
 * Assessment Context - Rich context for intelligent decisions
 */
export interface AssessmentContext {
  // Data collected so far
  currentData: DeepPartial<AssessmentData>;
  answeredQuestions: string[];

  // Session metadata
  sessionMetadata: {
    startTime: Date;
    questionsAsked: number;
    mode: 'express' | 'deep';
    persona: UserPersona | null;
    urgencyLevel?: 'low' | 'medium' | 'high' | 'critical';
  };

  // Inferences (for skipping redundant questions)
  inferences: Map<string, {
    value: any;
    confidence: number; // 0-1
    source: 'history' | 'pattern' | 'logic' | 'llm';
  }>;

  // Detected patterns
  detectedPatterns?: {
    industry?: string;
    companyStage?: 'startup' | 'scaleup' | 'enterprise';
    painPointCategory?: 'velocity' | 'quality' | 'cost' | 'compliance';
    techMaturity?: 'low' | 'medium' | 'high';
  };
}

/**
 * Question Input Types
 */
export type QuestionInputType =
  | 'text'
  | 'single-choice'
  | 'multi-choice'
  | 'quick-chips'
  | 'number'
  | 'slider';

/**
 * Question Option (for choice questions)
 */
export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
  followUpQuestion?: string; // ID of question to ask if this is selected
}

/**
 * Inference Result
 */
export interface InferenceResult {
  canInfer: boolean;
  inferredValue: any;
  confidence: number; // 0-1
  reasoning?: string;
}

/**
 * Neural Question - Core building block of adaptive assessment
 */
export interface NeuralQuestion {
  id: string;
  category: 'discovery' | 'quantification' | 'qualification' | 'commitment';

  // Dynamic question text based on persona and context
  text: string | ((context: AssessmentContext) => string);

  // Placeholder for text input
  placeholder?: string | ((context: AssessmentContext) => string);

  // Help text / explanation
  helpText?: string;

  // Dependencies: when this question should appear
  dependencies: {
    requires?: string[]; // IDs of questions that must be answered first
    contradicts?: string[]; // IDs of questions that make this unnecessary
    minConfidence?: number; // Minimum confidence to ask (if inferrable)
  };

  // Persona filtering
  personas: UserPersona[];

  // Can this question be inferred without asking?
  canInfer?: (context: AssessmentContext) => InferenceResult;

  // Determine next question based on answer
  nextQuestion?: (answer: any, context: AssessmentContext) => string | null;

  // Relevance score (0-1) - higher = more important to ask right now
  relevance: (context: AssessmentContext) => number;

  // Input type and options
  inputType: QuestionInputType;
  options?: QuestionOption[];

  // Validation
  required: boolean;
  validate?: (answer: any) => boolean;

  // Data extraction: how to update AssessmentData from answer
  dataExtractor: (
    answer: any,
    context: AssessmentContext
  ) => DeepPartial<AssessmentData>;

  // Priority (for tie-breaking in relevance)
  priority: 'essential' | 'important' | 'optional';
}

// ============================================
// INFERENCE HELPERS
// ============================================

/**
 * Infer team size from company size
 */
export function inferTeamSize(
  companySize: 'startup' | 'scaleup' | 'enterprise',
  industry: string
): InferenceResult {
  const baseSizeMap = {
    startup: 8,
    scaleup: 25,
    enterprise: 80
  };

  let teamSize = baseSizeMap[companySize];
  let confidence = 0.70;

  // Adjust for tech-heavy industries
  if (['fintech', 'saas', 'tech'].includes(industry.toLowerCase())) {
    teamSize = Math.round(teamSize * 1.3);
    confidence += 0.05;
  }

  return {
    canInfer: true,
    inferredValue: teamSize,
    confidence,
    reasoning: `Baseado em ${companySize} típico + ${industry}`
  };
}

/**
 * Infer deployment frequency from industry + pain points
 */
export function inferDeployFrequency(
  industry: string,
  painPoints: string[]
): InferenceResult {
  let frequency: string;
  let confidence = 0.60;

  // Fintech/regulated = slower
  if (['fintech', 'banking', 'healthcare'].includes(industry.toLowerCase())) {
    frequency = 'weekly';
    confidence = 0.70;

    if (painPoints.some(p => p.toLowerCase().includes('compliance'))) {
      frequency = 'monthly';
      confidence = 0.75;
    }
  } else {
    frequency = 'daily';
    confidence = 0.65;
  }

  return {
    canInfer: true,
    inferredValue: frequency,
    confidence,
    reasoning: `${industry} + pain points sugerem ${frequency} deploys`
  };
}

/**
 * Infer budget range from company size + urgency
 */
export function inferBudgetRange(
  companySize: 'startup' | 'scaleup' | 'enterprise',
  urgency: 'low' | 'medium' | 'high' | 'critical'
): InferenceResult {
  const budgetMap = {
    startup: {
      low: 'R$50k-100k',
      medium: 'R$50k-100k',
      high: 'R$100k-200k',
      critical: 'R$200k-500k'
    },
    scaleup: {
      low: 'R$100k-200k',
      medium: 'R$200k-500k',
      high: 'R$500k-1M',
      critical: 'R$1M-2M'
    },
    enterprise: {
      low: 'R$500k-1M',
      medium: 'R$1M-2M',
      high: 'R$2M-5M',
      critical: 'R$5M+'
    }
  };

  const budget = budgetMap[companySize][urgency];
  const confidence = urgency === 'critical' ? 0.75 : 0.65;

  return {
    canInfer: true,
    inferredValue: budget,
    confidence,
    reasoning: `${companySize} com urgência ${urgency} tipicamente investe ${budget}`
  };
}

// ============================================
// PERSONA-SPECIFIC QUESTION VARIANTS
// ============================================

/**
 * Adapt question text based on persona
 */
export function adaptQuestionForPersona(
  baseQuestion: string,
  persona: UserPersona,
  context: AssessmentContext
): string {
  const style = PERSONA_STYLES[persona];

  // Example adaptations (can be expanded)
  if (persona === 'board-executive') {
    // CEO/Board: Focus on business impact
    return baseQuestion
      .replace('time de tecnologia', 'equipe')
      .replace('deploys', 'lançamentos')
      .replace('cycle time', 'tempo de entrega')
      .replace('bugs', 'problemas de qualidade');
  } else if (persona === 'engineering-tech') {
    // CTO/Tech Lead: Keep technical terms
    return baseQuestion; // No adaptation needed
  } else if (persona === 'finance-ops') {
    // CFO/Ops: Focus on efficiency
    return baseQuestion
      .replace('cycle time', 'eficiência operacional')
      .replace('deploy frequency', 'frequência de entrega');
  }

  return baseQuestion;
}

/**
 * Generate persona-specific examples
 */
export function getPersonaExamples(
  questionId: string,
  persona: UserPersona
): string[] {
  const exampleMap: Record<string, Record<UserPersona, string[]>> = {
    'main-pain-point': {
      'board-executive': [
        'Perder mercado para competidores mais ágeis',
        'Time-to-market muito lento',
        'Dificuldade em escalar operações'
      ],
      'engineering-tech': [
        'Alta taxa de bugs em produção',
        'Cycle time de 3+ semanas',
        'Baixa cobertura de testes automatizados'
      ],
      'finance-ops': [
        'Processos manuais custando R$100k/mês',
        'Falta de visibilidade em custos',
        'Aprovações demorando semanas'
      ],
      'product-business': [
        'Features demorando trimestres para lançar',
        'Feedback de clientes não vira produto rápido',
        'Dificuldade em testar hipóteses'
      ],
      'it-devops': [
        'Deploys causando downtime',
        'Incidentes toda semana',
        'Infraestrutura não escalando'
      ]
    }
  };

  return exampleMap[questionId]?.[persona] || [];
}

// ============================================
// CONTEXT BUILDER
// ============================================

/**
 * Build initial context from partial data
 */
export function buildAssessmentContext(
  currentData: DeepPartial<AssessmentData>,
  persona: UserPersona | null,
  mode: 'express' | 'deep'
): AssessmentContext {
  return {
    currentData,
    answeredQuestions: [],
    sessionMetadata: {
      startTime: new Date(),
      questionsAsked: 0,
      mode,
      persona,
      urgencyLevel: undefined
    },
    inferences: new Map(),
    detectedPatterns: {}
  };
}

/**
 * Update context after question answered
 */
export function updateContext(
  context: AssessmentContext,
  questionId: string,
  answer: any,
  extractedData: DeepPartial<AssessmentData>
): AssessmentContext {
  const updated = {
    ...context,
    currentData: {
      ...context.currentData,
      ...extractedData
    },
    answeredQuestions: [...context.answeredQuestions, questionId],
    sessionMetadata: {
      ...context.sessionMetadata,
      questionsAsked: context.sessionMetadata.questionsAsked + 1
    }
  };

  // Detect patterns
  updated.detectedPatterns = detectPatterns(updated);

  return updated;
}

/**
 * Detect patterns from collected data
 */
function detectPatterns(context: AssessmentContext): AssessmentContext['detectedPatterns'] {
  const data = context.currentData;

  return {
    industry: data.companyInfo?.industry,
    companyStage: data.companyInfo?.size,
    painPointCategory: categorizePainPoints(data.currentState?.painPoints || []),
    techMaturity: assessTechMaturity(data)
  };
}

function categorizePainPoints(painPoints: string[]): 'velocity' | 'quality' | 'cost' | 'compliance' | undefined {
  const text = painPoints.join(' ').toLowerCase();

  if (text.includes('lento') || text.includes('demora')) return 'velocity';
  if (text.includes('bug') || text.includes('qualidade')) return 'quality';
  if (text.includes('cust') || text.includes('dinheiro')) return 'cost';
  if (text.includes('compliance') || text.includes('audit')) return 'compliance';

  return undefined;
}

function assessTechMaturity(data: DeepPartial<AssessmentData>): 'low' | 'medium' | 'high' | undefined {
  const aiUsage = data.currentState?.aiToolsUsage;

  if (aiUsage === 'none' || aiUsage === 'exploring') return 'low';
  if (aiUsage === 'piloting') return 'medium';
  if (aiUsage === 'production' || aiUsage === 'mature') return 'high';

  return undefined;
}
