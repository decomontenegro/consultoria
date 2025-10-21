import { ImplementationPlan, ImplementationPhase, Milestone, DEFAULT_PHASES } from '../types/implementation-tracker';

const STORAGE_KEY = 'culturabuilder_implementation_plans';

/**
 * Get all implementation plans
 */
export function getAllImplementationPlans(): Record<string, ImplementationPlan> {
  if (typeof window === 'undefined') return {};

  const plansStr = localStorage.getItem(STORAGE_KEY);
  if (!plansStr) return {};

  try {
    return JSON.parse(plansStr);
  } catch {
    return {};
  }
}

/**
 * Get implementation plan by ID
 */
export function getImplementationPlan(id: string): ImplementationPlan | null {
  const plans = getAllImplementationPlans();
  return plans[id] || null;
}

/**
 * Create implementation plan from report
 */
export function createImplementationPlan(reportId: string, companyName: string): ImplementationPlan {
  const now = new Date().toISOString();
  const phases: ImplementationPhase[] = DEFAULT_PHASES.map((phase, index) => ({
    ...phase,
    id: `phase-${index + 1}`,
    startDate: now,
    targetEndDate: new Date(Date.now() + (index + 1) * 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days per phase
    actualEndDate: null,
  }));

  const plan: ImplementationPlan = {
    id: `impl-${Date.now()}`,
    reportId,
    companyName,
    createdAt: now,
    updatedAt: now,
    phases,
    overallProgress: 0,
    status: 'planning',
  };

  saveImplementationPlan(plan);
  return plan;
}

/**
 * Save implementation plan
 */
export function saveImplementationPlan(plan: ImplementationPlan): void {
  const plans = getAllImplementationPlans();
  plan.updatedAt = new Date().toISOString();
  plan.overallProgress = calculateOverallProgress(plan);
  plans[plan.id] = plan;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

/**
 * Update milestone
 */
export function updateMilestone(
  planId: string,
  phaseId: string,
  milestoneId: string,
  updates: Partial<Milestone>
): void {
  const plan = getImplementationPlan(planId);
  if (!plan) return;

  const phase = plan.phases.find(p => p.id === phaseId);
  if (!phase) return;

  const milestone = phase.milestones.find(m => m.id === milestoneId);
  if (!milestone) return;

  Object.assign(milestone, updates);

  // Auto-complete if progress is 100%
  if (milestone.progress === 100 && milestone.status !== 'completed') {
    milestone.status = 'completed';
    milestone.completedAt = new Date().toISOString();
  }

  saveImplementationPlan(plan);
}

/**
 * Calculate overall progress
 */
function calculateOverallProgress(plan: ImplementationPlan): number {
  let totalMilestones = 0;
  let completedMilestones = 0;

  plan.phases.forEach(phase => {
    totalMilestones += phase.milestones.length;
    completedMilestones += phase.milestones.filter(m => m.status === 'completed').length;
  });

  return totalMilestones === 0 ? 0 : Math.round((completedMilestones / totalMilestones) * 100);
}

/**
 * Delete implementation plan
 */
export function deleteImplementationPlan(id: string): void {
  const plans = getAllImplementationPlans();
  delete plans[id];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}
