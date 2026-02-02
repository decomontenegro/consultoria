/**
 * POST /api/adaptive-assessment-v2/answer
 *
 * Recebe resposta do usuário e decide próxima pergunta via orquestrador LLM
 *
 * Body:
 * - sessionId
 * - questionId
 * - variationId
 * - answer
 *
 * Returns:
 * - action: 'ask_next' | 'end'
 * - next_question? (se action = ask_next)
 * - reasoning (do orquestrador)
 * - session_status
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getOrchestratorSession,
  updateOrchestratorSession,
  recordAnswer,
  setLastInteraction,
  getLastInteraction,
  incrementLLMCalls,
  calculatePriorityAreas,
  updateDeepDive
} from '@/lib/sessions/orchestrator-session-manager';
import { createHybridOrchestrator } from '@/lib/ai/orchestrator';
import { AI_READINESS_QUESTIONS_V2 } from '@/lib/questions/v2/question-bank-v2';
import { LastInteraction } from '@/lib/types/assessment-v2/orchestrator-types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, questionId, variationId, answer } = body;

    // Validação
    if (!sessionId || !questionId || !variationId || answer === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, questionId, variationId, answer' },
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

    // Buscar pergunta no question bank
    const question = AI_READINESS_QUESTIONS_V2.find(q => q.id === questionId);

    if (!question) {
      return NextResponse.json(
        { error: `Question ${questionId} not found in question bank` },
        { status: 404 }
      );
    }

    // Buscar variação usada
    const variation = question.variations.find(v => v.id === variationId);

    if (!variation) {
      return NextResponse.json(
        { error: `Variation ${variationId} not found for question ${questionId}` },
        { status: 404 }
      );
    }

    // Extrair dados estruturados da resposta
    let dataExtracted: any = {};
    if (question.dataExtractor) {
      dataExtracted = question.dataExtractor(answer);
    }

    // Registrar resposta
    recordAnswer(sessionId, questionId, variationId, answer, dataExtracted);

    // Criar LastInteraction para o orquestrador
    const lastInteraction: LastInteraction = {
      question_id: questionId,
      question_text: variation.text,
      variation_id: variationId,
      answer_text: answer,
      answer_type: question.inputType,
      timestamp: new Date().toISOString()
    };

    setLastInteraction(sessionId, lastInteraction);

    // Atualizar deep dive se pergunta pertence a uma área
    if (question.area && question.block === 'deep_dive') {
      updateDeepDive(sessionId, question.area, questionId, answer);
    }

    // Calcular priority areas se estamos saindo do bloco de expertise/problems
    if (
      questionId.startsWith('exp-') ||
      questionId.startsWith('prob-')
    ) {
      const updatedState = getOrchestratorSession(sessionId);
      if (updatedState) {
        calculatePriorityAreas(sessionId);
      }
    }

    // Atualizar current_block se necessário
    const updatedState = getOrchestratorSession(sessionId);
    if (updatedState && question.block !== updatedState.session_metadata.current_block) {
      updateOrchestratorSession(sessionId, {
        session_metadata: {
          ...updatedState.session_metadata,
          current_block: question.block
        }
      });
    }

    // Criar orquestrador
    const orchestrator = createHybridOrchestrator();

    // Verificar se deve encerrar
    const finalState = getOrchestratorSession(sessionId);
    if (!finalState) {
      return NextResponse.json(
        { error: 'Session lost during processing' },
        { status: 500 }
      );
    }

    if (orchestrator.shouldEnd(finalState)) {
      console.log('✅ [V2 Answer] Assessment completed:', {
        sessionId,
        questionsAsked: finalState.session_metadata.questions_asked,
        llmCalls: finalState.session_metadata.llm_calls
      });

      return NextResponse.json({
        action: 'end',
        reasoning: {
          summary: 'Assessment completo - informações suficientes coletadas',
          questions_asked: finalState.session_metadata.questions_asked,
          completion_percentage: 100
        },
        session_status: {
          questions_asked: finalState.session_metadata.questions_asked,
          questions_answered: finalState.session_metadata.questions_answered,
          llm_calls: finalState.session_metadata.llm_calls,
          priority_areas: finalState.session_metadata.priority_areas
        }
      });
    }

    // Decidir próxima pergunta via orquestrador LLM
    incrementLLMCalls(sessionId);

    const orchestratorResponse = await orchestrator.decideNextQuestion(
      finalState,
      lastInteraction
    );

    // Atualizar session com state_updates do orquestrador
    if (orchestratorResponse.state_updates) {
      updateOrchestratorSession(sessionId, orchestratorResponse.state_updates as any);
    }

    console.log('📋 [V2 Answer] Next question decided:', {
      sessionId,
      action: orchestratorResponse.action,
      nextQuestionId: orchestratorResponse.next_question?.id,
      reasoning: orchestratorResponse.reasoning.summary
    });

    // Retornar resposta
    if (orchestratorResponse.action === 'end') {
      return NextResponse.json({
        action: 'end',
        reasoning: orchestratorResponse.reasoning,
        session_status: {
          questions_asked: finalState.session_metadata.questions_asked,
          questions_answered: finalState.session_metadata.questions_answered,
          llm_calls: finalState.session_metadata.llm_calls,
          priority_areas: finalState.session_metadata.priority_areas
        }
      });
    }

    // action = ask_next
    return NextResponse.json({
      action: 'ask_next',
      next_question: orchestratorResponse.next_question,
      reasoning: orchestratorResponse.reasoning,
      session_status: {
        questions_asked: finalState.session_metadata.questions_asked,
        questions_answered: finalState.session_metadata.questions_answered,
        llm_calls: finalState.session_metadata.llm_calls,
        current_block: finalState.session_metadata.current_block,
        priority_areas: finalState.session_metadata.priority_areas
      }
    });

  } catch (error) {
    console.error('❌ [V2 Answer] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process answer',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
