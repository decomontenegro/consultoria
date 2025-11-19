/**
 * Completion Summary Component
 *
 * Displays summary of collected data before generating report
 * Shows what was covered, completeness metrics, and preview of insights
 */

'use client';

import { CompletionMetrics } from '@/lib/types';
import { CheckCircle, Sparkles, TrendingUp, Target, Award } from 'lucide-react';

interface CompletionSummaryProps {
  completion: CompletionMetrics;
  questionsAsked: number;
  sessionDuration?: number; // in seconds
  onGenerateReport?: () => void;
  isGenerating?: boolean;
}

export default function CompletionSummary({
  completion,
  questionsAsked,
  sessionDuration,
  onGenerateReport,
  isGenerating = false
}: CompletionSummaryProps) {
  const { completenessScore, essentialFieldsCollected, totalFieldsCollected, topicsCovered } = completion;

  // Format duration
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Get completeness message
  const getCompletenessMessage = () => {
    if (completenessScore >= 90) {
      return {
        title: 'Avaliação Excepcional!',
        message: 'Coletamos informações muito completas para gerar um relatório detalhado e preciso.',
        icon: Award,
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-400/10',
        borderColor: 'border-emerald-400/30'
      };
    }
    if (completenessScore >= 80) {
      return {
        title: 'Avaliação Completa!',
        message: 'Temos todas as informações necessárias para gerar um relatório de alta qualidade.',
        icon: CheckCircle,
        color: 'text-neon-green',
        bgColor: 'bg-neon-green/10',
        borderColor: 'border-neon-green/30'
      };
    }
    if (completenessScore >= 70) {
      return {
        title: 'Avaliação Boa!',
        message: 'Coletamos informações suficientes para gerar um bom relatório com recomendações úteis.',
        icon: TrendingUp,
        color: 'text-neon-cyan',
        bgColor: 'bg-neon-cyan/10',
        borderColor: 'border-neon-cyan/30'
      };
    }
    return {
      title: 'Avaliação Básica',
      message: 'Vamos gerar seu relatório com as informações coletadas.',
      icon: Target,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      borderColor: 'border-blue-400/30'
    };
  };

  const completenessInfo = getCompletenessMessage();
  const Icon = completenessInfo.icon;

  return (
    <div className="space-y-6">
      {/* Main Completion Card */}
      <div className={`${completenessInfo.bgColor} border ${completenessInfo.borderColor} rounded-xl p-6`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-lg ${completenessInfo.bgColor} border ${completenessInfo.borderColor} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-6 h-6 ${completenessInfo.color}`} />
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${completenessInfo.color} mb-1`}>
              {completenessInfo.title}
            </h3>
            <p className="text-sm text-tech-gray-300">
              {completenessInfo.message}
            </p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${completenessInfo.color}`}>
              {completenessScore}%
            </div>
            <div className="text-xs text-tech-gray-500">Completude</div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Questions Asked */}
        <div className="card-dark p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-tech-gray-500">Perguntas</span>
          </div>
          <div className="text-2xl font-bold text-white">{questionsAsked}</div>
          <div className="text-xs text-tech-gray-500 mt-1">respondidas</div>
        </div>

        {/* Essential Fields */}
        <div className="card-dark p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-neon-green" />
            <span className="text-xs text-tech-gray-500">Essenciais</span>
          </div>
          <div className="text-2xl font-bold text-white">{essentialFieldsCollected}/5</div>
          <div className="text-xs text-tech-gray-500 mt-1">campos coletados</div>
        </div>

        {/* Session Duration */}
        {sessionDuration !== undefined && (
          <div className="card-dark p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-neon-cyan" />
              <span className="text-xs text-tech-gray-500">Duração</span>
            </div>
            <div className="text-2xl font-bold text-white">{formatDuration(sessionDuration)}</div>
            <div className="text-xs text-tech-gray-500 mt-1">minutos</div>
          </div>
        )}
      </div>

      {/* Topics Covered */}
      {topicsCovered.length > 0 && (
        <div className="card-dark p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-white">Tópicos Cobertos</span>
            <span className="text-xs text-tech-gray-500">({topicsCovered.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {topicsCovered.map((topic, idx) => (
              <span
                key={idx}
                className="px-3 py-1 text-xs bg-purple-500/10 text-purple-300 rounded-full border border-purple-500/20"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Generate Report Button */}
      {onGenerateReport && (
        <div className="pt-4">
          <button
            onClick={onGenerateReport}
            disabled={isGenerating}
            className="w-full btn-primary py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Gerando Relatório...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <Award className="w-5 h-5" />
                <span>Gerar Relatório Completo</span>
              </div>
            )}
          </button>
        </div>
      )}

      {/* Quality Badge */}
      {completenessScore >= 85 && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-neon-green/10 to-emerald-400/10 border border-neon-green/30 rounded-full">
            <Award className="w-4 h-4 text-neon-green" />
            <span className="text-sm font-semibold text-neon-green">
              Dados de Alta Qualidade
            </span>
          </div>
          <p className="text-xs text-tech-gray-500 mt-2">
            Seu relatório terá insights profundos e recomendações precisas
          </p>
        </div>
      )}
    </div>
  );
}
