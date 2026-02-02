/**
 * AI Readiness Question Bank - Enhanced Structure
 *
 * Combina:
 * - 4-Block Architecture do business-quiz (Discovery → Expertise → Deep-Dive → Risk-Scan)
 * - Semantic tracking do assessment (topics, metrics, weak signals)
 *
 * Sprint 2: Enhanced Question Structure
 */

import type { AssessmentData, DeepPartial } from '../types';
import type { AssessmentSessionContext } from '../sessions/types';

// ============================================================================
// QUESTION STRUCTURE
// ============================================================================

/**
 * Enhanced Question Definition
 */
export interface EnhancedQuestion {
  id: string;
  text: string;
  inputType: 'text' | 'single-choice' | 'multi-choice' | 'number';

  // Block & Phase
  block: 'discovery' | 'expertise' | 'deep-dive' | 'risk-scan';
  phase: 'discovery' | 'expertise' | 'deep-dive' | 'completion';

  // Options (for choice-based questions)
  options?: Array<{
    value: string;
    label: string;
    description?: string;
  }>;

  placeholder?: string;

  // Semantic Tracking
  tags: string[]; // e.g., ['technical', 'team-size', 'metrics']
  requiredFor: string[]; // Fields this question fills: ['currentState.devTeamSize']

  // Persona Targeting (NEW)
  personas?: ('engineering-tech' | 'product-business' | 'board-executive' | 'finance-ops' | 'it-devops')[]; // Se undefined, pergunta serve para todos

  // Data Extraction
  dataExtractor: (answer: any, context: Partial<AssessmentSessionContext>) => Partial<AssessmentData>;

  // Follow-up Logic
  followUpTriggers?: {
    condition: (answer: any, context: Partial<AssessmentSessionContext>) => boolean;
    reason: string;
  }[];

  // Prerequisites (optional - para perguntas que dependem de outras)
  prerequisites?: string[]; // Question IDs that must be answered first
}

// ============================================================================
// DISCOVERY BLOCK - Perguntas Iniciais (8-10 perguntas)
// ============================================================================

