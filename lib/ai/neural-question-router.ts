/**
 * Neural Question Router - Intelligent question selection engine
 *
 * Responsibilities:
 * - Select next question based on context, relevance, and dependencies
 * - Handle inference-based skipping (auto-fill high-confidence answers)
 * - Support conditional flows (answer X → question Y)
 * - Track question history and prevent loops
 */

import {
  NeuralQuestion,
  AssessmentContext,
  InferenceResult,
  updateContext
} from './neural-questions';
import { NEURAL_QUESTION_LIBRARY } from './neural-question-library';

// ============================================
// CONFIGURATION
// ============================================

/**
 * Inference thresholds by question priority
 */
const INFERENCE_THRESHOLDS = {
  essential: 0.90, // Almost never skip essential questions
  important: 0.80, // Can skip if very confident
  optional: 0.65   // Skip easily if can infer
};

/**
 * Max questions per assessment (safety limit)
 */
const MAX_QUESTIONS = 12;

// ============================================
// DYNAMIC QUESTION ROUTER
// ============================================

export class NeuralQuestionRouter {
  private questions: NeuralQuestion[];
  private context: AssessmentContext;

  constructor(
    questions: NeuralQuestion[] = NEURAL_QUESTION_LIBRARY,
    context: AssessmentContext
  ) {
    this.questions = questions;
    this.context = context;
  }

  /**
   * Select next question intelligently
   */
  selectNext(): NeuralQuestion | null {
    // Safety: max questions limit
    if (this.context.sessionMetadata.questionsAsked >= MAX_QUESTIONS) {
      console.log('[NeuralRouter] Max questions reached');
      return null;
    }

    // 1. Filter available questions (not answered, dependencies met)
    const available = this.filterAvailable();

    if (available.length === 0) {
      console.log('[NeuralRouter] No more available questions');
      return null;
    }

    // 2. Filter inferrable questions (auto-fill if confidence > threshold)
    const needsAsking = this.filterInferrable(available);

    if (needsAsking.length === 0) {
      console.log('[NeuralRouter] All remaining questions inferred, done!');
      return null;
    }

    // 3. Score by relevance
    const scored = this.scoreByRelevance(needsAsking);

    // 4. Return highest scoring question
    const selected = scored[0];

    console.log(`[NeuralRouter] Selected question: ${selected.question.id} (score: ${selected.score.toFixed(2)})`);

    return selected.question;
  }

  /**
   * Get next question based on previous answer's nextQuestion logic
   */
  getNextFromAnswer(
    previousQuestion: NeuralQuestion,
    answer: any
  ): NeuralQuestion | null {
    if (!previousQuestion.nextQuestion) {
      return this.selectNext(); // Fall back to dynamic selection
    }

    const nextQuestionId = previousQuestion.nextQuestion(answer, this.context);

    if (!nextQuestionId) {
      console.log('[NeuralRouter] Previous question returned null, finishing');
      return null;
    }

    const nextQuestion = this.questions.find(q => q.id === nextQuestionId);

    if (!nextQuestion) {
      console.warn(`[NeuralRouter] Question ${nextQuestionId} not found, falling back to selectNext`);
      return this.selectNext();
    }

    // Check if next question is available (dependencies, not answered)
    if (!this.isQuestionAvailable(nextQuestion)) {
      console.log(`[NeuralRouter] ${nextQuestionId} not available, falling back to selectNext`);
      return this.selectNext();
    }

    console.log(`[NeuralRouter] Following nextQuestion logic: ${nextQuestionId}`);
    return nextQuestion;
  }

  /**
   * Update router context after answer
   */
  updateAfterAnswer(
    questionId: string,
    answer: any,
    extractedData: any
  ): void {
    this.context = updateContext(
      this.context,
      questionId,
      answer,
      extractedData
    );
  }

  /**
   * Get current context (for external access)
   */
  getContext(): AssessmentContext {
    return this.context;
  }

  // ============================================
  // PRIVATE HELPERS
  // ============================================

  /**
   * Filter questions that are available to ask
   */
  private filterAvailable(): NeuralQuestion[] {
    return this.questions.filter(q => this.isQuestionAvailable(q));
  }

  /**
   * Check if a question is available
   */
  private isQuestionAvailable(question: NeuralQuestion): boolean {
    // Already answered?
    if (this.context.answeredQuestions.includes(question.id)) {
      return false;
    }

    // Persona mismatch?
    if (this.context.sessionMetadata.persona) {
      if (!question.personas.includes(this.context.sessionMetadata.persona)) {
        return false;
      }
    }

    // Dependencies not met?
    if (question.dependencies.requires) {
      const missingDeps = question.dependencies.requires.filter(
        depId => !this.context.answeredQuestions.includes(depId)
      );

      if (missingDeps.length > 0) {
        return false;
      }
    }

    // Contradicted by another answered question?
    if (question.dependencies.contradicts) {
      const contradicted = question.dependencies.contradicts.some(
        contradictId => this.context.answeredQuestions.includes(contradictId)
      );

      if (contradicted) {
        return false;
      }
    }

    return true;
  }

