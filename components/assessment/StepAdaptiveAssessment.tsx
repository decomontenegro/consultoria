/**
 * Step Adaptive Assessment - AI-Powered Dynamic Questions
 *
 * Features:
 * - 50-question pool with AI-powered routing
 * - One question at a time (simple, focused UX)
 * - 12-18 questions per session
 * - Semantic topic tracking (no repetitions)
 * - Completeness-based finish logic
 * - Smart progress indicator (% not count)
 *
 * Sprint 1 Integration:
 * - Uses unified session manager (/lib/sessions/unified-session-manager.ts)
 * - Persistent sessions across routes (globalThis pattern)
 * - Enhanced tracking: weak signals, insights, completion metrics
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  AssessmentData,
  UserPersona,
  ConversationMessage,
  DeepPartial,
  AdaptiveQuestionResponse
} from '@/lib/types';
import { generateReport, saveReport } from '@/lib/services/report-service';
import { Brain, ArrowRight, Loader2, CheckCircle, Sparkles, TrendingUp } from 'lucide-react';
import QuestionRenderer from './QuestionRenderer';
import { QuestionTemplate } from '@/lib/ai/dynamic-questions';
import { QuestionProgressCompact } from './QuestionProgress';
import type { CompletionMetrics } from '@/lib/types';
import { ResponseSuggestion } from '@/lib/ai/response-suggestions';
import { generateAIPoweredSuggestions } from '@/lib/ai/ai-powered-suggestions';
import AISuggestedResponses from './AISuggestedResponses';

interface StepAdaptiveAssessmentProps {
  persona?: UserPersona; // Optional - will be detected during conversation if not provided
  partialData?: DeepPartial<AssessmentData>;
  onComplete?: () => void;
  onPersonaDetected?: (persona: UserPersona) => void; // Callback when persona is detected
}

interface AdaptiveQuestion {
  id: string;
  text: string;
  inputType: 'text' | 'single-choice' | 'multi-choice' | 'number';
  options?: Array<{ value: string; label: string; description?: string }>;
  placeholder?: string;
}

export default function StepAdaptiveAssessment({ persona, partialData, onComplete, onPersonaDetected }: StepAdaptiveAssessmentProps) {
  const router = useRouter();

  console.log('🔧 [StepAdaptiveAssessment] Component rendered with:', {
    hasPersona: !!persona,
    persona,
    hasPartialData: !!partialData,
    hasOnComplete: !!onComplete,
    hasOnPersonaDetected: !!onPersonaDetected
  });

  // Conversation state
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [conversationHistory, setConversationHistory] = useState<Array<{
    questionId: string;
    question: string;
    answer: any;
  }>>([]);

  // Current question state
  const [currentQuestion, setCurrentQuestion] = useState<AdaptiveQuestion | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState<string | string[]>('');
  const [input, setInput] = useState('');

  // Session state
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // ✅ FIX: Use ref instead of state to prevent double initialization on Strict Mode remounts
  const hasInitialized = useRef(false);

  // Progress tracking
  const [completenessScore, setCompletenessScore] = useState(0);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [estimatedRemaining, setEstimatedRemaining] = useState({ min: 8, max: 12 });
  const [completionMetrics, setCompletionMetrics] = useState<CompletionMetrics>({
    completenessScore: 0,
    essentialFieldsCollected: 0,
    totalFieldsCollected: 0,
    topicsCovered: [],
    metricsCollected: [],
    gapsIdentified: []
  });

  // Routing insights
  const [lastRoutingReasoning, setLastRoutingReasoning] = useState<string>('');
  const [routingConfidence, setRoutingConfidence] = useState<number>(0);

  // ✅ AI-powered suggestions
  const [suggestions, setSuggestions] = useState<ResponseSuggestion[]>([]);
  const lastQuestionForSuggestions = useRef<string>('');

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastMessageCountRef = useRef<number>(0);

  // Auto-scroll to bottom when new assistant message appears
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, []);

  useEffect(() => {
    const currentMessageCount = messages.length;
    const lastMessage = messages[messages.length - 1];

    if (currentMessageCount > lastMessageCountRef.current && lastMessage?.role === 'assistant') {
      setTimeout(scrollToBottom, 100);
    }

    lastMessageCountRef.current = currentMessageCount;
  }, [messages, scrollToBottom]);

  // Auto-focus input
  const focusInput = useCallback(() => {
    if (currentQuestion?.inputType !== 'text') return;

    const attemptFocus = () => {
      if (inputRef.current && !isLoading && !isComplete) {
        inputRef.current.focus({ preventScroll: true });
      }
    };

    attemptFocus();
    requestAnimationFrame(() => requestAnimationFrame(attemptFocus));
    setTimeout(attemptFocus, 500);
  }, [isLoading, isComplete, currentQuestion]);

  useEffect(() => {
    if (!isLoading && !isComplete && currentQuestion) {
      focusInput();
    }
  }, [currentQuestion, isLoading, isComplete, focusInput]);

  // ✅ Generate AI-powered suggestions when new question appears
  useEffect(() => {
    if (!currentQuestion || isLoading || isComplete) return;

    // Avoid regenerating for same question
    if (currentQuestion.text === lastQuestionForSuggestions.current) return;

    lastQuestionForSuggestions.current = currentQuestion.text;

    // Clear old suggestions immediately
    setSuggestions([]);

    // Get previous answers for context
    const previousAnswers = conversationHistory
      .map(h => h.answer)
      .filter(a => a && typeof a === 'string')
      .slice(-3);

    // Generate suggestions (async, ~2s)
    generateAIPoweredSuggestions({
      question: currentQuestion.text,
      context: `Adaptive Assessment, pergunta ${questionsAsked + 1}`,
      previousAnswers
    }).then(newSuggestions => {
      // Only update if still on same question
      if (currentQuestion.text === lastQuestionForSuggestions.current) {
        setSuggestions(newSuggestions);
      }
    }).catch(error => {
      console.error('❌ Error generating suggestions:', error);
    });
  }, [currentQuestion, isLoading, isComplete, conversationHistory, questionsAsked]);

  // Initialize session and load first question
  useEffect(() => {
    console.log('🔧 [StepAdaptiveAssessment] Init useEffect triggered', {
      hasInitialized: hasInitialized.current
    });

    // ✅ FIX: Use ref to prevent double init on React Strict Mode remounts
    if (!hasInitialized.current) {
      console.log('🚀 [StepAdaptiveAssessment] Initializing session...');
      hasInitialized.current = true;
      initializeSession();
    } else {
      console.log('⏭️ [StepAdaptiveAssessment] Already initialized, skipping');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeSession = async () => {
    console.log('📡 [StepAdaptiveAssessment] initializeSession called');
    console.log('📡 [StepAdaptiveAssessment] Request body:', {
      persona,
      partialData: partialData || {}
    });

    try {
      setIsLoading(true);
      console.log('📡 [StepAdaptiveAssessment] Loading state set to true');

      // Initialize adaptive assessment session
      console.log('📡 [StepAdaptiveAssessment] Calling POST /api/adaptive-assessment...');
      const initResponse = await fetch('/api/adaptive-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona,
          partialData: partialData || {}
        })
      });

      console.log('📡 [StepAdaptiveAssessment] Response received:', {
        ok: initResponse.ok,
        status: initResponse.status,
        statusText: initResponse.statusText
      });

      if (!initResponse.ok) {
        const errorText = await initResponse.text();
        console.error('❌ [StepAdaptiveAssessment] Init failed:', errorText);
        throw new Error(`Failed to initialize session: ${initResponse.status} ${errorText}`);
      }

      const initData = await initResponse.json();
      setSessionId(initData.sessionId);

      console.log('✅ [Adaptive] Session initialized:', initData.sessionId);

      // Load first question
      console.log('📡 [StepAdaptiveAssessment] Loading first question...');
      await loadNextQuestion(initData.sessionId);

    } catch (error) {
      console.error('❌ [Adaptive] Initialization error:', error);
      console.error('❌ [Adaptive] Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });

      const errorMsg: ConversationMessage = {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao iniciar a avaliação. Por favor, tente novamente.',
        timestamp: new Date()
      };

      setMessages([errorMsg]);
      setIsLoading(false);
    }
  };

  const loadNextQuestion = async (session: string = sessionId) => {
    try {
      setIsLoading(true);

      console.log('🔍 [Adaptive] Loading next question...');

      const response = await fetch('/api/adaptive-assessment/next-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get next question');
      }

      const data: AdaptiveQuestionResponse = await response.json();

      console.log('📊 [Adaptive] Response:', {
        shouldFinish: data.shouldFinish,
        hasQuestion: !!data.nextQuestion,
        completeness: data.completion.completenessScore,
        questionsAsked: questionsAsked + 1
      });

      // Update progress metrics from server
      setCompletenessScore(data.completion.completenessScore);
      setCompletionMetrics(data.completion);

      // Update estimated remaining based on completion
      const currentScore = data.completion.completenessScore;
      if (currentScore < 50) {
        setEstimatedRemaining({ min: 6, max: 10 });
      } else if (currentScore < 80) {
        setEstimatedRemaining({ min: 3, max: 6 });
      } else {
        setEstimatedRemaining({ min: 1, max: 3 });
      }

      // Should finish?
      if (data.shouldFinish || !data.nextQuestion) {
        console.log('✅ [Adaptive] Assessment complete:', data.finishReason);
        await handleComplete(data.finishReason || 'completeness_reached');
        return;
      }

      // Update routing insights
      if (data.routing) {
        setLastRoutingReasoning(data.routing.reasoning);
        setRoutingConfidence(data.routing.confidence);
        console.log('🧠 [Routing]', data.routing.reasoning, `(${Math.round(data.routing.confidence * 100)}%)`);
      }

      // Add question to messages
      const questionMsg: ConversationMessage = {
        role: 'assistant',
        content: data.nextQuestion.text,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, questionMsg]);
      setCurrentQuestion(data.nextQuestion);
      setQuestionsAsked(prev => prev + 1);

      // Reset answer based on input type
      if (data.nextQuestion.inputType === 'text') {
        setCurrentAnswer('');
        setInput('');
      } else if (data.nextQuestion.inputType === 'multi-choice') {
        setCurrentAnswer([]);
      } else {
        setCurrentAnswer('');
      }

      setIsLoading(false);

    } catch (error) {
      console.error('❌ [Adaptive] Error loading question:', error);

      const errorMsg: ConversationMessage = {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro. Vamos continuar.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMsg]);
      setIsLoading(false);

      // Try to finish if we have some data
      if (questionsAsked >= 8) {
        setTimeout(() => handleComplete('error_recovery'), 2000);
      }
    }
  };

  const submitAnswer = async (answer: string | string[]) => {
    if (isLoading || !currentQuestion) return;

    // Validate answer
    const answerText = Array.isArray(answer) ? answer.join(', ') : answer;
    if (!answerText.trim()) return;

    // Add user message
    const userMessage: ConversationMessage = {
      role: 'user',
      content: answerText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Add to conversation history
    setConversationHistory(prev => [...prev, {
      questionId: currentQuestion.id,
      question: currentQuestion.text,
      answer
    }]);

    setIsLoading(true);

    try {
      // Submit answer to backend
      const response = await fetch('/api/adaptive-assessment/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionId: currentQuestion.id,
          questionText: currentQuestion.text, // Pass question text for LLM extraction
          answer
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }

      const data = await response.json();
      console.log('✅ [Adaptive] Answer submitted, updated completeness:', data.completeness);

      // Small delay for natural flow
      await new Promise(resolve => setTimeout(resolve, 500));

      // Load next question
      await loadNextQuestion();

    } catch (error) {
      console.error('❌ [Adaptive] Error submitting answer:', error);

      const errorMsg: ConversationMessage = {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro. Vamos continuar.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMsg]);
      setIsLoading(false);

      // Try to load next question anyway
      setTimeout(() => loadNextQuestion(), 2000);
    }
  };

  // Handler for text-based questions
  const sendMessage = async () => {
    if (!input.trim() || isLoading || !currentQuestion) return;
    await submitAnswer(input.trim());
    setInput('');
  };

  // Handler for choice-based questions
  const sendChoice = async () => {
    if (isLoading || !currentQuestion) return;
    await submitAnswer(currentAnswer);
  };

  const handleComplete = async (finishReason: string) => {
    setIsComplete(true);

    // Get finish message
    const finishMessages = {
      completeness_reached: 'Perfeito! Coletei todas as informações necessárias.',
      max_questions: 'Excelente! Temos informações suficientes para um relatório completo.',
      all_essential_covered: 'Ótimo! Cobrimos todos os pontos essenciais.',
      error_recovery: 'Vamos gerar seu relatório com as informações coletadas.'
    };

    const finalMsg: ConversationMessage = {
      role: 'assistant',
      content: `${finishMessages[finishReason as keyof typeof finishMessages] || finishMessages.completeness_reached}\n\nVou gerar seu relatório personalizado agora...`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, finalMsg]);

    // Wait for UX
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Get final assessment data and generate report
    try {
      console.log('📊 [Adaptive] Generating report...');

      const completeResponse = await fetch('/api/adaptive-assessment/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          conversationHistory
        })
      });

      if (!completeResponse.ok) {
        throw new Error('Failed to complete assessment');
      }

      const { assessmentData, deepInsights } = await completeResponse.json();

      console.log('✅ [Adaptive] Assessment data complete');

      // FASE 3.5+: Prepare conversation context for personalized report
      const conversationContext = {
        mode: 'adaptive' as const,
        rawConversation: conversationHistory.map((msg) => ({
          question: msg.question,
          answer: msg.answer,
          timestamp: msg.timestamp
        }))
      };

      console.log('📝 [Conversation] Preserving', conversationContext.rawConversation.length, 'messages for report personalization');

      // Generate report
      const report = generateReport(assessmentData as AssessmentData, undefined, conversationContext);

      // Add deep insights if available
      if (deepInsights) {
        report.deepInsights = deepInsights;
      }

      console.log('✅ Report generated:', report.id);

      saveReport(report);
      console.log('✅ Report saved');

      // Navigate to report
      console.log('🔄 Redirecting to:', `/report/${report.id}`);
      router.push(`/report/${report.id}`);

      if (onComplete) {
        onComplete();
      }

    } catch (error) {
      console.error('❌ [Adaptive] Report generation error:', error);

      const errorMsg: ConversationMessage = {
        role: 'assistant',
        content: 'Erro ao gerar relatório. Por favor, tente novamente.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMsg]);
      setIsComplete(false);
    }
  };

  // Convert AdaptiveQuestion to QuestionTemplate for QuestionRenderer compatibility
  const currentQuestionTemplate: QuestionTemplate | null = currentQuestion ? {
    id: currentQuestion.id,
    text: currentQuestion.text,
    inputType: currentQuestion.inputType,
    options: currentQuestion.options,
    placeholder: currentQuestion.placeholder,
    dataExtractor: () => ({}) // Not used in this component
  } : null;

  return (
    <div className="min-h-screen bg-background-dark">
      {/* Header */}
      <div className="bg-tech-gray-900/50 border-b border-tech-gray-800 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-cyan/20 to-neon-green/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-neon-cyan" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Avaliação Adaptativa
                </h2>
                <p className="text-xs text-tech-gray-400">
                  Perguntas inteligentes personalizadas
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Smart Progress */}
              <QuestionProgressCompact
                completion={completionMetrics}
                questionsAsked={questionsAsked}
              />
            </div>
          </div>

          {/* AI Routing Insight (if available) */}
          {lastRoutingReasoning && routingConfidence > 0.7 && !isComplete && (
            <div className="mt-3 flex items-start gap-2 text-xs text-tech-gray-500">
              <Sparkles className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span className="italic">{lastRoutingReasoning}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-4" style={{ height: 'calc(100vh - 120px)' }}>
        <div className="card-dark p-6 h-full flex flex-col">
          {/* Messages - Scrollable history */}
          <div className="overflow-y-auto space-y-4 mb-4 flex-shrink" style={{ maxHeight: messages.length > 3 ? '35vh' : 'none' }}>
            {/* Welcome message */}
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-neon-cyan/20 to-neon-green/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Brain className="w-8 h-8 text-neon-cyan" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Conversa Inteligente de 10-12 Minutos
                </h3>
                <p className="text-sm text-tech-gray-400 max-w-lg mx-auto leading-relaxed">
                  Vou conduzir uma <strong className="text-white">conversa adaptativa</strong> para entender seu cenário completo.
                  Cada pergunta é escolhida pela IA baseada nas suas respostas anteriores e expertise,
                  garantindo um <strong className="text-white">relatório personalizado e acionável</strong> no final.
                </p>
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-tech-gray-500">
                  <span className="inline-block w-2 h-2 bg-neon-green rounded-full animate-pulse"></span>
                  <span>Sistema detectará automaticamente o melhor especialista para você</span>
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-neon-cyan/10 border border-neon-cyan/30 text-white'
                      : 'bg-tech-gray-800/50 border border-tech-gray-700 text-tech-gray-200'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4 text-neon-cyan" />
                      <span className="text-xs font-semibold text-neon-cyan">Adaptive AI</span>
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

            {isComplete && (
              <div className="flex justify-center">
                <div className="bg-neon-green/10 border border-neon-green/30 rounded-lg px-6 py-4">
                  <div className="flex items-center gap-3 text-neon-green">
                    <CheckCircle className="w-6 h-6" />
                    <div>
                      <p className="font-semibold">Avaliação Completa!</p>
                      <p className="text-sm text-tech-gray-400">Gerando relatório personalizado...</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area - Fixed at bottom */}
          {!isComplete && currentQuestionTemplate && (
            <div className="space-y-4">
              {currentQuestionTemplate.inputType === 'text' ? (
                // Text input
                <div className="space-y-3">
                  {/* ✅ AI-Powered Suggestions */}
                  <AISuggestedResponses
                    suggestions={suggestions}
                    onSelect={(text) => {
                      setInput(text);
                      // Auto-send after brief delay
                      setTimeout(() => {
                        sendMessage();
                      }, 100);
                    }}
                    isLoading={isLoading}
                  />

                  <div className="flex gap-3">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                      placeholder={currentQuestionTemplate.placeholder || "Digite sua resposta..."}
                      className="input-dark flex-1"
                      disabled={isLoading}
                      autoFocus
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim() || isLoading}
                      className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <span>Enviar</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                // Choice-based input
                <div className="space-y-4">
                  <QuestionRenderer
                    question={currentQuestionTemplate}
                    value={currentAnswer}
                    onChange={setCurrentAnswer}
                    disabled={isLoading}
                  />

                  <div className="flex justify-end">
                    <button
                      onClick={sendChoice}
                      disabled={
                        isLoading ||
                        (Array.isArray(currentAnswer) && currentAnswer.length === 0) ||
                        (!Array.isArray(currentAnswer) && !currentAnswer.trim())
                      }
                      className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <span>Continuar</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Stats */}
          {questionsAsked > 0 && !isComplete && (
            <div className="mt-4 pt-4 border-t border-tech-gray-800">
              <div className="flex items-center justify-between text-xs text-tech-gray-500">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3 h-3" />
                  <span>{questionsAsked} perguntas | {completenessScore}% completo</span>
                </div>
                <span className="italic">
                  {completenessScore >= 80
                    ? 'Quase pronto para gerar relatório'
                    : `~${Math.max(0, estimatedRemaining.min)}-${estimatedRemaining.max} perguntas restantes`
                  }
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
