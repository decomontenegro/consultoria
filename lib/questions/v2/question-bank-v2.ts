/**
 * AI Readiness Question Bank V2
 *
 * Question bank híbrido com variações para evitar repetitividade.
 * Total: ~60 perguntas base × 2-3 variações = 150-180 variações
 *
 * Estrutura:
 * - Intro (1 pergunta)
 * - Company Snapshot (7 perguntas)
 * - Expertise (6 perguntas)
 * - Problems & Opportunities (4 perguntas)
 * - Deep Dive por Área (~30 perguntas)
 * - Automation Focus (3 perguntas)
 * - Closing (3 perguntas)
 */

import {
  QuestionBankItemV2,
  QuestionBankConfig
} from '../../types/assessment-v2/question-variations';

// ============================================================================
// INTRO
// ============================================================================

const INTRO_QUESTIONS: QuestionBankItemV2[] = [
  {
    id: 'intro-001-consent',
    area: 'intro',
    block: 'intro',

    variations: [
      {
        id: 'v1',
        text: 'Bem-vindo ao diagnóstico de prontidão para IA. Este assessment leva cerca de 20-30 minutos e quanto mais detalhes você fornecer, melhor será o diagnóstico. Deseja continuar?',
        tone: 'formal'
      },
      {
        id: 'v2',
        text: 'Oi! Vamos fazer um diagnóstico completo da sua empresa em relação a IA. Leva uns 20-30 minutos, mas vale a pena - quanto mais você compartilhar, melhor o resultado. Bora começar?',
        tone: 'casual'
      },
      {
        id: 'v3',
        text: 'Vamos conversar sobre como IA pode transformar seu negócio. Reserve 20-30 minutos e seja o mais específico possível - isso vai fazer toda diferença no diagnóstico final. Pronto para começar?',
        tone: 'conversational'
      }
    ],

    variation_template: 'Apresente o assessment de IA, mencione que leva 20-30 minutos e incentive o usuário a dar detalhes. Tom: {tone}.',

    inputType: 'boolean',
    required: true,
    weight: 5
  }
];

// ============================================================================
// COMPANY SNAPSHOT
// ============================================================================

const COMPANY_SNAPSHOT_QUESTIONS: QuestionBankItemV2[] = [
  {
    id: 'snap-001-company-name',
    area: 'company_snapshot',
    block: 'company_snapshot',

    variations: [
      {
        id: 'v1',
        text: 'Qual é o nome da empresa?',
        tone: 'formal'
      },
      {
        id: 'v2',
        text: 'Me conta, qual é o nome da sua empresa?',
        tone: 'casual'
      },
      {
        id: 'v3',
        text: 'Vamos começar pelo básico - qual o nome da empresa?',
        tone: 'conversational'
      }
    ],

    variation_template: 'Pergunte o nome da empresa. Tom: {tone}.',

    inputType: 'text_short',
    required: true,
    weight: 5,

    dataExtractor: (answer) => ({
      company_name: String(answer)
    })
  },

  {
    id: 'snap-002-sector',
    area: 'company_snapshot',
    block: 'company_snapshot',

    variations: [
      {
        id: 'v1',
        text: 'Em qual setor a sua empresa atua principalmente?',
        tone: 'formal'
      },
      {
        id: 'v2',
        text: 'Qual é o setor/área de atuação da empresa?',
        tone: 'casual'
      },
      {
        id: 'v3',
        text: 'Conta pra mim, em que setor/mercado vocês trabalham?',
        tone: 'conversational'
      }
    ],

    variation_template: 'Pergunte sobre o setor/indústria da empresa. Tom: {tone}.',

    inputType: 'single_select',
    options: [
      { value: 'services', label: 'Serviços' },
      { value: 'industry', label: 'Indústria' },
      { value: 'technology', label: 'Tecnologia / SaaS' },
      { value: 'retail', label: 'Varejo / E-commerce' },
      { value: 'health', label: 'Saúde' },
      { value: 'education', label: 'Educação' },
      { value: 'finance', label: 'Finanças' },
      { value: 'other', label: 'Outro' }
    ],
    required: true,
    weight: 4,

    dataExtractor: (answer) => ({
      sector: String(answer)
    })
  },

  {
    id: 'snap-003-business-model',
    area: 'company_snapshot',
    block: 'company_snapshot',

    variations: [
      {
        id: 'v1',
        text: 'Qual é o principal modelo de negócio da empresa?',
        tone: 'formal'
      },
      {
        id: 'v2',
        text: 'Como a empresa funciona - B2B, B2C, marketplace...?',
        tone: 'casual'
      },
      {
        id: 'v3',
        text: 'Me ajuda a entender o modelo de negócio - vocês vendem para empresas, consumidores finais, ou é mais complexo?',
        tone: 'conversational'
      }
    ],

    variation_template: 'Pergunte sobre o modelo de negócio (B2B, B2C, etc). Tom: {tone}.',

    inputType: 'multi_select',
    options: [
      { value: 'b2b', label: 'B2B (vendas para empresas)' },
      { value: 'b2c', label: 'B2C (vendas para consumidor final)' },
      { value: 'b2b2c', label: 'B2B2C (através de parceiros)' },
      { value: 'marketplace', label: 'Marketplace' },
      { value: 'saas', label: 'SaaS / Assinatura' },
      { value: 'other', label: 'Outro' }
    ],
    required: true,
    weight: 4,

    dataExtractor: (answer) => ({
      business_model: Array.isArray(answer) ? answer : [answer]
    })
  },

  {
    id: 'snap-004-revenue-range',
    area: 'company_snapshot',
    block: 'company_snapshot',

    variations: [
      {
        id: 'v1',
        text: 'Faixa de faturamento anual aproximado:',
        tone: 'formal'
      },
      {
        id: 'v2',
        text: 'Qual a faixa de faturamento anual da empresa?',
        tone: 'casual'
      },
      {
        id: 'v3',
        text: 'Para entender o porte, qual a faixa de receita anual aproximada?',
        tone: 'conversational',
        context: 'Mais contextual, explica por que está perguntando'
      }
    ],

    variation_template: 'Pergunte sobre faturamento anual em faixas. Tom: {tone}. Deixe claro que é aproximado.',

    inputType: 'single_select',
    options: [
      { value: 'up_to_1m', label: 'Até R$ 1 milhão' },
      { value: '1m_to_5m', label: 'Entre R$ 1M e R$ 5M' },
      { value: '5m_to_20m', label: 'Entre R$ 5M e R$ 20M' },
      { value: '20m_to_100m', label: 'Entre R$ 20M e R$ 100M' },
      { value: 'above_100m', label: 'Acima de R$ 100M' },
      { value: 'prefer_not_say', label: 'Prefiro não informar' }
    ],
    required: false,
    weight: 3,

    dataExtractor: (answer) => ({
      revenue_range: String(answer)
    })
  },

  {
    id: 'snap-005-employees',
    area: 'company_snapshot',
    block: 'company_snapshot',

    variations: [
      {
        id: 'v1',
        text: 'Quantidade aproximada de colaboradores:',
        tone: 'formal'
      },
      {
        id: 'v2',
        text: 'Quantas pessoas trabalham na empresa hoje?',
        tone: 'casual'
      },
      {
        id: 'v3',
        text: 'Me conta sobre o time - quantos colaboradores vocês são hoje?',
        tone: 'conversational'
      }
    ],

    variation_template: 'Pergunte sobre número de colaboradores/funcionários. Tom: {tone}.',

    inputType: 'single_select',
    options: [
      { value: 'startup', label: 'Startup (1-10 pessoas)' },
      { value: 'small', label: 'Pequena (11-50)' },
      { value: 'medium', label: 'Média (51-200)' },
      { value: 'scaleup', label: 'Scale-up (201-500)' },
      { value: 'large', label: 'Grande (500+)' }
    ],
    required: true,
    weight: 4,

    followUpTriggers: [
      {
        condition: (answer) => answer === 'scaleup' || answer === 'large',
        reason: 'Large company - ask about organizational complexity and decision-making structure'
      }
    ],

    dataExtractor: (answer) => ({
      company_size: String(answer)
    })
  },

  {
    id: 'snap-006-digital-maturity',
    area: 'company_snapshot',
    block: 'company_snapshot',

    variations: [
      {
        id: 'v1',
        text: 'De 0 a 5, quão digitalizada você considera que a empresa é hoje? (0 = quase nada digital, 5 = processos bem estruturados e integrados digitalmente)',
        tone: 'formal'
      },
      {
        id: 'v2',
        text: 'Numa escala de 0 a 5, qual o nível de digitalização da empresa? Onde 0 é "ainda muito manual/papel" e 5 é "tudo integrado e digital".',
        tone: 'casual'
      },
      {
        id: 'v3',
        text: 'Pensa nos processos da empresa hoje - de 0 a 5, quão digitalizados eles são? 0 seria processos manuais/planilhas e 5 seria tudo automatizado e integrado.',
        tone: 'conversational',
        context: 'Mais explicativo, com exemplos'
      }
    ],

    variation_template: 'Pergunte sobre maturidade digital em escala 0-5. Explique os extremos. Tom: {tone}.',

    inputType: 'scale_0_5',
    required: true,
    weight: 4,

    dataExtractor: (answer) => ({
      digital_maturity: Number(answer)
    })
  },

  {
    id: 'snap-007-ai-usage-current',
    area: 'company_snapshot',
    block: 'company_snapshot',

    variations: [
      {
        id: 'v1',
        text: 'Como vocês usam inteligência artificial hoje?',
        tone: 'formal'
      },
      {
        id: 'v2',
        text: 'A empresa já usa IA de alguma forma? Se sim, como?',
        tone: 'casual'
      },
      {
        id: 'v3',
        text: 'Conta pra mim, vocês já têm IA rodando em algum processo ou ainda estão só explorando?',
        tone: 'conversational'
      }
    ],

    variation_template: 'Pergunte sobre uso atual de IA na empresa. Tom: {tone}.',

    inputType: 'single_select',
    options: [
      { value: 'not_using', label: 'Ainda não usamos IA' },
      { value: 'testing', label: 'Estamos testando de forma pontual (ex: ChatGPT, ferramentas isoladas)' },
      { value: 'some_processes', label: 'Temos alguns processos já apoiados por IA, mas sem estratégia clara' },
      { value: 'structured', label: 'Temos uma estratégia estruturada de IA para o negócio' }
    ],
    required: true,
    weight: 5,

    followUpTriggers: [
      {
        condition: (answer) => answer === 'some_processes' || answer === 'structured',
        reason: 'Company already uses AI - ask for specific examples and results',
        suggested_question_template: 'Você mencionou que já usa IA em alguns processos. Pode dar exemplos concretos de onde está usando e quais resultados já viu?'
      }
    ],

    dataExtractor: (answer) => ({
      ai_usage_current: String(answer)
    })
  }
];

