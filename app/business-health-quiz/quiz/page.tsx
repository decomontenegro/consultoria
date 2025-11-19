'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AREA_METADATA } from '@/lib/business-quiz/area-relationships';
import type { BusinessArea, QuestionBlock } from '@/lib/business-quiz/types';

function QuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');

  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [answer, setAnswer] = useState('');
  const [progress, setProgress] = useState({
    currentBlock: 'context' as QuestionBlock,
    questionIndex: 1,
    totalInBlock: 7,
    overallProgress: 5,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [blockTransition, setBlockTransition] = useState<{
    from: QuestionBlock;
    to: QuestionBlock;
    message: string;
  } | null>(null);
  const [expertiseDetected, setExpertiseDetected] = useState<{
    area: BusinessArea;
    confidence: number;
    reasoning: string;
  } | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // Load initial question
  useEffect(() => {
    if (sessionId) {
      loadSession();
    }
  }, [sessionId]);

  const loadSession = async () => {
    try {
      const response = await fetch(`/api/business-quiz/session/${sessionId}`);
      const data = await response.json();

      if (data.success) {
        setCurrentQuestion(data.currentQuestion);
        setProgress(data.progress);
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!answer.trim() || !currentQuestion) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/business-quiz/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionId: currentQuestion.id,
          answer: answer.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Clear answer for next question
        setAnswer('');

        // Check if completed
        if (data.completed) {
          setIsCompleted(true);
          // Generate diagnostic
          await completeDiagnostic();
          return;
        }

        // Handle block transition
        if (data.blockTransition) {
          setBlockTransition(data.blockTransition);
          setTimeout(() => {
            setBlockTransition(null);
            setCurrentQuestion(data.nextQuestion);
            setProgress(data.progress);
          }, 3000);
        } else {
          setCurrentQuestion(data.nextQuestion);
          setProgress(data.progress);
        }

        // Handle expertise detection
        if (data.expertiseDetected) {
          setExpertiseDetected(data.expertiseDetected);
          setTimeout(() => setExpertiseDetected(null), 5000);
        }
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeDiagnostic = async () => {
    try {
      const response = await fetch('/api/business-quiz/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();

      if (data.success) {
        // Save diagnostic to localStorage
        localStorage.setItem(`diagnostic-${data.diagnosticId}`, JSON.stringify(data.diagnostic));

        // Redirect to results
        router.push(`/business-health-quiz/results/${data.diagnosticId}`);
      } else {
        // Show error to user
        console.error('Diagnostic generation failed:', data);
        alert(`Erro ao gerar diagnóstico: ${data.error || 'Erro desconhecido'}. Por favor, tente novamente.`);
        setIsCompleted(false);
      }
    } catch (error) {
      console.error('Failed to complete diagnostic:', error);
      alert('Erro de conexão ao gerar diagnóstico. Por favor, verifique sua internet e tente novamente.');
      setIsCompleted(false);
    }
  };

  const getBlockIcon = (block: QuestionBlock) => {
    switch (block) {
      case 'context':
        return '🏢';
      case 'expertise':
        return '🎯';
      case 'deep-dive':
        return '🔍';
      case 'risk-scan':
        return '⚠️';
    }
  };

  const getBlockName = (block: QuestionBlock) => {
    switch (block) {
      case 'context':
        return 'Contexto';
      case 'expertise':
        return 'Expertise';
      case 'deep-dive':
        return 'Deep-Dive';
      case 'risk-scan':
        return 'Risk Scan';
    }
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sessão não encontrada</h2>
          <button
            onClick={() => router.push('/business-health-quiz')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Quiz Completo!</h2>
          <p className="text-gray-600 mb-6">
            Estamos gerando seu diagnóstico personalizado com Claude AI...
          </p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  // Block transition screen
  if (blockTransition) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center max-w-2xl px-6">
          <div className="mb-6 flex justify-center gap-4">
            <div className="text-6xl animate-bounce">{getBlockIcon(blockTransition.from)}</div>
            <div className="text-6xl text-gray-300">→</div>
            <div className="text-6xl animate-bounce animation-delay-200">
              {getBlockIcon(blockTransition.to)}
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {getBlockName(blockTransition.from)} → {getBlockName(blockTransition.to)}
          </h2>

          <p className="text-xl text-gray-600 whitespace-pre-line">{blockTransition.message}</p>

          {expertiseDetected && (
            <div className="mt-8 bg-white rounded-xl p-6 shadow-lg border-2 border-green-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl">{AREA_METADATA[expertiseDetected.area].icon}</div>
                <div className="text-left">
                  <div className="font-bold text-gray-900">
                    {AREA_METADATA[expertiseDetected.area].name}
                  </div>
                  <div className="text-sm text-gray-600">
                    Confiança: {Math.round(expertiseDetected.confidence * 100)}%
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 text-left">{expertiseDetected.reasoning}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getBlockIcon(progress.currentBlock)}</span>
              <div>
                <div className="font-semibold text-gray-900">
                  {getBlockName(progress.currentBlock)}
                </div>
                <div className="text-sm text-gray-600">
                  Pergunta {progress.questionIndex} de {progress.totalInBlock}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{progress.overallProgress}%</div>
              <div className="text-xs text-gray-500">Progresso geral</div>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress.overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Form */}
      <div className="pt-32 pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          {currentQuestion && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentQuestion.questionText}
                </h2>

                {currentQuestion.helpText && (
                  <p className="text-sm text-gray-600 mb-6">{currentQuestion.helpText}</p>
                )}

                {currentQuestion.inputType === 'text' && (
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder={currentQuestion.placeholder}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                    autoFocus
                  />
                )}

                {currentQuestion.inputType === 'textarea' && (
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder={currentQuestion.placeholder}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none text-gray-900 placeholder:text-gray-400"
                    autoFocus
                  />
                )}

                {currentQuestion.inputType === 'single-choice' && currentQuestion.options && (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option: string) => (
                      <label
                        key={option}
                        className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          answer === option
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="answer"
                          value={option}
                          checked={answer === option}
                          onChange={(e) => setAnswer(e.target.value)}
                          className="w-5 h-5 text-blue-600"
                        />
                        <span className="text-gray-900">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!answer.trim() || isSubmitting}
                  className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Processando...' : 'Próxima →'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QuizContent />
    </Suspense>
  );
}
