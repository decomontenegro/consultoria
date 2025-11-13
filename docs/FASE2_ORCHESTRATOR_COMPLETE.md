# FASE 2 - LLM Orchestrator Completo ✅

**Data:** 13 Nov 2025
**Milestone:** Sistema de follow-ups dinâmicos via Claude API

---

## 🎯 Objetivo Alcançado

Criar um **PhD Virtual Consultant** que:
- ✅ Analisa respostas profundamente (detecta sinais fracos)
- ✅ Gera follow-ups contextuais via LLM
- ✅ Usa técnicas de consultoria (SPIN, 5 Whys, Socratic)
- ✅ Budget-aware (max 3 follow-ups, R$0.30 cada)

---

## 📦 Arquivos Criados

### 1. `lib/ai/consultant-orchestrator.ts` (Core Engine)

**Responsabilidades:**
1. **Response Analysis** - Detectar sinais fracos via Claude
2. **Follow-up Generation** - Criar perguntas contextuais via Claude
3. **Orchestration Logic** - Decidir quando/como perguntar

**Componentes:**

#### 1.1 Response Analyzer

```typescript
export async function analyzeResponse(
  question: string,
  answer: string,
  context: OrchestratorContext
): Promise<ResponseAnalysis>
```

**O que analisa:**

| Weak Signal | Descrição | Exemplo |
|-------------|-----------|---------|
| `isVague` | Falta especificidade | "mais ou menos", "não sei bem" |
| `hasContradiction` | Diz X e depois não-X | "somos ágeis... mas leva 3 meses" |
| `hasHesitation` | Incerteza | "talvez", "acho que", "provavelmente" |
| `lacksMetrics` | Sem números concretos | "perdemos clientes" (quantos?) |
| `hasEmotionalLanguage` | Frustração/urgência | "desesperado", "crítico", "preocupado" |

**Insights extraídos:**

| Insight | Valores | Uso |
|---------|---------|-----|
| `urgencyLevel` | low/medium/high/critical | Priorizar follow-ups |
| `hasQuantifiableImpact` | boolean | Se mencionou métricas |
| `mentionedCompetitors` | boolean | Pressão competitiva |
| `mentionedDeadline` | boolean | Timeline específico |
| `hasDecisionAuthority` | boolean | Pode aprovar vs precisa de CEO |

**Follow-up Directions:**

```typescript
type FollowUpDirection =
  | 'quantify-impact'         // Pedir números
  | 'dig-deeper-root-cause'   // 5 Whys
  | 'challenge-assumption'    // Socratic method
  | 'explore-constraint'      // O que te impede?
  | 'validate-commitment'     // Vai investir se mostrar ROI?
  | 'skip-to-next';           // Resposta completa
```

#### 1.2 Follow-up Generator

```typescript
export async function generateFollowUp(
  analysis: ResponseAnalysis,
  context: OrchestratorContext
): Promise<DynamicFollowUp | null>
```

**Usa Claude API com prompt consultivo:**

```
You are a PhD business consultant conducting discovery with a potential client.

**Analysis of last answer:**
- Weak signals: {vague, lacks metrics}
- Insights: {urgency: high, no quantifiable impact}
- Follow-up direction: quantify-impact

**Your Task:**
Generate ONE powerful follow-up question that asks for specific numbers
(R$ lost, customers churned, hours wasted)...
```

**Retorna:**

```typescript
{
  question: "Você mencionou perder clientes. Consegue estimar quantos
             churned nos últimos 6 meses? E qual o ticket médio deles?",
  reasoning: "Client mentioned loss but didn't quantify. Need ARR impact.",
  expectedExtraction: ["customers_churned", "average_arr", "churn_reason"],
  type: "quantify"
}
```

#### 1.3 Main Orchestrator

```typescript
export async function orchestrateFollowUp(
  questionId: string,
  question: string,
  answer: string,
  context: OrchestratorContext
): Promise<{
  shouldAskFollowUp: boolean;
  followUp: DynamicFollowUp | null;
  analysis: ResponseAnalysis;
  cost: number; // R$ 0.15-0.30
}>
```

**Fluxo:**
1. Analisa resposta via Claude (R$ 0.15)
2. Se completa → return `skip-to-next`
3. Se incompleta → gera follow-up via Claude (+R$ 0.15)
4. Budget check: max 3 follow-ups atingido?

