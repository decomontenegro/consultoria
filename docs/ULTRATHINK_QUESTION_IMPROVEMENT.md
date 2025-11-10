# ULTRATHINK: Análise Profunda e Melhoria das Perguntas do Assessment

## 🎯 Objetivo
Transformar perguntas genéricas em conversas que extraem **contexto operacional real** da empresa, permitindo análises e recomendações muito mais precisas e acionáveis.

---

## 📊 Análise das Perguntas Atuais

### Perguntas do AI Router (5 questões iniciais):

1. **"Qual o principal desafio de tecnologia ou inovação da sua empresa hoje?"**
   - ❌ **Problema**: Muito aberta, resposta genérica tipo "melhorar produtividade"
   - ❌ **Falta**: Não extrai métricas, números, impacto real
   - ❌ **Resultado**: Respostas vagas como "equipe lenta" sem contexto

2. **"Qual seu cargo ou função na empresa?"**
   - ✅ **OK**: Boa para detectar persona
   - ⚠️ **Limitação**: Não pergunta sobre responsabilidades reais

3. **"Quantos funcionários tem sua empresa aproximadamente?"**
   - ✅ **OK**: Coleta dado estruturado
   - ❌ **Falta**: Não pergunta sobre time de tech especificamente

4. **"Em qual setor ou indústria sua empresa atua?"**
   - ✅ **OK**: Coleta setor
   - ❌ **Falta**: Não pergunta sobre modelo de negócio, complexidade operacional

5. **"Você já tem orçamento definido para investir nessa área ou ainda está explorando possibilidades?"**
   - ⚠️ **Genérica**: Pergunta binária simples
   - ❌ **Falta**: Não extrai QUANTO, não pergunta sobre urgência real

---

## 🔍 Por Que Essas Perguntas São Insuficientes?

### 1. **Falta de Contexto Operacional Real**

As perguntas atuais não capturam:
- **Processos atuais**: Como a empresa trabalha hoje?
- **Pain points mensuráveis**: Quanto tempo/dinheiro está sendo perdido?
- **Escala operacional**: Quantos deploys/mês? Quantos tickets? Quantas vendas?
- **Maturidade técnica**: Tem CI/CD? Automação? Monitoramento?
- **Impacto nos resultados**: Como isso afeta receita, NPS, churn?

### 2. **Respostas Genéricas Geram Análises Genéricas**

**Exemplo real do problema:**

**Pergunta atual**: "Qual o principal desafio?"
**Resposta típica**: "Melhorar produtividade da equipe"

**O que NÃO sabemos**:
- Produtividade de quem? Dev? Vendas? CS?
- Quanto tempo estão perdendo? 10h/semana? 30h/semana?
- Qual o custo disso? R$ 50k/ano? R$ 500k/ano?
- Qual a causa raiz? Processos? Ferramentas? Skills?
- Como eles medem produtividade hoje?

**Resultado**: Relatório genérico que poderia ser de qualquer empresa.

### 3. **Sugestões de IA Ficam Vagas**

Com perguntas genéricas, a IA sugere respostas como:
- "Sim, temos orçamento"
- "Não, ainda explorando"
- "Entre R$ 50k-100k"

Sem contexto operacional, essas respostas não ajudam.

---

## 💡 PROPOSTA: Nova Estrutura de Perguntas

### Filosofia: **"Mostre, Não Diga"**

Ao invés de perguntar "você tem problema X?", perguntar **"como você faz Y hoje?"**
e **"quanto tempo/dinheiro isso está custando?"**

---

## 🚀 Nova Sequência de Perguntas (AI Router)

### **Pergunta 1: Contexto e Urgência Real**
```
"Olá! Sou o CulturaBuilder AI. Para te ajudar melhor, me conte:

O que te trouxe aqui hoje? Tem algum problema específico que você precisa resolver nos próximos 3-6 meses?"
```

**Por quê?**
- Captura URGÊNCIA real
- Identifica se é problema específico ou exploração
- Timeline dá contexto de pressão

**Sugestões de IA melhoradas**:
- "Sim - decisão de Board em 30 dias"
- "Sim - equipe travada em processo manual"
- "Sim - perdendo clientes para concorrentes com IA"
- "Não - ainda explorando possibilidades"
- "Sim - budget aprovado preciso alocar este trimestre"

---

