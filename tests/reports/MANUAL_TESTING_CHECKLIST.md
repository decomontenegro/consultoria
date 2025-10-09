# Checklist de Testes Manuais - Correções P0/P1

**Data:** 2025-10-09
**Objetivo:** Validar correções críticas implementadas
**Estimativa de Tempo:** 30-40 minutos (5-8 minutos por persona)

---

## 🎯 O Que Foi Corrigido

### ✅ Bug #1: Validação de Jargão em Tempo Real
**Arquivo:** `app/api/consult/route.ts`
- Detecta e substitui automaticamente termos técnicos inadequados
- Board Executive: "débito técnico" → "limitações do sistema"
- Finance/Ops: "CI/CD" → "automação de processos"

### ✅ Bug #2: Filtro de Urgência nos Tópicos
**Arquivo:** `lib/prompts/topic-generator.ts`
- Timeline 3 meses → 3 tópicos focados (quick wins)
- Timeline 6 meses → 5 tópicos (quick wins primeiro)
- Timeline 12-18 meses → 6 tópicos (todos)

### ✅ Melhoria #1: Labels Sanitizados
**Arquivo:** `lib/prompts/topic-generator.ts`
- Labels de tópicos adaptados por persona
- Board: "AI" → "inteligência artificial", "bugs" → "problemas de qualidade"

---

## 📋 Checklist de Testes

### Teste 1: Board Executive (Não-Técnico, Estratégico)

**Setup:**
- Persona: `Board Member / C-Level Executive`
- Empresa: Scaleup, Tecnologia, 100-500M
- Timeline: **3 meses** (urgente)
- Pain points: "Alta taxa de bugs", "Entrega lenta de features"

**Validações:**

#### Tópicos Sugeridos
- [ ] **Quantidade:** Mostra 3 tópicos (não 6)?
- [ ] **Urgência:** Tópicos marcados como "Quick win para timeline de 3 meses"?
- [ ] **Labels sem jargão:**
  - [ ] NÃO mostra "AI", "bugs", "deployment"
  - [ ] MOSTRA "inteligência artificial", "problemas de qualidade", "lançamento"

#### Conversa AI
- [ ] **Perguntas estratégicas:**
  - [ ] Foca em competitividade, ROI, market share?
  - [ ] Evita termos como "débito técnico", "CI/CD", "pipeline"?
  - [ ] Usa "tempo de lançamento", "eficiência operacional"?

- [ ] **Sanitização automática:**
  - Se Claude usar jargão, sistema substitui automaticamente?
  - Verificar logs no console: `⚠️  Jargão detectado e replaced for board-executive`

**Score:** ✅ / ❌

**Violações Encontradas:**
- [ ] Nenhuma
- [ ] Liste aqui: _____________________

---

### Teste 2: Finance/Ops (Não-Técnico, Numérico)

**Setup:**
- Persona: `Finance / Operations Executive`
- Timeline: **6 meses**
- Pain points: "Baixa produtividade dev", "Custos operacionais elevados"

**Validações:**

#### Tópicos Sugeridos
- [ ] **Quantidade:** Mostra 5 tópicos (não 3 nem 6)?
- [ ] **Quick wins primeiro:** Quick wins aparecem antes dos outros?
- [ ] **Labels sem jargão:**
  - [ ] NÃO mostra termos como "merge conflicts", "refactoring"
  - [ ] MOSTRA "conflitos no processo", "reestruturação"

#### Conversa AI
- [ ] **Perguntas focadas em custo:**
  - [ ] Menciona R$, custos, desperdício, ROI?
  - [ ] Evita jargão como "technical debt"?
  - [ ] Usa "passivo técnico" ou "limitações" quando apropriado?

**Score:** ✅ / ❌

**Violações:**
- [ ] Nenhuma
- [ ] Liste aqui: _____________________

---

### Teste 3: Product/Business (Híbrido, Time-to-Market)

**Setup:**
- Persona: `Product / Business Leader`
- Timeline: **12 meses**
- Goals: "Acelerar time-to-market", "Habilitar inovação de produto"

**Validações:**

#### Tópicos Sugeridos
- [ ] **Quantidade:** Mostra 6 tópicos (timeline longo)?
- [ ] **Sem filtro urgente:** Mostra todos os tópicos disponíveis?
- [ ] **Labels adaptados:**
  - [ ] "deployment" → "lançamento"?
  - [ ] "code" → "desenvolvimento"?

