'use client';

import { BenchmarkComparison } from '@/lib/services/benchmark-service';
import { formatCurrency } from '@/lib/calculators/roi-calculator';
import { TrendingUp, TrendingDown, Minus, Award, BarChart3 } from 'lucide-react';

interface BenchmarkCardProps {
  comparison: BenchmarkComparison;
}

export default function BenchmarkCard({ comparison }: BenchmarkCardProps) {
  const { industryBenchmark, npvDiff, roiDiff, paybackDiff, npvPercentile, overallRanking } = comparison;

  // Ranking badge styles
  const rankingConfig = {
    'top': {
      label: `Top ${Math.round(100 - npvPercentile)}%`,
      color: 'text-neon-green',
      bg: 'bg-neon-green/10',
      border: 'border-neon-green/30',
      icon: Award,
    },
    'above-average': {
      label: 'Acima da Média',
      color: 'text-neon-cyan',
      bg: 'bg-neon-cyan/10',
      border: 'border-neon-cyan/30',
      icon: TrendingUp,
    },
    'average': {
      label: 'Média',
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10',
      border: 'border-yellow-400/30',
      icon: Minus,
    },
    'below-average': {
      label: 'Abaixo da Média',
      color: 'text-tech-gray-400',
      bg: 'bg-tech-gray-400/10',
      border: 'border-tech-gray-400/30',
      icon: TrendingDown,
    },
  };

  const config = rankingConfig[overallRanking];
  const RankingIcon = config.icon;

  // Helper to render metric comparison
  const renderMetricComparison = (
    label: string,
    value: string,
    avgValue: string,
    diff: number,
    isInverted = false // For payback, lower is better
  ) => {
    const isPositive = isInverted ? diff < 0 : diff > 0;
    const absValue = Math.abs(diff);

    let icon;
    let colorClass;

    if (absValue < 5) {
      // Within 5% - similar to average
      icon = <Minus className="w-4 h-4" />;
      colorClass = 'text-yellow-400';
    } else if (isPositive) {
      icon = <TrendingUp className="w-4 h-4" />;
      colorClass = 'text-neon-green';
    } else {
      icon = <TrendingDown className="w-4 h-4" />;
      colorClass = 'text-red-400';
    }

    return (
      <div className="flex items-center justify-between p-3 bg-background-card/30 rounded-lg">
        <div>
          <div className="text-xs text-tech-gray-500 mb-1">{label}</div>
          <div className="text-lg font-bold text-tech-gray-100">{value}</div>
          <div className="text-xs text-tech-gray-400">Média: {avgValue}</div>
        </div>
        <div className={`flex items-center gap-1 ${colorClass}`}>
          {icon}
          <span className="text-sm font-semibold">
            {absValue < 5 ? '~' : isPositive ? '+' : ''}{diff.toFixed(0)}%
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="card-professional p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${config.bg} rounded-lg flex items-center justify-center`}>
            <BarChart3 className={`w-5 h-5 ${config.color}`} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-tech-gray-100">Benchmark de Indústria</h3>
            <p className="text-sm text-tech-gray-400">{industryBenchmark.industry}</p>
          </div>
        </div>

        {/* Ranking Badge */}
        <div className={`flex items-center gap-2 px-4 py-2 ${config.bg} border ${config.border} rounded-lg`}>
          <RankingIcon className={`w-5 h-5 ${config.color}`} />
          <span className={`font-bold ${config.color}`}>{config.label}</span>
        </div>
      </div>

      {/* Benchmark Stats */}
      <div className="text-sm text-tech-gray-400 mb-4">
        Comparado com <span className="text-tech-gray-100 font-semibold">{industryBenchmark.reportCount}</span> empresa{industryBenchmark.reportCount > 1 ? 's' : ''} do setor {industryBenchmark.industry}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renderMetricComparison(
          'NPV 3 Anos',
          formatCurrency(comparison.report.roi.threeYearNPV),
          formatCurrency(industryBenchmark.avgNPV),
          npvDiff
        )}

        {renderMetricComparison(
          'ROI (IRR)',
          `${comparison.report.roi.irr.toFixed(0)}%`,
          `${industryBenchmark.avgROI.toFixed(0)}%`,
          roiDiff
        )}

        {renderMetricComparison(
          'Payback',
          `${comparison.report.roi.paybackPeriodMonths.toFixed(1)}m`,
          `${industryBenchmark.avgPayback.toFixed(1)}m`,
          paybackDiff,
          true // Inverted: lower is better
        )}
      </div>

      {/* Percentile Info */}
      <div className="mt-4 p-3 bg-background-dark/50 rounded-lg border border-tech-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm text-tech-gray-400">Seu NPV está melhor que</span>
          <span className="text-xl font-bold text-neon-green">{npvPercentile.toFixed(0)}%</span>
        </div>
        <div className="mt-2 h-2 bg-tech-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-neon-green to-neon-cyan"
            style={{ width: `${npvPercentile}%` }}
          />
        </div>
        <div className="text-xs text-tech-gray-500 mt-1">das empresas do setor {industryBenchmark.industry}</div>
      </div>
    </div>
  );
}
