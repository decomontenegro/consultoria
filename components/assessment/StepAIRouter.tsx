/**
 * Step AI Router - Initial AI Conversation
 *
 * First step in AI-first assessment journey:
 * - Asks 3-5 discovery questions
 * - Auto-detects persona
 * - Recommends assessment mode
 * - Collects partial data
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { ConversationMessage, AIRouterResult, AssessmentMode, UserPersona } from '@/lib/types';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';

interface StepAIRouterProps {
  onComplete: (result: AIRouterResult) => void;
  onSelectMode: (mode: AssessmentMode, persona: UserPersona | null, partialData: any) => void;
}

export default function StepAIRouter({ onComplete, onSelectMode }: StepAIRouterProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [routingResult, setRoutingResult] = useState<AIRouterResult | null>(null);
  const [showModeSelection, setShowModeSelection] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Start with first question
  useEffect(() => {
    const firstQuestion: ConversationMessage = {
      role: 'assistant',
      content: 'Olá! Sou o CulturaBuilder AI. Para começar, me conte: qual o principal desafio de tecnologia ou inovação da sua empresa hoje?',
      timestamp: new Date()
    };
    setMessages([firstQuestion]);
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ConversationMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Call AI Router API
      const response = await fetch('/api/ai-router', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          questionsAsked: questionsAsked + 1
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.ready && data.result) {
        // Routing complete
        const result: AIRouterResult = data.result;
        setRoutingResult(result);

        // Add final message
        const finalMessage: ConversationMessage = {
          role: 'assistant',
          content: `Perfeito! Analisei suas respostas.\n\n${result.reasoning}\n\nVocê prefere continuar com o modo recomendado ou escolher outro?`,
          timestamp: new Date()
        };

        setMessages([...updatedMessages, finalMessage]);
        setShowModeSelection(true);
        onComplete(result);
      } else if (data.nextQuestion) {
        // Ask next question
        const nextMessage: ConversationMessage = {
          role: 'assistant',
          content: data.nextQuestion,
          timestamp: new Date()
        };

        setMessages([...updatedMessages, nextMessage]);
        setQuestionsAsked(questionsAsked + 1);
      } else {
        // Shouldn't happen, but handle it
        throw new Error('Unexpected API response');
      }

    } catch (error) {
      console.error('Router error:', error);

      const errorMessage: ConversationMessage = {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro. Por favor, tente novamente ou pule para o questionário tradicional.',
        timestamp: new Date()
      };

      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeSelection = (mode: AssessmentMode) => {
    if (!routingResult) return;

    onSelectMode(
      mode,
      routingResult.detectedPersona,
      routingResult.partialData
    );
  };

  const getModeInfo = (mode: AssessmentMode) => {
    switch (mode) {
      case 'express':
        return {
          title: 'Express Mode',
          duration: '5-7 min',
          description: '7-10 perguntas essenciais. Relatório rápido e acionável.',
          icon: '⚡',
          color: 'neon-green'
        };
      case 'guided':
        return {
          title: 'Guided Mode',
          duration: '10-15 min',
          description: 'Questionário inteligente com campos relevantes para seu contexto.',
          icon: '🎯',
          color: 'neon-cyan'
        };
      case 'deep':
        return {
          title: 'Deep Dive',
          duration: '20-30 min',
          description: 'Análise completa com múltiplos especialistas (Engineering, Finance, Strategy).',
          icon: '🔬',
          color: 'neon-purple'
        };
    }
  };

  return (
    <div className="min-h-screen bg-background-dark">
      {/* Header */}
      <div className="bg-tech-gray-900/50 border-b border-tech-gray-800 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neon-purple/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-neon-purple" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                AI Discovery
              </h2>
              <p className="text-xs text-tech-gray-400">
                {showModeSelection ? 'Escolha seu modo' : `Pergunta ${questionsAsked + 1}/5`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Chat Messages */}
        <div className="card-dark p-6 min-h-[400px] flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 mb-6">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-neon-purple/10 border border-neon-purple/30 text-white'
                      : 'bg-tech-gray-800/50 border border-tech-gray-700 text-tech-gray-200'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-neon-purple" />
                      <span className="text-xs font-semibold text-neon-purple">CulturaBuilder AI</span>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap leading-relaxed text-sm">
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-tech-gray-800/50 border border-tech-gray-700 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2 text-tech-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Analisando...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Mode Selection (if ready) */}
          {showModeSelection && routingResult && (
            <div className="mb-6 space-y-4 animate-slide-up">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Escolha seu Modo de Assessment
                </h3>
                <p className="text-sm text-tech-gray-400">
                  {routingResult.detectedPersona && (
                    <span>
                      Detectamos: <span className="text-neon-green font-semibold">
                        {routingResult.detectedPersona}
                      </span> •{' '}
                    </span>
                  )}
                  Recomendação: <span className="text-neon-cyan font-semibold">
                    {getModeInfo(routingResult.recommendedMode).title}
                  </span>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {([routingResult.recommendedMode, ...routingResult.alternativeModes] as AssessmentMode[]).map((mode) => {
                  const info = getModeInfo(mode);
                  const isRecommended = mode === routingResult.recommendedMode;

                  return (
                    <button
                      key={mode}
                      onClick={() => handleModeSelection(mode)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        isRecommended
                          ? `border-${info.color} bg-${info.color}/10 shadow-lg`
                          : 'border-tech-gray-700 hover:border-tech-gray-600 bg-tech-gray-900/30'
                      }`}
                    >
                      {isRecommended && (
                        <div className="inline-block mb-2 px-2 py-0.5 text-xs font-bold rounded-full bg-neon-green/20 text-neon-green border border-neon-green/30">
                          Recomendado
                        </div>
                      )}
                      <div className="text-2xl mb-2">{info.icon}</div>
                      <h4 className="font-semibold text-white mb-1">{info.title}</h4>
                      <p className="text-xs text-tech-gray-500 mb-2">{info.duration}</p>
                      <p className="text-sm text-tech-gray-400">{info.description}</p>

                      <div className="mt-3 flex items-center gap-2 text-sm text-neon-green">
                        Continuar <ArrowRight className="w-4 h-4" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Input (if not showing mode selection) */}
          {!showModeSelection && (
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Digite sua resposta..."
                className="input-dark flex-1"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Enviar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
