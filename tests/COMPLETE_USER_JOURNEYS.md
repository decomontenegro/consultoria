# Complete User Journeys - CulturaBuilder Platform

## 🎯 Overview

Este documento mapeia **todos os caminhos possíveis** que um usuário pode percorrer na plataforma CulturaBuilder, servindo como base para os testes E2E Playwright.

---

## 📊 Fluxo Principal: Assessment Modes

### Mode 1: Express Mode (AI-Driven)
**Tempo esperado**: 5-7 minutos
**Características**: AI faz perguntas adaptativas, sem steps visuais

```
Homepage
  ↓
Click "Modo Express" button
  ↓
StepAIExpress (Conversational Flow)
  ├─ AI pergunta sobre empresa/indústria
  ├─ AI pergunta sobre time/tamanho
  ├─ AI pergunta sobre pain points
  ├─ AI pergunta sobre goals
  └─ AI pede nome/email
  ↓
Report Page
  ├─ Executive Summary
  ├─ Benchmark Comparison (se >= 2 reports mesma indústria)
  ├─ ROI Analysis
  ├─ Recommendations
  └─ Roadmap
```

**Variações**:
- Com benchmark (2+ reports mesma indústria)
- Sem benchmark (1º report ou indústria única)

---

### Mode 2: Deep-dive Mode (Step-by-Step)
**Tempo esperado**: 15-20 minutos
**Características**: 5 steps com validação, dados completos

```
Homepage
  ↓
Click "Começar Agora" button
  ↓
Step 1: Persona Selection
  ├─ CEO/Founder
  ├─ CTO/VP Engineering
  ├─ Product Manager
  └─ Engineering Manager
  ↓
Step 2: Company Info
  ├─ Nome da empresa
  ├─ Indústria (dropdown)
  ├─ Tamanho (startup/scaleup/enterprise)
  ├─ Team size
  └─ Tech stack
  ↓
Step 3: Current State
  ├─ Engineers count
  ├─ Seniors count
  ├─ Use AI tools? (yes/no)
  ├─ Current tools (se yes)
  ├─ Pain points (multi-select)
  ├─ Current productivity
  ├─ Code quality
  └─ Deployment frequency
  ↓
Step 4: Goals & Investment
  ├─ Company name (auto-fill)
  ├─ Primary goals (multi-select)
  ├─ Timeline (3/6/12 months)
  ├─ Budget tier
  └─ Department selection (multi-dept)
  ↓
Step 5: AI Consultation (OPCIONAL)
  ├─ Skip → Report
  └─ Consult → Multi-Specialist AI
      ├─ Select specialists (1-3)
      ├─ AI conversation per specialist
      └─ Insights collected
  ↓
Report Page (same as Express)
```

**Variações**:
- Com Step 5 (AI Consultation) - Single specialist
- Com Step 5 (AI Consultation) - Multiple specialists
- Sem Step 5 (Skip AI)
- Com Multi-Department selection
- Sem Multi-Department (só Engineering)

---

### Mode 3: AI Router Mode (Triage)
**Tempo esperado**: 2 min triage + mode time
**Características**: AI decide qual modo é melhor

```
Homepage
  ↓
Click "AI Router" button (se disponível)
  ↓
StepAIRouter (Triage)
  ├─ AI pergunta: "Quanto tempo você tem?"
  ├─ AI pergunta: "Quanto detalhe você quer?"
  ├─ AI pergunta: "Já conhece AI tools?"
  └─ AI analisa respostas
  ↓
Triage Result
  ├─ Express Mode → StepAIExpress
  ├─ Deep-dive Mode → Step 1 (Persona)
  └─ Hybrid Mode → Express + AI Consult
  ↓
Continue no modo recomendado...
```

**Variações**:
- Triage → Express
- Triage → Deep-dive
- Triage → Hybrid

---

## 🗂️ Fluxo Secundário: Dashboard & Management

### Dashboard Operations

```
Dashboard Page
  ├─ View all reports (grid)
  ├─ Search by company name
  ├─ Filter by industry
  ├─ Filter by confidence level
  ├─ Sort (date/company/NPV/ROI/payback)
  ├─ Select multiple reports (checkboxes)
  │   ├─ Compare (>= 2 selected)
  │   └─ Delete multiple
  ├─ View individual report
  └─ Delete single report
```

**Paths from Dashboard**:
- Dashboard → Report Page
- Dashboard → Compare Page (2+ selected)
- Dashboard → Analytics Page
- Dashboard → New Assessment

---

### Analytics Page

```
Analytics Page
  ├─ Key Metrics (Avg NPV/ROI/Payback)
  ├─ Best Scenarios
  │   ├─ Best ROI → Click → Report Page
  │   └─ Fastest Payback → Click → Report Page
  ├─ Industry Breakdown
  └─ Confidence Distribution
```

**Paths**:
- Analytics → Report (best scenario)
- Analytics → Dashboard
- Analytics → New Assessment (empty state)

---

### Compare Page

```
Compare Page
  ├─ URL: /compare?reports=id1,id2,id3
  ├─ Side-by-side comparison table
  ├─ Visual diff indicators (↑↓—)
  ├─ Remove report from comparison
  ├─ Export Comparison
  └─ Share Comparison
```

**Paths**:
- Compare → Report (click company name)
- Compare → Dashboard
- Compare → Export

---

## 📤 Fluxo Terciário: Export & Share

### Export Operations

