/**
 * Completeness Scorer
 *
 * Calculates how complete an assessment is and whether it can finish
 */

import type { ConversationContext, CompletionMetrics } from '@/lib/types';
import { hasField } from './conversation-context';

/**
 * Essential fields that MUST be collected
 * Without these, report quality is poor
 */
const ESSENTIAL_FIELDS = [
  'companyInfo.name',
  'companyInfo.industry',
  'currentState.painPoints', // At least 1 pain point
  'goals.primaryGoals', // Primary goal
  'goals.budgetRange' // Budget (even if "none")
];

/**
 * Important fields (nice to have, improve report quality)
 */
const IMPORTANT_FIELDS = [
  'companyInfo.size',
  'companyInfo.stage',
  'currentState.devTeamSize',
  'goals.timeline',
  'goals.successMetrics',
  'contactInfo.email'
];

/**
 * Optional fields (good for deeper insights)
 */
const OPTIONAL_FIELDS = [
  'companyInfo.revenue',
  'currentState.bugRate',
  'currentState.avgCycleTime',
  'currentState.deployFrequency',
  'currentState.cicdMaturity',
  'currentState.aiTools',
  'goals.externalPressure',
  'goals.decisionAuthority'
];

/**
 * Calculate detailed completion metrics
 */
export function calculateDetailedCompletion(context: ConversationContext): CompletionMetrics {
  const { assessmentData, topicsCovered, metricsCollected } = context;

  // Count collected fields by priority
  const essentialCollected = ESSENTIAL_FIELDS.filter(field =>
    hasField(assessmentData, field)
  );

  const importantCollected = IMPORTANT_FIELDS.filter(field =>
    hasField(assessmentData, field)
  );

  const optionalCollected = OPTIONAL_FIELDS.filter(field =>
    hasField(assessmentData, field)
  );

  const totalFieldsCollected = essentialCollected.length + importantCollected.length + optionalCollected.length;

  // Weighted completeness score
  const weights = {
    essential: 0.5, // 50% weight
    important: 0.3, // 30% weight
    optional: 0.2   // 20% weight
  };

  const essentialScore = (essentialCollected.length / ESSENTIAL_FIELDS.length) * 100 * weights.essential;
  const importantScore = (importantCollected.length / IMPORTANT_FIELDS.length) * 100 * weights.important;
  const optionalScore = (optionalCollected.length / OPTIONAL_FIELDS.length) * 100 * weights.optional;

  const completenessScore = Math.round(essentialScore + importantScore + optionalScore);

  // Identify gaps (only essential and important)
  const gapsIdentified = [
    ...ESSENTIAL_FIELDS.filter(field => !hasField(assessmentData, field)),
    ...IMPORTANT_FIELDS.filter(field => !hasField(assessmentData, field))
  ];

  return {
    completenessScore,
    essentialFieldsCollected: essentialCollected.length,
    totalFieldsCollected,
    topicsCovered: Array.from(topicsCovered),
    metricsCollected,
    gapsIdentified
  };
}

/**
 * Check if assessment can finish
 *
 * Finish conditions:
 * 1. Completeness >= 80% AND >= 8 questions
 * 2. OR >= 18 questions (max limit)
 * 3. OR all essential fields collected AND >= 10 questions
 */
export function canFinishAssessment(context: ConversationContext): {
  canFinish: boolean;
  reason: string;
  recommendation?: string;
} {
  const { completion, questionsAsked } = context;
  const questionsCount = questionsAsked.length;

  // Reached max questions (18)
  if (questionsCount >= 18) {
    return {
      canFinish: true,
      reason: 'Maximum questions reached (18)',
      recommendation: completion.completenessScore < 70
        ? 'Consider addressing gaps in follow-up conversation'
        : undefined
    };
  }

  // High completeness (>= 80%) with minimum questions (8+)
  if (completion.completenessScore >= 80 && questionsCount >= 8) {
    return {
      canFinish: true,
      reason: `High completeness (${completion.completenessScore}%) with sufficient questions (${questionsCount})`
    };
  }

  // All essential fields + minimum 10 questions
  const hasAllEssentials = completion.essentialFieldsCollected === ESSENTIAL_FIELDS.length;
  if (hasAllEssentials && questionsCount >= 10) {
    return {
      canFinish: true,
      reason: 'All essential fields collected with sufficient questions (10+)'
    };
  }

  // Not ready to finish
  if (questionsCount < 8) {
    return {
      canFinish: false,
      reason: `Too few questions (${questionsCount}/8 minimum)`,
      recommendation: 'Continue asking essential questions'
    };
  }

  if (completion.completenessScore < 70) {
    const missingEssential = ESSENTIAL_FIELDS.length - completion.essentialFieldsCollected;
    return {
      canFinish: false,
      reason: `Low completeness (${completion.completenessScore}%), missing ${missingEssential} essential field(s)`,
      recommendation: `Address gaps: ${completion.gapsIdentified.slice(0, 3).join(', ')}`
    };
  }

  // Medium completeness (70-79%), could finish but recommend 1-2 more questions
  return {
    canFinish: false,
    reason: `Medium completeness (${completion.completenessScore}%)`,
    recommendation: 'Ask 1-2 more questions to reach 80% threshold'
  };
}

