import Link from "next/link";
import CulturaBuilderLogo from "@/components/CulturaBuilderLogo";
import CulturaBuilderLogoVideo from "@/components/CulturaBuilderLogoVideo";
import CaseStudiesSection from "@/components/CaseStudiesSection";
import { InteractiveRobotSpline } from "@/components/ui/interactive-3d-robot";
import SocialProofCounter from "@/components/homepage/SocialProofCounter";

export default function Home() {
  return (
    <div className="min-h-screen bg-background-dark">
      {/* Glow effect background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-green/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <header className="nav-dark sticky top-0 z-50">
        <div className="container-professional py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <CulturaBuilderLogoVideo className="w-8 h-8" />
              <span className="text-2xl font-bold text-neon-green">CulturaBuilder</span>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/assessment" className="text-tech-gray-300 hover:text-neon-green transition-colors">
                Start Assessment
              </Link>
              <Link href="/imported-reports" className="text-tech-gray-300 hover:text-neon-cyan transition-colors">
                Relatórios CSV
              </Link>
              <Link href="https://culturabuilder.com" target="_blank" className="text-tech-gray-300 hover:text-neon-cyan transition-colors">
                Comunidade
              </Link>
              <Link href="/assessment" className="btn-primary text-sm">
                Começar →
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative">
        <div className="container-professional py-24">
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-block px-4 py-2 bg-neon-green/10 border border-neon-green/30 rounded-full text-neon-green text-sm font-medium mb-8">
              Powered by NVIDIA · Firecrawl · AWS
            </div>

            <h1 className="text-6xl md:text-7xl font-bold mb-6 font-display">
              <span className="text-gradient-neon">AI Enterprise Solution</span>
            </h1>

            <p className="text-xl text-tech-gray-300 mb-4">
              Análise enterprise para transformação AI e adoção de <span className="text-neon-green font-semibold">voice coding</span>
            </p>
            <p className="text-lg text-tech-gray-400 mb-12">
              Baseado em benchmarks verificados: McKinsey · Forrester · DORA · GitHub
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/assessment" className="btn-primary text-lg">
                Iniciar Assessment Grátis
              </Link>
              <Link href="/sample" className="btn-outline-neon text-lg">
                Ver Relatório Exemplo
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-20">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-gradient-neon mb-2">25-45%</div>
                <div className="text-sm text-tech-gray-400">Aumento em Produtividade</div>
                <div className="text-xs text-tech-gray-500 mt-1">McKinsey 2024</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-gradient-neon mb-2">&lt;6 meses</div>
                <div className="text-sm text-tech-gray-400">Payback Period Médio</div>
                <div className="text-xs text-tech-gray-500 mt-1">Forrester TEI</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-gradient-neon mb-2">300%</div>
                <div className="text-sm text-tech-gray-400">ROI em 3 Anos</div>
                <div className="text-xs text-tech-gray-500 mt-1">Conservative Estimate</div>
              </div>
            </div>

            {/* Voice Coding Explanation */}
            <div className="mt-16 max-w-3xl mx-auto">
              <div className="card-glow p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-neon-green/10 border border-neon-green/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                      <g className="animate-pulse-slow">
                        <path d="M9 21H15M12 3C8.68629 3 6 5.68629 6 9C6 10.8954 6.87877 12.5831 8.24003 13.6338C8.69689 14.0089 9 14.5743 9 15.1856V16C9 16.5523 9.44772 17 10 17H14C14.5523 17 15 16.5523 15 16V15.1856C15 14.5743 15.3031 14.0089 15.76 13.6338C17.1212 12.5831 18 10.8954 18 9C18 5.68629 15.3137 3 12 3Z" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10 17V18C10 19.1046 10.8954 20 12 20C13.1046 20 14 19.1046 14 18V17" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </g>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-tech-gray-100 mb-2">
                      O que é <span className="text-neon-green">Voice Coding</span>?
                    </h3>
                    <p className="text-sm text-tech-gray-400 leading-relaxed mb-3">
                      <strong className="text-neon-green">Voice Coding</strong> (também conhecido no Brasil como <strong className="text-neon-cyan">Vibe Coding</strong>) é a prática de programar usando comandos de voz com AI generativa, ao invés de digitar código manualmente. Através de ferramentas como GitHub Copilot Voice, Cursor AI, e Claude Code, desenvolvedores podem:
                    </p>
                    <ul className="text-sm text-tech-gray-400 space-y-2 ml-4">
                      <li className="flex items-start gap-2">
                        <span className="text-neon-green mt-1">✓</span>
                        <span>Descrever funcionalidades em linguagem natural e gerar código automaticamente</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-neon-cyan mt-1">✓</span>
                        <span>Acelerar code reviews com análise automatizada de qualidade</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-neon-green mt-1">✓</span>
                        <span>Gerar documentação, testes e refatorações em segundos</span>
                      </li>
                    </ul>
                    <p className="text-xs text-tech-gray-500 mt-4 italic">
                      Segundo McKinsey (2024), desenvolvedores que usam AI coding assistants reportam ganhos de <strong className="text-neon-green">35-45% em velocidade</strong>, com nosso assessment usando estimativas conservadoras de 25%.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive 3D Robot Section */}
            <div className="mt-16 -mb-40">
              <div className="relative w-full h-[600px] md:h-[700px] lg:h-[800px] overflow-visible rounded-2xl z-0">
                {/* 3D Robot */}
                <InteractiveRobotSpline
                  scene="https://prod.spline.design/PyzDhpQ9E5f1E3MT/scene.splinecode"
                  className="absolute inset-0"
                />

                {/* Text Overlay */}
                <div className="absolute inset-0 z-10 pt-12 md:pt-20 lg:pt-32 px-4 md:px-8 pointer-events-none">
                  <div className="text-center text-white drop-shadow-2xl w-full max-w-4xl mx-auto">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold font-display mb-4">
                      <span className="text-gradient-neon">Conheça o c.A.I.o</span>
                    </h2>
                    <p className="text-base md:text-lg lg:text-xl text-tech-gray-200 drop-shadow-lg max-w-2xl mx-auto mb-12">
                      Agente conversional do culturabuilder
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof Counter */}
        <div className="relative z-10">
          <SocialProofCounter />
        </div>

        {/* Trust Indicators - Partners */}
        <div className="relative z-10 border-t border-tech-gray-800 bg-gray-900">
          <div className="container-professional py-12">
            <p className="text-center text-sm text-tech-gray-500 mb-8">
              Metodologia baseada em pesquisas verificadas:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card-dark text-center hover:border-neon-green/50">
                <p className="font-semibold text-tech-gray-100">McKinsey</p>
                <p className="text-xs text-tech-gray-400 mt-1">GenAI Report 2024</p>
              </div>
              <div className="card-dark text-center hover:border-neon-cyan/50">
                <p className="font-semibold text-tech-gray-100">Forrester</p>
                <p className="text-xs text-tech-gray-400 mt-1">TEI Studies</p>
              </div>
              <div className="card-dark text-center hover:border-neon-green/50">
                <p className="font-semibold text-tech-gray-100">DORA</p>
                <p className="text-xs text-tech-gray-400 mt-1">DevOps Reports</p>
              </div>
              <div className="card-dark text-center hover:border-neon-cyan/50">
                <p className="font-semibold text-tech-gray-100">GitHub</p>
                <p className="text-xs text-tech-gray-400 mt-1">Octoverse 2024</p>
              </div>
            </div>
          </div>
        </div>

        {/* Value Propositions */}
        <div className="container-professional py-24">
          <h2 className="text-3xl font-bold text-center mb-12 font-display">
            <span className="text-tech-gray-100">Por que usar </span>
            <span className="text-neon-green">nosso assessment?</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="card-glow p-8">
              <div className="w-12 h-12 bg-neon-green/10 border border-neon-green/30 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                  <g className="animate-pulse-slow" style={{ animationDelay: '0.2s' }}>
                    <path d="M3 3V21H21" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 16L12 11L16 15L21 10" stroke="#00d9ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 10V14M21 10H17" stroke="#00d9ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </g>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-tech-gray-100">
                Data-Driven Analysis
              </h3>
              <p className="text-tech-gray-400">
                Cada métrica validada por pesquisa verificável. Zero marketing fluff, apenas projeções defensáveis para C-level.
              </p>
            </div>

            <div className="card-glow p-8">
              <div className="w-12 h-12 bg-neon-cyan/10 border border-neon-cyan/30 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                  <g className="animate-pulse-slow" style={{ animationDelay: '0.4s' }}>
                    <circle cx="12" cy="12" r="10" stroke="#00d9ff" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="6" stroke="#00d9ff" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="2" fill="#00ff88" className="animate-ping" style={{ animationDuration: '2s' }}/>
                  </g>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-tech-gray-100">
                Estimativas Conservadoras
              </h3>
              <p className="text-tech-gray-400">
                ROI baseado em premissas conservadoras (25% vs 35-45% reportado) validadas por implementações reais.
              </p>
            </div>

            <div className="card-glow p-8">
              <div className="w-12 h-12 bg-neon-purple/10 border border-neon-purple/30 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                  <g className="animate-pulse-slow" style={{ animationDelay: '0.6s' }}>
                    <rect x="3" y="7" width="18" height="13" rx="2" stroke="#b16ced" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 7V5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5V7" stroke="#b16ced" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 13H21" stroke="#b16ced" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="13" r="1.5" fill="#00ff88"/>
                  </g>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-tech-gray-100">
                Board-Ready Reports
              </h3>
              <p className="text-tech-gray-400">
                Relatórios profissionais desenhados para apresentações executivas e decisões de alta governança.
              </p>
            </div>
          </div>
        </div>

        {/* Case Studies Section */}
        <CaseStudiesSection />

        {/* How it Works */}
        <div className="border-t border-tech-gray-800 bg-background-card/20">
          <div className="container-professional py-24">
            <h2 className="text-3xl font-bold text-center mb-12 font-display text-neon-green">
              Como funciona
            </h2>

            <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-neon-green to-neon-cyan rounded-full flex items-center justify-center mx-auto mb-4 shadow-neon-green">
                  <span className="text-2xl font-bold text-background-dark">1</span>
                </div>
                <h4 className="font-semibold text-tech-gray-100 mb-2">Company Info</h4>
                <p className="text-sm text-tech-gray-400">Informações básicas e contexto da empresa</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-neon-green to-neon-cyan rounded-full flex items-center justify-center mx-auto mb-4 shadow-neon-cyan">
                  <span className="text-2xl font-bold text-background-dark">2</span>
                </div>
                <h4 className="font-semibold text-tech-gray-100 mb-2">Current State</h4>
                <p className="text-sm text-tech-gray-400">Métricas atuais de desenvolvimento</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-neon-green to-neon-cyan rounded-full flex items-center justify-center mx-auto mb-4 shadow-neon-green">
                  <span className="text-2xl font-bold text-background-dark">3</span>
                </div>
                <h4 className="font-semibold text-tech-gray-100 mb-2">Goals & Timeline</h4>
                <p className="text-sm text-tech-gray-400">Objetivos e expectativas de transformação</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-neon-green to-neon-cyan rounded-full flex items-center justify-center mx-auto mb-4 shadow-neon-cyan">
                  <span className="text-2xl font-bold text-background-dark">4</span>
                </div>
                <h4 className="font-semibold text-tech-gray-100 mb-2">Get Report</h4>
                <p className="text-sm text-tech-gray-400">Relatório executivo completo com ROI</p>
              </div>
            </div>

            <div className="text-center mt-12">
              <Link href="/assessment" className="btn-primary text-lg">
                Começar Agora - 5 minutos
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-tech-gray-800 bg-background-darker">
        <div className="container-professional py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CulturaBuilderLogo className="w-4 h-6" />
                <h3 className="text-neon-green font-bold text-lg">CulturaBuilder</h3>
              </div>
              <p className="text-tech-gray-400 text-sm">
                A maior comunidade de builders do Brasil. Transformando empresas através de AI e voice coding.
              </p>
            </div>
            <div>
              <h4 className="text-tech-gray-100 font-semibold mb-4">Parceiros</h4>
              <div className="space-y-2 text-sm text-tech-gray-400">
                <div className="flex items-center gap-2">
                  <span className="text-neon-green">✓</span> NVIDIA Partnership
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-neon-cyan">✓</span> Firecrawl Integration
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-neon-green">✓</span> AWS Infrastructure
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-tech-gray-100 font-semibold mb-4">Links</h4>
              <div className="space-y-2">
                <div><Link href="https://culturabuilder.com" target="_blank" className="text-tech-gray-400 hover:text-neon-green transition-colors text-sm">Comunidade</Link></div>
                <div><Link href="/assessment" className="text-tech-gray-400 hover:text-neon-cyan transition-colors text-sm">Assessment</Link></div>
                <div><a href="mailto:contato@culturabuilder.com" className="text-tech-gray-400 hover:text-neon-green transition-colors text-sm">Contato</a></div>
              </div>
            </div>
          </div>

          <div className="border-t border-tech-gray-800 pt-8 text-center">
            <p className="text-tech-gray-500 text-sm">
              © 2025 CulturaBuilder. Todos os dados baseados em pesquisas verificáveis.
            </p>
            <p className="text-tech-gray-600 text-xs mt-2">
              Metodologia transparente e auditável • McKinsey • Forrester • DORA • GitHub
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