### 2. `app/api/consultant-followup/route.ts` (API Endpoint)

**Endpoint:** `POST /api/consultant-followup`

**Request:**
```typescript
{
  questionId: "operational-baseline",
  question: "Desde uma ideia até produção, quantos dias?",
  answer: "Ah, demora bastante, é lento",
  persona: "engineering-tech",
  conversationHistory: [
    { questionId: "...", question: "...", answer: "..." }
  ],
  maxFollowUps: 3
}
```

**Response:**
```typescript
{
  shouldAskFollowUp: true,
  followUp: {
    question: "Quando você diz 'bastante', estamos falando de quantos
               dias ou semanas especificamente? 10 dias? 30 dias?",
    reasoning: "Answer is vague, lacks concrete cycle time metric",
    expectedExtraction: ["cycle_time_days"],
    type: "quantify"
  },
  analysis: {
    weakSignals: {
      isVague: true,
      lacksMetrics: true,
      // ...
    },
    insights: {
      urgencyLevel: "medium",
      hasQuantifiableImpact: false,
      // ...
    },
    followUpDirection: "quantify-impact"
  },
  cost: 0.30
}
```

---

## 🎨 Exemplos de Follow-ups Gerados

### Exemplo 1: Quantify Impact

**Pergunta:** "Qual o maior problema no fluxo atual?"
**Resposta:** "Perdemos clientes por causa da lentidão"

**Análise:**
- ✅ Weak signal: `lacksMetrics=true` (não disse quantos clientes)
- ✅ Insight: `hasQuantifiableImpact=false`
- ✅ Direction: `quantify-impact`

**Follow-up gerado:**
```
"Você mencionou que perdem clientes por lentidão.

Consegue estimar:
- Quantos clientes churned nos últimos 6 meses por esse motivo?
- Qual o ticket médio (ARR) desses clientes?

Isso vai nos ajudar a calcular o ROI de resolver esse problema."
```

### Exemplo 2: Dig Deeper (5 Whys)

**Pergunta:** "Qual o principal gargalo?"
**Resposta:** "Aprovações demoram muito"

**Análise:**
- ✅ Weak signal: surface-level answer
- ✅ Direction: `dig-deeper-root-cause`

**Follow-up gerado:**
```
"Entendi que aprovações são o gargalo.

Mas por que as aprovações demoram tanto?
- É falta de pessoas para aprovar?
- Processo burocrático?
- Falta de clareza do que precisa ser aprovado?

Quero entender a raiz do problema."
```

### Exemplo 3: Challenge Assumption

**Pergunta Q1:** "Vocês são ágeis?"
**Resposta Q1:** "Sim, muito ágeis"

**Pergunta Q2:** "Quanto tempo do conceito ao lançamento?"
**Resposta Q2:** "3-4 meses"

**Análise:**
- ✅ Weak signal: `hasContradiction=true` (ágil mas 3 meses?)
- ✅ Direction: `challenge-assumption`

**Follow-up gerado:**
```
"Notei que vocês se consideram 'muito ágeis', mas o cycle time
é de 3-4 meses.

No mercado, empresas ágeis normalmente lançam em semanas, não meses.

O que vocês consideram 'ágil' nesse contexto? Ágil comparado a antes,
ou ágil comparado aos competidores?"
```

### Exemplo 4: Explore Constraint

**Pergunta:** "Por que não automatizaram isso ainda?"
**Resposta:** "Queremos, mas nunca conseguimos"

**Análise:**
- ✅ Insight: wants to solve but hasn't
- ✅ Direction: `explore-constraint`

**Follow-up gerado:**
```
"Vocês claramente querem automatizar, mas não conseguiram.

O que especificamente tem impedido?
- Falta de orçamento?
- Time não tem skillset?
- Outras prioridades sempre aparecem?
- Liderança não aprova?

Entender o bloqueio real é crítico."
```

### Exemplo 5: Validate Commitment

**Pergunta:** "Tem orçamento para investir nisso?"
**Resposta:** "Talvez, depende do ROI"

**Análise:**
- ✅ Weak signal: `hasHesitation=true`
- ✅ Direction: `validate-commitment`

