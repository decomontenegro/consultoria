import { UserPersona } from '@/lib/types';

export type ScenarioType = 'otimista' | 'pessimista' | 'realista' | 'cetico' | 'urgente';

export interface PersonaScenario {
  persona: UserPersona;
  scenarioType: ScenarioType;
  testId: string;
  companyInfo: {
    name: string;
    industry: string;
    size: 'startup' | 'scaleup' | 'enterprise';
    revenue: string;
  };
  currentState: {
    devTeamSize: number;
    avgCycleTime: number;
    deploymentFrequency: string;
    aiToolsUsage: 'none' | 'exploring' | 'piloting' | 'production' | 'mature';
    painPoints: string[];
  };
  goals: {
    primaryGoals: string[];
    timeline: '3-months' | '6-months' | '12-months' | '18-months';
    budgetRange: string;
    successMetrics: string[];
  };
  contactInfo: {
    fullName: string;
    title: string;
    email: string;
  };
  simulatedResponses: string[]; // Respostas que o "usuário" daria na conversa
  expectedTopics: string[]; // Tópicos que esperamos ser sugeridos
  expectedBehavior: {
    shouldAvoidJargon: boolean;
    preferredAbstractionLevel: string;
    focusAreas: string[];
  };
}

// Base scenarios by type
const scenarioTemplates: Record<ScenarioType, Partial<PersonaScenario>> = {
  otimista: {
    currentState: {
      devTeamSize: 25,
      avgCycleTime: 7,
      deploymentFrequency: 'weekly',
      aiToolsUsage: 'piloting',
      painPoints: ['Escalabilidade do processo', 'Padronização de boas práticas'],
    },
    goals: {
      primaryGoals: ['Aumentar velocidade de inovação', 'Escalar o time'],
      timeline: '3-months',
      budgetRange: 'R$500K - R$1M',
      successMetrics: ['Time to market', 'Developer satisfaction'],
    },
    simulatedResponses: [
      'Queremos acelerar ainda mais nosso processo atual',
      'Já vimos bons resultados com algumas ferramentas AI',
      'Nosso objetivo é manter a liderança no mercado',
    ],
    expectedTopics: ['speed-innovation', 'ai-barriers'],
  },
  pessimista: {
    currentState: {
      devTeamSize: 15,
      avgCycleTime: 45,
      deploymentFrequency: 'monthly',
      aiToolsUsage: 'none',
      painPoints: ['Alta taxa de bugs', 'Baixa produtividade dev', 'Rotatividade de talentos'],
    },
    goals: {
      primaryGoals: ['Reduzir bugs', 'Melhorar qualidade'],
      timeline: '18-months',
      budgetRange: 'R$100K - R$200K',
      successMetrics: ['Bug rate', 'Code quality', 'Team stability'],
    },
    simulatedResponses: [
      'Estamos com muitos problemas de qualidade',
      'Não temos experiência com AI e estamos preocupados',
      'Precisamos resolver o básico antes de pensar em inovação',
    ],
    expectedTopics: ['quality-impact', 'team-capacity', 'ai-barriers'],
  },
  realista: {
    currentState: {
      devTeamSize: 20,
      avgCycleTime: 21,
      deploymentFrequency: 'bi-weekly',
      aiToolsUsage: 'exploring',
      painPoints: ['Entrega lenta de features', 'Dívida técnica acumulada'],
    },
    goals: {
      primaryGoals: ['Aumentar produtividade dev', 'Reduzir time-to-market'],
      timeline: '6-months',
      budgetRange: 'R$200K - R$500K',
      successMetrics: ['Deployment frequency', 'Lead time', 'Developer velocity'],
    },
    simulatedResponses: [
      'Temos alguns desafios mas também oportunidades claras',
      'Estamos explorando AI mas ainda sem adoção significativa',
      'Queremos melhorias graduais e sustentáveis',
    ],
    expectedTopics: ['speed-innovation', 'ai-barriers', 'team-capacity'],
  },
  cetico: {
    currentState: {
      devTeamSize: 12,
      avgCycleTime: 30,
      deploymentFrequency: 'monthly',
      aiToolsUsage: 'none',
      painPoints: ['Custos operacionais altos', 'Complexidade de ferramentas'],
    },
    goals: {
      primaryGoals: ['Reduzir custos', 'Simplificar processos'],
      timeline: '12-months',
      budgetRange: 'R$50K - R$100K',
      successMetrics: ['Cost reduction', 'Process simplification'],
    },
    simulatedResponses: [
      'Precisamos de ROI provado antes de qualquer investimento',
      'Já tentamos outras ferramentas e não funcionaram',
      'Queremos garantias de que vai funcionar para nosso caso',
    ],
    expectedTopics: ['roi-expectations', 'ai-barriers'],
  },
  urgente: {
    currentState: {
      devTeamSize: 18,
      avgCycleTime: 60,
      deploymentFrequency: 'quarterly',
      aiToolsUsage: 'none',
      painPoints: ['Perda de competitividade', 'Time-to-market muito lento', 'Pressão do board'],
    },
    goals: {
      primaryGoals: ['Vitórias rápidas', 'Recuperar competitividade'],
      timeline: '3-months',
      budgetRange: 'R$500K - R$1M',
      successMetrics: ['Quick wins', 'Competitive recovery', 'Board confidence'],
    },
    simulatedResponses: [
      'Estamos perdendo mercado para concorrentes mais ágeis',
      'Temos 3 meses para mostrar resultados ao board',
      'Precisamos de vitórias rápidas e visíveis',
    ],
    expectedTopics: ['strategic-risks', 'speed-innovation', 'roi-expectations'],
  },
};

