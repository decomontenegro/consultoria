/**
 * Adaptive Question Router V2
 *
 * Combines:
 * - Business-quiz's 4-block architecture (discovery → expertise → deep-dive → risk-scan)
 * - Assessment's semantic tracking and completion metrics
 * - Question bank with structured questions and follow-up triggers
 *
 * This router replaces the conversational interviewer for the ai-readiness mode.
 */

import {
  EnhancedQuestion,
  getAllQuestions,
  getQuestionsByBlock,
  getQuestionById,
  getDeepDiveQuestions
} from '@/lib/questions/ai-readiness-question-bank';
import {
  EnhancedRoutingDecision,
  QuestionBlock,
  FollowUpQuestion,
  DeepDiveAreaDetection,
  AssessmentData
} from '@/lib/types';
import { AssessmentSessionContext } from '@/lib/sessions/types';

// ============================================================================
// CONSTANTS
// ============================================================================

const BLOCK_PROGRESSION: QuestionBlock[] = ['discovery', 'expertise', 'deep-dive', 'risk-scan'];

// Minimum questions per block before allowing transition
const MIN_QUESTIONS_PER_BLOCK: Record<QuestionBlock, number> = {
  discovery: 3, // At least 3 discovery questions
  expertise: 2, // At least 2 expertise questions
  'deep-dive': 2, // At least 2 deep-dive questions
  'risk-scan': 1 // At least 1 risk-scan question
};

// Target completeness score to consider block "done"
const BLOCK_COMPLETENESS_TARGET: Record<QuestionBlock, number> = {
  discovery: 40, // 40% completeness before moving to expertise
  expertise: 60, // 60% completeness before deep-dive
  'deep-dive': 80, // 80% completeness before risk-scan
  'risk-scan': 90 // 90% completeness to finish
};

// ============================================================================
// MAIN ROUTING FUNCTION
// ============================================================================

/**
 * Routes to the next question based on session context and question bank
 */
export async function routeToNextQuestion(
  context: AssessmentSessionContext
): Promise<EnhancedRoutingDecision> {
  const currentBlock = context.currentBlock || 'discovery';
  const answeredIds = context.questionsAnsweredIds || [];
  const completion = context.completion;

  console.log('🧭 [Router v2] Routing decision:', {
    currentBlock,
    questionsAsked: context.questionsAsked,
    answeredIds: answeredIds.length,
    completenessScore: completion.completenessScore
  });

  // Step 1: Check if we should transition to next block
  const shouldTransition = shouldTransitionToNextBlock(context, currentBlock);

  if (shouldTransition) {
    const nextBlock = getNextBlock(currentBlock);
    if (nextBlock) {
      console.log('🔄 [Router v2] Block transition recommended:', {
        from: currentBlock,
        to: nextBlock,
        reason: `Completeness at ${completion.completenessScore}%, minimum questions met`
      });

      return {
        shouldAsk: true,
        reasoning: `Transitioning from ${currentBlock} to ${nextBlock}`,
        confidence: 0.9,
        suggestedQuestionId: await selectQuestionFromBlock(nextBlock, answeredIds, context),
        dataGaps: completion.missingFields || [],
        completenessScore: completion.completenessScore,
        currentBlock,
        suggestedNextBlock: nextBlock,
        blockProgress: calculateBlockProgress(context, currentBlock),
        shouldTransition: true
      };
    }
  }

  // Step 2: Check for follow-up opportunities from last answer
  const followUpQuestion = await evaluateFollowUpTriggers(context);
  if (followUpQuestion) {
    console.log('💡 [Router v2] Follow-up question generated:', {
      triggeredBy: followUpQuestion.triggeredBy,
      reason: followUpQuestion.reason
    });

    return {
      shouldAsk: true,
      reasoning: `Follow-up question: ${followUpQuestion.reason}`,
      confidence: 0.85,
      suggestedQuestionId: followUpQuestion.id,
      dynamicQuestion: followUpQuestion,
      dataGaps: [followUpQuestion.targetGap],
      completenessScore: completion.completenessScore,
      currentBlock,
      blockProgress: calculateBlockProgress(context, currentBlock),
      shouldTransition: false
    };
  }

  // Step 3: Select next question from current block
  const nextQuestionId = await selectQuestionFromBlock(currentBlock, answeredIds, context);

  if (!nextQuestionId) {
    // No more questions in current block - check if we can finish
    const canFinish = context.completion.completenessScore >= 80;

    return {
      shouldAsk: !canFinish,
      reasoning: canFinish
        ? 'Assessment complete - sufficient data collected'
        : 'No more questions available in current block',
      confidence: canFinish ? 0.95 : 0.5,
      suggestedQuestionId: undefined,
      dataGaps: completion.missingFields || [],
      completenessScore: completion.completenessScore,
      currentBlock,
      blockProgress: 1.0,
      shouldTransition: !canFinish
    };
  }

  return {
    shouldAsk: true,
    reasoning: `Continuing ${currentBlock} block questions`,
    confidence: 0.8,
    suggestedQuestionId: nextQuestionId,
    dataGaps: completion.missingFields || [],
    completenessScore: completion.completenessScore,
    currentBlock,
    blockProgress: calculateBlockProgress(context, currentBlock),
    shouldTransition: false
  };
}

