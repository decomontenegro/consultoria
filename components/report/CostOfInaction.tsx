import { CostOfInactionAnalysis } from "@/lib/types";
import { formatCurrency } from "@/lib/calculators/roi-calculator";
import { DataQualityBadge } from './DataQualityBadge';
import {
  TrendingDown,
  Clock,
  Bug,
  Users,
  Zap,
  AlertTriangle,
  Lightbulb,
  Info,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useState } from 'react';

interface Props {
  costOfInaction: CostOfInactionAnalysis;
  isMockData?: boolean;
  isIndustryBenchmark?: boolean; // NEW: V2 with verified benchmarks
}

const iconMap: { [key: string]: any } = {
  productivity: TrendingDown,
  clock: Clock,
  bug: Bug,
  users: Users,
  'trending-down': TrendingDown,
};

export default function CostOfInaction({
  costOfInaction,
  isMockData = false,
  isIndustryBenchmark = false
}: Props) {
  const [expandedCost, setExpandedCost] = useState<string | null>(null);

  // Type guard to check if costOfInaction has V2 transparency data
  const hasTransparencyData = 'transparentCosts' in costOfInaction || 'overallConfidence' in costOfInaction;
  const transparentCosts = 'transparentCosts' in costOfInaction ? (costOfInaction as any).transparentCosts : [];
  const overallConfidence = 'overallConfidence' in costOfInaction ? (costOfInaction as any).overallConfidence : undefined;
  const methodology = 'methodology' in costOfInaction ? (costOfInaction as any).methodology : undefined;
  const limitations = 'limitations' in costOfInaction ? (costOfInaction as any).limitations : [];

  // Adjust visual aggressiveness based on confidence
  const isHighConfidence = overallConfidence !== undefined && overallConfidence >= 70;
  const isMediumConfidence = overallConfidence !== undefined && overallConfidence >= 50 && overallConfidence < 70;

  // Color schemes based on confidence
  const borderColor = isHighConfidence ? 'border-amber-500/30' : isMediumConfidence ? 'border-yellow-500/30' : 'border-orange-500/30';
  const bgGradient = isHighConfidence ? 'from-amber-500/5 to-red-500/5' : isMediumConfidence ? 'from-yellow-500/5 to-amber-500/5' : 'from-orange-500/5 to-yellow-500/5';

  return (
    <div className={`card-professional p-10 mb-12 border-2 ${borderColor} bg-gradient-to-br ${bgGradient}`}>
      <div className="flex items-start justify-between mb-8">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold font-display text-tech-gray-100 flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-amber-400" />
              {/* UPDATED: Less aggressive title if low confidence */}
              {isHighConfidence || !hasTransparencyData
                ? 'O Custo de NÃO Agir'
                : isMediumConfidence
                ? 'Custo Estimado de Inação'
                : 'Custo Projetado de Inação'}
            </h2>
            <div className="flex items-center gap-3">
              {/* UPDATED: Show confidence badge if V2 */}
              {hasTransparencyData && overallConfidence !== undefined && (
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                  isHighConfidence ? 'bg-neon-green/20 border-neon-green/40 text-neon-green' :
                  isMediumConfidence ? 'bg-yellow-400/20 border-yellow-400/40 text-yellow-400' :
                  'bg-orange-400/20 border-orange-400/40 text-orange-400'
                }`}>
                  <Info className="w-3 h-3" />
                  <span className="text-xs font-semibold">{overallConfidence}% confiança</span>
                </div>
              )}
              <DataQualityBadge isRealData={!isMockData} variant="compact" showTooltip={true} />
            </div>
          </div>
          <p className="text-lg text-tech-gray-300 leading-relaxed max-w-3xl">
            {/* UPDATED: Less fear-mongering if low confidence */}
            {isHighConfidence || !hasTransparencyData
              ? 'Enquanto você avalia se deve ou não investir em AI, seus competidores já estão ganhando vantagens. Veja quanto a inação está custando.'
              : isMediumConfidence
              ? 'Estimativa do impacto de não adotar AI, baseada em benchmarks da indústria. Valores são direcionais.'
              : 'Projeção do custo de oportunidade baseada em perfil genérico. Para análise precisa, forneça dados específicos da empresa.'}
          </p>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="p-6 bg-gradient-to-br from-amber-500/20 to-red-500/20 border-2 border-amber-500/40 rounded-xl">
          <div className="text-sm font-medium text-amber-300 mb-2 uppercase tracking-wider">
            Custo Anual de Inação
          </div>
          <div className="text-3xl font-bold text-amber-100 leading-none">
            {formatCurrency(costOfInaction.totalAnnualCost)}
          </div>
          <div className="text-sm text-amber-200/70 mt-2">
            Por ano que você espera
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-red-500/20 to-amber-500/20 border-2 border-red-500/40 rounded-xl">
          <div className="text-sm font-medium text-red-300 mb-2 uppercase tracking-wider">
            Custo em 3 Anos
          </div>
          <div className="text-3xl font-bold text-red-100 leading-none">
            {formatCurrency(costOfInaction.totalThreeYearCost)}
          </div>
          <div className="text-sm text-red-200/70 mt-2">
            Se nada mudar
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-red-600/20 to-amber-600/20 border-2 border-red-600/40 rounded-xl">
          <div className="text-sm font-medium text-red-300 mb-2 uppercase tracking-wider">
            Gap vs. Competidores AI
          </div>
          <div className="text-3xl font-bold text-red-100 leading-none">
            {formatCurrency(costOfInaction.opportunityCostVsCompetitors)}
          </div>
          <div className="text-sm text-red-200/70 mt-2">
            Custo de oportunidade
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="space-y-5 mb-8">
        <h3 className="text-xl font-bold font-display text-tech-gray-100 mb-4">
          Breakdown dos Custos de Inação
        </h3>
        {costOfInaction.costs.map((cost, index) => {
          const Icon = iconMap[cost.icon] || Zap;

          // Get transparent data if available (V2)
          const transparentCost = transparentCosts.find((tc: any) => tc.category === cost.category);
          const hasRange = transparentCost && 'range' in transparentCost;
          const hasSources = transparentCost && 'sources' in transparentCost && transparentCost.sources?.length > 0;
          const costConfidence = transparentCost?.confidence;

          return (
            <div
              key={index}
              className="card-dark p-6 border-l-4 border-amber-500 hover:border-amber-400 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-3 bg-amber-500/20 rounded-lg">
                    <Icon className="w-6 h-6 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-bold text-tech-gray-100">
                        {cost.category}
                      </h4>
                      {/* UPDATED: Show confidence badge per cost (V2) */}
                      {costConfidence !== undefined && (
                        <div className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          costConfidence >= 70 ? 'bg-neon-green/20 text-neon-green' :
                          costConfidence >= 50 ? 'bg-yellow-400/20 text-yellow-400' :
                          'bg-orange-400/20 text-orange-400'
                        }`}>
                          {costConfidence}%
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-tech-gray-400 mt-1">
                      {cost.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-background-darker/50 rounded-lg">
                <div>
                  <div className="text-xs text-tech-gray-500 mb-1 uppercase tracking-wider">
                    Custo Anual
                  </div>
                  <div className="text-xl font-bold text-amber-400">
                    {formatCurrency(cost.annualCost)}
                  </div>
                  {hasRange && transparentCost.range && (
                    <div className="text-xs text-tech-gray-500 mt-1">
                      Range: {formatCurrency(transparentCost.range.conservative)} - {formatCurrency(transparentCost.range.optimistic)}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs text-tech-gray-500 mb-1 uppercase tracking-wider">
                    Custo em 3 Anos
                  </div>
                  <div className="text-xl font-bold text-red-400">
                    {formatCurrency(cost.threeYearCost)}
                  </div>
                </div>
              </div>

              {/* UPDATED: Show sources (V2 only) */}
              {hasSources && (
                <div className="mt-4 pt-4 border-t border-tech-gray-700">
                  <button
                    onClick={() => setExpandedCost(expandedCost === cost.category ? null : cost.category)}
                    className="flex items-center gap-2 text-xs text-tech-gray-400 hover:text-neon-cyan transition-colors"
                  >
                    <Info className="w-3 h-3" />
                    <span>Ver fontes ({transparentCost.sources.length})</span>
                    {expandedCost === cost.category ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  {expandedCost === cost.category && (
                    <div className="mt-3 space-y-2 animate-fade-in">
                      {transparentCost.sources.map((source: any, idx: number) => (
                        <div key={idx} className="text-xs text-tech-gray-500 flex items-start gap-1">
                          <span className="text-neon-cyan">•</span>
                          <div className="flex-1">
                            <span>{source.source?.name || source.metric}</span>
                            {source.source?.url && (
                              <a
                                href={source.source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-1 text-neon-cyan hover:text-neon-cyan/80"
                              >
                                <ExternalLink className="w-2.5 h-2.5 inline" />
                              </a>
                            )}
                            {source.notes && (
                              <div className="text-tech-gray-600 mt-0.5">{source.notes}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Message */}
      <div className="p-6 bg-gradient-to-r from-amber-500/10 via-red-500/10 to-amber-500/10 border-2 border-amber-500/30 rounded-xl">
        <p className="text-base text-tech-gray-200 leading-relaxed">
          <strong className="text-amber-400 inline-flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Atenção:
          </strong> {costOfInaction.summary}
        </p>
      </div>

      {/* Action CTA - toned down if low confidence */}
      <div className={`mt-6 p-5 border rounded-xl ${
        isHighConfidence || !hasTransparencyData
          ? 'bg-neon-green/10 border-neon-green/30'
          : 'bg-blue-500/10 border-blue-500/30'
      }`}>
        <p className="text-base text-tech-gray-200 leading-relaxed">
          <strong className={`inline-flex items-center gap-2 ${
            isHighConfidence || !hasTransparencyData ? 'text-neon-green' : 'text-blue-400'
          }`}>
            <Lightbulb className="w-5 h-5" />
            {isHighConfidence || !hasTransparencyData ? 'A boa notícia:' : 'Oportunidade:'}
          </strong>{' '}
          {isHighConfidence || !hasTransparencyData
            ? 'Todos esses custos são evitáveis. Começar agora significa parar de perder dinheiro e começar a ganhar vantagem competitiva. O melhor momento para começar foi ontem. O segundo melhor momento é agora.'
            : 'Estas estimativas indicam uma oportunidade potencial. Para decisões de investimento, recomendamos fornecer dados específicos da empresa para análise precisa com seus números reais.'}
        </p>
      </div>

      {/* UPDATED: Methodology & Limitations (V2 only) */}
      {hasTransparencyData && (methodology || limitations.length > 0) && (
        <div className="mt-6 p-5 bg-tech-gray-900/50 border border-tech-gray-700 rounded-xl">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-neon-cyan flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              {methodology && (
                <div className="mb-3">
                  <h4 className="text-sm font-semibold text-neon-cyan mb-2">Metodologia</h4>
                  <p className="text-xs text-tech-gray-300">{methodology}</p>
                </div>
              )}

              {limitations.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-orange-400 mb-2">Limitações Importantes</h4>
                  <ul className="space-y-1">
                    {limitations.map((limitation: string, idx: number) => (
                      <li key={idx} className="text-xs text-tech-gray-400 flex items-start gap-2">
                        <AlertTriangle className="w-3 h-3 text-orange-400 flex-shrink-0 mt-0.5" />
                        <span>{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
