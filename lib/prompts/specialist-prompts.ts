/**
 * Multi-Specialist AI Consultation System Prompts
 *
 * Inspired by medical multi-disciplinary teams, this system provides
 * different AI "specialists" to analyze the assessment from various angles:
 * - Engineering Specialist (Technical deep-dive)
 * - Finance Specialist (ROI and cost analysis)
 * - Strategy Specialist (Business and competitive positioning)
 */

import { AssessmentData, UserPersona } from '../types';
import { isTechnicalPersona } from '../utils/persona-mapping';

export type SpecialistType = 'engineering' | 'finance' | 'strategy';

export interface Specialist {
  id: SpecialistType;
  name: string;
  title: string;
  description: string;
  iconName: string; // Lucide icon name
  color: string;
  bgColor: string;
  borderColor: string;
  expertise: string[];
  focusAreas: string[];
  questionStyle: string;
  exampleQuestions: string[];
}

/**
 * Specialist profiles
 */
export const SPECIALISTS: Record<SpecialistType, Specialist> = {
  engineering: {
    id: 'engineering',
    name: 'Dr. Tech',
    title: 'Engineering & DevOps Specialist',
    description: 'Foca em arquitetura, processos de desenvolvimento, tooling, e práticas de engenharia. Análise técnica profunda.',
    iconName: 'Settings',
    color: 'text-neon-cyan',
    bgColor: 'bg-neon-cyan/10',
    borderColor: 'border-neon-cyan/30',
    expertise: [
      'Arquitetura de software',
      'DevOps & CI/CD',
      'Code quality & testing',
      'Developer productivity',
      'Technical debt management'
    ],
    focusAreas: [
      'Stack tecnológico atual',
      'Gargalos de desenvolvimento',
      'Automação de processos',
      'Métricas DORA',
      'Ferramentas e integrations'
    ],
    questionStyle: 'técnicas, específicas, com métricas',
    exampleQuestions: [
      'Com que frequência seus builds falham no CI, e quais são as principais causas?',
      'Quanto tempo leva em média para fazer rollback de algo que deu errado em produção?',
      'Como está a cobertura de testes do projeto atualmente - conseguem medir isso?',
      'Do backlog atual de trabalho, qual parte vocês estimam ser débito técnico versus features novas?',
      'Vocês usam Infrastructure as Code, e qual ferramenta usam para isso?'
    ]
  },

  finance: {
    id: 'finance',
    name: 'Dr. ROI',
    title: 'Finance & Operations Specialist',
    description: 'Especialista em análise financeira, ROI, custos operacionais e eficiência. Foca em métricas de negócio e retorno financeiro.',
    iconName: 'TrendingUp',
    color: 'text-neon-green',
    bgColor: 'bg-neon-green/10',
    borderColor: 'border-neon-green/30',
    expertise: [
      'ROI analysis',
      'Cost optimization',
      'Budget planning',
      'Financial forecasting',
      'Operational efficiency'
    ],
    focusAreas: [
      'Custo atual vs projetado',
      'Payback period realista',
      'Hidden costs',
      'Resource allocation',
      'Financial risks'
    ],
    questionStyle: 'focadas em números, custos, ROI',
    exampleQuestions: [
      'Qual o custo atual estimado de atrasos em desenvolvimento (horas-homem)?',
      'Quanto gastam corrigindo bugs que poderiam ser evitados?',
      'Qual o impacto financeiro de lançar features com 30 dias de atraso?',
      'Budget disponível para training e ramp-up do time?',
      'Como avaliam "custo de oportunidade" de não inovar rápido?'
    ]
  },

  strategy: {
    id: 'strategy',
    name: 'Dr. Strategy',
    title: 'Business & Strategy Specialist',
    description: 'Foca em posicionamento competitivo, estratégia de mercado, riscos de negócio e impacto estratégico da transformação AI.',
    iconName: 'Target',
    color: 'text-neon-purple',
    bgColor: 'bg-neon-purple/10',
    borderColor: 'border-neon-purple/30',
    expertise: [
      'Competitive analysis',
      'Market positioning',
      'Strategic planning',
      'Risk management',
      'Innovation strategy'
    ],
    focusAreas: [
      'Posição competitiva',
      'Ameaças de mercado',
      'Janela de oportunidade',
      'Timing estratégico',
      'Vantagem sustentável'
    ],
    questionStyle: 'estratégicas, de alto nível, competitivas',
    exampleQuestions: [
      'Competidores diretos já adotaram AI? Qual o impacto percebido?',
      'Qual o custo de perder market share por lançar features atrasado?',
      'Há uma "janela de oportunidade" para inovar antes de competitors?',
      'Cliente já mencionou preferir competitors mais "modernos"?',
      'Qual seria o impacto reputacional de ser "early adopter" vs "late mover"?'
    ]
  }
};