### **Pergunta 2: Papel + Responsabilidades Reais**
```
"Entendi. Me conta: qual seu cargo e, mais importante, o que você é responsável por entregar na empresa?"
```

**Por quê?**
- Não é só "CTO" - é "CTO responsável por reduzir time-to-market"
- Captura KPIs e métricas que a pessoa responde
- Permite personalizar relatório para SUAS métricas

**Sugestões de IA melhoradas**:
- "CTO - responsável por velocidade de entrega"
- "Head of Engineering - reduzir bugs em produção"
- "VP Product - aumentar conversão do funil"
- "CFO - otimizar custos operacionais"
- "CEO - crescer receita 3x este ano"

---

### **Pergunta 3: Tamanho + Estrutura da Operação**
```
"Quantas pessoas tem na empresa? E especificamente, quantas pessoas no time de tecnologia/produto?"
```

**Por quê?**
- Entender proporção tech/não-tech
- Saber se tem time dedicado ou terceirizado
- Calcular custo de oportunidade real

**Sugestões de IA melhoradas**:
- "50 pessoas total, 5 devs"
- "150 pessoas, 30 em tech/produto"
- "10 pessoas, sem dev dedicado (terceirizado)"
- "500+ pessoas, 80 em engineering"

---

### **Pergunta 4: Como Funciona Hoje (Processo Real)**
```
"Me conte um pouco sobre como vocês trabalham hoje:

- Como é o processo desde uma ideia até estar em produção?
- Demora quanto tempo tipicamente?
- Quais as principais dores desse processo?"
```

**Por quê?**
- Captura PROCESSO real, não hipotético
- Identifica gargalos específicos
- Permite calcular ROI baseado em tempo real

**Sugestões de IA melhoradas**:
- "Ideias levam 2-3 meses para produção - muito lento"
- "Deploys semanais mas cheios de bugs"
- "Processo todo manual - sem CI/CD"
- "Rápido para MVP mas não escalamos bem"
- "Aprovações demoram semanas - muita burocracia"

---

### **Pergunta 5: Impacto Mensurável**
```
"Esse problema está impactando a empresa de alguma forma mensurável?

Por exemplo: perda de clientes, atraso em lançamentos, custos extras, oportunidades perdidas?"
```

**Por quê?**
- Quantifica o CUSTO DA INAÇÃO
- Justifica investimento
- Prioriza urgência

**Sugestões de IA melhoradas**:
- "Sim - perdemos 2 clientes este trimestre"
- "Sim - lançamento atrasou 4 meses"
- "Sim - pagamos ~R$50k/mês em overtime"
- "Sim - concorrente lançou antes e ganhou mercado"
- "Não, mas sentimos que estamos ficando para trás"

---

### **Pergunta 6 (SE relevante): Orçamento e Decision Making**
```
"Você já tem orçamento aprovado para investir nessa área ou ainda está em fase de análise?

Se tiver estimativa, pode compartilhar a faixa de investimento que considera viável?"
```

**Por quê?**
- Qualifica lead
- Ajusta recomendações ao budget
- Identifica urgência (budget aprovado = mais urgente)

**Sugestões de IA melhoradas**:
- "Sim - entre R$ 50k-100k aprovado"
- "Sim - até R$ 300k este ano"
- "Sim - R$ 500k+ para transformação completa"
- "Não - preciso justificar investimento primeiro"
- "Depende do ROI - apresento para Board"

---

## 🎯 Nova Sequência para Express Mode (Após AI Router)

Após o AI Router, **Express Mode** deve fazer perguntas **ESPECÍFICAS** baseadas no contexto capturado.

### Exemplo para CTO que respondeu "equipe lenta em desenvolvimento":

#### **Pergunta Express 1: Quantificar Problema**
```
"Você mencionou que o time está lento. Em média, quantos deploys/releases vocês fazem por mês atualmente?"
```

**Sugestões**:
- "1-2 deploys por mês"
- "Semanal (~4/mês)"
- "Diário ou múltiplos por dia"
- "Menos de 1 por mês"

#### **Pergunta Express 2: Gargalos Específicos**
```
"Onde está o maior gargalo no processo de desenvolvimento hoje?"
```

**Sugestões**:
- "Code review demora muito"
- "Testes manuais demoram dias"
- "Aprovações/compliance travam fluxo"
- "Infraestrutura/deploy é complicado"
- "Specs/requirements não ficam claros"

#### **Pergunta Express 3: Ferramentas Atuais**
```
"Quais ferramentas de desenvolvimento e automação vocês usam hoje?"
```

