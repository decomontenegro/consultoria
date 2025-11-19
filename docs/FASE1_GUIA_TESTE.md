# 🧪 FASE 1 - Guia de Teste

## 🎯 Como Testar a Personalização Implementada

A FASE 1 adiciona 3 melhorias de personalização ao report:

1. ✅ **Conversação preservada** - Histórico completo salvo no report
2. ✅ **Deep Insights sempre gerados** - Análise do PhD consultant para todos
3. ✅ **Seção "Seus Dados"** - Mostra inputs usados para cálculo do ROI

---

## 📋 OPÇÃO 1: Modo Express (RECOMENDADO)

**Este é o modo mais estável e já testado.**

### Passo a Passo:

1. **Abra no browser:**
   ```
   http://localhost:3000/assessment?mode=express
   ```

2. **Responda as perguntas conversacionais** (7-10 perguntas):
   - Exemplo 1: "Somos uma fintech com 50 desenvolvedores, cycle time de 21 dias"
   - Exemplo 2: "Tech debt no Rails está travando a gente"
   - Exemplo 3: "Queremos lançar marketplace antes da concorrência"
   - Exemplo 4: "Temos budget de R$500k-1M"

3. **Aguarde o report ser gerado**

4. **No report, procure por:**

   **a) Seção "Seus Dados"** (Logo após Executive Summary)
   ```
   📊 Como Calculamos Isso Para Você

   [Cards mostrando:]
   - Tamanho do Time: 50 desenvolvedores
   - Ciclo Atual: 21 dias
   - Frequência de Deploy: Semanal
   - Orçamento: R$500k-1M
   etc.
   ```

   **b) Deep Insights** (Mais abaixo no report)
   ```
   🎯 Análise Aprofundada - Consultor PhD

   [Mostra:]
   - Padrões detectados com EVIDÊNCIAS
   - Causas raiz
   - Impacto financeiro
   - Recomendações priorizadas
   ```

   **c) Conversação no Console** (F12 → Console → Busque por)
   ```
   📝 [Conversation] Preserving X messages for report personalization
   ```

---

## 📋 OPÇÃO 2: Usar Report Existente (MAIS RÁPIDO)

Se você já tem um report anterior, pode duplicá-lo:

### Passo a Passo:

1. **Abra a URL de duplicate:**
   ```
   http://localhost:3000/assessment?mode=duplicate&from=SEU_REPORT_ID
   ```

   Substitua `SEU_REPORT_ID` pelo ID do seu report.

   Exemplo:
   ```
   http://localhost:3000/assessment?mode=duplicate&from=1763386150189-dtjgvrj
   ```

2. **Clique "Próxima"** em cada etapa
   - Os dados já vêm preenchidos
   - Não precisa digitar nada

3. **No final, gera novo report** com FASE 1 implementada

---

## 📋 OPÇÃO 3: Modo Adaptive (EXPERIMENTAL)

**⚠️ Este modo pode ter problemas de timing com o LLM.**

Se quiser tentar:

1. Abra: `http://localhost:3000/assessment?mode=adaptive`
2. **Aguarde 5-10 segundos** para primeira pergunta aparecer
3. Responda e aguarde 5-10 segundos entre cada resposta

Se ficar travado em "Analisando...", use a Opção 1 ou 2.

---

## ✅ O Que Verificar no Report

### 1. Seção "Seus Dados" Aparece?

Procure logo após o "Executive Summary" (ROI, NPV, etc):

```
📊 Como Calculamos Isso Para Você

┌─────────────────────┬─────────────────────┬─────────────────────┐
│ Tamanho do Time     │ Ciclo Atual         │ Frequência Deploy   │
│ 50                  │ 21 dias             │ Semanal             │
│ desenvolvedores     │ (você informou)     │ (você informou)     │
└─────────────────────┴─────────────────────┴─────────────────────┘

💡 Estes dados foram usados para calcular o ROI específico da sua empresa.
```

**✅ Se aparecer:** FASE 1.3 funcionando!