// ============================================================================
// BLOCK TRANSITION LOGIC
// ============================================================================

/**
 * Determines if we should transition to the next block
 */
function shouldTransitionToNextBlock(
  context: AssessmentSessionContext,
  currentBlock: QuestionBlock
): boolean {
  const completion = context.completion;
  const answeredIds = context.questionsAnsweredIds || [];

  // Count questions answered in current block
  const questionsInBlock = getQuestionsByBlock(currentBlock);
  const answeredInBlock = questionsInBlock.filter(q => answeredIds.includes(q.id)).length;

  const minQuestions = MIN_QUESTIONS_PER_BLOCK[currentBlock];
  const targetCompleteness = BLOCK_COMPLETENESS_TARGET[currentBlock];

  console.log('🔍 [Router v2] Transition check:', {
    currentBlock,
    answeredInBlock,
    minQuestions,
    completenessScore: completion.completenessScore,
    targetCompleteness
  });

  // Must meet minimum questions AND completeness target
  const meetsMinQuestions = answeredInBlock >= minQuestions;
  const meetsCompleteness = completion.completenessScore >= targetCompleteness;

  return meetsMinQuestions && meetsCompleteness;
}

/**
 * Gets the next block in progression
 */
function getNextBlock(currentBlock: QuestionBlock): QuestionBlock | null {
  const currentIndex = BLOCK_PROGRESSION.indexOf(currentBlock);
  if (currentIndex === -1 || currentIndex === BLOCK_PROGRESSION.length - 1) {
    return null; // Already at last block
  }
  return BLOCK_PROGRESSION[currentIndex + 1];
}

/**
 * Calculates progress within current block (0-1)
 */
function calculateBlockProgress(
  context: AssessmentSessionContext,
  block: QuestionBlock
): number {
  const questionsInBlock = getQuestionsByBlock(block);
  const answeredIds = context.questionsAnsweredIds || [];
  const answeredInBlock = questionsInBlock.filter(q => answeredIds.includes(q.id)).length;

  return Math.min(answeredInBlock / questionsInBlock.length, 1.0);
}

// ============================================================================
// QUESTION SELECTION
// ============================================================================

/**
 * Selects the next question from a specific block
 */
