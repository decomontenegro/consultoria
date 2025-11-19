/**
 * Cost Tracking System for Claude API Usage
 *
 * Monitors API costs in real-time and provides budget controls
 * Supports both Follow-up Orchestrator and Insights Engine
 *
 * PRICING (as of 2025-01):
 * - Input: R$ 0.018 per 1k tokens
 * - Output: R$ 0.090 per 1k tokens
 * - Exchange rate: R$ 6.00 = $1.00
 */

export interface CostEntry {
  timestamp: Date;
  service: 'followup' | 'insights';
  inputTokens: number;
  outputTokens: number;
  cost: number;
  environment: 'test' | 'production';
  requestId?: string;
}

export interface BudgetConfig {
  dailyLimit: number;   // R$ per day
  monthlyLimit: number; // R$ per month
  alertThreshold: number; // % (e.g., 0.8 = 80%)
}

export interface CostSummary {
  today: number;
  thisMonth: number;
  dailyBudgetRemaining: number;
  monthlyBudgetRemaining: number;
  percentUsedDaily: number;
  percentUsedMonthly: number;
  entries: CostEntry[];
}

class CostTracker {
  private entries: CostEntry[] = [];
  private budgetConfig: BudgetConfig;

  // Default conservative budget for testing environment
  private readonly DEFAULT_BUDGET: BudgetConfig = {
    dailyLimit: 5.00,      // R$ 5/day
    monthlyLimit: 127.00,  // R$ 127/month (70 executions @ R$1.82)
    alertThreshold: 0.80,  // Alert at 80% usage
  };

  constructor(config?: Partial<BudgetConfig>) {
    this.budgetConfig = {
      ...this.DEFAULT_BUDGET,
      ...config,
    };

    // Load existing entries from storage if available
    this.loadFromStorage();
  }

  /**
   * Calculate cost from token usage
   */
  calculateCost(inputTokens: number, outputTokens: number): number {
    const INPUT_COST_PER_1K = 0.018;  // R$ 0.018 per 1k tokens
    const OUTPUT_COST_PER_1K = 0.090; // R$ 0.090 per 1k tokens

    const inputCost = (inputTokens / 1000) * INPUT_COST_PER_1K;
    const outputCost = (outputTokens / 1000) * OUTPUT_COST_PER_1K;

    return Math.round((inputCost + outputCost) * 100) / 100; // Round to 2 decimals
  }

  /**
   * Track a new API call
   */
  track(entry: Omit<CostEntry, 'timestamp' | 'cost'>): CostEntry {
    const cost = this.calculateCost(entry.inputTokens, entry.outputTokens);

    const fullEntry: CostEntry = {
      ...entry,
      timestamp: new Date(),
      cost,
    };

    this.entries.push(fullEntry);
    this.saveToStorage();

    // Check budget limits
    const summary = this.getSummary();
    if (summary.percentUsedDaily >= this.budgetConfig.alertThreshold) {
      this.alertBudgetThreshold('daily', summary.percentUsedDaily);
    }
    if (summary.percentUsedMonthly >= this.budgetConfig.alertThreshold) {
      this.alertBudgetThreshold('monthly', summary.percentUsedMonthly);
    }

    return fullEntry;
  }

  /**
   * Get cost summary for current period
   */
  getSummary(): CostSummary {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayEntries = this.entries.filter(e => e.timestamp >= todayStart);
    const monthEntries = this.entries.filter(e => e.timestamp >= monthStart);

    const today = todayEntries.reduce((sum, e) => sum + e.cost, 0);
    const thisMonth = monthEntries.reduce((sum, e) => sum + e.cost, 0);

    const dailyBudgetRemaining = Math.max(0, this.budgetConfig.dailyLimit - today);
    const monthlyBudgetRemaining = Math.max(0, this.budgetConfig.monthlyLimit - thisMonth);

    const percentUsedDaily = (today / this.budgetConfig.dailyLimit) * 100;
    const percentUsedMonthly = (thisMonth / this.budgetConfig.monthlyLimit) * 100;

    return {
      today: Math.round(today * 100) / 100,
      thisMonth: Math.round(thisMonth * 100) / 100,
      dailyBudgetRemaining: Math.round(dailyBudgetRemaining * 100) / 100,
      monthlyBudgetRemaining: Math.round(monthlyBudgetRemaining * 100) / 100,
      percentUsedDaily: Math.round(percentUsedDaily * 10) / 10,
      percentUsedMonthly: Math.round(percentUsedMonthly * 10) / 10,
      entries: this.entries,
    };
  }

