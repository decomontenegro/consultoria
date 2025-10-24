import { Page, expect } from '@playwright/test';

/**
 * Test Helpers for CulturaBuilder E2E Tests
 *
 * Reusable functions to reduce code duplication and improve test reliability
 */

// ============================================================================
// NAVIGATION HELPERS
// ============================================================================

export async function navigateToHomepage(page: Page) {
  await page.goto('http://localhost:3003');
  await expect(page.locator('text=/.*CulturaBuilder.*/i')).toBeVisible();
}

export async function navigateToDashboard(page: Page) {
  await page.goto('http://localhost:3003/dashboard');
  await page.waitForLoadState('networkidle');
}

export async function navigateToAnalytics(page: Page) {
  await page.goto('http://localhost:3003/analytics');
  await page.waitForLoadState('networkidle');
}

// ============================================================================
// STORAGE HELPERS
// ============================================================================

export async function clearAllLocalStorage(page: Page) {
  // Navigate to the app first to ensure proper context
  const currentUrl = page.url();
  if (!currentUrl.includes('localhost:3003')) {
    await page.goto('http://localhost:3003');
  }

  await page.evaluate(() => {
    localStorage.clear();
  }).catch(() => {
    // Ignore errors if localStorage is not available
  });
}

export async function getReportsFromStorage(page: Page): Promise<any[]> {
  return await page.evaluate(() => {
    const reports = localStorage.getItem('culturabuilder_reports');
    return reports ? JSON.parse(reports) : [];
  });
}

export async function getReportCount(page: Page): Promise<number> {
  const reports = await getReportsFromStorage(page);
  return Object.keys(reports).length;
}

export async function saveReportToStorage(page: Page, report: any) {
  await page.evaluate((reportData) => {
    const existing = JSON.parse(localStorage.getItem('culturabuilder_reports') || '{}');
    existing[reportData.id] = reportData;
    localStorage.setItem('culturabuilder_reports', JSON.stringify(existing));
  }, report);
}

// ============================================================================
// AI CONVERSATION HELPERS
// ============================================================================

export async function waitForAIMessage(page: Page, timeout = 15000) {
  // Wait for AI message to appear
  await page.waitForSelector(
    '[data-ai-message="true"], .ai-message, [role="article"]:has-text("AI")',
    { timeout, state: 'visible' }
  );

  // Wait for typing animation to complete
  await page.waitForTimeout(1000);
}

export async function sendUserMessage(page: Page, message: string) {
  // Find the input field (could be textarea or input)
  const input = page.locator('textarea, input[type="text"]').last();

  // Wait for input to be ready
  await input.waitFor({ state: 'visible' });

  // Type and send
  await input.fill(message);
  await page.waitForTimeout(300); // Debounce

  // Try to click send button if exists, otherwise press Enter
  const sendButton = page.locator('button[type="submit"], button:has-text("Enviar")').last();
  if (await sendButton.isVisible({ timeout: 1000 }).catch(() => false)) {
    await sendButton.click();
  } else {
    await input.press('Enter');
  }

  await page.waitForTimeout(500);
}

export async function completeAIConversation(page: Page, messages: string[]) {
  for (const message of messages) {
    await waitForAIMessage(page);
    await sendUserMessage(page, message);
  }
}

// ============================================================================
// ASSESSMENT HELPERS - EXPRESS MODE
// ============================================================================

export async function startExpressMode(page: Page) {
  await navigateToHomepage(page);
  await page.click('text=/.*Modo Express.*|.*Express Mode.*/i');
  await expect(page).toHaveURL(/.*assessment.*express.*/);
}

export async function completeExpressAssessment(page: Page, data: {
  company: string;
  industry: string;
  teamSize: string;
  painPoints: string;
  goals: string;
  name: string;
  email: string;
}) {
  await startExpressMode(page);

  // Answer questions
  await waitForAIMessage(page);
  await sendUserMessage(page, `${data.company}, ${data.industry}`);

  await waitForAIMessage(page);
  await sendUserMessage(page, data.teamSize);

  await waitForAIMessage(page);
  await sendUserMessage(page, data.painPoints);

  await waitForAIMessage(page);
  await sendUserMessage(page, data.goals);

  await waitForAIMessage(page);
  await sendUserMessage(page, `${data.name}, ${data.email}`);

  // Wait for report generation
  await page.waitForURL(/.*\/report\/.*/, { timeout: 20000 });

  return await getCurrentReportId(page);
}

// ============================================================================
// ASSESSMENT HELPERS - DEEP-DIVE MODE
// ============================================================================

export async function startDeepDiveMode(page: Page) {
  await navigateToHomepage(page);
  await page.click('text=/.*Começar Agora.*/i');
  await expect(page).toHaveURL(/.*\/assessment.*/);
}

