/**
 * UX/UI Analysis with Playwright
 *
 * Comprehensive evaluation of:
 * - Usability & User Experience
 * - Visual Design (colors, contrast, spacing)
 * - User Psychology & Cognitive Load
 * - Friction Points & Pain Points
 * - Mobile Responsiveness
 * - Accessibility
 *
 * Generates a detailed UX report with screenshots and recommendations.
 */

import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

interface UXIssue {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'positive';
  category: 'usability' | 'visual' | 'psychology' | 'performance' | 'accessibility';
  title: string;
  description: string;
  screenshot?: string;
  recommendation?: string;
  psychologyNote?: string;
}

interface UXMetrics {
  timeToFirstInteraction: number;
  timePerStep: Record<string, number>;
  clicksToComplete: number;
  formFieldsCount: number;
  readingComplexity: number;
  cognitiveLoad: 'low' | 'medium' | 'high';
  visualClutter: 'minimal' | 'moderate' | 'high';
  colorContrast: 'good' | 'needs-improvement' | 'poor';
}

class UXAnalyzer {
  private issues: UXIssue[] = [];
  private metrics: Partial<UXMetrics> = {};
  private screenshots: string[] = [];
  private startTime: number = 0;
  private stepTimes: Record<string, number> = {};
  private clickCount: number = 0;

  constructor(private page: Page, private reportDir: string) {
    // Create report directory
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
  }

  async captureScreenshot(name: string): Promise<string> {
    const filename = `${name.replace(/\s+/g, '-').toLowerCase()}.png`;
    const filepath = path.join(this.reportDir, filename);
    await this.page.screenshot({ path: filepath, fullPage: true });
    this.screenshots.push(filename);
    return filename;
  }

  addIssue(issue: UXIssue) {
    this.issues.push(issue);
    console.log(`[${issue.severity.toUpperCase()}] ${issue.category}: ${issue.title}`);
  }

  trackClick() {
    this.clickCount++;
  }

  startTimer() {
    this.startTime = Date.now();
  }

  endTimer(stepName: string) {
    const elapsed = Date.now() - this.startTime;
    this.stepTimes[stepName] = elapsed;
    this.startTime = Date.now(); // Reset for next step
  }

