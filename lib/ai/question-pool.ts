/**
 * Question Pool for Adaptive Assessment System
 *
 * 50 high-quality questions categorized by topic
 * Each question is simple (one question at a time, not compound)
 * AI router selects 12-18 questions per session based on context
 */

import type { UserPersona } from './assessment-router';
import type { AssessmentData } from '@/lib/types';

export type QuestionCategory =
  | 'company'
  | 'pain-points'
  | 'quantification'
  | 'current-state'
  | 'goals'
  | 'budget'
  | 'commitment';

export type QuestionPriority = 'essential' | 'important' | 'optional';

export type InputType = 'text' | 'single-choice' | 'multi-choice' | 'number';

export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
}

export interface QuestionRequirements {
  topicsAnswered?: string[];
  fieldsPresent?: string[];
  personaConfidence?: number;
}

export interface QuestionSkipConditions {
  topicsCovered?: string[];
  fieldsCollected?: string[];
  personaMismatch?: boolean;
}

export interface QuestionPoolItem {
  id: string;
  category: QuestionCategory;
  text: string;
  personas: UserPersona[] | ['all'];

  priority: QuestionPriority;
  inputType: InputType;
  options?: QuestionOption[];
  placeholder?: string;

  // Context requirements to ask this question
  requires?: QuestionRequirements;

  // Skip conditions
  skipIf?: QuestionSkipConditions;

  // Tags for topic tracking (semantic grouping)
  tags: string[];

  // Extract data from answer
  dataExtractor: (answer: any, context: any) => Partial<AssessmentData>;
}

// ============================================================================
// COMPANY CONTEXT (8 questions)
// ============================================================================

const companyQuestions: QuestionPoolItem[] = [
  {
    id: 'company-industry-v2',
    category: 'company',
    text: 'Em qual setor sua empresa atua?',
    personas: ['all'],
    priority: 'essential',
    inputType: 'single-choice',
    options: [
      { value: 'fintech', label: 'Fintech / Serviços Financeiros' },
      { value: 'saas-b2b', label: 'SaaS B2B' },
      { value: 'ecommerce', label: 'E-commerce / Marketplace' },
      { value: 'healthtech', label: 'Healthtech / Saúde Digital' },
      { value: 'edtech', label: 'Edtech / Educação' },
      { value: 'logistics', label: 'Logística / Supply Chain' },
      { value: 'retail', label: 'Varejo / Retail' },
      { value: 'other', label: 'Outro' }
    ],
    tags: ['industry', 'context', 'company'],
    skipIf: {
      fieldsCollected: ['companyInfo.industry']
    },
    dataExtractor: (answer) => ({
      companyInfo: { industry: answer }
    })
  },

  {
    id: 'company-stage-v2',
    category: 'company',
    text: 'Em que estágio de maturidade a empresa está?',
    personas: ['all'],
    priority: 'essential',
    inputType: 'single-choice',
    options: [
      { value: 'early-stage', label: 'Early-stage (Pré-seed / Seed)', description: 'MVP, validando produto' },
      { value: 'growth', label: 'Growth (Series A-B)', description: 'Product-market fit, escalando' },
      { value: 'scaleup', label: 'Scale-up (Series C+)', description: 'Crescimento acelerado' },
      { value: 'enterprise', label: 'Enterprise', description: 'IPO ou consolidado' }
    ],
    tags: ['stage', 'context', 'company'],
    skipIf: {
      fieldsCollected: ['companyInfo.stage']
    },
    dataExtractor: (answer) => ({
      companyInfo: { stage: answer }
    })
  },

  {
    id: 'company-name',
    category: 'company',
    text: 'Qual o nome da empresa?',
    personas: ['all'],
    priority: 'essential',
    inputType: 'text',
    placeholder: 'Ex: Acme Corp',
    tags: ['name', 'context'],
    skipIf: {
      fieldsCollected: ['companyInfo.name']
    },
    dataExtractor: (answer) => ({
      companyInfo: { name: answer }
    })
  },

  {
    id: 'company-size-employees',
    category: 'company',
    text: 'Quantos funcionários a empresa tem (total)?',
    personas: ['all'],
    priority: 'important',
    inputType: 'single-choice',
    options: [
      { value: '1-10', label: '1-10 pessoas' },
      { value: '11-50', label: '11-50 pessoas' },
      { value: '51-200', label: '51-200 pessoas' },
      { value: '201-500', label: '201-500 pessoas' },
      { value: '500+', label: 'Mais de 500' }
    ],
    tags: ['size', 'context', 'company'],
    skipIf: {
      fieldsCollected: ['companyInfo.size']
    },
    dataExtractor: (answer) => ({
      companyInfo: { size: answer }
    })
  },

  {
    id: 'team-size-dev',
    category: 'company',
    text: 'Quantas pessoas no time de tecnologia/desenvolvimento?',
    personas: ['engineering-tech', 'it-devops', 'product-business'],
    priority: 'important',
    inputType: 'single-choice',
    options: [
      { value: '1-5', label: '1-5 devs' },
      { value: '6-15', label: '6-15 devs' },
      { value: '16-30', label: '16-30 devs' },
      { value: '31-50', label: '31-50 devs' },
      { value: '50+', label: 'Mais de 50 devs' }
    ],
    tags: ['team-size', 'context', 'technical'],
    skipIf: {
      fieldsCollected: ['currentState.devTeamSize']
    },
    dataExtractor: (answer) => ({
      currentState: { devTeamSize: parseInt(answer.split('-')[0]) }
    })
  },

  {
    id: 'tech-stack-primary',
    category: 'company',
    text: 'Qual a tecnologia principal do backend?',
    personas: ['engineering-tech', 'it-devops'],
    priority: 'optional',
    inputType: 'single-choice',
    options: [
      { value: 'nodejs', label: 'Node.js / JavaScript' },
      { value: 'python', label: 'Python / Django / Flask' },
      { value: 'java', label: 'Java / Spring Boot' },
      { value: 'dotnet', label: '.NET / C#' },
      { value: 'ruby', label: 'Ruby on Rails' },
      { value: 'php', label: 'PHP / Laravel' },
      { value: 'go', label: 'Go / Golang' },
      { value: 'other', label: 'Outro' }
    ],
    tags: ['tech-stack', 'technical'],
    dataExtractor: (answer) => ({
      currentState: {
        techStack: { backend: answer }
      }
    })
  },

  {
    id: 'company-revenue-range',
    category: 'company',
    text: 'Qual a faixa de receita anual (ARR)?',
    personas: ['board-executive', 'finance-ops'],
    priority: 'important',
    inputType: 'single-choice',
    options: [
      { value: '<1M', label: 'Menos de R$ 1M' },
      { value: '1M-5M', label: 'R$ 1M - 5M' },
      { value: '5M-20M', label: 'R$ 5M - 20M' },
      { value: '20M-50M', label: 'R$ 20M - 50M' },
      { value: '50M+', label: 'Mais de R$ 50M' }
    ],
    tags: ['revenue', 'context', 'financial'],
    dataExtractor: (answer) => ({
      companyInfo: { revenue: answer }
    })
  },

  {
    id: 'company-growth-rate',
    category: 'company',
    text: 'Como está o crescimento da empresa?',
    personas: ['board-executive', 'product-business'],
    priority: 'optional',
    inputType: 'single-choice',
    options: [
      { value: 'rapid', label: 'Crescimento acelerado (>100% YoY)' },
      { value: 'healthy', label: 'Crescimento saudável (30-100% YoY)' },
      { value: 'moderate', label: 'Crescimento moderado (10-30% YoY)' },
      { value: 'flat', label: 'Estagnado / Flat' },
      { value: 'declining', label: 'Em declínio' }
    ],
    tags: ['growth', 'context', 'business'],
    dataExtractor: (answer) => ({
      companyInfo: { growthRate: answer }
    })
  }
];

