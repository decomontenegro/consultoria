/**
 * AI-Powered Suggestions Helper
 *
 * Calls the AI suggestions API to generate contextual response suggestions
 * Falls back to pattern matching if API fails
 */

import { ResponseSuggestion, generateSuggestions } from './response-suggestions';

interface AISuggestionsParams {
  question: string;
  context?: string;
  previousAnswers?: string[];
  specialistType?: string;
}

/**
 * Generate suggestions using AI (with fallback to patterns)
 */
export async function generateAIPoweredSuggestions(
  params: AISuggestionsParams
): Promise<ResponseSuggestion[]> {
  console.log('🟡 [AI-SUGGESTIONS] FUNCTION CALLED!!! params:', params);

  const { question, context, previousAnswers, specialistType } = params;

  try {
    console.log('🤖 [AI-SUGGESTIONS] Requesting AI-powered suggestions...');
    console.log('   Question:', question.substring(0, 80));
    console.log('   Context:', context || 'none');
    console.log('   Previous answers:', previousAnswers?.length || 0);

    const requestBody = {
      question,
      context,
      previousAnswers,
      specialistType
    };
    console.log('   Request body:', JSON.stringify(requestBody).substring(0, 200));

    const response = await fetch('/api/ai-suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    console.log('   Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('   API error response:', errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('   Response data:', data);

    if (data.suggestions && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
      console.log(`✅ [AI-SUGGESTIONS] Got ${data.suggestions.length} AI suggestions:`, data.suggestions.map((s: any) => s.text));
      return data.suggestions;
    }

    throw new Error('No suggestions returned from API');

  } catch (error) {
    console.error('❌ [AI-SUGGESTIONS] Failed, using pattern fallback');
    console.error('   Error details:', error);

    // Fallback to pattern matching
    const fallbackSuggestions = generateSuggestions(question);
    console.log('   Fallback suggestions:', fallbackSuggestions.map(s => s.text));
    return fallbackSuggestions;
  }
}

/**
 * Hook-like function for React components
 * Manages loading state and error handling
 */
export function useAISuggestions() {
  let isLoading = false;

  const getSuggestions = async (params: AISuggestionsParams): Promise<ResponseSuggestion[]> => {
    isLoading = true;

    try {
      const suggestions = await generateAIPoweredSuggestions(params);
      return suggestions;
    } finally {
      isLoading = false;
    }
  };

  return {
    getSuggestions,
    isLoading
  };
}
