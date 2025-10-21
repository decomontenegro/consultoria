'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Report } from '@/lib/types';
import { getReportByShareId, SharedReport } from '@/lib/services/export-service';
import { Lock, ExternalLink, Eye, Calendar, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/lib/calculators/roi-calculator';

export default function SharedReportPage() {
  const params = useParams();
  const router = useRouter();
  const shareId = params.shareId as string;

  const [report, setReport] = useState<Report | null>(null);
  const [sharedInfo, setSharedInfo] = useState<SharedReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const data = getReportByShareId(shareId);

    if (!data) {
      setError('Link inválido ou expirado');
      setLoading(false);
      return;
    }

    setReport(data.report);
    setSharedInfo(data.shared);
    setLoading(false);
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-tech-gray-950 to-tech-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green mx-auto mb-4"></div>
          <p className="text-tech-gray-400">Carregando relatório compartilhado...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-tech-gray-950 to-tech-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-500/10 border-2 border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={40} className="text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-tech-gray-100 mb-4">
            Link Inválido
          </h1>
          <p className="text-tech-gray-400 mb-8">
            {error || 'O link que você está tentando acessar não existe ou expirou.'}
          </p>
          <Link href="/" className="btn-primary">
            Ir para Homepage
          </Link>
        </div>
      </div>
    );
  }

  const roi = report.roi;
  const assessmentData = report.assessmentData;

  return (
    <div className="min-h-screen bg-gradient-to-b from-tech-gray-950 to-tech-gray-900">
      {/* Header */}
      <header className="border-b border-tech-gray-800 bg-background-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container-professional py-6">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="text-2xl font-bold text-gradient-neon">
              CulturaBuilder
            </Link>
            <div className="flex items-center gap-2 text-sm text-tech-gray-400">
              <Lock size={16} />
              <span>Visualização Read-Only</span>
            </div>
          </div>

          {/* Shared Info Banner */}
          <div className="p-4 bg-neon-cyan/10 border border-neon-cyan/30 rounded-lg flex items-start gap-3">
            <Eye className="w-5 h-5 text-neon-cyan flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-neon-cyan font-semibold mb-1">
                Você está visualizando um relatório compartilhado
              </p>
              <div className="flex flex-wrap gap-4 text-xs text-tech-gray-400">
                <span className="flex items-center gap-1">
                  <Eye size={12} />
                  {sharedInfo?.viewCount || 0} visualizações
                </span>
                {sharedInfo?.expiresAt && (
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    Expira em {new Date(sharedInfo.expiresAt).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>
            </div>
            <Link href="/assessment" className="btn-primary text-sm whitespace-nowrap">
              Criar Meu Assessment
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-professional py-12">
        <div className="max-w-5xl mx-auto">
          {/* Executive Summary */}
          <div className="card-glow p-10 mb-12">
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold font-display mb-4 leading-tight">
                <span className="text-tech-gray-100">Relatório de </span>
                <span className="text-gradient-neon">Prontidão para IA</span>
              </h1>
              <p className="text-lg text-tech-gray-400">
                {assessmentData.companyInfo.name} •{' '}
                {new Date(report.generatedAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="metric-card">
                <div className="metric-label">Payback</div>
                <div className="metric-value text-neon-green">
                  {roi.paybackPeriodMonths.toFixed(1)} meses
                </div>
                <div className="metric-change">
                  ROI positivo em menos de {Math.ceil(roi.paybackPeriodMonths)} meses
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-label">NPV (3 anos)</div>
                <div className="metric-value text-neon-cyan">
                  {formatCurrency(roi.threeYearNPV)}
                </div>
                <div className="metric-change">Valor presente líquido</div>
              </div>

              <div className="metric-card">
                <div className="metric-label">ROI</div>
                <div className="metric-value text-neon-purple">
                  {formatPercentage(roi.irr)}
                </div>
                <div className="metric-change">Taxa interna de retorno</div>
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="card-professional p-8 mb-8">
            <h2 className="text-2xl font-bold text-tech-gray-100 mb-6">
              Informações da Empresa
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-tech-gray-500 mb-1">Indústria</div>
                <div className="text-lg text-tech-gray-100 font-semibold">
                  {assessmentData.companyInfo.industry}
                </div>
              </div>
              <div>
                <div className="text-sm text-tech-gray-500 mb-1">Porte</div>
                <div className="text-lg text-tech-gray-100 font-semibold">
                  {assessmentData.companyInfo.size}
                </div>
              </div>
              <div>
                <div className="text-sm text-tech-gray-500 mb-1">Tamanho do Time</div>
                <div className="text-lg text-tech-gray-100 font-semibold">
                  {assessmentData.companyInfo.teamSize} pessoas
                </div>
              </div>
              <div>
                <div className="text-sm text-tech-gray-500 mb-1">Urgência</div>
                <div className="text-lg text-tech-gray-100 font-semibold">
                  {assessmentData.goals.urgency}
                </div>
              </div>
            </div>
          </div>

          {/* Investment & Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="card-professional p-8">
              <h3 className="text-xl font-bold text-tech-gray-100 mb-6">
                Investimento
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-tech-gray-800">
                  <span className="text-tech-gray-400">Treinamento</span>
                  <span className="text-tech-gray-100 font-semibold">
                    {formatCurrency(roi.investment.trainingCost)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-tech-gray-400 font-bold">Total</span>
                  <span className="text-neon-green font-bold text-xl">
                    {formatCurrency(roi.investment.trainingCost)}
                  </span>
                </div>
              </div>
            </div>

            <div className="card-professional p-8">
              <h3 className="text-xl font-bold text-tech-gray-100 mb-6">
                Benefícios Anuais
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-tech-gray-800">
                  <span className="text-tech-gray-400">Produtividade</span>
                  <span className="text-tech-gray-100 font-semibold">
                    {formatCurrency(roi.benefits.productivityGain)}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-tech-gray-800">
                  <span className="text-tech-gray-400">Qualidade</span>
                  <span className="text-tech-gray-100 font-semibold">
                    {formatCurrency(roi.benefits.qualityImprovement)}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-tech-gray-800">
                  <span className="text-tech-gray-400">Time-to-Market</span>
                  <span className="text-tech-gray-100 font-semibold">
                    {formatCurrency(roi.benefits.fasterTimeToMarket)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-tech-gray-400 font-bold">Total</span>
                  <span className="text-neon-green font-bold text-xl">
                    {formatCurrency(roi.benefits.totalAnnualSavings)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="card-glow p-8 text-center">
            <h3 className="text-2xl font-bold text-tech-gray-100 mb-3">
              Quer um assessment personalizado para sua empresa?
            </h3>
            <p className="text-tech-gray-400 mb-6">
              Crie seu próprio relatório de ROI de AI com dados específicos da sua organização
            </p>
            <Link href="/assessment" className="btn-primary text-lg">
              Iniciar Meu Assessment
              <ExternalLink className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container-professional py-8 text-center text-sm text-tech-gray-500 border-t border-tech-gray-800">
        <p>© 2025 CulturaBuilder. Relatório compartilhado em modo read-only.</p>
      </footer>
    </div>
  );
}
