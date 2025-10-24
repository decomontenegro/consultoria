# 🔧 Fix: Jargon Awareness nos Specialist Prompts

## 🐛 Problema Identificado

**Sintoma**: Dr. Strategy (e outros especialistas) faziam perguntas com **jargão técnico** para personas **não-técnicas**:

### Exemplo do Problema:
```
Persona: Board Member / C-Level Executive (NÃO técnico)
Especialista: Dr. Strategy

❌ Pergunta ERRADA:
"Considerando o setor de varejo, quais são seus 2-3 principais competidores
diretos e qual a diferença atual em velocidade de entrega de features entre
vocês e eles? Precisamos entender se o cycle time de 14 dias está criando
uma desvantagem competitiva significativa no mercado."

Problemas:
- "cycle time de 14 dias" → Termo técnico
- "entrega de features" → Jargão de engenharia
- Board Member NÃO entende esses termos
```

### Exemplo Correto:
```
✅ Pergunta CORRETA para Board Member:
"Considerando o setor de varejo, quais são seus 2-3 principais competidores
diretos? Eles são mais rápidos em lançar novidades no mercado? Se sim, isso
tem impactado sua participação de mercado ou receita?"

Correções:
- "cycle time" → "velocidade de lançamento"
- "entrega de features" → "lançar novidades"
- Foco em impacto de negócio (mercado, receita)
```

---

## ✅ Solução Implementada

### 1. **Adicionado Contexto de Persona ao System Prompt**

Cada especialista agora recebe informação sobre **quem é o interlocutor**:

```typescript
// Em generateSpecialistSystemPrompt():
const { persona } = assessmentData;

const basePrompt = `
...
## Perfil do Interlocutor
${getPersonaDescription(persona)}
...
`;
```

### 2. **Função `getPersonaDescription()`**

Descreve cada persona para o especialista:

```typescript
function getPersonaDescription(persona: UserPersona): string {
  switch (persona) {
    case 'board-executive':
      return '**Board Member / C-Level Executive** - Foco em estratégia de negócio, ROI, impacto competitivo. NÃO é técnico.';
    case 'finance-ops':
      return '**Finance / Operations Leader** - Foco em custos, orçamento, eficiência operacional. Entende métricas de negócio, mas NÃO é técnico.';
    case 'product-business':
      return '**Product / Business Leader** - Foco em produto, mercado, experiência do cliente. Entende negócio, mas NÃO é técnico.';
    case 'engineering-tech':
      return '**Engineering / Tech Leader** - CTO, VP Engineering. TÉCNICO - pode usar jargão de engenharia livremente.';
    case 'it-devops':
      return '**IT / DevOps Manager** - Foco em infraestrutura, operações, automação. TÉCNICO - familiarizado com termos técnicos.';
  }
}
```

### 3. **Seção "LINGUAGEM E JARGÃO" no System Prompt**

Adicionada nova seção com **guidelines explícitas** sobre linguagem:

```typescript
# LINGUAGEM E JARGÃO
${getJargonGuidelines(specialistType, persona)}
```

### 4. **Função `getJargonGuidelines()`**

Define regras específicas por **especialista + persona**:

#### Dr. Strategy (Estratégia) - Persona NÃO-técnica:
```
**LINGUAGEM EXECUTIVA - SEM JARGÃO TÉCNICO**:
❌ NUNCA USE: "cycle time", "deployment frequency", "CI/CD", "technical debt", "code coverage", "merge conflicts"
✅ USE SEMPRE: "velocidade de lançamento de produtos", "agilidade competitiva", "tempo para mercado", "capacidade de inovação", "riscos operacionais"

Perguntas devem ser de ALTO NÍVEL: competitividade, market share, timing estratégico, impacto no cliente, reputação da marca.

EXEMPLOS CORRETOS para executivos:
- "Seus principais competidores são mais rápidos em lançar novidades? Isso impacta sua receita?"
- "Quanto tempo leva para uma nova ideia chegar ao mercado comparado aos concorrentes?"
- "Clientes mencionam que a empresa está ficando para trás tecnologicamente?"
```

