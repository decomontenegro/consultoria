/**
 * Unified Session Types
 *
 * Combina patterns do business-quiz (session management robusto)
 * com tipos do /assessment (AI readiness focus)
 */

import {
  AssessmentData,
  UserPersona,
  DeepPartial,
  WeakSignals,
  ConversationInsights,
  CompletionMetrics,
  QuestionSource
} from '../types';

// ============================================================================
// SESSION CONTEXT
// ============================================================================

/**
 * Contexto completo de uma sessão de assessment
 * Persiste no servidor (globalThis em dev, Redis em prod)
 */
export interface AssessmentSessionContext {
  // Identification
  sessionId: string;
  startedAt: Date;
  lastUpdated: Date;

  // Mode & Phase
  mode: 'express' | 'adaptive' | 'guided' | 'ai-readiness';
  currentPhase: 'discovery' | 'expertise' | 'deep-dive' | 'completion';

  // Sprint 2: Block Tracking (4-block architecture)
  currentBlock?: 'discovery' | 'expertise' | 'deep-dive' | 'risk-scan';
  blockTransitions?: Array<{
    from: string;
    to: string;
    reason: string;
    questionsAsked: number;
    timestamp: Date;
  }>;

  // Persona Detection
  persona: UserPersona | null;
  personaConfidence: number; // 0-1
  detectedExpertise?: 'technical-leader' | 'product-manager' | 'c-level' | 'engineer';

  // Data Collection
  assessmentData: DeepPartial<AssessmentData>;
  essentialData?: any; // EssentialData from conversational-interviewer (FASE 3.5)
  questionsAsked: number;
  answers: SessionAnswer[];
  questionsAnsweredIds: string[]; // IDs for quick lookup

  // Conversation Tracking (for follow-ups and personalization)
  conversationHistory: ConversationMessage[];
  topicsCovered: string[]; // semantic topics, not just fields
  metricsCollected: string[]; // metrics actually captured

  // Weak Signals Detection (from ConversationContext)
  weakSignals: WeakSignals;

  // Conversation Insights (from ConversationContext)
  insights: ConversationInsights;

  // Completion Tracking
  completion: CompletionMetrics;
  questionsRemaining: number; // Target: 12-18 questions
  canFinish: boolean;
}

/**
 * Resposta de uma pergunta na sessão
 */
export interface SessionAnswer {
  questionId: string;
  questionText: string;
  answer: string | string[] | number;
  answeredAt: Date;
  phase: 'discovery' | 'expertise' | 'deep-dive' | 'completion';
  category?: string; // e.g., 'technical', 'cultural', 'strategic'
  source: QuestionSource; // Where the question came from (pool, LLM follow-up, etc)
  dataExtracted: Partial<AssessmentData>;
}

/**
 * Mensagem de conversação (pergunta-resposta)
 */
export interface ConversationMessage {
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
  questionId?: string;
  metadata?: {
    isFollowUp?: boolean;
    generatedByLLM?: boolean;
    targetedDataGap?: string;
  };
}

// ============================================================================
// SESSION STORAGE
// ============================================================================

/**
 * Envelope de armazenamento da sessão
 * (usado internamente pelo session manager)
 */
export interface SessionData {
  context: AssessmentSessionContext;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
}

// ============================================================================
// SESSION OPERATIONS
// ============================================================================

/**
 * Opções para criação de sessão
 */
export interface CreateSessionOptions {
  mode?: 'express' | 'adaptive' | 'guided' | 'ai-readiness';
  initialPersona?: UserPersona;
  initialData?: DeepPartial<AssessmentData>;
}

/**
 * Estatísticas da sessão
 */
export interface SessionStats {
  totalSessions: number;
  activeSessions: number;
  expiredSessions: number;
  avgSessionDuration: number; // milliseconds
  avgQuestionsAsked: number;
  completionRate: number; // percentage 0-100
}

// ============================================================================
// REDIS ADAPTER INTERFACE (for future implementation)
// ============================================================================

/**
 * Interface para adapter de storage
 * (localStorage em dev, Redis em prod)
 */
export interface SessionStorageAdapter {
  get(sessionId: string): Promise<SessionData | null>;
  set(sessionId: string, data: SessionData): Promise<void>;
  delete(sessionId: string): Promise<void>;
  exists(sessionId: string): Promise<boolean>;
  keys(): Promise<string[]>;
  clear(): Promise<void>;
}
