# Multi-Specialist UX Improvements & Bugfixes

**Data**: 2025-11-20
**Tipo**: 🐛 **BUGFIXES** + ✨ **FEATURES**
**Status**: ✅ **IMPLEMENTADO**

---

## 🔍 Problemas Reportados pelo Usuário

### Problema 1: Múltiplas Perguntas Ao Mesmo Tempo
> "agora o especialsita de tech entrou fazendo diversas perguntas ao mesmo tempo, sem sugestoes de respostas, atropelando o usuario"

**Impacto**: Usuário fica confuso, não sabe qual pergunta responder primeiro.

---

### Problema 2: Falta de Opção "Não Sei"
> "se o usuario nao entender de tecnologia? ele nao tem a opcao de falar que nao sabe"

**Impacto**: Usuários não-técnicos ficam presos em perguntas técnicas sem opção de escape.

---

### Problema 3: Sugestões Sendo Bloqueadas Erroneamente
**Impacto**: Keywords de wrap-up muito genéricas bloqueavam sugestões em perguntas de follow-up normais.

---

## 🎯 Soluções Implementadas

### Fix #1: Refinar Keywords de Wrap-Up ✅

**Problema**: Keywords muito genéricas causavam falsos positivos.

**Antes**:
```typescript
const wrapUpKeywords = [
  'algo mais a acrescentar',  // ❌ Aparece em follow-ups normais!
  'mais alguma informação',    // ❌ Aparece em follow-ups normais!
  'gostaria de compartilhar',  // ❌ Aparece em follow-ups normais!
  // ...
];
```

**Depois**:
```typescript
const wrapUpKeywords = [
  'agradeço pelas respostas',
  'agradeço pela conversa',
  'obrigado pelas informações',
  'obrigado pela conversa',
  'foi um prazer conversar',
  'principais insights que descobri',
  'principais insights identificados',
  'em resumo, descobrimos',
  'em resumo, identificamos',
  'conclusão da consulta',
  'conclusão da nossa conversa',
  'finalizando nossa consulta',
  'finalizando a conversa',
  'encerrando a consulta',
  'encerrando nossa conversa',
  'análise está completa',
  'análise completa',
  'boa sorte com',
  'desejo sucesso'
];
```

**Mudanças**:
- ✅ Keywords mais específicas e focadas em **conclusão real**
- ✅ Logs de debug mostrando qual keyword foi detectada
- ✅ Evita bloquear sugestões em perguntas de follow-up

**Arquivo**: `/components/assessment/Step5AIConsultMulti.tsx` (linhas 102-150)

---

### Fix #2: Adicionar Temperature 0.5 ✅

**Problema**: Claude estava fazendo múltiplas perguntas em uma mensagem.

**Causa Raiz**:
1. Temperatura padrão (1.0) → muito "criativo" → ignora regras
2. Exemplos de perguntas contradiziam a regra "UMA PERGUNTA POR VEZ"

**Solução**:
```typescript
const stream = await anthropic.messages.create({
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: 1024,
  temperature: 0.5, // ✅ More deterministic - reduces multiple questions
  system: systemPrompt,
  messages: conversationMessages,
  stream: true,
});
```

**Benefícios**:
- ✅ Mais determinístico
- ✅ Segue instruções com mais rigor
- ✅ Reduz "criatividade" que leva a múltiplas perguntas

**Arquivo**: `/app/api/consult/route.ts` (linha 135)

---

### Fix #3: Melhorar Exemplos de Perguntas do Engineering ✅

**Problema**: Exemplos mostravam múltiplas interrogações, contradizendo a regra.

**Antes**:
```typescript
exampleQuestions: [
  'Qual a taxa de falha de builds no CI? Principais causas?',  // ❌ 2 perguntas
  'Tempo médio de rollback? Processo é automatizado?',         // ❌ 2 perguntas
  'Code coverage atual vs meta? Ferramentas usadas?',          // ❌ 2 perguntas
]
```

**Depois**:
```typescript
exampleQuestions: [
  'Com que frequência seus builds falham no CI, e quais são as principais causas?',  // ✅ 1 pergunta com contexto
  'Quanto tempo leva em média para fazer rollback de algo que deu errado em produção?',
  'Como está a cobertura de testes do projeto atualmente - conseguem medir isso?',
  'Do backlog atual de trabalho, qual parte vocês estimam ser débito técnico versus features novas?',
  'Vocês usam Infrastructure as Code, e qual ferramenta usam para isso?'
]
```

