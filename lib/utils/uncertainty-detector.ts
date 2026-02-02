/**
 * Uncertainty Detector
 *
 * Detects when users express uncertainty or lack of knowledge in their answers.
 * Used to identify potential persona mismatches (e.g., business user getting technical questions).
 */

export interface UncertaintySignals {
  hasUncertainty: boolean;
  confidence: number; // 0-1, how confident we are that user doesn't know
  detectedPhrases: string[];
  category: 'explicit' | 'vague' | 'deflection' | 'none';
}

/**
 * Phrases that explicitly indicate lack of knowledge
 */
const EXPLICIT_UNCERTAINTY_PHRASES = [
  'não sei',
  'nao sei',
  'não tenho informações',
  'nao tenho informacoes',
  'não tenho informação',
  'nao tenho informacao',
  'não conheço',
  'nao conheco',
  'não tenho acesso',
  'nao tenho acesso',
  'não tenho visibilidade',
  'nao tenho visibilidade',
  'sem visibilidade',
  'não faço ideia',
  'nao faco ideia',
  'desconheço',
  'desconheco',
  'não saberia dizer',
  'nao saberia dizer',
  'não posso afirmar',
  'nao posso afirmar'
];

/**
 * Phrases that indicate vagueness or uncertainty
 */
const VAGUE_PHRASES = [
  'mais ou menos',
  'talvez',
  'acho que',
  'creio que',
  'difícil dizer',
  'dificil dizer',
  'não tenho certeza',
  'nao tenho certeza',
  'depende',
  'varia',
  'complicado',
  'complexo de responder'
];

/**
 * Deflection phrases (answering without answering)
 */
const DEFLECTION_PHRASES = [
  'não é minha área',
  'nao e minha area',
  'isso é com',
  'isso e com',
  'pergunta para',
  'pergunta pro',
  'o time que',
  'outro setor',
  'outra pessoa'
];

/**
 * Detects uncertainty signals in a text answer
 */
export function detectUncertainty(answer: string): UncertaintySignals {
  if (!answer || typeof answer !== 'string') {
    return {
      hasUncertainty: false,
      confidence: 0,
      detectedPhrases: [],
      category: 'none'
    };
  }

  const lowerAnswer = answer.toLowerCase().trim();

  // Check for explicit uncertainty
  const explicitMatches = EXPLICIT_UNCERTAINTY_PHRASES.filter(phrase =>
    lowerAnswer.includes(phrase)
  );

  if (explicitMatches.length > 0) {
    return {
      hasUncertainty: true,
      confidence: 0.95,
      detectedPhrases: explicitMatches,
      category: 'explicit'
    };
  }

  // Check for deflection
  const deflectionMatches = DEFLECTION_PHRASES.filter(phrase =>
    lowerAnswer.includes(phrase)
  );

  if (deflectionMatches.length > 0) {
    return {
      hasUncertainty: true,
      confidence: 0.85,
      detectedPhrases: deflectionMatches,
      category: 'deflection'
    };
  }

  // Check for vagueness
  const vagueMatches = VAGUE_PHRASES.filter(phrase =>
    lowerAnswer.includes(phrase)
  );

  if (vagueMatches.length > 0) {
    // Vagueness is less certain indicator of lack of knowledge
    const confidence = Math.min(0.7, vagueMatches.length * 0.3);
    return {
      hasUncertainty: true,
      confidence,
      detectedPhrases: vagueMatches,
      category: 'vague'
    };
  }

  // Check if answer is suspiciously short for an open-ended question
  if (lowerAnswer.length < 10 && !lowerAnswer.match(/\d/)) {
    return {
      hasUncertainty: true,
      confidence: 0.5,
      detectedPhrases: ['very short answer'],
      category: 'vague'
    };
  }

  return {
    hasUncertainty: false,
    confidence: 0,
    detectedPhrases: [],
    category: 'none'
  };
}

/**
 * Tracks uncertainty across multiple answers to detect persona mismatch
 */
export class UncertaintyTracker {
  private uncertainAnswers: Array<{
    questionId: string;
    questionText: string;
    answer: string;
    signals: UncertaintySignals;
  }> = [];

  /**
   * Add an answer to tracking
   */
  addAnswer(questionId: string, questionText: string, answer: string): void {
    const signals = detectUncertainty(answer);

    if (signals.hasUncertainty) {
      this.uncertainAnswers.push({
        questionId,
        questionText,
        answer,
        signals
      });
    }
  }

  /**
   * Check if there's a pattern suggesting persona mismatch
   */
  detectPersonaMismatch(): {
    hasMismatch: boolean;
    confidence: number;
    reason: string;
    suggestedAction: string;
  } {
    const totalUncertain = this.uncertainAnswers.length;

    // Need at least 2 uncertain answers to suspect mismatch
    if (totalUncertain < 2) {
      return {
        hasMismatch: false,
        confidence: 0,
        reason: 'Insufficient uncertainty signals',
        suggestedAction: 'Continue assessment'
      };
    }

    // Calculate average confidence of uncertainty
    const avgConfidence = this.uncertainAnswers.reduce(
      (sum, item) => sum + item.signals.confidence,
      0
    ) / totalUncertain;

    // Check for explicit "não sei" phrases (strong signal)
    const explicitUncertainty = this.uncertainAnswers.filter(
      item => item.signals.category === 'explicit'
    );

    if (explicitUncertainty.length >= 2) {
      return {
        hasMismatch: true,
        confidence: 0.9,
        reason: `User explicitly said "não sei" ${explicitUncertainty.length} times`,
        suggestedAction: 'Consider persona re-evaluation or skip technical questions'
      };
    }

    // Multiple vague/deflecting answers
    if (totalUncertain >= 3 && avgConfidence >= 0.6) {
      return {
        hasMismatch: true,
        confidence: 0.7,
        reason: `User showed uncertainty in ${totalUncertain} answers (avg confidence: ${(avgConfidence * 100).toFixed(0)}%)`,
        suggestedAction: 'Adjust question types or verify persona'
      };
    }

    return {
      hasMismatch: false,
      confidence: avgConfidence,
      reason: `Some uncertainty detected but below threshold (${totalUncertain} answers)`,
      suggestedAction: 'Monitor for additional signals'
    };
  }

  /**
   * Get summary of uncertain answers
   */
  getSummary(): {
    totalUncertain: number;
    byCategory: Record<string, number>;
    mostCommonPhrases: string[];
  } {
    const byCategory: Record<string, number> = {
      explicit: 0,
      vague: 0,
      deflection: 0,
      none: 0
    };

    const allPhrases: string[] = [];

    this.uncertainAnswers.forEach(item => {
      byCategory[item.signals.category]++;
      allPhrases.push(...item.signals.detectedPhrases);
    });

    // Count phrase frequency
    const phraseCount = allPhrases.reduce((acc, phrase) => {
      acc[phrase] = (acc[phrase] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostCommonPhrases = Object.entries(phraseCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([phrase]) => phrase);

    return {
      totalUncertain: this.uncertainAnswers.length,
      byCategory,
      mostCommonPhrases
    };
  }

  /**
   * Reset tracker (for new session)
   */
  reset(): void {
    this.uncertainAnswers = [];
  }
}
