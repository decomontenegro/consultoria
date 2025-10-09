import { AssessmentData } from '../types';

/**
 * Persona-specific question styles and focus areas
 */
const personaGuidance = {
  'board-executive': {
    focus: 'impacto estratégico, competitividade de mercado, ROI de alto nível, riscos ao negócio',
    questionStyle: 'estratégicas e de alto nível',
    examples: [
      'Como essa lentidão no desenvolvimento afeta sua posição competitiva no mercado?',
      'Qual o impacto financeiro estimado de perder oportunidades de mercado por lançar features atrasado?',
      'Seus competidores diretos estão investindo em AI/automation? Como isso afeta sua estratégia?',
    ],
    avoidJargon: 'débito técnico, deploy pipeline, code coverage, CI/CD',
    useInstead: 'tempo de lançamento de produtos, eficiência operacional, vantagem competitiva, retorno sobre investimento',
  },
  'finance-ops': {
    focus: 'eficiência operacional, redução de custos, ROI quantificável, métricas financeiras',
    questionStyle: 'focadas em números e eficiência',
    examples: [
      'Qual o custo atual estimado desses atrasos em termos de horas-homem desperdiçadas?',
      'Quantos recursos financeiros vocês gastam corrigindo problemas que poderiam ser evitados?',
      'Se conseguissem reduzir o ciclo de desenvolvimento pela metade, qual seria o impacto no P&L?',
    ],
    avoidJargon: 'merge conflicts, refactoring, technical debt',
    useInstead: 'custos operacionais, desperdício de recursos, eficiência de processos',
  },
  'product-business': {
    focus: 'time-to-market, capacidade de inovação, experiência do cliente, competitividade',
    questionStyle: 'focadas em produto e mercado',
    examples: [
      'Quais features importantes ficaram em espera porque o time não teve capacidade de desenvolver?',
      'Como o tempo lento de desenvolvimento afeta sua capacidade de responder a feedback de clientes?',
      'Seus competidores lançam features mais rápido? Isso já causou perda de clientes?',
    ],
    avoidJargon: 'CI/CD, code review, test coverage',
    useInstead: 'velocidade de lançamento, capacidade de inovar, resposta ao mercado',
  },
  'engineering-tech': {
    focus: 'detalhes técnicos, stack, arquitetura, práticas de desenvolvimento',
    questionStyle: 'técnicas e detalhadas',
    examples: [
      'Quais são os principais gargalos técnicos no dia a dia? (débito técnico, setup de ambiente, etc)',
      'Já tentaram implementar CI/CD ou outras automações? O que funcionou ou não?',
      'A arquitetura atual facilita ou dificulta a adoção de novas ferramentas?',
    ],
    avoidJargon: null, // Can use technical terms freely
    useInstead: null,
  },
  'it-devops': {
    focus: 'infraestrutura, automação, processos operacionais, confiabilidade',
    questionStyle: 'operacionais e de infraestrutura',
    examples: [
      'Qual porcentagem do tempo da equipe é gasta em tarefas operacionais vs desenvolvimento?',
      'Quais processos manuais causam mais fricção no dia a dia?',
      'Como é o processo de deploy atualmente? Quantas etapas manuais existem?',
    ],
    avoidJargon: 'product roadmap, market positioning',
    useInstead: 'processos automatizáveis, eficiência operacional, confiabilidade',
  },
};

/**
 * Generates system prompt for AI consultation based on assessment form data
 */
export function generateConsultationSystemPrompt(formData: AssessmentData): string {
  const { persona, companyInfo, currentState, goals } = formData;
  const personaInfo = personaGuidance[persona] || personaGuidance['engineering-tech'];

  return `Você é um consultor especialista em transformação digital e adoção de AI da CulturaBuilder.

# IMPORTANTE: PERFIL DO INTERLOCUTOR
Você está conversando com um **${getPersonaLabel(persona)}**.

## Como adaptar sua comunicação:
- **Foco principal:** ${personaInfo.focus}
- **Tipo de perguntas:** ${personaInfo.questionStyle}
${personaInfo.avoidJargon ? `- **EVITE jargão técnico como:** ${personaInfo.avoidJargon}` : ''}
${personaInfo.useInstead ? `- **USE termos como:** ${personaInfo.useInstead}` : ''}

## Exemplos de perguntas apropriadas para este perfil:
${personaInfo.examples.map((ex, i) => `${i + 1}. "${ex}"`).join('\n')}

# CONTEXTO DO USUÁRIO
O usuário acabou de completar um assessment inicial:

## Empresa
- Nome: ${companyInfo.name}
- Indústria: ${companyInfo.industry}
- Tamanho: ${companyInfo.size}
- Time de Dev: ${currentState.devTeamSize} desenvolvedores

## Estado Atual (traduzido para linguagem de negócio)
- Frequência de lançamentos: ${currentState.deploymentFrequency}
- Tempo médio de entrega: ${currentState.avgCycleTime} dias
- Adoção de ferramentas AI: ${currentState.aiToolsUsage}
- Desafios principais: ${currentState.painPoints.join(', ')}

## Objetivos
- Metas: ${goals.primaryGoals.join(', ')}
- Timeline: ${goals.timeline}
- Métricas de sucesso: ${goals.successMetrics.join(', ')}

# SUA MISSÃO
Fazer 3-5 perguntas de aprofundamento **adequadas ao nível de abstração deste perfil** para entender:
1. **Contexto e impacto real** - Como os desafios afetam o negócio/operação
2. **Barreiras e preocupações** - O que impede a mudança
3. **Oportunidades** - O que o formulário não capturou
4. **Prioridades** - O que realmente importa para esta pessoa

# REGRAS CRÍTICAS
✅ FAZER:
- Perguntas no nível de abstração correto para ${getPersonaLabel(persona)}
- Focar no impacto real (financeiro, competitivo, operacional)
- Usar linguagem de negócio, não jargão técnico (a menos que seja Engineering/IT persona)
- Explorar contradições e gaps

❌ NÃO FAZER:
- Perguntar detalhes técnicos demais para perfis não-técnicos
- Usar termos como "débito técnico", "merge conflicts", "CI/CD" com Board Members
- Mais de 5 perguntas
- Repetir o que já foi perguntado no formulário

# TOM
- Consultivo e respeitoso ao nível hierárquico
- Focado em entender impacto no negócio
- Pragmático e acionável

# FORMATO
- Uma pergunta por vez
- Máximo 2-3 parágrafos por resposta
- Reconheça a resposta anterior antes da próxima pergunta

Comece fazendo a primeira pergunta de aprofundamento agora, **adequada ao perfil ${getPersonaLabel(persona)}**.`;
}

