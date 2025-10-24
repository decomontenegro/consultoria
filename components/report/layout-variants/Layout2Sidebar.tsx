/**
 * Layout 2: Sidebar with Fixed Navigation
 *
 * Traditional layout with:
 * - Fixed sidebar navigation on the left
 * - Scroll-spy to highlight active section
 * - Jump-to-section functionality
 * - All sections displayed vertically
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Report } from '@/lib/types';
import { formatCurrency, formatPercentage } from '@/lib/calculators/roi-calculator';
import { getSimilarCaseStudiesWithScores } from '@/lib/utils/case-matching';
import TransformationProfile from '@/components/report/TransformationProfile';
import PossibilitiesMatrix from '@/components/report/PossibilitiesMatrix';
import EnterpriseROISection from '@/components/report/EnterpriseROISection';
import CostOfInaction from '@/components/report/CostOfInaction';
import RiskMatrixSection from '@/components/report/RiskMatrixSection';
import AIInsightsSection from '@/components/report/AIInsightsSection';
import ConfidenceIndicator, { ConfidenceBadge } from '@/components/report/ConfidenceIndicator';
import BenchmarkCard from '@/components/report/BenchmarkCard';
import FourPillarROISection from '@/components/report/FourPillarROISection';
import { hasRealDepartmentData } from '@/lib/utils/mock-department-data';
import { BenchmarkComparison } from '@/lib/services/benchmark-service';
import {
  LayoutDashboard,
  Shield,
  DollarSign,
  TrendingUp,
  Target,
  Grid3x3,
  Code,
  Briefcase,
  CheckSquare,
  Rocket,
  Check,
  ExternalLink
} from 'lucide-react';

interface Layout2SidebarProps {
  report: Report;
  benchmarkComparison: BenchmarkComparison | null;
}

interface NavSection {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navSections: NavSection[] = [
  { id: 'summary', label: 'Resumo Executivo', icon: LayoutDashboard },
  { id: 'confidence', label: 'Confiança', icon: Shield },
  { id: 'benchmark', label: 'Benchmark', icon: TrendingUp },
  { id: 'four-pillar', label: 'ROI 4 Pilares', icon: Grid3x3 },
  { id: 'ai-insights', label: 'Insights AI', icon: Target },
  { id: 'cost-inaction', label: 'Custo de Inação', icon: DollarSign },
  { id: 'risk-matrix', label: 'Matriz de Risco', icon: Shield },
  { id: 'transformation', label: 'Prontidão', icon: TrendingUp },
  { id: 'possibilities', label: 'Possibilidades', icon: Grid3x3 },
  { id: 'enterprise-roi', label: 'ROI Enterprise', icon: Briefcase },
  { id: 'engineering-roi', label: 'ROI Engineering', icon: Code },
  { id: 'industry-bench', label: 'Benchmarks', icon: TrendingUp },
  { id: 'case-studies', label: 'Cases', icon: CheckSquare },
  { id: 'recommendations', label: 'Recomendações', icon: Target },
  { id: 'roadmap', label: 'Roadmap', icon: Rocket }
];

export default function Layout2Sidebar({ report, benchmarkComparison }: Layout2SidebarProps) {
  const [activeSection, setActiveSection] = useState('summary');
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const { assessmentData, roi, benchmarks, recommendations, roadmap } = report;

  // Scroll spy effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      for (const section of navSections) {
        const element = sectionRefs.current[section.id];
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = sectionRefs.current[id];
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex gap-8">
      {/* Sidebar Navigation */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-24 space-y-1 p-4 bg-tech-gray-900/50 border border-tech-gray-700 rounded-xl backdrop-blur-sm">
          <h3 className="text-sm font-semibold text-tech-gray-400 uppercase tracking-wider mb-4 px-3">
            Navegação
          </h3>
          {navSections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  text-sm font-medium transition-all duration-200
                  ${activeSection === section.id
                    ? 'bg-gradient-to-r from-neon-cyan/20 to-neon-green/20 text-neon-cyan border-l-2 border-neon-cyan'
                    : 'text-tech-gray-400 hover:text-tech-gray-200 hover:bg-tech-gray-800'
                  }
                `}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{section.label}</span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 space-y-12 min-w-0">
        {/* Executive Summary */}
        <section ref={(el) => (sectionRefs.current['summary'] = el)} id="summary">
          <div className="card-glow p-10">
            <div className="mb-8">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-4xl md:text-5xl font-bold font-display leading-tight">
                  <span className="text-tech-gray-100">Relatório de </span>
                  <span className="text-gradient-neon">Prontidão para IA</span>
                </h1>
                {roi.confidenceLevel && roi.dataQuality && (
                  <div className="flex-shrink-0 mt-2">
                    <ConfidenceBadge
                      confidenceLevel={roi.confidenceLevel}
                      dataQuality={roi.dataQuality}
                    />
                  </div>
                )}
              </div>
              <p className="text-lg text-tech-gray-400">
                {assessmentData.companyInfo.name} •{' '}
                {new Date(report.generatedAt).toLocaleDateString('pt-BR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-8 bg-gradient-to-br from-neon-green/5 to-cyan-500/5 backdrop-blur-sm rounded-xl border border-neon-green/20">
              <div>
                <div className="text-sm font-medium text-tech-gray-400 mb-2 uppercase tracking-wider">
                  Período de Retorno
                </div>
                <div className="text-3xl font-bold leading-none">
                  <span className="text-gradient-neon">{roi.paybackPeriodMonths.toFixed(1)}</span>{' '}
                  <span className="text-lg text-tech-gray-400 font-normal">meses</span>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-tech-gray-400 mb-2 uppercase tracking-wider">
                  NPV 3 Anos
                </div>
                <div className="text-3xl font-bold text-gradient-neon leading-none">
                  {formatCurrency(roi.threeYearNPV)}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-tech-gray-400 mb-2 uppercase tracking-wider">
                  ROI Anual
                </div>
                <div className="text-3xl font-bold text-gradient-neon leading-none">
                  {formatPercentage(roi.irr)}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Confidence Indicator */}
        {roi.confidenceLevel && roi.dataQuality && roi.uncertaintyRange && roi.assumptions && (
          <section ref={(el) => (sectionRefs.current['confidence'] = el)} id="confidence">
            <ConfidenceIndicator
              confidenceLevel={roi.confidenceLevel}
              dataQuality={roi.dataQuality}
              uncertaintyRange={roi.uncertaintyRange}
              assumptions={roi.assumptions}
            />
          </section>
        )}

        {/* Benchmark Comparison */}
        {benchmarkComparison && (
          <section ref={(el) => (sectionRefs.current['benchmark'] = el)} id="benchmark">
            <BenchmarkCard comparison={benchmarkComparison} />
          </section>
        )}

        {/* 4-Pillar ROI */}
        {roi.fourPillarROI && (
          <section ref={(el) => (sectionRefs.current['four-pillar'] = el)} id="four-pillar">
            <FourPillarROISection fourPillarROI={roi.fourPillarROI} />
          </section>
        )}

        {/* AI Insights */}
        {report.aiInsights && report.aiInsights.length > 0 && (
          <section ref={(el) => (sectionRefs.current['ai-insights'] = el)} id="ai-insights">
            <AIInsightsSection insights={report.aiInsights} />
          </section>
        )}

        {/* Cost of Inaction */}
        <section ref={(el) => (sectionRefs.current['cost-inaction'] = el)} id="cost-inaction">
          <CostOfInaction costOfInaction={report.costOfInaction} />
        </section>

        {/* Risk Matrix */}
        <section ref={(el) => (sectionRefs.current['risk-matrix'] = el)} id="risk-matrix">
          <RiskMatrixSection riskMatrix={report.riskMatrix} />
        </section>

        {/* Transformation Profile */}
        <section ref={(el) => (sectionRefs.current['transformation'] = el)} id="transformation">
          <TransformationProfile assessmentData={assessmentData} />
        </section>

        {/* Possibilities Matrix */}
        <section ref={(el) => (sectionRefs.current['possibilities'] = el)} id="possibilities">
          <PossibilitiesMatrix assessmentData={assessmentData} />
        </section>

        {/* Enterprise ROI */}
        {report.enterpriseROI && (
          <section ref={(el) => (sectionRefs.current['enterprise-roi'] = el)} id="enterprise-roi">
            <EnterpriseROISection
              enterpriseROI={report.enterpriseROI}
              isMockData={!hasRealDepartmentData(report.assessmentData)}
            />
          </section>
        )}

        {/* Engineering ROI */}
        <section ref={(el) => (sectionRefs.current['engineering-roi'] = el)} id="engineering-roi">
          <div className="card-professional p-10">
            <h2 className="text-3xl font-bold font-display text-tech-gray-100 mb-8">
              Análise de ROI (Engineering)
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
              <div>
                <h3 className="text-xl font-bold font-display text-tech-gray-100 mb-6">
                  Investimento Inicial
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-base text-tech-gray-300">Custo de Treinamento</span>
                    <span className="text-lg font-bold text-tech-gray-100">
                      {formatCurrency(roi.investment.trainingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-base text-tech-gray-300">
                      Perda de Produtividade (Treinamento)
                    </span>
                    <span className="text-lg font-bold text-tech-gray-100">
                      {formatCurrency(roi.investment.productivityLossDuringTraining)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline pt-4 border-t-2 border-tech-gray-700 mt-4">
                    <span className="text-lg font-bold text-tech-gray-100">
                      Investimento Total
                    </span>
                    <span className="text-2xl font-bold text-tech-gray-100">
                      {formatCurrency(roi.investment.total)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold font-display text-tech-gray-100 mb-6">
                  Economia Anual
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-base text-tech-gray-300">Ganho de Produtividade</span>
                    <span className="text-lg font-bold text-neon-green">
                      {formatCurrency(roi.annualSavings.productivityGain)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-base text-tech-gray-300">Melhoria de Qualidade</span>
                    <span className="text-lg font-bold text-neon-green">
                      {formatCurrency(roi.annualSavings.qualityImprovement)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-base text-tech-gray-300">Time-to-Market Acelerado</span>
                    <span className="text-lg font-bold text-neon-green">
                      {formatCurrency(roi.annualSavings.fasterTimeToMarket)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline pt-4 border-t-2 border-neon-green/30 mt-4">
                    <span className="text-lg font-bold text-tech-gray-100">
                      Economia Anual Total
                    </span>
                    <span className="text-2xl font-bold text-neon-green">
                      {formatCurrency(roi.annualSavings.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-r from-cyan-500/10 to-neon-green/10 border border-neon-cyan/30 rounded-xl">
              <p className="text-base text-tech-gray-200 leading-relaxed">
                <strong className="text-neon-cyan">Metodologia:</strong> Cálculos baseados em estimativas{' '}
                <strong className="text-tech-gray-100">conservadoras</strong> do McKinsey GenAI Report 2024
                (25% de ganho de produtividade vs. 35-45% reportados).
              </p>
            </div>
          </div>
        </section>

        {/* Industry Benchmarks */}
        <section ref={(el) => (sectionRefs.current['industry-bench'] = el)} id="industry-bench" className="card-professional p-10">
          <h2 className="text-3xl font-bold font-display text-tech-gray-100 mb-8">
            Comparação com Benchmarks da Indústria
          </h2>

          <div className="space-y-8">
            {benchmarks.map((benchmark, index) => (
              <div key={index} className="border-b border-tech-gray-800 pb-8 last:border-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold font-display text-tech-gray-100">
                    {benchmark.metric}
                  </h3>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide ${
                      benchmark.percentile >= 75
                        ? 'bg-neon-green/20 text-neon-green border border-neon-green/40'
                        : benchmark.percentile >= 50
                        ? 'bg-amber-400/20 text-amber-400 border border-amber-400/40'
                        : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    }`}
                  >
                    {benchmark.percentile}º percentil
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                  <div className="p-4 bg-background-card/30 rounded-lg border border-tech-gray-700">
                    <div className="text-sm font-medium text-tech-gray-400 mb-2 uppercase tracking-wider">Seu Valor</div>
                    <div className="text-2xl font-bold text-tech-gray-100">
                      {benchmark.yourValue} <span className="text-base text-tech-gray-400 font-normal">{benchmark.unit}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-background-card/30 rounded-lg border border-tech-gray-700">
                    <div className="text-sm font-medium text-tech-gray-400 mb-2 uppercase tracking-wider">Média da Indústria</div>
                    <div className="text-2xl font-bold text-tech-gray-100">
                      {benchmark.industryAvg} <span className="text-base text-tech-gray-400 font-normal">{benchmark.unit}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-background-card/30 rounded-lg border border-tech-gray-700">
                    <div className="text-sm font-medium text-tech-gray-400 mb-2 uppercase tracking-wider">Top Performer</div>
                    <div className="text-2xl font-bold text-neon-green">
                      {benchmark.topPerformer} <span className="text-base text-tech-gray-400 font-normal">{benchmark.unit}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 h-3 bg-tech-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-neon-green to-cyan-500 transition-all duration-500"
                    style={{ width: `${benchmark.percentile}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-cyan-500/10 to-neon-green/10 border border-tech-gray-700 rounded-xl">
            <p className="text-base text-tech-gray-200 leading-relaxed">
              <strong className="text-neon-cyan">Fonte:</strong> DORA State of DevOps Report 2024,
              benchmarks específicos da indústria para {assessmentData.companyInfo.industry}
            </p>
          </div>
        </section>

        <section ref={(el) => (sectionRefs.current['case-studies'] = el)} id="case-studies" className="card-professional p-10">
          <h2 className="text-3xl font-bold font-display text-tech-gray-100 mb-4">
            Empresas Similares Que Implementaram AI
          </h2>
          <p className="text-lg text-tech-gray-400 mb-8 leading-relaxed">
            Cases verificados de empresas como a sua que já transformaram suas operações com AI
          </p>

          <div className="space-y-4">
            {getSimilarCaseStudiesWithScores(
              assessmentData.companyInfo.industry,
              assessmentData.companyInfo.size,
              assessmentData.companyInfo.country,
              5
            ).map(({ caseStudy, score, reasons }) => (
              <div
                key={caseStudy.id}
                className="card-dark p-5 hover:border-neon-green/50 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-tech-gray-100">{caseStudy.company}</h3>
                      {caseStudy.verified && (
                        <Check className="w-4 h-4 text-neon-green" />
                      )}
                    </div>
                    <p className="text-sm text-tech-gray-400 mt-1">
                      {caseStudy.industry} • {caseStudy.area}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.values(caseStudy.results).slice(0, 3).map((result, idx) => (
                    <div key={idx} className="border-l-2 border-neon-green pl-3">
                      <div className="text-xs text-tech-gray-500">{result.metric}</div>
                      <div className="text-lg font-bold text-gradient-neon mt-1">
                        {result.improvement}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-tech-gray-800">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {reasons.slice(0, 2).map((reason, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-neon-green/10 text-neon-green rounded-full">
                        {reason}
                      </span>
                    ))}
                    <span className="text-xs px-2 py-1 bg-neon-cyan/10 text-neon-cyan rounded-full">
                      {score.toFixed(0)}% similaridade
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-tech-gray-500">Payback: </span>
                      <span className="text-neon-cyan font-semibold">{caseStudy.roi.paybackPeriod}</span>
                    </div>
                    <a
                      href={caseStudy.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neon-green hover:text-neon-cyan transition-colors text-sm flex items-center gap-1"
                    >
                      Ver fonte
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section ref={(el) => (sectionRefs.current['recommendations'] = el)} id="recommendations" className="card-professional p-10">
          <h2 className="text-3xl font-bold font-display text-tech-gray-100 mb-8">
            Recomendações Estratégicas
          </h2>
          <div className="space-y-4">
            {recommendations.map((recommendation, index) => (
              <div
                key={index}
                className="card-dark flex items-start p-6 hover:border-neon-green/50 transition-all duration-300"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-neon-green to-neon-cyan text-background-dark shadow-neon-green rounded-full flex items-center justify-center text-lg font-bold mr-4 mt-1">
                  {index + 1}
                </div>
                <p className="text-base text-tech-gray-200 leading-relaxed">{recommendation}</p>
              </div>
            ))}
          </div>
        </section>

        <section ref={(el) => (sectionRefs.current['roadmap'] = el)} id="roadmap" className="card-professional p-10">
          <h2 className="text-3xl font-bold font-display text-tech-gray-100 mb-4">
            Roadmap de Implementação
          </h2>

          <p className="text-lg text-tech-gray-400 mb-8 leading-relaxed">
            Plano de transformação customizado para {assessmentData.goals.timeline}
          </p>

          <div className="space-y-8">
            {roadmap.map((phase, index) => (
              <div
                key={index}
                className="border-l-4 border-neon-green pl-8 pb-8 last:pb-0 relative"
              >
                <div className="absolute -left-3 top-0 w-6 h-6 bg-neon-green rounded-full border-4 border-background-dark"></div>

                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold font-display text-tech-gray-100">
                    {phase.name}
                  </h3>
                  <span className="px-4 py-2 bg-neon-green/20 text-neon-green border border-neon-green/40 rounded-full text-sm font-bold uppercase tracking-wide">
                    {phase.duration}
                  </span>
                </div>

                <div className="mb-5">
                  <h4 className="text-base font-bold text-tech-gray-200 mb-3 uppercase tracking-wide">
                    Objetivos:
                  </h4>
                  <ul className="space-y-2">
                    {phase.objectives.map((objective, objIndex) => (
                      <li key={objIndex} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-2 h-2 bg-neon-green rounded-full mt-2"></span>
                        <span className="text-base text-tech-gray-300 leading-relaxed">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 bg-gradient-to-r from-neon-green/10 to-cyan-500/10 border border-neon-green/30 rounded-xl">
                  <p className="text-base text-tech-gray-200 leading-relaxed">
                    <strong className="text-neon-green">Resultados Esperados:</strong> {phase.expectedResults}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