// ============================================================================
// EXPERTISE AREAS
// ============================================================================

const EXPERTISE_QUESTIONS: QuestionBankItemV2[] = [
  {
    id: 'exp-001-areas',
    area: 'expertise',
    block: 'expertise',

    variations: [
      {
        id: 'v1',
        text: 'Em quais dessas áreas você tem conhecimento relevante para falar sobre a empresa?',
        tone: 'formal'
      },
      {
        id: 'v2',
        text: 'Marca as áreas onde você tem um bom conhecimento do que acontece na empresa:',
        tone: 'casual'
      },
      {
        id: 'v3',
        text: 'Para eu adaptar as próximas perguntas, me conta: em quais áreas você tem mais domínio e consegue falar com propriedade?',
        tone: 'conversational',
        context: 'Explica POR QUE está perguntando (adaptar perguntas)'
      }
    ],

    variation_template: 'Pergunte sobre áreas de expertise/conhecimento do respondente. Tom: {tone}. Explique que vai usar para adaptar perguntas.',

    inputType: 'multi_select',
    options: [
      { value: 'strategy-business', label: 'Estratégia e Negócios' },
      { value: 'tech-engineering', label: 'Tecnologia e Engenharia' },
      { value: 'product-ux', label: 'Produto e UX' },
      { value: 'finance-ops', label: 'Finanças e Operações' },
      { value: 'marketing-sales', label: 'Marketing e Vendas' },
      { value: 'hr', label: 'Recursos Humanos' }
    ],
    required: true,
    weight: 5,

    dataExtractor: (answer) => ({
      expertise_areas: Array.isArray(answer) ? answer : [answer]
    })
  },

  {
    id: 'exp-002-depth-level',
    area: 'expertise',
    block: 'expertise',

    variations: [
      {
        id: 'v1',
        text: 'Qual é o seu nível de domínio em {área}?',
        tone: 'formal'
      },
      {
        id: 'v2',
        text: 'Dentro de {área}, você se considera mais iniciante, intermediário ou expert?',
        tone: 'casual'
      },
      {
        id: 'v3',
        text: 'Falando de {área}, qual seu nível de profundidade - básico, já manda bem, ou é sua praia?',
        tone: 'conversational'
      }
    ],

    variation_template: 'Pergunte sobre nível de domínio em área específica marcada. Use placeholder {{área}}. Tom: {tone}.',

    inputType: 'single_select',
    options: [
      { value: 'basic', label: 'Básico - tenho noções gerais' },
      { value: 'intermediate', label: 'Intermediário - conheço bem' },
      { value: 'deep', label: 'Profundo - é minha área principal' }
    ],
    required: true,
    weight: 3,

    tags: ['dynamic'],

    dataExtractor: (answer) => ({
      expertise_level: String(answer)
    })
  }
];

// ============================================================================
// PROBLEMS & OPPORTUNITIES
// ============================================================================

const PROBLEMS_OPPORTUNITIES_QUESTIONS: QuestionBankItemV2[] = [
  {
    id: 'prob-001-problem-areas',
    area: 'problems_opportunities',
    block: 'problems_opportunities',

    variations: [
      {
        id: 'v1',
        text: 'Em quais áreas você enxerga mais problemas ou desafios hoje?',
        tone: 'formal'
      },
      {
        id: 'v2',
        text: 'Onde estão os maiores problemas hoje - marketing, tech, ops...?',
        tone: 'casual'
      },
      {
        id: 'v3',
        text: 'Pensa nas áreas que mais te tiram o sono ou onde você vê mais oportunidades de melhoria - quais são?',
        tone: 'conversational'
      }
    ],

    variation_template: 'Pergunte sobre áreas com mais problemas/desafios. Tom: {tone}.',

    inputType: 'multi_select',
    options: [
      { value: 'strategy-business', label: 'Estratégia e Negócios' },
      { value: 'tech-engineering', label: 'Tecnologia e Engenharia' },
      { value: 'product-ux', label: 'Produto e UX' },
      { value: 'finance-ops', label: 'Finanças e Operações' },
      { value: 'marketing-sales', label: 'Marketing e Vendas' },
      { value: 'hr', label: 'Recursos Humanos' }
    ],
    required: true,
    weight: 5,

    dataExtractor: (answer) => ({
      problem_areas: Array.isArray(answer) ? answer : [answer]
    })
  },

  {
    id: 'prob-002-opportunity-areas',
    area: 'problems_opportunities',
    block: 'problems_opportunities',

    variations: [
      {
        id: 'v1',
        text: 'Em quais áreas você enxerga mais oportunidades de crescimento ou melhoria? (Ordene por prioridade)',
        tone: 'formal'
      },
      {
        id: 'v2',
        text: 'Onde você acha que tem mais espaço para crescer/melhorar? Coloca em ordem de prioridade.',
        tone: 'casual'
      },
      {
        id: 'v3',
        text: 'Se você pudesse focar em melhorar algumas áreas, quais seriam e em que ordem? Arrasta para ordenar por prioridade.',
        tone: 'conversational'
      }
    ],

    variation_template: 'Pergunte sobre áreas com oportunidades de melhoria, peça para ordenar por prioridade. Tom: {tone}.',

    inputType: 'multi_select_sortable',
    options: [
      { value: 'strategy-business', label: 'Estratégia e Negócios' },
      { value: 'tech-engineering', label: 'Tecnologia e Engenharia' },
      { value: 'product-ux', label: 'Produto e UX' },
      { value: 'finance-ops', label: 'Finanças e Operações' },
      { value: 'marketing-sales', label: 'Marketing e Vendas' },
      { value: 'hr', label: 'Recursos Humanos' }
    ],
    required: true,
    weight: 5,

    dataExtractor: (answer) => ({
      opportunity_areas_sorted: Array.isArray(answer) ? answer : [answer]
    })
  },

  {
    id: 'prob-003-problem-stories',
    area: 'problems_opportunities',
    block: 'problems_opportunities',

    variations: [
      {
        id: 'v1',
        text: 'Conte 1 a 3 situações reais recentes em que você sentiu que a empresa poderia ter funcionado muito melhor. Descreva o contexto, o que aconteceu e qual foi o impacto.',
        tone: 'formal',
        placeholder: 'Ex: Perdemos um cliente grande porque a proposta demorou 5 dias. O comercial tinha que pedir dados pro financeiro, que estava de férias...'
      },
      {
        id: 'v2',
        text: 'Pensa em 1, 2 ou 3 situações recentes onde você pensou "podia ter sido diferente". Conta o que rolou e qual foi o efeito disso.',
        tone: 'casual',
        placeholder: 'Pode ser específico - quanto mais detalhe, melhor!'
      },
      {
        id: 'v3',
        text: 'Nos últimos meses, quais foram as situações que mais te incomodaram ou onde você viu oportunidades claras de melhoria? Me dá exemplos concretos com contexto.',
        tone: 'conversational',
        placeholder: 'Exemplo: "Semana passada aconteceu X, envolveu as áreas Y e Z, e o resultado foi..."'
      }
    ],

    variation_template: 'Peça para usuário descrever situações/problemas recentes com contexto e impacto. Tom: {tone}. Incentive exemplos concretos.',

    inputType: 'text_long',
    required: true,
    weight: 5,

    followUpTriggers: [
      {
        condition: (answer) => String(answer).length > 100,
        reason: 'User provided rich problem stories - drill deeper into the most impactful one',
        suggested_question_template: 'Você mencionou [problema X]. Pode detalhar um pouco mais: quem estava envolvido, quanto tempo/dinheiro foi perdido, e se isso acontece com frequência?'
      }
    ],

    dataExtractor: (answer) => ({
      problem_stories_raw: String(answer)
    })
  }
];

// ============================================================================
// DEEP DIVE: MARKETING & VENDAS
// ============================================================================

