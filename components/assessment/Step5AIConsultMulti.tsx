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

  // Toggle specialist selection
  const toggleSpecialist = (specialist: SpecialistType) => {
    setSelectedSpecialists(prev =>
      prev.includes(specialist)
        ? prev.filter(s => s !== specialist)
        : [...prev, specialist]
    );
  };

  // Start consultation with selected specialists
  const startConsultation = async () => {
    if (selectedSpecialists.length === 0) return;

    const firstSpecialist = selectedSpecialists[0];
    setCurrentSpecialist(firstSpecialist);

    // Start consultation immediately with first question
    setPhase('consultation');
    setIsLoading(true);

    try {
      console.log('[Step5AIConsultMulti] Starting consultation with:', firstSpecialist);

      // Call API to get first question from specialist
      const response = await fetch('/api/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [], // Empty - start of conversation
          assessmentData: data,
          specialistType: firstSpecialist,
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
                    specialist: firstSpecialist
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
        specialist: firstSpecialist
      };

      // Clear streaming message and add final message to array
      setStreamingMessage(null);
      setMessages([assistantMessage]);
    } catch (error) {
      console.error('Error starting consultation:', error);
      // Fallback message
      const fallbackMessage: Message = {
        role: 'assistant',
        content: selectedSpecialists.length === 1
          ? `Ótimo! Vou consultar com nosso especialista.`
          : `Perfeito! Vou consultar com ${selectedSpecialists.length} especialistas diferentes.`,
        specialist: firstSpecialist
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

      // Check if there are more specialists
      const currentIndex = selectedSpecialists.indexOf(currentSpecialist);
      if (currentIndex < selectedSpecialists.length - 1) {
        // Move to next specialist
        const nextSpecialist = selectedSpecialists[currentIndex + 1];
        setCompletedSpecialists(prev => [...prev, currentSpecialist]);
        setCurrentSpecialist(nextSpecialist);
        setQuestionCount(0);

        // Add transition message
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              content: `Perfeito! Agora vamos para o próximo especialista.`,
              specialist: currentSpecialist
            }
          ]);

          // ✅ UX FIX: Auto-transition to next specialist after 3 seconds
          console.log('⏱️ [UX] Auto-transition in 3 seconds...');
          setTimeout(async () => {
            console.log('🚀 [UX] Auto-starting next specialist:', nextSpecialist);

            try {
              setIsLoading(true);

              // Call API to get first question from next specialist
              const response = await fetch('/api/consult', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  messages: [], // Empty - start of new specialist conversation
                  assessmentData: data,
                  specialistType: nextSpecialist,
                  userExpertiseAreas // ✅ Pass user's areas of knowledge
                }),
              });

              if (!response.ok) {
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
                            specialist: nextSpecialist
                          });
                        }
                      } catch (e) {
                        // Ignore parse errors
                      }
                    }
                  }
                }
              }

              // Clear streaming and add first question to messages
              setStreamingMessage(null);
              setMessages(prev => [
                ...prev,
                {
                  role: 'assistant',
                  content: firstQuestion || 'Olá! Vamos começar nossa consulta.',
                  specialist: nextSpecialist
                }
              ]);
            } catch (error) {
              console.error('❌ [UX] Auto-transition error:', error);
              // Fallback: just show a generic greeting
              setMessages(prev => [
                ...prev,
                {
                  role: 'assistant',
                  content: 'Olá! Vamos começar nossa consulta.',
                  specialist: nextSpecialist
                }
              ]);
            } finally {
              setIsLoading(false);
            }
          }, 3000); // Wait 3 seconds before auto-starting next specialist
        }, 500);
      } else {
        // ✅ FIX #2: Change phase to ready-to-finish BEFORE adding message (prevents suggestion generation)
        setCompletedSpecialists(prev => [...prev, currentSpecialist]);
        setPhase('ready-to-finish');
      }
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
              {phase === 'specialist-selection' && 'Escolha Seus Especialistas'}
              {phase === 'consultation' && `Consulta com Especialistas (${completedSpecialists.length + 1}/${selectedSpecialists.length})`}
              {phase === 'ready-to-finish' && 'Consulta Completa'}
            </h2>
            <p className="text-sm text-tech-gray-400 mt-1">
              {phase === 'specialist-selection' && 'Múltiplas perspectivas para análise mais completa'}
              {phase === 'consultation' && `${questionCount}/${MIN_QUESTIONS_PER_SPECIALIST}+ perguntas com ${currentSpecialist}`}
              {phase === 'ready-to-finish' && `${selectedSpecialists.length} especialista${selectedSpecialists.length > 1 ? 's' : ''} consultado${selectedSpecialists.length > 1 ? 's' : ''}`}
            </p>
          </div>
          <button onClick={onSkip} className="btn-ghost text-sm">
            Pular →
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* PHASE 1: Specialist Selection */}
        {phase === 'specialist-selection' && (
          <div className="space-y-6 animate-slide-up">
            {/* ✅ NEW: User Expertise Areas Selection */}
            <div className="card-dark p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-neon-blue/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-6 h-6 text-neon-blue" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Suas Áreas de Conhecimento
                  </h3>
                  <p className="text-sm text-tech-gray-400 leading-relaxed">
                    Para adaptar as perguntas ao seu perfil, indique em quais áreas você tem conhecimento:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { id: 'strategy-business', label: 'Estratégia e Negócios', description: 'Visão de mercado, competitividade' },
                  { id: 'engineering-tech', label: 'Tecnologia e Engenharia', description: 'Arquitetura, DevOps, desenvolvimento' },
                  { id: 'product-ux', label: 'Produto e UX', description: 'Experiência do usuário, roadmap' },
                  { id: 'finance-ops', label: 'Finanças e Operações', description: 'ROI, custos, orçamento' },
                  { id: 'marketing-sales', label: 'Marketing e Vendas', description: 'Go-to-market, crescimento' },
                  { id: 'people-hr', label: 'Recursos Humanos', description: 'Cultura, talentos, engajamento' },
                ].map((area) => (
                  <label
                    key={area.id}
                    className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      userExpertiseAreas.includes(area.id)
                        ? 'border-neon-blue bg-neon-blue/10'
                        : 'border-tech-gray-800 hover:border-tech-gray-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={userExpertiseAreas.includes(area.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setUserExpertiseAreas(prev => [...prev, area.id]);
                        } else {
                          setUserExpertiseAreas(prev => prev.filter(a => a !== area.id));
                        }
                      }}
                      className="mt-1 w-4 h-4 accent-neon-blue"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{area.label}</div>
                      <div className="text-xs text-tech-gray-400 mt-1">{area.description}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-4 p-3 bg-tech-gray-900/50 border border-tech-gray-800 rounded-lg">
                <p className="text-xs text-tech-gray-400">
                  💡 <strong className="text-white">Por que isso importa:</strong> Os especialistas adaptarão as perguntas baseado no seu conhecimento.
                  Se você não tiver conhecimento técnico, receberá perguntas mais estratégicas e terá mais opções "não sei" disponíveis.
                </p>
              </div>
            </div>

            <div className="card-dark p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-neon-purple/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-neon-purple" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Consultoria Multi-Especialista
                  </h3>
                  <p className="text-sm text-tech-gray-400 leading-relaxed">
                    Inspirado em equipes médicas multidisciplinares, oferecemos diferentes especialistas AI para analisar seu caso de múltiplos ângulos.
                    <strong className="text-white"> Escolha um ou mais:</strong>
                  </p>
                </div>
              </div>

              <SpecialistSelector
                selectedSpecialists={selectedSpecialists}
                onToggle={toggleSpecialist}
                recommendedSpecialist={recommendedSpecialist}
                mode="multiple"
              />

              <div className="mt-6 flex gap-3">
                <button
                  onClick={startConsultation}
                  disabled={selectedSpecialists.length === 0}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Começar Consulta
                  {selectedSpecialists.length > 0 && ` (${selectedSpecialists.length} ${selectedSpecialists.length === 1 ? 'especialista' : 'especialistas'})`}
                </button>
                {recommendedSpecialist && !selectedSpecialists.includes(recommendedSpecialist) && (
                  <button
                    onClick={() => {
                      setSelectedSpecialists([recommendedSpecialist]);
                      setTimeout(startConsultation, 100);
                    }}
                    className="btn-secondary"
                  >
                    Usar Recomendado
                  </button>
                )}
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
                    Progresso: Especialista {completedSpecialists.length + 1}/{selectedSpecialists.length}
                  </span>
                  <span className="text-xs text-tech-gray-400">
                    {questionCount}/{MIN_QUESTIONS_PER_SPECIALIST}+ perguntas
                  </span>
                </div>

                {/* Specialists Progress */}
                <div className="flex gap-2">
                  {selectedSpecialists.map((spec, idx) => (
                    <div
                      key={spec}
                      className={`flex-1 h-2 rounded-full ${
                        completedSpecialists.includes(spec)
                          ? 'bg-neon-green'
                          : spec === currentSpecialist
                          ? 'bg-neon-cyan'
                          : 'bg-tech-gray-800'
                      }`}
                    />
                  ))}
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
                      Consulta Multi-Especialista Completa!
                    </h4>
                    <p className="text-sm text-tech-gray-300 mb-3">
                      Você consultou com <strong>{selectedSpecialists.length}</strong> especialista{selectedSpecialists.length > 1 ? 's' : ''}.
                      Seus insights serão agregados no relatório final.
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {completedSpecialists.map(spec => (
                        <span
                          key={spec}
                          className="text-xs px-2 py-1 rounded-full bg-neon-green/20 text-neon-green border border-neon-green/30 flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          {spec}
                        </span>
                      ))}
                    </div>
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
