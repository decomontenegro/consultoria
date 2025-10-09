# 🎨 Sprint 2 - Guia de Implementação (UX Improvements)

**Tempo Estimado:** 4-6 horas
**Objetivo:** Melhorar experiência do usuário durante a consulta AI

---

## 📋 Tarefas

### ✅ Tarefa 1: Modo Deep-Dive para Engineering/DevOps (2h)

**Problema:** CTOs e DevOps Managers podem achar perguntas superficiais

**Solução:** Adicionar modo "deep-dive" que faz perguntas técnicas profundas

#### Arquivo: `lib/prompts/consultation-prompt.ts`

**Localização:** Linha ~150 (final da função `generateConsultationSystemPrompt`)

**Código para adicionar:**

```typescript
// ANTES DO return final, adicionar:

// Deep-dive mode for technical personas
if (persona === 'engineering-tech' || persona === 'it-devops') {
  const deepDivePrompt = `

## 🔬 MODO DEEP DIVE TÉCNICO ATIVADO

Você deve fazer perguntas técnicas **profundas e específicas** com este perfil:

### Características das Perguntas:
- **Métricas específicas:** Números, percentuais, frequências
- **Ferramentas concretas:** Nomes de tecnologias, frameworks, plataformas
- **Processos detalhados:** Passos, integrações, fluxos
- **Problemas reais:** Casos de uso, desafios técnicos específicos

### Exemplos de Perguntas Deep-Dive:

**Para Engineering:**
- "Qual a taxa de falha de builds no CI? Quais são as 3 principais causas?"
- "Tempo médio de rollback em produção? O processo é automatizado ou manual?"
- "Vocês usam feature flags? Como é o fluxo: flag → canary → rollout completo?"
- "Qual percentual do backlog é débito técnico vs features? Meta desejada?"
- "Code coverage atual? Meta? Ferramentas usadas (Jest, Pytest, etc)?"

**Para DevOps:**
- "Quantos incidentes de produção por mês? MTTR médio?"
- "Deploy pipeline: quantas etapas? Tempo total? Gargalos?"
- "Observability: qual stack? (Datadog, New Relic, Prometheus?)"
- "IaC: Terraform, CloudFormation, outro? Percentual de infra como código?"
- "On-call rotation: quantas pessoas? Frequência de páginas?"

### Tom e Profundidade:
- Use jargão técnico LIVREMENTE (não sanitize)
- Assuma conhecimento técnico profundo
- Explore detalhes de implementação
- Pergunte sobre trade-offs e decisões arquiteturais
- Conecte com métricas DORA (deployment frequency, lead time, MTTR, change failure rate)

### O Que Evitar:
- ❌ Perguntas genéricas ("Como está o deploy?")
- ❌ Superficialidade ("Vocês usam CI/CD?")
- ✅ Perguntas específicas ("Qual ferramenta de CI/CD? GitHub Actions, Jenkins, CircleCI? Taxa de falha?")
`;

  return systemPrompt + deepDivePrompt;
}

return systemPrompt;
```

#### Como Testar:

1. Fazer assessment como **Engineering / Tech Leader**
2. No Step 5, verificar se perguntas são:
   - Específicas (com métricas)
   - Técnicas (com nomes de ferramentas)
   - Profundas (exploram detalhes)

**Exemplo esperado:**
> "Qual a taxa de falha de builds no seu pipeline de CI? Quais são as 3 principais causas de falha?"

**Não esperado:**
> "Como está o processo de CI/CD?"

---

### ✅ Tarefa 2: Indicador de Progresso (1h)

**Problema:** Usuário não sabe quantas perguntas respondeu

**Solução:** Adicionar barra de progresso visual

#### Arquivo: `components/assessment/Step5AIConsult.tsx`

**Localização:** Dentro do `return` da Phase 2 (conversation), logo após o título

**Código para adicionar:**

```tsx
{/* Progress Indicator - Adicionar após o título "Conversa com Consultor" */}
{phase === 'conversation' && (
  <div className="mb-6 p-4 bg-tech-gray-900/50 border border-tech-gray-800 rounded-lg">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm font-medium text-tech-gray-300">
        Progresso da Consulta
      </span>
      <span className="text-xs text-tech-gray-400">
        {messages.filter(m => m.role === 'user').length}/3+ perguntas respondidas
      </span>
    </div>

    {/* Progress Bar */}
    <div className="w-full bg-tech-gray-800 rounded-full h-2.5 overflow-hidden">
      <div
        className="bg-gradient-to-r from-neon-green to-neon-cyan h-2.5 rounded-full transition-all duration-500 ease-out"
        style={{
          width: `${Math.min((messages.filter(m => m.role === 'user').length / 3) * 100, 100)}%`
        }}
      />
    </div>

    {messages.filter(m => m.role === 'user').length >= 3 && (
      <p className="mt-3 text-xs text-neon-green flex items-center gap-1">
        <span className="inline-block w-2 h-2 bg-neon-green rounded-full animate-pulse"></span>
        Você já pode finalizar a consulta quando quiser
      </p>
    )}
  </div>
)}
```