const MARKETING_SALES_DEEP_DIVE: QuestionBankItemV2[] = [
  {
    id: 'mkt-001-process-overview',
    area: 'marketing-sales',
    block: 'deep_dive',

    variations: [
      {
        id: 'v1',
        text: 'Descreva, em passos, como é hoje o fluxo desde alguém ouvir falar da empresa até fechar negócio.',
        tone: 'formal',
        placeholder: 'Ex: 1) Lead chega via Google Ads, 2) SDR qualifica por telefone, 3) ...'
      },
      {
        id: 'v2',
        text: 'Conta pra mim o caminho que um cliente faz - desde conhecer a empresa até fechar a compra. Como funciona esse processo hoje?',
        tone: 'casual',
        placeholder: 'Pode ser em tópicos ou narrativa, como preferir'
      },
      {
        id: 'v3',
        text: 'Vamos mapear o funil de vendas - me descreve passo a passo: lead entra, o que acontece depois, quem faz o quê, até virar cliente.',
        tone: 'conversational',
        placeholder: 'Exemplo: "1) Lead preenche formulário → 2) Time comercial recebe e-mail → 3)..."'
      }
    ],

    variation_template: 'Peça para descrever o processo de vendas/marketing ponta a ponta, do lead até cliente. Tom: {tone}. Incentive descrição em etapas.',

    inputType: 'text_long',
    required: false,
    weight: 5,
    tags: ['processo', 'marketing-sales'],

    personas: ['all'],

    followUpTriggers: [
      {
        condition: (answer) => String(answer).length < 100,
        reason: 'Resposta muito curta para processo - pedir mais detalhes',
        suggested_question_template: 'Pode detalhar um pouco mais? Por exemplo: quais sistemas são usados, quanto tempo leva cada etapa, quem são os responsáveis?'
      }
    ],

    dataExtractor: (answer) => ({
      mkt_process_overview: String(answer)
    })
  },

  {
    id: 'mkt-002-bottlenecks',
    area: 'marketing-sales',
    block: 'deep_dive',

    variations: [
      {
        id: 'v1',
        text: 'Dentro desse fluxo, quais partes você sente que mais atrasam, geram retrabalho ou fazem vocês perderem oportunidades?',
        tone: 'formal'
      },
      {
        id: 'v2',
        text: 'Onde o processo trava, demora demais ou gera retrabalho?',
        tone: 'casual',
        placeholder: 'Ex: Envio de proposta demora 3 dias porque depende de aprovação manual...'
      },
      {
        id: 'v3',
        text: 'Pensa em onde vocês mais perdem tempo ou deixam oportunidades escaparem nesse fluxo - o que acontece?',
        tone: 'conversational',
        placeholder: 'Pode dar exemplos concretos do que trava o processo'
      }
    ],

    variation_template: 'Pergunte sobre gargalos, atrasos e retrabalho no processo de marketing/vendas. Tom: {tone}. Peça exemplos concretos.',

    inputType: 'text_long',
    required: false,
    weight: 5,
    tags: ['gargalos', 'marketing-sales', 'processo_manual'],

    personas: ['all'],

    followUpTriggers: [
      {
        condition: (answer) => {
          const text = String(answer).toLowerCase();
          return text.includes('manual') || text.includes('planilha') || text.includes('demora');
        },
        reason: 'Mencionou processos manuais ou lentidão - oportunidade de automação clara',
        suggested_question_template: 'Você mencionou que [X] é manual/demora. Quanto tempo isso consome por semana? E quantas pessoas estão envolvidas nisso?'
      }
    ],

    dataExtractor: (answer) => ({
      mkt_bottlenecks: String(answer)
    })
  },

  {
    id: 'mkt-003-metrics',
    area: 'marketing-sales',
    block: 'deep_dive',

    variations: [
      {
        id: 'v1',
        text: 'Quais dessas métricas vocês acompanham regularmente em marketing e vendas?',
        tone: 'formal'
      },
      {
        id: 'v2',
        text: 'Que números/métricas vocês olham toda semana ou mês em marketing/vendas?',
        tone: 'casual'
      },
      {
        id: 'v3',
        text: 'Quando vocês vão decidir onde investir em marketing ou como melhorar vendas, quais métricas vocês consultam?',
        tone: 'conversational',
        context: 'Mais contextual, explica o "por quê" da pergunta'
      }
    ],

    variation_template: 'Pergunte quais métricas de marketing/vendas são acompanhadas. Tom: {tone}. Liste opções comuns.',

    inputType: 'multi_select',
    options: [
      { value: 'cac', label: 'CAC (Custo de Aquisição de Cliente)' },
      { value: 'ltv', label: 'LTV (Lifetime Value)' },
      { value: 'churn', label: 'Churn / Cancelamentos' },
      { value: 'conversion', label: 'Conversão por etapa do funil' },
      { value: 'ticket', label: 'Ticket médio' },
      { value: 'cycle_time', label: 'Tempo médio de ciclo de venda' },
      { value: 'roi', label: 'ROI de campanhas' },
      { value: 'leads', label: 'Volume de leads' },
      { value: 'none', label: 'Nenhuma de forma estruturada' }
    ],
    required: false,
    weight: 4,
    tags: ['metricas', 'marketing-sales'],

    personas: ['all'],

    followUpTriggers: [
      {
        condition: (answer) => {
          const metrics = Array.isArray(answer) ? answer : [answer];
          return metrics.includes('none');
        },
        reason: 'Não acompanha métricas estruturadas - perguntar como tomam decisões',
        suggested_question_template: 'Se vocês não acompanham essas métricas, como decidem onde investir em marketing ou o que melhorar em vendas?'
      }
    ],

    dataExtractor: (answer) => ({
      mkt_metrics_tracked: Array.isArray(answer) ? answer : [answer]
    })
  },

  {
    id: 'mkt-004-ownership',
    area: 'marketing-sales',
    block: 'deep_dive',

    variations: [
      {
        id: 'v1',
        text: 'Quem é hoje o principal responsável por marketing e vendas (cargo ou nome)?',
        tone: 'formal',
        placeholder: 'Ex: Diretora Comercial - Maria Silva'
      },
      {
        id: 'v2',
        text: 'Quem cuida de marketing/vendas aí? Tem um responsável claro?',
        tone: 'casual',
        placeholder: 'Nome ou cargo'
      },
      {
        id: 'v3',
        text: 'Conta pra mim, quem toca a área de marketing e vendas? É uma pessoa, um time, vários responsáveis?',
        tone: 'conversational',
        placeholder: 'Pode descrever a estrutura se for complexo'
      }
    ],

    variation_template: 'Pergunte quem é responsável/dono da área de marketing e vendas. Tom: {tone}.',

    inputType: 'text_short',
    required: false,
    weight: 3,
    tags: ['ownership', 'marketing-sales'],

    personas: ['all'],

    dataExtractor: (answer) => ({
      mkt_owner: String(answer)
    })
  },

  {
    id: 'mkt-005-manual-tasks',
    area: 'marketing-sales',
    block: 'deep_dive',

    variations: [
      {
        id: 'v1',
        text: 'Liste atividades de marketing/vendas que hoje são 100% manuais e consomem muito tempo do time.',
        tone: 'formal',
        placeholder: 'Ex: Enviar follow-ups para leads, montar propostas personalizadas, consolidar relatórios semanais...'
      },
      {
        id: 'v2',
        text: 'O que vocês fazem de forma totalmente manual em marketing/vendas que rouba muito tempo?',
        tone: 'casual',
        placeholder: 'Pensa nas tarefas repetitivas que dão trabalho'
      },
      {
        id: 'v3',
        text: 'Se você pudesse automatizar 3 atividades manuais de marketing/vendas hoje, quais seriam? O que consome mais tempo do time?',
        tone: 'conversational',
        placeholder: 'Pode ser bem específico: "Toda segunda-feira alguém precisa..."'
      }
    ],

    variation_template: 'Pergunte sobre atividades manuais que consomem tempo em marketing/vendas. Tom: {tone}. Incentive listas de tarefas repetitivas.',

    inputType: 'text_long',
    required: false,
    weight: 5,
    tags: ['processo_manual', 'marketing-sales', 'oportunidade_automacao'],

    personas: ['all'],

    followUpTriggers: [
      {
        condition: (answer) => String(answer).length > 100,
        reason: 'Listou várias atividades manuais - drill down na mais crítica',
        suggested_question_template: 'Dessas atividades que você listou, qual é a que mais impacta negativamente - seja por tempo, custo ou qualidade do resultado?'
      }
    ],

    dataExtractor: (answer) => ({
      mkt_manual_tasks: String(answer)
    })
  },

  {
    id: 'mkt-006-tools',
    area: 'marketing-sales',
    block: 'deep_dive',

    variations: [
      {
        id: 'v1',
        text: 'Quais ferramentas ou sistemas vocês usam hoje para marketing e vendas?',
        tone: 'formal',
        placeholder: 'Ex: HubSpot CRM, RD Station, Google Ads, planilhas, Pipedrive...'
      },
      {
        id: 'v2',
        text: 'Que ferramentas/sistemas vocês usam para tocar marketing e vendas?',
        tone: 'casual',
        placeholder: 'CRM, automação de email, ads, qualquer coisa'
      },
      {
        id: 'v3',
        text: 'Me conta sobre o stack de marketing/vendas - quais ferramentas estão no dia a dia? CRM, automação, anúncios, analytics...?',
        tone: 'conversational',
        placeholder: 'Pode incluir até planilhas e WhatsApp se for o que usam'
      }
    ],

    variation_template: 'Pergunte sobre ferramentas e sistemas usados em marketing/vendas. Tom: {tone}. Aceite qualquer tipo de ferramenta.',

    inputType: 'text_long',
    required: false,
    weight: 3,
    tags: ['ferramentas', 'marketing-sales'],

    personas: ['all'],

    followUpTriggers: [
      {
        condition: (answer) => {
          const text = String(answer).toLowerCase();
          return text.includes('planilha') || text.includes('excel') || text.includes('sheets');
        },
        reason: 'Usa planilhas como ferramenta principal - perguntar sobre limitações',
        suggested_question_template: 'Você mencionou planilhas. Quais são as maiores limitações ou problemas que vocês enfrentam usando planilhas para isso?'
      }
    ],

    dataExtractor: (answer) => ({
      mkt_tools_stack: String(answer)
    })
  }
];

