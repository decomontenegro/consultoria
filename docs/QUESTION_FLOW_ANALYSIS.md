# Análise do Fluxo de Perguntas - CulturaBuilder Assessment

**Data:** 2025-10-22
**Objetivo:** Identificar duplicações, sobreposições e oportunidades de otimização no fluxo de perguntas

---

## 📊 Resumo Executivo

### Problemas Encontrados
- ✅ **1 duplicação corrigida:** `company-industry`
- ❌ **1 duplicação crítica:** `budget-range`
- ⚠️ **2 sobreposições parciais:** desafios/pain-points, company-size/team-size
- 🔴 **Dados não aproveitados:** 60% dos dados do AI Router não são usados para pular perguntas
- 🔴 **Pergunta faltando:** Nome da empresa nunca é perguntado explicitamente

### Impacto no Usuário
- **Tempo perdido:** ~2-3 perguntas repetidas = +2 minutos no fluxo
- **Frustração:** Usuário responde a mesma coisa duas vezes
- **Qualidade dos dados:** Inconsistências entre respostas duplicadas

---

## 🔍 Análise Detalhada

### AI Router - 5 Perguntas Iniciais

| ID | Pergunta | Dados Extraídos | Usado no Express? |
|---|---|---|---|
| 1 | `main-challenge` | "qual o principal desafio de tecnologia..." | `partialData.painPoints` | ❌ Não usado |
| 2 | `user-role` | "Qual seu cargo ou função..." | `persona` (detectado) | ✅ Sim (via persona) |
| 3 | `company-size` | "Quantos funcionários..." | `partialData.companyInfo.size` | ❌ Não usado |
| 4 | `industry` | "Em qual setor..." | `partialData.companyInfo.industry` | ✅ CORRIGIDO |
| 5 | `budget-timeline` | "orçamento definido..." | `partialData.budget` | ❌ **DUPLICA** |

**Dados extraídos mas NÃO usados:**
```typescript
partialData = {
  companyInfo: {
    size: 'startup' | 'scaleup' | 'enterprise',  // ❌ Não usado
    industry: 'fintech' | 'saas' | ...            // ✅ Usado
  },
  painPoints: ['lento', 'bugs', 'custo', ...],    // ❌ Não usado
  budget: 'Menor que R$50k' | 'R$100k-500k' | ... // ❌ Não usado
}
```

---

### Express Mode - 10 Perguntas

| # | ID | Pergunta | Duplica AI Router? | Prioridade |
|---|---|---|---|---|
| 1 | `company-industry` | "Em qual setor sua empresa atua?" | ✅ **CORRIGIDO** #4 | essential |
| 2 | `team-size` | "Tamanho do time de dev?" | ⚠️ Relacionada #3 | essential |
| 3 | `main-pain-point` | "Principais desafios?" | ⚠️ Similar #1 | essential |
| 4 | `impact-quantified` | "Impacto mensurável?" | - | important |
| 5 | `ai-current-usage` | "Usa AI/automação hoje?" | - | essential |
| 6 | `primary-goal` | "UM problema em 3-6 meses?" | - | essential |
| 7 | `timeline` | "Prazo ideal?" | - | essential |
| 8 | `budget-range` | "Orçamento aprovado?" | ❌ **DUPLICA** #5 | important |
| 9 | `success-metrics` | "Como medir sucesso?" | - | important |
| 10 | `contact-info` | "Nome e email" | - | essential |

---

## 🐛 Problemas Críticos

### 1. ❌ DUPLICAÇÃO: Budget (Crítico)

**AI Router #5:**
```
"Você já tem orçamento definido para investir nessa área
ou ainda está explorando possibilidades?"
```

**Express #8:**
```
"Tem orçamento aprovado ou estimativa para investir nessa área?
(pode ser uma faixa)"
```

**Problema:** Usuário responde sobre orçamento duas vezes!

**Solução Proposta:**
```typescript
// Em StepAIExpress.tsx - getInitialAnsweredQuestions()
if (partialData?.budget) {
  answered.push('budget-range');
  console.log('✅ Skipping budget-range (already answered in AI Router)');
}
```

---

### 2. ⚠️ SOBREPOSIÇÃO PARCIAL: Desafios

**AI Router #1:** (texto livre)
```
"qual o principal desafio de tecnologia ou inovação da sua empresa hoje?"
```

