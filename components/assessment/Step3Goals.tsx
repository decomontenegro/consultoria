import { Goals } from "@/lib/types";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface Props {
  data: Partial<Goals>;
  onUpdate: (data: Partial<Goals>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step3Goals({ data, onUpdate, onNext, onBack }: Props) {
  const handleChange = (field: keyof Goals, value: any) => {
    onUpdate({ ...data, [field]: value });
  };

  const toggleGoal = (goal: string) => {
    const current = data.primaryGoals || [];
    if (current.includes(goal)) {
      onUpdate({
        ...data,
        primaryGoals: current.filter((g) => g !== goal),
      });
    } else {
      onUpdate({
        ...data,
        primaryGoals: [...current, goal],
      });
    }
  };

  const toggleMetric = (metric: string) => {
    const current = data.successMetrics || [];
    if (current.includes(metric)) {
      onUpdate({
        ...data,
        successMetrics: current.filter((m) => m !== metric),
      });
    } else {
      onUpdate({
        ...data,
        successMetrics: [...current, metric],
      });
    }
  };

  const isValid = () => {
    return (
      data.primaryGoals &&
      data.primaryGoals.length > 0 &&
      data.timeline &&
      data.budgetRange &&
      data.successMetrics &&
      data.successMetrics.length > 0
    );
  };

  const goalOptions = [
    "Aumentar produtividade dev",
    "Acelerar time-to-market",
    "Melhorar qualidade de código",
    "Reduzir débito técnico",
    "Atrair e reter talentos",
    "Escalar org de engenharia",
    "Modernizar práticas dev",
    "Habilitar inovação de produto",
  ];

  const metricOptions = [
    "Velocidade dev (story points/sprint)",
    "Frequência de deployment",
    "Lead time para mudanças",
    "Mean time to recovery (MTTR)",
    "Change failure rate",
    "Tempo de ciclo de code review",
    "Satisfação do dev (NPS)",
    "Taxa de entrega de features",
    "Taxa de escape de bugs",
    "Tempo em inovação vs. manutenção",
  ];

  return (
    <div className="card-professional p-8">
      <h2 className="text-3xl font-bold text-tech-gray-100 mb-2 font-display">
        <span className="text-gradient-neon">03.</span> Objetivos & Metas
      </h2>
      <p className="text-tech-gray-400 mb-8">
        Defina como é o sucesso para sua iniciativa de transformação AI.
      </p>

      <div className="space-y-8">
        {/* Primary Goals */}
        <div>
          <label className="block text-sm font-medium text-tech-gray-300 mb-3">
            Objetivos Primários de Transformação * (Selecione 2-4)
          </label>
          <div className="grid grid-cols-2 gap-3">
            {goalOptions.map((goal) => (
              <button
                key={goal}
                onClick={() => toggleGoal(goal)}
                className={`p-3 border-2 rounded-lg text-sm text-left transition-all ${
                  data.primaryGoals?.includes(goal)
                    ? "border-neon-green bg-neon-green/10 shadow-neon-green text-tech-gray-100"
                    : "border-tech-gray-700 bg-background-card hover:border-neon-green/50 hover:bg-neon-green/5 text-tech-gray-300"
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
          {data.primaryGoals && data.primaryGoals.length > 0 && (
            <p className="mt-2 text-sm text-tech-gray-500">
              {data.primaryGoals.length} objetivo(s) selecionado(s)
            </p>
          )}
        </div>

        {/* Timeline */}
        <div>
          <label className="block text-sm font-medium text-tech-gray-300 mb-3">
            Timeline de Implementação *
          </label>
          <div className="grid grid-cols-4 gap-3">
            {[
              { value: "3-months", label: "3 Meses", desc: "Quick wins" },
              { value: "6-months", label: "6 Meses", desc: "Fase piloto" },
              {
                value: "12-months",
                label: "12 Meses",
                desc: "Rollout completo",
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
                  handleChange("timeline", option.value as Goals["timeline"])
                }
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  data.timeline === option.value
                    ? "border-neon-green bg-neon-green/10 shadow-neon-green"
                    : "border-tech-gray-700 bg-background-card hover:border-neon-green/50 hover:bg-neon-green/5"
                }`}
              >
                <div className="font-semibold text-tech-gray-100">
                  {option.label}
                </div>
                <div className="text-xs text-tech-gray-500 mt-1">{option.desc}</div>
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-tech-gray-500">
            Quando você espera ver resultados significativos?
          </p>
        </div>

        {/* Budget Range */}
        <div>
          <label className="block text-sm font-medium text-tech-gray-300 mb-2">
            Faixa de Orçamento Anual (BRL) *
          </label>
          <select
            value={data.budgetRange || ""}
            onChange={(e) => handleChange("budgetRange", e.target.value)}
            className="select-dark"
          >
            <option value="">Selecione a faixa de orçamento...</option>
            <option value="0-50K">R$0 - R$50K (Explorando)</option>
            <option value="50K-200K">R$50K - R$200K (Piloto)</option>
            <option value="200K-500K">R$200K - R$500K (Departamento)</option>
            <option value="500K-1M">R$500K - R$1M (Org-wide)</option>
            <option value="1M+">R$1M+ (Iniciativa Estratégica)</option>
          </select>
          <p className="mt-1 text-sm text-tech-gray-500">
            Para treinamento, ferramentas e suporte de implementação
          </p>
        </div>

        {/* Success Metrics */}
        <div>
          <label className="block text-sm font-medium text-tech-gray-300 mb-3">
            Métricas de Sucesso * (Selecione 3-5)
          </label>
          <div className="grid grid-cols-2 gap-3">
            {metricOptions.map((metric) => (
              <button
                key={metric}
                onClick={() => toggleMetric(metric)}
                className={`p-3 border-2 rounded-lg text-sm text-left transition-all ${
                  data.successMetrics?.includes(metric)
                    ? "border-neon-green bg-neon-green/10 shadow-neon-green text-tech-gray-100"
                    : "border-tech-gray-700 bg-background-card hover:border-neon-green/50 hover:bg-neon-green/5 text-tech-gray-300"
                }`}
              >
                {metric}
              </button>
            ))}
          </div>
          {data.successMetrics && data.successMetrics.length > 0 && (
            <p className="mt-2 text-sm text-tech-gray-500">
              {data.successMetrics.length} métrica(s) selecionada(s)
            </p>
          )}
        </div>

        {/* Competitive Threats (Optional) */}
        <div>
          <label className="block text-sm font-medium text-tech-gray-300 mb-2">
            Pressão Competitiva (Opcional)
          </label>
          <textarea
            value={data.competitiveThreats || ""}
            onChange={(e) => handleChange("competitiveThreats", e.target.value)}
            placeholder="Seus concorrentes estão se movendo mais rápido? Está perdendo talentos para empresas AI-forward? Descreva qualquer dinâmica competitiva que impulsiona esta iniciativa..."
            rows={3}
            className="textarea-dark"
          />
          <p className="mt-1 text-sm text-tech-gray-500">
            Isso nos ajuda a quantificar urgência e custo de oportunidade
          </p>
        </div>
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
