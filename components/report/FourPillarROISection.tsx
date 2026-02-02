'use client';

import { FourPillarROI } from '@/lib/types';
import { formatPillarValue, getPillarColor } from '@/lib/calculators/four-pillar-roi-calculator';
import { DataQualityBadge } from './DataQualityBadge';
import TransparentMetric from './shared/TransparentMetric';
import { TrendingUp, DollarSign, Shield, Zap, Check, Info, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface FourPillarROISectionProps {
  fourPillarROI: FourPillarROI;
  isMockData?: boolean;
  isIndustryBenchmark?: boolean; // NEW: V2 with verified benchmarks
}

export default function FourPillarROISection({
  fourPillarROI,
  isMockData = false,
  isIndustryBenchmark = false
}: FourPillarROISectionProps) {
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);

  // Type guard to check if fourPillarROI has V2 transparency data
  const hasTransparencyData = 'sources' in fourPillarROI || 'overallConfidence' in fourPillarROI;
  const sources = 'sources' in fourPillarROI ? (fourPillarROI as any).sources : [];
  const overallConfidence = 'overallConfidence' in fourPillarROI ? (fourPillarROI as any).overallConfidence : undefined;
  const ranges = 'ranges' in fourPillarROI ? (fourPillarROI as any).ranges : undefined;

  const pillars = [
    {
      id: 'efficiency',
      name: 'Efficiency Gains',
      icon: TrendingUp,
      color: 'neon-green',
      data: fourPillarROI.efficiency,
      description: 'Productivity improvements and operational efficiency',
    },
    {
      id: 'revenue',
      name: 'Revenue Acceleration',
      icon: DollarSign,
      color: 'neon-cyan',
      data: fourPillarROI.revenue,
      description: 'Market competitiveness and revenue growth',
    },
    {
      id: 'risk',
      name: 'Risk Mitigation',
      icon: Shield,
      color: 'neon-purple',
      data: fourPillarROI.risk,
      description: 'Quality, security, and incident prevention',
    },
    {
      id: 'agility',
      name: 'Business Agility',
      icon: Zap,
      color: 'yellow-400',
      data: fourPillarROI.agility,
      description: 'Speed to market and innovation capacity',
    },
  ];

  // Calculate percentages for visualization
  const total = fourPillarROI.totalValue.combined;
  const percentages = {
    efficiency: (fourPillarROI.totalValue.efficiency / total) * 100,
    revenue: (fourPillarROI.totalValue.revenue / total) * 100,
    risk: (fourPillarROI.totalValue.risk / total) * 100,
    agility: (fourPillarROI.totalValue.agility / total) * 100,
  };

  return (
    <div className="card-professional p-10 mb-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-3xl font-bold font-display text-tech-gray-100">
            4-Pillar ROI Framework
          </h2>
          <DataQualityBadge isRealData={!isMockData} variant="compact" showTooltip={true} />
        </div>
        <p className="text-lg text-tech-gray-400">
          Comprehensive value analysis across strategic dimensions
        </p>
      </div>

      {/* Total Value Banner */}
      <div className="card-glow p-6 mb-8 bg-gradient-to-br from-neon-green/5 to-cyan-500/5">
        <div className="text-center">
          <div className="text-sm text-tech-gray-400 mb-2 uppercase tracking-wider">
            Total Combined Value (Annual)
          </div>
          <div className="text-5xl font-bold text-gradient-neon mb-4">
            {formatPillarValue(fourPillarROI.totalValue.combined)}
          </div>
          <div className="text-sm text-tech-gray-500">
            Across all 4 strategic pillars
          </div>
        </div>

        {/* Visual breakdown bar */}
        <div className="mt-6 h-4 bg-tech-gray-800 rounded-full overflow-hidden flex">
          <div
            className="bg-neon-green transition-all duration-500"
            style={{ width: `${percentages.efficiency}%` }}
            title={`Efficiency: ${percentages.efficiency.toFixed(0)}%`}
          />
          <div
            className="bg-neon-cyan transition-all duration-500"
            style={{ width: `${percentages.revenue}%` }}
            title={`Revenue: ${percentages.revenue.toFixed(0)}%`}
          />
          <div
            className="bg-neon-purple transition-all duration-500"
            style={{ width: `${percentages.risk}%` }}
            title={`Risk: ${percentages.risk.toFixed(0)}%`}
          />
          <div
            className="bg-yellow-400 transition-all duration-500"
            style={{ width: `${percentages.agility}%` }}
            title={`Agility: ${percentages.agility.toFixed(0)}%`}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 text-xs">
          {pillars.map((pillar) => (
            <div key={pillar.id} className="flex items-center gap-2">
              <div className={`w-3 h-3 bg-${pillar.color} rounded-full`}></div>
              <span className="text-tech-gray-400">
                {pillar.name.split(' ')[0]} ({percentages[pillar.id as keyof typeof percentages].toFixed(0)}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Pillar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          const pillarData = pillar.data as any;

          return (
            <div
              key={pillar.id}
              className={`card-dark p-6 hover:border-${pillar.color}/50 transition-all duration-300`}
            >
              {/* Pillar Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 bg-${pillar.color}/10 border border-${pillar.color}/30 rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 text-${pillar.color}`} />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold text-${pillar.color}`}>
                      {pillar.name}
                    </h3>
                    <p className="text-xs text-tech-gray-500">{pillar.description}</p>
                  </div>
                </div>

                {/* Confidence badge for this pillar (V2 only) */}
                {isIndustryBenchmark && ranges && ranges[pillar.id] && (
                  <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    ranges[pillar.id].primaryScenario?.percentile === 75 ? 'bg-neon-cyan/20 text-neon-cyan' :
                    ranges[pillar.id].primaryScenario?.percentile === 50 ? 'bg-yellow-400/20 text-yellow-400' :
                    'bg-orange-400/20 text-orange-400'
                  }`}>
                    p{ranges[pillar.id].primaryScenario?.percentile || 75}
                  </div>
                )}
              </div>

              {/* Annual Value */}
              <div className="mb-4 p-4 bg-background-darker/50 rounded-lg">
                <div className="text-sm text-tech-gray-500 mb-1">Annual Value</div>
                <div className={`text-3xl font-bold text-${pillar.color}`}>
                  {formatPillarValue(pillarData.annualValue)}
                </div>
              </div>

              {/* Key Metrics */}
              <div className="space-y-2">
                <div className="text-sm font-semibold text-tech-gray-300 mb-3">Key Metrics:</div>
                {pillarData.keyMetrics.map((metric: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <Check className={`w-4 h-4 text-${pillar.color} mt-0.5 flex-shrink-0`} />
                    <span className="text-tech-gray-400">{metric}</span>
                  </div>
                ))}
              </div>

              {/* Specific Pillar Data */}
              {pillar.id === 'efficiency' && (
                <div className="mt-4 pt-4 border-t border-tech-gray-700">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-tech-gray-500">Productivity</div>
                      <div className={`font-bold text-${pillar.color}`}>
                        +{fourPillarROI.efficiency.productivityIncrease}%
                      </div>
                    </div>
                    <div>
                      <div className="text-tech-gray-500">Time-to-Market</div>
                      <div className={`font-bold text-${pillar.color}`}>
                        -{fourPillarROI.efficiency.timeToMarketReduction}%
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {pillar.id === 'revenue' && (
                <div className="mt-4 pt-4 border-t border-tech-gray-700">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-tech-gray-500">Customer Acquisition</div>
                      <div className={`font-bold text-${pillar.color}`}>
                        +{fourPillarROI.revenue.customerAcquisitionGain}%
                      </div>
                    </div>
                    <div>
                      <div className="text-tech-gray-500">Market Share</div>
                      <div className={`font-bold text-${pillar.color}`}>
                        +{fourPillarROI.revenue.marketShareGain}%
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {pillar.id === 'risk' && (
                <div className="mt-4 pt-4 border-t border-tech-gray-700">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-tech-gray-500">Code Quality</div>
                      <div className={`font-bold text-${pillar.color}`}>
                        +{fourPillarROI.risk.codeQualityImprovement}%
                      </div>
                    </div>
                    <div>
                      <div className="text-tech-gray-500">Bug Reduction</div>
                      <div className={`font-bold text-${pillar.color}`}>
                        -{fourPillarROI.risk.bugReduction}%
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {pillar.id === 'agility' && (
                <div className="mt-4 pt-4 border-tech-gray-700">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-tech-gray-500">Deploy Frequency</div>
                      <div className={`font-bold text-${pillar.color}`}>
                        +{fourPillarROI.agility.deploymentFrequencyIncrease}%
                      </div>
                    </div>
                    <div>
                      <div className="text-tech-gray-500">Innovation</div>
                      <div className={`font-bold text-${pillar.color}`}>
                        +{fourPillarROI.agility.innovationCapacity}%
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sources section (V2 only) - show relevant sources for this pillar */}
              {isIndustryBenchmark && hasTransparencyData && sources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-tech-gray-700">
                  <button
                    onClick={() => setExpandedPillar(expandedPillar === pillar.id ? null : pillar.id)}
                    className="flex items-center gap-2 text-xs text-tech-gray-400 hover:text-neon-cyan transition-colors mb-2"
                  >
                    <Info className="w-3 h-3" />
                    <span>Ver fontes ({sources.filter((s: any) =>
                      s.metric.toLowerCase().includes(pillar.id) ||
                      pillar.name.toLowerCase().includes(s.metric.toLowerCase().split(' ')[0])
                    ).length || sources.length} benchmarks)</span>
                  </button>

                  {expandedPillar === pillar.id && (
                    <div className="space-y-1 animate-fade-in">
                      {sources
                        .filter((s: any) =>
                          s.metric.toLowerCase().includes(pillar.id) ||
                          pillar.name.toLowerCase().includes(s.metric.toLowerCase().split(' ')[0])
                        )
                        .slice(0, 3)
                        .map((source: any, idx: number) => (
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

      {/* Methodology Note */}
      <div className="mt-8 p-6 bg-gradient-to-r from-cyan-500/10 to-neon-green/10 border border-neon-cyan/30 rounded-xl">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-neon-cyan flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-base text-tech-gray-200 leading-relaxed mb-2">
              <strong className="text-neon-cyan">4-Pillar Framework:</strong> Inspired by Writer AI's Agentic ROI Matrix,
              this comprehensive analysis evaluates AI impact across multiple strategic dimensions.
            </p>
            {isIndustryBenchmark && hasTransparencyData ? (
              <>
                <p className="text-sm text-tech-gray-300 mb-2">
                  <strong>Fontes Verificadas (Tier-1):</strong> McKinsey GenAI Report 2024, Forrester TEI studies,
                  DORA State of DevOps, GitHub Developer Productivity research.
                </p>
                <p className="text-xs text-tech-gray-400">
                  Valores apresentados no percentil 75 (otimista mas defensável). Cada pilar inclui fontes específicas
                  e ranges de variação. Confiança geral: <strong className="text-neon-cyan">{overallConfidence}%</strong>.
                </p>
                {overallConfidence !== undefined && ranges && (
                  <div className="mt-3 p-3 bg-neon-cyan/5 border border-neon-cyan/20 rounded">
                    <p className="text-xs text-tech-gray-300">
                      <strong>Metodologia:</strong> {(fourPillarROI as any).methodology?.description ||
                        'Cálculos baseados em benchmarks verificados aplicados ao perfil da empresa.'}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-tech-gray-400">
                Calculations based on McKinsey GenAI Report 2024, Forrester TEI studies, and GitHub Developer Productivity research.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
