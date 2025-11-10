/**
 * Layout 1: Dashboard with Tabs
 *
 * Organizes report sections into 4 thematic tabs:
 * - Overview: Summary, confidence, benchmarks, profile
 * - Financial: ROI analyses, cost of inaction
 * - Technical: Risk matrix, possibilities, case studies
 * - Implementation: AI insights, recommendations, roadmap
 */

'use client';

import { useState } from 'react';
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
  DollarSign,
  Code,
  Rocket,
  Check,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

interface Layout1TabsProps {
  report: Report;
  benchmarkComparison: BenchmarkComparison | null;
}

type TabId = 'overview' | 'financial' | 'technical' | 'implementation';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const tabs: Tab[] = [
  {
    id: 'overview',
    label: 'Visão Geral',
    icon: LayoutDashboard,
    description: 'Resumo executivo e indicadores principais'
  },
  {
    id: 'financial',
    label: 'Análise Financeira',
    icon: DollarSign,
    description: 'ROI, investimentos e economia'
  },
  {
    id: 'technical',
    label: 'Análise Técnica',
    icon: Code,
    description: 'Riscos, possibilidades e benchmarks'
  },
  {
    id: 'implementation',
    label: 'Implementação',
    icon: Rocket,
    description: 'Roadmap e recomendações'
  }
];

export default function Layout1Tabs({ report, benchmarkComparison }: Layout1TabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const { assessmentData, roi, benchmarks, recommendations, roadmap } = report;

  return (
    <div className="space-y-8">
      {/* Executive Summary - Always Visible */}
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

      {/* Tabs Navigation */}
      <div className="card-professional p-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  group relative p-4 rounded-lg
                  border-2 transition-all duration-300
                  ${activeTab === tab.id
                    ? 'bg-gradient-to-br from-neon-cyan/20 to-neon-green/20 border-neon-cyan shadow-lg shadow-neon-cyan/20'
                    : 'bg-tech-gray-800/50 border-tech-gray-700 hover:border-neon-cyan/50'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <Icon className={`w-6 h-6 ${activeTab === tab.id ? 'text-neon-cyan' : 'text-tech-gray-400 group-hover:text-neon-cyan'}`} />
                  <div>
                    <div className={`font-semibold ${activeTab === tab.id ? 'text-neon-cyan' : 'text-tech-gray-200'}`}>
                      {tab.label}
                    </div>
                    <div className="text-xs text-tech-gray-500 mt-1 hidden md:block">
                      {tab.description}
                    </div>
                  </div>
                </div>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-neon-cyan rotate-45" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Confidence Indicator */}
            {roi.confidenceLevel && roi.dataQuality && roi.uncertaintyRange && roi.assumptions && (
              <ConfidenceIndicator
                confidenceLevel={roi.confidenceLevel}
                dataQuality={roi.dataQuality}
                uncertaintyRange={roi.uncertaintyRange}
                assumptions={roi.assumptions}
              />
            )}

            {/* Benchmark Comparison */}
            {benchmarkComparison && (
              <BenchmarkCard comparison={benchmarkComparison} />
            )}

            {/* Transformation Profile */}
            <TransformationProfile assessmentData={assessmentData} />
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="space-y-8">
            {/* 4-Pillar ROI */}
            {roi.fourPillarROI && (
              <FourPillarROISection
                fourPillarROI={roi.fourPillarROI}
                isMockData={!hasRealDepartmentData(report.assessmentData)}
              />
            )}

            {/* Enterprise ROI */}
            {report.enterpriseROI && (
              <EnterpriseROISection
                enterpriseROI={report.enterpriseROI}
                isMockData={!hasRealDepartmentData(report.assessmentData)}
              />
            )}

            {/* Engineering ROI */}
            <div className="card-professional p-10">
              <h2 className="text-3xl font-bold font-display text-tech-gray-100 mb-8">
                Análise de ROI (Engineering)
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
                {/* Investment */}
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

                {/* Annual Savings */}
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
                  (25% de ganho de produtividade vs. 35-45% reportados). Todos os valores usam
                  benchmarks verificados da indústria de DORA, Forrester e GitHub research.
                </p>
              </div>
            </div>

            {/* Cost of Inaction */}
            <CostOfInaction
              costOfInaction={report.costOfInaction}
              isMockData={!hasRealDepartmentData(report.assessmentData)}
            />
          </div>
        )}

        {activeTab === 'technical' && (
          <div className="space-y-8">
            {/* Risk Matrix */}
            <RiskMatrixSection riskMatrix={report.riskMatrix} />

            {/* Possibilities Matrix */}
            <PossibilitiesMatrix assessmentData={assessmentData} />

            {/* Industry Benchmarks */}
            <div className="card-professional p-10">
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
            </div>

            {/* Case Studies */}
            <div className="card-professional p-10">
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
            </div>
          </div>
        )}

        {activeTab === 'implementation' && (
          <div className="space-y-8">
            {/* AI Insights */}
            {report.aiInsights && report.aiInsights.length > 0 && (
              <AIInsightsSection insights={report.aiInsights} />
            )}

            {/* Recommendations */}
            <div className="card-professional p-10">
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
            </div>

            {/* Implementation Roadmap */}
            <div className="card-professional p-10">
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
            </div>

            {/* CTA */}
            <div className="card-professional p-10 bg-gradient-to-br from-neon-green/5 via-background-card to-cyan-500/5 border-2 border-neon-green/40">
              <h2 className="text-3xl md:text-4xl font-bold font-display mb-6 text-gradient-neon">
                Pronto para Transformar?
              </h2>
              <p className="mb-8 text-lg text-tech-gray-200 leading-relaxed max-w-3xl">
                Agende uma consultoria com a CulturaBuilder para discutir seu
                plano de implementação customizado e começar a realizar esses benefícios.
              </p>
              <div className="flex gap-4">
                <a
                  href="https://culturabuilder.com/contact"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  Agendar Consultoria
                </a>
                <button
                  onClick={() => window.print()}
                  className="btn-outline-neon"
                >
                  Baixar Relatório
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
