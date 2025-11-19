/**
 * Business Quiz - LLM-based Expertise Detection
 *
 * Uses Claude Sonnet to analyze expertise answers and detect user's primary business area
 */

import { callSonnet, trackLLMCost } from './llm-integration';
import {
  parseLLMResponseSafe,
  ExpertiseDetectionSchema,
  type ExpertiseDetectionResult,
} from './llm-parser';
import { AREA_METADATA } from './area-relationships';
import type { QuizAnswer, BusinessArea, BusinessQuizContext } from './types';

// ============================================================================
// PROMPT TEMPLATES
// ============================================================================

const EXPERTISE_DETECTION_SYSTEM_PROMPT = `Você é um consultor de negócios especializado em detectar áreas de expertise de empreendedores e executivos.

Sua tarefa é analisar as respostas de um usuário sobre desafios de negócio e identificar em qual área ele tem mais conhecimento e experiência.

# Áreas de Negócio:
1. **marketing-growth**: Marketing, aquisição de clientes, growth hacking, funil de conversão, CAC, LTV
2. **sales-commercial**: Vendas, pipeline comercial, fechamento de negócios, CRM, prospecção
3. **product**: Desenvolvimento de produto, roadmap, product-market fit, features, user experience
4. **operations-logistics**: Operações, processos, fulfillment, logística, eficiência operacional
5. **financial**: Finanças, fluxo de caixa, runway, burn rate, orçamento, controles financeiros
6. **people-culture**: Recursos humanos, cultura organizacional, contratação, turnover, engajamento
7. **technology-data**: Tecnologia, infraestrutura, dados, engineering, automação

# Sinais de Expertise:
- **Vocabulário técnico**: Uso de termos específicos e métricas da área
- **Profundidade**: Respostas detalhadas e com nuances
- **Experiência**: Menção a práticas, ferramentas, ou desafios reais
- **Confiança**: Tom assertivo e conhecimento de benchmarks
- **Priorização**: Identifica o que é mais crítico vs. secundário

# Output Esperado:
Retorne um JSON com:
- detectedArea: A área onde o usuário tem MAIS expertise
- confidence: Confiança da detecção (0.0 a 1.0)
- reasoning: Explicação de 2-3 frases sobre por que você detectou essa área
- signals: Array com score de todas as áreas (opcional, mas recomendado)

# Regras:
1. Seja conservador: só dê confidence > 0.8 se houver sinais MUITO fortes
2. Considere o contexto da empresa (tamanho, estágio, indústria)
3. A expertise NÃO é necessariamente a área com mais desafios mencionados
4. Foque em sinais de conhecimento, não de problemas`;

function buildExpertiseDetectionPrompt(
  answers: QuizAnswer[],
  context: Partial<BusinessQuizContext>
): string {
  // Filter only expertise block answers
  const expertiseAnswers = answers.filter((a) => a.block === 'expertise');

  // Build context summary
  const contextSummary = `
## Contexto da Empresa:
${context.extractedData?.company?.name ? `- Nome: ${context.extractedData.company.name}` : ''}
${context.extractedData?.company?.industry ? `- Indústria: ${context.extractedData.company.industry}` : ''}
${context.extractedData?.company?.stage ? `- Estágio: ${context.extractedData.company.stage}` : ''}
${context.extractedData?.company?.teamSize ? `- Tamanho do time: ${context.extractedData.company.teamSize} pessoas` : ''}
${context.extractedData?.company?.monthlyRevenue ? `- Receita mensal: ${context.extractedData.company.monthlyRevenue}` : ''}
`.trim();

  // Build answers section
  const answersSection = expertiseAnswers
    .map((answer, i) => {
      return `
### Pergunta ${i + 1}: ${answer.questionText}
**Resposta do usuário:**
${answer.answer}

**Área relacionada:** ${AREA_METADATA[answer.area]?.name || answer.area}
`;
    })
    .join('\n');

  const prompt = `${EXPERTISE_DETECTION_SYSTEM_PROMPT}

# Tarefa:
Analise as respostas abaixo e identifique a área de expertise do usuário.

${contextSummary}

# Respostas do Usuário:
${answersSection}

# Análise:
Agora, analise as respostas e retorne um JSON com a expertise detectada.

Lembre-se:
- Foque em SINAIS DE CONHECIMENTO (vocabulário técnico, profundidade, experiência)
- Não confunda "área com mais problemas" com "área de expertise"
- Seja conservador na confidence
- Justifique sua escolha com evidências específicas das respostas

**Retorne apenas o JSON, sem texto adicional:**`;

  return prompt;
}

// ============================================================================
// FALLBACK DETECTION (usado se LLM falhar)
// ============================================================================

