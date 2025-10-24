/**
 * TooltipExplainer Component
 *
 * Provides contextual help via tooltips with Lucide icons
 * Used throughout report sections for inline explanations
 */

'use client';

import { useState } from 'react';
import { HelpCircle, Info, AlertCircle, Lightbulb } from 'lucide-react';

export type TooltipType = 'help' | 'info' | 'alert' | 'tip';

interface TooltipExplainerProps {
  content: string;
  type?: TooltipType;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const iconMap = {
  help: HelpCircle,
  info: Info,
  alert: AlertCircle,
  tip: Lightbulb
};

const colorMap = {
  help: 'text-neon-cyan hover:text-neon-cyan/80',
  info: 'text-blue-400 hover:text-blue-300',
  alert: 'text-yellow-400 hover:text-yellow-300',
  tip: 'text-neon-green hover:text-neon-green/80'
};

const positionClasses = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2'
};

export default function TooltipExplainer({
  content,
  type = 'help',
  position = 'top',
  className = ''
}: TooltipExplainerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const Icon = iconMap[type];

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Trigger Icon */}
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className={`
          inline-flex items-center justify-center
          w-5 h-5 rounded-full
          transition-all duration-200
          ${colorMap[type]}
          hover:scale-110
          focus:outline-none focus:ring-2 focus:ring-neon-cyan/50
        `}
        aria-label="Show explanation"
      >
        <Icon className="w-4 h-4" />
      </button>

      {/* Tooltip */}
      {isVisible && (
        <div
          className={`
            absolute z-50 w-64 px-4 py-3
            bg-tech-gray-900 border border-tech-gray-700
            rounded-lg shadow-xl
            text-sm text-tech-gray-200 leading-relaxed
            animate-fade-in
            ${positionClasses[position]}
          `}
          role="tooltip"
        >
          {/* Arrow */}
          <div
            className={`
              absolute w-2 h-2 bg-tech-gray-900 border-tech-gray-700
              rotate-45
              ${position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1 border-r border-b' : ''}
              ${position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1 border-l border-t' : ''}
              ${position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1 border-t border-r' : ''}
              ${position === 'right' ? 'right-full top-1/2 -translate-y-1/2 -mr-1 border-b border-l' : ''}
            `}
          />

          {/* Content */}
          <p className="relative z-10">{content}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Inline variant that appears next to text
 */
export function InlineTooltipExplainer({
  content,
  type = 'help'
}: Pick<TooltipExplainerProps, 'content' | 'type'>) {
  return (
    <TooltipExplainer
      content={content}
      type={type}
      position="top"
      className="ml-1.5 align-middle"
    />
  );
}

/**
 * Section header variant with larger icon
 */
export function SectionTooltipExplainer({
  content,
  type = 'info'
}: Pick<TooltipExplainerProps, 'content' | 'type'>) {
  const [isVisible, setIsVisible] = useState(false);
  const Icon = iconMap[type];

  return (
    <div className="relative inline-block ml-2">
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className={`
          inline-flex items-center justify-center
          w-6 h-6 rounded-full
          bg-tech-gray-800/50 border border-tech-gray-700
          transition-all duration-200
          ${colorMap[type]}
          hover:scale-110 hover:border-neon-cyan/50
          focus:outline-none focus:ring-2 focus:ring-neon-cyan/50
        `}
        aria-label="Show section explanation"
      >
        <Icon className="w-4 h-4" />
      </button>

      {isVisible && (
        <div
          className="
            absolute z-50 w-80 px-5 py-4
            top-full left-1/2 -translate-x-1/2 mt-2
            bg-gradient-to-br from-tech-gray-900 to-tech-gray-800
            border border-neon-cyan/30
            rounded-lg shadow-2xl shadow-neon-cyan/10
            text-sm text-tech-gray-200 leading-relaxed
            animate-fade-in
          "
          role="tooltip"
        >
          {/* Arrow */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 w-2 h-2 bg-tech-gray-900 border-l border-t border-neon-cyan/30 rotate-45" />

          {/* Content */}
          <p className="relative z-10">{content}</p>
        </div>
      )}
    </div>
  );
}