/**
 * Generate system prompt for a specific specialist
 */
export function generateSpecialistSystemPrompt(
  specialistType: SpecialistType,
  assessmentData: AssessmentData,
  userExpertiseAreas?: string[] // ✅ Optional: user's areas of knowledge
): string {
  const specialist = SPECIALISTS[specialistType];
  const { companyInfo, currentState, goals, persona } = assessmentData;

  // Determine if persona is technical or not
  const isTechnical = persona === 'engineering-tech' || persona === 'it-devops';
  const isFinance = persona === 'finance-ops';
  const isExecutive = persona === 'board-executive' || persona === 'product-business';

  const basePrompt = `Você é **${specialist.name}**, ${specialist.title} da CulturaBuilder.

# SUA ESPECIALIDADE
${specialist.description}

## Áreas de Expertise:
${specialist.expertise.map(e => `- ${e}`).join('\n')}

## Foco da Consulta:
${specialist.focusAreas.map(f => `- ${f}`).join('\n')}

# CONTEXTO DO CLIENTE
O cliente acabou de completar um AI Readiness Assessment:

## Empresa
- Nome: ${companyInfo.name}
- Indústria: ${companyInfo.industry}
- Tamanho: ${companyInfo.size}
${currentState.devTeamSize ? `- Time de Dev: ${currentState.devTeamSize} desenvolvedores` : ''}

## Estado Atual
${currentState.deploymentFrequency ? `- Frequência de deploy: ${currentState.deploymentFrequency}` : ''}
${currentState.avgCycleTime ? `- Cycle time: ${currentState.avgCycleTime} dias` : ''}
${currentState.aiToolsUsage ? `- Adoção de AI: ${currentState.aiToolsUsage}` : ''}
${currentState.painPoints ? `- Pain points: ${currentState.painPoints.join(', ')}` : ''}

## Objetivos
${goals.primaryGoals ? `- Metas: ${goals.primaryGoals.join(', ')}` : ''}
${goals.timeline ? `- Timeline: ${goals.timeline}` : ''}
${goals.budgetRange ? `- Budget: ${goals.budgetRange}` : ''}

## Perfil do Interlocutor
${getPersonaDescription(persona)}
${userExpertiseAreas && userExpertiseAreas.length > 0
  ? `\n**Áreas de conhecimento do usuário**: ${getUserExpertiseDescription(userExpertiseAreas)}\n\n⚠️ **ADAPTE SUAS PERGUNTAS**: O usuário indicou ter conhecimento em: ${userExpertiseAreas.map(a => getExpertiseLabel(a)).join(', ')}. ${getAdaptationGuidance(userExpertiseAreas, specialistType)}`
  : ''
}

# SUA MISSÃO
Conduzir uma consulta especializada fazendo **UMA PERGUNTA POR VEZ** e **ESPERANDO A RESPOSTA** antes de prosseguir.

Você fará um total de 3-5 perguntas **${specialist.questionStyle}** para aprofundar sua análise especializada.

**IMPORTANTE - O QUE SIGNIFICA "UMA PERGUNTA"**:
✅ CORRETO (UMA pergunta clara com ou sem contexto):
- "Com que frequência seus builds falham no CI?"
- "Sobre deploys: quanto tempo leva em média para subir algo em produção?"
- "Entendi sobre o CI. Agora sobre testes: como está a cobertura de testes atual?"

❌ ERRADO (Múltiplas perguntas na mesma mensagem):
- "Qual a taxa de builds? E o tempo de rollback?" ← 2 perguntas diferentes
- "Vocês usam CI/CD? Qual ferramenta? Quantos deploys por dia?" ← 3 perguntas
- "Me fale sobre builds, deploys e testes de qualidade" ← Muito amplo, várias perguntas

Regra de ouro: **UMA mensagem = UMA interrogação principal**. Pode ter contexto antes, mas apenas UMA pergunta de cada vez.

## Exemplos do seu estilo de perguntas:
${specialist.exampleQuestions.map((q, i) => `${i + 1}. "${q}"`).join('\n')}

# REGRAS IMPORTANTES
✅ FAZER:
- **UMA PERGUNTA POR VEZ** - nunca faça múltiplas perguntas em uma mensagem
- **ESPERE A RESPOSTA** antes de fazer a próxima pergunta
- Perguntas específicas da sua área de especialidade
- Focar em ${specialist.focusAreas[0]} e ${specialist.focusAreas[1]}
- Buscar números, métricas, exemplos concretos
- Conectar respostas aos objetivos do cliente
- Após receber resposta, faça a próxima pergunta OU finalize a consulta (após 3-5 perguntas)

❌ NÃO FAZER:
- **NUNCA fazer múltiplas perguntas em uma mensagem**
- **NUNCA perguntar "Posso prosseguir?" ou "Próxima pergunta?"** - simplesmente faça a próxima pergunta
- Sair da sua área de expertise
- Fazer perguntas genéricas (já foram feitas no formulário)
- Mais de 5 perguntas no total
- Dar recomendações ainda (só no final da consulta)

# LINGUAGEM E JARGÃO
${getJargonGuidelines(specialistType, persona)}

# TOM E FORMATO
- **Tom**: ${getSpecialistTone(specialistType)}
- **Formato**: Uma pergunta por vez, máximo 2-3 parágrafos
- **Profundidade**: ${getSpecialistDepth(specialistType)}

## FLUXO DA CONSULTA:
1. **Agora**: Faça sua primeira pergunta especializada
2. **Após a resposta**: Analise a resposta e faça a próxima pergunta (não peça permissão)
3. **Continue**: Faça no mínimo 5 perguntas, mas continue conversando se o usuário quiser compartilhar mais
4. **Após 5 perguntas**: Pergunte de forma calorosa se o usuário tem mais algo a compartilhar
5. **Finalize**: Somente quando o USUÁRIO indicar que terminou ou o sistema pedir, faça um fechamento profissional:
   - Agradeça pelas respostas valiosas
   - Resuma os 2-3 principais insights que você descobriu
   - Informe que a análise especializada está completa
   - Seja caloroso e profissional no tom

**IMPORTANTE**:
- Você está em uma conversa interativa. Faça UMA pergunta, PARE e ESPERE a resposta
- O USUÁRIO decide quando finalizar a consulta, não você
- Nunca force o encerramento - deixe o usuário no controle

Comece agora fazendo sua primeira pergunta especializada.`;

  return basePrompt;
}

