# Estudo de UX - Consulta AI Multi-Persona

## 📋 Visão Geral

Este diretório contém um estudo abrangente de UX testando o fluxo de consulta AI com **5 personas × 5 cenários = 25 testes E2E**.

### Estrutura

```
tests/
├── mocks/
│   └── claude-mock.ts          # Mock da API Anthropic (respostas simuladas)
├── fixtures/
│   └── persona-scenarios.ts    # 25 cenários de teste
├── analysis/
│   └── analyze-results.ts      # Script de análise de resultados
├── reports/
│   ├── test-results-*.json     # Resultados brutos (JSON)
│   └── persona-study-report-*.md # Relatório final (Markdown)
└── ai-consultation-personas.spec.ts # Testes E2E com Playwright
```

## 🎯 Personas Testadas

1. **board-executive** - Executivo C-Level / Conselho
2. **finance-ops** - Executivo Finanças / Operações
3. **product-business** - Líder Produto / Negócios
4. **engineering-tech** - Líder Engenharia / Tecnologia
5. **it-devops** - Gerente TI / DevOps

## 📊 Cenários por Persona

Cada persona é testada com 5 cenários diferentes:

1. **Otimista** - Empresa crescendo, quer acelerar
2. **Pessimista** - Muitos problemas, baixa confiança
3. **Realista** - Misto de desafios e oportunidades
4. **Cético** - Resistente a AI, precisa ROI provado
5. **Urgente** - Problemas críticos, timeline agressivo

## 🚀 Como Executar

### 1. Pré-requisitos

```bash
# Instalar dependências (se necessário)
npm install

# Garantir que servidor dev está rodando
npm run dev
```

### 2. Executar Todos os 25 Testes

```bash
# Opção 1: Via Playwright UI (recomendado para debug)
npx playwright test --ui tests/ai-consultation-personas.spec.ts

# Opção 2: Via linha de comando
npx playwright test tests/ai-consultation-personas.spec.ts

# Opção 3: Apenas uma persona específica
npx playwright test tests/ai-consultation-personas.spec.ts --grep "board-executive"
```

### 3. Analisar Resultados

```bash
# Gerar relatório de análise
npx ts-node tests/analysis/analyze-results.ts
```

## 📈 Métricas Coletadas

Para cada um dos 25 testes:

- **Tópicos Sugeridos** - Quantos e se são apropriados ao perfil
- **Perguntas Feitas** - Quantidade e adequação ao nível de abstração
- **Fluxo da Conversa** - Se opção "Continuar/Finalizar" aparece
- **Jargão Técnico** - Uso inadequado em perfis não-técnicos
- **Insights Salvos** - Se seção aparece corretamente no report

## 📄 Relatório Final

O relatório gerado inclui:

### Executive Summary
- Taxa de sucesso geral
- Estatísticas agregadas

### Análise por Persona
- Performance de cada perfil
- Problemas comuns
- Resultados por cenário

### Análise por Cenário
- Qual tipo de cenário funciona melhor
- Problemas específicos

### Problemas Críticos
- Issues que afetam múltiplos testes
- Frequência e impacto

### Recomendações Priorizadas
- **P0 (Crítico)** - Issues que afetam 5+ testes
- **P1 (Alto)** - Problemas de persona específica
- **P2 (Médio)** - Melhorias de cenário
- **P3 (Baixo)** - Nice-to-haves

## 🧪 Exemplo de Resultado

```markdown
## 📊 Executive Summary

- **Taxa de Sucesso:** 92.0%
- **Testes Passados:** 23/25
- **Testes Falhados:** 2/25

## 🎭 Análise por Persona

| Persona           | Testes | Passou | Score Topics | Flow OK |
|-------------------|--------|--------|--------------|---------|
| board-executive   | 5      | 5 (100%) | 80%        | 100%    |
| finance-ops       | 5      | 5 (100%) | 100%       | 100%    |
| product-business  | 5      | 4 (80%)  | 60%        | 100%    |
| engineering-tech  | 5      | 5 (100%) | 100%       | 100%    |
| it-devops         | 5      | 4 (80%)  | 80%        | 80%     |
```

## 🔍 O Que É Testado

### ✅ Validações Positivas

- Tópicos gerados são relevantes ao perfil?
- Perguntas usam linguagem adequada (negócio vs técnica)?
- Fluxo não corta conversa abruptamente?
- Usuário tem controle (pode continuar ou finalizar)?
- Insights salvos e exibidos no report?

### ❌ Validações Negativas

- Board Executive recebe perguntas sobre "débito técnico"?
- Finance/Ops recebe perguntas muito técnicas?
- Engineering recebe perguntas muito superficiais?
- Fluxo força usuário a responder 5 perguntas obrigatórias?

