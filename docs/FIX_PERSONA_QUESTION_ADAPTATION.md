# Fix: Adaptação de Perguntas Baseada em Persona

**Data:** 2025-11-21
**Problema:** Usuários não-técnicos (Produto/UX, Estratégia/Negócios) recebiam perguntas com linguagem técnica inapropriada.

## 🐛 Problema Identificado

Quando o usuário selecionava expertise "Produto UX + Estratégia Negócios" no Step -2, as perguntas do assessment vinham assim:

- ❌ "Quantas pessoas compõem sua **equipe de desenvolvimento**?"
- ❌ "Qual é o principal **desafio técnico** que sua equipe enfrenta hoje?"
- ❌ "Vocês fazem **code review** em todos os **pull requests**?"

Essas perguntas técnicas não faziam sentido para personas de negócios/produto.

## 🔍 Root Cause Analysis

### Fluxo do Sistema

1. **Step -2 (Expertise Detection)** → usuário seleciona áreas de conhecimento
2. **`/api/adaptive-assessment`** → cria sessão e infere persona:
   - `product-ux` → `product-business`
   - `strategy-business` → `board-executive`
   - `engineering-tech` → `engineering-tech`
3. **`/api/adaptive-assessment/next-question`** → busca próxima pergunta do question bank
4. **Question Bank** → retorna pergunta hardcoded com linguagem técnica
5. ❌ **Problema:** Nenhuma adaptação de linguagem baseada em persona

### Arquivos Envolvidos

- ✅ **`app/api/adaptive-assessment/route.ts`** - Inferência de persona funcionando corretamente
- ❌ **`lib/questions/ai-readiness-question-bank.ts`** - Perguntas hardcoded sem variações de persona
- ❌ **`app/api/adaptive-assessment/next-question/route.ts`** - Retornava perguntas sem adaptação
- ❌ **`lib/ai/adaptive-question-router-v2.ts`** - Router não considerava persona na seleção

## ✅ Solução Implementada

### 1. Criação do Adaptador de Perguntas

**Arquivo:** `lib/utils/persona-question-adapter.ts`

```typescript
// Traduz linguagem técnica → linguagem de negócios
const technicalToBusinessTranslations = {
  'equipe de desenvolvimento': 'time',
  'desenvolvedores': 'pessoas do time',
  'desafio técnico': 'principal desafio',
  'code review': 'revisão de código',
  'pull requests': 'mudanças de código',
  'bugs críticos': 'problemas críticos',
  // ... mais traduções
};

export function adaptFullQuestion(question, persona) {
  if (persona === 'product-business' || persona === 'board-executive') {
    // Aplica traduções em: text, options, placeholder
    return adaptedQuestion;
  }
  return question; // Personas técnicas mantêm linguagem original
}
```

### 2. Integração no Endpoint de Próxima Pergunta

**Arquivo:** `app/api/adaptive-assessment/next-question/route.ts`

```typescript
import { adaptFullQuestion } from '@/lib/utils/persona-question-adapter';

// Antes de retornar a pergunta:
const rawQuestion = {
  id: questionFromBank.id,
  text: questionFromBank.text,
  inputType: questionFromBank.inputType,
  options: questionFromBank.options,
  placeholder: questionFromBank.placeholder
};

// ✅ Aplica adaptação baseada em persona da sessão
const adaptedQuestion = adaptFullQuestion(rawQuestion, session.persona);

console.log('🎨 Persona adaptation applied:', {
  persona: session.persona,
  originalText: questionFromBank.text.substring(0, 60),
  adaptedText: adaptedQuestion.text.substring(0, 60)
});

nextQuestion = { ...rawQuestion, ...adaptedQuestion };
```

## 🎯 Resultado Esperado

### Para Persona `product-business` ou `board-executive`:

**ANTES:**
- ❌ "Quantas pessoas compõem sua equipe de desenvolvimento?"
- ❌ "Qual é o principal desafio técnico que sua equipe enfrenta hoje?"
- ❌ "Vocês fazem code review em todos os pull requests?"