#### Conversa AI
- [ ] **Foco em produto:**
  - [ ] Menciona features, clientes, mercado?
  - [ ] Evita detalhes de infraestrutura?
  - [ ] Equilibra entre negócio e técnico?

**Score:** ✅ / ❌

**Violações:**
- [ ] Nenhuma
- [ ] Liste aqui: _____________________

---

### Teste 4: Engineering/Tech (Técnico, Profundo)

**Setup:**
- Persona: `Engineering / Tech Leader`
- Timeline: **3 meses** (urgente mas técnico)
- Pain points: "Acúmulo de débito técnico", "Ciclos longos de code review"

**Validações:**

#### Tópicos Sugeridos
- [ ] **Quantidade:** Mostra 3 tópicos (urgência)?
- [ ] **Labels técnicos OK:** PODE mostrar "AI", "deployment", "bugs"?
- [ ] **Sem sanitização:** Labels mantêm termos técnicos originais?

#### Conversa AI
- [ ] **Profundidade técnica:**
  - [ ] USA jargão técnico livremente (débito técnico, CI/CD, pipeline)?
  - [ ] Faz perguntas detalhadas sobre stack, arquitetura?
  - [ ] **NÃO** sanitiza respostas (engenheiro pode ver termos técnicos)?

**Score:** ✅ / ❌

**Notas:**
- [ ] CTO sentiu que perguntas foram profundas o suficiente?
- [ ] Melhorias sugeridas: _____________________

---

### Teste 5: IT/DevOps (Técnico, Operacional)

**Setup:**
- Persona: `IT / DevOps Manager`
- Timeline: **6 meses**
- Pain points: "Processos manuais", "Alta taxa de incidentes"

**Validações:**

#### Tópicos Sugeridos
- [ ] **Quantidade:** Mostra 5 tópicos?
- [ ] **Labels técnicos OK:** Mantém termos operacionais?
- [ ] **Quick wins:** Prioriza automação rápida?

#### Conversa AI
- [ ] **Foco operacional:**
  - [ ] Menciona processos, automação, confiabilidade?
  - [ ] Usa termos DevOps (deploy, pipeline, infraestrutura)?
  - [ ] Foca em firefighting, SLA, uptime?

**Score:** ✅ / ❌

**Notas:**
- [ ] Lista de melhorias: _____________________

---

## 📊 Resumo dos Resultados

### Estatísticas Gerais

| Persona | Passou? | Violações | Score |
|---------|---------|-----------|-------|
| Board Executive | ✅/❌ | 0 | /100 |
| Finance/Ops | ✅/❌ | 0 | /100 |
| Product/Business | ✅/❌ | 0 | /100 |
| Engineering/Tech | ✅/❌ | 0 | /100 |
| IT/DevOps | ✅/❌ | 0 | /100 |
| **TOTAL** | **X/5** | **0** | **/500** |

### Critérios de Sucesso

**✅ APROVADO se:**
- Board/Finance: 0 violações de jargão
- Timeline 3 meses: Mostra 3 tópicos focados
- Timeline 6 meses: Mostra 5 tópicos
- Labels sanitizados para não-técnicos
- Engineering/DevOps: Mantém jargão técnico

**⚠️  REVISAR se:**
- 1-2 violações de jargão em Board/Finance
- Quantidade de tópicos incorreta
- Labels ainda têm jargão

**❌ FALHOU se:**
- 3+ violações de jargão
- Lógica de urgência não funciona
- Sanitização quebrou algo

---

## 🐛 Reportar Problemas

Se encontrar problemas, documente:

### Problema #1
**Persona:** _____
**Tipo:** Jargão / Tópicos / Labels / Outro
**Descrição:** _____
**Esperado:** _____
**Obtido:** _____
**Severidade:** P0 / P1 / P2

### Problema #2
...

---

## 🎯 Próximos Passos Após Testes

### Se 5/5 passaram ✅
- [ ] Marcar correções como validadas
- [ ] Fazer deploy para staging/produção
- [ ] Monitorar logs de jargão em produção

### Se 3-4/5 passaram ⚠️
- [ ] Revisar violações específicas
- [ ] Ajustar mapeamentos de jargão
- [ ] Re-testar personas afetadas

### Se <3/5 passaram ❌
- [ ] Revisar lógica implementada
- [ ] Debugar com console.log
- [ ] Considerar rollback se crítico

---

**Testador:** ___________________
**Data:** 2025-10-__
**Tempo Total:** ___ minutos
**Status Final:** ✅ Aprovado / ⚠️  Revisar / ❌ Falhou
