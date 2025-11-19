/**
 * API Cost Tracking Middleware
 *
 * Helper functions to track Claude API costs in Next.js API routes
 */

import { getCostTracker, CostEntry } from './cost-tracker';

/**
 * Track Follow-up API call cost
 */
export function trackFollowupCost(
  inputTokens: number,
  outputTokens: number,
  environment: 'test' | 'production' = 'production',
  requestId?: string
): CostEntry {
  const tracker = getCostTracker();
  return tracker.track({
    service: 'followup',
    inputTokens,
    outputTokens,
    environment,
    requestId,
  });
}

/**
 * Track Insights API call cost
 */
export function trackInsightsCost(
  inputTokens: number,
  outputTokens: number,
  environment: 'test' | 'production' = 'production',
  requestId?: string
): CostEntry {
  const tracker = getCostTracker();
  return tracker.track({
    service: 'insights',
    inputTokens,
    outputTokens,
    environment,
    requestId,
  });
}

/**
 * Check if request is allowed under budget constraints
 */
export function checkBudget(estimatedCost: number = 0.60): {
  allowed: boolean;
  reason?: string;
  summary: ReturnType<ReturnType<typeof getCostTracker>['getSummary']>;
} {
  const tracker = getCostTracker();
  const check = tracker.canMakeRequest(estimatedCost);
  const summary = tracker.getSummary();

  return {
    ...check,
    summary,
  };
}

/**
 * Get cost summary for reporting
 */
export function getCostSummary() {
  const tracker = getCostTracker();
  return tracker.getSummary();
}

/**
 * Middleware wrapper for API routes with budget control
 */
export async function withBudgetControl<T>(
  handler: () => Promise<T>,
  options: {
    service: 'followup' | 'insights';
    estimatedCost?: number;
    environment?: 'test' | 'production';
    onBudgetExceeded?: (reason: string) => void;
  }
): Promise<T> {
  const { allowed, reason } = checkBudget(options.estimatedCost);

  if (!allowed && reason) {
    if (options.onBudgetExceeded) {
      options.onBudgetExceeded(reason);
    }
    throw new Error(`Budget exceeded: ${reason}`);
  }

  return handler();
}
