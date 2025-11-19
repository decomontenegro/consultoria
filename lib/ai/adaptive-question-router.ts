/**
 * Adaptive Question Router
 *
 * Uses Claude API to intelligently select the next best question
 * Based on conversation context, persona, completeness, and weak signals
 *
 * Cost: ~R$0.05-0.10 per routing decision (~500-1000 tokens)
 */

import Anthropic from '@anthropic-ai/sdk';
import type {
  ConversationContext,
  RoutingDecision,
  AdaptiveQuestionResponse
} from '@/lib/types';
import type { QuestionPoolItem } from './question-pool';
import { QUESTION_POOL, getQuestionById } from './question-pool';
import { hasField } from './conversation-context';
import {
  canFinishAssessment,
  getRecommendedAction,
  calculateDetailedCompletion
} from './completeness-scorer';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

/**
 * Get next question using AI-powered routing
 *
 * Returns null if should finish assessment
 */
export async function getNextQuestion(
  context: ConversationContext
): Promise<AdaptiveQuestionResponse> {
  // Update completion metrics
  const completion = calculateDetailedCompletion(context);

  // Check if should finish
  const { canFinish, reason: finishReason } = canFinishAssessment({
    ...context,
    completion
  });

  if (canFinish) {
    return {
      nextQuestion: null,
      routing: null,
      shouldFinish: true,
      finishReason: determineFinishReason(context, completion),
      completion
    };
  }

  // Filter available questions
  const availableQuestions = QUESTION_POOL.filter(q =>
    canAskQuestion(q, context)
  );

  if (availableQuestions.length === 0) {
    // No more questions available, force finish
    return {
      nextQuestion: null,
      routing: null,
      shouldFinish: true,
      finishReason: 'all_essential_covered',
      completion
    };
  }

  // If only 1-2 questions available, just pick highest priority
  if (availableQuestions.length <= 2) {
    const next = availableQuestions.sort((a, b) =>
      priorityScore(b, context) - priorityScore(a, context)
    )[0];

    return {
      nextQuestion: formatQuestion(next),
      routing: {
        questionId: next.id,
        reasoning: 'Only viable option remaining',
        confidence: 1.0
      },
      shouldFinish: false,
      completion
    };
  }

  // Use AI to intelligently pick best question
  try {
    const routing = await selectBestQuestionWithAI(context, availableQuestions);
    const selectedQuestion = getQuestionById(routing.questionId);

    if (!selectedQuestion) {
      // Fallback to highest priority
      const fallback = availableQuestions[0];
      return {
        nextQuestion: formatQuestion(fallback),
        routing: {
          questionId: fallback.id,
          reasoning: 'Fallback to first available',
          confidence: 0.5
        },
        shouldFinish: false,
        completion
      };
    }

    return {
      nextQuestion: formatQuestion(selectedQuestion),
      routing,
      shouldFinish: false,
      completion
    };
  } catch (error) {
    console.error('[Adaptive Router] AI routing failed:', error);

    // Fallback to rule-based selection
    const fallback = selectQuestionRuleBased(context, availableQuestions);

    return {
      nextQuestion: formatQuestion(fallback),
      routing: {
        questionId: fallback.id,
        reasoning: 'Rule-based fallback (AI unavailable)',
        confidence: 0.7
      },
      shouldFinish: false,
      completion
    };
  }
}

/**
 * Check if a question can be asked given current context
 */
function canAskQuestion(
  question: QuestionPoolItem,
  context: ConversationContext
): boolean {
  // Already asked?
  if (context.questionsAnsweredIds.includes(question.id)) {
    return false;
  }

  // Persona mismatch?
  if (context.persona && !question.personas.includes('all')) {
    if (!question.personas.includes(context.persona)) {
      return false;
    }
  }

  // Topic already covered? (semantic skip)
  if (question.skipIf?.topicsCovered) {
    const overlap = question.skipIf.topicsCovered.filter(topic =>
      context.topicsCovered.has(topic)
    );
    if (overlap.length > 0) {
      return false; // Topic already covered
    }
  }

  // Field already collected? (exact skip)
  if (question.skipIf?.fieldsCollected) {
    const hasCollected = question.skipIf.fieldsCollected.some(field =>
      hasField(context.assessmentData, field)
    );
    if (hasCollected) {
      return false;
    }
  }

  // Prerequisites missing?
  if (question.requires?.fieldsPresent) {
    const hasRequired = question.requires.fieldsPresent.every(field =>
      hasField(context.assessmentData, field)
    );
    if (!hasRequired) {
      return false; // Prerequisites not met
    }
  }

  if (question.requires?.topicsAnswered) {
    const hasTopics = question.requires.topicsAnswered.every(topic =>
      context.topicsCovered.has(topic)
    );
    if (!hasTopics) {
      return false;
    }
  }

  if (question.requires?.personaConfidence) {
    if (context.personaConfidence < question.requires.personaConfidence) {
      return false; // Not confident enough in persona
    }
  }

  return true;
}

/**
 * Use Claude API to select best next question
 */
async function selectBestQuestionWithAI(
  context: ConversationContext,
  availableQuestions: QuestionPoolItem[]
): Promise<RoutingDecision> {
  const prompt = buildRoutingPrompt(context, availableQuestions);

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001', // Haiku 4.5: faster and cheaper for routing
    max_tokens: 300,
    temperature: 0.3, // Low temperature for consistency
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  });

  const textContent = response.content.find(c => c.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  return parseRoutingDecision(textContent.text, availableQuestions);
}

/**
 * Build prompt for Claude to decide next question
 */
