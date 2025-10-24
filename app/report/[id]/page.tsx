"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Report } from "@/lib/types";
import { getReport } from "@/lib/services/report-service";
import ExportButtons from "@/components/export/ExportButtons";
import { getBenchmarkComparison, BenchmarkComparison } from "@/lib/services/benchmark-service";

// Layout system
import LayoutSelector from "@/components/report/LayoutSelector";
import ReportLayoutWrapper from "@/components/report/ReportLayoutWrapper";

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [benchmarkComparison, setBenchmarkComparison] = useState<BenchmarkComparison | null>(null);

  useEffect(() => {
    const reportId = params.id as string;
    const loadedReport = getReport(reportId);

    if (!loadedReport) {
      router.push("/");
      return;
    }

    setReport(loadedReport);

    // Load benchmark comparison (if available)
    const comparison = getBenchmarkComparison(reportId);
    setBenchmarkComparison(comparison);

    setLoading(false);
  }, [params.id, router]);

  if (loading || !report) {
    return (
      <div className="min-h-screen bg-background-dark">
        <div className="container-professional py-12">
          <div className="max-w-5xl mx-auto animate-pulse">
            {/* Header Skeleton */}
            <div className="card-professional p-8 mb-8">
              <div className="h-8 bg-tech-gray-800 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-tech-gray-800 rounded w-1/2 mb-8"></div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="h-24 bg-tech-gray-800 rounded"></div>
                <div className="h-24 bg-tech-gray-800 rounded"></div>
                <div className="h-24 bg-tech-gray-800 rounded"></div>
              </div>
            </div>

            {/* Content Skeleton */}
            <div className="card-professional p-8 mb-8">
              <div className="h-6 bg-tech-gray-800 rounded w-1/3 mb-6"></div>
              <div className="space-y-3">
                <div className="h-4 bg-tech-gray-800 rounded w-full"></div>
                <div className="h-4 bg-tech-gray-800 rounded w-5/6"></div>
                <div className="h-4 bg-tech-gray-800 rounded w-4/6"></div>
              </div>
            </div>

            <div className="text-center mt-8">
              <div className="inline-flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neon-green"></div>
                <p className="text-tech-gray-400">Gerando seu relatório...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { assessmentData, roi, benchmarks, recommendations, roadmap } = report;

  return (
    <div className="min-h-screen bg-background-dark">
      {/* Glow Effects Background */}
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
                href="/dashboard"
                className="text-sm text-tech-gray-400 hover:text-neon-green transition-colors flex items-center gap-1"
              >
                ← Meus Reports
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <LayoutSelector />
              <ExportButtons report={report} compact={true} />
            </div>
          </div>
        </div>
      </header>

      {/* Report Content */}
      <main className="container-professional py-16 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Use wrapper to handle all layout variants */}
          <ReportLayoutWrapper
            report={report}
            benchmarkComparison={benchmarkComparison}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="container-professional py-8 text-center text-sm text-tech-gray-500 border-t border-tech-gray-800 bg-background-darker print:hidden relative z-10">
        <p className="text-tech-gray-600">
          © 2025 CulturaBuilder. Todos os cálculos baseados em pesquisas verificadas da
          indústria (McKinsey, DORA, Forrester, GitHub).
        </p>
      </footer>
    </div>
  );
}
