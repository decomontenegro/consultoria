# 🧠 ULTRATHINK: Testing & FASE 3 - Análise Profunda

**Data:** 13 Nov 2025
**Objetivo:** Planejar testing robusto + FASE 3 (Insights Engine)

---

## 🎯 PARTE 1: TESTING - O que precisa ser testado?

### Contexto Atual

Temos agora um sistema **híbrido complexo** com:
- 6 perguntas enhanced adaptadas por persona
- Orchestrator que chama Claude API para follow-ups
- Budget control (max 3 follow-ups)
- Extração de métricas via regex
- Fallback graceful

**Risco:** Sistema com LLM pode falhar de formas imprevisíveis:
- Claude API pode retornar JSON inválido
- Pode não detectar weak signals corretamente
- Pode gerar follow-ups irrelevantes
- Budget pode estourar se lógica falhar

### Estratégia de Testing

#### 1. Unit Tests (Lógica Isolada)

**O que testar:**

```typescript
// lib/ai/consultant-orchestrator.ts

describe('analyzeResponse', () => {
  it('detecta resposta vaga corretamente', async () => {
    const result = await analyzeResponse(
      'Quanto demora do conceito ao lançamento?',
      'Ah, demora bastante',
      mockContext
    );
    expect(result.weakSignals.isVague).toBe(true);
    expect(result.weakSignals.lacksMetrics).toBe(true);
  });

  it('detecta contradição', async () => {
    const context = {
      conversationHistory: [
        { answer: 'Somos muito ágeis' },
        { answer: 'Cycle time de 3 meses' }
      ]
    };
    const result = await analyzeResponse(...);
    expect(result.weakSignals.hasContradiction).toBe(true);
  });
});

describe('extractMetricsFromAnswer', () => {
  it('extrai cycle time corretamente', () => {
    const metrics = extractMetricsFromAnswer(
      '3-4 semanas do PR até produção',
      ['cycle_time']
    );
    expect(metrics.cycle_time_days).toBe(21 ou 28);
  });

  it('extrai bugs/mês', () => {
    const metrics = extractMetricsFromAnswer(
      '15 bugs críticos por mês',
      ['bug_rate']
    );
    expect(metrics.bugs_per_month).toBe(15);
  });
});
```

**Problema:** Testes com Claude API custam R$ 💸

**Solução:** Mock Claude API responses

```typescript
// __tests__/mocks/claude-responses.ts
export const MOCK_RESPONSES = {
  vague_answer_analysis: {
    weakSignals: {
      isVague: true,
      lacksMetrics: true,
      hasContradiction: false,
      hasHesitation: false,
      hasEmotionalLanguage: false
    },
    insights: {
      urgencyLevel: 'medium',
      hasQuantifiableImpact: false,
      // ...
    },
    followUpDirection: 'quantify-impact'
  },

  quantify_followup: {
    question: 'Quando você diz "bastante", estamos falando de quantos dias ou semanas?',
    reasoning: 'Answer is vague, lacks concrete cycle time metric',
    expectedExtraction: ['cycle_time_days'],
    type: 'quantify'
  }
};
```

#### 2. Integration Tests (API Endpoints)

**O que testar:**

```typescript
// __tests__/api/consultant-followup.test.ts

describe('POST /api/consultant-followup', () => {
  it('retorna follow-up para resposta vaga', async () => {
    const response = await fetch('/api/consultant-followup', {
      method: 'POST',
      body: JSON.stringify({
        questionId: 'operational-baseline',
        question: 'Quantos dias demora?',
        answer: 'Demora bastante',
        persona: 'engineering-tech',
        conversationHistory: []
      })
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.shouldAskFollowUp).toBe(true);
    expect(data.followUp.type).toBe('quantify');
  });

  it('retorna skip para resposta completa', async () => {
    const response = await fetch('/api/consultant-followup', {
      method: 'POST',
      body: JSON.stringify({
        answer: '3-4 semanas, fazemos 5 deploys por mês',
        // ... complete answer with metrics
      })
    });

    const data = await response.json();
    expect(data.shouldAskFollowUp).toBe(false);
  });

  it('respeita budget limit', async () => {
    const context = {
      conversationHistory: [...], // 3 follow-ups já feitos
      maxFollowUps: 3
    };

    const data = await response.json();
    expect(data.shouldAskFollowUp).toBe(false); // Max reached
  });
});
```

#### 3. E2E Tests (User Flow Completo)

**O que testar:**

