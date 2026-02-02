# Manual Test Plan - Assessment com Todas as Personas

**Data:** 2025-11-21
**Objetivo:** Verificar que sistema funciona corretamente para TODAS as combinações de persona
**URL:** http://localhost:3003/assessment

---

## 🧪 Antes de Começar

### Preparação para Cada Teste

**Para cada cenário de teste:**
1. Abrir DevTools (F12)
2. Application → Storage → Clear site data
3. Recarregar página
4. Console → verificar logs do servidor no terminal

**Terminal para monitorar logs:**
```bash
# Em uma aba separada do terminal, observe os logs em tempo real
npm run dev
```

---

## Cenário 1: Persona de Negócios Puro (Board Executive)

### Setup
- **Step -2 - Expertise Selection:**
  - ✅ Marcar: "Produto/UX"
  - ✅ Marcar: "Estratégia/Negócios"
  - ❌ NÃO marcar: "Tecnologia/Programação"
  - ❌ NÃO marcar: "Infraestrutura/DevOps"

### Resultado Esperado

**Logs do servidor devem mostrar:**
```
🎯 [Adaptive] Persona selection: {
  userExpertise: ['product-ux', 'strategy-business'],
  inferred: 'board-executive'
}

🎯 [Router v2] Filtered questions by persona: {
  persona: 'board-executive',
  totalInBlock: 13,
  afterPersonaFilter: 5
}
```

**Perguntas que DEVEM aparecer:**
- ✅ "Qual o tamanho da sua empresa?"
- ✅ "Qual é o principal desafio estratégico da empresa hoje?"
- ✅ "Esse desafio tem impactado a receita ou crescimento?"
- ✅ "A empresa já usa IA ou automação em alguma área?"
- ✅ "Se você pudesse resolver UM problema estratégico com IA..."

**Perguntas que NÃO DEVEM aparecer:**
- ❌ "Sua equipe já usa alguma ferramenta de IA no desenvolvimento?"
- ❌ "Quanto tempo leva, em média, desde o código pronto até produção?"
- ❌ "Com que frequência bugs críticos chegam à produção?"
- ❌ "Qual é a principal linguagem/framework do seu time?"
- ❌ "Vocês fazem code review em todos os pull requests?"

### Teste de Follow-Up Inteligente

**Na pergunta:** "Qual é o principal desafio estratégico da empresa hoje?"

**Responder com:**
```
Desenvolver novos produtos inovadores para se diferenciar da concorrência e capturar market share
```

**Resultado Esperado:**

**Logs devem mostrar:**
```
🔍 [Follow-up Generation] Analysis: {
  hasSignals: true,
  category: 'innovation' ou 'competition',
  confidence: 0.9,
  keywords: ['inovadores', 'diferenciar', 'concorrência', 'market share']
}

🤖 [Follow-up Generation] Calling Claude Haiku for intelligent follow-up...

✅ [Follow-up Generation] LLM generated: {
  question: "Você mencionou 'desenvolver novos produtos inovadores'...",
  reasoning: "Explore product vision and competitive positioning"
}
```

**A próxima pergunta DEVE:**
- Citar suas palavras exatas entre aspas
- Ser contextual e específica (não genérica)
- Fazer sentido como continuação da conversa

**Exemplo de boa pergunta:**
> "Você mencionou 'desenvolver novos produtos inovadores para se diferenciar da concorrência'. Que tipos de produtos vocês estão considerando? E seus principais competidores já lançaram algo similar?"

**Exemplo de pergunta ruim (não deve acontecer):**
> "Pode elaborar mais sobre sua resposta?"

---

## Cenário 2: Persona Técnico Puro (Engineering/Tech)

### Setup
- **Step -2 - Expertise Selection:**
  - ✅ Marcar: "Tecnologia/Programação"
  - ❌ NÃO marcar: "Produto/UX"
  - ❌ NÃO marcar: "Estratégia/Negócios"
  - ❌ NÃO marcar: "Infraestrutura/DevOps"

### Resultado Esperado

**Logs do servidor:**
```
🎯 [Adaptive] Persona selection: {
  userExpertise: ['tech-engineering'],
  inferred: 'engineering-tech'
}

🎯 [Router v2] Filtered questions by persona: {
  persona: 'engineering-tech',
  totalInBlock: 13,
  afterPersonaFilter: 13  ← Todas as perguntas disponíveis!
}
```

