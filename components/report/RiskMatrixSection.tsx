import { RiskMatrix } from "@/lib/types";
import {
  Shield,
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  Cpu,
  TrendingDown,
  Users,
  BarChart3,
  Settings,
  CheckCircle,
  Lightbulb
} from "lucide-react";

interface Props {
  riskMatrix: RiskMatrix;
}

const impactColors = {
  low: { bg: "bg-blue-500/20", border: "border-blue-500/40", text: "text-blue-300", icon: Info },
  medium: { bg: "bg-yellow-500/20", border: "border-yellow-500/40", text: "text-yellow-300", icon: AlertCircle },
  high: { bg: "bg-orange-500/20", border: "border-orange-500/40", text: "text-orange-300", icon: AlertTriangle },
  critical: { bg: "bg-red-500/20", border: "border-red-500/40", text: "text-red-300", icon: Shield },
};

const categoryIcons: { [key: string]: any } = {
  technology: Cpu,
  competition: TrendingDown,
  talent: Users,
  market: BarChart3,
  operational: Settings,
};

const timeframeLabels = {
  immediate: "Imediato (< 3 meses)",
  'short-term': "Curto Prazo (3-6 meses)",
  'medium-term': "Médio Prazo (6-12 meses)",
  'long-term': "Longo Prazo (> 12 meses)",
};

const riskLevelConfig = {
  low: {
    color: "neon-green",
    label: "Risco Controlado",
    description: "Situação favorável, manter vigilância",
  },
  moderate: {
    color: "yellow-400",
    label: "Risco Moderado",
    description: "Atenção necessária, agir preventivamente",
  },
  high: {
    color: "orange-400",
    label: "Risco Alto",
    description: "Ação prioritária necessária",
  },
  critical: {
    color: "red-400",
    label: "Risco Crítico",
    description: "Ação imediata obrigatória",
  },
};