const discoveryQuestions: EnhancedQuestion[] = [
  // ========== BUSINESS-FOCUSED QUESTIONS ==========
  {
    id: 'disc-biz-001-company-size',
    text: 'Qual o tamanho da sua empresa?',
    inputType: 'single-choice',
    block: 'discovery',
    phase: 'discovery',
    personas: ['product-business', 'board-executive', 'finance-ops'],
    options: [
      { value: 'startup', label: 'Startup (até 50 pessoas)', description: 'Empresa pequena' },
      { value: 'scaleup', label: 'Scale-up (51-500 pessoas)', description: 'Crescimento acelerado' },
      { value: 'enterprise', label: 'Enterprise (500+ pessoas)', description: 'Grande empresa' }
    ],
    tags: ['company-size', 'business', 'context'],
    requiredFor: ['companyInfo.size'],
    dataExtractor: (answer) => ({
      companyInfo: {
        size: answer
      }
    })
  },

  {
    id: 'disc-biz-002-main-business-challenge',
    text: 'Qual é o principal desafio estratégico da empresa hoje?',
    inputType: 'text',
    block: 'discovery',
    phase: 'discovery',
    personas: ['product-business', 'board-executive', 'finance-ops'],
    placeholder: 'Ex: Crescimento lento, custos operacionais altos, perda de competitividade...',
    tags: ['pain-points', 'business', 'strategic'],
    requiredFor: ['currentState.challengeDescription', 'currentState.painPoints'],
    dataExtractor: (answer) => ({
      currentState: {
        challengeDescription: answer,
        painPoints: [answer]
      }
    }),
    followUpTriggers: [
      {
        condition: (answer) => {
          const text = String(answer).toLowerCase();
          // Trigger on interesting keywords
          const keywords = ['inovar', 'inovação', 'inovacao', 'novo produto', 'competidor', 'concorrência', 'concorrencia', 'crescimento', 'custo', 'custos'];
          return keywords.some(k => text.includes(k)) && text.length > 20;
        },
        reason: 'User mentioned strategic challenge with interesting keywords - explore deeper with LLM follow-up'
      }
    ]
  },

  {
    id: 'disc-biz-003-revenue-impact',
    text: 'Esse desafio tem impactado a receita ou crescimento da empresa?',
    inputType: 'single-choice',
    block: 'discovery',
    phase: 'discovery',
    personas: ['product-business', 'board-executive', 'finance-ops'],
    options: [
      { value: 'high', label: 'Sim, impacto alto', description: 'Perdendo receita ou clientes' },
      { value: 'medium', label: 'Impacto moderado', description: 'Crescimento mais lento' },
      { value: 'low', label: 'Impacto baixo', description: 'Ainda não crítico' },
      { value: 'unknown', label: 'Não medimos ainda', description: 'Sem visibilidade' }
    ],
    tags: ['impact', 'business', 'metrics'],
    requiredFor: ['goals.businessImpact'],
    dataExtractor: (answer) => ({
      goals: {
        businessImpact: answer
      }
    })
  },

  {
    id: 'disc-biz-004-ai-maturity',
    text: 'A empresa já usa IA ou automação em alguma área?',
    inputType: 'single-choice',
    block: 'discovery',
    phase: 'discovery',
    personas: ['product-business', 'board-executive', 'finance-ops'],
    options: [
      { value: 'none', label: 'Não usamos ainda', description: 'Começando do zero' },
      { value: 'experiments', label: 'Experimentos pontuais', description: 'Testes isolados' },
      { value: 'some-areas', label: 'Sim, em algumas áreas', description: 'Adoção parcial' },
      { value: 'widespread', label: 'Uso disseminado', description: 'Várias áreas usando' }
    ],
    tags: ['ai-maturity', 'business', 'current-state'],
    requiredFor: ['currentState.aiMaturity'],
    dataExtractor: (answer) => ({
      currentState: {
        aiMaturity: answer,
        hasAIExperience: answer !== 'none'
      }
    })
  },

  {
    id: 'disc-biz-005-primary-goal',
    text: 'Se você pudesse resolver UM problema estratégico com IA, qual seria?',
    inputType: 'single-choice',
    block: 'discovery',
    phase: 'discovery',
    personas: ['product-business', 'board-executive', 'finance-ops'],
    options: [
      { value: 'growth', label: 'Acelerar crescimento', description: 'Ganhar mais clientes' },
      { value: 'efficiency', label: 'Reduzir custos operacionais', description: 'Fazer mais com menos' },
      { value: 'quality', label: 'Melhorar qualidade do produto', description: 'Menos problemas' },
      { value: 'speed', label: 'Aumentar velocidade de entrega', description: 'Time-to-market' },
      { value: 'innovation', label: 'Inovar mais rápido', description: 'Competitividade' },
      { value: 'experience', label: 'Melhorar experiência do cliente', description: 'Satisfação' }
    ],
    tags: ['goals', 'priorities', 'strategic'],
    requiredFor: ['goals.primaryGoal'],
    dataExtractor: (answer) => ({
      goals: {
        primaryGoal: answer,
        primaryGoals: [answer]
      }
    }),
    followUpTriggers: [
      {
        condition: (answer) => {
          // Always trigger follow-up for strategic goals
          return answer && answer !== 'unknown';
        },
        reason: 'User selected strategic goal - explore specific tactics and timeline'
      }
    ]
  },

  // ========== TECHNICAL QUESTIONS (ONLY FOR TECH PERSONAS) ==========
  {
    id: 'disc-tech-001-team-size',
    text: 'Quantas pessoas compõem sua equipe de desenvolvimento?',
    inputType: 'single-choice',
    block: 'discovery',
    phase: 'discovery',
    personas: ['engineering-tech', 'it-devops'],
    options: [
      { value: '1-5', label: '1-5 pessoas', description: 'Time pequeno' },
      { value: '6-15', label: '6-15 pessoas', description: 'Time médio' },
      { value: '16-50', label: '16-50 pessoas', description: 'Time grande' },
      { value: '50+', label: 'Mais de 50', description: 'Time enterprise' }
    ],
    tags: ['team-size', 'technical', 'context'],
    requiredFor: ['currentState.devTeamSize'],
    dataExtractor: (answer) => {
      const sizeMap: Record<string, number> = {
        '1-5': 3,
        '6-15': 10,
        '16-50': 30,
        '50+': 75
      };

      return {
        currentState: {
          devTeamSize: sizeMap[answer] || 10,
          teamSize: sizeMap[answer] || 10
        }
      };
    }
  },

  {
    id: 'disc-tech-002-main-challenge',
    text: 'Qual é o principal desafio técnico que sua equipe enfrenta hoje?',
    inputType: 'text',
    block: 'discovery',
    phase: 'discovery',
    personas: ['engineering-tech', 'it-devops'],
    placeholder: 'Ex: Dívida técnica, bugs frequentes, releases lentas...',
    tags: ['pain-points', 'technical', 'challenges'],
    requiredFor: ['currentState.challengeDescription', 'currentState.painPoints'],
    dataExtractor: (answer) => ({
      currentState: {
        challengeDescription: answer,
        painPoints: [answer]
      }
    }),
    followUpTriggers: [
      {
        condition: (answer) => {
          const lowerAnswer = String(answer).toLowerCase();
          return !lowerAnswer.includes('bug') &&
                 !lowerAnswer.includes('teste') &&
                 !lowerAnswer.includes('qualidade');
        },
        reason: 'User mentioned challenge but not quality/bugs - probe for quality metrics'
      }
    ]
  },

  {
    id: 'disc-003-ai-tools-current',
    text: 'Sua equipe já usa alguma ferramenta de IA no desenvolvimento?',
    inputType: 'multi-choice',
    block: 'discovery',
    phase: 'discovery',
    personas: ['engineering-tech', 'it-devops'],
    options: [
      { value: 'copilot', label: 'GitHub Copilot' },
      { value: 'cursor', label: 'Cursor' },
      { value: 'chatgpt', label: 'ChatGPT' },
      { value: 'claude', label: 'Claude' },
      { value: 'tabnine', label: 'Tabnine' },
      { value: 'none', label: 'Não usamos ainda' },
      { value: 'unknown', label: 'Não tenho informações sobre isso', description: 'Sem visibilidade técnica' }
    ],
    tags: ['ai-tools', 'current-state', 'technical'],
    requiredFor: ['currentState.aiToolsUsed'],
    dataExtractor: (answer) => {
      const tools = Array.isArray(answer) ? answer : [answer];

      return {
        currentState: {
          aiToolsUsed: tools.filter(t => t !== 'none'),
          hasAIExperience: !tools.includes('none')
        }
      };
    }
  },

  {
    id: 'disc-004-primary-goal',
    text: 'Se você pudesse resolver UM problema com IA, qual seria?',
    inputType: 'single-choice',
    block: 'discovery',
    phase: 'discovery',
    personas: ['engineering-tech', 'it-devops'],
    options: [
      { value: 'velocity', label: 'Aumentar velocidade de desenvolvimento', description: 'Entregar mais rápido' },
      { value: 'quality', label: 'Melhorar qualidade do código', description: 'Menos bugs, melhor arquitetura' },
      { value: 'onboarding', label: 'Acelerar onboarding de devs', description: 'Novos membros produtivos mais rápido' },
      { value: 'documentation', label: 'Melhorar documentação', description: 'Docs sempre atualizadas' },
      { value: 'testing', label: 'Aumentar cobertura de testes', description: 'Mais testes, menos bugs' },
      { value: 'refactoring', label: 'Reduzir dívida técnica', description: 'Código mais limpo e manutenível' }
    ],
    tags: ['goals', 'priorities', 'strategic'],
    requiredFor: ['goals.primaryGoal'],
    dataExtractor: (answer) => ({
      goals: {
        primaryGoal: answer,
        primaryGoals: [answer]
      }
    })
  },

  {
    id: 'disc-005-cycle-time',
    text: 'Quanto tempo leva, em média, desde o código pronto até produção?',
    inputType: 'single-choice',
    block: 'discovery',
    phase: 'discovery',
    personas: ['engineering-tech', 'it-devops'],
    options: [
      { value: 'hours', label: 'Algumas horas', description: 'Deploy rápido' },
      { value: 'days', label: '1-3 dias', description: 'Deploy moderado' },
      { value: 'week', label: '1 semana', description: 'Deploy lento' },
      { value: 'weeks', label: 'Mais de 1 semana', description: 'Deploy muito lento' },
      { value: 'unknown', label: 'Não sei/não medimos', description: 'Sem tracking' }
    ],
    tags: ['metrics', 'velocity', 'cycle-time'],
    requiredFor: ['currentState.avgCycleTime'],
    dataExtractor: (answer) => {
      const cycleTimeMap: Record<string, string> = {
        'hours': '< 1 dia',
        'days': '1-3 dias',
        'week': '1 semana',
        'weeks': '> 1 semana',
        'unknown': 'Não medido'
      };

      return {
        currentState: {
          avgCycleTime: cycleTimeMap[answer] || 'Não medido'
        }
      };
    },
    followUpTriggers: [
      {
        condition: (answer) => answer === 'unknown',
        reason: 'User doesn\'t measure cycle time - probe for other metrics'
      }
    ]
  },

  {
    id: 'disc-006-bug-frequency',
    text: 'Com que frequência bugs críticos chegam à produção?',
    inputType: 'single-choice',
    block: 'discovery',
    phase: 'discovery',
    personas: ['engineering-tech', 'it-devops'],
    options: [
      { value: 'rare', label: 'Raramente (< 1 por mês)', description: 'Alta qualidade' },
      { value: 'monthly', label: '1-3 por mês', description: 'Qualidade boa' },
      { value: 'weekly', label: 'Semanalmente', description: 'Qualidade precisa melhorar' },
      { value: 'daily', label: 'Quase todo dia', description: 'Problema crítico de qualidade' },
      { value: 'unknown', label: 'Não rastreamos', description: 'Sem tracking' }
    ],
    tags: ['quality', 'bugs', 'metrics'],
    requiredFor: ['currentState.bugRate'],
    dataExtractor: (answer) => ({
      currentState: {
        bugRate: answer
      }
    })
  },

  {
    id: 'disc-007-tech-stack',
    text: 'Qual é a principal linguagem/framework do seu time?',
    inputType: 'text',
    block: 'discovery',
    phase: 'discovery',
    personas: ['engineering-tech', 'it-devops'],
    placeholder: 'Ex: Python/Django, TypeScript/React, Java/Spring... ou "Não sei"',
    tags: ['technical', 'tech-stack'],
    requiredFor: ['currentState.techStack'],
    dataExtractor: (answer) => ({
      currentState: {
        techStack: [answer]
      }
    })
  },

  {
    id: 'disc-008-code-review',
    text: 'Vocês fazem code review em todos os pull requests?',
    inputType: 'single-choice',
    block: 'discovery',
    phase: 'discovery',
    personas: ['engineering-tech', 'it-devops'],
    options: [
      { value: 'always', label: 'Sempre, é obrigatório' },
      { value: 'most', label: 'Na maioria das vezes' },
      { value: 'sometimes', label: 'Às vezes' },
      { value: 'rarely', label: 'Raramente' },
      { value: 'never', label: 'Não fazemos code review' },
      { value: 'unknown', label: 'Não tenho informações sobre isso', description: 'Sem visibilidade' }
    ],
    tags: ['process', 'quality', 'code-review'],
    requiredFor: ['currentState.hasCodeReview'],
    dataExtractor: (answer) => ({
      currentState: {
        hasCodeReview: answer === 'always' || answer === 'most',
        codeReviewProcess: answer
      }
    })
  }
];

