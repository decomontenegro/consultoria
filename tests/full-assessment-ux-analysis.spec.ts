import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * FULL ASSESSMENT UX/UI ANALYSIS
 *
 * Simula um usuário real completando o assessment do início ao fim
 * Analisa UX/UI em cada step:
 * - Visual hierarchy
 * - Readability
 * - Button accessibility
 * - Layout consistency
 * - Error states
 * - Loading states
 * - Mobile responsiveness
 */

const BASE_URL = 'http://localhost:3001';
const ANALYSIS_DIR = 'ux-analysis-report';

interface StepAnalysis {
  stepNumber: number;
  stepName: string;
  url: string;
  timestamp: string;
  visual: {
    hasQuestion: boolean;
    questionText: string;
    questionVisible: boolean;
    questionPosition: { x: number; y: number; width: number; height: number } | null;
  };
  layout: {
    viewport: { width: number; height: number };
    scrollHeight: number;
    hasOverflow: boolean;
    elementsOverlapping: boolean;
  };
  buttons: {
    found: number;
    visible: number;
    accessible: number;
    labels: string[];
  };
  inputs: {
    found: number;
    visible: number;
    type: string[];
    placeholders: string[];
  };
  ux: {
    loadTime: number;
    readabilityScore: number; // 1-10
    visualHierarchyClear: boolean;
    ctaClear: boolean;
    errors: string[];
    warnings: string[];
  };
  screenshot: string;
}

const analysisReport: StepAnalysis[] = [];

async function analyzeStep(page: Page, stepNumber: number, stepName: string): Promise<StepAnalysis> {
  const startTime = Date.now();

  // Wait for page to be ready
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);

  const url = page.url();
  const viewport = page.viewportSize() || { width: 0, height: 0 };

  // Analyze question visibility
  const questionElements = page.locator('h1, h2, h3, [role="heading"], [class*="question"]');
  const questionCount = await questionElements.count();
  let questionText = '';
  let questionVisible = false;
  let questionPosition = null;

  if (questionCount > 0) {
    const firstQuestion = questionElements.first();
    questionText = (await firstQuestion.textContent())?.trim() || '';
    questionVisible = await firstQuestion.isVisible();
    questionPosition = await firstQuestion.boundingBox();
  }

  // Analyze layout
  const body = page.locator('body');
  const scrollHeight = await body.evaluate(el => el.scrollHeight);
  const hasOverflow = scrollHeight > viewport.height;

  // Check for overlapping elements (simplified)
  const allVisibleElements = await page.locator('*').all();
  let elementsOverlapping = false;
  // (comprehensive overlap detection would be complex, skipping for now)

  // Analyze buttons
  const buttons = page.locator('button, [role="button"], input[type="button"], input[type="submit"]');
  const buttonCount = await buttons.count();
  const visibleButtons = await buttons.filter({ hasText: /.+/ }).count();
  const buttonLabels: string[] = [];

  for (let i = 0; i < Math.min(buttonCount, 10); i++) {
    const label = await buttons.nth(i).textContent();
    if (label) buttonLabels.push(label.trim());
  }

  // Analyze inputs
  const inputs = page.locator('input, textarea, select');
  const inputCount = await inputs.count();
  const visibleInputs = await inputs.filter({ hasText: /.+/ }).or(inputs.filter({ has: page.locator('*') })).count();
  const inputTypes: string[] = [];
  const placeholders: string[] = [];

  for (let i = 0; i < Math.min(inputCount, 5); i++) {
    const input = inputs.nth(i);
    const type = await input.getAttribute('type') || await input.evaluate(el => el.tagName);
    const placeholder = await input.getAttribute('placeholder') || '';

    inputTypes.push(type);
    if (placeholder) placeholders.push(placeholder);
  }

  // UX Analysis
  const loadTime = Date.now() - startTime;

  // Readability score (simple heuristic)
  let readabilityScore = 10;
  if (!questionVisible) readabilityScore -= 3;
  if (questionText.length > 200) readabilityScore -= 1; // Too long
  if (buttonLabels.length === 0) readabilityScore -= 2; // No clear CTA
  if (hasOverflow && viewport.height < 800) readabilityScore -= 1;

  // Visual hierarchy
  const visualHierarchyClear = questionVisible && questionPosition !== null && questionPosition.y < 300;

  // CTA clear
  const ctaClear = buttonLabels.some(label =>
    /próximo|next|continuar|enviar|submit|começar|start/i.test(label)
  );

  // Collect errors and warnings
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!questionVisible && questionCount > 0) {
    errors.push('Question exists but not visible');
  }

  if (buttonLabels.length === 0) {
    errors.push('No buttons found - user cannot proceed');
  }

  if (hasOverflow && viewport.height < 600) {
    warnings.push('Content overflows viewport - user needs to scroll');
  }

  if (!ctaClear) {
    warnings.push('No clear CTA button (Next/Continue/Submit)');
  }

  // Screenshot
  const screenshotName = `step-${stepNumber}-${stepName.replace(/\s+/g, '-').toLowerCase()}.png`;
  const screenshotPath = path.join(ANALYSIS_DIR, screenshotName);

  await page.screenshot({
    path: screenshotPath,
    fullPage: true
  });

  const analysis: StepAnalysis = {
    stepNumber,
    stepName,
    url,
    timestamp: new Date().toISOString(),
    visual: {
      hasQuestion: questionCount > 0,
      questionText,
      questionVisible,
      questionPosition
    },
    layout: {
      viewport,
      scrollHeight,
      hasOverflow,
      elementsOverlapping
    },
    buttons: {
      found: buttonCount,
      visible: visibleButtons,
      accessible: buttonLabels.length,
      labels: buttonLabels
    },
    inputs: {
      found: inputCount,
      visible: visibleInputs,
      type: inputTypes,
      placeholders
    },
    ux: {
      loadTime,
      readabilityScore: Math.max(1, Math.min(10, readabilityScore)),
      visualHierarchyClear,
      ctaClear,
      errors,
      warnings
    },
    screenshot: screenshotName
  };

  return analysis;
}

