/**
 * Triage Result Component
 *
 * Displays AI Readiness Urgency Score inspired by medical triage systems
 */

'use client';

import { TriageResult, getUrgencyStyle } from '@/lib/triage-engine';
import { AlertTriangle, TrendingUp, Clock, Target, Zap } from 'lucide-react';

interface TriageResultProps {
  result: TriageResult;
  showDetails?: boolean;
}

export default function TriageResultComponent({ result, showDetails = true }: TriageResultProps) {
  const style = getUrgencyStyle(result.urgencyLevel);

  return (
    <div className="space-y-6">
      {/* Main Score Card */}
      <div className={`card-glow p-8 border-2 ${style.border}`}>
        <div className="flex items-start gap-6">
          {/* Score Circle */}
          <div className="flex-shrink-0">
            <div
              className={`relative w-32 h-32 rounded-full border-4 ${style.border} ${style.bg} flex items-center justify-center`}
            >
              <div className="text-center">
                <div className={`text-4xl font-bold ${style.color}`}>{result.score}</div>
                <div className="text-xs text-tech-gray-400 mt-1">/ 100</div>
              </div>
            </div>
            <div className={`mt-3 text-center px-3 py-1 rounded-full ${style.bg} border ${style.border}`}>
              <span className={`text-sm font-bold ${style.color}`}>{style.label}</span>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className={`w-6 h-6 ${style.color}`} />
              <h3 className="text-2xl font-bold text-white">
                {result.urgencyLevel === 'critical' && 'Urgência Crítica Detectada'}
                {result.urgencyLevel === 'high' && 'Alta Urgência Identificada'}
                {result.urgencyLevel === 'standard' && 'Urgência Padrão'}
                {result.urgencyLevel === 'exploratory' && 'Fase Exploratória'}
              </h3>
            </div>

            <p className="text-tech-gray-300 mb-4">
              {result.urgencyLevel === 'critical' &&
                'Sua empresa enfrenta desafios críticos que requerem ação imediata. A transformação AI deve ser prioridade máxima.'}
              {result.urgencyLevel === 'high' &&
                'Indicadores significativos de urgência detectados. Recomendamos fast-track para implementação acelerada.'}
              {result.urgencyLevel === 'standard' &&
                'Sua empresa se beneficiaria de transformação AI com timeline estruturado e planejamento cuidadoso.'}
              {result.urgencyLevel === 'exploratory' &&
                'Momento ideal para explorar AI e estabelecer bases sólidas antes de investimento maior.'}
            </p>

            {/* Recommended Timeline */}
            <div className="flex items-center gap-3 bg-tech-gray-900/50 rounded-lg p-4">
              <Clock className="w-5 h-5 text-neon-cyan flex-shrink-0" />
              <div>
                <div className="text-sm font-semibold text-tech-gray-200">
                  Timeline Recomendado: {result.timeline.recommended}
                </div>
                <div className="text-xs text-tech-gray-400 mt-1">{result.timeline.rationale}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDetails && (
        <>
          {/* Urgency Indicators */}
          {result.urgencyIndicators.length > 0 && (
            <div className="card-dark p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-5 h-5 text-neon-green" />
                <h4 className="text-lg font-semibold text-white">Indicadores de Urgência</h4>
              </div>

              <div className="space-y-3">
                {result.urgencyIndicators.map((indicator, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-2 ${
                      indicator.severity === 'critical'
                        ? 'bg-red-500/5 border-red-500/20'
                        : indicator.severity === 'high'
                        ? 'bg-orange-500/5 border-orange-500/20'
                        : 'bg-yellow-500/5 border-yellow-500/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${
                              indicator.severity === 'critical'
                                ? 'bg-red-500/20 text-red-400'
                                : indicator.severity === 'high'
                                ? 'bg-orange-500/20 text-orange-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}
                          >
                            {indicator.severity.toUpperCase()}
                          </span>
                          <span className="text-sm font-semibold text-white">
                            {indicator.category}
                          </span>
                        </div>
                        <p className="text-sm text-tech-gray-300">{indicator.description}</p>
                      </div>
                      <div
                        className={`flex-shrink-0 text-2xl font-bold ${
                          indicator.severity === 'critical'
                            ? 'text-red-400'
                            : indicator.severity === 'high'
                            ? 'text-orange-400'
                            : 'text-yellow-400'
                        }`}
                      >
                        +{indicator.points}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Wins */}
          {result.quickWins.length > 0 && (
            <div className="card-glow p-6 border-neon-green/30">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-5 h-5 text-neon-green" />
                <h4 className="text-lg font-semibold text-white">Quick Wins Recomendados</h4>
                <span className="text-xs text-tech-gray-400">
                  (Ações imediatas de alto impacto)
                </span>
              </div>

              <div className="space-y-2">
                {result.quickWins.map((win, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 bg-neon-green/5 border border-neon-green/20 rounded-lg hover:bg-neon-green/10 transition-colors"
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neon-green/20 text-neon-green flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-tech-gray-200">{win}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Routing Recommendation (for internal use / sales team) */}
          <div className="card-dark p-6 border-l-4 border-neon-cyan">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-5 h-5 text-neon-cyan" />
              <h4 className="text-lg font-semibold text-white">Próximo Passo Recomendado</h4>
            </div>

            <div className="bg-neon-cyan/10 border border-neon-cyan/20 rounded-lg p-4">
              <div className="text-sm font-bold text-neon-cyan mb-2">
                {result.routingRecommendation.action}
              </div>
              <div className="text-sm text-tech-gray-300">
                {result.routingRecommendation.reason}
              </div>
            </div>
          </div>

          {/* Reasoning Summary */}
          <div className="card-dark p-6">
            <h4 className="text-sm font-semibold text-tech-gray-400 mb-3 uppercase tracking-wide">
              Metodologia do Score
            </h4>
            <ul className="space-y-2">
              {result.reasoning.map((reason, idx) => (
                <li key={idx} className="text-sm text-tech-gray-300 flex items-start gap-2">
                  <span className="text-neon-green mt-1">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Compact version for header/summary display
 */
export function TriageScoreBadge({ result }: { result: TriageResult }) {
  const style = getUrgencyStyle(result.urgencyLevel);

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${style.bg} border ${style.border}`}>
      <AlertTriangle className={`w-4 h-4 ${style.color}`} />
      <div className="flex items-center gap-2">
        <span className={`text-sm font-bold ${style.color}`}>{style.label}</span>
        <span className="text-xs text-tech-gray-500">•</span>
        <span className={`text-sm font-bold ${style.color}`}>{result.score}/100</span>
      </div>
    </div>
  );
}
