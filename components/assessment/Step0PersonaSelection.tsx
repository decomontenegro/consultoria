import { UserPersona } from "@/lib/types";
import { Target, Briefcase, BarChart3, Code2, Wrench, Lightbulb, ArrowRight, CheckCircle } from "lucide-react";

interface Props {
  selected: UserPersona | null;
  onUpdate: (persona: UserPersona) => void;
  onNext: () => void;
}

export default function Step0PersonaSelection({ selected, onUpdate, onNext }: Props) {
  const personas = [
    {
      value: 'board-executive' as UserPersona,
      icon: <Target className="w-8 h-8" />,
      label: 'Board Member / C-Level Executive',
      description: 'Foco estratégico: crescimento, competitividade, retorno sobre investimento',
      audience: 'Ideal para CEOs, CFOs, membros do conselho'
    },
    {
      value: 'finance-ops' as UserPersona,
      icon: <Briefcase className="w-8 h-8" />,
      label: 'Finance / Operations Executive',
      description: 'Foco em eficiência: custos, produtividade, otimização operacional',
      audience: 'Ideal para CFOs, COOs, diretores de operações'
    },
    {
      value: 'product-business' as UserPersona,
      icon: <BarChart3 className="w-8 h-8" />,
      label: 'Product / Business Leader',
      description: 'Foco em mercado: time-to-market, inovação, experiência do cliente',
      audience: 'Ideal para CPOs, gerentes de produto, líderes de negócio'
    },
    {
      value: 'engineering-tech' as UserPersona,
      icon: <Code2 className="w-8 h-8" />,
      label: 'Engineering / Tech Leader',
      description: 'Foco técnico: arquitetura, qualidade de código, práticas de desenvolvimento',
      audience: 'Ideal para CTOs, VPs de Engenharia, Arquitetos'
    },
    {
      value: 'it-devops' as UserPersona,
      icon: <Wrench className="w-8 h-8" />,
      label: 'IT / DevOps Manager',
      description: 'Foco operacional: infraestrutura, deploy, confiabilidade, automação',
      audience: 'Ideal para gerentes de TI, líderes de DevOps/SRE'
    }
  ];

  return (
    <div className="card-professional p-8">
      <h2 className="text-3xl font-bold text-tech-gray-100 mb-2 font-display">
        <span className="text-gradient-neon">00.</span> Sobre Você
      </h2>
      <p className="text-tech-gray-400 mb-8">
        Selecione sua função para personalizar as perguntas do assessment de acordo com sua perspectiva.
      </p>

      <div className="space-y-4">
        {personas.map((persona) => (
          <button
            key={persona.value}
            onClick={() => onUpdate(persona.value)}
            className={`w-full p-6 border-2 rounded-xl text-left transition-all duration-300 ${
              selected === persona.value
                ? 'border-neon-green bg-neon-green/10 shadow-neon-green'
                : 'border-tech-gray-700 bg-background-card hover:border-neon-green/50 hover:bg-neon-green/5'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-14 h-14 bg-neon-green/10 rounded-xl flex items-center justify-center text-neon-green">
                {persona.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-tech-gray-100 mb-1">
                  {persona.label}
                </h3>
                <p className="text-sm text-tech-gray-400 mb-2">
                  {persona.description}
                </p>
                <p className="text-xs text-tech-gray-500 italic">
                  {persona.audience}
                </p>
              </div>
              {selected === persona.value && (
                <div className="flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-neon-green fill-current" />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Information Box */}
      <div className="mt-8 p-4 bg-neon-green/5 border border-neon-green/20 rounded-lg">
        <h4 className="text-sm font-semibold text-neon-green mb-2 flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          Por que isso é importante?
        </h4>
        <p className="text-sm text-tech-gray-300">
          Personas técnicas verão perguntas sobre métricas de engenharia (deploy frequency, cycle time, etc.).
          Personas de negócio verão perguntas sobre resultados empresariais (competitividade, time-to-market, etc.).
          Ambas produzem o mesmo relatório detalhado com análise de ROI e recomendações.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-end mt-8 pt-6 border-t border-tech-gray-800">
        <button
          onClick={onNext}
          disabled={!selected}
          className={`btn-primary ${
            !selected && "opacity-50 cursor-not-allowed"
          }`}
        >
          <span className="flex items-center gap-2">
            Continuar para Informações da Empresa
            <ArrowRight className="w-4 h-4" />
          </span>
        </button>
      </div>

      {/* Progress indicator */}
      <p className="text-center text-sm text-tech-gray-500 mt-4">
        Este assessment leva aproximadamente 5-7 minutos para completar
      </p>
    </div>
  );
}
