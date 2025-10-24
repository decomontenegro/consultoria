'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Report } from '@/lib/types';
import { getReport } from '@/lib/services/report-service';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  Plus,
  Download,
  Share2
} from 'lucide-react';

export default function ComparePageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const reportIds = searchParams.get('reports')?.split(',') || [];

    if (reportIds.length === 0) {
      router.push('/dashboard');
      return;
    }

    // Load reports from localStorage
    const loadedReports = reportIds
      .map(id => getReport(id))
      .filter((r): r is Report => r !== null);

    if (loadedReports.length === 0) {
      router.push('/dashboard');
      return;
    }

    setReports(loadedReports);
    setLoading(false);
  }, [searchParams, router]);

  const removeReport = (reportId: string) => {
    const newReports = reports.filter(r => r.id !== reportId);

    if (newReports.length === 0) {
      router.push('/dashboard');
      return;
    }

    const newIds = newReports.map(r => r.id).join(',');
    router.push(`/compare?reports=${newIds}`);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Calculate best/worst for highlighting
  const getBestWorst = (values: number[], higherIsBetter = true) => {
    if (values.length === 0) return { best: null, worst: null };

    const max = Math.max(...values);
    const min = Math.min(...values);

    return higherIsBetter
      ? { best: max, worst: min }
      : { best: min, worst: max };
  };

  const getComparisonIndicator = (value: number, best: number | null, worst: number | null) => {
    if (best === null || worst === null || best === worst) return null;

    if (value === best) {
      return <TrendingUp className="w-4 h-4 text-neon-green" />;
    } else if (value === worst) {
      return <TrendingDown className="w-4 h-4 text-red-400" />;
    }
    return <Minus className="w-4 h-4 text-tech-gray-500" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-tech-gray-950 to-tech-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green mx-auto mb-4"></div>
          <p className="text-tech-gray-400">Carregando comparação...</p>
        </div>
      </div>
    );
  }

  // Extract metrics for comparison
  const npvValues = reports.map(r => r.roi.threeYearNPV);
  const paybackValues = reports.map(r => r.roi.paybackPeriodMonths);
  const roiValues = reports.map(r => r.roi.irr);
  const investmentValues = reports.map(r => r.roi.investment.trainingCost);

  const npvBestWorst = getBestWorst(npvValues, true);
  const paybackBestWorst = getBestWorst(paybackValues, false); // Lower is better
  const roiBestWorst = getBestWorst(roiValues, true);
  const investmentBestWorst = getBestWorst(investmentValues, false); // Lower is better

  return (
    <div className="min-h-screen bg-gradient-to-b from-tech-gray-950 to-tech-gray-900">
      {/* Header */}
      <header className="border-b border-tech-gray-800 bg-background-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container-professional py-6">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="text-2xl font-bold text-gradient-neon">
              CulturaBuilder
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-tech-gray-400 hover:text-neon-green transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-tech-gray-100">
            Comparação de Relatórios
          </h1>
          <p className="text-tech-gray-400 mt-2">
            Comparando {reports.length} cenário{reports.length > 1 ? 's' : ''}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-professional py-12">
        {/* Action Bar */}
        <div className="flex justify-end gap-3 mb-6">
          <button className="btn-secondary text-sm flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar Comparação
          </button>
          <button className="btn-ghost text-sm flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Compartilhar
          </button>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-tech-gray-800">
                <th className="text-left p-4 text-tech-gray-400 font-semibold sticky left-0 bg-tech-gray-900 z-10">
                  Métrica
                </th>
                {reports.map((report) => (
                  <th key={report.id} className="p-4 min-w-[250px]">
                    <div className="text-left">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-tech-gray-100 mb-1">
                            {report.assessmentData.companyInfo.name}
                          </h3>
                          <p className="text-xs text-tech-gray-500">
                            {formatDate(report.generatedAt)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeReport(report.id)}
                          className="text-tech-gray-500 hover:text-red-400 transition-colors"
                          title="Remover da comparação"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* Company Info Section */}
              <tr className="border-b border-tech-gray-800 bg-tech-gray-900/30">
                <td colSpan={reports.length + 1} className="p-4">
                  <h4 className="text-sm font-semibold text-neon-green uppercase tracking-wider">
                    Informações da Empresa
                  </h4>
                </td>
              </tr>

              <tr className="border-b border-tech-gray-800">
                <td className="p-4 text-tech-gray-400 sticky left-0 bg-tech-gray-950">
                  Indústria
                </td>
                {reports.map((report) => (
                  <td key={report.id} className="p-4 text-tech-gray-300">
                    {report.assessmentData.companyInfo.industry}
                  </td>
                ))}
              </tr>

              <tr className="border-b border-tech-gray-800">
                <td className="p-4 text-tech-gray-400 sticky left-0 bg-tech-gray-950">
                  Porte
                </td>
                {reports.map((report) => (
                  <td key={report.id} className="p-4 text-tech-gray-300">
                    {report.assessmentData.companyInfo.size}
                  </td>
                ))}
              </tr>

              <tr className="border-b border-tech-gray-800">
                <td className="p-4 text-tech-gray-400 sticky left-0 bg-tech-gray-950">
                  Tamanho do Time
                </td>
                {reports.map((report) => (
                  <td key={report.id} className="p-4 text-tech-gray-300">
                    {report.assessmentData.currentState.devTeamSize} pessoas
                  </td>
                ))}
              </tr>

              {/* ROI Metrics Section */}
              <tr className="border-b border-tech-gray-800 bg-tech-gray-900/30">
                <td colSpan={reports.length + 1} className="p-4">
                  <h4 className="text-sm font-semibold text-neon-green uppercase tracking-wider">
                    Métricas de ROI
                  </h4>
                </td>
              </tr>

              <tr className="border-b border-tech-gray-800">
                <td className="p-4 text-tech-gray-400 sticky left-0 bg-tech-gray-950">
                  NPV (3 Anos)
                </td>
                {reports.map((report, idx) => {
                  const value = report.roi.threeYearNPV;
                  const indicator = getComparisonIndicator(value, npvBestWorst.best, npvBestWorst.worst);
                  const isBest = value === npvBestWorst.best;
                  const isWorst = value === npvBestWorst.worst;

                  return (
                    <td
                      key={report.id}
                      className={`p-4 ${isBest ? 'bg-neon-green/10 border-l-2 border-neon-green' : isWorst ? 'bg-red-500/10 border-l-2 border-red-400' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        {indicator}
                        <span className={`font-semibold ${isBest ? 'text-neon-green' : isWorst ? 'text-red-400' : 'text-tech-gray-300'}`}>
                          {formatCurrency(value)}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>

              <tr className="border-b border-tech-gray-800">
                <td className="p-4 text-tech-gray-400 sticky left-0 bg-tech-gray-950">
                  Payback
                </td>
                {reports.map((report) => {
                  const value = report.roi.paybackPeriodMonths;
                  const indicator = getComparisonIndicator(value, paybackBestWorst.best, paybackBestWorst.worst);
                  const isBest = value === paybackBestWorst.best;
                  const isWorst = value === paybackBestWorst.worst;

                  return (
                    <td
                      key={report.id}
                      className={`p-4 ${isBest ? 'bg-neon-green/10 border-l-2 border-neon-green' : isWorst ? 'bg-red-500/10 border-l-2 border-red-400' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        {indicator}
                        <span className={`font-semibold ${isBest ? 'text-neon-green' : isWorst ? 'text-red-400' : 'text-tech-gray-300'}`}>
                          {value.toFixed(1)} meses
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>

              <tr className="border-b border-tech-gray-800">
                <td className="p-4 text-tech-gray-400 sticky left-0 bg-tech-gray-950">
                  ROI (IRR)
                </td>
                {reports.map((report) => {
                  const value = report.roi.irr;
                  const indicator = getComparisonIndicator(value, roiBestWorst.best, roiBestWorst.worst);
                  const isBest = value === roiBestWorst.best;
                  const isWorst = value === roiBestWorst.worst;

                  return (
                    <td
                      key={report.id}
                      className={`p-4 ${isBest ? 'bg-neon-green/10 border-l-2 border-neon-green' : isWorst ? 'bg-red-500/10 border-l-2 border-red-400' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        {indicator}
                        <span className={`font-semibold ${isBest ? 'text-neon-green' : isWorst ? 'text-red-400' : 'text-tech-gray-300'}`}>
                          {value.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Investment Section */}
              <tr className="border-b border-tech-gray-800 bg-tech-gray-900/30">
                <td colSpan={reports.length + 1} className="p-4">
                  <h4 className="text-sm font-semibold text-neon-green uppercase tracking-wider">
                    Investimento
                  </h4>
                </td>
              </tr>

              <tr className="border-b border-tech-gray-800">
                <td className="p-4 text-tech-gray-400 sticky left-0 bg-tech-gray-950">
                  Investimento Total
                </td>
                {reports.map((report) => {
                  const value = report.roi.investment.trainingCost;
                  const indicator = getComparisonIndicator(value, investmentBestWorst.best, investmentBestWorst.worst);
                  const isBest = value === investmentBestWorst.best;
                  const isWorst = value === investmentBestWorst.worst;

                  return (
                    <td
                      key={report.id}
                      className={`p-4 ${isBest ? 'bg-neon-green/10 border-l-2 border-neon-green' : isWorst ? 'bg-red-500/10 border-l-2 border-red-400' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        {indicator}
                        <span className={`font-semibold ${isBest ? 'text-neon-green' : isWorst ? 'text-red-400' : 'text-tech-gray-300'}`}>
                          {formatCurrency(value)}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>

              <tr className="border-b border-tech-gray-800">
                <td className="p-4 text-tech-gray-400 sticky left-0 bg-tech-gray-950">
                  Savings Anuais
                </td>
                {reports.map((report) => (
                  <td key={report.id} className="p-4 text-tech-gray-300 font-semibold">
                    {formatCurrency(report.roi.benefits.totalAnnualSavings)}
                  </td>
                ))}
              </tr>

              {/* Confidence Section */}
              {reports.some(r => r.roi.confidenceLevel) && (
                <>
                  <tr className="border-b border-tech-gray-800 bg-tech-gray-900/30">
                    <td colSpan={reports.length + 1} className="p-4">
                      <h4 className="text-sm font-semibold text-neon-green uppercase tracking-wider">
                        Confiança dos Dados
                      </h4>
                    </td>
                  </tr>

                  <tr className="border-b border-tech-gray-800">
                    <td className="p-4 text-tech-gray-400 sticky left-0 bg-tech-gray-950">
                      Nível de Confiança
                    </td>
                    {reports.map((report) => (
                      <td key={report.id} className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          report.roi.confidenceLevel === 'high'
                            ? 'bg-neon-green/20 text-neon-green'
                            : report.roi.confidenceLevel === 'medium'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {report.roi.confidenceLevel === 'high' ? 'Alta' : report.roi.confidenceLevel === 'medium' ? 'Média' : 'Baixa'}
                        </span>
                      </td>
                    ))}
                  </tr>

                  <tr className="border-b border-tech-gray-800">
                    <td className="p-4 text-tech-gray-400 sticky left-0 bg-tech-gray-950">
                      Completude dos Dados
                    </td>
                    {reports.map((report) => (
                      <td key={report.id} className="p-4 text-tech-gray-300">
                        {report.roi.dataQuality?.completeness || 0}%
                      </td>
                    ))}
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-8 p-6 bg-background-card/30 border border-tech-gray-800 rounded-lg">
          <h3 className="text-sm font-semibold text-tech-gray-300 mb-4">Legenda</h3>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-neon-green" />
              <span className="text-sm text-tech-gray-400">Melhor valor</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-400" />
              <span className="text-sm text-tech-gray-400">Pior valor</span>
            </div>
            <div className="flex items-center gap-2">
              <Minus className="w-4 h-4 text-tech-gray-500" />
              <span className="text-sm text-tech-gray-400">Valor intermediário</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/dashboard" className="btn-secondary">
            Voltar ao Dashboard
          </Link>
          <Link href="/assessment" className="btn-primary">
            Criar Novo Assessment
          </Link>
        </div>
      </main>
    </div>
  );
}
