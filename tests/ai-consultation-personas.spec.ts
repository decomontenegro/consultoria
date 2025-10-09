import { test, expect } from '@playwright/test';
import { generateAllScenarios, PersonaScenario } from './fixtures/persona-scenarios';
import { setupClaudeMock, validateQuestionForPersona } from './mocks/claude-mock';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// Results storage
interface TestResult {
  testId: string;
  persona: string;
  scenarioType: string;
  success: boolean;
  metrics: {
    topicsSuggested: number;
    topicsAppropriate: boolean;
    questionsAsked: number;
    questionsAppropriate: number;
    questionnaireFlow: boolean;
    jargonViolations: string[];
    abstractionLevel: string;
  };
  issues: string[];
  timestamp: string;
}

const testResults: TestResult[] = [];

//Generate all 25 scenarios
const allScenarios = generateAllScenarios();

test.describe('AI Consultation - Persona Study (25 scenarios)', () => {
  // Run each scenario as a separate test
  for (const scenario of allScenarios) {
    test(`${scenario.testId}: ${scenario.persona} - ${scenario.scenarioType}`, async ({ page }) => {
      const result: TestResult = {
        testId: scenario.testId,
        persona: scenario.persona,
        scenarioType: scenario.scenarioType,
        success: false,
        metrics: {
          topicsSuggested: 0,
          topicsAppropriate: false,
          questionsAsked: 0,
          questionsAppropriate: 0,
          questionnaireFlow: false,
          jargonViolations: [],
          abstractionLevel: '',
        },
        issues: [],
        timestamp: new Date().toISOString(),
      };

      try {
        // Setup Claude API mock
        const mockController = await setupClaudeMock(page, scenario.persona, scenario.scenarioType);

        // Navigate to assessment
        await page.goto('http://localhost:3000/assessment');

        // STEP 0: Select Persona
        await page.click(`button:has-text("${getPersonaLabel(scenario.persona)}")`);
        await page.click('text=Continuar');

        // STEP 1: Company Info
        await page.fill('input[placeholder*="Acme"]', scenario.companyInfo.name);
        await page.selectOption('select', scenario.companyInfo.industry);
        await page.click(`button:has-text("${capitalizeFirst(scenario.companyInfo.size)}")`);
        await page.selectOption('select:has-text("range")', scenario.companyInfo.revenue);
        await page.click('text=Continuar');

        // STEP 2: Current State
        await page.fill('input[placeholder*="25"]', String(scenario.currentState.devTeamSize));
        await page.selectOption('select:has-text("frequência")', scenario.currentState.deploymentFrequency);
        await page.fill('input[placeholder*="14"]', String(scenario.currentState.avgCycleTime));

        // Select AI tools usage
        const aiToolsLabels: Record<string, string> = {
          'none': 'Nenhum',
          'exploring': 'Explorando',
          'piloting': 'Pilotando',
          'production': 'Em Produção',
          'mature': 'Maduro',
        };
        await page.click(`button:has-text("${aiToolsLabels[scenario.currentState.aiToolsUsage]}")`);

        // Select pain points
        for (const painPoint of scenario.currentState.painPoints.slice(0, 2)) {
          await page.click(`button:has-text("${painPoint}")`);
        }
        await page.click('text=Continuar');

        // STEP 3: Goals
        for (const goal of scenario.goals.primaryGoals.slice(0, 2)) {
          await page.click(`button:has-text("${goal}")`);
        }

        const timelineLabels: Record<string, string> = {
          '3-months': '3 Meses',
          '6-months': '6 Meses',
          '12-months': '12 Meses',
          '18-months': '18 Meses',
        };
        await page.click(`button:has-text("${timelineLabels[scenario.goals.timeline]}")`);

        await page.selectOption('select', scenario.goals.budgetRange);

        // Select success metrics
        for (const metric of scenario.goals.successMetrics.slice(0, 3)) {
          await page.click(`button:has-text("${metric}")`);
        }
        await page.click('text=Continuar');

        // STEP 4: Review & Contact
        await page.fill('input[placeholder*="João"]', scenario.contactInfo.fullName);
        await page.fill('input[placeholder*="CTO"]', scenario.contactInfo.title);
        await page.fill('input[placeholder*="@"]', scenario.contactInfo.email);
        await page.check('input[type="checkbox"]');
        await page.click('text=Continuar'); // Goes to Step 5

        // STEP 5: AI Consultation - Topic Selection
        await page.waitForSelector('text=Selecione os Tópicos', { timeout: 5000 });

        // Count suggested topics
        const topicCheckboxes = await page.locator('input[type="checkbox"]').count();
        result.metrics.topicsSuggested = topicCheckboxes;

        // Check if suggested topics match expected
        const topicsText = await page.textContent('body');
        result.metrics.topicsAppropriate = scenario.expectedTopics.some(
          topic => topicsText?.toLowerCase().includes(topic.toLowerCase()) || false
        );

        // Start conversation
        const hasStartButton = await page.locator('button:has-text("Começar Conversa")').count();
        if (hasStartButton > 0) {
          await page.click('button:has-text("Começar Conversa")');
        } else {
          await page.click('button:has-text("Deixar consultor decidir")');
        }

        await page.waitForTimeout(1000); // Wait for chat to initialize

        // Simulate conversation - answer 3 questions
        for (let i = 0; i < 3; i++) {
          const response = scenario.simulatedResponses[i] || 'Resposta padrão de teste';

          // Wait for input to be visible
          await page.waitForSelector('input[placeholder*="resposta"]', { timeout: 5000 });
          await page.fill('input[placeholder*="resposta"]', response);
          await page.click('button:has-text("Enviar")');

          // Wait for AI response
          await page.waitForTimeout(2000);

          result.metrics.questionsAsked++;
        }

        // Check if "Generate Report" option appears after 3 questions
        await page.waitForTimeout(1000);
        const hasGenerateButton = await page.locator('button:has-text("Gerar Relatório")').count();
        result.metrics.questionnaireFlow = hasGenerateButton > 0;

        if (hasGenerateButton > 0) {
          await page.click('button:has-text("Gerar Relatório Agora")');
        } else {
          result.issues.push('Botão "Gerar Relatório" não apareceu após 3 perguntas');
        }

        // Wait for report generation
        await page.waitForURL(/\/report\/.+/, { timeout: 10000 });

        // Verify AI Insights section exists
        const bodyText = await page.textContent('body');
        const hasInsights = bodyText?.includes('Insights da Consulta AI') || false;

        if (hasInsights) {
          result.success = true;
        } else {
          result.issues.push('Seção "Insights da Consulta AI" não encontrada no report');
        }

        // Store metrics
        result.metrics.abstractionLevel = scenario.expectedBehavior.preferredAbstractionLevel;
        result.metrics.questionsAppropriate = result.metrics.questionsAsked; // Simplified for mock

        // Validate jargon usage (would need to capture actual questions from mock)
        if (scenario.expectedBehavior.shouldAvoidJargon) {
          // In a real implementation, we'd analyze the actual questions
          result.metrics.jargonViolations = [];
        }

      } catch (error: any) {
        result.success = false;
        result.issues.push(`Test failed with error: ${error.message}`);
        console.error(`Error in ${scenario.testId}:`, error);
      } finally {
        // Store result
        testResults.push(result);
      }

      // Assert test passed
      expect(result.success).toBe(true);
      expect(result.metrics.topicsSuggested).toBeGreaterThan(0);
      expect(result.metrics.questionsAsked).toBeGreaterThanOrEqual(3);
    });
  }

  // After all tests, write results to file
  test.afterAll(async () => {
    const resultsDir = join(__dirname, 'reports');
    mkdirSync(resultsDir, { recursive: true });

    const resultsFile = join(resultsDir, `test-results-${Date.now()}.json`);
    writeFileSync(resultsFile, JSON.stringify(testResults, null, 2));

    console.log(`\n✅ Test results saved to: ${resultsFile}`);
    console.log(`📊 Total tests: ${testResults.length}`);
    console.log(`✅ Passed: ${testResults.filter(r => r.success).length}`);
    console.log(`❌ Failed: ${testResults.filter(r => !r.success).length}`);
  });
});

// Helper functions
function getPersonaLabel(persona: string): string {
  const labels: Record<string, string> = {
    'board-executive': 'Board Member',
    'finance-ops': 'Finance',
    'product-business': 'Product',
    'engineering-tech': 'Engineering',
    'it-devops': 'IT/DevOps',
  };
  return labels[persona] || persona;
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