// ============================================================================
// EXPERTISE BLOCK - Detectar Área de Conhecimento (4-6 perguntas)
// ============================================================================

const expertiseQuestions: EnhancedQuestion[] = [
  {
    id: 'exp-001-role',
    text: 'Qual é seu papel principal no time?',
    inputType: 'single-choice',
    block: 'expertise',
    phase: 'expertise',
    options: [
      { value: 'tech-lead', label: 'Tech Lead / Arquiteto' },
      { value: 'engineering-manager', label: 'Engineering Manager' },
      { value: 'product-manager', label: 'Product Manager' },
      { value: 'cto', label: 'CTO / VP Engineering' },
      { value: 'senior-dev', label: 'Senior Developer' },
      { value: 'other', label: 'Outro' }
    ],
    tags: ['persona', 'role', 'context'],
    requiredFor: ['persona'],
    dataExtractor: (answer, context) => {
      const personaMap: Record<string, string> = {
        'tech-lead': 'engineering-tech',
        'engineering-manager': 'engineering-tech',
        'product-manager': 'product-business',
        'cto': 'board-executive',
        'senior-dev': 'engineering-tech',
        'other': context.persona || 'engineering-tech'
      };

      return {
        persona: personaMap[answer] as any
      };
    }
  },

  {
    id: 'exp-002-technical-depth',
    text: 'Você participa ativamente de decisões técnicas (arquitetura, tech stack)?',
    inputType: 'single-choice',
    block: 'expertise',
    phase: 'expertise',
    personas: ['engineering-tech', 'it-devops'],
    options: [
      { value: 'lead', label: 'Sim, eu lidero essas decisões' },
      { value: 'participate', label: 'Sim, eu participo' },
      { value: 'informed', label: 'Não, mas sou informado' },
      { value: 'no', label: 'Não participo' }
    ],
    tags: ['expertise', 'technical', 'decision-making'],
    requiredFor: [],
    dataExtractor: (answer) => ({
      context: {
        hasTechnicalExpertise: answer === 'lead' || answer === 'participate'
      }
    })
  },

  {
    id: 'exp-003-metrics-tracking',
    text: 'Você tem acesso a métricas de desenvolvimento (velocity, cycle time, bug rate)?',
    inputType: 'single-choice',
    block: 'expertise',
    phase: 'expertise',
    personas: ['engineering-tech', 'it-devops'],
    options: [
      { value: 'yes-use', label: 'Sim, uso regularmente' },
      { value: 'yes-occasional', label: 'Sim, olho ocasionalmente' },
      { value: 'no-access', label: 'Não tenho acesso' },
      { value: 'no-track', label: 'Não rastreamos essas métricas' }
    ],
    tags: ['metrics', 'data-driven', 'expertise'],
    requiredFor: [],
    dataExtractor: (answer) => ({
      context: {
        hasMetricsAccess: answer === 'yes-use' || answer === 'yes-occasional',
        isDataDriven: answer === 'yes-use'
      }
    })
  },

  {
    id: 'exp-004-budget-authority',
    text: 'Você tem autoridade para aprovar investimentos em ferramentas/infraestrutura?',
    inputType: 'single-choice',
    block: 'expertise',
    phase: 'expertise',
    options: [
      { value: 'yes-full', label: 'Sim, tenho autonomia total' },
      { value: 'yes-limited', label: 'Sim, até certo valor' },
      { value: 'recommend', label: 'Não, mas posso recomendar' },
      { value: 'no', label: 'Não tenho' }
    ],
    tags: ['budget', 'authority', 'decision-making'],
    requiredFor: ['goals.budgetRange'],
    dataExtractor: (answer) => ({
      goals: {
        budgetRange: answer === 'yes-full' || answer === 'yes-limited' ?
          'R$10k-50k/ano' : 'Não definido',
        hasDecisionAuthority: answer === 'yes-full' || answer === 'yes-limited'
      }
    })
  }
];

