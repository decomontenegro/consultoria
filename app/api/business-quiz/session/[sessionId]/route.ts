/**
 * Business Quiz API - Get/Resume Session
 *
 * GET /api/business-quiz/session/:sessionId
 *
 * Retrieves session state to allow resuming interrupted quiz
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getSession,
  getSessionStats,
  getSessionSummary,
} from '@/lib/business-quiz/session-manager';
import {
  CONTEXT_QUESTIONS,
  EXPERTISE_QUESTIONS,
  getDeepDiveQuestions,
  getRiskScanQuestion,
} from '@/lib/business-quiz/question-bank';
import type {
  BusinessQuizContext,
  BusinessQuestionMetadata,
  QuestionBlock,
} from '@/lib/business-quiz/types';

// ============================================================================
// RESPONSE TYPES
// ============================================================================

interface GetSessionResponse {
  success: boolean;
  session: BusinessQuizContext;
  currentQuestion: {
    id: string;
    questionText: string;
    inputType: string;
    options?: string[];
    placeholder?: string;
    helpText?: string;
  } | null;
  progress: {
    currentBlock: QuestionBlock;
    questionIndex: number;
    totalInBlock: number;
    overallProgress: number;
    timeElapsed: number; // seconds
  };
  summary: {
    detectedExpertise?: string;
    expertiseConfidence?: number;
    totalAnswers: number;
    dataFieldsFilled: number;
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatQuestion(question: BusinessQuestionMetadata | undefined) {
  if (!question) {
    return null;
  }

  return {
    id: question.id,
    questionText: question.questionText,
    inputType: question.inputType,
    options: question.options,
    placeholder: question.placeholder,
    helpText: question.helpText,
  };
}

function getCurrentQuestion(session: BusinessQuizContext): BusinessQuestionMetadata | null {
  const currentBlock = session.currentBlock;

  switch (currentBlock) {
    case 'context': {
      const contextAnswers = session.answers.filter((a) => a.block === 'context');
      return CONTEXT_QUESTIONS[contextAnswers.length] || null;
    }

    case 'expertise': {
      const expertiseAnswers = session.answers.filter((a) => a.block === 'expertise');
      return EXPERTISE_QUESTIONS[expertiseAnswers.length] || null;
    }

    case 'deep-dive': {
      if (!session.deepDiveArea) {
        return null;
      }
      const deepDiveAnswers = session.answers.filter((a) => a.block === 'deep-dive');
      const deepDiveQuestions = getDeepDiveQuestions(session.deepDiveArea);
      return deepDiveQuestions[deepDiveAnswers.length] || null;
    }

    case 'risk-scan': {
      if (!session.riskScanAreas) {
        return null;
      }
      const riskScanAnswers = session.answers.filter((a) => a.block === 'risk-scan');
      const riskArea = session.riskScanAreas[riskScanAnswers.length];
      return getRiskScanQuestion(riskArea) || null;
    }

    default:
      return null;
  }
}

function calculateOverallProgress(currentBlock: QuestionBlock, questionIndex: number): number {
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

function getBlockSize(block: QuestionBlock): number {
  switch (block) {
    case 'context':
      return 7;
    case 'expertise':
      return 4;
    case 'deep-dive':
      return 5;
    case 'risk-scan':
      return 3;
    default:
      return 0;
  }
}

// ============================================================================
// API HANDLER
// ============================================================================

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    console.log(`🔍 [Business Quiz] Retrieving session ${sessionId}...`);

    // Get session
    const session = getSession(sessionId);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: 'Session not found or expired',
        },
        { status: 404 }
      );
    }

    console.log(`✅ [Business Quiz] Session found: ${session.currentBlock} block`);

    // Get current question
    const currentQuestion = getCurrentQuestion(session);

    // Get stats
    const stats = getSessionStats(sessionId);
    const summary = getSessionSummary(sessionId);

    if (!stats || !summary) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to retrieve session stats',
        },
        { status: 500 }
      );
    }

    // Calculate current question index within block
    const answersInBlock = session.answers.filter(
      (a) => a.block === session.currentBlock
    ).length;

    // Build response
    const response: GetSessionResponse = {
      success: true,
      session,
      currentQuestion: formatQuestion(currentQuestion),
      progress: {
        currentBlock: session.currentBlock,
        questionIndex: answersInBlock + 1,
        totalInBlock: getBlockSize(session.currentBlock),
        overallProgress: calculateOverallProgress(
          session.currentBlock,
          answersInBlock + 1
        ),
        timeElapsed: stats.timeElapsed,
      },
      summary: {
        detectedExpertise: summary.detectedExpertise,
        expertiseConfidence: summary.expertiseConfidence,
        totalAnswers: summary.totalAnswers,
        dataFieldsFilled: summary.dataFieldsFilled,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Business Quiz] Error retrieving session:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
