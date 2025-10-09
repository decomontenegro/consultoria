# Minimal Clean Landing Page - Guia de Uso

## 📋 Visão Geral

Uma página alternativa com design **Minimal Clean** (tema light/branco) em contraste com o tema dark/neon principal do CulturaBuilder.

**URL:** `/minimal`

---

## 🎨 Características do Design

### Tema Light/Clean
- ✅ Fundo branco puro (`bg-white`)
- ✅ Tipografia ultra-leve (`font-light`, `font-medium`)
- ✅ Cores neutras (gray-900, gray-600, gray-300)
- ✅ Espaçamento generoso (gap-12, gap-16, gap-20)
- ✅ Animações sutis com Framer Motion
- ✅ Hover states minimalistas

### Contraste Intencional
- 🌓 **Homepage (`/`):** Dark theme com neon green/cyan
- ☀️ **Minimal (`/minimal`):** Light theme, estética clean
- 🎯 **Propósito:** Demonstrar versatilidade e agradar diferentes preferências de design

---

## 📁 Arquivos Criados

```
project/
├── app/
│   └── minimal/
│       └── page.tsx              # Página /minimal
├── components/
│   ├── ui/
│   │   └── feature-minimal.tsx   # Componente (já existia)
│   └── MinimalLandingCTA.tsx     # CTA opcional para homepage
└── data/
    └── culturabuilder-features-minimal.ts  # Dados das features
```

---

## 🚀 Como Usar

### 1. Acessar a Página

Execute o projeto e acesse:
```bash
npm run dev
# Abra http://localhost:3000/minimal
```

### 2. Adicionar Link na Homepage (Opcional)

Edite `app/page.tsx` e adicione no header (linha ~27):

```tsx
<Link href="/minimal" className="text-tech-gray-300 hover:text-white transition-colors">
  Minimal
</Link>
```

### 3. Adicionar CTA na Homepage (Opcional)

Edite `app/page.tsx` e importe antes do footer:

```tsx
import MinimalLandingCTA from '@/components/MinimalLandingCTA';

// Adicione antes do </main> ou antes do <footer>:
<MinimalLandingCTA />
```

---

## 📊 Conteúdo das Categorias

A página `/minimal` apresenta 6 categorias de funcionalidades do CulturaBuilder:

### 1. Enterprise AI Assessment (🎯)
- ROI Calculator with verified data
- Risk analysis framework
- Board-ready executive reports

### 2. Team Productivity (👥)
- Voice coding adoption metrics
- Developer experience tracking
- Team velocity benchmarks

### 3. Development Velocity (💻)
- AI coding tools comparison
- Implementation roadmaps
- Best practices library

### 4. Innovation Metrics (💡)
- Time-to-market reduction
- Feature velocity analysis
- Competitive advantage tracking

### 5. Financial Analysis (💰)
- Conservative ROI models
- Cost savings calculator
- Payback period analysis

### 6. Security & Compliance (🛡️)
- Data governance frameworks
- Compliance automation
- Audit trail generation

---

## 🎨 Customização

### Alterar Título

Edite `data/culturabuilder-features-minimal.ts`:

```tsx
export const minimalPageTitle = (
  <>
    Your custom{' '}
    <span className="font-light italic text-gray-700">title here</span>
  </>
);
```

### Alterar Subtítulo

```tsx
export const minimalPageSubtitle = 'Your new subtitle text here...';
```

### Modificar Categorias

Edite o array `culturaBuilderFeatures` em `data/culturabuilder-features-minimal.ts`:

```tsx
{
  icon: React.createElement(YourIcon, { size: 28, strokeWidth: 1.5 }),
  title: 'Your Category',
  items: [
    { text: 'Your feature 1' },
    { text: 'Link feature', href: '/your-page' },
  ],
}
```

### Alterar Ilustração

Edite `app/minimal/page.tsx`:

```tsx
<FeatureGridMinimal
  illustrationSrc="/your-image.png" // Altere aqui
  // ... outras props
/>
```

---

## 🔗 Navegação

### Header
- **CulturaBuilder** (logo/texto) → Link para `/` (homepage dark)
- **Back to Home** → Link para `/`
- **Start Assessment** → Link para `/assessment`

