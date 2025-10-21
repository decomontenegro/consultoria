import { Report } from '@/lib/types';

/**
 * Export Service
 * Handles exporting reports in various formats
 */

/**
 * Export report as JSON
 */
export function exportAsJSON(report: Report): void {
  const dataStr = JSON.stringify(report, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `culturabuilder-report-${report.assessmentData.companyInfo.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export report as CSV
 */
export function exportAsCSV(report: Report): void {
  const rows = [
    ['Métrica', 'Valor'],
    ['Empresa', report.assessmentData.companyInfo.name],
    ['Indústria', report.assessmentData.companyInfo.industry],
    ['Porte', report.assessmentData.companyInfo.size],
    ['Tamanho do Time', report.assessmentData.companyInfo.teamSize.toString()],
    ['Data de Geração', new Date(report.generatedAt).toLocaleDateString('pt-BR')],
    [''],
    ['MÉTRICAS DE ROI', ''],
    ['NPV (3 Anos)', `R$ ${report.roi.threeYearNPV.toLocaleString('pt-BR')}`],
    ['Payback (meses)', report.roi.paybackPeriodMonths.toFixed(1)],
    ['ROI (IRR)', `${report.roi.irr.toFixed(0)}%`],
    ['Investimento em Treinamento', `R$ ${report.roi.investment.trainingCost.toLocaleString('pt-BR')}`],
    ['Savings Anuais', `R$ ${report.roi.benefits.totalAnnualSavings.toLocaleString('pt-BR')}`],
    [''],
    ['BENEFÍCIOS', ''],
    ['Ganho de Produtividade', `R$ ${report.roi.benefits.productivityGain.toLocaleString('pt-BR')}`],
    ['Melhoria de Qualidade', `R$ ${report.roi.benefits.qualityImprovement.toLocaleString('pt-BR')}`],
    ['Time-to-Market Acelerado', `R$ ${report.roi.benefits.fasterTimeToMarket.toLocaleString('pt-BR')}`],
  ];

  if (report.roi.confidenceLevel) {
    rows.push(['']);
    rows.push(['CONFIANÇA DOS DADOS', '']);
    rows.push(['Nível de Confiança', report.roi.confidenceLevel === 'high' ? 'Alta' : report.roi.confidenceLevel === 'medium' ? 'Média' : 'Baixa']);
    rows.push(['Completude dos Dados', `${report.roi.dataQuality?.completeness || 0}%`]);
  }

  const csvContent = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `culturabuilder-report-${report.assessmentData.companyInfo.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Print report (opens browser print dialog)
 */
export function printReport(): void {
  window.print();
}

/**
 * Share Service
 * Handles creating and managing shareable links
 */

const SHARE_STORAGE_KEY = 'culturabuilder_shared_reports';

export interface SharedReport {
  shareId: string;
  reportId: string;
  createdAt: string;
  expiresAt: string | null;
  viewCount: number;
}

/**
 * Create a shareable link for a report
 */
export function createShareLink(reportId: string, expiresInDays: number | null = null): string {
  const shareId = generateShareId();
  const now = new Date();
  const expiresAt = expiresInDays ? new Date(now.getTime() + expiresInDays * 24 * 60 * 60 * 1000).toISOString() : null;

  const sharedReport: SharedReport = {
    shareId,
    reportId,
    createdAt: now.toISOString(),
    expiresAt,
    viewCount: 0,
  };

  // Store in localStorage
  const shares = getAllSharedReports();
  shares[shareId] = sharedReport;
  localStorage.setItem(SHARE_STORAGE_KEY, JSON.stringify(shares));

  // Return full URL
  const baseUrl = window.location.origin;
  return `${baseUrl}/shared/${shareId}`;
}

/**
 * Get report by share ID
 */
export function getReportByShareId(shareId: string): { report: Report; shared: SharedReport } | null {
  const shares = getAllSharedReports();
  const sharedReport = shares[shareId];

  if (!sharedReport) {
    return null;
  }

  // Check if expired
  if (sharedReport.expiresAt && new Date(sharedReport.expiresAt) < new Date()) {
    return null;
  }

  // Get actual report
  const reportsStr = localStorage.getItem('culturabuilder_reports');
  if (!reportsStr) return null;

  const reports = JSON.parse(reportsStr);
  const report = reports[sharedReport.reportId];

  if (!report) {
    return null;
  }

  // Increment view count
  sharedReport.viewCount++;
  shares[shareId] = sharedReport;
  localStorage.setItem(SHARE_STORAGE_KEY, JSON.stringify(shares));

  return { report, shared: sharedReport };
}

/**
 * Get all shared reports
 */
export function getAllSharedReports(): Record<string, SharedReport> {
  if (typeof window === 'undefined') return {};

  const sharesStr = localStorage.getItem(SHARE_STORAGE_KEY);
  if (!sharesStr) return {};

  try {
    return JSON.parse(sharesStr);
  } catch {
    return {};
  }
}

/**
 * Delete shared link
 */
export function deleteShareLink(shareId: string): void {
  const shares = getAllSharedReports();
  delete shares[shareId];
  localStorage.setItem(SHARE_STORAGE_KEY, JSON.stringify(shares));
}

/**
 * Generate unique share ID
 */
function generateShareId(): string {
  return `share-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
}