```
Report Page → Export Buttons
  ├─ Export as JSON
  │   └─ Downloads report-{id}.json
  ├─ Export as CSV
  │   └─ Downloads report-{id}.csv
  ├─ Print/PDF
  │   └─ Opens print dialog
  └─ Share
      ↓
Share Dialog
  ├─ Select expiry (24h/7d/30d/never)
  ├─ Generate share link
  ├─ Copy to clipboard
  └─ View share stats
```

**Paths**:
- Report → Export JSON
- Report → Export CSV
- Report → Print
- Report → Share → Copy Link → Access Shared Report

---

### Shared Report Access

```
Shared Link: /shared/{shareId}
  ├─ Valid link → Read-only Report View
  │   ├─ View count incremented
  │   ├─ Lock icon (read-only)
  │   └─ CTA: "Create your own assessment"
  ├─ Expired link → Error page
  └─ Invalid shareId → Error page
```

---

## 🔄 Fluxo Quaternário: Variations & Duplicates

### Create Variation (Duplicate Mode)

```
Report Page
  ↓
Click "Criar Variação deste Assessment"
  ↓
Assessment Page (mode=duplicate&from={reportId})
  ├─ Pre-filled with original data
  ├─ User modifies fields
  │   ├─ Change budget tier
  │   ├─ Change timeline
  │   ├─ Change department selection
  │   └─ Change goals
  └─ Generate new report with variation
  ↓
Compare original vs variation
```

---

## 🆕 Fluxo Quintário: Returning Users

### Returning User Banner

```
Homepage (localStorage has reports)
  ↓
ReturningUserBanner displayed
  ├─ Shows latest report preview
  ├─ Total scenarios count
  └─ Quick actions:
      ├─ Ver Todos → Dashboard
      ├─ Continuar Último → Latest Report
      └─ Novo Assessment → Assessment
```

---

## 🎨 Fluxo Sextário: Benchmarks (NEW)

### Benchmark Comparison Display

```
Report Page (>= 2 reports same industry)
  ↓
BenchmarkCard displayed
  ├─ Ranking badge (Top X% / Above Avg / Avg / Below Avg)
  ├─ NPV comparison: Your value vs Industry avg
  ├─ ROI comparison: Your value vs Industry avg
  ├─ Payback comparison: Your value vs Industry avg
  └─ Percentile bar: "Better than X% of companies"
```

**Conditions**:
- Show: >= 2 reports in same industry
- Hide: Only 1 report in industry

---

## 🧪 Edge Cases & Error Scenarios

### Error Handling Paths

1. **Express Mode Error**
   ```
   Express Mode → Report generation fails
     ↓
   Error message displayed
     ↓
   Retry button available
   ```

2. **Missing localStorage**
   ```
   Dashboard → No reports found
     ↓
   Empty state displayed
     ↓
   CTA: "Criar Primeiro Assessment"
   ```

3. **Invalid Report ID**
   ```
   /report/{invalid-id}
     ↓
   Redirect to Homepage
   ```

4. **Expired Share Link**
   ```
   /shared/{expired-shareId}
     ↓
   Error page: "Link expirado"
     ↓
   CTA: "Criar seu próprio assessment"
   ```

5. **Benchmark Not Available**
   ```
   Report Page (only 1 report in industry)
     ↓
   BenchmarkCard NOT displayed
     ↓
   Show regular benchmarks section instead
   ```

---

## 📝 Test Matrix

### Critical Paths (Must Test)
- [ ] Express Mode → Report (happy path)
- [ ] Deep-dive Mode (all 5 steps) → Report
- [ ] Deep-dive Mode (skip Step 5) → Report
- [ ] Deep-dive Mode (Step 5 single specialist) → Report
- [ ] Deep-dive Mode (Step 5 multi specialist) → Report
- [ ] AI Router → Express
- [ ] AI Router → Deep-dive
- [ ] Dashboard → View Report
- [ ] Dashboard → Compare (2+ reports)
- [ ] Dashboard → Delete
- [ ] Report → Export JSON
- [ ] Report → Export CSV
- [ ] Report → Share → Access shared link
- [ ] Analytics → View metrics
- [ ] Benchmark display (2+ same industry)
- [ ] Benchmark hidden (1 report in industry)

### Secondary Paths (Should Test)
- [ ] Dashboard Search
- [ ] Dashboard Filter (industry)
- [ ] Dashboard Filter (confidence)
- [ ] Dashboard Sort (all fields)
- [ ] Dashboard Bulk delete
- [ ] Compare → Remove report
- [ ] Analytics → Click best scenario
- [ ] Shared link expired
- [ ] Shared link invalid
- [ ] Create variation (duplicate mode)
- [ ] Returning user banner

### Edge Cases (Nice to Test)
- [ ] Express Mode retry after error
- [ ] Empty dashboard state
- [ ] Invalid report ID redirect
- [ ] Multi-department selection
- [ ] All personas tested
- [ ] All industries tested
- [ ] All company sizes tested

---

## 🎯 Test Execution Plan

### Phase 1: Core Flows (Priority 1)
1. Express Mode end-to-end
2. Deep-dive Mode end-to-end (skip AI)
3. Deep-dive Mode with AI consultation
4. Dashboard navigation

### Phase 2: Features (Priority 2)
5. Export/Share functionality
6. Compare page
7. Analytics page
8. Benchmark comparisons

### Phase 3: Edge Cases (Priority 3)
9. Error handling
10. Empty states
11. Invalid inputs
12. Variations & duplicates

---

**Total Estimated Test Cases**: ~35-40 scenarios
**Estimated Execution Time**: 15-20 minutes (full suite)
**Coverage Goal**: 95%+ of user-facing functionality