// ============================================================================
// DEEP-DIVE BLOCK - Aprofundar em Área Específica (5-7 perguntas)
// ============================================================================

/**
 * Deep-dive em Velocity/Performance
 */
const deepDiveVelocityQuestions: EnhancedQuestion[] = [
  {
    id: 'deep-vel-001-bottleneck',
    text: 'Onde está o maior gargalo no processo de desenvolvimento?',
    inputType: 'single-choice',
    block: 'deep-dive',
    phase: 'deep-dive',
    personas: ['engineering-tech', 'it-devops'],
    options: [
      { value: 'coding', label: 'Escrita de código' },
      { value: 'review', label: 'Code review' },
      { value: 'testing', label: 'Testes (escrever e rodar)' },
      { value: 'ci-cd', label: 'CI/CD / Deploy' },
      { value: 'communication', label: 'Comunicação / Alinhamento' },
      { value: 'unknown', label: 'Não tenho informações sobre isso', description: 'Sem visibilidade' }
    ],
    tags: ['velocity', 'bottleneck', 'deep-dive'],
    requiredFor: [],
    dataExtractor: (answer) => ({
      currentState: {
        mainBottleneck: answer
      }
    })
  },

  {
    id: 'deep-vel-002-pr-wait-time',
    text: 'Quanto tempo um PR típico fica esperando review?',
    inputType: 'single-choice',
    block: 'deep-dive',
    phase: 'deep-dive',
    personas: ['engineering-tech', 'it-devops'],
    options: [
      { value: 'hours', label: 'Algumas horas' },
      { value: 'day', label: '1 dia' },
      { value: 'days', label: '2-3 dias' },
      { value: 'week', label: 'Mais de 1 semana' },
      { value: 'unknown', label: 'Não sei', description: 'Sem tracking' }
    ],
    tags: ['velocity', 'code-review', 'metrics'],
    requiredFor: [],
    dataExtractor: (answer) => ({
      currentState: {
        prWaitTime: answer
      }
    })
  },

  {
    id: 'deep-vel-003-test-coverage',
    text: 'Qual é a cobertura de testes do projeto?',
    inputType: 'single-choice',
    block: 'deep-dive',
    phase: 'deep-dive',
    personas: ['engineering-tech', 'it-devops'],
    options: [
      { value: 'high', label: 'Alta (> 80%)' },
      { value: 'medium', label: 'Média (50-80%)' },
      { value: 'low', label: 'Baixa (< 50%)' },
      { value: 'none', label: 'Não temos testes' },
      { value: 'unknown', label: 'Não sei' }
    ],
    tags: ['testing', 'quality', 'metrics'],
    requiredFor: ['currentState.testCoverage'],
    dataExtractor: (answer) => ({
      currentState: {
        testCoverage: answer
      }
    })
  }
];