```typescript
// __tests__/e2e/express-mode-with-followups.test.ts

describe('Express Mode com Follow-ups', () => {
  it('fluxo completo: resposta vaga → follow-up → resposta completa', async () => {
    // 1. Iniciar Express Mode
    render(<StepAIExpress persona="engineering-tech" />);

    // 2. Responder primeira pergunta de forma vaga
    const input = screen.getByRole('textbox');
    userEvent.type(input, 'Demora bastante');
    userEvent.click(screen.getByText('Enviar'));

    // 3. Esperar follow-up aparecer
    await waitFor(() => {
      expect(screen.getByText(/quantos dias ou semanas/i)).toBeInTheDocument();
    });

    // 4. Responder follow-up com métrica
    userEvent.type(input, '3-4 semanas');
    userEvent.click(screen.getByText('Enviar'));

    // 5. Verificar próxima pergunta essencial (não outro follow-up)
    await waitFor(() => {
      expect(screen.getByText(/maior problema/i)).toBeInTheDocument();
    });
  });

  it('respeita max 3 follow-ups', async () => {
    // Responder vagamente 4 vezes
    // Verificar que apenas 3 follow-ups aparecem
  });
});
```

### Prioridade de Testing

| Teste | Prioridade | Custo | ROI |
|-------|-----------|-------|-----|
| Metrics extraction (unit) | 🔴 Alta | Baixo | Alto |
| Budget control (unit) | 🔴 Alta | Baixo | Alto |
| API error handling (integration) | 🟡 Média | Médio | Médio |
| Follow-up quality (manual) | 🟡 Média | Alto (Claude) | Alto |
| E2E user flow | 🟢 Baixa | Alto | Médio |

**Recomendação:** Fazer testes manuais primeiro (mais rápido), depois unit tests para lógica crítica.

---

## 🎯 PARTE 2: FASE 3 - Insights Engine

### O que é Insights Engine?

**Objetivo:** Usar Claude para analisar TODO o assessment e gerar insights profundos que humanos não veriam facilmente.

**Exemplo:**

```
Input: Assessment completo (6 perguntas + 2 follow-ups)

Q1: "Cycle time?" → "3-4 semanas, 3 deploys/mês"
Q2: "Maior problema?" → "15 bugs/mês, time gasta 25h/semana firefighting"
Q3: "Custo?" → "Perdemos 5 clientes, R$400k ARR"
Q4: "Time?" → "15 devs (3 seniors, 8 plenos, 4 juniors)"
Q5: "Urgência?" → "Board pressionando, deadline Q2"
Q6: "Budget?" → "R$500k aprovado"

---

Output (Insights Engine via Claude):

🔍 **ANÁLISE PROFUNDA:**

1. **Padrão Crítico Detectado:** Tech Debt Death Spiral
   - Cycle time lento (21 dias) + bugs altos (15/mês) = dívida técnica insustentável
   - Time gasta 67% do tempo em firefighting (25h de 37.5h/semana)
   - Apenas 33% do tempo para features novas
   - **Risco:** Velocidade vai piorar, não melhorar

2. **Root Cause Provável:** Falta de Seniority
   - Apenas 20% seniors (3 de 15)
   - Plenos (53%) carregando peso de arquitetura
   - **Risco:** Decisões técnicas ruins acumulando dívida

3. **Impacto Financeiro Real:**
   - R$400k ARR perdido (5 clientes)
   - 25h/semana × 15 devs = 375h/semana desperdiçadas
   - Custo dev: ~R$15k/mês → 375h = ~R$140k/mês desperdiçado
   - **Total:** R$400k ARR + R$1.68M/ano desperdiçado = R$2.08M/ano de impacto

4. **Urgência vs Budget:**
   - Board pressionando para Q2 (6 meses)
   - Budget aprovado: R$500k
   - **Insight:** Budget é 24% do impacto anual - ROI de 4x em 1 ano

5. **Recomendação Estratégica:**
   - Prioridade #1: Contratar 2 seniors (arquitetura + quality)
   - Prioridade #2: Upskilling plenos (AI pair programming)
   - Prioridade #3: Automatizar testes (reduzir bugs)
   - **Evitar:** Contratar juniors (vai piorar problema)

6. **Red Flags:**
   ⚠️ Cliente menciona "board pressionando" + "perdendo clientes" = risco de death spiral
   ⚠️ 67% firefighting é insustentável - burnout em 6-12 meses
   ⚠️ Budget R$500k mas impacto R$2M+ = investimento subdimensionado
```

### Como Implementar?

#### Arquitetura

