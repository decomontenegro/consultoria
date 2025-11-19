/**
 * Business Quiz - LLM-based Diagnostic Generator
 *
 * Uses Claude Sonnet to generate comprehensive business health diagnostic
 */

import { callSonnet, trackLLMCost } from './llm-integration';
import {
  parseLLMResponseSafe,
  DiagnosticGenerationSchema,
  type DiagnosticGenerationResult,
} from './llm-parser';
import { AREA_METADATA } from './area-relationships';
import type {
  BusinessQuizContext,
  BusinessDiagnostic,
  BusinessArea,
  QuizAnswer,
} from './types';

// ============================================================================
// PROMPT TEMPLATES
// ============================================================================

const DIAGNOSTIC_GENERATION_SYSTEM_PROMPT = `Você é um consultor de negócios sênior especializado em diagnósticos empresariais holísticos.

Sua tarefa é analisar todas as respostas de um quiz de saúde empresarial (19 perguntas) e gerar um diagnóstico completo e acionável.

# Estrutura do Quiz:
1. **Contexto (7 perguntas)**: Informações básicas da empresa
2. **Expertise (4 perguntas)**: Detecção da área de expertise do usuário
3. **Deep-dive (5 perguntas)**: Aprofundamento na área de expertise
4. **Risk-scan (3 perguntas)**: Scan rápido de riscos em outras áreas

# Áreas de Negócio:
1. **marketing-growth**: Marketing, aquisição, CAC, LTV, funil
2. **sales-commercial**: Vendas, pipeline, CRM, conversão
3. **product**: Produto, roadmap, PMF, features
4. **operations-logistics**: Operações, processos, fulfillment
5. **financial**: Finanças, runway, burn rate, orçamento
6. **people-culture**: RH, cultura, turnover, contratação
7. **technology-data**: Tech, infraestrutura, dados, automação

# Sua Tarefa:
Gerar um diagnóstico que inclua:

## 1. Health Scores (para TODAS as 7 áreas):
- Score de 0-100 para cada área
- Status: critical (<50), attention (50-69), good (70-89), excellent (90+)
- Key metrics com valor, benchmark, e status (below/at/above)

## 2. Detected Patterns:
- Padrões problemáticos identificados (ex: "high-cac-low-retention")
- Evidências específicas das respostas
- Impacto: high/medium/low

## 3. Root Causes:
- Causas raiz dos principais problemas
- Áreas relacionadas afetadas
- Explicação detalhada

## 4. Recommendations (pelo menos 5):
- Recomendações priorizadas (critical/high/medium/low)
- Descrição acionável
- Impacto esperado
- Timeframe (ex: "30-60 days")
- Esforço: low/medium/high
- Dependências entre áreas

## 5. Roadmap (opcional, mas recomendado):
- Fases de 30-60-90 dias
- Áreas de foco em cada fase
- Ações-chave específicas

# Princípios:
1. **Seja Específico**: Use dados reais das respostas, não generalizações
2. **Seja Honesto**: Scores baixos quando apropriado, não seja otimista demais
3. **Seja Acionável**: Recomendações devem ser concretas e implementáveis
4. **Identifique Conexões**: Mostre como áreas se relacionam e influenciam
5. **Priorize**: Ordene por impacto vs esforço

# Output:
Retorne um JSON válido seguindo o schema exato. Seja detalhado mas conciso.`;

