# Research Tests - Playwright Automation

## 📋 Visão Geral

Esta pasta contém scripts de research automatizados usando Playwright para:
- Analisar sites competidores e projects similares
- Extrair patterns de UX, copy, e flow
- Gerar insights acionáveis para product development
- Criar competitive intelligence reports

## 🎯 Por Que Research Automation?

**Problemas que resolve**:
- ❌ Research manual é demorado e inconsistente
- ❌ Difícil fazer benchmark sistemático de múltiplos sites
- ❌ Insights ficam em notas dispersas, não estruturadas
- ❌ Impossível re-run análises quando sites mudam

**Benefícios**:
- ✅ **Velocidade**: Analisa 10+ sites em minutos
- ✅ **Consistência**: Mesmos critérios para todos
- ✅ **Estruturado**: Output em JSON reutilizável
- ✅ **Auditável**: Screenshots + logs automáticos
- ✅ **Repetível**: Re-run quando competitors atualizam

## 📂 Scripts Disponíveis

### 1. `analyze-tutoria-ia.spec.ts`

**Propósito**: Análise profunda do tutoria-ia.vercel.app (healthcare diagnostic automation)

**O que analisa**:
- ✅ Structure da página (headlines, CTAs, forms)
- ✅ Copywriting patterns
- ✅ Form flow e steps
- ✅ Framework usado (Next.js, React, etc)
- ✅ UX patterns (progress indicators, validation)

**Como rodar**:
```bash
npm run test -- tests/research/analyze-tutoria-ia.spec.ts
```

**Output**:
- `tests/reports/tutoria-ia-analysis-[timestamp].json`
- `tests/reports/tutoria-ia-copy-analysis-[timestamp].json`
- `tests/reports/culturabuilder-recommendations-[timestamp].json`
- Screenshots em `tests/reports/research-screenshots/`

**Exemplo de Output (recommendations)**:
```json
{
  "crossIndustryInsights": [
    {
      "category": "Diagnostic Flow",
      "observation": "Healthcare uses triaging to classify urgency",
      "application": "Implement AI Readiness Triage Score (0-100)",
      "priority": "high",
      "effort": "medium"
    }
  ],
  "technicalImplementations": [
    {
      "feature": "Triage Score Engine",
      "description": "Calculate 0-100 urgency score",
      "files": ["lib/triage-engine.ts"],
      "estimatedTime": "2 days"
    }
  ]
}
```

### 2. `competitive-analysis.spec.ts`

**Propósito**: Benchmark contra múltiplos assessment/diagnostic tools

**O que analisa**:
- ✅ Feature comparison matrix
- ✅ Market gaps identification
- ✅ Strengths e weaknesses de cada competitor
- ✅ Priority recommendations para CulturaBuilder

**Como rodar**:
```bash
npm run test -- tests/research/competitive-analysis.spec.ts
```

**Output**:
- `tests/reports/competitive-analysis-[timestamp].json`
- Screenshots de cada competitor
- Feature priority matrix
- Actionable next steps

**Exemplo de Output (feature matrix)**:
```
                                   CulturaBuilder    Competitors
================================================================
Multi-step Assessment              ✅                ✅
AI-powered Consultation            ✅                ⚠️ Rare
Persona-based Experience           ✅                ❌
Triage/Urgency Scoring            🔜 Planned        ❌
Confidence Indicators             🔜 Planned        ❌
Express Mode (< 3 min)            🔜 Planned        ❌
```

## 🚀 Como Usar

### Setup Inicial

1. **Certifique-se que Playwright está instalado**:
```bash
npm install
npx playwright install chromium
```

2. **Estrutura de pastas**:
```
tests/
├── research/
│   ├── analyze-tutoria-ia.spec.ts
│   ├── competitive-analysis.spec.ts
│   └── README.md (este arquivo)
├── reports/
│   ├── research-screenshots/
│   ├── competitive-screenshots/
│   └── *.json (findings)
```

### Rodar Todos os Research Tests

```bash
npm run test -- tests/research/
```

### Rodar Test Específico

```bash
npm run test -- tests/research/analyze-tutoria-ia.spec.ts
```

### Rodar em UI Mode (Debug)

```bash
npx playwright test tests/research/analyze-tutoria-ia.spec.ts --ui
```

### Rodar em Headed Mode (ver browser)

```bash
npx playwright test tests/research/analyze-tutoria-ia.spec.ts --headed
```

## 📊 Estrutura dos Reports

### JSON Structure (analyze-tutoria-ia)

```typescript
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
```

### JSON Structure (competitive-analysis)

```typescript
interface BenchmarkingReport {
  generatedAt: string;
  competitors: CompetitorAnalysis[];
  marketGaps: string[];
  opportunityAreas: string[];
  featurePriorities: {
    feature: string;
    reason: string;
    competitorCount: number;
    ourStatus: 'have' | 'planned' | 'missing';
  }[];
  recommendations: string[];
}
```

