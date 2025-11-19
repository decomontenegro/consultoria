/**
 * Business Health Quiz - Question Bank
 *
 * 50+ perguntas estratégicas distribuídas em 4 blocos:
 * - Bloco 1 (Context): 7 perguntas fixas sobre empresa
 * - Bloco 2 (Expertise): 4 perguntas abertas para detectar área de conhecimento
 * - Bloco 3 (Deep-dive): 35 perguntas distribuídas por 7 áreas (5 por área)
 * - Bloco 4 (Risk Scan): 7 perguntas rápidas (1 por área)
 */

import { BusinessQuestionMetadata, BusinessArea } from './types';

// ============================================================================
// BLOCO 1: CONTEXT (7 perguntas fixas)
// ============================================================================

export const CONTEXT_QUESTIONS: BusinessQuestionMetadata[] = [
  {
    id: 'ctx-001',
    block: 'context',
    area: 'marketing-growth', // Área padrão, aplica-se a todas
    questionText: 'Qual é o nome da sua empresa?',
    placeholder: 'Ex: TechCorp, Startup XYZ',
    inputType: 'text',
    level: 'foundational',
    weight: 0,
    dataFields: ['company.name'],
    dataExtractor: (answer) => ({
      'company.name': answer.trim(),
    }),
  },

  {
    id: 'ctx-002',
    block: 'context',
    area: 'marketing-growth',
    questionText: 'Em qual setor/indústria sua empresa atua?',
    placeholder: 'Ex: Fintech, E-commerce, SaaS B2B',
    inputType: 'text',
    level: 'foundational',
    weight: 0,
    dataFields: ['company.industry'],
    dataExtractor: (answer) => ({
      'company.industry': answer.trim(),
    }),
  },

  {
    id: 'ctx-003',
    block: 'context',
    area: 'marketing-growth',
    questionText: 'Qual o estágio atual da empresa?',
    inputType: 'single-choice',
    options: ['Startup (0-2 anos, validando produto)', 'Scaleup (2-5 anos, crescendo rápido)', 'Enterprise (5+ anos, operação estabelecida)'],
    level: 'foundational',
    weight: 0,
    dataFields: ['company.stage'],
    dataExtractor: (answer) => {
      if (answer.includes('Startup')) return { 'company.stage': 'startup' };
      if (answer.includes('Scaleup')) return { 'company.stage': 'scaleup' };
      return { 'company.stage': 'enterprise' };
    },
  },

  {
    id: 'ctx-004',
    block: 'context',
    area: 'people-culture',
    questionText: 'Quantas pessoas trabalham na empresa hoje?',
    placeholder: 'Número aproximado',
    inputType: 'text',
    level: 'foundational',
    weight: 0,
    dataFields: ['company.teamSize', 'peopleCulture.headcount'],
    dataExtractor: (answer) => {
      const num = parseInt(answer.replace(/\D/g, ''), 10) || 0;
      return {
        'company.teamSize': num,
        'peopleCulture.headcount': num,
      };
    },
  },

  {
    id: 'ctx-005',
    block: 'context',
    area: 'financial',
    questionText: 'Qual a receita mensal aproximada (ARR/MRR)?',
    placeholder: 'Ex: R$50k, R$500k, R$5M',
    inputType: 'text',
    helpText: 'Pode ser uma faixa aproximada',
    level: 'foundational',
    weight: 0,
    dataFields: ['company.monthlyRevenue'],
    dataExtractor: (answer) => ({
      'company.monthlyRevenue': answer.trim(),
    }),
  },

  {
    id: 'ctx-006',
    block: 'context',
    area: 'marketing-growth',
    questionText: 'Quando a empresa foi fundada?',
    placeholder: 'Ex: 2021',
    inputType: 'text',
    level: 'foundational',
    weight: 0,
    dataFields: ['company.yearFounded'],
    dataExtractor: (answer) => {
      const year = parseInt(answer.replace(/\D/g, ''), 10);
      return { 'company.yearFounded': year };
    },
  },

  {
    id: 'ctx-007',
    block: 'context',
    area: 'marketing-growth',
    questionText: 'Qual é o principal objetivo para os próximos 6-12 meses?',
    placeholder: 'Ex: Crescer 3x, reduzir churn, lançar novo produto',
    inputType: 'textarea',
    level: 'foundational',
    weight: 0,
    dataFields: ['primaryGoal'],
    dataExtractor: (answer) => ({
      primaryGoal: answer.trim(),
    }),
  },
];

