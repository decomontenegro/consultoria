# 🔧 Hotfix: Jargon Awareness for Multi-Specialist System

## 🐛 Bug Report

**Issue**: Especialistas faziam perguntas com jargão técnico para personas não-técnicas

**Exemplo do Problema**:
```
Dr. Strategy para Board Member:
"Qual a diferença em velocidade de entrega de features?
O cycle time de 14 dias está criando desvantagem competitiva?"

❌ Problemas:
- "cycle time" → termo técnico
- "entrega de features" → jargão de engenharia
- Board Member NÃO entende esses termos
```

**Impacto**:
- ⚠️ Qualidade de respostas baixa (usuário confuso)
- ⚠️ Experiência ruim para executivos
- ⚠️ Percepção: "AI não entende meu contexto"

---

## ✅ Solução Implementada

### 1. Context-Aware System Prompts

**Adicionado ao prompt de cada especialista**:
- ✅ **Perfil do Interlocutor**: Descrição da persona (técnica ou não)
- ✅ **Linguagem e Jargão**: Guidelines explícitas sobre termos permitidos/proibidos

### 2. Funções Auxiliares

**`getPersonaDescription(persona)`**:
```typescript
'board-executive' → "NÃO é técnico. Foco em estratégia, ROI, impacto competitivo."
'engineering-tech' → "TÉCNICO - pode usar jargão de engenharia livremente."
```

**`getJargonGuidelines(specialistType, persona)`**:

| Especialista | Persona Não-Técnica | Persona Técnica |
|--------------|---------------------|-----------------|
| Dr. Strategy | ❌ Nunca usar "cycle time", "deployment" | ⚠️ OK em contexto estratégico |
| Dr. ROI | ❌ Evitar jargão técnico | ⚠️ Misto (técnico + financeiro) |
| Dr. Tech | ❌ Traduzir para negócio | ✅ Jargão livre |

### 3. Exemplos de Tradução

**Para Board Members (Executivos)**:

| ❌ Termo Técnico | ✅ Linguagem de Negócio |
|------------------|--------------------------|
| "cycle time de 14 dias" | "tempo para lançar novidades" |
| "deployment frequency" | "frequência de lançamentos" |
| "technical debt" | "limitações técnicas acumuladas" |
| "CI/CD pipeline" | "automação de entregas" |
| "code coverage" | "cobertura de qualidade" |
| "merge conflicts" | "problemas de integração" |

---

## 📁 Alterações no Código

### Arquivo: `lib/prompts/specialist-prompts.ts`

**Imports**:
```typescript
import { AssessmentData, UserPersona } from '../types';
```

**Modificações em `generateSpecialistSystemPrompt()`**:
```typescript
const { persona } = assessmentData;

const basePrompt = `
...
## Perfil do Interlocutor
${getPersonaDescription(persona)}

# LINGUAGEM E JARGÃO
${getJargonGuidelines(specialistType, persona)}
...
`;
```

**Novas Funções**:
- `getPersonaDescription(persona: UserPersona): string`
- `getJargonGuidelines(specialistType: SpecialistType, persona: UserPersona): string`

---

## 🎯 Resultado Esperado

### Board Executive + Dr. Strategy

**ANTES (Errado)**:
> "Qual o cycle time dos competidores vs seu cycle time de 14 dias?"

**DEPOIS (Correto)**:
> "Seus principais competidores são mais rápidos em lançar novidades? Isso impacta sua receita ou participação de mercado?"

### Finance Leader + Dr. ROI

**ANTES (Errado)**:
> "Qual o custo de technical debt considerando o deployment frequency?"

**DEPOIS (Correto)**:
> "Que percentual do orçamento de TI é gasto corrigindo sistemas legados vs construindo coisas novas?"

### Engineering Leader + Dr. Tech

**CORRETO** (Pode usar jargão):
> "Qual sua atual code coverage? Há gargalos no CI/CD pipeline que aumentam o cycle time?"

---

## 🧪 Validação

### Build Status
```bash
npm run build
✓ Compiled successfully
✓ All TypeScript types valid
✓ No errors
```

