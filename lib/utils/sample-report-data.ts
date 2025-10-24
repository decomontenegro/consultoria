/**
 * Sample Report Data for Demo/Testing
 * Used in /sample page and Playwright tests
 */

import { Report } from '@/lib/types';

export const SAMPLE_REPORT: Report = {
  id: 'sample-report',
  assessmentData: {
    companyInfo: {
      name: 'TechCorp Brasil',
      industry: 'fintech',
      size: '11-50',
      revenue: '>R$ 10M',
      stage: 'scale-up',
      techTeamSize: 50
    },
    currentState: {
      devExperience: 'advanced',
      aiToolsUsage: 'pilot',
      codeQuality: 'good',
      deploymentFrequency: 'daily'
    },
    painPoints: {
      mainChallenge: 'velocity',
      bottlenecks: ['code-review', 'testing'],
      techDebt: 'moderate'
    },
    goals: {
      primaryGoal: 'faster-delivery',
      timeline: '3-6m',
      priority: 'quality'
    },
    persona: 'engineering-leader'
  },
  roi: {
    investment: {
      trainingCost: 30000,
      productivityLossDuringTraining: 20000,
      total: 50000
    },
    annualSavings: {
      productivityGain: 168000,
      qualityImprovement: 84000,
      fasterTimeToMarket: 35400,
      total: 287400
    },
    paybackPeriodMonths: 4.2,
    threeYearNPV: 1824500,
    irr: 2.87,
    confidenceLevel: 'high',
    dataQuality: {
      completeness: 85,
      specificity: 75,
      missingCriticalData: [],
      dataSource: 'estimated'
    },
    assumptions: [
      'Baseado em 50 desenvolvedores com salário médio de R$ 15.000/mês',
      'Ganho de produtividade estimado em 28% conforme estudos McKinsey e GitHub',
      'Custos de ferramentas: R$ 20/dev/mês para ferramentas de IA',
      'Período de rampa de adoção de 3 meses até produtividade total'
    ],
    uncertaintyRange: {
      conservativeNPV: 1200000,
      mostLikelyNPV: 1824500,
      optimisticNPV: 2300000
    },
    fourPillarROI: {
      efficiency: {
        productivityIncrease: 28,
        timeToMarketReduction: 42,
        annualValue: 168000,
        keyMetrics: [
          '28% productivity gain per developer',
          '42% faster time-to-market',
          '22,400 hours saved annually'
        ]
      },
      revenue: {
        fasterProductLaunches: 4,
        customerAcquisitionGain: 15,
        marketShareGain: 8,
        annualValue: 85000,
        keyMetrics: [
          '4 additional product launches per year',
          '15% faster customer acquisition',
          '8% market share improvement'
        ]
      },
      risk: {
        codeQualityImprovement: 35,
        bugReduction: 40,
        securityImprovements: [
          'Automated security scanning in AI code reviews',
          'Reduced vulnerability introduction by 30%',
          'Faster security patch deployment'
        ],
        annualValue: 84000,
        keyMetrics: [
          '35% code quality improvement',
          '40% bug reduction',
          'R$ 84k saved on incident costs'
        ]
      },
      agility: {
        deploymentFrequencyIncrease: 50,
        experimentVelocity: 12,
        innovationCapacity: 3,
        annualValue: 45000,
        keyMetrics: [
          '50% increase in deployment frequency',
          '12 additional A/B tests per quarter',
          '3 more features per sprint'
        ]
      },
      totalValue: {
        efficiency: 168000,
        revenue: 85000,
        risk: 84000,
        agility: 45000,
        combined: 382000
      }
    }
  },
  benchmarks: [
    {
      metric: 'Deployment Frequency',
      yourValue: 'Daily',
      industryAverage: 'Weekly',
      topPerformers: 'Multiple per day',
      percentile: 75
    },
    {
      metric: 'Lead Time for Changes',
      yourValue: '2-3 days',
      industryAverage: '1-2 weeks',
      topPerformers: '<1 day',
      percentile: 70
    },
    {
      metric: 'Bug Rate',
      yourValue: '2.1 bugs/kloc',
      industryAverage: '3.5 bugs/kloc',
      topPerformers: '<1 bug/kloc',
      percentile: 65
    }
  ],
  recommendations: [
    'Iniciar com time piloto de 5-10 desenvolvedores seniores para validar produtividade e documentar melhores práticas',
    'Estabelecer métricas baseline de produtividade (throughput, cycle time, quality) antes da implementação',
    'Criar programa de champions para acelerar adoção e compartilhar casos de sucesso internamente',
    'Implementar guardrails de segurança e compliance desde o início para evitar retrabalho',
    'Priorizar casos de uso com maior ROI: geração de testes, documentação, e code review'
  ],
  roadmap: [
    {
      name: 'Pilot & Validation',
      duration: '1-2 meses',
      objectives: [
        'Validar ROI com time piloto',
        'Documentar melhores práticas',
        'Ajustar fluxos de trabalho'
      ],
      expectedResults: '15-20% ganho de produtividade no time piloto, repositório de prompts validados, métricas baseline estabelecidas'
    },
    {
      name: 'Scaling & Enablement',
      duration: '2-3 meses',
      objectives: [
        'Expandir para 50% do time',
        'Treinar champions',
        'Implementar guardrails'
      ],
      expectedResults: '25% de adoção ativa no time, programa de enablement funcionando, primeiros ganhos mensuráveis em velocity'
    },
    {
      name: 'Full Deployment',
      duration: '1-2 meses',
      objectives: [
        'Rollout para 100% do time',
        'Otimizar processos',
        'Medir ROI completo'
      ],
      expectedResults: '28% ganho de produtividade target, redução de 35% em bugs, payback period atingido'
    },
    {
      name: 'Optimization & Scale',
      duration: 'Contínuo',
      objectives: [
        'Otimização contínua',
        'Expandir casos de uso',
        'Compartilhar learnings'
      ],
      expectedResults: 'Gains compostos além do target inicial, novos casos de uso identificados, time mais satisfeito'
    }
  ],
  costOfInaction: {
    yearlyOpportunityCost: 287400,
    competitorAdvantage: {
      timeToMarketGap: '6 months',
      marketShareRisk: 15,
      talentAttritionRisk: 25
    },
    threeYearImpact: {
      lostRevenue: 862200,
      lostProductivity: 1824500,
      talentCosts: 450000
    }
  },
  riskMatrix: {
    technical: { level: 'low', mitigation: 'Piloto inicial com time experiente' },
    organizational: { level: 'medium', mitigation: 'Programa de champions e enablement' },
    financial: { level: 'low', mitigation: 'Payback em 4.2 meses, investimento baixo' },
    competitive: { level: 'high', mitigation: 'Concorrentes já adotando, urgência alta' }
  },
  generatedAt: new Date('2025-01-15T10:00:00Z'),
  aiInsights: [
    'Seu perfil de Engineering Leader indica forte foco em qualidade e entrega sustentável',
    'Seu time já tem experiência com AI tools em piloto - excelente ponto de partida',
    'Com deployment frequency diário, vocês já têm cultura de CI/CD madura',
    'Foco em velocity + quality sugere que AI coding terá alto impacto imediato'
  ]
};
