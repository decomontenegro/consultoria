"use client";

import { useState } from 'react';
import { getFeaturedCaseStudies, getRegionalCaseStudies } from '@/lib/utils/case-studies';
import CaseStudyCard from './CaseStudyCard';
import { CaseStudy } from '@/lib/types';

export default function CaseStudiesSection() {
  const [showModal, setShowModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null);
  const [filter, setFilter] = useState<'all' | 'global' | 'regional'>('all');

  const featuredCases = getFeaturedCaseStudies();
  const regionalCases = getRegionalCaseStudies();

  const allCases = filter === 'regional'
    ? regionalCases
    : filter === 'global'
    ? featuredCases.filter(c => !c.regional)
    : featuredCases;

  const handleCardClick = (caseStudy: CaseStudy) => {
    setSelectedCase(caseStudy);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCase(null);
  };

  return (
    <div className="border-t border-tech-gray-800 bg-background-card/20 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl"></div>

      <div className="container-professional py-24 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 font-display">
            <span className="text-tech-gray-100">Empresas Que </span>
            <span className="text-gradient-neon">Já Transformaram</span>
          </h2>
          <p className="text-lg text-tech-gray-400 max-w-3xl mx-auto mb-8">
            Cases reais e verificados de empresas que implementaram AI e obtiveram resultados mensuráveis
          </p>

          {/* Filters */}
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                filter === 'all'
                  ? 'bg-neon-green/10 border border-neon-green text-neon-green'
                  : 'bg-tech-gray-800 border border-tech-gray-700 text-tech-gray-400 hover:border-neon-green/50'
              }`}
            >
              Todos os Cases
            </button>
            <button
              onClick={() => setFilter('global')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                filter === 'global'
                  ? 'bg-neon-cyan/10 border border-neon-cyan text-neon-cyan'
                  : 'bg-tech-gray-800 border border-tech-gray-700 text-tech-gray-400 hover:border-neon-cyan/50'
              }`}
            >
              🌎 Global
            </button>
            <button
              onClick={() => setFilter('regional')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                filter === 'regional'
                  ? 'bg-neon-green/10 border border-neon-green text-neon-green'
                  : 'bg-tech-gray-800 border border-tech-gray-700 text-tech-gray-400 hover:border-neon-green/50'
              }`}
            >
              🇧🇷 Brasil
            </button>
          </div>
        </div>

        {/* Case Studies Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {allCases.map((caseStudy) => (
            <CaseStudyCard
              key={caseStudy.id}
              caseStudy={caseStudy}
              onClick={() => handleCardClick(caseStudy)}
            />
          ))}
        </div>

        {/* Stats Summary */}
        <div className="mt-16 p-8 bg-gradient-to-br from-background-card to-background-darker border border-neon-green/30 rounded-2xl max-w-4xl mx-auto">
          <h3 className="text-xl font-bold text-center mb-6 text-gradient-neon">
            Resultados Agregados dos Cases
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-gradient-neon mb-1">25-45%</div>
              <div className="text-sm text-tech-gray-400">Ganho Médio de Produtividade</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gradient-neon mb-1">3-8 meses</div>
              <div className="text-sm text-tech-gray-400">Payback Period Médio</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gradient-neon mb-1">96%</div>
              <div className="text-sm text-tech-gray-400">Taxa de Adoção</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gradient-neon mb-1">90%+</div>
              <div className="text-sm text-tech-gray-400">Satisfação dos Usuários</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedCase && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={closeModal}
        >
          <div
            className="bg-background-card border border-tech-gray-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              className="float-right text-tech-gray-400 hover:text-neon-green transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Content */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-3xl font-bold text-gradient-neon">
                  {selectedCase.company}
                </h2>
                {selectedCase.verified && (
                  <span className="text-neon-green text-xl" title="Verified">✓</span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <span className="badge-info">{selectedCase.industry}</span>
                <span className="badge-neon">{selectedCase.size}</span>
                <span className="badge-success">{selectedCase.country}</span>
              </div>

              {/* Implementation Details */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-tech-gray-100 mb-3">Implementação</h3>
                <div className="card-dark p-4">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-tech-gray-500">Área:</span>{' '}
                      <span className="text-tech-gray-200">{selectedCase.area}</span>
                    </div>
                    <div>
                      <span className="text-tech-gray-500">Ferramenta:</span>{' '}
                      <span className="text-neon-cyan">{selectedCase.tool}</span>
                    </div>
                    <div>
                      <span className="text-tech-gray-500">Tamanho do Time:</span>{' '}
                      <span className="text-tech-gray-200">{selectedCase.implementation.teamSize}</span>
                    </div>
                    <div>
                      <span className="text-tech-gray-500">Duração:</span>{' '}
                      <span className="text-tech-gray-200">{selectedCase.implementation.duration}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-tech-gray-800">
                    <span className="text-tech-gray-500 text-sm">Abordagem:</span>
                    <p className="text-tech-gray-300 text-sm mt-1">{selectedCase.implementation.approach}</p>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-tech-gray-100 mb-3">Resultados</h3>
                <div className="space-y-3">
                  {Object.entries(selectedCase.results).map(([key, result]) => (
                    <div key={key} className="card-glow p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="text-sm text-tech-gray-400">{result.metric}</div>
                          <div className="text-2xl font-bold text-gradient-neon mt-1">
                            {result.improvement}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-tech-gray-400 italic">{result.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ROI */}
              <div className="mb-6 p-4 bg-neon-green/10 border border-neon-green/30 rounded-lg">
                <h3 className="text-lg font-semibold text-neon-green mb-2">ROI</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-tech-gray-400">Payback Period:</span>{' '}
                    <span className="text-tech-gray-100 font-semibold">{selectedCase.roi.paybackPeriod}</span>
                  </div>
                  <div>
                    <span className="text-tech-gray-400">Economia Anual:</span>{' '}
                    <span className="text-tech-gray-100 font-semibold">{selectedCase.roi.annualSavings}</span>
                  </div>
                </div>
              </div>

              {/* Source */}
              <div className="flex items-center justify-between pt-4 border-t border-tech-gray-800">
                <div className="text-sm">
                  <span className="text-tech-gray-500">Fonte: </span>
                  <span className="text-tech-gray-300">{selectedCase.source}</span>
                  <span className="text-tech-gray-600"> • {selectedCase.timeframe}</span>
                </div>
                <a
                  href={selectedCase.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost text-sm"
                >
                  Ver Fonte Original →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
