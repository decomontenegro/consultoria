/**
 * AI-Powered Suggestion Generation API
 *
 * Uses Claude to analyze AI questions and generate contextual response suggestions
 * Much better than simple pattern matching
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Simple in-memory cache to avoid duplicate API calls
const suggestionCache = new Map<string, any>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface SuggestionRequest {
  question: string;
  context?: string; // Optional context about the conversation
  previousAnswers?: string[]; // Previous user answers for context
  specialistType?: string; // engineering, product, strategy, etc.
}

export async function POST(request: NextRequest) {
  console.log('🟢 [SERVER] /api/ai-suggestions called');

  try {
    const body: SuggestionRequest = await request.json();
    const { question, context, previousAnswers, specialistType } = body;

    console.log('   Question:', question?.substring(0, 80));
    console.log('   Context:', context || 'none');
    console.log('   Previous answers count:', previousAnswers?.length || 0);

    if (!question || question.trim() === '') {
      console.error('   ❌ No question provided');
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = `${question}-${context || ''}-${specialistType || ''}`;
    const cached = suggestionCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('   ✅ Cache hit - returning cached suggestions');
      return NextResponse.json({ suggestions: cached.suggestions });
    }

    console.log('   💾 Cache miss - calling Claude API...');

    // Build context for Claude
    let contextPrompt = '';
    if (previousAnswers && previousAnswers.length > 0) {
      contextPrompt = `\n\nPrevious answers in this conversation:\n${previousAnswers.join('\n')}`;
    }

    if (specialistType) {
      contextPrompt += `\n\nSpecialist context: This is a ${specialistType} consultation.`;
    }

    if (context) {
      contextPrompt += `\n\nAdditional context: ${context}`;
    }

    // Call Claude to generate suggestions
    const systemPrompt = `You are a helpful AI assistant generating quick response suggestions for users filling out an AI readiness assessment.

Your task: Analyze the question and generate 4-6 SHORT, SPECIFIC response suggestions that:
1. Directly answer the question
2. Cover common scenarios (most common to least common)
3. Are concise (2-8 words max)
4. Include variety (different perspectives/options)
5. Use Brazilian Portuguese

Output format (JSON only, no other text):
{
  "suggestions": [
    { "text": "Suggestion text" },
    { "text": "Another suggestion" }
  ]
}

Important:
- Keep text VERY short (2-8 words)
- Cover different scenarios/levels
- Order from most to least common
- ONLY output valid JSON, nothing else`;

    const userPrompt = `Question from AI: "${question}"${contextPrompt}

Generate 4-6 contextual response suggestions in JSON format.`;

    console.log('🤖 Calling Claude for suggestions...');

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    });

    // Parse Claude's response
    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Extract JSON from response
    let jsonText = content.text.trim();

    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const result = JSON.parse(jsonText);

    // Validate response structure
    if (!result.suggestions || !Array.isArray(result.suggestions)) {
      throw new Error('Invalid response structure from Claude');
    }

    // Ensure each suggestion has required fields
    const validatedSuggestions = result.suggestions
      .filter((s: any) => s.text)
      .map((s: any) => ({
        text: s.text
      }))
      .slice(0, 6); // Max 6 suggestions

    if (validatedSuggestions.length === 0) {
      throw new Error('No valid suggestions generated');
    }

    // Cache the result
    suggestionCache.set(cacheKey, {
      suggestions: validatedSuggestions,
      timestamp: Date.now()
    });

    console.log(`✅ Generated ${validatedSuggestions.length} AI-powered suggestions`);

    return NextResponse.json({
      suggestions: validatedSuggestions
    });

  } catch (error: any) {
    console.error('❌ Error generating AI suggestions:', error);

    // Return fallback suggestions on error
    const fallbackSuggestions = [
      { text: 'Sim' },
      { text: 'Não' },
      { text: 'Parcialmente' },
      { text: 'Não tenho certeza' }
    ];

    return NextResponse.json({
      suggestions: fallbackSuggestions,
      error: 'Using fallback suggestions',
      details: error.message
    });
  }
}

// Clean up old cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of suggestionCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      suggestionCache.delete(key);
    }
  }
}, CACHE_TTL);