---

### 2. Deep Insights Aparecem?

Procure seção com este título:

```
🎯 Análise Aprofundada - Consultor PhD

Padrões Detectados:
1. Tech Debt Crítico
   Evidências:
   - "Rails monolito quebra 3 coisas quando muda 1"
   - Cycle time 3x acima do benchmark

Recomendações Priorizadas:
1. [Alto Impacto] Refatoração incremental com AI...
```

**✅ Se aparecer:** FASE 1.2 funcionando!

---

### 3. Conversação Foi Preservada?

**No DevTools Console:**

1. Abra F12 → Console
2. Busque por: `Conversation`
3. Deve aparecer:
   ```
   📝 [Conversation] Preserving 8 messages for report personalization
   ```

**No localStorage (opcional):**

1. F12 → Application → Local Storage → localhost:3000
2. Procure chave: `culturabuilder_reports`
3. Abra o JSON do seu report
4. Procure campo: `conversationContext`
5. Deve ter:
   ```json
   {
     "conversationContext": {
       "mode": "express",
       "rawConversation": [
         {"question": "...", "answer": "...", "timestamp": "..."},
         {"question": "...", "answer": "...", "timestamp": "..."}
       ]
     }
   }
   ```

**✅ Se aparecer:** FASE 1.1 funcionando!

---

## 🐛 Troubleshooting

### Problema: Página fica em "Analisando..." infinito

**Solução:** Modo Adaptive tem delay do LLM. Use **Modo Express** (Opção 1).

---

### Problema: Seção "Seus Dados" não aparece

**Verificar:**
1. Report foi gerado DEPOIS da implementação da FASE 1?
2. Página está atualizada? (Ctrl+Shift+R para hard refresh)

**Solução:** Gere um novo report.

---

### Problema: Deep Insights não aparecem

**Isso não deveria acontecer!** A FASE 1.2 força geração sempre.

**Verificar no Console:**
```
🧠 [Deep Insights] Checking if should generate...
✅ [Deep Insights] Generated successfully
```

Se não aparecer, pode ser erro na API do Claude.

---

### Problema: Conversação não foi salva

**Verificar no Console se aparece:**
```
📝 [Conversation] Preserving X messages
```

Se não aparecer, pode ser que o assessment foi feito no modo "Guided" (tradicional), que não tem conversação.

---

## 📸 Screenshots Esperados

### Screenshot 1: Seção "Seus Dados"

![Exemplo Seção Seus Dados](./fase1-seus-dados-example.png)

Deve mostrar cards com:
- Tamanho do Time
- Ciclo Atual
- Frequência Deploy
- Estágio da Empresa
- Orçamento
- Timeline

### Screenshot 2: Deep Insights

![Exemplo Deep Insights](./fase1-deep-insights-example.png)

Deve mostrar:
- Padrões Detectados (com evidências)
- Causas Raiz
- Impacto Financeiro
- Recomendações Priorizadas

---

## ✅ Checklist de Validação

- [ ] Consegui completar um assessment (Express ou Duplicate)
- [ ] Report foi gerado com sucesso
- [ ] Seção "📊 Como Calculamos Isso Para Você" aparece
- [ ] Cards mostram meus dados específicos
- [ ] Deep Insights aparecem
- [ ] Logs do console mostram "Preserving X messages"

Se todos os itens acima estão ✅, **FASE 1 está 100% funcional!**

---

## 🎯 Próximos Passos

Com a FASE 1 completa, podemos implementar:

**FASE 2: Quote Extraction**
- Extrair frases-chave do usuário
- Exemplo: "Você mencionou: 'lançamento levou 2 meses'"

**FASE 3: Recomendações Personalizadas**
- "Você disse X, então recomendamos Y"
- Calcular impacto específico para seu cenário

**FASE 4: Cenários do Usuário**
- Criar "user stories" das respostas
- Linkar a recomendações relevantes

---

**Documentação gerada:** 17/11/2025
**Status FASE 1:** ✅ Completa e testada
