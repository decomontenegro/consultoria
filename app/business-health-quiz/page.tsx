'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AREA_METADATA } from '@/lib/business-quiz/area-relationships';

export default function BusinessHealthQuizPage() {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = async () => {
    setIsStarting(true);

    try {
      const response = await fetch('/api/business-quiz/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initialContext: {} }),
      });

      const data = await response.json();

      if (data.sessionId) {
        // Redirect to quiz flow
        router.push(`/business-health-quiz/quiz?session=${data.sessionId}`);
      }
    } catch (error) {
      console.error('Failed to start quiz:', error);
      setIsStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">CB</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CulturaBuilder</h1>
                <p className="text-xs text-gray-600">Business Health Quiz</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span>🎯</span>
              <span>Diagnóstico Empresarial Inteligente</span>
            </div>

            <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
              Descubra a saúde do seu negócio em{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                8 minutos
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Um quiz adaptativo de 19 perguntas que identifica sua expertise, analisa suas áreas de risco
              e gera um diagnóstico completo com recomendações priorizadas.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button
                onClick={handleStart}
                disabled={isStarting}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isStarting ? 'Iniciando...' : 'Começar Diagnóstico →'}
              </button>

              <button className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold text-lg hover:border-gray-300 transition-all">
                Ver Exemplo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="text-3xl font-bold text-gray-900">19</div>
                <div className="text-sm text-gray-600">Perguntas</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">8 min</div>
                <div className="text-sm text-gray-600">Duração</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">7</div>
                <div className="text-sm text-gray-600">Áreas Analisadas</div>
              </div>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-medium text-gray-600">Áreas Analisadas</span>
                <span className="text-xs text-gray-500">Powered by AI</span>
              </div>

              <div className="space-y-4">
                {Object.entries(AREA_METADATA).map(([key, area]) => (
                  <div key={key} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center text-2xl">
                      {area.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">{area.name}</div>
                      <div className="text-xs text-gray-500">{area.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute -top-4 -right-4 bg-gradient-to-br from-green-400 to-blue-500 text-white px-6 py-3 rounded-full shadow-lg transform rotate-12">
              <div className="text-xs font-medium">100% Gratuito</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
          Como Funciona
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Um processo adaptativo em 4 blocos que se ajusta ao seu perfil
        </p>

        <div className="grid md:grid-cols-4 gap-8">
          {[
            {
              step: '1',
              title: 'Contexto',
              description: '7 perguntas sobre sua empresa e mercado',
              icon: '🏢',
            },
            {
              step: '2',
              title: 'Expertise',
              description: 'Detectamos sua área de conhecimento',
              icon: '🎯',
            },
            {
              step: '3',
              title: 'Deep-Dive',
              description: '5 perguntas aprofundadas na sua área',
              icon: '🔍',
            },
            {
              step: '4',
              title: 'Risk Scan',
              description: '3 perguntas sobre áreas de risco',
              icon: '⚠️',
            },
          ].map((block, index) => (
            <div key={block.step} className="relative">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl mb-4">
                  {block.step}
                </div>
                <div className="text-4xl mb-3">{block.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{block.title}</h3>
                <p className="text-sm text-gray-600">{block.description}</p>
              </div>

              {index < 3 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path
                      d="M12 8L20 16L12 24"
                      stroke="#E5E7EB"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* What You Get */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          O que você receberá
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-100">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Health Scores</h3>
            <p className="text-gray-600 mb-4">
              Scores de 0-100 para todas as 7 áreas do seu negócio, com benchmarks e status.
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Análise por área</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Comparação com mercado</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 border border-purple-100">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Recomendações</h3>
            <p className="text-gray-600 mb-4">
              Ações priorizadas (crítico → baixo) com impacto esperado e timeframe.
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Priorização inteligente</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>ROI estimado</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-8 border border-green-100">
            <div className="text-4xl mb-4">🗺️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Roadmap 90 Dias</h3>
            <p className="text-gray-600 mb-4">
              Plano de ação estruturado em fases de 30-60-90 dias com ações específicas.
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Quick wins</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Ações de longo prazo</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para descobrir o potencial do seu negócio?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Comece agora e receba seu diagnóstico completo em minutos
          </p>
          <button
            onClick={handleStart}
            disabled={isStarting}
            className="px-10 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:shadow-2xl transition-all disabled:opacity-50"
          >
            {isStarting ? 'Iniciando...' : 'Iniciar Diagnóstico Gratuito'}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 text-sm">
          <p>Powered by Claude AI • Dados 100% confidenciais • Sem cadastro necessário</p>
        </div>
      </footer>
    </div>
  );
}
