/**
 * Unified Session Manager
 *
 * Combina o pattern robusto do business-quiz (globalThis, TTL, CRUD)
 * com tracking conversacional do assessment (persona, topics, completeness)
 *
 * Migração futura: Redis via SessionStorageAdapter interface
 */

import {
  AssessmentSessionContext,
  SessionAnswer,
  ConversationMessage,
  SessionData,
  CreateSessionOptions,
  SessionStats
} from './types';
import { AssessmentData, UserPersona, DeepPartial } from '../types';

// ============================================================================
// IN-MEMORY STORAGE (Development)
// ============================================================================

/**
 * CRITICAL: Usar globalThis para persistir sessões entre hot reloads do Next.js
 *
 * Sem isso, cada route API carrega uma nova instância do Map e perde as sessões.
 * Esse foi o bug que travava o business-quiz na primeira pergunta.
 */
declare global {
  var assessmentSessions: Map<string, SessionData> | undefined;
}

const sessions = globalThis.assessmentSessions || new Map<string, SessionData>();
if (!globalThis.assessmentSessions) {
  globalThis.assessmentSessions = sessions;
  console.log('🎯 [Unified Sessions] Global session storage initialized');
}

// TTL: 2 horas de inatividade
const SESSION_TTL_MS = 2 * 60 * 60 * 1000;

// ============================================================================
// SESSION LIFECYCLE
// ============================================================================

/**
 * Cria uma nova sessão de assessment
 */
export function createSession(
  options?: CreateSessionOptions
): AssessmentSessionContext {
  const sessionId = generateSessionId();
  const now = new Date();

  const context: AssessmentSessionContext = {
    // Identification
    sessionId,
    startedAt: now,
    lastUpdated: now,

    // Mode & Phase
    mode: options?.mode || 'ai-readiness',
    currentPhase: 'discovery',

    // Sprint 2: Block Tracking
    currentBlock: 'discovery',
    blockTransitions: [],

    // Persona Detection
    persona: options?.initialPersona || null,
    personaConfidence: options?.initialPersona ? 0.5 : 0,

    // Data Collection
    assessmentData: options?.initialData || {},
    questionsAsked: 0,
    answers: [],
    questionsAnsweredIds: [],

    // Conversation Tracking
    conversationHistory: [],
    topicsCovered: [],
    metricsCollected: [],

    // Weak Signals Detection
    weakSignals: {
      isVague: false,
      hasContradiction: false,
      hasHesitation: false,
      lacksMetrics: false,
      hasEmotionalLanguage: false,
      hasPressureIndicators: false,
    },

    // Conversation Insights
    insights: {
      urgencyLevel: 'medium',
      complexityLevel: 'moderate',
      detectedPatterns: [],
      mentionedTools: [],
      mentionedCompetitors: [],
      hasQuantifiableImpact: false,
      hasDecisionAuthority: false,
      hasBudget: false,
    },

    // Completion Tracking
    completion: {
      completenessScore: 0,
      essentialFieldsCollected: 0,
      totalFieldsCollected: 0,
      topicsCovered: [],
      metricsCollected: [],
      gapsIdentified: [],
    },
    questionsRemaining: 15,
    canFinish: false,
  };

  const sessionData: SessionData = {
    context,
    createdAt: now,
    lastActivity: now,
    expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
  };

  sessions.set(sessionId, sessionData);

  console.log('🎯 [Unified Sessions] Session created:', {
    sessionId,
    mode: context.mode,
    persona: context.persona,
  });

  return context;
}

/**
 * Recupera sessão existente
 */
export function getSession(sessionId: string): AssessmentSessionContext | null {
  const session = sessions.get(sessionId);

  if (!session) {
    console.warn('⚠️ [Unified Sessions] Session not found:', sessionId);
    return null;
  }

  // Verificar TTL
  const now = Date.now();
  const timeSinceLastActivity = now - session.lastActivity.getTime();

  if (timeSinceLastActivity > SESSION_TTL_MS) {
    console.warn('⏰ [Unified Sessions] Session expired:', sessionId);
    sessions.delete(sessionId);
    return null;
  }

  // Atualizar lastActivity
  session.lastActivity = new Date();
  session.expiresAt = new Date(now + SESSION_TTL_MS);

  return session.context;
}

/**
 * Atualiza contexto da sessão
 */
export function updateSession(
  sessionId: string,
  updates: Partial<AssessmentSessionContext>
): boolean {
  const session = sessions.get(sessionId);

  if (!session) {
    console.warn('⚠️ [Unified Sessions] Cannot update, session not found:', sessionId);
    return false;
  }

  // Merge updates (shallow merge no primeiro nível)
  session.context = {
    ...session.context,
    ...updates,
    lastUpdated: new Date(),
  };

  session.lastActivity = new Date();

  console.log('📝 [Unified Sessions] Session updated:', {
    sessionId,
    updatedFields: Object.keys(updates),
  });

  return true;
}

