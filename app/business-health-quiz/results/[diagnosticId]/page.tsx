'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AREA_METADATA } from '@/lib/business-quiz/area-relationships';
import type { BusinessDiagnostic, BusinessArea } from '@/lib/business-quiz/types';

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const diagnosticId = params.diagnosticId as string;

  const [diagnostic, setDiagnostic] = useState<BusinessDiagnostic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'recommendations' | 'roadmap'>('overview');

  useEffect(() => {
    // For now, load from localStorage (in production, fetch from API)
    const stored = localStorage.getItem(`diagnostic-${diagnosticId}`);
    if (stored) {
      setDiagnostic(JSON.parse(stored));
    }
    setIsLoading(false);
  }, [diagnosticId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'attention':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'good':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'excellent':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'critical':
        return 'Crítico';
      case 'attention':
        return 'Atenção';
      case 'good':
        return 'Bom';
      case 'excellent':
        return 'Excelente';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-600';
      case 'high':
        return 'bg-orange-600';
      case 'medium':
        return 'bg-yellow-600';
      case 'low':
        return 'bg-green-600';
      default:
        return 'bg-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando diagnóstico...</p>
        </div>
      </div>
    );
  }

  if (!diagnostic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Diagnóstico não encontrado</h2>
          <button
            onClick={() => router.push('/business-health-quiz')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Fazer novo diagnóstico
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">CB</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CulturaBuilder</h1>
                <p className="text-xs text-gray-600">Business Health Diagnostic</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium">
                📥 Baixar PDF
              </button>
              <button
                onClick={() => router.push('/business-health-quiz')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Novo Diagnóstico
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Diagnóstico: {diagnostic.assessmentData?.company?.name || 'Sua Empresa'}
              </h1>
              <p className="text-blue-100 text-lg">
                Gerado em {new Date(diagnostic.generatedAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="text-center">
              <div className="text-7xl font-bold">{diagnostic.overallScore}</div>
              <div className="text-blue-100 text-sm">Score Geral</div>
            </div>
          </div>

          {diagnostic.executiveSummary && (
            <div className="mt-6 bg-white/10 rounded-lg p-4">
              <p className="text-sm whitespace-pre-line">{diagnostic.executiveSummary}</p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b">
          {[
            { key: 'overview', label: 'Visão Geral', icon: '📊' },
            { key: 'recommendations', label: 'Recomendações', icon: '🎯' },
            { key: 'roadmap', label: 'Roadmap 90 Dias', icon: '🗺️' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === tab.key
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Health Scores Grid */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Health Scores por Área</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {diagnostic.healthScores.map((score) => (
                  <div
                    key={score.area}
                    className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{AREA_METADATA[score.area].icon}</div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {AREA_METADATA[score.area].name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {AREA_METADATA[score.area].description}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-end justify-between mb-3">
                      <div className="text-4xl font-bold text-gray-900">{score.score}</div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          score.status
                        )}`}
                      >
                        {getStatusLabel(score.status)}
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          score.score >= 70
                            ? 'bg-green-500'
                            : score.score >= 50
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${score.score}%` }}
                      />
                    </div>

                    {score.keyMetrics.length > 0 && (
                      <div className="space-y-2 text-sm">
                        {score.keyMetrics.slice(0, 2).map((metric, i) => (
                          <div key={i} className="flex justify-between text-gray-600">
                            <span>{metric.name}:</span>
                            <span className="font-medium">{metric.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Detected Patterns */}
            {diagnostic.detectedPatterns && diagnostic.detectedPatterns.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Padrões Detectados</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {diagnostic.detectedPatterns.map((pattern, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-orange-500"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="text-2xl">⚠️</div>
                        <div>
                          <h3 className="font-bold text-gray-900 mb-1">{pattern.pattern}</h3>
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              pattern.impact === 'high'
                                ? 'bg-red-100 text-red-800'
                                : pattern.impact === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            Impacto: {pattern.impact}
                          </span>
                        </div>
                      </div>
                      <ul className="space-y-1 text-sm text-gray-600">
                        {pattern.evidence.map((evidence, j) => (
                          <li key={j} className="flex items-start gap-2">
                            <span className="text-gray-400">•</span>
                            <span>{evidence}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Root Causes */}
            {diagnostic.rootCauses && diagnostic.rootCauses.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Root Causes</h2>
                <div className="space-y-4">
                  {diagnostic.rootCauses.map((cause, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-red-500"
                    >
                      <h3 className="font-bold text-gray-900 mb-2">{cause.issue}</h3>
                      <p className="text-gray-600 mb-3">{cause.explanation}</p>
                      <div className="flex flex-wrap gap-2">
                        {cause.relatedAreas.map((area) => (
                          <span
                            key={area}
                            className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700"
                          >
                            {AREA_METADATA[area as BusinessArea]?.name || area}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recomendações Priorizadas</h2>
            <div className="space-y-6">
              {diagnostic.recommendations
                .sort((a, b) => {
                  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                  return priorityOrder[a.priority] - priorityOrder[b.priority];
                })
                .map((rec, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`w-3 h-3 rounded-full ${getPriorityColor(
                              rec.priority
                            )}`}
                          ></span>
                          <h3 className="text-xl font-bold text-gray-900">{rec.title}</h3>
                        </div>
                        <div className="flex gap-2 mb-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {AREA_METADATA[rec.area]?.name || rec.area}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                            {rec.timeframe}
                          </span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                            Esforço: {rec.effort}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4">{rec.description}</p>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3">
                      <div className="text-sm font-medium text-green-900 mb-1">
                        💡 Impacto Esperado
                      </div>
                      <div className="text-sm text-green-800">{rec.expectedImpact}</div>
                    </div>

                    {rec.dependencies && rec.dependencies.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        <span className="text-sm text-gray-600">Dependências:</span>
                        {rec.dependencies.map((dep) => (
                          <span
                            key={dep}
                            className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium"
                          >
                            {AREA_METADATA[dep as BusinessArea]?.name || dep}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Roadmap Tab */}
        {activeTab === 'roadmap' && diagnostic.roadmap && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Roadmap 90 Dias</h2>
            <div className="space-y-8">
              {diagnostic.roadmap.map((phase, i) => (
                <div key={i} className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {phase.phase === '30-days' ? '30' : phase.phase === '60-days' ? '60' : '90'}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {phase.phase === '30-days'
                          ? 'Primeiros 30 Dias'
                          : phase.phase === '60-days'
                          ? '30-60 Dias'
                          : '60-90 Dias'}
                      </h3>
                      <div className="flex gap-2 mt-1">
                        {phase.focus.map((area) => (
                          <span
                            key={area}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium"
                          >
                            {AREA_METADATA[area as BusinessArea]?.name || area}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {phase.keyActions.map((action, j) => (
                      <div key={j} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <span className="text-blue-600 font-bold">{j + 1}.</span>
                        <span className="text-gray-700">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
