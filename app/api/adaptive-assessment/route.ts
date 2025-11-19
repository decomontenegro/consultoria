/**
 * POST /api/adaptive-assessment
 *
 * Initialize a new adaptive assessment session
 *
 * Request:
 * {
 *   persona: UserPersona,
 *   partialData?: Partial<AssessmentData>
 * }
 *
 * Response:
 * {
 *   sessionId: string,
 *   success: true
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/sessions/unified-session-manager';
import type { UserPersona, DeepPartial, AssessmentData } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    // Safe parsing: handle empty body gracefully
    const bodyText = await request.text();
    const body = bodyText.trim() ? JSON.parse(bodyText) : {};
    const { persona: providedPersona, partialData = {} } = body;

    // Use provided persona or default to engineering-tech
    // Persona will be detected during conversation if not provided
    const persona = providedPersona || 'engineering-tech';

    const validPersonas = ['board-executive', 'engineering-tech', 'product-business', 'finance-ops', 'it-devops'];

    // Validate persona format
    if (!validPersonas.includes(persona)) {
      return NextResponse.json(
        { error: `Invalid persona. Must be one of: ${validPersonas.join(', ')}` },
        { status: 400 }
      );
    }

    console.log('🚀 [Adaptive Assessment] Initializing session for persona:', persona, providedPersona ? '(provided)' : '(default)');

    // Calculate initial persona confidence based on how we got here
    // If we have partialData from AI Router, confidence is higher
    // If persona not provided, confidence is low (will be detected during conversation)
    const hasPartialData = Object.keys(partialData).length > 0;
    const personaConfidence = providedPersona ? (hasPartialData ? 0.8 : 0.6) : 0.3;

    // Create session using unified session manager
    const context = createSession({
      mode: 'ai-readiness',
      initialPersona: persona as UserPersona,
      initialData: partialData as DeepPartial<AssessmentData>,
    });

    // Update persona confidence if we calculated a custom one
    if (personaConfidence !== 0.5) {
      context.personaConfidence = personaConfidence;
    }

    console.log('✅ [Adaptive Assessment] Session created:', {
      sessionId: context.sessionId,
      persona,
      personaConfidence,
      hasPartialData
    });

    return NextResponse.json({
      sessionId: context.sessionId,
      success: true
    });

  } catch (error) {
    console.error('❌ [Adaptive Assessment] Initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize session' },
      { status: 500 }
    );
  }
}
