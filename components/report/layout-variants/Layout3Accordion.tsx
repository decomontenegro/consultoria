/**
 * Layout 3: Accordion/Collapsible Sections
 *
 * Progressive disclosure layout with:
 * - All sections in collapsible accordions
 * - Expand/collapse individual sections
 * - Summary visible, details hidden by default
 * - Mobile-friendly progressive enhancement
 */

'use client';

import { useState } from 'react';
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
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Layout3AccordionProps {
  report: Report;
  benchmarkComparison: BenchmarkComparison | null;
}

interface AccordionSection {
  id: string;
  title: string;
  summary: string;
  defaultExpanded?: boolean;
}

export default function Layout3Accordion({ report, benchmarkComparison }: Layout3AccordionProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['summary', 'confidence'])
  );

  const { assessmentData, roi, recommendations, roadmap } = report;

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedSections(
      new Set([
        'summary',
        'confidence',
        'benchmark',
        'four-pillar',
        'ai-insights',
        'cost-inaction',
        'risk-matrix',
        'transformation',
        'possibilities',
        'enterprise-roi',
        'engineering-roi',
        'recommendations',
        'roadmap'
      ])
    );
  };

  const collapseAll = () => {
    setExpandedSections(new Set(['summary']));
  };

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="flex items-center justify-between p-4 bg-tech-gray-900/50 border border-tech-gray-700 rounded-lg">
        <div>
          <h2 className="text-lg font-semibold text-tech-gray-100">Navegação Rápida</h2>
          <p className="text-sm text-tech-gray-400">
            {expandedSections.size} de 13 seções expandidas
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="px-4 py-2 text-sm font-medium text-neon-cyan hover:text-neon-green transition-colors"
          >
            Expandir Todas
          </button>
          <button
            onClick={collapseAll}
            className="px-4 py-2 text-sm font-medium text-tech-gray-400 hover:text-tech-gray-200 transition-colors"
          >
            Recolher Todas
          </button>
        </div>
      </div>

      {/* Executive Summary - Always Expanded */}
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

      {/* Accordion Sections */}

      {/* Confidence Indicator */}
      {roi.confidenceLevel && roi.dataQuality && roi.uncertaintyRange && roi.assumptions && (
        <AccordionItem
          id="confidence"
          title="Indicador de Confiança"
          summary={`Confiança: ${roi.confidenceLevel} | Qualidade: ${roi.dataQuality}`}
          isExpanded={expandedSections.has('confidence')}
          onToggle={() => toggleSection('confidence')}
        >
          <ConfidenceIndicator
            confidenceLevel={roi.confidenceLevel}
            dataQuality={roi.dataQuality}
            uncertaintyRange={roi.uncertaintyRange}
            assumptions={roi.assumptions}
          />
        </AccordionItem>
      )}

      {/* Benchmark Comparison */}
      {benchmarkComparison && (
        <AccordionItem
          id="benchmark"
          title="Comparação com Mercado"
          summary={`Benchmark em tempo real vs. ${benchmarkComparison.companyCount} empresas`}
          isExpanded={expandedSections.has('benchmark')}
          onToggle={() => toggleSection('benchmark')}
        >
          <BenchmarkCard comparison={benchmarkComparison} />
        </AccordionItem>
      )}

      {/* 4-Pillar ROI */}
      {roi.fourPillarROI && (
        <AccordionItem
          id="four-pillar"
          title="Framework de ROI - 4 Pilares"
          summary="Análise detalhada: Produtividade, Qualidade, Velocidade e Inovação"
          isExpanded={expandedSections.has('four-pillar')}
          onToggle={() => toggleSection('four-pillar')}
        >
          <FourPillarROISection
            fourPillarROI={roi.fourPillarROI}
            isMockData={!hasRealDepartmentData(report.assessmentData)}
          />
        </AccordionItem>
      )}

      {/* AI Insights */}
      {report.aiInsights && report.aiInsights.length > 0 && (
        <AccordionItem
          id="ai-insights"
          title="Insights da Consultoria AI"
          summary={`${report.aiInsights.length} insights personalizados baseados na sua conversa`}
          isExpanded={expandedSections.has('ai-insights')}
          onToggle={() => toggleSection('ai-insights')}
        >
          <AIInsightsSection insights={report.aiInsights} />
        </AccordionItem>
      )}

      {/* Cost of Inaction */}
      <AccordionItem
        id="cost-inaction"
        title="Custo de Não Agir"
        summary="Impacto financeiro de adiar a transformação digital"
        isExpanded={expandedSections.has('cost-inaction')}
        onToggle={() => toggleSection('cost-inaction')}
      >
        <CostOfInaction
          costOfInaction={report.costOfInaction}
          isMockData={!hasRealDepartmentData(report.assessmentData)}
        />
      </AccordionItem>

      {/* Risk Matrix */}
      <AccordionItem
        id="risk-matrix"
        title="Matriz de Riscos"
        summary="Análise de riscos técnicos, financeiros e organizacionais"
        isExpanded={expandedSections.has('risk-matrix')}
        onToggle={() => toggleSection('risk-matrix')}
      >
        <RiskMatrixSection riskMatrix={report.riskMatrix} />
      </AccordionItem>

      {/* Transformation Profile */}
      <AccordionItem
        id="transformation"
        title="Perfil de Prontidão"
        summary="Score de transformação digital e áreas de melhoria"
        isExpanded={expandedSections.has('transformation')}
        onToggle={() => toggleSection('transformation')}
      >
        <TransformationProfile assessmentData={assessmentData} />
      </AccordionItem>

      {/* Possibilities Matrix */}
      <AccordionItem
        id="possibilities"
        title="Matriz de Possibilidades"
        summary="Casos de uso de IA aplicáveis ao seu contexto"
        isExpanded={expandedSections.has('possibilities')}
        onToggle={() => toggleSection('possibilities')}
      >
        <PossibilitiesMatrix assessmentData={assessmentData} />
      </AccordionItem>

      {/* Enterprise ROI */}
      {report.enterpriseROI && (
        <AccordionItem
          id="enterprise-roi"
          title="ROI Enterprise (Multi-Departamental)"
          summary="Impacto da IA em todos os departamentos da empresa"
          isExpanded={expandedSections.has('enterprise-roi')}
          onToggle={() => toggleSection('enterprise-roi')}
        >
          <EnterpriseROISection
            enterpriseROI={report.enterpriseROI}
            isMockData={!hasRealDepartmentData(report.assessmentData)}
          />
        </AccordionItem>
      )}

      {/* Engineering ROI */}
      <AccordionItem
        id="engineering-roi"
        title="ROI Engineering"
        summary={`Investimento: ${formatCurrency(roi.investment.total)} | Economia Anual: ${formatCurrency(roi.annualSavings.total)}`}
        isExpanded={expandedSections.has('engineering-roi')}
        onToggle={() => toggleSection('engineering-roi')}
      >
        <div className="card-professional p-10">
          <h2 className="text-3xl font-bold font-display text-tech-gray-100 mb-8">
            Análise de ROI (Engineering)
          </h2>
          <div className="text-tech-gray-400 text-center py-8">
            [Engineering ROI Details - See Original Layout]
          </div>
        </div>
      </AccordionItem>

      {/* Recommendations */}
      <AccordionItem
        id="recommendations"
        title="Recomendações Estratégicas"
        summary={`${recommendations.length} recomendações customizadas para sua empresa`}
        isExpanded={expandedSections.has('recommendations')}
        onToggle={() => toggleSection('recommendations')}
      >
        <div className="card-professional p-10">
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
      </AccordionItem>

      {/* Roadmap */}
      <AccordionItem
        id="roadmap"
        title="Roadmap de Implementação"
        summary={`Plano em ${roadmap.length} fases para ${assessmentData.goals.timeline}`}
        isExpanded={expandedSections.has('roadmap')}
        onToggle={() => toggleSection('roadmap')}
      >
        <div className="card-professional p-10">
          <div className="text-tech-gray-400 text-center py-8">
            [Roadmap Details - See Original Layout]
          </div>
        </div>
      </AccordionItem>
    </div>
  );
}

// Accordion Item Component
interface AccordionItemProps {
  id: string;
  title: string;
  summary: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function AccordionItem({
  title,
  summary,
  isExpanded,
  onToggle,
  children
}: AccordionItemProps) {
  return (
    <div className="border border-tech-gray-700 rounded-xl overflow-hidden bg-tech-gray-900/30 backdrop-blur-sm transition-all duration-300 hover:border-neon-cyan/50">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-tech-gray-800/50 transition-colors"
      >
        <div className="flex-1">
          <h3 className="text-xl font-bold text-tech-gray-100 mb-1">{title}</h3>
          <p className="text-sm text-tech-gray-400">{summary}</p>
        </div>
        <div className="ml-4 flex-shrink-0">
          {isExpanded ? (
            <ChevronUp className="w-6 h-6 text-neon-cyan" />
          ) : (
            <ChevronDown className="w-6 h-6 text-tech-gray-400" />
          )}
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-tech-gray-700 animate-fade-in">
          <div className="p-6">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
