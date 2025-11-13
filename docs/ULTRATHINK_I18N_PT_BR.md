# ULTRATHINK: Tradução Completa para PT-BR

**Objetivo**: Identificar TODAS as strings em inglês no sistema e traduzi-las para português brasileiro.

**Problema**: Sistema está misturado - algumas partes em PT-BR, outras em inglês.

---

## 🔍 MAPEAMENTO DE ÁREAS COM INGLÊS

### 1. **UI Components - Assessment Flow**

#### StepAIRouter.tsx
- ❌ "Starting AI Router conversation - extracting urgency and specific problem"
- ❌ "AI Router conversation"
- ❌ Button texts podem estar em inglês

#### StepAIExpress.tsx
- ❌ "Express Mode assessment, question X of ~7"
- ❌ Error messages
- ❌ Loading states

#### Step5AIConsultMulti.tsx
- ❌ "Multi-specialist consultation, current question X"
- ❌ Specialist names e descriptions

#### AssessmentProgress.tsx
- ❌ Step labels: "Basic Info", "AI Router", "Express Mode", "Deep Dive", "Report"
- ❌ Tooltips e helper texts

### 2. **AI/LLM Prompts e Contexts**

#### lib/ai/router.ts
- ❌ System prompts para Claude
- ❌ Context strings
- ❌ Error messages

#### lib/ai/express-contextual-questions.ts
- ✅ Perguntas já em PT-BR
- ❌ Mas alguns contexts podem estar em inglês

#### lib/ai/suggestions.ts
- ❌ Context strings passados para AI
- ❌ "Generate response suggestions..."

#### lib/ai/multi-specialist-chat.ts
- ❌ Specialist prompts
- ❌ System messages

### 3. **Report Components**

#### ReportSummaryCard.tsx
- ❌ "Report Summary"
- ❌ Labels: "Company", "Persona", "Pain Points", etc.

#### EnterpriseROISection.tsx
- ✅ Department names já traduzidos
- ✅ Key metrics já com exemplos em PT-BR
- ❌ Mas labels de seção podem estar em inglês

#### RecommendationCard.tsx
- ❌ "Recommended", "Priority", "Quick Win"
- ❌ Action buttons

#### ImplementationRoadmap.tsx
- ❌ "Phase 1", "Phase 2", "Phase 3"
- ❌ Timeline labels

### 4. **Form Fields e Validation**

#### components/assessment/Step1BasicInfo.tsx
- ❌ Form labels
- ❌ Placeholder texts
- ❌ Validation messages

#### components/assessment/StepConfirmation.tsx
- ❌ Confirmation messages
- ❌ Button texts

### 5. **Data Types e Enums**

#### types/assessment.ts
- ❌ Enum values: "ceo", "cto", "product_manager", etc.
- ❌ Esses são usados internamente mas podem aparecer na UI

#### types/report.ts
- ❌ Type names e labels

### 6. **Error Handling**

#### Todos os try/catch blocks
- ❌ Console.error messages
- ❌ User-facing error messages
- ❌ Fallback texts

### 7. **Navigation e Buttons**

#### Todos os componentes
- ❌ "Next", "Previous", "Submit", "Go back", "Continue"
- ❌ "Loading...", "Processing...", "Please wait..."

### 8. **Toast Messages e Notifications**

- ❌ Success messages
- ❌ Error notifications
- ❌ Warning alerts

---

## 📋 ESTRATÉGIA DE TRADUÇÃO

### Fase 1: Core UI (Assessment Flow)
1. ✅ AssessmentProgress.tsx - Step labels
2. ✅ StepAIRouter.tsx - Mensagens e contexts
3. ✅ StepAIExpress.tsx - Mensagens e contexts
4. ✅ Step5AIConsultMulti.tsx - Specialist info
5. ✅ Step1BasicInfo.tsx - Form labels
6. ✅ StepConfirmation.tsx - Confirmation texts

### Fase 2: Report Components
7. ✅ ReportSummaryCard.tsx - Labels
8. ✅ EnterpriseROISection.tsx - Section titles
9. ✅ RecommendationCard.tsx - Badges e buttons
10. ✅ ImplementationRoadmap.tsx - Phase labels

### Fase 3: AI Context Strings
11. ✅ lib/ai/router.ts - System prompts
12. ✅ lib/ai/suggestions.ts - Context strings
13. ✅ lib/ai/multi-specialist-chat.ts - Specialist prompts

### Fase 4: Error Handling & Feedback
14. ✅ Error messages user-facing
15. ✅ Toast notifications
16. ✅ Loading states

---

## 🎯 PRINCÍPIOS DE TRADUÇÃO

1. **Consistência de Termos**
   - "Assessment" → "Avaliação"
   - "Report" → "Relatório"
   - "Pain Point" → "Ponto de Dor" ou "Desafio"
   - "Quick Win" → "Ganho Rápido"
   - "Roadmap" → "Roadmap" (termo já adotado no BR)

2. **Tom e Voz**
   - Manter profissionalismo
   - Evitar traduções muito literais
   - Usar termos de negócio reconhecidos no mercado BR

3. **Contextos para IA**
   - Manter em inglês se for passar para Claude API
   - Traduzir se for mostrar ao usuário

4. **Nomes de Ferramentas**
   - NUNCA traduzir nomes próprios de ferramentas
   - Ex: "GitHub Copilot", "Gong AI", etc.

5. **Emojis**
   - Manter para visual appeal
   - Garantir que façam sentido no contexto PT-BR

---

## 🔍 CHECKLIST DE VALIDAÇÃO

Após tradução, verificar:

- [ ] Toda interface visível está em PT-BR
- [ ] Botões e CTAs estão traduzidos
- [ ] Mensagens de erro fazem sentido em português
- [ ] Form labels e placeholders estão em PT-BR
- [ ] Loading states estão traduzidos
- [ ] Report labels estão em PT-BR
- [ ] Tooltips e helper texts estão em PT-BR
- [ ] Console.logs podem ficar em inglês (dev-only)
- [ ] API contexts mantidos em inglês se necessário para Claude

---

## 🚨 PRIORIDADE ALTA

Focar primeiro em:
1. **Assessment Flow** - É o que o usuário vê primeiro
2. **Report** - É o deliverable final
3. **Error Messages** - Crítico para UX

---

## 📝 NOTAS

- Alguns console.log() podem ficar em inglês (são apenas para debug)
- API contexts para Claude podem ficar em inglês se melhorar a qualidade das respostas
- Enums internos podem ficar em inglês se não aparecem na UI
