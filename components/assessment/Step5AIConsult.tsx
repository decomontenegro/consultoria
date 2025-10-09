'use client';

import { useState, useEffect, useRef } from 'react';
import { AssessmentData } from '@/lib/types';
import { getConsultationIntro } from '@/lib/prompts/consultation-prompt';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Step5AIConsultProps {
  data: Partial<AssessmentData>;
  onSkip: () => void;
  onComplete: (insights: string[]) => void;
}

export default function Step5AIConsult({ data, onSkip, onComplete }: Step5AIConsultProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const MAX_QUESTIONS = 5;

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with intro message
  useEffect(() => {
    if (!isInitialized && data.contactInfo && data.companyInfo && data.currentState) {
      const intro = getConsultationIntro(data as AssessmentData);
      setMessages([{ role: 'assistant', content: intro }]);
      setIsInitialized(true);
    }
  }, [data, isInitialized]);

  // Send message to API
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          assessmentData: data,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                break;
              }
              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  assistantMessage += parsed.text;
                  // Update message in real-time
                  setMessages([...updatedMessages, { role: 'assistant', content: assistantMessage }]);
                }
              } catch (e) {
                // Ignore JSON parse errors
              }
            }
          }
        }
      }

      setQuestionCount(prev => prev + 1);

    } catch (error) {
      console.error('Consultation error:', error);
      setMessages([
        ...updatedMessages,
        {
          role: 'assistant',
          content: 'Desculpe, ocorreu um erro. Por favor, tente novamente ou pule esta etapa.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Extract insights from conversation
  const handleGenerateReport = () => {
    const userResponses = messages
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content);

    onComplete(userResponses);
  };

  return (
    <div className="min-h-screen bg-background-dark">
      {/* Header */}
      <div className="bg-tech-gray-900/50 border-b border-tech-gray-800 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-medium text-white">
              Consulta AI - Aprofundamento
            </h2>
            <p className="text-sm text-tech-gray-400 mt-1">
              Perguntas {questionCount}/{MAX_QUESTIONS} • Opcional
            </p>
          </div>
          <button
            onClick={onSkip}
            className="btn-ghost text-sm"
          >
            Pular Consulta →
          </button>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="card-dark p-6 min-h-[500px] flex flex-col">

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-6">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-neon-green/10 border border-neon-green/30 text-white'
                      : 'bg-tech-gray-800/50 border border-tech-gray-700 text-tech-gray-200'
                  }`}
                >
                  <div className="text-xs font-medium mb-1 opacity-60">
                    {msg.role === 'user' ? 'Você' : 'Consultor CulturaBuilder'}
                  </div>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-tech-gray-800/50 border border-tech-gray-700 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2 text-tech-gray-400">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                    <span className="text-sm">Analisando...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          {questionCount < MAX_QUESTIONS ? (
            <div className="border-t border-tech-gray-800 pt-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Digite sua resposta..."
                  className="input-dark flex-1"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="btn-primary px-6"
                >
                  Enviar
                </button>
              </div>
            </div>
          ) : (
            <div className="border-t border-tech-gray-800 pt-4">
              <div className="bg-neon-green/10 border border-neon-green/30 rounded-lg p-4 mb-4">
                <p className="text-neon-green font-medium mb-2">
                  ✓ Consulta concluída!
                </p>
                <p className="text-tech-gray-300 text-sm">
                  Obrigado pelas respostas. Vou usar essas informações para gerar recomendações personalizadas no seu relatório.
                </p>
              </div>
              <button
                onClick={handleGenerateReport}
                className="btn-primary w-full"
              >
                Gerar Relatório Personalizado
              </button>
            </div>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="mt-6 text-center text-tech-gray-500 text-sm">
          <p>
            {questionCount < MAX_QUESTIONS
              ? `Ainda ${MAX_QUESTIONS - questionCount} ${MAX_QUESTIONS - questionCount === 1 ? 'pergunta' : 'perguntas'} para insights mais profundos`
              : 'Consulta finalizada'}
          </p>
        </div>
      </div>
    </div>
  );
}