// ============================================================================
// DEEP DIVE: TECNOLOGIA & ENGENHARIA
// ============================================================================

const TECH_ENGINEERING_DEEP_DIVE: QuestionBankItemV2[] = [
  {
    id: 'tech-001-dev-process',
    area: 'tech-engineering',
    block: 'deep_dive',

    variations: [
      {
        id: 'v1',
        text: 'Descreva o processo de desenvolvimento de software da empresa, desde a definição de uma feature até ela estar em produção.',
        tone: 'formal',
        placeholder: 'Ex: 1) Product cria ticket, 2) Dev pega da fila, 3) Code review, 4) Deploy...'
      },
      {
        id: 'v2',
        text: 'Como funciona o ciclo de desenvolvimento aqui? Desde alguém pedir uma funcionalidade até ela estar no ar.',
        tone: 'casual',
        placeholder: 'Pode ser bem informal, tipo "alguém pede no Slack, aí..."'
      },
      {
        id: 'v3',
        text: 'Me conta o fluxo: alguém define que precisa de uma nova feature - o que acontece depois até estar rodando em produção?',
        tone: 'conversational',
        placeholder: 'Pensa no passo a passo: quem faz o quê, quais etapas existem'
      }
    ],

    variation_template: 'Pergunte sobre o processo de desenvolvimento de software da empresa, do pedido à produção. Tom: {tone}.',

    inputType: 'text_long',
    required: false,
    weight: 5,
    tags: ['processo', 'tech-engineering'],

    personas: ['all'],

    followUpTriggers: [
      {
        condition: (answer) => String(answer).length < 80,
        reason: 'Resposta muito curta - pedir detalhes sobre etapas e responsáveis',
        suggested_question_template: 'Pode detalhar um pouco mais? Por exemplo: quantas etapas tem, quem aprova, se tem testes automáticos, como é o deploy?'
      }
    ],

    dataExtractor: (answer) => ({
      tech_dev_process: String(answer)
    })
  },

  {
    id: 'tech-002-cycle-time',
    area: 'tech-engineering',
    block: 'deep_dive',

    variations: [
      {
        id: 'v1',
        text: 'Quanto tempo, em média, leva desde o início do desenvolvimento de uma feature até ela estar em produção?',
        tone: 'formal'
      },
      {
        id: 'v2',
        text: 'Qual o tempo típico de uma feature: começa a desenvolver e vai pro ar em quanto tempo?',
        tone: 'casual',
        placeholder: 'Ex: dias, semanas, meses...'
      },
      {
        id: 'v3',
        text: 'Se vocês começam a desenvolver uma feature hoje, quanto tempo demora até ela estar rodando pra usuários de verdade?',
        tone: 'conversational',
        placeholder: 'Pode ser uma média aproximada'
      }
    ],

    variation_template: 'Pergunte sobre tempo de ciclo de desenvolvimento (feature → produção). Tom: {tone}.',

    inputType: 'single_select',
    options: [
      { value: 'hours', label: 'Horas (mesma semana)' },
      { value: 'days', label: '1-3 dias' },
      { value: 'week', label: '1 semana' },
      { value: 'weeks', label: '2-4 semanas' },
      { value: 'month_plus', label: 'Mais de 1 mês' },
      { value: 'varies', label: 'Varia muito, sem padrão claro' }
    ],
    required: false,
    weight: 4,
    tags: ['metricas', 'tech-engineering', 'velocidade'],

    personas: ['all'],

    followUpTriggers: [
      {
        condition: (answer) => answer === 'month_plus' || answer === 'varies',
        reason: 'Ciclo longo ou irregular - investigar causas',
        suggested_question_template: 'O que você acha que mais atrasa o ciclo? Code review, testes, deploy, aprovações, outras coisas?'
      }
    ],

    dataExtractor: (answer) => ({
      tech_cycle_time: String(answer)
    })
  },

  {
    id: 'tech-003-bugs-frequency',
    area: 'tech-engineering',
    block: 'deep_dive',

    variations: [
      {
        id: 'v1',
        text: 'Com que frequência vocês lidam com bugs críticos ou incidents em produção?',
        tone: 'formal'
      },
      {
        id: 'v2',
        text: 'Quão comum é ter bugs sérios ou coisas quebrando em produção?',
        tone: 'casual',
        placeholder: 'Toda semana? Todo mês? Raramente?'
      },
      {
        id: 'v3',
        text: 'Pensa nas últimas semanas - com que frequência vocês têm bugs graves ou algo para em produção?',
        tone: 'conversational',
        placeholder: 'Tipo: toda semana temos pelo menos 1, ou é mais raro...'
      }
    ],

    variation_template: 'Pergunte sobre frequência de bugs/incidents críticos em produção. Tom: {tone}.',

    inputType: 'single_select',
    options: [
      { value: 'daily', label: 'Diariamente' },
      { value: 'weekly', label: 'Semanalmente' },
      { value: 'monthly', label: 'Mensalmente' },
      { value: 'quarterly', label: 'Trimestralmente' },
      { value: 'rare', label: 'Raramente acontece' },
      { value: 'dont_track', label: 'Não acompanhamos formalmente' }
    ],
    required: false,
    weight: 4,
    tags: ['metricas', 'tech-engineering', 'qualidade'],

    personas: ['all'],

    followUpTriggers: [
      {
        condition: (answer) => answer === 'daily' || answer === 'weekly',
        reason: 'Alta frequência de bugs - perguntar sobre processo de QA e testes',
        suggested_question_template: 'Vocês têm testes automatizados? Como funciona o processo de QA antes de ir pra produção?'
      }
    ],

    dataExtractor: (answer) => ({
      tech_bugs_frequency: String(answer)
    })
  },

  {
    id: 'tech-004-stack',
    area: 'tech-engineering',
    block: 'deep_dive',

    variations: [
      {
        id: 'v1',
        text: 'Qual é a stack técnica principal da empresa? (linguagens, frameworks, infraestrutura)',
        tone: 'formal',
        placeholder: 'Ex: React, Node.js, PostgreSQL, AWS...'
      },
      {
        id: 'v2',
        text: 'Quais tecnologias/linguagens vocês usam? Stack principal.',
        tone: 'casual',
        placeholder: 'Frontend, backend, banco, infra...'
      },
      {
        id: 'v3',
        text: 'Me conta sobre a stack - que linguagens, frameworks e infra vocês rodam?',
        tone: 'conversational',
        placeholder: 'Tudo que for relevante: web, mobile, banco de dados, cloud...'
      }
    ],

    variation_template: 'Pergunte sobre stack técnica da empresa (linguagens, frameworks, infra). Tom: {tone}.',

    inputType: 'text_long',
    required: false,
    weight: 3,
    tags: ['ferramentas', 'tech-engineering'],

    personas: ['all'],

    followUpTriggers: [
      {
        condition: (answer) => {
          const text = String(answer).toLowerCase();
          return text.includes('legado') || text.includes('antigo') || text.includes('migrar');
        },
        reason: 'Mencionou tech legada ou migração - explorar dores e planos',
        suggested_question_template: 'Você mencionou tecnologia legada/antiga. Isso gera problemas no dia a dia? Tem planos de migração?'
      }
    ],

    dataExtractor: (answer) => ({
      tech_stack: String(answer)
    })
  },

  {
    id: 'tech-005-code-review',
    area: 'tech-engineering',
    block: 'deep_dive',

    variations: [
      {
        id: 'v1',
        text: 'Como funciona o processo de code review? Todo código passa por revisão antes de ir para produção?',
        tone: 'formal'
      },
      {
        id: 'v2',
        text: 'Vocês fazem code review? Como funciona isso aí?',
        tone: 'casual',
        placeholder: 'Ex: sempre, às vezes, não fazemos, etc'
      },
      {
        id: 'v3',
        text: 'Conta como é o code review - todo mundo revisa o código dos outros, ou vai direto pra produção?',
        tone: 'conversational',
        placeholder: 'Quanto mais detalhe melhor: quem revisa, quando, ferramenta...'
      }
    ],

    variation_template: 'Pergunte sobre processo de code review na empresa. Tom: {tone}.',

    inputType: 'single_select',
    options: [
      { value: 'always', label: 'Sempre - todo código é revisado antes de merge' },
      { value: 'most_times', label: 'Na maioria das vezes, mas tem exceções' },
      { value: 'sometimes', label: 'Às vezes, depende da urgência' },
      { value: 'rarely', label: 'Raramente ou nunca' },
      { value: 'no_process', label: 'Não temos processo formal de code review' }
    ],
    required: false,
    weight: 3,
    tags: ['processo', 'tech-engineering', 'qualidade'],

    personas: ['all'],

    dataExtractor: (answer) => ({
      tech_code_review: String(answer)
    })
  },

  {
    id: 'tech-006-automation',
    area: 'tech-engineering',
    block: 'deep_dive',

    variations: [
      {
        id: 'v1',
        text: 'Quais automações técnicas vocês já têm implementadas? (CI/CD, testes automatizados, deploys, monitoramento, etc)',
        tone: 'formal',
        placeholder: 'Ex: CI com GitHub Actions, testes unitários, deploy automático...'
      },
      {
        id: 'v2',
        text: 'O que vocês já automatizaram no processo de desenvolvimento? CI/CD, testes, deploy...?',
        tone: 'casual',
        placeholder: 'Lista o que já roda automático vs manual'
      },
      {
        id: 'v3',
        text: 'Me conta o que já roda no automático - testes? Deploy? CI/CD? Monitoramento? O que ainda é manual?',
        tone: 'conversational',
        placeholder: 'Pode separar: "Automático: X, Y, Z / Manual: A, B, C"'
      }
    ],

    variation_template: 'Pergunte sobre automações técnicas existentes (CI/CD, testes, deploy). Tom: {tone}.',

    inputType: 'text_long',
    required: false,
    weight: 5,
    tags: ['automacao', 'tech-engineering', 'processo'],

    personas: ['all'],

    followUpTriggers: [
      {
        condition: (answer) => {
          const text = String(answer).toLowerCase();
          return text.includes('manual') || text.includes('nada') || text.includes('não');
        },
        reason: 'Pouca automação - perguntar sobre maiores dores manuais',
        suggested_question_template: 'Dos processos que ainda são manuais, qual é o que mais dá trabalho ou mais atrasa o time?'
      }
    ],

    dataExtractor: (answer) => ({
      tech_automation: String(answer)
    })
  }
];