### QA Manual Necessário

**Cenários de Teste**:

1. **Board Executive + Dr. Strategy**
   - [ ] Perguntas SEM "cycle time", "deployment", "CI/CD"
   - [ ] Foco em competitividade, receita, mercado

2. **Board Executive + Dr. ROI**
   - [ ] Métricas financeiras (R$, %, meses)
   - [ ] SEM jargão técnico

3. **Engineering Leader + Dr. Tech**
   - [ ] PODE usar jargão técnico
   - [ ] Perguntas profundas sobre CI/CD, arquitetura

4. **Finance Leader + Dr. ROI**
   - [ ] Linguagem de negócio (não técnica)
   - [ ] Foco em custos, ROI, savings

---

## 📊 Métricas de Sucesso

### Imediato (Semana 1):
- [ ] Zero uso de "cycle time" para Board Members
- [ ] Zero uso de "deployment" para Finance Leaders
- [ ] Feedback qualitativo: "perguntas claras e relevantes"

### Curto Prazo (Semana 2-4):
- [ ] Taxa de respostas completas +20%
- [ ] Duração da consulta -15% (menos confusão)
- [ ] NPS da consulta AI aumenta

### Médio Prazo (Mês 1):
- [ ] Quality score dos insights aumenta (sales team)
- [ ] Conversion rate consulta → demo aumenta
- [ ] Feedback: "AI entende meu contexto"

---

## 📄 Documentação

**Criado**:
- ✅ `docs/JARGON_FIX.md` - Documentação completa da correção

**Atualizado**:
- ✅ `lib/prompts/specialist-prompts.ts` - Código corrigido

**Relacionado**:
- `docs/PHASE2_MULTI_SPECIALIST.md` - Sistema multi-especialista
- `SPRINT2_SUMMARY.md` - Sprint 2 summary

---

## 🚀 Deployment

### Status
- **Build**: ✅ Passing
- **Tests**: ⚠️ Manual QA needed
- **Risk**: 🟡 Medium (changes AI behavior)
- **Impact**: 🟢 High positive (fixes UX issue)

### Deployment Steps
1. ✅ Build verification
2. ⏳ Manual QA com diferentes personas
3. ⏳ Deploy to staging
4. ⏳ Final validation
5. ⏳ Production deployment

### Rollback Plan
Se houver problemas:
```bash
git revert HEAD
git push origin main
# Vercel auto-redeploy
```

---

## 🎓 Lessons Learned

### O que funcionou bem:
- ✅ Identificação rápida do problema via user feedback
- ✅ Solução clara: context-aware prompts
- ✅ Build passou no primeiro teste após fix

### Oportunidades de melhoria:
- ⚠️ Deveria ter testado com personas não-técnicas antes
- ⚠️ Automated tests para detectar jargão em responses
- ⚠️ QA checklist por persona no processo

### Próximas ações:
- [ ] Criar automated jargon detector
- [ ] Adicionar mais exemplos de perguntas corretas
- [ ] A/B test para medir melhoria na qualidade

---

## ✅ Checklist Final

- [x] Bug identificado e documentado
- [x] Solução implementada
- [x] Código modificado e testado (build)
- [x] Documentação completa criada
- [x] Import type adicionado (UserPersona)
- [x] Funções auxiliares criadas
- [ ] QA manual com 4 personas diferentes
- [ ] Deploy to staging
- [ ] Validação final
- [ ] Production deployment
- [ ] Monitor metrics pós-deploy

---

**Prioridade**: 🔴 **HIGH** (user-facing quality issue)
**Effort**: 🟢 **LOW** (2 funções + prompt changes)
**Impact**: 🔵 **HIGH** (melhor experiência para executivos)

---

**Developer**: ✅ Implementation complete
**QA**: ⚠️ Manual testing needed
**Ready for**: 🧪 **QA & Staging Deployment**

---

**Last Updated**: Janeiro 2025
**Version**: 2.0.1 - Jargon Fix
**Status**: ✅ **Code Complete, QA Pending**