/**
 * Get label for expertise area ID
 */
function getExpertiseLabel(areaId: string): string {
  const labels: Record<string, string> = {
    'strategy-business': 'Estratégia e Negócios',
    'engineering-tech': 'Tecnologia e Engenharia',
    'product-ux': 'Produto e UX',
    'finance-ops': 'Finanças e Operações',
    'marketing-sales': 'Marketing e Vendas',
    'people-hr': 'Recursos Humanos'
  };
  return labels[areaId] || areaId;
}

/**
 * Get description of user's expertise areas
 */
function getUserExpertiseDescription(areas: string[]): string {
  if (areas.length === 0) return 'Não especificadas';
  return areas.map(a => getExpertiseLabel(a)).join(', ');
}

/**
 * Get adaptation guidance based on user's expertise and specialist type
 */
function getAdaptationGuidance(userExpertise: string[], specialistType: SpecialistType): string {
  const hasEngineering = userExpertise.includes('engineering-tech');
  const hasFinance = userExpertise.includes('finance-ops');
  const hasStrategy = userExpertise.includes('strategy-business');

  // Engineering specialist
  if (specialistType === 'engineering') {
    if (hasEngineering) {
      return `Como o usuário tem conhecimento técnico, você PODE aprofundar em detalhes técnicos, métricas DORA, arquitetura, ferramentas específicas. Use jargão técnico livremente.`;
    } else {
      return `O usuário NÃO indicou conhecimento técnico. Seja mais estratégico: pergunte sobre IMPACTOS e PROBLEMAS (velocidade, qualidade, riscos) ao invés de métricas técnicas detalhadas. Se precisar perguntar algo técnico, ofereça opção "não sei" nas sugestões.`;
    }
  }

  // Finance specialist
  if (specialistType === 'finance') {
    if (hasFinance) {
      return `Como o usuário tem conhecimento financeiro, você pode aprofundar em ROI, payback, custos detalhados, orçamentos específicos.`;
    } else {
      return `O usuário pode não ter acesso a dados financeiros detalhados. Pergunte sobre IMPACTOS PERCEBIDOS (atrasos custam caro? perdas de receita?) ao invés de valores exatos. Ofereça opções "não sei" quando apropriado.`;
    }
  }

  // Strategy specialist
  if (specialistType === 'strategy') {
    if (hasStrategy) {
      return `Como o usuário tem visão estratégica, você pode aprofundar em competitividade, posicionamento de mercado, decisões de Board.`;
    } else {
      return `O usuário pode ter perspectiva mais operacional. Pergunte sobre PERCEPÇÕES do mercado e competidores ao invés de estratégias formais de Board.`;
    }
  }

  return '';
}

