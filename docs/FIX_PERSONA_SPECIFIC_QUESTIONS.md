# Fix: Perguntas Específicas por Persona

**Data:** 2025-11-21
**Problema:** Sistema perguntava sobre "bugs de produção" e "equipe técnica" mesmo para usuários não-técnicos.

## 🐛 Problema Original

O usuário reportou:
> "as perguntas sao sempre as mesmas, nao parece ter uma a.i. por tras, continua perguntando sobre equipe tecnica e bugs de producao mesmo eu tendo selecionado nada sobre tech"

### Root Cause

O **question bank tinha APENAS perguntas técnicas**:
- "Quantas pessoas compõem sua equipe de desenvolvimento?"
- "Qual é o principal desafio técnico que sua equipe enfrenta?"
- "Com que frequência bugs críticos chegam à produção?"
- "Vocês fazem code review em todos os pull requests?"

**Problema:** Essas perguntas não fazem sentido para:
- Persona `product-business` (Produto/UX)
- Persona `board-executive` (C-level/Estratégia)
- Persona `finance-ops` (Financeiro/Operações)

### Solução Tentada Anteriormente (FALHOU)

Tentamos criar um **adaptador de texto** que traduzia palavras:
- "equipe de desenvolvimento" → "time"
- "desafio técnico" → "principal desafio"
- "bugs" → "problemas"

**Por que falhou:** Traduzir palavras não resolve! A pergunta fundamental continua sendo técnica. Perguntar "quantas pessoas no seu time" ao invés de "equipe de desenvolvimento" não muda o fato de que é uma **pergunta irrelevante** para um executivo de negócios.

## ✅ Solução Real Implementada

### 1. Adicionar Campo `personas` nas Perguntas

**Arquivo:** `lib/questions/ai-readiness-question-bank.ts`

```typescript
export interface EnhancedQuestion {
  id: string;
  text: string;
  inputType: 'text' | 'single-choice' | 'multi-choice' | 'number';
  block: 'discovery' | 'expertise' | 'deep-dive' | 'risk-scan';

  // ✅ NOVO: Targeting de personas
  personas?: ('engineering-tech' | 'product-business' | 'board-executive' | 'finance-ops' | 'it-devops')[];

  // Se undefined, pergunta serve para TODOS os personas
  // Se definido, pergunta só aparece para os personas listados

  // ... outros campos
}
```

### 2. Criar Perguntas Business-Focused

**5 novas perguntas para personas de negócios:**

#### disc-biz-001: Tamanho da Empresa
```typescript
{
  id: 'disc-biz-001-company-size',
  text: 'Qual o tamanho da sua empresa?',
  personas: ['product-business', 'board-executive', 'finance-ops'],
  options: [
    { value: 'startup', label: 'Startup (até 50 pessoas)' },
    { value: 'scaleup', label: 'Scale-up (51-500 pessoas)' },
    { value: 'enterprise', label: 'Enterprise (500+ pessoas)' }
  ]
}
```

#### disc-biz-002: Desafio Estratégico
```typescript
{
  id: 'disc-biz-002-main-business-challenge',
  text: 'Qual é o principal desafio estratégico da empresa hoje?',
  personas: ['product-business', 'board-executive', 'finance-ops'],
  placeholder: 'Ex: Crescimento lento, custos operacionais altos, perda de competitividade...'
}
```

#### disc-biz-003: Impacto na Receita
```typescript
{
  id: 'disc-biz-003-revenue-impact',
  text: 'Esse desafio tem impactado a receita ou crescimento da empresa?',
  personas: ['product-business', 'board-executive', 'finance-ops'],
  options: [
    { value: 'high', label: 'Sim, impacto alto - Perdendo receita ou clientes' },
    { value: 'medium', label: 'Impacto moderado - Crescimento mais lento' },
    { value: 'low', label: 'Impacto baixo - Ainda não crítico' },
    { value: 'unknown', label: 'Não medimos ainda' }
  ]
}
```