// ============================================================================
// PAIN POINTS (10 questions - simple, one topic each)
// ============================================================================

const painPointQuestions: QuestionPoolItem[] = [
  {
    id: 'pain-velocity',
    category: 'pain-points',
    text: 'Desenvolvimento está lento?',
    personas: ['all'],
    priority: 'essential',
    inputType: 'single-choice',
    options: [
      { value: 'yes-critical', label: 'Sim, muito lento (crítico)' },
      { value: 'yes-moderate', label: 'Sim, mais lento que gostaríamos' },
      { value: 'acceptable', label: 'Aceitável, mas poderia melhorar' },
      { value: 'no', label: 'Não, velocidade está boa' }
    ],
    tags: ['velocity', 'pain', 'development'],
    dataExtractor: (answer) => {
      const pains = [];
      if (answer.includes('yes') || answer === 'acceptable') {
        pains.push('Desenvolvimento lento');
      }
      return {
        currentState: { painPoints: pains }
      };
    }
  },

  {
    id: 'pain-quality-bugs',
    category: 'pain-points',
    text: 'Vocês têm problemas com bugs em produção?',
    personas: ['all'],
    priority: 'essential',
    inputType: 'single-choice',
    options: [
      { value: 'yes-many', label: 'Sim, muitos bugs (toda semana)' },
      { value: 'yes-some', label: 'Sim, alguns bugs (mensal)' },
      { value: 'few', label: 'Poucos bugs, gerenciável' },
      { value: 'no', label: 'Não, qualidade excelente' }
    ],
    tags: ['quality', 'bugs', 'pain'],
    dataExtractor: (answer) => {
      const pains = [];
      if (answer.includes('yes')) {
        pains.push('Bugs em produção');
      }
      return {
        currentState: { painPoints: pains }
      };
    }
  },

  {
    id: 'pain-tech-debt',
    category: 'pain-points',
    text: 'Débito técnico está atrapalhando?',
    personas: ['engineering-tech', 'it-devops', 'product-business'],
    priority: 'important',
    inputType: 'single-choice',
    options: [
      { value: 'yes-blocking', label: 'Sim, bloqueia novos desenvolvimentos' },
      { value: 'yes-slowing', label: 'Sim, deixa tudo mais lento' },
      { value: 'manageable', label: 'Existe mas é gerenciável' },
      { value: 'no', label: 'Não, código está saudável' }
    ],
    tags: ['tech-debt', 'pain', 'technical'],
    dataExtractor: (answer) => {
      const pains = [];
      if (answer.includes('yes')) {
        pains.push('Débito técnico alto');
      }
      return {
        currentState: { painPoints: pains }
      };
    }
  },

  {
    id: 'pain-people-hiring',
    category: 'pain-points',
    text: 'Dificuldade para contratar ou reter talentos?',
    personas: ['all'],
    priority: 'important',
    inputType: 'single-choice',
    options: [
      { value: 'yes-critical', label: 'Sim, muito difícil (meses para contratar)' },
      { value: 'yes-moderate', label: 'Sim, processo lento' },
      { value: 'ok', label: 'OK, mas poderia ser melhor' },
      { value: 'no', label: 'Não, conseguimos contratar bem' }
    ],
    tags: ['hiring', 'people', 'pain'],
    dataExtractor: (answer) => {
      const pains = [];
      if (answer.includes('yes')) {
        pains.push('Dificuldade de contratação');
      }
      return {
        currentState: { painPoints: pains }
      };
    }
  },

  {
    id: 'pain-cost',
    category: 'pain-points',
    text: 'Custo de desenvolvimento está alto demais?',
    personas: ['board-executive', 'finance-ops'],
    priority: 'important',
    inputType: 'single-choice',
    options: [
      { value: 'yes-unsustainable', label: 'Sim, insustentável' },
      { value: 'yes-high', label: 'Sim, mais alto que deveria' },
      { value: 'acceptable', label: 'Aceitável para o momento' },
      { value: 'no', label: 'Não, custo OK' }
    ],
    tags: ['cost', 'pain', 'financial'],
    dataExtractor: (answer) => {
      const pains = [];
      if (answer.includes('yes')) {
        pains.push('Custo alto de desenvolvimento');
      }
      return {
        currentState: { painPoints: pains }
      };
    }
  },

  {
    id: 'pain-scalability',
    category: 'pain-points',
    text: 'Sistema tem problemas de escalabilidade?',
    personas: ['engineering-tech', 'it-devops'],
    priority: 'important',
    inputType: 'single-choice',
    options: [
      { value: 'yes-critical', label: 'Sim, cai com carga alta' },
      { value: 'yes-concerns', label: 'Sim, preocupações para o futuro' },
      { value: 'ok', label: 'OK por enquanto' },
      { value: 'no', label: 'Não, escala bem' }
    ],
    tags: ['scalability', 'pain', 'technical'],
    dataExtractor: (answer) => {
      const pains = [];
      if (answer.includes('yes')) {
        pains.push('Problemas de escalabilidade');
      }
      return {
        currentState: { painPoints: pains }
      };
    }
  },

  {
    id: 'pain-process',
    category: 'pain-points',
    text: 'Processos internos são burocráticos/lentos?',
    personas: ['all'],
    priority: 'optional',
    inputType: 'single-choice',
    options: [
      { value: 'yes-blocking', label: 'Sim, bloqueiam progresso' },
      { value: 'yes-slowing', label: 'Sim, deixam tudo mais lento' },
      { value: 'ok', label: 'Aceitável' },
      { value: 'no', label: 'Não, processos funcionam bem' }
    ],
    tags: ['process', 'pain', 'operations'],
    dataExtractor: (answer) => {
      const pains = [];
      if (answer.includes('yes')) {
        pains.push('Processos burocráticos');
      }
      return {
        currentState: { painPoints: pains }
      };
    }
  },

  {
    id: 'pain-competition',
    category: 'pain-points',
    text: 'Concorrência está lançando features mais rápido?',
    personas: ['board-executive', 'product-business'],
    priority: 'important',
    inputType: 'single-choice',
    options: [
      { value: 'yes-losing', label: 'Sim, estamos perdendo mercado' },
      { value: 'yes-pressure', label: 'Sim, sentimos pressão' },
      { value: 'competitive', label: 'Competitivo, no mesmo ritmo' },
      { value: 'no', label: 'Não, estamos na frente' }
    ],
    tags: ['competition', 'pain', 'market'],
    dataExtractor: (answer) => {
      const pains = [];
      if (answer.includes('yes')) {
        pains.push('Pressão competitiva');
      }
      return {
        currentState: { painPoints: pains }
      };
    }
  },

  {
    id: 'pain-compliance',
    category: 'pain-points',
    text: 'Tem desafios com compliance/segurança?',
    personas: ['engineering-tech', 'it-devops', 'finance-ops'],
    priority: 'optional',
    inputType: 'single-choice',
    options: [
      { value: 'yes-critical', label: 'Sim, crítico (LGPD, SOC2, etc)' },
      { value: 'yes-concerns', label: 'Sim, preocupações futuras' },
      { value: 'ok', label: 'Gerenciável' },
      { value: 'no', label: 'Não, compliance OK' }
    ],
    tags: ['compliance', 'security', 'pain'],
    dataExtractor: (answer) => {
      const pains = [];
      if (answer.includes('yes')) {
        pains.push('Desafios de compliance');
      }
      return {
        currentState: { painPoints: pains }
      };
    }
  },

  {
    id: 'pain-customer-impact',
    category: 'pain-points',
    text: 'Problemas técnicos estão impactando clientes?',
    personas: ['all'],
    priority: 'important',
    inputType: 'single-choice',
    options: [
      { value: 'yes-churn', label: 'Sim, perdendo clientes por isso' },
      { value: 'yes-complaints', label: 'Sim, reclamações frequentes' },
      { value: 'occasional', label: 'Ocasionalmente' },
      { value: 'no', label: 'Não, clientes satisfeitos' }
    ],
    tags: ['customer-impact', 'pain', 'business'],
    dataExtractor: (answer) => {
      const pains = [];
      if (answer.includes('yes')) {
        pains.push('Impacto em clientes');
      }
      return {
        currentState: { painPoints: pains }
      };
    }
  }
];

