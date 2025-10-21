'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Report } from '@/lib/types';
import { getAllReports, deleteReport } from '@/lib/services/report-service';
import { formatCurrency, formatPercentage } from '@/lib/calculators/roi-calculator';
import {
  Plus,
  FileText,
  Trash2,
  Copy,
  ExternalLink,
  Calendar,
  Building,
  Search,
  Filter,
  ArrowUpDown,
  CheckSquare,
  Square,
  GitCompare,
  Download,
  Archive,
  Star
} from 'lucide-react';

type SortField = 'date' | 'npv' | 'roi' | 'payback' | 'company';
type SortDirection = 'asc' | 'desc';

export default function DashboardPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  // Enhanced dashboard state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedConfidence, setSelectedConfidence] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = () => {
    const allReports = getAllReports();
    const reportsList = Object.values(allReports);
    setReports(reportsList);
    setLoading(false);
  };

  const handleDelete = (id: string, companyName: string) => {
    if (window.confirm(`Tem certeza que deseja deletar o relatório de ${companyName}?`)) {
      deleteReport(id);
      loadReports();
      // Remove from selection if was selected
      const newSelected = new Set(selectedReports);
      newSelected.delete(id);
      setSelectedReports(newSelected);
    }
  };

  const handleBulkDelete = () => {
    if (selectedReports.size === 0) return;

    if (window.confirm(`Tem certeza que deseja deletar ${selectedReports.size} relatório(s)?`)) {
      selectedReports.forEach(id => deleteReport(id));
      setSelectedReports(new Set());
      loadReports();
    }
  };

  const handleDuplicate = (report: Report) => {
    router.push(`/assessment?mode=duplicate&from=${report.id}`);
  };

  const toggleReportSelection = (reportId: string) => {
    const newSelected = new Set(selectedReports);
    if (newSelected.has(reportId)) {
      newSelected.delete(reportId);
    } else {
      newSelected.add(reportId);
    }
    setSelectedReports(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedReports.size === filteredAndSortedReports.length) {
      setSelectedReports(new Set());
    } else {
      setSelectedReports(new Set(filteredAndSortedReports.map(r => r.id)));
    }
  };

  const handleCompareSelected = () => {
    if (selectedReports.size < 2) {
      alert('Selecione pelo menos 2 relatórios para comparar');
      return;
    }
    const ids = Array.from(selectedReports).join(',');
    router.push(`/compare?reports=${ids}`);
  };

  // Get unique industries
  const industries = useMemo(() => {
    const unique = new Set(reports.map(r => r.assessmentData.companyInfo.industry));
    return Array.from(unique).sort();
  }, [reports]);

  // Filter and sort reports
  const filteredAndSortedReports = useMemo(() => {
    let filtered = [...reports];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.assessmentData.companyInfo.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Industry filter
    if (selectedIndustry !== 'all') {
      filtered = filtered.filter(r =>
        r.assessmentData.companyInfo.industry === selectedIndustry
      );
    }

    // Confidence filter
    if (selectedConfidence !== 'all') {
      filtered = filtered.filter(r =>
        r.roi.confidenceLevel === selectedConfidence
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'date':
          comparison = new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime();
          break;
        case 'npv':
          comparison = b.roi.threeYearNPV - a.roi.threeYearNPV;
          break;
        case 'roi':
          comparison = b.roi.irr - a.roi.irr;
          break;
        case 'payback':
          comparison = a.roi.paybackPeriodMonths - b.roi.paybackPeriodMonths; // Lower is better
          break;
        case 'company':
          comparison = a.assessmentData.companyInfo.name.localeCompare(b.assessmentData.companyInfo.name);
          break;
      }

      return sortDirection === 'asc' ? -comparison : comparison;
    });

    return filtered;
  }, [reports, searchTerm, selectedIndustry, selectedConfidence, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green"></div>
      </div>
    );
  }

  const allSelected = filteredAndSortedReports.length > 0 && selectedReports.size === filteredAndSortedReports.length;

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
            <Link href="/assessment" className="btn-primary">
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
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
              <span className="text-tech-gray-100">Seus </span>
              <span className="text-gradient-neon">Relatórios</span>
            </h1>
            <p className="text-lg text-tech-gray-400">
              Gerencie e compare seus assessments de AI readiness
            </p>
          </div>

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
            <>
              {/* Search & Filters Bar */}
              <div className="mb-6 space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-tech-gray-500" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar por nome da empresa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-background-card border border-tech-gray-700 rounded-lg text-tech-gray-100 placeholder-tech-gray-500 focus:outline-none focus:border-neon-green transition-colors"
                  />
                </div>

                {/* Filters & Sort Row */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`btn-secondary text-sm ${showFilters ? 'border-neon-green text-neon-green' : ''}`}
                  >
                    <Filter size={16} className="mr-2" />
                    Filtros
                  </button>

                  {/* Sort Dropdown */}
                  <div className="flex gap-2">
                    <select
                      value={sortField}
                      onChange={(e) => setSortField(e.target.value as SortField)}
                      className="px-4 py-2 bg-background-card border border-tech-gray-700 rounded-lg text-tech-gray-100 text-sm focus:outline-none focus:border-neon-green"
                    >
                      <option value="date">Data</option>
                      <option value="company">Empresa</option>
                      <option value="npv">NPV</option>
                      <option value="roi">ROI</option>
                      <option value="payback">Payback</option>
                    </select>
                    <button
                      onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                      className="btn-secondary text-sm px-3"
                      title={sortDirection === 'asc' ? 'Crescente' : 'Decrescente'}
                    >
                      <ArrowUpDown size={16} />
                    </button>
                  </div>

                  {/* Bulk Actions */}
                  {selectedReports.size > 0 && (
                    <div className="flex gap-2 ml-auto">
                      <span className="text-sm text-tech-gray-400 self-center">
                        {selectedReports.size} selecionado{selectedReports.size > 1 ? 's' : ''}
                      </span>
                      {selectedReports.size >= 2 && (
                        <button
                          onClick={handleCompareSelected}
                          className="btn-primary text-sm"
                        >
                          <GitCompare size={16} className="mr-2" />
                          Comparar
                        </button>
                      )}
                      <button
                        onClick={handleBulkDelete}
                        className="btn-ghost text-sm hover:border-red-500/50 hover:text-red-400"
                      >
                        <Trash2 size={16} className="mr-2" />
                        Deletar
                      </button>
                    </div>
                  )}
                </div>

                {/* Filters Panel */}
                {showFilters && (
                  <div className="p-4 bg-background-card border border-tech-gray-700 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-tech-gray-300 mb-2">
                        Indústria
                      </label>
                      <select
                        value={selectedIndustry}
                        onChange={(e) => setSelectedIndustry(e.target.value)}
                        className="w-full px-4 py-2 bg-background-darker border border-tech-gray-700 rounded-lg text-tech-gray-100 text-sm focus:outline-none focus:border-neon-green"
                      >
                        <option value="all">Todas</option>
                        {industries.map(industry => (
                          <option key={industry} value={industry}>{industry}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-tech-gray-300 mb-2">
                        Confiança
                      </label>
                      <select
                        value={selectedConfidence}
                        onChange={(e) => setSelectedConfidence(e.target.value)}
                        className="w-full px-4 py-2 bg-background-darker border border-tech-gray-700 rounded-lg text-tech-gray-100 text-sm focus:outline-none focus:border-neon-green"
                      >
                        <option value="all">Todas</option>
                        <option value="high">Alta</option>
                        <option value="medium">Média</option>
                        <option value="low">Baixa</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Select All */}
              {filteredAndSortedReports.length > 0 && (
                <div className="mb-4 flex items-center gap-2">
                  <button
                    onClick={toggleSelectAll}
                    className="flex items-center gap-2 text-sm text-tech-gray-400 hover:text-neon-green transition-colors"
                  >
                    {allSelected ? (
                      <CheckSquare size={20} className="text-neon-green" />
                    ) : (
                      <Square size={20} />
                    )}
                    Selecionar todos ({filteredAndSortedReports.length})
                  </button>
                </div>
              )}

              {/* Reports Grid */}
              {filteredAndSortedReports.length === 0 ? (
                <div className="card-professional p-12 text-center">
                  <p className="text-tech-gray-400">
                    Nenhum relatório encontrado com os filtros selecionados.
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedIndustry('all');
                      setSelectedConfidence('all');
                    }}
                    className="btn-secondary mt-4"
                  >
                    Limpar Filtros
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredAndSortedReports.map((report) => {
                    const isSelected = selectedReports.has(report.id);

                    return (
                      <div
                        key={report.id}
                        className={`card-professional p-6 transition-all duration-300 group relative ${
                          isSelected ? 'border-neon-green bg-neon-green/5' : 'hover:border-neon-green/50'
                        }`}
                      >
                        {/* Selection Checkbox */}
                        <button
                          onClick={() => toggleReportSelection(report.id)}
                          className="absolute top-4 right-4 z-10"
                        >
                          {isSelected ? (
                            <CheckSquare size={20} className="text-neon-green" />
                          ) : (
                            <Square size={20} className="text-tech-gray-600 hover:text-neon-green transition-colors" />
                          )}
                        </button>

                        {/* Card Header */}
                        <div className="flex items-start justify-between mb-4 pr-8">
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

                        {/* Confidence Badge */}
                        {report.roi.confidenceLevel && (
                          <div className="mb-4">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              report.roi.confidenceLevel === 'high'
                                ? 'bg-neon-green/20 text-neon-green'
                                : report.roi.confidenceLevel === 'medium'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              Confiança: {report.roi.confidenceLevel === 'high' ? 'Alta' : report.roi.confidenceLevel === 'medium' ? 'Média' : 'Baixa'}
                            </span>
                          </div>
                        )}

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
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Compare CTA (if 2+ reports and none selected) */}
          {reports.length >= 2 && selectedReports.size === 0 && (
            <div className="mt-12 card-glow p-8 text-center">
              <h3 className="text-2xl font-bold text-tech-gray-100 mb-3">
                Comparar Cenários
              </h3>
              <p className="text-tech-gray-400 mb-6">
                Selecione 2 ou mais relatórios acima para comparar side-by-side
              </p>
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
