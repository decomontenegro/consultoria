/**
 * Enhanced Discovery Questions - PhD Virtual Consultant Style
 *
 * Baseado em técnicas de consultoria real:
 * - SPIN Selling: Situation → Problem → Implication → Need-Payoff
 * - 5 Whys: Ir fundo até root cause
 * - Quantificação: Buscar métricas operacionais, não respostas genéricas
 *
 * Objetivo: Entendimento profundo e operacional da empresa em 6 perguntas
 */

import { UserPersona, ConversationMessage } from '../types';

export interface EnhancedDiscoveryQuestion {
  id: string;
  phase: 'situation' | 'problem' | 'implication' | 'need-payoff';

  // Texto base da pergunta
  baseText: string;

  // Variações por persona (CEO vê business, CTO vê tech)
  personaVariants?: Partial<Record<UserPersona, string>>;

  // Exemplos de resposta (ajudam usuário a entender nível de detalhe esperado)
  examples: string[];

  // Placeholder contextual
  placeholder: string;

  // O que estamos extraindo
  extractors: string[];

  // Follow-up opcional baseado na resposta
  followUp?: {
    condition: (answer: string) => boolean;
    question: string;
  };
}

/**
 * 6 PERGUNTAS ESSENCIAIS - Enhanced para consultoria profunda
 */