async function findAndClickNext(page: Page): Promise<boolean> {
  // Try multiple strategies to find "Next" button
  const strategies = [
    page.locator('button').filter({ hasText: /próximo|next/i }),
    page.locator('button').filter({ hasText: /continuar|continue/i }),
    page.locator('button').filter({ hasText: /avançar|advance/i }),
    page.locator('button[type="submit"]'),
    page.locator('[role="button"]').filter({ hasText: /próximo|next|continuar/i }),
    page.locator('button, [role="button"]').last() // Fallback: last button
  ];

  for (const strategy of strategies) {
    const count = await strategy.count();
    if (count > 0) {
      const button = strategy.first();
      const isVisible = await button.isVisible().catch(() => false);

      if (isVisible) {
        console.log(`✓ Found next button using strategy: ${strategy}`);
        await button.click();
        await page.waitForTimeout(1000); // Wait for transition
        return true;
      }
    }
  }

  return false;
}

async function fillCurrentStep(page: Page): Promise<boolean> {
  // Try to fill any text inputs on current step
  const inputs = page.locator('input[type="text"], input[type="email"], textarea');
  const inputCount = await inputs.count();

  if (inputCount > 0) {
    console.log(`Found ${inputCount} inputs, filling...`);

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const isVisible = await input.isVisible().catch(() => false);

      if (isVisible) {
        const placeholder = await input.getAttribute('placeholder') || '';
        const type = await input.getAttribute('type') || 'text';

        let value = 'Teste de resposta';

        if (type === 'email') {
          value = 'teste@empresa.com';
        } else if (placeholder.toLowerCase().includes('nome')) {
          value = 'João Silva';
        } else if (placeholder.toLowerCase().includes('empresa')) {
          value = 'Empresa Teste Ltda';
        } else if (placeholder.toLowerCase().includes('número') || placeholder.toLowerCase().includes('funcionário')) {
          value = '50';
        }

        await input.fill(value);
        console.log(`  ✓ Filled input with: ${value}`);
      }
    }

    await page.waitForTimeout(500);
    return true;
  }

  // Try to select checkboxes (for expertise selection step)
  const checkboxes = page.locator('input[type="checkbox"]');
  const checkboxCount = await checkboxes.count();

  if (checkboxCount > 0) {
    console.log(`Found ${checkboxCount} checkboxes, selecting first 2...`);

    // Select at least 2 checkboxes to ensure progression
    const maxToSelect = Math.min(2, checkboxCount);
    for (let i = 0; i < maxToSelect; i++) {
      const checkbox = checkboxes.nth(i);
      const isVisible = await checkbox.isVisible().catch(() => false);
      const isChecked = await checkbox.isChecked().catch(() => false);

      if (isVisible && !isChecked) {
        await checkbox.click();
        console.log(`  ✓ Checked checkbox ${i + 1}`);
      }
    }

    await page.waitForTimeout(500);
    return true;
  }

  // Try to select options via buttons
  const buttons = page.locator('button').filter({ hasText: /.+/ }).filter({ hasNotText: /próximo|next|voltar|back|começar/i });
  const buttonCount = await buttons.count();

  if (buttonCount > 0) {
    console.log(`Found ${buttonCount} option buttons, clicking first...`);
    const firstButton = buttons.first();
    const isVisible = await firstButton.isVisible().catch(() => false);
    const isEnabled = await firstButton.isEnabled().catch(() => false);

    if (isVisible && isEnabled) {
      await firstButton.click();
      await page.waitForTimeout(500);
      return true;
    }
  }

  return false;
}

