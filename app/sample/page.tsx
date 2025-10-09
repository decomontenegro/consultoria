'use client';

import Link from 'next/link';
import { ArrowRight, Check, FileText } from 'lucide-react';

export default function SampleReportPage() {
  return (
    <div className="min-h-screen bg-background-dark">
      {/* Glow Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-green/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <header className="nav-dark relative z-10">
        <div className="container-professional py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-gradient-neon">
              CulturaBuilder
            </Link>
            <Link href="/assessment" className="btn-primary text-sm">
              Criar Seu Relatório →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-professional py-16 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-neon-green/10 border border-neon-green/30 rounded-full text-neon-green text-sm font-medium mb-6">
              <FileText size={16} />
              <span>Exemplo de Relatório</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-6">
              <span className="text-tech-gray-100">Veja o Que Você </span>
              <span className="text-gradient-neon">Receberá</span>
            </h1>
            <p className="text-xl text-tech-gray-400 max-w-3xl mx-auto mb-8">
              Este é um exemplo do relatório que você receberá após preencher o assessment de AI readiness.
              Todos os números são baseados em dados reais e pesquisas verificáveis.
            </p>
          </div>

          {/* Sample Company Info Card */}
          <div className="card-glow p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-tech-gray-100 mb-2">
                  TechCorp Brasil - Exemplo
                </h2>
                <p className="text-tech-gray-400">
                  Fintech • Scale-up • 50 desenvolvedores
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-tech-gray-500 mb-1">Data do Relatório</div>
                <div className="text-tech-gray-300">Janeiro 2025</div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 bg-gradient-to-br from-neon-green/5 to-cyan-500/5 rounded-xl border border-neon-green/20">
              <div>
                <div className="text-sm text-tech-gray-500 uppercase tracking-wider mb-2">
                  Período de Retorno
                </div>
                <div className="text-3xl font-bold text-gradient-neon">
                  4.2 meses
                </div>
              </div>
              <div>
                <div className="text-sm text-tech-gray-500 uppercase tracking-wider mb-2">
                  NPV 3 Anos
                </div>
                <div className="text-3xl font-bold text-gradient-neon">
                  R$ 1.8M
                </div>
              </div>
              <div>
                <div className="text-sm text-tech-gray-500 uppercase tracking-wider mb-2">
                  ROI Anual
                </div>
                <div className="text-3xl font-bold text-gradient-neon">
                  287%
                </div>
              </div>
            </div>
          </div>

          {/* Report Sections Preview */}
          <div className="space-y-6">
            {/* Section 1 */}
            <div className="card-professional p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-neon-green/20 border border-neon-green/40 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Check className="text-neon-green" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-tech-gray-100 mb-2">
                    1. Executive Summary
                  </h3>
                  <p className="text-tech-gray-400">
                    Resumo executivo com métricas-chave de ROI, payback period e NPV projetado para 3 anos.
                    Ideal para apresentações board-level.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="card-professional p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-neon-cyan/20 border border-neon-cyan/40 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Check className="text-neon-cyan" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-tech-gray-100 mb-2">
                    2. Análise de ROI Detalhada
                  </h3>
                  <p className="text-tech-gray-400">
                    Breakdown completo de investimento inicial, economia anual e projeções.
                    Inclui ganhos de produtividade, melhoria de qualidade e time-to-market.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div className="card-professional p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-neon-purple/20 border border-neon-purple/40 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Check className="text-neon-purple" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-tech-gray-100 mb-2">
                    3. Benchmarks da Indústria
                  </h3>
                  <p className="text-tech-gray-400">
                    Comparação com dados DORA, McKinsey e GitHub: deployment frequency, cycle time, bug rates.
                    Mostra seu percentil vs. média e top performers.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div className="card-professional p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-neon-green/20 border border-neon-green/40 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Check className="text-neon-green" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-tech-gray-100 mb-2">
                    4. Cases Similares Verificados
                  </h3>
                  <p className="text-tech-gray-400">
                    Empresas do mesmo setor e tamanho que implementaram AI coding.
                    Includes resultados reais e links para fontes verificáveis.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 5 */}
            <div className="card-professional p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-neon-cyan/20 border border-neon-cyan/40 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Check className="text-neon-cyan" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-tech-gray-100 mb-2">
                    5. Roadmap de Implementação
                  </h3>
                  <p className="text-tech-gray-400">
                    Plano de transformação em 3-4 fases adaptado ao seu timeline.
                    Inclui objetivos, métricas de sucesso e resultados esperados.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 6 */}
            <div className="card-professional p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-neon-purple/20 border border-neon-purple/40 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Check className="text-neon-purple" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-tech-gray-100 mb-2">
                    6. Recomendações Estratégicas
                  </h3>
                  <p className="text-tech-gray-400">
                    Insights customizados baseados em suas respostas, pain points e objetivos.
                    Priorização de ações para máximo impacto.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 card-glow p-10 text-center">
            <h2 className="text-3xl font-bold text-tech-gray-100 mb-4">
              Pronto para Seu Relatório Personalizado?
            </h2>
            <p className="text-lg text-tech-gray-400 mb-8 max-w-2xl mx-auto">
              Leva apenas 5 minutos para preencher o assessment e receber seu relatório completo
              com dados específicos da sua empresa.
            </p>
            <Link href="/assessment" className="btn-primary text-lg inline-flex items-center gap-2">
              Criar Meu Relatório Grátis
              <ArrowRight size={20} />
            </Link>
            <p className="text-sm text-tech-gray-500 mt-4">
              Sem necessidade de cartão de crédito • Relatório instantâneo • 100% gratuito
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container-professional py-8 text-center text-sm text-tech-gray-500 border-t border-tech-gray-800 bg-background-darker relative z-10">
        <p>© 2025 CulturaBuilder. Todos os cálculos baseados em pesquisas verificáveis.</p>
      </footer>
    </div>
  );
}