**DEPOIS:**
- ✅ "Quantas pessoas compõem seu time?"
- ✅ "Qual é o principal desafio que sua equipe enfrenta hoje?"
- ✅ "Vocês fazem revisão de código em todas as mudanças de código?"

### Para Persona `engineering-tech` ou `it-devops`:

- ✅ Mantém linguagem técnica original (não precisa tradução)

## 📋 Mapeamento de Traduções

| Termo Técnico | Termo de Negócios |
|---------------|-------------------|
| equipe de desenvolvimento | time |
| desenvolvedores | pessoas do time |
| devs | membros da equipe |
| desafio técnico | principal desafio |
| code review | revisão de código |
| pull requests | mudanças de código |
| linguagem/framework | tecnologias principais |
| bugs críticos | problemas críticos |
| produção | ambiente final |
| código pronto | funcionalidade pronta |
| deploy | publicação |
| releases | lançamentos |
| CI/CD | automação de deploy |
| dívida técnica | problemas acumulados no código |
| refactoring | melhoria de código |
| cobertura de testes | testes automatizados |
| onboarding de devs | integração de novos membros |
| cycle time | tempo de entrega |
| velocidade de desenvolvimento | velocidade de entrega |

## 🧪 Como Testar

1. **Limpar sessão no browser** (localStorage)
2. **Acessar:** http://localhost:3003/assessment
3. **Step -2:** Selecionar "Produto/UX" + "Estratégia/Negócios"
4. **Step 101:** Verificar que as perguntas usam linguagem de negócios:
   - "seu time" em vez de "equipe de desenvolvimento"
   - "principal desafio" em vez de "desafio técnico"
   - "problemas críticos" em vez de "bugs críticos"

5. **Verificar logs do servidor:**
```bash
# Procurar por estas linhas no console:
🎯 [Adaptive] Persona selection: {
  provided: null,
  userExpertise: ['product-ux', 'strategy-business'],
  inferred: 'board-executive',
  final: 'board-executive'
}

🎨 [Next Question] Persona adaptation applied: {
  persona: 'board-executive',
  originalText: 'Quantas pessoas compõem sua equipe de desenvolvimento?',
  adaptedText: 'Quantas pessoas compõem seu time?'
}
```

## ✅ Validação

- [x] Inferência de persona a partir de userExpertise funcionando
- [x] Adaptador de perguntas criado
- [x] Integração no endpoint next-question implementada
- [x] Logs de debug adicionados
- [x] Servidor compilando sem erros
- [ ] **TODO:** Testar manualmente o fluxo completo

## 🔄 Fluxo Correto (Unified)

```
Step -2: Expertise Detection
   ↓
   usuário seleciona: "Produto UX" + "Estratégia Negócios"
   ↓
POST /api/adaptive-assessment
   ↓
   infere persona: product-business ou board-executive
   ↓
Step 101: Adaptive Assessment
   ↓
POST /api/adaptive-assessment/next-question
   ↓
   router seleciona pergunta do question bank
   ↓
   ✅ adaptFullQuestion(question, persona)
   ↓
   retorna pergunta com linguagem adaptada
```

## 📝 Notas Técnicas

- **Pattern:** Adapter pattern para transformação de linguagem
- **Performance:** Regex replacements executados em tempo real (não afeta UX)
- **Extensibilidade:** Fácil adicionar novas traduções no `technicalToBusinessTranslations`
- **Manutenibilidade:** Centralizado em um único arquivo
- **Backwards compatible:** Não quebra perguntas existentes para personas técnicas

## 🚀 Próximos Passos

1. **Expandir dicionário de traduções** conforme novas perguntas forem adicionadas
2. **Adicionar testes unitários** para o adaptador
3. **Considerar i18n** se houver necessidade de múltiplos idiomas no futuro
4. **Monitorar logs** para identificar termos técnicos que escaparam da tradução

---

**Status:** ✅ Implementado e pronto para teste
**Impacto:** Alto - resolve problema crítico de UX para personas não-técnicas