export const ENHANCED_DISCOVERY_QUESTIONS: EnhancedDiscoveryQuestion[] = [
  // ========================================
  // Q1: SITUATION - Baseline operacional
  // ========================================
  {
    id: 'operational-baseline',
    phase: 'situation',
    baseText: 'Vamos começar pelo operacional: desde uma ideia/ticket até estar em produção, quantos dias demora tipicamente? E quantos deploys/lançamentos vocês fazem por mês?',

    personaVariants: {
      'board-executive': 'Vamos começar pelo operacional: quanto tempo demora do conceito até o lançamento? E quantos novos produtos/features vocês conseguem lançar por trimestre?',
      'finance-ops': 'Vamos começar pelo operacional: quanto tempo demora para aprovar e implementar uma mudança? E quantos processos são automatizados vs manuais?',
      'engineering-tech': 'Vamos começar pelo técnico: qual o cycle time atual (do PR até produção)? E quantos deploys por semana vocês fazem?',
      'product-business': 'Vamos começar pelo produto: do discovery até lançamento, quantas semanas demora? E quantas features/experimentos vocês validam por mês?'
    },

    examples: [
      'Da ideia até produção: 3-4 semanas. Fazemos 2-3 deploys por mês.',
      'Cycle time: 10-14 dias. Deploy frequency: semanal.',
      'Conceito até lançamento: 2-3 meses. Lançamos 1-2 produtos por trimestre.'
    ],

    placeholder: 'Ex: 2-3 semanas do ticket até produção, 4-5 deploys/mês...',

    extractors: [
      'cycle_time',
      'deploy_frequency',
      'baseline_velocity',
      'maturity_level'
    ],

    followUp: {
      condition: (answer) => {
        // Se demora >2 semanas OU <2 deploys/mês → follow-up
        const weeks = answer.match(/(\d+)[\s-]+semanas?/i);
        const deploys = answer.match(/(\d+)[\s-]+deploy/i);
        return (weeks && parseInt(weeks[1]) > 2) || (deploys && parseInt(deploys[1]) < 2);
      },
      question: 'Onde está o principal gargalo desse processo? Code review, testes, aprovações, deploy?'
    }
  },

  // ========================================
  // Q2: PROBLEM - Quantificar pain points
  // ========================================
  {
    id: 'quantified-pain',
    phase: 'problem',
    baseText: 'E qual o maior problema nesse fluxo? Especificamente: quantos bugs escapam para produção por mês? Quantas horas/semana o time perde com retrabalho, firefighting ou tarefas manuais?',

    personaVariants: {
      'board-executive': 'E qual o maior problema estratégico hoje? Especificamente: quantos clientes perderam por lentidão? Quanto de market share seus competidores ganharam no último ano?',
      'finance-ops': 'E qual o maior custo oculto? Especificamente: quantas horas/mês são gastas em aprovações manuais? Quanto custa esse processo atual vs automatizado?',
      'engineering-tech': 'E qual o maior gargalo técnico? Especificamente: quantos incidentes em prod/mês? Quantas horas de eng time vão para manutenção vs features novas?',
      'product-business': 'E qual o maior obstáculo para velocidade? Especificamente: quantas features ficam esperando dev? Quantos meses de backlog acumulado vocês têm?'
    },

    examples: [
      '5-8 bugs críticos por mês, time gasta ~30% do tempo apagando incêndio',
      'Perdemos 3 clientes nos últimos 6 meses por não entregar features rápido',
      '20-25 horas/semana em aprovações manuais, estimamos R$30k/mês de custo',
      '80% do time de eng em manutenção, só 20% em features novas'
    ],

    placeholder: 'Ex: 10 bugs/mês, 20h/semana em retrabalho, 2 clientes perdidos...',

    extractors: [
      'bug_rate',
      'rework_hours',
      'incidents_per_month',
      'maintenance_vs_innovation',
      'customer_churn',
      'bottleneck_location'
    ]
  },

  // ========================================
  // Q3: IMPLICATION - Custo da inação
  // ========================================
  {
    id: 'cost-of-inaction',
    phase: 'implication',
    baseText: 'Quanto isso está custando para o negócio? Por exemplo: quantos reais por mês em produtividade perdida? Quantos clientes deixaram de contratar ou cancelaram? Quanto de receita foi adiado por atrasos?',

    personaVariants: {
      'board-executive': 'Qual o impacto nos resultados? Especificamente: quanto de receita está em risco? Qual a posição de mercado que vocês perderam para competidores no último ano?',
      'finance-ops': 'Qual o custo financeiro direto? Especificamente: R$ X mil/mês em ineficiências? Y% do orçamento desperdiçado? Z horas × custo/hora?',
      'engineering-tech': 'Qual o custo técnico? Especificamente: quantas sprints atrasadas? Quanto de tech debt acumulado? Quantos devs vocês "perderam" para firefighting?',
      'product-business': 'Qual o custo de oportunidade? Especificamente: quantas features não lançadas? Quantos experimentos não rodados? Quanto de market share perdido?'
    },

    examples: [
      'Estimamos R$50-80k/mês em produtividade perdida, perdemos 2 clientes (R$200k ARR)',
      '3 lançamentos atrasados em Q4, perdemos janela de mercado de R$500k',
      'Time de 15 devs × 30% tempo perdido = ~4.5 FTEs × R$15k = R$67k/mês',
      'Competitor lançou 12 features enquanto nós lançamos 3, perdemos 15% market share'
    ],

    placeholder: 'Ex: R$50k/mês perdidos, 2 clientes churned, 3 lançamentos atrasados...',

    extractors: [
      'monthly_cost',
      'revenue_at_risk',
      'customers_lost',
      'delayed_launches',
      'market_share_loss',
      'opportunity_cost'
    ]
  },

  // ========================================
  // Q4: CONTEXT - Time e estrutura
  // ========================================
  {
    id: 'team-context',
    phase: 'situation',
    baseText: 'Para contextualizar: quantas pessoas tem no total na empresa? E especificamente no time de tecnologia/produto, quantos são: seniors, plenos, juniors? Já usam alguma ferramenta de IA ou automação?',

    personaVariants: {
      'board-executive': 'Para contextualizar: quantas pessoas no total? Qual o stage da empresa (startup/scaleup/enterprise)? Qual seu setor e principais competidores?',
      'finance-ops': 'Para contextualizar: qual o headcount total e budget anual? Quantos FTEs em operações? Qual nível de automação atual (0-100%)?',
      'engineering-tech': 'Para contextualizar: quantos devs no time e qual o split de seniority? Stack principal? Já usam Copilot, CI/CD, testes automatizados?',
      'product-business': 'Para contextualizar: quantos no time de produto? Quantos designers, PMs, researchers? Qual a maturidade do processo de discovery?'
    },

    examples: [
      'Empresa: 80 pessoas. Tech: 12 devs (3 seniors, 5 plenos, 4 juniors). Usam GitHub mas sem automação.',
      'Total: 150 pessoas. Time produto: 8 (3 PMs, 3 designers, 2 researchers). Processo ad-hoc.',
      'Scale-up de 200 pessoas, fintech. Competidores: Nubank, Inter. Tech team: 25 devs.'
    ],

    placeholder: 'Ex: 100 pessoas total, 15 em tech (5 seniors, 7 plenos, 3 juniors), sem IA...',

    extractors: [
      'company_size',
      'tech_team_size',
      'team_seniority',
      'current_tools',
      'ai_maturity',
      'industry',
      'company_stage'
    ]
  },

  // ========================================
  // Q5: NEED-PAYOFF - Urgência e pressão
  // ========================================
  {
    id: 'urgency-pressure',
    phase: 'need-payoff',
    baseText: 'Qual a urgência real de resolver isso? Tem alguma pressão externa (board, competição, cliente grande)? E qual o prazo que vocês têm em mente: 3 meses, 6 meses, 12 meses?',

    personaVariants: {
      'board-executive': 'Qual a pressão do board ou dos investidores? Tem algum deadline fiscal, competidor lançando algo, ou cliente enterprise cobrando? Qual o prazo crítico?',
      'finance-ops': 'Qual a urgência orçamentária? Tem corte de custos previsto? Fechamento fiscal? Auditoria chegando? Qual o deadline real?',
      'engineering-tech': 'Qual a pressão técnica? Tem dívida técnica crítica? Risco de perder devs? Sistema legado quebrando? Qual o prazo para resolver antes de estourar?',
      'product-business': 'Qual a pressão de mercado? Competidor lançou algo? Cliente grande ameaçando sair? Roadmap comprometido? Qual o prazo crítico?'
    },

    examples: [
      'Board cobrando resultados até Q2, temos 3-4 meses para mostrar progresso',
      'Cliente enterprise (R$500k ARR) ameaçando cancelar se não entregarmos em 60 dias',
      'Competitor lançou feature que queremos há 6 meses, perdendo deals. Urgência: alta.',
      'Dívida técnica insustentável, time reclamando, risco de perder 2 seniors. Timeline: já.'
    ],

    placeholder: 'Ex: Board pressionando, deadline em Q2, competidor nos passou...',

    extractors: [
      'urgency_level',
      'external_pressure',
      'timeline',
      'critical_deadline',
      'threat_type'
    ]
  },

  // ========================================
  // Q6: COMMITMENT - Budget e autoridade
  // ========================================
  {
    id: 'budget-authority',
    phase: 'need-payoff',
    baseText: 'Por último: tem orçamento aprovado para investir em melhorar isso? Se sim, qual a faixa (pode ser estimativa)? E você tem autonomia para aprovar, ou precisa de aval de alguém?',

    personaVariants: {
      'board-executive': 'Por último: qual a faixa de investimento que consideraria para resolver isso de forma definitiva? Você aprova diretamente ou precisa levar ao board?',
      'finance-ops': 'Por último: qual o budget disponível para este problema? Já está no orçamento de 2025? Você aprova ou precisa de CFO/board?',
      'engineering-tech': 'Por último: tem budget para treinamento e ferramentas? Qual faixa faz sentido? Você aprova ou precisa mostrar ROI para C-level?',
      'product-business': 'Por último: qual investimento em capacitação do time seria viável? Tem budget aprovado? Você decide ou precisa de CTO/CEO?'
    },

    examples: [
      'Budget: R$200-300k aprovado para 2025. Eu aprovo até R$100k, acima disso vai para CEO.',
      'Faixa: R$500k-1M. Não tenho orçamento aprovado mas consigo justificar com ROI claro.',
      'Estimativa: R$50-100k. Preciso mostrar business case para CFO aprovar.',
      'R$1M+ se resolver o problema. Eu aprovo como CEO, board já deu sinal verde.'
    ],

    placeholder: 'Ex: R$100-200k aprovado, eu decido até R$150k...',

    extractors: [
      'budget_range',
      'budget_status',
      'decision_authority',
      'approval_needed',
      'readiness_to_buy'
    ]
  }
];