// ============================================================================
// QUANTIFICATION (12 questions - get numbers/metrics)
// ============================================================================

const quantificationQuestions: QuestionPoolItem[] = [
  {
    id: 'cycle-time-days',
    category: 'quantification',
    text: 'Quantos dias demora do PR até produção (em média)?',
    personas: ['engineering-tech', 'it-devops', 'product-business'],
    priority: 'important',
    inputType: 'single-choice',
    options: [
      { value: '<1', label: 'Menos de 1 dia (same-day)' },
      { value: '1-3', label: '1-3 dias' },
      { value: '4-7', label: '4-7 dias' },
      { value: '8-14', label: '1-2 semanas' },
      { value: '15-30', label: '2-4 semanas' },
      { value: '>30', label: 'Mais de 1 mês' }
    ],
    tags: ['cycle-time', 'metrics', 'velocity'],
    requires: {
      topicsAnswered: ['pain', 'velocity']
    },
    dataExtractor: (answer) => {
      const daysMap: Record<string, number> = {
        '<1': 0.5,
        '1-3': 2,
        '4-7': 5,
        '8-14': 11,
        '15-30': 22,
        '>30': 45
      };
      return {
        currentState: {
          avgCycleTime: daysMap[answer] || 14
        }
      };
    }
  },

  {
    id: 'deploy-frequency',
    category: 'quantification',
    text: 'Quantos deploys/releases por mês vocês fazem?',
    personas: ['engineering-tech', 'it-devops'],
    priority: 'important',
    inputType: 'single-choice',
    options: [
      { value: 'daily', label: 'Diário (20-30+/mês)' },
      { value: 'weekly', label: 'Semanal (4-8/mês)' },
      { value: 'biweekly', label: 'Quinzenal (2-3/mês)' },
      { value: 'monthly', label: 'Mensal (1/mês)' },
      { value: 'quarterly', label: 'Trimestral ou menos' }
    ],
    tags: ['deploy-frequency', 'metrics', 'velocity'],
    dataExtractor: (answer) => ({
      currentState: { deployFrequency: answer }
    })
  },

  {
    id: 'bugs-per-month',
    category: 'quantification',
    text: 'Quantos bugs críticos em produção por mês (aprox)?',
    personas: ['all'],
    priority: 'important',
    inputType: 'single-choice',
    options: [
      { value: '0-2', label: '0-2 bugs' },
      { value: '3-5', label: '3-5 bugs' },
      { value: '6-10', label: '6-10 bugs' },
      { value: '11-20', label: '11-20 bugs' },
      { value: '>20', label: 'Mais de 20 bugs/mês' }
    ],
    tags: ['bugs', 'metrics', 'quality'],
    requires: {
      topicsAnswered: ['bugs', 'quality']
    },
    skipIf: {
      topicsCovered: ['bugs-quantified']
    },
    dataExtractor: (answer) => {
      const bugsMap: Record<string, number> = {
        '0-2': 1,
        '3-5': 4,
        '6-10': 8,
        '11-20': 15,
        '>20': 30
      };
      return {
        currentState: {
          bugRate: bugsMap[answer] || 5
        }
      };
    }
  },

  {
    id: 'mttr-hours',
    category: 'quantification',
    text: 'Tempo médio para resolver bugs críticos (MTTR)?',
    personas: ['engineering-tech', 'it-devops'],
    priority: 'optional',
    inputType: 'single-choice',
    options: [
      { value: '<1h', label: 'Menos de 1 hora' },
      { value: '1-4h', label: '1-4 horas' },
      { value: '4-24h', label: '4-24 horas (mesmo dia)' },
      { value: '1-3d', label: '1-3 dias' },
      { value: '>3d', label: 'Mais de 3 dias' }
    ],
    tags: ['mttr', 'metrics', 'quality'],
    dataExtractor: (answer) => ({
      currentState: { mttr: answer }
    })
  },

  {
    id: 'test-coverage',
    category: 'quantification',
    text: 'Qual a cobertura de testes automatizados (aprox)?',
    personas: ['engineering-tech', 'it-devops'],
    priority: 'optional',
    inputType: 'single-choice',
    options: [
      { value: '0-20', label: '0-20% (baixa)' },
      { value: '21-50', label: '21-50% (média)' },
      { value: '51-70', label: '51-70% (boa)' },
      { value: '70+', label: 'Mais de 70% (excelente)' },
      { value: 'unknown', label: 'Não sei' }
    ],
    tags: ['testing', 'metrics', 'quality'],
    dataExtractor: (answer) => ({
      currentState: { testCoverage: answer }
    })
  },

  {
    id: 'rework-hours-weekly',
    category: 'quantification',
    text: 'Horas/semana gastas em retrabalho ou "apagando incêndio"?',
    personas: ['all'],
    priority: 'important',
    inputType: 'single-choice',
    options: [
      { value: '0-5', label: '0-5 horas (pouco)' },
      { value: '6-15', label: '6-15 horas (~25% do tempo)' },
      { value: '16-25', label: '16-25 horas (~50% do tempo)' },
      { value: '26-35', label: '26-35 horas (~75% do tempo)' },
      { value: '>35', label: 'Mais de 35h (quase 100%)' }
    ],
    tags: ['rework', 'metrics', 'efficiency'],
    requires: {
      topicsAnswered: ['pain']
    },
    dataExtractor: (answer) => {
      const hoursMap: Record<string, number> = {
        '0-5': 3,
        '6-15': 10,
        '16-25': 20,
        '26-35': 30,
        '>35': 40
      };
      return {
        currentState: {
          reworkHoursWeekly: hoursMap[answer] || 10
        }
      };
    }
  },

  {
    id: 'customers-lost-count',
    category: 'quantification',
    text: 'Quantos clientes perderam nos últimos 6 meses por problemas técnicos?',
    personas: ['board-executive', 'product-business', 'finance-ops'],
    priority: 'important',
    inputType: 'single-choice',
    options: [
      { value: '0', label: 'Nenhum' },
      { value: '1-3', label: '1-3 clientes' },
      { value: '4-10', label: '4-10 clientes' },
      { value: '>10', label: 'Mais de 10' },
      { value: 'unknown', label: 'Não sabemos exatamente' }
    ],
    tags: ['churn', 'metrics', 'impact'],
    requires: {
      topicsAnswered: ['customer-impact']
    },
    dataExtractor: (answer) => ({
      currentState: {
        customersLost: answer
      }
    })
  },

  {
    id: 'revenue-at-risk',
    category: 'quantification',
    text: 'Quanto de receita está em risco por problemas técnicos? (ARR)',
    personas: ['board-executive', 'finance-ops'],
    priority: 'important',
    inputType: 'single-choice',
    options: [
      { value: '<100k', label: 'Menos de R$ 100k' },
      { value: '100k-500k', label: 'R$ 100k - 500k' },
      { value: '500k-1M', label: 'R$ 500k - 1M' },
      { value: '1M-5M', label: 'R$ 1M - 5M' },
      { value: '>5M', label: 'Mais de R$ 5M' },
      { value: 'unknown', label: 'Difícil estimar' }
    ],
    tags: ['revenue-risk', 'metrics', 'financial'],
    requires: {
      topicsAnswered: ['customer-impact', 'churn']
    },
    dataExtractor: (answer) => ({
      currentState: {
        revenueAtRisk: answer
      }
    })
  },

  {
    id: 'cost-per-dev-monthly',
    category: 'quantification',
    text: 'Custo médio por desenvolvedor (salário + encargos)?',
    personas: ['finance-ops', 'board-executive'],
    priority: 'optional',
    inputType: 'single-choice',
    options: [
      { value: '<10k', label: 'Menos de R$ 10k/mês' },
      { value: '10k-20k', label: 'R$ 10k - 20k/mês' },
      { value: '20k-30k', label: 'R$ 20k - 30k/mês' },
      { value: '>30k', label: 'Mais de R$ 30k/mês' }
    ],
    tags: ['cost', 'metrics', 'financial'],
    dataExtractor: (answer) => ({
      currentState: {
        costPerDev: answer
      }
    })
  },

  {
    id: 'time-to-hire-months',
    category: 'quantification',
    text: 'Tempo médio para contratar um dev (do job post até aceitar oferta)?',
    personas: ['all'],
    priority: 'optional',
    inputType: 'single-choice',
    options: [
      { value: '<1', label: 'Menos de 1 mês' },
      { value: '1-2', label: '1-2 meses' },
      { value: '2-4', label: '2-4 meses' },
      { value: '>4', label: 'Mais de 4 meses' }
    ],
    tags: ['hiring', 'metrics', 'people'],
    requires: {
      topicsAnswered: ['hiring', 'people']
    },
    dataExtractor: (answer) => ({
      currentState: {
        timeToHireMonths: answer
      }
    })
  },

  {
    id: 'tech-debt-weeks',
    category: 'quantification',
    text: 'Estimativa de tech debt (em semanas de trabalho para resolver)?',
    personas: ['engineering-tech', 'it-devops'],
    priority: 'optional',
    inputType: 'single-choice',
    options: [
      { value: '<4', label: 'Menos de 1 mês (gerenciável)' },
      { value: '4-12', label: '1-3 meses' },
      { value: '12-24', label: '3-6 meses' },
      { value: '>24', label: 'Mais de 6 meses (crítico)' }
    ],
    tags: ['tech-debt', 'metrics', 'technical'],
    requires: {
      topicsAnswered: ['tech-debt']
    },
    dataExtractor: (answer) => ({
      currentState: {
        techDebtWeeks: answer
      }
    })
  },

  {
    id: 'failed-releases-percentage',
    category: 'quantification',
    text: 'Qual % de releases falham ou precisam rollback?',
    personas: ['engineering-tech', 'it-devops'],
    priority: 'optional',
    inputType: 'single-choice',
    options: [
      { value: '0-5', label: '0-5% (muito raro)' },
      { value: '6-15', label: '6-15% (ocasional)' },
      { value: '16-30', label: '16-30% (frequente)' },
      { value: '>30', label: 'Mais de 30% (muito alto)' }
    ],
    tags: ['reliability', 'metrics', 'quality'],
    dataExtractor: (answer) => ({
      currentState: {
        failedReleasesPercentage: answer
      }
    })
  }
];

