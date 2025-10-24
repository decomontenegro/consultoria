'use client';

import Link from 'next/link';
import { COMPLETE_SAMPLE_REPORT } from '@/lib/utils/generate-complete-sample';
import ReportLayoutWrapper from '@/components/report/ReportLayoutWrapper';
import LayoutSelector from '@/components/report/LayoutSelector';
import ExportButtons from '@/components/export/ExportButtons';

export default function SampleReportClient() {
  return (
    <div className="min-h-screen bg-background-dark">
      {/* Glow Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="glow-effect-green" style={{ top: '10%', left: '20%' }}></div>
        <div className="glow-effect-cyan" style={{ top: '60%', right: '15%' }}></div>
        <div className="glow-effect-green" style={{ bottom: '20%', left: '50%' }}></div>
      </div>

      {/* Header */}
      <header className="nav-dark print:hidden relative z-50">
        <div className="container-professional py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-2xl font-bold text-gradient-neon">
                CulturaBuilder
              </Link>
              <Link
                href="/assessment"
                className="text-sm text-tech-gray-400 hover:text-neon-green transition-colors flex items-center gap-1"
              >
                Criar Seu Relatório →
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <LayoutSelector />
              <ExportButtons report={COMPLETE_SAMPLE_REPORT} compact={true} />
            </div>
          </div>
        </div>
      </header>

      {/* Report Content */}
      <main className="container-professional py-16 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Use wrapper to handle all layout variants */}
          <ReportLayoutWrapper
            report={COMPLETE_SAMPLE_REPORT}
            benchmarkComparison={null}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="container-professional py-8 text-center text-sm text-tech-gray-500 border-t border-tech-gray-800 bg-background-darker relative z-10">
        <p>© 2025 CulturaBuilder. Todos os cálculos baseados em pesquisas verificáveis.</p>
      </footer>
    </div>
  );
}
