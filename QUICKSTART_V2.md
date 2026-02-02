# 🚀 Quick Start - V2 Transparency Features

**TL;DR**: Reports agora têm source attribution completa, confidence scores, e ranges de incerteza. Tudo backward compatible.

---

## 🎯 What Changed?

### Before (V1)
```
"Developer Productivity Increase: 30-50%"
[No source, no confidence, no context]
```

### After (V2)
```
"Developer Productivity Increase: 26% (p75)"
🟢 82% confiança
Range: 21% - 31% (conservador → otimista)

Sources:
📚 McKinsey GenAI Report 2024 (N=300)
📚 GitHub Copilot RCT (N=95, peer-reviewed)
[Ver metodologia completa]
```

---

## 📍 Quick Navigation

| What | Where | URL |
|------|-------|-----|
| **Metodologia Completa** | New page | http://localhost:3001/methodology |
| **Glossário de Métricas** | New page | http://localhost:3001/glossary |
| **Reports (mesma URL)** | Updated UI | http://localhost:3001/report/[id] |
| **Docs Técnicos** | Local file | `docs/V2_TRANSPARENCY_REFACTOR.md` |
| **Changelog** | Local file | `CHANGELOG_V2.md` |
| **Tests** | Local files | `tests/v2-*.spec.ts` |

---

## 🎨 UI Changes You'll See

### 1. Confidence Badges
Every metric now has a color-coded confidence badge:

```
🟢 85% confiança  → Alta (use for investment decisions)
🟡 70% confiança  → Média (request company-specific data)
🟠 45% confiança  → Baixa (directional only, not for decisions)
```

### 2. Range Visualization
Every number shows three scenarios:

```
Conservative: R$ 850K  ────────────┐
Realistic:    R$ 1.0M              │ Visual bar
Optimistic:   R$ 1.15M ────────────┘
```

### 3. Source Attribution
Click "Ver fontes (3 benchmarks)" to see:
- McKinsey GenAI Report 2024 [link]
- DORA State of DevOps 2024 [link]
- Forrester TEI Study [link]

### 4. Dynamic Language
Title changes based on confidence:
- High (≥80%): "Impacto Financeiro **Real**"
- Medium (60-79%): "Impacto Financeiro **Estimado**"
- Low (<60%): "Impacto Financeiro **Projetado**"

---

## 🧪 Test It Yourself

### 1. Check Methodology Page
```bash
# Open in browser
open http://localhost:3001/methodology
```

Should see:
- ✅ Princípios fundamentais
- ✅ Fontes tier-1 vs blacklist
- ✅ Níveis de confiança (0-100)
- ✅ Sistema de percentis
- ✅ Links para McKinsey, DORA, Forrester

### 2. Check Glossary Page
```bash
open http://localhost:3001/glossary
```

Should see definitions for:
- ✅ ROI, NPV, IRR, Payback
- ✅ MTTR, Deployment Frequency, Lead Time
- ✅ LTV, CAC, Churn
- ✅ Percentis, Confidence, Ranges

### 3. Check Report with Transparency
```bash
# Create a new assessment or use existing report ID
open http://localhost:3001/report/[your-id]
```

Should see:
- ✅ Confidence badges (green/yellow/orange)
- ✅ Range displays (conservador/realista/otimista)
- ✅ "Ver fontes" expandable sections
- ✅ Links to methodology and glossary
- ✅ Dynamic titles based on confidence

### 4. Run Tests
```bash
npm test
```

Should see:
- ✅ 40+ data integrity tests passing
- ✅ 35+ UI transparency tests passing
- ✅ No hardcoded values (451%, 34%) present
- ✅ All sources are tier-1

---

## 📊 Key Values Changed

### Marketing Department
```diff
- 451% leads increase (WinSavvy - blacklisted)
+ 40% leads increase (p75, McKinsey GenAI 2024)
```

### Sales Department
```diff
- 34% productivity (no source)
+ 14.5% productivity (p75, Forrester TEI)
```

