/**
 * Business Health Quiz - Session Manager
 *
 * Gerencia estado das sessões do quiz adaptativo
 * Usa Map in-memory (migrar para Redis em produção)
 */

import { BusinessQuizContext, QuizAnswer, BusinessAssessmentData, BusinessArea } from './types';

// ============================================================================
// IN-MEMORY STORAGE (Development)
// ============================================================================

interface SessionData {
  context: BusinessQuizContext;
  createdAt: Date;
  lastActivity: Date;
}

// Global storage (usar Redis em produção)
// IMPORTANTE: Usar globalThis para persistir entre hot reloads do Next.js
declare global {
  var businessQuizSessions: Map<string, SessionData> | undefined;
}

const sessions = globalThis.businessQuizSessions || new Map<string, SessionData>();
if (!globalThis.businessQuizSessions) {
  globalThis.businessQuizSessions = sessions;
}

// TTL: 2 horas de inatividade
const SESSION_TTL_MS = 2 * 60 * 60 * 1000;

// ============================================================================
// SESSION LIFECYCLE
// ============================================================================

/**
 * Cria uma nova sessão de quiz
 */
export function createSession(
  initialData?: Partial<BusinessAssessmentData>
): BusinessQuizContext {
  const sessionId = generateSessionId();

  const context: BusinessQuizContext = {
    sessionId,
    startedAt: new Date(),
    currentBlock: 'context',
    currentQuestionIndex: 0,
    totalQuestionsAsked: 0,
    answers: [],
    extractedData: initialData || {},
  };

  sessions.set(sessionId, {
    context,
    createdAt: new Date(),
    lastActivity: new Date(),
  });

  console.log('🎯 [Business Quiz] Session created:', sessionId);

  return context;
}

/**
 * Recupera sessão existente
 */
export function getSession(sessionId: string): BusinessQuizContext | null {
  const session = sessions.get(sessionId);

  if (!session) {
    console.warn('⚠️ [Business Quiz] Session not found:', sessionId);
    return null;
  }

  // Verificar TTL
  const timeSinceLastActivity = Date.now() - session.lastActivity.getTime();
  if (timeSinceLastActivity > SESSION_TTL_MS) {
    console.warn('⏰ [Business Quiz] Session expired:', sessionId);
    sessions.delete(sessionId);
    return null;
  }

  // Atualizar lastActivity
  session.lastActivity = new Date();

  return session.context;
}

/**
 * Atualiza contexto da sessão
 */
export function updateSession(
  sessionId: string,
  updates: Partial<BusinessQuizContext>
): boolean {
  const session = sessions.get(sessionId);

  if (!session) {
    console.warn('⚠️ [Business Quiz] Cannot update, session not found:', sessionId);
    return false;
  }

  // Merge updates
  session.context = {
    ...session.context,
    ...updates,
  };

  session.lastActivity = new Date();

  return true;
}

/**
 * Adiciona resposta ao histórico da sessão
 */
export function addAnswer(
  sessionId: string,
  answer: QuizAnswer
): boolean {
  const session = sessions.get(sessionId);

  if (!session) {
    console.warn('⚠️ [Business Quiz] Cannot add answer, session not found:', sessionId);
    return false;
  }

  session.context.answers.push(answer);
  session.context.totalQuestionsAsked++;
  session.lastActivity = new Date();

  console.log(`📝 [Business Quiz] Answer recorded for ${sessionId}:`, {
    questionId: answer.questionId,
    block: answer.block,
    area: answer.area,
  });

  return true;
}

/**
 * Atualiza dados estruturados extraídos
 */
export function updateExtractedData(
  sessionId: string,
  data: Partial<BusinessAssessmentData>
): boolean {
  const session = sessions.get(sessionId);

  if (!session) {
    console.warn('⚠️ [Business Quiz] Cannot update data, session not found:', sessionId);
    return false;
  }

  // Deep merge dos dados extraídos
  session.context.extractedData = deepMerge(
    session.context.extractedData,
    data
  );

  session.lastActivity = new Date();

  console.log(`💾 [Business Quiz] Extracted data updated for ${sessionId}:`, {
    fieldsUpdated: Object.keys(data),
  });

  return true;
}

/**
 * Marca área de expertise detectada
 */
export function setDetectedExpertise(
  sessionId: string,
  area: BusinessArea,
  confidence: number
): boolean {
  const session = sessions.get(sessionId);

  if (!session) {
    console.warn('⚠️ [Business Quiz] Cannot set expertise, session not found:', sessionId);
    return false;
  }

  session.context.detectedExpertise = area;
  session.context.expertiseConfidence = confidence;
  session.lastActivity = new Date();

  console.log(`🎓 [Business Quiz] Expertise detected for ${sessionId}:`, {
    area,
    confidence: `${(confidence * 100).toFixed(1)}%`,
  });

  return true;
}

/**
 * Define área de deep-dive
 */
export function setDeepDiveArea(
  sessionId: string,
  area: BusinessArea
): boolean {
  const session = sessions.get(sessionId);

  if (!session) {
    console.warn('⚠️ [Business Quiz] Cannot set deep-dive, session not found:', sessionId);
    return false;
  }

  session.context.deepDiveArea = area;
  session.lastActivity = new Date();

  console.log(`🔍 [Business Quiz] Deep-dive area set for ${sessionId}:`, area);

  return true;
}