**Perguntas que DEVEM aparecer (mix de business + tech):**
- ✅ "Qual o tamanho da sua empresa?"
- ✅ "Sua equipe já usa alguma ferramenta de IA no desenvolvimento?"
- ✅ "Se você pudesse resolver UM problema com IA, qual seria?"
- ✅ "Quanto tempo leva desde código pronto até produção?"
- ✅ "Com que frequência bugs críticos chegam à produção?"
- ✅ "Qual é a principal linguagem/framework?"

**Todas as perguntas técnicas DEVEM ter opção:**
```
"Não tenho informações sobre isso"
```

### Teste de Follow-Up Técnico

**Na pergunta:** "Se você pudesse resolver UM problema com IA, qual seria?"

**Responder com:**
```
Reduzir o tempo de code review e detectar bugs antes de chegar em produção
```

**Resultado Esperado:**
```
🔍 [Follow-up Generation] Analysis: {
  category: 'quality' ou 'pain-quantified',
  keywords: ['code review', 'bugs', 'produção']
}

🤖 [Follow-up Generation] Calling Claude Haiku...
```

**Próxima pergunta deve ser contextual:**
> "Você mencionou 'reduzir tempo de code review e detectar bugs antes de produção'. Quantos bugs críticos chegaram em produção no último mês? E qual foi o custo em horas de firefighting?"

---

## Cenário 3: Persona Mista (Product + Tech)

### Setup
- **Step -2 - Expertise Selection:**
  - ✅ Marcar: "Produto/UX"
  - ✅ Marcar: "Tecnologia/Programação"
  - ❌ NÃO marcar: "Estratégia/Negócios"
  - ❌ NÃO marcar: "Infraestrutura/DevOps"

### Resultado Esperado

**Logs do servidor:**
```
🎯 [Adaptive] Persona selection: {
  userExpertise: ['product-ux', 'tech-engineering'],
  inferred: 'product-business'
}

🎯 [Router v2] Filtered questions by persona: {
  persona: 'product-business',
  totalInBlock: 13,
  afterPersonaFilter: 10  ← Mix de business + algumas técnicas
}
```

**Perguntas esperadas:**
- ✅ Business questions (sempre)
- ✅ Algumas perguntas técnicas (porque tem tech expertise)
- ✅ Todas com opção "Não sei" quando aplicável

---

## Cenário 4: Persona DevOps/Infraestrutura

### Setup
- **Step -2 - Expertise Selection:**
  - ✅ Marcar: "Infraestrutura/DevOps"
  - ❌ NÃO marcar outros

### Resultado Esperado

**Logs do servidor:**
```
🎯 [Adaptive] Persona selection: {
  userExpertise: ['infrastructure-devops'],
  inferred: 'it-devops'
}
```

**Perguntas técnicas devem aparecer:**
- ✅ "Quanto tempo desde código pronto até produção?"
- ✅ "Com que frequência bugs críticos chegam à produção?"
- ✅ Todas com opção "Não tenho informações sobre isso"

---

## Cenário 5: Persona Finance/Ops

### Setup
- **Step -2 - Expertise Selection:**
  - ✅ Marcar: "Finanças/Operações"
  - ❌ NÃO marcar outros

### Resultado Esperado

**Logs do servidor:**
```
🎯 [Adaptive] Persona selection: {
  userExpertise: ['finance-operations'],
  inferred: 'finance-ops'
}

🎯 [Router v2] Filtered questions by persona: {
  afterPersonaFilter: 5  ← Apenas business questions
}
```

**Perguntas esperadas:**
- ✅ Business/strategic questions
- ❌ NUNCA perguntas técnicas

---

## 🔍 Teste de Detector de Incerteza

**Aplicável a qualquer cenário**

**Objetivo:** Verificar que sistema detecta quando usuário diz "não sei"

### Passo a Passo

1. Selecione uma persona mista (ex: Product + Tech)
2. Quando aparecer pergunta técnica, selecione: **"Não tenho informações sobre isso"**
3. Ou digite: **"Não sei", "Não tenho acesso", "Não é minha área"**

### Resultado Esperado

**Logs do servidor DEVEM mostrar:**
```
⚠️  [Answer] Uncertainty detected: {
  category: 'explicit',
  confidence: 0.95,
  phrases: ['não tenho informações']
}

🚨 [Answer] User explicitly lacks knowledge - possible persona mismatch!
```

**Se usuário diz "não sei" 2+ vezes:**
```
🚨 [Uncertainty Tracker] Pattern detected: {
  uncertainAnswers: 2,
  hasMismatch: true,
  reason: 'User shows lack of knowledge in 2+ questions',
  suggestedAction: 'Consider switching to less technical questions'
}
```