// ============================================================================
// CURRENT STATE (8 questions - understand maturity)
// ============================================================================

const currentStateQuestions: QuestionPoolItem[] = [
  {
    id: 'cicd-maturity',
    category: 'current-state',
    text: 'Como está a automação de CI/CD?',
    personas: ['engineering-tech', 'it-devops'],
    priority: 'important',
    inputType: 'single-choice',
    options: [
      { value: 'none', label: 'Nenhuma (deploy manual)' },
      { value: 'basic', label: 'Básica (alguns scripts)' },
      { value: 'intermediate', label: 'Intermediária (pipeline funciona)' },
      { value: 'advanced', label: 'Avançada (fully automated)' }
    ],
    tags: ['cicd', 'automation', 'devops'],
    dataExtractor: (answer) => ({
      currentState: { cicdMaturity: answer }
    })
  },

  {
    id: 'monitoring-observability',
    category: 'current-state',
    text: 'Tem monitoramento e observabilidade em produção?',
    personas: ['engineering-tech', 'it-devops'],
    priority: 'important',
    inputType: 'single-choice',
    options: [
      { value: 'none', label: 'Não tem (vamos no escuro)' },
      { value: 'basic', label: 'Básico (logs apenas)' },
      { value: 'intermediate', label: 'Intermediário (logs + métricas)' },
      { value: 'advanced', label: 'Avançado (APM, traces, alertas)' }
    ],
    tags: ['monitoring', 'observability', 'devops'],
    dataExtractor: (answer) => ({
      currentState: { observability: answer }
    })
  },

  {
    id: 'ai-tools-current',
    category: 'current-state',
    text: 'Time já usa ferramentas de AI no desenvolvimento?',
    personas: ['all'],
    priority: 'important',
    inputType: 'multi-choice',
    options: [
      { value: 'github-copilot', label: 'GitHub Copilot' },
      { value: 'cursor', label: 'Cursor' },
      { value: 'chatgpt', label: 'ChatGPT / Claude' },
      { value: 'other', label: 'Outras ferramentas AI' },
      { value: 'none', label: 'Não usamos AI ainda' }
    ],
    tags: ['ai-tools', 'current-state'],
    dataExtractor: (answer) => ({
      currentState: { aiTools: Array.isArray(answer) ? answer : [answer] }
    })
  },

  {
    id: 'code-review-process',
    category: 'current-state',
    text: 'Como funciona o processo de code review?',
    personas: ['engineering-tech', 'it-devops'],
    priority: 'optional',
    inputType: 'single-choice',
    options: [
      { value: 'none', label: 'Não fazemos code review' },
      { value: 'informal', label: 'Informal (às vezes)' },
      { value: 'required', label: 'Obrigatório mas lento' },
      { value: 'optimized', label: 'Obrigatório e eficiente' }
    ],
    tags: ['code-review', 'process', 'quality'],
    dataExtractor: (answer) => ({
      currentState: { codeReviewProcess: answer }
    })
  },

  {
    id: 'documentation-quality',
    category: 'current-state',
    text: 'Qual o nível de documentação técnica?',
    personas: ['engineering-tech', 'it-devops'],
    priority: 'optional',
    inputType: 'single-choice',
    options: [
      { value: 'none', label: 'Não temos documentação' },
      { value: 'outdated', label: 'Temos mas está desatualizada' },
      { value: 'basic', label: 'Básica (essencial documentado)' },
      { value: 'comprehensive', label: 'Completa e atualizada' }
    ],
    tags: ['documentation', 'knowledge', 'process'],
    dataExtractor: (answer) => ({
      currentState: { documentationQuality: answer }
    })
  },

  {
    id: 'team-seniority',
    category: 'current-state',
    text: 'Como é a composição de seniority do time?',
    personas: ['engineering-tech', 'it-devops'],
    priority: 'optional',
    inputType: 'single-choice',
    options: [
      { value: 'mostly-junior', label: 'Maioria júnior' },
      { value: 'mixed', label: 'Mix de júnior/pleno/sênior' },
      { value: 'mostly-senior', label: 'Maioria pleno/sênior' },
      { value: 'all-senior', label: 'Todos sênior+' }
    ],
    tags: ['seniority', 'team', 'people'],
    dataExtractor: (answer) => ({
      currentState: { teamSeniority: answer }
    })
  },

  {
    id: 'knowledge-sharing',
    category: 'current-state',
    text: 'Como o conhecimento é compartilhado no time?',
    personas: ['engineering-tech', 'it-devops', 'product-business'],
    priority: 'optional',
    inputType: 'multi-choice',
    options: [
      { value: 'pair-programming', label: 'Pair programming' },
      { value: 'code-review', label: 'Code reviews' },
      { value: 'documentation', label: 'Documentação escrita' },
      { value: 'meetings', label: 'Reuniões/sync' },
      { value: 'informal', label: 'Informal (ad-hoc)' },
      { value: 'none', label: 'Pouco compartilhamento' }
    ],
    tags: ['knowledge-sharing', 'collaboration', 'process'],
    dataExtractor: (answer) => ({
      currentState: { knowledgeSharing: Array.isArray(answer) ? answer : [answer] }
    })
  },

  {
    id: 'remote-hybrid-office',
    category: 'current-state',
    text: 'Qual o modelo de trabalho do time?',
    personas: ['all'],
    priority: 'optional',
    inputType: 'single-choice',
    options: [
      { value: 'remote', label: '100% remoto' },
      { value: 'hybrid', label: 'Híbrido (alguns dias presencial)' },
      { value: 'office', label: '100% presencial' }
    ],
    tags: ['work-model', 'culture'],
    dataExtractor: (answer) => ({
      currentState: { workModel: answer }
    })
  }
];