## 🛠️ Customização

### Adicionar Novo Cenário

Edite `fixtures/persona-scenarios.ts`:

```typescript
const scenarioTemplates = {
  // ... existing scenarios
  meuNovoTipo: {
    currentState: { ... },
    goals: { ... },
    simulatedResponses: [ ... ],
  },
};
```

### Modificar Mock de Respostas

Edite `mocks/claude-mock.ts`:

```typescript
const personaResponses = {
  'board-executive': {
    question1: [{
      text: 'Sua pergunta customizada',
      isAppropriate: true,
      abstractionLevel: 'strategic',
    }],
  },
};
```

## 📊 Exportar Resultados

Resultados são salvos automaticamente em:

- **JSON:** `reports/test-results-[timestamp].json`
- **Markdown:** `reports/persona-study-report-[timestamp].md`

Para exportar para Excel:
```bash
# Manual: Abrir JSON no Excel ou Google Sheets
```

## 🐛 Troubleshooting

### Testes Falham com Timeout

```bash
# Aumentar timeout no playwright.config.ts
timeout: 60000, // 60 segundos
```

### Mock não funciona

Verifique se servidor dev está rodando:
```bash
npm run dev
# Em outro terminal:
npx playwright test
```

### Resultados não aparecem

```bash
# Criar diretório manualmente
mkdir -p tests/reports
```

## 📝 Contribuindo

Para melhorar os testes:

1. Adicione novos cenários em `fixtures/`
2. Melhore mocks em `mocks/`
3. Adicione métricas em `analysis/`
4. Execute e compare resultados

## 🎯 Próximos Passos

Após análise dos resultados:

1. Identificar personas problemáticas
2. Ajustar prompts em `lib/prompts/`
3. Melhorar geração de tópicos
4. Re-executar testes
5. Validar melhorias

---

**Dúvidas?** Consulte a documentação principal ou abra uma issue.

---

# 🧪 FASE 2 & FASE 3: API Tests (100% Real API)

Testes para Follow-up Orchestrator (FASE 2) e Insights Engine (FASE 3) usando chamadas reais à API Claude.

## 📁 Estrutura FASE 2 & 3

```
tests/
├── mocks/                           Mocks (criados, não usados)
│   ├── claude-mock-followups.ts     287 linhas
│   └── claude-mock-insights.ts      296 linhas
├── fixtures/                        Cenários de teste
│   ├── followup-scenarios.ts        7 cenários (199 linhas)
│   └── insights-scenarios.ts        4 cenários (354 linhas)
├── fase2-followups/
│   └── followup-api.spec.ts         8 testes API (R$ 0.90/run)
└── fase3-insights/
    └── insights-api.spec.ts         8 testes API (R$ 2.40/run)
```

## 🚀 Quick Start

### 1. Configurar API Key

```bash
export ANTHROPIC_API_KEY=sk-ant-api-...
```

### 2. Iniciar Servidor

```bash
npm run dev
# Aguardar http://localhost:3000
```

### 3. Executar Testes

```bash
# Health checks (grátis)
npx playwright test -g "GET health check"

# Follow-ups API (R$ 0.90)
npx playwright test tests/fase2-followups

# Insights API (R$ 2.40)
npx playwright test tests/fase3-insights

# Todos os API tests (R$ 3.30)
npx playwright test tests/fase2-followups tests/fase3-insights
```

## 💰 Custos e Budget

| Suite | Testes | Custo | Tempo |
|-------|--------|-------|-------|
| Health checks | 2 | R$ 0.00 | 2s |
| Follow-ups | 8 | R$ 0.90 | ~15s |
| Insights | 8 | R$ 2.40 | ~20s |
| **Total** | **16** | **R$ 3.30** | **~30s** |

**Budget mensal:** R$ 127 (permite até 38 execuções completas/mês)

## 📊 Testes Implementados

### FASE 2: Follow-up Orchestrator (8 testes)
- Health check da API
- Análise de respostas válidas
- Detecção de weak signals
- Limite de 3 follow-ups
- Validação de campos
- Cenários: vague, complete, emotional

### FASE 3: Insights Engine (8 testes)
- Health check da API
- Geração para high-value leads
- Skip para low-value leads
- Respeito a urgency
- Validação de campos obrigatórios
- Budget-aware logic
- Force generate override

## 🔧 Características Técnicas

- **Execução Serial:** Evita rate limits (50 req/min)
- **Timeouts:** 60s para chamadas Claude API
- **Delays:** 2s entre testes com API real
- **Cost Tracking:** Automático via `lib/monitoring/cost-tracker.ts`

## 📚 Documentação Completa

