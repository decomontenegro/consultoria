'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AssessmentData } from '@/lib/types';
import { getConsultationIntro } from '@/lib/prompts/consultation-prompt';
import { generateSuggestedTopics, generateTopicContext, SuggestedTopic } from '@/lib/prompts/topic-generator';
import { Check, Sparkles, Lightbulb } from 'lucide-react';

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
  const [discussedTopics, setDiscussedTopics] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageCountRef = useRef<number>(0);

  const MIN_QUESTIONS_BEFORE_EXIT = 3; // Minimum questions before showing "Generate Report" option

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

  // Detect topics from conversation
  const detectTopicFromConversation = (userMessage: string, aiResponse: string) => {
    const topicKeywords = {
      'quality-impact': ['qualidade', 'bugs', 'problemas', 'defeitos', 'erros', 'falhas'],
      'speed-innovation': ['velocidade', 'lento', 'rápido', 'time-to-market', 'agilidade', 'entrega', 'deploy'],
      'ai-barriers': ['AI', 'inteligência artificial', 'automação', 'ferramentas', 'adoção', 'copilot'],
      'roi-expectations': ['ROI', 'retorno', 'investimento', 'custo', 'benefício', 'orçamento', 'valor'],
      'team-capacity': ['time', 'equipe', 'capacidade', 'produtividade', 'pessoas', 'desenvolvedores'],
      'strategic-risks': ['risco', 'competitivo', 'mercado', 'concorrentes', 'estratégia', 'competição'],
    };

    const topicLabels: Record<string, string> = {
      'quality-impact': 'Impacto de Problemas de Qualidade',
      'speed-innovation': 'Velocidade de Inovação',
      'ai-barriers': 'Barreiras para Adoção de AI',
      'roi-expectations': 'ROI e Investimento',
      'team-capacity': 'Capacidade do Time',
      'strategic-risks': 'Riscos Estratégicos',
    };

    const conversationText = (userMessage + ' ' + aiResponse).toLowerCase();

    Object.entries(topicKeywords).forEach(([topicId, keywords]) => {
      const matched = keywords.some(keyword => conversationText.includes(keyword.toLowerCase()));

      if (matched && !discussedTopics.includes(topicLabels[topicId])) {
        setDiscussedTopics(prev => [...prev, topicLabels[topicId]]);
      }
    });
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

      // Detect topics from conversation
      if (assistantMessage) {
        detectTopicFromConversation(textToSend, assistantMessage);
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

            <p className="text-center text-sm text-tech-gray-500 flex items-center justify-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Você pode mudar de ideia durante a conversa - pergunte o que quiser
            </p>
          </div>
        )}

        {/* PHASE 2 & 3: Conversation */}
        {(phase === 'conversation' || phase === 'ready-to-finish') && (
          <div className="card-dark p-6 min-h-[500px] flex flex-col">

            {/* Progress Indicator */}
            {phase === 'conversation' && (
              <div className="mb-6 p-4 bg-tech-gray-900/50 border border-tech-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-tech-gray-300">
                    Progresso da Consulta
                  </span>
                  <span className="text-xs text-tech-gray-400">
                    {messages.filter(m => m.role === 'user').length}/3+ perguntas respondidas
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-tech-gray-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-neon-green to-neon-cyan h-2.5 rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.min((messages.filter(m => m.role === 'user').length / 3) * 100, 100)}%`
                    }}
                  />
                </div>

                {messages.filter(m => m.role === 'user').length >= 3 && (
                  <p className="mt-3 text-xs text-neon-green flex items-center gap-1">
                    <span className="inline-block w-2 h-2 bg-neon-green rounded-full animate-pulse"></span>
                    Você já pode finalizar a consulta quando quiser
                  </p>
                )}
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
                <div className="mb-6 p-6 bg-gradient-to-br from-neon-cyan/10 to-neon-green/10 border border-neon-cyan/30 rounded-xl">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-neon-cyan/20 rounded-full flex items-center justify-center">
                      <Check className="w-6 h-6 text-neon-cyan" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-neon-cyan mb-2">
                        Ótimo progresso! Já coletei informações valiosas.
                      </h4>
                      <p className="text-sm text-tech-gray-300">
                        Você já respondeu {messages.filter(m => m.role === 'user').length} perguntas e
                        exploramos {discussedTopics.length} tópico{discussedTopics.length !== 1 ? 's' : ''} importantes.
                      </p>
                    </div>
                  </div>

                  {/* Topics Discussed */}
                  {discussedTopics.length > 0 && (
                    <div className="mb-4 p-3 bg-tech-gray-900/50 rounded-lg">
                      <h5 className="text-xs font-semibold text-tech-gray-400 mb-2 uppercase tracking-wide">
                        Tópicos Discutidos:
                      </h5>
                      <ul className="space-y-1.5">
                        {discussedTopics.map((topic, idx) => (
                          <li key={idx} className="text-sm text-tech-gray-200 flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-neon-green flex-shrink-0" />
                            {topic}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={handleGenerateReport}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-neon-green to-neon-cyan text-background-dark font-semibold rounded-lg hover:shadow-neon-green transition-all"
                    >
                      Gerar Relatório Agora
                    </button>
                    <button
                      onClick={() => setPhase('conversation')}
                      className="px-4 py-3 border-2 border-neon-cyan/30 text-neon-cyan font-semibold rounded-lg hover:bg-neon-cyan/10 transition-all"
                    >
                      Continuar Conversando
                    </button>
                  </div>

                  <p className="mt-3 text-xs text-center text-tech-gray-500">
                    Você pode explorar outros tópicos ou finalizar aqui. Você está no controle.
                  </p>
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
