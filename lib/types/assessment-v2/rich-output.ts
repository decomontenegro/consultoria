/**
 * Rich Output Structure - Assessment V2
 *
 * Estrutura de dados enriquecida retornada ao final do assessment
 */

import { OrchestratorState } from './orchestrator-types';
import { AssessmentTag } from '../../ai/tags-extractor';

/**
 * Output final do Assessment V2
 */
export interface AssessmentOutputV2 {
  // Identificação
  sessionId: string;
  userId?: string;
  completedAt: string;

  // Dados da empresa
  company: CompanyProfile;

  // Expertise do respondente
  respondent: RespondentProfile;

  // Problemas e oportunidades estruturadas
  problems_and_opportunities: ProblemsOpportunitiesOutput;

  // Deep dives estruturados
  deep_dives: DeepDiveOutput[];

  // Oportunidades de automação consolidadas
  automation_opportunities: AutomationOpportunitiesOutput;

  // Closing
  closing?: ClosingOutput;

  // Metadata e métricas
  metadata: AssessmentMetadata;
}

/**
 * Perfil da empresa
 */
export interface CompanyProfile {
  name?: string;
  sector?: string;
  business_model?: string[];
  revenue_range?: string;
  company_size?: string;
  digital_maturity?: number; // 0-5
  ai_usage_current?: string;
}

/**
 * Perfil do respondente
 */
export interface RespondentProfile {
  areas: string[];
  levels: Record<string, 'basic' | 'intermediate' | 'deep'>;
  subtopics?: Record<string, string[]>;
}

/**
 * Problemas e oportunidades estruturadas
 */
export interface ProblemsOpportunitiesOutput {
  // Áreas com problemas detectados
  problem_areas: string[];

  // Áreas ordenadas por oportunidade
  opportunity_areas_sorted: string[];

  // Histórias de problemas estruturadas
  problem_stories: ProblemStory[];

  // Áreas prioritárias (expertise ∩ problemas)
  priority_areas: string[];
}

/**
 * História de problema estruturada
 */
export interface ProblemStory {
  title: string;
  areas_related: string[];
  impact: 'low' | 'medium' | 'high';
  description: string;
  tags?: AssessmentTag[];
}

/**
 * Deep dive output estruturado
 */
export interface DeepDiveOutput {
  area: string;

  // Respostas estruturadas
  answers: Record<string, any>;

  // Tags extraídas
  tags: AssessmentTag[];

  // Resumos sintéticos
  process_overview?: string;
  bottlenecks?: string;
  metrics_tracked?: string[];
  tools_used?: string[];

  // Oportunidades identificadas nesta área
  automation_opportunities: string[];

  // Score de complexidade (0-10)
  complexity_score?: number;

  // Score de maturidade digital (0-10)
  maturity_score?: number;
}

/**
 * Oportunidades de automação consolidadas
 */
export interface AutomationOpportunitiesOutput {
  // Top 3 tarefas repetitivas
  repetitive_tasks?: string;

  // Dependências manuais críticas
  manual_dependencies?: string;

  // Wish list do usuário
  ai_team_wish?: string;

  // Oportunidades detectadas pelo sistema
  detected_opportunities: DetectedOpportunity[];
}

/**
 * Oportunidade detectada automaticamente
 */
export interface DetectedOpportunity {
  area: string;
  type: 'automacao' | 'conteudo' | 'analise' | 'otimizacao';
  description: string;
  priority: 'low' | 'medium' | 'high';
  tags: AssessmentTag[];
  evidence: string; // Resposta que gerou a oportunidade
}

/**
 * Closing output
 */
export interface ClosingOutput {
  single_most_important_fix?: string;
  ai_readiness_score?: number; // 0-10
  report_focus_preference?: string;
}

/**
 * Metadata do assessment
 */
export interface AssessmentMetadata {
  // Contadores
  total_questions: number;
  total_answers: number;
  llm_calls: number;

  // Timing
  started_at: string;
  completed_at: string;
  duration_seconds: number;

  // Variações
  variations_used: number;
  unique_questions_asked: number;

  // Blocos completados
  blocks_completed: string[];

  // Áreas exploradas
  areas_explored: string[];
  deep_dive_areas: string[];

  // Tags agregadas
  all_tags: AssessmentTag[];
  tag_frequency: Record<string, number>;

  // Scores
  completeness_percentage: number;
}

/**
 * Builder de output a partir do OrchestratorState
 */