export async function selectPersona(page: Page, persona: 'ceo' | 'cto' | 'pm' | 'em') {
  const personaMap = {
    ceo: 'CEO',
    cto: 'CTO',
    pm: 'Product Manager',
    em: 'Engineering Manager'
  };

  await page.click(`[data-persona="${persona}"], button:has-text("${personaMap[persona]}")`);
  await page.click('text=/.*Continuar.*|.*Próximo.*/i');
}

export async function fillCompanyInfo(page: Page, data: {
  name: string;
  industry: string;
  size: 'startup' | 'scaleup' | 'enterprise';
  teamSize: number;
}) {
  await page.fill('input[name="companyName"], input[placeholder*="empresa"]', data.name);
  await page.selectOption('select[name="industry"], select', data.industry);
  await page.click(`text=/.*${data.size}.*/i`);
  await page.fill('input[name="teamSize"], input[type="number"]', data.teamSize.toString());
  await page.click('text=/.*Continuar.*/i');
}

export async function fillCurrentState(page: Page, data: {
  engineers: number;
  seniors: number;
  useAI: boolean;
  tools?: string[];
  painPoints: string[];
}) {
  await page.fill('input[name="engineersCount"]', data.engineers.toString());
  await page.fill('input[name="seniorsCount"]', data.seniors.toString());

  if (data.useAI) {
    await page.click('text=/.*sim.*|.*yes.*/i');
    if (data.tools) {
      for (const tool of data.tools) {
        await page.fill('input[name="currentTools"]', tool);
      }
    }
  } else {
    await page.click('text=/.*não.*|.*no.*/i');
  }

  for (const painPoint of data.painPoints) {
    await page.click(`text=/.*${painPoint}.*/i`);
  }

  await page.click('text=/.*Continuar.*/i');
}

export async function fillGoalsAndInvestment(page: Page, data: {
  goals: string[];
  timeline: '3' | '6' | '12';
  departments?: string[];
}) {
  for (const goal of data.goals) {
    await page.click(`text=/.*${goal}.*/i`);
  }

  await page.click(`text=/.*${data.timeline} meses.*/i`);

  if (data.departments) {
    for (const dept of data.departments) {
      await page.click(`text=/.*${dept}.*/i`);
    }
  }

  await page.click('text=/.*Continuar.*/i');
}

export async function skipAIConsultation(page: Page) {
  await page.click('text=/.*Pular.*|.*Skip.*/i');
  await page.waitForURL(/.*\/report\/.*/, { timeout: 20000 });
}

export async function completeDeepDiveAssessment(page: Page, skipAI = true) {
  await startDeepDiveMode(page);

  await selectPersona(page, 'cto');

  await fillCompanyInfo(page, {
    name: 'Test Company',
    industry: 'Tecnologia',
    size: 'scaleup',
    teamSize: 50
  });

  await fillCurrentState(page, {
    engineers: 25,
    seniors: 8,
    useAI: false,
    painPoints: ['Produtividade']
  });

  await fillGoalsAndInvestment(page, {
    goals: ['Aumentar produtividade'],
    timeline: '6'
  });

  if (skipAI) {
    await skipAIConsultation(page);
  }

  return await getCurrentReportId(page);
}

// ============================================================================
// REPORT HELPERS
// ============================================================================

export async function getCurrentReportId(page: Page): Promise<string> {
  const url = page.url();
  const match = url.match(/\/report\/([^\/]+)/);
  return match ? match[1] : '';
}

export async function verifyReportPage(page: Page) {
  await expect(page.locator('text=/.*Relatório de.*Prontidão para IA.*/i')).toBeVisible();
  await expect(page.locator('text=/.*NPV 3 Anos.*/i')).toBeVisible();
  await expect(page.locator('text=/.*ROI Anual.*/i')).toBeVisible();
  await expect(page.locator('text=/.*Período de Retorno.*/i')).toBeVisible();
}

export async function exportReportAsJSON(page: Page) {
  const downloadPromise = page.waitForEvent('download');
  await page.click('text=/.*Export.*JSON.*/i, button:has-text("JSON")');
  return await downloadPromise;
}

export async function exportReportAsCSV(page: Page) {
  const downloadPromise = page.waitForEvent('download');
  await page.click('text=/.*Export.*CSV.*/i, button:has-text("CSV")');
  return await downloadPromise;
}

// ============================================================================
// DASHBOARD HELPERS
// ============================================================================

export async function searchDashboard(page: Page, query: string) {
  await page.fill('input[placeholder*="Buscar"], input[type="search"]', query);
  await page.waitForTimeout(500); // Debounce
}

export async function filterByIndustry(page: Page, industry: string) {
  await page.selectOption('select[name="industry"]', industry);
  await page.waitForTimeout(500);
}

export async function sortDashboard(page: Page, sortBy: 'npv' | 'roi' | 'payback' | 'date' | 'company') {
  await page.selectOption('select[name="sort"]', sortBy);
  await page.waitForTimeout(500);
}