**Sugestões**:
- "GitHub/GitLab + CI/CD básico"
- "Só Git - sem automação"
- "Stack completo: CI/CD, monitoring, etc"
- "Ferramentas legadas/antigas"
- "Mix de várias ferramentas sem integração"

#### **Pergunta Express 4: Skills do Time**
```
"Como você avalia o nível técnico médio do time?"
```

**Sugestões**:
- "Júnior - precisam de muita orientação"
- "Mid-level - autônomos mas limitados"
- "Sênior - expertise técnico forte"
- "Mix - alguns seniors, maioria junior"
- "Alta rotatividade - sempre treinando"

#### **Pergunta Express 5: AI Hoje**
```
"Alguém no time já usa ferramentas de AI hoje? Se sim, quais e como?"
```

**Sugestões**:
- "Sim - GitHub Copilot amplamente"
- "Alguns usam ChatGPT informalmente"
- "Não - não temos ferramentas de AI"
- "Piloto com 2-3 pessoas"
- "Bloqueado por compliance/segurança"

---

## 📈 Impacto Esperado das Novas Perguntas

### **ANTES (Perguntas Atuais)**
```
User: "Desafio é melhorar produtividade"
System: "Ok, você tem 50 pessoas, é fintech, ainda explorando orçamento"

→ Relatório genérico sobre "como AI pode melhorar produtividade"
→ ROI baseado em benchmarks genéricos
→ Recomendações amplas
```

### **DEPOIS (Novas Perguntas)**
```
User:
- "Time de 5 devs fazendo 1-2 deploys/mês"
- "Gargalo em code review que demora dias"
- "Usam só Git sem automação"
- "Time mid-level sem CI/CD"
- "Ninguém usa AI ainda"
- "Lançamento atrasou 3 meses - perdemos vantagem competitiva"

→ Relatório ESPECÍFICO:
   "Você está perdendo ~R$120k/ano em velocidade de entrega
    Seu time de 5 devs poderia fazer 4x mais deploys com:
    1. GitHub Copilot → +30% velocidade de código
    2. CI/CD automatizado → 80% redução em tempo de review
    3. AI code review → feedback em minutos vs dias

    ROI estimado: R$250k/ano em velocidade + qualidade
    Payback: 2.4 meses

    Próximos passos ESPECÍFICOS para seu contexto..."
```

---

## 🔧 Implementação Técnica Necessária

### 1. **Atualizar `DISCOVERY_QUESTIONS` em `assessment-router.ts`**
```typescript
export const DISCOVERY_QUESTIONS = [
  {
    id: 'urgency-context',
    text: 'O que te trouxe aqui hoje? Tem algum problema específico que você precisa resolver nos próximos 3-6 meses?',
    extractors: ['urgency', 'specific_problem', 'timeline']
  },
  {
    id: 'role-responsibilities',
    text: 'Qual seu cargo e o que você é responsável por entregar na empresa?',
    extractors: ['persona', 'kpis', 'responsibilities']
  },
  // ... resto das perguntas
];
```

### 2. **Melhorar Extração de Dados em `extractPartialData()`**
Adicionar extração de:
- Tamanho do time de tech
- Frequência de deploys
- Ferramentas atuais
- Gargalos específicos
- Impacto mensurável (clientes perdidos, atrasos, custos)

### 3. **Criar Perguntas Dinâmicas para Express Mode**
Perguntas devem ser **context-aware**:
- Se CTO → perguntas técnicas de processo
- Se CFO → perguntas de custos e eficiência
- Se CEO → perguntas de impacto em negócio
- Se mencionou "lento" → perguntar sobre quantificação
- Se mencionou "bugs" → perguntar sobre incidentes
- Se mencionou "custos" → perguntar sobre valores

### 4. **Atualizar Prompts de Sugestões de IA**
```typescript
const systemPrompt = `
Gere sugestões ESPECÍFICAS e OPERACIONAIS, não genéricas.

Contexto: ${previousAnswers}
Persona detectada: ${detectedPersona}
Problema mencionado: ${mainProblem}

BOAS sugestões (específicas, operacionais):
- "5 devs - fazemos 1-2 deploys/mês"
- "Code review demora 2-3 dias"
- "Perdemos 2 clientes este trimestre"
- "R$50k em overtime todo mês"