#### Como Testar:

1. Fazer assessment completo até Step 5
2. Responder 1 pergunta → ver barra em ~33%
3. Responder 2 perguntas → ver barra em ~66%
4. Responder 3 perguntas → ver barra em 100% + mensagem verde

---

### ✅ Tarefa 3: Resumo de Tópicos Discutidos (1-2h)

**Problema:** Usuário não tem clareza sobre o que foi coberto

**Solução:** Mostrar lista de tópicos discutidos antes de finalizar

#### Parte 1: Tracking de Tópicos (State)

**Arquivo:** `components/assessment/Step5AIConsult.tsx`

**Localização:** Nos estados (linha ~30)

**Adicionar state:**

```typescript
const [discussedTopics, setDiscussedTopics] = useState<string[]>([]);
```

#### Parte 2: Detectar Tópicos na Conversa

**Localização:** Dentro da função que envia mensagem (handleSendMessage)

**Adicionar lógica:**

```typescript
// Após adicionar mensagem do usuário, analisar qual tópico foi discutido
const detectTopicFromConversation = (userMessage: string, aiResponse: string) => {
  const topicKeywords = {
    'quality-impact': ['qualidade', 'bugs', 'problemas', 'defeitos'],
    'speed-innovation': ['velocidade', 'lento', 'rápido', 'time-to-market', 'agilidade'],
    'ai-barriers': ['AI', 'inteligência artificial', 'automação', 'ferramentas', 'adoção'],
    'roi-expectations': ['ROI', 'retorno', 'investimento', 'custo', 'benefício'],
    'team-capacity': ['time', 'equipe', 'capacidade', 'produtividade', 'pessoas'],
    'strategic-risks': ['risco', 'competitivo', 'mercado', 'concorrentes', 'estratégia'],
  };

  const topicLabels = {
    'quality-impact': 'Impacto de Problemas de Qualidade',
    'speed-innovation': 'Velocidade de Inovação',
    'ai-barriers': 'Barreiras para Adoção de AI',
    'roi-expectations': 'ROI e Investimento',
    'team-capacity': 'Capacidade do Time',
    'strategic-risks': 'Riscos Estratégicos',
  };

  const conversationText = (userMessage + ' ' + aiResponse).toLowerCase();

  Object.entries(topicKeywords).forEach(([topicId, keywords]) => {
    const matched = keywords.some(keyword => conversationText.includes(keyword.toLowerCase()));

    if (matched && !discussedTopics.includes(topicLabels[topicId as keyof typeof topicLabels])) {
      setDiscussedTopics(prev => [...prev, topicLabels[topicId as keyof typeof topicLabels]]);
    }
  });
};

// Chamar após receber resposta do Claude
detectTopicFromConversation(newUserMessage, aiResponse);
```

#### Parte 3: Mostrar Resumo

**Localização:** No banner "ready-to-finish"

**Substituir banner atual por:**