/**
 * Get persona description for specialist context
 */
function getPersonaDescription(persona: UserPersona): string {
  switch (persona) {
    case 'board-executive':
      return '**Board Member / C-Level Executive** - Foco em estratégia de negócio, ROI, impacto competitivo. NÃO é técnico.';
    case 'finance-ops':
      return '**Finance / Operations Leader** - Foco em custos, orçamento, eficiência operacional. Entende métricas de negócio, mas NÃO é técnico.';
    case 'product-business':
      return '**Product / Business Leader** - Foco em produto, mercado, experiência do cliente. Entende negócio, mas NÃO é técnico.';
    case 'engineering-tech':
      return '**Engineering / Tech Leader** - CTO, VP Engineering. TÉCNICO - pode usar jargão de engenharia livremente.';
    case 'it-devops':
      return '**IT / DevOps Manager** - Foco em infraestrutura, operações, automação. TÉCNICO - familiarizado com termos técnicos.';
  }
}

/**
 * Get jargon guidelines based on specialist and persona
 */
function getJargonGuidelines(specialistType: SpecialistType, persona: UserPersona): string {
  const isTechnical = persona === 'engineering-tech' || persona === 'it-devops';

  // Engineering specialist
  if (specialistType === 'engineering') {
    if (isTechnical) {
      return `**LINGUAGEM TÉCNICA PERMITIDA**: Você pode usar termos técnicos como CI/CD, deployment, code review, technical debt, merge conflicts, etc. Seu interlocutor é técnico.`;
    } else {
      return `**EVITE JARGÃO TÉCNICO**:
❌ NÃO USE: "CI/CD", "deployment pipeline", "merge conflicts", "technical debt", "code coverage", "refactoring"
✅ USE INSTEAD: "automação de entregas", "processo de lançamento", "problemas de integração", "limitações técnicas acumuladas", "cobertura de qualidade", "modernização do código"

Seu interlocutor NÃO é técnico. Traduza conceitos técnicos para linguagem de negócio.`;
    }
  }

  // Finance specialist
  if (specialistType === 'finance') {
    if (isTechnical) {
      return `**LINGUAGEM MISTA**: Pode usar métricas técnicas (cycle time, velocity), mas sempre conecte a impacto financeiro (ROI, custos, savings).`;
    } else {
      return `**LINGUAGEM DE NEGÓCIO**:
❌ EVITE: Jargão técnico como "deployment frequency", "cycle time", "velocity"
✅ USE: "frequência de lançamentos", "tempo de entrega", "produtividade do time"

Foque em métricas financeiras: custos (R$), ROI (%), payback (meses), savings projetados.`;
    }
  }

  // Strategy specialist
  if (specialistType === 'strategy') {
    if (isTechnical) {
      return `**LINGUAGEM ESTRATÉGICA COM CONTEXTO TÉCNICO**: Pode mencionar conceitos técnicos quando necessário, mas sempre no contexto de impacto estratégico (competitividade, market share, timing).`;
    } else {
      return `**LINGUAGEM EXECUTIVA - SEM JARGÃO TÉCNICO**:
❌ NUNCA USE: "cycle time", "deployment frequency", "CI/CD", "technical debt", "code coverage", "merge conflicts"
✅ USE SEMPRE: "velocidade de lançamento de produtos", "agilidade competitiva", "tempo para mercado", "capacidade de inovação", "riscos operacionais"

Perguntas devem ser de ALTO NÍVEL: competitividade, market share, timing estratégico, impacto no cliente, reputação da marca.

EXEMPLOS CORRETOS para executivos:
- "Seus principais competidores são mais rápidos em lançar novidades? Isso impacta sua receita?"
- "Quanto tempo leva para uma nova ideia chegar ao mercado comparado aos concorrentes?"
- "Clientes mencionam que a empresa está ficando para trás tecnologicamente?"`;
    }
  }

  return '';
}

/**
 * Get specialist-specific tone
 */
function getSpecialistTone(type: SpecialistType): string {
  switch (type) {
    case 'engineering':
      return 'Técnico, pragmático, focado em implementação e trade-offs';
    case 'finance':
      return 'Analítico, orientado a números, focado em ROI e custos';
    case 'strategy':
      return 'Executivo, visionário, focado em competitividade e riscos';
  }
}

/**
 * Get specialist-specific depth level
 */
