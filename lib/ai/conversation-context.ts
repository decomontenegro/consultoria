/**
 * Conversation Context Manager
 *
 * Manages the state of adaptive assessment conversation
 * Tracks questions asked, topics covered, data collected, weak signals
 */

import type {
  ConversationContext,
  WeakSignals,
  ConversationInsights,
  CompletionMetrics,
  QuestionSource,
  UserPersona,
  UrgencyLevel,
  ComplexityLevel,
  AssessmentData,
  DeepPartial
} from '@/lib/types';
import type { QuestionPoolItem } from './question-pool';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create initial conversation context
 */
export function buildInitialContext(
  persona: UserPersona | null = null,
  personaConfidence: number = 0,
  partialData: DeepPartial<AssessmentData> = {}
): ConversationContext {
  return {
    sessionId: uuidv4(),
    startTime: new Date(),
    lastUpdated: new Date(),

    persona,
    personaConfidence,

    assessmentData: partialData,

    questionsAsked: [],
    questionsAnsweredIds: [],

    topicsCovered: new Set(),
    metricsCollected: [],

    weakSignals: {
      isVague: false,
      hasContradiction: false,
      hasHesitation: false,
      lacksMetrics: false,
      hasEmotionalLanguage: false,
      hasPressureIndicators: false
    },

    insights: {
      urgencyLevel: 'medium',
      complexityLevel: 'moderate',
      detectedPatterns: [],
      mentionedTools: [],
      mentionedCompetitors: [],
      hasQuantifiableImpact: false,
      hasDecisionAuthority: false,
      hasBudget: false
    },

    completion: {
      completenessScore: 0,
      essentialFieldsCollected: 0,
      totalFieldsCollected: 0,
      topicsCovered: [],
      metricsCollected: [],
      gapsIdentified: []
    },

    questionsRemaining: 15, // Target: 12-18 questions
    canFinish: false
  };
}

/**
 * Update context after user answers a question
 */
export function updateContext(
  context: ConversationContext,
  question: QuestionPoolItem,
  answer: any,
  source: QuestionSource = { type: 'pool', poolId: question.id }
): ConversationContext {
  // Extract data from answer using question's dataExtractor
  const extractedData = question.dataExtractor(answer, context);

  // Merge extracted data with existing assessment data
  const updatedAssessmentData = deepMerge(context.assessmentData, extractedData);

  // Update topics covered
  const newTopics = new Set(context.topicsCovered);
  question.tags.forEach(tag => newTopics.add(tag));

  // Detect weak signals in answer
  const weakSignals = detectWeakSignals(answer, question);

  // Update insights
  const insights = updateInsights(context.insights, question, answer, extractedData);

  // Calculate new completion metrics
  const completion = calculateCompletion(updatedAssessmentData, Array.from(newTopics), context.metricsCollected);

  // Update questions tracking
  const questionsAsked = [
    ...context.questionsAsked,
    {
      id: question.id,
      questionText: question.text,
      answer,
      source,
      askedAt: new Date()
    }
  ];

  const questionsAnsweredIds = [...context.questionsAnsweredIds, question.id];

  return {
    ...context,
    lastUpdated: new Date(),
    assessmentData: updatedAssessmentData,
    questionsAsked,
    questionsAnsweredIds,
    topicsCovered: newTopics,
    weakSignals: mergeWeakSignals(context.weakSignals, weakSignals),
    insights,
    completion,
    questionsRemaining: Math.max(0, context.questionsRemaining - 1),
    canFinish: completion.completenessScore >= 80 || questionsAsked.length >= 18
  };
}

/**
 * Detect weak signals in user's answer
 */
function detectWeakSignals(answer: any, question: QuestionPoolItem): WeakSignals {
  const answerText = typeof answer === 'string' ? answer.toLowerCase() : '';

  // Vague language
  const vagueIndicators = ['alguns', 'meio que', 'mais ou menos', 'tipo', 'um pouco', 'às vezes'];
  const isVague = vagueIndicators.some(indicator => answerText.includes(indicator));

  // Hesitation
  const hesitationIndicators = ['acho que', 'talvez', 'não sei', 'difícil dizer', 'depende'];
  const hasHesitation = hesitationIndicators.some(indicator => answerText.includes(indicator));

  // Emotional language
  const emotionalIndicators = ['frustrado', 'estressado', 'desesperado', 'preocupado', 'ansioso', 'crítico'];
  const hasEmotionalLanguage = emotionalIndicators.some(indicator => answerText.includes(indicator));

  // Pressure indicators
  const pressureIndicators = ['urgente', 'ontem', 'asap', 'imediato', 'rápido', 'prioridade'];
  const hasPressureIndicators = pressureIndicators.some(indicator => answerText.includes(indicator));

  // Lacks metrics (if question is about quantification)
  const isQuantificationQuestion = question.tags.includes('metrics') || question.tags.includes('quantification');
  const hasNumbers = /\d+/.test(answerText);
  const lacksMetrics = isQuantificationQuestion && !hasNumbers && answerText.length > 20;

  // TODO: Detect contradictions (requires comparing with previous answers)
  const hasContradiction = false;

  return {
    isVague,
    hasContradiction,
    hasHesitation,
    lacksMetrics,
    hasEmotionalLanguage,
    hasPressureIndicators
  };
}

/**
 * Merge weak signals (keep true if either old or new is true)
 */
