import { AssessmentData, UserPersona } from '../types';

export interface SuggestedTopic {
  id: string;
  label: string;
  reason: string; // Why this topic is relevant
  priority: 'high' | 'medium' | 'low' | 'urgent';
  quickWin?: boolean; // Can deliver value in short timeframe (3-6 months)
}

/**
 * Label sanitization: Replace technical jargon with business-friendly terms
 * for non-technical personas
 */
const labelReplacements: Record<UserPersona, Record<string, string>> = {
  'board-executive': {
    'AI': 'inteligência artificial',
    'automation': 'automação e inovação tecnológica',
    'bugs': 'problemas de qualidade',
    'deployment': 'lançamento',
    'pipeline': 'processo de entrega',
    'code': 'desenvolvimento',
    'technical debt': 'limitações do sistema',
  },
  'finance-ops': {
    'AI': 'automação',
    'bugs': 'problemas operacionais',
    'deployment': 'processo de entrega',
    'code': 'desenvolvimento',
  },
  'product-business': {
    'AI': 'automação',
    'deployment': 'lançamento',
    'code': 'desenvolvimento',
  },
  'engineering-tech': {}, // No replacements needed
  'it-devops': {}, // No replacements needed
};

/**
 * Sanitizes topic labels to remove inappropriate jargon for the persona
 */
function sanitizeLabelForPersona(label: string, persona: UserPersona): string {
  const replacements = labelReplacements[persona];

  if (!replacements || Object.keys(replacements).length === 0) {
    return label;
  }

  let sanitized = label;

  Object.entries(replacements).forEach(([jargon, replacement]) => {
    const regex = new RegExp(jargon, 'gi');
    sanitized = sanitized.replace(regex, replacement);
  });

  return sanitized;
}

/**
 * Generate suggested topics based on assessment data
 */
export function generateSuggestedTopics(data: AssessmentData): SuggestedTopic[] {
  const topics: SuggestedTopic[] = [];
  const { currentState, goals, persona } = data;

  // Topic 1: Bugs/Quality (if mentioned) - QUICK WIN
  if (currentState.painPoints.some(p => p.includes('bugs') || p.includes('qualidade'))) {
    topics.push({
      id: 'quality-impact',
      label: persona === 'board-executive'
        ? 'Impacto de problemas de qualidade na competitividade'
        : 'Impacto de bugs e problemas de qualidade',
      reason: 'Você mencionou isso como pain point',
      priority: 'high',
      quickWin: true, // AI code review can show results quickly
    });
  }

  // Topic 2: Speed/Velocity - QUICK WIN
  if (currentState.avgCycleTime > 14 || currentState.deploymentFrequency.includes('monthly') || currentState.deploymentFrequency.includes('quarterly')) {
    topics.push({
      id: 'speed-innovation',
      label: persona === 'board-executive'
        ? 'Velocidade de inovação e time-to-market'
        : 'Velocidade de desenvolvimento e deployment',
      reason: `Ciclo atual de ${currentState.avgCycleTime} dias é longo`,
      priority: 'high',
      quickWin: true, // AI copilots can accelerate development quickly
    });
  }

  // Topic 3: AI Adoption barriers - QUICK WIN
  if (currentState.aiToolsUsage === 'none' || currentState.aiToolsUsage === 'exploring') {
    topics.push({
      id: 'ai-barriers',
      label: 'Barreiras para adoção de AI/automation',
      reason: 'Uso de AI ainda é baixo',
      priority: 'high',
      quickWin: true, // Starting with AI tools is fast
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
  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  topics.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // Apply urgency filter based on timeline
  const isUrgent = goals.timeline === '3-months';
  const isShortTerm = goals.timeline === '6-months';

  let filteredTopics = topics;

  if (isUrgent) {
    // For urgent timelines (3 months), prioritize quick wins
    filteredTopics = topics.filter(t => t.quickWin === true);

    // Mark as urgent and update reason
    filteredTopics.forEach(t => {
      t.priority = 'urgent';
      t.reason += ' - Quick win para timeline de 3 meses';
      // Sanitize label for persona
      t.label = sanitizeLabelForPersona(t.label, persona);
    });

    // Return only top 3 for focus
    return filteredTopics.slice(0, 3);
  }

  if (isShortTerm) {
    // For 6-month timeline, prioritize quick wins but keep more topics
    const quickWins = topics.filter(t => t.quickWin === true);
    const others = topics.filter(t => !t.quickWin);

    // Quick wins first, then others
    filteredTopics = [...quickWins, ...others];

    // Update quick win reasons and sanitize labels
    quickWins.forEach(t => {
      t.reason += ' - Quick win para timeline de 6 meses';
      t.label = sanitizeLabelForPersona(t.label, persona);
    });

    // Sanitize labels for other topics too
    others.forEach(t => {
      t.label = sanitizeLabelForPersona(t.label, persona);
    });

    return filteredTopics.slice(0, 5);
  }

  // For longer timelines (12-18 months), show all topics
  // Sanitize all labels
  const finalTopics = topics.slice(0, 6);
  finalTopics.forEach(t => {
    t.label = sanitizeLabelForPersona(t.label, persona);
  });

  return finalTopics;
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