- **Estratégia de Testes:** [docs/TESTING_STRATEGY.md](../docs/TESTING_STRATEGY.md)
- **Resultados Finais:** [docs/TESTE_FINAL_RESULTS.md](../docs/TESTE_FINAL_RESULTS.md)
- **CI/CD Workflow:** [.github/workflows/test-playwright-api.yml](../.github/workflows/test-playwright-api.yml)

## 🐛 Troubleshooting

**Timeout:** Verificar se servidor está em http://localhost:3000
**Rate Limit:** Testes já têm delay, aguardar 1 minuto se necessário
**Budget Exceeded:** Aguardar até meia-noite ou aumentar limite

---

**Versão FASE 2&3:** 1.0.0 (Plan A - 100% API Real)
**Última atualização:** 2025-11-14

---

# 🎯 Adaptive Assessment API Tests (100% Real API)

Testes de integração para o sistema completo de Adaptive Assessment com 4 endpoints API usando chamadas reais ao Claude.

## 📁 Estrutura

```
tests/
└── adaptive-assessment/
    └── adaptive-api.spec.ts        12 testes API (R$ 1.50-2.00/run)
```

## 🔄 Endpoints Testados

1. **POST /api/adaptive-assessment** - Inicializar sessão
2. **POST /api/adaptive-assessment/next-question** - Obter próxima pergunta (usa AI router)
3. **POST /api/adaptive-assessment/answer** - Submeter resposta
4. **POST /api/adaptive-assessment/complete** - Finalizar assessment

## 🚀 Como Executar

### 1. Pré-requisitos

```bash
# Configurar API Key
export ANTHROPIC_API_KEY=sk-ant-api-...

# Iniciar servidor dev
npm run dev
```

### 2. Executar Testes

```bash
# Todos os testes (R$ 1.50-2.00)
npx playwright test tests/adaptive-assessment

# Apenas happy paths (R$ 1.00-1.50)
npx playwright test tests/adaptive-assessment -g "Happy Paths"

# Apenas error handling (grátis, sem Claude API)
npx playwright test tests/adaptive-assessment -g "Error Handling"

# Apenas edge cases (R$ 0.50-1.00)
npx playwright test tests/adaptive-assessment -g "Edge Cases"
```

## 📊 Testes Implementados (12 testes)

### Group 1: Happy Paths (5 testes)
1. **Initialize session successfully**
   - Cria sessão com persona válido
   - Verifica sessionId retornado
   - ✅ Custo: R$ 0.00

2. **Get first question (should not be null)**
   - Obtém primeira pergunta via AI router
   - Valida estrutura da pergunta
   - ✅ Custo: R$ 0.05-0.10 (Claude API)

3. **Submit answer and verify context update**
   - Submete resposta válida
   - Verifica atualização de contexto
   - ✅ Custo: R$ 0.00

4. **Complete flow (init → 3-5 Q&A → complete)**
   - Fluxo completo de assessment
   - Verifica progressão de completeness
   - Testa insights opcionalCusto: R$ 0.75-1.00 (3-5 chamadas Claude)

5. **Verify completeness progression**
   - Responde 3 perguntas
   - Valida aumento monotônico de completeness
   - ✅ Custo: R$ 0.45-0.60 (3 chamadas Claude)

### Group 2: Error Handling (5 testes)
6. **Error: Missing sessionId (next-question)**
   - Valida erro 400
   - ✅ Custo: R$ 0.00

7. **Error: Invalid persona (init)**
   - Valida erro 400
   - ✅ Custo: R$ 0.00

8. **Error: Session not found (next-question)**
   - Valida erro 404
   - ✅ Custo: R$ 0.00

9. **Error: Invalid question ID (answer)**
   - Valida erro 404
   - ✅ Custo: R$ 0.00

10. **Error: Missing answer (answer)**
    - Valida erro 400
    - ✅ Custo: R$ 0.00

### Group 3: Edge Cases (2 testes)
11. **Verify session cleanup after complete**
    - Valida que sessão é deletada após complete
    - Tenta reusar sessionId (deve falhar)
    - ✅ Custo: R$ 0.00

12. **Complete works even if insights fail (graceful degradation)**
    - Testa que complete funciona sem insights
    - Valida graceful degradation
    - ✅ Custo: R$ 0.10-0.20 (1-2 chamadas Claude)

## 💰 Custos Estimados

| Categoria | Testes | Chamadas Claude | Custo |
|-----------|--------|----------------|-------|
| Happy Paths | 5 | 10-15 | R$ 1.25-1.75 |
| Error Handling | 5 | 0 | R$ 0.00 |
| Edge Cases | 2 | 1-3 | R$ 0.15-0.25 |
| **Total** | **12** | **11-18** | **R$ 1.50-2.00** |

**Budget mensal:** R$ 127 (permite até 60-80 execuções/mês)

## 🎯 O Que É Testado

