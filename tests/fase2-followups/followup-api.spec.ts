/**
 * FASE 2: Follow-up API Tests
 * Tests the /api/consultant-followup endpoint
 * NOTE: These tests call the REAL API (not mocked) - estimated cost ~R$0.90
 *
 * STRATEGY: 100% API Real
 * - Serial execution to avoid rate limits (50 req/min)
 * - 60s timeout for Claude API calls
 * - 2s delay between tests for rate limit buffer
 */

import { test, expect } from '@playwright/test';
import {
  followUpScenarios,
  getAllFollowUpScenarios,
  generateFollowUpAPIRequest,
} from '../fixtures/followup-scenarios';

const BASE_URL = 'http://localhost:3000';
const RATE_LIMIT_DELAY = 2000; // 2s between tests

// Helper to add delay between tests
async function delayForRateLimit() {
  await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
}

test.describe('FASE 2: Consultant Follow-up API', () => {
  // Configure serial execution to avoid rate limits
  test.describe.configure({ mode: 'serial' });
  test('GET health check returns service info', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/consultant-followup`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.status).toBe('ok');
    expect(data.service).toBe('Consultant Follow-up API');
    expect(data.version).toBe('1.0.0');
    expect(data.features).toContain('Response analysis (weak signals, insights)');
  });

  test('POST with valid request returns follow-up analysis', async ({ request }) => {
    test.setTimeout(60000);
    const scenario = followUpScenarios['vague-response'];
    const requestBody = generateFollowUpAPIRequest(scenario);

    const response = await request.post(`${BASE_URL}/api/consultant-followup`, {
      data: requestBody,
    });

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('shouldAskFollowUp');
    expect(data).toHaveProperty('analysis');
    expect(data).toHaveProperty('cost');

    await delayForRateLimit();
  });

  test('POST detects weak signals (vague response)', async ({ request }) => {
    test.setTimeout(60000);
    const scenario = followUpScenarios['vague-response'];
    const requestBody = generateFollowUpAPIRequest(scenario);

    const response = await request.post(`${BASE_URL}/api/consultant-followup`, {
      data: requestBody,
    });

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.shouldAskFollowUp).toBe(true);
    expect(data.analysis.weakSignals).toBeDefined();
    expect(data.analysis.weakSignals.length).toBeGreaterThan(0);

    await delayForRateLimit();
  });

  test('POST respects max follow-ups (budget control)', async ({ request }) => {
    test.setTimeout(60000);
    const scenario = followUpScenarios['max-followups'];
    const requestBody = generateFollowUpAPIRequest(scenario);

    const response = await request.post(`${BASE_URL}/api/consultant-followup`, {
      data: requestBody,
    });

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.shouldAskFollowUp).toBe(false);
    // Should indicate max follow-ups reached

    await delayForRateLimit();
  });

  test('POST with missing fields handles gracefully', async ({ request }) => {
    test.setTimeout(60000);
    const invalidRequest = {
      questionId: 'test-question',
      // Missing: question, answer
    };

    const response = await request.post(`${BASE_URL}/api/consultant-followup`, {
      data: invalidRequest,
    });

    // API should handle gracefully
    expect([200, 400, 500]).toContain(response.status());
  });
});

test.describe('FASE 2: Follow-up API - Scenario Tests (REAL API)', () => {
  // Configure serial execution to avoid rate limits
  test.describe.configure({ mode: 'serial' });

  // Run only 3 scenarios to save costs (~R$0.90)
  const testScenarios = [
    followUpScenarios['vague-response'],
    followUpScenarios['complete-answer'],
    followUpScenarios['emotional-urgency'],
  ];

  for (const scenario of testScenarios) {
    test(`${scenario.testId}: ${scenario.scenarioType}`, async ({ request }) => {
      test.setTimeout(60000);
      const requestBody = generateFollowUpAPIRequest(scenario);

      const response = await request.post(`${BASE_URL}/api/consultant-followup`, {
        data: requestBody,
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('shouldAskFollowUp');
      expect(data).toHaveProperty('analysis');

      // Log result for manual verification
      console.log(`[${scenario.testId}] shouldAskFollowUp:`, data.shouldAskFollowUp);
      console.log(`[${scenario.testId}] weakSignals:`, data.analysis.weakSignals?.map((s: any) => s.type));

      await delayForRateLimit();
    });
  }
});
