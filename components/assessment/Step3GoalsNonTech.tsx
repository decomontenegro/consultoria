import { NonTechGoals } from "@/lib/types";
import { ArrowLeft, ArrowRight, ClipboardList, BarChart2, Target, Rocket } from "lucide-react";

interface Props {
  data: Partial<NonTechGoals>;
  onUpdate: (data: Partial<NonTechGoals>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step3GoalsNonTech({ data, onUpdate, onNext, onBack }: Props) {
  const handleChange = (field: keyof NonTechGoals, value: any) => {
    onUpdate({ ...data, [field]: value });
  };

  const toggleGoal = (goal: string) => {
    const current = data.businessGoals || [];
    if (current.includes(goal)) {
      onUpdate({
        ...data,
        businessGoals: current.filter((g) => g !== goal),
      });
    } else {
      onUpdate({
        ...data,
        businessGoals: [...current, goal],
      });
    }
  };

  const toggleMetric = (metric: string) => {
    const current = data.businessMetrics || [];
    if (current.includes(metric)) {
      onUpdate({
        ...data,
        businessMetrics: current.filter((m) => m !== metric),
      });
    } else {
      onUpdate({
        ...data,
        businessMetrics: [...current, metric],
      });
    }
  };

  const isValid = () => {
    return (
      data.businessGoals &&
      data.businessGoals.length > 0 &&
      data.timeline &&
      data.budgetRange &&
      data.businessMetrics &&
      data.businessMetrics.length > 0 &&
      data.strategicPriority
    );
  };

  const goalOptions = [
    "Crescimento de receita",
    "Vantagem competitiva sustentável",
    "Eficiência operacional",
    "Melhor experiência do cliente",
    "Redução de custos operacionais",
    "Expansão para novos mercados",
    "Inovação em produtos/serviços",
    "Transformação digital",
    "Atração e retenção de talentos",
    "Mitigação de riscos competitivos",
  ];

  const metricOptions = [
    "Aumento de receita anual",
    "Market share",
    "Satisfação do cliente (NPS/CSAT)",
    "Redução de custos operacionais",
    "Tempo de lançamento de produtos",
    "Taxa de retenção de clientes",
    "Produtividade geral da empresa",
    "Retorno sobre investimento (ROI)",
    "Margem de lucro",
    "Valor de marca e reputação",
    "Taxa de inovação",
    "Employee satisfaction",
  ];

  return (
    <div className="card-professional p-8">
      <h2 className="text-3xl font-bold text-tech-gray-100 mb-2 font-display">
        <span className="text-gradient-neon">03.</span> Objetivos Estratégicos
      </h2>
      <p className="text-tech-gray-400 mb-8">
        Defina os resultados de negócio que você espera alcançar com a transformação em IA.
      </p>

      <div className="space-y-8">
        {/* Business Goals */}
        <div>
          <label className="block text-sm font-medium text-tech-gray-300 mb-3">
            Objetivos de Negócio * (Selecione 2-4)
          </label>
          <p className="text-xs text-tech-gray-500 mb-3">
            Quais são os principais objetivos estratégicos que motivam o investimento em IA?
          </p>
          <div className="grid grid-cols-2 gap-3">
            {goalOptions.map((goal) => (
              <button
                key={goal}
                onClick={() => toggleGoal(goal)}
                className={`p-3 border-2 rounded-lg text-sm text-left transition-all ${
                  data.businessGoals?.includes(goal)
                    ? 'border-neon-green bg-neon-green/10 shadow-neon-green text-tech-gray-100'
                    : 'border-tech-gray-700 bg-background-card hover:border-neon-green/50 hover:bg-neon-green/5 text-tech-gray-300'
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
          {data.businessGoals && data.businessGoals.length > 0 && (
            <p className="mt-2 text-sm text-tech-gray-500">
              {data.businessGoals.length} objetivo(s) selecionado(s)
            </p>
          )}
        </div>

        {/* Timeline */}
        <div>
          <label className="block text-sm font-medium text-tech-gray-300 mb-3">
            Horizonte de Resultados *
          </label>
          <p className="text-xs text-tech-gray-500 mb-3">
            Em quanto tempo você espera ver resultados significativos no negócio?
          </p>
          <div className="grid grid-cols-4 gap-3">
            {[
              { value: "3-months", label: "3 Meses", desc: "Quick wins" },
              { value: "6-months", label: "6 Meses", desc: "Piloto" },
              {
                value: "12-months",
                label: "12 Meses",
                desc: "Implementação",
              },
              {
                value: "18-months",
                label: "18+ Meses",
                desc: "Transformação",
              },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() =>
                  handleChange("timeline", option.value as NonTechGoals["timeline"])
                }
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  data.timeline === option.value
                    ? 'border-neon-green bg-neon-green/10 shadow-neon-green'
                    : 'border-tech-gray-700 bg-background-card hover:border-neon-green/50 hover:bg-neon-green/5'
                }`}
              >
                <div className="font-semibold text-tech-gray-100">
                  {option.label}
                </div>
                <div className="text-xs text-tech-gray-500 mt-1">{option.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Budget Range */}
        <div>
          <label className="block text-sm font-medium text-tech-gray-300 mb-2">
            Investimento Anual Previsto (BRL) *
          </label>
          <p className="text-xs text-tech-gray-500 mb-3">
            Quanto sua empresa está preparada para investir em IA e transformação digital?
          </p>
          <select
            value={data.budgetRange || ""}
            onChange={(e) => handleChange("budgetRange", e.target.value)}
            className="select-dark"
          >
            <option value="">Selecione a faixa de investimento...</option>
            <option value="0-50K">R$0 - R$50K (Exploração inicial)</option>
            <option value="50K-200K">R$50K - R$200K (Piloto departamental)</option>
            <option value="200K-500K">R$200K - R$500K (Múltiplos departamentos)</option>
            <option value="500K-1M">R$500K - R$1M (Toda organização)</option>
            <option value="1M+">R$1M+ (Iniciativa estratégica)</option>
          </select>
        </div>

        {/* Strategic Priority */}
        <div>
          <label className="block text-sm font-medium text-tech-gray-300 mb-3">
            Prioridade Estratégica *
          </label>
          <p className="text-xs text-tech-gray-500 mb-3">
            Qual o nível de prioridade desta iniciativa para a liderança da empresa?
          </p>
          <div className="grid grid-cols-4 gap-3">
            {[
              {
                value: 'low',
                label: 'Baixa',
                desc: 'Exploratório',
                icon: <ClipboardList className="w-7 h-7" />
              },
              {
                value: 'medium',
                label: 'Média',
                desc: 'Importante',
                icon: <BarChart2 className="w-7 h-7" />
              },
              {
                value: 'high',
                label: 'Alta',
                desc: 'Prioritário',
                icon: <Target className="w-7 h-7" />
              },
              {
                value: 'critical',
                label: 'Crítica',
                desc: 'Estratégico',
                icon: <Rocket className="w-7 h-7" />
              },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() =>
                  handleChange('strategicPriority', option.value as NonTechGoals['strategicPriority'])
                }
                className={`p-4 border-2 rounded-xl text-center transition-all ${
                  data.strategicPriority === option.value
                    ? 'border-neon-green bg-neon-green/10 shadow-neon-green'
                    : 'border-tech-gray-700 bg-background-card hover:border-neon-green/50 hover:bg-neon-green/5'
                }`}
              >
                <div className="flex justify-center mb-2 text-neon-green">{option.icon}</div>
                <div className="font-semibold text-tech-gray-100 text-sm">
                  {option.label}
                </div>
                <div className="text-xs text-tech-gray-500 mt-1">{option.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Business Metrics */}
        <div>
          <label className="block text-sm font-medium text-tech-gray-300 mb-3">
            Métricas de Sucesso * (Selecione 3-5)
          </label>
          <p className="text-xs text-tech-gray-500 mb-3">
            Como você vai medir o sucesso desta iniciativa?
          </p>
          <div className="grid grid-cols-2 gap-3">
            {metricOptions.map((metric) => (
              <button
                key={metric}
                onClick={() => toggleMetric(metric)}
                className={`p-3 border-2 rounded-lg text-sm text-left transition-all ${
                  data.businessMetrics?.includes(metric)
                    ? 'border-neon-green bg-neon-green/10 shadow-neon-green text-tech-gray-100'
                    : 'border-tech-gray-700 bg-background-card hover:border-neon-green/50 hover:bg-neon-green/5 text-tech-gray-300'
                }`}
              >
                {metric}
              </button>
            ))}
          </div>
          {data.businessMetrics && data.businessMetrics.length > 0 && (
            <p className="mt-2 text-sm text-tech-gray-500">
              {data.businessMetrics.length} métrica(s) selecionada(s)
            </p>
          )}
        </div>
      </div>

      {/* Information Box */}
      <div className="mt-8 p-4 bg-neon-green/5 border border-neon-green/20 rounded-lg">
        <h4 className="text-sm font-semibold text-neon-green mb-2">
          💡 Sobre as Métricas
        </h4>
        <p className="text-sm text-tech-gray-300">
          Essas métricas de negócio serão traduzidas em indicadores técnicos no seu relatório,
          mostrando exatamente como a IA pode impactar cada objetivo selecionado.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t border-tech-gray-800">
        <button onClick={onBack} className="btn-secondary">
          <span className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </span>
        </button>
        <button
          onClick={onNext}
          disabled={!isValid()}
          className={`btn-primary ${
            !isValid() && "opacity-50 cursor-not-allowed"
          }`}
        >
          <span className="flex items-center gap-2">
            Continuar para Revisão
            <ArrowRight className="w-4 h-4" />
          </span>
        </button>
      </div>
    </div>
  );
}