// ============================================================================
// BLOCO 2: EXPERTISE DETECTION (4 perguntas abertas)
// ============================================================================

export const EXPERTISE_QUESTIONS: BusinessQuestionMetadata[] = [
  {
    id: 'exp-001',
    block: 'expertise',
    area: 'marketing-growth',
    questionText: 'Conte sobre o maior desafio que a empresa enfrenta hoje. O que está te tirando o sono?',
    placeholder: 'Seja o mais específico possível sobre o problema...',
    inputType: 'textarea',
    level: 'foundational',
    weight: 1,
    dataFields: [],
    helpText: 'Esta resposta nos ajuda a entender onde você precisa de mais suporte',
  },

  {
    id: 'exp-002',
    block: 'expertise',
    area: 'marketing-growth',
    questionText: 'Se você tivesse que escolher UMA área para transformar completamente nos próximos 3 meses, qual seria e por quê?',
    placeholder: 'Ex: Marketing, porque nosso CAC está muito alto...',
    inputType: 'textarea',
    level: 'foundational',
    weight: 1,
    dataFields: [],
  },

  {
    id: 'exp-003',
    block: 'expertise',
    area: 'marketing-growth',
    questionText: 'Quais métricas você acompanha semanalmente? Por que essas métricas?',
    placeholder: 'Ex: MRR, CAC/LTV, NPS...',
    inputType: 'textarea',
    level: 'foundational',
    weight: 0.8,
    dataFields: [],
    helpText: 'As métricas que você monitora revelam suas prioridades',
  },

  {
    id: 'exp-004',
    block: 'expertise',
    area: 'marketing-growth',
    questionText: 'Descreva uma situação recente onde a empresa perdeu dinheiro ou oportunidade. O que aconteceu?',
    placeholder: 'Ex: Perdemos 3 clientes grandes porque o onboarding era confuso...',
    inputType: 'textarea',
    level: 'foundational',
    weight: 1,
    dataFields: [],
  },
];

// ============================================================================
// BLOCO 3: DEEP-DIVE (35 perguntas, 5 por área)
// ============================================================================

// --- Marketing & Growth ---
export const MARKETING_GROWTH_QUESTIONS: BusinessQuestionMetadata[] = [
  {
    id: 'mktg-001',
    block: 'deep-dive',
    area: 'marketing-growth',
    questionText: 'Qual é o principal canal de aquisição de clientes hoje?',
    inputType: 'single-choice',
    options: ['Orgânico (SEO, redes sociais)', 'Pago (Google Ads, Facebook Ads)', 'Vendas diretas/outbound', 'Indicações/boca a boca', 'Parcerias'],
    level: 'foundational',
    weight: 0.7,
    dataFields: ['marketingGrowth.primaryChannel'],
    dataExtractor: (answer) => ({
      'marketingGrowth.primaryChannel': answer,
    }),
  },

  {
    id: 'mktg-002',
    block: 'deep-dive',
    area: 'marketing-growth',
    questionText: 'Você conhece o CAC (Custo de Aquisição por Cliente)?',
    inputType: 'single-choice',
    options: ['Sim, está em R$___', 'Não, mas estou trabalhando para medir', 'Não sei e não é prioridade ainda'],
    level: 'foundational',
    weight: 0.9,
    dataFields: ['marketingGrowth.cacKnown', 'marketingGrowth.cac'],
    dataExtractor: (answer) => {
      if (answer.includes('Sim')) {
        const match = answer.match(/R\$\s*(\d+)/);
        return {
          'marketingGrowth.cacKnown': true,
          'marketingGrowth.cac': match ? parseInt(match[1], 10) : null,
        };
      }
      return { 'marketingGrowth.cacKnown': false };
    },
  },

  {
    id: 'mktg-003',
    block: 'deep-dive',
    area: 'marketing-growth',
    questionText: 'Qual a taxa de conversão do topo do funil até cliente pagante?',
    placeholder: 'Ex: 2%, 5%, 10%',
    inputType: 'text',
    level: 'intermediate',
    weight: 0.8,
    dataFields: ['marketingGrowth.conversionRate'],
    dataExtractor: (answer) => {
      const match = answer.match(/(\d+\.?\d*)/);
      return {
        'marketingGrowth.conversionRate': match ? parseFloat(match[1]) : null,
      };
    },
    downstream: ['sales-commercial'],
  },

  {
    id: 'mktg-004',
    block: 'deep-dive',
    area: 'marketing-growth',
    questionText: 'Como você ativa novos usuários/clientes após o cadastro?',
    placeholder: 'Ex: Email onboarding, trial guiado, call de CS...',
    inputType: 'textarea',
    level: 'intermediate',
    weight: 0.7,
    dataFields: ['marketingGrowth.activationStrategy'],
    dataExtractor: (answer) => ({
      'marketingGrowth.activationStrategy': answer,
    }),
    downstream: ['product'],
  },

  {
    id: 'mktg-005',
    block: 'deep-dive',
    area: 'marketing-growth',
    questionText: 'Qual o maior problema no funil de marketing/growth hoje?',
    placeholder: 'Ex: CAC alto, conversão baixa, churn na ativação...',
    inputType: 'textarea',
    level: 'foundational',
    weight: 0.9,
    dataFields: ['marketingGrowth.topChallenge'],
    dataExtractor: (answer) => ({
      'marketingGrowth.topChallenge': answer,
    }),
  },
];