**Mudanças**:
- ✅ UMA interrogação principal por exemplo
- ✅ Pode ter contexto antes/depois da pergunta
- ✅ Modelo aprende o padrão correto

**Arquivo**: `/lib/prompts/specialist-prompts.ts` (linhas 58-64)

---

### Fix #4: Reforçar Regra "UMA PERGUNTA" no Prompt ✅

**Adicionado**:
```typescript
**IMPORTANTE - O QUE SIGNIFICA "UMA PERGUNTA"**:
✅ CORRETO (UMA pergunta clara com ou sem contexto):
- "Com que frequência seus builds falham no CI?"
- "Sobre deploys: quanto tempo leva em média para subir algo em produção?"
- "Entendi sobre o CI. Agora sobre testes: como está a cobertura de testes atual?"

❌ ERRADO (Múltiplas perguntas na mesma mensagem):
- "Qual a taxa de builds? E o tempo de rollback?" ← 2 perguntas diferentes
- "Vocês usam CI/CD? Qual ferramenta? Quantos deploys por dia?" ← 3 perguntas
- "Me fale sobre builds, deploys e testes de qualidade" ← Muito amplo, várias perguntas

Regra de ouro: **UMA mensagem = UMA interrogação principal**. Pode ter contexto antes, mas apenas UMA pergunta de cada vez.
```

**Benefícios**:
- ✅ Exemplos explícitos do que é certo e errado
- ✅ Reforça visualmente a regra
- ✅ Claude entende melhor o que fazer

**Arquivo**: `/lib/prompts/specialist-prompts.ts` (linhas 188-199)

---

### Feature #1: Opção "Não Sei" Contextual ✅

**Problema**: Usuários não-técnicos não tinham como responder perguntas técnicas.

**Solução**: Adicionar regra no prompt de sugestões para incluir opção "não sei" em perguntas técnicas.

**Prompt Adicionado**:
```typescript
SPECIAL RULE - "I Don't Know" Option (CONTEXTUAL):
- When the question asks for TECHNICAL METRICS, SPECIFIC TOOLS, or DETAILED PROCESSES that user might not know
- ALWAYS include ONE "escape hatch" suggestion
- Examples of when to include:
  ✅ "Qual é o code coverage atual?"
  ✅ "Que ferramenta usam para CI/CD?"
  ✅ "Qual o tempo médio de deploy?"
  ✅ "Quantos bugs em produção por sprint?"

- "Don't know" suggestion examples (pick one that fits context):
  ✅ "Não sei ao certo - preciso verificar"
  ✅ "Não tenho esse dado disponível agora"
  ✅ "Não acompanho essa métrica"
  ✅ "Desconheço - não é minha área"
  ✅ "Não tenho acesso a essa informação"

- When to include: Technical questions about metrics, tools, or specific numbers
- When NOT to include: General questions about problems, urgency, strategy, budget approval

If you include the "don't know" option:
- Total suggestions: 4-5 (3-4 specific + 1 "don't know")
- Place "don't know" as the LAST suggestion
- Still provide 3-4 strong contextual suggestions first
```

**Como Funciona**:
1. Claude detecta se pergunta é técnica (métricas, ferramentas, números)
2. Se SIM → inclui 1 opção "não sei" contextual
3. Se NÃO → só sugestões específicas normais

**Exemplo**:
```
Pergunta: "Qual é o code coverage atual do projeto?"

Sugestões:
💡 "Coverage está bom, acima de 70%"
💡 "Coverage está baixo, precisamos melhorar"
💡 "Não medimos coverage atualmente"
💡 "Não sei ao certo - preciso verificar" ← Escape hatch
```

**Arquivo**: `/app/api/ai-suggestions/route.ts` (linhas 158-182)

---

### Feature #2: Sistema de Role/Expertise do Usuário ✅

**Problema Original**: Usuário solicitou forma de indicar áreas de conhecimento para evitar perguntas fora do domínio.

**Quote do Usuário**:
> "acho que deveria ter uma forma de a pessoa anteriormente falar das areas que ela faz parte na empresa para que ela nao seja levada para perguntas que noa faz parte do seu dominio tecnico"