---

## 🎯 Teste de Budget Control (Max 3 Follow-Ups)

**Objetivo:** Verificar que sistema gera no máximo 3 follow-ups dinâmicos

### Passo a Passo

1. Selecione persona de negócios
2. Responda 6-7 perguntas com keywords interessantes:
   - "inovar" "competidor" "crescimento"
   - "custo alto" "orçamento limitado"
   - "urgente" "board pedindo"

### Resultado Esperado

**Apenas 3 follow-ups devem ser gerados:**
```
✅ Follow-up 1: LLM generated
✅ Follow-up 2: LLM generated
✅ Follow-up 3: LLM generated
⏭️  Skipping follow-up: Already used 3/3 dynamic follow-ups
```

**Logs devem mostrar:**
```
🔍 [Follow-up Generation] Analysis: {
  hasSignals: true,
  category: 'cost',
  confidence: 0.9
}

⏭️  [Follow-up Generation] Skipping: Already used 3/3 dynamic follow-ups
```

---

## ✅ Checklist de Validação Final

### Para Persona de Negócios (board-executive)
- [ ] Zero perguntas técnicas aparecem
- [ ] 2-3 follow-ups inteligentes são gerados
- [ ] Follow-ups citam palavras do usuário entre aspas
- [ ] Conversa parece natural, não mecânica

### Para Persona Técnico (engineering-tech)
- [ ] Perguntas técnicas aparecem
- [ ] Todas têm opção "Não tenho informações sobre isso"
- [ ] Follow-ups são contextuais (sobre bugs, code review, etc)

### Para Persona Mista (product + tech)
- [ ] Mix de perguntas business + técnicas
- [ ] Quando diz "não sei", detector é acionado
- [ ] Logs mostram warning de incerteza

### Budget Control
- [ ] Máximo 3 follow-ups dinâmicos por sessão
- [ ] Após 3, logs mostram "Skipping follow-up"

### Logs Gerais
- [ ] Persona inference correto no início
- [ ] Filtro de persona aplicado corretamente
- [ ] Signal detection funciona
- [ ] Claude API é chamada (ou erro é tratado gracefully)

---

## 🚨 Problemas Comuns

### Problema: Follow-ups não são gerados

**Possíveis causas:**
1. `ANTHROPIC_API_KEY` não configurada
2. Budget esgotado (já gerou 3)
3. Resposta muito curta (<20 chars)
4. Sem keywords interessantes

**Como verificar:**
```bash
# Verificar API key
grep ANTHROPIC_API_KEY .env.local

# Ver se erro no log
# Procurar por: "❌ [Follow-up Generation] Error:"
```

### Problema: Perguntas técnicas para persona de negócio

**Causas possíveis:**
1. Expertise não foi selecionada corretamente no Step -2
2. Cache do navegador com sessão antiga

**Como resolver:**
- Clear site data + reload
- Verificar que NÃO marcou "Tecnologia/Programação"

### Problema: Detector de incerteza não funciona

**Como verificar:**
- Logs devem mostrar `⚠️ [Answer] Uncertainty detected`
- Se não aparecer, verificar se resposta tem "não sei" ou similar

---

## 📊 Resultado Final Esperado

| Critério | Status Esperado |
|----------|----------------|
| Persona negócios → zero perguntas técnicas | ✅ PASS |
| Persona tech → perguntas técnicas com "não sei" | ✅ PASS |
| Follow-ups citam palavras do usuário | ✅ PASS |
| Max 3 LLM follow-ups por sessão | ✅ PASS |
| Detector de incerteza funciona | ✅ PASS |
| Build compila sem erros | ✅ PASS |

---

## 🎬 Ordem Recomendada de Testes

1. **Cenário 1 (Board Executive)** - Mais crítico, foi o bug original
2. **Cenário 5 (Finance/Ops)** - Verificar outro persona não-técnico
3. **Cenário 2 (Engineering)** - Verificar que técnicos veem perguntas técnicas
4. **Cenário 3 (Product + Tech)** - Verificar persona mista
5. **Teste de Budget** - Verificar limite de 3 follow-ups

---

**Tempo estimado:** 30-45 minutos para todos os cenários
**Ferramenta:** Browser + Terminal com logs do servidor

**Ao terminar cada cenário, anotar:**
- ✅ PASS ou ❌ FAIL
- Se FAIL, copiar logs relevantes para debug