// --- Sales & Commercial ---
export const SALES_COMMERCIAL_QUESTIONS: BusinessQuestionMetadata[] = [
  {
    id: 'sales-001',
    block: 'deep-dive',
    area: 'sales-commercial',
    questionText: 'Qual o ciclo médio de vendas (do primeiro contato até fechar)?',
    placeholder: 'Ex: 7 dias, 30 dias, 90 dias',
    inputType: 'text',
    level: 'foundational',
    weight: 0.8,
    dataFields: ['salesCommercial.salesCycleLength'],
    dataExtractor: (answer) => {
      const match = answer.match(/(\d+)/);
      return {
        'salesCommercial.salesCycleLength': match ? parseInt(match[1], 10) : null,
      };
    },
  },

  {
    id: 'sales-002',
    block: 'deep-dive',
    area: 'sales-commercial',
    questionText: 'Qual o ticket médio de venda?',
    placeholder: 'Ex: R$500, R$5k, R$50k',
    inputType: 'text',
    level: 'foundational',
    weight: 0.7,
    dataFields: ['salesCommercial.avgTicket'],
    dataExtractor: (answer) => {
      const match = answer.match(/R?\$?\s*(\d+\.?\d*)[kK]?/);
      if (match) {
        let value = parseFloat(match[1]);
        if (answer.toLowerCase().includes('k')) value *= 1000;
        return { 'salesCommercial.avgTicket': value };
      }
      return { 'salesCommercial.avgTicket': null };
    },
    upstream: ['marketing-growth'],
  },

  {
    id: 'sales-003',
    block: 'deep-dive',
    area: 'sales-commercial',
    questionText: 'Qual sua taxa de conversão de oportunidades (win rate)?',
    placeholder: 'Ex: 20%, 50%',
    inputType: 'text',
    level: 'intermediate',
    weight: 0.9,
    dataFields: ['salesCommercial.winRate'],
    dataExtractor: (answer) => {
      const match = answer.match(/(\d+\.?\d*)/);
      return {
        'salesCommercial.winRate': match ? parseFloat(match[1]) : null,
      };
    },
  },

  {
    id: 'sales-004',
    block: 'deep-dive',
    area: 'sales-commercial',
    questionText: 'Você usa CRM? Se sim, qual o nível de adoção?',
    inputType: 'single-choice',
    options: [
      'Não usamos CRM ainda',
      'Usamos, mas só para registro básico',
      'Usamos de forma completa (pipeline, forecast, automações)',
    ],
    level: 'foundational',
    weight: 0.6,
    dataFields: ['salesCommercial.crmUsage'],
    dataExtractor: (answer) => {
      if (answer.includes('Não')) return { 'salesCommercial.crmUsage': 'none' };
      if (answer.includes('básico')) return { 'salesCommercial.crmUsage': 'basic' };
      return { 'salesCommercial.crmUsage': 'advanced' };
    },
    criticalFor: ['technology-data'],
  },

  {
    id: 'sales-005',
    block: 'deep-dive',
    area: 'sales-commercial',
    questionText: 'Qual o principal gargalo em vendas hoje?',
    placeholder: 'Ex: Falta de leads qualificados, ciclo longo demais...',
    inputType: 'textarea',
    level: 'foundational',
    weight: 0.9,
    dataFields: ['salesCommercial.topChallenge'],
    dataExtractor: (answer) => ({
      'salesCommercial.topChallenge': answer,
    }),
  },
];

