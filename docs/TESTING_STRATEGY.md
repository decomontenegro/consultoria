# 🎯 Testing Strategy: 100% API Real

**Decision Date:** 2025-11-14
**Approach:** Always use real Claude API (no mocks)
**Rationale:** Maximum confidence in AI behavior, authentic testing

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Cost Management](#cost-management)
4. [Running Tests](#running-tests)
5. [CI/CD Integration](#cicd-integration)
6. [Monitoring & Alerts](#monitoring--alerts)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Overview

### Strategy Summary

This project uses a **100% API Real** testing strategy for FASE 2 (Follow-up Orchestrator) and FASE 3 (Insights Engine). All tests call the actual Claude API with no mocking.

### Key Characteristics

- **Authenticity:** Tests interact with real Claude API
- **Serial Execution:** Tests run sequentially to avoid rate limits
- **Budget Controls:** Cost tracking and limits built-in
- **Slow but Confident:** ~30s execution time, but 100% real behavior

### Why This Approach?

Based on explicit decision: "nao usar mocks, sempre api real"

**Advantages:**
- ✅ Maximum confidence in AI responses
- ✅ Catches real API issues (rate limits, errors, model changes)
- ✅ Validates actual token usage and costs
- ✅ No mock drift (tests always match production)

**Trade-offs:**
- ⚠️ Costs R$ 1.82-3.30 per execution
- ⚠️ Slower execution (~30s vs 1.2s with mocks)
- ⚠️ Requires API key in CI/CD
- ⚠️ Subject to rate limits (50 req/min)

---

## Architecture

### Test Structure

```
tests/
├── mocks/                          # Created but not used (future option)
│   ├── claude-mock-followups.ts
│   └── claude-mock-insights.ts
├── fixtures/                       # Test scenarios (reusable)
│   ├── followup-scenarios.ts       (7 scenarios)
│   └── insights-scenarios.ts       (4 scenarios)
├── fase2-followups/
│   └── followup-api.spec.ts        (8 tests - R$0.90)
└── fase3-insights/
    └── insights-api.spec.ts        (8 tests - R$2.40)
```

### Test Configuration

Both test files use:
- **Serial execution:** `test.describe.configure({ mode: 'serial' })`
- **60s timeouts:** `.timeout(60000)` for API calls
- **2s delays:** `delayForRateLimit()` between tests
- **Real API:** No mocking, direct calls to `localhost:3000/api/*`

### Cost Tracking System

```typescript
// lib/monitoring/cost-tracker.ts
const tracker = getCostTracker();
tracker.track({
  service: 'followup' | 'insights',
  inputTokens: 1000,
  outputTokens: 500,
  environment: 'test' | 'production',
});
```

**Features:**
- Real-time cost calculation
- Daily/monthly budget limits
- 80% threshold alerts
- CSV export for reporting

---

## Cost Management

### Pricing (Claude 3.5 Sonnet)

- **Input tokens:** R$ 0.018 per 1k tokens
- **Output tokens:** R$ 0.090 per 1k tokens
- **Exchange rate:** R$ 6.00 = $1.00

### Cost per Test Suite

| Suite | Tests | Estimated Cost | Real Scenario |
|-------|-------|----------------|---------------|
| **Follow-ups** | 8 | R$ 0.90 | ~1,000 input + 500 output tokens avg |
| **Insights** | 8 | R$ 2.40 | ~3,000 input + 2,000 output tokens avg |
| **Both (Full)** | 16 | R$ 3.30 | Total for complete run |

### Monthly Budget Scenarios

#### Conservative (Recommended)
- **Frequency:** 70 runs/month (~2-3 per day)
- **Cost:** R$ 127/month
- **Use case:** Active development, frequent changes

#### Moderate
- **Frequency:** 30 runs/month (~1 per day)
- **Cost:** R$ 55/month
- **Use case:** Stable codebase, maintenance mode

#### Minimal
- **Frequency:** 5 runs/month (weekly)
- **Cost:** R$ 9/month
- **Use case:** Production monitoring only

### Budget Controls

**Default Limits (Test Environment):**
```typescript
{
  dailyLimit: 5.00,      // R$ 5/day
  monthlyLimit: 127.00,  // R$ 127/month
  alertThreshold: 0.80,  // Alert at 80%
}
```

**Checking Budget Before Test:**
```typescript
import { checkBudget } from '@/lib/monitoring/api-cost-middleware';

const { allowed, reason, summary } = checkBudget(0.60);
if (!allowed) {
  console.error('Budget exceeded:', reason);
  process.exit(1);
}
```

---

## Running Tests

### Local Execution

#### 1. Start Dev Server
```bash
npm run dev
# Server starts at http://localhost:3000
```

#### 2. Run Tests

**All tests (R$ 3.30):**
```bash
npx playwright test tests/fase2-followups tests/fase3-insights
```

**Follow-ups only (R$ 0.90):**
```bash
npx playwright test tests/fase2-followups/followup-api.spec.ts
```

**Insights only (R$ 2.40):**
```bash
npx playwright test tests/fase3-insights/insights-api.spec.ts
```

**Health checks only (Free):**
```bash
npx playwright test -g "GET health check"
```

#### 3. View Report
```bash
npx playwright show-report
```

### Environment Variables

Required:
```bash
ANTHROPIC_API_KEY=sk-ant-...
```

Optional:
```bash
NODE_ENV=test                    # Enables test mode
PLAYWRIGHT_TEST_MODE=true        # For future mock support
```

---

## CI/CD Integration

### GitHub Actions Workflow

**File:** `.github/workflows/test-playwright-api.yml`

### Triggers

1. **Manual (workflow_dispatch):**
   - Choose test suite: all, followups-only, insights-only, health-checks-only
   - Useful for controlled testing

2. **Scheduled:**
   - **Daily (9 AM UTC):** Health checks only (Free)
   - **Weekly (Monday 10 AM UTC):** Full tests (R$ 3.30)

3. **Pull Request:**
   - On PR to main affecting test files
   - Health checks only (Free)

### Setup Secrets

Add to GitHub repository settings:
```
ANTHROPIC_API_KEY = sk-ant-api-...
```

### Monthly CI/CD Cost

With default schedule:
- Daily health checks: R$ 0.00 × 30 = **R$ 0.00**
- Weekly full tests: R$ 3.30 × 4 = **R$ 13.20**
- **Total: R$ 13.20/month** (10.4% of budget)

Leaves R$ 113.80/month for:
- Manual test runs: ~34 additional full runs
- Local development testing
- Buffer for debugging

---

## Monitoring & Alerts

### Cost Tracking

**View Summary:**
```typescript
import { getCostSummary } from '@/lib/monitoring/api-cost-middleware';

const summary = getCostSummary();
console.log('Today:', summary.today);
console.log('This month:', summary.thisMonth);
console.log('Daily budget remaining:', summary.dailyBudgetRemaining);
```

**Export Report:**
```typescript
import { getCostTracker } from '@/lib/monitoring/cost-tracker';

const tracker = getCostTracker();
const csv = tracker.exportCSV();
// Save to file or send to analytics
```

### Budget Alerts

Automatic alerts trigger at 80% usage:
```
[COST TRACKER] ⚠️  DAILY budget alert: 82.5% used (threshold: 80%)
```

**Alert Channels (Future):**
- Console warnings (current)
- Slack notifications (todo)
- Email reports (todo)
- GitHub Issues (todo)

### Dashboard (Future Enhancement)

Planned features:
- Real-time cost graphs
- Service breakdown (followups vs insights)
- Daily/weekly/monthly trends
- Budget forecasting
- Cost per test metrics

---

## Best Practices

### 1. Cost Optimization

✅ **Do:**
- Run health checks frequently (free)
- Run full tests weekly in CI/CD
- Use manual triggers for debugging
- Monitor budget dashboard regularly

❌ **Don't:**
- Run full tests on every commit
- Execute tests in parallel (rate limits)
- Forget to check budget before mass testing
- Ignore budget alerts

### 2. Test Execution

✅ **Do:**
- Wait for server to be ready (`wait-on http://localhost:3000`)
- Use serial execution mode
- Add delays between API calls
- Set appropriate timeouts (60s)

❌ **Don't:**
- Run tests before server starts
- Execute tests in parallel
- Set short timeouts (<30s)
- Ignore rate limit errors

### 3. Debugging

✅ **Do:**
- Use `--debug` flag for step-through debugging
- Check console logs for cost tracking
- Verify API responses in Playwright report
- Use health checks to validate setup

❌ **Don't:**
- Re-run failing tests immediately (costs add up)
- Skip reviewing Playwright report
- Ignore token usage patterns
- Debug in production environment

### 4. CI/CD

✅ **Do:**
- Use scheduled runs for regular testing
- Set up budget alerts
- Review cost reports monthly
- Adjust schedule based on activity

❌ **Don't:**
- Enable on every push/PR
- Skip manual approval for expensive runs
- Ignore failed test notifications
- Forget to rotate API keys

---

## Troubleshooting

### Tests Timing Out

**Symptom:** `Test timeout of 60000ms exceeded`

**Solutions:**
1. Check if dev server is running: `curl http://localhost:3000/api/consultant-followup`
2. Verify API key is set: `echo $ANTHROPIC_API_KEY`
3. Increase timeout: `.timeout(120000)` (2 minutes)
4. Check Claude API status: https://status.anthropic.com

### Rate Limit Errors

**Symptom:** `429 Too Many Requests`

**Solutions:**
1. Ensure serial execution: `test.describe.configure({ mode: 'serial' })`
2. Add delays: `await delayForRateLimit()` (2s between tests)
3. Check Anthropic tier limits (Tier 1: 50 req/min)
4. Reduce parallel test workers: `npx playwright test --workers=1`

### Budget Exceeded

**Symptom:** `Budget exceeded: Daily budget exceeded`

**Solutions:**
1. Check current usage: `getCostSummary()`
2. Increase limits if needed (edit `cost-tracker.ts`)
3. Wait until next day (daily limit resets at midnight)
4. Clear tracking data: `tracker.clear()` (testing only)

### API Key Invalid

**Symptom:** `401 Unauthorized` or `Invalid API key`

**Solutions:**
1. Verify key format: starts with `sk-ant-api03-`
2. Check expiration date
3. Regenerate key in Anthropic Console
4. Update GitHub secrets for CI/CD

### Wrong Port

**Symptom:** `ECONNREFUSED localhost:3003`

**Solutions:**
1. Verify dev server port: `npm run dev` (should show port 3000)
2. Check test files use correct BASE_URL: `http://localhost:3000`
3. Update playwright.config.ts if needed

---

## Future Enhancements

### Short-term (Next 2 Weeks)

- [ ] Implement server-side mock flag (`__testMode`)
- [ ] Add Slack notifications for budget alerts
- [ ] Create cost dashboard UI component
- [ ] Setup automated monthly reports

### Medium-term (Next Month)

- [ ] Hybrid approach: Unit tests (no API) + Integration tests (mocks) + E2E (real)
- [ ] A/B testing: Compare real API vs mocks for drift detection
- [ ] Cost optimization: Caching frequent scenarios
- [ ] Performance benchmarks: Track response times

### Long-term (Next Quarter)

- [ ] ML-based cost prediction
- [ ] Automatic budget adjustment based on usage patterns
- [ ] Multi-region support (cost comparison)
- [ ] Integration with analytics platform

---

## Quick Reference

### Commands

```bash
# Run all tests
npx playwright test tests/fase2-followups tests/fase3-insights

# Run specific suite
npx playwright test tests/fase2-followups    # R$ 0.90
npx playwright test tests/fase3-insights     # R$ 2.40

# Health checks only (free)
npx playwright test -g "GET health check"

# Debug mode
npx playwright test --debug

# View report
npx playwright show-report

# Check budget
node -e "const {getCostSummary}=require('./lib/monitoring/api-cost-middleware');console.log(getCostSummary())"
```

### Cost Calculator

```
Per execution:
- Follow-ups: R$ 0.90
- Insights: R$ 2.40
- Full suite: R$ 3.30

Monthly projections:
- Daily runs: R$ 3.30 × 30 = R$ 99/month
- Weekly runs: R$ 3.30 × 4 = R$ 13.20/month
- Budget limit: R$ 127/month
```

### Contact

**Questions?** Open an issue in the repository
**Budget concerns?** Review this document and adjust limits as needed
**API issues?** Check https://status.anthropic.com

---

**Last Updated:** 2025-11-14
**Version:** 1.0.0
**Author:** Claude Code (AI Assistant)