// ============================================================================
// DEEP DIVE: PRODUTO & UX
// ============================================================================

const PRODUCT_UX_DEEP_DIVE: QuestionBankItemV2[] = [
  {
    id: 'prod-001-discovery',
    area: 'product-ux',
    block: 'deep_dive',

    variations: [
      {
        id: 'v1',
        text: 'Como funciona o processo de product discovery? Como vocês decidem o que desenvolver/priorizar?',
        tone: 'formal',
        placeholder: 'Ex: Research com usuários, dados de analytics, feedback do comercial...'
      },
      {
        id: 'v2',
        text: 'Como vocês decidem o que colocar no roadmap? O que define prioridades?',
        tone: 'casual',
        placeholder: 'Pode ser: "CEO decide", "time de produto faz pesquisa", etc'
      },
      {
        id: 'v3',
        text: 'Conta pra mim: quando vão decidir qual a próxima feature/produto, como vocês fazem? Pesquisa? Dados? Feeling?',
        tone: 'conversational',
        placeholder: 'Quanto mais honesto melhor - não precisa ser super estruturado'
      }
    ],

    variation_template: 'Pergunte sobre processo de product discovery e priorização. Tom: {tone}.',

    inputType: 'text_long',
    required: false,
    weight: 5,
    tags: ['processo', 'product-ux'],

    personas: ['all'],

    followUpTriggers: [
      {
        condition: (answer) => {
          const text = String(answer).toLowerCase();
          return text.includes('feeling') || text.includes('achismo') || text.includes('ceo') || text.includes('fundador');
        },
        reason: 'Discovery baseado em opinião - perguntar se isso gera problemas',
        suggested_question_template: 'Vocês sentem que essa forma de decidir gera retrabalho ou features que não são usadas? Já pensaram em estruturar mais o discovery?'
      }
    ],

    dataExtractor: (answer) => ({
      prod_discovery_process: String(answer)
    })
  },

  {
    id: 'prod-002-metrics',
    area: 'product-ux',
    block: 'deep_dive',

    variations: [
      {
        id: 'v1',
        text: 'Quais métricas de produto vocês acompanham regularmente?',
        tone: 'formal'
      },
      {
        id: 'v2',
        text: 'Que métricas de produto vocês olham? Tipo: retenção, ativação, churn...?',
        tone: 'casual',
        placeholder: 'Lista o que é acompanhado'
      },
      {
        id: 'v3',
        text: 'Quando vocês querem saber se uma feature tá funcionando ou o produto tá indo bem, que números vocês olham?',
        tone: 'conversational',
        placeholder: 'Ex: DAU/MAU, NPS, taxa de conversão, retenção...'
      }
    ],

    variation_template: 'Pergunte sobre métricas de produto acompanhadas. Tom: {tone}.',

    inputType: 'multi_select',
    options: [
      { value: 'dau_mau', label: 'DAU/MAU (usuários ativos)' },
      { value: 'retention', label: 'Retenção' },
      { value: 'activation', label: 'Ativação' },
      { value: 'churn', label: 'Churn' },
      { value: 'nps', label: 'NPS (Net Promoter Score)' },
      { value: 'conversion', label: 'Conversão' },
      { value: 'engagement', label: 'Engagement / uso de features' },
      { value: 'time_to_value', label: 'Time to Value' },
      { value: 'none', label: 'Não acompanhamos métricas de produto formalmente' }
    ],
    required: false,
    weight: 4,
    tags: ['metricas', 'product-ux'],

    personas: ['all'],

    followUpTriggers: [
      {
        condition: (answer) => {
          const metrics = Array.isArray(answer) ? answer : [answer];
          return metrics.includes('none');
        },
        reason: 'Não acompanha métricas de produto - perguntar como avaliam sucesso',
        suggested_question_template: 'Se não têm métricas estruturadas, como vocês sabem se uma feature foi bem ou se o produto está melhorando?'
      }
    ],

    dataExtractor: (answer) => ({
      prod_metrics: Array.isArray(answer) ? answer : [answer]
    })
  },

  {
    id: 'prod-003-user-feedback',
    area: 'product-ux',
    block: 'deep_dive',

    variations: [
      {
        id: 'v1',
        text: 'Como vocês coletam e processam feedback de usuários?',
        tone: 'formal',
        placeholder: 'Ex: Entrevistas, NPS surveys, analytics, suporte...'
      },
      {
        id: 'v2',
        text: 'Vocês têm algum jeito estruturado de ouvir os usuários? Como funciona?',
        tone: 'casual',
        placeholder: 'Pode ser: "time fala direto", "temos pesquisas", "via suporte", etc'
      },
      {
        id: 'v3',
        text: 'Me conta como vocês ficam sabendo o que os usuários acham do produto - tem processo ou é mais orgânico?',
        tone: 'conversational',
        placeholder: 'Entrevistas? Surveys? Chamados de suporte? Conversas soltas?'
      }
    ],

    variation_template: 'Pergunte sobre coleta e processamento de feedback de usuários. Tom: {tone}.',

    inputType: 'text_long',
    required: false,
    weight: 4,
    tags: ['processo', 'product-ux', 'feedback'],

    personas: ['all'],

    followUpTriggers: [
      {
        condition: (answer) => {
          const text = String(answer).toLowerCase();
          return text.includes('suporte') && !text.includes('estruturado');
        },
        reason: 'Feedback vem via suporte mas não é estruturado - possível perda de insights',
        suggested_question_template: 'Esse feedback que chega via suporte é consolidado/analisado de alguma forma, ou fica disperso?'
      }
    ],

    dataExtractor: (answer) => ({
      prod_user_feedback: String(answer)
    })
  },

  {
    id: 'prod-004-roadmap',
    area: 'product-ux',
    block: 'deep_dive',

    variations: [
      {
        id: 'v1',
        text: 'Como é definido e comunicado o roadmap de produto? Com que frequência é atualizado?',
        tone: 'formal'
      },
      {
        id: 'v2',
        text: 'Vocês têm roadmap de produto? Como funciona isso - quem define, como comunica pro time?',
        tone: 'casual',
        placeholder: 'Ex: trimestral, semestral, não temos formal...'
      },
      {
        id: 'v3',
        text: 'Conta sobre o roadmap - existe um? Como vocês planejam o que vem pela frente em produto?',
        tone: 'conversational',
        placeholder: 'Pode ser bem direto: "temos e atualizamos X", "não temos formal", etc'
      }
    ],

    variation_template: 'Pergunte sobre roadmap de produto - definição, comunicação e atualização. Tom: {tone}.',

    inputType: 'single_select',
    options: [
      { value: 'structured_quarterly', label: 'Temos roadmap estruturado, atualizado trimestralmente' },
      { value: 'structured_semester', label: 'Temos roadmap estruturado, atualizado semestralmente' },
      { value: 'informal_frequent', label: 'Temos mas é informal, muda frequentemente' },
      { value: 'exists_not_updated', label: 'Existe mas raramente é atualizado' },
      { value: 'no_roadmap', label: 'Não temos roadmap formal, vamos no sprint a sprint' }
    ],
    required: false,
    weight: 3,
    tags: ['processo', 'product-ux', 'planejamento'],

    personas: ['all'],

    dataExtractor: (answer) => ({
      prod_roadmap: String(answer)
    })
  },

  {
    id: 'prod-005-ux-research',
    area: 'product-ux',
    block: 'deep_dive',

    variations: [
      {
        id: 'v1',
        text: 'Vocês fazem testes de usabilidade ou pesquisa de UX antes de lançar features? Como funciona?',
        tone: 'formal',
        placeholder: 'Ex: Testes com usuários, protótipos, A/B tests...'
      },
      {
        id: 'v2',
        text: 'Antes de lançar uma feature nova, vocês testam com usuários ou validam a usabilidade?',
        tone: 'casual',
        placeholder: 'Ou vai direto pro ar?'
      },
      {
        id: 'v3',
        text: 'Me conta: quando vão lançar algo novo, tem algum teste de UX antes? Protótipos com usuários, A/B test, ou vai direto?',
        tone: 'conversational',
        placeholder: 'Seja honesto - não tem problema se for direto pra produção'
      }
    ],

    variation_template: 'Pergunte sobre testes de usabilidade e pesquisa de UX. Tom: {tone}.',

    inputType: 'single_select',
    options: [
      { value: 'always', label: 'Sempre - toda feature passa por validação de UX' },
      { value: 'major_features', label: 'Só features grandes/importantes' },
      { value: 'sometimes', label: 'Às vezes, quando dá tempo' },
      { value: 'rarely', label: 'Raramente ou nunca' },
      { value: 'ab_tests_only', label: 'Não fazemos antes, mas rodamos A/B tests depois do launch' }
    ],
    required: false,
    weight: 3,
    tags: ['processo', 'product-ux', 'qualidade'],

    personas: ['all'],

    followUpTriggers: [
      {
        condition: (answer) => answer === 'rarely' || answer === 'sometimes',
        reason: 'Pouco teste de UX - perguntar se isso gera retrabalho',
        suggested_question_template: 'Vocês sentem que a falta de testes de UX gera retrabalho depois, tipo: "lançou e descobriu que ninguém consegue usar"?'
      }
    ],

    dataExtractor: (answer) => ({
      prod_ux_research: String(answer)
    })
  }
];