// Persona-specific details
const personaDetails: Record<UserPersona, {
  titles: string[];
  focusAreas: string[];
  avoidJargon: boolean;
  abstractionLevel: string;
}> = {
  'board-executive': {
    titles: ['CEO', 'Board Member', 'Chief Strategy Officer', 'Managing Director'],
    focusAreas: ['Impacto competitivo', 'ROI estratégico', 'Market share', 'Riscos ao negócio'],
    avoidJargon: true,
    abstractionLevel: 'strategic',
  },
  'finance-ops': {
    titles: ['CFO', 'Finance Director', 'COO', 'Operations VP'],
    focusAreas: ['Eficiência operacional', 'Redução de custos', 'P&L', 'Payback period'],
    avoidJargon: true,
    abstractionLevel: 'tactical-financial',
  },
  'product-business': {
    titles: ['CPO', 'VP Product', 'Product Director', 'Business Unit Lead'],
    focusAreas: ['Time-to-market', 'Feature delivery', 'Customer satisfaction', 'Market fit'],
    avoidJargon: true,
    abstractionLevel: 'tactical-product',
  },
  'engineering-tech': {
    titles: ['CTO', 'VP Engineering', 'Engineering Director', 'Tech Lead'],
    focusAreas: ['Arquitetura', 'Stack técnico', 'DevOps', 'Qualidade de código'],
    avoidJargon: false,
    abstractionLevel: 'technical',
  },
  'it-devops': {
    titles: ['IT Director', 'DevOps Manager', 'Infrastructure Lead', 'SRE Manager'],
    focusAreas: ['Automação', 'Confiabilidade', 'Processos operacionais', 'Infraestrutura'],
    avoidJargon: false,
    abstractionLevel: 'operational',
  },
};

/**
 * Generate all 25 scenarios (5 personas × 5 scenario types)
 */
export function generateAllScenarios(): PersonaScenario[] {
  const scenarios: PersonaScenario[] = [];
  const personas: UserPersona[] = ['board-executive', 'finance-ops', 'product-business', 'engineering-tech', 'it-devops'];
  const scenarioTypes: ScenarioType[] = ['otimista', 'pessimista', 'realista', 'cetico', 'urgente'];

  personas.forEach((persona, pIndex) => {
    scenarioTypes.forEach((scenarioType, sIndex) => {
      const template = scenarioTemplates[scenarioType];
      const personaInfo = personaDetails[persona];
      const testNumber = pIndex * 5 + sIndex + 1;

      scenarios.push({
        persona,
        scenarioType,
        testId: `T${String(testNumber).padStart(2, '0')}-${persona}-${scenarioType}`,
        companyInfo: {
          name: `${scenarioType.charAt(0).toUpperCase() + scenarioType.slice(1)} Corp ${pIndex + 1}`,
          industry: ['fintech', 'healthcare', 'retail', 'saas', 'manufacturing'][pIndex],
          size: template.currentState!.devTeamSize! > 20 ? 'enterprise' : template.currentState!.devTeamSize! > 10 ? 'scaleup' : 'startup',
          revenue: template.goals!.budgetRange === 'R$500K - R$1M' ? 'R$50M - R$100M' : 'R$10M - R$50M',
        },
        currentState: template.currentState as any,
        goals: template.goals as any,
        contactInfo: {
          fullName: `Test User ${testNumber}`,
          title: personaInfo.titles[sIndex % personaInfo.titles.length],
          email: `test${testNumber}@example.com`,
        },
        simulatedResponses: template.simulatedResponses!,
        expectedTopics: template.expectedTopics!,
        expectedBehavior: {
          shouldAvoidJargon: personaInfo.avoidJargon,
          preferredAbstractionLevel: personaInfo.abstractionLevel,
          focusAreas: personaInfo.focusAreas,
        },
      });
    });
  });

  return scenarios;
}

/**
 * Get scenarios by persona
 */
export function getScenariosByPersona(persona: UserPersona): PersonaScenario[] {
  return generateAllScenarios().filter(s => s.persona === persona);
}

/**
 * Get scenario by test ID
 */
export function getScenarioById(testId: string): PersonaScenario | undefined {
  return generateAllScenarios().find(s => s.testId === testId);
}