function mergeWeakSignals(old: WeakSignals, newSignals: WeakSignals): WeakSignals {
  return {
    isVague: old.isVague || newSignals.isVague,
    hasContradiction: old.hasContradiction || newSignals.hasContradiction,
    hasHesitation: old.hasHesitation || newSignals.hasHesitation,
    lacksMetrics: old.lacksMetrics || newSignals.lacksMetrics,
    hasEmotionalLanguage: old.hasEmotionalLanguage || newSignals.hasEmotionalLanguage,
    hasPressureIndicators: old.hasPressureIndicators || newSignals.hasPressureIndicators
  };
}

/**
 * Update conversation insights based on new answer
 */
function updateInsights(
  currentInsights: ConversationInsights,
  question: QuestionPoolItem,
  answer: any,
  extractedData: Partial<AssessmentData>
): ConversationInsights {
  const insights = { ...currentInsights };

  // Update urgency level
  if (question.tags.includes('urgency') || question.id.includes('timeline')) {
    const answerLower = String(answer).toLowerCase();
    if (answerLower.includes('immediate') || answerLower.includes('critical') || answerLower.includes('yes-critical')) {
      insights.urgencyLevel = 'critical';
    } else if (answerLower.includes('short') || answerLower.includes('yes-moderate') || answerLower.includes('high')) {
      insights.urgencyLevel = 'high';
    }
  }

  // Update complexity based on team size, tech stack, etc.
  if (question.id === 'team-size-dev' && extractedData.currentState?.devTeamSize) {
    const teamSize = extractedData.currentState.devTeamSize;
    if (teamSize > 50) {
      insights.complexityLevel = 'complex';
    } else if (teamSize > 15) {
      insights.complexityLevel = 'moderate';
    }
  }

  // Detect mentioned tools
  const answerText = String(answer).toLowerCase();
  const toolKeywords = ['github copilot', 'cursor', 'chatgpt', 'claude', 'copilot', 'ai', 'jira', 'github', 'gitlab'];
  toolKeywords.forEach(tool => {
    if (answerText.includes(tool) && !insights.mentionedTools.includes(tool)) {
      insights.mentionedTools.push(tool);
    }
  });

  // Check if has quantifiable impact
  if (question.tags.includes('metrics') || question.tags.includes('quantification')) {
    if (String(answer).match(/\d+/)) {
      insights.hasQuantifiableImpact = true;
    }
  }

  // Check budget
  if (question.id === 'budget-range' && answer && answer !== 'none') {
    insights.hasBudget = true;
  }

  // Check decision authority
  if (question.id === 'decision-authority' && answer && answer.includes('yes')) {
    insights.hasDecisionAuthority = true;
  }

  return insights;
}

/**
 * Calculate completion metrics
 */
function calculateCompletion(
  assessmentData: DeepPartial<AssessmentData>,
  topicsCovered: string[],
  metricsCollected: string[]
): CompletionMetrics {
  // Count essential fields
  const essentialFields = [
    'companyInfo.name',
    'companyInfo.industry',
    'currentState.painPoints',
    'goals.primaryGoals',
    'goals.budgetRange'
  ];

  const essentialFieldsCollected = essentialFields.filter(field =>
    hasField(assessmentData, field)
  ).length;

  // Count total fields
  const allFields = [
    ...essentialFields,
    'companyInfo.size',
    'companyInfo.revenue',
    'currentState.devTeamSize',
    'currentState.bugRate',
    'currentState.avgCycleTime',
    'goals.timeline',
    'goals.successMetrics'
  ];

  const totalFieldsCollected = allFields.filter(field =>
    hasField(assessmentData, field)
  ).length;

  // Calculate completeness score (0-100)
  const essentialWeight = 0.6; // 60% weight for essential fields
  const otherWeight = 0.4; // 40% weight for other fields

  const essentialScore = (essentialFieldsCollected / essentialFields.length) * 100 * essentialWeight;
  const otherScore = (totalFieldsCollected / allFields.length) * 100 * otherWeight;
  const completenessScore = Math.round(essentialScore + otherScore);

  // Identify gaps
  const gapsIdentified = essentialFields.filter(field =>
    !hasField(assessmentData, field)
  );

  return {
    completenessScore,
    essentialFieldsCollected,
    totalFieldsCollected,
    topicsCovered,
    metricsCollected,
    gapsIdentified
  };
}

/**
 * Check if a nested field exists in assessment data
 */
export function hasField(data: any, path: string): boolean {
  const keys = path.split('.');
  let current = data;

  for (const key of keys) {
    if (current == null || typeof current !== 'object') {
      return false;
    }
    if (!(key in current)) {
      return false;
    }
    current = current[key];
  }

  // Check if value is meaningful (not empty string, empty array, etc.)
  if (current == null) return false;
  if (typeof current === 'string' && current.trim() === '') return false;
  if (Array.isArray(current) && current.length === 0) return false;

  return true;
}

/**
 * Deep merge two objects (for assessment data)
 */
function deepMerge<T>(target: T, source: Partial<T>): T {
  const output = { ...target } as any;

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject((source as any)[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: (source as any)[key] });
        } else {
          output[key] = deepMerge((target as any)[key], (source as any)[key]);
        }
      } else {
        Object.assign(output, { [key]: (source as any)[key] });
      }
    });
  }

  return output;
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Get summary of conversation context for logging/debugging
 */
export function getContextSummary(context: ConversationContext): string {
  return `
Context Summary:
- Session: ${context.sessionId}
- Persona: ${context.persona} (${(context.personaConfidence * 100).toFixed(0)}%)
- Questions: ${context.questionsAsked.length} asked
- Topics: ${Array.from(context.topicsCovered).join(', ')}
- Completeness: ${context.completion.completenessScore}%
- Urgency: ${context.insights.urgencyLevel}
- Can Finish: ${context.canFinish}
  `.trim();
}
