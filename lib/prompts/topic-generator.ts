import { AssessmentData } from '../types';

export interface SuggestedTopic {
  id: string;
  label: string;
  reason: string; // Why this topic is relevant
  priority: 'high' | 'medium' | 'low';
}

/**
 * Generate suggested topics based on assessment data
 */
export function generateSuggestedTopics(data: AssessmentData): SuggestedTopic[] {
  const topics: SuggestedTopic[] = [];
  const { currentState, goals, persona } = data;

  // Topic 1: Bugs/Quality (if mentioned)
  if (currentState.painPoints.some(p => p.includes('bugs') || p.includes('qualidade'))) {
    topics.push({
      id: 'quality-impact',
      label: persona === 'board-executive'
        ? 'Impacto de problemas de qualidade na competitividade'
        : 'Impacto de bugs e problemas de qualidade',
      reason: 'Você mencionou isso como pain point',
      priority: 'high',
    });
  }

  // Topic 2: Speed/Velocity
  if (currentState.avgCycleTime > 14 || currentState.deploymentFrequency.includes('monthly') || currentState.deploymentFrequency.includes('quarterly')) {
    topics.push({
      id: 'speed-innovation',
      label: persona === 'board-executive'
        ? 'Velocidade de inovação e time-to-market'
        : 'Velocidade de desenvolvimento e deployment',
      reason: `Ciclo atual de ${currentState.avgCycleTime} dias é longo`,
      priority: 'high',
    });
  }

  // Topic 3: AI Adoption barriers
  if (currentState.aiToolsUsage === 'none' || currentState.aiToolsUsage === 'exploring') {
    topics.push({
      id: 'ai-barriers',
      label: 'Barreiras para adoção de AI/automation',
      reason: 'Uso de AI ainda é baixo',
      priority: 'high',
    });
  }

  // Topic 4: ROI expectations
  if (goals.primaryGoals.some(g => g.includes('produtividade') || g.includes('velocidade'))) {
    topics.push({
      id: 'roi-expectations',
      label: persona === 'board-executive'
        ? 'ROI esperado e prioridades de investimento'
        : 'ROI esperado da transformação',
      reason: 'Alinhado com seus objetivos',
      priority: 'medium',
    });
  }

  // Topic 5: Team capacity
  if (currentState.painPoints.some(p => p.includes('produtividade') || p.includes('capacidade'))) {
    topics.push({
      id: 'team-capacity',
      label: persona === 'board-executive'
        ? 'Capacidade operacional e limitações do time'
        : 'Capacidade atual do time técnico',
      reason: 'Produtividade foi mencionada como desafio',
      priority: 'medium',
    });
  }

  // Topic 6: Strategic risks
  if (persona === 'board-executive' || persona === 'product-business') {
    topics.push({
      id: 'strategic-risks',
      label: 'Riscos estratégicos e competitivos',
      reason: 'Importante para planejamento estratégico',
      priority: 'medium',
    });
  }

  // Topic 7: Talent retention (if mentioned)
  if (currentState.painPoints.some(p => p.includes('retenção') || p.includes('rotatividade') || p.includes('talento'))) {
    topics.push({
      id: 'talent-retention',
      label: 'Atração e retenção de talentos',
      reason: 'Mencionado como desafio',
      priority: 'high',
    });
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  topics.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // Return top 6 topics
  return topics.slice(0, 6);
}

/**
 * Generate context string for AI about selected topics
 */
export function generateTopicContext(selectedTopics: string[], allTopics: SuggestedTopic[]): string {
  if (selectedTopics.length === 0) {
    return 'O usuário optou por deixar você decidir os tópicos mais relevantes.';
  }

  const selected = allTopics.filter(t => selectedTopics.includes(t.id));
  return `O usuário selecionou os seguintes tópicos para aprofundar:\n${selected.map(t => `- ${t.label}`).join('\n')}`;
}