function buildDiagnosticPrompt(session: BusinessQuizContext): string {
  // Organize answers by block
  const contextAnswers = session.answers.filter((a) => a.block === 'context');
  const expertiseAnswers = session.answers.filter((a) => a.block === 'expertise');
  const deepDiveAnswers = session.answers.filter((a) => a.block === 'deep-dive');
  const riskScanAnswers = session.answers.filter((a) => a.block === 'risk-scan');

  // Build company context
  const companyData = session.extractedData?.company || {};
  const contextSection = `
## Contexto da Empresa:
${companyData.name ? `- Nome: ${companyData.name}` : ''}
${companyData.industry ? `- Indústria: ${companyData.industry}` : ''}
${companyData.stage ? `- Estágio: ${companyData.stage}` : ''}
${companyData.teamSize ? `- Tamanho do time: ${companyData.teamSize} pessoas` : ''}
${companyData.monthlyRevenue ? `- Receita mensal: ${companyData.monthlyRevenue}` : ''}
${companyData.yearFounded ? `- Ano de fundação: ${companyData.yearFounded}` : ''}
`.trim();

  // Build answers sections
  const formatAnswers = (answers: QuizAnswer[], title: string) => {
    return `
### ${title}
${answers
  .map(
    (a, i) => `
**Q${i + 1}**: ${a.questionText}
**Resposta**: ${a.answer}
**Área**: ${AREA_METADATA[a.area]?.name || a.area}
`
  )
  .join('\n')}`;
  };

  const answersSection = `
# Respostas do Quiz:

${formatAnswers(contextAnswers, '1. Bloco Contexto (7 perguntas)')}

${formatAnswers(expertiseAnswers, '2. Bloco Expertise (4 perguntas)')}

${session.detectedExpertise ? `\n**✅ Expertise Detectada**: ${AREA_METADATA[session.detectedExpertise].name} (confiança: ${Math.round((session.expertiseConfidence || 0) * 100)}%)\n` : ''}

${formatAnswers(deepDiveAnswers, '3. Bloco Deep-Dive (5 perguntas)')}

${formatAnswers(riskScanAnswers, '4. Bloco Risk-Scan (3 perguntas)')}
`;

  // Build extracted data summary
  const extractedData = session.extractedData;
  const dataSection = Object.keys(extractedData)
    .filter((key) => key !== 'company' && Object.keys(extractedData[key as keyof typeof extractedData] || {}).length > 0)
    .map((key) => {
      const areaData = extractedData[key as keyof typeof extractedData];
      return `
### ${key}:
${JSON.stringify(areaData, null, 2)}`;
    })
    .join('\n');

  const prompt = `${DIAGNOSTIC_GENERATION_SYSTEM_PROMPT}

# Tarefa:
Analise o quiz completo abaixo e gere um diagnóstico holístico de saúde empresarial.

${contextSection}

${answersSection}

${dataSection ? `\n# Dados Estruturados Extraídos:\n${dataSection}` : ''}

# Instruções Especiais:
- A área **${session.detectedExpertise ? AREA_METADATA[session.detectedExpertise].name : 'N/A'}** teve deep-dive, então você tem mais informações sobre ela
- As áreas **${session.riskScanAreas?.map((a) => AREA_METADATA[a].name).join(', ') || 'N/A'}** tiveram risk-scan
- Use as respostas para inferir scores para TODAS as 7 áreas (mesmo as não exploradas profundamente)
- Priorize recomendações que atacam root causes, não sintomas
- Considere o estágio da empresa ao sugerir ações

**Agora gere o diagnóstico em formato JSON:**`;

  return prompt;
}

// ============================================================================
// FALLBACK GENERATION
// ============================================================================

function generateFallbackDiagnostic(session: BusinessQuizContext): DiagnosticGenerationResult {
  console.warn('⚠️ [Diagnostic Generation] Using fallback basic diagnostic');

  // Generate basic scores based on answered areas
  const healthScores = [
    'marketing-growth',
    'sales-commercial',
    'product',
    'operations-logistics',
    'financial',
    'people-culture',
    'technology-data',
  ].map((area) => {
    const typedArea = area as BusinessArea;
    const isExpertiseArea = session.detectedExpertise === typedArea;
    const isRiskScanArea = session.riskScanAreas?.includes(typedArea);

    // Default score: 60-70 range
    let score = 65;

    // Expertise area: slightly higher (more data available)
    if (isExpertiseArea) {
      score = 70;
    }

    // Risk scan area: slightly lower (selected due to risk)
    if (isRiskScanArea) {
      score = 55;
    }

    const status =
      score < 50 ? 'critical' : score < 70 ? 'attention' : score < 90 ? 'good' : 'excellent';

    return {
      area: typedArea,
      score,
      status: status as 'critical' | 'attention' | 'good' | 'excellent',
      keyMetrics: [],
    };
  });

  return {
    healthScores,
    detectedPatterns: [
      {
        pattern: 'insufficient-data',
        evidence: ['Análise LLM falhou, usando diagnóstico básico'],
        impact: 'high',
      },
    ],
    rootCauses: [
      {
        issue: 'Diagnóstico gerado sem análise LLM completa',
        relatedAreas: ['marketing-growth', 'sales-commercial', 'product'],
        explanation:
          'O sistema não conseguiu gerar um diagnóstico completo. Recomenda-se revisar as respostas manualmente.',
      },
    ],
    recommendations: [
      {
        area: 'marketing-growth',
        priority: 'high',
        title: 'Realizar análise manual das respostas',
        description:
          'Como o diagnóstico automático falhou, recomendamos uma revisão manual das respostas com um consultor.',
        expectedImpact: 'Diagnóstico mais preciso e acionável',
        timeframe: '7 dias',
        effort: 'low',
      },
    ],
    roadmap: {
      phases: [
        {
          phase: '30-days',
          focus: [session.detectedExpertise || 'marketing-growth'],
          keyActions: ['Revisar respostas manualmente', 'Identificar quick wins'],
        },
        {
          phase: '60-days',
          focus: [session.detectedExpertise || 'marketing-growth'],
          keyActions: ['Implementar melhorias identificadas'],
        },
        {
          phase: '90-days',
          focus: [session.detectedExpertise || 'marketing-growth'],
          keyActions: ['Avaliar resultados e ajustar estratégia'],
        },
      ],
    },
  };
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Generate complete business diagnostic using Claude Sonnet
 *
 * @param session - Complete quiz session with all 19 answers
 * @returns Complete diagnostic with scores, patterns, recommendations, and roadmap
 */
export async function generateDiagnosticWithLLM(
  session: BusinessQuizContext
): Promise<BusinessDiagnostic> {
  try {
    console.log('📊 [Diagnostic Generation] Analyzing complete quiz with Claude Sonnet...');

    // Validate session has enough answers
    if (session.answers.length < 19) {
      console.warn(
        `⚠️ [Diagnostic Generation] Incomplete quiz: ${session.answers.length}/19 answers`
      );
    }

    // Build comprehensive prompt
    const prompt = buildDiagnosticPrompt(session);

    // Call Claude Sonnet (most capable model for complex analysis)
    const llmResponse = await callSonnet(prompt, 4096); // Large token limit for detailed output

    console.log(
      `✅ [Diagnostic Generation] LLM response received (${llmResponse.usage.outputTokens} tokens, R$${llmResponse.cost.toFixed(4)})`
    );

    // Parse response
    const diagnosticData = parseLLMResponseSafe(
      llmResponse.text,
      DiagnosticGenerationSchema,
      generateFallbackDiagnostic(session)
    );

    // Track cost
    trackLLMCost('sonnet', llmResponse.cost);

    // Calculate overall score
    const overallScore = Math.round(
      diagnosticData.healthScores.reduce((sum, item) => sum + item.score, 0) /
        diagnosticData.healthScores.length
    );

    // Generate diagnostic ID
    const diagnosticId = `diag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Build executive summary
    const executiveSummary = `
Diagnóstico gerado para ${session.extractedData?.company?.name || 'sua empresa'}.
Score geral: ${overallScore}/100.
Expertise detectada em ${session.detectedExpertise ? AREA_METADATA[session.detectedExpertise].name : 'N/A'}.
${diagnosticData.recommendations.length} recomendações priorizadas para os próximos 90 dias.
    `.trim();

    // Assemble complete diagnostic
    const diagnostic: BusinessDiagnostic = {
      id: diagnosticId,
      generatedAt: new Date(),
      assessmentData: session.extractedData,
      quizContext: session,
      healthScores: diagnosticData.healthScores,
      overallScore,
      executiveSummary,
      detectedPatterns: diagnosticData.detectedPatterns,
      rootCauses: diagnosticData.rootCauses,
      recommendations: diagnosticData.recommendations,
      roadmap: diagnosticData.roadmap,
    };

    console.log(`✅ [Diagnostic Generation] Diagnostic ${diagnosticId} generated successfully`);
    console.log(`📈 [Diagnostic Generation] Overall score: ${overallScore}/100`);
    console.log(
      `📝 [Diagnostic Generation] ${diagnosticData.recommendations.length} recommendations, ${diagnosticData.detectedPatterns.length} patterns`
    );

    return diagnostic;
  } catch (error) {
    console.error('❌ [Diagnostic Generation] LLM call failed:', error);
    console.log('🔄 [Diagnostic Generation] Falling back to basic diagnostic');

    // Generate fallback diagnostic
    const fallbackData = generateFallbackDiagnostic(session);
    const diagnosticId = `diag-fallback-${Date.now()}`;

    const overallScore = Math.round(
      fallbackData.healthScores.reduce((sum, item) => sum + item.score, 0) /
        fallbackData.healthScores.length
    );

    return {
      id: diagnosticId,
      generatedAt: new Date(),
      assessmentData: session.extractedData,
      quizContext: session,
      healthScores: fallbackData.healthScores,
      overallScore,
      executiveSummary:
        'Diagnóstico básico gerado devido a falha no sistema. Recomenda-se análise manual.',
      detectedPatterns: fallbackData.detectedPatterns,
      rootCauses: fallbackData.rootCauses,
      recommendations: fallbackData.recommendations,
      roadmap: fallbackData.roadmap,
    };
  }
}

/**
 * Validate diagnostic completeness
 */
export function validateDiagnostic(diagnostic: BusinessDiagnostic): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check health scores
  if (diagnostic.healthScores.length !== 7) {
    errors.push(`Expected 7 health scores, got ${diagnostic.healthScores.length}`);
  }

  // Check recommendations
  if (diagnostic.recommendations.length === 0) {
    errors.push('No recommendations provided');
  }

  // Check overall score
  if (diagnostic.overallScore < 0 || diagnostic.overallScore > 100) {
    errors.push(`Invalid overall score: ${diagnostic.overallScore}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