#### disc-biz-004: Maturidade em IA
```typescript
{
  id: 'disc-biz-004-ai-maturity',
  text: 'A empresa já usa IA ou automação em alguma área?',
  personas: ['product-business', 'board-executive', 'finance-ops'],
  options: [
    { value: 'none', label: 'Não usamos ainda - Começando do zero' },
    { value: 'experiments', label: 'Experimentos pontuais - Testes isolados' },
    { value: 'some-areas', label: 'Sim, em algumas áreas - Adoção parcial' },
    { value: 'widespread', label: 'Uso disseminado - Várias áreas usando' }
  ]
}
```

#### disc-biz-005: Objetivo Estratégico
```typescript
{
  id: 'disc-biz-005-primary-goal',
  text: 'Se você pudesse resolver UM problema estratégico com IA, qual seria?',
  personas: ['product-business', 'board-executive', 'finance-ops'],
  options: [
    { value: 'growth', label: 'Acelerar crescimento - Ganhar mais clientes' },
    { value: 'efficiency', label: 'Reduzir custos operacionais - Fazer mais com menos' },
    { value: 'quality', label: 'Melhorar qualidade do produto - Menos problemas' },
    { value: 'speed', label: 'Aumentar velocidade de entrega - Time-to-market' },
    { value: 'innovation', label: 'Inovar mais rápido - Competitividade' },
    { value: 'experience', label: 'Melhorar experiência do cliente - Satisfação' }
  ]
}
```

### 3. Marcar Perguntas Técnicas Existentes

Todas as perguntas técnicas agora têm:
```typescript
personas: ['engineering-tech', 'it-devops']
```

Exemplos:
- `disc-tech-001-team-size`: "Quantas pessoas compõem sua equipe de desenvolvimento?"
- `disc-tech-002-main-challenge`: "Qual é o principal desafio técnico..."
- `disc-tech-003-ai-tools-current`: "Sua equipe já usa GitHub Copilot..."

### 4. Filtrar Perguntas por Persona no Router

**Arquivo:** `lib/ai/adaptive-question-router-v2.ts`

```typescript
async function selectQuestionFromBlock(
  block: QuestionBlock,
  answeredIds: string[],
  context: AssessmentSessionContext
): Promise<string | undefined> {
  let candidates = getQuestionsByBlock(block);

  // ✅ FILTER BY PERSONA - Show only questions matching user's persona
  const userPersona = context.persona;
  candidates = candidates.filter(q => {
    // If question has no personas field, it's available to all
    if (!q.personas || q.personas.length === 0) {
      return true;
    }
    // Otherwise, check if user's persona is in the allowed list
    return q.personas.includes(userPersona as any);
  });

  console.log('🎯 [Router v2] Filtered questions by persona:', {
    persona: userPersona,
    totalInBlock: getQuestionsByBlock(block).length,
    afterPersonaFilter: candidates.length
  });

  // ... resto da lógica
}
```

### 5. Limpar Endpoint (Remover Adaptador de Texto)

**Arquivo:** `app/api/adaptive-assessment/next-question/route.ts`

- ❌ Removido: `adaptFullQuestion()` (não precisamos mais!)
- ✅ Mantido: Perguntas já vêm certas do banco filtrado por persona

## 🎯 Resultado

### Para Persona `board-executive` ou `product-business`:

**ANTES (❌ Perguntas Técnicas Inapropriadas):**
1. "Quantas pessoas compõem sua equipe de desenvolvimento?"
2. "Qual é o principal desafio técnico que sua equipe enfrenta?"
3. "Com que frequência bugs críticos chegam à produção?"
4. "Vocês fazem code review em todos os pull requests?"

**AGORA (✅ Perguntas de Negócio):**
1. "Qual o tamanho da sua empresa?"
2. "Qual é o principal desafio estratégico da empresa hoje?"
3. "Esse desafio tem impactado a receita ou crescimento da empresa?"
4. "A empresa já usa IA ou automação em alguma área?"
5. "Se você pudesse resolver UM problema estratégico com IA, qual seria?"

### Para Persona `engineering-tech` ou `it-devops`:

**Continua recebendo perguntas técnicas originais (correto!):**
1. "Quantas pessoas compõem sua equipe de desenvolvimento?"
2. "Qual é o principal desafio técnico que sua equipe enfrenta?"
3. "Sua equipe já usa alguma ferramenta de IA no desenvolvimento?"
4. "Quanto tempo leva desde código pronto até produção?"
5. "Com que frequência bugs críticos chegam à produção?"