/**
 * Deep-dive em Quality/Bugs
 */
const deepDiveQualityQuestions: EnhancedQuestion[] = [
  {
    id: 'deep-qual-001-bug-sources',
    text: 'De onde vêm a maioria dos bugs que chegam em produção?',
    inputType: 'multi-choice',
    block: 'deep-dive',
    phase: 'deep-dive',
    personas: ['engineering-tech', 'it-devops'],
    options: [
      { value: 'edge-cases', label: 'Edge cases não testados' },
      { value: 'integration', label: 'Integração entre sistemas' },
      { value: 'business-logic', label: 'Lógica de negócio complexa' },
      { value: 'performance', label: 'Performance / Timeout' },
      { value: 'ui', label: 'Interface / UX' },
      { value: 'unknown', label: 'Não tenho informações sobre isso', description: 'Sem visibilidade' }
    ],
    tags: ['quality', 'bugs', 'root-cause'],
    requiredFor: [],
    dataExtractor: (answer) => ({
      currentState: {
        bugSources: Array.isArray(answer) ? answer : [answer]
      }
    })
  },

  {
    id: 'deep-qual-002-technical-debt',
    text: 'Como você descreveria o nível de dívida técnica?',
    inputType: 'single-choice',
    block: 'deep-dive',
    phase: 'deep-dive',
    personas: ['engineering-tech', 'it-devops'],
    options: [
      { value: 'low', label: 'Baixo - código limpo e manutenível' },
      { value: 'medium', label: 'Médio - algumas áreas precisam refactoring' },
      { value: 'high', label: 'Alto - dívida está atrasando desenvolvimento' },
      { value: 'critical', label: 'Crítico - sistema quase impossível de manter' },
      { value: 'unknown', label: 'Não tenho informações sobre isso', description: 'Sem visibilidade' }
    ],
    tags: ['quality', 'technical-debt', 'maintainability'],
    requiredFor: ['currentState.technicalDebtLevel'],
    dataExtractor: (answer) => ({
      currentState: {
        technicalDebtLevel: answer
      }
    })
  }
];

