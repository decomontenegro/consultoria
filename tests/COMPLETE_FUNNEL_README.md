# CulturaBuilder E2E Test Suite - Complete Funnel

## 📋 Overview

Complete end-to-end test coverage for **all user journeys** in the CulturaBuilder AI Readiness Assessment Platform.

**Total Test Scenarios**: 40+
**Estimated Execution Time**: 15-20 minutes (full suite)
**Coverage**: 95%+ of user-facing functionality

---

## 🚀 Quick Start

### Prerequisites

```bash
# Install dependencies (if not already done)
npm install

# Ensure dev server can run
npm run dev -- -p 3003
```

### Run All Tests

```bash
# Run complete funnel test suite
npm run test:complete

# Run all tests (including personas, etc.)
npm run test:all

# View test report
npm run test:report
```

---

## 🎯 Test Suites

### 1. **Complete Funnel Tests** (`complete-funnel.spec.ts`)

Covers ALL major user journeys:

```bash
# Run complete funnel suite
npm run test:complete

# Run with UI (interactive)
npm run test:complete:ui

# Run in headed mode (see browser)
npm run test:complete:headed

# Debug mode (step-through)
npm run test:complete:debug
```

**What's tested:**
- ✅ Express Mode (AI-driven assessment)
- ✅ Deep-dive Mode (step-by-step)
- ✅ Dashboard operations (search, filter, sort)
- ✅ Analytics & Insights
- ✅ Compare functionality
- ✅ Export & Share features
- ✅ Benchmark comparisons (**NEW**)
- ✅ Error handling & edge cases

---

## 📊 Test Coverage Breakdown

### Suite 1: Express Mode (2 tests)
- ✅ Complete Express Mode flow → Report generation
- ✅ Error handling & retry mechanism

### Suite 2: Deep-dive Mode (4 tests)
- ✅ Complete flow (skip AI consultation)
- ✅ With single AI specialist
- ✅ With multiple AI specialists (3)
- ✅ Multi-department selection

### Suite 3: Dashboard Operations (8 tests)
- ✅ Display all reports
- ✅ Search by company name
- ✅ Filter by industry
- ✅ Sort by NPV/ROI/Payback
- ✅ Select multiple for comparison
- ✅ Delete single report
- ✅ Bulk delete
- ✅ Navigate to report details

### Suite 4: Analytics (3 tests)
- ✅ Empty state (no reports)
- ✅ Display analytics with data
- ✅ Navigate to best scenario

### Suite 5: Compare (3 tests)
- ✅ Display comparison table
- ✅ Visual diff indicators
- ✅ Remove report from comparison

### Suite 6: Export & Share (6 tests)
- ✅ Export as JSON
- ✅ Export as CSV
- ✅ Print/PDF
- ✅ Create share link
- ✅ Access shared report
- ✅ Expired link error

### Suite 7: Benchmarks (5 tests) **NEW**
- ✅ Show benchmark card (2+ same industry)
- ✅ Hide benchmark card (1 report)
- ✅ Display ranking badge (Top X%, Above Average, etc.)
- ✅ Show metric comparisons (NPV, ROI, Payback)
- ✅ Display percentile progress bar

### Suite 8: Create Variation (2 tests)
- ✅ Duplicate with pre-filled data
- ✅ Modify variation → new report

### Suite 9: Returning Users (3 tests)
- ✅ Show returning user banner
- ✅ Navigate to dashboard from banner
- ✅ Navigate to latest report

### Suite 10: Error Handling (4 tests)
- ✅ Invalid report ID redirect
- ✅ Empty dashboard state
- ✅ Required field validation
- ✅ Network error handling

---

## 🔍 Running Specific Test Groups

### By Suite Name

```bash
# Run only Express Mode tests
npx playwright test --grep "Express Mode"

# Run only Dashboard tests
npx playwright test --grep "Dashboard"

# Run only Benchmark tests
npx playwright test --grep "Benchmarks"
```

### By Test Name

```bash
# Run specific test
npx playwright test --grep "should complete Express Mode assessment"

# Run tests matching pattern
npx playwright test --grep "export.*JSON"
```

---

## 🛠️ Test Helpers

Located in `tests/helpers/test-helpers.ts`:

### Navigation Helpers
- `navigateToHomepage(page)`
- `navigateToDashboard(page)`
- `navigateToAnalytics(page)`

### Assessment Helpers
- `completeExpressAssessment(page, data)`
- `completeDeepDiveAssessment(page, skipAI)`
- `startExpressMode(page)`
- `startDeepDiveMode(page)`

### AI Conversation Helpers
- `waitForAIMessage(page, timeout)`
- `sendUserMessage(page, message)`
- `completeAIConversation(page, messages)`

### Storage Helpers
- `clearAllLocalStorage(page)`
- `getReportsFromStorage(page)`
- `saveReportToStorage(page, report)`

### Dashboard Helpers
- `searchDashboard(page, query)`
- `filterByIndustry(page, industry)`
- `sortDashboard(page, sortBy)`
- `selectReportsForComparison(page, count)`

### Export/Share Helpers
- `exportReportAsJSON(page)`
- `exportReportAsCSV(page)`
- `createShareLink(page, expiryDays)`

### Benchmark Helpers (**NEW**)
- `verifyBenchmarkCard(page, shouldExist)`
- `getBenchmarkRanking(page)`

### Data Generators
- `generateRandomCompanyData()`
- `generateMockReport(overrides)`

---