  /**
   * Filter questions that can be inferred (auto-fill)
   */
  private filterInferrable(questions: NeuralQuestion[]): NeuralQuestion[] {
    const needsAsking: NeuralQuestion[] = [];

    for (const question of questions) {
      // Can't infer? Must ask
      if (!question.canInfer) {
        needsAsking.push(question);
        continue;
      }

      // Try to infer
      const inference = question.canInfer(this.context);

      if (!inference.canInfer) {
        needsAsking.push(question);
        continue;
      }

      // Get threshold based on priority
      const threshold = INFERENCE_THRESHOLDS[question.priority];

      // High confidence? Auto-fill and skip
      if (inference.confidence >= threshold) {
        console.log(
          `[NeuralRouter] Auto-filling ${question.id} (confidence: ${inference.confidence.toFixed(2)} >= ${threshold})`
        );

        // Store inference
        this.context.inferences.set(question.id, {
          value: inference.inferredValue,
          confidence: inference.confidence,
          source: 'pattern'
        });

        // Extract data as if user answered
        const extractedData = question.dataExtractor(
          inference.inferredValue,
          this.context
        );

        // Update context
        this.context = updateContext(
          this.context,
          question.id,
          inference.inferredValue,
          extractedData
        );

        // Skip this question
        continue;
      }

      // Medium confidence (0.60-threshold)? Ask with suggestion
      if (inference.confidence >= 0.60) {
        console.log(
          `[NeuralRouter] ${question.id} will show suggestion (confidence: ${inference.confidence.toFixed(2)})`
        );

        // Store as potential pre-fill
        this.context.inferences.set(question.id, {
          value: inference.inferredValue,
          confidence: inference.confidence,
          source: 'pattern'
        });

        needsAsking.push(question);
      } else {
        // Low confidence, ask normally
        needsAsking.push(question);
      }
    }

    return needsAsking;
  }

  /**
   * Score questions by relevance
   */
  private scoreByRelevance(
    questions: NeuralQuestion[]
  ): Array<{ question: NeuralQuestion; score: number }> {
    const scored = questions.map(q => ({
      question: q,
      score: q.relevance(this.context)
    }));

    // Sort by score (highest first)
    scored.sort((a, b) => b.score - a.score);

    return scored;
  }
}

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

/**
 * Create a new router with initial context
 */
export function createRouter(
  persona: import('@/lib/types').UserPersona | null,
  mode: 'express' | 'deep',
  partialData?: any
): NeuralQuestionRouter {
  const context: AssessmentContext = {
    currentData: partialData || {},
    answeredQuestions: [],
    sessionMetadata: {
      startTime: new Date(),
      questionsAsked: 0,
      mode,
      persona,
      urgencyLevel: undefined
    },
    inferences: new Map(),
    detectedPatterns: {}
  };

  return new NeuralQuestionRouter(NEURAL_QUESTION_LIBRARY, context);
}

/**
 * Get suggested answer for a question (if available)
 */
export function getSuggestedAnswer(
  questionId: string,
  context: AssessmentContext
): { value: any; confidence: number } | null {
  const inference = context.inferences.get(questionId);

  if (!inference) return null;

  // Only return if confidence is decent (>60%)
  if (inference.confidence < 0.60) return null;

  return {
    value: inference.value,
    confidence: inference.confidence
  };
}

/**
 * Check if assessment should finish (all essential questions answered)
 */
export function shouldFinishAssessment(context: AssessmentContext): boolean {
  const router = new NeuralQuestionRouter(NEURAL_QUESTION_LIBRARY, context);

  // If no more questions available, finish
  const next = router.selectNext();

  if (!next) return true;

  // If only optional questions left and we've asked 6+, can finish
  if (context.sessionMetadata.questionsAsked >= 6) {
    const essentialQuestions = NEURAL_QUESTION_LIBRARY.filter(
      q => q.priority === 'essential'
    );

    const allEssentialAnswered = essentialQuestions.every(
      q => context.answeredQuestions.includes(q.id) || context.inferences.has(q.id)
    );

    if (allEssentialAnswered) {
      console.log('[NeuralRouter] All essential questions answered, can finish');
      return true;
    }
  }

  return false;
}

/**
 * Get assessment completion percentage
 */
export function getCompletionPercentage(context: AssessmentContext): number {
  const essentialQuestions = NEURAL_QUESTION_LIBRARY.filter(
    q => q.priority === 'essential'
  );

  const essentialAnswered = essentialQuestions.filter(
    q => context.answeredQuestions.includes(q.id) || context.inferences.has(q.id)
  ).length;

  const essentialPercentage = (essentialAnswered / essentialQuestions.length) * 70;

  const totalAnswered = context.answeredQuestions.length + context.inferences.size;
  const totalPercentage = (totalAnswered / NEURAL_QUESTION_LIBRARY.length) * 30;

  return Math.min(100, Math.round(essentialPercentage + totalPercentage));
}
