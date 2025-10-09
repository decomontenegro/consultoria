# Estudo de UX - Consulta AI Multi-Persona

## 📋 Visão Geral

Este diretório contém um estudo abrangente de UX testando o fluxo de consulta AI com **5 personas × 5 cenários = 25 testes E2E**.

### Estrutura

```
tests/
├── mocks/
│   └── claude-mock.ts          # Mock da API Anthropic (respostas simuladas)
├── fixtures/
│   └── persona-scenarios.ts    # 25 cenários de teste
├── analysis/
│   └── analyze-results.ts      # Script de análise de resultados
├── reports/
│   ├── test-results-*.json     # Resultados brutos (JSON)
│   └── persona-study-report-*.md # Relatório final (Markdown)
└── ai-consultation-personas.spec.ts # Testes E2E com Playwright
```

## 🎯 Personas Testadas

1. **board-executive** - Executivo C-Level / Conselho
2. **finance-ops** - Executivo Finanças / Operações
3. **product-business** - Líder Produto / Negócios
4. **engineering-tech** - Líder Engenharia / Tecnologia
5. **it-devops** - Gerente TI / DevOps

## 📊 Cenários por Persona

Cada persona é testada com 5 cenários diferentes:

1. **Otimista** - Empresa crescendo, quer acelerar
2. **Pessimista** - Muitos problemas, baixa confiança
3. **Realista** - Misto de desafios e oportunidades
4. **Cético** - Resistente a AI, precisa ROI provado
5. **Urgente** - Problemas críticos, timeline agressivo

## 🚀 Como Executar

### 1. Pré-requisitos

```bash
# Instalar dependências (se necessário)
npm install

# Garantir que servidor dev está rodando
npm run dev
```

### 2. Executar Todos os 25 Testes

```bash
# Opção 1: Via Playwright UI (recomendado para debug)
npx playwright test --ui tests/ai-consultation-personas.spec.ts

# Opção 2: Via linha de comando
npx playwright test tests/ai-consultation-personas.spec.ts

# Opção 3: Apenas uma persona específica
npx playwright test tests/ai-consultation-personas.spec.ts --grep "board-executive"
```

### 3. Analisar Resultados

```bash
# Gerar relatório de análise
npx ts-node tests/analysis/analyze-results.ts
```

## 📈 Métricas Coletadas

Para cada um dos 25 testes:

- **Tópicos Sugeridos** - Quantos e se são apropriados ao perfil
- **Perguntas Feitas** - Quantidade e adequação ao nível de abstração
- **Fluxo da Conversa** - Se opção "Continuar/Finalizar" aparece
- **Jargão Técnico** - Uso inadequado em perfis não-técnicos
- **Insights Salvos** - Se seção aparece corretamente no report

## 📄 Relatório Final

O relatório gerado inclui:

### Executive Summary
- Taxa de sucesso geral
- Estatísticas agregadas

### Análise por Persona
- Performance de cada perfil
- Problemas comuns
- Resultados por cenário

### Análise por Cenário
- Qual tipo de cenário funciona melhor
- Problemas específicos

### Problemas Críticos
- Issues que afetam múltiplos testes
- Frequência e impacto

### Recomendações Priorizadas
- **P0 (Crítico)** - Issues que afetam 5+ testes
- **P1 (Alto)** - Problemas de persona específica
- **P2 (Médio)** - Melhorias de cenário
- **P3 (Baixo)** - Nice-to-haves

## 🧪 Exemplo de Resultado

```markdown
## 📊 Executive Summary

- **Taxa de Sucesso:** 92.0%
- **Testes Passados:** 23/25
- **Testes Falhados:** 2/25

## 🎭 Análise por Persona

| Persona           | Testes | Passou | Score Topics | Flow OK |
|-------------------|--------|--------|--------------|---------|
| board-executive   | 5      | 5 (100%) | 80%        | 100%    |
| finance-ops       | 5      | 5 (100%) | 100%       | 100%    |
| product-business  | 5      | 4 (80%)  | 60%        | 100%    |
| engineering-tech  | 5      | 5 (100%) | 100%       | 100%    |
| it-devops         | 5      | 4 (80%)  | 80%        | 80%     |
```

## 🔍 O Que É Testado

### ✅ Validações Positivas

- Tópicos gerados são relevantes ao perfil?
- Perguntas usam linguagem adequada (negócio vs técnica)?
- Fluxo não corta conversa abruptamente?
- Usuário tem controle (pode continuar ou finalizar)?
- Insights salvos e exibidos no report?

### ❌ Validações Negativas

- Board Executive recebe perguntas sobre "débito técnico"?
- Finance/Ops recebe perguntas muito técnicas?
- Engineering recebe perguntas muito superficiais?
- Fluxo força usuário a responder 5 perguntas obrigatórias?

## 🛠️ Customização

### Adicionar Novo Cenário

Edite `fixtures/persona-scenarios.ts`:

```typescript
const scenarioTemplates = {
  // ... existing scenarios
  meuNovoTipo: {
    currentState: { ... },
    goals: { ... },
    simulatedResponses: [ ... ],
  },
};
```

### Modificar Mock de Respostas

Edite `mocks/claude-mock.ts`:

```typescript
const personaResponses = {
  'board-executive': {
    question1: [{
      text: 'Sua pergunta customizada',
      isAppropriate: true,
      abstractionLevel: 'strategic',
    }],
  },
};
```

## 📊 Exportar Resultados

Resultados são salvos automaticamente em:

- **JSON:** `reports/test-results-[timestamp].json`
- **Markdown:** `reports/persona-study-report-[timestamp].md`

Para exportar para Excel:
```bash
# Manual: Abrir JSON no Excel ou Google Sheets
```

## 🐛 Troubleshooting

### Testes Falham com Timeout

```bash
# Aumentar timeout no playwright.config.ts
timeout: 60000, // 60 segundos
```

### Mock não funciona

Verifique se servidor dev está rodando:
```bash
npm run dev
# Em outro terminal:
npx playwright test
```

### Resultados não aparecem

```bash
# Criar diretório manualmente
mkdir -p tests/reports
```

## 📝 Contribuindo

Para melhorar os testes:

1. Adicione novos cenários em `fixtures/`
2. Melhore mocks em `mocks/`
3. Adicione métricas em `analysis/`
4. Execute e compare resultados

## 🎯 Próximos Passos

Após análise dos resultados:

1. Identificar personas problemáticas
2. Ajustar prompts em `lib/prompts/`
3. Melhorar geração de tópicos
4. Re-executar testes
5. Validar melhorias

---

**Dúvidas?** Consulte a documentação principal ou abra uma issue.
