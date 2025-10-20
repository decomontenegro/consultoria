# Guia de Configuração do Webhook

## 🎯 Objetivo

Receber notificações automáticas quando um cliente completa um assessment.

---

## 🚀 Opção 1: Webhook.site (Teste Rápido - GRÁTIS)

### Passo 1: Criar URL única

1. Acesse https://webhook.site
2. Você verá uma URL única gerada automaticamente
   - Exemplo: `https://webhook.site/abc123-def456-ghi789`
3. **Copie essa URL**

### Passo 2: Configurar no projeto

1. Abra o arquivo `.env.local` (crie se não existir)
2. Adicione:
   ```bash
   NEXT_PUBLIC_ADMIN_WEBHOOK_URL=https://webhook.site/sua-url-aqui
   ADMIN_EMAIL=seu-email@culturabuilder.com
   ```

3. Reinicie o servidor:
   ```bash
   npm run dev
   ```

### Passo 3: Testar

1. Complete um assessment no navegador
2. Volte para https://webhook.site
3. Você verá o JSON com todos os dados do assessment! ✨

### O que você receberá:

```json
{
  "timestamp": "2025-01-14T12:34:56.789Z",
  "source": "culturabuilder-assessment",
  "adminEmail": "admin@culturabuilder.com",
  "report": {
    "id": "1735729482156-x7k9p2m",
    "companyName": "Liqi Digital Assets",
    "contactEmail": "contato@liqi.com.br",
    "contactName": "João Silva",
    "industry": "Fintech",
    "teamSize": "51-100",
    "persona": "board-executive",
    "reportUrl": "http://localhost:3002/report/1735729482156-x7k9p2m",
    "createdAt": "2025-01-14T12:34:56.789Z"
  },
  "summary": {
    "paybackMonths": 4.2,
    "threeYearNPV": 2847000,
    "annualROI": 3.45
  },
  "fullReportData": { /* dados completos do relatório */ }
}
```

**Vantagens**:
- ✅ Grátis
- ✅ Instant setup (2 minutos)
- ✅ Vê dados em tempo real
- ✅ Perfeito para testar

**Desvantagens**:
- ⚠️ URL expira após 7 dias
- ⚠️ Não envia email automático
- ⚠️ Não salva em planilha

---

## 📧 Opção 2: Zapier (Email Automático - $20/mês)

### Passo 1: Criar Zap

1. Acesse https://zapier.com
2. Clique em "Create Zap"
3. **Trigger**: Webhooks by Zapier
   - Evento: "Catch Hook"
   - Copie a URL do webhook gerada

### Passo 2: Adicionar Ação - Email

1. Clique em "+" para adicionar ação
2. Escolha "Email by Zapier"
3. Ação: "Send Outbound Email"
4. Configure:
   - **To**: seu-email@culturabuilder.com
   - **Subject**: 🎯 Novo Assessment: {{companyName}}
   - **Body**:
     ```
     Nova avaliação completada!

     Empresa: {{companyName}}
     Contato: {{contactName}} ({{contactEmail}})
     Indústria: {{industry}}
     Tamanho: {{teamSize}}
     Persona: {{persona}}

     💰 Resultados:
     - Payback: {{paybackMonths}} meses
     - NPV 3 anos: R$ {{threeYearNPV}}
     - ROI Anual: {{annualROI}}%

     🔗 Ver relatório completo:
     {{reportUrl}}

     Data: {{timestamp}}
     ```

### Passo 3: (Opcional) Salvar em Google Sheets

1. Adicione outra ação
2. Escolha "Google Sheets"
3. Ação: "Create Spreadsheet Row"
4. Mapeie os campos:
   - Coluna A: {{timestamp}}
   - Coluna B: {{companyName}}
   - Coluna C: {{contactEmail}}
   - Coluna D: {{contactName}}
   - Coluna E: {{industry}}
   - Coluna F: {{teamSize}}
   - Coluna G: {{paybackMonths}}
   - Coluna H: {{threeYearNPV}}
   - Coluna I: {{reportUrl}}

### Passo 4: Configurar no projeto

```bash
# .env.local
NEXT_PUBLIC_ADMIN_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/seu-id-aqui
ADMIN_EMAIL=seu-email@culturabuilder.com
```

**Vantagens**:
- ✅ Email automático
- ✅ Salva em planilha
- ✅ Integrações ilimitadas (Slack, CRM, etc)
- ✅ Histórico permanente

**Desvantagens**:
- 💰 $20/mês (plano Starter)
- ⏱️ Setup 15-20 minutos

---

## 🔧 Opção 3: Make.com (Automação Avançada - $9/mês)

