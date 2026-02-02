import { Metadata } from 'next';
import Link from 'next/link';
import {
  BookOpen,
  TrendingUp,
  DollarSign,
  Clock,
  Users,
  Target,
  Shield,
  Zap,
  Code,
  BarChart3,
  AlertTriangle,
  Info,
  Search
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Glossário de Métricas | CulturaBuilder',
  description: 'Definições claras de todas as métricas, termos técnicos e conceitos financeiros utilizados',
};

export default function GlossaryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background-dark via-background-default to-background-dark">
      {/* Header */}
      <div className="border-b border-tech-gray-700 bg-background-darker/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-neon-cyan" />
              <h1 className="text-2xl font-bold text-white">Glossário de Métricas</h1>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-tech-gray-800 hover:bg-tech-gray-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Voltar ao Início
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Introduction */}
        <section className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl p-8 mb-12">
          <div className="flex items-start gap-4">
            <Info className="w-8 h-8 text-blue-400 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Guia de Referência Rápida</h2>
              <p className="text-tech-gray-300 text-lg leading-relaxed">
                Este glossário define todas as métricas, termos técnicos e conceitos financeiros utilizados
                nos relatórios de avaliação. Explicações em linguagem acessível para C-level executives sem
                background técnico.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Navigation */}
        <nav className="mb-12 p-6 bg-background-card/50 border border-tech-gray-700 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-neon-cyan" />
            <h2 className="text-lg font-semibold text-white">Navegação Rápida</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <a href="#financial" className="flex items-center gap-2 text-neon-cyan hover:text-neon-cyan/80 transition-colors text-sm">
              <DollarSign className="w-4 h-4" />
              <span>Métricas Financeiras</span>
            </a>
            <a href="#productivity" className="flex items-center gap-2 text-neon-cyan hover:text-neon-cyan/80 transition-colors text-sm">
              <Zap className="w-4 h-4" />
              <span>Produtividade</span>
            </a>
            <a href="#engineering" className="flex items-center gap-2 text-neon-cyan hover:text-neon-cyan/80 transition-colors text-sm">
              <Code className="w-4 h-4" />
              <span>Engineering/DevOps</span>
            </a>
            <a href="#business" className="flex items-center gap-2 text-neon-cyan hover:text-neon-cyan/80 transition-colors text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>Business Metrics</span>
            </a>
            <a href="#statistical" className="flex items-center gap-2 text-neon-cyan hover:text-neon-cyan/80 transition-colors text-sm">
              <BarChart3 className="w-4 h-4" />
              <span>Conceitos Estatísticos</span>
            </a>
            <a href="#risk" className="flex items-center gap-2 text-neon-cyan hover:text-neon-cyan/80 transition-colors text-sm">
              <Shield className="w-4 h-4" />
              <span>Risco e Qualidade</span>
            </a>
          </div>
        </nav>

        {/* Financial Metrics */}
        <section id="financial" className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-8 h-8 text-neon-green" />
            <h2 className="text-3xl font-bold text-white">Métricas Financeiras</h2>
          </div>

          <div className="space-y-4">
            {/* ROI */}
            <div className="bg-background-card/50 border border-tech-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-3">ROI (Return on Investment)</h3>
              <div className="space-y-3">
                <p className="text-tech-gray-300">
                  <strong className="text-white">Definição:</strong> Retorno sobre investimento. Mede quanto dinheiro
                  você ganha (ou economiza) para cada real investido.
                </p>
                <div className="p-4 bg-tech-gray-900/50 rounded-lg">
                  <p className="text-sm text-tech-gray-300 mb-2">
                    <strong className="text-white">Fórmula:</strong> ROI = (Ganho - Custo) / Custo × 100%
                  </p>
                  <p className="text-sm text-tech-gray-300">
                    <strong className="text-white">Exemplo:</strong> Investiu R$ 100k, economizou R$ 350k → ROI = 250%
                    (cada R$ 1 investido retornou R$ 2,50 em valor)
                  </p>
                </div>
                <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-tech-gray-300">
                    <strong className="text-blue-400">Para C-level:</strong> ROI acima de 100% significa que o
                    investimento "se pagou" e ainda gerou lucro adicional. ROI de 200-300% é considerado excelente
                    para projetos de tecnologia.
                  </p>
                </div>
              </div>
            </div>

            {/* NPV */}
            <div className="bg-background-card/50 border border-tech-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-3">NPV (Net Present Value / Valor Presente Líquido)</h3>
              <div className="space-y-3">
                <p className="text-tech-gray-300">
                  <strong className="text-white">Definição:</strong> Valor de todos os fluxos de caixa futuros trazidos
                  para valor de hoje, descontando a taxa de juros (normalmente 10% para projetos tech).
                </p>
                <div className="p-4 bg-tech-gray-900/50 rounded-lg">
                  <p className="text-sm text-tech-gray-300 mb-2">
                    <strong className="text-white">Fórmula:</strong> NPV = Σ (Fluxo_ano / (1 + taxa)^ano) - Investimento_inicial
                  </p>
                  <p className="text-sm text-tech-gray-300">
                    <strong className="text-white">Exemplo:</strong> R$ 100k investidos hoje, que geram R$ 50k/ano por 3 anos
                    → NPV = R$ 24,343 (positivo = bom investimento)
                  </p>
                </div>
                <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-tech-gray-300">
                    <strong className="text-blue-400">Para C-level:</strong> NPV &gt; 0 significa que o projeto vale
                    a pena mesmo considerando o custo de oportunidade do capital. NPV negativo significa que o dinheiro
                    renderia mais em outra aplicação.
                  </p>
                </div>
              </div>
            </div>

            {/* Payback Period */}
            <div className="bg-background-card/50 border border-tech-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Payback Period (Período de Retorno)</h3>
              <div className="space-y-3">
                <p className="text-tech-gray-300">
                  <strong className="text-white">Definição:</strong> Tempo necessário para recuperar o investimento inicial
                  através dos benefícios gerados.
                </p>
                <div className="p-4 bg-tech-gray-900/50 rounded-lg">
                  <p className="text-sm text-tech-gray-300 mb-2">
                    <strong className="text-white">Fórmula:</strong> Payback = Investimento_inicial / Benefício_mensal
                  </p>
                  <p className="text-sm text-tech-gray-300">
                    <strong className="text-white">Exemplo:</strong> R$ 120k investidos, R$ 20k/mês de benefício
                    → Payback = 6 meses
                  </p>
                </div>
                <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-tech-gray-300">
                    <strong className="text-blue-400">Para C-level:</strong> Projetos com payback &lt;12 meses são
                    considerados de baixo risco. Payback &lt;6 meses é excelente. Acima de 24 meses requer análise
                    estratégica mais profunda.
                  </p>
                </div>
              </div>
            </div>

            {/* IRR */}
            <div className="bg-background-card/50 border border-tech-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-3">IRR (Internal Rate of Return / Taxa Interna de Retorno)</h3>
              <div className="space-y-3">
                <p className="text-tech-gray-300">
                  <strong className="text-white">Definição:</strong> A taxa de desconto que faz o NPV = 0. Em outras palavras,
                  a "rentabilidade anual equivalente" do projeto.
                </p>
                <div className="p-4 bg-tech-gray-900/50 rounded-lg">
                  <p className="text-sm text-tech-gray-300 mb-2">
                    <strong className="text-white">Interpretação:</strong> IRR de 50% significa que o projeto rende
                    equivalente a 50% ao ano
                  </p>
                  <p className="text-sm text-tech-gray-300">
                    <strong className="text-white">Benchmark:</strong> IRR &gt; WACC (custo de capital) = bom investimento
                  </p>
                </div>
                <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-tech-gray-300">
                    <strong className="text-blue-400">Para C-level:</strong> Compare IRR com o custo de capital da empresa
                    (geralmente 8-15%). Se IRR &gt; custo de capital, o projeto cria valor para acionistas.
                  </p>
                </div>
              </div>
            </div>

            {/* TCO */}
            <div className="bg-background-card/50 border border-tech-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-3">TCO (Total Cost of Ownership / Custo Total de Propriedade)</h3>
              <div className="space-y-3">
                <p className="text-tech-gray-300">
                  <strong className="text-white">Definição:</strong> Custo completo de uma solução ao longo de sua vida útil,
                  incluindo custos diretos (ferramentas, licenças) e indiretos (treinamento, manutenção, suporte).
                </p>
                <div className="p-4 bg-tech-gray-900/50 rounded-lg">
                  <p className="text-sm text-tech-gray-300 mb-2">
                    <strong className="text-white">Componentes:</strong> Aquisição + Implementação + Treinamento +
                    Operação + Manutenção + Atualização
                  </p>
                  <p className="text-sm text-tech-gray-300">
                    <strong className="text-white">Exemplo:</strong> Ferramenta custa R$ 50k/ano, mas TCO real é R$ 85k/ano
                    incluindo treinamento, integração, suporte
                  </p>
                </div>
                <div className="flex items-start gap-2 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-tech-gray-300">
                    <strong className="text-orange-400">Atenção:</strong> Muitos vendors mostram apenas custo de licença,
                    omitindo custos ocultos que podem ser 50-100% do valor da licença.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Productivity Metrics */}
        <section id="productivity" className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-8 h-8 text-yellow-400" />
            <h2 className="text-3xl font-bold text-white">Métricas de Produtividade</h2>
          </div>

          <div className="space-y-4">
            {/* Productivity Gain */}
            <div className="bg-background-card/50 border border-tech-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Productivity Gain (Ganho de Produtividade)</h3>
              <div className="space-y-3">
                <p className="text-tech-gray-300">
                  <strong className="text-white">Definição:</strong> Percentual de aumento na quantidade de trabalho
                  realizado no mesmo período de tempo, mantendo ou melhorando a qualidade.
                </p>
                <div className="p-4 bg-tech-gray-900/50 rounded-lg">
                  <p className="text-sm text-tech-gray-300 mb-2">
                    <strong className="text-white">Fórmula:</strong> Productivity Gain = (Nova_output - Baseline_output) / Baseline_output × 100%
                  </p>
                  <p className="text-sm text-tech-gray-300">
                    <strong className="text-white">Exemplo:</strong> Developer completava 8 tasks/semana, agora completa
                    10 tasks/semana → +25% productivity gain
                  </p>
                </div>
              </div>
            </div>

            {/* Time Savings */}
            <div className="bg-background-card/50 border border-tech-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Time Savings (Economia de Tempo)</h3>
              <div className="space-y-3">
                <p className="text-tech-gray-300">
                  <strong className="text-white">Definição:</strong> Redução absoluta no tempo necessário para completar
                  uma tarefa específica, geralmente medido em horas/semana ou dias/mês.
                </p>
                <div className="p-4 bg-tech-gray-900/50 rounded-lg">
                  <p className="text-sm text-tech-gray-300">
                    <strong className="text-white">Exemplo:</strong> Tarefa que levava 4 horas agora leva 2 horas
                    → 2 horas saved por execução
                  </p>
                </div>
              </div>
            </div>

            {/* FTE Equivalent */}
            <div className="bg-background-card/50 border border-tech-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-3">FTE Equivalent (Equivalente em Funcionários Full-Time)</h3>
              <div className="space-y-3">
                <p className="text-tech-gray-300">
                  <strong className="text-white">Definição:</strong> Conversão de ganhos de produtividade em número
                  equivalente de funcionários full-time que seriam necessários para gerar o mesmo output.
                </p>
                <div className="p-4 bg-tech-gray-900/50 rounded-lg">
                  <p className="text-sm text-tech-gray-300 mb-2">
                    <strong className="text-white">Fórmula:</strong> FTE = Horas_economizadas_por_ano / 2000 (horas úteis/ano)
                  </p>
                  <p className="text-sm text-tech-gray-300">
                    <strong className="text-white">Exemplo:</strong> 10 developers economizam 10h/semana cada
                    → 100h/semana × 48 semanas = 4,800h/ano = 2.4 FTE equivalentes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Engineering/DevOps Metrics */}
        <section id="engineering" className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Code className="w-8 h-8 text-neon-cyan" />
            <h2 className="text-3xl font-bold text-white">Métricas de Engineering/DevOps</h2>
          </div>

          <div className="space-y-4">
            {/* Deployment Frequency */}
            <div className="bg-background-card/50 border border-tech-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Deployment Frequency (Frequência de Deploy)</h3>
              <div className="space-y-3">
                <p className="text-tech-gray-300">
                  <strong className="text-white">Definição:</strong> Quantas vezes a equipe coloca código em produção
                  por unidade de tempo (dia/semana/mês). Métrica DORA chave.
                </p>
                <div className="p-4 bg-tech-gray-900/50 rounded-lg">
                  <p className="text-sm text-tech-gray-300 mb-2">
                    <strong className="text-white">Benchmarks DORA:</strong>
                  </p>
                  <ul className="text-sm text-tech-gray-300 space-y-1 ml-4">
                    <li>• <span className="text-neon-green">Elite:</span> Multiple deploys por dia</li>
                    <li>• <span className="text-blue-400">High:</span> 1x por dia - 1x por semana</li>
                    <li>• <span className="text-yellow-400">Medium:</span> 1x por semana - 1x por mês</li>
                    <li>• <span className="text-red-400">Low:</span> Menos de 1x por mês</li>
                  </ul>
                </div>
                <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-tech-gray-300">
                    <strong className="text-blue-400">Por que importa:</strong> Deployment frequency alta correlaciona
                    com melhor performance de negócio, menor risco, e maior agilidade para responder ao mercado.
                  </p>
                </div>
              </div>
            </div>

            {/* Lead Time for Changes */}
            <div className="bg-background-card/50 border border-tech-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Lead Time for Changes (Tempo de Ciclo)</h3>
              <div className="space-y-3">
                <p className="text-tech-gray-300">
                  <strong className="text-white">Definição:</strong> Tempo desde que código é commitado até estar rodando
                  em produção gerando valor. Inclui CI/CD, testing, review, deployment.
                </p>
                <div className="p-4 bg-tech-gray-900/50 rounded-lg">
                  <p className="text-sm text-tech-gray-300 mb-2">
                    <strong className="text-white">Benchmarks DORA:</strong>
                  </p>
                  <ul className="text-sm text-tech-gray-300 space-y-1 ml-4">
                    <li>• <span className="text-neon-green">Elite:</span> &lt; 1 hora</li>
                    <li>• <span className="text-blue-400">High:</span> 1 dia - 1 semana</li>
                    <li>• <span className="text-yellow-400">Medium:</span> 1 semana - 1 mês</li>
                    <li>• <span className="text-red-400">Low:</span> &gt; 1 mês</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* MTTR */}
            <div className="bg-background-card/50 border border-tech-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-3">MTTR (Mean Time to Recovery / Tempo Médio de Recuperação)</h3>
              <div className="space-y-3">
                <p className="text-tech-gray-300">
                  <strong className="text-white">Definição:</strong> Tempo médio para restaurar um serviço após um
                  incident em produção. Mede velocidade de resposta a problemas.
                </p>
                <div className="p-4 bg-tech-gray-900/50 rounded-lg">
                  <p className="text-sm text-tech-gray-300 mb-2">
                    <strong className="text-white">Benchmarks DORA:</strong>
                  </p>
                  <ul className="text-sm text-tech-gray-300 space-y-1 ml-4">
                    <li>• <span className="text-neon-green">Elite:</span> &lt; 1 hora</li>
                    <li>• <span className="text-blue-400">High:</span> &lt; 1 dia</li>
                    <li>• <span className="text-yellow-400">Medium:</span> 1 dia - 1 semana</li>
                    <li>• <span className="text-red-400">Low:</span> &gt; 1 semana</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Change Failure Rate */}
            <div className="bg-background-card/50 border border-tech-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Change Failure Rate (Taxa de Falha em Mudanças)</h3>
              <div className="space-y-3">
                <p className="text-tech-gray-300">
                  <strong className="text-white">Definição:</strong> Percentual de deploys que resultam em degradação
                  de serviço, requiring hotfix ou rollback. Mede qualidade do processo.
                </p>
                <div className="p-4 bg-tech-gray-900/50 rounded-lg">
                  <p className="text-sm text-tech-gray-300 mb-2">
                    <strong className="text-white">Benchmarks DORA:</strong>
                  </p>
                  <ul className="text-sm text-tech-gray-300 space-y-1 ml-4">
                    <li>• <span className="text-neon-green">Elite:</span> 0-15%</li>
                    <li>• <span className="text-blue-400">High:</span> 16-30%</li>
                    <li>• <span className="text-yellow-400">Medium:</span> 31-45%</li>
                    <li>• <span className="text-red-400">Low:</span> &gt; 45%</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Code Completion Rate */}
            <div className="bg-background-card/50 border border-tech-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Code Completion Rate (Taxa de Auto-Complete de Código)</h3>
              <div className="space-y-3">
                <p className="text-tech-gray-300">
                  <strong className="text-white">Definição:</strong> Percentual de código sugerido por AI coding assistant
                  (como GitHub Copilot) que é aceito e usado pelo desenvolvedor.
                </p>
                <div className="p-4 bg-tech-gray-900/50 rounded-lg">
                  <p className="text-sm text-tech-gray-300 mb-2">
                    <strong className="text-white">Benchmark GitHub Copilot:</strong> 30-40% acceptance rate é típico,
                    podendo chegar a 50-60% em contextos específicos (testes, boilerplate)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Business Metrics */}
        <section id="business" className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-8 h-8 text-neon-purple" />
            <h2 className="text-3xl font-bold text-white">Métricas de Negócio</h2>
          </div>

          <div className="space-y-4">
            {/* LTV */}
            <div className="bg-background-card/50 border border-tech-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-3">LTV (Lifetime Value / Valor Vitalício do Cliente)</h3>
              <div className="space-y-3">
                <p className="text-tech-gray-300">
                  <strong className="text-white">Definição:</strong> Receita total esperada de um cliente durante todo
                  o relacionamento com a empresa.
                </p>
                <div className="p-4 bg-tech-gray-900/50 rounded-lg">
                  <p className="text-sm text-tech-gray-300 mb-2">
                    <strong className="text-white">Fórmula:</strong> LTV = (Receita_mensal × Margem) × Tempo_vida_médio
                  </p>
                  <p className="text-sm text-tech-gray-300">
                    <strong className="text-white">Exemplo:</strong> Cliente paga R$ 1k/mês, margem 70%, fica 36 meses
                    → LTV = R$ 25,200
                  </p>
                </div>
              </div>
            </div>

            {/* CAC */}
            <div className="bg-background-card/50 border border-tech-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-3">CAC (Customer Acquisition Cost / Custo de Aquisição de Cliente)</h3>
              <div className="space-y-3">
                <p className="text-tech-gray-300">
                  <strong className="text-white">Definição:</strong> Custo total de marketing e vendas dividido pelo
                  número de clientes adquiridos no período.
                </p>
                <div className="p-4 bg-tech-gray-900/50 rounded-lg">
                  <p className="text-sm text-tech-gray-300 mb-2">
                    <strong className="text-white">Fórmula:</strong> CAC = (Custo_marketing + Custo_vendas) / Novos_clientes
                  </p>
                  <p className="text-sm text-tech-gray-300 mb-2">
                    <strong className="text-white">Exemplo:</strong> R$ 100k em marketing/vendas, 50 novos clientes
                    → CAC = R$ 2,000
                  </p>
                  <p className="text-xs text-neon-green">
                    <strong>Regra de ouro:</strong> LTV / CAC &gt; 3:1 é considerado saudável
                  </p>
                </div>
              </div>
            </div>

            {/* Churn Rate */}
            <div className="bg-background-card/50 border border-tech-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Churn Rate (Taxa de Cancelamento)</h3>
              <div className="space-y-3">
                <p className="text-tech-gray-300">
                  <strong className="text-white">Definição:</strong> Percentual de clientes que cancelam ou não renovam
                  em um período específico (geralmente mensal ou anual).
                </p>
                <div className="p-4 bg-tech-gray-900/50 rounded-lg">
                  <p className="text-sm text-tech-gray-300 mb-2">
                    <strong className="text-white">Fórmula:</strong> Churn = Clientes_perdidos / Clientes_início_período × 100%
                  </p>
                  <p className="text-sm text-tech-gray-300 mb-2">
                    <strong className="text-white">Exemplo:</strong> 1,000 clientes início do mês, 30 cancelaram
                    → Churn = 3% mensal (≈ 36% anual)
                  </p>
                  <p className="text-xs text-tech-gray-300">
                    <strong className="text-white">Benchmarks SaaS:</strong> &lt;5% anual (B2B enterprise) é excelente,
                    &lt;10% é bom
                  </p>
                </div>
              </div>
            </div>

            {/* Time-to-Market */}
            <div className="bg-background-card/50 border border-tech-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Time-to-Market (Tempo até o Mercado)</h3>
              <div className="space-y-3">
                <p className="text-tech-gray-300">
                  <strong className="text-white">Definição:</strong> Tempo desde concepção de uma feature/produto até
                  estar disponível para clientes gerando receita.
                </p>
                <div className="p-4 bg-tech-gray-900/50 rounded-lg">
                  <p className="text-sm text-tech-gray-300">
                    <strong className="text-white">Impacto:</strong> Reduzir time-to-market de 12 para 8 semanas pode
                    significar R$ 100k+ em revenue adicional capturado antes de competidores
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Statistical Concepts */}
        <section id="statistical" className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-8 h-8 text-yellow-400" />
            <h2 className="text-3xl font-bold text-white">Conceitos Estatísticos</h2>
          </div>

          <div className="space-y-4">
            {/* Percentile */}
            <div className="bg-background-card/50 border border-tech-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Percentil (p25, p50, p75, p90)</h3>
              <div className="space-y-3">
                <p className="text-tech-gray-300">
                  <strong className="text-white">Definição:</strong> Valor abaixo do qual uma determinada porcentagem
                  das observações cai. p75 = 75% das observações estão abaixo deste valor.
                </p>
                <div className="p-4 bg-tech-gray-900/50 rounded-lg">
                  <p className="text-sm text-tech-gray-300 mb-3">
                    <strong className="text-white">Exemplo com 100 empresas adotando AI:</strong>
                  </p>
                  <ul className="text-sm text-tech-gray-300 space-y-2 ml-4">
                    <li>• <strong className="text-orange-400">p25 (conservador):</strong> 75 empresas tiveram resultados melhores</li>
                    <li>• <strong className="text-yellow-400">p50 (mediana/realista):</strong> 50 empresas melhores, 50 piores</li>
                    <li>• <strong className="text-neon-green">p75 (otimista):</strong> 25 empresas tiveram resultados melhores</li>
                    <li>• <strong className="text-neon-cyan">p90 (muito otimista):</strong> Apenas 10 empresas superaram</li>
                  </ul>
                </div>
                <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-tech-gray-300">
                    <strong className="text-blue-400">Nossa escolha:</strong> Usamos p75 como valor principal porque é
                    otimista mas defensável - 1 em 4 empresas supera, então não é irrealista, mas também não é típico.
                  </p>
                </div>
              </div>
            </div>

            {/* Confidence Level */}
            <div className="bg-background-card/50 border border-tech-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Confidence Level (Nível de Confiança)</h3>
              <div className="space-y-3">
                <p className="text-tech-gray-300">
                  <strong className="text-white">Definição:</strong> Score (0-100%) que indica quão confiável é uma
                  projeção baseada na qualidade da fonte, tamanho da amostra, recência, e aplicabilidade.
                </p>
                <div className="p-4 bg-tech-gray-900/50 rounded-lg">
                  <ul className="text-sm text-tech-gray-300 space-y-2">
                    <li>• <strong className="text-neon-green">80-100%:</strong> Alta confiança - use para decisões de investimento</li>
                    <li>• <strong className="text-yellow-400">60-79%:</strong> Média - dados parciais, solicite mais informações</li>
                    <li>• <strong className="text-orange-400">40-59%:</strong> Moderada - estimativa genérica, valores podem variar</li>
                    <li>• <strong className="text-red-400">&lt;40%:</strong> Baixa - apenas direcional, não use para decisões</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Range / Uncertainty */}
            <div className="bg-background-card/50 border border-tech-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Range / Uncertainty (Faixa de Incerteza)</h3>
              <div className="space-y-3">
                <p className="text-tech-gray-300">
                  <strong className="text-white">Definição:</strong> Intervalo de valores possíveis para uma métrica,
                  calculado baseado no nível de confiança. Mostra o "melhor caso" e "pior caso" realistas.
                </p>
                <div className="p-4 bg-tech-gray-900/50 rounded-lg">
                  <p className="text-sm text-tech-gray-300 mb-2">
                    <strong className="text-white">Exemplo:</strong> Projeção de R$ 1M em savings com 70% confiança
                  </p>
                  <ul className="text-sm text-tech-gray-300 space-y-1 ml-4">
                    <li>• Conservative: R$ 775k (base × 0.775)</li>
                    <li>• Realistic: R$ 1M (valor base)</li>
                    <li>• Optimistic: R$ 1.225M (base × 1.225)</li>
                  </ul>
                  <p className="text-xs text-tech-gray-400 mt-2">
                    Range multiplier de ±22.5% baseado em confiança de 70%
                  </p>
                </div>
              </div>
            </div>

            {/* Sample Size */}
            <div className="bg-background-card/50 border border-tech-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Sample Size (Tamanho da Amostra)</h3>
              <div className="space-y-3">
                <p className="text-tech-gray-300">
                  <strong className="text-white">Definição:</strong> Número de observações (empresas, projetos, pessoas)
                  usados em um estudo para calcular um benchmark. Quanto maior, mais confiável.
                </p>
                <div className="p-4 bg-tech-gray-900/50 rounded-lg">
                  <ul className="text-sm text-tech-gray-300 space-y-1">
                    <li>• <strong className="text-neon-green">N &gt; 1000:</strong> Estatisticamente robusto</li>
                    <li>• <strong className="text-blue-400">N = 100-1000:</strong> Bom</li>
                    <li>• <strong className="text-yellow-400">N = 10-100:</strong> Aceitável para nicho específico</li>
                    <li>• <strong className="text-red-400">N &lt; 10:</strong> Anecdotal, baixa confiança</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Risk & Quality Metrics */}
        <section id="risk" className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-blue-400" />
            <h2 className="text-3xl font-bold text-white">Métricas de Risco e Qualidade</h2>
          </div>

          <div className="space-y-4">
            {/* Bug Density */}
            <div className="bg-background-card/50 border border-tech-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Bug Density (Densidade de Bugs)</h3>
              <div className="space-y-3">
                <p className="text-tech-gray-300">
                  <strong className="text-white">Definição:</strong> Número de bugs por unidade de código, geralmente
                  medido como bugs/1000 linhas de código (KLOC).
                </p>
                <div className="p-4 bg-tech-gray-900/50 rounded-lg">
                  <p className="text-sm text-tech-gray-300">
                    <strong className="text-white">Benchmark:</strong> 10-15 bugs/KLOC é típico. Elite teams: &lt;5 bugs/KLOC.
                  </p>
                </div>
              </div>
            </div>

            {/* Security Vulnerability Rate */}
            <div className="bg-background-card/50 border border-tech-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Security Vulnerability Rate (Taxa de Vulnerabilidades)</h3>
              <div className="space-y-3">
                <p className="text-tech-gray-300">
                  <strong className="text-white">Definição:</strong> Número de vulnerabilidades de segurança identificadas
                  por unidade de tempo ou por KLOC, categorizado por severidade (critical/high/medium/low).
                </p>
                <div className="p-4 bg-tech-gray-900/50 rounded-lg">
                  <p className="text-sm text-tech-gray-300">
                    <strong className="text-white">Impacto:</strong> 1 critical vulnerability pode custar R$ 500k+ em
                    remediation, breach response, e reputational damage.
                  </p>
                </div>
              </div>
            </div>

            {/* Downtime / Uptime */}
            <div className="bg-background-card/50 border border-tech-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Downtime / Uptime (Tempo Inativo / Disponibilidade)</h3>
              <div className="space-y-3">
                <p className="text-tech-gray-300">
                  <strong className="text-white">Definição:</strong> Percentual do tempo que um sistema está disponível
                  e funcional. Geralmente expresso como "nines" (99.9%, 99.99%, etc).
                </p>
                <div className="p-4 bg-tech-gray-900/50 rounded-lg">
                  <ul className="text-sm text-tech-gray-300 space-y-1">
                    <li>• <strong>99.9%</strong> (three nines) = 8.76 horas downtime/ano</li>
                    <li>• <strong>99.95%</strong> = 4.38 horas downtime/ano</li>
                    <li>• <strong>99.99%</strong> (four nines) = 52.6 minutos downtime/ano</li>
                    <li>• <strong>99.999%</strong> (five nines) = 5.26 minutos downtime/ano</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Cost of Downtime */}
            <div className="bg-background-card/50 border border-tech-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Cost of Downtime (Custo de Inatividade)</h3>
              <div className="space-y-3">
                <p className="text-tech-gray-300">
                  <strong className="text-white">Definição:</strong> Impacto financeiro de cada hora/minuto que sistemas
                  críticos estão indisponíveis, incluindo revenue loss, productivity loss, reputational damage.
                </p>
                <div className="p-4 bg-tech-gray-900/50 rounded-lg">
                  <p className="text-sm text-tech-gray-300 mb-2">
                    <strong className="text-white">Fórmula:</strong> Cost = (Revenue_por_hora × Hours_down) +
                    (Employees_impacted × Hourly_cost × Hours_down) + Recovery_costs
                  </p>
                  <p className="text-sm text-tech-gray-300">
                    <strong className="text-white">Exemplo e-commerce:</strong> R$ 50k revenue/hora, 100 employees @ R$ 100/h,
                    4h downtime → R$ 200k (revenue) + R$ 40k (productivity) + R$ 10k (recovery) = R$ 250k
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="flex items-center justify-between pt-8 border-t border-tech-gray-700">
          <Link
            href="/methodology"
            className="flex items-center gap-2 text-tech-gray-400 hover:text-neon-cyan transition-colors"
          >
            ← Ver Metodologia Completa
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-neon-cyan hover:text-neon-cyan/80 transition-colors"
          >
            Voltar para Home →
          </Link>
        </div>
      </div>
    </div>
  );
}