/**
 * Helper to get persona label in Portuguese
 */
function getPersonaLabel(persona: string): string {
  const labels: Record<string, string> = {
    'board-executive': 'Executivo C-Level / Conselho',
    'finance-ops': 'Executivo de Finanças / Operações',
    'product-business': 'Líder de Produto / Negócios',
    'engineering-tech': 'Líder de Engenharia / Tecnologia',
    'it-devops': 'Gerente de TI / DevOps',
  };
  return labels[persona] || 'Executivo';
}

/**
 * Generates user-facing intro message for the consultation
 */
export function getConsultationIntro(formData: AssessmentData): string {
  const painPoints = formData.currentState.painPoints;
  const topPainPoint = painPoints[0] || 'desafios técnicos';

  return `Obrigado por completar o assessment inicial, ${formData.contactInfo.fullName}!

Notei que você mencionou **${topPainPoint}** como um dos principais desafios. Gostaria de fazer algumas perguntas para entender melhor o contexto da ${formData.companyInfo.name} e gerar recomendações mais personalizadas.

Serão apenas 3-5 perguntas rápidas. Vamos lá?`;
}

/**
 * List of intelligent follow-up questions based on common patterns
 */
export const intelligentFollowUps = {
  highBugRate: [
    "Quando vocês detectam um bug crítico em produção, qual o processo típico de resolução? Quanto tempo leva em média?",
    "Esses bugs estão concentrados em alguma área específica do código (legacy, novos features, integrações)?",
  ],
  slowDeployment: [
    "O que causa a maior parte do tempo entre commit e produção? É review manual, testes, aprovações?",
    "Já tentaram reduzir esse tempo antes? O que funcionou ou não funcionou?",
  ],
  lowAIUsage: [
    "O time já teve alguma experiência (positiva ou negativa) com AI coding tools como Copilot ou Cursor?",
    "Qual é a maior barreira para adoção: custo, segurança, resistência cultural, ou falta de conhecimento?",
  ],
  aggressiveTimeline: [
    "Com meta de ${timeline}, qual seria a maior vitória rápida que vocês precisam?",
    "Já existe alguma iniciativa de AI/automation em andamento ou seria greenfield?",
  ],
  qualityConcerns: [
    "Quando você pensa em 'melhorar qualidade', está mais preocupado com bugs, performance, ou dívida técnica?",
    "O time tem métricas claras de qualidade hoje (code coverage, technical debt ratio)?",
  ],
  talentRetention: [
    "A rotatividade é concentrada em algum nível de senioridade específico (ex: juniors saindo mais)?",
    "Desenvolvedores que saem mencionam ferramentas/práticas ultrapassadas como motivo?",
  ],
} as const;

/**
 * Generates contextual follow-up question based on assessment data
 */
export function selectIntelligentQuestion(formData: AssessmentData): string | null {
  const { currentState, goals } = formData;

  // High bug rate detected
  if (currentState.bugRate && currentState.bugRate > 10) {
    return intelligentFollowUps.highBugRate[0];
  }

  // Slow deployment
  if (currentState.deploymentFrequency.includes('monthly') || currentState.deploymentFrequency.includes('quarterly')) {
    return intelligentFollowUps.slowDeployment[0];
  }

  // Low AI usage
  if (currentState.aiToolsUsage === 'none' || currentState.aiToolsUsage === 'exploring') {
    return intelligentFollowUps.lowAIUsage[0];
  }

  // Aggressive timeline
  if (goals.timeline === '3-months' || goals.timeline === '6-months') {
    return intelligentFollowUps.aggressiveTimeline[0].replace('${timeline}', goals.timeline);
  }

  // Quality concerns in pain points
  if (currentState.painPoints.some(p => p.includes('qualidade') || p.includes('bugs'))) {
    return intelligentFollowUps.qualityConcerns[0];
  }

  // Talent retention concerns
  if (currentState.painPoints.some(p => p.includes('retenção') || p.includes('rotatividade'))) {
    return intelligentFollowUps.talentRetention[0];
  }

  return null;
}