export function buildRichOutput(state: OrchestratorState): AssessmentOutputV2 {
  const now = new Date();
  const startedAt = new Date(state.session_metadata.started_at);
  const durationSeconds = Math.round((now.getTime() - startedAt.getTime()) / 1000);

  // Construir company profile
  const company: CompanyProfile = {
    ...state.company_snapshot
  };

  // Construir respondent profile
  const respondent: RespondentProfile = {
    areas: state.expertise.areas,
    levels: state.expertise.levels as Record<string, 'basic' | 'intermediate' | 'deep'>,
    subtopics: state.expertise.subtopics
  };

  // Construir problems & opportunities
  const problemsOpps: ProblemsOpportunitiesOutput = {
    problem_areas: state.problems_and_opportunities.problem_areas,
    opportunity_areas_sorted: state.problems_and_opportunities.opportunity_areas_sorted,
    problem_stories: state.problems_and_opportunities.problem_stories_structured || [],
    priority_areas: state.session_metadata.priority_areas
  };

  // Construir deep dives
  const deepDives: DeepDiveOutput[] = Object.entries(state.deep_dives).map(([area, dive]) => {
    // Detectar oportunidades de automação baseado em tags
    const autoOpps = [];
    if (dive.tags?.includes('processo_manual')) {
      autoOpps.push(`Automatizar processo manual em ${area}`);
    }
    if (dive.tags?.includes('planilha_critica')) {
      autoOpps.push(`Substituir planilhas críticas por sistema em ${area}`);
    }
    if (dive.tags?.includes('oportunidade_ia_automacao')) {
      autoOpps.push(`Aplicar IA para automação em ${area}`);
    }

    return {
      area,
      answers: dive.answers || {},
      tags: (dive.tags || []) as AssessmentTag[],
      process_overview: dive.process_overview,
      bottlenecks: dive.bottlenecks,
      metrics_tracked: [],
      tools_used: [],
      automation_opportunities: autoOpps,
      complexity_score: calculateComplexityScore(dive),
      maturity_score: calculateMaturityScore(dive)
    };
  });

  // Construir automation opportunities
  const detectedOpps: DetectedOpportunity[] = [];
  Object.entries(state.deep_dives).forEach(([area, dive]) => {
    (dive.tags || []).forEach(tag => {
      if (tag === 'oportunidade_ia_automacao') {
        detectedOpps.push({
          area,
          type: 'automacao',
          description: `Oportunidade de automação identificada em ${area}`,
          priority: 'high',
          tags: [tag as AssessmentTag],
          evidence: JSON.stringify(dive.answers)
        });
      }
    });
  });

  const automation: AutomationOpportunitiesOutput = {
    repetitive_tasks: state.automation_opportunities?.repetitive_tasks,
    manual_dependencies: state.automation_opportunities?.manual_dependencies,
    ai_team_wish: state.automation_opportunities?.ai_team_wish,
    detected_opportunities: detectedOpps
  };

  // Construir closing
  const closing: ClosingOutput | undefined = state.closing ? {
    single_most_important_fix: state.closing.single_most_important_fix,
    ai_readiness_score: state.closing.ai_readiness_score,
    report_focus_preference: state.closing.report_focus_preference
  } : undefined;

  // Agregar todas as tags
  const allTags: AssessmentTag[] = [];
  const tagFrequency: Record<string, number> = {};

  Object.values(state.deep_dives).forEach(dive => {
    (dive.tags || []).forEach(tag => {
      allTags.push(tag as AssessmentTag);
      tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
    });
  });

  // Calcular blocos completados
  const blocksCompleted = [...new Set(
    state.session_metadata.variations_used.map(v => {
      if (v.question_id.startsWith('intro-')) return 'intro';
      if (v.question_id.startsWith('snap-')) return 'company_snapshot';
      if (v.question_id.startsWith('exp-')) return 'expertise';
      if (v.question_id.startsWith('prob-')) return 'problems_opportunities';
      if (v.question_id.startsWith('mkt-') ||
          v.question_id.startsWith('tech-') ||
          v.question_id.startsWith('prod-') ||
          v.question_id.startsWith('finops-') ||
          v.question_id.startsWith('strat-')) return 'deep_dive';
      if (v.question_id.startsWith('auto-')) return 'automation_focus';
      if (v.question_id.startsWith('close-')) return 'closing';
      return 'unknown';
    })
  )];

  // Metadata
  const metadata: AssessmentMetadata = {
    total_questions: state.session_metadata.questions_asked,
    total_answers: state.session_metadata.questions_answered,
    llm_calls: state.session_metadata.llm_calls,
    started_at: state.session_metadata.started_at,
    completed_at: now.toISOString(),
    duration_seconds: durationSeconds,
    variations_used: state.session_metadata.variations_used.length,
    unique_questions_asked: new Set(state.session_metadata.variations_used.map(v => v.question_id)).size,
    blocks_completed: blocksCompleted,
    areas_explored: state.expertise.areas,
    deep_dive_areas: Object.keys(state.deep_dives),
    all_tags: [...new Set(allTags)],
    tag_frequency: tagFrequency,
    completeness_percentage: Math.min(100, Math.round((state.session_metadata.questions_asked / 30) * 100))
  };

  return {
    sessionId: state.session_metadata.session_id,
    userId: state.session_metadata.user_id,
    completedAt: now.toISOString(),
    company,
    respondent,
    problems_and_opportunities: problemsOpps,
    deep_dives: deepDives,
    automation_opportunities: automation,
    closing,
    metadata
  };
}

/**
 * Calcula score de complexidade baseado em tags e respostas
 */
function calculateComplexityScore(dive: any): number {
  let score = 5; // Base

  // Tags que aumentam complexidade
  if (dive.tags?.includes('tech_legado')) score += 2;
  if (dive.tags?.includes('dependencia_pessoa')) score += 1;
  if (dive.tags?.includes('integracao_manual')) score += 1;
  if (dive.tags?.includes('dado_nao_estruturado')) score += 1;

  return Math.min(10, score);
}

/**
 * Calcula score de maturidade digital
 */
function calculateMaturityScore(dive: any): number {
  let score = 5; // Base

  // Tags que reduzem maturidade
  if (dive.tags?.includes('processo_manual')) score -= 2;
  if (dive.tags?.includes('planilha_critica')) score -= 1;
  if (dive.tags?.includes('falta_metrica')) score -= 1;

  // Tags que aumentam maturidade
  if (dive.tags?.includes('oportunidade_ia_automacao')) score += 1;

  return Math.max(0, Math.min(10, score));
}
