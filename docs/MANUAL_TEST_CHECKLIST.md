# Business Quiz - Manual Test Checklist

**IMPORTANTE**: Use o servidor que já está rodando no seu navegador!

---

## ✅ Checklist de Testes Manuais

### 1. **Landing Page** (`http://localhost:3000/business-health-quiz`)

- [ ] Página carrega sem erros 404
- [ ] Título "Descubra a saúde do seu negócio" está **visível e legível**
- [ ] Texto não está branco em fundo branco
- [ ] Botão "Começar Diagnóstico →" está visível e azul/roxo
- [ ] Stats (19 perguntas, 8 min, 7 áreas) estão legíveis
- [ ] Card com 7 áreas de negócio aparece à direita

**Se FALHAR**: Capture screenshot e me envie

---

### 2. **Iniciar Quiz**

- [ ] Clicar em "Começar Diagnóstico →"
- [ ] Redireciona para `/business-health-quiz/quiz?session=biz-quiz-XXXXX`
- [ ] URL contém `session=` com ID único
- [ ] Primeira pergunta carrega: "Qual é o nome da sua empresa?"

**Se FALHAR**: Me informe em qual passo parou

---

### 3. **Input Visibility** (CRÍTICO - era o bug)

- [ ] **Placeholder "Ex: TechCorp..."** está **visível em cinza** (NÃO branco!)
- [ ] Digite "Minha Empresa" - texto aparece em **cinza escuro/preto**
- [ ] Botão "Próxima →" fica **habilitado** (azul/roxo, não cinza)

**Se o placeholder AINDA estiver branco**:
- Faça **Cmd+Shift+R** (Mac) ou **Ctrl+Shift+R** (Windows) para hard reload
- Teste novamente

---

### 4. **Responder Primeira Pergunta**

- [ ] Digite qualquer nome de empresa
- [ ] Clique em "Próxima →"
- [ ] Segunda pergunta carrega (pergunta sobre indústria/setor)
- [ ] Progresso atualiza de 5% para ~10-15%
- [ ] **NÃO fica preso na primeira pergunta!**

**Se TRAVAR na primeira pergunta**:
1. Abra Console do navegador (F12)
2. Vá na aba "Network"
3. Filtre por "answer"
4. Me diga o status code (200, 404, 500?)

---

### 5. **Progresso do Quiz**

- [ ] Barra de progresso no topo está visível
- [ ] Mostra "Contexto" como bloco atual
- [ ] Mostra "Pergunta X de 7"
- [ ] Percentual aumenta a cada resposta

---

### 6. **Responder 5 Perguntas** (teste de fluxo)

Responda as próximas 4 perguntas rapidamente (qualquer resposta serve):

- [ ] Pergunta 2: "Qual o setor/indústria..." - Digite "Tecnologia"
- [ ] Pergunta 3: "Quantos funcionários..." - Digite "50"
- [ ] Pergunta 4: "Faturamento anual..." - Digite "5 milhões"
- [ ] Pergunta 5: "Tempo de mercado..." - Digite "3 anos"

**Verifique**:
- [ ] Todas as perguntas avançam normalmente
- [ ] Nenhuma pergunta repete
- [ ] Progresso aumenta continuamente
- [ ] Placeholder visível em TODAS as perguntas

**Se ALGUMA pergunta travar**: Me diga qual número (1-5)

---

### 7. **Transição de Bloco** (Opcional - só se chegar aqui)

Ao completar pergunta 7 do bloco Contexto:

- [ ] Aparece animação de transição "Contexto → Expertise"
- [ ] Mensagem de transição aparece por ~3 segundos
- [ ] Automaticamente avança para bloco "Expertise"

**Se não ver transição**: Tudo bem, pode avançar direto

---

### 8. **Completar Quiz** (Opcional - só se quiser testar até o fim)

**Responda todas as 19 perguntas**:
- Bloco 1: Contexto (7 perguntas)
- Bloco 2: Expertise (4 perguntas)
- Bloco 3: Deep-dive (5 perguntas)
- Bloco 4: Risk Scan (3 perguntas)

**Ao completar**:
- [ ] Aparece "Quiz Completo! 🎉"
- [ ] Mensagem "Estamos gerando seu diagnóstico..."
- [ ] Spinner animado aparece
- [ ] **AGUARDE até 2 minutos** para geração com LLM

**O que deve acontecer**:
- [ ] Redireciona para `/business-health-quiz/results/diag-XXXXX`
- [ ] Mostra página de resultados com scores
- [ ] Vê "Score geral: XX/100"
- [ ] Três abas: Overview, Recomendações, Roadmap

**Se ficar mais de 2 minutos no loading**:
- Será usado fallback diagnostic (normal se LLM falhar)
- Deve redirecionar mesmo assim

---

## 🚨 Problemas Conhecidos (se acontecer)

### Problema: Fonte branca em fundo branco
**Solução**:
```
1. Cmd+Shift+R (hard reload)
2. Se persistir, limpar cache do navegador
3. Recarregar página
```

### Problema: Primeira pergunta não avança
**Diagnóstico**:
```
1. F12 → Console
2. Procure erros vermelhos
3. F12 → Network
4. Veja se POST /api/business-quiz/answer retorna 404 ou 500
```

### Problema: 404 na landing page
**Solução**:
```
O servidor Next.js precisa ser reiniciado:
1. No terminal onde o servidor roda
2. Ctrl+C para parar
3. npm run dev para reiniciar
4. Aguarde "Ready" aparecer
```

---

## 📊 Resultado Esperado

**SUCESSO COMPLETO** se:
- ✅ Landing page carrega com texto visível
- ✅ Quiz inicia e mostra primeira pergunta
- ✅ Placeholder do input está visível (cinza médio)
- ✅ Primeira pergunta avança para segunda
- ✅ Progresso aumenta a cada resposta
- ✅ Não trava em nenhuma pergunta

**SUCESSO PARCIAL** se:
- ✅ Tudo acima OK
- ⚠️  Mas completar quiz resulta em erro/timeout
- ⚠️  Isso é aceitável (LLM pode falhar)

**FALHA** se:
- ❌ Landing page dá 404
- ❌ Input com placeholder branco (após hard reload)
- ❌ Primeira pergunta trava e não avança
- ❌ Perguntas repetem (loop infinito)

---

## 📝 Me Retorne

Por favor teste até **passo 4** (responder primeira pergunta) e me diga:

1. **Placeholder do input está visível?** (Sim/Não)
2. **Primeira pergunta avança normalmente?** (Sim/Não)
3. **Se NÃO avançar**: Qual o erro no Console? (screenshot)
4. **Se NÃO avançar**: Status code no Network tab? (200, 404, 500?)

---

**Tempo estimado**: 2-3 minutos para passos 1-4
**Se quiser testar completo**: 10-15 minutos para todos os passos
