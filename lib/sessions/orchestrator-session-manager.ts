/**
 * Orchestrator Session Manager V2
 *
 * Gerencia sessões do Assessment Híbrido V2 com:
 * - OrchestratorState completo
 * - Tracking de variações usadas
 * - Persistência via globalThis (Next.js hot reload safe)
 * - TTL de 24h
 */

import {
  OrchestratorState,
  SessionMetadata,
  VariationUsage,
  LastInteraction
} from '../types/assessment-v2/orchestrator-types';

// ============================================================================
// IN-MEMORY STORAGE (Development)
// ============================================================================

/**
 * Session Data Wrapper
 */
export interface OrchestratorSessionData {
  state: OrchestratorState;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
}

/**
 * CRITICAL: globalThis para persistir entre hot reloads do Next.js
 */
declare global {
  var orchestratorSessions: Map<string, OrchestratorSessionData> | undefined;
  var orchestratorCleanupScheduled: boolean | undefined;
}

const sessions = globalThis.orchestratorSessions || new Map<string, OrchestratorSessionData>();
if (!globalThis.orchestratorSessions) {
  globalThis.orchestratorSessions = sessions;
  console.log('🎯 [Orchestrator V2] Global session storage initialized');
}

// TTL: 24 horas
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

// ============================================================================
// SESSION LIFECYCLE
// ============================================================================

/**
 * Opções para criar sessão
 */
export interface CreateOrchestratorSessionOptions {
  userId?: string;
  company_name?: string;
  sector?: string;
}

/**
 * Cria nova sessão do Assessment V2
 */
export function createOrchestratorSession(
  options?: CreateOrchestratorSessionOptions
): OrchestratorState {
  const sessionId = generateSessionId();
  const now = new Date();

  const state: OrchestratorState = {
    // Dados básicos da empresa
    company_snapshot: {
      company_name: options?.company_name,
      sector: options?.sector
    },

    // Expertise do respondente
    expertise: {
      areas: [],
      levels: {},
      subtopics: {}
    },

    // Problemas e oportunidades
    problems_and_opportunities: {
      problem_areas: [],
      opportunity_areas_sorted: []
    },

    // Deep dives por área
    deep_dives: {},

    // Automation opportunities
    automation_opportunities: {},

    // Closing
    closing: {},

    // Metadata de sessão
    session_metadata: {
      session_id: sessionId,
      user_id: options?.userId,
      started_at: now.toISOString(),
      questions_asked: 0,
      questions_answered: 0,
      variations_used: [],
      llm_calls: 0,
      current_block: 'intro',
      priority_areas: []
    }
  };

  const sessionData: OrchestratorSessionData = {
    state,
    createdAt: now,
    lastActivity: now,
    expiresAt: new Date(now.getTime() + SESSION_TTL_MS)
  };

  sessions.set(sessionId, sessionData);

  console.log('🎯 [Orchestrator V2] Session created:', {
    sessionId,
    userId: options?.userId,
    company: options?.company_name
  });

  return state;
}

/**
 * Recupera sessão existente
 */
export function getOrchestratorSession(sessionId: string): OrchestratorState | null {
  const session = sessions.get(sessionId);

  if (!session) {
    console.warn('⚠️ [Orchestrator V2] Session not found:', sessionId);
    return null;
  }

  // Verificar TTL
  const now = Date.now();
  const timeSinceLastActivity = now - session.lastActivity.getTime();

  if (timeSinceLastActivity > SESSION_TTL_MS) {
    console.warn('⏰ [Orchestrator V2] Session expired:', sessionId);
    sessions.delete(sessionId);
    return null;
  }

  // Atualizar lastActivity
  session.lastActivity = new Date();
  session.expiresAt = new Date(now + SESSION_TTL_MS);

  return session.state;
}

/**
 * Atualiza estado da sessão
 */
export function updateOrchestratorSession(
  sessionId: string,
  updates: Partial<OrchestratorState>
): boolean {
  const session = sessions.get(sessionId);

  if (!session) {
    console.warn('⚠️ [Orchestrator V2] Cannot update, session not found:', sessionId);
    return false;
  }

  // Deep merge do state
  session.state = deepMerge(session.state, updates);
  session.lastActivity = new Date();

  console.log('📝 [Orchestrator V2] Session updated:', {
    sessionId,
    updatedFields: Object.keys(updates)
  });

  return true;
}

/**
 * Deleta sessão
 */