/**
 * Helper: Get question variant based on persona
 */
export function getQuestionForPersona(
  question: EnhancedDiscoveryQuestion,
  persona: UserPersona | null
): string {
  if (!persona || !question.personaVariants || !question.personaVariants[persona]) {
    return question.baseText;
  }

  return question.personaVariants[persona];
}

/**
 * Helper: Check if should ask follow-up
 */
export function shouldAskFollowUp(
  question: EnhancedDiscoveryQuestion,
  answer: string
): string | null {
  if (!question.followUp) return null;

  if (question.followUp.condition(answer)) {
    return question.followUp.question;
  }

  return null;
}

/**
 * Helper: Extract metrics from answer (enhanced)
 */
export function extractMetricsFromAnswer(
  answer: string,
  extractors: string[]
): Record<string, any> {
  const metrics: Record<string, any> = {};
  const lowerAnswer = answer.toLowerCase();

  // Cycle time extraction
  if (extractors.includes('cycle_time')) {
    const weeksMatch = answer.match(/(\d+)[\s-]+(semanas?|weeks?)/i);
    const daysMatch = answer.match(/(\d+)[\s-]+(dias?|days?)/i);

    if (weeksMatch) {
      metrics.cycle_time_days = parseInt(weeksMatch[1]) * 7;
    } else if (daysMatch) {
      metrics.cycle_time_days = parseInt(daysMatch[1]);
    }
  }

  // Deploy frequency
  if (extractors.includes('deploy_frequency')) {
    if (lowerAnswer.includes('diário') || lowerAnswer.includes('daily')) {
      metrics.deploy_frequency = 'daily';
      metrics.deploys_per_month = 20;
    } else if (lowerAnswer.includes('semanal') || lowerAnswer.includes('weekly')) {
      metrics.deploy_frequency = 'weekly';
      metrics.deploys_per_month = 4;
    } else if (lowerAnswer.includes('mensal') || lowerAnswer.includes('monthly')) {
      metrics.deploy_frequency = 'monthly';
      metrics.deploys_per_month = 1;
    }

    // Extract explicit number
    const deploysMatch = answer.match(/(\d+)[\s-]+deploys?/i);
    if (deploysMatch) {
      metrics.deploys_per_month = parseInt(deploysMatch[1]);
    }
  }

  // Bug rate
  if (extractors.includes('bug_rate')) {
    const bugsMatch = answer.match(/(\d+)[\s-]+bugs?/i);
    if (bugsMatch) {
      metrics.bugs_per_month = parseInt(bugsMatch[1]);
    }
  }

  // Hours lost
  if (extractors.includes('rework_hours')) {
    const hoursMatch = answer.match(/(\d+)[\s-]+(horas?|hours?)/i);
    if (hoursMatch) {
      metrics.rework_hours_per_week = parseInt(hoursMatch[1]);
    }

    // Percentage of time
    const percentMatch = answer.match(/(\d+)%/);
    if (percentMatch) {
      metrics.time_wasted_percentage = parseInt(percentMatch[1]);
    }
  }

  // Monthly cost
  if (extractors.includes('monthly_cost')) {
    const costMatch = answer.match(/r\$\s*(\d+)[\s,.]?(\d+)?k?/i);
    if (costMatch) {
      const value = parseInt(costMatch[1]);
      const thousands = costMatch[0].toLowerCase().includes('k');
      metrics.monthly_cost_brl = thousands ? value * 1000 : value;
    }
  }

  // Customers lost
  if (extractors.includes('customers_lost')) {
    const customersMatch = answer.match(/(\d+)[\s-]+(clientes?|customers?)/i);
    if (customersMatch) {
      metrics.customers_lost = parseInt(customersMatch[1]);
    }
  }

  // Team size
  if (extractors.includes('tech_team_size')) {
    const teamMatch = answer.match(/(\d+)[\s-]+(devs?|desenvolvedores?|pessoas?)/i);
    if (teamMatch) {
      metrics.tech_team_size = parseInt(teamMatch[1]);
    }
  }

  // Budget range
  if (extractors.includes('budget_range')) {
    const budgetMatch = answer.match(/r\$\s*(\d+)k?[\s-]+(\d+)?k?/i);
    if (budgetMatch) {
      metrics.budget_range = answer.match(/r\$[^,.;]+/i)?.[0] || 'estimativa fornecida';
    }
  }

  return metrics;
}