// ============================================================================
// GOALS & URGENCY (6 questions)
// ============================================================================

const goalsQuestions: QuestionPoolItem[] = [
  {
    id: 'primary-goal',
    category: 'goals',
    text: 'Qual o objetivo principal agora?',
    personas: ['all'],
    priority: 'essential',
    inputType: 'single-choice',
    options: [
      { value: 'increase-velocity', label: 'Aumentar velocidade de desenvolvimento' },
      { value: 'improve-quality', label: 'Melhorar qualidade (reduzir bugs)' },
      { value: 'reduce-costs', label: 'Reduzir custos' },
      { value: 'scale-team', label: 'Escalar time rapidamente' },
      { value: 'modernize-stack', label: 'Modernizar stack tecnológico' },
      { value: 'meet-deadline', label: 'Cumprir deadline crítico' }
    ],
    tags: ['goal', 'priority'],
    skipIf: {
      fieldsCollected: ['goals.primaryGoals']
    },
    dataExtractor: (answer) => ({
      goals: { primaryGoals: [answer] }
    })
  },

  {
    id: 'timeline-urgency',
    category: 'goals',
    text: 'Qual o prazo para melhorias?',
    personas: ['all'],
    priority: 'essential',
    inputType: 'single-choice',
    options: [
      { value: 'immediate', label: 'Imediato (1-2 semanas)' },
      { value: 'short', label: 'Curto prazo (1-3 meses)' },
      { value: 'medium', label: 'Médio prazo (3-6 meses)' },
      { value: 'long', label: 'Longo prazo (6-12 meses)' },
      { value: 'flexible', label: 'Flexível' }
    ],
    tags: ['timeline', 'urgency'],
    skipIf: {
      fieldsCollected: ['goals.timeline']
    },
    dataExtractor: (answer) => ({
      goals: { timeline: answer }
    })
  },

  {
    id: 'external-pressure',
    category: 'goals',
    text: 'Há pressão externa (investidores, board, clientes)?',
    personas: ['board-executive', 'product-business', 'finance-ops'],
    priority: 'important',
    inputType: 'single-choice',
    options: [
      { value: 'critical', label: 'Sim, crítica (board pressionando)' },
      { value: 'moderate', label: 'Sim, moderada' },
      { value: 'some', label: 'Alguma pressão' },
      { value: 'none', label: 'Não, sem pressão externa' }
    ],
    tags: ['pressure', 'urgency', 'stakeholders'],
    dataExtractor: (answer) => ({
      goals: { externalPressure: answer }
    })
  },

  {
    id: 'competitive-threat',
    category: 'goals',
    text: 'Tem ameaça competitiva iminente?',
    personas: ['board-executive', 'product-business'],
    priority: 'important',
    inputType: 'single-choice',
    options: [
      { value: 'yes-critical', label: 'Sim, concorrente lançando feature similar' },
      { value: 'yes-moderate', label: 'Sim, perdendo participação de mercado' },
      { value: 'monitoring', label: 'Monitorando mas OK' },
      { value: 'no', label: 'Não, posição confortável' }
    ],
    tags: ['competition', 'threat', 'market'],
    dataExtractor: (answer) => ({
      goals: { competitiveThreat: answer }
    })
  },

  {
    id: 'success-metric',
    category: 'goals',
    text: 'Como vai medir sucesso da melhoria?',
    personas: ['all'],
    priority: 'important',
    inputType: 'single-choice',
    options: [
      { value: 'velocity', label: 'Velocidade (cycle time, deploy freq)' },
      { value: 'quality', label: 'Qualidade (menos bugs, menos downtime)' },
      { value: 'cost', label: 'Custo (ROI, economia)' },
      { value: 'team', label: 'Satisfação do time' },
      { value: 'customers', label: 'Satisfação de clientes (NPS)' },
      { value: 'revenue', label: 'Impacto em receita' }
    ],
    tags: ['metrics', 'success', 'kpi'],
    skipIf: {
      fieldsCollected: ['goals.successMetrics']
    },
    dataExtractor: (answer) => ({
      goals: { successMetrics: [answer] }
    })
  },

  {
    id: 'funding-round',
    category: 'goals',
    text: 'Planejam levantar investment em breve?',
    personas: ['board-executive', 'finance-ops'],
    priority: 'optional',
    inputType: 'single-choice',
    options: [
      { value: 'yes-soon', label: 'Sim, nos próximos 3-6 meses' },
      { value: 'yes-future', label: 'Sim, mas mais pra frente (6-12 meses)' },
      { value: 'no', label: 'Não planejado' },
      { value: 'bootstrapped', label: 'Empresa é bootstrapped' }
    ],
    tags: ['funding', 'investment'],
    dataExtractor: (answer) => ({
      goals: { fundingPlans: answer }
    })
  }
];

