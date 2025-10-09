# AI Consultation Feature - v2.0

## 🎯 Visão Geral

A versão 2.0 do CulturaBuilder Assessment introduz um **fluxo híbrido inteligente**:
1. **Formulário estruturado** (Steps 0-4) - Coleta rápida de dados via múltipla escolha
2. **Consulta conversacional AI** (Step 5) - Aprofundamento personalizado com Claude

## 🧠 Psicologia do Usuário

### Por que híbrido?
- ✅ **Baixa friction inicial** - Formulário é familiar e rápido
- ✅ **Contexto rico para IA** - Claude recebe todos os dados do formulário
- ✅ **Opcional** - Usuário pode pular se quiser
- ✅ **Progressão natural** - Fácil → Personalizado

## 📋 Fluxo Completo

```
┌─────────────────────┐
│  Step 0: Persona    │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Steps 1-3: Dados    │
│ (Formulário rápido) │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│   Step 4: Review    │
└──────────┬──────────┘
           ↓
┌─────────────────────────────────┐
│ Step 5: AI Consultation         │
│ ┌────────────┐  ┌──────────────┐│
│ │ Participar │  │Pular Consulta││
│ └─────┬──────┘  └──────┬───────┘│
│       ↓                ↓        │
│  3-5 perguntas    Report padrão │
│  personalizadas                 │
│       ↓                         │
│  Report + Insights              │
└─────────────────────────────────┘
```

## 🛠️ Arquivos Criados/Modificados

### Novos Arquivos

**Infraestrutura:**
- `app/api/consult/route.ts` - API endpoint com streaming
- `lib/prompts/consultation-prompt.ts` - Sistema de prompts inteligentes
- `.env.example` - Template para API key

**Componentes:**
- `components/assessment/Step5AIConsult.tsx` - Interface de chat
- `components/report/AIInsightsSection.tsx` - Exibição de insights

### Arquivos Modificados

**Types & Logic:**
- `lib/types.ts` - Adicionado `aiInsights?: string[]` ao Report
- `lib/services/report-service.ts` - Aceita aiInsights como parâmetro

**UI:**
- `app/assessment/page.tsx` - Integrado Step 5, totalSteps = 6
- `app/report/[id]/page.tsx` - Renderiza AIInsightsSection

## ⚙️ Configuração

### 1. Instalar Dependências

```bash
npm install @anthropic-ai/sdk
```

### 2. Configurar API Key

Crie `.env.local` na raiz do projeto:

```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
```

**Obter API key:**
1. Acesse https://console.anthropic.com/
2. Crie uma conta (se necessário)
3. Vá em "API Keys"
4. Crie uma nova key
5. Cole no .env.local

### 3. Rodar o Projeto

```bash
npm run dev
```

Acesse: http://localhost:3000/assessment

## 🎨 Como Funciona

### Step 5: AI Consultation

**Usuário chega no Step 5 e vê:**
- Mensagem introdutória personalizada baseada nos pain points
- Opção "Pular Consulta" → gera report normal
- Interface de chat para conversar com Claude

**Claude AI:**
- Recebe TODO o contexto do formulário via system prompt
- Faz 3-5 perguntas inteligentes de aprofundamento
- Exemplos:
  - "Você mencionou bugs em produção - qual o impacto típico?"
  - "Com 15 devs e ciclo de 14 dias, qual o maior gargalo?"
  - "Meta de 6 meses - já tentaram voice coding antes?"

**Após conversa:**
- Respostas do usuário são salvas como `aiInsights[]`
- Report gerado inclui seção "Insights da Consulta AI"

### Report com Insights

Se o usuário participou da consulta, o report inclui:
- Seção destacada com ícone 🤖
- Lista numerada de insights
- Badge "Powered by Claude AI da Anthropic"

## 📊 Dados Coletados

### Formulário (Steps 0-4)
- Estruturado e quantificável
- Usado para cálculos de ROI
- Benchmarking com indústria

### AI Insights (Step 5)
- Qualitativo e contextual
- Nuances que formulário não captura
- Enriquece recomendações

**Exemplo:**

| Formulário | AI Insights |
|-----------|-------------|
| "Deployment: monthly" | "Gargalo: processo manual de aprovação de infra" |
| "Pain: bugs em produção" | "Impacto: 1 bug crítico = 4h downtime + R$50k perdidos" |
| "Team: 15 devs" | "Rotatividade alta em juniors (40%/ano)" |