export function deleteOrchestratorSession(sessionId: string): boolean {
  const deleted = sessions.delete(sessionId);

  if (deleted) {
    console.log('🗑️ [Orchestrator V2] Session deleted:', sessionId);
  }

  return deleted;
}

// ============================================================================
// ANSWER & VARIATION TRACKING
// ============================================================================

/**
 * Registra resposta e atualiza estado
 */
export function recordAnswer(
  sessionId: string,
  questionId: string,
  variationId: string,
  answer: any,
  dataExtracted?: any
): boolean {
  const session = sessions.get(sessionId);

  if (!session) {
    console.warn('⚠️ [Orchestrator V2] Cannot record answer, session not found:', sessionId);
    return false;
  }

  // Registrar variação usada
  const variationUsage: VariationUsage = {
    question_id: questionId,
    variation_id: variationId,
    timestamp: new Date().toISOString()
  };

  session.state.session_metadata.variations_used.push(variationUsage);
  session.state.session_metadata.questions_asked += 1;
  session.state.session_metadata.questions_answered += 1;

  // Merge data extracted into state
  if (dataExtracted) {
    session.state = deepMerge(session.state, dataExtracted);
  }

  session.lastActivity = new Date();

  console.log('📝 [Orchestrator V2] Answer recorded:', {
    sessionId,
    questionId,
    variationId,
    questionsAsked: session.state.session_metadata.questions_asked
  });

  return true;
}

/**
 * Obtém lista de variações já usadas para uma pergunta
 */
export function getUsedVariations(
  sessionId: string,
  questionId: string
): string[] {
  const session = sessions.get(sessionId);

  if (!session) {
    return [];
  }

  return session.state.session_metadata.variations_used
    .filter(v => v.question_id === questionId)
    .map(v => v.variation_id);
}

/**
 * Obtém lista de perguntas já feitas
 */
export function getAskedQuestions(sessionId: string): string[] {
  const session = sessions.get(sessionId);

  if (!session) {
    return [];
  }

  return session.state.session_metadata.variations_used.map(v => v.question_id);
}

// ============================================================================
// LAST INTERACTION TRACKING
// ============================================================================

/**
 * Armazena última interação (para contexto do orquestrador)
 */
export function setLastInteraction(
  sessionId: string,
  interaction: LastInteraction
): boolean {
  const session = sessions.get(sessionId);

  if (!session) {
    return false;
  }

  // Armazenar no session data (não no state, pois é temporário)
  (session as any).lastInteraction = interaction;
  session.lastActivity = new Date();

  return true;
}

/**
 * Obtém última interação
 */
export function getLastInteraction(sessionId: string): LastInteraction | undefined {
  const session = sessions.get(sessionId);

  if (!session) {
    return undefined;
  }

  return (session as any).lastInteraction;
}

// ============================================================================
// PRIORITY AREAS MANAGEMENT
// ============================================================================

/**
 * Atualiza áreas prioritárias (expertise ∩ problemas)
 */
export function updatePriorityAreas(
  sessionId: string,
  priorityAreas: string[]
): boolean {
  const session = sessions.get(sessionId);

  if (!session) {
    return false;
  }

  session.state.session_metadata.priority_areas = priorityAreas;
  session.lastActivity = new Date();

  console.log('🎯 [Orchestrator V2] Priority areas updated:', {
    sessionId,
    priorityAreas
  });

  return true;
}

/**
 * Calcula áreas prioritárias automaticamente
 */
export function calculatePriorityAreas(sessionId: string): string[] {
  const session = sessions.get(sessionId);

  if (!session) {
    return [];
  }

  const { expertise, problems_and_opportunities } = session.state;

  // Áreas com expertise intermediária/profunda que também têm problemas
  const priorityAreas = expertise.areas.filter(area => {
    const level = expertise.levels[area];
    const hasExpertise = level === 'intermediate' || level === 'deep';
    const hasProblem = problems_and_opportunities.problem_areas.includes(area);
    return hasExpertise && hasProblem;
  });

  // Atualizar automaticamente
  session.state.session_metadata.priority_areas = priorityAreas;

  return priorityAreas;
}

// ============================================================================
// DEEP DIVE TRACKING
// ============================================================================

/**
 * Atualiza deep dive de uma área específica
 */
