/**
 * Consultant Insights Section - Display deep insights from PhD consultant
 *
 * UPDATED: Now displays confidence levels prominently and adjusts language based on confidence
 */

'use client';

import { AlertTriangle, TrendingUp, DollarSign, Target, CheckCircle2, XCircle, Info } from 'lucide-react';

interface Pattern {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence: string[];
}

interface Recommendation {
  priority: number;
  action: string;
  reasoning: string;
  impact: 'low' | 'medium' | 'high';
  estimatedCost: string;
  timeframe: string;
}

interface RedFlag {
  flag: string;
  severity: 'warning' | 'critical';
  reasoning: string;
  consequence: string;
}

interface DeepInsights {
  patterns: Pattern[];
  rootCauses: {
    primary: string;
    secondary: string[];
    reasoning: string;
  };
  financialImpact: {
    directCostMonthly: number;
    opportunityCostAnnual: number;
    totalAnnualImpact: number;
    confidence: number;
    breakdown: string;
  };
  urgencyAnalysis: {
    timelinePressure: string;
    budgetAdequacy: 'under-budgeted' | 'adequate' | 'over-budgeted';
    roi: number;
    recommendation: string;
  };
  recommendations: Recommendation[];
  redFlags: RedFlag[];
  executiveSummary: string;
}

interface Props {
  insights: DeepInsights;
}

