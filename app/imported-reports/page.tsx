/**
 * Imported Reports - Index Page
 * Shows all reports generated from CSV import
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Building2, Users, TrendingUp, Calendar, ArrowRight, FileSpreadsheet } from 'lucide-react';

interface ReportSummary {
  id: string;
  filename: string;
  type: 'individual' | 'consolidated';
  companyName: string;
  department?: string;
  responsible?: string;
  departmentCount?: number;
  departments?: string[];
  generatedAt: string;
  roi: {
    npv?: number;
    payback?: number;
  };
}

interface ReportsData {
  summary: {
    generatedAt: string;
    totalCompanies: number;
    totalDepartments: number;
    companies: Array<{
      name: string;
      departments: Array<{ name: string; responsible: string }>;
    }>;
  };
  reports: {
    individual: ReportSummary[];
    consolidated: ReportSummary[];
    total: number;
  };
}

export default function ImportedReportsPage() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/imported-reports')
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setData(result);
        } else {
          setError(result.error || 'Failed to load reports');
        }
      })
      .catch(err => {
        console.error('Error loading reports:', err);
        setError('Failed to load reports');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-tech-dark via-tech-gray-900 to-tech-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-neon-green mx-auto mb-4"></div>
          <p className="text-tech-gray-300">Carregando relatórios importados...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-tech-dark via-tech-gray-900 to-tech-dark flex items-center justify-center">
        <div className="card-professional p-8 max-w-md text-center">
          <FileSpreadsheet className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-tech-gray-100 mb-2">Erro ao Carregar</h2>
          <p className="text-tech-gray-400 mb-4">{error || 'Nenhum relatório encontrado'}</p>
          <Link href="/" className="btn-primary">
            Voltar ao Início
          </Link>
        </div>
      </div>
    );
  }

  const formatCurrency = (value?: number) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-tech-dark via-tech-gray-900 to-tech-dark">
      {/* Header */}
      <header className="border-b border-tech-gray-800 bg-tech-dark/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container-custom py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <FileSpreadsheet className="w-8 h-8 text-neon-green" />
                <h1 className="text-3xl font-bold font-display text-white">
                  Relatórios Importados
                </h1>
              </div>
              <p className="text-tech-gray-400">
                Dados processados de CSV externo • {data.summary.totalCompanies} empresas • {data.summary.totalDepartments} departamentos
              </p>
            </div>
            <Link href="/" className="btn-secondary">
              Voltar ao Início
            </Link>
          </div>
        </div>
      </header>

      <main className="container-custom py-12">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="card-professional p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-neon-green/10 rounded-xl">
                <Building2 className="w-6 h-6 text-neon-green" />
              </div>
              <div>
                <p className="text-tech-gray-400 text-sm">Empresas</p>
                <p className="text-3xl font-bold text-white">{data.summary.totalCompanies}</p>
              </div>
            </div>
          </div>

          <div className="card-professional p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-tech-gray-400 text-sm">Departamentos</p>
                <p className="text-3xl font-bold text-white">{data.summary.totalDepartments}</p>
              </div>
            </div>
          </div>

          <div className="card-professional p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <FileText className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-tech-gray-400 text-sm">Relatórios Individuais</p>
                <p className="text-3xl font-bold text-white">{data.reports.individual.length}</p>
              </div>
            </div>
          </div>

          <div className="card-professional p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-cyan-500/10 rounded-xl">
                <TrendingUp className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <p className="text-tech-gray-400 text-sm">Consolidados</p>
                <p className="text-3xl font-bold text-white">{data.reports.consolidated.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Consolidated Reports */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-6 h-6 text-neon-green" />
            <h2 className="text-2xl font-bold font-display text-white">
              Relatórios Consolidados por Empresa
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.reports.consolidated.map(report => (
              <Link
                key={report.id}
                href={`/report/${report.id}`}
                className="card-professional p-6 hover:border-neon-green transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-neon-green transition-colors">
                      {report.companyName}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-tech-gray-400">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{report.departmentCount} departamentos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(report.generatedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-tech-gray-600 group-hover:text-neon-green group-hover:translate-x-1 transition-all" />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-tech-gray-800">
                  <div>
                    <p className="text-xs text-tech-gray-500 mb-1">NPV (3 anos)</p>
                    <p className="text-lg font-bold text-neon-green">
                      {formatCurrency(report.roi.npv)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-tech-gray-500 mb-1">Payback</p>
                    <p className="text-lg font-bold text-blue-400">
                      {report.roi.payback ? `${report.roi.payback.toFixed(1)} meses` : 'N/A'}
                    </p>
                  </div>
                </div>

                {report.departments && report.departments.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-tech-gray-800">
                    <p className="text-xs text-tech-gray-500 mb-2">Departamentos incluídos:</p>
                    <div className="flex flex-wrap gap-2">
                      {report.departments.slice(0, 5).map((dept: any, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-tech-gray-800 text-tech-gray-300 text-xs rounded"
                        >
                          {dept.name || dept}
                        </span>
                      ))}
                      {report.departments.length > 5 && (
                        <span className="px-2 py-1 bg-tech-gray-800 text-tech-gray-500 text-xs rounded">
                          +{report.departments.length - 5} mais
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>

        {/* Individual Reports by Company */}
        {data.summary.companies.map(company => {
          const companyReports = data.reports.individual.filter(
            r => r.companyName.includes(company.name)
          );

          if (companyReports.length === 0) return null;

          return (
            <section key={company.name} className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl font-bold font-display text-white">
                  {company.name} - Relatórios Individuais
                </h2>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-sm rounded-full">
                  {companyReports.length} departamentos
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companyReports.map(report => (
                  <Link
                    key={report.id}
                    href={`/report/${report.id}`}
                    className="card-professional p-6 hover:border-blue-400 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                          {report.department}
                        </h3>
                        <p className="text-sm text-tech-gray-400">{report.responsible}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-tech-gray-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                    </div>

                    <div className="space-y-2 pt-3 border-t border-tech-gray-800">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-tech-gray-500">NPV (3 anos)</span>
                        <span className="text-sm font-bold text-neon-green">
                          {formatCurrency(report.roi.npv)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-tech-gray-500">Payback</span>
                        <span className="text-sm font-bold text-blue-400">
                          {report.roi.payback ? `${report.roi.payback.toFixed(1)}m` : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        {/* Processing Info */}
        <div className="card-professional p-6 bg-tech-gray-900/50">
          <div className="flex items-start gap-4">
            <Calendar className="w-5 h-5 text-tech-gray-500 mt-1" />
            <div>
              <p className="text-sm text-tech-gray-400">
                Relatórios processados em: <span className="text-white font-medium">{formatDate(data.summary.generatedAt)}</span>
              </p>
              <p className="text-xs text-tech-gray-500 mt-1">
                Fonte: Dados importados de CSV externo • Processamento automatizado via Playwright
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
