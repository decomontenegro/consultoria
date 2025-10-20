/**
 * Confidence Indicator Component
 *
 * Displays confidence level and data quality metrics for ROI projections
 * Inspired by medical diagnostic confidence displays
 */

import { ConfidenceLevel, DataQuality } from '@/lib/types';
import { getConfidenceStyle, getConfidenceImprovements } from '@/lib/calculators/confidence-calculator';
import { AlertCircle, CheckCircle, TrendingUp, Database, Info } from 'lucide-react';

interface ConfidenceIndicatorProps {
  confidenceLevel: ConfidenceLevel;
  dataQuality: DataQuality;
  uncertaintyRange: {
    conservativeNPV: number;
    optimisticNPV: number;
    mostLikelyNPV: number;
  };
  assumptions: string[];
  compact?: boolean;
}

export default function ConfidenceIndicator({
  confidenceLevel,
  dataQuality,
  uncertaintyRange,
  assumptions,
  compact = false
}: ConfidenceIndicatorProps) {
  const style = getConfidenceStyle(confidenceLevel);
  const improvements = getConfidenceImprovements(dataQuality);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${style.bg} border ${style.border}`}>
        <span className={`text-lg ${style.color}`}>{style.icon}</span>
        <span className={`text-sm font-semibold ${style.color}`}>{style.label}</span>
        <span className="text-xs text-tech-gray-500">
          {dataQuality.completeness}% completo
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Confidence Card */}
      <div className={`card-glow p-6 border-2 ${style.border}`}>
        <div className="flex items-start gap-4">
          {/* Confidence Icon */}
          <div className={`flex-shrink-0 w-16 h-16 rounded-full ${style.bg} border-2 ${style.border} flex items-center justify-center`}>
            <span className={`text-3xl ${style.color}`}>{style.icon}</span>
          </div>

          {/* Confidence Details */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className={`text-xl font-bold ${style.color}`}>{style.label}</h3>
              {confidenceLevel === 'high' && <CheckCircle className="w-5 h-5 text-neon-green" />}
              {confidenceLevel === 'medium' && <Info className="w-5 h-5 text-yellow-400" />}
              {confidenceLevel === 'low' && <AlertCircle className="w-5 h-5 text-orange-400" />}
            </div>

            <p className="text-sm text-tech-gray-300 mb-4">
              {confidenceLevel === 'high' &&
                'Dados de alta qualidade permitem projeções precisas. Suas estimativas são confiáveis e defensáveis para decisões executivas.'}
              {confidenceLevel === 'medium' &&
                'Qualidade de dados moderada. Projeções são razoavelmente confiáveis, mas considere fornecer mais detalhes para aumentar precisão.'}
              {confidenceLevel === 'low' &&
                'Dados limitados reduzem a precisão das projeções. Recomendamos complementar com informações adicionais antes de decisões de investimento.'}
            </p>

            {/* Data Quality Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-tech-gray-900/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Database className="w-4 h-4 text-neon-cyan" />
                  <span className="text-xs font-medium text-tech-gray-400">Completude dos Dados</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl font-bold ${dataQuality.completeness >= 80 ? 'text-neon-green' : dataQuality.completeness >= 60 ? 'text-yellow-400' : 'text-orange-400'}`}>
                    {dataQuality.completeness}%
                  </span>
                  <span className="text-xs text-tech-gray-500">
                    {dataQuality.completeness >= 80 ? 'Excelente' : dataQuality.completeness >= 60 ? 'Bom' : 'Limitado'}
                  </span>
                </div>
              </div>

              <div className="bg-tech-gray-900/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-neon-purple" />
                  <span className="text-xs font-medium text-tech-gray-400">Especificidade</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl font-bold ${dataQuality.specificity >= 80 ? 'text-neon-green' : dataQuality.specificity >= 60 ? 'text-yellow-400' : 'text-orange-400'}`}>
                    {dataQuality.specificity}%
                  </span>
                  <span className="text-xs text-tech-gray-500">
                    {dataQuality.specificity >= 80 ? 'Detalhado' : dataQuality.specificity >= 60 ? 'Adequado' : 'Genérico'}
                  </span>
                </div>
              </div>
            </div>

            {/* Missing Data Warning */}
            {dataQuality.missingCriticalData.length > 0 && (
              <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-orange-400 mb-1">
                      Dados Críticos Ausentes:
                    </p>
                    <ul className="text-xs text-tech-gray-300 space-y-0.5">
                      {dataQuality.missingCriticalData.slice(0, 3).map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                      {dataQuality.missingCriticalData.length > 3 && (
                        <li className="text-tech-gray-500">
                          + {dataQuality.missingCriticalData.length - 3} mais
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Uncertainty Range */}
      <div className="card-dark p-6">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-neon-cyan" />
          Faixa de Incerteza (NPV 3 Anos)
        </h4>

        <div className="space-y-4">
          {/* Visual Range Bar */}
          <div className="relative h-24 bg-tech-gray-900/50 rounded-lg p-4 flex items-center">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-2 bg-tech-gray-800 rounded-full mx-4">
              <div
                className="absolute h-full bg-gradient-to-r from-orange-400 via-yellow-400 to-neon-green rounded-full"
                style={{
                  left: '0%',
                  width: '100%'
                }}
              />
              {/* Most Likely Marker */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded"
                style={{
                  left: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              />
            </div>

            {/* Labels */}
            <div className="relative w-full flex justify-between text-xs">
              <div className="text-center">
                <div className="font-semibold text-orange-400">Conservador</div>
                <div className="text-tech-gray-400 mt-1">
                  {formatCurrency(uncertaintyRange.conservativeNPV)}
                </div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-white">Mais Provável</div>
                <div className="text-neon-green mt-1 font-bold">
                  {formatCurrency(uncertaintyRange.mostLikelyNPV)}
                </div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-neon-green">Otimista</div>
                <div className="text-tech-gray-400 mt-1">
                  {formatCurrency(uncertaintyRange.optimisticNPV)}
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-tech-gray-400 text-center">
            Faixa baseada em {confidenceLevel === 'high' ? '±15%' : confidenceLevel === 'medium' ? '±25%' : '±40%'} de variância
            conforme nível de confiança dos dados
          </p>
        </div>
      </div>

      {/* Key Assumptions */}
      <div className="card-dark p-6">
        <h4 className="text-sm font-semibold text-tech-gray-400 mb-3 uppercase tracking-wide">
          Premissas Chave
        </h4>
        <ul className="space-y-2">
          {assumptions.slice(0, 5).map((assumption, idx) => (
            <li key={idx} className="text-sm text-tech-gray-300 flex items-start gap-2">
              <span className="text-neon-cyan mt-1 flex-shrink-0">•</span>
              <span>{assumption}</span>
            </li>
          ))}
          {assumptions.length > 5 && (
            <li className="text-xs text-tech-gray-500 italic">
              + {assumptions.length - 5} premissas adicionais...
            </li>
          )}
        </ul>
      </div>

      {/* Improvement Recommendations */}
      {improvements.length > 0 && (
        <div className="card-glow p-6 border-neon-cyan/30">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-neon-cyan" />
            Como Aumentar a Confiança
          </h4>
          <ul className="space-y-3">
            {improvements.map((improvement, idx) => (
              <li key={idx} className="flex items-start gap-3 p-3 bg-neon-cyan/5 border border-neon-cyan/20 rounded-lg">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neon-cyan/20 text-neon-cyan flex items-center justify-center text-sm font-bold">
                  {idx + 1}
                </span>
                <span className="text-sm text-tech-gray-200">{improvement}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Compact version for inline display
 */
export function ConfidenceBadge({
  confidenceLevel,
  dataQuality
}: {
  confidenceLevel: ConfidenceLevel;
  dataQuality: DataQuality;
}) {
  const style = getConfidenceStyle(confidenceLevel);

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${style.bg} border ${style.border}`}>
      <span className={`text-sm ${style.color}`}>{style.icon}</span>
      <span className={`text-xs font-semibold ${style.color}`}>{style.label}</span>
      <span className="text-xs text-tech-gray-500">•</span>
      <span className="text-xs text-tech-gray-400">
        {Math.round((dataQuality.completeness + dataQuality.specificity) / 2)}% qualidade
      </span>
    </div>
  );
}
