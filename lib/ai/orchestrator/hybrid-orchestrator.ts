/**
 * Orquestrador Híbrido LLM
 *
 * Combina question bank estruturado com inteligência LLM para:
 * - Decidir próxima pergunta baseado em contexto
 * - Selecionar variação para evitar repetição
 * - Gerar follow-ups contextuais
 * - Extrair tags e estruturar respostas
 */

import Anthropic from '@anthropic-ai/sdk';
import {
  OrchestratorState,
  OrchestratorConfig,
  OrchestratorResponse,
  OrchestratorLLMInput,
  QuestionSelectionCriteria,
  LastInteraction,
  VariationUsage
} from '../../types/assessment-v2/orchestrator-types';
import {
  QuestionBankItemV2,
  QuestionVariation
} from '../../types/assessment-v2/question-variations';
import {
  AI_READINESS_QUESTIONS_V2
} from '../../questions/v2/question-bank-v2';
import {
  buildOrchestratorPrompt,
  parseOrchestratorResponse
} from './orchestrator-prompt';

const DEFAULT_CONFIG: OrchestratorConfig = {
  max_questions_total: 30,
  max_followups_per_question: 2,
  max_questions_per_area: 8,
  min_questions_per_priority_area: 5,
  enable_variation_tracking: true,
  llm_model: 'claude-3-5-haiku-20241022',
  temperature: 0.7
};

export class HybridOrchestrator {
  private anthropic: Anthropic;
  private config: OrchestratorConfig;
  private questionBank: QuestionBankItemV2[];