```typescript
// lib/ai/insights-engine.ts

export async function generateInsights(
  assessmentData: AssessmentData,
  conversationHistory: ConversationHistory
): Promise<DeepInsights>

interface DeepInsights {
  // Padrões detectados
  patterns: {
    type: 'tech-debt-spiral' | 'velocity-crisis' | 'quality-crisis' | 'people-crisis';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    evidence: string[];
  }[];

  // Root causes
  rootCauses: {
    primary: string;
    secondary: string[];
    reasoning: string;
  };

  // Impacto financeiro calculado
  financialImpact: {
    directCost: number; // R$ por mês
    opportunityCost: number; // R$ ARR perdido
    totalAnnual: number;
    confidence: number; // 0-1
  };

  // Urgência vs budget analysis
  urgencyAnalysis: {
    timelinePressure: string;
    budgetAdequacy: 'under' | 'adequate' | 'over';
    roi: number; // múltiplo
  };

  // Recomendações estratégicas
  recommendations: {
    priority: number;
    action: string;
    reasoning: string;
    impact: 'low' | 'medium' | 'high';
    cost: string;
  }[];

  // Red flags críticos
  redFlags: {
    flag: string;
    severity: 'warning' | 'critical';
    reasoning: string;
  }[];
}
```

#### Prompt para Claude

```typescript
const insightsPrompt = `You are a PhD business consultant analyzing a completed assessment.

**Assessment Data:**
${JSON.stringify(assessmentData, null, 2)}

**Conversation History:**
${conversationHistory.map(item => `Q: ${item.question}\nA: ${item.answer}`).join('\n\n')}

**Your Task:**

Analyze this assessment DEEPLY and return a JSON object with insights that a human might miss.

1. **Patterns:** What patterns do you detect? Examples:
   - Tech Debt Death Spiral: slow cycle time + high bugs + high firefighting
   - Velocity Crisis: long cycle time + low deploy frequency + team frustrated
   - Quality Crisis: many bugs + customer churn + urgent timeline
   - People Crisis: high junior ratio + seniors leaving + burnout signals

2. **Root Causes:** What's REALLY causing these problems? Not symptoms, ROOT CAUSE.
   Examples:
   - Lack of senior leadership (too many juniors making architecture decisions)
   - Process bottlenecks (approvals taking weeks)
   - Legacy tech debt (accumulated over years, now blocking everything)

3. **Financial Impact:** Calculate the REAL cost:
   - Direct costs (wasted time × hourly rate)
   - Opportunity costs (lost revenue, delayed launches)
   - Total annual impact in R$

4. **Urgency vs Budget:** Is the budget adequate for the urgency?
   - Timeline pressure (board deadline, competitor threat)
   - Budget adequacy (enough to solve problem?)
   - ROI calculation (investment vs annual impact)

5. **Strategic Recommendations:** What should they do? Prioritize by impact.
   - Don't just say "hire more people" - be SPECIFIC
   - Example: "Hire 2 senior engineers (architecture + quality), NOT juniors"
   - Example: "Upskill 5 plenos com AI pair programming antes de contratar"

6. **Red Flags:** What critical risks do you see?
   - Death spirals (problem feeding itself)
   - Burnout risks (unsustainable workload)
   - Budget risks (too little investment for problem size)

**Return valid JSON:**
{
  "patterns": [...],
  "rootCauses": {...},
  "financialImpact": {...},
  "urgencyAnalysis": {...},
  "recommendations": [...],
  "redFlags": [...]
}`;
```

### Custo & ROI

| Componente | Tokens | Custo | Quando |
|------------|--------|-------|--------|
| Assessment completo | ~2000 | - | Input |
| Análise profunda | ~4000 | R$ 0.60 | 1x por assessment |
| **Total FASE 3** | ~6000 | **R$ 0.60** | Final do assessment |

**Custo Total (FASE 1 + 2 + 3):**
- Sem follow-ups: R$ 0.90 + R$ 0.60 = **R$ 1.50**
- Com 2 follow-ups: R$ 1.50 + R$ 0.60 = **R$ 2.10**
- Com 3 follow-ups: R$ 1.80 + R$ 0.60 = **R$ 2.40**

**vs Full LLM:** R$ 3-5
**Economia:** 20-40% ainda (menos que antes, mas análise é MUITO mais profunda)

### Quando Rodar Insights Engine?

**Opção 1: Sempre** (R$ 0.60 por assessment)
- Pro: Todos recebem insights profundos
- Con: Custo extra para todos, mesmo low-quality leads

**Opção 2: Condicional** (budget-aware)
- Rodar APENAS se:
  - Budget > R$ 200k (lead qualificado)
  - OU urgency = critical
  - OU conversationHistory.length > 8 (muito engajado)
- Pro: Economia, foca em leads quentes
- Con: Leads frios não recebem insights

**Opção 3: Opt-in** (usuário escolhe)
- Mostrar no final: "Quer análise profunda? +1 minuto"
- Pro: Usuário controla, engajamento
- Con: Maioria pode pular

**Recomendação:** Opção 2 (condicional) - economiza dinheiro, foca em qualidade

---

## 🎯 PARTE 3: Onde Mostrar Insights?

### Opção A: Enriquecer Relatório Final