## 🔄 Fluxo Completo

```
Step -2: Expertise Detection
   ↓
   Usuário seleciona: "Produto UX" + "Estratégia Negócios"
   ↓
POST /api/adaptive-assessment
   ↓
   Infere persona: board-executive
   ↓
Step 101: Adaptive Assessment
   ↓
POST /api/adaptive-assessment/next-question
   ↓
Router v2: routeToNextQuestion()
   ↓
selectQuestionFromBlock('discovery', [], context)
   ↓
   ✅ Filtra por persona: board-executive
   ↓
   Candidatos: 5 perguntas business (disc-biz-001 a 005)
   ❌ Excluídos: perguntas técnicas (disc-tech-001, 002, etc)
   ↓
   Seleciona: disc-biz-001-company-size
   ↓
   Retorna: "Qual o tamanho da sua empresa?"
```

## 🧪 Como Testar

1. **Limpar sessão** (localStorage no browser)
2. **Acessar:** http://localhost:3003/assessment
3. **Step -2:** Selecionar APENAS "Produto/UX" + "Estratégia/Negócios"
   (NÃO marcar "Tecnologia/Programação")
4. **Step 101:** Verificar que perguntas são sobre:
   - ✅ Tamanho da empresa
   - ✅ Desafios estratégicos
   - ✅ Impacto na receita
   - ✅ Maturidade em IA
   - ✅ Objetivos de negócio
5. **Verificar logs do servidor:**
```bash
🎯 [Adaptive] Persona selection: {
  userExpertise: ['product-ux', 'strategy-business'],
  inferred: 'board-executive',
  final: 'board-executive'
}

🎯 [Router v2] Filtered questions by persona: {
  persona: 'board-executive',
  totalInBlock: 13,      // Total no banco
  afterPersonaFilter: 5   // Apenas business questions
}

📝 [Next Question] Using question from bank: {
  questionId: 'disc-biz-001-company-size',
  persona: 'board-executive',
  questionPersonas: ['product-business', 'board-executive', 'finance-ops']
}
```

## 📊 Comparação: Antes vs Depois

| Aspecto | Antes ❌ | Depois ✅ |
|---------|----------|-----------|
| **Abordagem** | Traduzir palavras técnicas | Perguntas diferentes por persona |
| **Relevância** | Baixa (perguntas técnicas para executivos) | Alta (perguntas adequadas ao contexto) |
| **Adaptação** | Superficial (só linguagem) | Profunda (conteúdo e contexto) |
| **Experiência** | Confusa e frustrante | Clara e relevante |
| **Implementação** | Texto adapter (band-aid) | Question bank + router filter (arquitetura correta) |

## 🎓 Lições Aprendidas

### ❌ O Que NÃO Funciona
**Tradução de Palavras:** Substituir "equipe de desenvolvimento" por "time" não resolve o problema fundamental. A pergunta continua sendo irrelevante.

### ✅ O Que Funciona
**Perguntas Específicas por Audiência:** Criar perguntas completamente diferentes baseadas no contexto do usuário (técnico vs. negócios).

### 🔑 Princípio
> "Não traduza - adapte o contexto."

## 🚀 Próximos Passos

1. **Adicionar mais perguntas business-focused** para os blocos:
   - Expertise (exp-biz-001, 002, 003)
   - Deep-dive (dd-biz-001, 002, 003)
   - Risk-scan (risk-biz-001, 002)

2. **Criar perguntas específicas para `finance-ops`:**
   - Foco em ROI, budget, custos, métricas financeiras

3. **Implementar dynamic follow-ups** que respeitam persona:
   - Follow-ups técnicos para engineering-tech
   - Follow-ups de negócio para board-executive

4. **Adicionar analytics** para medir:
   - Taxa de completude por persona
   - Satisfação com relevância das perguntas
   - Tempo médio de resposta por tipo de pergunta

---

**Status:** ✅ Implementado e testado
**Impacto:** Alto - resolve problema crítico de UX
**Arquitetura:** Correta e escalável