// ============================================================================
// BUDGET & AUTHORITY (4 questions)
// ============================================================================

const budgetQuestions: QuestionPoolItem[] = [
  {
    id: 'budget-range',
    category: 'budget',
    text: 'Qual a faixa de orçamento para investir em melhorias?',
    personas: ['all'],
    priority: 'essential',
    inputType: 'single-choice',
    options: [
      { value: 'none', label: 'Sem orçamento no momento' },
      { value: '<100k', label: 'Até R$ 100k' },
      { value: '100k-500k', label: 'R$ 100k - 500k' },
      { value: '500k-1M', label: 'R$ 500k - 1M' },
      { value: '1M+', label: 'Mais de R$ 1M' }
    ],
    tags: ['budget', 'investment'],
    skipIf: {
      fieldsCollected: ['goals.budgetRange']
    },
    dataExtractor: (answer) => ({
      goals: { budgetRange: answer }
    })
  },

  {
    id: 'budget-status',
    category: 'budget',
    text: 'Orçamento está aprovado?',
    personas: ['all'],
    priority: 'important',
    inputType: 'single-choice',
    options: [
      { value: 'approved', label: 'Sim, aprovado e disponível' },
      { value: 'pending', label: 'Em processo de aprovação' },
      { value: 'need-roi', label: 'Preciso mostrar ROI primeiro' },
      { value: 'none', label: 'Ainda não' }
    ],
    tags: ['budget', 'approval'],
    requires: {
      topicsAnswered: ['budget']
    },
    dataExtractor: (answer) => ({
      goals: { budgetStatus: answer }
    })
  },

  {
    id: 'decision-authority',
    category: 'budget',
    text: 'Você tem autonomia para aprovar?',
    personas: ['all'],
    priority: 'important',
    inputType: 'single-choice',
    options: [
      { value: 'yes-full', label: 'Sim, decisão final é minha' },
      { value: 'yes-partial', label: 'Sim, até certo valor' },
      { value: 'no-recommend', label: 'Não, mas posso recomendar' },
      { value: 'no', label: 'Não, precisa de outras aprovações' }
    ],
    tags: ['authority', 'decision'],
    dataExtractor: (answer) => ({
      goals: { decisionAuthority: answer }
    })
  },

  {
    id: 'procurement-timeline',
    category: 'budget',
    text: 'Se aprovar, quanto tempo demora o procurement?',
    personas: ['all'],
    priority: 'optional',
    inputType: 'single-choice',
    options: [
      { value: 'immediate', label: 'Imediato (assino hoje)' },
      { value: '1-2w', label: '1-2 semanas' },
      { value: '1month', label: '1 mês' },
      { value: '>1month', label: 'Mais de 1 mês (burocrático)' }
    ],
    tags: ['procurement', 'timeline'],
    requires: {
      topicsAnswered: ['budget']
    },
    dataExtractor: (answer) => ({
      goals: { procurementTimeline: answer }
    })
  }
];