/**
 * Deleta sessão
 */
export function deleteSession(sessionId: string): boolean {
  const deleted = sessions.delete(sessionId);

  if (deleted) {
    console.log('🗑️ [Unified Sessions] Session deleted:', sessionId);
  }

  return deleted;
}

// ============================================================================
// ANSWER MANAGEMENT
// ============================================================================

/**
 * Adiciona resposta ao histórico da sessão
 */
export function addAnswer(
  sessionId: string,
  answer: SessionAnswer
): boolean {
  const session = sessions.get(sessionId);

  if (!session) {
    console.warn('⚠️ [Unified Sessions] Cannot add answer, session not found:', sessionId);
    return false;
  }

  session.context.answers.push(answer);
  session.context.questionsAsked++;
  session.context.questionsAnsweredIds.push(answer.questionId);
  session.lastActivity = new Date();

  // Merge data extracted from answer into assessmentData
  if (answer.dataExtracted) {
    session.context.assessmentData = deepMerge(
      session.context.assessmentData,
      answer.dataExtracted
    );
  }

  // Track category as topic if provided
  if (answer.category && !session.context.topicsCovered.includes(answer.category)) {
    session.context.topicsCovered.push(answer.category);
  }

  // Update questionsRemaining
  session.context.questionsRemaining = Math.max(0, session.context.questionsRemaining - 1);

  console.log('📝 [Unified Sessions] Answer recorded:', {
    sessionId,
    questionId: answer.questionId,
    phase: answer.phase,
    category: answer.category,
  });

  return true;
}

/**
 * Obtém todas as respostas da sessão
 */
export function getAnswers(sessionId: string): SessionAnswer[] | null {
  const session = sessions.get(sessionId);

  if (!session) {
    return null;
  }

  return session.context.answers;
}

/**
 * Obtém respostas filtradas por fase
 */
export function getAnswersByPhase(
  sessionId: string,
  phase: SessionAnswer['phase']
): SessionAnswer[] | null {
  const answers = getAnswers(sessionId);

  if (!answers) {
    return null;
  }

  return answers.filter(a => a.phase === phase);
}

// ============================================================================
// CONVERSATION TRACKING
// ============================================================================

/**
 * Adiciona mensagem ao histórico de conversação
 */
export function addConversationMessage(
  sessionId: string,
  message: ConversationMessage
): boolean {
  const session = sessions.get(sessionId);

  if (!session) {
    console.warn('⚠️ [Unified Sessions] Cannot add message, session not found:', sessionId);
    return false;
  }

  session.context.conversationHistory.push(message);
  session.lastActivity = new Date();

  console.log('💬 [Unified Sessions] Message added:', {
    sessionId,
    role: message.role,
    isFollowUp: message.metadata?.isFollowUp,
  });

  return true;
}

/**
 * Obtém histórico de conversação
 */
export function getConversationHistory(
  sessionId: string
): ConversationMessage[] | null {
  const session = sessions.get(sessionId);

  if (!session) {
    return null;
  }

  return session.context.conversationHistory;
}

/**
 * Obtém últimas N mensagens da conversação
 */
export function getRecentConversation(
  sessionId: string,
  count: number = 10
): ConversationMessage[] | null {
  const history = getConversationHistory(sessionId);

  if (!history) {
    return null;
  }

  return history.slice(-count);
}

// ============================================================================
// PERSONA & EXPERTISE DETECTION
// ============================================================================

/**
 * Atualiza persona detectada
 */
export function updatePersona(
  sessionId: string,
  persona: UserPersona,
  confidence: number
): boolean {
  const session = sessions.get(sessionId);

  if (!session) {
    console.warn('⚠️ [Unified Sessions] Cannot update persona, session not found:', sessionId);
    return false;
  }

  session.context.persona = persona;
  session.context.personaConfidence = confidence;
  session.lastActivity = new Date();

  console.log('🎭 [Unified Sessions] Persona updated:', {
    sessionId,
    persona,
    confidence: `${(confidence * 100).toFixed(1)}%`,
  });

  return true;
}

/**
 * Atualiza expertise detectada
 */
export function updateDetectedExpertise(
  sessionId: string,
  expertise: 'technical-leader' | 'product-manager' | 'c-level' | 'engineer'
): boolean {
  const session = sessions.get(sessionId);

  if (!session) {
    console.warn('⚠️ [Unified Sessions] Cannot update expertise, session not found:', sessionId);
    return false;
  }

  session.context.detectedExpertise = expertise;
  session.lastActivity = new Date();

  console.log('🎓 [Unified Sessions] Expertise detected:', {
    sessionId,
    expertise,
  });

  return true;
}

