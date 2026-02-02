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

import { useState, useEffect, useRef, useCallback } from 'react';
import { ConversationMessage, AIRouterResult, AssessmentMode, UserPersona } from '@/lib/types';
import { Sparkles, ArrowRight, Loader2, Zap, Microscope, Target, Check, Clock, User } from 'lucide-react';
import { ResponseSuggestion } from '@/lib/ai/response-suggestions';
import { generateAIPoweredSuggestions } from '@/lib/ai/ai-powered-suggestions';
import { AISuggestedResponsesAnimated } from './AISuggestedResponses';

interface StepAIRouterProps {
  userExpertise: string[]; // NEW: User's areas of expertise from Step -2
  onComplete: (result: AIRouterResult) => void;
  onSelectMode: (mode: AssessmentMode, persona: UserPersona | null, partialData: any) => void;
}

export default function StepAIRouter({ userExpertise, onComplete, onSelectMode }: StepAIRouterProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [routingResult, setRoutingResult] = useState<AIRouterResult | null>(null);
  const [showModeSelection, setShowModeSelection] = useState(false);
  const [suggestions, setSuggestions] = useState<ResponseSuggestion[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageCountRef = useRef<number>(0);
  const activeQuestionCountRef = useRef<number>(0); // ✅ Track question sequence to prevent race conditions

  // Smart scroll - only scroll when NEW ASSISTANT message appears (new question)
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, []);

  // Scroll only when a new assistant message (question) appears
  useEffect(() => {
    const currentMessageCount = messages.length;
    const lastMessage = messages[messages.length - 1];

    // Only scroll if:
    // 1. We have more messages than before
    // 2. The last message is from the assistant (new question)
    if (currentMessageCount > lastMessageCountRef.current && lastMessage?.role === 'assistant') {
      // Small delay to ensure DOM is updated
      setTimeout(scrollToBottom, 100);
    }

    lastMessageCountRef.current = currentMessageCount;
  }, [messages, scrollToBottom]);

  // Start with first question
  useEffect(() => {
    const firstQuestion: ConversationMessage = {
      role: 'assistant',
      content: 'Olá! Sou o CulturaBuilder AI. Para começar: o que te trouxe aqui hoje? Tem algum problema específico que você precisa resolver nos próximos 3-6 meses?',
      timestamp: new Date()
    };
    setMessages([firstQuestion]);

    // Generate AI-powered suggestions for first question
    const questionNum = 1;
    activeQuestionCountRef.current = questionNum;
    generateAIPoweredSuggestions({
      question: firstQuestion.content,
      context: 'Iniciando conversa com AI Router - extraindo urgência e problema específico'
    }).then(newSuggestions => {
      // ✅ Only update suggestions if this is still the active question
      if (activeQuestionCountRef.current === questionNum) {
        setSuggestions(newSuggestions);
      }
    });
  }, []);

  // Note: Suggestions are now updated directly in sendMessageWithText
  // when AI response arrives, not via useEffect

  // Handle suggestion click with auto-send
  const handleSuggestionClick = (suggestionText: string) => {
    setInput(suggestionText);

    // Auto-send after a brief delay to allow input to update
    setTimeout(() => {
      // Manually trigger send with the suggestion text
      sendMessageWithText(suggestionText);
    }, 50);
  };

  const sendMessageWithText = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ConversationMessage = {
      role: 'user',
      content: text.trim(),
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-router', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          questionsAsked: questionsAsked + 1,
          userExpertise: userExpertise // NEW: Pass expertise to adapt questions
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      console.log('[StepAIRouter] API response:', {
        ready: data.ready,
        hasResult: !!data.result,
        hasNextQuestion: !!data.nextQuestion,
        questionsAsked: questionsAsked + 1,
        data
      });

      if (data.ready && data.result) {
        const result: AIRouterResult = data.result;
        setRoutingResult(result);

        const finalMessage: ConversationMessage = {
          role: 'assistant',
          content: 'Perfeito! Analisei suas respostas e preparei uma recomendação personalizada para você.',
          timestamp: new Date()
        };

        setMessages([...updatedMessages, finalMessage]);
        setShowModeSelection(true);
        setSuggestions([]); // Clear suggestions when showing mode selection
        onComplete(result);
      } else if (data.nextQuestion) {
        const nextMessage: ConversationMessage = {
          role: 'assistant',
          content: data.nextQuestion,
          timestamp: new Date()
        };

        const newMessages = [...updatedMessages, nextMessage];
        setMessages(newMessages);
        setQuestionsAsked(questionsAsked + 1);

        // ✅ CLEAR old suggestions IMMEDIATELY to avoid showing wrong suggestions
        setSuggestions([]);

        // Then generate new AI-powered suggestions (async, will take ~2s)
        const previousAnswers = updatedMessages
          .filter(m => m.role === 'user')
          .map(m => m.content);

        // ✅ Track question number to prevent race conditions
        const questionNum = questionsAsked + 2; // +2 because we just incremented questionsAsked
        activeQuestionCountRef.current = questionNum;

        generateAIPoweredSuggestions({
          question: data.nextQuestion,
          context: 'Conversa com AI Router',
          previousAnswers: previousAnswers.slice(-3) // Last 3 answers for context
        }).then(newSuggestions => {
          // ✅ Only update suggestions if this is still the active question
          if (activeQuestionCountRef.current === questionNum) {
            setSuggestions(newSuggestions);
          } else {
            console.log('⚠️ [Router] Ignoring stale suggestions for question:', questionNum);
          }
        });
      } else {
        console.error('[StepAIRouter] Unexpected API response structure:', data);
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

  const sendMessage = async () => {
    sendMessageWithText(input.trim());
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
          title: 'Modo Express',
          duration: '5-7 min',
          description: 'Perguntas essenciais personalizadas. Relatório executivo e acionável.',
          icon: Zap,
          color: 'neon-green'
        };
      case 'deep':
        return {
          title: 'Análise Profunda',
          duration: '15-20 min',
          description: 'Análise completa com múltiplos especialistas (Engenharia, Finanças, Estratégia).',
          icon: Microscope,
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
                Descoberta com IA
              </h2>
              <p className="text-xs text-tech-gray-400">
                {showModeSelection ? 'Escolha seu modo' : `Pergunta ${questionsAsked + 1}/6`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Fixed height to keep current question + suggestions + input always visible */}
      <div className="max-w-4xl mx-auto px-6 py-4" style={{ height: 'calc(100vh - 100px)' }}>
        {/* Chat Messages */}
        <div className="card-dark p-6 h-full flex flex-col">
          <div className="overflow-y-auto space-y-4 mb-4 flex-shrink" style={{ maxHeight: messages.length > 3 ? '30vh' : 'none' }}>
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
            <div className="mb-6 space-y-6 animate-slide-up">
              {/* Personalized Recommendation */}
              <div className="bg-gradient-to-br from-neon-green/10 to-neon-cyan/5 border-2 border-neon-green rounded-2xl p-6 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-neon-green/20 flex items-center justify-center">
                    {(() => {
                      const IconComponent = getModeInfo(routingResult.recommendedMode).icon;
                      return <IconComponent className="w-6 h-6 text-neon-green" />;
                    })()}
                  </div>
                  <div className="flex-1">
                    <div className="inline-block mb-2 px-3 py-1 text-xs font-bold rounded-full bg-neon-green/20 text-neon-green border border-neon-green/30 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Recomendado para você</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {getModeInfo(routingResult.recommendedMode).title}
                    </h3>
                    <p className="text-sm text-tech-gray-300 mb-4">
                      {routingResult.reasoning}
                    </p>

                    {/* Reasons (Bullet Points) */}
                    {routingResult.reasons && routingResult.reasons.length > 0 && (
                      <div className="space-y-2 mb-5">
                        <p className="text-xs font-semibold text-neon-green uppercase tracking-wider">
                          Por que este modo?
                        </p>
                        <ul className="space-y-2">
                          {routingResult.reasons.map((reason, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-tech-gray-200">
                              <Check className="w-4 h-4 text-neon-green mt-0.5 flex-shrink-0" />
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-sm text-tech-gray-400 mb-5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-neon-cyan" />
                        {getModeInfo(routingResult.recommendedMode).duration}
                      </span>
                      {routingResult.detectedPersona && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4 text-neon-purple" />
                            {routingResult.detectedPersona}
                          </span>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => handleModeSelection(routingResult.recommendedMode)}
                      className="w-full btn-primary py-3 text-base font-semibold flex items-center justify-center gap-2"
                    >
                      Continuar com {getModeInfo(routingResult.recommendedMode).title}
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Alternative Mode */}
              {routingResult.alternativeModes.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-tech-gray-400 text-center">
                    Ou prefere uma análise diferente?
                  </p>
                  {routingResult.alternativeModes.map((mode) => {
                    const info = getModeInfo(mode);
                    const IconComponent = info.icon;
                    return (
                      <button
                        key={mode}
                        onClick={() => handleModeSelection(mode)}
                        className="w-full p-4 rounded-xl border border-tech-gray-700 hover:border-tech-gray-600 bg-tech-gray-900/30 transition-all text-left group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-tech-gray-800 flex items-center justify-center">
                            <IconComponent className="w-5 h-5 text-tech-gray-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-white mb-1">{info.title}</h4>
                            <p className="text-xs text-tech-gray-500 mb-1">{info.duration}</p>
                            <p className="text-sm text-tech-gray-400">{info.description}</p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-tech-gray-600 group-hover:text-neon-cyan transition-colors" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Input (if not showing mode selection) */}
          {!showModeSelection && (
            <div className="space-y-4">
              {/* Suggested Responses */}
              <AISuggestedResponsesAnimated
                suggestions={suggestions}
                onSelect={handleSuggestionClick}
                isLoading={isLoading}
              />

              {/* Text Input */}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
