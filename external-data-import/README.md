# External Data Import - Klini/Hospital Casa

Este módulo processa dados de planilhas CSV geradas por quiz externos e gera relatórios de AI Readiness individuais e consolidados.

## Estrutura

```
external-data-import/
├── klini-responses.csv          # Planilha original com respostas
├── csv-processor/
│   ├── types.ts                 # TypeScript types para CSV
│   ├── parser.ts                # Parser de CSV
│   └── mapper.ts                # Mapeador CSV → AssessmentData
├── process-klini-data.spec.ts   # Script Playwright principal
├── reports/                     # Relatórios gerados
│   ├── individual/              # Relatórios por departamento
│   ├── consolidated/            # Relatórios consolidados por empresa
│   ├── csv-analysis.json        # Análise da estrutura do CSV
│   └── SUMMARY.json             # Resumo geral
└── README.md                    # Este arquivo
```

## Fontes de Dados

Os dados foram coletados de dois quiz independentes:
- **Tutoria IA**: https://tutoria-ia.vercel.app/
- **Hospital Casa**: https://hospital-casa.vercel.app/

Ambos alimentam a mesma planilha CSV com informações de diferentes departamentos.

## Empresas Identificadas

### Hospital Casa
- Nutrição (Catia Helena)
- Hotelaria (Patricia)
- TI (Fabio)
- Central Cirúrgica (Angélica Butter)
- Farmácia (Debora)
- Agendamento Cirúrgico (Angélica Butter)
- Compras (Cristiane)
- Comercial (Felipe)

### Klini Saúde
- Pós-Vendas (Temis)
- Regulação (Stephanye)

## Como Usar

### 1. Processar os dados e gerar relatórios

```bash
npx playwright test external-data-import/process-klini-data.spec.ts
```

### 2. Ver apenas a análise do CSV

```bash
npx playwright test external-data-import/process-klini-data.spec.ts -g "analyze CSV"
```

### 3. Gerar apenas relatórios individuais

```bash
npx playwright test external-data-import/process-klini-data.spec.ts -g "individual"
```

### 4. Gerar apenas relatórios consolidados

```bash
npx playwright test external-data-import/process-klini-data.spec.ts -g "consolidated"
```

## Relatórios Gerados

### Relatórios Individuais
Cada departamento gera um relatório completo incluindo:
- ✅ ROI calculado para o contexto específico
- ✅ Roadmap personalizado
- ✅ Benchmarks da indústria
- ✅ Recomendações específicas
- ✅ Métricas de confiança

**Localização:** `reports/individual/`

**Exemplo:**
```
Hospital-Casa_nutrition_Catia-Helena-de-Assis-Pereira-Porto.json
Hospital-Casa_it_Fabio-Henriques-da-Silva.json
Klini-Saúde_postsales_Temis-Ilma-de-Assis-Rocha.json
```

### Relatórios Consolidados
Cada empresa recebe um relatório agregado com:
- ✅ Visão integrada de todos os departamentos
- ✅ ROI consolidado considerando sinergias
- ✅ Roadmap integrado
- ✅ Análise de impacto organizacional

**Localização:** `reports/consolidated/`

**Exemplo:**
```
Hospital-Casa_CONSOLIDATED.json
Klini-Saúde_CONSOLIDATED.json
```

## Mapeamento de Dados

### CSV → Assessment

O mapeador (`mapper.ts`) converte os dados do CSV para o formato `AssessmentData`:

| CSV Field | Assessment Field | Transformação |
|-----------|-----------------|---------------|
| Team Size | companyInfo.size | Map para número exato |
| Data Usage | N/A | Usado para contexto |
| Time Spent | N/A | Usado para contexto |
| Current Software | currentTools | Extração de ferramentas |
| Current AI | aiToolsUsage | Map para enum |
| Business Impact | N/A | Usado para contexto |
| Manual Processes | metadata | Preservado como contexto |
| Main Pain | painPoints | Extração de pain points |

### Detecção Automática

O sistema detecta automaticamente:
- ✅ Indústria (baseada no nome da empresa)
- ✅ Persona (baseada no departamento)
- ✅ Ferramentas usadas (parsing do campo software)
- ✅ Pain points (análise de texto livre)
- ✅ AI usage level (conversão do campo)

## Estrutura dos Relatórios

Cada relatório JSON contém:

```json
{
  "id": "unique-id",
  "companyName": "Hospital Casa - Nutrição",
  "industry": "healthcare",
  "teamSize": 75,
  "roi": {
    "paybackPeriod": 0.3,
    "npv": 6287568,
    "annualROI": 4455.6
  },
  "roadmap": [...],
  "recommendations": [...],
  "metadata": {
    "source": "csv-import",
    "originalDepartment": "nutrition",
    "originalData": {
      "manualProcesses": "...",
      "processImpact": "...",
      "successMetrics": "...",
      "integrationNeeds": "..."
    }
  }
}
```

## Limpeza de Dados

O parser automaticamente:
- ❌ Remove entradas de teste
- ❌ Remove dados incompletos
- ✅ Trata campos multiline do CSV
- ✅ Valida campos obrigatórios

## Próximos Passos

Após gerar os relatórios, você pode:

1. **Visualizar os relatórios** usando nosso sistema de layouts:
   ```
   http://localhost:3003/report/[report-id]
   ```

2. **Exportar para PDF/Excel** usando os botões de export

3. **Comparar departamentos** lado a lado

4. **Criar apresentações** para stakeholders

## Notas Técnicas

- ⚠️ Dados sensíveis são preservados apenas em `metadata`
- ⚠️ Emails são gerados automaticamente (não são reais)
- ⚠️ ROI é calculado com premissas conservadoras
- ✅ Todos os dados originais são mantidos para auditoria