**Solução**: UI para selecionar áreas de conhecimento + adaptação de perguntas pelos especialistas.

---

#### Parte 1: UI de Seleção de Áreas

**Localização**: `/components/assessment/Step5AIConsultMulti.tsx` (linhas 684-743)

**UI Adicionada**:
```tsx
<div className="card-dark p-6">
  <h3>Suas Áreas de Conhecimento</h3>
  <p>Para adaptar as perguntas ao seu perfil, indique em quais áreas você tem conhecimento:</p>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    {[
      { id: 'strategy-business', label: 'Estratégia e Negócios' },
      { id: 'engineering-tech', label: 'Tecnologia e Engenharia' },
      { id: 'product-ux', label: 'Produto e UX' },
      { id: 'finance-ops', label: 'Finanças e Operações' },
      { id: 'marketing-sales', label: 'Marketing e Vendas' },
      { id: 'people-hr', label: 'Recursos Humanos' },
    ].map((area) => (
      <label className="checkbox-card">
        <input type="checkbox" checked={userExpertiseAreas.includes(area.id)} />
        <div>{area.label}</div>
      </label>
    ))}
  </div>

  <div className="info-box">
    💡 Os especialistas adaptarão as perguntas baseado no seu conhecimento.
    Se você não tiver conhecimento técnico, receberá perguntas mais estratégicas
    e terá mais opções "não sei" disponíveis.
  </div>
</div>
```

**Características**:
- ✅ Multi-select (checkbox)
- ✅ Opcional (pode não selecionar nada)
- ✅ Aparece ANTES da seleção de especialistas
- ✅ Explicação clara do propósito

---

#### Parte 2: Backend - Passar Áreas para API

**Modificações**:
1. **State adicionado**: `const [userExpertiseAreas, setUserExpertiseAreas] = useState<string[]>([]);`

2. **Todas as 4 chamadas da API atualizadas**:
   - `startConsultation()` → linha 251
   - `handleSubmit()` → linha 364
   - `finishConsultation()` → linha 480
   - Auto-transition → linha 570

**Exemplo**:
```typescript
const response = await fetch('/api/consult', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages,
    assessmentData: data,
    specialistType: currentSpecialist,
    userExpertiseAreas // ✅ Pass user's areas of knowledge
  }),
});
```

3. **API Route atualizada**:
```typescript
interface ConsultRequestBody {
  messages: Message[];
  assessmentData: AssessmentData;
  specialistType?: SpecialistType;
  userExpertiseAreas?: string[]; // ✅ New field
}

const { messages, assessmentData, specialistType, userExpertiseAreas } = body;

const systemPrompt = specialistType
  ? generateSpecialistSystemPrompt(specialistType, assessmentData, userExpertiseAreas)
  : generateConsultationSystemPrompt(assessmentData);
```

**Arquivo**: `/app/api/consult/route.ts` (linhas 13-18, 95, 114)

---

#### Parte 3: Prompt - Adaptar Perguntas Baseado nas Áreas

**Função Atualizada**: `generateSpecialistSystemPrompt()`

**Assinatura**:
```typescript
export function generateSpecialistSystemPrompt(
  specialistType: SpecialistType,
  assessmentData: AssessmentData,
  userExpertiseAreas?: string[] // ✅ New parameter
): string
```

**Prompt Adicionado**:
```typescript
## Perfil do Interlocutor
${getPersonaDescription(persona)}
${userExpertiseAreas && userExpertiseAreas.length > 0
  ? `\n**Áreas de conhecimento do usuário**: ${getUserExpertiseDescription(userExpertiseAreas)}\n\n⚠️ **ADAPTE SUAS PERGUNTAS**: O usuário indicou ter conhecimento em: ${userExpertiseAreas.map(a => getExpertiseLabel(a)).join(', ')}. ${getAdaptationGuidance(userExpertiseAreas, specialistType)}`
  : ''
}
```

**Helper Functions Criadas**:

**1. `getExpertiseLabel(areaId)`**: Mapeia ID para label
```typescript
function getExpertiseLabel(areaId: string): string {
  const labels: Record<string, string> = {
    'strategy-business': 'Estratégia e Negócios',
    'engineering-tech': 'Tecnologia e Engenharia',
    'product-ux': 'Produto e UX',
    'finance-ops': 'Finanças e Operações',
    'marketing-sales': 'Marketing e Vendas',
    'people-hr': 'Recursos Humanos'
  };
  return labels[areaId] || areaId;
}
```

