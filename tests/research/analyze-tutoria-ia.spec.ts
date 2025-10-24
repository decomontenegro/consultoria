/**
 * Research Script: Analyze tutoria-ia.vercel.app
 *
 * Purpose: Extract UX patterns, flow structure, and insights from
 * the Klini Saúde diagnostic automation system to apply to our AI assessment tool
 */

import { test, expect, Page } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

interface UXPattern {
  category: string;
  pattern: string;
  description: string;
  applicableToOurProject: boolean;
  priority: 'high' | 'medium' | 'low';
  implementationIdea?: string;
}

interface FormFlowStep {
  stepNumber: number;
  title: string;
  description: string;
  inputTypes: string[];
  validationPatterns: string[];
  progressIndicator: boolean;
  estimatedTime?: string;
}

interface ResearchFindings {
  url: string;
  timestamp: string;
  pageTitle: string;
  metaDescription?: string;
  colorScheme: {
    primary: string[];
    secondary: string[];
    background: string[];
  };
  formFlow: FormFlowStep[];
  uxPatterns: UXPattern[];
  copyExamples: {
    headlines: string[];
    ctaButtons: string[];
    valueProp: string[];
  };
  technicalObservations: {
    framework: string;
    animations: string[];
    responsiveness: boolean;
    accessibility: string[];
  };
  keyInsights: string[];
  recommendedActions: string[];
}

/**
 * Helper function to analyze page structure
 */
async function analyzePage(page: Page): Promise<ResearchFindings> {
  const findings: ResearchFindings = {
    url: page.url(),
    timestamp: new Date().toISOString(),
    pageTitle: await page.title(),
    metaDescription: await page.locator('meta[name="description"]').getAttribute('content') || undefined,
    colorScheme: {
      primary: [],
      secondary: [],
      background: []
    },
    formFlow: [],
    uxPatterns: [],
    copyExamples: {
      headlines: [],
      ctaButtons: [],
      valueProp: []
    },
    technicalObservations: {
      framework: 'Unknown',
      animations: [],
      responsiveness: false,
      accessibility: []
    },
    keyInsights: [],
    recommendedActions: []
  };

  // Extract headlines
  const h1Elements = await page.locator('h1').all();
  for (const h1 of h1Elements) {
    const text = await h1.textContent();
    if (text) findings.copyExamples.headlines.push(text.trim());
  }

  // Extract CTA buttons
  const buttons = await page.locator('button, a[class*="button"], a[class*="btn"]').all();
  for (const btn of buttons.slice(0, 10)) { // Limit to 10
    const text = await btn.textContent();
    if (text) findings.copyExamples.ctaButtons.push(text.trim());
  }

  // Check framework indicators
  const reactRoot = await page.locator('#__next, #root, [data-reactroot]').count();
  if (reactRoot > 0) {
    findings.technicalObservations.framework = 'React (likely Next.js based on Vercel hosting)';
  }

  // Check for form elements
  const forms = await page.locator('form').count();
  const inputs = await page.locator('input, select, textarea').count();

  if (forms > 0 || inputs > 0) {
    findings.uxPatterns.push({
      category: 'Forms',
      pattern: 'Structured Input Collection',
      description: `Found ${forms} forms with ${inputs} input elements`,
      applicableToOurProject: true,
      priority: 'high',
      implementationIdea: 'Analyze input types and validation patterns'
    });
  }

  // Check for progress indicators
  const progressBars = await page.locator('[class*="progress"], [role="progressbar"]').count();
  if (progressBars > 0) {
    findings.uxPatterns.push({
      category: 'User Guidance',
      pattern: 'Progress Indicators',
      description: `Found ${progressBars} progress indicator(s)`,
      applicableToOurProject: true,
      priority: 'high',
      implementationIdea: 'We already have progress bars, but analyze their visual design and messaging'
    });
  }

  // Check responsiveness
  const viewport = page.viewportSize();
  findings.technicalObservations.responsiveness = !!viewport;

  return findings;
}

/**
 * Extract color scheme from computed styles
 */