// --- Product ---
export const PRODUCT_QUESTIONS: BusinessQuestionMetadata[] = [
  {
    id: 'prod-001',
    block: 'deep-dive',
    area: 'product',
    questionText: 'Quanto tempo leva para desenvolver e lançar uma feature média?',
    placeholder: 'Ex: 1 semana, 1 mês, 3 meses',
    inputType: 'text',
    level: 'foundational',
    weight: 0.8,
    dataFields: ['product.developmentCycle'],
    dataExtractor: (answer) => {
      const match = answer.match(/(\d+)/);
      return {
        'product.developmentCycle': match ? parseInt(match[1], 10) : null,
      };
    },
    criticalFor: ['technology-data'],
  },

  {
    id: 'prod-002',
    block: 'deep-dive',
    area: 'product',
    questionText: 'Quantas releases/deploys vocês fazem por mês?',
    placeholder: 'Ex: 1, 5, 20',
    inputType: 'text',
    level: 'intermediate',
    weight: 0.7,
    dataFields: ['product.releasesPerMonth'],
    dataExtractor: (answer) => {
      const match = answer.match(/(\d+)/);
      return {
        'product.releasesPerMonth': match ? parseInt(match[1], 10) : null,
      };
    },
    downstream: ['technology-data'],
  },

  {
    id: 'prod-003',
    block: 'deep-dive',
    area: 'product',
    questionText: 'Onde vocês estão na curva de Product-Market Fit?',
    inputType: 'single-choice',
    options: [
      'Ainda procurando (testando hipóteses)',
      'Iterando (temos alguns clientes, ajustando produto)',
      'Escalando (PMF validado, foco em crescer)',
    ],
    level: 'foundational',
    weight: 0.9,
    dataFields: ['product.productMarketFit'],
    dataExtractor: (answer) => {
      if (answer.includes('procurando')) return { 'product.productMarketFit': 'searching' };
      if (answer.includes('Iterando')) return { 'product.productMarketFit': 'iterating' };
      return { 'product.productMarketFit': 'scaling' };
    },
    upstream: ['marketing-growth', 'sales-commercial'],
  },

  {
    id: 'prod-004',
    block: 'deep-dive',
    area: 'product',
    questionText: 'Como vocês coletam e priorizam feedback de usuários?',
    inputType: 'single-choice',
    options: [
      'Ad-hoc (conversas informais)',
      'Sistemático (pesquisas, entrevistas regulares)',
      'Data-driven (analytics, A/B tests, usage metrics)',
    ],
    level: 'intermediate',
    weight: 0.7,
    dataFields: ['product.userFeedbackLoop'],
    dataExtractor: (answer) => {
      if (answer.includes('Ad-hoc')) return { 'product.userFeedbackLoop': 'ad-hoc' };
      if (answer.includes('Sistemático')) return { 'product.userFeedbackLoop': 'systematic' };
      return { 'product.userFeedbackLoop': 'data-driven' };
    },
  },

  {
    id: 'prod-005',
    block: 'deep-dive',
    area: 'product',
    questionText: 'Qual o maior desafio de produto hoje?',
    placeholder: 'Ex: Definir o que construir, tech debt, velocidade baixa...',
    inputType: 'textarea',
    level: 'foundational',
    weight: 0.9,
    dataFields: ['product.topChallenge'],
    dataExtractor: (answer) => ({
      'product.topChallenge': answer,
    }),
  },
];

