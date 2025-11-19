/**
 * Insights Generation API Endpoint
 *
 * Generates deep insights from completed assessment using Claude API
 */

import { NextRequest, NextResponse } from 'next/server';
import { AssessmentData } from '@/lib/types';
import {
  generateDeepInsights,
  shouldGenerateInsights,
  DeepInsights
} from '@/lib/ai/insights-engine';

interface InsightsRequest {
  assessmentData: AssessmentData;
  conversationHistory?: Array<{
    questionId: string;
    question: string;
    answer: string;
    metrics?: Record<string, any>;
  }>;
  forceGenerate?: boolean; // Override conditional logic
}

interface InsightsResponse {
  insights: DeepInsights | null;
  generated: boolean;
  reason?: string;
  cost: number;
  error?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: InsightsRequest = await req.json();
    const { assessmentData, conversationHistory, forceGenerate = false } = body;

    console.log('🧠 [Insights API] Request received');

    // Validate input
    if (!assessmentData) {
      return NextResponse.json(
        {
          generated: false,
          insights: null,
          cost: 0,
          error: 'Missing assessmentData'
        } as InsightsResponse,
        { status: 400 }
      );
    }

    // Check if should generate (budget-aware)
    const shouldGenerate = forceGenerate || shouldGenerateInsights(assessmentData);

    if (!shouldGenerate) {
      console.log('⏭️  [Insights API] Skipping insights (low-value lead or budget)');

      return NextResponse.json({
        generated: false,
        insights: null,
        cost: 0,
        reason: 'Skipped: Low budget or low urgency (budget-aware optimization)'
      } as InsightsResponse);
    }

    console.log('✅ [Insights API] Generating insights (high-value lead)...');

    // Generate insights
    const insights = await generateDeepInsights(assessmentData, conversationHistory);

    console.log('✅ [Insights API] Insights generated successfully');

    return NextResponse.json({
      generated: true,
      insights,
      cost: 0.60, // ~6000 tokens
      reason: 'High-value lead: insights generated'
    } as InsightsResponse);
  } catch (error: any) {
    console.error('❌ [Insights API] Error:', error);

    return NextResponse.json(
      {
        generated: false,
        insights: null,
        cost: 0,
        error: error.message || 'Failed to generate insights'
      } as InsightsResponse,
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Insights Generation API',
    version: '1.0.0',
    features: [
      'Deep pattern detection (tech debt spiral, velocity crisis, etc.)',
      'Root cause analysis',
      'Financial impact calculation',
      'Strategic recommendations',
      'Red flag detection',
      'Budget-aware generation (R$ 0.60 per analysis)'
    ],
    conditions: [
      'High budget (R$ 200k+)',
      'Critical urgency (3 months timeline)',
      'High pain (3+ pain points)'
    ]
  });
}