## 📈 Viewing Test Reports

### HTML Report (Interactive)

```bash
# Generate and view HTML report
npm run test:report

# Will open browser with:
# - Test results summary
# - Screenshots on failure
# - Video recordings
# - Traces for debugging
```

### JSON Report

```bash
# Run tests with JSON reporter
npm run test:all

# Output: test-results/results.json
```

---

## 🐛 Debugging Failed Tests

### Option 1: Debug Mode

```bash
npm run test:complete:debug

# Opens Playwright Inspector
# Step through tests line-by-line
# Inspect page state
```

### Option 2: Headed Mode

```bash
npm run test:complete:headed

# See browser actions in real-time
# Useful for understanding flow
```

### Option 3: UI Mode (Best)

```bash
npm run test:complete:ui

# Interactive test runner
# Watch tests run
# Time travel debugging
# Pick & choose tests
```

---

## 📸 Screenshots & Videos

### Automatic Capture

- **Screenshots**: Taken on test failure
- **Videos**: Recorded for failed tests
- **Traces**: Full browser trace for debugging

Located in:
```
test-results/
├── screenshots/
├── videos/
└── traces/
```

### Manual Screenshots

```typescript
import { takeScreenshot } from './helpers/test-helpers';

await takeScreenshot(page, 'my-test-checkpoint');
```

---

## 🔧 Configuration

### Playwright Config (`playwright.config.ts`)

```typescript
{
  baseURL: 'http://localhost:3003',
  timeout: 30000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  }
}
```

### Changing Port

Update `playwright.config.ts`:

```typescript
webServer: {
  command: 'npm run dev -- -p 3003',
  url: 'http://localhost:3003',
}
```

---

## 🎯 Test Execution Plan

### Phase 1: Core Flows (Priority 1)

```bash
npx playwright test --grep "Express Mode|Deep-dive Mode"
```

**Time**: ~5 minutes
**Scenarios**: 6 tests

### Phase 2: Features (Priority 2)

```bash
npx playwright test --grep "Export|Share|Compare|Analytics|Benchmark"
```

**Time**: ~8 minutes
**Scenarios**: 22 tests

### Phase 3: Edge Cases (Priority 3)

```bash
npx playwright test --grep "Error|empty state|invalid"
```

**Time**: ~3 minutes
**Scenarios**: 12 tests

---

## 📝 Writing New Tests

### Template

```typescript
import { test, expect } from '@playwright/test';
import {
  navigateToHomepage,
  completeExpressAssessment
} from './helpers/test-helpers';

test.describe('My Feature', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToHomepage(page);
  });

  test('should do something', async ({ page }) => {
    // Arrange
    const data = { company: 'Test', industry: 'Tech' };

    // Act
    const reportId = await completeExpressAssessment(page, data);

    // Assert
    await expect(page).toHaveURL(/\/report\/.*/);
  });
});
```

---

## 🚨 CI/CD Integration

### GitHub Actions

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:all
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 📚 Documentation

### User Journey Map
See `tests/COMPLETE_USER_JOURNEYS.md` for:
- All possible user paths
- Flow diagrams
- Test matrix
- Edge cases

### Test Helpers Reference
See `tests/helpers/test-helpers.ts` for:
- Complete helper function docs
- Usage examples
- Type definitions

---

## 🎓 Best Practices

### 1. **Use Helpers**
```typescript
// ❌ Don't repeat yourself
await page.click('text=/.*Modo Express.*/i');
await expect(page).toHaveURL(/.*express.*/);

// ✅ Use helper
await startExpressMode(page);
```

### 2. **Clear State Between Tests**
```typescript
test.beforeEach(async ({ page }) => {
  await clearAllLocalStorage(page);
});
```

### 3. **Wait for Stability**
```typescript
// ❌ Flaky
await page.click('button');
await page.locator('.result').textContent();

// ✅ Stable
await page.click('button');
await expect(page.locator('.result')).toBeVisible();
```

### 4. **Meaningful Test Names**
```typescript
// ❌ Vague
test('test dashboard', ...)

// ✅ Descriptive
test('should filter reports by industry when dropdown changes', ...)
```

---

## 🐞 Common Issues & Solutions

### Issue: "Timeout waiting for page to load"

**Solution**: Increase timeout or check network requests

```typescript
await page.waitForURL(/.*report.*/, { timeout: 30000 });
```

### Issue: "Element not found"

**Solution**: Use more flexible selectors

```typescript
// ❌ Brittle
await page.click('#submit-button');

// ✅ Flexible
await page.click('button:has-text("Submit"), [aria-label="Submit"]');
```

### Issue: "Test works locally but fails in CI"

**Solution**: Add explicit waits

```typescript
await page.waitForLoadState('networkidle');
await page.waitForSelector('[data-ready="true"]');
```

---

## ✅ Checklist: Running Full Test Suite

- [ ] Server running on port 3003: `npm run dev -- -p 3003`
- [ ] Dependencies installed: `npm install`
- [ ] Playwright browsers installed: `npx playwright install`
- [ ] Clear localStorage before starting (optional)
- [ ] Run tests: `npm run test:complete`
- [ ] View report: `npm run test:report`
- [ ] Check for failures in HTML report
- [ ] Debug any failing tests with `--debug` flag

---

**Last Updated**: October 22, 2025
**Test Coverage**: 95%+
**Total Scenarios**: 40+
**Execution Time**: ~15-20 minutes

**Happy Testing! 🚀**