async function selectQuestionFromBlock(
  block: QuestionBlock,
  answeredIds: string[],
  context: AssessmentSessionContext
): Promise<string | undefined> {
  // Get all questions for this block
  let candidates = getQuestionsByBlock(block);

  // For deep-dive, detect which area to focus on
  if (block === 'deep-dive') {
    const detectedArea = await detectDeepDiveArea(context);
    if (detectedArea) {
      console.log('🎯 [Router v2] Deep-dive area detected:', detectedArea.area);
      candidates = getDeepDiveQuestions(detectedArea.area);
    }
  }

  // Filter out already answered questions
  candidates = candidates.filter(q => !answeredIds.includes(q.id));

  if (candidates.length === 0) {
    return undefined;
  }

  // Check prerequisites and filter
  const available = candidates.filter(q =>
    checkPrerequisites(q, answeredIds).allSatisfied
  );

  if (available.length === 0) {
    console.warn('⚠️ [Router v2] No questions with satisfied prerequisites');
    return candidates[0]?.id; // Fallback to first candidate
  }

  // Prioritize questions that fill the most data gaps
  const prioritized = prioritizeByDataGaps(available, context);

  return prioritized[0]?.id;
}

/**
 * Checks if question prerequisites are satisfied
 */
function checkPrerequisites(
  question: EnhancedQuestion,
  answeredIds: string[]
): { allSatisfied: boolean; missingSome?: string[] } {
  if (!question.prerequisites || question.prerequisites.length === 0) {
    return { allSatisfied: true };
  }

  const missing = question.prerequisites.filter(preqId => !answeredIds.includes(preqId));

  return {
    allSatisfied: missing.length === 0,
    missingSome: missing.length > 0 ? missing : undefined
  };
}

/**
 * Prioritizes questions based on data gaps they can fill
 */
function prioritizeByDataGaps(
  questions: EnhancedQuestion[],
  context: AssessmentSessionContext
): EnhancedQuestion[] {
  const missingFields = context.completion.missingFields || [];

  return questions.sort((a, b) => {
    // Count how many missing fields each question addresses
    const aScore = a.requiredFor.filter(field =>
      missingFields.some(missing => missing.includes(field))
    ).length;

    const bScore = b.requiredFor.filter(field =>
      missingFields.some(missing => missing.includes(field))
    ).length;

    return bScore - aScore; // Higher score first
  });
}

// ============================================================================
// FOLLOW-UP GENERATION
// ============================================================================

/**
 * Evaluates if any follow-up questions should be generated based on last answer
 */
async function evaluateFollowUpTriggers(
  context: AssessmentSessionContext
): Promise<FollowUpQuestion | null> {
  const lastAnswer = context.answers[context.answers.length - 1];
  if (!lastAnswer) {
    return null;
  }

  const question = getQuestionById(lastAnswer.questionId);
  if (!question || !question.followUpTriggers) {
    return null;
  }

  // Evaluate each trigger
  for (const trigger of question.followUpTriggers) {
    const shouldTrigger = trigger.condition(lastAnswer.answer, context);

    if (shouldTrigger) {
      console.log('🔥 [Router v2] Follow-up trigger fired:', {
        questionId: question.id,
        reason: trigger.reason
      });

      // Generate follow-up question using LLM
      return await generateFollowUpQuestion(
        question,
        lastAnswer,
        trigger.reason,
        context
      );
    }
  }

  return null;
}

/**
 * Generates a follow-up question using LLM based on trigger
 */
async function generateFollowUpQuestion(
  originalQuestion: EnhancedQuestion,
  answer: any,
  reason: string,
  context: AssessmentSessionContext
): Promise<FollowUpQuestion> {
  // For now, return a structured follow-up without LLM call
  // TODO: Sprint 3 will add actual LLM generation with Anthropic API

  const followUpId = `followup-${originalQuestion.id}-${Date.now()}`;

  // Simple rule-based follow-ups for common scenarios
  let followUpText = '';
  let targetGap = '';

  if (reason.includes('quality metrics')) {
    followUpText = 'Com que frequência sua equipe encontra bugs críticos em produção?';
    targetGap = 'currentState.bugFrequency';
  } else if (reason.includes('team size')) {
    followUpText = 'Esses desenvolvedores trabalham full-time no produto ou dividem atenção com outros projetos?';
    targetGap = 'team.dedicationLevel';
  } else {
    followUpText = `Pode elaborar mais sobre: "${String(answer.answer).substring(0, 50)}..."?`;
    targetGap = 'general.followUp';
  }

  return {
    id: followUpId,
    text: followUpText,
    inputType: 'text',
    placeholder: 'Sua resposta...',
    triggeredBy: originalQuestion.id,
    reason,
    targetGap,
    generatedAt: new Date(),
    llmModel: 'rule-based' // Will be 'haiku' or 'sonnet' in Sprint 3
  };
}