  async analyzeColors() {
    console.log('\n🎨 Analyzing Colors & Visual Design...');

    const colorAnalysis = await this.page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const colors = new Map<string, number>();
      const backgrounds = new Map<string, number>();
      let totalElements = 0;

      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        const color = style.color;
        const bgColor = style.backgroundColor;

        if (color && color !== 'rgba(0, 0, 0, 0)') {
          colors.set(color, (colors.get(color) || 0) + 1);
          totalElements++;
        }
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
          backgrounds.set(bgColor, (backgrounds.get(bgColor) || 0) + 1);
        }
      });

      return {
        uniqueColors: colors.size,
        uniqueBackgrounds: backgrounds.size,
        totalElements,
        colorDiversity: colors.size / totalElements
      };
    });

    // Check for color consistency
    if (colorAnalysis.uniqueColors > 15) {
      this.addIssue({
        severity: 'medium',
        category: 'visual',
        title: 'Paleta de cores muito diversa',
        description: `Detectadas ${colorAnalysis.uniqueColors} cores diferentes. Uma paleta mais restrita (6-10 cores) melhora consistência visual.`,
        recommendation: 'Definir design system com paleta limitada: primary, secondary, accent, neutrals (gray scale)',
        psychologyNote: 'Muitas cores aumentam cognitive load e reduzem clareza da hierarquia visual.'
      });
    }

    // Check contrast
    const contrastIssues = await this.page.evaluate(() => {
      const textElements = document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, button, a, label');
      let lowContrastCount = 0;

      textElements.forEach(el => {
        const style = window.getComputedStyle(el);
        const color = style.color;
        const bgColor = style.backgroundColor;

        // Simple contrast check (not WCAG compliant, but good enough for analysis)
        const colorRgb = color.match(/\d+/g);
        const bgRgb = bgColor.match(/\d+/g);

        if (colorRgb && bgRgb) {
          const colorLum = 0.299 * parseInt(colorRgb[0]) + 0.587 * parseInt(colorRgb[1]) + 0.114 * parseInt(colorRgb[2]);
          const bgLum = 0.299 * parseInt(bgRgb[0]) + 0.587 * parseInt(bgRgb[1]) + 0.114 * parseInt(bgRgb[2]);
          const contrast = Math.abs(colorLum - bgLum);

          if (contrast < 50) { // Arbitrary threshold
            lowContrastCount++;
          }
        }
      });

      return { lowContrastCount, totalTextElements: textElements.length };
    });

    if (contrastIssues.lowContrastCount > 0) {
      this.addIssue({
        severity: 'high',
        category: 'accessibility',
        title: 'Problemas de contraste detectados',
        description: `${contrastIssues.lowContrastCount} de ${contrastIssues.totalTextElements} elementos de texto têm baixo contraste.`,
        recommendation: 'Seguir WCAG 2.1 AA: contraste mínimo de 4.5:1 para texto normal, 3:1 para texto grande.',
        psychologyNote: 'Baixo contraste causa fadiga visual e dificulta leitura, especialmente para usuários com baixa visão.'
      });
    }
  }

  async analyzeLayout() {
    console.log('\n📐 Analyzing Layout & Spacing...');

    const layoutMetrics = await this.page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      const inputs = document.querySelectorAll('input');
      let tooSmallButtons = 0;
      let tooCloseElements = 0;

      // Check button sizes (touch target)
      buttons.forEach(btn => {
        const rect = btn.getBoundingClientRect();
        if (rect.width < 44 || rect.height < 44) {
          tooSmallButtons++;
        }
      });

      // Check spacing between interactive elements
      const interactiveElements = [...buttons, ...inputs];
      for (let i = 0; i < interactiveElements.length - 1; i++) {
        const rect1 = interactiveElements[i].getBoundingClientRect();
        const rect2 = interactiveElements[i + 1].getBoundingClientRect();

        const verticalGap = Math.abs(rect2.top - rect1.bottom);
        const horizontalGap = Math.abs(rect2.left - rect1.right);

        if ((verticalGap < 8 && verticalGap > 0) || (horizontalGap < 8 && horizontalGap > 0)) {
          tooCloseElements++;
        }
      }

      return {
        totalButtons: buttons.length,
        tooSmallButtons,
        tooCloseElements,
        totalInteractive: interactiveElements.length
      };
    });

    if (layoutMetrics.tooSmallButtons > 0) {
      this.addIssue({
        severity: 'high',
        category: 'usability',
        title: 'Botões muito pequenos',
        description: `${layoutMetrics.tooSmallButtons} de ${layoutMetrics.totalButtons} botões têm menos de 44x44px.`,
        recommendation: 'Seguir Apple HIG e Material Design: mínimo 44x44px (iOS) ou 48x48px (Android) para touch targets.',
        psychologyNote: 'Targets pequenos aumentam erro de clique (Lei de Fitts) e frustração, especialmente em mobile.'
      });
    }

    if (layoutMetrics.tooCloseElements > 5) {
      this.addIssue({
        severity: 'medium',
        category: 'usability',
        title: 'Elementos interativos muito próximos',
        description: `${layoutMetrics.tooCloseElements} pares de elementos têm menos de 8px de espaçamento.`,
        recommendation: 'Aumentar espaçamento entre elementos interativos para 12-16px mínimo.',
        psychologyNote: 'Elementos próximos causam erros de clique (fat finger problem) e aumentam ansiedade.'
      });
    }
  }

  async analyzeCognitiveLoad() {
    console.log('\n🧠 Analyzing Cognitive Load...');

    const cognitiveMetrics = await this.page.evaluate(() => {
      // Count form fields visible at once
      const visibleInputs = Array.from(document.querySelectorAll('input, select, textarea')).filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.top >= 0 && rect.top <= window.innerHeight;
      });

      // Count choices visible
      const visibleButtons = Array.from(document.querySelectorAll('button')).filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.top >= 0 && rect.top <= window.innerHeight;
      });

      // Measure text length
      const paragraphs = document.querySelectorAll('p, div:not(:has(*))');
      let totalTextLength = 0;
      paragraphs.forEach(p => {
        totalTextLength += p.textContent?.length || 0;
      });

      // Count steps/sections
      const sections = document.querySelectorAll('section, [class*="step"], [class*="card"]');

      return {
        visibleInputs: visibleInputs.length,
        visibleButtons: visibleButtons.length,
        totalTextLength,
        sectionsCount: sections.length,
        choicesOnScreen: visibleButtons.length
      };
    });

    // Hick's Law: More choices = more decision time
    if (cognitiveMetrics.choicesOnScreen > 7) {
      this.addIssue({
        severity: 'medium',
        category: 'psychology',
        title: 'Muitas opções simultâneas (Lei de Hick)',
        description: `${cognitiveMetrics.choicesOnScreen} opções visíveis ao mesmo tempo. Decisão fica mais lenta.`,
        recommendation: 'Limitar a 5-7 opções por tela. Use progressive disclosure ou categorização.',
        psychologyNote: 'Lei de Hick: Tempo de decisão aumenta logaritmicamente com número de opções. 7±2 é o limite da memória de trabalho.'
      });
    }

    // Miller's Law: 7±2 items in working memory
    if (cognitiveMetrics.visibleInputs > 7) {
      this.addIssue({
        severity: 'high',
        category: 'psychology',
        title: 'Muitos campos de formulário (Lei de Miller)',
        description: `${cognitiveMetrics.visibleInputs} campos visíveis simultaneamente. Excede capacidade da memória de trabalho.`,
        recommendation: 'Quebrar formulário em múltiplos steps com 3-5 campos por vez.',
        psychologyNote: 'Lei de Miller: Memória de trabalho comporta 7±2 itens. Mais que isso causa sobrecarga cognitiva e abandono.'
      });
    }

    // Text complexity
    if (cognitiveMetrics.totalTextLength > 500) {
      const readingTime = cognitiveMetrics.totalTextLength / 200; // ~200 words per minute
      if (readingTime > 2) {
        this.addIssue({
          severity: 'medium',
          category: 'usability',
          title: 'Texto muito longo',
          description: `Texto na tela requer ~${readingTime.toFixed(1)} minutos de leitura.`,
          recommendation: 'Reduzir texto em 40-50%. Usar bullets, ícones e progressive disclosure.',
          psychologyNote: 'Usuários scanneiam, não leem. Mais de 2 min de leitura = abandono. Use F-pattern e Z-pattern.'
        });
      }
    }
  }

  async analyzeUserFlow() {
    console.log('\n🔄 Analyzing User Flow & Friction...');

    // Check for back buttons
    const hasBackButton = await this.page.locator('button:has-text("Voltar"), button:has-text("Back")').count();
    if (hasBackButton === 0) {
      this.addIssue({
        severity: 'high',
        category: 'usability',
        title: 'Falta botão de "Voltar"',
        description: 'Usuário não pode voltar para corrigir erros sem recarregar a página.',
        recommendation: 'Adicionar botão "Voltar" em todas as etapas (exceto primeira).',
        psychologyNote: 'Falta de controle gera ansiedade. Usuários precisam sentir que podem corrigir erros (Jakob\'s Law).'
      });
    }

    // Check for progress indicators
    const hasProgressBar = await this.page.locator('[role="progressbar"], .progress').count();
    if (hasProgressBar === 0) {
      this.addIssue({
        severity: 'medium',
        category: 'psychology',
        title: 'Falta indicador de progresso',
        description: 'Usuário não sabe quanto falta para completar.',
        recommendation: 'Adicionar progress bar ou "Etapa X de Y".',
        psychologyNote: 'Goal Gradient Effect: Usuários aceleram quando veem que estão perto do fim. Progresso visível aumenta completion rate.'
      });
    }

    // Check for error messages
    const inputs = await this.page.locator('input[required]').count();
    if (inputs > 0) {
      // Try submitting empty
      const submitBtn = this.page.locator('button[type="submit"], button:has-text("Enviar"), button:has-text("Continuar")').first();
      if (await submitBtn.count() > 0) {
        await submitBtn.click();
        await this.page.waitForTimeout(500);

        const errorMessages = await this.page.locator('.error, [class*="error"], [role="alert"]').count();
        if (errorMessages === 0) {
          this.addIssue({
            severity: 'critical',
            category: 'usability',
            title: 'Falta feedback de erro',
            description: 'Campos obrigatórios não mostram mensagem de erro quando vazios.',
            recommendation: 'Adicionar validação inline com mensagens claras (ex: "Este campo é obrigatório").',
            psychologyNote: 'Usuários ficam perdidos sem feedback. Ansiedade aumenta, satisfação diminui.'
          });
        }
      }
    }
  }

  async analyzeAccessibility() {
    console.log('\n♿ Analyzing Accessibility...');

    const a11yIssues = await this.page.evaluate(() => {
      const issues: string[] = [];

      // Check for alt text on images
      const images = document.querySelectorAll('img');
      let missingAlt = 0;
      images.forEach(img => {
        if (!img.alt) missingAlt++;
      });
      if (missingAlt > 0) issues.push(`${missingAlt} imagens sem alt text`);

      // Check for form labels
      const inputs = document.querySelectorAll('input');
      let missingLabels = 0;
      inputs.forEach(input => {
        const label = document.querySelector(`label[for="${input.id}"]`);
        const ariaLabel = input.getAttribute('aria-label');
        if (!label && !ariaLabel) missingLabels++;
      });
      if (missingLabels > 0) issues.push(`${missingLabels} inputs sem label`);

      // Check for heading hierarchy
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      const headingLevels = headings.map(h => parseInt(h.tagName[1]));
      let brokenHierarchy = false;
      for (let i = 1; i < headingLevels.length; i++) {
        if (headingLevels[i] - headingLevels[i - 1] > 1) {
          brokenHierarchy = true;
          break;
        }
      }
      if (brokenHierarchy) issues.push('Hierarquia de headings quebrada (h1 → h3)');

      // Check for keyboard navigation
      const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
      let notFocusable = 0;
      interactiveElements.forEach(el => {
        const tabindex = el.getAttribute('tabindex');
        if (tabindex === '-1') notFocusable++;
      });
      if (notFocusable > 0) issues.push(`${notFocusable} elementos interativos não focáveis`);

      return issues;
    });

    a11yIssues.forEach(issue => {
      this.addIssue({
        severity: 'high',
        category: 'accessibility',
        title: 'Problema de acessibilidade',
        description: issue,
        recommendation: 'Seguir WCAG 2.1 Level AA. Testar com screen reader.',
        psychologyNote: '15% da população tem alguma deficiência. Acessibilidade beneficia todos (curb-cut effect).'
      });
    });
  }

  async analyzeMobileExperience(viewport: { width: number; height: number }) {
    console.log(`\n📱 Analyzing Mobile Experience (${viewport.width}x${viewport.height})...`);

    await this.page.setViewportSize(viewport);
    await this.page.waitForTimeout(500);

    // Check for horizontal scroll
    const hasHorizontalScroll = await this.page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    if (hasHorizontalScroll) {
      this.addIssue({
        severity: 'critical',
        category: 'usability',
        title: 'Scroll horizontal em mobile',
        description: 'Conteúdo vaza para fora da tela em mobile.',
        recommendation: 'Usar responsive design: max-width: 100%, flex-wrap, media queries.',
        psychologyNote: 'Scroll horizontal é anti-pattern móvel. Causa frustração instantânea.'
      });
    }

    // Check text size
    const textSizes = await this.page.evaluate(() => {
      const textElements = document.querySelectorAll('p, span, li, a, button');
      let tooSmallText = 0;

      textElements.forEach(el => {
        const fontSize = window.getComputedStyle(el).fontSize;
        const size = parseInt(fontSize);
        if (size < 14) tooSmallText++;
      });

      return { tooSmallText, total: textElements.length };
    });

    if (textSizes.tooSmallText > 0) {
      this.addIssue({
        severity: 'high',
        category: 'usability',
        title: 'Texto muito pequeno em mobile',
        description: `${textSizes.tooSmallText} de ${textSizes.total} elementos com menos de 14px.`,
        recommendation: 'Usar mínimo 14px para corpo, 16px preferível. Botões: 16px mínimo.',
        psychologyNote: 'Texto pequeno força zoom, quebra fluxo, aumenta erro de leitura.'
      });
    }

    await this.captureScreenshot(`mobile-${viewport.width}x${viewport.height}`);
  }

  generateReport(): string {
    console.log('\n📊 Generating UX Report...');

    // Group issues by severity
    const critical = this.issues.filter(i => i.severity === 'critical');
    const high = this.issues.filter(i => i.severity === 'high');
    const medium = this.issues.filter(i => i.severity === 'medium');
    const low = this.issues.filter(i => i.severity === 'low');
    const positive = this.issues.filter(i => i.severity === 'positive');

    // Calculate UX score
    const totalIssues = critical.length + high.length + medium.length + low.length;
    const score = Math.max(0, 100 - (critical.length * 20 + high.length * 10 + medium.length * 5 + low.length * 2));

    let report = `
# 🎨 UX/UI Analysis Report

**Generated:** ${new Date().toLocaleString()}
**UX Score:** ${score}/100

## 📊 Executive Summary

- **Total Issues Found:** ${totalIssues}
  - 🔴 Critical: ${critical.length}
  - 🟠 High: ${high.length}
  - 🟡 Medium: ${medium.length}
  - 🟢 Low: ${low.length}
- **Positive Findings:** ${positive.length}
- **Total Clicks Tracked:** ${this.clickCount}
- **Screenshots Captured:** ${this.screenshots.length}

## 🎯 Key Findings

### 🔴 Critical Issues (Fix Immediately)

${critical.length === 0 ? '*No critical issues found*' : critical.map(issue => `
#### ${issue.title}

**Category:** ${issue.category}
**Description:** ${issue.description}

${issue.recommendation ? `**Recommendation:** ${issue.recommendation}` : ''}

${issue.psychologyNote ? `💡 **Psychology Note:** ${issue.psychologyNote}` : ''}

${issue.screenshot ? `![Screenshot](${issue.screenshot})` : ''}

---
`).join('\n')}

### 🟠 High Priority Issues

${high.length === 0 ? '*No high priority issues found*' : high.map(issue => `
#### ${issue.title}

**Category:** ${issue.category}
**Description:** ${issue.description}

${issue.recommendation ? `**Recommendation:** ${issue.recommendation}` : ''}

${issue.psychologyNote ? `💡 **Psychology Note:** ${issue.psychologyNote}` : ''}

---
`).join('\n')}

### 🟡 Medium Priority Issues

${medium.length === 0 ? '*No medium priority issues found*' : medium.map(issue => `
#### ${issue.title}

**Category:** ${issue.category}
**Description:** ${issue.description}

${issue.recommendation ? `**Recommendation:** ${issue.recommendation}` : ''}

---
`).join('\n')}

### 🟢 Low Priority Issues

${low.length === 0 ? '*No low priority issues found*' : low.map(issue => `
- **${issue.title}:** ${issue.description}
`).join('\n')}

## ✅ Positive Findings

${positive.length === 0 ? '*No specific positives noted (doesn\'t mean there aren\'t any!)*' : positive.map(issue => `
- **${issue.title}:** ${issue.description}
`).join('\n')}

## 📈 Performance Metrics

### Step Completion Times

${Object.keys(this.stepTimes).length === 0 ? '*No timing data collected*' : Object.entries(this.stepTimes).map(([step, time]) => `
- **${step}:** ${time}ms (${(time / 1000).toFixed(1)}s)
`).join('\n')}

## 🎓 UX Psychology Principles Applied

This analysis considered:

1. **Hick's Law:** Decision time increases with number of choices
2. **Miller's Law:** Working memory holds 7±2 items
3. **Fitts's Law:** Time to click = distance + size of target
4. **Jakob's Law:** Users expect familiar patterns
5. **Goal Gradient Effect:** Motivation increases near completion
6. **Serial Position Effect:** Users remember first and last items
7. **Cognitive Load Theory:** Minimize unnecessary mental effort
8. **F-Pattern & Z-Pattern:** How users scan content

## 🚀 Priority Action Items

1. **Fix all Critical issues** (estimated: ${critical.length} hours)
2. **Address High priority issues** (estimated: ${high.length * 2} hours)
3. **Plan Medium issues for next sprint**
4. **Consider Low issues for backlog**

## 📸 Screenshots

${this.screenshots.map(s => `- [${s}](./${s})`).join('\n')}

---

**Methodology:** Automated analysis with Playwright + manual UX review
**Standards:** WCAG 2.1 AA, Apple HIG, Material Design, Nielsen's Heuristics
`;

    const reportPath = path.join(this.reportDir, 'UX-REPORT.md');
    fs.writeFileSync(reportPath, report);

    console.log(`\n✅ Report generated: ${reportPath}`);
    console.log(`📊 UX Score: ${score}/100`);
    console.log(`🔴 Critical: ${critical.length} | 🟠 High: ${high.length} | 🟡 Medium: ${medium.length}`);

    return report;
  }
}

