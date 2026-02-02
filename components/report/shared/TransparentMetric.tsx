/**
 * Transparent Metric Component
 *
 * Displays metrics with full transparency:
 * - Primary value (optimistic, large, highlighted)
 * - Visual range indicator (best/worst/most-likely)
 * - Confidence badge (0-100 with color coding)
 * - Source citation (clickable link to source)
 * - Expandable methodology and caveats
 *
 * Used throughout report sections to build C-level trust and auditability
 */

'use client';

import { useState } from 'react';
import { ExternalLink, Info, TrendingUp, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { SourceAttribution } from '@/lib/types/source-attribution';
import { RangeResult } from '@/lib/calculators/range-calculator';

export interface TransparentMetricProps {
  // Core metric data
  label: string;
  value: number;
  unit?: 'BRL' | 'percentage' | 'number' | 'days' | 'hours';

  // Transparency data
  range?: RangeResult;
  confidence?: number; // 0-100
  sources?: SourceAttribution[];

  // Context and explanations
  description?: string;
  methodology?: string;
  assumptions?: string[];
  limitations?: string[];

  // Visual options
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'highlight' | 'compact';
  showRange?: boolean;
  showSource?: boolean;
  showConfidence?: boolean;
  className?: string;
}

/**
 * Format value based on unit
 */
function formatValue(value: number, unit?: string): string {
  switch (unit) {
    case 'BRL':
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);

    case 'percentage':
      return `${Math.round(value)}%`;

    case 'days':
      return `${Math.round(value)} dias`;

    case 'hours':
      return `${Math.round(value)}h`;

    case 'number':
    default:
      return new Intl.NumberFormat('pt-BR').format(Math.round(value));
  }
}

/**
 * Get confidence color and label
 */
function getConfidenceStyle(confidence: number): {
  color: string;
  bg: string;
  border: string;
  label: string;
} {
  if (confidence >= 80) {
    return {
      color: 'text-neon-green',
      bg: 'bg-neon-green/10',
      border: 'border-neon-green/30',
      label: 'Alta Confiança'
    };
  } else if (confidence >= 60) {
    return {
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10',
      border: 'border-yellow-400/30',
      label: 'Confiança Média'
    };
  } else if (confidence >= 40) {
    return {
      color: 'text-orange-400',
      bg: 'bg-orange-400/10',
      border: 'border-orange-400/30',
      label: 'Confiança Moderada'
    };
  } else {
    return {
      color: 'text-red-400',
      bg: 'bg-red-400/10',
      border: 'border-red-400/30',
      label: 'Baixa Confiança'
    };
  }
}

/**
 * Main TransparentMetric Component
 */