// --- Operations & Logistics ---
export const OPERATIONS_QUESTIONS: BusinessQuestionMetadata[] = [
  {
    id: 'ops-001',
    block: 'deep-dive',
    area: 'operations-logistics',
    questionText: 'Qual o tempo médio de fulfillment (da compra até entrega/ativação)?',
    placeholder: 'Ex: 2 horas, 3 dias, 1 semana',
    inputType: 'text',
    level: 'foundational',
    weight: 0.8,
    dataFields: ['operationsLogistics.fulfillmentTime'],
    dataExtractor: (answer) => {
      const match = answer.match(/(\d+)/);
      return {
        'operationsLogistics.fulfillmentTime': match ? parseInt(match[1], 10) : null,
      };
    },
  },

  {
    id: 'ops-002',
    block: 'deep-dive',
    area: 'operations-logistics',
    questionText: 'Qual a taxa de erro operacional (pedidos errados, problemas de entrega, etc)?',
    placeholder: 'Ex: 1%, 5%, 10%',
    inputType: 'text',
    level: 'intermediate',
    weight: 0.7,
    dataFields: ['operationsLogistics.errorRate'],
    dataExtractor: (answer) => {
      const match = answer.match(/(\d+\.?\d*)/);
      return {
        'operationsLogistics.errorRate': match ? parseFloat(match[1]) : null,
      };
    },
    downstream: ['sales-commercial'],
  },

  {
    id: 'ops-003',
    block: 'deep-dive',
    area: 'operations-logistics',
    questionText: 'Seus processos estão documentados?',
    inputType: 'single-choice',
    options: [
      'Não temos documentação (na cabeça das pessoas)',
      'Parcialmente documentado (alguns processos)',
      'Completamente documentado (SOPs, playbooks)',
    ],
    level: 'foundational',
    weight: 0.6,
    dataFields: ['operationsLogistics.processDocumentation'],
    dataExtractor: (answer) => {
      if (answer.includes('Não')) return { 'operationsLogistics.processDocumentation': 'none' };
      if (answer.includes('Parcialmente')) return { 'operationsLogistics.processDocumentation': 'partial' };
      return { 'operationsLogistics.processDocumentation': 'complete' };
    },
  },

  {
    id: 'ops-004',
    block: 'deep-dive',
    area: 'operations-logistics',
    questionText: 'Qual o nível de automação das operações?',
    inputType: 'single-choice',
    options: [
      'Totalmente manual',
      'Semi-automatizado (algumas ferramentas)',
      'Altamente automatizado (workflows, integrações)',
    ],
    level: 'intermediate',
    weight: 0.8,
    dataFields: ['operationsLogistics.automationLevel'],
    dataExtractor: (answer) => {
      if (answer.includes('manual')) return { 'operationsLogistics.automationLevel': 'manual' };
      if (answer.includes('Semi')) return { 'operationsLogistics.automationLevel': 'semi-automated' };
      return { 'operationsLogistics.automationLevel': 'fully-automated' };
    },
    criticalFor: ['technology-data'],
  },

  {
    id: 'ops-005',
    block: 'deep-dive',
    area: 'operations-logistics',
    questionText: 'Qual o principal gargalo operacional hoje?',
    placeholder: 'Ex: Processos manuais demais, falta de ferramentas...',
    inputType: 'textarea',
    level: 'foundational',
    weight: 0.9,
    dataFields: ['operationsLogistics.topChallenge'],
    dataExtractor: (answer) => ({
      'operationsLogistics.topChallenge': answer,
    }),
  },
];

// --- Financial ---
export const FINANCIAL_QUESTIONS: BusinessQuestionMetadata[] = [
  {
    id: 'fin-001',
    block: 'deep-dive',
    area: 'financial',
    questionText: 'Quantos meses de runway (caixa) a empresa tem?',
    placeholder: 'Ex: 6 meses, 12 meses, 24 meses',
    inputType: 'text',
    level: 'foundational',
    weight: 0.9,
    dataFields: ['financial.cashRunway'],
    dataExtractor: (answer) => {
      const match = answer.match(/(\d+)/);
      return {
        'financial.cashRunway': match ? parseInt(match[1], 10) : null,
      };
    },
  },

  {
    id: 'fin-002',
    block: 'deep-dive',
    area: 'financial',
    questionText: 'Qual o burn rate mensal (quanto a empresa gasta por mês)?',
    placeholder: 'Ex: R$50k, R$200k, R$1M',
    inputType: 'text',
    level: 'intermediate',
    weight: 0.8,
    dataFields: ['financial.burnRate'],
    dataExtractor: (answer) => {
      const match = answer.match(/R?\$?\s*(\d+\.?\d*)[kKmM]?/);
      if (match) {
        let value = parseFloat(match[1]);
        if (answer.toLowerCase().includes('k')) value *= 1000;
        if (answer.toLowerCase().includes('m')) value *= 1000000;
        return { 'financial.burnRate': value };
      }
      return { 'financial.burnRate': null };
    },
  },

  {
    id: 'fin-003',
    block: 'deep-dive',
    area: 'financial',
    questionText: 'A empresa é lucrativa? Se sim, qual a margem?',
    placeholder: 'Ex: Não ainda, Sim 10%, Sim 30%',
    inputType: 'text',
    level: 'foundational',
    weight: 0.7,
    dataFields: ['financial.profitMargin'],
    dataExtractor: (answer) => {
      const match = answer.match(/(\d+\.?\d*)/);
      return {
        'financial.profitMargin': match ? parseFloat(match[1]) : 0,
      };
    },
  },

  {
    id: 'fin-004',
    block: 'deep-dive',
    area: 'financial',
    questionText: 'Como vocês fazem planejamento financeiro?',
    inputType: 'single-choice',
    options: [
      'Não temos planejamento formal',
      'Planejamento anual',
      'Planejamento trimestral',
      'Planejamento mensal detalhado',
    ],
    level: 'foundational',
    weight: 0.6,
    dataFields: ['financial.budgetPlanning'],
    dataExtractor: (answer) => {
      if (answer.includes('Não')) return { 'financial.budgetPlanning': 'none' };
      if (answer.includes('anual')) return { 'financial.budgetPlanning': 'annual' };
      if (answer.includes('trimestral')) return { 'financial.budgetPlanning': 'quarterly' };
      return { 'financial.budgetPlanning': 'monthly' };
    },
  },

  {
    id: 'fin-005',
    block: 'deep-dive',
    area: 'financial',
    questionText: 'Qual o maior desafio financeiro hoje?',
    placeholder: 'Ex: Runway curto, queimando muito, difícil prever receita...',
    inputType: 'textarea',
    level: 'foundational',
    weight: 0.9,
    dataFields: ['financial.topChallenge'],
    dataExtractor: (answer) => ({
      'financial.topChallenge': answer,
    }),
  },
];