/**
 * Get next recommended action based on completion state
 */
export function getRecommendedAction(context: ConversationContext):
  | 'ask_essential'
  | 'ask_important'
  | 'ask_optional'
  | 'ask_quantification'
  | 'can_finish' {

  const { completion, topicsCovered, questionsAsked } = context;

  // Check if can finish
  const { canFinish } = canFinishAssessment(context);
  if (canFinish && questionsAsked.length >= 12) {
    return 'can_finish';
  }

  // Missing essential fields - highest priority
  const missingEssential = ESSENTIAL_FIELDS.filter(field =>
    !hasField(context.assessmentData, field)
  );
  if (missingEssential.length > 0) {
    return 'ask_essential';
  }

  // Has pain points but no quantification - ask metrics
  const hasPainPoints = hasField(context.assessmentData, 'currentState.painPoints');
  const hasMetrics = context.metricsCollected.length > 0;
  if (hasPainPoints && !hasMetrics && !topicsCovered.has('quantification')) {
    return 'ask_quantification';
  }

  // Missing important fields
  const missingImportant = IMPORTANT_FIELDS.filter(field =>
    !hasField(context.assessmentData, field)
  );
  if (missingImportant.length > 0) {
    return 'ask_important';
  }

  // All essential + important covered, can ask optional
  return 'ask_optional';
}

/**
 * Get priority questions to fill gaps
 */
export function getPriorityGaps(context: ConversationContext): string[] {
  const gaps: string[] = [];

  // Essential gaps (highest priority)
  ESSENTIAL_FIELDS.forEach(field => {
    if (!hasField(context.assessmentData, field)) {
      gaps.push(field);
    }
  });

  // Important gaps (medium priority)
  if (gaps.length < 3) {
    IMPORTANT_FIELDS.forEach(field => {
      if (!hasField(context.assessmentData, field) && gaps.length < 5) {
        gaps.push(field);
      }
    });
  }

  return gaps;
}

/**
 * Estimate how many more questions needed
 */
export function estimateQuestionsRemaining(context: ConversationContext): {
  min: number;
  max: number;
  reason: string;
} {
  const { completion, questionsAsked } = context;
  const currentCount = questionsAsked.length;

  // If high completeness, 0-2 more
  if (completion.completenessScore >= 80) {
    return {
      min: 0,
      max: 2,
      reason: 'High completeness, almost done'
    };
  }

  // If medium completeness, 2-4 more
  if (completion.completenessScore >= 60) {
    return {
      min: 2,
      max: 4,
      reason: 'Medium completeness, need to fill gaps'
    };
  }

  // If low completeness, 4-6 more
  const missingEssential = ESSENTIAL_FIELDS.length - completion.essentialFieldsCollected;
  const min = Math.max(missingEssential, 4);
  const max = Math.min(18 - currentCount, min + 2);

  return {
    min,
    max,
    reason: `Low completeness, missing ${missingEssential} essential fields`
  };
}

/**
 * Get completion summary for user display
 */
export function getCompletionSummary(context: ConversationContext): {
  percentage: number;
  label: string;
  color: string;
  message: string;
} {
  const { completenessScore } = context.completion;

  if (completenessScore >= 80) {
    return {
      percentage: completenessScore,
      label: 'Excelente',
      color: 'green',
      message: 'Temos informações suficientes para um relatório completo!'
    };
  }

  if (completenessScore >= 60) {
    return {
      percentage: completenessScore,
      label: 'Bom',
      color: 'yellow',
      message: 'Mais algumas perguntas para um relatório mais preciso.'
    };
  }

  return {
    percentage: completenessScore,
    label: 'Em progresso',
    color: 'gray',
    message: 'Continuamos coletando informações importantes.'
  };
}
