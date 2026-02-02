/**
 * Tipos do Orquestrador Híbrido LLM
 *
 * O orquestrador decide:
 * - Qual a próxima pergunta
 * - Qual variação usar
 * - Quando fazer follow-ups
 * - Quando encerrar o assessment
 */

import { QuestionBankItemV2, QuestionVariation } from './question-variations';

/**
 * Estado completo do assessment para o orquestrador
 */
export interface OrchestratorState {
  // Dados básicos da empresa
  company_snapshot: {
    company_name?: string;
    sector?: string;
    business_model?: string[];
    revenue_range?: string;
    company_size?: string;
    digital_maturity?: number;
    ai_usage_current?: string;
  };

  // Expertise do respondente
  expertise: {
    areas: string[];
    levels: Record<string, string>; // área -> nível (basic, intermediate, deep)
    subtopics?: Record<string, string[]>;
  };

  // Problemas e oportunidades
  problems_and_opportunities: {
    problem_areas: string[];
    opportunity_areas_sorted: string[];
    problem_stories_raw?: string;
    problem_stories_structured?: ProblemStory[];
  };

  // Deep dives por área
  deep_dives: Record<string, DeepDiveArea>;

  // Oportunidades de automação
  automation_opportunities?: {
    repetitive_tasks?: string;
    manual_dependencies?: string;
    ai_team_wish?: string;
  };

  // Closing
  closing?: {
    single_most_important_fix?: string;
    ai_readiness_score?: number;
    report_focus_preference?: string;
  };

  // Metadata de sessão
  session_metadata: SessionMetadata;
}

/**
 * História de problema estruturada
 */
export interface ProblemStory {
  title: string;
  areas_related: string[];
  impact: 'low' | 'medium' | 'high';
  description: string;
}

/**
 * Deep dive em uma área específica
 */
export interface DeepDiveArea {
  answers: Record<string, any>; // question_id -> answer
  tags: string[]; // processo_manual, falta_metrica, etc
  process_overview?: string;
  bottlenecks?: string;
  automation_opportunities?: string[];
}

/**
 * Metadata da sessão
 */
export interface SessionMetadata {
  session_id: string;
  user_id?: string;
  started_at: string;
  questions_asked: number;
  questions_answered: number;
  variations_used: VariationUsage[];
  llm_calls: number;
  current_block: string;
  priority_areas: string[]; // áreas com expertise alta + problemas
}

/**
 * Registro de variação usada
 */
export interface VariationUsage {
  question_id: string;
  variation_id: string;
  timestamp: string;
}

/**
 * Última interação (pergunta + resposta)
 */
export interface LastInteraction {
  question_id: string;
  question_text: string;
  variation_id: string;
  answer_text: any;
  answer_type: string;
  timestamp: string;
  tags_extracted?: string[];
}

/**
 * Configuração do orquestrador
 */
export interface OrchestratorConfig {
  max_questions_total: number;
  max_followups_per_question: number;
  max_questions_per_area: number;
  min_questions_per_priority_area: number;
  enable_variation_tracking: boolean;
  llm_model: string;
  temperature: number;
}

/**
 * Critérios para seleção de próxima pergunta
 */
export interface QuestionSelectionCriteria {
  // Priorização por expertise + problemas
  prioritize_expertise_problems: boolean;

  // Áreas já exploradas
  areas_covered: Record<string, number>; // área -> quantidade de perguntas

  // Blocos obrigatórios ainda não completados
  required_blocks_pending: string[];

  // Follow-ups pendentes
  pending_followups: PendingFollowUp[];
}

/**
 * Follow-up pendente
 */
export interface PendingFollowUp {
  base_question_id: string;
  reason: string;
  suggested_template?: string;
  priority: number; // 1-5
}

/**
 * Resposta do orquestrador
 */
export interface OrchestratorResponse {
  action: 'ask_next' | 'end';

  next_question?: {
    id: string;
    text: string;
    variation_id: string;
    variation_tone: string;
    input_type: string;
    options?: any[];
    placeholder?: string;
    area: string;
    block: string;
    is_followup: boolean;
    base_question_id?: string;
    weight: number;
  };

  state_updates: {
    tags_from_last_answer?: string[];
    problem_stories_updates?: ProblemStory[];
    deep_dives_updates?: Record<string, Partial<DeepDiveArea>>;
    session_metadata_updates?: Partial<SessionMetadata>;
  };

  reasoning: {
    summary: string;
    why_this_question: string;
    why_this_variation: string;
    questions_asked_so_far: number;
    questions_remaining_estimate: number;
    should_continue: boolean;
    completion_percentage: number;
  };
}

/**
 * Input para o orquestrador LLM
 */
export interface OrchestratorLLMInput {
  state: OrchestratorState;
  question_bank: {
    available_questions: QuestionBankItemV2[];
    questions_already_asked: string[];
    variations_already_used: Record<string, string[]>; // question_id -> [variation_ids]
  };
  last_interaction?: LastInteraction;
  config: OrchestratorConfig;
  selection_criteria: QuestionSelectionCriteria;
}

/**
 * Estratégia de seleção de variação
 */
export type VariationSelectionStrategy =
  | 'random' // Aleatório entre as disponíveis
  | 'tone_based' // Baseado no tom preferido do usuário
  | 'avoid_used' // Evita variações já usadas
  | 'llm_decision'; // LLM decide qual usar

/**
 * Resultado de seleção de variação
 */
export interface VariationSelectionResult {
  selected_variation: QuestionVariation;
  reason: string;
  alternatives_considered: number;
}