// ============================================================================
// RISK-SCAN BLOCK - Identificar Gaps e Riscos (3-5 perguntas)
// ============================================================================

const riskScanQuestions: EnhancedQuestion[] = [
  {
    id: 'risk-001-ai-adoption-blockers',
    text: 'Qual seria o maior obstáculo para adotar IA no seu time?',
    inputType: 'single-choice',
    block: 'risk-scan',
    phase: 'completion',
    options: [
      { value: 'cost', label: 'Custo das ferramentas' },
      { value: 'security', label: 'Preocupações com segurança/privacidade' },
      { value: 'trust', label: 'Confiança na qualidade do código gerado' },
      { value: 'learning', label: 'Curva de aprendizado' },
      { value: 'none', label: 'Nenhum, estamos prontos' }
    ],
    tags: ['adoption', 'risks', 'blockers'],
    requiredFor: [],
    dataExtractor: (answer) => ({
      goals: {
        adoptionBlockers: [answer]
      }
    })
  },

  {
    id: 'risk-002-data-quality',
    text: 'Vocês têm dados de qualidade para medir o impacto de mudanças?',
    inputType: 'single-choice',
    block: 'risk-scan',
    phase: 'completion',
    options: [
      { value: 'yes-comprehensive', label: 'Sim, temos dados completos' },
      { value: 'yes-partial', label: 'Sim, mas parciais' },
      { value: 'no-basic', label: 'Não, apenas métricas básicas' },
      { value: 'no-none', label: 'Não temos dados' }
    ],
    tags: ['data-quality', 'metrics', 'risks'],
    requiredFor: [],
    dataExtractor: (answer) => ({
      currentState: {
        dataQuality: answer
      }
    })
  },

  {
    id: 'risk-003-team-readiness',
    text: 'Como você avalia a prontidão do time para adotar ferramentas de IA?',
    inputType: 'single-choice',
    block: 'risk-scan',
    phase: 'completion',
    options: [
      { value: 'high', label: 'Alta - time é experiente e aberto' },
      { value: 'medium', label: 'Média - alguns membros resistentes' },
      { value: 'low', label: 'Baixa - time precisa de treinamento' },
      { value: 'unknown', label: 'Não sei' }
    ],
    tags: ['team-readiness', 'adoption', 'risks'],
    requiredFor: [],
    dataExtractor: (answer) => ({
      context: {
        teamReadiness: answer
      }
    })
  }
];

