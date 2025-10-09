'use client';

import { useState, useEffect, useRef } from 'react';
import { AssessmentData } from '@/lib/types';
import { getConsultationIntro } from '@/lib/prompts/consultation-prompt';
import { generateSuggestedTopics, generateTopicContext, SuggestedTopic } from '@/lib/prompts/topic-generator';
import { Check, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Step5AIConsultProps {
  data: Partial<AssessmentData>;
  onSkip: () => void;
  onComplete: (insights: string[]) => void;
}

type Phase = 'topic-selection' | 'conversation' | 'ready-to-finish';

export default function Step5AIConsult({ data, onSkip, onComplete }: Step5AIConsultProps) {
  const [phase, setPhase] = useState<Phase>('topic-selection');
  const [suggestedTopics, setSuggestedTopics] = useState<SuggestedTopic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const MIN_QUESTIONS_BEFORE_EXIT = 3; // Minimum questions before showing "Generate Report" option

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize suggested topics
  useEffect(() => {
    if (data.companyInfo && data.currentState && data.goals) {
      const topics = generateSuggestedTopics(data as AssessmentData);
      setSuggestedTopics(topics);
      // Auto-select high priority topics
      setSelectedTopics(topics.filter(t => t.priority === 'high').map(t => t.id));
    }
  }, [data]);

  // Toggle topic selection
  const toggleTopic = (topicId: string) => {
    setSelectedTopics(prev =>
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  // Start conversation
  const startConversation = () => {
    const intro = getConsultationIntro(data as AssessmentData);
    const topicContext = generateTopicContext(selectedTopics, suggestedTopics);

    // Add intro message
    setMessages([
      {
        role: 'assistant',
        content: `${intro}\n\n${selectedTopics.length > 0 ? `📋 **Tópicos selecionados:**\n${suggestedTopics.filter(t => selectedTopics.includes(t.id)).map(t => `• ${t.label}`).join('\n')}` : ''}\n\nVamos começar?`
      }
    ]);
    setPhase('conversation');
  };

  // Send message to API
  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = { role: 'user', content: textToSend };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Add topic context to first message for Claude
      const contextualData = {
        ...data,
        _topicContext: generateTopicContext(selectedTopics, suggestedTopics),
        _conversationPhase: questionCount < MIN_QUESTIONS_BEFORE_EXIT ? 'required-questions' : 'optional-questions',
      };

      const response = await fetch('/api/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          assessmentData: contextualData,
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

      // After minimum questions, allow user to finish
      if (questionCount + 1 >= MIN_QUESTIONS_BEFORE_EXIT) {
        setPhase('ready-to-finish');
      }

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

  // Ask for continuation or finish
  const askToContinue = () => {
    const continueMessage: Message = {
      role: 'assistant',
      content: `Obrigado pelas respostas até aqui! Já coletei informações valiosas.\n\n**Gostaria de explorar mais algum tópico ou prefere gerar o relatório agora?**`,
    };
    setMessages(prev => [...prev, continueMessage]);
  };

  return (
    <div className="min-h-screen bg-background-dark">
      {/* Header */}
      <div className="bg-tech-gray-900/50 border-b border-tech-gray-800 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-medium text-white">
              {phase === 'topic-selection' ? 'Selecione os Tópicos' : 'Consulta AI - Aprofundamento'}
            </h2>
            <p className="text-sm text-tech-gray-400 mt-1">
              {phase === 'topic-selection'
                ? 'Escolha o que deseja aprofundar (opcional)'
                : `${questionCount} ${questionCount === 1 ? 'pergunta respondida' : 'perguntas respondidas'} • Flexível`
              }
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

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* PHASE 1: Topic Selection */}
        {phase === 'topic-selection' && (
          <div className="space-y-6 animate-slide-up">
            <div className="card-dark p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-neon-purple/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-neon-purple" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Personalize sua consulta
                  </h3>
                  <p className="text-tech-gray-400 text-sm leading-relaxed">
                    Com base no seu assessment, identifiquei alguns tópicos que podem ser aprofundados.
                    Marque os que você considera mais importantes ou deixe nossoClaude decidir.
                  </p>
                </div>
              </div>

              {/* Topic List */}
              <div className="space-y-3">
                {suggestedTopics.map((topic) => (
                  <label
                    key={topic.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedTopics.includes(topic.id)
                        ? 'border-neon-green bg-neon-green/5'
                        : 'border-tech-gray-800 hover:border-tech-gray-700 bg-tech-gray-900/30'
                    }`}
                  >
                    <div className="flex items-center h-6">
                      <input
                        type="checkbox"
                        checked={selectedTopics.includes(topic.id)}
                        onChange={() => toggleTopic(topic.id)}
                        className="w-5 h-5 rounded border-2 border-tech-gray-700 bg-tech-gray-900 text-neon-green focus:ring-2 focus:ring-neon-green focus:ring-offset-0"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium">{topic.label}</span>
                        {topic.priority === 'high' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-neon-green/20 text-neon-green border border-neon-green/30">
                            Alta prioridade
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-tech-gray-400">{topic.reason}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={startConversation}
                  className="btn-primary flex-1"
                  disabled={selectedTopics.length === 0}
                >
                  Começar Conversa
                  {selectedTopics.length > 0 && ` (${selectedTopics.length} ${selectedTopics.length === 1 ? 'tópico' : 'tópicos'})`}
                </button>
                <button
                  onClick={() => {
                    // Select all topics and start
                    setSelectedTopics(suggestedTopics.map(t => t.id));
                    setTimeout(startConversation, 100);
                  }}
                  className="btn-secondary"
                >
                  Deixar consultor decidir
                </button>
              </div>
            </div>

            <p className="text-center text-sm text-tech-gray-500">
              💡 Você pode mudar de ideia durante a conversa - pergunte o que quiser
            </p>
          </div>
        )}

        {/* PHASE 2 & 3: Conversation */}
        {(phase === 'conversation' || phase === 'ready-to-finish') && (
          <div className="card-dark p-6 min-h-[500px] flex flex-col">

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
                    <div className="text-xs font-medium mb-1 opacity-60">
                      {msg.role === 'user' ? 'Você' : 'Consultor CulturaBuilder'}
                    </div>
                    <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
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
            <div className="border-t border-tech-gray-800 pt-4 space-y-3">

              {/* Show "Generate Report" option after minimum questions */}
              {phase === 'ready-to-finish' && (
                <div className="bg-neon-green/10 border border-neon-green/30 rounded-lg p-4">
                  <p className="text-sm text-tech-gray-300 mb-3">
                    ✨ Já coletei informações valiosas! Você pode:
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleGenerateReport}
                      className="btn-primary flex-1"
                    >
                      Gerar Relatório Agora
                    </button>
                    <button
                      onClick={() => setPhase('conversation')}
                      className="btn-secondary flex-1"
                    >
                      Continuar Conversando
                    </button>
                  </div>
                </div>
              )}

              {/* Chat Input - always visible */}
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Digite sua resposta ou pergunta..."
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
            </div>
          </div>
        )}

        {/* Progress Info */}
        <div className="mt-6 text-center text-tech-gray-500 text-sm">
          {phase === 'conversation' && questionCount < MIN_QUESTIONS_BEFORE_EXIT && (
            <p>Ainda {MIN_QUESTIONS_BEFORE_EXIT - questionCount} {MIN_QUESTIONS_BEFORE_EXIT - questionCount === 1 ? 'pergunta' : 'perguntas'} para insights mais profundos</p>
          )}
          {phase === 'ready-to-finish' && (
            <p>Você pode continuar conversando ou gerar o relatório quando quiser</p>
          )}
        </div>
      </div>
    </div>
  );
}
