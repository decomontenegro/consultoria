/**
 * Business Quiz API - Complete Quiz & Generate Diagnostic
 *
 * POST /api/business-quiz/complete
 *
 * Generates final diagnostic report from quiz session
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession, deleteSession } from '@/lib/business-quiz/session-manager';
import {
  generateDiagnosticWithLLM,
  validateDiagnostic,
} from '@/lib/business-quiz/llm-diagnostic-generator';
import type { BusinessDiagnostic } from '@/lib/business-quiz/types';

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

interface CompleteQuizRequest {
  sessionId: string;
}

interface CompleteQuizResponse {
  success: boolean;
  diagnosticId: string;
  diagnostic: BusinessDiagnostic;
  reportUrl: string;
}

// ============================================================================
// DIAGNOSTIC GENERATION (using Claude Sonnet)
// ============================================================================
// Removed stub - now using generateDiagnosticWithLLM() from llm-diagnostic-generator.ts

// ============================================================================
// API HANDLER
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    const body: CompleteQuizRequest = await req.json();
    const { sessionId } = body;

    // Validate required fields
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing required field: sessionId' },
        { status: 400 }
      );
    }

    console.log(`🎉 [Business Quiz] Completing quiz for session ${sessionId}...`);

    // Get session
    const session = getSession(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or expired' },
        { status: 404 }
      );
    }

    // Verify quiz is actually complete
    const totalAnswers = session.answers.length;
    if (totalAnswers < 19) {
      return NextResponse.json(
        {
          error: 'Quiz not complete',
          details: `Only ${totalAnswers}/19 questions answered`,
        },
        { status: 400 }
      );
    }

    console.log(`📊 [Business Quiz] Generating diagnostic with Claude Sonnet...`);

    // Generate diagnostic using LLM (with timeout to prevent infinite hang)
    const diagnosticPromise = generateDiagnosticWithLLM(session);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Diagnostic generation timeout after 120s')), 120000)
    );

    const diagnostic = await Promise.race([diagnosticPromise, timeoutPromise]);

    // Validate diagnostic
    const validation = validateDiagnostic(diagnostic);
    if (!validation.valid) {
      console.warn(`⚠️ [Business Quiz] Diagnostic validation warnings:`, validation.errors);
    }

    console.log(`✅ [Business Quiz] Diagnostic generated: ${diagnostic.id}`);

    // Store diagnostic in localStorage on client-side
    // For now, just return it. In production, save to database.

    // Clean up session
    deleteSession(sessionId);
    console.log(`🗑️ [Business Quiz] Session ${sessionId} deleted`);

    // Build response
    const response: CompleteQuizResponse = {
      success: true,
      diagnosticId: diagnostic.id,
      diagnostic,
      reportUrl: `/business-health-quiz/results/${diagnostic.id}`,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Business Quiz] Error completing quiz:', error);

    return NextResponse.json(
      {
        error: 'Failed to complete quiz',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
