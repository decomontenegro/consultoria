'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllReports } from '@/lib/services/report-service';
import { Report } from '@/lib/types';
import { formatCurrency } from '@/lib/calculators/roi-calculator';
import { TrendingUp, FileText, Plus, BarChart3 } from 'lucide-react';

export default function ReturningUserBanner() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const allReports = getAllReports();
    const reportsList = Object.values(allReports).sort(
      (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
    );
    setReports(reportsList);
    setLoading(false);
  }, []);

  if (loading) return null;
  if (reports.length === 0) return null;

  const latestReport = reports[0];
  const totalReports = reports.length;

  return (
    <div className="bg-gradient-to-r from-neon-green/10 via-neon-cyan/10 to-neon-purple/10 border border-neon-green/30 rounded-2xl p-8 mb-12 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-tech-gray-100 mb-2">
            Bem-vindo de volta! 👋
          </h2>
          <p className="text-tech-gray-400 mb-6">
            Você tem <strong className="text-neon-green">{totalReports}</strong> relatório{totalReports > 1 ? 's' : ''} salvo{totalReports > 1 ? 's' : ''}.
            Continue explorando suas opções de transformação AI.
          </p>

          {/* Latest Report Preview */}
          <div className="bg-background-card/50 border border-tech-gray-700 rounded-lg p-4 mb-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-sm text-tech-gray-500 mb-1">Último Relatório</div>
                <div className="text-lg font-bold text-tech-gray-100">
                  {latestReport.assessmentData.companyInfo.name}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-tech-gray-500 mb-1">NPV (3 anos)</div>
                <div className="text-lg font-bold text-neon-green">
                  {formatCurrency(latestReport.roi.threeYearNPV)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="text-sm">
                <span className="text-tech-gray-500">Payback: </span>
                <span className="text-tech-gray-300 font-semibold">
                  {latestReport.roi.paybackPeriodMonths.toFixed(1)}m
                </span>
              </div>
              <div className="text-sm">
                <span className="text-tech-gray-500">ROI: </span>
                <span className="text-tech-gray-300 font-semibold">
                  {latestReport.roi.irr.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard" className="btn-primary text-sm">
              <BarChart3 className="w-4 h-4 mr-2" />
              Ver Todos os Relatórios
            </Link>
            <Link href={`/report/${latestReport.id}`} className="btn-secondary text-sm">
              <FileText className="w-4 h-4 mr-2" />
              Continuar Último
            </Link>
            <Link href="/assessment" className="btn-ghost text-sm">
              <Plus className="w-4 h-4 mr-2" />
              Novo Assessment
            </Link>
          </div>
        </div>

        {/* Stats */}
        {totalReports > 1 && (
          <div className="hidden lg:block">
            <div className="bg-background-card/50 border border-tech-gray-700 rounded-lg p-6 text-center min-w-[160px]">
              <TrendingUp className="w-8 h-8 text-neon-green mx-auto mb-2" />
              <div className="text-3xl font-bold text-neon-green mb-1">
                {totalReports}
              </div>
              <div className="text-xs text-tech-gray-500 uppercase tracking-wider">
                Cenários Criados
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
