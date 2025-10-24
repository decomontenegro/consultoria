# Guia de Deployment - CulturaBuilder

## ✅ Status Atual

**Código no GitHub:** https://github.com/decomontenegro/consultoria.git
**Branch:** `main`
**Último commit:** `4d3f7bc` - Importação CSV + Internacionalização PT-BR

## 🚀 Deploy no Vercel

### Método 1: Deploy Automático (Recomendado)

O projeto já está configurado com Vercel. Quando você fizer push para GitHub, o Vercel detectará automaticamente e fará o deploy.

**Se o projeto já está conectado ao Vercel:**
1. ✅ Push foi feito com sucesso para GitHub
2. ✅ Vercel detectará as mudanças automaticamente
3. ✅ Deploy será iniciado em ~2-3 minutos
4. ✅ URL de produção será atualizada

**Verifique o status do deploy em:**
- https://vercel.com/dashboard
- Procure pelo projeto "consultoria" ou "culturabuilder-assessment"

### Método 2: Deploy Manual via CLI

Se você quiser fazer deploy manualmente:

```bash
# Instalar Vercel CLI (se ainda não tiver)
npm i -g vercel

# Login na Vercel
vercel login

# Deploy para produção
vercel --prod
```

### Método 3: Conectar Novo Projeto no Vercel

Se este for o primeiro deploy:

1. Acesse https://vercel.com/new
2. Importe o repositório: `decomontenegro/consultoria`
3. Configure as variáveis de ambiente (se necessário)
4. Clique em "Deploy"

## 📦 Estrutura do Projeto para Deploy

### Arquivos Incluídos no Deploy

✅ **Código da Aplicação:**
- `/app` - Pages e API routes
- `/components` - Componentes React
- `/lib` - Lógica de negócio e utilitários
- `/public` - Assets estáticos

✅ **Dados Importados:**
- `/external-data-import/reports` - Relatórios gerados do CSV
  - `individual/` - 16 relatórios individuais
  - `consolidated/` - 2 relatórios consolidados
  - `SUMMARY.json` - Índice geral

✅ **Traduções:**
- `/lib/i18n/pt-BR.ts` - Traduções em português

### Arquivos Excluídos do Deploy

❌ (via .gitignore):
- `/node_modules`
- `/.next`
- `/tests` (não necessário em produção)
- `/.vercel` (configuração local)

## 🌐 URLs Disponíveis no Deploy

Após o deploy, as seguintes rotas estarão disponíveis:

### Páginas Principais
- `/` - Homepage
- `/assessment` - Questionário de avaliação
- `/imported-reports` - Índice de relatórios importados do CSV

### Relatórios
- `/report/[id]` - Visualização de relatório individual
- Exemplo: `/report/1761310379985-yz3qhfo`

### API Routes
- `/api/imported-reports` - Lista todos os relatórios importados
- `/api/imported-reports/[id]` - Retorna relatório específico

## ⚙️ Variáveis de Ambiente

### Necessárias (se houver)

Verifique o arquivo `.env.example` para ver quais variáveis são necessárias.

**No Vercel Dashboard:**
1. Vá em Settings → Environment Variables
2. Adicione cada variável necessária
3. Clique em "Save"

### Variáveis Atuais

Baseado no `.env.example`, você pode precisar configurar:
- `NEXT_PUBLIC_API_URL` (se aplicável)
- Outras variáveis de API externas

## 📊 Dados dos Relatórios CSV

### Como os Dados são Servidos

Os relatórios importados são **arquivos estáticos JSON** incluídos no deploy:

```
external-data-import/
├── reports/
│   ├── individual/        → 16 arquivos JSON (~15KB cada)
│   ├── consolidated/      → 2 arquivos JSON (~16KB cada)
│   └── SUMMARY.json       → Índice geral
```

**Vantagens:**
- ✅ Sem necessidade de banco de dados
- ✅ Carregamento instantâneo
- ✅ Funciona em qualquer plataforma de hosting
- ✅ Sem custo adicional de infraestrutura

