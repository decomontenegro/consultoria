/**
 * Business Quiz - LLM-based Risk Area Selection
 *
 * Uses Claude Haiku to intelligently select 3 risk areas for scanning
 * based on expertise area and deep-dive answers
 */

import { callHaiku, trackLLMCost } from './llm-integration';
import {
  parseLLMResponseSafe,
  RiskAreaSelectionSchema,
  type RiskAreaSelectionResult,
} from './llm-parser';
import {
  suggestRiskScanAreas,
  getAreasOrderedByCriticality,
  AREA_METADATA,
} from './area-relationships';
import type { QuizAnswer, BusinessArea, BusinessQuizContext } from './types';

// ============================================================================
// PROMPT TEMPLATES
// ============================================================================

const RISK_AREA_SELECTION_SYSTEM_PROMPT = `Você é um consultor de negócios especializado em identificar riscos empresariais.

Sua tarefa é analisar as respostas do deep-dive de um usuário e selecionar EXATAMENTE 3 áreas para fazer um scan rápido de riscos.

# Áreas de Negócio:
1. **marketing-growth**: Marketing, aquisição, CAC, LTV, funil
2. **sales-commercial**: Vendas, pipeline, CRM, conversão comercial
3. **product**: Produto, roadmap, PMF, features, desenvolvimento
4. **operations-logistics**: Operações, processos, fulfillment, logística
5. **financial**: Finanças, runway, burn rate, orçamento, cash flow
6. **people-culture**: RH, cultura, turnover, contratação, engajamento
7. **technology-data**: Tech, infraestrutura, dados, automação, engineering

# Critérios de Seleção:
1. **Dependências Críticas**: Áreas que têm impacto direto na área de expertise
2. **Riscos Mencionados**: Sinais de problemas nas respostas do deep-dive
3. **Estágio da Empresa**: Áreas mais críticas para o estágio atual
4. **Diversidade**: Selecionar áreas de diferentes categorias quando possível

# Regras:
- Retorne EXATAMENTE 3 áreas
- NÃO inclua a área de expertise do usuário (já foi explorada no deep-dive)
- Priorize áreas com SINAIS DE RISCO nas respostas
- Use a matriz de relacionamentos como guia, mas ajuste baseado nos dados reais
- Seja estratégico: foque em áreas que podem ser "gargalos ocultos"

# Output Esperado:
Retorne um JSON com:
- selectedAreas: Array com EXATAMENTE 3 áreas (string enum)
- reasoning: Explicação de 2-3 frases sobre por que essas áreas foram escolhidas`;

function buildRiskSelectionPrompt(
  expertiseArea: BusinessArea,
  deepDiveAnswers: QuizAnswer[],
  context: Partial<BusinessQuizContext>
): string {
  // Get suggested areas from matrix
  const matrixSuggestions = getAreasOrderedByCriticality(expertiseArea);
  const topMatrixAreas = matrixSuggestions.slice(0, 5);

  // Build context summary
  const contextSummary = `
## Contexto da Empresa:
${context.extractedData?.company?.name ? `- Nome: ${context.extractedData.company.name}` : ''}
${context.extractedData?.company?.stage ? `- Estágio: ${context.extractedData.company.stage}` : ''}
${context.extractedData?.company?.teamSize ? `- Tamanho do time: ${context.extractedData.company.teamSize} pessoas` : ''}
`.trim();

  // Build deep-dive answers section
  const deepDiveSection = deepDiveAnswers
    .map((answer, i) => {
      return `
### Pergunta ${i + 1}: ${answer.questionText}
**Resposta:**
${answer.answer}
`;
    })
    .join('\n');

  // Build matrix suggestions
  const matrixSection = topMatrixAreas
    .map((item) => {
      return `- **${AREA_METADATA[item.area].name}** (score: ${item.score.toFixed(2)}, tipo: ${item.relationship})`;
    })
    .join('\n');

  const prompt = `${RISK_AREA_SELECTION_SYSTEM_PROMPT}

# Tarefa:
Selecione 3 áreas para scan de riscos baseado nas informações abaixo.

${contextSummary}

## Área de Expertise Detectada:
**${AREA_METADATA[expertiseArea].name}** (${expertiseArea})

Esta área já foi explorada no deep-dive. Não a selecione novamente.

## Respostas do Deep-Dive (${AREA_METADATA[expertiseArea].name}):
${deepDiveSection}

## Sugestões da Matriz de Relacionamentos:
${matrixSection}

# Análise:
Analise as respostas do deep-dive em busca de:
1. Problemas mencionados em outras áreas
2. Dependências ou blockers citados
3. Áreas que o usuário não tem controle/visibilidade
4. Gargalos que podem afetar o crescimento

Selecione 3 áreas mais críticas para escanear riscos.

**Retorne apenas o JSON, sem texto adicional:**`;

  return prompt;
}

// ============================================================================
// FALLBACK SELECTION (usado se LLM falhar)
// ============================================================================

