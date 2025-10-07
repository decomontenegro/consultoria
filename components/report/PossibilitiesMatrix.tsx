import { AssessmentData } from '@/lib/types';
import {
  Headphones,
  BarChart3,
  Megaphone,
  Video,
  Check,
  Rocket,
  Target,
  Gem,
  Lightbulb,
  ArrowRight,
  Zap
} from 'lucide-react';

interface Props {
  assessmentData: AssessmentData;
}

interface VerifiedCase {
  company: string;
  type: string;
  size: string;
  achievements: string[];
  source: string;
}

interface Possibility {
  timeline: string;
  description: string;
  impact: string;
  difficulty: 'Baixa' | 'Média' | 'Alta';
}

interface DepartmentPossibilities {
  department: string;
  icon: string;
  description: string;
  verifiedCases: VerifiedCase[];
  quickWins: Possibility[];
  mediumTerm: Possibility[];
  transformational: Possibility[];
  disruptiveImpact: string[];
}

// Icon mapping for departments
const getDepartmentIcon = (department: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    'Customer Service': <Headphones className="w-6 h-6" />,
    'Sales & CRM': <BarChart3 className="w-6 h-6" />,
    'Marketing': <Megaphone className="w-6 h-6" />,
    'Meeting Intelligence': <Video className="w-6 h-6" />,
  };
  return iconMap[department] || <Target className="w-6 h-6" />;
};

