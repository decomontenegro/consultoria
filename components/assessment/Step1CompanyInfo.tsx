import { CompanyInfo } from "@/lib/types";
import { ArrowLeft, ArrowRight } from "lucide-react";
import industries from "@/data/industries.json";

interface Props {
  data: Partial<CompanyInfo>;
  onUpdate: (data: Partial<CompanyInfo>) => void;
  onNext: () => void;
  onBack?: () => void;
}

export default function Step1CompanyInfo({ data, onUpdate, onNext, onBack }: Props) {
  const handleChange = (field: keyof CompanyInfo, value: string) => {
    onUpdate({ ...data, [field]: value });
  };

  const isValid = () => {
    return data.name && data.industry && data.size && data.revenue;
  };

  return (
    <div className="card-professional p-8">
      <h2 className="text-3xl font-bold text-tech-gray-100 mb-2 font-display">
        <span className="text-gradient-neon">01.</span> Company Information
      </h2>
      <p className="text-tech-gray-400 mb-8">
        Ajude-nos a entender sua organização para fornecer benchmarks precisos.
      </p>

      <div className="space-y-6">
        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-tech-gray-300 mb-2">
            Nome da Empresa *
          </label>
          <input
            type="text"
            value={data.name || ""}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Acme Corp"
            className="input-dark"
          />
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-medium text-tech-gray-300 mb-2">
            Indústria *
          </label>
          <select
            value={data.industry || ""}
            onChange={(e) => handleChange("industry", e.target.value)}
            className="select-dark"
          >
            <option value="">Selecione sua indústria...</option>
            {industries.industries.map((ind) => (
              <option key={ind.id} value={ind.id}>
                {ind.name}
              </option>
            ))}
          </select>
          {data.industry && (
            <div className="mt-3 p-3 bg-neon-green/5 border border-neon-green/20 rounded-lg">
              <p className="text-sm text-tech-gray-300">
                {
                  industries.industries.find((i) => i.id === data.industry)
                    ?.description
                }
              </p>
            </div>
          )}
        </div>

        {/* Company Size */}
        <div>
          <label className="block text-sm font-medium text-tech-gray-300 mb-2">
            Tamanho da Empresa *
          </label>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: "startup", label: "Startup", desc: "1-50 funcionários" },
              { value: "scaleup", label: "Scaleup", desc: "51-500 funcionários" },
              {
                value: "enterprise",
                label: "Enterprise",
                desc: "500+ funcionários",
              },
            ].map((size) => (
              <button
                key={size.value}
                onClick={() =>
                  handleChange("size", size.value as CompanyInfo["size"])
                }
                className={`p-4 border-2 rounded-xl text-left transition-all duration-300 ${
                  data.size === size.value
                    ? "border-neon-green bg-neon-green/10 shadow-neon-green"
                    : "border-tech-gray-700 bg-background-card hover:border-neon-green/50 hover:bg-neon-green/5"
                }`}
              >
                <div className="font-semibold text-tech-gray-100">{size.label}</div>
                <div className="text-sm text-tech-gray-400">{size.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Revenue Range */}
        <div>
          <label className="block text-sm font-medium text-tech-gray-300 mb-2">
            Receita Anual (BRL) *
          </label>
          <select
            value={data.revenue || ""}
            onChange={(e) => handleChange("revenue", e.target.value)}
            className="select-dark"
          >
            <option value="">Selecione o range de receita...</option>
            <option value="0-1M">Menos de R$1M</option>
            <option value="1M-10M">R$1M - R$10M</option>
            <option value="10M-50M">R$10M - R$50M</option>
            <option value="50M-100M">R$50M - R$100M</option>
            <option value="100M+">R$100M+</option>
          </select>
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-tech-gray-300 mb-2">
            País
          </label>
          <select
            value={data.country || "BR"}
            onChange={(e) => handleChange("country", e.target.value)}
            className="select-dark"
          >
            <option value="BR">Brasil</option>
            <option value="US">Estados Unidos</option>
            <option value="MX">México</option>
            <option value="AR">Argentina</option>
            <option value="other">Outro</option>
          </select>
        </div>
      </div>

      {/* Navigation */}
      <div className={`flex ${onBack ? 'justify-between' : 'justify-end'} mt-8 pt-6 border-t border-tech-gray-800`}>
        {onBack && (
          <button onClick={onBack} className="btn-secondary">
            <span className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </span>
          </button>
        )}
        <button
          onClick={onNext}
          disabled={!isValid()}
          className={`btn-primary ${
            !isValid() && "opacity-50 cursor-not-allowed"
          }`}
        >
          <span className="flex items-center gap-2">
            Continuar para Estado Atual
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
