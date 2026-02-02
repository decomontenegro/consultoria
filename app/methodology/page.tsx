import { Metadata } from 'next';
import Link from 'next/link';
import {
  BookOpen,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Shield,
  ExternalLink,
  Info,
  FileText,
  Target,
  BarChart3,
  Lightbulb
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Metodologia de Cálculo | CulturaBuilder AI Assessment',
  description: 'Metodologia completa, fontes verificadas e processo de validação dos cálculos de ROI e impacto de AI',
};

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-background-primary">
      {/* Header */}
      <div className="bg-gradient-to-br from-neon-cyan/10 via-neon-purple/5 to-neon-green/10 border-b border-tech-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-10 h-10 text-neon-cyan" />
            <h1 className="text-4xl font-bold text-white">Metodologia de Cálculo</h1>
          </div>
          <p className="text-xl text-tech-gray-300 max-w-4xl">
            Documentação completa da metodologia, fontes verificadas e processo de validação
            utilizado nos cálculos de ROI e impacto de AI para decisões C-level.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Navigation */}
        <nav className="mb-12 p-6 bg-tech-gray-900 border border-tech-gray-700 rounded-xl">
          <h2 className="text-lg font-semibold text-white mb-4">Navegação Rápida</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <a href="#principles" className="flex items-center gap-2 text-neon-cyan hover:text-neon-cyan/80 transition-colors">
              <Target className="w-4 h-4" />
              <span>Princípios Fundamentais</span>
            </a>
            <a href="#sources" className="flex items-center gap-2 text-neon-cyan hover:text-neon-cyan/80 transition-colors">
              <Shield className="w-4 h-4" />
              <span>Fontes Tier-1</span>
            </a>
            <a href="#confidence" className="flex items-center gap-2 text-neon-cyan hover:text-neon-cyan/80 transition-colors">
              <BarChart3 className="w-4 h-4" />
              <span>Níveis de Confiança</span>
            </a>
            <a href="#percentiles" className="flex items-center gap-2 text-neon-cyan hover:text-neon-cyan/80 transition-colors">
              <TrendingUp className="w-4 h-4" />
              <span>Percentis e Ranges</span>
            </a>
            <a href="#calculations" className="flex items-center gap-2 text-neon-cyan hover:text-neon-cyan/80 transition-colors">
              <FileText className="w-4 h-4" />
              <span>Cálculos Detalhados</span>
            </a>
            <a href="#limitations" className="flex items-center gap-2 text-neon-cyan hover:text-neon-cyan/80 transition-colors">
              <AlertTriangle className="w-4 h-4" />
              <span>Limitações</span>
            </a>
          </div>
        </nav>

        {/* Princípios Fundamentais */}
        <section id="principles" className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-8 h-8 text-neon-green" />
            <h2 className="text-3xl font-bold text-white">Princípios Fundamentais</h2>
          </div>

          <div className="card-dark p-8 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">Otimismo com Transparência Total</h3>
            <p className="text-tech-gray-300 mb-4">
              Nossa abordagem é projetada para C-level executives que precisam tomar decisões de investimento
              em AI com dados confiáveis e auditáveis.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-neon-green flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white mb-1">Projeções Otimistas (75º Percentil)</h4>
                  <p className="text-sm text-tech-gray-400">
                    Apresentamos valores no 75º percentil dos benchmarks da indústria - otimistas mas defensáveis.
                    Isso significa que 75% das empresas alcançam resultados iguais ou inferiores, e 25% superam.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-neon-green flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white mb-1">Rastreabilidade Total</h4>
                  <p className="text-sm text-tech-gray-400">
                    Cada métrica tem fonte citada (McKinsey, DORA, Forrester, etc), sample size documentado,
                    e link para o estudo original quando disponível.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-neon-green flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white mb-1">Ranges de Variação</h4>
                  <p className="text-sm text-tech-gray-400">
                    Todos os valores principais incluem ranges (conservador p25, realista p50, otimista p75)
                    para mostrar a incerteza inerente a projeções.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-neon-green flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white mb-1">Níveis de Confiança Explícitos</h4>
                  <p className="text-sm text-tech-gray-400">
                    Cada métrica tem score de confiança (0-100) baseado na qualidade da fonte, completeness dos
                    dados, e aplicabilidade ao contexto da empresa.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-300 mb-2">Por que Otimista (p75) e não Conservador (p25)?</h4>
                <p className="text-sm text-tech-gray-300 mb-2">
                  Decisões de investimento em AI são estratégicas e transformacionais. Usar projeções conservadoras (p25)
                  pode subestimar o real potencial e levar a sub-investimento.
                </p>
                <p className="text-sm text-tech-gray-300">
                  Ao mesmo tempo, mostrar ranges completos e níveis de confiança permite que executivos ajustem
                  expectativas baseadas no seu apetite a risco. A transparência é a chave.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Fontes Tier-1 */}
        <section id="sources" className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-neon-cyan" />
            <h2 className="text-3xl font-bold text-white">Fontes Tier-1 Verificadas</h2>
          </div>

          <div className="card-dark p-8 mb-6">
            <p className="text-tech-gray-300 mb-6">
              Usamos exclusivamente fontes tier-1: peer-reviewed research, estudos de grandes consultorias
              (McKinsey, Bain, BCG, Forrester), e benchmarks de organizações respeitadas (DORA, GitHub).
            </p>

            <div className="space-y-4">
              {/* McKinsey */}
              <div className="p-5 bg-tech-gray-900/50 border border-tech-gray-700 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-semibold text-white">McKinsey GenAI Developer Productivity Report 2024</h4>
                    <p className="text-sm text-tech-gray-400 mt-1">McKinsey & Company</p>
                  </div>
                  <a
                    href="https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/unleashing-developer-productivity-with-generative-ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-neon-cyan hover:text-neon-cyan/80 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <div className="text-sm text-tech-gray-300 space-y-2">
                  <p><strong className="text-white">Sample Size:</strong> 300+ developers across 5 industries</p>
                  <p><strong className="text-white">Geography:</strong> Global (US, Europe, Asia)</p>
                  <p><strong className="text-white">Metrics:</strong> Code completion speed, bug reduction, time-to-market</p>
                  <p><strong className="text-white">Confidence:</strong> High - Peer-reviewed, large sample, methodology transparent</p>
                </div>
              </div>

              {/* DORA State of DevOps */}
              <div className="p-5 bg-tech-gray-900/50 border border-tech-gray-700 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-semibold text-white">DORA State of DevOps Report 2024</h4>
                    <p className="text-sm text-tech-gray-400 mt-1">DevOps Research and Assessment (Google Cloud)</p>
                  </div>
                  <a
                    href="https://dora.dev/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-neon-cyan hover:text-neon-cyan/80 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <div className="text-sm text-tech-gray-300 space-y-2">
                  <p><strong className="text-white">Sample Size:</strong> 33,000+ professionals globally</p>
                  <p><strong className="text-white">Geography:</strong> Global, multi-industry</p>
                  <p><strong className="text-white">Metrics:</strong> Deployment frequency, lead time, MTTR, change failure rate</p>
                  <p><strong className="text-white">Confidence:</strong> High - 10+ years of data, largest DevOps survey</p>
                </div>
              </div>

              {/* Forrester TEI */}
              <div className="p-5 bg-tech-gray-900/50 border border-tech-gray-700 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-semibold text-white">Forrester Total Economic Impact (TEI) Studies</h4>
                    <p className="text-sm text-tech-gray-400 mt-1">Forrester Research</p>
                  </div>
                  <a
                    href="https://www.forrester.com/what-we-do/forrester-decisions/total-economic-impact/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-neon-cyan hover:text-neon-cyan/80 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <div className="text-sm text-tech-gray-300 space-y-2">
                  <p><strong className="text-white">Sample Size:</strong> Varies by study (typically 5-10 enterprise customers)</p>
                  <p><strong className="text-white">Geography:</strong> Primarily US and Europe</p>
                  <p><strong className="text-white">Metrics:</strong> NPV, payback period, risk-adjusted ROI</p>
                  <p><strong className="text-white">Confidence:</strong> Medium-High - Rigorous methodology, but sample sizes smaller</p>
                </div>
              </div>

              {/* GitHub Copilot Research */}
              <div className="p-5 bg-tech-gray-900/50 border border-tech-gray-700 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-semibold text-white">GitHub Copilot Developer Productivity Research</h4>
                    <p className="text-sm text-tech-gray-400 mt-1">GitHub / Microsoft Research</p>
                  </div>
                  <a
                    href="https://github.blog/news-insights/research/research-quantifying-github-copilots-impact-in-the-enterprise/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-neon-cyan hover:text-neon-cyan/80 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <div className="text-sm text-tech-gray-300 space-y-2">
                  <p><strong className="text-white">Sample Size:</strong> 95 developers (randomized controlled trial)</p>
                  <p><strong className="text-white">Geography:</strong> Global</p>
                  <p><strong className="text-white">Metrics:</strong> Task completion speed, code quality, developer satisfaction</p>
                  <p><strong className="text-white">Confidence:</strong> High - RCT methodology, published in peer-reviewed venues</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-orange-300 mb-2">Fontes Excluídas (Blacklist)</h4>
                <p className="text-sm text-tech-gray-300 mb-3">
                  Removemos fontes de baixa qualidade que apareciam em versões anteriores:
                </p>
                <ul className="text-sm text-tech-gray-400 space-y-1">
                  <li>• WinSavvy, CRM.org, Kixie - Marketing materials sem peer review</li>
                  <li>• Jeff Bullas, outros blogs - Opiniões não fundamentadas em dados</li>
                  <li>• Estudos "2025" quando data é 2024 - Fontes fabricadas</li>
                  <li>• Vendor reports sem metodologia clara - Conflict of interest</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Níveis de Confiança */}
        <section id="confidence" className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-8 h-8 text-yellow-400" />
            <h2 className="text-3xl font-bold text-white">Níveis de Confiança (0-100)</h2>
          </div>

          <div className="card-dark p-8 mb-6">
            <p className="text-tech-gray-300 mb-6">
              Cada métrica recebe um score de confiança baseado em múltiplos fatores. Quanto maior o score,
              mais confiável é a projeção para decisões de investimento.
            </p>

            <div className="space-y-4">
              <div className="p-5 bg-neon-green/10 border-l-4 border-neon-green rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="px-3 py-1 bg-neon-green/20 border border-neon-green/40 rounded-full">
                    <span className="text-sm font-bold text-neon-green">80-100%</span>
                  </div>
                  <h4 className="text-lg font-semibold text-neon-green">Alta Confiança</h4>
                </div>
                <p className="text-sm text-tech-gray-300 mb-3">
                  Dados reais da empresa + Fontes tier-1 + Match perfeito de indústria/tamanho
                </p>
                <div className="text-xs text-tech-gray-400 space-y-1">
                  <p>✓ Fonte: Peer-reviewed ou grande consultoria (McKinsey, DORA)</p>
                  <p>✓ Sample size: &gt;1000 empresas</p>
                  <p>✓ Dados específicos da empresa fornecidos (receita, equipe, métricas atuais)</p>
                  <p>✓ Geografia: Match (Brasil ou América Latina)</p>
                  <p>✓ Indústria: Match exato</p>
                </div>
              </div>

              <div className="p-5 bg-yellow-400/10 border-l-4 border-yellow-400 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="px-3 py-1 bg-yellow-400/20 border border-yellow-400/40 rounded-full">
                    <span className="text-sm font-bold text-yellow-400">60-79%</span>
                  </div>
                  <h4 className="text-lg font-semibold text-yellow-400">Confiança Média</h4>
                </div>
                <p className="text-sm text-tech-gray-300 mb-3">
                  Benchmarks da indústria + Alguns dados da empresa + Match razoável
                </p>
                <div className="text-xs text-tech-gray-400 space-y-1">
                  <p>✓ Fonte: Industry reports (Forrester, Gartner)</p>
                  <p>✓ Sample size: 100-1000 empresas</p>
                  <p>✓ Dados parciais da empresa (apenas porte e indústria)</p>
                  <p>∼ Geografia: Similar (América do Norte quando empresa é Brasil)</p>
                  <p>∼ Indústria: Similar mas não exato</p>
                </div>
              </div>

              <div className="p-5 bg-orange-400/10 border-l-4 border-orange-400 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="px-3 py-1 bg-orange-400/20 border border-orange-400/40 rounded-full">
                    <span className="text-sm font-bold text-orange-400">40-59%</span>
                  </div>
                  <h4 className="text-lg font-semibold text-orange-400">Confiança Moderada</h4>
                </div>
                <p className="text-sm text-tech-gray-300 mb-3">
                  Benchmarks genéricos + Perfil estimado da empresa + Match parcial
                </p>
                <div className="text-xs text-tech-gray-400 space-y-1">
                  <p>∼ Fonte: Case studies ou vendor reports com metodologia</p>
                  <p>∼ Sample size: 10-100 empresas</p>
                  <p>∼ Apenas porte da empresa conhecido (startup/midmarket/enterprise)</p>
                  <p>✗ Geografia: Diferente</p>
                  <p>∼ Indústria: Genérica (todas indústrias)</p>
                </div>
              </div>

              <div className="p-5 bg-red-400/10 border-l-4 border-red-400 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="px-3 py-1 bg-red-400/20 border border-red-400/40 rounded-full">
                    <span className="text-sm font-bold text-red-400">0-39%</span>
                  </div>
                  <h4 className="text-lg font-semibold text-red-400">Baixa Confiança</h4>
                </div>
                <p className="text-sm text-tech-gray-300 mb-3">
                  Estimativas baseadas em multiplicadores genéricos + Nenhum dado específico
                </p>
                <div className="text-xs text-tech-gray-400 space-y-1">
                  <p>∼ Fonte: Internal estimates ou dados muito antigos (&gt;5 anos)</p>
                  <p>✗ Sample size: &lt;10 empresas ou desconhecido</p>
                  <p>✗ Nenhum dado da empresa fornecido</p>
                  <p>✗ Geografia: Não aplicável</p>
                  <p>✗ Indústria: Não aplicável</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-300 mb-2">Como Melhorar a Confiança?</h4>
                <p className="text-sm text-tech-gray-300 mb-2">
                  A confiança aumenta significativamente quando você fornece dados específicos da empresa:
                </p>
                <ul className="text-sm text-tech-gray-400 space-y-1">
                  <li>• Receita anual e número de funcionários</li>
                  <li>• Tamanho das equipes de Engineering, Sales, Customer Service</li>
                  <li>• Métricas atuais (deployment frequency, customer ticket volume, etc)</li>
                  <li>• Custos atuais com ferramentas e headcount</li>
                </ul>
                <p className="text-sm text-tech-gray-300 mt-3">
                  Com esses dados, o sistema pode aplicar benchmarks verificados ao seu contexto específico,
                  aumentando a confiança de ~45% (genérico) para 75-85% (contextualizado).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Percentis e Ranges */}
        <section id="percentiles" className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-8 h-8 text-neon-purple" />
            <h2 className="text-3xl font-bold text-white">Percentis e Ranges de Variação</h2>
          </div>

          <div className="card-dark p-8 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">O que são Percentis?</h3>
            <p className="text-tech-gray-300 mb-6">
              Percentis descrevem a distribuição de resultados em estudos com múltiplas empresas.
              Por exemplo, se 100 empresas adotam AI:
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 flex-shrink-0 bg-orange-400/20 border border-orange-400/40 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-orange-400">25</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-1">p25 - Percentil 25 (Conservador)</h4>
                  <p className="text-sm text-tech-gray-300">
                    75% das empresas tiveram resultados <strong>melhores</strong> que este valor.
                    Apenas 25% ficaram abaixo. Cenário conservador/pessimista.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-16 h-16 flex-shrink-0 bg-yellow-400/20 border border-yellow-400/40 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-yellow-400">50</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-1">p50 - Percentil 50 (Realista/Mediana)</h4>
                  <p className="text-sm text-tech-gray-300">
                    50% das empresas tiveram resultados melhores, 50% piores.
                    O valor "típico" ou "esperado". Baseline realista.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-16 h-16 flex-shrink-0 bg-neon-green/20 border border-neon-green/40 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-neon-green">75</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-1">p75 - Percentil 75 (Otimista mas Defensável)</h4>
                  <p className="text-sm text-tech-gray-300">
                    25% das empresas alcançaram resultados <strong>melhores</strong> que este valor.
                    75% ficaram abaixo. Cenário otimista mas ainda realista.
                  </p>
                  <p className="text-xs text-neon-green mt-2">
                    ✓ Este é o cenário padrão apresentado nos reports
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-16 h-16 flex-shrink-0 bg-neon-cyan/20 border border-neon-cyan/40 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-neon-cyan">90</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-1">p90 - Percentil 90 (Muito Otimista)</h4>
                  <p className="text-sm text-tech-gray-300">
                    Apenas 10% das empresas alcançaram resultados melhores que este.
                    90% ficaram abaixo. Cenário "best case" - possível mas raro.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card-dark p-8 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">Ranges de Variação</h3>
            <p className="text-tech-gray-300 mb-6">
              Além dos percentis, aplicamos uncertainty multipliers baseados no nível de confiança:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-tech-gray-700">
                    <th className="text-left py-3 px-4 text-white font-semibold">Confiança</th>
                    <th className="text-left py-3 px-4 text-white font-semibold">Uncertainty Range</th>
                    <th className="text-left py-3 px-4 text-white font-semibold">Exemplo (Valor Base: R$ 100k)</th>
                  </tr>
                </thead>
                <tbody className="text-tech-gray-300">
                  <tr className="border-b border-tech-gray-800">
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-neon-green/20 text-neon-green rounded text-xs font-semibold">
                        80-100%
                      </span>
                    </td>
                    <td className="py-3 px-4">±15%</td>
                    <td className="py-3 px-4">R$ 85k - R$ 115k</td>
                  </tr>
                  <tr className="border-b border-tech-gray-800">
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-yellow-400/20 text-yellow-400 rounded text-xs font-semibold">
                        60-79%
                      </span>
                    </td>
                    <td className="py-3 px-4">±25%</td>
                    <td className="py-3 px-4">R$ 75k - R$ 125k</td>
                  </tr>
                  <tr className="border-b border-tech-gray-800">
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-orange-400/20 text-orange-400 rounded text-xs font-semibold">
                        40-59%
                      </span>
                    </td>
                    <td className="py-3 px-4">±40%</td>
                    <td className="py-3 px-4">R$ 60k - R$ 140k</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-red-400/20 text-red-400 rounded text-xs font-semibold">
                        0-39%
                      </span>
                    </td>
                    <td className="py-3 px-4">±60%</td>
                    <td className="py-3 px-4">R$ 40k - R$ 160k</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Cálculos Detalhados */}
        <section id="calculations" className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-8 h-8 text-neon-green" />
            <h2 className="text-3xl font-bold text-white">Cálculos Detalhados por Componente</h2>
          </div>

          {/* Engineering ROI */}
          <div className="card-dark p-8 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">Engineering ROI</h3>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-neon-cyan mb-2">Métrica: Productivity Increase</h4>
                <div className="p-4 bg-tech-gray-900/50 rounded-lg">
                  <p className="text-sm text-tech-gray-300 mb-3">
                    <strong>Fonte:</strong> McKinsey GenAI Developer Productivity Report 2024 + GitHub Copilot RCT
                  </p>
                  <p className="text-sm text-tech-gray-300 mb-2">
                    <strong>Benchmark:</strong> p25: 12%, p50: 18%, p75: 26%, p90: 35%
                  </p>
                  <p className="text-sm text-tech-gray-300 mb-2">
                    <strong>Cálculo:</strong> (Time saved per task × Tasks per week × Weeks per year) / Current output
                  </p>
                  <p className="text-sm text-tech-gray-300">
                    <strong>Exemplo:</strong> Developer que completa 8 tasks/semana passa para 10 tasks/semana = 25% gain
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-neon-cyan mb-2">Métrica: Bug Reduction</h4>
                <div className="p-4 bg-tech-gray-900/50 rounded-lg">
                  <p className="text-sm text-tech-gray-300 mb-3">
                    <strong>Fonte:</strong> GitHub Copilot Security Analysis + DORA State of DevOps
                  </p>
                  <p className="text-sm text-tech-gray-300 mb-2">
                    <strong>Benchmark:</strong> p25: 15%, p50: 23%, p75: 35%, p90: 45%
                  </p>
                  <p className="text-sm text-tech-gray-300 mb-2">
                    <strong>Cálculo:</strong> (Baseline bug rate × Reduction %) × (Avg hours to fix × Hourly cost)
                  </p>
                  <p className="text-sm text-tech-gray-300">
                    <strong>Exemplo:</strong> 15 bugs/1000 LOC → 10 bugs/1000 LOC, cada bug = 8h fix @ R$ 150/h
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-neon-cyan mb-2">Métrica: Time-to-Market Reduction</h4>
                <div className="p-4 bg-tech-gray-900/50 rounded-lg">
                  <p className="text-sm text-tech-gray-300 mb-3">
                    <strong>Fonte:</strong> DORA State of DevOps + McKinsey Digital Transformation Report
                  </p>
                  <p className="text-sm text-tech-gray-300 mb-2">
                    <strong>Benchmark:</strong> p25: 18%, p50: 25%, p75: 35%, p90: 45%
                  </p>
                  <p className="text-sm text-tech-gray-300 mb-2">
                    <strong>Cálculo:</strong> (Current cycle time - Reduced cycle time) × Value per week early
                  </p>
                  <p className="text-sm text-tech-gray-300">
                    <strong>Exemplo:</strong> Feature que levaria 10 semanas leva 6.5 semanas, valendo R$ 50k/semana early
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 4-Pillar ROI */}
          <div className="card-dark p-8 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">4-Pillar ROI Framework</h3>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-neon-green mb-2">Pilar 1: Efficiency Gains</h4>
                <p className="text-sm text-tech-gray-300 mb-2">
                  Mede ganhos de produtividade em desenvolvimento, operações, e processos internos.
                </p>
                <div className="p-4 bg-tech-gray-900/50 rounded-lg">
                  <p className="text-xs text-tech-gray-400">
                    <strong>Componentes:</strong> Developer productivity, operational efficiency, time-to-market
                    <br /><strong>Fontes:</strong> McKinsey, DORA, GitHub
                    <br /><strong>Fórmula:</strong> Σ(Headcount × Avg salary × Productivity gain %)
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-neon-cyan mb-2">Pilar 2: Revenue Acceleration</h4>
                <p className="text-sm text-tech-gray-300 mb-2">
                  Impacto em market share, customer acquisition, e competitive advantage.
                </p>
                <div className="p-4 bg-tech-gray-900/50 rounded-lg">
                  <p className="text-xs text-tech-gray-400">
                    <strong>Componentes:</strong> Market share gain, customer acquisition improvement, churn reduction
                    <br /><strong>Fontes:</strong> McKinsey, Bain AI Impact Study
                    <br /><strong>Fórmula:</strong> (Revenue × Market share gain %) + (New customers × LTV)
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-neon-purple mb-2">Pilar 3: Risk Mitigation</h4>
                <p className="text-sm text-tech-gray-300 mb-2">
                  Redução de incidents, melhoria de qualidade, e security improvements.
                </p>
                <div className="p-4 bg-tech-gray-900/50 rounded-lg">
                  <p className="text-xs text-tech-gray-400">
                    <strong>Componentes:</strong> Bug reduction, incident prevention, security improvements
                    <br /><strong>Fontes:</strong> DORA, Forrester TEI
                    <br /><strong>Fórmula:</strong> Σ(Incident cost saved + Downtime reduction value)
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-yellow-400 mb-2">Pilar 4: Business Agility</h4>
                <p className="text-sm text-tech-gray-300 mb-2">
                  Velocidade de adaptação a mercado, innovation capacity, e deployment frequency.
                </p>
                <div className="p-4 bg-tech-gray-900/50 rounded-lg">
                  <p className="text-xs text-tech-gray-400">
                    <strong>Componentes:</strong> Deploy frequency, innovation capacity, speed to market
                    <br /><strong>Fontes:</strong> DORA, McKinsey Digital
                    <br /><strong>Fórmula:</strong> (Value of faster iteration × Frequency increase %)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* NPV and Financial Metrics */}
          <div className="card-dark p-8 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">NPV e Métricas Financeiras</h3>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">NPV (Net Present Value)</h4>
                <div className="p-4 bg-tech-gray-900/50 rounded-lg">
                  <p className="text-sm text-tech-gray-300 mb-2">
                    <strong>Fórmula:</strong> NPV = Σ (Cash Flow_year / (1 + discount_rate)^year) - Initial Investment
                  </p>
                  <p className="text-sm text-tech-gray-300 mb-2">
                    <strong>Discount Rate:</strong> 10% (taxa padrão para projetos de tecnologia)
                  </p>
                  <p className="text-sm text-tech-gray-300">
                    <strong>Período:</strong> 3 anos (horizonte típico para AI transformation)
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Payback Period</h4>
                <div className="p-4 bg-tech-gray-900/50 rounded-lg">
                  <p className="text-sm text-tech-gray-300 mb-2">
                    <strong>Fórmula:</strong> Payback = Initial Investment / Monthly Savings
                  </p>
                  <p className="text-sm text-tech-gray-300">
                    <strong>Exemplo:</strong> R$ 100k investment / R$ 15k monthly savings = 6.67 meses
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">IRR (Internal Rate of Return)</h4>
                <div className="p-4 bg-tech-gray-900/50 rounded-lg">
                  <p className="text-sm text-tech-gray-300 mb-2">
                    <strong>Definição:</strong> Taxa de desconto que torna NPV = 0
                  </p>
                  <p className="text-sm text-tech-gray-300">
                    <strong>Cálculo:</strong> Iterativo (Newton-Raphson) até encontrar rate onde NPV = 0
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Limitações */}
        <section id="limitations" className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-8 h-8 text-orange-400" />
            <h2 className="text-3xl font-bold text-white">Limitações Importantes</h2>
          </div>

          <div className="card-dark p-8">
            <p className="text-tech-gray-300 mb-6">
              É fundamental que C-level executives entendam as limitações inerentes a qualquer projeção de ROI:
            </p>

            <div className="space-y-4">
              <div className="p-5 bg-orange-500/10 border-l-4 border-orange-400 rounded-lg">
                <h4 className="font-semibold text-orange-300 mb-2">1. Benchmarks ≠ Garantia de Resultados</h4>
                <p className="text-sm text-tech-gray-300">
                  Os benchmarks mostram o que outras empresas alcançaram, não o que sua empresa certamente alcançará.
                  Resultados dependem de execução, change management, cultura organizacional, e contexto específico.
                </p>
              </div>

              <div className="p-5 bg-orange-500/10 border-l-4 border-orange-400 rounded-lg">
                <h4 className="font-semibold text-orange-300 mb-2">2. Adoption Rate e Time-to-Value Variam</h4>
                <p className="text-sm text-tech-gray-300">
                  Assumimos adoption rates otimistas (50-70% em 6 meses). Na prática, adoption pode levar mais tempo
                  e nunca alcançar 100%. Resistência cultural é o maior fator de risco.
                </p>
              </div>

              <div className="p-5 bg-orange-500/10 border-l-4 border-orange-400 rounded-lg">
                <h4 className="font-semibold text-orange-300 mb-2">3. Custos Ocultos Não Contabilizados</h4>
                <p className="text-sm text-tech-gray-300">
                  Calculamos custos diretos (ferramentas, training inicial). Custos indiretos como ongoing training,
                  change management, integration com legacy systems podem adicionar 20-40% ao investimento.
                </p>
              </div>

              <div className="p-5 bg-orange-500/10 border-l-4 border-orange-400 rounded-lg">
                <h4 className="font-semibold text-orange-300 mb-2">4. Benchmarks Majoritariamente Norte-Americanos/Europeus</h4>
                <p className="text-sm text-tech-gray-300">
                  A maioria dos estudos (McKinsey, DORA, Forrester) focam em US/Europe. Aplicabilidade para Brasil/LATAM
                  pode ter nuances não capturadas (custos menores, maturidade tech diferente).
                </p>
              </div>

              <div className="p-5 bg-orange-500/10 border-l-4 border-orange-400 rounded-lg">
                <h4 className="font-semibold text-orange-300 mb-2">5. Cenários de Downside Não Incluídos</h4>
                <p className="text-sm text-tech-gray-300">
                  Focamos em cenários conservador/realista/otimista. Não modelamos cenários de falha completa
                  (ex: adoption &lt;20%, ferramentas abandonadas). Isso ocorre em ~10% dos casos segundo Gartner.
                </p>
              </div>

              <div className="p-5 bg-orange-500/10 border-l-4 border-orange-400 rounded-lg">
                <h4 className="font-semibold text-orange-300 mb-2">6. Competitive Dynamics e Market Timing</h4>
                <p className="text-sm text-tech-gray-300">
                  Cost of Inaction assume que competidores estão adotando AI agressivamente. Se mercado adota mais
                  devagar, pressure é menor. Se adota mais rápido, cost of inaction pode ser maior que projetado.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-8 border-t border-tech-gray-700">
          <Link
            href="/"
            className="flex items-center gap-2 text-tech-gray-400 hover:text-neon-cyan transition-colors"
          >
            ← Voltar para Home
          </Link>
          <Link
            href="/glossary"
            className="flex items-center gap-2 text-neon-cyan hover:text-neon-cyan/80 transition-colors"
          >
            Ver Glossário de Termos →
          </Link>
        </div>
      </div>
    </div>
  );
}