#### Dr. Strategy - Persona TÉCNICA:
```
**LINGUAGEM ESTRATÉGICA COM CONTEXTO TÉCNICO**:
Pode mencionar conceitos técnicos quando necessário, mas sempre no contexto de impacto estratégico (competitividade, market share, timing).
```

#### Dr. ROI (Finance) - Persona NÃO-técnica:
```
**LINGUAGEM DE NEGÓCIO**:
❌ EVITE: Jargão técnico como "deployment frequency", "cycle time", "velocity"
✅ USE: "frequência de lançamentos", "tempo de entrega", "produtividade do time"

Foque em métricas financeiras: custos (R$), ROI (%), payback (meses), savings projetados.
```

#### Dr. Tech (Engineering) - Persona NÃO-técnica:
```
**EVITE JARGÃO TÉCNICO**:
❌ NÃO USE: "CI/CD", "deployment pipeline", "merge conflicts", "technical debt", "code coverage", "refactoring"
✅ USE INSTEAD: "automação de entregas", "processo de lançamento", "problemas de integração", "limitações técnicas acumuladas", "cobertura de qualidade", "modernização do código"

Seu interlocutor NÃO é técnico. Traduza conceitos técnicos para linguagem de negócio.
```

---

## 📊 Matriz de Jargão por Especialista x Persona

| Especialista | Persona Técnica | Persona Não-Técnica |
|--------------|-----------------|---------------------|
| **Dr. Tech (Engineering)** | ✅ Jargão técnico livre | ❌ Traduzir para negócio |
| **Dr. ROI (Finance)** | ⚠️ Misto (técnico + financeiro) | ✅ Só métricas de negócio |
| **Dr. Strategy** | ⚠️ Técnico em contexto estratégico | ❌ Alto nível executivo |

---

## 🧪 Exemplos de Perguntas Corretas

### Cenário 1: Board Executive + Dr. Strategy

**Contexto**: CEO de empresa de varejo, cycle time 14 dias

❌ **ANTES (Errado)**:
> "Qual a diferença em velocidade de entrega de features entre vocês e competidores? O cycle time de 14 dias está criando desvantagem competitiva?"

✅ **DEPOIS (Correto)**:
> "Seus principais competidores são mais rápidos em lançar novidades no mercado? Se sim, isso tem impactado sua participação de mercado ou causado perda de clientes?"

### Cenário 2: Board Executive + Dr. ROI

❌ **ANTES (Errado)**:
> "Qual o custo estimado de bugs em produção considerando o atual deployment frequency?"

✅ **DEPOIS (Correto)**:
> "Quanto a empresa gasta por mês corrigindo problemas que afetam clientes? Consegue estimar o impacto em receita de incidentes recentes?"

### Cenário 3: Engineering Leader + Dr. Strategy

**Contexto**: CTO, pode usar jargão técnico

✅ **Correto**:
> "Considerando seu cycle time de 14 dias vs competidores com deploy diário, qual o impacto em time-to-market de features competitivas? Há casos recentes onde perderam oportunidades por lançar atrasado?"

*Note*: Usa "cycle time" e "deploy" porque persona é técnica

### Cenário 4: Finance Leader + Dr. ROI

❌ **ANTES (Errado)**:
> "Qual o custo de technical debt no backlog? Percentual do sprint dedicado a refactoring?"

✅ **DEPOIS (Correto)**:
> "Que percentual do orçamento de TI é gasto 'consertando' sistemas legados vs construindo coisas novas? Consegue quantificar o custo de oportunidade?"

---

## 🔧 Alterações Técnicas

### Arquivos Modificados

**`lib/prompts/specialist-prompts.ts`**:
1. ✅ Importado `UserPersona` type
2. ✅ Adicionado `persona` no destructuring de `assessmentData`
3. ✅ Criado função `getPersonaDescription(persona: UserPersona)`
4. ✅ Criado função `getJargonGuidelines(specialistType, persona)`
5. ✅ Adicionado seção "Perfil do Interlocutor" no prompt
6. ✅ Adicionado seção "LINGUAGEM E JARGÃO" no prompt

### Código Adicionado

