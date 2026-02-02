/**
 * Tags Extractor - Análise semântica de respostas via LLM
 *
 * Extrai tags estruturadas de respostas do usuário:
 * - processo_manual
 * - falta_metrica
 * - oportunidade_ia_automacao
 * - gargalo
 * - dependencia_pessoa
 * - risco_operacional
 * - tech_legado
 * - barreira_cultural
 * - etc.
 */

import Anthropic from '@anthropic-ai/sdk';

export type AssessmentTag =
  | 'processo_manual'
  | 'falta_metrica'
  | 'dependencia_pessoa'
  | 'risco_operacional'
  | 'oportunidade_ia_automacao'
  | 'oportunidade_ia_conteudo'
  | 'gargalo'
  | 'sem_dono_claro'
  | 'cliente_insatisfeito'
  | 'tech_legado'
  | 'barreira_cultural'
  | 'falta_budget'
  | 'dado_nao_estruturado'
  | 'retrabalho_frequente'
  | 'planilha_critica'
  | 'integracao_manual';

/**
 * Extrai tags de uma resposta usando Claude Haiku
 */
export async function extractTagsFromAnswer(
  questionId: string,
  questionText: string,
  answer: any,
  context?: {
    area?: string;
    block?: string;
    previousTags?: string[];
  }
): Promise<AssessmentTag[]> {
  // Converter answer para string se necessário
  const answerText = typeof answer === 'string' ? answer : JSON.stringify(answer);

  // Se resposta muito curta, não vale a pena chamar LLM
  if (answerText.length < 10) {
    return [];
  }

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || ''
  });

  const prompt = buildTagExtractionPrompt(questionId, questionText, answerText, context);

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 512,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const response = message.content[0];
    if (response.type !== 'text') {
      return [];
    }

    // Parsear resposta JSON
    const tags = parseTagsResponse(response.text);

    console.log('🏷️ [Tags Extractor] Tags extracted:', {
      questionId,
      answerPreview: answerText.substring(0, 50),
      tagsFound: tags
    });

    return tags;

  } catch (error) {
    console.error('❌ [Tags Extractor] Error:', error);
    return [];
  }
}

/**
 * Constrói prompt para extração de tags
 */
function buildTagExtractionPrompt(
  questionId: string,
  questionText: string,
  answerText: string,
  context?: {
    area?: string;
    block?: string;
    previousTags?: string[];
  }
): string {
  return `# Tarefa: Extrair Tags Semânticas de Resposta de Assessment

Você é um analisador de diagnósticos empresariais de IA. Sua tarefa é identificar **sinais** na resposta do usuário que indiquem oportunidades, riscos ou características do processo/empresa.

## Pergunta Feita
${questionText}

## Resposta do Usuário
${answerText}

## Contexto
${context?.area ? `- Área: ${context.area}` : ''}
${context?.block ? `- Bloco: ${context.block}` : ''}
${context?.previousTags ? `- Tags já identificadas: ${context.previousTags.join(', ')}` : ''}

## Tags Disponíveis (escolha apenas as que SE APLICAM)

### Processos & Operações
- **processo_manual**: Processo feito manualmente, sem automação
- **planilha_critica**: Uso de planilhas como sistema crítico
- **integracao_manual**: Integração entre sistemas feita manualmente
- **retrabalho_frequente**: Menção a refazer trabalho ou duplicação de esforço
- **sem_dono_claro**: Processo sem responsável definido
- **dependencia_pessoa**: Processo depende de pessoa específica (memória, conhecimento)

### Dados & Métricas
- **falta_metrica**: Falta de métricas ou dados para acompanhamento
- **dado_nao_estruturado**: Dados em formato não estruturado (emails, docs, PDFs)

### Riscos & Problemas
- **gargalo**: Menção explícita a gargalos ou bloqueios
- **risco_operacional**: Risco de falha operacional (erros, atrasos, perda de dados)
- **cliente_insatisfeito**: Menção a reclamações ou insatisfação de clientes
- **tech_legado**: Tecnologia antiga ou legada dificultando mudanças
- **barreira_cultural**: Resistência à mudança ou cultura pouco inovadora

### Oportunidades IA
- **oportunidade_ia_automacao**: Processo repetitivo que poderia ser automatizado com IA
- **oportunidade_ia_conteudo**: Geração de conteúdo que poderia usar IA (textos, emails, relatórios)

### Budget & Recursos
- **falta_budget**: Menção a falta de orçamento ou recursos

## Regras
1. Seja **conservador**: só marque tags que REALMENTE aparecem na resposta
2. Se a resposta é vaga ("está ok", "normal"), não force tags
3. Busque sinais EXPLÍCITOS ou muito claros
4. Retorne apenas JSON com array de tags
5. Se nenhuma tag se aplicar, retorne array vazio

## Formato de Resposta

Retorne APENAS JSON válido:

\`\`\`json
{
  "tags": ["tag1", "tag2"]
}
\`\`\`

Exemplos:

**Resposta:** "Usamos planilhas para tudo, é muito manual e sempre dá erro"
\`\`\`json
{ "tags": ["processo_manual", "planilha_critica", "risco_operacional"] }
\`\`\`

**Resposta:** "Não temos métricas claras de CAC ou LTV"
\`\`\`json
{ "tags": ["falta_metrica"] }
\`\`\`

**Resposta:** "O processo funciona bem"
\`\`\`json
{ "tags": [] }
\`\`\`

Agora analise a resposta acima e retorne as tags.`;
}

/**
 * Parseia resposta do LLM
 */
function parseTagsResponse(llmOutput: string): AssessmentTag[] {
  try {
    // Remover markdown se houver
    let cleaned = llmOutput.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7);
    }
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3);
    }

    const parsed = JSON.parse(cleaned.trim());

    if (!parsed.tags || !Array.isArray(parsed.tags)) {
      return [];
    }

    // Validar que tags são válidas
    const validTags: AssessmentTag[] = [
      'processo_manual',
      'falta_metrica',
      'dependencia_pessoa',
      'risco_operacional',
      'oportunidade_ia_automacao',
      'oportunidade_ia_conteudo',
      'gargalo',
      'sem_dono_claro',
      'cliente_insatisfeito',
      'tech_legado',
      'barreira_cultural',
      'falta_budget',
      'dado_nao_estruturado',
      'retrabalho_frequente',
      'planilha_critica',
      'integracao_manual'
    ];

    return parsed.tags.filter((tag: string) => validTags.includes(tag as AssessmentTag));

  } catch (error) {
    console.error('[Tags Extractor] Failed to parse response:', error);
    return [];
  }
}

/**
 * Extrai tags de múltiplas respostas em batch
 */
export async function extractTagsBatch(
  answers: Array<{
    questionId: string;
    questionText: string;
    answer: any;
    area?: string;
  }>
): Promise<Record<string, AssessmentTag[]>> {
  const results: Record<string, AssessmentTag[]> = {};

  // Processar em paralelo (máximo 3 por vez para não sobrecarregar API)
  const chunks = [];
  for (let i = 0; i < answers.length; i += 3) {
    chunks.push(answers.slice(i, i + 3));
  }

  for (const chunk of chunks) {
    const promises = chunk.map(({ questionId, questionText, answer, area }) =>
      extractTagsFromAnswer(questionId, questionText, answer, { area })
    );

    const chunkResults = await Promise.all(promises);

    chunk.forEach((item, idx) => {
      results[item.questionId] = chunkResults[idx];
    });
  }

  return results;
}