/**
 * Define áreas de risk scan
 */
export function setRiskScanAreas(
  sessionId: string,
  areas: BusinessArea[]
): boolean {
  const session = sessions.get(sessionId);

  if (!session) {
    console.warn('⚠️ [Business Quiz] Cannot set risk-scan, session not found:', sessionId);
    return false;
  }

  session.context.riskScanAreas = areas;
  session.lastActivity = new Date();

  console.log(`⚠️ [Business Quiz] Risk-scan areas set for ${sessionId}:`, areas);

  return true;
}

/**
 * Avança para o próximo bloco
 */
export function advanceToBlock(
  sessionId: string,
  nextBlock: BusinessQuizContext['currentBlock']
): boolean {
  const session = sessions.get(sessionId);

  if (!session) {
    console.warn('⚠️ [Business Quiz] Cannot advance block, session not found:', sessionId);
    return false;
  }

  const previousBlock = session.context.currentBlock;
  session.context.currentBlock = nextBlock;
  session.context.currentQuestionIndex = 0;
  session.lastActivity = new Date();

  console.log(`➡️ [Business Quiz] Block transition for ${sessionId}:`, {
    from: previousBlock,
    to: nextBlock,
  });

  return true;
}

/**
 * Deleta sessão
 */
export function deleteSession(sessionId: string): boolean {
  const deleted = sessions.delete(sessionId);

  if (deleted) {
    console.log('🗑️ [Business Quiz] Session deleted:', sessionId);
  }

  return deleted;
}

/**
 * Lista todas as sessões ativas (útil para debugging)
 */
export function listActiveSessions(): { sessionId: string; createdAt: Date; lastActivity: Date }[] {
  const now = Date.now();
  const active: { sessionId: string; createdAt: Date; lastActivity: Date }[] = [];

  sessions.forEach((session, sessionId) => {
    const timeSinceLastActivity = now - session.lastActivity.getTime();
    if (timeSinceLastActivity <= SESSION_TTL_MS) {
      active.push({
        sessionId,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
      });
    }
  });

  return active;
}

/**
 * Cleanup de sessões expiradas (executar periodicamente)
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
    console.log(`🧹 [Business Quiz] Cleaned ${cleaned} expired sessions`);
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
  return `biz-quiz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Deep merge de objetos (para extractedData)
 */
function deepMerge(target: any, source: any): any {
  const result = { ...target };

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (
        typeof source[key] === 'object' &&
        source[key] !== null &&
        !Array.isArray(source[key])
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
// ANALYTICS & MONITORING
// ============================================================================

/**
 * Obtém estatísticas da sessão
 */
export function getSessionStats(sessionId: string): {
  totalQuestions: number;
  currentBlock: string;
  progress: number;
  timeElapsed: number;
} | null {
  const session = sessions.get(sessionId);

  if (!session) {
    return null;
  }

  const timeElapsed = Date.now() - session.context.startedAt.getTime();

  // Estimar progresso (simplificado)
  let expectedTotal = 0;
  switch (session.context.currentBlock) {
    case 'context':
      expectedTotal = 7;
      break;
    case 'expertise':
      expectedTotal = 7 + 4;
      break;
    case 'deep-dive':
      expectedTotal = 7 + 4 + 5; // 5 perguntas no deep-dive
      break;
    case 'risk-scan':
      expectedTotal = 7 + 4 + 5 + 3; // 3 risk scan
      break;
  }

  const progress = expectedTotal > 0
    ? (session.context.totalQuestionsAsked / expectedTotal) * 100
    : 0;

  return {
    totalQuestions: session.context.totalQuestionsAsked,
    currentBlock: session.context.currentBlock,
    progress: Math.min(progress, 100),
    timeElapsed: Math.round(timeElapsed / 1000), // segundos
  };
}

/**
 * Obtém resumo do que foi coletado
 */
export function getSessionSummary(sessionId: string): {
  detectedExpertise?: BusinessArea;
  expertiseConfidence?: number;
  deepDiveArea?: BusinessArea;
  riskScanAreas?: BusinessArea[];
  totalAnswers: number;
  dataFieldsFilled: number;
} | null {
  const session = sessions.get(sessionId);

  if (!session) {
    return null;
  }

  // Contar campos preenchidos
  const dataFieldsFilled = countFilledFields(session.context.extractedData);

  return {
    detectedExpertise: session.context.detectedExpertise,
    expertiseConfidence: session.context.expertiseConfidence,
    deepDiveArea: session.context.deepDiveArea,
    riskScanAreas: session.context.riskScanAreas,
    totalAnswers: session.context.answers.length,
    dataFieldsFilled,
  };
}

function countFilledFields(obj: any, prefix = ''): number {
  let count = 0;

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];

      if (value === null || value === undefined || value === '') {
        continue;
      }

      if (typeof value === 'object' && !Array.isArray(value)) {
        count += countFilledFields(value, `${prefix}${key}.`);
      } else {
        count++;
      }
    }
  }

  return count;
}

// ============================================================================
// CLEANUP SCHEDULER (opcional)
// ============================================================================

// Executar cleanup a cada 30 minutos
if (typeof globalThis !== 'undefined') {
  setInterval(() => {
    cleanupExpiredSessions();
  }, 30 * 60 * 1000);
}