export function updateDeepDive(
  sessionId: string,
  area: string,
  questionId: string,
  answer: any,
  tags?: string[]
): boolean {
  const session = sessions.get(sessionId);

  if (!session) {
    return false;
  }

  // Inicializar deep dive se não existir
  if (!session.state.deep_dives[area]) {
    session.state.deep_dives[area] = {
      answers: {},
      tags: []
    };
  }

  // Armazenar resposta
  session.state.deep_dives[area].answers[questionId] = answer;

  // Adicionar tags (sem duplicatas)
  if (tags) {
    const existingTags = session.state.deep_dives[area].tags || [];
    const newTags = [...new Set([...existingTags, ...tags])];
    session.state.deep_dives[area].tags = newTags;
  }

  session.lastActivity = new Date();

  console.log('🔍 [Orchestrator V2] Deep dive updated:', {
    sessionId,
    area,
    questionId,
    totalAnswers: Object.keys(session.state.deep_dives[area].answers).length,
    tags: session.state.deep_dives[area].tags
  });

  return true;
}

// ============================================================================
// LLM CALL TRACKING
// ============================================================================

/**
 * Incrementa contador de chamadas LLM
 */
export function incrementLLMCalls(sessionId: string): boolean {
  const session = sessions.get(sessionId);

  if (!session) {
    return false;
  }

  session.state.session_metadata.llm_calls += 1;
  session.lastActivity = new Date();

  return true;
}

// ============================================================================
// ANALYTICS & MONITORING
// ============================================================================

/**
 * Lista todas as sessões ativas
 */
export function listActiveOrchestratorSessions(): {
  sessionId: string;
  userId?: string;
  company?: string;
  createdAt: Date;
  lastActivity: Date;
  questionsAsked: number;
  llmCalls: number;
}[] {
  const now = Date.now();
  const active: any[] = [];

  sessions.forEach((session, sessionId) => {
    const timeSinceLastActivity = now - session.lastActivity.getTime();
    if (timeSinceLastActivity <= SESSION_TTL_MS) {
      active.push({
        sessionId,
        userId: session.state.session_metadata.user_id,
        company: session.state.company_snapshot.company_name,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        questionsAsked: session.state.session_metadata.questions_asked,
        llmCalls: session.state.session_metadata.llm_calls
      });
    }
  });

  return active;
}

/**
 * Obtém resumo da sessão
 */
export function getOrchestratorSessionSummary(sessionId: string): {
  questionsAsked: number;
  questionsAnswered: number;
  llmCalls: number;
  currentBlock: string;
  priorityAreas: string[];
  variationsUsed: number;
  timeElapsed: number; // seconds
} | null {
  const session = sessions.get(sessionId);

  if (!session) {
    return null;
  }

  const timeElapsed = Math.round(
    (Date.now() - session.createdAt.getTime()) / 1000
  );

  return {
    questionsAsked: session.state.session_metadata.questions_asked,
    questionsAnswered: session.state.session_metadata.questions_answered,
    llmCalls: session.state.session_metadata.llm_calls,
    currentBlock: session.state.session_metadata.current_block,
    priorityAreas: session.state.session_metadata.priority_areas,
    variationsUsed: session.state.session_metadata.variations_used.length,
    timeElapsed
  };
}

/**
 * Cleanup de sessões expiradas
 */
export function cleanupExpiredOrchestratorSessions(): number {
  const now = Date.now();
  let cleaned = 0;

  sessions.forEach((session, sessionId) => {
    const timeSinceLastActivity = now - session.lastActivity.getTime();
    if (timeSinceLastActivity > SESSION_TTL_MS) {
      sessions.delete(sessionId);
      cleaned++;
    }
  });

  if (cleaned > 0) {
    console.log(`🧹 [Orchestrator V2] Cleaned ${cleaned} expired sessions`);
  }

  return cleaned;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Gera ID único para sessão
 */
function generateSessionId(): string {
  return `v2-assess-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Deep merge de objetos
 */
function deepMerge(target: any, source: any): any {
  const result = { ...target };

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (
        typeof source[key] === 'object' &&
        source[key] !== null &&
        !Array.isArray(source[key]) &&
        !(source[key] instanceof Date)
      ) {
        result[key] = deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }

  return result;
}

// ============================================================================
// CLEANUP SCHEDULER
// ============================================================================

/**
 * Executar cleanup a cada 2 horas
 */
if (typeof globalThis !== 'undefined' && !globalThis.orchestratorCleanupScheduled) {
  setInterval(() => {
    cleanupExpiredOrchestratorSessions();
  }, 2 * 60 * 60 * 1000);

  globalThis.orchestratorCleanupScheduled = true;
  console.log('🕐 [Orchestrator V2] Cleanup scheduler initialized (2h interval)');
}