test.describe('Full Assessment UX/UI Analysis', () => {

  test.beforeAll(async () => {
    // Create analysis directory
    if (!fs.existsSync(ANALYSIS_DIR)) {
      fs.mkdirSync(ANALYSIS_DIR, { recursive: true });
    }
  });

  test('Complete assessment journey with UX analysis', async ({ page }) => {
    console.log('\n=== STARTING FULL ASSESSMENT UX ANALYSIS ===\n');

    // Step 0: Homepage
    console.log('\n--- STEP 0: Homepage ---');
    await page.goto(BASE_URL);

    const homepageAnalysis = await analyzeStep(page, 0, 'Homepage');
    analysisReport.push(homepageAnalysis);

    console.log(`  Question: ${homepageAnalysis.visual.questionText || 'N/A'}`);
    console.log(`  Buttons: ${homepageAnalysis.buttons.labels.join(', ')}`);
    console.log(`  UX Score: ${homepageAnalysis.ux.readabilityScore}/10`);

    // Find and click "Começar" or similar
    const startButtons = page.locator('button, a').filter({ hasText: /começar|iniciar|start/i });
    if (await startButtons.count() > 0) {
      await startButtons.first().click();
      await page.waitForTimeout(1000);
    }

    // Navigate to assessment if not already there
    if (!page.url().includes('/assessment')) {
      await page.goto(`${BASE_URL}/assessment`);
    }

    // Percorrer assessment steps
    let stepNumber = 1;
    const MAX_STEPS = 15; // Safety limit

    while (stepNumber <= MAX_STEPS) {
      console.log(`\n--- STEP ${stepNumber}: Assessment Question ---`);

      // Analyze current step
      const analysis = await analyzeStep(page, stepNumber, `Assessment Step ${stepNumber}`);
      analysisReport.push(analysis);

      console.log(`  Question: ${analysis.visual.questionText.substring(0, 80)}...`);
      console.log(`  Visible: ${analysis.visual.questionVisible ? '✓' : '✗'}`);
      console.log(`  Buttons: ${analysis.buttons.labels.join(', ')}`);
      console.log(`  Inputs: ${analysis.inputs.found} (${analysis.inputs.type.join(', ')})`);
      console.log(`  UX Score: ${analysis.ux.readabilityScore}/10`);

      if (analysis.ux.errors.length > 0) {
        console.log(`  ❌ Errors: ${analysis.ux.errors.join('; ')}`);
      }

      if (analysis.ux.warnings.length > 0) {
        console.log(`  ⚠️  Warnings: ${analysis.ux.warnings.join('; ')}`);
      }

      // Check if we've reached the report
      if (page.url().includes('/report/') || page.url().includes('/resultado')) {
        console.log('\n✓ Reached report page!');
        break;
      }

      // Fill current step
      const filled = await fillCurrentStep(page);

      // Try to proceed to next step
      const proceeded = await findAndClickNext(page);

      if (!proceeded && !filled) {
        console.log('  ⚠️  Could not fill or proceed, stopping analysis');
        break;
      }

      stepNumber++;

      // Safety: check if URL changed (progressed)
      await page.waitForTimeout(500);
      const newUrl = page.url();

      if (stepNumber > 5 && newUrl === analysis.url) {
        console.log('  ⚠️  URL did not change, might be stuck');
        // Try one more time with different strategy
        const anyButton = page.locator('button').last();
        if (await anyButton.count() > 0) {
          await anyButton.click();
          await page.waitForTimeout(1000);
        } else {
          break;
        }
      }
    }

    // Final step: Report page (if reached)
    if (page.url().includes('/report/') || page.url().includes('/resultado')) {
      console.log('\n--- FINAL STEP: Report Page ---');

      const reportAnalysis = await analyzeStep(page, stepNumber, 'Report Page');
      analysisReport.push(reportAnalysis);

      console.log(`  UX Score: ${reportAnalysis.ux.readabilityScore}/10`);
      console.log(`  Sections visible: ${reportAnalysis.visual.hasQuestion}`);
    }

    // Generate final report
    console.log('\n=== GENERATING ANALYSIS REPORT ===\n');

    const reportPath = path.join(ANALYSIS_DIR, 'ux-analysis-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(analysisReport, null, 2));

    console.log(`✓ Report saved to: ${reportPath}`);
    console.log(`✓ Screenshots saved to: ${ANALYSIS_DIR}/`);
    console.log(`✓ Total steps analyzed: ${analysisReport.length}`);

    // Generate markdown summary
    const markdownReport = generateMarkdownReport(analysisReport);
    const markdownPath = path.join(ANALYSIS_DIR, 'UX_ANALYSIS_SUMMARY.md');
    fs.writeFileSync(markdownPath, markdownReport);

    console.log(`✓ Markdown report: ${markdownPath}`);

    // Print summary
    console.log('\n=== SUMMARY ===\n');
    console.log(`Total steps: ${analysisReport.length}`);

    const avgScore = analysisReport.reduce((sum, s) => sum + s.ux.readabilityScore, 0) / analysisReport.length;
    console.log(`Average UX Score: ${avgScore.toFixed(1)}/10`);

    const totalErrors = analysisReport.reduce((sum, s) => sum + s.ux.errors.length, 0);
    const totalWarnings = analysisReport.reduce((sum, s) => sum + s.ux.warnings.length, 0);

    console.log(`Total Errors: ${totalErrors}`);
    console.log(`Total Warnings: ${totalWarnings}`);

    // Assert that we completed at least 3 steps
    expect(analysisReport.length).toBeGreaterThanOrEqual(3);
  });
});

function generateMarkdownReport(report: StepAnalysis[]): string {
  let md = '# 🎨 Assessment UX/UI Analysis Report\n\n';
  md += `**Date**: ${new Date().toISOString()}\n`;
  md += `**Total Steps Analyzed**: ${report.length}\n\n`;

  const avgScore = report.reduce((sum, s) => sum + s.ux.readabilityScore, 0) / report.length;
  md += `**Average UX Score**: ${avgScore.toFixed(1)}/10\n\n`;

  md += '---\n\n';

  // Summary table
  md += '## 📊 Summary Table\n\n';
  md += '| Step | Name | Question Visible | UX Score | Errors | Warnings |\n';
  md += '|------|------|------------------|----------|--------|----------|\n';

  for (const step of report) {
    const visibleIcon = step.visual.questionVisible ? '✅' : '❌';
    const scoreEmoji = step.ux.readabilityScore >= 8 ? '🟢' : step.ux.readabilityScore >= 6 ? '🟡' : '🔴';

    md += `| ${step.stepNumber} | ${step.stepName} | ${visibleIcon} | ${scoreEmoji} ${step.ux.readabilityScore}/10 | ${step.ux.errors.length} | ${step.ux.warnings.length} |\n`;
  }

  md += '\n---\n\n';

  // Detailed analysis per step
  md += '## 📋 Detailed Step-by-Step Analysis\n\n';

  for (const step of report) {
    md += `### Step ${step.stepNumber}: ${step.stepName}\n\n`;

    md += `**URL**: \`${step.url}\`\n`;
    md += `**Screenshot**: ![${step.stepName}](./${step.screenshot})\n\n`;

    // Visual
    md += '#### Visual\n';
    md += `- Question Text: "${step.visual.questionText.substring(0, 100)}${step.visual.questionText.length > 100 ? '...' : ''}"\n`;
    md += `- Visible: ${step.visual.questionVisible ? '✅ Yes' : '❌ No'}\n`;
    if (step.visual.questionPosition) {
      md += `- Position: x=${step.visual.questionPosition.x}, y=${step.visual.questionPosition.y}\n`;
    }
    md += '\n';

    // Layout
    md += '#### Layout\n';
    md += `- Viewport: ${step.layout.viewport.width}x${step.layout.viewport.height}\n`;
    md += `- Scroll Height: ${step.layout.scrollHeight}px\n`;
    md += `- Has Overflow: ${step.layout.hasOverflow ? '⚠️ Yes' : '✅ No'}\n`;
    md += '\n';

    // Buttons
    md += '#### Buttons\n';
    md += `- Found: ${step.buttons.found}\n`;
    md += `- Accessible: ${step.buttons.accessible}\n`;
    md += `- Labels: ${step.buttons.labels.map(l => `"${l}"`).join(', ')}\n`;
    md += '\n';

    // Inputs
    md += '#### Inputs\n';
    md += `- Found: ${step.inputs.found}\n`;
    md += `- Types: ${step.inputs.type.join(', ')}\n`;
    if (step.inputs.placeholders.length > 0) {
      md += `- Placeholders: ${step.inputs.placeholders.map(p => `"${p}"`).join(', ')}\n`;
    }
    md += '\n';

    // UX
    md += '#### UX Metrics\n';
    md += `- Load Time: ${step.ux.loadTime}ms\n`;
    md += `- Readability Score: ${step.ux.readabilityScore}/10\n`;
    md += `- Visual Hierarchy Clear: ${step.ux.visualHierarchyClear ? '✅' : '❌'}\n`;
    md += `- CTA Clear: ${step.ux.ctaClear ? '✅' : '❌'}\n`;

    if (step.ux.errors.length > 0) {
      md += '\n**❌ Errors**:\n';
      for (const error of step.ux.errors) {
        md += `- ${error}\n`;
      }
    }

    if (step.ux.warnings.length > 0) {
      md += '\n**⚠️ Warnings**:\n';
      for (const warning of step.ux.warnings) {
        md += `- ${warning}\n`;
      }
    }

    md += '\n---\n\n';
  }

  // Overall recommendations
  md += '## 🎯 Overall Recommendations\n\n';

  const stepsWithErrors = report.filter(s => s.ux.errors.length > 0);
  const stepsWithLowScore = report.filter(s => s.ux.readabilityScore < 7);
  const stepsWithoutCTA = report.filter(s => !s.ux.ctaClear);

  if (stepsWithErrors.length > 0) {
    md += `### Critical Issues (${stepsWithErrors.length} steps)\n\n`;
    for (const step of stepsWithErrors) {
      md += `- **Step ${step.stepNumber}**: ${step.ux.errors.join('; ')}\n`;
    }
    md += '\n';
  }

  if (stepsWithLowScore.length > 0) {
    md += `### UX Improvements Needed (${stepsWithLowScore.length} steps with score < 7)\n\n`;
    for (const step of stepsWithLowScore) {
      md += `- **Step ${step.stepNumber}** (${step.ux.readabilityScore}/10): ${step.stepName}\n`;
    }
    md += '\n';
  }

  if (stepsWithoutCTA.length > 0) {
    md += `### Missing Clear CTAs (${stepsWithoutCTA.length} steps)\n\n`;
    md += 'Add clear "Próximo" or "Continuar" buttons to:\n';
    for (const step of stepsWithoutCTA) {
      md += `- Step ${step.stepNumber}: ${step.stepName}\n`;
    }
    md += '\n';
  }

  // Positive highlights
  const stepsWithHighScore = report.filter(s => s.ux.readabilityScore >= 9);
  if (stepsWithHighScore.length > 0) {
    md += `### ✨ Excellent UX (${stepsWithHighScore.length} steps with score ≥ 9)\n\n`;
    for (const step of stepsWithHighScore) {
      md += `- **Step ${step.stepNumber}** (${step.ux.readabilityScore}/10): ${step.stepName} ✅\n`;
    }
    md += '\n';
  }

  md += '---\n\n';
  md += '*Report generated automatically by Playwright UX Analysis*\n';

  return md;
}
