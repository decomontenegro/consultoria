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
  Lightbulb
} from "lucide-react";

interface Props {
  costOfInaction: CostOfInactionAnalysis;
  isMockData?: boolean;
}

const iconMap: { [key: string]: any } = {
  productivity: TrendingDown,
  clock: Clock,
  bug: Bug,
  users: Users,
  'trending-down': TrendingDown,
};

export default function CostOfInaction({ costOfInaction, isMockData = false }: Props) {
  return (
    <div className="card-professional p-10 mb-12 border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-red-500/5">
      <div className="flex items-start justify-between mb-8">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold font-display text-tech-gray-100 flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-amber-400" />
              O Custo de NÃO Agir
            </h2>
            <DataQualityBadge isRealData={!isMockData} variant="compact" showTooltip={true} />
          </div>
          <p className="text-lg text-tech-gray-300 leading-relaxed max-w-3xl">
            Enquanto você avalia se deve ou não investir em AI, seus competidores já estão ganhando vantagens.
            Veja quanto a inação está custando.
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
          return (
            <div
              key={index}
              className="card-dark p-6 border-l-4 border-amber-500 hover:border-amber-400 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-500/20 rounded-lg">
                    <Icon className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-tech-gray-100">
                      {cost.category}
                    </h4>
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

      {/* Action CTA */}
      <div className="mt-6 p-5 bg-neon-green/10 border border-neon-green/30 rounded-xl">
        <p className="text-base text-tech-gray-200 leading-relaxed">
          <strong className="text-neon-green inline-flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            A boa notícia:
          </strong> Todos esses custos são evitáveis.
          Começar agora significa parar de perder dinheiro e começar a ganhar vantagem competitiva.
          O melhor momento para começar foi ontem. O segundo melhor momento é agora.
        </p>
      </div>
    </div>
  );
}
