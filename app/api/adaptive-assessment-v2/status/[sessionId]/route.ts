/**
 * GET /api/adaptive-assessment-v2/status/[sessionId]
 *
 * Retorna status atual da sessão
 *
 * Returns:
 * - session_metadata
 * - company_snapshot
 * - expertise
 * - problems_and_opportunities
 * - priority_areas
 * - deep_dives_summary
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getOrchestratorSession,
  getOrchestratorSessionSummary
} from '@/lib/sessions/orchestrator-session-manager';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

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

    // Calcular deep dives summary
    const deepDivesSummary = Object.entries(state.deep_dives).map(([area, dive]) => ({
      area,
      questions_answered: Object.keys(dive.answers || {}).length,
      tags: dive.tags || []
    }));

    return NextResponse.json({
      sessionId,
      session_metadata: state.session_metadata,
      company_snapshot: state.company_snapshot,
      expertise: state.expertise,
      problems_and_opportunities: state.problems_and_opportunities,
      deep_dives_summary: deepDivesSummary,
      automation_opportunities: state.automation_opportunities,
      closing: state.closing,
      summary
    });

  } catch (error) {
    console.error('❌ [V2 Status] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve session status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