### Footer
Links para:
- Comunidade (culturabuilder.com)
- Assessment (/assessment)
- Dark Theme Version (/)

---

## 📱 Responsividade

A página é totalmente responsiva:
- **Mobile:** 1 coluna, stack vertical
- **Tablet:** 2 colunas
- **Desktop:** 3 colunas

Breakpoints Tailwind:
- `md:` 768px+
- `lg:` 1024px+

---

## ⚡ Performance

### Otimizações
- ✅ Framer Motion com `viewport={{ once: true }}`
- ✅ Stagger animations (0.08s delay)
- ✅ Spring physics (stiffness: 120, damping: 15)
- ✅ Componentes client-side only onde necessário

### Lighthouse Score Target
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+

---

## 🎯 Casos de Uso

### Quando usar `/minimal`:
- ✅ Apresentações para stakeholders que preferem design clean
- ✅ Demonstrações de versatilidade do produto
- ✅ A/B testing de preferências de design
- ✅ Landing page alternativa para campanhas específicas

### Quando usar `/` (homepage dark):
- ✅ Identidade visual principal CulturaBuilder
- ✅ Público tech-forward
- ✅ Demonstrações de inovação e tecnologia

---

## 🐛 Troubleshooting

### Página não carrega
```bash
# Verifique se todas as dependências estão instaladas
npm install

# Limpe o cache do Next.js
rm -rf .next
npm run dev
```

### Ícones não aparecem
Certifique-se de que `lucide-react` está instalado:
```bash
npm install lucide-react
```

### Animações não funcionam
Verifique se `framer-motion` está instalado:
```bash
npm install framer-motion
```

---

## 📸 Screenshots

### Desktop View
```
┌────────────────────────────────────────────────────┐
│  CulturaBuilder          [Back] [Start Assessment] │
├────────────────────────────────────────────────────┤
│                                                    │
│        Built for enterprise leaders                │
│                  (italic, light)                   │
│                                                    │
│  Enterprise AI readiness assessment based on...    │
│                                                    │
│              [Illustration]                        │
│                                                    │
├────────────────────────────────────────────────────┤
│  🎯 Enterprise    👥 Team         💻 Development   │
│     AI             Productivity      Velocity      │
│  • ROI            • Metrics        • Tools         │
│  • Risk           • Tracking       • Roadmaps      │
│  • Reports        • Benchmarks     • Practices     │
│                                                    │
│  💡 Innovation    💰 Financial    🛡️ Security      │
│  • Time-to-mkt    • ROI Models     • Governance    │
│  • Velocity       • Calculator     • Compliance    │
│  • Competitive    • Payback        • Audit         │
│                                                    │
│         [Start Free Assessment]                    │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## 🔄 Próximos Passos

### Melhorias Sugeridas
1. ⭐ Adicionar analytics tracking (Google Analytics, Plausible)
2. ⭐ Implementar Open Graph meta tags para social sharing
3. ⭐ Criar variações de copy para A/B testing
4. ⭐ Adicionar depoimentos/testimonials section
5. ⭐ Implementar lead capture form inline

### Variações Possíveis
- Minimal Dark (tema escuro minimalista)
- Minimal Color (com acentos coloridos sutis)
- Minimal Gradient (gradientes suaves)

---

## 📚 Recursos

- [Componente Original: feature-minimal.tsx](../components/ui/feature-minimal.tsx)
- [Dados: culturabuilder-features-minimal.ts](../data/culturabuilder-features-minimal.ts)
- [Página: app/minimal/page.tsx](../app/minimal/page.tsx)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

## 🤝 Contribuindo

Para modificar o design ou conteúdo:

1. Edite `data/culturabuilder-features-minimal.ts` para dados
2. Edite `app/minimal/page.tsx` para layout/estrutura
3. Componente `feature-minimal.tsx` é reutilizável - evite modificá-lo

---

## 📝 Changelog

### v1.0.0 (2025-10-06)
- ✅ Página `/minimal` criada
- ✅ Design Minimal Clean integrado
- ✅ Componente CTA opcional criado
- ✅ Dados das features estruturados
- ✅ Documentação completa

---

**Questões?** Consulte a documentação principal ou abra uma issue no repositório.