### Engineering Department
```diff
- 30-50% productivity (generic range)
+ 26% productivity (p75, McKinsey + GitHub)
```

---

## 🔑 Key Concepts (30-second version)

### Confidence Score (0-100)
How reliable is this number?
- **Input factors**: Source quality, sample size, recency, geography match, company data availability
- **Output**: Single score 0-100
- **Use**: Higher = more trustworthy for decisions

### Percentiles (p25, p50, p75, p90)
Where does this company fall in the distribution?
- **p25**: 75% of companies did better (conservative)
- **p50**: Median/typical result (realistic)
- **p75**: 25% of companies did better (optimistic but defensible) ← **Our default**
- **p90**: Only 10% did better (very optimistic)

### Ranges
What's the uncertainty?
- **Calculation**: Based on confidence score (lower confidence = wider range)
- **Display**: Conservative ← Realistic → Optimistic
- **Use**: Show C-level the upside AND downside

### Source Attribution
Where does this number come from?
- **Tier-1 sources**: McKinsey, DORA, Forrester, GitHub (peer-reviewed or major consulting)
- **Blacklisted**: WinSavvy, CRM.org, Jeff Bullas (marketing materials)
- **Display**: Expandable sections with links to original studies

---

## 🚨 Common Questions

### Q: Do I need to migrate existing reports?
**A**: No! V1 reports continue working. Type guards auto-detect version and show appropriate UI.

### Q: How do I create a V2 report?
**A**: Just create a normal assessment. If you use V2 calculators (`*-v2.ts`), you get V2 features automatically.

### Q: What if confidence is low?
**A**: UI shows orange/red badges, tones down language, adds disclaimers. Still shows the data but with appropriate warnings.

### Q: Can I trust the confidence scores?
**A**: They're heuristic (not statistical), but based on objective factors: source quality, sample size, recency, geography. Use as directional indicator.

### Q: Why p75 (optimistic) as default?
**A**: AI investments are strategic/transformational. Conservative p25 can lead to under-investment. p75 is optimistic but 1-in-4 companies achieve it, so defensible with good execution.

### Q: What if client challenges the numbers?
**A**: Click "Ver fontes" → Show McKinsey/DORA links → They can audit original studies themselves. That's the whole point of V2.

---

## 🛠️ For Developers

### Quick code examples

#### Use V2 calculator
```typescript
import { calculateROI_V2 } from '@/lib/calculators/roi-calculator-v2';

const result = calculateROI_V2(userContext);
// Returns: { roi, sources[], confidence, range }
```

#### Display with transparency
```tsx
import TransparentMetric from '@/components/report/shared/TransparentMetric';

<TransparentMetric
  label="ROI"
  value={250}
  unit="percentage"
  confidence={82}
  range={result.range}
  sources={result.sources}
  size="large"
/>
```

#### Check if V2 data available
```typescript
const isV2 = 'confidence' in data && 'sources' in data;
```

---

## 📈 Success Metrics to Track

After deploying to production, track:

1. **Conversion Rate**: Demo → POC (target: +20%)
2. **Due Diligence Time**: Days to close (target: <3 days)
3. **C-level Trust**: Survey score (target: 4.5+/5)
4. **Objections**: "Where's the data?" (target: <10%)
5. **Engagement**: Methodology page views (target: 40%+ of report viewers)

---

## 🎯 One-Liner Summary

**V2 = Every number is now traceable to McKinsey/DORA/Forrester, with confidence score, uncertainty range, and links to original studies. No more "trust me bro" data.**

---

## 📚 Learn More

- **5 min read**: [CHANGELOG_V2.md](./CHANGELOG_V2.md) - What changed
- **15 min read**: [V2_TRANSPARENCY_REFACTOR.md](./docs/V2_TRANSPARENCY_REFACTOR.md) - Full documentation
- **Interactive**: http://localhost:3001/methodology - C-level explanation
- **Reference**: http://localhost:3001/glossary - All metric definitions

---

**Version**: 2.0.0
**Status**: ✅ Production Ready
**Server**: http://localhost:3001