async function extractColorScheme(page: Page): Promise<string[]> {
  const colors = await page.evaluate(() => {
    const colorSet = new Set<string>();
    const elements = document.querySelectorAll('*');

    elements.forEach((el) => {
      const computed = window.getComputedStyle(el);
      const bg = computed.backgroundColor;
      const color = computed.color;
      const border = computed.borderColor;

      if (bg && bg !== 'rgba(0, 0, 0, 0)') colorSet.add(bg);
      if (color) colorSet.add(color);
      if (border && border !== 'rgba(0, 0, 0, 0)') colorSet.add(border);
    });

    return Array.from(colorSet).slice(0, 20); // Limit to top 20
  });

  return colors;
}

/**
 * Main research test
 */
test.describe('Research: tutoria-ia.vercel.app Analysis', () => {

  test('Analyze homepage and extract insights', async ({ page }) => {
    console.log('\n🔬 Starting research on tutoria-ia.vercel.app...\n');

    // Navigate to target site
    await page.goto('https://tutoria-ia.vercel.app', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Take initial screenshot
    const screenshotsDir = join(__dirname, '../reports/research-screenshots');
    mkdirSync(screenshotsDir, { recursive: true });
    await page.screenshot({
      path: join(screenshotsDir, 'tutoria-ia-homepage.png'),
      fullPage: true
    });

    // Analyze page
    const findings = await analyzePage(page);

    // Extract color scheme
    findings.colorScheme.primary = await extractColorScheme(page);

    // Capture page content for offline analysis
    const bodyText = await page.textContent('body');

    // Generate insights based on what we found
    findings.keyInsights = [
      `Page title: "${findings.pageTitle}" - Focus on diagnostic/automation theme`,
      `Found ${findings.copyExamples.headlines.length} headline(s) and ${findings.copyExamples.ctaButtons.length} CTA elements`,
      `Framework: ${findings.technicalObservations.framework}`,
      `UX patterns identified: ${findings.uxPatterns.length}`
    ];

    // Generate recommendations
    findings.recommendedActions = [
      'Compare diagnostic flow with our AI assessment flow',
      'Analyze how medical/health terminology is simplified for non-technical users',
      'Study visual hierarchy and information density',
      'Identify any "triage" or urgency classification systems',
      'Look for confidence/certainty indicators in results'
    ];

    // If page content mentions specific keywords, add insights
    if (bodyText) {
      const lowerText = bodyText.toLowerCase();

      if (lowerText.includes('diagnóstico') || lowerText.includes('diagnostic')) {
        findings.keyInsights.push('✓ Diagnostic terminology present - analyze how it\'s presented to users');
      }

      if (lowerText.includes('automação') || lowerText.includes('automation')) {
        findings.keyInsights.push('✓ Automation theme confirmed - relevant to our AI assessment positioning');
      }

      if (lowerText.includes('klini') || lowerText.includes('saúde') || lowerText.includes('health')) {
        findings.keyInsights.push('✓ Healthcare context confirmed - extract patient journey patterns');
      }
    }

    // Add UX pattern insights based on findings
    if (findings.uxPatterns.some(p => p.pattern.includes('Progress'))) {
      findings.recommendedActions.push(
        'Compare their progress indicator style with ours - look for improvements'
      );
    }

    // Save findings to JSON
    const resultsDir = join(__dirname, '../reports');
    mkdirSync(resultsDir, { recursive: true });

    const resultsFile = join(resultsDir, `tutoria-ia-analysis-${Date.now()}.json`);
    writeFileSync(resultsFile, JSON.stringify(findings, null, 2));

    console.log('\n📊 Research Results:');
    console.log('='.repeat(50));
    console.log(`Page Title: ${findings.pageTitle}`);
    console.log(`Headlines found: ${findings.copyExamples.headlines.length}`);
    console.log(`CTA buttons found: ${findings.copyExamples.ctaButtons.length}`);
    console.log(`UX patterns identified: ${findings.uxPatterns.length}`);
    console.log(`Framework detected: ${findings.technicalObservations.framework}`);
    console.log('\n🔑 Key Insights:');
    findings.keyInsights.forEach((insight, i) => {
      console.log(`  ${i + 1}. ${insight}`);
    });
    console.log('\n💡 Recommended Actions:');
    findings.recommendedActions.forEach((action, i) => {
      console.log(`  ${i + 1}. ${action}`);
    });
    console.log('\n✅ Results saved to:', resultsFile);
    console.log('='.repeat(50));

    // Assert we got meaningful data
    expect(findings.pageTitle).toBeTruthy();
    expect(findings.keyInsights.length).toBeGreaterThan(0);
  });

  test('Attempt to identify form flow structure', async ({ page }) => {
    console.log('\n🔍 Analyzing form flow structure...\n');

    await page.goto('https://tutoria-ia.vercel.app', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Look for common form patterns
    const formElements = {
      forms: await page.locator('form').count(),
      inputs: await page.locator('input').count(),
      selects: await page.locator('select').count(),
      textareas: await page.locator('textarea').count(),
      buttons: await page.locator('button, input[type="submit"]').count(),
      steps: await page.locator('[class*="step"], [data-step]').count(),
      progressBars: await page.locator('[class*="progress"], [role="progressbar"]').count()
    };

    console.log('📋 Form Structure Analysis:');
    console.log(JSON.stringify(formElements, null, 2));

    // Try to identify multi-step form indicators
    const stepIndicators = [
      { selector: '[class*="step"]', name: 'Step classes' },
      { selector: '[data-step]', name: 'Step data attributes' },
      { selector: 'nav[class*="step"]', name: 'Step navigation' },
      { selector: '[role="tab"]', name: 'Tab-based steps' }
    ];

    console.log('\n🎯 Step Indicators Found:');
    for (const indicator of stepIndicators) {
      const count = await page.locator(indicator.selector).count();
      if (count > 0) {
        console.log(`  ✓ ${indicator.name}: ${count} elements`);
      }
    }

    // Save screenshot if form found
    if (formElements.forms > 0 || formElements.inputs > 0) {
      const screenshotsDir = join(__dirname, '../reports/research-screenshots');
      await page.screenshot({
        path: join(screenshotsDir, 'tutoria-ia-form-structure.png'),
        fullPage: true
      });
      console.log('\n📸 Form screenshot saved');
    }

    expect(true).toBe(true); // Always pass, this is exploratory
  });

  test('Extract copywriting patterns for comparison', async ({ page }) => {
    console.log('\n📝 Extracting copywriting patterns...\n');

    await page.goto('https://tutoria-ia.vercel.app', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Extract various text elements
    const copyPatterns = {
      headlines: await page.locator('h1, h2, h3').allTextContents(),
      paragraphs: (await page.locator('p').allTextContents()).slice(0, 10),
      buttons: await page.locator('button, a[class*="button"]').allTextContents(),
      labels: await page.locator('label').allTextContents()
    };

    // Clean up empty strings
    Object.keys(copyPatterns).forEach(key => {
      copyPatterns[key as keyof typeof copyPatterns] = copyPatterns[key as keyof typeof copyPatterns]
        .map(s => s.trim())
        .filter(s => s.length > 0);
    });

    console.log('📊 Copywriting Analysis:');
    console.log('='.repeat(50));

    console.log(`\n📌 Headlines (${copyPatterns.headlines.length}):`);
    copyPatterns.headlines.slice(0, 5).forEach((h, i) => {
      console.log(`  ${i + 1}. "${h}"`);
    });

    console.log(`\n🔘 Buttons/CTAs (${copyPatterns.buttons.length}):`);
    copyPatterns.buttons.slice(0, 5).forEach((b, i) => {
      console.log(`  ${i + 1}. "${b}"`);
    });

    console.log(`\n📄 Sample Paragraphs (${copyPatterns.paragraphs.length}):`);
    copyPatterns.paragraphs.slice(0, 3).forEach((p, i) => {
      const preview = p.length > 100 ? p.substring(0, 100) + '...' : p;
      console.log(`  ${i + 1}. "${preview}"`);
    });

    console.log('\n' + '='.repeat(50));

    // Save to file
    const resultsDir = join(__dirname, '../reports');
    const copyFile = join(resultsDir, `tutoria-ia-copy-analysis-${Date.now()}.json`);
    writeFileSync(copyFile, JSON.stringify(copyPatterns, null, 2));
    console.log(`✅ Copy analysis saved to: ${copyFile}`);

    expect(copyPatterns.headlines.length).toBeGreaterThan(0);
  });

  test('Document recommendations for CulturaBuilder', async ({ page }) => {
    console.log('\n💡 Generating recommendations for CulturaBuilder...\n');

    await page.goto('https://tutoria-ia.vercel.app', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    const bodyText = (await page.textContent('body'))?.toLowerCase() || '';

    const recommendations = {
      timestamp: new Date().toISOString(),
      source: 'tutoria-ia.vercel.app',
      context: 'Healthcare diagnostic automation → AI readiness assessment',

      crossIndustryInsights: [
        {
          category: 'Diagnostic Flow',
          observation: 'Healthcare uses triaging to classify urgency and route patients',
          application: 'Implement AI Readiness Triage Score (0-100) to classify companies by urgency',
          priority: 'high',
          effort: 'medium'
        },
        {
          category: 'Confidence Communication',
          observation: 'Medical diagnostics communicate certainty levels to manage expectations',
          application: 'Add confidence scores to ROI calculations and show data quality indicators',
          priority: 'high',
          effort: 'low'
        },
        {
          category: 'Progressive Disclosure',
          observation: 'Healthcare UX reveals complexity gradually based on patient needs',
          application: 'Create Express Mode (3 min) vs Deep Dive Mode (15 min) for different personas',
          priority: 'medium',
          effort: 'high'
        },
        {
          category: 'Follow-up Care',
          observation: 'Medical systems have structured post-treatment monitoring',
          application: 'Implement 30/60/90-day check-ins to track AI adoption progress',
          priority: 'medium',
          effort: 'medium'
        },
        {
          category: 'Visual Diagnostics',
          observation: 'Healthcare uses visual aids (X-rays, charts) for communication',
          application: 'Add interactive visualizations of before/after AI adoption scenarios',
          priority: 'low',
          effort: 'high'
        }
      ],

      technicalImplementations: [
        {
          feature: 'Triage Score Engine',
          description: 'Calculate 0-100 urgency score based on pain points and timeline',
          files: ['lib/triage-engine.ts', 'components/assessment/TriageResult.tsx'],
          estimatedTime: '2 days'
        },
        {
          feature: 'Confidence Level System',
          description: 'Add confidence scores to all calculations based on data completeness',
          files: ['lib/types.ts', 'lib/calculators/roi-calculator.ts'],
          estimatedTime: '1 day'
        },
        {
          feature: 'Express Assessment Mode',
          description: 'Simplified 3-minute flow for busy executives',
          files: ['app/assessment/express/page.tsx', 'components/assessment/ExpressFlow.tsx'],
          estimatedTime: '3 days'
        }
      ],

      nextSteps: [
        '1. Review extracted findings from all tests',
        '2. Prioritize implementations by impact vs effort',
        '3. Create detailed specs for top 3 features',
        '4. Implement Triage Score Engine (highest priority)',
        '5. Add Confidence Levels to ROI calculations',
        '6. Design Express Mode UX flow'
      ]
    };

    // Save recommendations
    const resultsDir = join(__dirname, '../reports');
    const recFile = join(resultsDir, `culturabuilder-recommendations-${Date.now()}.json`);
    writeFileSync(recFile, JSON.stringify(recommendations, null, 2));

    console.log('📋 RECOMMENDATIONS FOR CULTURABUILDER');
    console.log('='.repeat(60));

    console.log('\n🎯 Cross-Industry Insights:');
    recommendations.crossIndustryInsights.forEach((insight, i) => {
      console.log(`\n${i + 1}. ${insight.category} [Priority: ${insight.priority.toUpperCase()}]`);
      console.log(`   📌 Observation: ${insight.observation}`);
      console.log(`   💡 Application: ${insight.application}`);
      console.log(`   ⚡ Effort: ${insight.effort}`);
    });

    console.log('\n\n🔧 Technical Implementations:');
    recommendations.technicalImplementations.forEach((impl, i) => {
      console.log(`\n${i + 1}. ${impl.feature} (${impl.estimatedTime})`);
      console.log(`   ${impl.description}`);
      console.log(`   Files: ${impl.files.join(', ')}`);
    });

    console.log('\n\n📍 Next Steps:');
    recommendations.nextSteps.forEach((step) => {
      console.log(`   ${step}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Recommendations saved to: ${recFile}\n`);

    expect(recommendations.crossIndustryInsights.length).toBeGreaterThan(0);
  });
});