  constructor(config: Partial<OrchestratorConfig> = {}) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || ''
    });
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.questionBank = AI_READINESS_QUESTIONS_V2;
  }

  /**
   * Decide a próxima pergunta baseado no estado atual
   */
  async decideNextQuestion(
    state: OrchestratorState,
    lastInteraction?: LastInteraction
  ): Promise<OrchestratorResponse> {
    // Preparar input para o LLM
    const llmInput = this.prepareLLMInput(state, lastInteraction);

    // Construir prompt
    const prompt = buildOrchestratorPrompt(llmInput);

    // Chamar LLM
    const llmResponse = await this.callLLM(prompt);

    // Parsear resposta
    const orchestratorResponse = parseOrchestratorResponse(llmResponse);

    // Validar e enriquecer resposta
    if (orchestratorResponse.action === 'ask_next' && orchestratorResponse.next_question) {
      orchestratorResponse.next_question = this.enrichNextQuestion(
        orchestratorResponse.next_question,
        state
      );
    }

    return orchestratorResponse;
  }

  /**
   * Prepara input para o LLM
   */
  private prepareLLMInput(
    state: OrchestratorState,
    lastInteraction?: LastInteraction
  ): OrchestratorLLMInput {
    const questionsAsked = state.session_metadata.variations_used.map(v => v.question_id);
    const variationsUsed = this.buildVariationsUsedMap(state.session_metadata.variations_used);

    // Filtrar perguntas disponíveis (não feitas ainda)
    const availableQuestions = this.questionBank.filter(
      q => !questionsAsked.includes(q.id)
    );

    // Construir critérios de seleção
    const selectionCriteria = this.buildSelectionCriteria(state);

    return {
      state,
      question_bank: {
        available_questions: availableQuestions,
        questions_already_asked: questionsAsked,
        variations_already_used: variationsUsed
      },
      last_interaction: lastInteraction,
      config: this.config,
      selection_criteria: selectionCriteria
    };
  }

  /**
   * Constrói mapa de variações usadas
   */
  private buildVariationsUsedMap(variationsUsed: VariationUsage[]): Record<string, string[]> {
    const map: Record<string, string[]> = {};

    variationsUsed.forEach(usage => {
      if (!map[usage.question_id]) {
        map[usage.question_id] = [];
      }
      map[usage.question_id].push(usage.variation_id);
    });

    return map;
  }

  /**
   * Constrói critérios de seleção de pergunta
   */
  private buildSelectionCriteria(state: OrchestratorState): QuestionSelectionCriteria {
    // Contagem de perguntas por área
    const areasCovered: Record<string, number> = {};
    state.session_metadata.variations_used.forEach(usage => {
      const question = this.questionBank.find(q => q.id === usage.question_id);
      if (question) {
        areasCovered[question.area] = (areasCovered[question.area] || 0) + 1;
      }
    });

    // Blocos obrigatórios pendentes
    const requiredBlocks = ['intro', 'company_snapshot', 'expertise', 'problems_opportunities', 'closing'];
    const completedBlocks = new Set(
      state.session_metadata.variations_used.map(usage => {
        const question = this.questionBank.find(q => q.id === usage.question_id);
        return question?.block;
      }).filter((b): b is string => Boolean(b))
    );
    const requiredBlocksPending = requiredBlocks.filter(b => !completedBlocks.has(b as any));

    // Follow-ups pendentes (simplificado - podemos melhorar depois)
    const pendingFollowups: any[] = [];

    return {
      prioritize_expertise_problems: true,
      areas_covered: areasCovered,
      required_blocks_pending: requiredBlocksPending,
      pending_followups: pendingFollowups
    };
  }

  /**
   * Enriquece a próxima pergunta com dados completos do question bank
   */
  private enrichNextQuestion(nextQuestion: any, state: OrchestratorState): any {
    const questionFromBank = this.questionBank.find(q => q.id === nextQuestion.id);

    if (!questionFromBank) {
      throw new Error(`Question ${nextQuestion.id} not found in question bank`);
    }

    // Encontrar a variação escolhida
    const variation = questionFromBank.variations.find(
      v => v.id === nextQuestion.variation_id
    );

    if (!variation) {
      throw new Error(`Variation ${nextQuestion.variation_id} not found for question ${nextQuestion.id}`);
    }

    // Retornar pergunta enriquecida
    return {
      ...nextQuestion,
      text: variation.text,
      placeholder: variation.placeholder || questionFromBank.variations[0].placeholder,
      options: questionFromBank.options,
      input_type: questionFromBank.inputType,
      variation_tone: variation.tone
    };
  }

  /**
   * Chama o LLM
   */
  private async callLLM(prompt: string): Promise<string> {
    try {
      const message = await this.anthropic.messages.create({
        model: this.config.llm_model,
        max_tokens: 4096,
        temperature: this.config.temperature,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const response = message.content[0];
      if (response.type === 'text') {
        return response.text;
      }

      throw new Error('Unexpected response type from LLM');
    } catch (error) {
      console.error('Error calling LLM:', error);
      throw error;
    }
  }

  /**
   * Seleciona uma variação disponível (fallback se LLM não escolher)
   */
  selectAvailableVariation(
    question: QuestionBankItemV2,
    usedVariations: string[]
  ): QuestionVariation {
    // Filtrar variações não usadas
    const availableVariations = question.variations.filter(
      v => !usedVariations.includes(v.id)
    );

    if (availableVariations.length === 0) {
      // Se todas foram usadas, escolhe aleatoriamente
      const randomIndex = Math.floor(Math.random() * question.variations.length);
      return question.variations[randomIndex];
    }

    // Escolhe a primeira disponível
    return availableVariations[0];
  }

  /**
   * Registra uso de variação
   */
  recordVariationUsage(
    state: OrchestratorState,
    questionId: string,
    variationId: string
  ): void {
    state.session_metadata.variations_used.push({
      question_id: questionId,
      variation_id: variationId,
      timestamp: new Date().toISOString()
    });
    state.session_metadata.questions_asked += 1;
  }

  /**
   * Extrai tags de uma resposta usando LLM (simplificado)
   */
  async extractTags(questionId: string, answer: any): Promise<string[]> {
    // Por enquanto, retorna array vazio
    // TODO: Implementar extração real de tags via LLM
    return [];
  }

  /**
   * Verifica se deve encerrar o assessment
   */
  shouldEnd(state: OrchestratorState): boolean {
    const {
      questions_asked,
      priority_areas
    } = state.session_metadata;

    // Encerra se atingiu o máximo de perguntas
    if (questions_asked >= this.config.max_questions_total) {
      return true;
    }

    // Encerra se já explorou áreas prioritárias suficientemente
    const priorityAreasCovered = priority_areas.filter(area => {
      const dive = state.deep_dives[area];
      return dive && Object.keys(dive.answers || {}).length >= this.config.min_questions_per_priority_area;
    });

    const hasSufficientCoverage = priorityAreasCovered.length >= Math.min(2, priority_areas.length);
    const hasMinimumQuestions = questions_asked >= 15;

    return hasSufficientCoverage && hasMinimumQuestions;
  }
}

/**
 * Cria uma instância default do orquestrador
 */
export function createHybridOrchestrator(config?: Partial<OrchestratorConfig>): HybridOrchestrator {
  return new HybridOrchestrator(config);
}