```tsx
{phase === 'ready-to-finish' && (
  <div className="mb-6 p-6 bg-gradient-to-br from-neon-cyan/10 to-neon-green/10 border border-neon-cyan/30 rounded-xl">
    <div className="flex items-start gap-4 mb-4">
      <div className="flex-shrink-0 w-10 h-10 bg-neon-cyan/20 rounded-full flex items-center justify-center">
        <span className="text-neon-cyan text-xl">✓</span>
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-neon-cyan mb-2">
          Ótimo progresso! Já coletei informações valiosas.
        </h4>
        <p className="text-sm text-tech-gray-300">
          Você já respondeu {messages.filter(m => m.role === 'user').length} perguntas e
          exploramos {discussedTopics.length} tópico{discussedTopics.length !== 1 ? 's' : ''} importantes.
        </p>
      </div>
    </div>

    {/* Topics Discussed */}
    {discussedTopics.length > 0 && (
      <div className="mb-4 p-3 bg-tech-gray-900/50 rounded-lg">
        <h5 className="text-xs font-semibold text-tech-gray-400 mb-2 uppercase tracking-wide">
          Tópicos Discutidos:
        </h5>
        <ul className="space-y-1.5">
          {discussedTopics.map((topic, idx) => (
            <li key={idx} className="text-sm text-tech-gray-200 flex items-center gap-2">
              <span className="text-neon-green text-xs">✓</span>
              {topic}
            </li>
          ))}
        </ul>
      </div>
    )}

    <div className="flex gap-3">
      <button
        onClick={handleGenerateReport}
        className="flex-1 px-4 py-3 bg-gradient-to-r from-neon-green to-neon-cyan text-background-dark font-semibold rounded-lg hover:shadow-neon-green transition-all"
      >
        Gerar Relatório Agora
      </button>
      <button
        onClick={() => setPhase('conversation')}
        className="px-4 py-3 border-2 border-neon-cyan/30 text-neon-cyan font-semibold rounded-lg hover:bg-neon-cyan/10 transition-all"
      >
        Continuar Conversando
      </button>
    </div>

    <p className="mt-3 text-xs text-center text-tech-gray-500">
      Você pode explorar outros tópicos ou finalizar aqui. Você está no controle.
    </p>
  </div>
)}
```

#### Como Testar:

1. Fazer assessment até Step 5
2. Responder 3+ perguntas sobre diferentes tópicos
3. Ver banner aparecer com:
   - Lista de tópicos discutidos (com checkmarks)
   - 2 botões: "Gerar Relatório" e "Continuar"
4. Verificar que detecta tópicos corretamente

---

## 🧪 Ordem Recomendada de Implementação

### Opção 1: Implementar Tudo de Uma Vez (4-6h)

1. Tarefa 1: Deep-dive (2h)
2. Tarefa 2: Progress indicator (1h)
3. Tarefa 3: Resumo de tópicos (1-2h)
4. Testar tudo junto (30min)
5. Commit e push

### Opção 2: Implementar Incremental

**Dia 1:**
- Tarefa 2: Progress indicator (1h) - Mais simples
- Testar e commit

**Dia 2:**
- Tarefa 1: Deep-dive (2h) - Impacto maior
- Testar e commit

**Dia 3:**
- Tarefa 3: Resumo de tópicos (1-2h) - Mais complexa
- Testar e commit

---

## 📊 Critérios de Sucesso

### Deep-Dive Mode
- [ ] Engineering/DevOps recebem perguntas com métricas específicas
- [ ] Perguntas mencionam nomes de ferramentas
- [ ] CTOs avaliam como "profundas" (feedback subjetivo)

### Progress Indicator
- [ ] Barra aparece e atualiza a cada pergunta
- [ ] Mostra X/3+ perguntas
- [ ] Mensagem verde aparece após 3 perguntas

### Resumo de Tópicos
- [ ] Detecta pelo menos 2-3 tópicos durante conversa
- [ ] Lista aparece no banner "ready-to-finish"
- [ ] Checkmarks verdes ao lado de cada tópico
- [ ] Usuário entende o que foi coberto

---

## 🚀 Como Executar

Quando decidir implementar Sprint 2:

```bash
# 1. Criar branch para Sprint 2
git checkout -b feature/sprint-2-ux-improvements

# 2. Implementar tarefas 1, 2 e 3

# 3. Testar localmente
npm run dev
# Testar cada funcionalidade

# 4. Commit
git add -A
git commit -m "✨ Sprint 2: UX Improvements (Deep-dive + Progress + Summary)

- Modo deep-dive para Engineering/DevOps
- Indicador de progresso visual
- Resumo de tópicos discutidos

Estimativa: 4-6h
Testes: Manuais OK"

# 5. Merge para client-consult-v2
git checkout client-consult-v2
git merge feature/sprint-2-ux-improvements
git push origin client-consult-v2

# 6. Testar em staging antes de main
```

---

## 📝 Notas

- Cada tarefa é independente (pode implementar uma de cada vez)
- Tarefa 2 (Progress) é a mais simples - começar por ela
- Tarefa 1 (Deep-dive) tem maior impacto para CTOs
- Tarefa 3 (Resumo) é a mais complexa mas melhora muito UX

**Prioridade se tiver pouco tempo:**
1. Deep-dive (maior impacto)
2. Progress indicator (mais visível)
3. Resumo de tópicos (nice to have)

---

**Documentos Relacionados:**
- Análise UX: `tests/reports/UX_ANALYSIS_REPORT.md`
- Correções P0/P1: `tests/reports/SUMMARY_CORRECTIONS_P0_P1.md`
