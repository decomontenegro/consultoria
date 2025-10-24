/**
 * ExpandableSection Component
 *
 * Provides expandable/collapsible sections with "Learn More" functionality
 * Shows summary by default with option to expand for detailed content
 */

'use client';

import { useState, ReactNode } from 'react';
import { ChevronDown, ChevronUp, BookOpen, X } from 'lucide-react';

interface ExpandableSectionProps {
  title: string;
  summary: ReactNode;
  detailedContent: ReactNode;
  defaultExpanded?: boolean;
  variant?: 'inline' | 'modal';
  className?: string;
}

/**
 * Inline expansion variant
 */
export function ExpandableSectionInline({
  title,
  summary,
  detailedContent,
  defaultExpanded = false,
  className = ''
}: ExpandableSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Summary Content */}
      <div>{summary}</div>

      {/* Expand/Collapse Button */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="
          inline-flex items-center gap-2 px-4 py-2
          bg-gradient-to-r from-neon-cyan/10 to-neon-green/10
          hover:from-neon-cyan/20 hover:to-neon-green/20
          border border-neon-cyan/30 hover:border-neon-cyan/50
          rounded-lg
          text-sm font-medium text-neon-cyan
          transition-all duration-200
          group
        "
      >
        <BookOpen className="w-4 h-4" />
        <span>{isExpanded ? 'Ver Menos' : 'Saiba Mais'}</span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
        ) : (
          <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="
          mt-4 p-6
          bg-gradient-to-br from-tech-gray-800/50 to-tech-gray-900/50
          border border-tech-gray-700
          rounded-lg
          animate-fade-in
        ">
          <h4 className="text-lg font-semibold text-tech-gray-100 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-neon-cyan" />
            {title}
          </h4>
          <div className="text-tech-gray-300 leading-relaxed">
            {detailedContent}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Modal expansion variant
 */
export function ExpandableSectionModal({
  title,
  summary,
  detailedContent,
  className = ''
}: ExpandableSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        {/* Summary Content */}
        <div>{summary}</div>

        {/* Learn More Button */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="
            inline-flex items-center gap-2 px-4 py-2
            bg-gradient-to-r from-neon-cyan/10 to-neon-green/10
            hover:from-neon-cyan/20 hover:to-neon-green/20
            border border-neon-cyan/30 hover:border-neon-cyan/50
            rounded-lg
            text-sm font-medium text-neon-cyan
            transition-all duration-200
            hover:scale-105
            group
          "
        >
          <BookOpen className="w-4 h-4" />
          <span>Saiba Mais</span>
          <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
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
              relative w-full max-w-3xl max-h-[85vh] overflow-y-auto
              bg-gradient-to-br from-tech-gray-900 to-tech-gray-800
              border border-neon-cyan/30
              rounded-xl shadow-2xl shadow-neon-cyan/20
              animate-slide-up
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-tech-gray-900/95 backdrop-blur-sm border-b border-tech-gray-700">
              <h3 className="text-xl font-bold text-tech-gray-100 flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-neon-cyan" />
                {title}
              </h3>
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

            {/* Content */}
            <div className="px-6 py-6">
              {/* Summary Section */}
              <div className="mb-6 p-4 bg-neon-cyan/5 border-l-4 border-neon-cyan rounded-r">
                <h4 className="text-sm font-semibold text-neon-cyan mb-2">Resumo</h4>
                <div className="text-tech-gray-300">
                  {summary}
                </div>
              </div>

              {/* Detailed Content */}
              <div className="text-tech-gray-200 leading-relaxed space-y-4">
                {detailedContent}
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 px-6 py-4 bg-tech-gray-900/95 backdrop-blur-sm border-t border-tech-gray-700">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="
                  w-full px-4 py-2
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
 * Default export uses modal variant
 */
export default function ExpandableSection(props: ExpandableSectionProps) {
  const { variant = 'modal' } = props;

  if (variant === 'inline') {
    return <ExpandableSectionInline {...props} />;
  }

  return <ExpandableSectionModal {...props} />;
}
