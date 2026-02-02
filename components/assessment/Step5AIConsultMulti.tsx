/**
 * Step 5: Multi-Specialist AI Consultation
 *
 * Enhanced version with multiple AI specialists consultation
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AssessmentData } from '@/lib/types';
import {
  SpecialistType,
  getRecommendedSpecialist,
  getAvailableSpecialists,
  generateAggregatedInsightsSummary
} from '@/lib/prompts/specialist-prompts';
import SpecialistSelector, { SpecialistIndicator } from './SpecialistSelector';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { ResponseSuggestion } from '@/lib/ai/response-suggestions';
import { generateAIPoweredSuggestions } from '@/lib/ai/ai-powered-suggestions';
import AISuggestedResponses from './AISuggestedResponses';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  specialist?: SpecialistType;
}

interface Step5AIConsultMultiProps {
  data: Partial<AssessmentData>;
  onSkip: () => void;
  onComplete: (insights: string[]) => void;
}

type Phase = 'specialist-selection' | 'consultation' | 'ready-to-finish';

export default function Step5AIConsultMulti({ data, onSkip, onComplete }: Step5AIConsultMultiProps) {
  const [phase, setPhase] = useState<Phase>('specialist-selection');
  const [selectedSpecialists, setSelectedSpecialists] = useState<SpecialistType[]>([]);
  const [currentSpecialist, setCurrentSpecialist] = useState<SpecialistType | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [specialistInsights, setSpecialistInsights] = useState<Record<SpecialistType, string[]>>({} as any);
  const [completedSpecialists, setCompletedSpecialists] = useState<SpecialistType[]>([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [suggestions, setSuggestions] = useState<ResponseSuggestion[]>([]);
  const [isWrappingUp, setIsWrappingUp] = useState(false); // ✅ Detect when specialist is concluding
  const [userExpertiseAreas, setUserExpertiseAreas] = useState<string[]>([]); // ✅ User's areas of knowledge
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageCountRef = useRef<number>(0);
  const activeMessageContentRef = useRef<string | null>(null); // ✅ Track active message to prevent race conditions

  const MIN_QUESTIONS_PER_SPECIALIST = 5;
  const recommendedSpecialist = data.persona ? getRecommendedSpecialist(data as AssessmentData) : undefined;

  // Filter specialists based on persona (non-technical users cannot access Engineering specialist)
  const availableSpecialists = data.persona ? getAvailableSpecialists(data.persona) : undefined;

  /**
   * AUTOMATIC SPECIALIST ROUTING
   * Intelligently selects ONE specialist based on multiple signals
   */
  const selectSpecialistAutomatically = (assessmentData: Partial<AssessmentData>): SpecialistType => {
    const scores: Record<SpecialistType, number> = {
      engineering: 0,
      finance: 0,
      strategy: 0
    };

    const persona = assessmentData.persona;
    const expertise = assessmentData.userExpertise || [];
    const goals = assessmentData.goals?.primaryGoals || [];
    const painPoints = assessmentData.currentState?.painPoints || [];

    // --- SIGNAL 1: Persona (Weight: 30 points) ---
    if (persona === 'engineering-tech' || persona === 'it-devops') {
      scores.engineering += 30;
    } else if (persona === 'finance-ops') {
      scores.finance += 30;
    } else if (persona === 'board-executive' || persona === 'product-business') {
      scores.strategy += 30;
    }

    // --- SIGNAL 2: User Expertise (Weight: 25 points) ---
    if (expertise.includes('engineering-tech')) {
      scores.engineering += 25;
    }
    if (expertise.includes('finance-ops')) {
      scores.finance += 25;
    }
    if (expertise.includes('strategy-business')) {
      scores.strategy += 25;
    }

    // Mixed expertise boosts strategy (cross-functional)
    if (expertise.length >= 3) {
      scores.strategy += 10;
    }

    // --- SIGNAL 3: Primary Goals (Weight: 20 points) ---
    goals.forEach(goal => {
      const lowerGoal = goal.toLowerCase();

      // Engineering signals
      if (
        lowerGoal.includes('velocidade') ||
        lowerGoal.includes('produtividade') ||
        lowerGoal.includes('qualidade') ||
        lowerGoal.includes('automação')
      ) {
        scores.engineering += 20;
      }

      // Finance signals
      if (
        lowerGoal.includes('custo') ||
        lowerGoal.includes('roi') ||
        lowerGoal.includes('eficiência') ||
        lowerGoal.includes('orçamento')
      ) {
        scores.finance += 20;
      }

      // Strategy signals
      if (
        lowerGoal.includes('competitiv') ||
        lowerGoal.includes('mercado') ||
        lowerGoal.includes('crescimento') ||
        lowerGoal.includes('inovação')
      ) {
        scores.strategy += 20;
      }
    });

    // --- SIGNAL 4: Pain Points (Weight: 15 points) ---
    painPoints.forEach(pain => {
      const lowerPain = pain.toLowerCase();

      if (
        lowerPain.includes('lento') ||
        lowerPain.includes('bug') ||
        lowerPain.includes('deploy') ||
        lowerPain.includes('técnico')
      ) {
        scores.engineering += 15;
      }

      if (
        lowerPain.includes('caro') ||
        lowerPain.includes('desperdício') ||
        lowerPain.includes('budget')
      ) {
        scores.finance += 15;
      }

      if (
        lowerPain.includes('competidor') ||
        lowerPain.includes('atrasado') ||
        lowerPain.includes('perder')
      ) {
        scores.strategy += 15;
      }
    });

    // --- SIGNAL 5: Competitive Threats (Weight: 10 points) ---
    if (assessmentData.goals?.competitiveThreats) {
      scores.strategy += 10;
    }

    // --- SIGNAL 6: Availability Filter ---
    // Remove specialists not available for this persona
    const available = persona ? getAvailableSpecialists(persona) : ['engineering', 'finance', 'strategy'] as SpecialistType[];

    (['engineering', 'finance', 'strategy'] as SpecialistType[]).forEach(spec => {
      if (!available.includes(spec)) {
        scores[spec] = -999; // Impossible to select
      }
    });

    // --- SELECT WINNER ---
    let winner = (Object.keys(scores) as SpecialistType[]).reduce((best, current) =>
      scores[current] > scores[best] ? current : best
    );

    // Handle tie - prefer strategy (most universal)
    if (scores.strategy === scores[winner] && winner !== 'strategy' && scores.strategy > -999) {
      winner = 'strategy';
    }

    // Fallback if all scores are zero (use persona-based recommendation)
    if (Math.max(...Object.values(scores)) === 0 && recommendedSpecialist) {
      winner = recommendedSpecialist;
    }

    // --- DEBUG LOGGING ---
    console.log('🎯 [AutoRouting] Specialist Selection:', {
      persona,
      expertise,
      goals,
      painPoints,
      scores,
      winner,
      available
    });

    return winner;
  };

  // ✅ AUTO-START: Automatically select specialist and start consultation on mount
  useEffect(() => {
    // Only auto-start if we have assessment data and haven't started yet
    if (data && phase === 'specialist-selection' && !currentSpecialist) {
      console.log('🚀 [AutoRouting] Auto-starting consultation...');

      // Populate userExpertiseAreas from assessment data
      if (data.userExpertise && data.userExpertise.length > 0) {
        setUserExpertiseAreas(data.userExpertise);
      }

      // Automatically select specialist
      const selectedSpecialist = selectSpecialistAutomatically(data);

      // Set selected specialist and auto-start
      setSelectedSpecialists([selectedSpecialist]);
      setCurrentSpecialist(selectedSpecialist);

      // Start consultation immediately
      setTimeout(() => {
        startConsultationWithSpecialist(selectedSpecialist);
      }, 100);
    }
  }, [data, phase, currentSpecialist]);

  // Smart scroll - only scroll when NEW ASSISTANT message appears (new question)
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, []);

  // Scroll only when a new assistant message appears OR when streaming updates
  useEffect(() => {
    const currentMessageCount = messages.length;
    const lastMessage = messages[messages.length - 1];

    // Scroll if:
    // 1. New message from assistant
    // 2. OR streaming message is updating (for real-time streaming)
    if ((currentMessageCount > lastMessageCountRef.current && lastMessage?.role === 'assistant') || streamingMessage) {
      // Small delay to ensure DOM is updated
      setTimeout(scrollToBottom, 100);
    }

    lastMessageCountRef.current = currentMessageCount;
  }, [messages, streamingMessage, scrollToBottom]);

  // Update suggestions when last AI message changes (AI-powered)
  // Use a ref to track the last message we generated suggestions for to avoid loops
  const lastSuggestionMessageRef = useRef<string>('');

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];

    // Only generate suggestions for NEW assistant messages during consultation phase
    // ✅ FIX #2: Explicitly check phase is 'consultation' (not 'ready-to-finish')
    if (
      lastMessage &&
      lastMessage.role === 'assistant' &&
      currentSpecialist &&
      phase === 'consultation' && // ✅ This prevents suggestions after finish
      lastMessage.content !== lastSuggestionMessageRef.current // Prevent duplicate calls
    ) {
      // Mark this message as processed
      lastSuggestionMessageRef.current = lastMessage.content;

      // ✅ CLEAR old suggestions IMMEDIATELY to avoid showing wrong suggestions
      setSuggestions([]);

      // ✅ UX FIX: Don't show suggestions during wrap-up/conclusion or transitions
      const messageContentLower = lastMessage.content.toLowerCase();

      // Keywords that indicate wrap-up/conclusion (MORE SPECIFIC to avoid false positives)
      // ❌ REMOVED generic keywords that appear in normal follow-up questions:
      //    - 'algo mais a acrescentar' (appears in follow-ups)
      //    - 'mais alguma informação' (appears in follow-ups)
      //    - 'gostaria de compartilhar' (appears in follow-ups)
      const wrapUpKeywords = [
        'agradeço pelas respostas',
        'agradeço pela conversa',
        'obrigado pelas informações',
        'obrigado pela conversa',
        'foi um prazer conversar',
        'principais insights que descobri',
        'principais insights identificados',
        'em resumo, descobrimos',
        'em resumo, identificamos',
        'conclusão da consulta',
        'conclusão da nossa conversa',
        'finalizando nossa consulta',
        'finalizando a conversa',
        'encerrando a consulta',
        'encerrando nossa conversa',
        'análise está completa',
        'análise completa',
        'boa sorte com',
        'desejo sucesso'
      ];

      // Keywords that indicate transition between specialists
      const transitionKeywords = [
        'próximo especialista',
        'vamos para o próximo',
        'agora vamos para',
        'passando para'
      ];

      const matchedWrapUpKeyword = wrapUpKeywords.find(keyword => messageContentLower.includes(keyword));
      const matchedTransitionKeyword = transitionKeywords.find(keyword => messageContentLower.includes(keyword));

      if (matchedWrapUpKeyword) {
        console.log('🎯 [UX] Wrap-up detected - skipping suggestions (qualitative moment)');
        console.log('   Matched keyword:', matchedWrapUpKeyword);
        return; // No suggestions during wrap-up
      }

      if (matchedTransitionKeyword) {
        console.log('🎯 [UX] Transition detected - skipping suggestions (auto-continuing)');
        console.log('   Matched keyword:', matchedTransitionKeyword);
        return; // No suggestions during transitions
      }

      // ✅ Track current message to prevent race conditions
      const messageContent = lastMessage.content;
      activeMessageContentRef.current = messageContent;

      // Get previous answers for context
      const previousAnswers = messages
        .filter(m => m.role === 'user')
        .map(m => m.content)
        .slice(-3); // Last 3 answers

      // Generate AI-powered suggestions with specialist context (async, will take ~2s)
      generateAIPoweredSuggestions({
        question: lastMessage.content,
        context: `Consulta multi-especialista, pergunta ${questionCount + 1}`,
        previousAnswers,
        specialistType: currentSpecialist
      }).then(newSuggestions => {
        // ✅ Only update suggestions if this is still the active message
        if (activeMessageContentRef.current === messageContent) {
          setSuggestions(newSuggestions);
        } else {
          console.log('⚠️ [Consult] Ignoring stale suggestions for message:', messageContent.substring(0, 50));
        }
      });
    }
  }, [messages, currentSpecialist, phase, questionCount]);

  // ✅ Detect when specialist is wrapping up (concluding conversation)
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];

    if (
      lastMessage &&
      lastMessage.role === 'assistant' &&
      currentSpecialist &&
      phase === 'consultation' &&
      questionCount >= MIN_QUESTIONS_PER_SPECIALIST
    ) {
      // Keywords that indicate wrap-up/conclusion
      const wrapUpKeywords = [
        'agradeço',
        'obrigado',
        'foi um prazer',
        'principais insights',
        'resumo',
        'conclus',
        'finalizando',
        'encerr',
        'importante que você',
        'próximos passos',
        'boa sorte',
        'sucesso'
      ];

      const messageContent = lastMessage.content.toLowerCase();
      const isWrapUp = wrapUpKeywords.some(keyword => messageContent.includes(keyword));

      if (isWrapUp && !isWrappingUp) {
        console.log('🎯 [UX] Specialist is wrapping up - highlighting finish button');
        setIsWrappingUp(true);
      }
    } else if (isWrappingUp && phase !== 'consultation') {
      // Reset if phase changes
      setIsWrappingUp(false);
    }
  }, [messages, currentSpecialist, phase, questionCount, isWrappingUp]);

  // Start consultation with automatically selected specialist
  const startConsultationWithSpecialist = async (specialist: SpecialistType) => {
    if (!specialist) return;

    // Start consultation immediately with first question
    setPhase('consultation');
    setIsLoading(true);

    try {
      console.log('[Step5AIConsultMulti] Starting consultation with:', specialist);

      // Call API to get first question from specialist
      const response = await fetch('/api/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [], // Empty - start of conversation
          assessmentData: data,
          specialistType: specialist,
          userExpertiseAreas // ✅ Pass user's areas of knowledge
        }),
      });

      console.log('[Step5AIConsultMulti] Start consultation response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Step5AIConsultMulti] Start consultation error:', {
          status: response.status,
          body: errorText
        });
        throw new Error(`API error: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let firstQuestion = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6);
              if (dataStr === '[DONE]') break;

              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.text) {
                  firstQuestion += parsed.text;
                  // Update streaming message during reception
                  setStreamingMessage({
                    role: 'assistant',
                    content: firstQuestion,
                    specialist: specialist
                  });
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      }

      console.log('[Step5AIConsultMulti] First question received:', firstQuestion.substring(0, 100));

      const assistantMessage: Message = {
        role: 'assistant',
        content: firstQuestion || 'Olá! Vamos começar nossa consulta.',
        specialist: specialist
      };

      // Clear streaming message and add final message to array
      setStreamingMessage(null);
      setMessages([assistantMessage]);
    } catch (error) {
      console.error('Error starting consultation:', error);
      // Fallback message
      const fallbackMessage: Message = {
        role: 'assistant',
        content: `Ótimo! Vou consultar com nosso especialista.`,
        specialist: specialist
      };
      setMessages([fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Send message to current specialist
  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading || !currentSpecialist) return;

    const userMessage: Message = {
      role: 'user',
      content: textToSend
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Filter messages for current specialist only
      const specialistMessages = updatedMessages.filter(
        m => !m.specialist || m.specialist === currentSpecialist
      );

      console.log('[Step5AIConsultMulti] Calling /api/consult with:', {
        specialistType: currentSpecialist,
        messageCount: specialistMessages.length,
        assessmentDataPresent: !!data
      });

      const response = await fetch('/api/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: specialistMessages,
          assessmentData: data,
          specialistType: currentSpecialist, // Pass specialist type to API
          userExpertiseAreas // ✅ Pass user's areas of knowledge
        }),
      });

      console.log('[Step5AIConsultMulti] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Step5AIConsultMulti] API error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`API error: ${response.status}`);
      }

      // Handle streaming
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
              const dataStr = line.slice(6);
              if (dataStr === '[DONE]') break;

              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.text) {
                  assistantMessage += parsed.text;
                  // Update streaming message during reception (NOT messages array)
                  setStreamingMessage({
                    role: 'assistant',
                    content: assistantMessage,
                    specialist: currentSpecialist
                  });
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      }

      // Clear streaming and add final message to array
      setStreamingMessage(null);
      setMessages([
        ...updatedMessages,
        {
          role: 'assistant',
          content: assistantMessage,
          specialist: currentSpecialist
        }
      ]);

      setQuestionCount(prev => prev + 1);

      // Store specialist insights
      if (!specialistInsights[currentSpecialist]) {
        specialistInsights[currentSpecialist] = [];
      }
      specialistInsights[currentSpecialist].push(textToSend);

      // ✅ FIX #3: Removed automatic check-in after 5 questions
      // This was causing race condition with 2 sequential questions without waiting for user response
      // User can finish consultation using the "Finalizar Consulta" button that appears after MIN_QUESTIONS

    } catch (error) {
      console.error('Consultation error:', error);
      setMessages([
        ...updatedMessages,
        {
          role: 'assistant',
          content: 'Desculpe, ocorreu um erro. Tente novamente ou finalize a consulta.',
          specialist: currentSpecialist
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Finish consultation with current specialist
  const finishConsultation = async () => {
    if (!currentSpecialist) return;

    setIsLoading(true);

    // ✅ FIX #2: Clear suggestions immediately to prevent showing during wrap-up
    setSuggestions([]);
    activeMessageContentRef.current = null;

    try {
      // Request specialist to wrap up naturally
      const wrapUpResponse = await fetch('/api/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages.filter(m => !m.specialist || m.specialist === currentSpecialist),
            {
              role: 'user',
              content: '[SYSTEM: O usuário indicou que gostaria de finalizar a consulta. Faça um fechamento caloroso e profissional: agradeça pelas respostas, resuma os 2-3 principais insights descobertos, e informe que a análise está completa. Seja empático e positivo.]'
            }
          ],
          assessmentData: data,
          specialistType: currentSpecialist,
          userExpertiseAreas // ✅ Pass user's areas of knowledge
        }),
      });

      if (wrapUpResponse.ok) {
        const reader = wrapUpResponse.body?.getReader();
        const decoder = new TextDecoder();
        let wrapUpMessage = '';

        if (reader) {
          // ✅ FIX #1: Use streaming message state (NOT messages array) during streaming
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.slice(6);
                if (dataStr === '[DONE]') break;

                try {
                  const parsed = JSON.parse(dataStr);
                  if (parsed.text) {
                    wrapUpMessage += parsed.text;
                    // ✅ Update streaming message during reception (NOT messages array)
                    setStreamingMessage({
                      role: 'assistant',
                      content: wrapUpMessage,
                      specialist: currentSpecialist
                    });
                  }
                } catch (e) {
                  // Ignore
                }
              }
            }
          }
        }

        // ✅ Clear streaming and add final message ONCE to messages array
        setStreamingMessage(null);
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: wrapUpMessage,
            specialist: currentSpecialist
          }
        ]);
      }

      // ✅ Single specialist mode - go directly to ready-to-finish
      setCompletedSpecialists(prev => [...prev, currentSpecialist]);
      setPhase('ready-to-finish');
    } catch (error) {
      console.error('Error finishing consultation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate final report
  const handleGenerateReport = () => {
    // Aggregate insights from all specialists
    const allInsights = generateAggregatedInsightsSummary(specialistInsights);
    onComplete(allInsights);
  };

  return (
    <div className="min-h-screen bg-background-dark">
      {/* Header */}
      <div className="bg-tech-gray-900/50 border-b border-tech-gray-800 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-medium text-white">
              {phase === 'specialist-selection' && 'Preparando Consulta...'}
              {phase === 'consultation' && currentSpecialist && `Consulta com ${
                currentSpecialist === 'engineering' ? 'Dr. Tech (Engenharia)' :
                currentSpecialist === 'finance' ? 'Dr. ROI (Finanças)' :
                'Dr. Strategy (Estratégia)'
              }`}
              {phase === 'ready-to-finish' && 'Consulta Completa'}
            </h2>
            <p className="text-sm text-tech-gray-400 mt-1">
              {phase === 'specialist-selection' && 'Selecionando especialista ideal baseado no seu perfil'}
              {phase === 'consultation' && `${questionCount}/${MIN_QUESTIONS_PER_SPECIALIST}+ perguntas respondidas`}
              {phase === 'ready-to-finish' && 'Especialista consultado com sucesso'}
            </p>
          </div>
          <button onClick={onSkip} className="btn-ghost text-sm">
            Pular →
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* ✅ AUTOMATIC ROUTING: No manual selection - goes directly to consultation */}
        {phase === 'specialist-selection' && (
          <div className="card-dark p-6 min-h-[300px] flex flex-col items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-neon-cyan/20 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-neon-cyan animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold text-white">
                Selecionando Especialista Ideal...
              </h3>
              <p className="text-sm text-tech-gray-400 max-w-md">
                Analisando seu perfil, expertise e objetivos para direcionar você ao especialista mais adequado.
              </p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {/* PHASE 2: Consultation */}
        {(phase === 'consultation' || phase === 'ready-to-finish') && (
          <div className="card-dark p-6 min-h-[500px] flex flex-col">
            {/* Progress Bar */}
            {phase === 'consultation' && (
              <div className="mb-6 p-4 bg-tech-gray-900/50 border border-tech-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-tech-gray-300">
                    {currentSpecialist === 'engineering' && '🔧 Dr. Tech - Especialista em Engenharia'}
                    {currentSpecialist === 'finance' && '💰 Dr. ROI - Especialista em Finanças'}
                    {currentSpecialist === 'strategy' && '🎯 Dr. Strategy - Especialista em Estratégia'}
                  </span>
                  <span className="text-xs text-tech-gray-400">
                    {questionCount}/{MIN_QUESTIONS_PER_SPECIALIST}+ perguntas
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-2 rounded-full bg-tech-gray-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-neon-cyan to-neon-green transition-all duration-500"
                    style={{ width: `${Math.min((questionCount / MIN_QUESTIONS_PER_SPECIALIST) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-6">
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
                    {msg.role === 'assistant' && msg.specialist && (
                      <SpecialistIndicator specialistType={msg.specialist} />
                    )}
                    <div className="whitespace-pre-wrap leading-relaxed text-sm">
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}

              {/* Streaming message (shown while receiving) */}
              {streamingMessage && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-lg px-4 py-3 bg-tech-gray-800/50 border border-tech-gray-700 text-tech-gray-200">
                    {streamingMessage.specialist && (
                      <SpecialistIndicator specialistType={streamingMessage.specialist} />
                    )}
                    <div className="whitespace-pre-wrap leading-relaxed text-sm">
                      {streamingMessage.content}
                      <span className="inline-block w-2 h-4 ml-1 bg-neon-cyan animate-pulse" />
                    </div>
                  </div>
                </div>
              )}

              {isLoading && !streamingMessage && (
                <div className="flex justify-start">
                  <div className="bg-tech-gray-800/50 border border-tech-gray-700 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2 text-tech-gray-400">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-sm">Analisando...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Finish Option */}
            {phase === 'ready-to-finish' && (
              <div className="mb-6 p-6 bg-gradient-to-br from-neon-green/10 to-neon-cyan/10 border border-neon-green/30 rounded-xl">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-neon-green/20 rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6 text-neon-green" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neon-green mb-2">
                      Consulta com Especialista Completa!
                    </h4>
                    <p className="text-sm text-tech-gray-300 mb-3">
                      Você consultou com{' '}
                      <strong>
                        {currentSpecialist === 'engineering' && 'Dr. Tech (Engenharia)'}
                        {currentSpecialist === 'finance' && 'Dr. ROI (Finanças)'}
                        {currentSpecialist === 'strategy' && 'Dr. Strategy (Estratégia)'}
                      </strong>.
                      Os insights serão incluídos no relatório final.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleGenerateReport}
                  className="w-full px-4 py-3 bg-gradient-to-r from-neon-green to-neon-cyan text-background-dark font-semibold rounded-lg hover:shadow-neon-green transition-all flex items-center justify-center gap-2"
                >
                  Gerar Relatório Completo
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Input */}
            {phase === 'consultation' && (
              <div className="space-y-3">
                {/* Suggested Responses */}
                <AISuggestedResponses
                  suggestions={suggestions}
                  onSelect={(text) => {
                    setInput(text);
                    // Auto-send after brief delay
                    setTimeout(() => {
                      sendMessage(text);
                    }, 100);
                  }}
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
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || isLoading}
                    className="btn-primary px-6"
                  >
                    Enviar
                  </button>
                </div>

                {/* Finish button - visible after MIN_QUESTIONS */}
                {questionCount >= MIN_QUESTIONS_PER_SPECIALIST && (
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <div className="flex-1 h-px bg-tech-gray-800"></div>
                    <button
                      onClick={finishConsultation}
                      disabled={isLoading}
                      className={`text-sm px-4 py-2 flex items-center gap-2 disabled:opacity-50 rounded-lg font-medium transition-all ${
                        isWrappingUp
                          ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black hover:from-yellow-400 hover:to-amber-400 shadow-lg shadow-yellow-500/50 animate-pulse-glow'
                          : 'btn-secondary'
                      }`}
                      title={isWrappingUp ? "✨ O especialista está finalizando - clique aqui para concluir!" : "Finalizar consulta com este especialista"}
                    >
                      <Check className={`w-4 h-4 ${isWrappingUp ? 'animate-bounce' : ''}`} />
                      {isWrappingUp ? '✨ Clique Para Concluir' : 'Finalizar Consulta'}
                    </button>
                    <div className="flex-1 h-px bg-tech-gray-800"></div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