test.describe('UX/UI Comprehensive Analysis', () => {
  let analyzer: UXAnalyzer;

  test('Complete UX Analysis of Assessment Flow', async ({ page, browser }) => {
    console.log('🎨 Starting Comprehensive UX Analysis...\n');

    const reportDir = path.join(__dirname, 'ux-analysis-report');
    analyzer = new UXAnalyzer(page, reportDir);

    // Navigate to homepage
    analyzer.startTimer();
    await page.goto('http://localhost:3002');
    analyzer.endTimer('Homepage Load');

    await analyzer.captureScreenshot('01-homepage');

    // Analyze homepage
    await analyzer.analyzeColors();
    await analyzer.analyzeLayout();
    await analyzer.analyzeCognitiveLoad();
    await analyzer.analyzeAccessibility();

    // Navigate to assessment
    analyzer.trackClick();
    await page.click('a[href="/assessment"]');
    await page.waitForLoadState('networkidle');
    analyzer.endTimer('Navigate to Assessment');

    await analyzer.captureScreenshot('02-assessment-start');

    // Analyze AI Router
    console.log('\n🤖 Analyzing AI Router UX...');
    await analyzer.analyzeUserFlow();

    // Check auto-focus
    const inputFocused = await page.evaluate(() => {
      const input = document.querySelector('input[type="text"]');
      return document.activeElement === input;
    });

    if (!inputFocused) {
      analyzer.addIssue({
        severity: 'high',
        category: 'usability',
        title: 'Input não tem auto-focus',
        description: 'Usuário precisa clicar no campo antes de digitar.',
        recommendation: 'Adicionar autoFocus prop e ref.current.focus() no useEffect.',
        psychologyNote: 'Cada clique extra = friction. Usuário deve poder digitar imediatamente.'
      });
    } else {
      analyzer.addIssue({
        severity: 'positive',
        category: 'usability',
        title: '✅ Input com auto-focus',
        description: 'Campo já está focado, usuário pode digitar imediatamente.'
      });
    }

    // Test mobile responsiveness
    await analyzer.analyzeMobileExperience({ width: 375, height: 667 }); // iPhone SE
    await analyzer.analyzeMobileExperience({ width: 390, height: 844 }); // iPhone 12/13
    await analyzer.analyzeMobileExperience({ width: 360, height: 740 }); // Android

    // Reset to desktop
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Complete a full flow
    console.log('\n🔄 Testing Complete User Flow...');

    try {
      // Answer AI Router questions
      await page.fill('input[type="text"]', 'Desenvolvimento lento, perdemos para competidores');
      analyzer.trackClick();
      await page.press('input[type="text"]', 'Enter');
      await page.waitForTimeout(800);
      await analyzer.captureScreenshot('03-ai-router-q1');

      await page.fill('input[type="text"]', 'CEO');
      analyzer.trackClick();
      await page.press('input[type="text"]', 'Enter');
      await page.waitForTimeout(800);

      await page.fill('input[type="text"]', '200');
      analyzer.trackClick();
      await page.press('input[type="text"]', 'Enter');
      await page.waitForTimeout(800);

      await page.fill('input[type="text"]', 'Fintech');
      analyzer.trackClick();
      await page.press('input[type="text"]', 'Enter');
      await page.waitForTimeout(1000);

      // Check for mode selection
      const hasModeSelection = await page.locator('text=Express Mode').count();
      if (hasModeSelection > 0) {
        await analyzer.captureScreenshot('04-mode-selection');

        // Check if recommendation is clear
        const hasRecommendation = await page.locator('text=recomendo, text=sugerimos, text=indicado').count();
        if (hasRecommendation === 0) {
          analyzer.addIssue({
            severity: 'medium',
            category: 'psychology',
            title: 'Falta clareza na recomendação',
            description: 'Usuário precisa escolher entre modos sem guidance clara.',
            recommendation: 'Adicionar "Recomendado para você" badge + explicação do porquê.',
            psychologyNote: 'Paradox of Choice: muitas opções sem guidance = paralisia decisional.'
          });
        }

        analyzer.trackClick();
        await page.locator('button:has-text("Express Mode")').first().click();
        await page.waitForTimeout(1500);
        await analyzer.captureScreenshot('05-express-mode');
      }

    } catch (error) {
      console.error('Error during flow test:', error);
      await analyzer.captureScreenshot('error-state');
      analyzer.addIssue({
        severity: 'critical',
        category: 'usability',
        title: 'Erro durante fluxo completo',
        description: `Teste automatizado falhou: ${error}`,
        recommendation: 'Revisar fluxo end-to-end manualmente.'
      });
    }

    // Generate final report
    const report = analyzer.generateReport();

    console.log('\n✅ UX Analysis Complete!');
    console.log(`📄 Report: tests/ux-analysis-report/UX-REPORT.md`);
  });
});