function fallbackExpertiseDetection(
  answers: QuizAnswer[]
): ExpertiseDetectionResult {
  console.warn('⚠️ [Expertise Detection] Using fallback keyword-based detection');

  const expertiseAnswers = answers.filter((a) => a.block === 'expertise');
  const answerText = expertiseAnswers.map((a) => a.answer.toLowerCase()).join(' ');

  // Advanced keyword scoring
  const areaKeywords: Record<BusinessArea, string[]> = {
    'marketing-growth': [
      'cac',
      'ltv',
      'growth',
      'marketing',
      'conversion',
      'funnel',
      'acquisition',
      'canal',
      'paid',
      'organic',
      'seo',
      'ads',
      'growth hacking',
      'viral',
      'referral',
    ],
    'sales-commercial': [
      'sales',
      'pipeline',
      'win rate',
      'cycle',
      'crm',
      'deals',
      'prospecção',
      'fechamento',
      'vendas',
      'comercial',
      'outbound',
      'inbound',
      'sdr',
      'bdr',
      'account',
    ],
    'product': [
      'product',
      'feature',
      'development',
      'roadmap',
      'pmf',
      'releases',
      'produto',
      'backlog',
      'sprint',
      'ux',
      'ui',
      'usabilidade',
      'beta',
      'mvp',
      'iteração',
    ],
    'operations-logistics': [
      'operations',
      'fulfillment',
      'processes',
      'logistics',
      'operações',
      'processos',
      'logística',
      'entrega',
      'supply chain',
      'estoque',
      'warehouse',
      'eficiência',
    ],
    'financial': [
      'financial',
      'runway',
      'burn',
      'revenue',
      'profit',
      'cash',
      'financeiro',
      'fluxo de caixa',
      'orçamento',
      'margem',
      'ebitda',
      'receita',
      'despesas',
    ],
    'people-culture': [
      'people',
      'culture',
      'hiring',
      'turnover',
      'team',
      'employees',
      'rh',
      'recursos humanos',
      'cultura',
      'onboarding',
      'engajamento',
      'nps',
      'colaboradores',
    ],
    'technology-data': [
      'tech',
      'code',
      'deploy',
      'infrastructure',
      'data',
      'engineering',
      'tecnologia',
      'desenvolvimento',
      'api',
      'cloud',
      'servidor',
      'database',
      'analytics',
    ],
  };

  const scores: Record<BusinessArea, number> = {
    'marketing-growth': 0,
    'sales-commercial': 0,
    'product': 0,
    'operations-logistics': 0,
    'financial': 0,
    'people-culture': 0,
    'technology-data': 0,
  };

  // Count keyword matches with weighted scoring
  Object.entries(areaKeywords).forEach(([area, keywords]) => {
    keywords.forEach((keyword) => {
      if (answerText.includes(keyword)) {
        // Weight by keyword length (longer = more specific = higher weight)
        const weight = Math.min(keyword.length / 5, 2);
        scores[area as BusinessArea] += weight;
      }
    });
  });

  // Find top areas
  const sortedAreas = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topArea = sortedAreas[0];
  const secondArea = sortedAreas[1];

  // Default to marketing-growth if no matches
  const detectedArea =
    topArea[1] > 0 ? (topArea[0] as BusinessArea) : 'marketing-growth';

  // Calculate confidence based on score gap
  const scoreGap = topArea[1] - secondArea[1];
  const confidence = Math.min(0.3 + scoreGap * 0.05, 0.7); // Max 0.7 for fallback

  // Build signals
  const signals = Object.entries(scores)
    .map(([area, score]) => ({
      area: area as BusinessArea,
      score: Math.min(score / 10, 1), // Normalize to 0-1
      evidences: [`Keyword matches: ${Math.round(score)}`],
    }))
    .filter((s) => s.score > 0);

  return {
    detectedArea,
    confidence,
    reasoning: `Detecção via keywords (${Math.round(topArea[1])} matches). LLM falhou, usando fallback. Confiança reduzida para ${Math.round(confidence * 100)}%.`,
    signals,
  };
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Detect user's area of expertise using Claude Sonnet
 *
 * @param answers - All quiz answers (will filter for expertise block)
 * @param context - Quiz context with company info
 * @returns Expertise detection result with area, confidence, and reasoning
 */
export async function detectExpertiseWithLLM(
  answers: QuizAnswer[],
  context: Partial<BusinessQuizContext>
): Promise<ExpertiseDetectionResult> {
  try {
    console.log('🔍 [Expertise Detection] Analyzing answers with Claude Sonnet...');

    // Build prompt
    const prompt = buildExpertiseDetectionPrompt(answers, context);

    // Call Claude Sonnet
    const llmResponse = await callSonnet(prompt, 1024);

    console.log(`✅ [Expertise Detection] LLM response received (${llmResponse.usage.outputTokens} tokens, R$${llmResponse.cost.toFixed(4)})`);

    // Parse response
    const result = parseLLMResponseSafe(
      llmResponse.text,
      ExpertiseDetectionSchema,
      fallbackExpertiseDetection(answers) // Use fallback if parsing fails
    );

    // Track cost
    trackLLMCost('sonnet', llmResponse.cost);

    console.log(`🎯 [Expertise Detection] Detected: ${result.detectedArea} (confidence: ${Math.round(result.confidence * 100)}%)`);
    console.log(`📝 [Expertise Detection] Reasoning: ${result.reasoning}`);

    return result;
  } catch (error) {
    console.error('❌ [Expertise Detection] LLM call failed:', error);
    console.log('🔄 [Expertise Detection] Falling back to keyword-based detection');

    // Use fallback on error
    return fallbackExpertiseDetection(answers);
  }
}

/**
 * Get expertise detection with caching (for testing/debugging)
 */
export async function detectExpertiseWithCache(
  answers: QuizAnswer[],
  context: Partial<BusinessQuizContext>,
  useCache: boolean = false
): Promise<ExpertiseDetectionResult> {
  // For now, just call directly (can add caching later)
  return detectExpertiseWithLLM(answers, context);
}
