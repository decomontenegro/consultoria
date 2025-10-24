# Análise Crítica de Segurança e Privacidade

## 🚨 PROBLEMA IDENTIFICADO

**Relatado pelo Usuário**: "esse site vai ser enviado para clientes que surgem pelo instagram ou outros funis, nao pode aparecer para o cliente os outros reports que foram feitos, isso deveria ser de dominio somente meu e da administracao do culturabuilder"

---

## 🔍 Análise do Sistema Atual

### Como Funciona Hoje

1. **Armazenamento**: LocalStorage do navegador
   ```javascript
   // lib/services/report-service.ts
   localStorage.setItem('culturabuilder_reports', JSON.stringify(reports));
   ```

2. **Acesso a Relatórios**:
   - URL: `/report/[id]`
   - Código: `getReport(reportId)` busca do localStorage
   - Sem verificação de proprietário

3. **Dashboard**:
   - URL: `/dashboard`
   - Código: `getAllReports()` lista TODOS do localStorage
   - Sem autenticação

4. **IDs**:
   ```javascript
   function generateReportId(): string {
     const timestamp = Date.now();
     const random = Math.random().toString(36).substring(2, 9);
     return `${timestamp}-${random}`;
   }
   ```
   - Exemplo: `1735729482156-x7k9p2m`
   - Timestamp (previsível) + 7 caracteres random

---

## 🎯 Situação Atual: O Que É Bom

### ✅ Isolamento Natural do LocalStorage

**Cada cliente só vê seus próprios relatórios:**
- LocalStorage é isolado por domínio/navegador
- Cliente A (navegador 1) não consegue ver relatórios do Cliente B (navegador 2)
- Isso JÁ protege contra clientes verem relatórios de outros clientes

### Cenário Real:
```
Cliente A (Chrome, iPhone)
├─ Faz assessment
├─ Relatório salvo no localStorage do seu navegador
└─ Não consegue ver relatórios de outros clientes ✅

Cliente B (Safari, Mac)
├─ Faz assessment
├─ Relatório salvo no localStorage do seu navegador
└─ Não consegue ver relatórios de outros clientes ✅
```

---

## ❌ Situação Atual: Problemas Críticos

### PROBLEMA 1: Admin Não Vê Relatórios dos Clientes

**Atual**:
- Admin abre navegador
- Acessa `/dashboard`
- Vê apenas relatórios criados no SEU navegador
- **NÃO vê relatórios dos clientes** ❌

**Impacto**:
- CulturaBuilder não tem visibilidade dos assessments
- Não pode fazer follow-up com leads
- Não tem dados para análise
- **Problema comercial crítico** 🚨

### PROBLEMA 2: Sem Persistência Real

**Atual**:
- Cliente faz assessment no celular
- Limpa cache ou troca de dispositivo
- **Perde acesso ao relatório** ❌

**Impacto**:
- Má experiência do usuário
- Cliente não consegue reenviar relatório
- Perde oportunidade de negócio

### PROBLEMA 3: IDs Previsíveis (Baixo Risco)

**Exemplo de ID**:
```
1735729482156-x7k9p2m
└─ timestamp  └─ 7 chars random
```

**Risco**:
- Alguém poderia tentar adivinhar IDs
- Mas precisaria estar no mesmo navegador para acessar
- **Risco baixo** devido ao localStorage

### PROBLEMA 4: Dashboard Público

**Atual**:
- Qualquer pessoa pode acessar `/dashboard`
- Sem senha ou autenticação
- Mas só vê relatórios do próprio navegador

**Risco**:
- Se houver backend futuro, seria vulnerável
- Cliente pode ver funcionalidade admin

---

## 🛡️ SOLUÇÕES PROPOSTAS

### OPÇÃO 1: Quick Fix (1-2 horas) - RECOMENDADA PARA AGORA

#### Implementar:

1. **Remover /dashboard do cliente**
   ```typescript
   // Adicionar middleware de proteção
   // middleware.ts
   if (pathname === '/dashboard') {
     // Requer senha simples
     return requireAuth();
   }
   ```

2. **Enviar relatórios via webhook para admin**
   ```typescript
   // Quando relatório é gerado
   await fetch('/api/admin/report-notification', {
     method: 'POST',
     body: JSON.stringify({
       reportId,
       companyName,
       contactEmail,
       reportData
     })
   });
   ```

3. **Cliente recebe link único com token**
   ```typescript
   // Gerar token de acesso
   const accessToken = generateSecureToken(); // UUID v4

   // URL compartilhável
   const shareableUrl = `/report/${reportId}?token=${accessToken}`;
   ```

4. **Validar token antes de mostrar relatório**
   ```typescript
   // Verificar se token é válido
   if (!isValidToken(reportId, token)) {
     return <AccessDenied />;
   }
   ```

**Vantagens**:
- ✅ Rápido de implementar
- ✅ Cliente não vê dashboard
- ✅ Admin recebe notificações
- ✅ Links seguros com token