**Express #3:** (multi-choice)
```
"Quais são os principais desafios que a empresa enfrenta hoje? (Selecione até 3)"
```

**Problema:**
- Conteúdo similar mas formatos diferentes
- AI Router extrai keywords (`partialData.painPoints`)
- Express não usa esses keywords para pré-selecionar opções

**Solução Proposta:**
- Pré-selecionar opções do Express baseado em `partialData.painPoints`
- Ou remover pergunta #1 do AI Router (menos crítico, foca em persona detection)

---

### 3. ⚠️ SOBREPOSIÇÃO: Company Size vs Team Size

**AI Router #3:**
```
"Quantos funcionários tem sua empresa aproximadamente?"
→ Extrai: companyInfo.size (startup/scaleup/enterprise)
```

**Express #2:**
```
"Qual o tamanho do time de tecnologia/desenvolvimento?"
→ Extrai: currentState.devTeamSize (número)
```

**Análise:**
- **Não é duplicação!** São perguntas diferentes:
  - AI Router: tamanho total da empresa
  - Express: tamanho do time de dev
- Mas dados do AI Router (`companyInfo.size`) poderiam ajudar a sugerir faixa

**Solução Proposta:**
- Manter ambas as perguntas
- Usar `companyInfo.size` para pré-selecionar faixa provável no Express

---

### 4. 🔴 FALTANDO: Nome da Empresa

**Problema:**
- Nenhum fluxo pergunta explicitamente o nome da empresa
- Express usa default: `companyInfo?.name || 'Empresa'`
- Relatório fica genérico: "Empresa de fintech"

**Solução Proposta:**
- Adicionar pergunta no Express Mode: `"Qual o nome da sua empresa?"`
- Ou extrair do domínio do email (menos confiável)

---

## 📈 Métricas de Aproveitamento

### Dados do AI Router → Express

| Campo | Extraído? | Usado? | Taxa de Aproveitamento |
|---|---|---|---|
| `persona` | ✅ | ✅ | 100% |
| `companyInfo.industry` | ✅ | ✅ | **100%** ✅ |
| `companyInfo.size` | ✅ | ❌ | **0%** |
| `painPoints` | ✅ | ❌ | **0%** |
| `budget` | ✅ | ❌ | **0%** |

**Taxa geral de aproveitamento: 40%** 😕

---

## ✅ Correções Já Implementadas

### 1. Company Industry (FEITO)

**Antes:**
- AI Router perguntava sobre setor
- Express perguntava novamente

**Depois:**
```typescript
// StepAIExpress.tsx - linha 55-57
if (partialData?.companyInfo?.industry) {
  answered.push('company-industry');
  console.log('✅ Skipping company-industry');
}
```

**Resultado:** -1 pergunta duplicada ✅

---

## 🎯 Recomendações Priorizadas

### P0 - Crítico (Implementar Agora)

#### 1. Corrigir Duplicação de Budget
```typescript
// StepAIExpress.tsx - getInitialAnsweredQuestions()
if (partialData?.budget) {
  answered.push('budget-range');

  // Também popular o dado
  assessmentData.goals = {
    ...assessmentData.goals,
    budgetRange: partialData.budget
  };
}
```

**Impacto:** -1 pergunta, -30 segundos

#### 2. Adicionar Pergunta de Nome da Empresa
```typescript
// dynamic-questions.ts - inserir após company-industry
{
  id: 'company-name',
  text: 'Qual o nome da sua empresa?',
  category: 'company',
  personas: ['all'],
  priority: 'essential',
  inputType: 'text',
  placeholder: 'Ex: TechCorp',
  dataExtractor: (answer, data) => ({
    companyInfo: {
      ...data.companyInfo,
      name: answer
    }
  })
}
```

**Impacto:** +1 pergunta essencial, +dados de qualidade

---

### P1 - Importante (Implementar Esta Semana)

#### 3. Aproveitar Pain Points do AI Router
```typescript
// StepAIExpress.tsx - ao carregar main-pain-point
if (partialData?.painPoints && partialData.painPoints.length > 0) {
  // Mapear keywords para opções
  const preSelected = partialData.painPoints
    .map(keyword => {
      // Map 'lento' → 'velocity'
      // Map 'bugs' → 'quality'
      // etc.
    })
    .filter(Boolean);

  if (preSelected.length > 0) {
    setCurrentAnswer(preSelected); // Pré-selecionar
  }
}
```