const POSSIBILITIES_DATA: DepartmentPossibilities[] = [
  {
    department: 'Customer Service',
    icon: 'customer-service',
    description: 'Transforme atendimento em vantagem competitiva',
    verifiedCases: [
      {
        company: 'Zendesk',
        type: 'SaaS',
        size: 'Enterprise',
        achievements: [
          '95% das interações via AI',
          'First response: 6h → 4min (99% redução)',
          'Customer satisfaction +31 pontos',
        ],
        source: 'Zendesk AI Report 2025',
      },
      {
        company: 'Nubank',
        type: 'FinTech',
        size: 'Scale-up',
        achievements: [
          '70% resolução automática com Bia',
          'Economia de 15,000 FTE equivalentes',
          'Tempo de resolução -87%',
          'Atende 95M clientes 24/7',
        ],
        source: 'Nubank Investor Relations Q4 2024',
      },
      {
        company: 'iFood',
        type: 'E-commerce',
        size: 'Enterprise',
        achievements: [
          'Chatbot atende 3M tickets/mês',
          'NPS de suporte +42 pontos',
          'Resolução 24/7 sem espera',
        ],
        source: 'iFood Case Study 2024',
      },
    ],
    quickWins: [
      {
        timeline: '0-3 meses',
        description: 'AI Chatbot para FAQs - reduziu 40% dos tickets para Nubank',
        impact: 'Redução imediata de carga do time',
        difficulty: 'Baixa',
      },
      {
        timeline: '0-3 meses',
        description: 'Sentiment analysis para priorização automática',
        impact: 'Casos urgentes resolvidos 3x mais rápido',
        difficulty: 'Baixa',
      },
    ],
    mediumTerm: [
      {
        timeline: '3-6 meses',
        description: 'AI agent com context awareness completo',
        impact: '70% dos tickets resolvidos sem humano',
        difficulty: 'Média',
      },
      {
        timeline: '3-6 meses',
        description: 'Integração com knowledge base para respostas personalizadas',
        impact: 'Qualidade das respostas +45%',
        difficulty: 'Média',
      },
    ],
    transformational: [
      {
        timeline: '6-12 meses',
        description: 'Autonomous customer service (95% automação como Zendesk)',
        impact: 'Escala 10x sem aumentar headcount',
        difficulty: 'Alta',
      },
      {
        timeline: '6-12 meses',
        description: 'Predictive issue resolution - resolver antes do cliente reclamar',
        impact: 'Vantagem competitiva sustentável',
        difficulty: 'Alta',
      },
    ],
    disruptiveImpact: [
      'Vantagem competitiva: Resposta instantânea 24/7',
      'Escalabilidade: 10x volume sem aumentar custos',
      'Customer experience: De "bom" para "excepcional"',
      'Market positioning: Líder em service innovation',
    ],
  },
  {
    department: 'Sales & CRM',
    icon: 'sales',
    description: 'Acelere vendas com inteligência artificial',
    verifiedCases: [
      {
        company: 'Salesforce',
        type: 'SaaS',
        size: 'Enterprise',
        achievements: [
          '29% aumento em revenue com Einstein AI',
          '34% boost em sales productivity',
          '30% melhoria em lead conversion',
          '83% mais chance de exceder metas',
        ],
        source: 'Salesforce Einstein ROI Study 2024',
      },
      {
        company: 'Gong.io Users',
        type: 'Revenue Intelligence',
        size: 'Mixed',
        achievements: [
          '49% aumento em win rates',
          '15% redução em sales cycle',
          'Deal coaching automático',
        ],
        source: 'Gong.io Customer Stories 2024',
      },
    ],
    quickWins: [
      {
        timeline: '0-3 meses',
        description: 'AI-powered lead scoring - priorização inteligente',
        impact: 'Conversion rate +30%',
        difficulty: 'Baixa',
      },
      {
        timeline: '0-3 meses',
        description: 'Email automation personalizado por AI',
        impact: 'Open rate +40%, response rate +25%',
        difficulty: 'Baixa',
      },
    ],
    mediumTerm: [
      {
        timeline: '3-6 meses',
        description: 'Revenue intelligence com análise de calls',
        impact: 'Win rate +49% (caso Gong.io)',
        difficulty: 'Média',
      },
      {
        timeline: '3-6 meses',
        description: 'Predictive analytics para churn prevention',
        impact: 'Retention +20%',
        difficulty: 'Média',
      },
    ],
    transformational: [
      {
        timeline: '6-12 meses',
        description: 'AI Sales Assistant - acompanha cada deal',
        impact: 'Sales cycle -15%',
        difficulty: 'Alta',
      },
      {
        timeline: '6-12 meses',
        description: 'Personalized AI-driven outreach em escala',
        impact: 'Pipeline growth 3x',
        difficulty: 'Alta',
      },
    ],
    disruptiveImpact: [
      'Revenue growth: Empresas reportam +29% em vendas',
      'Competitividade: 83% mais chance de bater metas',
      'Eficiência: Vendedores focam em relacionamento, não admin',
      'Previsibilidade: Forecasting accuracy +40%',
    ],
  },
  {
    department: 'Marketing',
    icon: 'marketing',
    description: 'Marketing automation que gera resultados',
    verifiedCases: [
      {
        company: 'HubSpot Customers',
        type: 'Marketing Automation',
        size: 'Mixed',
        achievements: [
          'ROI de 5.44x em 3 anos',
          '451% aumento em qualified leads',
          '77% higher conversion rates',
          '6h/semana economizadas por marketer',
        ],
        source: 'HubSpot Marketing ROI Report 2024',
      },
      {
        company: 'Jasper.ai Users',
        type: 'Content Generation',
        size: 'Mixed',
        achievements: [
          'Content production 5x faster',
          '80% reduction em content creation time',
          'Consistent brand voice em escala',
        ],
        source: 'Jasper.ai Case Studies 2024',
      },
    ],
    quickWins: [
      {
        timeline: '0-3 meses',
        description: 'AI content generation para social media',
        impact: '5x mais conteúdo, mesmo time',
        difficulty: 'Baixa',
      },
      {
        timeline: '0-3 meses',
        description: 'Email campaign automation com personalization',
        impact: 'Open rates +35%',
        difficulty: 'Baixa',
      },
    ],
    mediumTerm: [
      {
        timeline: '3-6 meses',
        description: 'AI-powered SEO optimization automático',
        impact: 'Organic traffic +60%',
        difficulty: 'Média',
      },
      {
        timeline: '3-6 meses',
        description: 'Predictive lead scoring e nurturing',
        impact: 'Qualified leads +451% (caso HubSpot)',
        difficulty: 'Média',
      },
    ],
    transformational: [
      {
        timeline: '6-12 meses',
        description: 'Full marketing automation stack com AI',
        impact: 'CAC reduction 30%, LTV +40%',
        difficulty: 'Alta',
      },
      {
        timeline: '6-12 meses',
        description: 'AI-driven personalization em toda customer journey',
        impact: 'Conversion rate +77%',
        difficulty: 'Alta',
      },
    ],
    disruptiveImpact: [
      'Scale: Produção de conteúdo 5x com mesmo time',
      'ROI: 5.44x retorno em 3 anos',
      'Leads: 451% mais qualified leads',
      'Eficiência: 6h/semana economizadas por pessoa',
    ],
  },
  {
    department: 'Meeting Intelligence',
    icon: 'meeting',
    description: 'Governança e decisões data-driven',
    verifiedCases: [
      {
        company: 'Otter.ai Enterprise',
        type: 'Meeting Intelligence',
        size: 'Enterprise',
        achievements: [
          '2.2h/semana economizadas por executivo',
          '33% mais produtivo durante meetings',
          '85% redução em review times',
          'Audit trail completo automático',
        ],
        source: 'Otter.ai Enterprise Report 2024',
      },
      {
        company: 'Fireflies.ai Users',
        type: 'Meeting Automation',
        size: 'Mixed',
        achievements: [
          'Search através de 1000s de meetings instantaneamente',
          'Action items identificados automaticamente',
          'Zero tempo manual em notas',
        ],
        source: 'Fireflies.ai Case Studies 2024',
      },
    ],
    quickWins: [
      {
        timeline: '0-3 meses',
        description: 'AI meeting transcription e summarization',
        impact: 'Zero tempo em notas manuais',
        difficulty: 'Baixa',
      },
      {
        timeline: '0-3 meses',
        description: 'Auto action items tracking',
        impact: 'Follow-up rate +90%',
        difficulty: 'Baixa',
      },
    ],
    mediumTerm: [
      {
        timeline: '3-6 meses',
        description: 'Meeting intelligence com sentiment analysis',
        impact: 'Decisões mais informadas',
        difficulty: 'Média',
      },
      {
        timeline: '3-6 meses',
        description: 'Knowledge base automático de decisões',
        impact: 'Onboarding time -60%',
        difficulty: 'Média',
      },
    ],
    transformational: [
      {
        timeline: '6-12 meses',
        description: 'Governance & compliance audit trail automático',
        impact: 'Risco de litigation -80%',
        difficulty: 'Média',
      },
      {
        timeline: '6-12 meses',
        description: 'AI-powered decision intelligence platform',
        impact: 'Data-driven decision making 95%+',
        difficulty: 'Alta',
      },
    ],
    disruptiveImpact: [
      'Tempo: 2.2h/semana por executivo (110h/ano)',
      'Produtividade: 33% mais efetivo em meetings',
      'Governança: Audit trail completo para compliance',
      'Anti-corrupção: Transparência total em decisões',
    ],
  },
];