### Passo 1: Criar Scenario

1. Acesse https://make.com
2. Crie novo "Scenario"
3. Adicione módulo "Webhooks" → "Custom webhook"
4. Copie a URL gerada

### Passo 2: Adicionar Email

1. Adicione módulo "Email" → "Send an Email"
2. Configure similar ao Zapier

### Passo 3: (Opcional) Adicionar ao Notion

1. Adicione módulo "Notion" → "Create a Database Item"
2. Configure banco de dados com campos do assessment

**Vantagens**:
- ✅ Mais barato que Zapier
- ✅ Automação visual poderosa
- ✅ Muitas integrações

**Desvantagens**:
- ⏱️ Curva de aprendizado maior

---

## 🔒 Opção 4: n8n (Auto-hospedado - GRÁTIS)

Se você tem servidor próprio ou usa Railway/Render:

### Passo 1: Deploy n8n

```bash
# Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### Passo 2: Criar Workflow

1. Acesse http://localhost:5678
2. Crie workflow similar ao Make.com
3. Webhook → Email/Database

**Vantagens**:
- ✅ 100% grátis
- ✅ Sem limites
- ✅ Open source
- ✅ Dados na sua infra

**Desvantagens**:
- 🔧 Requer servidor próprio
- ⏱️ Mais complexo de configurar

---

## 📊 Comparação das Opções

| Opção | Custo | Setup | Email Auto | Planilha | Recomendado Para |
|-------|-------|-------|------------|----------|------------------|
| Webhook.site | Grátis | 2 min | ❌ | ❌ | **Teste rápido** |
| Zapier | $20/mês | 15 min | ✅ | ✅ | **Uso profissional** |
| Make.com | $9/mês | 20 min | ✅ | ✅ | Orçamento limitado |
| n8n | Grátis | 1-2h | ✅ | ✅ | Tem infra própria |

---

## 🎯 Recomendação

### Para HOJE (Testar):
**Use Webhook.site**
- Grátis
- 2 minutos de setup
- Vê se está funcionando

### Para PRODUÇÃO (Esta Semana):
**Use Zapier**
- Email automático
- Planilha de controle
- Confiável e profissional

---

## 🔍 Como Testar

### Teste Local

1. Configure webhook URL no `.env.local`
2. Reinicie servidor: `npm run dev`
3. Complete um assessment
4. Confira no webhook/email

### Teste de Console

Abra o console do navegador após completar assessment:
```
✅ Admin notification sent
```

Se ver erro:
```
⚠️  Admin notification failed (non-blocking)
```

Confira:
1. URL do webhook está correta no `.env.local`?
2. Servidor foi reiniciado após adicionar variável?
3. URL do webhook está ativa (não expirou)?

---

## 🐛 Troubleshooting

### Problema: "Webhook not configured"

**Solução**:
```bash
# Verifique se tem o arquivo .env.local
ls -la .env.local

# Se não tiver, crie:
touch .env.local

# Adicione:
NEXT_PUBLIC_ADMIN_WEBHOOK_URL=https://webhook.site/sua-url
ADMIN_EMAIL=seu-email@culturabuilder.com

# Reinicie:
npm run dev
```

### Problema: Webhook não recebe nada

**Checklist**:
- [ ] URL está correta (sem espaços ou quebras de linha)?
- [ ] Servidor foi reiniciado?
- [ ] Assessment foi completado até o fim (gerou relatório)?
- [ ] Console mostra "✅ Admin notification sent"?

### Problema: Email não chega (Zapier)

**Checklist**:
- [ ] Zap está ativo (toggle verde)?
- [ ] Testou o Zap manualmente?
- [ ] Email não está na spam?
- [ ] Endereço está correto?

---

## 📝 Próximos Passos (Futuro)

Quando tiver > 50 assessments/semana, considere:

1. **Backend Próprio com Supabase**
   - Dashboard admin rico
   - Analytics avançado
   - Pesquisa e filtros
   - Tempo: 8-12 horas

2. **CRM Integration**
   - Webhook → HubSpot/Pipedrive
   - Lead automático
   - Pipeline de vendas

3. **BI Dashboard**
   - Métricas em tempo real
   - Conversão por fonte
   - ROI por indústria

---

## ✅ Checklist Final

Antes de enviar para clientes:

- [ ] Webhook configurado e testado
- [ ] Email de notificação funcionando
- [ ] Planilha recebendo dados (se usando)
- [ ] `.env.local` adicionado ao `.gitignore`
- [ ] Testado com 2-3 assessments reais
- [ ] Confirmado que recebe TODOS os dados necessários

**Está pronto para receber leads! 🚀**
