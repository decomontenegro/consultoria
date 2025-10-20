/**
 * Step AI Express - 5-7 Minute Assessment
 *
 * Express Mode for busy executives:
 * - 7-10 dynamic questions
 * - Intelligent data extraction
 * - Quick report generation
 * - Completion in 5-7 minutes
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  AssessmentData,
  UserPersona,
  ConversationMessage,
  CompanyInfo,
  ContactInfo,
  DeepPartial
} from '@/lib/types';
import {
  getNextExpressQuestion,
  hasMinimumViableData,
  calculateCompleteness,
  QuestionTemplate
} from '@/lib/ai/dynamic-questions';
import { generateReport, saveReport } from '@/lib/services/report-service';
import { Zap, ArrowRight, Loader2, CheckCircle, Clock } from 'lucide-react';
import QuestionRenderer from './QuestionRenderer';

interface StepAIExpressProps {
  persona: UserPersona;
  partialData?: any; // Can be AIRouterResult['partialData'] or Partial<AssessmentData>
  onComplete?: () => void;
}

export default function StepAIExpress({ persona, partialData, onComplete }: StepAIExpressProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState<string | string[]>('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionTemplate | null>(null);
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<string[]>([]);
  const [assessmentData, setAssessmentData] = useState<DeepPartial<AssessmentData>>({
    persona,
    ...partialData,
    aiScope: {
      engineering: true,
      customerService: false,
      sales: false,
      marketing: false,
      operations: false,
      meetingIntelligence: false
    }
  });
  const [startTime] = useState<Date>(new Date());
  const [isComplete, setIsComplete] = useState(false);
  const [hasLoadedFirstQuestion, setHasLoadedFirstQuestion] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Focus input helper (only for text questions)
  const focusInput = useCallback(() => {
    // Only focus if current question is text type
    if (currentQuestion?.inputType !== 'text') {
      return;
    }

    // Use multiple strategies to ensure focus
    const attemptFocus = () => {
      if (inputRef.current && !isLoading && !isComplete) {
        inputRef.current.focus({ preventScroll: true });
        console.log('✅ Input focused');
      }
    };

    // Try immediately
    attemptFocus();

    // Try after animation frames (for DOM updates)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        attemptFocus();
      });
    });

    // Try after scroll animation completes (800ms delay)
    setTimeout(() => {
      attemptFocus();
    }, 800);
  }, [isLoading, isComplete, currentQuestion]);

  useEffect(() => {
    scrollToBottom();
    // Focus input after scrolling
    if (!isLoading && !isComplete) {
      focusInput();
    }
  }, [messages, isLoading, isComplete, focusInput]);

  // Also auto-focus when question changes
  useEffect(() => {
    if (!isLoading && !isComplete && currentQuestion) {
      focusInput();
    }
  }, [currentQuestion, isLoading, isComplete, focusInput]);

  // Load first question (only once on mount)
  useEffect(() => {
    if (!hasLoadedFirstQuestion) {
      setHasLoadedFirstQuestion(true);
      loadNextQuestion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadNextQuestion = (alreadyAnswered: string[] = answeredQuestionIds) => {
    const nextQuestion = getNextExpressQuestion(persona, assessmentData, alreadyAnswered);

    if (!nextQuestion) {
      // No more questions, check if we can finish
      if (hasMinimumViableData(assessmentData)) {
        handleComplete();
      } else {
        // Shouldn't happen, but handle gracefully
        const errorMsg: ConversationMessage = {
          role: 'assistant',
          content: 'Parece que tivemos um problema. Vamos gerar seu relatório com os dados que temos.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMsg]);
        setTimeout(handleComplete, 2000);
      }
      return;
    }

    // Check if this question was already asked (prevent duplicates)
    setMessages(prev => {
      const lastMessage = prev[prev.length - 1];
      if (lastMessage?.role === 'assistant' && lastMessage?.content === nextQuestion.text) {
        // Don't add duplicate question
        return prev;
      }

      const questionMsg: ConversationMessage = {
        role: 'assistant',
        content: nextQuestion.text,
        timestamp: new Date()
      };

      return [...prev, questionMsg];
    });

    // Set current question and reset answer
    setCurrentQuestion(nextQuestion);

    // Reset answer based on input type
    if (nextQuestion.inputType === 'text') {
      setCurrentAnswer('');
      setInput(''); // Also reset text input
    } else if (nextQuestion.inputType === 'multi-choice' || nextQuestion.inputType === 'quick-chips') {
      setCurrentAnswer([]);
    } else {
      setCurrentAnswer('');
    }
  };

  const submitAnswer = async (answer: string | string[]) => {
    if (isLoading || !currentQuestion) return;

    // Validate answer
    const answerText = Array.isArray(answer) ? answer.join(', ') : answer;
    if (!answerText.trim()) return;

    const userMessage: ConversationMessage = {
      role: 'user',
      content: answerText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Extract data from answer using the question's dataExtractor
      const extractedData = currentQuestion.dataExtractor(answer, assessmentData);

      // Merge extracted data
      const updatedData: DeepPartial<AssessmentData> = {
        ...assessmentData,
        ...extractedData,
        companyInfo: {
          ...assessmentData.companyInfo,
          ...extractedData.companyInfo
        },
        currentState: {
          ...assessmentData.currentState,
          ...extractedData.currentState
        },
        goals: {
          ...assessmentData.goals,
          ...extractedData.goals
        },
        contactInfo: {
          ...assessmentData.contactInfo,
          ...extractedData.contactInfo
        }
      };

      setAssessmentData(updatedData);

      // Update answered questions list
      const newAnsweredIds = [...answeredQuestionIds, currentQuestion.id];
      setAnsweredQuestionIds(newAnsweredIds);

      // Small delay for natural conversation flow
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if we have minimum data
      if (hasMinimumViableData(updatedData)) {
        // Can finish, but ask one more question if not at limit
        if (newAnsweredIds.length < 9) { // Max 10 questions
          loadNextQuestion(newAnsweredIds); // Pass updated list
        } else {
          handleComplete();
        }
      } else {
        // Need more data, continue
        loadNextQuestion(newAnsweredIds); // Pass updated list
      }

    } catch (error) {
      console.error('Express mode error:', error);

      const errorMsg: ConversationMessage = {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro. Vamos continuar.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMsg]);
      loadNextQuestion();
    } finally {
      setIsLoading(false);
      // Ensure input is focused after loading finishes (for text questions)
      setTimeout(() => {
        focusInput();
      }, 100);
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

  const handleComplete = async () => {
    setIsComplete(true);

    // Calculate duration
    const duration = Math.round((new Date().getTime() - startTime.getTime()) / 1000 / 60);

    // Final message
    const finalMsg: ConversationMessage = {
      role: 'assistant',
      content: `Perfeito! Coletei todas as informações necessárias em ${duration} minutos.\n\nVou gerar seu relatório express agora...`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, finalMsg]);

    // Wait a bit for UX
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate and save report
    try {
      const report = generateReport(assessmentData as AssessmentData);
      saveReport(report);

      // Navigate to report
      router.push(`/report/${report.id}`);

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Report generation error:', error);

      const errorMsg: ConversationMessage = {
        role: 'assistant',
        content: 'Erro ao gerar relatório. Por favor, tente novamente.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const completeness = calculateCompleteness(assessmentData);
  const currentDuration = Math.round((new Date().getTime() - startTime.getTime()) / 1000 / 60);

  return (
    <div className="min-h-screen bg-background-dark">
      {/* Header */}
      <div className="bg-tech-gray-900/50 border-b border-tech-gray-800 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-neon-green/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-neon-green" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Express Mode
                </h2>
                <p className="text-xs text-tech-gray-400">
                  Assessment rápido em 5-7 min
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Timer */}
              <div className="flex items-center gap-2 text-sm text-tech-gray-400">
                <Clock className="w-4 h-4" />
                <span>{currentDuration} min</span>
              </div>

              {/* Progress */}
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-tech-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-neon-green to-neon-cyan transition-all duration-500"
                    style={{ width: `${completeness}%` }}
                  />
                </div>
                <span className="text-xs text-tech-gray-400">{completeness}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="card-dark p-6 min-h-[500px] flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-6">
            {/* Welcome message */}
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-neon-green" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Express Mode Activated
                </h3>
                <p className="text-sm text-tech-gray-400">
                  Vou fazer 7-10 perguntas essenciais para gerar seu relatório rapidamente.
                </p>
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
                      ? 'bg-neon-green/10 border border-neon-green/30 text-white'
                      : 'bg-tech-gray-800/50 border border-tech-gray-700 text-tech-gray-200'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-neon-green" />
                      <span className="text-xs font-semibold text-neon-green">Express AI</span>
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
                    <span className="text-sm">Processando...</span>
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
                      <p className="font-semibold">Assessment Completo!</p>
                      <p className="text-sm text-tech-gray-400">Gerando seu relatório...</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {!isComplete && currentQuestion && (
            <div className="space-y-4">
              {/* Question Renderer */}
              {currentQuestion.inputType === 'text' ? (
                // Text input - traditional style
                <div className="flex gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder={currentQuestion.placeholder || "Digite sua resposta..."}
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
              ) : (
                // Choice-based input - render with QuestionRenderer
                <div className="space-y-4">
                  <QuestionRenderer
                    question={currentQuestion}
                    value={currentAnswer}
                    onChange={setCurrentAnswer}
                    disabled={isLoading}
                  />

                  {/* Continue Button */}
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
          {answeredQuestionIds.length > 0 && !isComplete && (
            <div className="mt-4 pt-4 border-t border-tech-gray-800">
              <div className="flex items-center justify-between text-xs text-tech-gray-500">
                <span>{answeredQuestionIds.length} perguntas respondidas</span>
                <span>~{Math.max(0, 7 - answeredQuestionIds.length)} restantes</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
