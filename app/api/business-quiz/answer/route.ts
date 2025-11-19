/**
 * Business Quiz API - Submit Answer
 *
 * POST /api/business-quiz/answer
 *
 * Handles answer submission and returns next question
 * Includes expertise detection and block transitions
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getSession,
  addAnswer,
  updateExtractedData,
  advanceToBlock,
  setDetectedExpertise,
  setDeepDiveArea,
  setRiskScanAreas,
} from '@/lib/business-quiz/session-manager';
import {
  getQuestionById,
  CONTEXT_QUESTIONS,
  EXPERTISE_QUESTIONS,
  getDeepDiveQuestions,
  getRiskScanQuestion,
} from '@/lib/business-quiz/question-bank';
import {
  suggestRiskScanAreas,
  AREA_METADATA,
} from '@/lib/business-quiz/area-relationships';
import { detectExpertiseWithLLM } from '@/lib/business-quiz/llm-expertise-detection';
import { selectRiskAreasWithLLM } from '@/lib/business-quiz/llm-risk-selection';
import type {
  BusinessQuestionMetadata,
  QuestionBlock,
  BusinessArea,
} from '@/lib/business-quiz/types';

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

interface SubmitAnswerRequest {
  sessionId: string;
  questionId: string;
  answer: string | string[];
}

interface SubmitAnswerResponse {
  success: boolean;
  nextQuestion?: {
    id: string;
    questionText: string;
    inputType: string;
    options?: string[];
    placeholder?: string;
    helpText?: string;
  } | null;
  blockTransition?: {
    from: QuestionBlock;
    to: QuestionBlock;
    message: string;
  };
  expertiseDetected?: {
    area: BusinessArea;
    confidence: number;
    reasoning: string;
  };
  progress: {
    currentBlock: QuestionBlock;
    questionIndex: number;
    totalInBlock: number;
    overallProgress: number;
  };
  completed: boolean;
  diagnosticId?: string;
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

// ============================================================================
// EXPERTISE DETECTION (using Claude Sonnet)
// ============================================================================
// Removed stub - now using detectExpertiseWithLLM() from llm-expertise-detection.ts

// ============================================================================
// BLOCK HANDLERS
// ============================================================================

async function handleContextBlock(session: any, lastQuestionId: string) {
  const contextAnswers = session.answers.filter((a: any) => a.block === 'context');

  // All 7 context questions answered?
  if (contextAnswers.length >= 7) {
    // Transition to expertise block
    advanceToBlock(session.sessionId, 'expertise');

    const firstExpertiseQ = EXPERTISE_QUESTIONS[0];

    return {
      success: true,
      nextQuestion: formatQuestion(firstExpertiseQ),
      blockTransition: {
        from: 'context' as QuestionBlock,
        to: 'expertise' as QuestionBlock,
        message: 'Agora vamos conhecer melhor sua expertise!',
      },
      progress: {
        currentBlock: 'expertise' as QuestionBlock,
        questionIndex: 1,
        totalInBlock: 4,
        overallProgress: calculateOverallProgress('expertise', 1),
      },
      completed: false,
    };
  }

  // Continue with context questions
  const nextContextQ = CONTEXT_QUESTIONS[contextAnswers.length];

  return {
    success: true,
    nextQuestion: formatQuestion(nextContextQ),
    progress: {
      currentBlock: 'context' as QuestionBlock,
      questionIndex: contextAnswers.length + 1,
      totalInBlock: 7,
      overallProgress: calculateOverallProgress('context', contextAnswers.length + 1),
    },
    completed: false,
  };
}

async function handleExpertiseBlock(session: any, lastQuestionId: string) {
  const expertiseAnswers = session.answers.filter((a: any) => a.block === 'expertise');

  // All 4 expertise questions answered?
  if (expertiseAnswers.length >= 4) {
    // Trigger expertise detection with Claude Sonnet
    console.log('[Business Quiz] Triggering LLM-based expertise detection...');

    const detectionResult = await detectExpertiseWithLLM(session.answers, session);

    // Store detected expertise
    setDetectedExpertise(session.sessionId, detectionResult.detectedArea, detectionResult.confidence);

    // Transition to deep-dive
    advanceToBlock(session.sessionId, 'deep-dive');
    setDeepDiveArea(session.sessionId, detectionResult.detectedArea);

    // Get first deep-dive question
    const deepDiveQuestions = getDeepDiveQuestions(detectionResult.detectedArea);
    const firstDeepDiveQ = deepDiveQuestions[0];

    return {
      success: true,
      nextQuestion: formatQuestion(firstDeepDiveQ),
      blockTransition: {
        from: 'expertise' as QuestionBlock,
        to: 'deep-dive' as QuestionBlock,
        message: `Detectamos sua expertise em ${AREA_METADATA[detectionResult.detectedArea].name}!
Vamos aprofundar nessa área.`,
      },
      expertiseDetected: {
        area: detectionResult.detectedArea,
        confidence: detectionResult.confidence,
        reasoning: detectionResult.reasoning,
      },
      progress: {
        currentBlock: 'deep-dive' as QuestionBlock,
        questionIndex: 1,
        totalInBlock: 5,
        overallProgress: calculateOverallProgress('deep-dive', 1),
      },
      completed: false,
    };
  }

  // Continue with expertise questions
  const nextExpertiseQ = EXPERTISE_QUESTIONS[expertiseAnswers.length];

  return {
    success: true,
    nextQuestion: formatQuestion(nextExpertiseQ),
    progress: {
      currentBlock: 'expertise' as QuestionBlock,
      questionIndex: expertiseAnswers.length + 1,
      totalInBlock: 4,
      overallProgress: calculateOverallProgress('expertise', expertiseAnswers.length + 1),
    },
    completed: false,
  };
}

async function handleDeepDiveBlock(session: any, lastQuestionId: string) {
  const deepDiveAnswers = session.answers.filter((a: any) => a.block === 'deep-dive');

  // All 5 deep-dive questions answered?
  if (deepDiveAnswers.length >= 5) {
    // Transition to risk-scan with LLM-based area selection
    const expertiseArea = session.detectedExpertise || 'marketing-growth';

    console.log('[Business Quiz] Selecting risk areas with Claude Haiku...');

    // Select 3 risk scan areas using LLM
    const riskSelection = await selectRiskAreasWithLLM(
      expertiseArea,
      deepDiveAnswers,
      session
    );

    const riskAreas = riskSelection.selectedAreas;
    setRiskScanAreas(session.sessionId, riskAreas);

    console.log(`✅ [Business Quiz] Risk areas selected: ${riskAreas.join(', ')}`);

    advanceToBlock(session.sessionId, 'risk-scan');

    // Get first risk scan question
    const firstRiskArea = riskAreas[0];
    const firstRiskQ = getRiskScanQuestion(firstRiskArea);

    if (!firstRiskQ) {
      return {
        success: false,
        error: 'Failed to load risk scan question',
        progress: {
          currentBlock: session.currentBlock,
          questionIndex: 0,
          totalInBlock: 0,
          overallProgress: calculateOverallProgress(session.currentBlock, 0),
        },
        completed: false,
      };
    }

    return {
      success: true,
      nextQuestion: formatQuestion(firstRiskQ),
      blockTransition: {
        from: 'deep-dive' as QuestionBlock,
        to: 'risk-scan' as QuestionBlock,
        message: 'Por último, vamos fazer um scan rápido de riscos em outras áreas.',
      },
      progress: {
        currentBlock: 'risk-scan' as QuestionBlock,
        questionIndex: 1,
        totalInBlock: 3,
        overallProgress: calculateOverallProgress('risk-scan', 1),
      },
      completed: false,
    };
  }

  // Continue with deep-dive questions
  const deepDiveQuestions = getDeepDiveQuestions(session.deepDiveArea!);
  const nextDeepDiveQ = deepDiveQuestions[deepDiveAnswers.length];

  return {
    success: true,
    nextQuestion: formatQuestion(nextDeepDiveQ),
    progress: {
      currentBlock: 'deep-dive' as QuestionBlock,
      questionIndex: deepDiveAnswers.length + 1,
      totalInBlock: 5,
      overallProgress: calculateOverallProgress('deep-dive', deepDiveAnswers.length + 1),
    },
    completed: false,
  };
}

async function handleRiskScanBlock(session: any, lastQuestionId: string) {
  const riskScanAnswers = session.answers.filter((a: any) => a.block === 'risk-scan');

  // All 3 risk scan questions answered?
  if (riskScanAnswers.length >= 3) {
    // Quiz complete!
    console.log('🎉 [Business Quiz] Quiz complete!');

    return {
      success: true,
      nextQuestion: null, // No more questions
      progress: {
        currentBlock: 'risk-scan' as QuestionBlock,
        questionIndex: 3,
        totalInBlock: 3,
        overallProgress: 100,
      },
      completed: true,
    };
  }

  // Continue with risk scan questions
  const riskAreas = session.riskScanAreas || [];
  const nextRiskArea = riskAreas[riskScanAnswers.length];
  const nextRiskQ = getRiskScanQuestion(nextRiskArea);

  if (!nextRiskQ) {
    return {
      success: false,
      error: 'Failed to load risk scan question',
      progress: {
        currentBlock: session.currentBlock,
        questionIndex: riskScanAnswers.length,
        totalInBlock: 3,
        overallProgress: calculateOverallProgress('risk-scan', riskScanAnswers.length),
      },
      completed: false,
    };
  }

  return {
    success: true,
    nextQuestion: formatQuestion(nextRiskQ),
    progress: {
      currentBlock: 'risk-scan' as QuestionBlock,
      questionIndex: riskScanAnswers.length + 1,
      totalInBlock: 3,
      overallProgress: calculateOverallProgress('risk-scan', riskScanAnswers.length + 1),
    },
    completed: false,
  };
}

// ============================================================================
// API HANDLER
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    const body: SubmitAnswerRequest = await req.json();

    const { sessionId, questionId, answer } = body;

    // Validate required fields
    if (!sessionId || !questionId || !answer) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, questionId, answer' },
        { status: 400 }
      );
    }

    // Normalize answer to string
    const answerStr = Array.isArray(answer) ? answer.join(', ') : String(answer);

    // Get session
    const session = getSession(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or expired' },
        { status: 404 }
      );
    }

    // Get question metadata
    const question = getQuestionById(questionId);

    if (!question) {
      return NextResponse.json(
        { error: `Question not found: ${questionId}` },
        { status: 400 }
      );
    }

    console.log(`📝 [Business Quiz] Answer received for ${questionId} in session ${sessionId}`);

    // Record answer
    addAnswer(sessionId, {
      questionId,
      questionText: question.questionText,
      answer: answerStr,
      timestamp: new Date(),
      block: question.block,
      area: question.area,
    });

    // Extract structured data
    if (question.dataExtractor) {
      try {
        const extracted = question.dataExtractor(answerStr);
        updateExtractedData(sessionId, extracted);
        console.log(`💾 [Business Quiz] Extracted data:`, Object.keys(extracted));
      } catch (error) {
        console.warn('[Business Quiz] Failed to extract data:', error);
        // Continue even if extraction fails
      }
    }

    // Determine next question based on current block
    let response: any;

    switch (session.currentBlock) {
      case 'context':
        response = await handleContextBlock(session, questionId);
        break;

      case 'expertise':
        response = await handleExpertiseBlock(session, questionId);
        break;

      case 'deep-dive':
        response = await handleDeepDiveBlock(session, questionId);
        break;

      case 'risk-scan':
        response = await handleRiskScanBlock(session, questionId);
        break;

      default:
        return NextResponse.json(
          { error: `Invalid block: ${session.currentBlock}` },
          { status: 500 }
        );
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Business Quiz] Error handling answer:', error);

    return NextResponse.json(
      {
        error: 'Failed to process answer',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
