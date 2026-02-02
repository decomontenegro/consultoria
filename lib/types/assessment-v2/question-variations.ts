/**
 * Question Bank V2 - Com Variações para Evitar Repetitividade
 *
 * Cada pergunta tem 2-3 variações pré-escritas para que usuários que façam
 * o assessment múltiplas vezes tenham experiências diferentes.
 */

import { UserPersona } from '../../types';

/**
 * Tonalidade da variação de pergunta
 */
export type QuestionTone =
  | 'formal'        // Tom profissional, direto, estruturado
  | 'casual'        // Tom leve, próximo, coloquial
  | 'conversational' // Tom de conversa, storytelling
  | 'strategic';     // Tom executivo, focado em impacto

/**
 * Tipo de input da pergunta
 */
export type InputType =
  | 'text_short'
  | 'text_long'
  | 'single_select'
  | 'multi_select'
  | 'multi_select_sortable'
  | 'scale_0_5'
  | 'scale_0_10'
  | 'boolean';

/**
 * Bloco/etapa do assessment
 */
export type QuestionBlock =
  | 'intro'
  | 'company_snapshot'
  | 'expertise'
  | 'problems_opportunities'
  | 'deep_dive'
  | 'automation_focus'
  | 'closing';

/**
 * Variação de uma pergunta
 */
export interface QuestionVariation {
  id: string; // v1, v2, v3, custom
  text: string;
  tone: QuestionTone;

  /**
   * Contexto/quando usar essa variação
   * Ex: "Use quando usuário já fez assessment antes"
   */
  context?: string;

  /**
   * Placeholder personalizado para essa variação (text inputs)
   */
  placeholder?: string;
}

/**
 * Opção de resposta (para single_select, multi_select)
 */
export interface QuestionOption {
  value: string;
  label: string;
  description?: string;

  /**
   * Se true, essa opção aciona um follow-up
   */
  triggersFollowup?: boolean;
}

/**
 * Trigger para follow-up automático
 */
export interface FollowUpTrigger {
  /**
   * Condição que dispara o follow-up
   */
  condition: (answer: any) => boolean;

  /**
   * Razão do follow-up (usado pelo orquestrador)
   */
  reason: string;

  /**
   * Template de pergunta sugerido (orquestrador pode adaptar)
   */
  suggested_question_template?: string;
}

/**
 * Extrator de dados estruturados da resposta
 */
export interface DataExtractor {
  (answer: any): Record<string, any>;
}

/**
 * Pergunta completa do Question Bank V2
 */
export interface QuestionBankItemV2 {
  /**
   * ID único da pergunta
   */
  id: string;

  /**
   * Área/categoria da pergunta
   */
  area: string;

  /**
   * Bloco/etapa do assessment
   */
  block: QuestionBlock;

  /**
   * NOVO: Array de variações pré-escritas (2-3 por pergunta)
   */
  variations: QuestionVariation[];

  /**
   * NOVO: Template para LLM gerar variações customizadas
   * Ex: "Pergunte sobre {topic} usando tom {tone}"
   */
  variation_template?: string;

  /**
   * Tipo de input
   */
  inputType: InputType;

  /**
   * Opções de resposta (para select inputs)
   */
  options?: QuestionOption[];

  /**
   * Personas que devem ver essa pergunta
   * Se undefined ou ['all'], todos veem
   */
  personas?: UserPersona[] | ['all'];

  /**
   * Tags para categorização
   */
  tags?: string[];

  /**
   * Triggers para follow-ups automáticos
   */
  followUpTriggers?: FollowUpTrigger[];

  /**
   * Função para extrair dados estruturados da resposta
   */
  dataExtractor?: DataExtractor;

  /**
   * Pergunta obrigatória?
   */
  required?: boolean;

  /**
   * Peso/importância da pergunta (1-5)
   * Usado pelo orquestrador para priorização
   */
  weight?: number;
}

/**
 * Config do question bank
 */
export interface QuestionBankConfig {
  version: string;
  total_questions: number;
  total_variations: number;
  blocks: QuestionBlock[];
}