RUINS sugestões (genéricas):
- "Melhorar produtividade"
- "Sim, temos orçamento"
- "Time é lento"
`;
```

---

## 🎁 Benefícios da Nova Abordagem

### 1. **Relatórios Personalizados**
- ROI baseado em SEUS números reais
- Recomendações específicas para SEUS gargalos
- Timeline baseado na SUA urgência

### 2. **Confiança do Usuário**
- "Essa ferramenta ENTENDE minha operação"
- Transparência sobre dados (badge de qualidade)
- Relatório que parece consultoria personalizada

### 3. **Melhor Conversão**
- Leads qualificados (sabemos budget, urgência, impacto)
- Mais engajamento (perguntas interessantes)
- Follow-up específico (sabemos exatamente o que oferecer)

### 4. **Diferenciação Competitiva**
- Outros assessments: perguntas genéricas checkbox
- Nós: conversa inteligente que extrai contexto real
- Relatórios acionáveis vs teóricos

---

## 📋 Próximos Passos Recomendados

### **Fase 1: MVP - AI Router**
1. ✅ Reescrever as 5-6 perguntas do AI Router
2. ✅ Atualizar extractores de dados
3. ✅ Melhorar prompts de sugestões de IA
4. ✅ Testar com usuários reais

**Timeline**: 1-2 dias
**Impacto**: Alto (afeta todos os assessments)

### **Fase 2: Express Mode Context-Aware**
1. Criar sistema de perguntas dinâmicas baseadas em contexto
2. Diferentes flows para diferentes personas
3. Perguntas adaptativas baseadas em respostas anteriores
4. Quantificar tudo (tempo, dinheiro, impacto)

**Timeline**: 3-4 dias
**Impacto**: Muito Alto (transforma relatórios)

### **Fase 3: Deep Dive Especializado**
1. Cada especialista com perguntas ultra-específicas
2. Engineering: arquitetura, stack, processos, métricas
3. Finance: custos detalhados, ROI components
4. Strategy: mercado, competição, oportunidades

**Timeline**: 5-7 dias
**Impacto**: Altíssimo (relatórios de consultoria premium)

---

## 💬 Exemplos de Conversas (Antes vs Depois)

### **ANTES**
```
AI: "Qual o principal desafio?"
User: "Melhorar produtividade"

AI: "Qual seu cargo?"
User: "CTO"

AI: "Quantos funcionários?"
User: "50"

→ Relatório genérico sobre AI aumentar produtividade
```

### **DEPOIS**
```
AI: "O que te trouxe aqui? Tem problema específico nos próximos 3-6 meses?"
User: "Sim - Board quer reduzir time-to-market pela metade até Q2"

AI: "Qual seu cargo e o que você é responsável por entregar?"
User: "CTO - responsável por velocidade de entrega e qualidade"

AI: "Quantas pessoas total e no time de tech?"
User: "50 total, 8 devs + 2 QA"

AI: "Como é o processo hoje desde ideia até produção?"
User: "Ideias levam 6-8 semanas. Gargalo é review manual e testes. Fazemos 2 deploys/mês"

AI: "Isso está impactando negócio de forma mensurável?"
User: "Sim - competidor lançou feature que planejávamos há 3 meses. Perdemos 3 clientes"

AI: "Tem orçamento aprovado?"
User: "R$150k aprovado este trimestre se ROI for claro"

→ Relatório ULTRA-ESPECÍFICO:
   "Você está 4x mais lento que benchmarks do setor
    Seu gargalo está em review manual (2-3 dias)

    Com GitHub Copilot + CI/CD + AI Review:
    - Redução de 50% no time-to-market (6-8 sem → 3-4 sem)
    - Aumento para 8-10 deploys/mês
    - ROI: R$320k/ano em velocidade
    - Payback: 1.7 meses

    Próximos passos para atingir meta do Board em Q2:
    1. [...]"
```

---

## 🎯 Conclusão

As perguntas atuais são **superficiais demais** para gerar análises realmente valiosas.

**A mudança fundamental**:
- De "o que você quer?"
- Para "como você trabalha hoje e quanto isso está custando?"

**O resultado**:
- Relatórios que **parecem consultoria personalizada**
- Ao invés de **template genérico**

**Esforço**: 2-4 dias de implementação
**Impacto**: Transformação completa da qualidade dos relatórios

---

**Próximo passo**: Implementar Fase 1 (AI Router) e testar com usuários reais? 🚀
