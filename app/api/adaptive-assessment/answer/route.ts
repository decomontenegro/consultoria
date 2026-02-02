/**
 * POST /api/adaptive-assessment/answer
 *
 * Submit an answer and extract data using question bank data extractors
 * Sprint 2: Uses structured data extraction from question bank
 *
 * Request:
 * {
 *   sessionId: string,
 *   questionId: string,
 *   questionText: string,
 *   answer: string | string[] | number
 * }
 *
 * Response:
 * {
 *   success: true,
 *   completeness: number,
 *   questionsAsked: number,
 *   extractedData?: any
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession, updateSession, addAnswer } from '@/lib/sessions/unified-session-manager';
import { getQuestionForRouting } from '@/lib/ai/adaptive-question-router-v2';
import { calculateDetailedCompletion } from '@/lib/ai/completeness-scorer';
import { detectUncertainty } from '@/lib/utils/uncertainty-detector';
import type { AssessmentData, ConversationContext } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, questionId, questionText, answer } = body;

    // Validate inputs
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId' },
        { status: 400 }
      );
    }

    if (!questionId) {
      return NextResponse.json(
        { error: 'Missing questionId' },
        { status: 400 }
      );
    }

    if (answer === undefined || answer === null || answer === '') {
      return NextResponse.json(
        { error: 'Missing answer' },
        { status: 400 }
      );
    }

    console.log('📝 [Answer - Router v2] Submitting answer for session:', sessionId);
    console.log('   Question ID:', questionId);
    console.log('   Answer:', typeof answer === 'string' && answer.length > 100 ? answer.substring(0, 100) + '...' : answer);

    // ✅ Detect uncertainty signals in text answers
    if (typeof answer === 'string') {
      const uncertaintySignals = detectUncertainty(answer);
      if (uncertaintySignals.hasUncertainty) {
        console.warn('⚠️  [Answer] Uncertainty detected:', {
          category: uncertaintySignals.category,
          confidence: uncertaintySignals.confidence,
          phrases: uncertaintySignals.detectedPhrases,
          questionId
        });

        // If user explicitly said "não sei" with high confidence
        if (uncertaintySignals.confidence >= 0.8) {
          console.warn('🚨 [Answer] User explicitly lacks knowledge - possible persona mismatch!');
        }
      }
    }

    // Get session context
    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or expired' },
        { status: 404 }
      );
    }

    // Determine current phase based on current block
    const blockToPhase: Record<string, 'discovery' | 'expertise' | 'deep-dive' | 'completion'> = {
      discovery: 'discovery',
      expertise: 'expertise',
      'deep-dive': 'deep-dive',
      'risk-scan': 'completion'
    };
    const currentPhase = blockToPhase[session.currentBlock || 'discovery'];

    // Get question from bank to use its data extractor
    const questionFromBank = getQuestionForRouting(questionId);

    let extractedData: Partial<AssessmentData> = {};
    let sourceType: 'question-bank' | 'follow-up' | 'unknown' = 'unknown';

    if (questionFromBank) {
      // Use structured data extractor from question bank
      console.log('🔧 [Answer] Using question bank data extractor');
      sourceType = 'question-bank';

      try {
        extractedData = questionFromBank.dataExtractor(answer, session);
        console.log('✅ [Answer] Data extracted from question bank:', {
          questionId: questionFromBank.id,
          fieldsExtracted: Object.keys(extractedData).length
        });
      } catch (error) {
        console.error('❌ [Answer] Data extractor failed:', error);
        extractedData = {};
      }
    } else if (questionId.startsWith('followup-')) {
      // Follow-up question - extract based on targetGap
      console.log('💡 [Answer] Processing follow-up question');
      sourceType = 'follow-up';
      // For now, we'll just store the answer without extraction
      // Sprint 3 will add LLM extraction for follow-ups
      extractedData = {};
    } else {
      console.warn('⚠️ [Answer] Question not found in bank, no extraction performed');
      extractedData = {};
    }

    // Deep merge extracted data with existing assessment data
    const updatedAssessmentData: Partial<AssessmentData> = {
      ...session.assessmentData,
      companyInfo: {
        ...session.assessmentData.companyInfo,
        ...extractedData.companyInfo
      },
      currentState: {
        ...session.assessmentData.currentState,
        ...extractedData.currentState,
        painPoints: [
          ...(session.assessmentData.currentState?.painPoints || []),
          ...(extractedData.currentState?.painPoints || [])
        ].filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates
      },
      team: {
        ...session.assessmentData.team,
        ...extractedData.team
      },
      processes: {
        ...session.assessmentData.processes,
        ...extractedData.processes
      },
      goals: {
        ...session.assessmentData.goals,
        ...extractedData.goals,
        primaryGoals: [
          ...(session.assessmentData.goals?.primaryGoals || []),
          ...(extractedData.goals?.primaryGoals || [])
        ].filter((v, i, a) => a.indexOf(v) === i)
      },
      aiReadiness: {
        ...session.assessmentData.aiReadiness,
        ...extractedData.aiReadiness
      },
      contactInfo: {
        ...session.assessmentData.contactInfo,
        ...extractedData.contactInfo
      }
    };

    // Add answer to session using unified session manager
    const questionTextFinal = questionText || questionFromBank?.text || 'Question';

    const answerAdded = addAnswer(sessionId, {
      questionId,
      questionText: questionTextFinal,
      answer,
      answeredAt: new Date(),
      phase: currentPhase,
      category: questionFromBank?.tags[0] || 'general',
      source: sourceType === 'question-bank' ? 'pool' : 'llm-generated',
      dataExtracted: extractedData
    });

    if (!answerAdded) {
      console.error('❌ [Answer] Failed to add answer to session');
      return NextResponse.json(
        { error: 'Failed to add answer' },
        { status: 500 }
      );
    }

    // Calculate completeness score using conversation context
    const conversationContext: ConversationContext = {
      persona: session.persona,
      conversationHistory: [], // Not needed for scoring
      assessmentDataPartial: updatedAssessmentData,
      assessmentData: updatedAssessmentData,
      topicsCovered: session.topicsCovered || [],
      metricsCollected: session.metricsCollected || [],
      questionsAsked: session.questionsAsked + 1
    };

    const completionMetrics = calculateDetailedCompletion(conversationContext);

    // Update session with merged data and new completion metrics
    const updateSuccess = updateSession(sessionId, {
      assessmentData: updatedAssessmentData,
      completion: completionMetrics,
      canFinish: completionMetrics.completenessScore >= 80,
      questionsRemaining: Math.max(0, 15 - (session.questionsAsked + 1))
    });

    if (!updateSuccess) {
      console.error('❌ [Answer] Failed to update session');
      return NextResponse.json(
        { error: 'Failed to update session' },
        { status: 500 }
      );
    }

    // Get updated session
    const updatedSession = getSession(sessionId);
    const questionsAskedCount = updatedSession ? updatedSession.questionsAsked : session.questionsAsked + 1;

    console.log('✅ [Answer] Session updated:', {
      questionsAsked: questionsAskedCount,
      completeness: completionMetrics.completenessScore,
      essentialFieldsCollected: completionMetrics.essentialFieldsCollected,
      totalFieldsCollected: completionMetrics.totalFieldsCollected
    });

    return NextResponse.json({
      success: true,
      completeness: completionMetrics.completenessScore,
      questionsAsked: questionsAskedCount,
      extractedData,
      sourceType
    });

  } catch (error) {
    console.error('❌ [Answer] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process answer', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