**Impacto:** UX melhor, dados mais consistentes

#### 4. Usar Company Size como Hint
```typescript
// StepAIExpress.tsx - ao carregar team-size
if (partialData?.companyInfo?.size) {
  // startup → sugerir '1-5' ou '6-15'
  // scaleup → sugerir '16-30' ou '31-50'
  // enterprise → sugerir '51-100' ou '100+'
}
```

**Impacto:** UX melhor, menos digitação

---

### P2 - Melhoria (Backlog)

#### 5. Otimizar AI Router Question #1
Considerar mudar pergunta #1 de texto livre para múltipla escolha:
- Mais fácil de analisar
- Melhora detecção de persona
- Reduz necessidade da pergunta #3 do Express

#### 6. Consolidar Timeline Questions
AI Router pergunta "orçamento ou explorando?" (indireto sobre urgência)
Express pergunta "prazo ideal?" (direto sobre timeline)

Considerar adicionar pergunta de timeline no AI Router para melhor routing.

---

## 📊 Fluxo Otimizado Proposto

### Cenário: AI Router → Express Mode

**Perguntas Totais Antes:** 5 (AI Router) + 10 (Express) = **15 perguntas**

**Perguntas Totais Depois (com otimizações P0):**
- AI Router: 5 perguntas
- Express (com deduplicação):
  - ~~company-industry~~ (skipada)
  - ~~budget-range~~ (skipada)
  - +company-name (nova)
  - = 9 perguntas

**Total: 5 + 9 = 14 perguntas (-1)** ✅

**Tempo economizado:** ~45 segundos

---

## 🧪 Plano de Testes

### Cenário 1: Fluxo Completo AI Router → Express
1. Iniciar assessment
2. Completar AI Router (5 perguntas)
   - Responder sobre setor: "SaaS"
   - Responder sobre orçamento: "Entre R$100-200k"
3. Escolher Express Mode
4. **Verificar:**
   - ✅ Não pergunta sobre setor novamente
   - ✅ Não pergunta sobre orçamento novamente
   - ✅ Pergunta sobre nome da empresa
   - ✅ Total de perguntas: 9 (não 10)

### Cenário 2: Express Mode Direto (sem AI Router)
1. Iniciar assessment → pular AI Router
2. Escolher Express Mode diretamente
3. **Verificar:**
   - ✅ Pergunta sobre setor (não foi skipada)
   - ✅ Pergunta sobre orçamento
   - ✅ Pergunta sobre nome da empresa
   - ✅ Total de perguntas: 10

### Cenário 3: Dados Parciais Incompletos
1. AI Router com respostas genéricas
   - Não menciona setor específico
   - Não menciona orçamento
2. Express Mode
3. **Verificar:**
   - ✅ Pergunta sobre setor (não skipada)
   - ✅ Pergunta sobre orçamento (não skipada)

---

## 📝 Checklist de Implementação

### P0 - Crítico
- [x] ~~Corrigir duplicação de company-industry~~
- [ ] Corrigir duplicação de budget-range
- [ ] Adicionar pergunta de company-name
- [ ] Testar fluxo completo AI Router → Express

### P1 - Importante
- [ ] Aproveitar painPoints para pré-selecionar opções
- [ ] Usar company.size como hint para team-size
- [ ] Documentar mapeamentos de dados

### P2 - Melhoria
- [ ] Avaliar otimização da pergunta #1 do AI Router
- [ ] Considerar adicionar timeline ao AI Router

---

## 🔗 Arquivos Relacionados

- `/lib/ai/assessment-router.ts` - AI Router questions + extractPartialData()
- `/lib/ai/dynamic-questions.ts` - Express Mode questions
- `/components/assessment/StepAIExpress.tsx` - Express Mode component
- `/components/assessment/StepAIRouter.tsx` - AI Router component

---

## 📚 Próximos Passos

1. **Agora:** Implementar correção P0 (budget-range)
2. **Agora:** Adicionar pergunta de company-name
3. **Hoje:** Testar fluxo completo
4. **Esta semana:** Implementar melhorias P1
5. **Backlog:** Avaliar otimizações P2

---

**Análise realizada por:** Claude Code
**Versão:** 1.0
**Status:** Em implementação