// ============================================================================
// COMMITMENT (2 questions - qualify lead)
// ============================================================================

const commitmentQuestions: QuestionPoolItem[] = [
  {
    id: 'readiness-to-act',
    category: 'commitment',
    text: 'Se mostrarmos ROI claro, está pronto para agir?',
    personas: ['all'],
    priority: 'important',
    inputType: 'single-choice',
    options: [
      { value: 'yes-ready', label: 'Sim, pronto para começar' },
      { value: 'yes-need-details', label: 'Sim, mas preciso de mais detalhes' },
      { value: 'maybe', label: 'Talvez, depende' },
      { value: 'exploring', label: 'Só explorando opções' }
    ],
    tags: ['commitment', 'readiness'],
    dataExtractor: (answer) => ({
      goals: { readinessToAct: answer }
    })
  },

  {
    id: 'contact-info',
    category: 'commitment',
    text: 'Email para enviarmos o relatório detalhado?',
    personas: ['all'],
    priority: 'essential',
    inputType: 'text',
    placeholder: 'seu@email.com',
    tags: ['contact', 'lead'],
    skipIf: {
      fieldsCollected: ['contactInfo.email']
    },
    dataExtractor: (answer) => ({
      contactInfo: { email: answer }
    })
  }
];

// ============================================================================
// EXPORT POOL
// ============================================================================

