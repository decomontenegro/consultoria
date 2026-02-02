/**
 * POST /api/adaptive-assessment-v2/start
 *
 * Inicia nova sessão do Assessment Híbrido V2
 *
 * Body:
 * - userId? (optional)
 * - company_name? (optional)
 * - sector? (optional)
 *
 * Returns:
 * - sessionId
 * - first_question (da intro)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createOrchestratorSession,
  incrementLLMCalls
} from '@/lib/sessions/orchestrator-session-manager';
import { createHybridOrchestrator } from '@/lib/ai/orchestrator';
import { AI_READINESS_QUESTIONS_V2 } from '@/lib/questions/v2/question-bank-v2';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, company_name, sector } = body;

    // Criar sessão
    const state = createOrchestratorSession({
      userId,
      company_name,
      sector
    });

    const sessionId = state.session_metadata.session_id;

    // Criar orquestrador
    const orchestrator = createHybridOrchestrator();

    // Primeira pergunta: sempre intro-001-consent
    const introQuestion = AI_READINESS_QUESTIONS_V2.find(q => q.id === 'intro-001-consent');

    if (!introQuestion) {
      return NextResponse.json(
        { error: 'Intro question not found in question bank' },
        { status: 500 }
      );
    }

    // Selecionar primeira variação (v1 por padrão)
    const firstVariation = introQuestion.variations[0];

    // Registrar variação usada
    orchestrator.recordVariationUsage(state, introQuestion.id, firstVariation.id);

    // Montar resposta
    const firstQuestion = {
      id: introQuestion.id,
      text: firstVariation.text,
      variation_id: firstVariation.id,
      variation_tone: firstVariation.tone,
      input_type: introQuestion.inputType,
      options: introQuestion.options,
      placeholder: firstVariation.placeholder || introQuestion.variations[0].placeholder,
      area: introQuestion.area,
      block: introQuestion.block,
      weight: introQuestion.weight || 1
    };

    console.log('✅ [V2 Start] Assessment started:', {
      sessionId,
      userId,
      company: company_name,
      firstQuestionId: firstQuestion.id
    });

    return NextResponse.json({
      sessionId,
      first_question: firstQuestion,
      session_metadata: {
        questions_asked: 1,
        variations_used: 1,
        current_block: 'intro'
      }
    });

  } catch (error) {
    console.error('❌ [V2 Start] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to start assessment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