Adicionar seção **"Análise do Consultor"** no relatório:

```typescript
// components/report/ConsultantInsightsSection.tsx

<section className="consultant-insights">
  <h2>🧠 Análise do Consultor Virtual</h2>

  {insights.patterns.map(pattern => (
    <div className="pattern-card">
      <Badge severity={pattern.severity}>{pattern.type}</Badge>
      <h3>{pattern.description}</h3>
      <ul>
        {pattern.evidence.map(e => <li>{e}</li>)}
      </ul>
    </div>
  ))}

  <div className="financial-impact">
    <h3>💰 Impacto Financeiro Real</h3>
    <p>Custo Anual Estimado: <strong>R$ {insights.financialImpact.totalAnnual.toLocaleString()}</strong></p>
    <p>ROI do Investimento: <strong>{insights.urgencyAnalysis.roi}x em 1 ano</strong></p>
  </div>

  <div className="recommendations">
    <h3>🎯 Recomendações Estratégicas</h3>
    <ol>
      {insights.recommendations
        .sort((a, b) => a.priority - b.priority)
        .map(rec => (
          <li>
            <strong>{rec.action}</strong>
            <p>{rec.reasoning}</p>
          </li>
        ))
      }
    </ol>
  </div>

  {insights.redFlags.length > 0 && (
    <div className="red-flags">
      <h3>⚠️ Riscos Críticos</h3>
      {insights.redFlags.map(flag => (
        <Alert severity={flag.severity}>
          {flag.flag}
        </Alert>
      ))}
    </div>
  )}
</section>
```

### Opção B: Email Follow-up

Enviar insights por email 24h depois:

```
Subject: 🧠 Análise Profunda do Seu Assessment - CulturaBuilder

Olá {nome},

Após analisar profundamente seu assessment, nosso consultor virtual
detectou alguns padrões críticos:

🔍 Padrão Detectado: Tech Debt Death Spiral (Severidade: Alta)

Seu time está em um ciclo vicioso:
- 67% do tempo em firefighting
- Apenas 33% em features novas
- Velocity vai piorar, não melhorar

💰 Impacto Financeiro Real: R$ 2.08M/ano

Isso inclui:
- R$400k ARR perdido (5 clientes)
- R$1.68M/ano desperdiçado em retrabalho

🎯 Recomendação #1 (Alta Prioridade):
Contratar 2 seniors (arquitetura + quality) ANTES de contratar juniors

Por que? Seus 8 plenos estão tomando decisões de arquitetura sem
experiência, acumulando dívida técnica.

⚠️ Red Flag Crítico:
Board pressionando + 67% firefighting = risco de burnout em 6-12 meses

---

Quer conversar sobre como resolver isso?
[Agendar Call com Consultor Real]
```

---

## 🚀 PLANO DE EXECUÇÃO

### TESTING (1-2 dias)

**Dia 1: Testes Manuais**
- [ ] Testar resposta vaga → follow-up de quantificação
- [ ] Testar resposta com contradição → follow-up de challenge
- [ ] Testar budget limit (max 3)
- [ ] Testar fallback se API falhar
- [ ] Documentar bugs encontrados

**Dia 2: Unit Tests Críticos**
- [ ] `extractMetricsFromAnswer()` tests
- [ ] Budget control logic tests
- [ ] Mock Claude responses
- [ ] API error handling tests

### FASE 3: Insights Engine (2-3 dias)

**Dia 1: Core Engine**
- [ ] Criar `lib/ai/insights-engine.ts`
- [ ] Implementar `generateInsights()`
- [ ] Criar prompt detalhado para Claude
- [ ] Testar com assessment real

**Dia 2: API + Integration**
- [ ] Criar `/api/insights/generate`
- [ ] Integrar com StepAIExpress
- [ ] Condicional: rodar apenas se budget > R$ 200k
- [ ] Error handling

**Dia 3: UI + Polish**
- [ ] Criar `ConsultantInsightsSection.tsx`
- [ ] Adicionar no relatório final
- [ ] Styling e badges
- [ ] Testing end-to-end

---

## 💡 DECISION TREE

```
Fazer FASE 3 agora? ━━━━━━┓
                         ↓
         Sim, quero insights profundos
                         ↓
         Como mostrar? ━━━━━━┓
           ↓                 ↓
    No relatório      Email follow-up
           ↓                 ↓
    Implementar      Implementar
    seção nova       email service
```

**Minha Recomendação:**
1. ✅ Fazer testing manual PRIMEIRO (1 dia)
2. ✅ Implementar FASE 3 - Insights Engine (2 dias)
3. ✅ Mostrar no relatório (opção A) - mais imediato
4. ⏳ Email follow-up depois (opção B) - FASE 4

---

**PRONTO PARA COMEÇAR?** 🚀