// ============================================================================
// DEEP DIVE: FINANÇAS & OPERAÇÕES
// ============================================================================

const FINANCE_OPS_DEEP_DIVE: QuestionBankItemV2[] = [
  {
    id: 'finops-001-critical-processes',
    area: 'finance-ops',
    block: 'deep_dive',

    variations: [
      {
        id: 'v1',
        text: 'Quais são os processos operacionais ou financeiros mais críticos para o funcionamento da empresa?',
        tone: 'formal',
        placeholder: 'Ex: Fechamento de caixa, faturamento, pagamentos, conciliação...'
      },
      {
        id: 'v2',
        text: 'Que processos de finanças/operações são essenciais no dia a dia e não podem parar?',
        tone: 'casual',
        placeholder: 'Pensa nos processos que se travarem, a empresa para'
      },
      {
        id: 'v3',
        text: 'Me conta: quais os processos de finOps que são críticos pra empresa rodar? Os que dão mais trabalho ou não podem atrasar.',
        tone: 'conversational',
        placeholder: 'Ex: pagamentos, cobranças, controle de estoque, fechamento...'
      }
    ],

    variation_template: 'Pergunte sobre processos críticos de finanças e operações. Tom: {tone}.',

    inputType: 'text_long',
    required: false,
    weight: 5,
    tags: ['processo', 'finance-ops'],

    personas: ['all'],

    followUpTriggers: [
      {
        condition: (answer) => String(answer).length > 100,
        reason: 'Listou vários processos críticos - drill down no mais problemático',
        suggested_question_template: 'Desses processos que você listou, qual é o que mais dá dor de cabeça ou consome tempo?'
      }
    ],

    dataExtractor: (answer) => ({
      finops_critical_processes: String(answer)
    })
  },

  {
    id: 'finops-002-metrics',
    area: 'finance-ops',
    block: 'deep_dive',

    variations: [
      {
        id: 'v1',
        text: 'Quais métricas financeiras e operacionais vocês acompanham regularmente?',
        tone: 'formal'
      },
      {
        id: 'v2',
        text: 'Que números de finanças/ops vocês olham todo mês ou semana?',
        tone: 'casual',
        placeholder: 'Ex: fluxo de caixa, margem, custos, eficiência...'
      },
      {
        id: 'v3',
        text: 'Quando vocês vão tomar decisões financeiras ou operacionais, quais métricas consultam?',
        tone: 'conversational',
        placeholder: 'Pode ser formal (DRE) ou informal (planilha de caixa)'
      }
    ],

    variation_template: 'Pergunte sobre métricas financeiras e operacionais acompanhadas. Tom: {tone}.',

    inputType: 'multi_select',
    options: [
      { value: 'cashflow', label: 'Fluxo de caixa' },
      { value: 'margin', label: 'Margem de lucro' },
      { value: 'burn_rate', label: 'Burn rate / runway' },
      { value: 'operating_costs', label: 'Custos operacionais' },
      { value: 'ar_ap', label: 'Contas a receber / pagar' },
      { value: 'dre', label: 'DRE (Demonstrativo de Resultado)' },
      { value: 'efficiency', label: 'Métricas de eficiência operacional' },
      { value: 'inventory', label: 'Controle de estoque / inventário' },
      { value: 'none', label: 'Não acompanhamos formalmente' }
    ],
    required: false,
    weight: 4,
    tags: ['metricas', 'finance-ops'],

    personas: ['all'],

    followUpTriggers: [
      {
        condition: (answer) => {
          const metrics = Array.isArray(answer) ? answer : [answer];
          return metrics.includes('none');
        },
        reason: 'Não acompanha métricas financeiras estruturadas - risco alto',
        suggested_question_template: 'Como vocês sabem se a empresa está saudável financeiramente sem métricas estruturadas? Já tiveram sustos?'
      }
    ],

    dataExtractor: (answer) => ({
      finops_metrics: Array.isArray(answer) ? answer : [answer]
    })
  },

  {
    id: 'finops-003-systems',
    area: 'finance-ops',
    block: 'deep_dive',

    variations: [
      {
        id: 'v1',
        text: 'Quais sistemas e ferramentas vocês usam para gestão financeira e operacional?',
        tone: 'formal',
        placeholder: 'Ex: ERP, sistema de faturamento, planilhas, software de contabilidade...'
      },
      {
        id: 'v2',
        text: 'Que ferramentas vocês usam para tocar finanças e operações?',
        tone: 'casual',
        placeholder: 'ERP, planilhas, sistema próprio, contabilidade online...'
      },
      {
        id: 'v3',
        text: 'Me conta sobre os sistemas de finOps - vocês usam ERP, planilhas, ou o quê?',
        tone: 'conversational',
        placeholder: 'Tudo que é usado: faturamento, contabilidade, caixa, estoque...'
      }
    ],

    variation_template: 'Pergunte sobre sistemas e ferramentas de finanças/operações. Tom: {tone}.',

    inputType: 'text_long',
    required: false,
    weight: 3,
    tags: ['ferramentas', 'finance-ops'],

    personas: ['all'],

    followUpTriggers: [
      {
        condition: (answer) => {
          const text = String(answer).toLowerCase();
          return (text.includes('planilha') || text.includes('excel')) && text.length < 150;
        },
        reason: 'Usa principalmente planilhas - perguntar sobre limitações',
        suggested_question_template: 'Você mencionou planilhas. Isso gera problemas tipo: erro manual, informação defasada, dificuldade de consolidar dados?'
      }
    ],

    dataExtractor: (answer) => ({
      finops_systems: String(answer)
    })
  },

  {
    id: 'finops-004-bottlenecks',
    area: 'finance-ops',
    block: 'deep_dive',

    variations: [
      {
        id: 'v1',
        text: 'Quais são os maiores gargalos operacionais ou financeiros hoje? O que mais atrasa ou trava processos?',
        tone: 'formal'
      },
      {
        id: 'v2',
        text: 'O que mais trava ou demora demais em finanças/ops?',
        tone: 'casual',
        placeholder: 'Ex: fechamento mensal demora 10 dias, conciliação manual...'
      },
      {
        id: 'v3',
        text: 'Pensa nos últimos meses - o que mais dá trabalho ou atrasa em processos de finOps?',
        tone: 'conversational',
        placeholder: 'Pode ser bem específico: "todo mês X demora Y dias porque Z"'
      }
    ],

    variation_template: 'Pergunte sobre gargalos e atrasos em finanças/operações. Tom: {tone}.',

    inputType: 'text_long',
    required: false,
    weight: 5,
    tags: ['gargalos', 'finance-ops', 'processo_manual'],

    personas: ['all'],

    followUpTriggers: [
      {
        condition: (answer) => {
          const text = String(answer).toLowerCase();
          return text.includes('manual') || text.includes('demora') || text.includes('erro');
        },
        reason: 'Mencionou processos manuais ou erros - oportunidade de automação',
        suggested_question_template: 'Desses gargalos, quanto tempo/pessoas estão envolvidos? Se pudesse automatizar um, qual seria?'
      }
    ],

    dataExtractor: (answer) => ({
      finops_bottlenecks: String(answer)
    })
  },

  {
    id: 'finops-005-reconciliation',
    area: 'finance-ops',
    block: 'deep_dive',

    variations: [
      {
        id: 'v1',
        text: 'Como funciona o processo de conciliação financeira (bancária, fiscal, estoque)? É manual ou automatizado?',
        tone: 'formal'
      },
      {
        id: 'v2',
        text: 'Vocês fazem conciliação bancária/fiscal? Como funciona - manual, automático, mix?',
        tone: 'casual',
        placeholder: 'Ex: todo mês alguém bate planilha vs extrato bancário...'
      },
      {
        id: 'v3',
        text: 'Me conta sobre conciliação - como vocês batem os números do banco, notas fiscais, estoque? Manual ou tem automação?',
        tone: 'conversational',
        placeholder: 'Pode ser bem honesto sobre o nível de "gambiarra"'
      }
    ],

    variation_template: 'Pergunte sobre processo de conciliação financeira/operacional. Tom: {tone}.',

    inputType: 'single_select',
    options: [
      { value: 'fully_automated', label: 'Totalmente automatizado via sistema' },
      { value: 'semi_automated', label: 'Parcialmente automatizado, mas tem revisão manual' },
      { value: 'mostly_manual', label: 'Majoritariamente manual com planilhas' },
      { value: 'fully_manual', label: 'Totalmente manual' },
      { value: 'no_process', label: 'Não fazemos conciliação regular' }
    ],
    required: false,
    weight: 4,
    tags: ['processo', 'finance-ops', 'automacao'],

    personas: ['all'],

    followUpTriggers: [
      {
        condition: (answer) => answer === 'mostly_manual' || answer === 'fully_manual',
        reason: 'Conciliação manual - alto risco de erro e custo de tempo',
        suggested_question_template: 'Quanto tempo a conciliação manual consome por mês? Já tiveram problemas por erros nesse processo?'
      }
    ],

    dataExtractor: (answer) => ({
      finops_reconciliation: String(answer)
    })
  }
];