// ============================================================================
// PHASE MANAGEMENT
// ============================================================================

/**
 * Avança para a próxima fase do assessment
 */
export function advanceToPhase(
  sessionId: string,
  nextPhase: AssessmentSessionContext['currentPhase']
): boolean {
  const session = sessions.get(sessionId);

  if (!session) {
    console.warn('⚠️ [Unified Sessions] Cannot advance phase, session not found:', sessionId);
    return false;
  }

  const previousPhase = session.context.currentPhase;
  session.context.currentPhase = nextPhase;
  session.lastActivity = new Date();

  console.log('➡️ [Unified Sessions] Phase transition:', {
    sessionId,
    from: previousPhase,
    to: nextPhase,
  });

  return true;
}

/**
 * Sprint 2: Avança para o próximo bloco (4-block architecture)
 */
export function advanceToBlock(
  sessionId: string,
  nextBlock: 'discovery' | 'expertise' | 'deep-dive' | 'risk-scan',
  reason: string = 'Automatic transition'
): boolean {
  const session = sessions.get(sessionId);

  if (!session) {
    console.warn('⚠️ [Unified Sessions] Cannot advance block, session not found:', sessionId);
    return false;
  }

  const previousBlock = session.context.currentBlock || 'discovery';

  // Register transition
  const transition = {
    from: previousBlock,
    to: nextBlock,
    reason,
    questionsAsked: session.context.questionsAsked,
    timestamp: new Date()
  };

  session.context.currentBlock = nextBlock;
  session.context.blockTransitions = session.context.blockTransitions || [];
  session.context.blockTransitions.push(transition);
  session.lastActivity = new Date();

  console.log('🔄 [Unified Sessions] Block transition:', {
    sessionId,
    from: previousBlock,
    to: nextBlock,
    reason,
    questionsAsked: session.context.questionsAsked
  });

  return true;
}

// ============================================================================
// COMPLETENESS TRACKING
// ============================================================================

/**
 * Calcula score de completude baseado nos dados coletados
 */
export function calculateCompletenessScore(sessionId: string): number {
  const session = sessions.get(sessionId);

  if (!session) {
    return 0;
  }

  const data = session.context.assessmentData;

  // Campos essenciais que precisam estar preenchidos
  const essentialFieldPaths = [
    'companyInfo.name',
    'companyInfo.industry',
    'currentState.challengeDescription',
    'goals.primaryGoal',
  ];

  // Campos importantes mas não críticos
  const importantFieldPaths = [
    'companyInfo.size',
    'currentState.techStack',
    'currentState.dataManagement',
    'goals.timeline',
    'currentState.teamSize',
  ];

  // Helper para checar campo por path
  const hasFieldValue = (obj: any, path: string): boolean => {
    const keys = path.split('.');
    let current = obj;
    for (const key of keys) {
      if (!current || typeof current !== 'object') return false;
      if (!(key in current)) return false;
      current = current[key];
    }
    if (current == null || current === '') return false;
    if (Array.isArray(current) && current.length === 0) return false;
    return true;
  };

  // Contagem de campos preenchidos
  const essentialFilled = essentialFieldPaths.filter(path => hasFieldValue(data, path)).length;
  const importantFilled = importantFieldPaths.filter(path => hasFieldValue(data, path)).length;

  // Gaps identification
  const gapsIdentified = essentialFieldPaths.filter(path => !hasFieldValue(data, path));

  // Score: 70% pelos essenciais, 30% pelos importantes
  const essentialScore = (essentialFilled / essentialFieldPaths.length) * 70;
  const importantScore = (importantFilled / importantFieldPaths.length) * 30;

  const score = Math.round(essentialScore + importantScore);

  // Atualizar completion metrics na sessão
  session.context.completion = {
    completenessScore: score,
    essentialFieldsCollected: essentialFilled,
    totalFieldsCollected: essentialFilled + importantFilled,
    topicsCovered: session.context.topicsCovered,
    metricsCollected: session.context.metricsCollected,
    gapsIdentified,
  };

  // Atualizar canFinish
  session.context.canFinish = score >= 80 || session.context.questionsAsked >= 18;

  return score;
}

/**
 * Atualiza score de completude
 */
export function updateCompletenessScore(
  sessionId: string
): number | null {
  const session = sessions.get(sessionId);

  if (!session) {
    return null;
  }

  const score = calculateCompletenessScore(sessionId);

  console.log('📊 [Unified Sessions] Completeness updated:', {
    sessionId,
    score,
    hasMinimumData: session.context.hasMinimumViableData,
  });

  return score;
}

// ============================================================================
// TOPIC & METRICS TRACKING
// ============================================================================

/**
 * Marca tópico como coberto
 */