export default function TransparentMetric({
  label,
  value,
  unit = 'number',
  range,
  confidence,
  sources = [],
  description,
  methodology,
  assumptions = [],
  limitations = [],
  size = 'medium',
  variant = 'default',
  showRange = true,
  showSource = true,
  showConfidence = true,
  className = ''
}: TransparentMetricProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formattedValue = formatValue(value, unit);
  const confidenceStyle = confidence !== undefined ? getConfidenceStyle(confidence) : null;

  // Size classes
  const sizeClasses = {
    small: 'text-2xl',
    medium: 'text-4xl',
    large: 'text-6xl'
  };

  // Variant classes
  const variantClasses = {
    default: 'card-dark',
    highlight: 'card-glow border-2 border-neon-cyan/30',
    compact: 'bg-tech-gray-800/50'
  };

  return (
    <div className={`${variantClasses[variant]} p-6 ${className}`}>
      {/* Header: Label + Confidence Badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-white mb-1">{label}</h4>
          {description && (
            <p className="text-sm text-tech-gray-400">{description}</p>
          )}
        </div>

        {/* Confidence Badge */}
        {showConfidence && confidence !== undefined && confidenceStyle && (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${confidenceStyle.bg} border ${confidenceStyle.border}`}>
            <span className={`text-xs font-semibold ${confidenceStyle.color}`}>
              {confidence}%
            </span>
            <span className="text-xs text-tech-gray-500">•</span>
            <span className={`text-xs font-medium ${confidenceStyle.color}`}>
              {confidenceStyle.label}
            </span>
          </div>
        )}
      </div>

      {/* Primary Value - Large and Highlighted */}
      <div className="mb-6">
        <div className={`${sizeClasses[size]} font-bold text-neon-cyan`}>
          {formattedValue}
        </div>
        {range && (
          <div className="text-sm text-tech-gray-400 mt-1">
            Cenário otimista (p{range.primaryScenario.percentile || 75})
          </div>
        )}
      </div>

      {/* Visual Range Bar */}
      {showRange && range && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-tech-gray-400 mb-2">
            <span>Faixa de Variação</span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-neon-cyan hover:text-neon-cyan/80 transition-colors"
            >
              <span>Ver cenários</span>
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {/* Visual bar */}
          <div className="relative h-3 bg-tech-gray-900 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400/30 via-yellow-400/30 to-neon-green/30" />

            {/* Primary scenario marker */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-neon-cyan"
              style={{
                left: `${((range.primaryScenario.value - range.conservative.value) /
                         (range.optimistic.value - range.conservative.value)) * 100}%`
              }}
            />
          </div>

          {/* Range labels */}
          <div className="flex justify-between text-xs mt-2">
            <div className="text-orange-400">
              {formatValue(range.conservative.value, unit)}
            </div>
            <div className="text-neon-green">
              {formatValue(range.optimistic.value, unit)}
            </div>
          </div>

          {/* Expanded scenarios */}
          {isExpanded && (
            <div className="mt-4 space-y-2 animate-fade-in">
              {[range.conservative, range.realistic, range.optimistic].map((scenario, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    scenario.type === range.primaryScenario.type
                      ? 'bg-neon-cyan/10 border border-neon-cyan/30'
                      : 'bg-tech-gray-900/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      scenario.type === 'conservative' ? 'bg-orange-400' :
                      scenario.type === 'realistic' ? 'bg-yellow-400' :
                      'bg-neon-green'
                    }`} />
                    <span className="text-sm font-medium text-white capitalize">
                      {scenario.type === 'conservative' ? 'Conservador' :
                       scenario.type === 'realistic' ? 'Realista' :
                       'Otimista'}
                    </span>
                    <span className="text-xs text-tech-gray-500">
                      (p{scenario.percentile})
                    </span>
                  </div>
                  <span className={`text-sm font-semibold ${
                    scenario.type === range.primaryScenario.type ? 'text-neon-cyan' : 'text-tech-gray-300'
                  }`}>
                    {formatValue(scenario.value, unit)}
                  </span>
                </div>
              ))}
              <p className="text-xs text-tech-gray-500 mt-2">
                {range.conservative.description}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Source Citations */}
      {showSource && sources.length > 0 && (
        <div className="mb-4 p-4 bg-tech-gray-900/50 border border-tech-gray-700 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-neon-cyan" />
            <span className="text-xs font-semibold text-tech-gray-400 uppercase tracking-wide">
              Fontes
            </span>
          </div>

          <div className="space-y-2">
            {sources.slice(0, 3).map((source, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-neon-cyan mt-0.5">•</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-tech-gray-300">{source.source.name}</span>
                    {source.source.url && (
                      <a
                        href={source.source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neon-cyan hover:text-neon-cyan/80 transition-colors"
                        aria-label="Ver fonte"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  {source.notes && (
                    <p className="text-xs text-tech-gray-500 mt-1">{source.notes}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1 text-xs text-tech-gray-600">
                    <span>{source.source.type}</span>
                    <span>•</span>
                    <span>{source.source.publishDate}</span>
                    {source.source.sampleSize && (
                      <>
                        <span>•</span>
                        <span>n={source.source.sampleSize.toLocaleString()}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {sources.length > 3 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-neon-cyan hover:text-neon-cyan/80 transition-colors"
              >
                + {sources.length - 3} fontes adicionais
              </button>
            )}
          </div>
        </div>
      )}

      {/* Methodology & Limitations (Expandable) */}
      {(methodology || assumptions.length > 0 || limitations.length > 0) && (
        <div className="border-t border-tech-gray-700 pt-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm text-tech-gray-400 hover:text-neon-cyan transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Metodologia & Limitações</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {isExpanded && (
            <div className="mt-4 space-y-4 animate-fade-in">
              {/* Methodology */}
              {methodology && (
                <div>
                  <h5 className="text-xs font-semibold text-tech-gray-400 uppercase tracking-wide mb-2">
                    Como é calculado
                  </h5>
                  <p className="text-sm text-tech-gray-300">{methodology}</p>
                </div>
              )}

              {/* Assumptions */}
              {assumptions.length > 0 && (
                <div>
                  <h5 className="text-xs font-semibold text-tech-gray-400 uppercase tracking-wide mb-2">
                    Premissas
                  </h5>
                  <ul className="space-y-1">
                    {assumptions.map((assumption, idx) => (
                      <li key={idx} className="text-sm text-tech-gray-300 flex items-start gap-2">
                        <span className="text-neon-cyan mt-1">•</span>
                        <span>{assumption}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Limitations */}
              {limitations.length > 0 && (
                <div className="p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h5 className="text-xs font-semibold text-orange-400 uppercase tracking-wide mb-2">
                        Limitações Importantes
                      </h5>
                      <ul className="space-y-1">
                        {limitations.map((limitation, idx) => (
                          <li key={idx} className="text-sm text-tech-gray-300 flex items-start gap-2">
                            <span className="text-orange-400 mt-1">•</span>
                            <span>{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Compact variant for inline display
 */
export function CompactTransparentMetric({
  label,
  value,
  unit = 'number',
  confidence,
  className = ''
}: Pick<TransparentMetricProps, 'label' | 'value' | 'unit' | 'confidence' | 'className'>) {
  const formattedValue = formatValue(value, unit);
  const confidenceStyle = confidence !== undefined ? getConfidenceStyle(confidence) : null;

  return (
    <div className={`inline-flex items-center gap-3 px-4 py-2 bg-tech-gray-800/50 border border-tech-gray-700 rounded-lg ${className}`}>
      <div>
        <div className="text-xs text-tech-gray-400 mb-0.5">{label}</div>
        <div className="text-lg font-bold text-neon-cyan">{formattedValue}</div>
      </div>

      {confidenceStyle && confidence !== undefined && (
        <div className={`px-2 py-1 rounded-full ${confidenceStyle.bg} border ${confidenceStyle.border}`}>
          <span className={`text-xs font-semibold ${confidenceStyle.color}`}>
            {confidence}%
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Metric Grid - Display multiple metrics in a responsive grid
 */
export function MetricGrid({
  metrics,
  columns = 2,
  className = ''
}: {
  metrics: TransparentMetricProps[];
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const gridClasses = {
    2: 'grid-cols-1 lg:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={`grid ${gridClasses[columns]} gap-6 ${className}`}>
      {metrics.map((metric, idx) => (
        <TransparentMetric key={idx} {...metric} />
      ))}
    </div>
  );
}