  /**
   * Check if budget allows for a new request
   */
  canMakeRequest(estimatedCost: number = 0.60): { allowed: boolean; reason?: string } {
    const summary = this.getSummary();

    // Check daily limit
    if (summary.today + estimatedCost > this.budgetConfig.dailyLimit) {
      return {
        allowed: false,
        reason: `Daily budget exceeded (R$ ${summary.today.toFixed(2)} + R$ ${estimatedCost.toFixed(2)} > R$ ${this.budgetConfig.dailyLimit.toFixed(2)})`,
      };
    }

    // Check monthly limit
    if (summary.thisMonth + estimatedCost > this.budgetConfig.monthlyLimit) {
      return {
        allowed: false,
        reason: `Monthly budget exceeded (R$ ${summary.thisMonth.toFixed(2)} + R$ ${estimatedCost.toFixed(2)} > R$ ${this.budgetConfig.monthlyLimit.toFixed(2)})`,
      };
    }

    return { allowed: true };
  }

  /**
   * Get entries filtered by criteria
   */
  getEntries(filter?: {
    service?: 'followup' | 'insights';
    environment?: 'test' | 'production';
    startDate?: Date;
    endDate?: Date;
  }): CostEntry[] {
    let filtered = this.entries;

    if (filter) {
      if (filter.service) {
        filtered = filtered.filter(e => e.service === filter.service);
      }
      if (filter.environment) {
        filtered = filtered.filter(e => e.environment === filter.environment);
      }
      if (filter.startDate) {
        filtered = filtered.filter(e => e.timestamp >= filter.startDate!);
      }
      if (filter.endDate) {
        filtered = filtered.filter(e => e.timestamp <= filter.endDate!);
      }
    }

    return filtered;
  }

  /**
   * Clear all tracking data
   */
  clear(): void {
    this.entries = [];
    this.saveToStorage();
  }

  /**
   * Export data for reporting
   */
  exportCSV(): string {
    const headers = ['Timestamp', 'Service', 'Environment', 'Input Tokens', 'Output Tokens', 'Cost (R$)', 'Request ID'];
    const rows = this.entries.map(e => [
      e.timestamp.toISOString(),
      e.service,
      e.environment,
      e.inputTokens.toString(),
      e.outputTokens.toString(),
      e.cost.toFixed(2),
      e.requestId || '',
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  /**
   * Alert when budget threshold is reached
   */
  private alertBudgetThreshold(period: 'daily' | 'monthly', percentUsed: number): void {
    const threshold = this.budgetConfig.alertThreshold * 100;
    console.warn(
      `[COST TRACKER] ⚠️  ${period.toUpperCase()} budget alert: ${percentUsed.toFixed(1)}% used (threshold: ${threshold}%)`
    );
  }

  /**
   * Load entries from localStorage (browser) or file (Node.js)
   */
  private loadFromStorage(): void {
    // In browser environment
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem('claudeApiCostTracker');
        if (stored) {
          const parsed = JSON.parse(stored);
          this.entries = parsed.map((e: any) => ({
            ...e,
            timestamp: new Date(e.timestamp),
          }));
        }
      } catch (error) {
        console.error('[COST TRACKER] Failed to load from localStorage:', error);
      }
    }

    // In Node.js environment, could load from file
    // For now, keeping it simple with in-memory storage
  }

  /**
   * Save entries to localStorage (browser) or file (Node.js)
   */
  private saveToStorage(): void {
    // In browser environment
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('claudeApiCostTracker', JSON.stringify(this.entries));
      } catch (error) {
        console.error('[COST TRACKER] Failed to save to localStorage:', error);
      }
    }

    // In Node.js environment, could save to file
    // For now, keeping it simple with in-memory storage
  }
}

// Singleton instance for global usage
let globalTracker: CostTracker | null = null;

export function getCostTracker(config?: Partial<BudgetConfig>): CostTracker {
  if (!globalTracker) {
    globalTracker = new CostTracker(config);
  }
  return globalTracker;
}

export function resetCostTracker(): void {
  globalTracker = null;
}

export default CostTracker;