export function markTopicCovered(
  sessionId: string,
  topic: string
): boolean {
  const session = sessions.get(sessionId);

  if (!session) {
    return false;
  }

  if (!session.context.topicsCovered.includes(topic)) {
    session.context.topicsCovered.push(topic);
    session.lastActivity = new Date();

    console.log('✅ [Unified Sessions] Topic covered:', {
      sessionId,
      topic,
      totalCovered: session.context.topicsCovered.length,
    });
  }

  return true;
}

/**
 * Marca métrica como coletada
 */
export function markMetricCollected(
  sessionId: string,
  metric: string
): boolean {
  const session = sessions.get(sessionId);

  if (!session) {
    return false;
  }

  if (!session.context.metricsCollected.includes(metric)) {
    session.context.metricsCollected.push(metric);
    session.lastActivity = new Date();

    console.log('📈 [Unified Sessions] Metric collected:', {
      sessionId,
      metric,
      totalCollected: session.context.metricsCollected.length,
    });
  }

  return true;
}

// ============================================================================
// ANALYTICS & MONITORING
// ============================================================================

/**
 * Lista todas as sessões ativas
 */
export function listActiveSessions(): {
  sessionId: string;
  mode: string;
  createdAt: Date;
  lastActivity: Date;
  questionsAsked: number;
}[] {
  const now = Date.now();
  const active: any[] = [];

  sessions.forEach((session, sessionId) => {
    const timeSinceLastActivity = now - session.lastActivity.getTime();
    if (timeSinceLastActivity <= SESSION_TTL_MS) {
      active.push({
        sessionId,
        mode: session.context.mode,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        questionsAsked: session.context.questionsAsked,
      });
    }
  });

  return active;
}

/**
 * Obtém estatísticas gerais das sessões
 */
export function getSessionStats(): SessionStats {
  const now = Date.now();
  let totalSessions = 0;
  let activeSessions = 0;
  let expiredSessions = 0;
  let totalDuration = 0;
  let totalQuestions = 0;
  let completedSessions = 0;

  sessions.forEach((session) => {
    totalSessions++;

    const timeSinceLastActivity = now - session.lastActivity.getTime();
    const sessionDuration = session.lastActivity.getTime() - session.createdAt.getTime();

    if (timeSinceLastActivity <= SESSION_TTL_MS) {
      activeSessions++;
      totalDuration += sessionDuration;
      totalQuestions += session.context.questionsAsked;

      if (session.context.currentPhase === 'completion') {
        completedSessions++;
      }
    } else {
      expiredSessions++;
    }
  });

  return {
    totalSessions,
    activeSessions,
    expiredSessions,
    avgSessionDuration: activeSessions > 0 ? totalDuration / activeSessions : 0,
    avgQuestionsAsked: activeSessions > 0 ? totalQuestions / activeSessions : 0,
    completionRate: activeSessions > 0 ? (completedSessions / activeSessions) * 100 : 0,
  };
}

/**
 * Cleanup de sessões expiradas
 */
export function cleanupExpiredSessions(): number {
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
    console.log(`🧹 [Unified Sessions] Cleaned ${cleaned} expired sessions`);
  }

  return cleaned;
}

/**
 * Obtém resumo detalhado da sessão
 */
export function getSessionSummary(sessionId: string): {
  mode: string;
  currentPhase: string;
  persona: UserPersona | null;
  personaConfidence: number;
  questionsAsked: number;
  topicsCovered: string[];
  metricsCollected: string[];
  completenessScore: number;
  hasMinimumData: boolean;
  timeElapsed: number; // seconds
} | null {
  const session = sessions.get(sessionId);

  if (!session) {
    return null;
  }

  const timeElapsed = Math.round(
    (Date.now() - session.context.startedAt.getTime()) / 1000
  );

  return {
    mode: session.context.mode,
    currentPhase: session.context.currentPhase,
    persona: session.context.persona,
    personaConfidence: session.context.personaConfidence,
    questionsAsked: session.context.questionsAsked,
    topicsCovered: session.context.topicsCovered,
    metricsCollected: session.context.metricsCollected,
    completenessScore: session.context.completenessScore,
    hasMinimumData: session.context.hasMinimumViableData,
    timeElapsed,
  };
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Gera ID único para sessão
 */
function generateSessionId(): string {
  return `assess-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Deep merge de objetos (para assessmentData)
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
 * Executar cleanup a cada 30 minutos
 */
if (typeof globalThis !== 'undefined' && !globalThis.assessmentCleanupScheduled) {
  setInterval(() => {
    cleanupExpiredSessions();
  }, 30 * 60 * 1000);

  (globalThis as any).assessmentCleanupScheduled = true;
  console.log('🕐 [Unified Sessions] Cleanup scheduler initialized (30min interval)');
}
