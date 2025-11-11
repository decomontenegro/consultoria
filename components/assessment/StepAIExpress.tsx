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
  QuestionTemplate,
  mapAIRouterPainPointsToExpressOptions,
  suggestTeamSizeFromCompanySize
} from '@/lib/ai/dynamic-questions';
import { generateReport, saveReport } from '@/lib/services/report-service';
import { Zap, ArrowRight, Loader2, CheckCircle, Clock } from 'lucide-react';
import QuestionRenderer from './QuestionRenderer';
import { ResponseSuggestion } from '@/lib/ai/response-suggestions';
import { generateAIPoweredSuggestions } from '@/lib/ai/ai-powered-suggestions';
import AISuggestedResponses from './AISuggestedResponses';

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

  // ✅ Pre-populate answered questions based on AI Router partial data
  const getInitialAnsweredQuestions = (): string[] => {
    const answered: string[] = [];

    console.log('🔍 [Express] Checking partialData for skips:', {
      hasIndustry: !!partialData?.companyInfo?.industry,
      industry: partialData?.companyInfo?.industry,
      hasBudget: !!partialData?.budget,
      budget: partialData?.budget,
      fullPartialData: partialData
    });

    // If we have industry from AI Router, skip asking about it again
    if (partialData?.companyInfo?.industry) {
      answered.push('company-industry');
      console.log('✅ Skipping company-industry (already answered in AI Router)');
    } else {
      console.log('⚠️ No industry found in partialData - will ask again');
    }

    // If we have budget from AI Router, skip asking about it again
    if (partialData?.budget) {
      answered.push('budget-range');
      console.log('✅ Skipping budget-range (already answered in AI Router)');
    } else {
      console.log('⚠️ No budget found in partialData - will ask again');
    }

    // If we have company size from AI Router, skip asking about team size again
    if (partialData?.companyInfo?.size) {
      answered.push('team-size');
      console.log('✅ Skipping team-size (company size already answered in AI Router):', partialData.companyInfo.size);
    } else {
      console.log('⚠️ No company size found in partialData - will ask about team size');
    }

    return answered;
  };

  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<string[]>(getInitialAnsweredQuestions());

  // ✅ Prepare initial assessment data with AI Router partial data
  const getInitialAssessmentData = (): DeepPartial<AssessmentData> => {
    const initial: DeepPartial<AssessmentData> = {
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
    };

    // If budget was answered in AI Router, populate it
    if (partialData?.budget) {
      initial.goals = {
        ...initial.goals,
        budgetRange: partialData.budget
      };
      console.log('✅ Pre-populating budget:', partialData.budget);
    }

    // If company size was answered in AI Router, populate dev team size
    if (partialData?.companyInfo?.size) {
      const teamSizeRange = suggestTeamSizeFromCompanySize(partialData.companyInfo.size);
      if (teamSizeRange) {
        // Map range to approximate number (same logic as team-size dataExtractor)
        const sizeMap: Record<string, number> = {
          '1-5': 3,
          '6-15': 10,
          '16-30': 23,
          '31-50': 40,
          '51-100': 75,
          '100+': 150
        };
        const devTeamSize = sizeMap[teamSizeRange] || 10;

        initial.currentState = {
          ...initial.currentState,
          devTeamSize
        };
        console.log('✅ Pre-populating devTeamSize from company size:', {
          companySize: partialData.companyInfo.size,
          teamSizeRange,
          devTeamSize
        });
      }
    }

    return initial;
  };

  const [assessmentData, setAssessmentData] = useState<DeepPartial<AssessmentData>>(getInitialAssessmentData());
  const [startTime] = useState<Date>(new Date());
  const [isComplete, setIsComplete] = useState(false);
  const [hasLoadedFirstQuestion, setHasLoadedFirstQuestion] = useState(false);
  const [suggestions, setSuggestions] = useState<ResponseSuggestion[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastMessageCountRef = useRef<number>(0);

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

  // Update suggestions when question changes (AI-powered)
  useEffect(() => {
    if (currentQuestion && currentQuestion.inputType === 'text' && currentQuestion.text && !currentQuestion.disableSuggestions) {
      const questionText = currentQuestion.text.trim();

      // Only proceed if we have a valid non-empty question
      if (!questionText) {
        console.warn('⚠️ Empty question text, skipping suggestions');
        setSuggestions([]);
        return;
      }

      // ✅ CLEAR old suggestions IMMEDIATELY to avoid showing wrong suggestions
      setSuggestions([]);

      // Get previous answers for context
      const previousAnswers = messages
        .filter(m => m.role === 'user')
        .map(m => m.content)
        .slice(-3); // Last 3 answers

      // Generate AI-powered suggestions (async, will take ~2s)
      generateAIPoweredSuggestions({
        question: questionText,
        context: `Express Mode assessment, question ${answeredQuestionIds.length + 1} of ~7`,
        previousAnswers
      }).then(setSuggestions);
    } else {
      setSuggestions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, answeredQuestionIds.length]);

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
    // Focus input when messages change (without scrolling)
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
    console.log('🔍 [Express] Loading next question. Already answered:', alreadyAnswered);
    // ✨ PHASE 2: Pass AI Router partial data for contextual questions
    const nextQuestion = getNextExpressQuestion(persona, assessmentData, alreadyAnswered, partialData);

    if (!nextQuestion) {
      console.log('❌ [Express] No more questions available');
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

    console.log('✅ [Express] Next question:', {
      id: nextQuestion.id,
      text: nextQuestion.text?.substring(0, 60),
      inputType: nextQuestion.inputType
    });

    // Check if this question was already asked (prevent duplicates)
    setMessages(prev => {
      const lastMessage = prev[prev.length - 1];
      if (lastMessage?.role === 'assistant' && lastMessage?.content === nextQuestion.text) {
        // Don't add duplicate question
        console.log('⚠️ [Express] Skipping duplicate question');
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

    // Reset answer based on input type, with smart pre-selection
    if (nextQuestion.inputType === 'text') {
      setCurrentAnswer('');
      setInput(''); // Also reset text input
    } else if (nextQuestion.inputType === 'multi-choice' || nextQuestion.inputType === 'quick-chips') {
      // ✅ P1: Pre-select pain points from AI Router
      if (nextQuestion.id === 'main-pain-point' && partialData?.painPoints) {
        const preSelected = mapAIRouterPainPointsToExpressOptions(partialData.painPoints);
        if (preSelected.length > 0) {
          console.log('✨ [Express] Pre-selecting pain points:', preSelected);
          setCurrentAnswer(preSelected);
        } else {
          setCurrentAnswer([]);
        }
      } else {
        setCurrentAnswer([]);
      }
    } else if (nextQuestion.inputType === 'single-choice') {
      // ✅ P1: Suggest team-size from company size
      if (nextQuestion.id === 'team-size' && partialData?.companyInfo?.size) {
        const suggestion = suggestTeamSizeFromCompanySize(partialData.companyInfo.size);
        if (suggestion) {
          console.log('✨ [Express] Suggesting team-size:', suggestion);
          setCurrentAnswer(suggestion);
        } else {
          setCurrentAnswer('');
        }
      } else {
        setCurrentAnswer('');
      }
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

  // Send message with specific text (for auto-send from suggestions)
  const sendMessageWithText = async (text: string) => {
    if (!text.trim() || isLoading || !currentQuestion) return;
    await submitAnswer(text.trim());
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
      console.log('📊 Express Mode - Generating report with data:', assessmentData);

      // Fill missing required fields with defaults
      const completeData: AssessmentData = {
        persona: assessmentData.persona as UserPersona,
        companyInfo: {
          name: assessmentData.companyInfo?.name || 'Empresa',
          industry: assessmentData.companyInfo?.industry || 'Tecnologia',
          size: assessmentData.companyInfo?.size || 'scaleup',
          revenue: assessmentData.companyInfo?.revenue || 'R$1M-10M',
          country: assessmentData.companyInfo?.country || 'Brasil'
        },
        currentState: {
          devTeamSize: assessmentData.currentState?.devTeamSize || 10,
          devSeniority: {
            junior: assessmentData.currentState?.devSeniority?.junior ?? 3,
            mid: assessmentData.currentState?.devSeniority?.mid ?? 4,
            senior: assessmentData.currentState?.devSeniority?.senior ?? 2,
            lead: assessmentData.currentState?.devSeniority?.lead ?? 1
          },
          currentTools: assessmentData.currentState?.currentTools?.filter((t): t is string => t !== undefined) || [],
          deploymentFrequency: assessmentData.currentState?.deploymentFrequency || 'weekly',
          avgCycleTime: assessmentData.currentState?.avgCycleTime || 14,
          bugRate: assessmentData.currentState?.bugRate,
          aiToolsUsage: assessmentData.currentState?.aiToolsUsage || 'exploring',
          painPoints: assessmentData.currentState?.painPoints?.filter((p): p is string => p !== undefined) || ['Produtividade']
        },
        goals: {
          primaryGoals: assessmentData.goals?.primaryGoals?.filter((g): g is string => g !== undefined) || ['Aumentar Produtividade'],
          timeline: assessmentData.goals?.timeline || '6-months',
          budgetRange: assessmentData.goals?.budgetRange || 'R$50k-100k',
          successMetrics: assessmentData.goals?.successMetrics?.filter((m): m is string => m !== undefined) || ['Produtividade'],
          competitiveThreats: assessmentData.goals?.competitiveThreats
        },
        contactInfo: {
          fullName: assessmentData.contactInfo?.fullName || '',
          title: assessmentData.contactInfo?.title || '',
          email: assessmentData.contactInfo?.email || '',
          phone: assessmentData.contactInfo?.phone,
          company: assessmentData.contactInfo?.company || assessmentData.companyInfo?.name || 'Empresa',
          agreeToContact: assessmentData.contactInfo?.agreeToContact ?? true
        },
        aiScope: {
          engineering: assessmentData.aiScope?.engineering ?? true,
          customerService: assessmentData.aiScope?.customerService ?? false,
          sales: assessmentData.aiScope?.sales ?? false,
          marketing: assessmentData.aiScope?.marketing ?? false,
          operations: assessmentData.aiScope?.operations ?? false,
          meetingIntelligence: assessmentData.aiScope?.meetingIntelligence ?? false
        },
        submittedAt: new Date()
      };

      console.log('✅ Complete data prepared:', completeData);

      const report = generateReport(completeData);
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
      console.error('❌ Report generation error:', error);

      const errorMsg: ConversationMessage = {
        role: 'assistant',
        content: 'Erro ao gerar relatório. Por favor, tente novamente.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMsg]);
      setIsComplete(false); // Allow retry
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

      {/* Main Content - Fixed height to keep current question + suggestions + input always visible */}
      <div className="max-w-4xl mx-auto px-6 py-4" style={{ height: 'calc(100vh - 100px)' }}>
        <div className="card-dark p-6 h-full flex flex-col">
          {/* Messages - Limited height with scroll */}
          <div className="overflow-y-auto space-y-4 mb-4 flex-shrink" style={{ maxHeight: messages.length > 3 ? '30vh' : 'none' }}>
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
                <div className="space-y-3">
                  {/* Suggested Responses */}
                  <AISuggestedResponses
                    suggestions={suggestions}
                    onSelect={(text) => {
                      setInput(text);
                      // Auto-send after brief delay
                      setTimeout(() => {
                        sendMessageWithText(text);
                      }, 100);
                    }}
                    isLoading={isLoading}
                  />

                  {/* Text Input */}
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
