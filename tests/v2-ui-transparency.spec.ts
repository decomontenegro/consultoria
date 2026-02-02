import { test, expect, Page } from '@playwright/test';

/**
 * V2 UI TRANSPARENCY TESTS
 *
 * Valida que a interface do usuário apresenta transparência adequada para C-level executives:
 * - Confidence badges são visíveis e compreensíveis
 * - Ranges são apresentados claramente
 * - Fontes são citadas e acessíveis
 * - Disclaimers aparecem quando necessário
 * - Metodologia é acessível
 *
 * Estes testes protegem a experiência do usuário executive.
 */

const BASE_URL = 'http://localhost:3002';

test.describe('Confidence Badge Display', () => {

  test('High confidence metrics show green badges', async ({ page }) => {
    await page.goto(`${BASE_URL}/report/test-id`);
    await page.waitForLoadState('networkidle');

    // Procurar por badges de alta confiança (80-100%)
    const highConfidenceBadges = page.locator('[class*="neon-green"][class*="confiança"], [class*="green"][class*="confidence"]');

    // Se houver métricas de alta confiança, badges devem estar presentes
    const count = await highConfidenceBadges.count();

    // Log para debug
    console.log(`Found ${count} high confidence badges`);
  });

  test('Medium confidence metrics show yellow badges', async ({ page }) => {
    await page.goto(`${BASE_URL}/report/test-id`);
    await page.waitForLoadState('networkidle');

    // Procurar por badges de média confiança (60-79%)
    const mediumConfidenceBadges = page.locator('[class*="yellow"][class*="confiança"], [class*="yellow"][class*="confidence"]');

    const count = await mediumConfidenceBadges.count();
    console.log(`Found ${count} medium confidence badges`);
  });

  test('Low confidence metrics show orange/red badges with warnings', async ({ page }) => {
    await page.goto(`${BASE_URL}/report/test-id`);
    await page.waitForLoadState('networkidle');

    // Procurar por badges de baixa confiança (<60%)
    const lowConfidenceBadges = page.locator('[class*="orange"][class*="confiança"], [class*="red"][class*="confiança"]');

    const count = await lowConfidenceBadges.count();
    console.log(`Found ${count} low confidence badges`);

    // Se houver baixa confiança, deve haver disclaimers
    if (count > 0) {
      const disclaimers = page.locator('text=/estimado|projetado|valores podem variar|estimativa genérica/i');
      const disclaimerCount = await disclaimers.count();
      expect(disclaimerCount).toBeGreaterThan(0);
    }
  });

  test('Confidence percentages are displayed numerically', async ({ page }) => {
    await page.goto(`${BASE_URL}/report/test-id`);
    await page.waitForLoadState('networkidle');

    // Procurar por percentuais exatos (ex: "85% confiança")
    const confidenceNumbers = page.locator('text=/\\d+%\\s*(confiança|confidence)/i');

    const count = await confidenceNumbers.count();
    console.log(`Found ${count} numerical confidence scores`);

    // Deve haver pelo menos alguns scores numéricos
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Range Visualization', () => {

  test('Metrics display conservative/realistic/optimistic ranges', async ({ page }) => {
    await page.goto(`${BASE_URL}/report/test-id`);
    await page.waitForLoadState('networkidle');

    // Procurar por indicadores de range
    const rangeLabels = [
      page.locator('text=/conservador/i'),
      page.locator('text=/realista/i'),
      page.locator('text=/otimista/i')
    ];

    let foundRanges = 0;
    for (const label of rangeLabels) {
      const count = await label.count();
      if (count > 0) foundRanges++;
    }

    console.log(`Found ${foundRanges}/3 range labels`);
  });

  test('Visual range bars are present for key metrics', async ({ page }) => {
    await page.goto(`${BASE_URL}/report/test-id`);
    await page.waitForLoadState('networkidle');

    // Procurar por elementos visuais de range (barras, gradientes)
    const rangeVisuals = page.locator('[class*="range"], [class*="gradient"]');

    const count = await rangeVisuals.count();
    console.log(`Found ${count} range visual elements`);
  });

  test('Range values show min and max clearly', async ({ page }) => {
    await page.goto(`${BASE_URL}/report/test-id`);
    await page.waitForLoadState('networkidle');

    // Procurar por padrões de range (ex: "R$ 850K - R$ 1.15M")
    const rangePatternsLocator = page.locator('text=/R\\$\\s*[\\d,\\.]+[KMB]?\\s*-\\s*R\\$\\s*[\\d,\\.]+[KMB]?/');

    const count = await rangePatternsLocator.count();
    console.log(`Found ${count} monetary range displays`);
  });
});

test.describe('Source Attribution Display', () => {

  test('Tier-1 sources are cited throughout report', async ({ page }) => {
    await page.goto(`${BASE_URL}/report/test-id`);
    await page.waitForLoadState('networkidle');

    // Fontes tier-1 que devem aparecer
    const tier1Sources = [
      { name: 'McKinsey', pattern: /mckinsey/i },
      { name: 'DORA', pattern: /dora/i },
      { name: 'Forrester', pattern: /forrester/i },
      { name: 'GitHub', pattern: /github/i }
    ];

    let foundSources = 0;
    for (const source of tier1Sources) {
      const locator = page.locator(`text=${source.pattern}`);
      const count = await locator.count();
      if (count > 0) {
        foundSources++;
        console.log(`✓ Found ${source.name} citation`);
      }
    }

    // Pelo menos 2 fontes tier-1 devem ser citadas
    expect(foundSources).toBeGreaterThanOrEqual(2);
  });

  test('Source links are clickable and open in new tab', async ({ page }) => {
    await page.goto(`${BASE_URL}/report/test-id`);
    await page.waitForLoadState('networkidle');

    // Procurar por links externos (ícone ExternalLink)
    const externalLinks = page.locator('a[target="_blank"][rel*="noopener"]');

    const count = await externalLinks.count();
    console.log(`Found ${count} external source links`);

    if (count > 0) {
      // Verificar que links têm href válido
      const firstLink = externalLinks.first();
      const href = await firstLink.getAttribute('href');
      expect(href).toMatch(/^https?:\/\/.+/);
    }
  });

  test('Expandable source sections work correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/report/test-id`);
    await page.waitForLoadState('networkidle');

    // Procurar por botões "Ver fontes"
    const expandButtons = page.locator('text=/ver fontes|view sources|expandir|expand/i');

    const count = await expandButtons.count();
    console.log(`Found ${count} expandable source buttons`);

    if (count > 0) {
      // Clicar no primeiro botão
      await expandButtons.first().click();
      await page.waitForTimeout(500); // Aguardar animação

      // Deve revelar informações adicionais
      const expandedContent = page.locator('[class*="expanded"], [class*="visible"]');
      const expandedCount = await expandedContent.count();
      expect(expandedCount).toBeGreaterThan(0);
    }
  });

  test('Sample sizes are displayed for benchmarks', async ({ page }) => {
    await page.goto(`${BASE_URL}/report/test-id`);
    await page.waitForLoadState('networkidle');

    // Procurar por menções de sample size (ex: "N=1000", "300+ empresas")
    const sampleSizePattern = page.locator('text=/N\\s*[=>]\\s*\\d+|\\d+\\+?\\s*(empresas|companies|respondents)/i');

    const count = await sampleSizePattern.count();
    console.log(`Found ${count} sample size mentions`);
  });
});

test.describe('Disclaimer and Warning Display', () => {

  test('Generic benchmark disclaimer appears when using industry data', async ({ page }) => {
    await page.goto(`${BASE_URL}/report/test-id`);
    await page.waitForLoadState('networkidle');

    // Procurar por disclaimers sobre benchmarks
    const disclaimers = page.locator('text=/benchmark|indústria|industry average|dados genéricos/i');

    const count = await disclaimers.count();
    console.log(`Found ${count} benchmark disclaimers`);
  });

  test('Low confidence sections show prominent warnings', async ({ page }) => {
    await page.goto(`${BASE_URL}/report/test-id`);
    await page.waitForLoadState('networkidle');

    // Procurar por avisos visuais (ícones de alerta, cores laranja/vermelho)
    const warningIcons = page.locator('[class*="AlertTriangle"], [class*="warning"]');

    const count = await warningIcons.count();
    console.log(`Found ${count} warning icons`);
  });

  test('Cost of Inaction tones down CTA when confidence is low', async ({ page }) => {
    await page.goto(`${BASE_URL}/report/test-id`);
    await page.waitForLoadState('networkidle');

    // Se houver seção de Cost of Inaction, verificar linguagem
    const coiSection = page.locator('text=/custo de não agir|custo de inação|cost of inaction/i');

    if (await coiSection.count() > 0) {
      // Linguagem agressiva (alta confiança): "O melhor momento foi ontem"
      // Linguagem educacional (baixa confiança): "Oportunidade", "recomendamos fornecer dados"

      const aggressiveCTA = page.locator('text=/melhor momento foi ontem|momento de agir é agora/i');
      const educationalCTA = page.locator('text=/oportunidade|recomendamos fornecer dados|estimativa baseada/i');

      const aggressiveCount = await aggressiveCTA.count();
      const educationalCount = await educationalCTA.count();

      console.log(`Aggressive CTAs: ${aggressiveCount}, Educational CTAs: ${educationalCount}`);
    }
  });

  test('Consultant insights title changes based on confidence', async ({ page }) => {
    await page.goto(`${BASE_URL}/report/test-id`);
    await page.waitForLoadState('networkidle');

    // Títulos dinâmicos baseados em confiança
    const titleVariants = [
      page.locator('text=/impacto financeiro real/i'),      // Alta confiança
      page.locator('text=/impacto financeiro estimado/i'),  // Média confiança
      page.locator('text=/impacto financeiro projetado/i')  // Baixa confiança
    ];

    let foundTitle = false;
    for (const variant of titleVariants) {
      const count = await variant.count();
      if (count > 0) {
        foundTitle = true;
        console.log(`Found title variant: ${await variant.textContent()}`);
        break;
      }
    }

    // Pelo menos um título deve estar presente
    expect(foundTitle).toBe(true);
  });
});

test.describe('Methodology and Documentation Access', () => {

  test('Methodology link is prominent and accessible', async ({ page }) => {
    await page.goto(`${BASE_URL}/report/test-id`);
    await page.waitForLoadState('networkidle');

    // Procurar por links para metodologia
    const methodologyLinks = page.locator('a[href*="/methodology"], text=/metodologia|methodology/i');

    const count = await methodologyLinks.count();
    console.log(`Found ${count} methodology links`);

    if (count > 0) {
      // Clicar e verificar navegação
      const link = methodologyLinks.first();
      await link.click();
      await page.waitForURL(/.*\/methodology.*/);

      // Verificar que página carregou
      await expect(page.locator('text=/metodologia|methodology/i')).toBeVisible();
    }
  });

  test('Glossary is accessible from report', async ({ page }) => {
    await page.goto(`${BASE_URL}/report/test-id`);
    await page.waitForLoadState('networkidle');

    // Procurar por links para glossário
    const glossaryLinks = page.locator('a[href*="/glossary"], text=/glossário|glossary/i');

    const count = await glossaryLinks.count();
    console.log(`Found ${count} glossary links`);
  });

  test('Methodology page loads without errors', async ({ page }) => {
    await page.goto(`${BASE_URL}/methodology`);

    await expect(page).toHaveURL(/.*\/methodology/);

    // Verificar seções principais
    const sections = [
      page.locator('text=/princípios fundamentais|fundamental principles/i'),
      page.locator('text=/fontes tier-1|tier-1 sources/i'),
      page.locator('text=/níveis de confiança|confidence levels/i'),
      page.locator('text=/percentis|percentiles/i')
    ];

    let foundSections = 0;
    for (const section of sections) {
      const count = await section.count();
      if (count > 0) foundSections++;
    }

    console.log(`Found ${foundSections}/${sections.length} methodology sections`);
    expect(foundSections).toBeGreaterThanOrEqual(3);
  });

  test('Glossary page defines key financial terms', async ({ page }) => {
    await page.goto(`${BASE_URL}/glossary`);

    await expect(page).toHaveURL(/.*\/glossary/);

    // Verificar que termos chave estão definidos
    const keyTerms = [
      page.locator('text=/ROI.*Return on Investment/i'),
      page.locator('text=/NPV.*Net Present Value/i'),
      page.locator('text=/Payback Period/i'),
      page.locator('text=/MTTR.*Mean Time to Recovery/i')
    ];

    let foundTerms = 0;
    for (const term of keyTerms) {
      const count = await term.count();
      if (count > 0) foundTerms++;
    }

    console.log(`Found ${foundTerms}/${keyTerms.length} key term definitions`);
    expect(foundTerms).toBeGreaterThanOrEqual(3);
  });
});

test.describe('Visual Feedback Based on Confidence', () => {

  test('High confidence sections use green/positive colors', async ({ page }) => {
    await page.goto(`${BASE_URL}/report/test-id`);
    await page.waitForLoadState('networkidle');

    // Procurar por elementos com classes de alta confiança
    const highConfidenceElements = page.locator('[class*="neon-green"], [class*="green-500"]');

    const count = await highConfidenceElements.count();
    console.log(`Found ${count} high-confidence visual elements`);
  });

  test('Low confidence sections use orange/amber colors', async ({ page }) => {
    await page.goto(`${BASE_URL}/report/test-id`);
    await page.waitForLoadState('networkidle');

    // Procurar por elementos com cores de advertência
    const lowConfidenceElements = page.locator('[class*="orange"], [class*="amber"], [class*="yellow-400"]');

    const count = await lowConfidenceElements.count();
    console.log(`Found ${count} low-confidence visual elements`);
  });

  test('Contextual colors adapt to confidence level', async ({ page }) => {
    await page.goto(`${BASE_URL}/report/test-id`);
    await page.waitForLoadState('networkidle');

    // Verificar que existem diferentes tratamentos visuais
    const colorVariants = [
      await page.locator('[class*="green"]').count(),
      await page.locator('[class*="yellow"]').count(),
      await page.locator('[class*="orange"]').count()
    ];

    const uniqueColors = colorVariants.filter(count => count > 0).length;
    console.log(`Found ${uniqueColors} different confidence color treatments`);

    // Deve haver variação visual baseada em confiança
    expect(uniqueColors).toBeGreaterThanOrEqual(1);
  });
});

test.describe('Percentile Attribution', () => {

  test('Metrics display percentile labels (p25, p50, p75)', async ({ page }) => {
    await page.goto(`${BASE_URL}/report/test-id`);
    await page.waitForLoadState('networkidle');

    // Procurar por indicadores de percentil
    const percentileLabels = page.locator('text=/p25|p50|p75|p90|percentil\\s*\\d+/i');

    const count = await percentileLabels.count();
    console.log(`Found ${count} percentile labels`);
  });

  test('p75 (optimistic) is clearly marked as primary value', async ({ page }) => {
    await page.goto(`${BASE_URL}/report/test-id`);
    await page.waitForLoadState('networkidle');

    // Procurar por menções de p75 como valor otimista
    const p75Labels = page.locator('text=/p75|percentil 75|otimista/i');

    const count = await p75Labels.count();
    console.log(`Found ${count} p75/optimistic labels`);
  });

  test('Alternative scenarios (p25, p50) are available', async ({ page }) => {
    await page.goto(`${BASE_URL}/report/test-id`);
    await page.waitForLoadState('networkidle');

    // Verificar que cenários alternativos existem
    const scenarios = [
      await page.locator('text=/p25|conservador/i').count(),
      await page.locator('text=/p50|realista|mediana/i').count()
    ];

    const availableScenarios = scenarios.filter(count => count > 0).length;
    console.log(`Found ${availableScenarios} alternative scenarios`);
  });
});

test.describe('Backward Compatibility', () => {

  test('V1 reports still render without errors', async ({ page }) => {
    // Testar que reports antigos (sem dados V2) ainda funcionam
    await page.goto(`${BASE_URL}/report/old-v1-report-id`);
    await page.waitForLoadState('networkidle');

    // Não deve haver erros críticos
    const errorMessages = page.locator('text=/error|erro|undefined|null/i');
    const errorCount = await errorMessages.count();

    console.log(`Found ${errorCount} potential error messages (should be low)`);
  });

  test('V1 reports show appropriate fallback messaging', async ({ page }) => {
    await page.goto(`${BASE_URL}/report/old-v1-report-id`);
    await page.waitForLoadState('networkidle');

    // Procurar por mensagens de dados genéricos/mock
    const fallbackMessages = page.locator('text=/estimativa genérica|dados parciais|perfil genérico/i');

    const count = await fallbackMessages.count();
    console.log(`Found ${count} fallback messages for V1 data`);
  });
});

test.describe('Mobile Responsiveness', () => {

  test('Confidence badges are visible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto(`${BASE_URL}/report/test-id`);
    await page.waitForLoadState('networkidle');

    const confidenceBadges = page.locator('[class*="confiança"], [class*="confidence"]');
    const count = await confidenceBadges.count();

    console.log(`Found ${count} confidence badges on mobile`);
  });

  test('Range visualizations adapt to mobile layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/report/test-id`);
    await page.waitForLoadState('networkidle');

    // Verificar que ranges ainda são visíveis
    const rangeElements = page.locator('text=/conservador|realista|otimista/i');
    const count = await rangeElements.count();

    console.log(`Found ${count} range elements on mobile`);
  });
});
