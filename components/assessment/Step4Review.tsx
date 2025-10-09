import { CompanyInfo, CurrentState, Goals, ContactInfo } from "@/lib/types";
import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";

interface Props {
  companyInfo: Partial<CompanyInfo>;
  currentState: Partial<CurrentState>;
  goals: Partial<Goals>;
  contactInfo: Partial<ContactInfo>;
  onUpdateContact: (data: Partial<ContactInfo>) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export default function Step4Review({
  companyInfo,
  currentState,
  goals,
  contactInfo,
  onUpdateContact,
  onBack,
  onSubmit,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill company name from Step 1 if not already filled
  useEffect(() => {
    if (!contactInfo.company && companyInfo.name) {
      onUpdateContact({ ...contactInfo, company: companyInfo.name });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once when component mounts

  const handleContactChange = (field: keyof ContactInfo, value: any) => {
    onUpdateContact({ ...contactInfo, [field]: value });
  };

  const isValid = () => {
    return (
      contactInfo.fullName &&
      contactInfo.title &&
      contactInfo.email &&
      contactInfo.company &&
      contactInfo.agreeToContact
    );
  };

  const handleSubmit = async () => {
    if (!isValid()) return;

    setIsSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card-professional p-8">
      <h2 className="text-3xl font-bold text-tech-gray-100 mb-2 font-display">
        <span className="text-gradient-neon">04.</span> Revisão & Informações de Contato
      </h2>
      <p className="text-tech-gray-400 mb-8">
        Revise suas respostas e forneça informações de contato para receber seu
        Relatório de Prontidão AI personalizado.
      </p>

      {/* Summary of Assessment */}
      <div className="space-y-6 mb-8 p-6 bg-background-card/30 backdrop-blur-sm rounded-lg border border-tech-gray-800">
        <h3 className="font-semibold text-tech-gray-100 text-lg mb-4">
          Resumo da Avaliação
        </h3>

        {/* Company Info Summary */}
        <div>
          <h4 className="text-sm font-medium text-tech-gray-300 mb-2">
            Informações da Empresa
          </h4>
          <div className="text-sm text-tech-gray-400 space-y-1">
            <p>
              <span className="font-medium text-tech-gray-300">Empresa:</span> {companyInfo.name}
            </p>
            <p>
              <span className="font-medium text-tech-gray-300">Indústria:</span>{" "}
              {companyInfo.industry}
            </p>
            <p>
              <span className="font-medium text-tech-gray-300">Tamanho:</span> {companyInfo.size}
            </p>
            <p>
              <span className="font-medium text-tech-gray-300">Receita:</span> {companyInfo.revenue}
            </p>
          </div>
        </div>

        {/* Current State Summary */}
        <div>
          <h4 className="text-sm font-medium text-tech-gray-300 mb-2">
            Estado Atual de Desenvolvimento
          </h4>
          <div className="text-sm text-tech-gray-400 space-y-1">
            <p>
              <span className="font-medium text-tech-gray-300">Tamanho do Time:</span>{" "}
              {currentState.devTeamSize} desenvolvedores
            </p>
            <p>
              <span className="font-medium text-tech-gray-300">Frequência de Deploy:</span>{" "}
              {currentState.deploymentFrequency}
            </p>
            <p>
              <span className="font-medium text-tech-gray-300">Tempo Médio de Ciclo:</span>{" "}
              {currentState.avgCycleTime} dias
            </p>
            <p>
              <span className="font-medium text-tech-gray-300">Adoção de Ferramentas AI:</span>{" "}
              {currentState.aiToolsUsage}
            </p>
            {currentState.painPoints && currentState.painPoints.length > 0 && (
              <p>
                <span className="font-medium text-tech-gray-300">Pain Points:</span>{" "}
                {currentState.painPoints.length} identificados
              </p>
            )}
          </div>
        </div>

        {/* Goals Summary */}
        <div>
          <h4 className="text-sm font-medium text-tech-gray-300 mb-2">
            Objetivos de Transformação
          </h4>
          <div className="text-sm text-tech-gray-400 space-y-1">
            <p>
              <span className="font-medium text-tech-gray-300">Objetivos Primários:</span>{" "}
              {goals.primaryGoals?.length || 0} selecionados
            </p>
            <p>
              <span className="font-medium text-tech-gray-300">Timeline:</span> {goals.timeline}
            </p>
            <p>
              <span className="font-medium text-tech-gray-300">Faixa de Orçamento:</span>{" "}
              {goals.budgetRange}
            </p>
            <p>
              <span className="font-medium text-tech-gray-300">Métricas de Sucesso:</span>{" "}
              {goals.successMetrics?.length || 0} definidas
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information Form */}
      <div className="space-y-6">
        <h3 className="font-semibold text-tech-gray-100 text-lg">
          Informações de Contato
        </h3>

        <div className="grid grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-tech-gray-300 mb-2">
              Nome Completo *
            </label>
            <input
              type="text"
              value={contactInfo.fullName || ""}
              onChange={(e) => handleContactChange("fullName", e.target.value)}
              placeholder="João Silva"
              className="input-dark"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-tech-gray-300 mb-2">
              Cargo *
            </label>
            <input
              type="text"
              value={contactInfo.title || ""}
              onChange={(e) => handleContactChange("title", e.target.value)}
              placeholder="CTO, VP Engenharia, etc."
              className="input-dark"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-tech-gray-300 mb-2">
              Email Corporativo *
            </label>
            <input
              type="email"
              value={contactInfo.email || ""}
              onChange={(e) => handleContactChange("email", e.target.value)}
              placeholder="joao.silva@empresa.com"
              className="input-dark"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-tech-gray-300 mb-2">
              Telefone (Opcional)
            </label>
            <input
              type="tel"
              value={contactInfo.phone || ""}
              onChange={(e) => handleContactChange("phone", e.target.value)}
              placeholder="+55 11 98765-4321"
              className="input-dark"
            />
          </div>
        </div>

        {/* Company Name (auto-filled from Step 1) */}
        <div>
          <label className="block text-sm font-medium text-tech-gray-300 mb-2">
            Nome da Empresa *
          </label>
          <input
            type="text"
            value={contactInfo.company || companyInfo.name || ""}
            onChange={(e) => handleContactChange("company", e.target.value)}
            placeholder="Nome da empresa"
            className="input-dark"
          />
        </div>

        {/* Consent Checkbox */}
        <div className="flex items-start">
          <input
            type="checkbox"
            id="agreeToContact"
            checked={contactInfo.agreeToContact || false}
            onChange={(e) =>
              handleContactChange("agreeToContact", e.target.checked)
            }
            className="checkbox-dark"
          />
          <label
            htmlFor="agreeToContact"
            className="ml-3 text-sm text-tech-gray-400"
          >
            Concordo em ser contatado pela CulturaBuilder para discutir esta avaliação
            e receber meu Relatório de Prontidão AI personalizado. Respeitamos sua
            privacidade e nunca compartilharemos suas informações com terceiros.
          </label>
        </div>
      </div>

      {/* What Happens Next */}
      <div className="mt-8 p-4 bg-neon-green/10 border border-neon-green/30 rounded-lg">
        <h4 className="font-semibold text-neon-green mb-2">
          O que acontece a seguir?
        </h4>
        <ul className="text-sm text-tech-gray-300 space-y-1 list-disc list-inside">
          <li>
            Você receberá seu Relatório de Prontidão AI personalizado em até 24 horas
          </li>
          <li>
            O relatório inclui benchmarks da indústria, projeções de ROI e um
            roadmap de transformação
          </li>
          <li>
            Um especialista CulturaBuilder entrará em contato para agendar uma
            consulta
          </li>
          <li>Todos os dados são processados de forma segura e mantidos confidenciais</li>
        </ul>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t border-tech-gray-800">
        <button onClick={onBack} className="btn-secondary" disabled={isSubmitting}>
          ← Voltar
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isValid() || isSubmitting}
          className={`px-8 py-3 rounded-lg font-semibold transition-all bg-gradient-to-r from-neon-green/20 to-neon-cyan/20 border border-neon-green/30 text-neon-green hover:shadow-neon-green ${
            (!isValid() || isSubmitting) && "opacity-50 cursor-not-allowed"
          }`}
        >
          {isSubmitting ? (
            "Gerando Relatório..."
          ) : (
            <span className="flex items-center gap-2">
              Gerar Meu Relatório
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
