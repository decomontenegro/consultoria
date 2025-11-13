# Sistema Neural de Perguntas - FASE 1 COMPLETO ✅

**Data:** 13 Nov 2025
**Objetivo:** Criar fundação do sistema neural de perguntas adaptativas focado em conversão B2B

---

## 🎯 Objetivo da FASE 1

Transformar o sistema de perguntas estáticas em um **sistema neural inteligente** que:
- Adapta perguntas por persona (CEO → business, CTO → tech)
- Seleciona perguntas dinamicamente baseado em contexto
- Infere respostas com alta confiança para skip inteligente
- Suporta fluxo condicional (resposta X → pergunta Y)

---

## 📦 Arquivos Criados

### 1. `lib/ai/neural-questions.ts` (Foundation)

**Propósito:** Tipos, interfaces e helpers para sistema neural

**Conteúdo:**
- ✅ `NeuralQuestion` interface completa
- ✅ `AssessmentContext` interface (contexto rico)
- ✅ `PersonaLanguageStyle` e `PERSONA_STYLES` mapping
- ✅ Inference helpers: `inferTeamSize()`, `inferDeployFrequency()`, `inferBudgetRange()`
- ✅ Persona adaptation: `adaptQuestionForPersona()`, `getPersonaExamples()`
- ✅ Context management: `buildAssessmentContext()`, `updateContext()`
- ✅ Pattern detection: `detectPatterns()`, `categorizePainPoints()`, `assessTechMaturity()`

**Lines of Code:** ~450 linhas

**Principais Features:**
```typescript
interface NeuralQuestion {
  id: string;
  category: 'discovery' | 'quantification' | 'qualification' | 'commitment';
  text: string | ((context: AssessmentContext) => string); // Dynamic text!
  canInfer?: (context: AssessmentContext) => InferenceResult;
  nextQuestion?: (answer: any, context: AssessmentContext) => string | null;
  relevance: (context: AssessmentContext) => number; // Scoring!
  // ... +10 more fields
}
```

### 2. `lib/ai/neural-question-library.ts` (Question Pool)

**Propósito:** 8 perguntas neurais concretas adaptadas por persona

**Perguntas Implementadas:**
1. ✅ **Q1: Main Challenge** - Adapta linguagem por persona (CEO/CTO/CFO)
2. ✅ **Q2: Company Stage** - Quick company context (startup/scaleup/enterprise)
3. ✅ **Q3: Team Size** - Só pergunta se não puder inferir de company size
4. ✅ **Q4: Measurable Impact** - Quantifica problema (revenue loss, hours, bugs)
5. ✅ **Q5: Timeline Urgency** - Prazo para resolver (3/6/12 meses)
6. ✅ **Q6: Budget Commitment** - Faixa de investimento (R$50k-1M+)
7. ✅ **Q7: AI Maturity** - Opcional, só para high-budget leads
8. ✅ **Q8: Success Metrics** - Como medir sucesso

**Lines of Code:** ~550 linhas

**Exemplo de Adaptação por Persona:**
```typescript
// CEO vê:
"Qual o principal desafio competitivo ou de negócio que sua empresa enfrenta?"

// CTO vê:
"Qual o maior gargalo técnico ou de produtividade do seu time de engenharia?"

// CFO vê:
"Qual processo ou área operacional está gerando maior custo ou ineficiência?"
```

### 3. `lib/ai/neural-question-router.ts` (Smart Router)

**Propósito:** Engine de seleção inteligente de perguntas

**Componentes:**
- ✅ `NeuralQuestionRouter` class
- ✅ `selectNext()` - Seleciona próxima pergunta por relevância
- ✅ `getNextFromAnswer()` - Segue lógica de nextQuestion()
- ✅ `filterAvailable()` - Filtra por dependências e personas
- ✅ `filterInferrable()` - Auto-fill perguntas com alta confiança
- ✅ `scoreByRelevance()` - Ordena por score de relevância
- ✅ Helper functions: `createRouter()`, `getSuggestedAnswer()`, `shouldFinishAssessment()`, `getCompletionPercentage()`

**Lines of Code:** ~400 linhas

**Algoritmo de Seleção:**
```
1. Filtrar perguntas disponíveis (não respondidas, dependências ok)
2. Tentar inferir respostas (confidence > threshold → auto-fill)
3. Calcular relevância de cada pergunta restante
4. Retornar pergunta com maior score
```

**Inference Thresholds:**
```typescript
essential: 0.90  // Quase nunca pula essential
important: 0.80  // Pode pular se muito confiante
optional: 0.65   // Pula facilmente
```

---

## 🎨 Exemplos de Fluxo Neural

### Exemplo 1: CEO de Fintech

```
Q1: "Qual o principal desafio competitivo da sua empresa?"
→ "Perdendo mercado para competidores mais ágeis"

[Sistema detecta: urgency=high, painPoint=velocity]

Q2: "Em qual estágio está sua empresa?"
→ "Scale-up (50-500 pessoas)"

[Sistema infere: teamSize=25 com confidence=0.78 → SKIP Q3]

Q4: "Quanto isso está custando em market share/revenue?"
→ "Estimamos perder R$500k em churn anual"

[Sistema detecta: measurableImpact=true, urgency=critical]

Q5: "Qual o prazo para resolver? (pressão de board, fiscal year)"
→ "6 meses"

Q6: "Há orçamento aprovado para upskilling do time em IA?"
→ "R$500k-1M"

[High budget → pergunta AI maturity]

Q7: "A empresa já usa ferramentas de IA/automação?"
→ "Sim, GitHub Copilot e ChatGPT"

Q8: "Como você vai medir sucesso desse investimento?"
→ "Reduzir churn em 50%, time-to-market 40% mais rápido"

[CONCLUÍDO: 7 perguntas (vs 10 estáticas), 1 pulada por inferência]
```