// --- People & Culture ---
export const PEOPLE_CULTURE_QUESTIONS: BusinessQuestionMetadata[] = [
  {
    id: 'ppl-001',
    block: 'deep-dive',
    area: 'people-culture',
    questionText: 'Qual a taxa de crescimento do time (% ao ano)?',
    placeholder: 'Ex: 0% (não contratando), 50%, 200%',
    inputType: 'text',
    level: 'intermediate',
    weight: 0.7,
    dataFields: ['peopleCulture.growthRate'],
    dataExtractor: (answer) => {
      const match = answer.match(/(\d+\.?\d*)/);
      return {
        'peopleCulture.growthRate': match ? parseFloat(match[1]) : null,
      };
    },
  },

  {
    id: 'ppl-002',
    block: 'deep-dive',
    area: 'people-culture',
    questionText: 'Qual a taxa de turnover (rotatividade) anual?',
    placeholder: 'Ex: 5%, 20%, 50%',
    inputType: 'text',
    level: 'foundational',
    weight: 0.9,
    dataFields: ['peopleCulture.turnoverRate'],
    dataExtractor: (answer) => {
      const match = answer.match(/(\d+\.?\d*)/);
      return {
        'peopleCulture.turnoverRate': match ? parseFloat(match[1]) : null,
      };
    },
    downstream: ['financial'],
  },

  {
    id: 'ppl-003',
    block: 'deep-dive',
    area: 'people-culture',
    questionText: 'Quanto tempo leva para um novo funcionário se tornar produtivo?',
    placeholder: 'Ex: 1 semana, 1 mês, 3 meses',
    inputType: 'text',
    level: 'intermediate',
    weight: 0.7,
    dataFields: ['peopleCulture.onboardingTime'],
    dataExtractor: (answer) => {
      const match = answer.match(/(\d+)/);
      return {
        'peopleCulture.onboardingTime': match ? parseInt(match[1], 10) : null,
      };
    },
  },

  {
    id: 'ppl-004',
    block: 'deep-dive',
    area: 'people-culture',
    questionText: 'A empresa tem valores e cultura bem definidos?',
    inputType: 'single-choice',
    options: [
      'Não temos nada formal ainda',
      'Sim, mas é mais implícito (não escrito)',
      'Sim, temos valores documentados e praticados',
    ],
    level: 'foundational',
    weight: 0.6,
    dataFields: ['peopleCulture.cultureDefined'],
    dataExtractor: (answer) => ({
      'peopleCulture.cultureDefined': !answer.includes('Não'),
    }),
  },

  {
    id: 'ppl-005',
    block: 'deep-dive',
    area: 'people-culture',
    questionText: 'Qual o maior desafio com pessoas/cultura hoje?',
    placeholder: 'Ex: Atrair talentos, reter pessoas, alinhamento de cultura...',
    inputType: 'textarea',
    level: 'foundational',
    weight: 0.9,
    dataFields: ['peopleCulture.topChallenge'],
    dataExtractor: (answer) => ({
      'peopleCulture.topChallenge': answer,
    }),
  },
];