## 🧪 Testar Localmente

### Sem API Key (Modo Teste)

Se `ANTHROPIC_API_KEY` não estiver configurado:
- Step 5 mostrará mensagem de erro educativa
- Usuário pode "Pular Consulta"
- Report gerado sem insights (funciona normal)

### Com API Key

1. Complete Steps 0-4 normalmente
2. No Step 5, veja mensagem intro
3. Digite resposta no chat
4. Claude faz perguntas de follow-up
5. Após 3-5 interações, botão "Gerar Relatório"
6. Report gerado com seção "Insights da Consulta AI"

## 🚀 Deploy

### Vercel (Recomendado)

1. Push código para GitHub
2. Importe projeto no Vercel
3. Configure Environment Variables:
   - `ANTHROPIC_API_KEY` = sua_key

### Outras Plataformas

Qualquer plataforma que suporte Next.js 15:
- Netlify
- Railway
- Render
- AWS Amplify

**Importante:** Sempre configure `ANTHROPIC_API_KEY` nas env vars.

## 💰 Custos da API

**Modelo usado:** `claude-3-5-sonnet-20241022`

**Pricing (Jan 2025):**
- Input: ~$3 / 1M tokens
- Output: ~$15 / 1M tokens

**Estimativa por conversa:**
- System prompt: ~500 tokens
- 5 mensagens (user + assistant): ~2000 tokens
- **Custo: ~$0.05 por assessment**

**Com 1000 assessments/mês:**
- Custo API: ~$50/mês
- Muito viável para produto B2B

## 🔒 Segurança

### Dados do Usuário

- Formulário enviado para API via POST request
- Não armazenado nos servidores Anthropic (conforme ToS)
- Insights salvos apenas no localStorage do navegador
- Nenhum dado enviado para terceiros

### API Key

- ⚠️ NUNCA commitar `.env.local` no Git
- ✅ Usar environment variables em produção
- ✅ Rotacionar keys periodicamente

## 📈 Métricas de Sucesso

**KPIs para monitorar:**

1. **Taxa de Adoção**
   - Quantos % completam Step 5 vs pulam?
   - Meta: >50%

2. **Qualidade dos Insights**
   - Reports com insights têm mais engagement?
   - CTAs convertem melhor?

3. **Custo vs Valor**
   - $0.05/assessment é viável?
   - Insights justificam o custo?

## 🔄 Rollback Plan

Se a feature não funcionar bem:

```bash
# Voltar para versão anterior
git checkout client-consult

# Re-deploy
git push origin client-consult --force
```

Todas as mudanças estão isoladas na branch `client-consult-v2`.

## 🎯 Próximas Melhorias

### Fase 2.1
- [ ] Análise de sentimento das respostas
- [ ] Sugestões de perguntas quick-reply
- [ ] Export conversation transcript

### Fase 2.2
- [ ] Multi-language support (EN/PT)
- [ ] Voice input (whisper API)
- [ ] Integration com CRM (salvar insights)

### Fase 2.3
- [ ] Analytics dashboard de conversas
- [ ] A/B test de prompts
- [ ] Fine-tuning para casos brasileiros

## 📝 Notas Técnicas

### Streaming vs Non-Streaming

**Por que streaming?**
- Melhor UX (typing effect)
- Usuário vê resposta em tempo real
- Menos sensação de espera

**Alternativa (se problemas):**
- Mudar para non-streaming (remover `stream: true`)
- Adicionar loading spinner
- Retornar resposta completa de uma vez

### Rate Limiting

Anthropic API limits (Tier 1):
- 50 requests/min
- 40,000 tokens/min

**Solução se escalar:**
- Implementar queue system
- Rate limiting no backend
- Upgrade para Tier 2+

## 🤝 Contribuindo

Para adicionar novas perguntas inteligentes:

Edite `lib/prompts/consultation-prompt.ts`:

```typescript
export const intelligentFollowUps = {
  // ... existing
  myNewCategory: [
    "Pergunta específica baseada em X?",
    "Follow-up relacionado a Y?",
  ],
}
```

## 📚 Recursos

- [Anthropic API Docs](https://docs.anthropic.com/)
- [Claude 3.5 Sonnet](https://www.anthropic.com/claude)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Streaming in Next.js](https://nextjs.org/docs/app/building-your-application/routing/route-handlers#streaming)

---

**Versão:** 2.0.0
**Data:** 2025-01-09
**Status:** ✅ Implementado e testável
