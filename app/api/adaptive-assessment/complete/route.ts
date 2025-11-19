/**
 * POST /api/adaptive-assessment/complete
 *
 * Complete an adaptive assessment and get final data
 *
 * Request:
 * {
 *   sessionId: string,
 *   conversationHistory: Array<{ questionId, question, answer }>
 * }
 *
 * Response:
 * {
 *   assessmentData: AssessmentData,
 *   deepInsights?: any,
 *   sessionSummary: {
 *     questionsAsked: number,
 *     completeness: number,
 *     duration: number,
 *     topicsCovered: string[]
 *   }
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession, deleteSession } from '@/lib/sessions/unified-session-manager';
import type { AssessmentData } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, conversationHistory = [] } = body;

    // Validate session ID
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId' },
        { status: 400 }
      );
    }

    console.log('🏁 [Complete] Completing assessment for session:', sessionId);

    // Get final session context
    const context = getSession(sessionId);
    if (!context) {
      return NextResponse.json(
        { error: 'Session not found or expired' },
        { status: 404 }
      );
    }

    // Calculate session duration
    const duration = Math.round((new Date().getTime() - context.startedAt.getTime()) / 1000);

    console.log('📊 [Complete] Session summary:', {
      questionsAsked: context.questionsAsked,
      completeness: context.completion.completenessScore,
      duration: `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`,
      topicsCovered: context.topicsCovered.length
    });

    // Build complete AssessmentData from context
    const completeData: AssessmentData = {
      persona: context.persona || 'cto',

      companyInfo: {
        name: context.assessmentData.companyInfo?.name || 'Empresa',
        industry: context.assessmentData.companyInfo?.industry || 'Tecnologia',
        size: context.assessmentData.companyInfo?.size || 'scaleup',
        revenue: context.assessmentData.companyInfo?.revenue || 'R$1M-10M',
        country: context.assessmentData.companyInfo?.country || 'Brasil',
        stage: context.assessmentData.companyInfo?.stage
      },

      currentState: {
        devTeamSize: context.assessmentData.currentState?.devTeamSize || 10,
        devSeniority: context.assessmentData.currentState?.devSeniority || {
          junior: 3,
          mid: 4,
          senior: 2,
          lead: 1
        },
        currentTools: (context.assessmentData.currentState?.currentTools || []).filter((t): t is string => t !== undefined),
        deploymentFrequency: context.assessmentData.currentState?.deploymentFrequency || 'weekly',
        avgCycleTime: context.assessmentData.currentState?.avgCycleTime || 14,
        bugRate: context.assessmentData.currentState?.bugRate,
        aiToolsUsage: context.assessmentData.currentState?.aiToolsUsage || 'exploring',
        painPoints: (context.assessmentData.currentState?.painPoints || ['Produtividade']).filter((p): p is string => p !== undefined),
        cicdMaturity: context.assessmentData.currentState?.cicdMaturity,
        testCoverage: context.assessmentData.currentState?.testCoverage
      },

      goals: {
        primaryGoals: (context.assessmentData.goals?.primaryGoals || ['Aumentar Produtividade']).filter((g): g is string => g !== undefined),
        timeline: context.assessmentData.goals?.timeline || '6-months',
        budgetRange: context.assessmentData.goals?.budgetRange || 'R$50k-100k',
        successMetrics: (context.assessmentData.goals?.successMetrics || ['Produtividade']).filter((m): m is string => m !== undefined),
        competitiveThreats: context.assessmentData.goals?.competitiveThreats,
        externalPressure: context.assessmentData.goals?.externalPressure,
        decisionAuthority: context.assessmentData.goals?.decisionAuthority
      },

      contactInfo: {
        fullName: context.assessmentData.contactInfo?.fullName || '',
        title: context.assessmentData.contactInfo?.title || '',
        email: context.assessmentData.contactInfo?.email || '',
        phone: context.assessmentData.contactInfo?.phone,
        company: context.assessmentData.contactInfo?.company || context.assessmentData.companyInfo?.name || 'Empresa',
        agreeToContact: context.assessmentData.contactInfo?.agreeToContact ?? true
      },

      aiScope: {
        engineering: context.assessmentData.aiScope?.engineering ?? true,
        customerService: context.assessmentData.aiScope?.customerService ?? false,
        sales: context.assessmentData.aiScope?.sales ?? false,
        marketing: context.assessmentData.aiScope?.marketing ?? false,
        operations: context.assessmentData.aiScope?.operations ?? false,
        meetingIntelligence: context.assessmentData.aiScope?.meetingIntelligence ?? false
      },

      submittedAt: new Date()
    };

    console.log('✅ [Complete] Assessment data compiled');

    // 🧠 FASE 3: Generate deep insights (optional, budget-aware)
    let deepInsights = null;
    try {
      console.log('🧠 [Complete] Checking if should generate deep insights...');

      const insightsResponse = await fetch(`${request.nextUrl.origin}/api/insights/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentData: completeData,
          conversationHistory: conversationHistory,
          forceGenerate: false // Budget-aware
        })
      });

      if (insightsResponse.ok) {
        const insightsData = await insightsResponse.json();

        if (insightsData.generated && insightsData.insights) {
          console.log('✅ [Complete] Deep insights generated');
          console.log('   - Patterns:', insightsData.insights.patterns?.length || 0);
          console.log('   - Recommendations:', insightsData.insights.recommendations?.length || 0);
          console.log('   - Cost: R$', insightsData.cost);

          deepInsights = insightsData.insights;
        } else {
          console.log('⏭️  [Complete] Deep insights skipped:', insightsData.reason);
        }
      }
    } catch (error) {
      console.error('❌ [Complete] Error generating insights (continuing without):', error);
      // Continue without insights (graceful degradation)
    }

    // Session summary
    const sessionSummary = {
      questionsAsked: context.questionsAsked,
      completeness: context.completion.completenessScore,
      duration, // in seconds
      topicsCovered: context.topicsCovered,
      essentialFieldsCollected: context.completion.essentialFieldsCollected,
      totalFieldsCollected: context.completion.totalFieldsCollected
    };

    // Cleanup: Delete session
    deleteSession(sessionId);
    console.log('🗑️  [Complete] Session cleaned up');

    return NextResponse.json({
      assessmentData: completeData,
      deepInsights,
      sessionSummary
    });

  } catch (error) {
    console.error('❌ [Complete] Error:', error);
    return NextResponse.json(
      { error: 'Failed to complete assessment', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