function fallbackRiskSelection(
  expertiseArea: BusinessArea,
  deepDiveAnswers: QuizAnswer[]
): RiskAreaSelectionResult {
  console.warn('⚠️ [Risk Selection] Using fallback matrix-based selection');

  // Use matrix-based suggestion as fallback
  const suggested = suggestRiskScanAreas(expertiseArea, 3);

  return {
    selectedAreas: suggested,
    reasoning:
      'Seleção baseada na matriz de relacionamentos (LLM falhou). Priorizadas áreas com dependências críticas.',
  };
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Select risk scan areas using Claude Haiku
 *
 * @param expertiseArea - The detected expertise area (will be excluded)
 * @param deepDiveAnswers - Answers from the deep-dive block
 * @param context - Quiz context with company info
 * @returns Risk area selection with 3 areas and reasoning
 */
export async function selectRiskAreasWithLLM(
  expertiseArea: BusinessArea,
  deepDiveAnswers: QuizAnswer[],
  context: Partial<BusinessQuizContext>
): Promise<RiskAreaSelectionResult> {
  try {
    console.log('🎯 [Risk Selection] Analyzing deep-dive answers with Claude Haiku...');

    // Build prompt
    const prompt = buildRiskSelectionPrompt(expertiseArea, deepDiveAnswers, context);

    // Call Claude Haiku (fast & cheap for this task)
    const llmResponse = await callHaiku(prompt, 512);

    console.log(
      `✅ [Risk Selection] LLM response received (${llmResponse.usage.outputTokens} tokens, R$${llmResponse.cost.toFixed(4)})`
    );

    // Parse response
    const result = parseLLMResponseSafe(
      llmResponse.text,
      RiskAreaSelectionSchema,
      fallbackRiskSelection(expertiseArea, deepDiveAnswers)
    );

    // Validate: ensure exactly 3 areas and none is the expertise area
    if (result.selectedAreas.length !== 3) {
      console.warn(
        `⚠️ [Risk Selection] LLM returned ${result.selectedAreas.length} areas instead of 3, using fallback`
      );
      return fallbackRiskSelection(expertiseArea, deepDiveAnswers);
    }

    if (result.selectedAreas.includes(expertiseArea)) {
      console.warn(
        `⚠️ [Risk Selection] LLM included expertise area ${expertiseArea}, using fallback`
      );
      return fallbackRiskSelection(expertiseArea, deepDiveAnswers);
    }

    // Track cost
    trackLLMCost('haiku', llmResponse.cost);

    console.log(`🎯 [Risk Selection] Selected areas: ${result.selectedAreas.join(', ')}`);
    console.log(`📝 [Risk Selection] Reasoning: ${result.reasoning}`);

    return result;
  } catch (error) {
    console.error('❌ [Risk Selection] LLM call failed:', error);
    console.log('🔄 [Risk Selection] Falling back to matrix-based selection');

    // Use fallback on error
    return fallbackRiskSelection(expertiseArea, deepDiveAnswers);
  }
}

/**
 * Enhanced risk selection that considers keyword signals in deep-dive answers
 * Used as smarter fallback if needed
 */
export function selectRiskAreasWithKeywordAnalysis(
  expertiseArea: BusinessArea,
  deepDiveAnswers: QuizAnswer[]
): RiskAreaSelectionResult {
  console.log('🔍 [Risk Selection] Using keyword analysis fallback...');

  // Get matrix suggestions as baseline
  const matrixSuggestions = getAreasOrderedByCriticality(expertiseArea);

  // Analyze deep-dive answers for mentions of other areas
  const answerText = deepDiveAnswers.map((a) => a.answer.toLowerCase()).join(' ');

  // Area keywords (signals that area might be a risk)
  const riskKeywords: Record<BusinessArea, string[]> = {
    'marketing-growth': ['leads', 'tráfego', 'conversão', 'aquisição', 'cac alto', 'growth'],
    'sales-commercial': ['vendas', 'pipeline', 'fechamento', 'churn', 'retenção'],
    'product': ['produto', 'feature', 'desenvolvimento lento', 'tech debt', 'bugs'],
    'operations-logistics': [
      'entrega',
      'fulfillment',
      'processos manuais',
      'operacional',
      'gargalo',
    ],
    'financial': ['caixa', 'runway', 'budget', 'custo', 'margem', 'financeiro'],
    'people-culture': ['time', 'contratação', 'turnover', 'cultura', 'talento'],
    'technology-data': ['tech', 'infraestrutura', 'automação', 'dados', 'sistema'],
  };

  // Score each area based on mentions + matrix score
  const scores: Record<BusinessArea, number> = {
    'marketing-growth': 0,
    'sales-commercial': 0,
    'product': 0,
    'operations-logistics': 0,
    'financial': 0,
    'people-culture': 0,
    'technology-data': 0,
  };

  // Add matrix scores
  matrixSuggestions.forEach((item) => {
    scores[item.area] = item.score * 10; // Base score from matrix
  });

  // Add keyword match scores
  Object.entries(riskKeywords).forEach(([area, keywords]) => {
    if (area === expertiseArea) return; // Skip expertise area

    keywords.forEach((keyword) => {
      if (answerText.includes(keyword)) {
        scores[area as BusinessArea] += 3; // Keyword mention adds significant weight
      }
    });
  });

  // Sort by score and take top 3 (excluding expertise area)
  const sortedAreas = Object.entries(scores)
    .filter(([area]) => area !== expertiseArea)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([area]) => area as BusinessArea);

  // Fallback to matrix if not enough areas
  if (sortedAreas.length < 3) {
    const matrixAreas = matrixSuggestions
      .map((item) => item.area)
      .filter((area) => !sortedAreas.includes(area))
      .slice(0, 3 - sortedAreas.length);
    sortedAreas.push(...matrixAreas);
  }

  return {
    selectedAreas: sortedAreas,
    reasoning: `Seleção híbrida: matriz de relacionamentos + análise de keywords nas respostas. Identificados sinais de risco nessas áreas.`,
  };
}