```typescript
// Import
import { AssessmentData, UserPersona } from '../types';

// No generateSpecialistSystemPrompt():
const { companyInfo, currentState, goals, persona } = assessmentData;

// No prompt:
## Perfil do Interlocutor
${getPersonaDescription(persona)}

# LINGUAGEM E JARGÃO
${getJargonGuidelines(specialistType, persona)}
```

### Build Status

```bash
npm run build
✓ Compiled successfully
✓ All types valid
✓ No errors
```

---

## 🎯 Impacto Esperado

### Antes da Fix:
- ❌ Perguntas técnicas para executivos
- ❌ Confusão e baixa qualidade de respostas
- ❌ Frustração do usuário
- ❌ Percepção: "AI não entende meu contexto"

### Depois da Fix:
- ✅ Perguntas apropriadas para cada persona
- ✅ Executivos entendem e respondem melhor
- ✅ Qualidade de insights aumenta
- ✅ Percepção: "AI realmente me entende"

---

## 📋 Checklist de Validação

### QA Manual Necessário:

**Teste 1: Board Executive + Dr. Strategy**
- [ ] Iniciar assessment como Board Member
- [ ] Selecionar Dr. Strategy
- [ ] Verificar: Perguntas SEM jargão técnico
- [ ] Verificar: Foco em competitividade, receita, mercado

**Teste 2: Board Executive + Dr. ROI**
- [ ] Mesma persona
- [ ] Selecionar Dr. ROI (Finance)
- [ ] Verificar: Métricas financeiras (R$, %, meses)
- [ ] Verificar: SEM termos como "cycle time", "velocity"

**Teste 3: Engineering Leader + Dr. Tech**
- [ ] Iniciar como Engineering / Tech Leader
- [ ] Selecionar Dr. Tech
- [ ] Verificar: PODE usar jargão técnico
- [ ] Verificar: Perguntas sobre CI/CD, deployment, etc.

**Teste 4: Finance Leader + Dr. ROI**
- [ ] Iniciar como Finance / Operations
- [ ] Selecionar Dr. ROI
- [ ] Verificar: Linguagem de negócio (não técnica)
- [ ] Verificar: Foco em custos, ROI, payback

---

## 🔮 Melhorias Futuras

### Prioridade 1 (Próxima Sprint):
- [ ] A/B test: medir qualidade das respostas com novo prompt
- [ ] Adicionar mais exemplos de perguntas corretas no prompt
- [ ] Criar glossário de traduções técnico → negócio

### Prioridade 2:
- [ ] Feedback loop: especialista ajusta linguagem se detectar confusão
- [ ] "Explain this to me" button: usuário pode pedir tradução
- [ ] Analytics: track jargon violations em produção

### Prioridade 3:
- [ ] Multi-language jargon guidelines
- [ ] Industry-specific terminology (fintech, healthcare, etc.)
- [ ] Adaptive language: AI aprende o nível técnico do usuário

---

## 📊 Métricas de Sucesso

### Semana 1:
- [ ] Zero menções de "cycle time" para Board Members
- [ ] Zero menções de "deployment" para Finance Leaders
- [ ] Qualitative feedback: "perguntas fazem sentido"

### Semana 2:
- [ ] Taxa de respostas completas aumenta >20%
- [ ] Duração média da consulta diminui (menos confusão)
- [ ] NPS da consulta AI aumenta

### Mês 1:
- [ ] Quality score dos insights aumenta (avaliado por sales team)
- [ ] Conversion rate de consulta → demo aumenta
- [ ] Feedback: "AI entende meu contexto de negócio"

---

## 🙏 Créditos

**Problema Reportado Por**: User feedback
**Issue**: Jargão técnico em perguntas para executivos
**Root Cause**: Specialist prompts não consideravam persona do usuário
**Solução**: Context-aware language guidelines no system prompt

---

**Status**: ✅ **FIXED & DEPLOYED**
**Build**: ✅ Passing
**QA**: ⚠️ Manual testing needed
**Priority**: 🔴 **HIGH** (user-facing quality issue)

---

**Last Updated**: Janeiro 2025
**Version**: 2.0.1 - Jargon Fix
**Related Docs**:
- `docs/PHASE2_MULTI_SPECIALIST.md`
- `SPRINT2_SUMMARY.md`