// ============================================================================
// DEEP-DIVE AREA DETECTION
// ============================================================================

/**
 * Detects which deep-dive area to focus on based on answers so far
 */
async function detectDeepDiveArea(
  context: AssessmentSessionContext
): Promise<DeepDiveAreaDetection | null> {
  const answers = context.answers;

  // Analyze pain points and challenges mentioned
  let velocityScore = 0;
  let qualityScore = 0;
  let onboardingScore = 0;
  let documentationScore = 0;

  for (const answer of answers) {
    const answerText = String(answer.answer).toLowerCase();

    // Velocity keywords
    if (answerText.match(/lent[oa]|devagar|atraso|deploy|release|entrega/)) {
      velocityScore += 2;
    }

    // Quality keywords
    if (answerText.match(/bug|erro|qualidade|teste|falha|quebr/)) {
      qualityScore += 2;
    }

    // Onboarding keywords
    if (answerText.match(/novo|onboard|integra[çc][ãa]o|treinamento|aprender/)) {
      onboardingScore += 1;
    }

    // Documentation keywords
    if (answerText.match(/documenta[çc][ãa]o|entender|confus|complexo/)) {
      documentationScore += 1;
    }
  }

  // Find highest score
  const scores = [
    { area: 'velocity' as const, score: velocityScore },
    { area: 'quality' as const, score: qualityScore },
    { area: 'onboarding' as const, score: onboardingScore },
    { area: 'documentation' as const, score: documentationScore }
  ];

  const topArea = scores.sort((a, b) => b.score - a.score)[0];

  if (topArea.score === 0) {
    return null; // No clear signal
  }

  const confidence = Math.min(topArea.score / 5, 1.0); // Max confidence at 5 points

  return {
    area: topArea.area,
    confidence,
    reasoning: `Detected ${topArea.area} focus from answers (score: ${topArea.score})`,
    basedOn: answers.map(a => a.questionId)
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Gets the full question object for a given ID
 */
export function getQuestionForRouting(questionId: string): EnhancedQuestion | null {
  return getQuestionById(questionId);
}

/**
 * Validates if a session is ready to finish
 */
export function canFinishAssessment(context: AssessmentSessionContext): boolean {
  const completion = context.completion;
  const currentBlock = context.currentBlock || 'discovery';

  // Must be in last block or beyond
  const isInFinalBlock = currentBlock === 'risk-scan';

  // Must have minimum completeness
  const hasMinCompleteness = completion.completenessScore >= 80;

  // Must have asked reasonable number of questions
  const hasMinQuestions = context.questionsAsked >= 8;

  console.log('🏁 [Router v2] Can finish check:', {
    isInFinalBlock,
    hasMinCompleteness,
    hasMinQuestions,
    completenessScore: completion.completenessScore
  });

  return isInFinalBlock && hasMinCompleteness && hasMinQuestions;
}

/**
 * Gets summary of routing state for debugging
 */
export function getRoutingStateSummary(context: AssessmentSessionContext): any {
  const currentBlock = context.currentBlock || 'discovery';
  const blockProgress = calculateBlockProgress(context, currentBlock);
  const canFinish = canFinishAssessment(context);
  const shouldTransition = shouldTransitionToNextBlock(context, currentBlock);

  return {
    currentBlock,
    blockProgress: `${(blockProgress * 100).toFixed(0)}%`,
    questionsAsked: context.questionsAsked,
    completenessScore: context.completion.completenessScore,
    canFinish,
    shouldTransition,
    nextBlock: shouldTransition ? getNextBlock(currentBlock) : null,
    missingFields: context.completion.missingFields?.length || 0
  };
}