// --- Technology & Data ---
export const TECHNOLOGY_DATA_QUESTIONS: BusinessQuestionMetadata[] = [
  {
    id: 'tech-001',
    block: 'deep-dive',
    area: 'technology-data',
    questionText: 'Qual a stack de tecnologia principal?',
    placeholder: 'Ex: React/Node/PostgreSQL, Rails, Python/Django...',
    inputType: 'textarea',
    level: 'foundational',
    weight: 0.5,
    dataFields: ['technologyData.techStack'],
    dataExtractor: (answer) => ({
      'technologyData.techStack': answer.split(/[,\/]/).map((s) => s.trim()),
    }),
  },

  {
    id: 'tech-002',
    block: 'deep-dive',
    area: 'technology-data',
    questionText: 'Vocês têm pipeline de CI/CD automatizado?',
    inputType: 'single-choice',
    options: [
      'Não, deploy é manual',
      'Sim, mas parcialmente automatizado',
      'Sim, totalmente automatizado (testes + deploy)',
    ],
    level: 'intermediate',
    weight: 0.8,
    dataFields: ['technologyData.cicdPipeline'],
    dataExtractor: (answer) => ({
      'technologyData.cicdPipeline': !answer.includes('Não'),
    }),
  },

  {
    id: 'tech-003',
    block: 'deep-dive',
    area: 'technology-data',
    questionText: 'Qual a cobertura de testes automatizados?',
    placeholder: 'Ex: 0%, 30%, 80%',
    inputType: 'text',
    level: 'intermediate',
    weight: 0.7,
    dataFields: ['technologyData.testCoverage'],
    dataExtractor: (answer) => {
      const match = answer.match(/(\d+\.?\d*)/);
      return {
        'technologyData.testCoverage': match ? parseFloat(match[1]) : 0,
      };
    },
  },

  {
    id: 'tech-004',
    block: 'deep-dive',
    area: 'technology-data',
    questionText: 'Com que frequência acontecem incidentes/bugs críticos em produção?',
    inputType: 'single-choice',
    options: ['Diariamente', 'Semanalmente', 'Mensalmente', 'Raramente (< 1x/mês)'],
    level: 'foundational',
    weight: 0.9,
    dataFields: ['technologyData.incidentFrequency'],
    dataExtractor: (answer) => {
      if (answer.includes('Diariamente')) return { 'technologyData.incidentFrequency': 'daily' };
      if (answer.includes('Semanalmente')) return { 'technologyData.incidentFrequency': 'weekly' };
      if (answer.includes('Mensalmente')) return { 'technologyData.incidentFrequency': 'monthly' };
      return { 'technologyData.incidentFrequency': 'rarely' };
    },
    upstream: ['product'],
  },

  {
    id: 'tech-005',
    block: 'deep-dive',
    area: 'technology-data',
    questionText: 'Qual o maior desafio técnico hoje?',
    placeholder: 'Ex: Tech debt, escalabilidade, falta de dados...',
    inputType: 'textarea',
    level: 'foundational',
    weight: 0.9,
    dataFields: ['technologyData.topChallenge'],
    dataExtractor: (answer) => ({
      'technologyData.topChallenge': answer,
    }),
  },
];

// ============================================================================
// BLOCO 4: RISK SCAN (7 perguntas rápidas, 1 por área)
// ============================================================================

