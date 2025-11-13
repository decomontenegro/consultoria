/**
 * Consultant Follow-up API Endpoint
 *
 * Uses AI Orchestrator to analyze responses and generate dynamic follow-ups
 */

import { NextRequest, NextResponse } from 'next/server';
import { UserPersona } from '@/lib/types';
import {
  orchestrateFollowUp,
  buildOrchestratorContext,
  ResponseAnalysis,
  DynamicFollowUp
} from '@/lib/ai/consultant-orchestrator';

interface FollowUpRequest {
  questionId: string;
  question: string;
  answer: string;
  persona: UserPersona | null;
  conversationHistory: Array<{
    questionId: string;
    question: string;
    answer: string;
    metrics?: Record<string, any>;
  }>;
  maxFollowUps?: number;
}

interface FollowUpResponse {
  shouldAskFollowUp: boolean;
  followUp: DynamicFollowUp | null;
  analysis: ResponseAnalysis;
  cost: number;
  error?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: FollowUpRequest = await req.json();
    const {
      questionId,
      question,
      answer,
      persona,
      conversationHistory,
      maxFollowUps = 3
    } = body;

    console.log('🧠 [Consultant API] Orchestrating follow-up for:', questionId);

    // Validate input
    if (!questionId || !question || !answer) {
      return NextResponse.json(
        {
          error: 'Missing required fields: questionId, question, answer'
        } as FollowUpResponse,
        { status: 400 }
      );
    }

    // Build orchestrator context
    const context = buildOrchestratorContext(
      persona,
      conversationHistory,
      questionId,
      maxFollowUps
    );

    console.log('📊 [Consultant API] Context:', {
      persona,
      historyLength: conversationHistory.length,
      followUpsAsked: context.followUpsAsked,
      maxFollowUps: context.maxFollowUps
    });

    // Orchestrate follow-up
    const result = await orchestrateFollowUp(questionId, question, answer, context);

    console.log('✅ [Consultant API] Result:', {
      shouldAskFollowUp: result.shouldAskFollowUp,
      followUpType: result.followUp?.type,
      cost: result.cost
    });

    return NextResponse.json({
      shouldAskFollowUp: result.shouldAskFollowUp,
      followUp: result.followUp,
      analysis: result.analysis,
      cost: result.cost
    } as FollowUpResponse);
  } catch (error: any) {
    console.error('❌ [Consultant API] Error:', error);

    return NextResponse.json(
      {
        shouldAskFollowUp: false,
        followUp: null,
        analysis: null as any,
        cost: 0,
        error: error.message || 'Failed to orchestrate follow-up'
      } as FollowUpResponse,
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Consultant Follow-up API',
    version: '1.0.0',
    features: [
      'Response analysis (weak signals, insights)',
      'Dynamic follow-up generation',
      'SPIN Selling methodology',
      '5 Whys root cause analysis',
      'Budget-aware (max 3 follow-ups)'
    ]
  });
}
