/**
 * AI Router API Endpoint
 *
 * Analyzes initial conversation and returns routing decision:
 * - Auto-detected persona
 * - Recommended assessment mode
 * - Partial data extracted
 */

import { NextRequest, NextResponse } from 'next/server';
import { ConversationMessage, AIRouterResult } from '@/lib/types';
import {
  analyzeConversation,
  getNextQuestion,
  canRoute
} from '@/lib/ai/assessment-router';

interface RouteRequestBody {
  messages: ConversationMessage[];
  questionsAsked: number;
  userExpertise?: string[]; // NEW: User's areas of expertise
}

export async function POST(req: NextRequest) {
  try {
    const body: RouteRequestBody = await req.json();
    const { messages, questionsAsked, userExpertise = [] } = body;

    // Validate input
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    // Check if we can route yet
    const readyToRoute = canRoute(messages);

    if (!readyToRoute) {
      // Detect persona early (even if not confident yet) to adapt questions
      const result: AIRouterResult = analyzeConversation(messages);

      // Get next question with persona AND expertise adaptation
      const nextQuestion = getNextQuestion(messages, questionsAsked, result.detectedPersona, userExpertise);

      return NextResponse.json({
        ready: false,
        nextQuestion,
        result: null
      });
    }

    // Analyze and route
    const result: AIRouterResult = analyzeConversation(messages);

    return NextResponse.json({
      ready: true,
      nextQuestion: null,
      result
    });

  } catch (error: any) {
    console.error('AI Router error:', error);

    return NextResponse.json(
      { error: 'Failed to analyze conversation', details: error.message },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'AI Router API',
    version: '1.0.0'
  });
}