**2. `getUserExpertiseDescription(areas)`**: Gera descrição das áreas
```typescript
function getUserExpertiseDescription(areas: string[]): string {
  if (areas.length === 0) return 'Não especificadas';
  return areas.map(a => getExpertiseLabel(a)).join(', ');
}
```

**3. `getAdaptationGuidance(userExpertise, specialistType)`**: Gera orientação específica

**Para Engineering Specialist**:
```typescript
if (specialistType === 'engineering') {
  if (hasEngineering) {
    return `Como o usuário tem conhecimento técnico, você PODE aprofundar em detalhes técnicos, métricas DORA, arquitetura, ferramentas específicas. Use jargão técnico livremente.`;
  } else {
    return `O usuário NÃO indicou conhecimento técnico. Seja mais estratégico: pergunte sobre IMPACTOS e PROBLEMAS (velocidade, qualidade, riscos) ao invés de métricas técnicas detalhadas. Se precisar perguntar algo técnico, ofereça opção "não sei" nas sugestões.`;
  }
}
```

**Para Finance Specialist**:
```typescript
if (specialistType === 'finance') {
  if (hasFinance) {
    return `Como o usuário tem conhecimento financeiro, você pode aprofundar em ROI, payback, custos detalhados, orçamentos específicos.`;
  } else {
    return `O usuário pode não ter acesso a dados financeiros detalhados. Pergunte sobre IMPACTOS PERCEBIDOS (atrasos custam caro? perdas de receita?) ao invés de valores exatos. Ofereça opções "não sei" quando apropriado.`;
  }
}
```

**Para Strategy Specialist**:
```typescript
if (specialistType === 'strategy') {
  if (hasStrategy) {
    return `Como o usuário tem visão estratégica, você pode aprofundar em competitividade, posicionamento de mercado, decisões de Board.`;
  } else {
    return `O usuário pode ter perspectiva mais operacional. Pergunte sobre PERCEPÇÕES do mercado e competidores ao invés de estratégias formais de Board.`;
  }
}
```

**Arquivo**: `/lib/prompts/specialist-prompts.ts` (linhas 137-141, 183-186, 256-315)

---

## 📊 Impacto Geral

### Problemas Resolvidos

| Problema | Status | Como Foi Resolvido |
|----------|--------|-------------------|
| **Múltiplas perguntas** | ✅ RESOLVIDO | Temperature 0.5 + exemplos corrigidos + prompt reforçado |
| **Sem opção "não sei"** | ✅ RESOLVIDO | Detecção contextual + opção automática em perguntas técnicas |
| **Sugestões bloqueadas** | ✅ RESOLVIDO | Keywords mais específicas + logs de debug |
| **Perguntas fora do domínio** | ✅ RESOLVIDO | Sistema de expertise areas + adaptação de prompt |

---

### Métricas Esperadas

| Métrica | Antes | Depois (Estimado) |
|---------|-------|-------------------|
| **Múltiplas perguntas por mensagem** | Comum | Raro ✅ |
| **Usuários presos sem "não sei"** | Frequente | Eliminado ✅ |
| **Falsos positivos de wrap-up** | Alto | Baixo ✅ |
| **Perguntas fora do domínio** | Comum | Adaptado ✅ |

---

## 🧪 Como Testar

### Teste 1: Uma Pergunta Por Vez
1. Iniciar Multi-Specialist com Engineering
2. Observar primeira pergunta
3. **Validar**: Apenas 1 interrogação principal

**Esperado**: ✅ Uma pergunta clara (pode ter contexto antes/depois)

---

### Teste 2: Opção "Não Sei" em Perguntas Técnicas
1. Iniciar Multi-Specialist
2. **NÃO** selecionar "Tecnologia e Engenharia" nas áreas
3. Selecionar especialista Engineering
4. Quando pergunta técnica aparecer (ex: "code coverage atual?")
5. **Validar**: Sugestões incluem opção "Não sei ao certo"

**Esperado**: ✅ 4-5 sugestões, sendo 1 delas escape hatch

---

