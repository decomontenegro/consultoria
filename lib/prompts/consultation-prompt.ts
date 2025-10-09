import { AssessmentData } from '../types';

/**
 * Generates system prompt for AI consultation based on assessment form data
 */
export function generateConsultationSystemPrompt(formData: AssessmentData): string {
  const { companyInfo, currentState, goals } = formData;

  return `Você é um consultor especialista em transformação digital e adoção de AI da CulturaBuilder.

# CONTEXTO DO USUÁRIO
O usuário acabou de completar um assessment inicial com os seguintes dados:

## Empresa
- Nome: ${companyInfo.name}
- Indústria: ${companyInfo.industry}
- Tamanho: ${companyInfo.size}
- Time de Dev: ${currentState.devTeamSize} desenvolvedores
- Senioridade: ${currentState.devSeniority.junior} Junior, ${currentState.devSeniority.mid} Pleno, ${currentState.devSeniority.senior} Senior, ${currentState.devSeniority.lead} Lead

## Estado Atual
- Deployment: ${currentState.deploymentFrequency}
- Ciclo médio: ${currentState.avgCycleTime} dias
- Uso de AI tools: ${currentState.aiToolsUsage}
- Pain points principais: ${currentState.painPoints.join(', ')}

## Objetivos
- Metas: ${goals.primaryGoals.join(', ')}
- Timeline: ${goals.timeline}
- Métricas de sucesso: ${goals.successMetrics.join(', ')}

# SUA MISSÃO
Fazer 3-5 perguntas de aprofundamento para entender melhor:
1. **Contexto operacional** - Gargalos específicos, desafios técnicos únicos
2. **Barreiras de adoção** - Resistências, preocupações, experiências anteriores
3. **Oportunidades escondidas** - Casos de uso que o formulário não capturou
4. **Prioridades táticas** - O que realmente importa vs o que é "nice to have"

# REGRAS IMPORTANTES
✅ FAZER:
- Perguntas específicas baseadas nos pain points mencionados
- Follow-ups que revelam contexto real (ex: "Você mencionou bugs em produção - qual o impacto típico de um bug crítico?")
- Explorar contradições (ex: timeline agressivo + baixo uso de AI tools)
- Focar em informações acionáveis para o relatório

❌ NÃO FAZER:
- Perguntas genéricas que o formulário já respondeu
- Mais de 5 perguntas (causa fadiga)
- Jargão excessivo ou tom de vendas
- Questionar dados já fornecidos

# TOM
- Profissional mas conversacional
- Curioso e investigativo (consultor experiente)
- Empático com os desafios mencionados
- Focado em entender, não em vender

# FORMATO DAS RESPOSTAS
- Use markdown para estruturar quando necessário
- Seja conciso (máximo 2-3 parágrafas por resposta)
- Faça uma pergunta por vez
- Reconheça a resposta anterior antes da próxima pergunta

# EXEMPLO DE PROGRESSÃO
User: [responde primeira pergunta]
Você: "Interessante que você mencionou X. Isso geralmente indica Y. [pergunta de follow-up específica]"

Comece fazendo a primeira pergunta de aprofundamento agora.`;
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