**Follow-up gerado:**
```
"Você mencionou 'talvez, depende do ROI'.

Vamos ser diretos: se eu te mostrar que investir R$200k vai
economizar R$600k/ano (ROI de 3x em 1 ano), você aprova?

Ou existe outro critério além de ROI?"
```

---

## 📊 Budget Model (Híbrido)

| Componente | Custo | Tokens | Quando |
|------------|-------|--------|--------|
| 6 perguntas essenciais | R$ 0 | 0 | Sempre |
| Response analysis | R$ 0.15 | ~500 | Por pergunta respondida |
| Follow-up generation | R$ 0.15 | ~500 | Se análise detectar gap |
| Total por follow-up | R$ 0.30 | ~1000 | Máx 3 follow-ups |

**Cenários:**

| Cenário | Follow-ups | Custo Total |
|---------|------------|-------------|
| Respostas completas | 0 | R$ 0.90 (6 × R$0.15 analysis) |
| 1 follow-up | 1 | R$ 1.20 |
| 2 follow-ups | 2 | R$ 1.50 |
| 3 follow-ups (max) | 3 | R$ 1.80 |

**Economia vs Full LLM:**
- Full LLM: R$ 3-5 por assessment
- Híbrido: R$ 0.90-1.80 (save 60-70%)

---

## 🔧 Como Usar

### 1. Basic Usage

```typescript
import {
  orchestrateFollowUp,
  buildOrchestratorContext
} from '@/lib/ai/consultant-orchestrator';

// Build context
const context = buildOrchestratorContext(
  'engineering-tech',
  conversationHistory,
  'operational-baseline',
  3 // max follow-ups
);

// Orchestrate
const result = await orchestrateFollowUp(
  'operational-baseline',
  'Desde uma ideia até produção, quantos dias?',
  'Demora bastante, é lento',
  context
);

if (result.shouldAskFollowUp) {
  console.log('Follow-up:', result.followUp.question);
  console.log('Cost:', result.cost);
}
```

### 2. Via API

```typescript
const response = await fetch('/api/consultant-followup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    questionId: 'operational-baseline',
    question: 'Desde uma ideia até produção, quantos dias?',
    answer: 'Demora bastante',
    persona: 'engineering-tech',
    conversationHistory: [],
    maxFollowUps: 3
  })
});

const data = await response.json();

if (data.shouldAskFollowUp) {
  // Show follow-up to user
  showQuestion(data.followUp.question);
}
```

---

## ✅ Checklist FASE 2

- [x] Criar `consultant-orchestrator.ts` core engine
- [x] Implementar `analyzeResponse()` com weak signal detection
- [x] Implementar `generateFollowUp()` com Claude API
- [x] Implementar `orchestrateFollowUp()` main function
- [x] Criar `buildOrchestratorContext()` helper
- [x] Criar API endpoint `/api/consultant-followup`
- [x] Budget check (max 3 follow-ups)
- [x] Error handling e logging
- [x] Documentação completa
- [ ] Integrar com StepAIExpress UI (PRÓXIMO)
- [ ] Testar fluxo end-to-end

---

## 🔜 Próximo Passo: Integração UI

**Objetivo:** Integrar orchestrator no fluxo do StepAIExpress

**Tasks:**
1. Modificar `StepAIExpress.tsx` para chamar `/api/consultant-followup`
2. Mostrar follow-up como sub-pergunta
3. Armazenar resposta do follow-up no contexto
4. Continuar para próxima pergunta essencial

**Estimativa:** 1-2 horas

---

## 🎯 Impacto Esperado

### Antes (Perguntas Fixas):
```
Q: "Qual o maior problema?"
R: "Perdemos clientes"
→ [Próxima pergunta, sem aprofundar]
```
❌ Perde contexto crítico

### Depois (Com Orchestrator):
```
Q: "Qual o maior problema?"
R: "Perdemos clientes"

[Orchestrator detecta: lacksMetrics=true]

Follow-up: "Quantos clientes churned nos últimos 6 meses?
            Qual o ticket médio deles?"
R: "5 clientes, R$80k ARR cada"

→ [Extrai: customers_lost=5, arr_loss=400k]
```
✅ Contexto rico para ROI calculation

---

**Status:** ✅ FASE 2 COMPLETA (Core)
**Ready for:** UI Integration
**Cost:** R$ 0.30 por follow-up, max R$ 1.80 por assessment
