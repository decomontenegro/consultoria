/**
 * Topic Tracker
 *
 * Tracks topics covered in conversation to avoid semantic repetition
 * Goes beyond field tracking - detects concepts/topics mentioned
 */

import type { ConversationContext } from '@/lib/types';

/**
 * Topic semantic groups (synonyms/related concepts)
 */
const TOPIC_GROUPS: Record<string, string[]> = {
  velocity: ['velocity', 'speed', 'cycle-time', 'time-to-market', 'deploy-frequency', 'desenvolvimento lento', 'rápido'],
  quality: ['quality', 'bugs', 'errors', 'defects', 'reliability', 'qualidade', 'bug rate'],
  cost: ['cost', 'budget', 'price', 'expense', 'custo', 'orçamento', 'financial'],
  team: ['team', 'people', 'hiring', 'talent', 'developers', 'time', 'equipe', 'contratação'],
  'tech-debt': ['tech-debt', 'technical debt', 'refactoring', 'legacy', 'débito técnico', 'código legado'],
  scalability: ['scalability', 'scale', 'growth', 'performance', 'escalabilidade', 'crescimento'],
  process: ['process', 'workflow', 'cicd', 'devops', 'automation', 'processo', 'automação'],
  competition: ['competition', 'competitor', 'market', 'concorrência', 'mercado'],
  compliance: ['compliance', 'security', 'lgpd', 'gdpr', 'conformidade', 'segurança'],
  customer: ['customer', 'client', 'user', 'churn', 'cliente', 'usuário']
};

/**
 * Detect topics mentioned in an answer (text analysis)
 */
export function detectTopicsInAnswer(answer: any): string[] {
  if (!answer) return [];

  const answerText = typeof answer === 'string' ? answer.toLowerCase() : String(answer).toLowerCase();
  const detectedTopics: string[] = [];

  // Check each topic group
  for (const [topic, keywords] of Object.entries(TOPIC_GROUPS)) {
    const mentioned = keywords.some(keyword => answerText.includes(keyword));
    if (mentioned) {
      detectedTopics.push(topic);
    }
  }

  return detectedTopics;
}

/**
 * Check if a topic has been semantically covered
 */
export function isTopicCovered(topic: string, context: ConversationContext): boolean {
  // Direct match
  if (context.topicsCovered.has(topic)) {
    return true;
  }

  // Check semantic group
  const semanticGroup = Object.entries(TOPIC_GROUPS).find(([groupTopic, keywords]) =>
    groupTopic === topic || keywords.includes(topic)
  );

  if (semanticGroup) {
    const [groupTopic, keywords] = semanticGroup;

    // If group topic is covered
    if (context.topicsCovered.has(groupTopic)) {
      return true;
    }

    // If any synonym in group is covered
    const synonymCovered = keywords.some(keyword =>
      context.topicsCovered.has(keyword)
    );
    if (synonymCovered) {
      return true;
    }
  }

  return false;
}

/**
 * Get uncovered topics from a priority list
 */
export function getUncoveredTopics(
  priorityTopics: string[],
  context: ConversationContext
): string[] {
  return priorityTopics.filter(topic => !isTopicCovered(topic, context));
}

/**
 * Get coverage percentage for essential topics
 */
export function calculateTopicCoverage(context: ConversationContext): {
  percentage: number;
  covered: string[];
  missing: string[];
} {
  const essentialTopics = ['velocity', 'quality', 'cost', 'team', 'process'];

  const covered = essentialTopics.filter(topic => isTopicCovered(topic, context));
  const missing = essentialTopics.filter(topic => !isTopicCovered(topic, context));

  const percentage = Math.round((covered.length / essentialTopics.length) * 100);

  return {
    percentage,
    covered,
    missing
  };
}