export const RISK_SCAN_QUESTIONS: BusinessQuestionMetadata[] = [
  {
    id: 'risk-mktg-001',
    block: 'risk-scan',
    area: 'marketing-growth',
    questionText: 'Seu CAC está aumentando ou estável/decrescente nos últimos 3 meses?',
    inputType: 'single-choice',
    options: ['Aumentando (🚨 risco)', 'Estável', 'Decrescente (✅ bom)'],
    level: 'foundational',
    weight: 0.5,
    dataFields: [],
  },

  {
    id: 'risk-sales-001',
    block: 'risk-scan',
    area: 'sales-commercial',
    questionText: 'Sua taxa de churn está acima de 5% ao mês?',
    inputType: 'single-choice',
    options: ['Sim (🚨 risco)', 'Não, abaixo de 5%', 'Não medimos ainda'],
    level: 'foundational',
    weight: 0.5,
    dataFields: ['salesCommercial.churnRate'],
    dataExtractor: (answer) => {
      if (answer.includes('Sim')) return { 'salesCommercial.churnRate': 6 };
      if (answer.includes('abaixo')) return { 'salesCommercial.churnRate': 3 };
      return {};
    },
  },

  {
    id: 'risk-prod-001',
    block: 'risk-scan',
    area: 'product',
    questionText: 'Vocês têm backlog de tech debt que impacta velocidade?',
    inputType: 'single-choice',
    options: ['Sim, muito (🚨 crítico)', 'Sim, mas gerenciável', 'Não, tech debt sob controle'],
    level: 'foundational',
    weight: 0.5,
    dataFields: [],
  },

  {
    id: 'risk-ops-001',
    block: 'risk-scan',
    area: 'operations-logistics',
    questionText: 'Vocês já tiveram problemas de escalabilidade operacional (não conseguir atender demanda)?',
    inputType: 'single-choice',
    options: ['Sim, recentemente (🚨 risco)', 'Já tivemos no passado', 'Nunca tivemos'],
    level: 'foundational',
    weight: 0.5,
    dataFields: [],
  },

  {
    id: 'risk-fin-001',
    block: 'risk-scan',
    area: 'financial',
    questionText: 'Seu runway é menor que 12 meses?',
    inputType: 'single-choice',
    options: ['Sim, < 6 meses (🚨 crítico)', 'Sim, 6-12 meses', 'Não, > 12 meses'],
    level: 'foundational',
    weight: 0.5,
    dataFields: [],
  },

  {
    id: 'risk-ppl-001',
    block: 'risk-scan',
    area: 'people-culture',
    questionText: 'Vocês perderam algum líder/pessoa-chave nos últimos 6 meses?',
    inputType: 'single-choice',
    options: ['Sim, e impactou muito (🚨 risco)', 'Sim, mas gerenciamos bem', 'Não'],
    level: 'foundational',
    weight: 0.5,
    dataFields: [],
  },

  {
    id: 'risk-tech-001',
    block: 'risk-scan',
    area: 'technology-data',
    questionText: 'Vocês já tiveram incidente crítico (downtime, perda de dados) nos últimos 3 meses?',
    inputType: 'single-choice',
    options: ['Sim (🚨 risco)', 'Não'],
    level: 'foundational',
    weight: 0.5,
    dataFields: [],
  },
];

// ============================================================================
// EXPORTS CONSOLIDADOS
// ============================================================================

export const ALL_QUESTIONS: BusinessQuestionMetadata[] = [
  ...CONTEXT_QUESTIONS,
  ...EXPERTISE_QUESTIONS,
  ...MARKETING_GROWTH_QUESTIONS,
  ...SALES_COMMERCIAL_QUESTIONS,
  ...PRODUCT_QUESTIONS,
  ...OPERATIONS_QUESTIONS,
  ...FINANCIAL_QUESTIONS,
  ...PEOPLE_CULTURE_QUESTIONS,
  ...TECHNOLOGY_DATA_QUESTIONS,
  ...RISK_SCAN_QUESTIONS,
];

export const QUESTIONS_BY_BLOCK = {
  context: CONTEXT_QUESTIONS,
  expertise: EXPERTISE_QUESTIONS,
  'deep-dive': [
    ...MARKETING_GROWTH_QUESTIONS,
    ...SALES_COMMERCIAL_QUESTIONS,
    ...PRODUCT_QUESTIONS,
    ...OPERATIONS_QUESTIONS,
    ...FINANCIAL_QUESTIONS,
    ...PEOPLE_CULTURE_QUESTIONS,
    ...TECHNOLOGY_DATA_QUESTIONS,
  ],
  'risk-scan': RISK_SCAN_QUESTIONS,
};

export const QUESTIONS_BY_AREA = {
  'marketing-growth': MARKETING_GROWTH_QUESTIONS,
  'sales-commercial': SALES_COMMERCIAL_QUESTIONS,
  'product': PRODUCT_QUESTIONS,
  'operations-logistics': OPERATIONS_QUESTIONS,
  'financial': FINANCIAL_QUESTIONS,
  'people-culture': PEOPLE_CULTURE_QUESTIONS,
  'technology-data': TECHNOLOGY_DATA_QUESTIONS,
};

// Helper: Get question by ID
export function getQuestionById(id: string): BusinessQuestionMetadata | undefined {
  return ALL_QUESTIONS.find((q) => q.id === id);
}

// Helper: Get questions for a specific area in deep-dive block
export function getDeepDiveQuestions(area: BusinessArea): BusinessQuestionMetadata[] {
  return QUESTIONS_BY_AREA[area] || [];
}

// Helper: Get risk scan question for a specific area
export function getRiskScanQuestion(area: BusinessArea): BusinessQuestionMetadata | undefined {
  return RISK_SCAN_QUESTIONS.find((q) => q.area === area);
}
