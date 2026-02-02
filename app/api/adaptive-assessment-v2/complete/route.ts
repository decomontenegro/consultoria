/**
 * POST /api/adaptive-assessment-v2/complete
 *
 * Finaliza assessment e retorna dados estruturados completos
 *
 * Body:
 * - sessionId
 *
 * Returns:
 * - OrchestratorState completo
 * - session_summary
 * - completion_timestamp
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getOrchestratorSession,
  getOrchestratorSessionSummary,
  deleteOrchestratorSession
} from '@/lib/sessions/orchestrator-session-manager';
import { buildRichOutput } from '@/lib/types/assessment-v2/rich-output';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Recuperar sessão
    const state = getOrchestratorSession(sessionId);

    if (!state) {
      return NextResponse.json(
        { error: 'Session not found or expired' },
        { status: 404 }
      );
    }

    // Recuperar summary
    const summary = getOrchestratorSessionSummary(sessionId);

    // Montar output final usando rich output builder
    const richOutput = buildRichOutput(state);

    // Adicionar summary extra
    const completedAssessment = {
      ...richOutput,
      summary
    };

    console.log('✅ [V2 Complete] Assessment finalized:', {
      sessionId,
      questionsAsked: state.session_metadata.questions_asked,
      llmCalls: state.session_metadata.llm_calls,
      deepDives: Object.keys(state.deep_dives).length
    });

    // Opcional: deletar sessão após completar (ou manter por 24h para consulta)
    // deleteOrchestratorSession(sessionId);

    return NextResponse.json(completedAssessment);

  } catch (error) {
    console.error('❌ [V2 Complete] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to complete assessment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
