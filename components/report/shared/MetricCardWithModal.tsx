/**
 * MetricCardWithModal Component
 *
 * Displays metrics in cards with clickable "Learn More" to open detailed modal
 * Ideal for ROI figures, benchmarks, and key performance indicators
 */

'use client';

import { useState, ReactNode } from 'react';
import { LucideIcon, TrendingUp, Info, BookOpen, X } from 'lucide-react';

interface MetricCardWithModalProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  detailedExplanation: ReactNode;
  methodology?: ReactNode;
  className?: string;
  variant?: 'default' | 'compact' | 'featured';
}

export default function MetricCardWithModal({
  title,
  value,
  subtitle,
  icon: Icon = TrendingUp,
  trend = 'neutral',
  trendValue,
  detailedExplanation,
  methodology,
  className = '',
  variant = 'default'
}: MetricCardWithModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const trendColors = {
    up: 'text-neon-green',
    down: 'text-red-400',
    neutral: 'text-tech-gray-400'
  };

  const trendBgColors = {
    up: 'bg-neon-green/10 border-neon-green/30',
    down: 'bg-red-400/10 border-red-400/30',
    neutral: 'bg-tech-gray-700/30 border-tech-gray-600'
  };

  const variantClasses = {
    default: 'p-6',
    compact: 'p-4',
    featured: 'p-8 border-2'
  };

  return (
    <>
      {/* Metric Card */}
      <div
        className={`
          relative group
          bg-gradient-to-br from-tech-gray-800 to-tech-gray-900
          border border-tech-gray-700
          hover:border-neon-cyan/50
          rounded-xl
          transition-all duration-300
          hover:shadow-lg hover:shadow-neon-cyan/10
          ${variantClasses[variant]}
          ${className}
        `}
      >
        {/* Icon */}
        <div className="flex items-start justify-between mb-4">
          <div className={`
            p-3 rounded-lg
            bg-gradient-to-br from-neon-cyan/20 to-neon-green/20
            border border-neon-cyan/30
          `}>
            <Icon className="w-6 h-6 text-neon-cyan" />
          </div>

          {/* Info Button */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="
              opacity-0 group-hover:opacity-100
              p-2 rounded-lg
              text-tech-gray-400 hover:text-neon-cyan
              hover:bg-tech-gray-800
              transition-all duration-200
            "
            aria-label="Ver detalhes"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>

        {/* Value */}
        <div className="mb-2">
          <div className={`
            text-4xl font-bold
            bg-gradient-to-r from-neon-cyan to-neon-green
            bg-clip-text text-transparent
            ${variant === 'featured' ? 'text-5xl' : ''}
          `}>
            {value}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-tech-gray-100 mb-1">
          {title}
        </h3>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-sm text-tech-gray-400 mb-3">
            {subtitle}
          </p>
        )}

        {/* Trend Indicator */}
        {trendValue && (
          <div className={`
            inline-flex items-center gap-2 px-3 py-1.5
            ${trendBgColors[trend]}
            border rounded-full
            text-xs font-medium ${trendColors[trend]}
          `}>
            <TrendingUp className={`w-3.5 h-3.5 ${trend === 'down' ? 'rotate-180' : ''}`} />
            <span>{trendValue}</span>
          </div>
        )}

        {/* Learn More Link */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="
            absolute bottom-4 right-4
            opacity-0 group-hover:opacity-100
            inline-flex items-center gap-1.5
            text-xs font-medium text-neon-cyan
            hover:text-neon-green
            transition-all duration-200
          "
        >
          <span>Saiba mais</span>
          <BookOpen className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="
              relative w-full max-w-2xl max-h-[85vh] overflow-y-auto
              bg-gradient-to-br from-tech-gray-900 to-tech-gray-800
              border border-neon-cyan/30
              rounded-xl shadow-2xl shadow-neon-cyan/20
              animate-slide-up
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 px-6 py-5 bg-tech-gray-900/95 backdrop-blur-sm border-b border-tech-gray-700">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-neon-cyan/20 to-neon-green/20 border border-neon-cyan/30">
                    <Icon className="w-7 h-7 text-neon-cyan" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-tech-gray-100 mb-1">
                      {title}
                    </h3>
                    <div className="text-3xl font-bold bg-gradient-to-r from-neon-cyan to-neon-green bg-clip-text text-transparent">
                      {value}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="
                    p-2 rounded-lg
                    text-tech-gray-400 hover:text-tech-gray-200
                    hover:bg-tech-gray-800
                    transition-colors
                  "
                  aria-label="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-6">
              {/* Subtitle */}
              {subtitle && (
                <div className="text-tech-gray-300 text-lg">
                  {subtitle}
                </div>
              )}

              {/* Detailed Explanation */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-tech-gray-100 flex items-center gap-2">
                  <Info className="w-5 h-5 text-neon-cyan" />
                  O que isso significa
                </h4>
                <div className="text-tech-gray-200 leading-relaxed space-y-3">
                  {detailedExplanation}
                </div>
              </div>

              {/* Methodology */}
              {methodology && (
                <div className="pt-6 border-t border-tech-gray-700 space-y-4">
                  <h4 className="text-lg font-semibold text-tech-gray-100 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-neon-green" />
                    Como calculamos
                  </h4>
                  <div className="text-tech-gray-300 leading-relaxed space-y-3 text-sm">
                    {methodology}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 px-6 py-4 bg-tech-gray-900/95 backdrop-blur-sm border-t border-tech-gray-700">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="
                  w-full px-4 py-2.5
                  bg-gradient-to-r from-neon-cyan to-neon-green
                  hover:from-neon-cyan/90 hover:to-neon-green/90
                  rounded-lg
                  text-sm font-medium text-tech-gray-900
                  transition-all duration-200
                "
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Compact variant for dense layouts
 */
export function MetricCardCompact(props: MetricCardWithModalProps) {
  return <MetricCardWithModal {...props} variant="compact" />;
}

/**
 * Featured variant for primary metrics
 */
export function MetricCardFeatured(props: MetricCardWithModalProps) {
  return <MetricCardWithModal {...props} variant="featured" />;
}