**Desvantagens**:
- ⚠️ Ainda usa localStorage (limitado)
- ⚠️ Admin não tem dashboard centralizado

**ROI**: Alta urgência / Baixo esforço

---

### OPÇÃO 2: Solução Completa com Backend (8-12 horas)

#### Arquitetura:

```
┌─────────────┐
│   Cliente   │
│ (Instagram) │
└──────┬──────┘
       │
       │ 1. Faz assessment
       │
       ▼
┌─────────────────┐
│   Frontend      │
│ (Next.js App)   │
└─────────┬───────┘
          │
          │ 2. Salva relatório
          │
          ▼
┌─────────────────┐      ┌──────────────┐
│   API Routes    │◄────►│   Database   │
│  (/api/reports) │      │  (Supabase)  │
└────────┬────────┘      └──────────────┘
         │
         │ 3. Envia notificação
         │
         ▼
┌─────────────────┐
│  Admin (Email)  │
│    + Dashboard  │
└─────────────────┘
```

#### Implementação:

**1. Database Schema (Supabase)**
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  access_token TEXT UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  contact_email TEXT,
  report_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accessed_at TIMESTAMPTZ,
  source TEXT, -- 'instagram', 'direct', etc

  -- Indexes
  INDEX idx_session_id (session_id),
  INDEX idx_access_token (access_token)
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_agent TEXT,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE admin_users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin'
);
```

**2. Session Management**
```typescript
// lib/session.ts
export function getOrCreateSession(): string {
  let sessionId = sessionStorage.getItem('culturabuilder_session');

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('culturabuilder_session', sessionId);
  }

  return sessionId;
}
```

**3. API Endpoints**
```typescript
// app/api/reports/create/route.ts
export async function POST(request: Request) {
  const { reportData, sessionId } = await request.json();

  // Generate secure access token
  const accessToken = crypto.randomUUID();

  // Save to database
  const { data, error } = await supabase
    .from('reports')
    .insert({
      session_id: sessionId,
      access_token: accessToken,
      report_data: reportData,
      company_name: reportData.companyInfo.name,
      contact_email: reportData.contactInfo?.email
    })
    .select()
    .single();

  // Send notification to admin
  await sendAdminNotification(data);

  return NextResponse.json({
    reportId: data.id,
    accessToken: data.access_token
  });
}

// app/api/reports/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  // Validate token
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', params.id)
    .eq('access_token', token)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  // Update accessed_at
  await supabase
    .from('reports')
    .update({ accessed_at: new Date().toISOString() })
    .eq('id', params.id);

  return NextResponse.json(data);
}

// app/api/admin/reports/route.ts (Protected)
export async function GET(request: Request) {
  // Validate admin session
  const session = await getAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch all reports
  const { data } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });

  return NextResponse.json(data);
}
```

**4. Admin Authentication**
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Protect admin routes
  if (path.startsWith('/admin')) {
    const session = request.cookies.get('admin_session');

    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard']
};
```

**5. Client Report Access**
```typescript
// app/report/[id]/page.tsx
export default function ReportPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    async function loadReport() {
      const res = await fetch(`/api/reports/${params.id}?token=${token}`);

      if (!res.ok) {
        router.push('/?error=access_denied');
        return;
      }

      const data = await res.json();
      setReport(data);
    }

    loadReport();
  }, [params.id, token]);

  // ... rest of component
}
```

**6. Admin Dashboard**
```typescript
// app/admin/dashboard/page.tsx
export default function AdminDashboard() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    async function loadReports() {
      const res = await fetch('/api/admin/reports');
      const data = await res.json();
      setReports(data);
    }

    loadReports();
  }, []);

  return (
    <div>
      <h1>Admin Dashboard - Todos os Relatórios</h1>

      {/* Filtros */}
      <Filters />

      {/* Lista de relatórios */}
      {reports.map(report => (
        <ReportCard
          key={report.id}
          report={report}
          accessUrl={`/report/${report.id}?token=${report.access_token}`}
        />
      ))}
    </div>
  );
}
```

**Vantagens**:
- ✅ Relatórios persistem em banco de dados
- ✅ Admin vê TODOS os relatórios
- ✅ Links seguros com tokens únicos
- ✅ Analytics e métricas
- ✅ Follow-up com leads
- ✅ Cliente pode acessar de qualquer dispositivo

**Desvantagens**:
- ⏰ 8-12 horas de desenvolvimento
- 💰 Custo de banco de dados (Supabase free tier OK inicialmente)
- 🔧 Mais complexo de manter

**ROI**: Necessário para escalar / Médio esforço

---

### OPÇÃO 3: Híbrido - Webhook + LocalStorage (2-4 horas)

#### Implementar:

1. **Cliente continua usando localStorage** (não quebra nada)

