/**
 * Data Quality Badge - Shows transparency about data source
 *
 * Displays whether data shown is real (collected from user) or estimated (based on benchmarks)
 * Critical for building trust and credibility in enterprise consultoria platform
 */

import { Check, AlertTriangle, Info } from 'lucide-react';

interface DataQualityBadgeProps {
  isRealData: boolean;
  variant?: 'default' | 'compact';
  className?: string;
  showTooltip?: boolean;
}

export function DataQualityBadge({
  isRealData,
  variant = 'default',
  className = '',
  showTooltip = false
}: DataQualityBadgeProps) {

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${
        isRealData
          ? 'bg-neon-green/20 text-neon-green border border-neon-green/40'
          : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
      } ${className}`}>
        {isRealData ? (
          <>
            <Check className="w-3 h-3" />
            <span>Dados Reais</span>
          </>
        ) : (
          <>
            <AlertTriangle className="w-3 h-3" />
            <span>Estimativa</span>
          </>
        )}
      </div>
    );
  }

  // Default variant - more prominent
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold ${
      isRealData
        ? 'bg-neon-green/10 text-neon-green border-2 border-neon-green/30'
        : 'bg-amber-500/10 text-amber-400 border-2 border-amber-500/30'
    } ${className}`}>
      {isRealData ? (
        <>
          <div className="w-5 h-5 rounded-full bg-neon-green/20 flex items-center justify-center">
            <Check className="w-3 h-3" />
          </div>
          <span>✅ Dados Reais</span>
          {showTooltip && (
            <div className="group relative">
              <Info className="w-4 h-4 text-neon-green/60 hover:text-neon-green cursor-help" />
              <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-tech-gray-900 border border-neon-green/30 rounded-lg text-xs text-tech-gray-200 shadow-lg z-10">
                Calculado com dados fornecidos por você durante o assessment
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
            <AlertTriangle className="w-3 h-3" />
          </div>
          <span>⚠️ Estimativa Baseada em Perfil</span>
          {showTooltip && (
            <div className="group relative">
              <Info className="w-4 h-4 text-amber-400/60 hover:text-amber-400 cursor-help" />
              <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-tech-gray-900 border border-amber-500/30 rounded-lg text-xs text-tech-gray-200 shadow-lg z-10">
                Estimativa genérica baseada em porte da empresa e indústria. Para resultados mais precisos, forneça dados específicos.
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Section-level quality indicator - for large report sections
 */
interface DataQualitySectionHeaderProps {
  title: string;
  isRealData: boolean;
  description?: string;
}

export function DataQualitySectionHeader({
  title,
  isRealData,
  description
}: DataQualitySectionHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-2xl font-bold text-white">{title}</h3>
        <DataQualityBadge isRealData={isRealData} variant="compact" />
      </div>
      {description && (
        <p className="text-sm text-tech-gray-400">{description}</p>
      )}
    </div>
  );
}