export default function ConsultantInsightsSection({ insights }: Props) {
  if (!insights) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'high':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'low':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      default:
        return 'text-tech-gray-400 bg-tech-gray-800 border-tech-gray-700';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-blue-400';
      default:
        return 'text-tech-gray-400';
    }
  };

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="border-b border-tech-gray-800 pb-6">
        <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-xl">🧠</span>
          </div>
          Análise do Consultor Virtual
        </h2>
        <p className="text-tech-gray-300 leading-relaxed">
          {insights.executiveSummary}
        </p>
      </div>

      {/* Patterns Detected */}
      {insights.patterns && insights.patterns.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            Padrões Críticos Detectados
          </h3>
          <div className="space-y-4">
            {insights.patterns.map((pattern, index) => (
              <div
                key={index}
                className={`border rounded-lg p-5 ${getSeverityColor(pattern.severity)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs uppercase tracking-wider font-semibold opacity-75">
                        {pattern.type.replace(/-/g, ' ')}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded border ${getSeverityColor(pattern.severity)}`}>
                        {pattern.severity}
                      </span>
                    </div>
                    <h4 className="font-semibold text-lg">{pattern.description}</h4>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium opacity-75">Evidências:</p>
                  <ul className="space-y-1">
                    {pattern.evidence.map((ev, idx) => (
                      <li key={idx} className="text-sm opacity-90 flex items-start gap-2">
                        <span className="text-purple-400 mt-1">•</span>
                        <span>{ev}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Root Causes */}
      {insights.rootCauses && (
        <div>
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-400" />
            Causas Raiz
          </h3>
          <div className="bg-tech-gray-900 border border-tech-gray-800 rounded-lg p-6 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-orange-400 mb-2 font-semibold">
                Causa Principal
              </p>
              <p className="text-lg font-medium text-white">{insights.rootCauses.primary}</p>
            </div>

            {insights.rootCauses.secondary && insights.rootCauses.secondary.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wider text-tech-gray-400 mb-2 font-semibold">
                  Causas Secundárias
                </p>
                <ul className="space-y-2">
                  {insights.rootCauses.secondary.map((cause, idx) => (
                    <li key={idx} className="text-tech-gray-300 flex items-start gap-2">
                      <span className="text-orange-400 mt-1">→</span>
                      <span>{cause}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-4 border-t border-tech-gray-800">
              <p className="text-sm text-tech-gray-400">{insights.rootCauses.reasoning}</p>
            </div>
          </div>
        </div>
      )}

      {/* Financial Impact */}
      {insights.financialImpact && (
        <div>
          {/* Header with Confidence Badge */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              {/* UPDATED: Change title based on confidence */}
              {insights.financialImpact.confidence >= 0.8
                ? 'Impacto Financeiro Real'
                : insights.financialImpact.confidence >= 0.6
                ? 'Impacto Financeiro Estimado'
                : 'Impacto Financeiro Projetado'}
            </h3>

            {/* UPDATED: Prominent confidence badge */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
              insights.financialImpact.confidence >= 0.8
                ? 'bg-neon-green/20 border-neon-green/40 text-neon-green'
                : insights.financialImpact.confidence >= 0.6
                ? 'bg-yellow-400/20 border-yellow-400/40 text-yellow-400'
                : 'bg-orange-400/20 border-orange-400/40 text-orange-400'
            }`}>
              <Info className="w-4 h-4" />
              <span className="text-sm font-semibold">
                {(insights.financialImpact.confidence * 100).toFixed(0)}% confiança
              </span>
            </div>
          </div>

          <div className={`border rounded-lg p-6 ${
            insights.financialImpact.confidence >= 0.8
              ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30'
              : insights.financialImpact.confidence >= 0.6
              ? 'bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/30'
              : 'bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <p className={`text-xs uppercase tracking-wider mb-2 ${
                  insights.financialImpact.confidence >= 0.8 ? 'text-green-400' :
                  insights.financialImpact.confidence >= 0.6 ? 'text-yellow-400' :
                  'text-orange-400'
                }`}>
                  Custo Mensal Direto
                </p>
                <p className="text-3xl font-bold text-white">
                  R$ {(insights.financialImpact.directCostMonthly / 1000).toFixed(0)}k
                </p>
                <p className="text-xs text-tech-gray-400 mt-1">Produtividade perdida</p>
              </div>

              <div>
                <p className={`text-xs uppercase tracking-wider mb-2 ${
                  insights.financialImpact.confidence >= 0.8 ? 'text-green-400' :
                  insights.financialImpact.confidence >= 0.6 ? 'text-yellow-400' :
                  'text-orange-400'
                }`}>
                  Custo de Oportunidade (Anual)
                </p>
                <p className="text-3xl font-bold text-white">
                  R$ {(insights.financialImpact.opportunityCostAnnual / 1000).toFixed(0)}k
                </p>
                <p className="text-xs text-tech-gray-400 mt-1">Receita em risco</p>
              </div>

              <div>
                <p className={`text-xs uppercase tracking-wider mb-2 ${
                  insights.financialImpact.confidence >= 0.8 ? 'text-green-400' :
                  insights.financialImpact.confidence >= 0.6 ? 'text-yellow-400' :
                  'text-orange-400'
                }`}>
                  Impacto Total (Anual)
                </p>
                <p className="text-3xl font-bold text-white">
                  R$ {(insights.financialImpact.totalAnnualImpact / 1000000).toFixed(2)}M
                </p>
                <p className="text-xs text-tech-gray-400 mt-1">
                  {insights.financialImpact.confidence >= 0.8
                    ? 'Alta precisão'
                    : insights.financialImpact.confidence >= 0.6
                    ? 'Precisão moderada'
                    : 'Estimativa conservadora'}
                </p>
              </div>
            </div>

            <div className={`pt-4 border-t ${
              insights.financialImpact.confidence >= 0.8 ? 'border-green-500/20' :
              insights.financialImpact.confidence >= 0.6 ? 'border-yellow-500/20' :
              'border-orange-500/20'
            }`}>
              <p className="text-sm text-tech-gray-300 leading-relaxed">
                <strong>Como calculamos:</strong> {insights.financialImpact.breakdown}
              </p>

              {/* UPDATED: Add disclaimer for low confidence */}
              {insights.financialImpact.confidence < 0.8 && (
                <div className={`mt-3 p-3 rounded border ${
                  insights.financialImpact.confidence >= 0.6
                    ? 'bg-yellow-500/5 border-yellow-500/20'
                    : 'bg-orange-500/5 border-orange-500/20'
                }`}>
                  <p className="text-xs text-tech-gray-400 flex items-start gap-2">
                    <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>
                      {insights.financialImpact.confidence >= 0.6
                        ? 'Dados parciais disponíveis. Forneça métricas adicionais (receita, tamanho do time, custos) para aumentar precisão.'
                        : 'Estimativa baseada em perfil genérico. Valores reais podem variar significativamente. Forneça dados específicos da empresa para análise precisa.'}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Urgency Analysis */}
      {insights.urgencyAnalysis && (
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Urgência vs Budget</h3>
          <div className="bg-tech-gray-900 border border-tech-gray-800 rounded-lg p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs uppercase tracking-wider text-tech-gray-400 mb-2">
                  Pressão de Timeline
                </p>
                <p className="text-white">{insights.urgencyAnalysis.timelinePressure}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-tech-gray-400 mb-2">
                  ROI Estimado
                </p>
                <p className="text-2xl font-bold text-green-400">
                  {insights.urgencyAnalysis.roi.toFixed(1)}x em 1 ano
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-tech-gray-800">
              <p className="text-sm text-tech-gray-300">
                <strong>Adequação do Budget:</strong>{' '}
                <span
                  className={
                    insights.urgencyAnalysis.budgetAdequacy === 'under-budgeted'
                      ? 'text-red-400'
                      : insights.urgencyAnalysis.budgetAdequacy === 'adequate'
                      ? 'text-green-400'
                      : 'text-yellow-400'
                  }
                >
                  {insights.urgencyAnalysis.budgetAdequacy}
                </span>
              </p>
              <p className="text-sm text-tech-gray-400 mt-2">
                {insights.urgencyAnalysis.recommendation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {insights.recommendations && insights.recommendations.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-400" />
            Recomendações Estratégicas
          </h3>
          <div className="space-y-4">
            {insights.recommendations
              .sort((a, b) => a.priority - b.priority)
              .map((rec) => (
                <div
                  key={rec.priority}
                  className="bg-tech-gray-900 border border-tech-gray-800 rounded-lg p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                      <span className="text-blue-400 font-bold text-sm">#{rec.priority}</span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-lg font-semibold text-white">{rec.action}</h4>
                        <span className={`text-xs px-2 py-1 rounded border ${getImpactColor(rec.impact)} bg-current/10`}>
                          {rec.impact} impact
                        </span>
                      </div>

                      <p className="text-tech-gray-300 text-sm mb-4 leading-relaxed">
                        {rec.reasoning}
                      </p>

                      <div className="flex items-center gap-6 text-xs text-tech-gray-400">
                        <span>
                          <strong>Custo:</strong> {rec.estimatedCost}
                        </span>
                        <span>
                          <strong>Prazo:</strong> {rec.timeframe}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Red Flags */}
      {insights.redFlags && insights.redFlags.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Riscos Críticos
          </h3>
          <div className="space-y-3">
            {insights.redFlags.map((flag, index) => (
              <div
                key={index}
                className={`border rounded-lg p-5 ${
                  flag.severity === 'critical'
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-yellow-500/10 border-yellow-500/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <XCircle
                    className={`w-5 h-5 flex-shrink-0 mt-1 ${
                      flag.severity === 'critical' ? 'text-red-400' : 'text-yellow-400'
                    }`}
                  />
                  <div className="flex-1">
                    <h4
                      className={`font-semibold mb-2 ${
                        flag.severity === 'critical' ? 'text-red-400' : 'text-yellow-400'
                      }`}
                    >
                      {flag.flag}
                    </h4>
                    <p className="text-sm text-tech-gray-300 mb-2">{flag.reasoning}</p>
                    <p className="text-xs text-tech-gray-400 italic">
                      <strong>Se ignorado:</strong> {flag.consequence}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
