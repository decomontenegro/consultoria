/**
 * Layout 5: Story-Driven Narrative
 *
 * Narrative-based layout with:
 * - Chapter-based progression
 * - Story arc: Current State → Challenge → Opportunity → Solution → Next Steps
 * - Engaging storytelling approach
 * - Natural reading flow
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
import {
  BookOpen,
  TrendingDown,
  Sparkles,
  Target,
  Rocket,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

interface Layout5StoryProps {
  report: Report;
  benchmarkComparison: BenchmarkComparison | null;
}

type ChapterId = 'intro' | 'current-state' | 'challenge' | 'opportunity' | 'solution' | 'action';

interface Chapter {
  id: ChapterId;
  number: number;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const chapters: Chapter[] = [
  {
    id: 'intro',
    number: 1,
    title: 'Sua Jornada para IA',
    subtitle: 'Uma análise personalizada da transformação digital da sua empresa',
    icon: BookOpen,
    color: 'neon-cyan'
  },
  {
    id: 'current-state',
    number: 2,
    title: 'Onde Você Está Hoje',
    subtitle: 'Análise do estado atual e prontidão para IA',
    icon: Target,
    color: 'blue-400'
  },
  {
    id: 'challenge',
    number: 3,
    title: 'O Custo de Esperar',
    subtitle: 'Riscos e impacto de não agir agora',
    icon: TrendingDown,
    color: 'amber-400'
  },
  {
    id: 'opportunity',
    number: 4,
    title: 'O Que É Possível',
    subtitle: 'Oportunidades e casos de sucesso',
    icon: Sparkles,
    color: 'neon-green'
  },
  {
    id: 'solution',
    number: 5,
    title: 'Seu Plano de Transformação',
    subtitle: 'ROI, recomendações e roadmap customizado',
    icon: Target,
    color: 'neon-cyan'
  },
  {
    id: 'action',
    number: 6,
    title: 'Próximos Passos',
    subtitle: 'Como começar sua jornada hoje',
    icon: Rocket,
    color: 'neon-green'
  }
];

export default function Layout5Story({ report, benchmarkComparison }: Layout5StoryProps) {
  const [currentChapter, setCurrentChapter] = useState<ChapterId>('intro');
  const { assessmentData, roi, recommendations, roadmap } = report;

  const currentChapterIndex = chapters.findIndex((c) => c.id === currentChapter);
  const chapter = chapters[currentChapterIndex];

  const goToNextChapter = () => {
    if (currentChapterIndex < chapters.length - 1) {
      setCurrentChapter(chapters[currentChapterIndex + 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPrevChapter = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapter(chapters[currentChapterIndex - 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const Icon = chapter.icon;

  return (
    <div className="space-y-8">
      {/* Chapter Navigator */}
      <div className="card-professional p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h3 className="text-sm font-semibold text-tech-gray-400 uppercase tracking-wider">
            Progresso da Leitura
          </h3>
          <span className="text-sm text-tech-gray-400">
            Capítulo {chapter.number} de {chapters.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-tech-gray-800 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-neon-cyan to-neon-green transition-all duration-500"
            style={{ width: `${((chapter.number) / chapters.length) * 100}%` }}
          />
        </div>

        {/* Chapter Pills */}
        <div className="flex flex-wrap gap-2">
          {chapters.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setCurrentChapter(ch.id)}
              className={`
                px-3 py-1.5 rounded-full text-xs font-medium transition-all
                ${currentChapter === ch.id
                  ? 'bg-gradient-to-r from-neon-cyan to-neon-green text-background-dark'
                  : 'bg-tech-gray-800 text-tech-gray-400 hover:text-tech-gray-200'
                }
              `}
            >
              {ch.number}. {ch.title}
            </button>
          ))}
        </div>
      </div>

      {/* Chapter Header */}
      <div className={`card-glow p-10 bg-gradient-to-br from-${chapter.color}/5 to-background-card`}>
        <div className="flex items-center gap-4 mb-4">
          <div className={`p-4 rounded-xl bg-${chapter.color}/20 border border-${chapter.color}/30`}>
            <Icon className={`w-8 h-8 text-${chapter.color}`} />
          </div>
          <div>
            <div className="text-sm font-semibold text-tech-gray-400 uppercase tracking-wider mb-1">
              Capítulo {chapter.number}
            </div>
            <h1 className="text-4xl font-bold font-display text-tech-gray-100">
              {chapter.title}
            </h1>
            <p className="text-lg text-tech-gray-400 mt-2">
              {chapter.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Chapter Content */}
      <div className="prose prose-invert max-w-none">
        {currentChapter === 'intro' && (
          <div className="space-y-8">
            <div className="card-professional p-10">
              <h2 className="text-3xl font-bold mb-6 text-gradient-neon">
                Bem-vindo ao Seu Relatório de Prontidão para IA
              </h2>
              <p className="text-lg text-tech-gray-200 leading-relaxed mb-6">
                {assessmentData.companyInfo.name}, este relatório foi criado especialmente para você.
                Vamos contar a história da sua transformação digital — onde você está hoje,
                os desafios que enfrenta, e o caminho para desbloquear todo o potencial da IA.
              </p>

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

              {roi.confidenceLevel && roi.dataQuality && (
                <div className="mt-8 flex items-center gap-3 p-4 bg-neon-cyan/10 border border-neon-cyan/30 rounded-lg">
                  <ConfidenceBadge
                    confidenceLevel={roi.confidenceLevel}
                    dataQuality={roi.dataQuality}
                  />
                  <p className="text-sm text-tech-gray-300">
                    Este relatório foi gerado em {new Date(report.generatedAt).toLocaleDateString('pt-BR')} e
                    baseia-se em dados de {roi.dataQuality}.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {currentChapter === 'current-state' && (
          <div className="space-y-8">
            <div className="card-professional p-10">
              <h2 className="text-3xl font-bold mb-6 text-tech-gray-100">
                O Estado Atual da {assessmentData.companyInfo.name}
              </h2>
              <p className="text-lg text-tech-gray-200 leading-relaxed mb-8">
                Antes de falar sobre onde você pode chegar, vamos entender onde você está hoje.
                Esta análise revela seu nível de prontidão para IA e identifica oportunidades
                de melhoria.
              </p>
            </div>

            {/* Confidence & Benchmark */}
            {roi.confidenceLevel && roi.dataQuality && roi.uncertaintyRange && roi.assumptions && (
              <ConfidenceIndicator
                confidenceLevel={roi.confidenceLevel}
                dataQuality={roi.dataQuality}
                uncertaintyRange={roi.uncertaintyRange}
                assumptions={roi.assumptions}
              />
            )}

            {benchmarkComparison && <BenchmarkCard comparison={benchmarkComparison} />}

            <TransformationProfile assessmentData={assessmentData} />
          </div>
        )}

        {currentChapter === 'challenge' && (
          <div className="space-y-8">
            <div className="card-professional p-10">
              <h2 className="text-3xl font-bold mb-6 text-tech-gray-100">
                O Custo de Não Agir
              </h2>
              <p className="text-lg text-tech-gray-200 leading-relaxed mb-8">
                Toda decisão de "esperar" tem um custo. Enquanto seus competidores avançam com IA,
                cada dia de inação representa oportunidades perdidas, eficiências não capturadas,
                e terreno cedido no mercado.
              </p>
            </div>

            <CostOfInaction costOfInaction={report.costOfInaction} />
            <RiskMatrixSection riskMatrix={report.riskMatrix} />
          </div>
        )}

        {currentChapter === 'opportunity' && (
          <div className="space-y-8">
            <div className="card-professional p-10">
              <h2 className="text-3xl font-bold mb-6 text-tech-gray-100">
                O Que É Possível com IA
              </h2>
              <p className="text-lg text-tech-gray-200 leading-relaxed mb-8">
                Agora, a parte empolgante. Vamos explorar o que empresas como a sua já estão
                alcançando com IA, e as possibilidades específicas para o seu contexto.
              </p>
            </div>

            {roi.fourPillarROI && <FourPillarROISection fourPillarROI={roi.fourPillarROI} />}
            <PossibilitiesMatrix assessmentData={assessmentData} />

            {report.enterpriseROI && (
              <EnterpriseROISection
                enterpriseROI={report.enterpriseROI}
                isMockData={!hasRealDepartmentData(report.assessmentData)}
              />
            )}
          </div>
        )}

        {currentChapter === 'solution' && (
          <div className="space-y-8">
            <div className="card-professional p-10">
              <h2 className="text-3xl font-bold mb-6 text-tech-gray-100">
                Seu Plano de Transformação
              </h2>
              <p className="text-lg text-tech-gray-200 leading-relaxed mb-8">
                Com base na sua realidade e objetivos, aqui está seu plano personalizado
                para implementar IA de forma estratégica e sustentável.
              </p>
            </div>

            {report.aiInsights && report.aiInsights.length > 0 && (
              <AIInsightsSection insights={report.aiInsights} />
            )}

            <div className="card-professional p-10">
              <h3 className="text-2xl font-bold font-display text-tech-gray-100 mb-8">
                Recomendações Estratégicas
              </h3>
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

            <div className="card-professional p-10">
              <h3 className="text-2xl font-bold font-display text-tech-gray-100 mb-4">
                Roadmap de Implementação
              </h3>
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
                      <h4 className="text-2xl font-bold font-display text-tech-gray-100">
                        {phase.name}
                      </h4>
                      <span className="px-4 py-2 bg-neon-green/20 text-neon-green border border-neon-green/40 rounded-full text-sm font-bold uppercase tracking-wide">
                        {phase.duration}
                      </span>
                    </div>
                    <div className="mb-5">
                      <h5 className="text-base font-bold text-tech-gray-200 mb-3 uppercase tracking-wide">
                        Objetivos:
                      </h5>
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
          </div>
        )}

        {currentChapter === 'action' && (
          <div className="space-y-8">
            <div className="card-professional p-10 bg-gradient-to-br from-neon-green/5 via-background-card to-cyan-500/5 border-2 border-neon-green/40">
              <h2 className="text-3xl md:text-4xl font-bold font-display mb-6 text-gradient-neon">
                Sua Jornada Começa Agora
              </h2>
              <p className="mb-8 text-lg text-tech-gray-200 leading-relaxed max-w-3xl">
                Você viu os números. Você entendeu os riscos de esperar e as oportunidades
                de agir. Agora é hora de dar o primeiro passo.
              </p>

              <div className="space-y-4 mb-8">
                <h3 className="text-xl font-bold text-tech-gray-100">O que fazer agora:</h3>
                <ol className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-neon-green to-neon-cyan text-background-dark rounded-full flex items-center justify-center font-bold">1</span>
                    <p className="text-tech-gray-200 pt-1">
                      <strong>Compartilhe este relatório</strong> com stakeholders e decision-makers
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-neon-green to-neon-cyan text-background-dark rounded-full flex items-center justify-center font-bold">2</span>
                    <p className="text-tech-gray-200 pt-1">
                      <strong>Agende uma consultoria</strong> para discutir próximos passos
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-neon-green to-neon-cyan text-background-dark rounded-full flex items-center justify-center font-bold">3</span>
                    <p className="text-tech-gray-200 pt-1">
                      <strong>Comece pequeno</strong> com um projeto piloto de alto impacto
                    </p>
                  </li>
                </ol>
              </div>

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
        )}
      </div>

      {/* Chapter Navigation */}
      <div className="flex items-center justify-between gap-4 pt-8 border-t border-tech-gray-700">
        <button
          onClick={goToPrevChapter}
          disabled={currentChapterIndex === 0}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all
            ${currentChapterIndex === 0
              ? 'opacity-40 cursor-not-allowed text-tech-gray-500'
              : 'text-neon-cyan hover:text-neon-green hover:bg-tech-gray-800'
            }
          `}
        >
          <ChevronLeft className="w-5 h-5" />
          Anterior
        </button>

        <button
          onClick={goToNextChapter}
          disabled={currentChapterIndex === chapters.length - 1}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all
            ${currentChapterIndex === chapters.length - 1
              ? 'opacity-40 cursor-not-allowed text-tech-gray-500'
              : 'bg-gradient-to-r from-neon-cyan to-neon-green text-background-dark hover:from-neon-cyan/90 hover:to-neon-green/90'
            }
          `}
        >
          Próximo
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
