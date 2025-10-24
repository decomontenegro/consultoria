import { Bot } from 'lucide-react';

interface AIInsightsSectionProps {
  insights: string[];
}

export default function AIInsightsSection({ insights }: AIInsightsSectionProps) {
  if (!insights || insights.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-lg bg-neon-purple/20 flex items-center justify-center">
          <Bot className="w-6 h-6 text-neon-purple" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Insights da Consulta AI</h2>
          <p className="text-tech-gray-400 text-sm">
            Análise personalizada baseada na conversação com nosso consultor especialista
          </p>
        </div>
      </div>

      <div className="card-glow p-8 border-neon-purple/30">
        {/* Header explicativo */}
        <div className="bg-neon-purple/10 border border-neon-purple/20 rounded-lg p-4 mb-6">
          <p className="text-sm text-tech-gray-300">
            Durante a consulta AI, identificamos os seguintes pontos-chave sobre o contexto da sua empresa.
            Esses insights foram integrados nas recomendações deste relatório.
          </p>
        </div>

        {/* Lista de insights */}
        <div className="space-y-4">
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className="bg-tech-gray-900/50 border border-tech-gray-800 rounded-lg p-5 hover:border-neon-purple/30 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neon-purple/20 flex items-center justify-center text-neon-purple font-semibold text-sm">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="text-tech-gray-200 leading-relaxed whitespace-pre-wrap">
                    {insight}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer badge */}
        <div className="mt-6 pt-6 border-t border-tech-gray-800">
          <div className="flex items-center gap-2 text-sm text-tech-gray-500">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>
              Esses insights foram coletados através de conversação com Claude AI da Anthropic
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