function buildRoutingPrompt(
  context: ConversationContext,
  availableQuestions: QuestionPoolItem[]
): string {
  const recentQA = context.questionsAsked.slice(-3).map(qa =>
    `Q: "${qa.questionText}"\nA: ${JSON.stringify(qa.answer)}`
  ).join('\n\n');

  const action = getRecommendedAction(context);
  const actionGuidance = {
    ask_essential: 'PRIORITY: Ask essential field question first',
    ask_quantification: 'PRIORITY: User mentioned pain but no metrics - quantify it',
    ask_important: 'PRIORITY: Ask important field to improve report quality',
    ask_optional: 'PRIORITY: Ask optional field for deeper insights',
    can_finish: 'Assessment complete, can finish'
  };

  return `You are an expert consultant conducting a business assessment.

**CONTEXT:**

Persona: ${context.persona || 'Unknown'} (confidence: ${(context.personaConfidence * 100).toFixed(0)}%)
Questions asked: ${context.questionsAsked.length}
Topics covered: ${Array.from(context.topicsCovered).slice(0, 10).join(', ')}
Urgency: ${context.insights.urgencyLevel}
Completeness: ${context.completion.completenessScore}%

**RECENT Q&A:**

${recentQA || 'No previous questions yet'}

**WEAK SIGNALS:**
${Object.entries(context.weakSignals)
    .filter(([_, value]) => value)
    .map(([signal]) => `- ${signal}`)
    .join('\n') || 'None detected'}

**GUIDANCE:** ${actionGuidance[action]}

**AVAILABLE QUESTIONS (${availableQuestions.length}):**

${availableQuestions.slice(0, 8).map((q, i) => `
${i + 1}. [${q.id}] (${q.priority})
   Category: ${q.category}
   Text: "${q.text}"
   Tags: ${q.tags.join(', ')}
`).join('\n')}

${availableQuestions.length > 8 ? `\n... and ${availableQuestions.length - 8} more questions` : ''}

**YOUR TASK:**

Pick the BEST next question to:
1. Fill critical gaps (${context.completion.gapsIdentified.slice(0, 2).join(', ')})
2. Quantify vague statements (if weak signals detected)
3. Follow natural conversation flow
4. Avoid redundancy

Return ONLY valid JSON:

{
  "questionId": "exact question ID from list above",
  "reasoning": "1-2 sentences why this question is best right now"
}`;
}

/**
 * Parse Claude's routing decision response
 */
function parseRoutingDecision(
  response: string,
  availableQuestions: QuestionPoolItem[]
): RoutingDecision {
  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate questionId exists in available questions
    const questionExists = availableQuestions.some(q => q.id === parsed.questionId);
    if (!questionExists) {
      throw new Error(`Question ID ${parsed.questionId} not in available list`);
    }

    return {
      questionId: parsed.questionId,
      reasoning: parsed.reasoning || 'AI selected this question',
      confidence: 0.85 // High confidence when AI succeeds
    };
  } catch (error) {
    console.error('[Routing Parser] Failed to parse:', error);

    // Fallback: return first available question
    return {
      questionId: availableQuestions[0].id,
      reasoning: 'Fallback due to parsing error',
      confidence: 0.5
    };
  }
}

/**
 * Rule-based question selection (fallback when AI fails)
 */
function selectQuestionRuleBased(
  context: ConversationContext,
  availableQuestions: QuestionPoolItem[]
): QuestionPoolItem {
  const action = getRecommendedAction(context);

  // Filter by priority based on action
  let filtered = availableQuestions;

  if (action === 'ask_essential') {
    filtered = availableQuestions.filter(q => q.priority === 'essential');
  } else if (action === 'ask_quantification') {
    filtered = availableQuestions.filter(q =>
      q.category === 'quantification' || q.tags.includes('metrics')
    );
  } else if (action === 'ask_important') {
    filtered = availableQuestions.filter(q =>
      q.priority === 'essential' || q.priority === 'important'
    );
  }

  // If filter too restrictive, use all available
  if (filtered.length === 0) {
    filtered = availableQuestions;
  }

  // Sort by priority score
  const sorted = filtered.sort((a, b) =>
    priorityScore(b, context) - priorityScore(a, context)
  );

  return sorted[0];
}

/**
 * Calculate priority score for a question
 * Higher score = higher priority
 */
function priorityScore(question: QuestionPoolItem, context: ConversationContext): number {
  let score = 0;

  // Priority level
  if (question.priority === 'essential') score += 100;
  else if (question.priority === 'important') score += 50;
  else score += 20;

  // Persona match bonus
  if (context.persona && question.personas.includes(context.persona)) {
    score += 30;
  }

  // Gap filling bonus
  const fillsGap = context.completion.gapsIdentified.some(gap => {
    // Check if question's dataExtractor targets this gap
    // This is approximate - could be improved
    return gap.includes(question.category);
  });
  if (fillsGap) {
    score += 40;
  }

  // Quantification bonus if weak signals detected
  if (context.weakSignals.lacksMetrics && question.tags.includes('quantification')) {
    score += 50;
  }

  // Budget question bonus if urgency is high
  if (context.insights.urgencyLevel === 'critical' && question.category === 'budget') {
    score += 30;
  }

  return score;
}

/**
 * Format question for API response
 */
function formatQuestion(question: QuestionPoolItem) {
  return {
    id: question.id,
    text: question.text,
    inputType: question.inputType,
    options: question.options,
    placeholder: question.placeholder
  };
}

/**
 * Determine finish reason
 */
function determineFinishReason(
  context: ConversationContext,
  completion: any
): 'completeness_reached' | 'max_questions' | 'all_essential_covered' {
  if (context.questionsAsked.length >= 18) {
    return 'max_questions';
  }
  if (completion.completenessScore >= 80) {
    return 'completeness_reached';
  }
  return 'all_essential_covered';
}