## 🎯 Use Cases

### 1. Product Research
**Cenário**: Queremos entender como healthcare tech comunica "confiança" em diagnósticos

**Ação**:
```bash
npm run test -- tests/research/analyze-tutoria-ia.spec.ts
```

**Result**: Insights sobre "confidence levels" aplicados ao nosso ROI calculator

### 2. Competitive Benchmarking
**Cenário**: Precisamos saber quais features nossos competitors têm

**Ação**:
```bash
npm run test -- tests/research/competitive-analysis.spec.ts
```

**Result**: Feature matrix e market gaps identificados

### 3. Continuous Monitoring
**Cenário**: Rodar mensalmente para detectar mudanças em competitors

**Ação**: Agendar via CI/CD:
```yaml
# .github/workflows/competitive-research.yml
on:
  schedule:
    - cron: '0 0 1 * *' # Monthly
  workflow_dispatch: # Manual trigger

jobs:
  research:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npx playwright install --with-deps
      - run: npm run test -- tests/research/
      - uses: actions/upload-artifact@v3
        with:
          name: research-reports
          path: tests/reports/
```

## 🔧 Customizar para Novos Sites

### Adicionar Novo Competitor

1. **Edite `competitive-analysis.spec.ts`**:
```typescript
const competitors = [
  {
    name: 'Tutoria IA',
    url: 'https://tutoria-ia.vercel.app',
    category: 'Healthcare Diagnostic'
  },
  {
    name: 'Novo Competitor',
    url: 'https://novo-competitor.com',
    category: 'AI Assessment'
  }
];
```

2. **Rode o test**:
```bash
npm run test -- tests/research/competitive-analysis.spec.ts
```

3. **Veja resultados em**:
```
tests/reports/competitive-analysis-[timestamp].json
tests/reports/competitive-screenshots/novo-competitor.png
```

### Criar Novo Research Script

1. **Copie template**:
```typescript
// tests/research/analyze-[site-name].spec.ts
import { test, expect } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

test.describe('Research: [Site Name]', () => {
  test('Extract insights', async ({ page }) => {
    await page.goto('https://site.com');

    // Your analysis logic here
    const findings = {
      // ... data extraction
    };

    // Save results
    const resultsDir = join(__dirname, '../reports');
    mkdirSync(resultsDir, { recursive: true });
    const resultsFile = join(resultsDir, `[site-name]-${Date.now()}.json`);
    writeFileSync(resultsFile, JSON.stringify(findings, null, 2));

    console.log(`Results saved to: ${resultsFile}`);
  });
});
```

2. **Customize extraction logic** baseado no site

3. **Documente em README.md** (este arquivo)

## 📈 Best Practices

### 1. Always Save JSON + Screenshots
```typescript
// Screenshot first
await page.screenshot({
  path: join(screenshotsDir, 'site-name.png'),
  fullPage: true
});

// Then extract data
const findings = await analyzePage(page);

// Save JSON
writeFileSync(resultsFile, JSON.stringify(findings, null, 2));
```

### 2. Handle Errors Gracefully
```typescript
try {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
} catch (error) {
  console.log(`⚠️ Failed to load: ${error.message}`);
  return { error: error.message };
}
```

### 3. Use Meaningful Timestamps
```typescript
const timestamp = new Date().toISOString();
const filename = `findings-${Date.now()}.json`; // For uniqueness
```

### 4. Log Progress
```typescript
console.log('\n🔬 Starting research...');
console.log(`📊 Analyzing: ${siteName}`);
console.log('✅ Analysis complete');
```

## 🐛 Troubleshooting

### Test Timeout
```bash
# Increase timeout
npx playwright test --timeout 60000
```

### Site Blocks Automation
```typescript
// Use stealth mode
await page.setExtraHTTPHeaders({
  'User-Agent': 'Mozilla/5.0 ...'
});
```

### SSL Errors
```typescript
await page.goto(url, {
  waitUntil: 'networkidle',
  ignoreHTTPSErrors: true // Use with caution
});
```

## 📚 Recursos Adicionais

- [Playwright Docs](https://playwright.dev)
- [Web Scraping Best Practices](https://playwright.dev/docs/best-practices)
- [Selector Strategies](https://playwright.dev/docs/selectors)
- [Test Retry Strategies](https://playwright.dev/docs/test-retries)

## 🎯 Próximos Passos

- [ ] Adicionar mais competitors ao competitive-analysis
- [ ] Criar script para análise de pricing pages
- [ ] Automatizar extração de case studies
- [ ] Integrar com Notion/Airtable para knowledge base
- [ ] Schedule monthly runs via GitHub Actions

---

**Mantido por**: CulturaBuilder Research Team
**Última atualização**: Janeiro 2025
**Contato**: research@culturabuilder.com

