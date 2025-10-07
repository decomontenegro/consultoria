import { NonTechCurrentState } from "@/lib/types";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface Props {
  data: Partial<NonTechCurrentState>;
  onUpdate: (data: Partial<NonTechCurrentState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step2CurrentStateNonTech({
  data,
  onUpdate,
  onNext,
  onBack,
}: Props) {
  const handleChange = (field: keyof NonTechCurrentState, value: any) => {
    onUpdate({ ...data, [field]: value });
  };

  const toggleChallenge = (challenge: string) => {
    const current = data.businessChallenges || [];
    if (current.includes(challenge)) {
      onUpdate({
        ...data,
        businessChallenges: current.filter((c) => c !== challenge),
      });
    } else {
      onUpdate({
        ...data,
        businessChallenges: [...current, challenge],
      });
    }
  };

  const isValid = () => {
    return (
      data.deliverySpeed &&
      data.techCompetitiveness &&
      data.talentAttraction &&
      data.marketResponsiveness &&
      data.innovationLevel
    );
  };

  const challengeOptions = [
    "Pressão competitiva crescente",
    "Dificuldade em inovar rapidamente",
    "Demandas dos clientes não atendidas",
    "Custos operacionais elevados",
    "Perda de market share",
    "Dificuldade em atrair/reter talentos",
    "Sistemas e processos legados",
    "Baixa satisfação do cliente",
    "Incapacidade de escalar operações",
    "Regulação e compliance complexos",
  ];

  return (
    <div className="card-professional p-8">
      <h2 className="text-3xl font-bold text-tech-gray-100 mb-2 font-display">
        <span className="text-gradient-neon">02.</span> Estado Atual do Negócio
      </h2>
      <p className="text-tech-gray-400 mb-8">
        Conte-nos sobre a situação atual da sua empresa em relação à tecnologia e inovação.
      </p>

      <div className="space-y-8">
        {/* Delivery Speed */}
        <div>
          <label className="block text-sm font-medium text-tech-gray-300 mb-3">
            Velocidade de Entrega ao Mercado *
          </label>
          <p className="text-xs text-tech-gray-500 mb-3">
            Quão rápido sua empresa consegue lançar novos produtos, features ou responder a oportunidades de mercado?
          </p>
          <div className="space-y-3">
            {[
              {
                value: 'very-slow',
                label: 'Muito Lento',
                desc: 'Meses ou trimestres para lançar novidades'
              },
              {
                value: 'slow',
                label: 'Lento',
                desc: 'Semanas a meses para mudanças significativas'
              },
              {
                value: 'moderate',
                label: 'Moderado',
                desc: 'Conseguimos entregar mas não tão rápido quanto gostaríamos'
              },
              {
                value: 'fast',
                label: 'Rápido',
                desc: 'Conseguimos responder rapidamente ao mercado'
              },
              {
                value: 'very-fast',
                label: 'Muito Rápido',
                desc: 'Somos líderes em agilidade no nosso setor'
              },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() =>
                  handleChange('deliverySpeed', option.value as NonTechCurrentState['deliverySpeed'])
                }
                className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                  data.deliverySpeed === option.value
                    ? 'border-neon-green bg-neon-green/10 shadow-neon-green'
                    : 'border-tech-gray-700 bg-background-card hover:border-neon-green/50 hover:bg-neon-green/5'
                }`}
              >
                <div className="font-semibold text-tech-gray-100">{option.label}</div>
                <div className="text-sm text-tech-gray-500">{option.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Tech Competitiveness */}
        <div>
          <label className="block text-sm font-medium text-tech-gray-300 mb-3">
            Competitividade Tecnológica *
          </label>
          <p className="text-xs text-tech-gray-500 mb-3">
            Como você avalia sua empresa em relação aos concorrentes em termos de inovação e adoção de tecnologia?
          </p>
          <div className="space-y-3">
            {[
              {
                value: 'behind',
                label: 'Atrasados',
                desc: 'Estamos significativamente atrás dos concorrentes'
              },
              {
                value: 'average',
                label: 'Na Média',
                desc: 'Acompanhamos o mercado mas não lideramos'
              },
              {
                value: 'competitive',
                label: 'Competitivos',
                desc: 'Estamos no mesmo nível dos melhores do setor'
              },
              {
                value: 'leading',
                label: 'Líderes',
                desc: 'Somos referência em inovação tecnológica'
              },
              {
                value: 'unknown',
                label: 'Não Sei Avaliar',
                desc: 'Não tenho informações suficientes para comparar'
              },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() =>
                  handleChange('techCompetitiveness', option.value as NonTechCurrentState['techCompetitiveness'])
                }
                className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                  data.techCompetitiveness === option.value
                    ? 'border-neon-green bg-neon-green/10 shadow-neon-green'
                    : 'border-tech-gray-700 bg-background-card hover:border-neon-green/50 hover:bg-neon-green/5'
                }`}
              >
                <div className="font-semibold text-tech-gray-100">{option.label}</div>
                <div className="text-sm text-tech-gray-500">{option.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Talent Attraction */}
        <div>
          <label className="block text-sm font-medium text-tech-gray-300 mb-3">
            Atração e Retenção de Talentos Tech *
          </label>
          <p className="text-xs text-tech-gray-500 mb-3">
            Quão fácil é para sua empresa atrair e manter profissionais de tecnologia de alta qualidade?
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'difficult', label: 'Difícil', desc: 'Alto turnover ou falta de candidatos' },
              { value: 'moderate', label: 'Moderado', desc: 'Conseguimos mas com esforço' },
              { value: 'good', label: 'Bom', desc: 'Somos atrativos para talentos' },
              { value: 'excellent', label: 'Excelente', desc: 'Somos employer of choice' },
              { value: 'unknown', label: 'Não Sei', desc: 'Não tenho essa informação' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() =>
                  handleChange('talentAttraction', option.value as NonTechCurrentState['talentAttraction'])
                }
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  data.talentAttraction === option.value
                    ? 'border-neon-green bg-neon-green/10 shadow-neon-green'
                    : 'border-tech-gray-700 bg-background-card hover:border-neon-green/50 hover:bg-neon-green/5'
                }`}
              >
                <div className="font-semibold text-tech-gray-100 text-sm">{option.label}</div>
                <div className="text-xs text-tech-gray-500">{option.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Market Responsiveness */}
        <div>
          <label className="block text-sm font-medium text-tech-gray-300 mb-3">
            Capacidade de Resposta ao Mercado *
          </label>
          <p className="text-xs text-tech-gray-500 mb-3">
            Quão rápido sua empresa consegue adaptar produtos/serviços a mudanças do mercado ou feedback dos clientes?
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'very-slow', label: 'Muito Lento' },
              { value: 'slow', label: 'Lento' },
              { value: 'moderate', label: 'Moderado' },
              { value: 'fast', label: 'Rápido' },
              { value: 'very-fast', label: 'Muito Rápido' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() =>
                  handleChange('marketResponsiveness', option.value as NonTechCurrentState['marketResponsiveness'])
                }
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  data.marketResponsiveness === option.value
                    ? 'border-neon-green bg-neon-green/10 shadow-neon-green'
                    : 'border-tech-gray-700 bg-background-card hover:border-neon-green/50 hover:bg-neon-green/5'
                }`}
              >
                <div className="font-semibold text-tech-gray-100 text-sm">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Innovation Level */}
        <div>
          <label className="block text-sm font-medium text-tech-gray-300 mb-3">
            Nível de Inovação Atual *
          </label>
          <p className="text-xs text-tech-gray-500 mb-3">
            Quanto da capacidade da sua empresa está focada em inovação vs. manutenção de operações existentes?
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                value: 'low',
                label: 'Baixo',
                desc: 'Maioria do tempo em manutenção'
              },
              {
                value: 'medium',
                label: 'Médio',
                desc: 'Balanceado entre manutenção e inovação'
              },
              {
                value: 'high',
                label: 'Alto',
                desc: 'Foco significativo em inovação'
              },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() =>
                  handleChange('innovationLevel', option.value as NonTechCurrentState['innovationLevel'])
                }
                className={`p-4 border-2 rounded-xl text-left transition-all ${
                  data.innovationLevel === option.value
                    ? 'border-neon-green bg-neon-green/10 shadow-neon-green'
                    : 'border-tech-gray-700 bg-background-card hover:border-neon-green/50 hover:bg-neon-green/5'
                }`}
              >
                <div className="font-semibold text-tech-gray-100">{option.label}</div>
                <div className="text-sm text-tech-gray-500 mt-1">{option.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Business Challenges */}
        <div>
          <label className="block text-sm font-medium text-tech-gray-300 mb-3">
            Principais Desafios de Negócio (Selecione todos que se aplicam)
          </label>
          <div className="grid grid-cols-2 gap-3">
            {challengeOptions.map((challenge) => (
              <button
                key={challenge}
                onClick={() => toggleChallenge(challenge)}
                className={`p-3 border-2 rounded-lg text-sm text-left transition-all ${
                  data.businessChallenges?.includes(challenge)
                    ? 'border-neon-green bg-neon-green/10 shadow-neon-green text-tech-gray-100'
                    : 'border-tech-gray-700 bg-background-card hover:border-neon-green/50 hover:bg-neon-green/5 text-tech-gray-300'
                }`}
              >
                {challenge}
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