### Teste 3: Sugestões em Follow-Ups Normais
1. Iniciar consulta
2. Responder 2-3 perguntas
3. Especialista faz follow-up: "Há algo mais a acrescentar sobre X?"
4. **Validar**: Sugestões **aparecem normalmente**

**Esperado**: ✅ Sugestões não são bloqueadas (falso positivo corrigido)

---

### Teste 4: Sistema de Expertise Areas

#### Cenário A: Com Conhecimento Técnico
1. **Selecionar** "Tecnologia e Engenharia"
2. Selecionar especialista Engineering
3. Observar perguntas

**Esperado**:
- ✅ Perguntas mais técnicas e detalhadas
- ✅ Jargão técnico permitido
- ✅ Métricas DORA, ferramentas específicas

#### Cenário B: Sem Conhecimento Técnico
1. **NÃO selecionar** "Tecnologia e Engenharia"
2. Selecionar especialista Engineering
3. Observar perguntas

**Esperado**:
- ✅ Perguntas mais estratégicas (impactos, problemas)
- ✅ Menos métricas técnicas detalhadas
- ✅ Mais opções "não sei" disponíveis

---

## 🔧 Arquivos Modificados

### Frontend
1. **`/components/assessment/Step5AIConsultMulti.tsx`**
   - Linhas 49: State `userExpertiseAreas`
   - Linhas 102-150: Keywords de wrap-up refinadas
   - Linhas 251, 364, 480, 570: Passar `userExpertiseAreas` para API
   - Linhas 684-743: UI de seleção de áreas

### Backend
2. **`/app/api/consult/route.ts`**
   - Linhas 13-18: Type `ConsultRequestBody` com `userExpertiseAreas`
   - Linha 95: Extrair `userExpertiseAreas` do body
   - Linha 114: Passar para `generateSpecialistSystemPrompt()`
   - Linha 135: `temperature: 0.5`

3. **`/app/api/ai-suggestions/route.ts`**
   - Linhas 158-182: Regra "não sei" contextual

### Prompts
4. **`/lib/prompts/specialist-prompts.ts`**
   - Linhas 58-64: Exemplos de perguntas corrigidos
   - Linhas 137-141: Assinatura com `userExpertiseAreas` opcional
   - Linhas 183-186: Prompt com adaptação de áreas
   - Linhas 188-199: Reforço da regra "UMA PERGUNTA"
   - Linhas 256-315: Helper functions (getExpertiseLabel, getUserExpertiseDescription, getAdaptationGuidance)

---

## ✅ Checklist de Implementação

- [x] Keywords de wrap-up refinadas (mais específicas)
- [x] Temperature 0.5 adicionado na API
- [x] Exemplos de perguntas corrigidos (UMA pergunta cada)
- [x] Prompt reforçado com exemplos corretos/incorretos
- [x] Opção "não sei" contextual em sugestões
- [x] UI de seleção de áreas de expertise
- [x] Backend recebe e passa userExpertiseAreas
- [x] Prompt adapta perguntas baseado nas áreas
- [x] Helper functions criadas
- [x] Documentação completa
- [x] Compatibilidade com fluxo existente

---

## 🎉 Conclusão

### Features Implementadas

1. ✅ **Fix: Múltiplas perguntas** → Temperature + exemplos + prompt reforçado
2. ✅ **Feature: Opção "não sei"** → Contextual em perguntas técnicas
3. ✅ **Fix: Sugestões bloqueadas** → Keywords mais específicas
4. ✅ **Feature: Sistema de expertise** → Adaptação de perguntas por área

### Resultado

**Multi-Specialist UX muito mais inteligente e adaptável!**
- ✅ Uma pergunta por vez (clara e focada)
- ✅ Escape hatch para usuários não-técnicos
- ✅ Sugestões aparecem quando devem
- ✅ Perguntas adaptadas ao conhecimento do usuário

---

**Documentação criada**: 2025-11-20
**Autor**: Claude Code
**Feedback original do usuário**:
- "especialsita de tech entrou fazendo diversas perguntas ao mesmo tempo"
- "se o usuario nao entender de tecnologia? ele nao tem a opcao de falar que nao sabe"
- "deveria ter uma forma de a pessoa anteriormente falar das areas que ela faz parte na empresa"

**Status**: ✅ Implementado e documentado