// ============================================================================
// DEEP DIVE: ESTRATÉGIA & NEGÓCIOS
// ============================================================================

const STRATEGY_BUSINESS_DEEP_DIVE: QuestionBankItemV2[] = [
  {
    id: 'strat-001-competitive-pressure',
    area: 'strategy-business',
    block: 'deep_dive',

    variations: [
      {
        id: 'v1',
        text: 'Qual é o nível de pressão competitiva no mercado em que vocês atuam? Como isso afeta decisões estratégicas?',
        tone: 'formal'
      },
      {
        id: 'v2',
        text: 'Quão competitivo é o mercado de vocês? Isso força a empresa a se mover rápido ou dá pra ir no ritmo?',
        tone: 'casual',
        placeholder: 'Ex: "muito competitivo, se não inovar morre" ou "tranquilo"'
      },
      {
        id: 'v3',
        text: 'Pensa na concorrência - vocês estão numa corrida acirrada ou o mercado é mais tranquilo? Como isso afeta as decisões?',
        tone: 'conversational',
        placeholder: 'Quanto mais contexto melhor'
      }
    ],

    variation_template: 'Pergunte sobre pressão competitiva e impacto em estratégia. Tom: {tone}.',

    inputType: 'single_select',
    options: [
      { value: 'very_high', label: 'Altíssima - precisamos inovar constantemente para sobreviver' },
      { value: 'high', label: 'Alta - competição forte, mas temos diferenciação' },
      { value: 'moderate', label: 'Moderada - competimos mas não é "vida ou morte"' },
      { value: 'low', label: 'Baixa - mercado maduro ou nicho protegido' },
      { value: 'monopoly', label: 'Praticamente sem concorrência direta' }
    ],
    required: false,
    weight: 4,
    tags: ['estrategia', 'strategy-business'],

    personas: ['all'],

    dataExtractor: (answer) => ({
      strat_competitive_pressure: String(answer)
    })
  },

  {
    id: 'strat-002-innovation-barriers',
    area: 'strategy-business',
    block: 'deep_dive',

    variations: [
      {
        id: 'v1',
        text: 'Quais são as maiores barreiras para inovação ou transformação digital na empresa?',
        tone: 'formal',
        placeholder: 'Ex: Cultura, falta de budget, resistência interna, falta de conhecimento...'
      },
      {
        id: 'v2',
        text: 'O que mais impede vocês de inovarem ou se digitalizarem mais rápido?',
        tone: 'casual',
        placeholder: 'Budget? Pessoas? Cultura? Tech legado?'
      },
      {
        id: 'v3',
        text: 'Se vocês quisessem acelerar inovação/transformação digital, o que está no caminho? O que trava?',
        tone: 'conversational',
        placeholder: 'Pensa em barreiras culturais, técnicas, financeiras, políticas...'
      }
    ],

    variation_template: 'Pergunte sobre barreiras para inovação e transformação digital. Tom: {tone}.',

    inputType: 'multi_select',
    options: [
      { value: 'budget', label: 'Falta de orçamento / investimento' },
      { value: 'culture', label: 'Cultura organizacional resistente a mudanças' },
      { value: 'knowledge', label: 'Falta de conhecimento técnico no time' },
      { value: 'legacy', label: 'Tecnologia legada difícil de mudar' },
      { value: 'leadership', label: 'Falta de sponsor/apoio da liderança' },
      { value: 'priorities', label: 'Sempre tem coisas mais urgentes' },
      { value: 'risk_aversion', label: 'Aversão a risco / medo de errar' },
      { value: 'none', label: 'Não vejo barreiras significativas' }
    ],
    required: false,
    weight: 5,
    tags: ['estrategia', 'strategy-business', 'barreiras'],

    personas: ['all'],

    followUpTriggers: [
      {
        condition: (answer) => {
          const barriers = Array.isArray(answer) ? answer : [answer];
          return barriers.includes('culture') || barriers.includes('leadership');
        },
        reason: 'Barreiras culturais ou de liderança - mais difíceis de resolver',
        suggested_question_template: 'Você mencionou cultura/liderança. Já tentaram alguma iniciativa de transformação que não foi pra frente por isso?'
      }
    ],

    dataExtractor: (answer) => ({
      strat_innovation_barriers: Array.isArray(answer) ? answer : [answer]
    })
  },

  {
    id: 'strat-003-digital-roi',
    area: 'strategy-business',
    block: 'deep_dive',

    variations: [
      {
        id: 'v1',
        text: 'Como vocês medem o ROI de iniciativas digitais ou de transformação? Têm cases de sucesso ou fracasso para compartilhar?',
        tone: 'formal'
      },
      {
        id: 'v2',
        text: 'Vocês conseguem medir se investimentos em digital/tech dão retorno? Tem exemplos?',
        tone: 'casual',
        placeholder: 'Pode ser sucesso ou coisa que não funcionou'
      },
      {
        id: 'v3',
        text: 'Pensa nas últimas iniciativas digitais - vocês sabem se valeram a pena? Como medem isso? Algum caso que deu super certo ou falhou?',
        tone: 'conversational',
        placeholder: 'Quanto mais específico, melhor'
      }
    ],

    variation_template: 'Pergunte sobre medição de ROI de iniciativas digitais e exemplos. Tom: {tone}.',

    inputType: 'text_long',
    required: false,
    weight: 4,
    tags: ['estrategia', 'strategy-business', 'roi'],

    personas: ['all'],

    followUpTriggers: [
      {
        condition: (answer) => {
          const text = String(answer).toLowerCase();
          return text.includes('não') && (text.includes('medimos') || text.includes('sabemos'));
        },
        reason: 'Não medem ROI de digital - dificulta justificar investimentos futuros',
        suggested_question_template: 'Se não medem ROI, como justificam novos investimentos em tecnologia/digital para a liderança?'
      }
    ],

    dataExtractor: (answer) => ({
      strat_digital_roi: String(answer)
    })
  },

  {
    id: 'strat-004-stakeholder-alignment',
    area: 'strategy-business',
    block: 'deep_dive',

    variations: [
      {
        id: 'v1',
        text: 'Quão alinhados estão os principais stakeholders (C-level, board, investidores) sobre a importância de IA e transformação digital?',
        tone: 'formal'
      },
      {
        id: 'v2',
        text: 'A liderança da empresa está alinhada sobre IA e digital, ou tem divergências?',
        tone: 'casual',
        placeholder: 'Ex: "todos compram a ideia" vs "só tech acredita"'
      },
      {
        id: 'v3',
        text: 'Se você tivesse que vender um projeto grande de IA/transformação digital, quem apoiaria e quem resistiria na liderança?',
        tone: 'conversational',
        placeholder: 'Seja honesto sobre o nível de buy-in'
      }
    ],

    variation_template: 'Pergunte sobre alinhamento de stakeholders em IA/digital. Tom: {tone}.',

    inputType: 'single_select',
    options: [
      { value: 'full_alignment', label: 'Totalmente alinhados - IA/digital é prioridade estratégica' },
      { value: 'mostly_aligned', label: 'Maioria alinhada, alguns céticos' },
      { value: 'mixed', label: 'Bem dividido - metade apoia, metade resiste' },
      { value: 'resistance', label: 'Maioria resistente ou indiferente' },
      { value: 'dont_know', label: 'Não sei / não tenho visibilidade' }
    ],
    required: false,
    weight: 4,
    tags: ['estrategia', 'strategy-business', 'buy-in'],

    personas: ['all'],

    followUpTriggers: [
      {
        condition: (answer) => answer === 'resistance' || answer === 'mixed',
        reason: 'Resistência ou divisão na liderança - grande barreira',
        suggested_question_template: 'O que você acha que convenceria os resistentes? Dados, cases externos, piloto pequeno?'
      }
    ],

    dataExtractor: (answer) => ({
      strat_stakeholder_alignment: String(answer)
    })
  }
];