### Exemplo 2: CTO de Startup

```
Q1: "Qual o maior gargalo técnico do seu time de engenharia?"
→ "Cycle time de 3 semanas, muitos bugs"

[Sistema detecta: urgency=high, painPoints=[velocity, quality]]

Q2: "Em qual estágio está sua empresa?"
→ "Startup (até 50 pessoas)"

[Sistema infere: teamSize=8 com confidence=0.85 → SKIP Q3]
[Sistema infere: budget=R$50k-100k com confidence=0.70]

Q4: "Consegue quantificar? (bugs/semana, horas perdidas)"
→ "~15 bugs/semana, 20h de retrabalho/dev"

[measurableImpact=true]

Q5: "Em quanto tempo precisa ver resultados?"
→ "3 meses - urgente"

Q6: [PRE-FILLED com sugestão: R$50k-100k] "Correto?"
→ "Sim, R$50k-100k"

[Low budget → SKIP Q7 (AI maturity), vai direto para Q8]

Q8: "Quais métricas de engenharia quer melhorar?"
→ "Cycle time para 1 semana, reduzir bugs em 50%"

[CONCLUÍDO: 6 perguntas (vs 10 estáticas), 2 puladas, 1 pre-filled]
```

---

## 🚀 Ganhos Esperados

### Eficiência
- **40% menos perguntas** para usuários típicos (6-7 vs 10)
- **50% mais rápido** (3-4min vs 7min)
- **60% skip rate** para perguntas inferíveis (team-size, budget)

### Personalização
- **5 variantes de linguagem** por persona
- **Perguntas adaptativas** baseadas em respostas anteriores
- **Exemplos contextuais** (CEO vê ROI, CTO vê tech metrics)

### Conversão B2B
- **Lead quality score** baseado em budget + urgency
- **Qualification flow** (discovery → quantification → commitment)
- **Early exit** para low-quality leads (save time)

---

## 🔧 Configuração

### Inference Thresholds
```typescript
essential: 0.90  // Perguntas críticas - quase nunca pula
important: 0.80  // Pode pular se muito confiante
optional: 0.65   // Pula facilmente
```

### Max Questions
```typescript
MAX_QUESTIONS = 12  // Safety limit
```

### Persona Styles
```typescript
'board-executive': tone='strategic', focus='ROI'
'engineering-tech': tone='technical', focus='tech-specs'
'finance-ops': tone='business', focus='efficiency'
'product-business': tone='business', focus='market-impact'
'it-devops': tone='operational', focus='efficiency'
```

---

## 🧪 Como Testar

### 1. Criar Router
```typescript
import { createRouter } from '@/lib/ai/neural-question-router';

const router = createRouter('board-executive', 'express', {});
```

### 2. Obter Primeira Pergunta
```typescript
const firstQuestion = router.selectNext();
console.log(firstQuestion.text); // Adaptada para CEO
```

### 3. Responder e Obter Próxima
```typescript
const answer = "Perdendo mercado para competidores";
const extractedData = firstQuestion.dataExtractor(answer, router.getContext());

router.updateAfterAnswer(firstQuestion.id, answer, extractedData);

const nextQuestion = router.getNextFromAnswer(firstQuestion, answer);
```

### 4. Checar Completion
```typescript
const percentage = getCompletionPercentage(router.getContext());
const shouldFinish = shouldFinishAssessment(router.getContext());
```

---

## 📊 Métricas de Implementação

- **Total Lines of Code:** ~1400 linhas
- **Arquivos Criados:** 3
- **Perguntas Neurais:** 8
- **Personas Suportadas:** 5
- **Inference Functions:** 3
- **Tempo de Implementação:** ~4 horas

---

## ✅ Status FASE 1

- [x] NeuralQuestion interface e types
- [x] AssessmentContext com inferences e patterns
- [x] Persona language styles e adaptation
- [x] 8 perguntas neurais concretas
- [x] Adaptação por persona (CEO/CTO/CFO)
- [x] Question Router com scoring dinâmico
- [x] Inference engine (3 funções)
- [x] Skip logic (confidence-based)
- [x] Conditional flow (nextQuestion)
- [x] Pattern detection (pain points, tech maturity)
- [x] Helper functions (completion %, suggested answers)

---

## 🔜 Próximos Passos (FASE 2)

1. **Integrar com StepAIExpress.tsx** - Usar neural router ao invés de perguntas estáticas
2. **Linguagem adaptativa avançada** - Mais variações por contexto
3. **Perguntas condicionais complexas** - Flows multi-branch
4. **UI de pre-fill/suggestions** - Mostrar inferências ao usuário

---

## 🎯 Objetivo Final

**Assessment Neural que:**
- Faz 6-7 perguntas personalizadas (vs 10 estáticas)
- Completa em <5min (vs 7min)
- Converte >40% em leads qualificados
- Suporta 10000+ concurrent users (FASE 5)
- Taxa de satisfação >85%

---

**FASE 1 COMPLETA** ✅
**Ready for FASE 2:** Integração e Refinamento
