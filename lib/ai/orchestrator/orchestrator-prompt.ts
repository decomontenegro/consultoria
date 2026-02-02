/**
 * Prompt do Orquestrador Híbrido LLM
 *
 * Este prompt guia o LLM para:
 * 1. Escolher a próxima pergunta do question bank
 * 2. Selecionar qual variação usar
 * 3. Decidir quando fazer follow-ups
 * 4. Extrair tags das respostas
 * 5. Decidir quando encerrar
 */

import { OrchestratorLLMInput, OrchestratorResponse } from '../../types/assessment-v2/orchestrator-types';

export function buildOrchestratorPrompt(input: OrchestratorLLMInput): string {
  const {
    state,
    question_bank,
    last_interaction,
    config,
    selection_criteria
  } = input;

  return `# Orquestrador de Assessment - AI Readiness Diagnosis

## Seu Papel

Você é um orquestrador inteligente de entrevista diagnóstica. Seu objetivo é:
- Guiar a conversa de forma natural e eficiente
- Extrair o máximo de informação útil sobre a empresa
- Priorizar áreas onde o respondente tem expertise E percebe problemas
- Evitar repetição e redundância
- Decidir quando parar (quando já há informação suficiente)

## Estado Atual do Assessment

${buildStateSection(state)}

## Question Bank Disponível

${buildQuestionBankSection(question_bank)}

## Última Interação

${last_interaction ? buildLastInteractionSection(last_interaction) : 'Nenhuma pergunta foi feita ainda (início do assessment).'}

## Configuração

- **Máximo de perguntas:** ${config.max_questions_total}
- **Follow-ups por pergunta:** até ${config.max_followups_per_question}
- **Perguntas por área:** até ${config.max_questions_per_area}
- **Mínimo por área prioritária:** ${config.min_questions_per_priority_area}

## Critérios de Seleção

${buildSelectionCriteriaSection(selection_criteria, state)}

## Sua Tarefa

Analise o estado atual e decida:

1. **Continuar ou Encerrar?**
   - Continue se ainda faltam áreas prioritárias a explorar
   - Continue se processos importantes ainda não foram bem descritos
   - Encerre se já há informação suficiente para um diagnóstico rico

2. **Se continuar, qual pergunta fazer?**
   - Priorize áreas com expertise alta + problemas detectados
   - Se último answer foi vago, considere um follow-up
   - Se área prioritária tem < ${config.min_questions_per_priority_area} perguntas, priorize ela
   - Evite perguntas já respondidas

3. **Qual variação usar?**
   - Evite variações já usadas nesta sessão
   - Prefira tom conversational para follow-ups
   - Prefira tom formal para perguntas iniciais de área
   - Use casual quando o usuário demonstra informalidade

4. **Extrair tags da última resposta** (se houver)
   - Tags possíveis: processo_manual, falta_metrica, dependencia_pessoa, risco_operacional,
     oportunidade_ia_automacao, oportunidade_ia_conteudo, gargalo, sem_dono_claro,
     cliente_insatisfeito, tech_legado, barreira_cultural, falta_budget

## Formato de Saída

Responda APENAS com JSON válido seguindo este schema:

\`\`\`json
{
  "action": "ask_next" | "end",
  "next_question": {
    "id": "question_id_from_bank",
    "text": "Texto da pergunta (use o texto da variação escolhida)",
    "variation_id": "v1 | v2 | v3",
    "variation_tone": "formal | casual | conversational",
    "input_type": "text_long | text_short | single_select | multi_select | scale_0_5 | scale_0_10",
    "options": [...], // se aplicável
    "placeholder": "...", // se aplicável
    "area": "nome_da_area",
    "block": "nome_do_bloco",
    "is_followup": false,
    "base_question_id": null, // ou id da pergunta base se for follow-up
    "weight": 1-5
  },
  "state_updates": {
    "tags_from_last_answer": ["tag1", "tag2"],
    "problem_stories_updates": [...],
    "deep_dives_updates": {
      "area_name": {
        "answers": { "question_id": "answer_value" },
        "tags": ["tag1", "tag2"]
      }
    },
    "session_metadata_updates": {
      "questions_asked": ${state.session_metadata.questions_asked + 1}
    }
  },
  "reasoning": {
    "summary": "Breve explicação da decisão",
    "why_this_question": "Por que essa pergunta foi escolhida",
    "why_this_variation": "Por que essa variação foi escolhida",
    "questions_asked_so_far": ${state.session_metadata.questions_asked},
    "questions_remaining_estimate": 10,
    "should_continue": true,
    "completion_percentage": 45
  }
}
\`\`\`

## Regras Importantes

1. **Sempre retorne JSON válido** - não adicione texto antes ou depois
2. **Se action = "end", não inclua next_question** - apenas state_updates e reasoning
3. **Variações:** Sempre escolha uma variação que ainda não foi usada para esta pergunta
4. **Follow-ups:** Só crie se a resposta anterior foi vaga/superficial OU revelou oportunidade clara
5. **Tags:** Seja criterioso - só marque tags que realmente aparecem na resposta
6. **Priorização:** Expertise alta + Problema = Máxima prioridade

## Critérios para Encerrar

Considere encerrar quando:
- Pelo menos 1-2 áreas prioritárias foram bem exploradas (processo + gargalos + métricas)
- Lista de oportunidades de automação está clara
- Já foram feitas ${Math.floor(config.max_questions_total * 0.8)}+ perguntas
- Não há grandes lacunas no entendimento

Agora, baseado em todas as informações acima, decida a próxima ação.`;
}