### Atualizando os Dados CSV

Para adicionar novos relatórios no futuro:

1. Execute o script de processamento:
   ```bash
   npx playwright test tests/process-klini-data.spec.ts --project=chromium
   ```

2. Commit e push das mudanças:
   ```bash
   git add external-data-import/reports
   git commit -m "📊 Update: Novos relatórios CSV"
   git push origin main
   ```

3. Vercel fará redeploy automático

## 🔧 Configuração de Build

### Settings Padrão (Vercel)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "devCommand": "npm run dev"
}
```

### Framework Preset
- **Framework:** Next.js
- **Versão Node:** 18.x ou 20.x (recomendado)

## ✅ Checklist de Deploy

Antes de fazer deploy em produção, verifique:

- [x] Código commitado e pushed para GitHub
- [x] Build local está funcionando (`npm run build`)
- [x] Testes passando (`npm test` se aplicável)
- [x] Variáveis de ambiente configuradas (se necessário)
- [x] Relatórios CSV incluídos em `/external-data-import/reports`
- [x] Traduções PT-BR aplicadas
- [x] Screenshots de validação gerados

## 📱 Após o Deploy

### Verificações Pós-Deploy

1. **Homepage:**
   - Acesse a URL de produção
   - Verifique se o link "Relatórios CSV" aparece no header

2. **Relatórios Importados:**
   - Acesse `/imported-reports`
   - Verifique se os 18 cards aparecem (16 individuais + 2 consolidados)
   - Teste clique em um card

3. **Visualização de Relatório:**
   - Acesse um relatório individual
   - Verifique se todas as seções aparecem em português
   - Teste o seletor de layout
   - Verifique os botões de export

4. **API Routes:**
   - Teste: `https://[seu-dominio]/api/imported-reports`
   - Deve retornar JSON com lista de relatórios

### Monitoramento

**Vercel Analytics:**
- Ative em: Settings → Analytics
- Monitore performance e erros

**Logs:**
- Acesse: Deployments → [Seu deploy] → Function Logs
- Verifique se há erros nas API routes

## 🐛 Troubleshooting

### Problema: Relatórios não aparecem

**Solução:**
1. Verifique se os arquivos estão no repositório:
   ```bash
   git ls-files external-data-import/reports
   ```
2. Se não estiverem, adicione-os:
   ```bash
   git add external-data-import/reports -f
   git commit -m "fix: Add CSV reports to repository"
   git push
   ```

### Problema: Erros 404 nas rotas

**Solução:**
- Verifique se o build completou sem erros
- Limpe o cache do Vercel: Settings → General → Clear Cache

### Problema: Variáveis de ambiente não funcionam

**Solução:**
- Variáveis com `NEXT_PUBLIC_` precisam de redeploy completo
- Outras variáveis são aplicadas em runtime

## 🎯 Deploy Checklist Final

```bash
# 1. Verificar build local
npm run build

# 2. Testar localmente
npm start

# 3. Commit final
git add -A
git commit -m "✅ Ready for production deploy"
git push origin main

# 4. Aguardar deploy automático do Vercel
# Ou fazer deploy manual:
vercel --prod
```

## 📞 Suporte

**Documentação Vercel:**
- https://vercel.com/docs

**Documentação Next.js:**
- https://nextjs.org/docs

**Issues GitHub:**
- https://github.com/decomontenegro/consultoria/issues

---

## 🎉 Deploy Completo!

Após seguir este guia, seu projeto estará em produção com:
- ✅ Interface completa em português
- ✅ 16 relatórios individuais de departamentos
- ✅ 2 relatórios consolidados por empresa
- ✅ Sistema de layouts profissionais
- ✅ API routes funcionais
- ✅ Performance otimizada

**URL de Produção:** Será fornecida pelo Vercel após o deploy

**Tempo estimado de deploy:** 2-5 minutos
