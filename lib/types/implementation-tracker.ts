/**
 * Implementation Tracker Types
 */

export type MilestoneStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked';

export interface Milestone {
  id: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  dueDate: string | null;
  completedAt: string | null;
  progress: number; // 0-100
  dependencies: string[]; // IDs of milestones that must be completed first
  assignee?: string;
  notes?: string;
}

export interface ImplementationPhase {
  id: string;
  name: string;
  description: string;
  milestones: Milestone[];
  startDate: string;
  targetEndDate: string;
  actualEndDate: string | null;
}

export interface ImplementationPlan {
  id: string;
  reportId: string;
  companyName: string;
  createdAt: string;
  updatedAt: string;
  phases: ImplementationPhase[];
  overallProgress: number; // 0-100
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
}

/**
 * Default implementation phases based on roadmap
 */
export const DEFAULT_PHASES: Omit<ImplementationPhase, 'id' | 'startDate' | 'targetEndDate' | 'actualEndDate'>[] = [
  {
    name: 'Fase 1: Preparação',
    description: 'Setup inicial e preparação da equipe',
    milestones: [
      {
        id: 'prep-1',
        title: 'Aprovação Executiva',
        description: 'Obter aprovação final da liderança',
        status: 'not_started',
        dueDate: null,
        completedAt: null,
        progress: 0,
        dependencies: [],
      },
      {
        id: 'prep-2',
        title: 'Formar Equipe de Implementação',
        description: 'Definir roles e responsabilidades',
        status: 'not_started',
        dueDate: null,
        completedAt: null,
        progress: 0,
        dependencies: ['prep-1'],
      },
      {
        id: 'prep-3',
        title: 'Setup de Infraestrutura',
        description: 'Configurar ferramentas e ambientes',
        status: 'not_started',
        dueDate: null,
        completedAt: null,
        progress: 0,
        dependencies: ['prep-2'],
      },
    ],
  },
  {
    name: 'Fase 2: Pilot Program',
    description: 'Programa piloto com time reduzido',
    milestones: [
      {
        id: 'pilot-1',
        title: 'Selecionar Time Piloto',
        description: 'Escolher 5-10 pessoas para piloto',
        status: 'not_started',
        dueDate: null,
        completedAt: null,
        progress: 0,
        dependencies: [],
      },
      {
        id: 'pilot-2',
        title: 'Treinamento Inicial',
        description: 'Onboarding e treinamento básico',
        status: 'not_started',
        dueDate: null,
        completedAt: null,
        progress: 0,
        dependencies: ['pilot-1'],
      },
      {
        id: 'pilot-3',
        title: 'Medir Resultados do Piloto',
        description: 'Coletar métricas de produtividade',
        status: 'not_started',
        dueDate: null,
        completedAt: null,
        progress: 0,
        dependencies: ['pilot-2'],
      },
    ],
  },
  {
    name: 'Fase 3: Rollout Gradual',
    description: 'Expansão para toda a organização',
    milestones: [
      {
        id: 'rollout-1',
        title: 'Wave 1 - Early Adopters (20%)',
        description: 'Expandir para equipes early adopters',
        status: 'not_started',
        dueDate: null,
        completedAt: null,
        progress: 0,
        dependencies: [],
      },
      {
        id: 'rollout-2',
        title: 'Wave 2 - Majority (60%)',
        description: 'Rollout para maioria da organização',
        status: 'not_started',
        dueDate: null,
        completedAt: null,
        progress: 0,
        dependencies: ['rollout-1'],
      },
      {
        id: 'rollout-3',
        title: 'Wave 3 - Final 20%',
        description: 'Completar rollout organization-wide',
        status: 'not_started',
        dueDate: null,
        completedAt: null,
        progress: 0,
        dependencies: ['rollout-2'],
      },
    ],
  },
  {
    name: 'Fase 4: Otimização',
    description: 'Melhoria contínua e expansão',
    milestones: [
      {
        id: 'opt-1',
        title: 'Review de 30 Dias',
        description: 'Análise de resultados e ajustes',
        status: 'not_started',
        dueDate: null,
        completedAt: null,
        progress: 0,
        dependencies: [],
      },
      {
        id: 'opt-2',
        title: 'Implementar Best Practices',
        description: 'Compartilhar learnings e otimizar processos',
        status: 'not_started',
        dueDate: null,
        completedAt: null,
        progress: 0,
        dependencies: ['opt-1'],
      },
      {
        id: 'opt-3',
        title: 'Medir ROI Real',
        description: 'Comparar resultados vs projeções',
        status: 'not_started',
        dueDate: null,
        completedAt: null,
        progress: 0,
        dependencies: ['opt-2'],
      },
    ],
  },
];