export async function selectReportsForComparison(page: Page, count: number) {
  const checkboxes = page.locator('input[type="checkbox"]');
  for (let i = 0; i < count; i++) {
    await checkboxes.nth(i).check();
  }
}

export async function navigateToCompare(page: Page) {
  await page.click('text=/.*Comparar.*/i');
  await expect(page).toHaveURL(/.*\/compare.*/);
}

// ============================================================================
// SHARE HELPERS
// ============================================================================

export async function createShareLink(page: Page, expiryDays: '1' | '7' | '30' | 'never') {
  await page.click('text=/.*Share.*|.*Compartilhar.*/i');

  // Select expiry
  const expiryMap = {
    '1': '24h',
    '7': '7d',
    '30': '30d',
    'never': 'never'
  };

  await page.selectOption('select[name="expiry"]', expiryMap[expiryDays]);
  await page.click('text=/.*Gerar Link.*/i');

  // Get share link from UI
  const linkElement = page.locator('[data-share-link], input[readonly]').first();
  return await linkElement.inputValue();
}

export async function copyShareLink(page: Page) {
  await page.click('text=/.*Copiar.*/i');
  await expect(page.locator('text=/.*Copiado.*/i')).toBeVisible();
}

// ============================================================================
// BENCHMARK HELPERS
// ============================================================================

export async function verifyBenchmarkCard(page: Page, shouldExist: boolean) {
  const benchmarkCard = page.locator('text=/.*Benchmark de Indústria.*/i');

  if (shouldExist) {
    await expect(benchmarkCard).toBeVisible();
  } else {
    await expect(benchmarkCard).not.toBeVisible();
  }
}

export async function getBenchmarkRanking(page: Page): Promise<string> {
  const rankingBadge = page.locator('text=/.*Top.*%.*|.*Acima da Média.*|.*Média.*|.*Abaixo.*/i').first();
  return await rankingBadge.textContent() || '';
}

// ============================================================================
// DATA GENERATORS
// ============================================================================

export function generateRandomCompanyData() {
  const industries = ['Tecnologia', 'Saúde', 'Financeiro', 'Educação', 'E-commerce'];
  const sizes = ['startup', 'scaleup', 'enterprise'] as const;

  return {
    name: `TestCorp-${Date.now()}`,
    industry: industries[Math.floor(Math.random() * industries.length)],
    size: sizes[Math.floor(Math.random() * sizes.length)],
    teamSize: Math.floor(Math.random() * 200) + 20,
    engineers: Math.floor(Math.random() * 100) + 10,
    seniors: Math.floor(Math.random() * 30) + 3
  };
}

export function generateMockReport(overrides: any = {}) {
  const id = `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  return {
    id,
    generatedAt: new Date().toISOString(),
    assessmentData: {
      persona: 'cto',
      companyInfo: {
        name: 'Test Company',
        industry: 'Tecnologia',
        size: 'scaleup',
        teamSize: 50,
        ...overrides.companyInfo
      },
      currentState: {
        engineersCount: 25,
        seniorsCount: 8,
        useAITools: 'no',
        currentTools: [],
        painPoints: ['Produtividade'],
        ...overrides.currentState
      },
      goals: {
        primaryGoals: ['Aumentar produtividade'],
        timeline: '6 meses',
        ...overrides.goals
      }
    },
    roi: {
      paybackPeriodMonths: 8.5,
      threeYearNPV: 850000,
      irr: 250,
      confidenceLevel: 'high',
      dataQuality: {
        completeness: 95,
        specificity: 90
      },
      ...overrides.roi
    },
    benchmarks: [],
    recommendations: ['Test recommendation'],
    roadmap: [],
    costOfInaction: {
      opportunityCost: 500000,
      competitiveRisk: 'medium',
      talentRetention: 'medium'
    },
    riskMatrix: {
      overall: 'low',
      categories: []
    },
    ...overrides
  };
}

// ============================================================================
// WAITING & TIMING HELPERS
// ============================================================================

export async function waitForReportGeneration(page: Page, timeout = 20000) {
  await page.waitForURL(/.*\/report\/.*/, { timeout });
  await page.waitForLoadState('networkidle');
}

export async function waitForNavigation(page: Page, timeout = 10000) {
  await page.waitForLoadState('networkidle', { timeout });
}

// ============================================================================
// ASSERTION HELPERS
// ============================================================================

export async function assertEmptyState(page: Page, message: string) {
  await expect(page.locator(`text=/.*${message}.*/i`)).toBeVisible();
}

export async function assertErrorMessage(page: Page) {
  await expect(page.locator('text=/.*erro.*|.*error.*/i')).toBeVisible();
}

export async function assertSuccessMessage(page: Page) {
  await expect(page.locator('text=/.*sucesso.*|.*success.*/i')).toBeVisible();
}

// ============================================================================
// SCREENSHOT HELPERS
// ============================================================================

export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({
    path: `tests/screenshots/${name}-${Date.now()}.png`,
    fullPage: true
  });
}