// ============================================================================
// AUTOMATION FOCUS
// ============================================================================

const AUTOMATION_FOCUS_QUESTIONS: QuestionBankItemV2[] = [
  {
    id: 'auto-001-repetitive-tasks',
    area: 'automation',
    block: 'automation_focus',

    variations: [
      {
        id: 'v1',
        text: 'Liste as 3 atividades mais repetitivas que roubam tempo de pessoas qualificadas na empresa.',
        tone: 'formal',
        placeholder: 'Ex: 1) Consolidar relatórios semanais manualmente, 2) Enviar follow-ups para leads, 3)...'
      },
      {
        id: 'v2',
        text: 'Quais as 3 tarefas mais chatas/repetitivas que vocês fazem e que poderiam ser automatizadas?',
        tone: 'casual',
        placeholder: 'Pensa nas coisas que todo mundo reclama'
      },
      {
        id: 'v3',
        text: 'Imagina: se você pudesse acabar com 3 tarefas repetitivas hoje, quais seriam? As que mais consomem tempo de gente boa.',
        tone: 'conversational',
        placeholder: 'Pode ser bem específico: "toda segunda-feira fulano gasta 4h fazendo X..."'
      }
    ],

    variation_template: 'Pergunte sobre top 3 atividades repetitivas que consomem tempo. Tom: {tone}. Incentive especificidade.',

    inputType: 'text_long',
    required: true,
    weight: 5,
    tags: ['automacao', 'oportunidade_ia', 'processo_manual'],

    personas: ['all'],

    dataExtractor: (answer) => ({
      repetitive_tasks_top3: String(answer)
    })
  },

  {
    id: 'auto-002-manual-dependencies',
    area: 'automation',
    block: 'automation_focus',

    variations: [
      {
        id: 'v1',
        text: 'Quais processos hoje dependem muito de alguém "lembrar de fazer" ou de acompanhar planilhas/sistemas manualmente?',
        tone: 'formal',
        placeholder: 'Ex: Cobranças atrasadas, renovações de contrato, controle de licenças...'
      },
      {
        id: 'v2',
        text: 'Que processos dependem de alguém "não esquecer" ou ficar de olho em planilha?',
        tone: 'casual',
        placeholder: 'Coisas que se ninguém lembrar, não acontecem'
      },
      {
        id: 'v3',
        text: 'Pensa nos processos que vivem atrasando porque dependem de alguém lembrar ou monitorar manual - quais são?',
        tone: 'conversational',
        placeholder: 'Tipo: "renovação de contratos sempre atrasa porque ninguém lembra"'
      }
    ],

    variation_template: 'Pergunte sobre processos que dependem de memória humana ou monitoramento manual. Tom: {tone}.',

    inputType: 'text_long',
    required: true,
    weight: 5,
    tags: ['automacao', 'processo_manual', 'risco_operacional'],

    personas: ['all'],

    dataExtractor: (answer) => ({
      manual_dependencies: String(answer)
    })
  },

  {
    id: 'auto-003-ai-team-wish',
    area: 'automation',
    block: 'automation_focus',

    variations: [
      {
        id: 'v1',
        text: 'Se você tivesse um "time de IA" à disposição por 1 mês, em que rotinas você colocaria esse time para trabalhar primeiro?',
        tone: 'formal',
        placeholder: 'Pense nas automações que gerariam mais impacto'
      },
      {
        id: 'v2',
        text: 'Imagina que você tem um time só pra criar automações com IA por 1 mês. No que você focaria?',
        tone: 'casual',
        placeholder: 'Pode sonhar alto - o que seria game changer?'
      },
      {
        id: 'v3',
        text: 'Wish list: se IA pudesse resolver qualquer processo na empresa, qual você atacaria primeiro e por quê?',
        tone: 'conversational',
        placeholder: 'Pensa em impacto vs esforço - o que mudaria o jogo?'
      }
    ],

    variation_template: 'Pergunte sobre wish list de automação com IA. Tom: {tone}. Incentive ambição e justificativa.',

    inputType: 'text_long',
    required: false,
    weight: 4,
    tags: ['automacao', 'oportunidade_ia', 'estrategia'],

    personas: ['all'],

    dataExtractor: (answer) => ({
      ai_team_wish: String(answer)
    })
  }
];

// ============================================================================
// CLOSING
// ============================================================================

const CLOSING_QUESTIONS: QuestionBankItemV2[] = [
  {
    id: 'close-001-single-fix',
    area: 'closing',
    block: 'closing',

    variations: [
      {
        id: 'v1',
        text: 'Se você pudesse consertar apenas 1 coisa na empresa nos próximos 90 dias, qual seria?',
        tone: 'formal'
      },
      {
        id: 'v2',
        text: 'Se você tivesse 90 dias pra resolver UMA coisa só na empresa, qual seria?',
        tone: 'casual',
        placeholder: 'O que teria mais impacto'
      },
      {
        id: 'v3',
        text: 'Última pergunta estratégica: 90 dias, 1 mudança - o que você consertaria que mudaria tudo?',
        tone: 'conversational',
        placeholder: 'Pensa no que destravaria outras coisas'
      }
    ],

    variation_template: 'Pergunte sobre a única mudança prioritária em 90 dias. Tom: {tone}.',

    inputType: 'text_long',
    required: true,
    weight: 5,
    tags: ['estrategia', 'prioridade'],

    personas: ['all'],

    dataExtractor: (answer) => ({
      single_most_important_fix: String(answer)
    })
  },

  {
    id: 'close-002-ai-readiness',
    area: 'closing',
    block: 'closing',

    variations: [
      {
        id: 'v1',
        text: 'De 0 a 10, quão preparada você sente que a empresa está hoje para usar IA de forma estratégica?',
        tone: 'formal'
      },
      {
        id: 'v2',
        text: 'Numa escala de 0 a 10: quão pronta a empresa está pra IA hoje?',
        tone: 'casual',
        placeholder: '0 = nem pensou nisso, 10 = já está usando bem'
      },
      {
        id: 'v3',
        text: 'Última métrica: de 0 a 10, qual a prontidão da empresa pra IA? Seja honesto.',
        tone: 'conversational',
        placeholder: 'Não só ferramentas, mas estratégia, cultura, capacidade'
      }
    ],

    variation_template: 'Pergunte sobre prontidão para IA em escala 0-10. Tom: {tone}. Explique que inclui estratégia, cultura e tech.',

    inputType: 'scale_0_10',
    required: true,
    weight: 5,
    tags: ['ai_readiness', 'metricas'],

    personas: ['all'],

    dataExtractor: (answer) => ({
      ai_readiness_score: Number(answer)
    })
  },

  {
    id: 'close-003-report-focus',
    area: 'closing',
    block: 'closing',

    variations: [
      {
        id: 'v1',
        text: 'Como você prefere que o relatório foque as recomendações?',
        tone: 'formal'
      },
      {
        id: 'v2',
        text: 'Como você quer que o relatório seja focado?',
        tone: 'casual'
      },
      {
        id: 'v3',
        text: 'Última coisa: que tipo de recomendações você quer ver no relatório?',
        tone: 'conversational',
        context: 'Ajuda a customizar o tom e foco do report final'
      }
    ],

    variation_template: 'Pergunte sobre preferência de foco do relatório. Tom: {tone}.',

    inputType: 'single_select',
    options: [
      { value: 'quick_wins', label: 'Ganhos rápidos (quick wins) - resultados em 30-60 dias' },
      { value: 'deep_transformation', label: 'Transformação profunda - mudanças estruturais' },
      { value: 'process_organization', label: 'Organização e processos - arrumar a casa primeiro' },
      { value: 'balanced', label: 'Equilibrado - mix de curto e longo prazo' }
    ],
    required: true,
    weight: 3,
    tags: ['preferencia', 'report'],

    personas: ['all'],

    dataExtractor: (answer) => ({
      report_focus_preference: String(answer)
    })
  }
];

// ============================================================================
// EXPORT
// ============================================================================

export const AI_READINESS_QUESTIONS_V2: QuestionBankItemV2[] = [
  ...INTRO_QUESTIONS,
  ...COMPANY_SNAPSHOT_QUESTIONS,
  ...EXPERTISE_QUESTIONS,
  ...PROBLEMS_OPPORTUNITIES_QUESTIONS,
  ...MARKETING_SALES_DEEP_DIVE,
  ...TECH_ENGINEERING_DEEP_DIVE,
  ...PRODUCT_UX_DEEP_DIVE,
  ...FINANCE_OPS_DEEP_DIVE,
  ...STRATEGY_BUSINESS_DEEP_DIVE,
  ...AUTOMATION_FOCUS_QUESTIONS,
  ...CLOSING_QUESTIONS
];

export const QUESTION_BANK_CONFIG_V2: QuestionBankConfig = {
  version: '2.0',
  total_questions: AI_READINESS_QUESTIONS_V2.length,
  total_variations: AI_READINESS_QUESTIONS_V2.reduce(
    (sum, q) => sum + q.variations.length,
    0
  ),
  blocks: [
    'intro',
    'company_snapshot',
    'expertise',
    'problems_opportunities',
    'deep_dive',
    'automation_focus',
    'closing'
  ]
};