2. **Quando relatório é gerado, envia para webhook**
   ```typescript
   // Após saveReport()
   await fetch('https://webhook.site/YOUR-UNIQUE-URL', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       timestamp: new Date().toISOString(),
       reportId: report.id,
       company: report.assessmentData.companyInfo.name,
       email: report.assessmentData.contactInfo?.email,
       source: 'assessment',
       reportData: report
     })
   });
   ```

3. **Webhook envia para Zapier/Make**
   - Salva em Google Sheets
   - Envia email para admin
   - Adiciona ao CRM

4. **Admin acessa via planilha ou CRM**

**Vantagens**:
- ✅ Muito rápido de implementar (2 horas)
- ✅ Sem custo de banco de dados
- ✅ Admin recebe notificações imediatamente
- ✅ Não quebra nada existente

**Desvantagens**:
- ⚠️ Relatórios não ficam em dashboard unificado
- ⚠️ Depende de serviços externos (Zapier)

**ROI**: Quick win / Baixo esforço

---

## 📊 Comparação de Soluções

| Aspecto | Quick Fix | Backend Completo | Híbrido Webhook |
|---------|-----------|------------------|-----------------|
| Tempo | 1-2h | 8-12h | 2-4h |
| Custo | $0 | ~$10/mês | $0-20/mês |
| Admin vê relatórios | Via email | Dashboard | Via planilha |
| Persistência | localStorage | Database | localStorage + Sheets |
| Segurança | Média | Alta | Média |
| Escalabilidade | Baixa | Alta | Média |
| **Recomendado para** | **Agora** | **Produção** | **MVP rápido** |

---

## 🎯 RECOMENDAÇÃO FINAL

### FASE 1: Implementar AGORA (Esta semana)
**OPÇÃO 3: Híbrido Webhook** (2-4 horas)

**Por quê**:
- ✅ Resolve o problema imediatamente
- ✅ Admin começa a receber dados
- ✅ Não quebra nada existente
- ✅ Baixo risco
- ✅ Rápido de testar

**Implementação**:
1. Adicionar webhook após `saveReport()`
2. Configurar Zapier para enviar email ao admin
3. Opcional: Salvar em Google Sheets
4. Adicionar variável de ambiente `ADMIN_WEBHOOK_URL`

### FASE 2: Implementar DEPOIS (Próximo sprint)
**OPÇÃO 2: Backend Completo** (8-12 horas)

**Quando**:
- Após validar product-market fit
- Quando houver > 50 assessments/semana
- Quando precisar de analytics avançado
- Quando admin precisar de dashboard rico

---

## 🚀 AÇÕES IMEDIATAS

### Prioridade P0 (Fazer hoje)
1. ✅ Adicionar webhook após geração de relatório
2. ✅ Configurar notificação por email para admin
3. ✅ Testar com 1 assessment real

### Prioridade P1 (Esta semana)
4. ⚠️ Adicionar password para /dashboard
5. ⚠️ Melhorar IDs (usar crypto.randomUUID())
6. ⚠️ Adicionar rate limiting no assessment

### Prioridade P2 (Próximo sprint)
7. 🔄 Planejar migração para backend real
8. 🔄 Desenhar schema de banco de dados
9. 🔄 Escolher provider (Supabase vs Firebase)

---

## 💡 EXTRAS: Melhorias de Segurança

### 1. Melhores IDs
```typescript
// Usar crypto.randomUUID() ao invés de timestamp
function generateReportId(): string {
  return crypto.randomUUID(); // ex: '550e8400-e29b-41d4-a716-446655440000'
}
```

### 2. Access Tokens
```typescript
// Gerar token único por relatório
function generateAccessToken(): string {
  return crypto.randomUUID();
}

// Salvar mapeamento
const reportAccess = {
  [reportId]: {
    token: accessToken,
    expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 dias
  }
};
```

### 3. Rate Limiting
```typescript
// Limitar assessments por IP
const rateLimits = new Map();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimits.get(ip) || { count: 0, resetAt: now + 3600000 };

  if (now > limit.resetAt) {
    limit.count = 0;
    limit.resetAt = now + 3600000;
  }

  limit.count++;
  rateLimits.set(ip, limit);

  return limit.count <= 10; // Max 10 assessments/hora
}
```

### 4. CAPTCHA
```typescript
// Adicionar recaptcha no formulário
import ReCAPTCHA from "react-google-recaptcha";

<ReCAPTCHA
  sitekey="YOUR_SITE_KEY"
  onChange={handleCaptcha}
/>
```

---

## 📝 CONCLUSÃO

**Problema Real**:
- ✅ Clientes JÁ não vêem relatórios de outros (localStorage é isolado)
- ❌ Admin NÃO vê relatórios dos clientes (problema comercial)

**Solução Imediata**:
- Webhook para notificar admin de cada novo assessment
- 2-4 horas de implementação
- Zero risco

**Solução Longo Prazo**:
- Backend completo com Supabase
- Dashboard admin rico
- 8-12 horas de implementação
- Necessário para escalar

**Ação Recomendada**: Implementar webhook hoje, planejar backend para próximo sprint.