function buildStateSection(state: any): string {
  const expertise = state.expertise || { areas: [], levels: {} };
  const problems = state.problems_and_opportunities || { problem_areas: [], opportunity_areas_sorted: [] };

  const priorityAreas = expertise.areas.filter((area: string) =>
    problems.problem_areas.includes(area) &&
    (expertise.levels[area] === 'intermediate' || expertise.levels[area] === 'deep')
  );

  return `
### Company Snapshot
${JSON.stringify(state.company_snapshot || {}, null, 2)}

### Expertise do Respondente
- **Áreas de conhecimento:** ${expertise.areas.join(', ') || 'Não informado'}
- **Níveis:** ${Object.entries(expertise.levels || {}).map(([area, level]) => `${area}: ${level}`).join(', ')}

### Problemas e Oportunidades
- **Áreas com problemas:** ${problems.problem_areas.join(', ') || 'Não informado'}
- **Áreas com oportunidades (ordenadas):** ${problems.opportunity_areas_sorted.join(', ') || 'Não informado'}
- **Histórias de problemas:** ${problems.problem_stories_raw ? 'Fornecido' : 'Não fornecido'}

### Áreas Prioritárias (Expertise Alta + Problemas)
${priorityAreas.length > 0 ? priorityAreas.join(', ') : 'Nenhuma área prioritária identificada ainda'}

### Deep Dives Realizados
${Object.keys(state.deep_dives || {}).map(area => {
    const dive = state.deep_dives[area];
    const questionCount = Object.keys(dive.answers || {}).length;
    return `- **${area}:** ${questionCount} perguntas respondidas, tags: [${(dive.tags || []).join(', ')}]`;
  }).join('\n') || 'Nenhum deep dive iniciado'}

### Session Info
- **Perguntas feitas:** ${state.session_metadata.questions_asked}
- **Bloco atual:** ${state.session_metadata.current_block}
- **Variações usadas:** ${state.session_metadata.variations_used.length}
`;
}

function buildQuestionBankSection(question_bank: any): string {
  const available = question_bank.available_questions || [];
  const asked = question_bank.questions_already_asked || [];
  const variationsUsed = question_bank.variations_already_used || {};

  // Group by block
  const byBlock: Record<string, any[]> = {};
  available.forEach((q: any) => {
    if (!byBlock[q.block]) byBlock[q.block] = [];
    byBlock[q.block].push(q);
  });

  // Build detailed list
  const questionsList = Object.entries(byBlock).map(([block, questions]) => {
    const questionsStr = questions.map((q: any) => {
      const variationsAvailable = q.variations.filter((v: any) => {
        const used = variationsUsed[q.id] || [];
        return !used.includes(v.id);
      });
      return `   - **${q.id}** (${q.area}): "${q.variations[0].text.substring(0, 60)}..." [${variationsAvailable.length} variações disponíveis]`;
    }).join('\n');
    return `**${block}** (${questions.length} perguntas):\n${questionsStr}`;
  }).join('\n\n');

  return `
### Perguntas Disponíveis (ESCOLHA APENAS DESTAS!)

${questionsList}

### Perguntas Já Feitas
${asked.length > 0 ? asked.join(', ') : 'Nenhuma'}

### Variações Já Usadas
${Object.entries(variationsUsed).length > 0
    ? Object.entries(variationsUsed).map(([qid, vars]) => `- ${qid}: [${(vars as string[]).join(', ')}]`).join('\n')
    : 'Nenhuma'
  }

**IMPORTANTE:** Você DEVE escolher um question_id da lista acima. NÃO invente IDs.
**Total disponível:** ${available.length} perguntas
`;
}

function buildLastInteractionSection(interaction: any): string {
  return `
**Pergunta:** ${interaction.question_text}
**Question ID:** ${interaction.question_id}
**Variação usada:** ${interaction.variation_id}
**Resposta:** ${typeof interaction.answer_text === 'object' ? JSON.stringify(interaction.answer_text) : interaction.answer_text}
**Tipo:** ${interaction.answer_type}
**Tags extraídas:** ${interaction.tags_extracted?.join(', ') || 'Nenhuma ainda'}
`;
}

function buildSelectionCriteriaSection(criteria: any, state: any): string {
  return `
### Áreas Já Exploradas
${Object.entries(criteria.areas_covered || {}).map(([area, count]) => `- ${area}: ${count} perguntas`).join('\n') || 'Nenhuma área explorada'}

### Blocos Obrigatórios Pendentes
${criteria.required_blocks_pending?.join(', ') || 'Nenhum'}

### Follow-ups Pendentes
${criteria.pending_followups?.length > 0
    ? criteria.pending_followups.map((f: any) => `- ${f.base_question_id}: ${f.reason} (prioridade ${f.priority})`).join('\n')
    : 'Nenhum'
  }

### Priorizar Expertise + Problemas?
${criteria.prioritize_expertise_problems ? 'SIM' : 'NÃO'}
`;
}

export function parseOrchestratorResponse(llmOutput: string): OrchestratorResponse {
  try {
    // Remove markdown code blocks if present
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
    return parsed as OrchestratorResponse;
  } catch (error) {
    throw new Error(`Failed to parse orchestrator response: ${error instanceof Error ? error.message : 'Unknown error'}\n\nRaw output:\n${llmOutput}`);
  }
}
