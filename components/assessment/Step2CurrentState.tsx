import { CurrentState } from "@/lib/types";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { AISuggestedResponsesAnimated } from "./AISuggestedResponses";
import { ResponseSuggestion } from "@/lib/ai/response-suggestions";

interface Props {
  data: Partial<CurrentState>;
  onUpdate: (data: Partial<CurrentState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step2CurrentState({
  data,
  onUpdate,
  onNext,
  onBack,
}: Props) {
  // AI Suggestions State
  const [painPointSuggestions, setPainPointSuggestions] = useState<ResponseSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Fetch AI suggestions on component mount
  useEffect(() => {
    const fetchSuggestions = async () => {
      setIsLoadingSuggestions(true);

      try {
        // Build context from existing data
        const context = [];
        if (data.devTeamSize) {
          context.push(`Team size: ${data.devTeamSize} developers`);
        }
        if (data.deploymentFrequency) {
          context.push(`Deployment frequency: ${data.deploymentFrequency}`);
        }
        if (data.avgCycleTime) {
          context.push(`Average cycle time: ${data.avgCycleTime} days`);
        }
        if (data.aiToolsUsage) {
          context.push(`AI tools adoption: ${data.aiToolsUsage}`);
        }

        const response = await fetch('/api/ai-suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: 'Quais são os principais pain points ou desafios que seu time de desenvolvimento enfrenta no dia a dia?',
            context: context.join(', '),
            previousAnswers: context,
            specialistType: 'engineering'
          }),
        });

        if (response.ok) {
          const result = await response.json();
          setPainPointSuggestions(result.suggestions || []);
        }
      } catch (error) {
        console.error('Failed to fetch AI suggestions:', error);
        // Fail silently - form still works without suggestions
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    // Only fetch suggestions once when component mounts
    if (painPointSuggestions.length === 0 && !isLoadingSuggestions) {
      fetchSuggestions();
    }
  }, []); // Empty dependency array - only run once on mount

  const handleChange = (field: keyof CurrentState, value: any) => {
    onUpdate({ ...data, [field]: value });
  };

  const handleSeniorityChange = (level: string, value: number) => {
    onUpdate({
      ...data,
      devSeniority: {
        junior: 0,
        mid: 0,
        senior: 0,
        lead: 0,
        ...data.devSeniority, // Spread existing values AFTER defaults
        [level]: value,
      } as CurrentState["devSeniority"],
    });
  };

  const togglePainPoint = (point: string) => {
    const current = data.painPoints || [];
    if (current.includes(point)) {
      onUpdate({
        ...data,
        painPoints: current.filter((p) => p !== point),
      });
    } else {
      onUpdate({
        ...data,
        painPoints: [...current, point],
      });
    }
  };

  // Handle AI suggestion selection for pain points
  const handleSuggestionSelect = (suggestionText: string) => {
    const current = data.painPoints || [];

    // Check if this suggestion is already in the pain points
    if (!current.includes(suggestionText)) {
      onUpdate({
        ...data,
        painPoints: [...current, suggestionText],
      });
    }
  };

  const isValid = () => {
    return (
      data.devTeamSize &&
      data.devTeamSize > 0 &&
      data.deploymentFrequency &&
      data.avgCycleTime &&
      data.aiToolsUsage
    );
  };

  const painPointOptions = [
    "Entrega lenta de features",
    "Alta taxa de bugs",
    "Ciclos longos de code review",
    "Acúmulo de débito técnico",
    "Baixa produtividade dev",
    "Dificuldade em atrair talentos",
    "Qualidade de código ruim",
    "Ansiedade em deploy",
    "Silos de conhecimento",
    "Sistemas legados limitantes",
  ];

  return (
    <div className="card-professional p-8">
      <h2 className="text-3xl font-bold text-tech-gray-100 mb-2 font-display">
        <span className="text-gradient-neon">02.</span> Estado Atual de Desenvolvimento
      </h2>
      <p className="text-tech-gray-400 mb-8">
        Conte-nos sobre sua organização de engenharia e práticas atuais.
      </p>

      <div className="space-y-8">
        {/* Team Size */}
        <div>
          <label className="block text-sm font-medium text-tech-gray-300 mb-2">
            Tamanho do Time de Desenvolvimento *
          </label>
          <input
            type="number"
            value={data.devTeamSize || ""}
            onChange={(e) =>
              handleChange("devTeamSize", parseInt(e.target.value))
            }
            placeholder="ex: 25"
            min="1"
            className="input-dark"
          />
          <p className="mt-1 text-sm text-tech-gray-500">
            Número de engenheiros de software (equivalente full-time)
          </p>
        </div>

        {/* Team Seniority Breakdown */}
        <div>
          <label className="block text-sm font-medium text-tech-gray-300 mb-3">
            Distribuição de Senioridade (Opcional)
          </label>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: "junior", label: "Junior (0-2 anos)" },
              { key: "mid", label: "Pleno (3-5 anos)" },
              { key: "senior", label: "Sênior (6+ anos)" },
              { key: "lead", label: "Tech Lead / Staff" },
            ].map((level) => (
              <div key={level.key}>
                <label className="block text-sm text-tech-gray-400 mb-1">
                  {level.label}
                </label>
                <input
                  type="number"
                  value={data.devSeniority?.[level.key as keyof typeof data.devSeniority] || 0}
                  onChange={(e) =>
                    handleSeniorityChange(level.key, parseInt(e.target.value) || 0)
                  }
                  min="0"
                  className="input-dark"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Deployment Frequency */}
        <div>
          <label className="block text-sm font-medium text-tech-gray-300 mb-2">
            Frequência de Deploy *
          </label>
          <select
            value={data.deploymentFrequency || ""}
            onChange={(e) => handleChange("deploymentFrequency", e.target.value)}
            className="select-dark"
          >
            <option value="">Selecione a frequência...</option>
            <option value="multiple-daily">Múltiplas vezes por dia</option>
            <option value="daily">Uma vez por dia</option>
            <option value="weekly">Semanal</option>
            <option value="biweekly">A cada 2 semanas</option>
            <option value="monthly">Mensal</option>
            <option value="quarterly">Trimestral ou menos</option>
          </select>
          <p className="mt-1 text-sm text-tech-gray-500">
            Com que frequência você faz deploy em produção?
          </p>
        </div>

        {/* Average Cycle Time */}
        <div>
          <label className="block text-sm font-medium text-tech-gray-300 mb-2">
            Tempo Médio de Ciclo (dias) *
          </label>
          <input
            type="number"
            value={data.avgCycleTime || ""}
            onChange={(e) =>
              handleChange("avgCycleTime", parseInt(e.target.value))
            }
            placeholder="ex: 14"
            min="1"
            className="input-dark"
          />
          <p className="mt-1 text-sm text-tech-gray-500">
            Da solicitação de feature até deploy em produção
          </p>
        </div>

        {/* Bug Rate (Optional) */}
        <div>
          <label className="block text-sm font-medium text-tech-gray-300 mb-2">
            Densidade de Bugs (Opcional)
          </label>
          <input
            type="number"
            value={data.bugRate || ""}
            onChange={(e) => handleChange("bugRate", parseFloat(e.target.value))}
            placeholder="ex: 15"
            min="0"
            step="0.1"
            className="input-dark"
          />
          <p className="mt-1 text-sm text-tech-gray-500">
            Bugs por 1.000 linhas de código (se rastreado)
          </p>
        </div>

        {/* AI Tools Usage */}
        <div>
          <label className="block text-sm font-medium text-tech-gray-300 mb-3">
            Adoção Atual de Ferramentas AI *
          </label>
          <div className="space-y-3">
            {[
              {
                value: "none",
                label: "Nenhuma",
                desc: "Sem ferramentas AI em uso",
              },
              {
                value: "exploring",
                label: "Explorando",
                desc: "Experimentação individual (1-25%)",
              },
              {
                value: "piloting",
                label: "Pilotando",
                desc: "Pilotos em nível de time (26-50%)",
              },
              {
                value: "production",
                label: "Produção",
                desc: "Amplo mas não sistemático (51-75%)",
              },
              {
                value: "mature",
                label: "Maduro",
                desc: "Integrado aos workflows (76-100%)",
              },
            ].map((level) => (
              <button
                key={level.value}
                onClick={() =>
                  handleChange(
                    "aiToolsUsage",
                    level.value as CurrentState["aiToolsUsage"]
                  )
                }
                className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                  data.aiToolsUsage === level.value
                    ? "border-neon-green bg-neon-green/10 shadow-neon-green"
                    : "border-tech-gray-700 bg-background-card hover:border-neon-green/50 hover:bg-neon-green/5"
                }`}
              >
                <div className="font-semibold text-tech-gray-100">{level.label}</div>
                <div className="text-sm text-tech-gray-500">{level.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Pain Points */}
        <div>
          <label className="block text-sm font-medium text-tech-gray-300 mb-3">
            Pain Points Atuais (Selecione todos que se aplicam)
          </label>

          {/* AI-Powered Suggestions */}
          {painPointSuggestions.length > 0 && (
            <div className="mb-4">
              <AISuggestedResponsesAnimated
                suggestions={painPointSuggestions}
                onSelect={handleSuggestionSelect}
                isLoading={isLoadingSuggestions}
              />
            </div>
          )}

          {/* Static Options Grid */}
          <div className="grid grid-cols-2 gap-3">
            {painPointOptions.map((point) => (
              <button
                key={point}
                onClick={() => togglePainPoint(point)}
                className={`p-3 border-2 rounded-lg text-sm text-left transition-all ${
                  data.painPoints?.includes(point)
                    ? "border-neon-green bg-neon-green/10 shadow-neon-green text-tech-gray-100"
                    : "border-tech-gray-700 bg-background-card hover:border-neon-green/50 hover:bg-neon-green/5 text-tech-gray-300"
                }`}
              >
                {point}
              </button>
            ))}
          </div>
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
            Continuar para Objetivos
            <ArrowRight className="w-4 h-4" />
          </span>
        </button>
      </div>
    </div>
  );
}
