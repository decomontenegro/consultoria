/**
 * AI Response Suggestions Engine
 *
 * Generates contextual response suggestions based on AI questions
 * to guide users and improve UX in conversational flows
 */

export interface ResponseSuggestion {
  text: string;
  category?: string;
  icon?: string;
}

/**
 * Question patterns and their corresponding suggestions
 */
const SUGGESTION_PATTERNS: Record<string, ResponseSuggestion[]> = {
  // Challenges and Pain Points
  'desafio|problema|dificuldade|pain point': [
    { text: 'Produtividade baixa da equipe' },
    { text: 'Time-to-market muito lento' },
    { text: 'Dificuldade em contratar talentos' },
    { text: 'Qualidade do código preocupante' },
    { text: 'Falta de inovação tecnológica' },
    { text: 'Custos operacionais altos' },
  ],

  // Company Size
  'tamanho|porte|empresa|equipe|quantos': [
    { text: '5-20 pessoas (Startup)' },
    { text: '21-100 pessoas (Scaleup)' },
    { text: '101-500 pessoas (Mid-market)' },
    { text: '500+ pessoas (Enterprise)' },
  ],

  // Industry
  'indústria|setor|área|ramo': [
    { text: 'Tecnologia / SaaS' },
    { text: 'Fintech / Serviços Financeiros' },
    { text: 'E-commerce / Varejo' },
    { text: 'Saúde / Healthcare' },
    { text: 'Educação / EdTech' },
    { text: 'Manufatura / Indústria' },
  ],

  // Goals
  'objetivo|meta|quer|alcançar|melhorar': [
    { text: 'Aumentar produtividade em 30%+' },
    { text: 'Acelerar time-to-market' },
    { text: 'Reduzir bugs e incidentes' },
    { text: 'Melhorar qualidade do código' },
    { text: 'Atrair e reter talentos' },
    { text: 'Reduzir custos operacionais' },
  ],

  // Timeline
  'prazo|timeline|quando|urgência|tempo': [
    { text: 'Urgente - próximos 3 meses' },
    { text: 'Curto prazo - 6 meses' },
    { text: 'Médio prazo - 12 meses' },
    { text: 'Longo prazo - 18+ meses' },
  ],

  // Budget
  'orçamento|budget|investimento|quanto': [
    { text: 'Até R$ 50k' },
    { text: 'R$ 50k - R$ 200k' },
    { text: 'R$ 200k - R$ 500k' },
    { text: 'R$ 500k+' },
    { text: 'Ainda não definido' },
  ],

  // AI Adoption
  'ia|ai|inteligência artificial|ferramentas|copilot': [
    { text: 'Não usamos IA ainda' },
    { text: 'Alguns devs testando' },
    { text: 'Piloto em andamento' },
    { text: 'Uso parcial em produção' },
    { text: 'Totalmente integrado' },
  ],

  // Team Experience
  'experiência|senioridade|time|desenvolvedores': [
    { text: 'Maioria júnior (0-2 anos)' },
    { text: 'Mix júnior/pleno' },
    { text: 'Maioria pleno (3-5 anos)' },
    { text: 'Time sênior (5+ anos)' },
    { text: 'Mix balanceado' },
  ],

  // Development Practices
  'práticas|metodologia|processo|desenvolvimento': [
    { text: 'Agile / Scrum' },
    { text: 'Kanban' },
    { text: 'DevOps / CI/CD' },
    { text: 'Waterfall tradicional' },
    { text: 'Processo informal' },
  ],

  // Tech Stack
  'stack|tecnologia|linguagem|framework': [
    { text: 'JavaScript / TypeScript' },
    { text: 'Python' },
    { text: 'Java / Kotlin' },
    { text: 'C# / .NET' },
    { text: 'Go / Rust' },
    { text: 'Múltiplas linguagens' },
  ],

  // Deployment Frequency
  'deploy|implantação|frequência|releases': [
    { text: 'Várias vezes por dia' },
    { text: 'Diariamente' },
    { text: 'Semanalmente' },
    { text: 'Quinzenalmente' },
    { text: 'Mensalmente ou menos' },
  ],

  // Yes/No confirmations
  'sim|não|confirma|concorda': [
    { text: 'Sim' },
    { text: 'Não' },
    { text: 'Parcialmente' },
    { text: 'Não tenho certeza' },
  ],

  // Metrics Tracking
  'métricas|kpi|medir|acompanhar': [
    { text: 'DORA metrics (deploy freq, lead time, MTTR, change failure)' },
    { text: 'Velocidade de sprint' },
    { text: 'Code coverage e qualidade' },
    { text: 'Bug rate e incidents' },
    { text: 'Developer satisfaction' },
    { text: 'Não medimos formalmente' },
  ],

  // Urgency Level
  'urgente|prioritário|crítico|importante': [
    { text: 'Extremamente urgente (semanas)' },
    { text: 'Alta prioridade (1-3 meses)' },
    { text: 'Prioridade média (3-6 meses)' },
    { text: 'Planejamento (6+ meses)' },
  ],
};