export const QUESTION_POOL: QuestionPoolItem[] = [
  ...companyQuestions,       // 8
  ...painPointQuestions,     // 10
  ...quantificationQuestions, // 12
  ...currentStateQuestions,  // 8
  ...goalsQuestions,         // 6
  ...budgetQuestions,        // 4
  ...commitmentQuestions     // 2
  // TOTAL: 50 questions
];

// Helper to get question by ID
export function getQuestionById(id: string): QuestionPoolItem | undefined {
  return QUESTION_POOL.find(q => q.id === id);
}

// Helper to get questions by category
export function getQuestionsByCategory(category: QuestionCategory): QuestionPoolItem[] {
  return QUESTION_POOL.filter(q => q.category === category);
}

// Helper to get questions by persona
export function getQuestionsByPersona(persona: UserPersona): QuestionPoolItem[] {
  return QUESTION_POOL.filter(q =>
    q.personas.includes('all') || q.personas.includes(persona)
  );
}

// Stats
export const POOL_STATS = {
  total: QUESTION_POOL.length,
  byCategory: {
    company: companyQuestions.length,
    'pain-points': painPointQuestions.length,
    quantification: quantificationQuestions.length,
    'current-state': currentStateQuestions.length,
    goals: goalsQuestions.length,
    budget: budgetQuestions.length,
    commitment: commitmentQuestions.length
  },
  byPriority: {
    essential: QUESTION_POOL.filter(q => q.priority === 'essential').length,
    important: QUESTION_POOL.filter(q => q.priority === 'important').length,
    optional: QUESTION_POOL.filter(q => q.priority === 'optional').length
  }
};
