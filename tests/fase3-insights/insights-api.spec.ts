/**
 * FASE 3: Insights API Tests
 * Tests the /api/insights/generate endpoint
 * NOTE: These tests call the REAL API (not mocked) - estimated cost ~R$2.40
 *
 * STRATEGY: 100% API Real
 * - Serial execution to avoid rate limits (50 req/min)
 * - 60s timeout for Claude API calls
 * - 2s delay between tests for rate limit buffer
 */

import { test, expect } from '@playwright/test';
import {
  insightsScenarios,
  generateInsightsAPIRequest,
} from '../fixtures/insights-scenarios';

const BASE_URL = 'http://localhost:3000';
const RATE_LIMIT_DELAY = 2000; // 2s between tests

// Helper to add delay between tests
async function delayForRateLimit() {
  await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
}

test.describe('FASE 3: Insights Generation API', () => {
  // Configure serial execution to avoid rate limits
  test.describe.configure({ mode: 'serial' });
  test('GET health check returns service info', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/insights/generate`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.status).toBe('ok');
    expect(data.service).toBe('Insights Generation API');
    expect(data.version).toBe('1.0.0');
    expect(data.features).toContain('Deep pattern detection (tech debt spiral, velocity crisis, etc.)');
    expect(data.features).toContain('Budget-aware generation (R$ 0.60 per analysis)');
  });

  test('POST generates insights for high-value lead', async ({ request }) => {
    test.setTimeout(60000);
    const scenario = insightsScenarios['high-budget'];
    const requestBody = generateInsightsAPIRequest(scenario);

    const response = await request.post(`${BASE_URL}/api/insights/generate`, {
      data: requestBody,
    });

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.generated).toBe(true);
    expect(data.insights).toBeDefined();
    expect(data.insights.patterns).toBeDefined();
    expect(data.insights.rootCauses).toBeDefined();
    expect(data.insights.financialImpact).toBeDefined();
    expect(data.cost).toBe(0.6);

    // Log insights summary for manual verification
    console.log('[high-budget] Patterns detected:', data.insights.patterns?.length);
    console.log('[high-budget] Recommendations:', data.insights.recommendations?.length);

    await delayForRateLimit();
  });

  test('POST skips insights for low-value lead', async ({ request }) => {
    test.setTimeout(60000);
    const scenario = insightsScenarios['low-value'];
    const requestBody = generateInsightsAPIRequest(scenario);

    const response = await request.post(`${BASE_URL}/api/insights/generate`, {
      data: requestBody,
    });

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.generated).toBe(false);
    expect(data.insights).toBeNull();
    expect(data.cost).toBe(0.0);
    expect(data.reason).toContain('Skipped');
  });

  test('POST respects critical urgency', async ({ request }) => {
    test.setTimeout(60000);
    const scenario = insightsScenarios['critical-urgency'];
    const requestBody = generateInsightsAPIRequest(scenario);

    const response = await request.post(`${BASE_URL}/api/insights/generate`, {
      data: requestBody,
    });

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.generated).toBe(true);
    expect(data.insights).toBeDefined();
    expect(data.cost).toBe(0.6);

    console.log('[critical-urgency] Generated:', data.generated);

    await delayForRateLimit();
  });

  test('POST with missing assessmentData returns 400', async ({ request }) => {
    test.setTimeout(60000);
    const invalidRequest = {
      conversationHistory: [],
    };

    const response = await request.post(`${BASE_URL}/api/insights/generate`, {
      data: invalidRequest,
    });

    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data.generated).toBe(false);
  });
});

test.describe('FASE 3: Insights API - Budget-Aware Logic', () => {
  // Configure serial execution to avoid rate limits
  test.describe.configure({ mode: 'serial' });

  test('High pain (3+ pain points) triggers generation', async ({ request }) => {
    test.setTimeout(60000);
    const scenario = insightsScenarios['high-pain'];
    const requestBody = generateInsightsAPIRequest(scenario);

    const response = await request.post(`${BASE_URL}/api/insights/generate`, {
      data: requestBody,
    });

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.generated).toBe(true);
    expect(data.insights.patterns).toBeDefined();

    console.log('[high-pain] Pain points:', scenario.assessmentData.currentState?.painPoints?.length);
    console.log('[high-pain] Patterns detected:', data.insights.patterns?.map((p: any) => p.type));

    await delayForRateLimit();
  });

  test('Force generate overrides budget-aware logic', async ({ request }) => {
    test.setTimeout(60000);
    const scenario = insightsScenarios['force-generate'];
    const requestBody = generateInsightsAPIRequest(scenario, true); // forceGenerate = true

    const response = await request.post(`${BASE_URL}/api/insights/generate`, {
      data: requestBody,
    });

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.generated).toBe(true); // Should generate despite being low-value
    expect(data.cost).toBe(0.6);

    await delayForRateLimit();
  });
});