/**
 * Generate contextual response suggestions based on AI question
 */
export function generateSuggestions(aiQuestion: string): ResponseSuggestion[] {
  if (!aiQuestion) return [];

  const lowerQuestion = aiQuestion.toLowerCase();

  // Find matching pattern
  for (const [pattern, suggestions] of Object.entries(SUGGESTION_PATTERNS)) {
    const regex = new RegExp(pattern, 'i');
    if (regex.test(lowerQuestion)) {
      // Return first 4-5 suggestions (randomize a bit for variety)
      const shuffled = [...suggestions].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 4);
    }
  }

  // Default suggestions if no pattern matches
  return [
    { text: 'Conte-me mais...' },
    { text: 'Preciso de ajuda para responder' },
    { text: 'Pular esta pergunta' },
  ];
}

/**
 * Get suggestions for specific specialist types
 */
export function getSpecialistSuggestions(
  specialistType: 'engineering' | 'product' | 'operations' | 'strategy' | 'technical',
  question: string
): ResponseSuggestion[] {

  const contextualSuggestions = generateSuggestions(question);

  // Add specialist-specific context if no match found
  if (contextualSuggestions.length <= 3) {
    const specialistDefaults: Record<string, ResponseSuggestion[]> = {
      'engineering': [
        { text: 'Produtividade da equipe' },
        { text: 'Qualidade do código' },
        { text: 'Deploy e CI/CD' },
        { text: 'Tech debt' },
      ],
      'product': [
        { text: 'Time-to-market' },
        { text: 'Feature velocity' },
        { text: 'User feedback loop' },
        { text: 'Roadmap execution' },
      ],
      'operations': [
        { text: 'Automação de processos' },
        { text: 'Eficiência operacional' },
        { text: 'Custos e recursos' },
        { text: 'Escalabilidade' },
      ],
      'strategy': [
        { text: 'Competitividade no mercado' },
        { text: 'ROI e métricas' },
        { text: 'Transformação digital' },
        { text: 'Vantagem competitiva' },
      ],
      'technical': [
        { text: 'Arquitetura e escalabilidade' },
        { text: 'Performance e otimização' },
        { text: 'Segurança e compliance' },
        { text: 'Infraestrutura' },
      ],
    };

    return specialistDefaults[specialistType] || contextualSuggestions;
  }

  return contextualSuggestions;
}

/**
 * Get suggestions for Express Mode
 */
export function getExpressModeSuggestions(question: string, questionNumber: number): ResponseSuggestion[] {

  // Generate based on question content first
  const contentSuggestions = generateSuggestions(question);

  if (contentSuggestions.length > 3) {
    return contentSuggestions.slice(0, 4);
  }

  // Fallback based on question number
  const fallbacksByPhase: Record<number, ResponseSuggestion[]> = {
    1: [ // Usually about challenges
      { text: 'Produtividade' },
      { text: 'Qualidade' },
      { text: 'Velocidade' },
      { text: 'Custos' },
    ],
    2: [ // Usually about goals
      { text: 'Melhorar eficiência' },
      { text: 'Acelerar entregas' },
      { text: 'Reduzir bugs' },
      { text: 'Aumentar inovação' },
    ],
    3: [ // Usually about timeline
      { text: '3 meses' },
      { text: '6 meses' },
      { text: '12 meses' },
    ],
  };

  return fallbacksByPhase[Math.min(questionNumber, 3)] || contentSuggestions;
}

/**
 * Common quick responses for any AI interaction
 */
export const COMMON_QUICK_RESPONSES: ResponseSuggestion[] = [
  { text: 'Sim, exatamente' },
  { text: 'Não, diferente' },
  { text: 'Mais ou menos' },
  { text: 'Não sei responder' },
];
