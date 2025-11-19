/**
 * Smart Progress Indicator for Adaptive Assessment
 *
 * Shows:
 * - Completeness percentage (not raw question count)
 * - Visual breakdown of essential/important/optional fields
 * - Estimated questions remaining
 * - Topics covered
 * - Dynamic progress label
 */

'use client';

import { CompletionMetrics } from '@/lib/types';
import { CheckCircle, Circle, TrendingUp, Target, Sparkles } from 'lucide-react';

interface QuestionProgressProps {
  completion: CompletionMetrics;
  questionsAsked: number;
  estimatedRemaining?: { min: number; max: number };
  showDetails?: boolean;
  compact?: boolean;
}

export default function QuestionProgress({
  completion,
  questionsAsked,
  estimatedRemaining,
  showDetails = false,
  compact = false
}: QuestionProgressProps) {
  const { completenessScore, essentialFieldsCollected, totalFieldsCollected, topicsCovered, gapsIdentified } = completion;

  // Calculate essential fields total (hardcoded based on completeness-scorer.ts)
  const ESSENTIAL_FIELDS_TOTAL = 5;
  const essentialPercentage = Math.round((essentialFieldsCollected / ESSENTIAL_FIELDS_TOTAL) * 100);

  // Progress label
  const getProgressLabel = () => {
    if (completenessScore >= 90) return { text: 'Excelente', color: 'text-emerald-400' };
    if (completenessScore >= 80) return { text: 'Quase pronto', color: 'text-neon-green' };
    if (completenessScore >= 60) return { text: 'Bom progresso', color: 'text-neon-cyan' };
    if (completenessScore >= 40) return { text: 'Avançando', color: 'text-blue-400' };
    return { text: 'Começando', color: 'text-gray-400' };
  };

  const getProgressColor = () => {
    if (completenessScore >= 80) return 'from-neon-green to-emerald-400';
    if (completenessScore >= 60) return 'from-neon-cyan to-neon-green';
    if (completenessScore >= 40) return 'from-blue-400 to-neon-cyan';
    return 'from-gray-400 to-blue-400';
  };

  const progressLabel = getProgressLabel();

  // Compact version (for header)
  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className={`text-xs font-medium ${progressLabel.color}`}>
            {progressLabel.text}
          </div>
          <div className="text-sm font-semibold text-white">
            {completenessScore}%
          </div>
        </div>
        <div className="w-32 h-2 bg-tech-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${getProgressColor()} transition-all duration-500`}
            style={{ width: `${completenessScore}%` }}
          />
        </div>
      </div>
    );
  }

  // Full detailed version
  return (
    <div className="space-y-4">
      {/* Main Progress Circle + Bar */}
      <div className="flex items-center gap-4">
        {/* Circular Progress */}
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg className="w-20 h-20 transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="40"
              cy="40"
              r="36"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              className="text-tech-gray-800"
            />
            {/* Progress circle */}
            <circle
              cx="40"
              cy="40"
              r="36"
              stroke="url(#progressGradient)"
              strokeWidth="6"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 36}`}
              strokeDashoffset={`${2 * Math.PI * 36 * (1 - completenessScore / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" className={completenessScore >= 80 ? 'text-neon-green' : 'text-neon-cyan'} stopColor="currentColor" />
                <stop offset="100%" className={completenessScore >= 80 ? 'text-emerald-400' : 'text-neon-green'} stopColor="currentColor" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-white">{completenessScore}%</span>
          </div>
        </div>

        {/* Progress Info */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-sm font-semibold ${progressLabel.color}`}>
              {progressLabel.text}
            </span>
            <span className="text-xs text-tech-gray-500">
              {questionsAsked} pergunta{questionsAsked !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-tech-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getProgressColor()} transition-all duration-500`}
              style={{ width: `${completenessScore}%` }}
            />
          </div>

          {/* Estimated Remaining */}
          {estimatedRemaining && (
            <div className="text-xs text-tech-gray-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {completenessScore >= 80 ? (
                <span>Pronto para gerar relatório</span>
              ) : (
                <span>~{estimatedRemaining.min}-{estimatedRemaining.max} perguntas restantes</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Detailed Breakdown (if showDetails) */}
      {showDetails && (
        <div className="space-y-3 pt-3 border-t border-tech-gray-800">
          {/* Essential Fields */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Target className="w-3 h-3 text-neon-green" />
                <span className="text-tech-gray-400 font-medium">Campos Essenciais</span>
              </div>
              <span className="text-white font-semibold">
                {essentialFieldsCollected}/{ESSENTIAL_FIELDS_TOTAL}
              </span>
            </div>
            <div className="h-1.5 bg-tech-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-neon-green transition-all duration-500"
                style={{ width: `${essentialPercentage}%` }}
              />
            </div>
          </div>

          {/* Total Fields */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-neon-cyan" />
                <span className="text-tech-gray-400 font-medium">Total de Dados</span>
              </div>
              <span className="text-white font-semibold">
                {totalFieldsCollected} campos
              </span>
            </div>
          </div>

          {/* Topics Covered */}
          {topicsCovered.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span className="text-tech-gray-400 font-medium">Tópicos Cobertos</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {topicsCovered.slice(0, 8).map((topic, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 text-xs bg-purple-500/10 text-purple-300 rounded border border-purple-500/20"
                  >
                    {topic}
                  </span>
                ))}
                {topicsCovered.length > 8 && (
                  <span className="px-2 py-0.5 text-xs text-tech-gray-500">
                    +{topicsCovered.length - 8} mais
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Gaps Identified (if any and not complete) */}
          {gapsIdentified.length > 0 && completenessScore < 80 && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <Circle className="w-3 h-3 text-yellow-400" />
                <span className="text-tech-gray-400 font-medium">Próximos Focos</span>
              </div>
              <div className="text-xs text-tech-gray-500">
                {gapsIdentified.slice(0, 3).map(gap => gap.split('.').pop()).join(', ')}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Compact version for inline use
 */
export function QuestionProgressCompact({
  completion,
  questionsAsked
}: {
  completion: CompletionMetrics;
  questionsAsked: number;
}) {
  return (
    <QuestionProgress
      completion={completion}
      questionsAsked={questionsAsked}
      compact={true}
    />
  );
}

/**
 * Detailed version with all metrics
 */
export function QuestionProgressDetailed({
  completion,
  questionsAsked,
  estimatedRemaining
}: {
  completion: CompletionMetrics;
  questionsAsked: number;
  estimatedRemaining?: { min: number; max: number };
}) {
  return (
    <QuestionProgress
      completion={completion}
      questionsAsked={questionsAsked}
      estimatedRemaining={estimatedRemaining}
      showDetails={true}
    />
  );
}