### ✅ Validações Principais

**Session Management:**
- Criação de sessão com persona válido
- Validação de sessionId
- Session cleanup após complete
- Detecção de session expired/not found

**Question Routing (AI-powered):**
- AI router seleciona pergunta apropriada
- Estrutura da pergunta válida (id, text, inputType, options)
- shouldFinish detecta quando completar
- Routing decision com reasoning

**Answer Processing:**
- Context atualizado corretamente
- Completeness score aumenta monotonicamente
- Topics detectados semanticamente
- Validação de questionId e answer

**Assessment Completion:**
- AssessmentData compilado corretamente
- SessionSummary com métricas
- Insights opcionaliais (graceful degradation)
- Session deletada após complete

**Error Handling:**
- Missing sessionId → 400
- Invalid persona → 400
- Session not found → 404
- Invalid questionId → 404
- Missing answer → 400

## 🔧 Características Técnicas

**Execução:**
- **Serial mode:** Gerencia estado de sessão sequencialmente
- **Timeouts:** 60-120s para testes com múltiplas chamadas Claude
- **Delays:** 2s entre testes para rate limiting
- **Real API:** Testa integração real (não mock)

**Session State:**
- In-memory storage (session-manager)
- 30min timeout (não testado, seria muito longo)
- Cleanup automático a cada 5min
- Delete explícito em complete

**AI Router:**
- Claude API: claude-3-5-sonnet-20250122
- ~300 tokens por decisão
- Fallback rule-based se Claude falhar
- Completeness-aware (para até 80%)

## 📈 Fluxo de Teste Típico

```
1. POST /api/adaptive-assessment
   → sessionId: "abc123"

2. POST /api/adaptive-assessment/next-question
   → nextQuestion: { id: "company-industry-v2", ... }
   → completeness: 15%

3. POST /api/adaptive-assessment/answer
   → success: true
   → completeness: 28%

4. (Repetir 2-3 mais 2-4 vezes)
   → completeness: 45% → 62% → 78%

5. POST /api/adaptive-assessment/next-question
   → shouldFinish: true
   → finishReason: "completeness_reached"

6. POST /api/adaptive-assessment/complete
   → assessmentData: { ... }
   → sessionSummary: { questionsAsked: 5, completeness: 78% }
   → deepInsights: { ... } (opcional)
```

## 🐛 Troubleshooting

**Timeout em testes:**
- Verificar servidor em http://localhost:3000
- Aumentar timeout para 120s em testes longos
- Verificar ANTHROPIC_API_KEY configurado

**Rate limit:**
- Testes já têm 2s delay
- Se necessário, aumentar RATE_LIMIT_DELAY
- Aguardar 1 minuto entre execuções completas

**Session not found:**
- Normal após complete (session deletada)
- Verificar que cada teste cria sessão nova
- Checar logs do servidor para detalhes

**Completeness não aumenta:**
- Verificar se perguntas estão sendo respondidas corretamente
- Checar logs do answer endpoint
- Validar que questionId está correto

## 📚 Arquivos Relacionados

**API Endpoints:**
- `/app/api/adaptive-assessment/route.ts` - Inicialização
- `/app/api/adaptive-assessment/next-question/route.ts` - AI router
- `/app/api/adaptive-assessment/answer/route.ts` - Context update
- `/app/api/adaptive-assessment/complete/route.ts` - Finalização

**Core Logic:**
- `/lib/ai/session-manager.ts` - Gerenciamento de sessões
- `/lib/ai/adaptive-question-router.ts` - AI-powered routing
- `/lib/ai/conversation-context.ts` - Context updates
- `/lib/ai/completeness-scorer.ts` - Métricas de completude
- `/lib/ai/question-pool.ts` - Pool de 50 perguntas

## 🎯 Decisões de Design (ULTRATHINK)

**Por que 100% Real API?**
- Alta fidelidade: Testa integração real com Claude
- Detecta problemas reais: Rate limits, timeouts, parsing
- Custo aceitável: ~R$ 2/run dentro do budget

**Por que Serial Execution?**
- Session state: Testes dependem de sequência
- Rate limiting: Evita burst de 50+ req/min
- Debugging: Logs mais fáceis de seguir

**Por que 12 testes (não 50)?**
- Cobertura crítica: Happy paths + errors + edge cases
- Custo controlado: ~R$ 2/run vs R$ 10+/run
- Manutenibilidade: Fácil de entender e manter

**O que NÃO é testado?**
- Session expiry (30min): Muito longo
- AI routing quality: Trust Claude
- Exact completeness values: Variação aceitável
- Topic detection accuracy: Semantic, best-effort

---

**Versão:** 1.0.0 (ULTRATHINK methodology applied)
**Última atualização:** 2025-11-15