export default function RiskMatrixSection({ riskMatrix }: Props) {
  const config = riskLevelConfig[riskMatrix.riskLevel];

  return (
    <div className="card-professional p-10 mb-12">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold font-display text-tech-gray-100 mb-4 flex items-center gap-3">
            <Shield className="w-8 h-8 text-neon-cyan" />
            Matriz de Riscos Personalizadas
          </h2>
          <p className="text-lg text-tech-gray-400 leading-relaxed">
            Baseado nas respostas do seu assessment, identificamos os seguintes riscos estratégicos e operacionais.
          </p>
        </div>
      </div>

      {/* Overall Risk Score */}
      <div className="mb-10 p-8 bg-gradient-to-br from-neon-cyan/10 to-neon-green/5 border-2 border-neon-cyan/30 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-tech-gray-400 mb-2 uppercase tracking-wider">
              Score Geral de Risco
            </div>
            <div className="flex items-baseline gap-4">
              <div className="text-5xl font-bold text-gradient-neon">
                {riskMatrix.overallRiskScore.toFixed(0)}
              </div>
              <div className="text-lg text-tech-gray-400">/100</div>
            </div>
          </div>

          <div className="text-right">
            <div className={
              riskMatrix.riskLevel === 'critical'
                ? 'inline-flex items-center gap-2 px-6 py-3 bg-red-400/20 border-2 border-red-400/40 rounded-full'
                : riskMatrix.riskLevel === 'high'
                ? 'inline-flex items-center gap-2 px-6 py-3 bg-orange-400/20 border-2 border-orange-400/40 rounded-full'
                : riskMatrix.riskLevel === 'moderate'
                ? 'inline-flex items-center gap-2 px-6 py-3 bg-yellow-400/20 border-2 border-yellow-400/40 rounded-full'
                : 'inline-flex items-center gap-2 px-6 py-3 bg-neon-green/20 border-2 border-neon-green/40 rounded-full'
            }>
              <div className={
                riskMatrix.riskLevel === 'critical'
                  ? 'w-3 h-3 bg-red-400 rounded-full animate-pulse'
                  : riskMatrix.riskLevel === 'high'
                  ? 'w-3 h-3 bg-orange-400 rounded-full animate-pulse'
                  : riskMatrix.riskLevel === 'moderate'
                  ? 'w-3 h-3 bg-yellow-400 rounded-full animate-pulse'
                  : 'w-3 h-3 bg-neon-green rounded-full animate-pulse'
              }></div>
              <span className={
                riskMatrix.riskLevel === 'critical'
                  ? 'text-lg font-bold text-red-400'
                  : riskMatrix.riskLevel === 'high'
                  ? 'text-lg font-bold text-orange-400'
                  : riskMatrix.riskLevel === 'moderate'
                  ? 'text-lg font-bold text-yellow-400'
                  : 'text-lg font-bold text-neon-green'
              }>
                {config.label}
              </span>
            </div>
            <p className="text-sm text-tech-gray-400 mt-2">
              {config.description}
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-background-darker/50 rounded-lg">
          <p className="text-base text-tech-gray-200 leading-relaxed">
            {riskMatrix.summary}
          </p>
        </div>
      </div>

      {/* Risk List */}
      <div className="space-y-5">
        <h3 className="text-xl font-bold font-display text-tech-gray-100 mb-4">
          Riscos Identificados ({riskMatrix.risks.length})
        </h3>

        {riskMatrix.risks.map((risk, index) => {
          const impactStyle = impactColors[risk.impact];
          const ImpactIcon = impactStyle.icon;
          const CategoryIcon = categoryIcons[risk.category] || AlertCircle;

          return (
            <div
              key={risk.id}
              className={`card-dark p-6 border-l-4 ${impactStyle.border} hover:shadow-lg transition-all duration-300`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-3 ${impactStyle.bg} rounded-lg`}>
                    <CategoryIcon className={`w-6 h-6 ${impactStyle.text}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-bold text-tech-gray-100">
                        {risk.title}
                      </h4>
                      <span className={`px-3 py-1 ${impactStyle.bg} ${impactStyle.border} border ${impactStyle.text} rounded-full text-xs font-bold uppercase tracking-wide`}>
                        {risk.impact === 'critical' ? 'Crítico' :
                         risk.impact === 'high' ? 'Alto' :
                         risk.impact === 'medium' ? 'Médio' : 'Baixo'}
                      </span>
                    </div>
                    <p className="text-base text-tech-gray-300 leading-relaxed">
                      {risk.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-background-darker/50 rounded-lg">
                <div>
                  <div className="flex items-center gap-2 text-xs text-tech-gray-500 mb-1 uppercase tracking-wider">
                    <AlertCircle className="w-3 h-3" />
                    Probabilidade
                  </div>
                  <div className="text-sm font-semibold text-tech-gray-200 capitalize">
                    {risk.probability === 'high' ? 'Alta' :
                     risk.probability === 'medium' ? 'Média' : 'Baixa'}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs text-tech-gray-500 mb-1 uppercase tracking-wider">
                    <Clock className="w-3 h-3" />
                    Timeframe
                  </div>
                  <div className="text-sm font-semibold text-tech-gray-200">
                    {timeframeLabels[risk.timeframe]}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs text-tech-gray-500 mb-1 uppercase tracking-wider">
                    <BarChart3 className="w-3 h-3" />
                    Categoria
                  </div>
                  <div className="text-sm font-semibold text-tech-gray-200 capitalize">
                    {risk.category === 'technology' ? 'Tecnologia' :
                     risk.category === 'competition' ? 'Competição' :
                     risk.category === 'talent' ? 'Talentos' :
                     risk.category === 'market' ? 'Mercado' : 'Operacional'}
                  </div>
                </div>
              </div>

              {/* Mitigation Strategy */}
              <div className="p-4 bg-neon-green/10 border border-neon-green/30 rounded-lg">
                <div className="flex items-start gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-neon-green flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-bold text-neon-green mb-1 uppercase tracking-wide">
                      Estratégia de Mitigação
                    </div>
                    <p className="text-base text-tech-gray-200 leading-relaxed">
                      {risk.mitigationStrategy}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {riskMatrix.risks.length > 0 && (
        <div className="mt-8 p-6 bg-gradient-to-r from-neon-cyan/10 to-neon-green/10 border border-neon-cyan/30 rounded-xl">
          <p className="text-base text-tech-gray-200 leading-relaxed">
            <strong className="text-neon-cyan inline-flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Próximo Passo:
            </strong> Priorize os riscos de impacto
            "crítico" e "alto" com timeframe "imediato" ou "curto prazo". A implementação de AI pode
            mitigar simultaneamente vários desses riscos, criando valor defensivo e ofensivo.
          </p>
        </div>
      )}
    </div>
  );
}