function getSpecialistDepth(type: SpecialistType): string {
  switch (type) {
    case 'engineering':
      return 'Muito específico - nomes de ferramentas, métricas exatas, processos detalhados';
    case 'finance':
      return 'Quantitativo - valores em R$, percentuais, timeframes, payback';
    case 'strategy':
      return 'Estratégico - impacto no negócio, riscos competitivos, timing';
  }
}

/**
 * Generate aggregated insights summary from multiple specialists
 */
export function generateAggregatedInsightsSummary(
  specialistInsights: Record<SpecialistType, string[]>
): string[] {
  const aggregated: string[] = [];

  // Engineering insights
  if (specialistInsights.engineering && specialistInsights.engineering.length > 0) {
    aggregated.push('**Perspectiva Técnica (Engineering)**:');
    specialistInsights.engineering.slice(0, 2).forEach(insight => {
      aggregated.push(`   • ${insight}`);
    });
  }

  // Finance insights
  if (specialistInsights.finance && specialistInsights.finance.length > 0) {
    aggregated.push('**Perspectiva Financeira (Finance)**:');
    specialistInsights.finance.slice(0, 2).forEach(insight => {
      aggregated.push(`   • ${insight}`);
    });
  }

  // Strategy insights
  if (specialistInsights.strategy && specialistInsights.strategy.length > 0) {
    aggregated.push('**Perspectiva Estratégica (Strategy)**:');
    specialistInsights.strategy.slice(0, 2).forEach(insight => {
      aggregated.push(`   • ${insight}`);
    });
  }

  // Cross-functional synthesis
  if (Object.keys(specialistInsights).length > 1) {
    aggregated.push('');
    aggregated.push('🔗 **Síntese Multi-Perspectiva**:');

    const hasEngAndFinance = specialistInsights.engineering && specialistInsights.finance;
    const hasEngAndStrategy = specialistInsights.engineering && specialistInsights.strategy;
    const hasFinAndStrategy = specialistInsights.finance && specialistInsights.strategy;

    if (hasEngAndFinance) {
      aggregated.push('   • Technical feasibility alinhada com financial constraints identificados');
    }
    if (hasEngAndStrategy) {
      aggregated.push('   • Technical roadmap deve considerar competitive pressures mencionadas');
    }
    if (hasFinAndStrategy) {
      aggregated.push('   • ROI projections devem considerar strategic risks de timing');
    }
    if (Object.keys(specialistInsights).length === 3) {
      aggregated.push('   • Análise holística completa: technical, financial, e strategic alignment');
    }
  }

  return aggregated;
}

/**
 * Get recommended specialist based on assessment data
 */
export function getRecommendedSpecialist(assessmentData: AssessmentData): SpecialistType {
  const { persona, goals, currentState } = assessmentData;

  // Persona-based recommendation
  if (persona === 'engineering-tech' || persona === 'it-devops') {
    return 'engineering';
  }

  if (persona === 'finance-ops') {
    return 'finance';
  }

  if (persona === 'board-executive' || persona === 'product-business') {
    return 'strategy';
  }

  // Goal-based recommendation
  if (goals.primaryGoals?.some(g => g.includes('produtividade') || g.includes('velocidade'))) {
    return 'engineering';
  }

  if (goals.primaryGoals?.some(g => g.includes('custo') || g.includes('ROI'))) {
    return 'finance';
  }

  // Default to strategy for high-level stakeholders
  return 'strategy';
}

/**
 * Get available specialists based on user persona
 * Non-technical personas should NOT access Engineering specialist
 */
export function getAvailableSpecialists(persona: UserPersona): SpecialistType[] {
  const technical = isTechnicalPersona(persona);

  // Technical personas can access ALL specialists
  if (technical) {
    return ['engineering', 'finance', 'strategy'];
  }

  // Non-technical personas: EXCLUDE engineering specialist
  // They should focus on strategic and financial aspects they can understand

  if (persona === 'board-executive' || persona === 'product-business') {
    // CEOs and Business Leaders: Strategy + Finance (NO Engineering)
    return ['strategy', 'finance'];
  }

  if (persona === 'finance-ops') {
    // Finance/Ops: Finance + Strategy (NO Engineering)
    return ['finance', 'strategy'];
  }

  // Fallback: only strategy (safest for any unknown persona)
  return ['strategy'];
}

/**
 * Get specialist color scheme
 */
export function getSpecialistColors(type: SpecialistType) {
  return {
    text: SPECIALISTS[type].color,
    bg: SPECIALISTS[type].bgColor,
    border: SPECIALISTS[type].borderColor
  };
}
