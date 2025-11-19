/**
 * Business Quiz API - Start Quiz
 *
 * POST /api/business-quiz/start
 *
 * Initializes a new quiz session and returns the first question
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/business-quiz/session-manager';
import { CONTEXT_QUESTIONS } from '@/lib/business-quiz/question-bank';
import type {
  BusinessQuestionMetadata,
  BusinessAssessmentData,
} from '@/lib/business-quiz/types';

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

interface StartQuizRequest {
  initialContext?: Partial<BusinessAssessmentData>;
}

interface StartQuizResponse {
  sessionId: string;
  firstQuestion: {
    id: string;
    questionText: string;
    inputType: 'text' | 'textarea' | 'single-choice' | 'multi-choice' | 'scale';
    options?: string[];
    placeholder?: string;
    helpText?: string;
  };
  progress: {
    currentBlock: 'context';
    questionIndex: number;
    totalInBlock: number;
    overallProgress: number; // 0-100
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatQuestion(question: BusinessQuestionMetadata) {
  return {
    id: question.id,
    questionText: question.questionText,
    inputType: question.inputType,
    options: question.options,
    placeholder: question.placeholder,
    helpText: question.helpText,
  };
}

function calculateOverallProgress(currentBlock: string, questionIndex: number): number {
  // Total expected questions: 7 (context) + 4 (expertise) + 5 (deep-dive) + 3 (risk-scan) = 19
  const TOTAL_QUESTIONS = 19;

  let questionsCompleted = 0;

  switch (currentBlock) {
    case 'context':
      questionsCompleted = questionIndex;
      break;
    case 'expertise':
      questionsCompleted = 7 + questionIndex;
      break;
    case 'deep-dive':
      questionsCompleted = 11 + questionIndex;
      break;
    case 'risk-scan':
      questionsCompleted = 16 + questionIndex;
      break;
  }

  return Math.round((questionsCompleted / TOTAL_QUESTIONS) * 100);
}

// ============================================================================
// API HANDLER
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    // Parse request body (optional initial context)
    let body: StartQuizRequest = {};
    try {
      body = await req.json();
    } catch {
      // Body is optional, continue with empty object
    }

    console.log('🎯 [Business Quiz] Starting new quiz session...');

    // Create new session
    const session = createSession(body.initialContext);

    console.log(`✅ [Business Quiz] Session created: ${session.sessionId}`);

    // Get first context question
    const firstQuestion = CONTEXT_QUESTIONS[0];

    if (!firstQuestion) {
      return NextResponse.json(
        { error: 'Failed to load first question' },
        { status: 500 }
      );
    }

    // Build response
    const response: StartQuizResponse = {
      sessionId: session.sessionId,
      firstQuestion: formatQuestion(firstQuestion),
      progress: {
        currentBlock: 'context',
        questionIndex: 1,
        totalInBlock: 7,
        overallProgress: calculateOverallProgress('context', 1),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Business Quiz] Error starting quiz:', error);

    return NextResponse.json(
      {
        error: 'Failed to start quiz',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// CORS & OPTIONS
// ============================================================================

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
