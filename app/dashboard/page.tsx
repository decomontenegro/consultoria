'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Report } from '@/lib/types';
import { getAllReports, deleteReport } from '@/lib/services/report-service';
import { formatCurrency, formatPercentage } from '@/lib/calculators/roi-calculator';
import { Plus, FileText, Trash2, Copy, ExternalLink, Calendar, Building } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = () => {
    const allReports = getAllReports();
    const reportsList = Object.values(allReports).sort(
      (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
    );
    setReports(reportsList);
    setLoading(false);
  };

  const handleDelete = (id: string, companyName: string) => {
    if (window.confirm(`Tem certeza que deseja deletar o relatório de ${companyName}?`)) {
      deleteReport(id);
      loadReports();
    }
  };

  const handleDuplicate = (report: Report) => {
    // Navigate to assessment with pre-filled data
    router.push(`/assessment?mode=duplicate&from=${report.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-dark">
      {/* Glow Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-green/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <header className="nav-dark relative z-10">
        <div className="container-professional py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-gradient-neon">
              CulturaBuilder
            </Link>
            <Link
              href="/assessment"
              className="btn-primary"
            >
              <Plus size={20} className="inline mr-2" />
              Novo Assessment
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-professional py-16 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
              <span className="text-tech-gray-100">Seus </span>
              <span className="text-gradient-neon">Relatórios</span>
            </h1>
            <p className="text-lg text-tech-gray-400">
              Gerencie e compare seus assessments de AI readiness
            </p>
          </div>

          {/* Reports Grid */}
          {reports.length === 0 ? (
            <div className="card-professional p-16 text-center">
              <div className="w-24 h-24 bg-neon-green/10 border border-neon-green/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText size={48} className="text-neon-green" />
              </div>
              <h2 className="text-2xl font-bold text-tech-gray-100 mb-4">
                Nenhum relatório ainda
              </h2>
              <p className="text-tech-gray-400 mb-8 max-w-md mx-auto">
                Crie seu primeiro assessment para obter insights sobre o ROI de AI e voice coding para sua empresa.
              </p>
              <Link href="/assessment" className="btn-primary text-lg">
                <Plus size={20} className="inline mr-2" />
                Criar Primeiro Assessment
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="card-professional p-6 hover:border-neon-green/50 transition-all duration-300 group"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Building size={20} className="text-neon-green" />
                        <h3 className="text-xl font-bold text-tech-gray-100 group-hover:text-neon-green transition-colors">
                          {report.assessmentData.companyInfo.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-tech-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(report.generatedAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="badge-success text-xs">
                          {report.assessmentData.companyInfo.industry}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gradient-to-br from-neon-green/5 to-cyan-500/5 rounded-lg border border-neon-green/20">
                    <div>
                      <div className="text-xs text-tech-gray-500 uppercase tracking-wider mb-1">
                        Payback
                      </div>
                      <div className="text-lg font-bold text-neon-green">
                        {report.roi.paybackPeriodMonths.toFixed(1)}m
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-tech-gray-500 uppercase tracking-wider mb-1">
                        NPV 3Y
                      </div>
                      <div className="text-lg font-bold text-neon-cyan">
                        {formatCurrency(report.roi.threeYearNPV).replace(/\s/g, '')}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-tech-gray-500 uppercase tracking-wider mb-1">
                        ROI
                      </div>
                      <div className="text-lg font-bold text-neon-purple">
                        {formatPercentage(report.roi.irr)}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/report/${report.id}`}
                      className="flex-1 btn-primary text-sm justify-center"
                    >
                      <ExternalLink size={16} className="inline mr-1" />
                      Ver Relatório
                    </Link>
                    <button
                      onClick={() => handleDuplicate(report)}
                      className="btn-secondary text-sm px-3"
                      title="Criar variação"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(report.id, report.assessmentData.companyInfo.name)}
                      className="btn-ghost text-sm px-3 hover:border-red-500/50 hover:text-red-400"
                      title="Deletar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Compare CTA (if 2+ reports) */}
          {reports.length >= 2 && (
            <div className="mt-12 card-glow p-8 text-center">
              <h3 className="text-2xl font-bold text-tech-gray-100 mb-3">
                Comparar Cenários
              </h3>
              <p className="text-tech-gray-400 mb-6">
                Compare side-by-side os diferentes assessments para tomar a melhor decisão
              </p>
              <Link
                href="/compare"
                className="btn-outline-neon"
              >
                Comparar Relatórios →
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="container-professional py-8 text-center text-sm text-tech-gray-500 border-t border-tech-gray-800 bg-background-darker relative z-10">
        <p>© 2025 CulturaBuilder. Todos os dados baseados em pesquisas verificáveis.</p>
      </footer>
    </div>
  );
}