// ============================================================================
// QUESTION BANK EXPORT
// ============================================================================

export const AI_READINESS_QUESTION_BANK = {
  discovery: discoveryQuestions,
  expertise: expertiseQuestions,
  deepDive: {
    velocity: deepDiveVelocityQuestions,
    quality: deepDiveQualityQuestions
  },
  riskScan: riskScanQuestions
};

/**
 * Get all questions as flat array
 */
export function getAllQuestions(): EnhancedQuestion[] {
  return [
    ...discoveryQuestions,
    ...expertiseQuestions,
    ...deepDiveVelocityQuestions,
    ...deepDiveQualityQuestions,
    ...riskScanQuestions
  ];
}

/**
 * Get questions by block
 */
export function getQuestionsByBlock(
  block: 'discovery' | 'expertise' | 'deep-dive' | 'risk-scan'
): EnhancedQuestion[] {
  return getAllQuestions().filter(q => q.block === block);
}

/**
 * Get question by ID
 */
export function getQuestionById(id: string): EnhancedQuestion | undefined {
  return getAllQuestions().find(q => q.id === id);
}

/**
 * Get deep-dive questions based on detected area
 */
export function getDeepDiveQuestions(area: 'velocity' | 'quality'): EnhancedQuestion[] {
  return AI_READINESS_QUESTION_BANK.deepDive[area];
}
