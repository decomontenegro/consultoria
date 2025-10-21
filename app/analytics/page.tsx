'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { getAllReports } from '@/lib/services/report-service';
import { Report } from '@/lib/types';
import { formatCurrency } from '@/lib/calculators/roi-calculator';
import { TrendingUp, BarChart3, Target, Award, Clock, DollarSign } from 'lucide-react';

export default function AnalyticsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const allReports = getAllReports();
    const reportsList = Object.values(allReports);
    setReports(reportsList);
    setLoading(false);
  }, []);

  const analytics = useMemo(() => {
    if (reports.length === 0) return null;

    const npvs = reports.map(r => r.roi.threeYearNPV);
    const paybacks = reports.map(r => r.roi.paybackPeriodMonths);
    const rois = reports.map(r => r.roi.irr);

    const avgNPV = npvs.reduce((a, b) => a + b, 0) / npvs.length;
    const avgPayback = paybacks.reduce((a, b) => a + b, 0) / paybacks.length;
    const avgROI = rois.reduce((a, b) => a + b, 0) / rois.length;

    const maxNPV = Math.max(...npvs);
    const minPayback = Math.min(...paybacks);
    const maxROI = Math.max(...rois);

    const bestScenario = reports.reduce((best, current) =>
      current.roi.threeYearNPV > best.roi.threeYearNPV ? current : best
    );

    const fastestPayback = reports.reduce((fastest, current) =>
      current.roi.paybackPeriodMonths < fastest.roi.paybackPeriodMonths ? current : fastest
    );

    // Industry breakdown
    const byIndustry: Record<string, number> = {};
    reports.forEach(r => {
      const industry = r.assessmentData.companyInfo.industry;
      byIndustry[industry] = (byIndustry[industry] || 0) + 1;
    });

    const mostCommonIndustry = Object.entries(byIndustry).sort((a, b) => b[1] - a[1])[0];

    // Confidence breakdown
    const highConfidence = reports.filter(r => r.roi.confidenceLevel === 'high').length;
    const mediumConfidence = reports.filter(r => r.roi.confidenceLevel === 'medium').length;
    const lowConfidence = reports.filter(r => r.roi.confidenceLevel === 'low').length;

    return {
      avgNPV,
      avgPayback,
      avgROI,
      maxNPV,
      minPayback,
      maxROI,
      bestScenario,
      fastestPayback,
      byIndustry,
      mostCommonIndustry,
      highConfidence,
      mediumConfidence,
      lowConfidence,
    };
  }, [reports]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green"></div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="min-h-screen bg-background-dark">
        <header className="nav-dark">
          <div className="container-professional py-4">
            <Link href="/" className="text-2xl font-bold text-gradient-neon">
              CulturaBuilder
            </Link>
          </div>
        </header>

        <main className="container-professional py-16">
          <div className="max-w-2xl mx-auto text-center">
            <BarChart3 size={64} className="text-tech-gray-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-tech-gray-100 mb-4">
              Sem Dados Suficientes
            </h1>
            <p className="text-tech-gray-400 mb-8">
              Crie pelo menos um relatório para ver analytics e insights.
            </p>
            <Link href="/assessment" className="btn-primary">
              Criar Primeiro Assessment
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-dark">
      {/* Header */}
      <header className="nav-dark">
        <div className="container-professional py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-gradient-neon">
              CulturaBuilder
            </Link>
            <Link href="/dashboard" className="btn-secondary text-sm">
              ← Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-professional py-12">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-tech-gray-100">Analytics & </span>
              <span className="text-gradient-neon">Insights</span>
            </h1>
            <p className="text-tech-gray-400">
              Análise de {reports.length} cenário{reports.length > 1 ? 's' : ''} criado{reports.length > 1 ? 's' : ''}
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card-professional p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-neon-green/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-neon-green" />
                </div>
                <div>
                  <div className="text-sm text-tech-gray-500">NPV Médio</div>
                  <div className="text-2xl font-bold text-neon-green">
                    {formatCurrency(analytics!.avgNPV)}
                  </div>
                </div>
              </div>
            </div>

            <div className="card-professional p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-neon-cyan/10 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-neon-cyan" />
                </div>
                <div>
                  <div className="text-sm text-tech-gray-500">Payback Médio</div>
                  <div className="text-2xl font-bold text-neon-cyan">
                    {analytics!.avgPayback.toFixed(1)}m
                  </div>
                </div>
              </div>
            </div>

            <div className="card-professional p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-neon-purple/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-neon-purple" />
                </div>
                <div>
                  <div className="text-sm text-tech-gray-500">ROI Médio</div>
                  <div className="text-2xl font-bold text-neon-purple">
                    {analytics!.avgROI.toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Best Scenarios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="card-professional p-6">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-neon-green" />
                <h3 className="text-lg font-bold text-tech-gray-100">Melhor ROI</h3>
              </div>
              <div className="mb-2">
                <div className="text-sm text-tech-gray-500">Empresa</div>
                <div className="text-xl font-bold text-tech-gray-100">
                  {analytics!.bestScenario.assessmentData.companyInfo.name}
                </div>
              </div>
              <div className="text-3xl font-bold text-neon-green">
                {formatCurrency(analytics!.bestScenario.roi.threeYearNPV)}
              </div>
              <div className="mt-4">
                <Link
                  href={`/report/${analytics!.bestScenario.id}`}
                  className="btn-secondary text-sm w-full justify-center"
                >
                  Ver Relatório
                </Link>
              </div>
            </div>

            <div className="card-professional p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-neon-cyan" />
                <h3 className="text-lg font-bold text-tech-gray-100">Payback Mais Rápido</h3>
              </div>
              <div className="mb-2">
                <div className="text-sm text-tech-gray-500">Empresa</div>
                <div className="text-xl font-bold text-tech-gray-100">
                  {analytics!.fastestPayback.assessmentData.companyInfo.name}
                </div>
              </div>
              <div className="text-3xl font-bold text-neon-cyan">
                {analytics!.fastestPayback.roi.paybackPeriodMonths.toFixed(1)} meses
              </div>
              <div className="mt-4">
                <Link
                  href={`/report/${analytics!.fastestPayback.id}`}
                  className="btn-secondary text-sm w-full justify-center"
                >
                  Ver Relatório
                </Link>
              </div>
            </div>
          </div>

          {/* Industry Breakdown */}
          <div className="card-professional p-6 mb-8">
            <h3 className="text-lg font-bold text-tech-gray-100 mb-6">Breakdown por Indústria</h3>
            <div className="space-y-4">
              {Object.entries(analytics!.byIndustry).map(([industry, count]) => {
                const percentage = (count / reports.length) * 100;
                return (
                  <div key={industry}>
                    <div className="flex justify-between mb-2">
                      <span className="text-tech-gray-300">{industry}</span>
                      <span className="text-tech-gray-500 text-sm">{count} cenário{count > 1 ? 's' : ''}</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Confidence Distribution */}
          <div className="card-professional p-6">
            <h3 className="text-lg font-bold text-tech-gray-100 mb-6">Distribuição de Confiança</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-neon-green/10 border border-neon-green/30 rounded-lg">
                <div className="text-3xl font-bold text-neon-green mb-1">
                  {analytics!.highConfidence}
                </div>
                <div className="text-sm text-tech-gray-400">Alta</div>
              </div>
              <div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="text-3xl font-bold text-yellow-400 mb-1">
                  {analytics!.mediumConfidence}
                </div>
                <div className="text-sm text-tech-gray-400">Média</div>
              </div>
              <div className="text-center p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="text-3xl font-bold text-red-400 mb-1">
                  {analytics!.lowConfidence}
                </div>
                <div className="text-sm text-tech-gray-400">Baixa</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
