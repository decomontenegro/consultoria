/**
 * AI Suggested Responses Component
 *
 * Displays contextual response suggestions to guide users
 * during AI conversations
 */

'use client';

import { ResponseSuggestion } from '@/lib/ai/response-suggestions';
import { Sparkles, Info } from 'lucide-react';

interface AISuggestedResponsesProps {
  suggestions: ResponseSuggestion[];
  onSelect: (text: string) => void;
  isLoading?: boolean;
  className?: string;
}

export default function AISuggestedResponses({
  suggestions,
  onSelect,
  isLoading = false,
  className = ''
}: AISuggestedResponsesProps) {

  if (suggestions.length === 0 || isLoading) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 text-xs text-tech-gray-500">
        <Sparkles className="w-3.5 h-3.5 text-neon-cyan" />
        <span>Sugestões de respostas:</span>
      </div>

      {/* Suggestion Chips */}
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelect(suggestion.text)}
            className="
              inline-flex items-center gap-2 px-4 py-2.5
              bg-gradient-to-r from-tech-gray-800 to-tech-gray-700
              hover:from-neon-cyan/20 hover:to-neon-green/20
              border border-tech-gray-600 hover:border-neon-cyan/50
              rounded-full
              text-sm text-tech-gray-200 hover:text-neon-cyan
              transition-all duration-200
              shadow-sm hover:shadow-neon-cyan/20
              cursor-pointer
              group
            "
            type="button"
          >
            <span className="font-medium">{suggestion.text}</span>
          </button>
        ))}
      </div>

      {/* Helper Text */}
      <p className="text-xs text-tech-gray-600 italic">
        Clique em uma sugestão ou escreva sua própria resposta
      </p>
    </div>
  );
}

/**
 * Compact version for inline use
 */
export function AISuggestedResponsesCompact({
  suggestions,
  onSelect,
  isLoading = false
}: AISuggestedResponsesProps) {

  if (suggestions.length === 0 || isLoading) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {suggestions.slice(0, 3).map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSelect(suggestion.text)}
          className="
            inline-flex items-center gap-1.5 px-3 py-1.5
            bg-tech-gray-800/50 hover:bg-neon-cyan/10
            border border-tech-gray-700 hover:border-neon-cyan/50
            rounded-full
            text-xs text-tech-gray-300 hover:text-neon-cyan
            transition-all duration-150
            cursor-pointer
          "
          type="button"
        >
          <span>{suggestion.text}</span>
        </button>
      ))}
    </div>
  );
}

/**
 * Animated version with fade-in
 */
export function AISuggestedResponsesAnimated({
  suggestions,
  onSelect,
  isLoading = false,
  className = ''
}: AISuggestedResponsesProps) {

  if (suggestions.length === 0 || isLoading) {
    return null;
  }

  return (
    <div className={`space-y-3 animate-fade-in ${className}`}>
      {/* Header with glow */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Sparkles className="w-4 h-4 text-neon-cyan animate-pulse" />
          <div className="absolute inset-0 blur-md bg-neon-cyan opacity-50"></div>
        </div>
        <span className="text-sm text-tech-gray-400 font-medium">
          Algumas ideias para você:
        </span>
      </div>

      {/* Animated Chips Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelect(suggestion.text)}
            style={{ animationDelay: `${index * 50}ms` }}
            className="
              flex items-center gap-3 px-4 py-3
              bg-gradient-to-br from-tech-gray-800/80 to-tech-gray-900/80
              hover:from-neon-cyan/10 hover:to-neon-green/10
              border border-tech-gray-700 hover:border-neon-cyan/60
              rounded-lg
              text-left text-sm text-tech-gray-200 hover:text-neon-cyan
              transition-all duration-300
              shadow-sm hover:shadow-lg hover:shadow-neon-cyan/20
              hover:scale-105
              cursor-pointer
              group
              animate-slide-up
            "
            type="button"
          >
            <span className="font-medium flex-1">{suggestion.text}</span>
            <svg
              className="w-5 h-5 text-tech-gray-600 group-hover:text-neon-cyan transition-colors opacity-0 group-hover:opacity-100"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>

      {/* Info Banner */}
      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-neon-cyan/5 to-transparent border-l-2 border-neon-cyan/40 rounded-r">
        <Info className="w-4 h-4 text-neon-cyan" />
        <p className="text-xs text-tech-gray-500">
          Escolha uma sugestão ou digite sua resposta personalizada abaixo
        </p>
      </div>
    </div>
  );
}
