/**
 * Layout 4: Modular Dashboard
 *
 * Card-based dashboard layout with:
 * - Modular card grid system
 * - Each section as an independent card
 * - Potential for drag-and-drop reorganization (future)
 * - Responsive grid layout
 */

'use client';

import { Report } from '@/lib/types';
import { formatCurrency, formatPercentage } from '@/lib/calculators/roi-calculator';
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
import MetricCardWithModal from '@/components/report/shared/MetricCardWithModal';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Target,
  Shield,
  Zap
} from 'lucide-react';

interface Layout4ModularProps {
  report: Report;
  benchmarkComparison: BenchmarkComparison | null;
}

export default function Layout4Modular({ report, benchmarkComparison }: Layout4ModularProps) {
  const { assessmentData, roi, recommendations, roadmap } = report;

  return (
    <div className="space-y-8">
      {/* Hero Card */}
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
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCardWithModal
          title="Período de Retorno"
          value={`${roi.paybackPeriodMonths.toFixed(1)} meses`}
          subtitle="Tempo até recuperar investimento"
          icon={Calendar}
          trend="up"
          trendValue="Rápido ROI"
          detailedExplanation={
            <>
              <p>
                O período de retorno (payback) de <strong>{roi.paybackPeriodMonths.toFixed(1)} meses</strong> indica
                quanto tempo levará para que os benefícios financeiros da implementação de IA
                recuperem o investimento inicial.
              </p>
              <p className="mt-3">
                Este é um período <strong>excelente</strong> comparado aos benchmarks da indústria,
                que variam entre 12-18 meses para projetos similares.
              </p>
            </>
          }
          methodology={
            <>
              <p>
                Calculado dividindo o investimento total ({formatCurrency(roi.investment.total)}) pela
                economia mensal projetada ({formatCurrency(roi.annualSavings.total / 12)}).
              </p>
              <p className="mt-2">
                Considera: custos de treinamento, perda de produtividade inicial, e ganhos graduais
                de eficiência.
              </p>
            </>
          }
        />

        <MetricCardWithModal
          title="NPV 3 Anos"
          value={formatCurrency(roi.threeYearNPV)}
          subtitle="Valor Presente Líquido"
          icon={DollarSign}
          trend="up"
          trendValue={`+${formatPercentage(roi.irr)}`}
          detailedExplanation={
            <>
              <p>
                O Valor Presente Líquido (NPV) de <strong>{formatCurrency(roi.threeYearNPV)}</strong> representa
                o valor total que sua empresa ganhará nos próximos 3 anos, ajustado pela taxa de desconto.
              </p>
              <p className="mt-3">
                Um NPV positivo indica que o projeto é financeiramente viável e trará retornos
                significativos além do custo de capital.
              </p>
            </>
          }
          methodology={
            <>
              <p>
                Calculado usando fluxo de caixa descontado (DCF) com taxa de 10% ao ano.
              </p>
              <p className="mt-2">
                Fórmula: NPV = Σ (Fluxo de Caixa / (1 + taxa)^período) - Investimento Inicial
              </p>
            </>
          }
        />

        <MetricCardWithModal
          title="ROI Anual"
          value={formatPercentage(roi.irr)}
          subtitle="Taxa Interna de Retorno"
          icon={TrendingUp}
          trend="up"
          trendValue="Alto retorno"
          detailedExplanation={
            <>
              <p>
                O ROI anual de <strong>{formatPercentage(roi.irr)}</strong> representa a taxa de retorno
                que você pode esperar do seu investimento em IA.
              </p>
              <p className="mt-3">
                Esta taxa supera significativamente os benchmarks tradicionais de investimentos em
                tecnologia (15-25%) e demonstra o alto impacto da transformação com IA.
              </p>
            </>
          }
          methodology={
            <>
              <p>
                Calculado como Taxa Interna de Retorno (IRR) considerando todos os fluxos de caixa
                ao longo de 3 anos.
              </p>
              <p className="mt-2">
                Baseado em premissas conservadoras do McKinsey GenAI Report 2024.
              </p>
            </>
          }
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confidence Indicator */}
        {roi.confidenceLevel && roi.dataQuality && roi.uncertaintyRange && roi.assumptions && (
          <div className="lg:col-span-2">
            <ConfidenceIndicator
              confidenceLevel={roi.confidenceLevel}
              dataQuality={roi.dataQuality}
              uncertaintyRange={roi.uncertaintyRange}
              assumptions={roi.assumptions}
            />
          </div>
        )}

        {/* Benchmark Comparison */}
        {benchmarkComparison && (
          <div className="lg:col-span-2">
            <BenchmarkCard comparison={benchmarkComparison} />
          </div>
        )}

        {/* 4-Pillar ROI */}
        {roi.fourPillarROI && (
          <div className="lg:col-span-2">
            <FourPillarROISection
              fourPillarROI={roi.fourPillarROI}
              isMockData={!hasRealDepartmentData(report.assessmentData)}
            />
          </div>
        )}

        {/* AI Insights */}
        {report.aiInsights && report.aiInsights.length > 0 && (
          <div className="lg:col-span-2">
            <AIInsightsSection insights={report.aiInsights} />
          </div>
        )}

        {/* Cost of Inaction */}
        <div className="lg:col-span-2">
          <CostOfInaction
            costOfInaction={report.costOfInaction}
            isMockData={!hasRealDepartmentData(report.assessmentData)}
          />
        </div>

        {/* Risk Matrix */}
        <div>
          <RiskMatrixSection riskMatrix={report.riskMatrix} />
        </div>

        {/* Transformation Profile */}
        <div>
          <TransformationProfile assessmentData={assessmentData} />
        </div>

        {/* Possibilities Matrix */}
        <div className="lg:col-span-2">
          <PossibilitiesMatrix assessmentData={assessmentData} />
        </div>

        {/* Enterprise ROI */}
        {report.enterpriseROI && (
          <div className="lg:col-span-2">
            <EnterpriseROISection
              enterpriseROI={report.enterpriseROI}
              isMockData={!hasRealDepartmentData(report.assessmentData)}
            />
          </div>
        )}

        {/* Recommendations */}
        <div className="card-professional p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-br from-neon-cyan/20 to-neon-green/20 border border-neon-cyan/30">
              <Target className="w-6 h-6 text-neon-cyan" />
            </div>
            <h2 className="text-2xl font-bold font-display text-tech-gray-100">
              Recomendações
            </h2>
          </div>
          <div className="space-y-3">
            {recommendations.slice(0, 3).map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-tech-gray-800/50 rounded-lg">
                <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-neon-green to-neon-cyan text-background-dark rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <p className="text-sm text-tech-gray-200 leading-relaxed">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Roadmap Summary */}
        <div className="card-professional p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-br from-neon-cyan/20 to-neon-green/20 border border-neon-cyan/30">
              <Zap className="w-6 h-6 text-neon-cyan" />
            </div>
            <h2 className="text-2xl font-bold font-display text-tech-gray-100">
              Roadmap
            </h2>
          </div>
          <div className="space-y-3">
            {roadmap.map((phase, index) => (
              <div key={index} className="border-l-2 border-neon-cyan pl-4 pb-4 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-tech-gray-100">{phase.name}</h4>
                  <span className="text-xs px-2 py-1 bg-neon-cyan/20 text-neon-cyan rounded-full">
                    {phase.duration}
                  </span>
                </div>
                <p className="text-sm text-tech-gray-400 line-clamp-2">
                  {phase.objectives[0]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Card */}
      <div className="card-professional p-10 bg-gradient-to-br from-neon-green/5 via-background-card to-cyan-500/5 border-2 border-neon-green/40">
        <h2 className="text-3xl md:text-4xl font-bold font-display mb-6 text-gradient-neon">
          Pronto para Transformar?
        </h2>
        <p className="mb-8 text-lg text-tech-gray-200 leading-relaxed max-w-3xl">
          Agende uma consultoria com a CulturaBuilder para discutir seu
          plano de implementação customizado.
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
          <button onClick={() => window.print()} className="btn-outline-neon">
            Baixar Relatório
          </button>
        </div>
      </div>
    </div>
  );
}