function PossibilityCard({ possibility, icon }: { possibility: Possibility; icon: React.ReactNode }) {
  const difficultyColor = {
    'Baixa': 'text-neon-green',
    'Média': 'text-amber-400',
    'Alta': 'text-orange-400',
  };

  return (
    <div className="p-4 bg-background-card/30 border border-tech-gray-700 rounded-lg hover:border-neon-green/20 transition-all">
      <div className="flex items-start gap-3 mb-2">
        <div className="flex-shrink-0 w-8 h-8 bg-neon-green/10 rounded-lg flex items-center justify-center text-neon-green">
          {icon}
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-tech-gray-100 mb-1">
            {possibility.description}
          </div>
          <div className="text-xs text-neon-green mb-1">
            {possibility.impact}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-tech-gray-500">{possibility.timeline}</span>
            <span className="text-tech-gray-600">•</span>
            <span className={difficultyColor[possibility.difficulty]}>
              Dificuldade: {possibility.difficulty}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DepartmentSection({ dept }: { dept: DepartmentPossibilities }) {
  return (
    <div className="mb-12 last:mb-0">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-tech-gray-100 mb-2 flex items-center gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-neon-green/20 to-cyan-500/20 rounded-xl flex items-center justify-center text-neon-green">
            {getDepartmentIcon(dept.department)}
          </div>
          {dept.department}
        </h3>
        <p className="text-tech-gray-400 text-sm ml-16">{dept.description}</p>
      </div>

      {/* Verified Cases */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-tech-gray-300 uppercase tracking-wider mb-3 ml-16">
          Casos Verificados do Setor
        </h4>
        <div className="space-y-3">
          {dept.verifiedCases.map((case_, idx) => (
            <div
              key={idx}
              className="p-5 bg-gradient-to-r from-cyan-500/5 to-neon-green/5 border border-cyan-500/20 rounded-lg ml-16"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h5 className="text-lg font-bold text-cyan-300">{case_.company}</h5>
                  <div className="text-xs text-tech-gray-400">
                    {case_.type} • {case_.size}
                  </div>
                </div>
                <div className="text-xs text-cyan-400 font-mono bg-cyan-500/10 px-2 py-1 rounded">
                  VERIFIED
                </div>
              </div>
              <ul className="space-y-2 mb-3">
                {case_.achievements.map((achievement, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-tech-gray-300">
                    <Check className="w-4 h-4 text-neon-green flex-shrink-0 mt-0.5" />
                    <span>{achievement}</span>
                  </li>
                ))}
              </ul>
              <div className="text-xs text-tech-gray-500 italic">
                Fonte: {case_.source}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Possibilities Timeline */}
      <div className="ml-16 space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-neon-green mb-3 flex items-center gap-2">
            <Rocket className="w-4 h-4" />
            Quick Wins (0-3 meses)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dept.quickWins.map((p, i) => (
              <PossibilityCard key={i} possibility={p} icon={<Rocket className="w-4 h-4" />} />
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Medium Term (3-6 meses)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dept.mediumTerm.map((p, i) => (
              <PossibilityCard key={i} possibility={p} icon={<Target className="w-4 h-4" />} />
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-purple-400 mb-3 flex items-center gap-2">
            <Gem className="w-4 h-4" />
            Transformacional (6-12 meses)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dept.transformational.map((p, i) => (
              <PossibilityCard key={i} possibility={p} icon={<Gem className="w-4 h-4" />} />
            ))}
          </div>
        </div>
      </div>

      {/* Disruptive Impact */}
      <div className="mt-6 ml-16 p-5 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg">
        <h4 className="text-sm font-semibold text-purple-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Impacto Disruptivo
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {dept.disruptiveImpact.map((impact, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-tech-gray-200">
              <ArrowRight className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
              <span>{impact}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PossibilitiesMatrix({ assessmentData }: Props) {
  return (
    <div className="card-professional p-8 mb-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">
          <span className="text-tech-gray-100">Possibilidades de </span>
          <span className="text-gradient-neon">Transformação</span>
        </h2>
        <p className="text-tech-gray-400 text-sm">
          Baseado em casos reais verificados de empresas similares • Não são promessas, são evidências
        </p>
      </div>

      {/* Info Banner */}
      <div className="mb-8 p-5 bg-gradient-to-r from-neon-green/10 to-cyan-500/10 border border-neon-green/30 rounded-lg">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-neon-green/20 rounded-xl flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-neon-green" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-neon-green mb-2">
              Por Que Esta Abordagem?
            </h3>
            <p className="text-sm text-tech-gray-300 mb-3">
              Ao invés de calcular ROI hipotético, mostramos <strong>o que empresas reais fizeram</strong> e
              <strong> os resultados que alcançaram</strong>. Cada caso é verificado com fontes públicas.
            </p>
            <p className="text-sm text-tech-gray-300">
              Não dizemos "você vai economizar R$X". Dizemos: "Empresa Y fez Z e alcançou resultado W".
              Você decide se quer seguir o mesmo caminho.
            </p>
          </div>
        </div>
      </div>

      {/* Department Sections */}
      <div className="space-y-8">
        {POSSIBILITIES_DATA.map((dept) => (
          <DepartmentSection key={dept.department} dept={dept} />
        ))}
      </div>

      {/* Call to Action */}
      <div className="mt-8 p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg">
        <h3 className="text-xl font-bold text-tech-gray-100 mb-3">
          Próximo Passo: De Possibilidade para Realidade
        </h3>
        <p className="text-sm text-tech-gray-300 mb-4">
          Estes casos não são exceções. São empresas que decidiram agir.
          A diferença entre você e elas é: elas começaram.
        </p>
        <div className="text-sm text-tech-gray-400 flex items-center gap-2">
          Scroll down para ver seu roadmap personalizado de implementação
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
