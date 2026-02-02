/**
 * POST /api/adaptive-assessment/next-question
 *
 * Get the next question for AI-readiness assessment
 * Sprint 2: Uses question bank + router v2 with 4-block architecture
 *
 * Request:
 * {
 *   sessionId: string
 * }
 *
 * Response:
 * {
 *   nextQuestion: {
 *     id: string,
 *     text: string,
 *     inputType: 'text' | 'single-choice' | 'multi-choice',
 *     options?: Array<{ value: string; label: string }>,
 *     placeholder?: string
 *   } | null,
 *   routing: {
 *     questionId: string,
 *     reasoning: string,
 *     confidence: number,
 *     currentBlock: string,
 *     blockProgress: number
 *   } | null,
 *   shouldFinish: boolean,
 *   finishReason?: string,
 *   completion: CompletionMetrics
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession, advanceToBlock } from '@/lib/sessions/unified-session-manager';
import {
  routeToNextQuestion,
  getQuestionForRouting,
  canFinishAssessment
} from '@/lib/ai/adaptive-question-router-v2';
import type { CompletionMetrics } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    // Validate session ID
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId' },
        { status: 400 }
      );
    }

    console.log('🔍 [Next Question - Router v2] Getting next question for session:', sessionId);

    // Get session context
    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or expired' },
        { status: 404 }
      );
    }

    console.log('📊 [Next Question] Current context:', {
      questionsAsked: session.questionsAsked,
      currentBlock: session.currentBlock,
      persona: session.persona,
      completenessScore: session.completion.completenessScore
    });

    // Build completion metrics for frontend
    const completionMetrics: CompletionMetrics = {
      completenessScore: session.completion.completenessScore,
      essentialFieldsCollected: session.completion.essentialFieldsCollected,
      totalFieldsCollected: session.completion.totalFieldsCollected,
      topicsCovered: session.topicsCovered || [],
      metricsCollected: session.metricsCollected || [],
      gapsIdentified: session.completion.missingFields || []
    };

    // Check if can finish using router v2 logic
    const shouldFinish = canFinishAssessment(session);

    if (shouldFinish) {
      console.log('✅ [Next Question] Assessment complete:', {
        reason: 'block_and_completeness_reached',
        completenessScore: session.completion.completenessScore,
        questionsAsked: session.questionsAsked,
        currentBlock: session.currentBlock
      });

      return NextResponse.json({
        nextQuestion: null,
        routing: null,
        shouldFinish: true,
        finishReason: 'block_and_completeness_reached',
        completion: completionMetrics
      });
    }

    // Use router v2 to get routing decision
    const routingDecision = await routeToNextQuestion(session);

    // If router says no more questions
    if (!routingDecision.shouldAsk || !routingDecision.suggestedQuestionId) {
      console.log('⚠️ [Next Question] Router decided not to ask more questions');

      return NextResponse.json({
        nextQuestion: null,
        routing: {
          questionId: 'none',
          reasoning: routingDecision.reasoning,
          confidence: routingDecision.confidence,
          currentBlock: routingDecision.currentBlock,
          blockProgress: routingDecision.blockProgress
        },
        shouldFinish: true,
        finishReason: 'router_decision',
        completion: completionMetrics
      });
    }

    // Handle block transition if needed
    if (routingDecision.shouldTransition && routingDecision.suggestedNextBlock) {
      const transitioned = advanceToBlock(
        sessionId,
        routingDecision.suggestedNextBlock,
        'Completeness and minimum questions reached for current block'
      );

      if (transitioned) {
        console.log('🔄 [Next Question] Block transition executed:', {
          from: routingDecision.currentBlock,
          to: routingDecision.suggestedNextBlock
        });
      }
    }

    // Get the question object
    let nextQuestion;

    // Check if it's a dynamic follow-up question
    if (routingDecision.dynamicQuestion) {
      console.log('💡 [Next Question] Using dynamic follow-up:', {
        triggeredBy: routingDecision.dynamicQuestion.triggeredBy,
        reason: routingDecision.dynamicQuestion.reason
      });

      nextQuestion = {
        id: routingDecision.dynamicQuestion.id,
        text: routingDecision.dynamicQuestion.text,
        inputType: routingDecision.dynamicQuestion.inputType,
        options: routingDecision.dynamicQuestion.options,
        placeholder: routingDecision.dynamicQuestion.placeholder || 'Sua resposta...'
      };
    } else {
      // Get question from question bank
      const questionFromBank = getQuestionForRouting(routingDecision.suggestedQuestionId);

      if (!questionFromBank) {
        console.error('❌ [Next Question] Question not found in bank:', routingDecision.suggestedQuestionId);
        return NextResponse.json(
          { error: 'Question not found in bank' },
          { status: 500 }
        );
      }

      console.log('📝 [Next Question] Using question from bank:', {
        questionId: questionFromBank.id,
        block: questionFromBank.block,
        phase: questionFromBank.phase,
        persona: session.persona,
        questionPersonas: questionFromBank.personas || 'all'
      });

      nextQuestion = {
        id: questionFromBank.id,
        text: questionFromBank.text,
        inputType: questionFromBank.inputType,
        options: questionFromBank.options,
        placeholder: questionFromBank.placeholder || 'Sua resposta...'
      };
    }

    const routing = {
      questionId: nextQuestion.id,
      reasoning: routingDecision.reasoning,
      confidence: routingDecision.confidence,
      currentBlock: routingDecision.currentBlock,
      blockProgress: routingDecision.blockProgress
    };

    console.log('✅ [Next Question] Returning question:', {
      questionId: nextQuestion.id,
      questionPreview: nextQuestion.text.substring(0, 80) + '...',
      inputType: nextQuestion.inputType,
      currentBlock: routingDecision.currentBlock,
      blockProgress: `${(routingDecision.blockProgress * 100).toFixed(0)}%`
    });

    return NextResponse.json({
      nextQuestion,
      routing,
      shouldFinish: false,
      completion: completionMetrics
    });

  } catch (error) {
    console.error('❌ [Next Question] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get next question', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
