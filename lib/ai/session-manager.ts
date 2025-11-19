/**
 * Session Manager for Adaptive Assessment
 *
 * Manages in-memory storage of active assessment sessions
 * In production, this should be replaced with Redis or database storage
 */

import type { ConversationContext } from '@/lib/types';

// In-memory session storage
// Use globalThis to survive hot reloads in development
const instanceId = Math.random().toString(36).substring(7);

declare global {
  var __adaptiveSessions: Map<string, ConversationContext> | undefined;
}

const activeSessions = globalThis.__adaptiveSessions || new Map<string, ConversationContext>();
globalThis.__adaptiveSessions = activeSessions;

console.log(`🔧 [Session Manager] Instance ${instanceId} using global sessions (count: ${activeSessions.size})`);

// Session timeout (30 minutes)
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

/**
 * Store a new session
 */
export function storeSession(context: ConversationContext): void {
  activeSessions.set(context.sessionId, context);
  console.log(`💾 [Session Manager ${instanceId}] Stored session: ${context.sessionId} (total: ${activeSessions.size})`);
}

/**
 * Get an active session by ID
 */
export function getSession(sessionId: string): ConversationContext | null {
  const context = activeSessions.get(sessionId);

  if (!context) {
    console.warn(`⚠️  [Session Manager ${instanceId}] Session not found: ${sessionId} (total sessions: ${activeSessions.size}, ids: ${Array.from(activeSessions.keys()).join(', ') || 'none'})`);
    return null;
  }

  // Check if session is expired
  const age = Date.now() - context.lastUpdated.getTime();
  if (age > SESSION_TIMEOUT_MS) {
    console.warn(`⏱️  [Session Manager] Session expired: ${sessionId}`);
    activeSessions.delete(sessionId);
    return null;
  }

  return context;
}

/**
 * Update an existing session
 */
export function updateSession(sessionId: string, context: ConversationContext): void {
  if (!activeSessions.has(sessionId)) {
    console.warn(`⚠️  [Session Manager] Attempting to update non-existent session: ${sessionId}`);
  }

  activeSessions.set(sessionId, {
    ...context,
    lastUpdated: new Date() // Update timestamp
  });

  console.log(`🔄 [Session Manager] Updated session: ${sessionId}`);
}

/**
 * Delete a session (called when assessment completes)
 */
export function deleteSession(sessionId: string): void {
  const deleted = activeSessions.delete(sessionId);
  if (deleted) {
    console.log(`🗑️  [Session Manager] Deleted session: ${sessionId}`);
  }
}

/**
 * Get all active session IDs (for debugging)
 */
export function getActiveSessionIds(): string[] {
  return Array.from(activeSessions.keys());
}

/**
 * Get session count (for monitoring)
 */
export function getSessionCount(): number {
  return activeSessions.size;
}

/**
 * Cleanup expired sessions
 * Should be called periodically by a cron job or interval
 */
export function cleanupExpiredSessions(): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [sessionId, context] of activeSessions.entries()) {
    const age = now - context.lastUpdated.getTime();
    if (age > SESSION_TIMEOUT_MS) {
      activeSessions.delete(sessionId);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`🧹 [Session Manager] Cleaned ${cleaned} expired session(s)`);
  }

  return cleaned;
}

// Auto-cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    cleanupExpiredSessions();
  }, 5 * 60 * 1000);
}
